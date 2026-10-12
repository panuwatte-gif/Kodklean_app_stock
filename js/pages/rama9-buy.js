// แท็บซื้อของเข้าร้าน (หน้าพระราม 9) — สถานะของแท็บ โหลด/บันทึกผ่านประตูข้อมูล และจัดการปุ่ม/ช่องกรอก (การวาดอยู่ที่ rama9-buy-view / rama9-buy-report)
import { getBuyBundle, saveBuyDay, todayIso } from '../shared/data.js';
import { staffCode } from '../shared/auth.js';
import { R9_BUY_UI as T, R9_UI } from '../shared/config.js';
import { toast, confirmSheet, handleDateClick, handleDatePick, printArea } from '../shared/ui.js';
import { buyRows, buyShopTotal, buyRow, buySum } from '../shared/calc.js';
import { moneyFine, fillText, dayLongTh } from '../shared/format.js';
import { buyHtml } from './rama9-buy-view.js';
import { buyReportHtml } from './rama9-buy-report.js';
import { addBuyShopItem, removeBuyShopItem } from './rama9-buy-items.js';

// สถานะของแท็บนี้ (ไม่แชร์ข้ามหน้า)
const buy = {
  date: todayIso(), shops: [], items: [], logs: [], edit: {}, dirty: {}, closed: {},
  started: false, loading: true, error: false, saving: false,
  rep: { from: todayIso(), to: todayIso(), shops: [], r9: false, built: false }
};

export const buyDate = () => buy.date;

// แถวของร้านในวันที่เลือก
const rowsOf = shopId => buyRows(buy.items.filter(i => i.shop === shopId), buy.edit[shopId]);

// ยอดรวมทุกร้านของวันที่เลือก
const dayTotal = () => buy.shops.reduce((s, sh) => s + buyShopTotal(rowsOf(sh.id), buy.edit[sh.id].manual).total, 0);

// ตั้งค่าที่กรอกของวันที่เลือกจากยอดที่บันทึกไว้
function resetEdit() {
  buy.edit = {}; buy.dirty = {};
  buy.shops.forEach(sh => {
    const log = buy.logs.find(l => l.date === buy.date && l.shop === sh.id);
    const lines = {};
    (log ? log.lines : []).forEach(l => { lines[l.vi] = { price: l.price, qty: l.qty, name: l.name, unit: l.unit }; });
    buy.edit[sh.id] = { lines, manual: log ? log.manual : null, at: log ? log.at : null };
  });
}

// โหลดข้อมูลแท็บจากฐาน · keep = เก็บตัวเลขที่ยังไม่บันทึกของร้านที่ระบุไว้
async function load(keep = {}) {
  const old = buy.edit;
  buy.loading = true; buy.error = false;
  try {
    const b = await getBuyBundle();
    buy.shops = b.shops; buy.items = b.items; buy.logs = b.logs;
    if (!buy.started) buy.rep.shops = b.shops.map(s => s.id);
    buy.started = true;
    resetEdit();
    Object.keys(keep).forEach(id => { if (old[id] && buy.edit[id]) { buy.edit[id] = old[id]; buy.dirty[id] = true; } });
  } catch { buy.error = true; }
  buy.loading = false;
}

// เปิดแท็บครั้งแรก = โหลดข้อมูล แล้ววาดใหม่
export function ensureBuy(redraw) {
  if (buy.started || buy.busy) return;
  buy.busy = true;
  load().then(() => { buy.busy = false; redraw(); });
}

// เนื้อหาแท็บทั้งหมด (rounds = รอบส่งพระราม 9 สำหรับ Report)
export function buyBody(rounds) {
  if (buy.error) return `<div class="r9-card"><p class="r9-empty">${T.loadError} <button class="r9-btn r9-btn--soft" type="button" data-act="buyRetry">${R9_UI.retry}</button></p></div>`;
  if (buy.loading) return `<div class="r9-card"><p class="r9-empty">${R9_UI.loading}</p></div>`;
  return buyHtml(buy, rowsOf, dayTotal()) + buyReportHtml(buy, rounds);
}

// ตัวเลขบนการ์ดหัวหน้า
export function buyKpis(today) {
  return {
    buyDay: buySum(buy.logs, buy.date, buy.date), buyDayFoot: dayLongTh(buy.date),
    buyMonth: buySum(buy.logs, today.slice(0, 7) + '-01', today), monthFoot: T.foot.month,
    buyYtd: buySum(buy.logs, today.slice(0, 4) + '-01-01', today), ytdFoot: T.foot.ytd,
    buyAll: buySum(buy.logs, '0000-01-01', '9999-12-31'), allFoot: T.foot.all
  };
}

