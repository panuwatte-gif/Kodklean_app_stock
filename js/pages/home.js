// หน้าหลัก (Dashboard) — ถือสถานะตัวเลือกของทุกการ์ด แล้วสั่งวาดใหม่เฉพาะการ์ดที่เปลี่ยน
// การวาดแยกอยู่ที่ home-top (หัว/ประกาศ/เตรียม/ข้าว), home-usage (ใช้ไป/ของเหลือ), home-money (ประหยัด/ยอดขาย/พระราม 9)
import { get, save, getHomeBundle, todayIso, saveHomeNotice, saveSalesTarget } from '../shared/data.js';
import { HOME_UI } from '../shared/config.js';
import { toast, pickerSheet, formSheet } from '../shared/ui.js';
import { isAdmin, staffCode } from '../shared/auth.js';
import { dayLongTh, shiftIso } from '../shared/format.js';
import { heroHtml, noticesHtml, prepCard, riceCard } from './home-top.js';
import { usageCard, leftoverCard } from './home-usage.js';
import { savingsCard, salesCard, r9Card } from './home-money.js';

// หน้าหลักวางเลย์เอาต์ที่ความกว้าง 794 (= แบบอ้างอิง 2x) แล้วย่อทั้งหน้าลงให้เท่าความกว้างจอจริง
function fitHomeWidth(root) {
  const set = () => {
    const w = root.clientWidth;
    if (w) root.style.setProperty('--hz', (w / HOME_UI.designWidth).toFixed(4));
  };
  set();
  new ResizeObserver(set).observe(root);
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมข้อมูลหน้าหลัก (onGo = พาไปหน้าอื่นเมื่อกดดูรายละเอียด)
// การ์ดที่ต่อฐานแล้ว: ประกาศ / ใช้ไปเท่าไหร่ / ยอดคงเหลือ / แนะนำเตรียมพรุ่งนี้ / ยอดขายรายร้าน / พระราม 9
// การ์ดที่ยังไม่มีตารางในฐาน (หุงข้าว / ลดของเหลือ) ใช้ข้อมูลตั้งต้นไปก่อน
export async function mountHomePage(root, onGo) {
  fitHomeWidth(root);   // ย่อทั้งหน้าให้พอดีจอมือถือ (เลย์เอาต์วางไว้ที่ 794 ตามแบบอ้างอิง)
  const ui = get('homeUi');   // ค่าที่เลือกไว้ครั้งก่อน (คงอยู่หลัง refresh)
  let live = null;
  try { live = await getHomeBundle(todayIso()); } catch { live = null; }   // ต่อฐานไม่ได้ = ใช้ข้อมูลตั้งต้น

  const meta = live ? live.meta : get('homeMeta');
  const data = {
    prep: live ? live.prep : get('homePrep'), rice: live ? live.rice : get('homeRice'),
    usage: live ? live.usage : get('homeUsage'), left: live ? live.left : get('homeLeftovers'),
    save: live ? live.save : get('homeSavings'), sales: live ? live.sales : get('homeSales'), r9: live ? live.r9 : get('homeR9'),
    notices: live ? live.notices : get('homeNotices')
  };

  // ตัววาดของแต่ละช่อง (id ช่อง = home-<key>)
  const draw = {
    hero: () => heroHtml(meta, ui),
    notices: () => noticesHtml(data.notices, !!live && isAdmin()),
    prep: () => prepCard(data.prep, meta, ui),
    rice: () => riceCard(data.rice, ui),
    usage: () => usageCard(data.usage, ui),
    left: () => leftoverCard(data.left, meta, ui),
    save: () => savingsCard(data.save),
    sales: () => salesCard(data.sales, ui, !!live && isAdmin()),
    r9: () => r9Card(data.r9)
  };
  const paint = key => { root.querySelector(`#home-${key}`).innerHTML = draw[key](); };
  Object.keys(draw).forEach(paint);

  // จำค่าที่เลือก แล้ววาดการ์ดที่เกี่ยวข้องใหม่
  const update = (patch, ...keys) => { Object.assign(ui, patch); save('homeUi', ui); keys.forEach(paint); };

  // dropdown ทุกตัวส่งชื่อ (data-dd) มาที่นี่ — แต่ละตัวคุมเฉพาะการ์ดของตัวเอง ยกเว้นสาขาที่เป็นตัวกรองรวม
  root.addEventListener('change', event => {
    const sel = event.target.closest('[data-dd]');
    if (!sel) return;
    const name = sel.dataset.dd, v = sel.value;
    if (name === 'branch') return update({ branch: v, prepPage: 0 }, 'hero', 'prep', 'usage', 'left', 'sales');
    if (name === 'prepPage') return update({ prepPage: Number(v) }, 'prep');
    if (name.startsWith('rice:')) return update({ rice: { ...ui.rice, [name.slice(5)]: v } }, 'rice');
    if (name === 'usageItem') return update({ usageItem: v }, 'usage');
    if (name === 'leftMenu') return update({ leftMenu: v }, 'left');
    if (name === 'salesPeriod') return update({ salesPeriod: v }, 'sales');
  });

  // เลือกวันที่ที่อยากดู (รอบนี้ข้อมูลตัวอย่างมีของวันเดียว)
  const pickDate = async () => {
    const options = [0, -1, -2, -3].map(n => ({ value: shiftIso(meta.asOf, n), label: dayLongTh(shiftIso(meta.asOf, n)) }));
    const picked = await pickerSheet({ title: HOME_UI.dateAsk, options });
    if (!picked) return;
    root.querySelector('#home-date').textContent = dayLongTh(picked);
    if (picked !== meta.asOf) toast(HOME_UI.dateOnly);
  };

  // แก้ข้อความประกาศ 1 ใบ (แอดมินเท่านั้น) → บันทึกลงฐาน kk_home_notice แล้ววาดประกาศใหม่
  const editNotice = async id => {
    const n = data.notices.find(x => x.id === id);
    if (!n || !isAdmin()) return;
    const res = await formSheet({ title: HOME_UI.noticeEdit, fields: [{ key: 'text', label: HOME_UI.noticeLabel, value: n.text }] });
    if (!res) return;
    const text = res.text.trim();
    if (!text) return toast(HOME_UI.noticeEmpty);
    if (text === n.text) return;
    try { await saveHomeNotice(id, text); } catch { return toast(HOME_UI.noticeFail); }
    n.text = text;
    paint('notices');
    toast(HOME_UI.noticeSaved);
  };

  // ตั้งเป้ายอดขายรวมต่อวัน (แอดมิน) → kk_sales_target แล้ววาดการ์ดยอดขายใหม่
  const setTarget = async () => {
    const t = HOME_UI.sales, cur = data.sales.total || {};
    const res = await formSheet({ title: t.setTitle, fields: [{ key: 'v', kind: 'number', step: 500, label: t.setLabel, value: cur.daily ?? '' }] });
    if (!res || res.v === '') return;
    const v = Math.max(0, Math.round(Number(res.v) || 0));
    try { await saveSalesTarget(v, staffCode()); } catch { return toast(t.setFail); }
    data.sales.total = { ...cur, daily: v };
    paint('sales');
    toast(t.setSaved);
  };

  root.addEventListener('click', event => {
    if (event.target.closest('[data-sales-target]')) return setTarget();
    const note = event.target.closest('[data-notice]');
    if (note) return editNotice(note.dataset.notice);
    const go = event.target.closest('[data-go]');
    if (go) return onGo && onGo(go.dataset.go);
    const page = event.target.closest('[data-prep-page]');
    if (page) return update({ prepPage: Number(page.dataset.prepPage) }, 'prep');
    const metric = event.target.closest('[data-left-metric]');
    if (metric) return update({ leftMetric: metric.dataset.leftMetric }, 'left');
    if (event.target.closest('[data-home-date]')) return pickDate();
  });
}