// บันทึกทุกร้านที่แก้ (ร้านละ 1 คำสั่ง · ไม่สำเร็จ = ตัวเลขที่กรอกยังอยู่)
async function save(redraw) {
  if (buy.saving) return;
  const ids = Object.keys(buy.dirty);
  if (!ids.length) return toast(T.nothing);
  buy.saving = true; redraw();
  let fail = null;
  for (const id of ids) {
    const lines = rowsOf(id).filter(r => Number(r.qty) > 0).map(r => ({ vi: r.vi, name: r.name, unit: r.unit, price: Number(r.price) || 0, qty: Number(r.qty) }));
    try { await saveBuyDay({ date: buy.date, shop: id, lines, manual: buy.edit[id].manual, by: staffCode(), loaded: buy.edit[id].at }); delete buy.dirty[id]; }
    catch (err) { fail = { id, conflict: String(err && err.message).includes('BUY_CONFLICT') }; break; }
  }
  const left = { ...buy.dirty };
  if (fail && fail.conflict) delete left[fail.id];
  await load(left);
  buy.saving = false; redraw();
  if (!fail) toast(fillText(T.saved, { d: dayLongTh(buy.date) }));
  else toast(fail.conflict ? fillText(T.conflict, { s: (buy.shops.find(s => s.id === fail.id) || {}).label }) : T.saveError);
}

// ยังมีตัวเลขค้างไม่บันทึก → ถามก่อนเปลี่ยนวัน
const okToLeave = async () => !Object.keys(buy.dirty).length || confirmSheet({ title: T.leaveAsk.title, text: T.leaveAsk.text, okLabel: T.leaveAsk.ok });

// ปุ่มต่างๆ ของแท็บ (คืน true = จัดการแล้ว)
export async function buyClick(event, redraw) {
  const hit = sel => event.target.closest(sel);
  const grp = hit('[data-bgroup]'), add = hit('[data-badd]'), del = hit('[data-bdel]'), act = hit('[data-act]');
  const rs = hit('[data-repshop]'), rep = buy.rep;
  if (grp) { const k = grp.dataset.bgroup; buy.closed[k] = !buy.closed[k]; redraw(); }
  else if (add) { if (await addBuyShopItem(buy, add.dataset.badd)) await load(buy.dirty); redraw(); }
  else if (del) { if (await removeBuyShopItem(buy, Number(del.dataset.bdel))) await load(buy.dirty); redraw(); }
  else if (rs) { const k = rs.dataset.repshop; rep.shops = rep.shops.includes(k) ? rep.shops.filter(x => x !== k) : [...rep.shops, k]; redraw(); }
  else if (hit('[data-repr9]')) { rep.r9 = !rep.r9; redraw(); }
  else if (hit('[data-repday]')) { rep.to = rep.from; redraw(); }
  else if (act && act.dataset.act === 'buySave') save(redraw);
  else if (act && act.dataset.act === 'buyRetry') { await load(); redraw(); }
  else if (act && act.dataset.act === 'buyBuild') { if (!rep.shops.length && !rep.r9) return toast(T.rep.pickShop), true; rep.built = true; redraw(); }
  else if (act && act.dataset.act === 'buyPrint') printArea('#r9-buyrep');
  else if (hit('[data-date-nav],[data-date-today]')) { if (await okToLeave() && await handleDateClick(event, buy)) { resetEdit(); redraw(); } }
  else return false;
  return true;
}

// เปลี่ยนวันที่จากปฏิทิน / ช่วงวันที่ของ Report (คืน true = ต้องวาดใหม่)
export async function buyChange(event) {
  const elm = event.target, rep = buy.rep;
  if (elm.matches('#r9-buy-pick')) {
    if (await okToLeave() && await handleDatePick(elm.value, buy)) { resetEdit(); }
    return true;
  }
  if (elm.matches('[data-repfrom]') && elm.value) { rep.from = elm.value; if (rep.to < rep.from) rep.to = rep.from; return true; }
  if (elm.matches('[data-repto]') && elm.value) { rep.to = elm.value; if (rep.from > rep.to) rep.from = rep.to; return true; }
  return false;
}

// กรอกราคา/ปริมาณ/ยอดรวมเอง → เก็บในแท็บ แล้วอัปเดตเฉพาะตัวเลข (ช่องที่กำลังพิมพ์ไม่หาย) · คืน true = จัดการแล้ว
export function buyInput(event, root) {
  const elm = event.target, f = elm.dataset && elm.dataset.bf;
  if (!f) return false;
  const shop = elm.closest('[data-shop]').dataset.shop, ed = buy.edit[shop];
  const v = elm.value === '' ? null : Number(elm.value);
  if (f === 'manual') ed.manual = v;
  else {
    const row = elm.closest('[data-vi]'), vi = row.dataset.vi;
    const it = rowsOf(shop).find(r => r.vi === vi);
    const l = ed.lines[vi] || (ed.lines[vi] = { price: it.price, qty: null, name: it.name, unit: it.unit });
    l[f] = v;
    const sum = buyRow(l.price, l.qty), cell = row.querySelector('.r9-item__sum');
    cell.textContent = sum ? moneyFine(sum) : '—';
    cell.classList.toggle('is-zero', !sum);
  }
  buy.dirty[shop] = true;
  const t = buyShopTotal(rowsOf(shop), ed.manual);
  root.querySelector(`[data-shophead="${shop}"]`).textContent = `${moneyFine(t.total)} บาท`;
  root.querySelector(`[data-shopsum="${shop}"]`).textContent = moneyFine(t.total);
  root.querySelector(`[data-shopnote="${shop}"]`).hidden = !t.manual;
  root.querySelector('#r9-buyday').textContent = moneyFine(dayTotal());
  return true;
}
