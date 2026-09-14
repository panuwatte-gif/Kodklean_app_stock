// หน้าพระราม 9 — ต่อปุ่มทุกปุ่มเข้ากับข้อมูล (การวาดอยู่ที่ rama9-view / -send / -history / -report)
import { get, save, revise } from '../shared/data.js';
import { R9_UI, R9_PLACE, R9_PHOTOS, R9_UNITS, R9_CAT_ICONS, CAT_COLOR_PRESETS } from '../shared/config.js';
import { fillGlyphs, toast, confirmSheet, pickerSheet, formSheet, printArea } from '../shared/ui.js';
import { r9Row, r9RoundTotals } from '../shared/calc.js';
import { money, moneyFine, weight, dayLongTh } from '../shared/format.js';
import { heroHtml, kpisHtml, tabsHtml } from './rama9-view.js';
import { tableHtml, sumHtml, footHtml } from './rama9-send.js';
import { filterHtml, roundsHtml, briefHtml } from './rama9-history.js';
import { pickHtml, reportHtml } from './rama9-report.js';

// สิ่งที่ผู้ใช้เลือกอยู่บนหน้านี้ (ไม่แชร์ข้ามหน้า)
const view = { tab: 'send', closed: {}, rClosed: {}, range: 'all', q: '', picked: {}, from: '', to: '', rPage: 0 };

// รอบส่งที่อยู่ในช่วงเวลาที่เลือก + ตรงกับคำค้น
function pickRounds(rounds, today) {
  const ym = today.slice(0, 7), yr = today.slice(0, 4);
  const last = rounds[rounds.length - 1];
  return rounds.filter(rd => {
    if (view.range === 'month' && rd.date.slice(0, 7) !== ym) return false;
    if ((view.range === 'ytd' || view.range === 'year') && rd.date.slice(0, 4) !== yr) return false;
    if (view.range === 'last' && (!last || rd.id !== last.id)) return false;
    if (view.q && !(`#${rd.no} ${dayLongTh(rd.date)}`).includes(view.q)) return false;
    return true;
  });
}

// ตัวเลขบนการ์ดสรุปหัวหน้า ของแท็บที่กำลังเปิด
function kpiVals(tab, rounds, today, picked) {
  const sum = list => list.reduce((a, rd) => {
    const t = r9RoundTotals(rd);
    return { items: a.items + t.items, net: a.net + t.net, fee: a.fee + t.fee };
  }, { items: 0, net: 0, fee: 0 });
  const all = sum(rounds);
  const month = sum(rounds.filter(rd => rd.date.slice(0, 7) === today.slice(0, 7)));
  const ytd = sum(rounds.filter(rd => rd.date.slice(0, 4) === today.slice(0, 4)));
  const last = rounds[rounds.length - 1];
  if (tab === 'report') {
    const p = sum(picked);
    return { rounds: picked.length, items: p.items, fee: p.fee, goods: p.net - p.fee, pickFoot: 'ในช่วงที่เลือก' };
  }
  return {
    rounds: rounds.length, roundFoot: 'ทั้งหมดในช่วงนี้',
    lastItems: last ? r9RoundTotals(last).items : 0, lastDate: last ? dayLongTh(last.date) : '',
    monthItems: month.items, monthFoot: 'ในเดือนนี้',
    ytdItems: ytd.items, ytdFoot: 'ตั้งแต่ต้นปี',
    netAll: all.net, netFoot: 'ทุกรอบรวมกัน',
    feeAll: all.fee, feeFoot: 'ค่าส่งทุกรอบ'
  };
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมข้อมูลพระราม 9 จากประตูข้อมูล
export function mountRama9Page(root) {
  let items = get('rama9Items');
  let cats = get('rama9Cats');
  let rounds = get('rama9Rounds');
  let draft = get('rama9Draft');
  const today = draft.date;
  if (!view.from) { view.from = rounds.length ? rounds[0].date : today; view.to = today; }
  if (!Object.keys(view.picked).length) rounds.forEach(rd => { view.picked[rd.id] = true; });
  fillGlyphs(root, 17);

  const body = root.querySelector('#r9-body');
  const inRange = rd => rd.date >= view.from && rd.date <= view.to;

  const draw = () => {
    const listed = pickRounds(rounds, today);
    const picked = rounds.filter(rd => view.picked[rd.id] && inRange(rd));
    root.querySelector('#r9-hero').innerHTML = heroHtml(view.tab);
    root.querySelector('#r9-kpis').innerHTML = kpisHtml(view.tab, kpiVals(view.tab, view.tab === 'history' ? listed : rounds, today, picked));
    root.querySelector('#r9-tabs').innerHTML = tabsHtml(view.tab);
    root.querySelector('#r9-sub').textContent = view.tab === 'history' ? R9_PLACE.subHistory : view.tab === 'report' ? R9_PLACE.subReport : R9_PLACE.sub;
    root.querySelector('#r9-date').textContent = view.tab === 'report' ? `${dayLongTh(view.from)} - ${dayLongTh(view.to)}` : dayLongTh(today);
    if (view.tab === 'send') body.innerHTML = tableHtml(items, cats, view.closed) + sumHtml(items, draft.fee) + footHtml(draft.note);
    else if (view.tab === 'history') body.innerHTML = filterHtml(view) + roundsHtml(listed, items, cats, rounds.length ? rounds[rounds.length - 1].id : null) + briefHtml(rounds);
    else {
      // หน้าคอลัมน์รอบต้องไม่เกินจำนวนรอบที่เลือกไว้
      const maxPage = Math.max(0, Math.ceil(picked.length / 3) - 1);
      if (view.rPage > maxPage) view.rPage = maxPage;
      body.innerHTML = pickHtml(view, rounds) + `<div id="r9-print">${reportHtml(picked, items, cats, view, view.rClosed)}</div>`;
    }
  };

  // เก็บรายการทั้งชุด / ค่าที่กำลังกรอก ลงที่เก็บ แล้ววาดใหม่
  const commit = list => { items = save('rama9Items', list); draw(); };
  const saveDraft = () => { draft = save('rama9Draft', draft); };

  // สลับตำแหน่งรายการขึ้น/ลง ภายในหมวดเดียวกัน
  const move = (id, step) => {
    const at = items.findIndex(r => r.id === id);
    const mine = items[at];
    let to = at + step;
    while (to >= 0 && to < items.length && items[to].cat !== mine.cat) to += step;
    if (to < 0 || to >= items.length) return toast('อยู่สุดทางแล้ว');
    const list = items.slice();
    [list[at], list[to]] = [list[to], list[at]];
    commit(list);
  };

  // เปลี่ยนรูปสินค้าจากคลังรูป
  const changePhoto = async id => {
    const picked = await pickerSheet({ title: 'เลือกรูปสินค้า', options: R9_PHOTOS });
    if (!picked) return;
    revise('rama9Items', id, { photo: picked });
    items = get('rama9Items');
    draw();
    toast('เปลี่ยนรูปแล้ว');
  };

  // แก้ไขชื่อ / หน่วย / หมวด ของรายการ
  const editItem = async id => {
    const it = items.find(r => r.id === id);
    const res = await formSheet({
      title: 'แก้ไขรายการ',
      fields: [
        { key: 'name', label: 'ชื่อรายการ', kind: 'text', value: it.name },
        { key: 'cat', label: 'หมวด', kind: 'select', value: it.cat, options: cats.map(c => ({ value: c.id, label: c.label })) },
        { key: 'unit', label: 'หน่วยนับ', kind: 'select', value: it.unit, options: R9_UNITS.map(u => ({ value: u, label: u })) }
      ]
    });
    if (!res) return;
    if (!res.name) return toast('ยังไม่ได้ใส่ชื่อรายการ');
    revise('rama9Items', id, res);
    items = get('rama9Items');
    draw();
    toast('บันทึกแล้ว');
  };

  // ลบรายการ (ถามยืนยันก่อน)
  const removeItem = async id => {
    const it = items.find(r => r.id === id);
    if (!await confirmSheet({ title: 'ลบรายการนี้?', text: it.name, okLabel: 'ลบ', danger: true })) return;
    commit(items.filter(r => r.id !== id));
    toast('ลบแล้ว');
  };

  // เพิ่มรายการใหม่เข้าท้ายหมวดที่เลือก
  const addItem = async catId => {
    const res = await formSheet({
      title: R9_UI.addItem,
      fields: [
        { key: 'name', label: 'ชื่อรายการ', kind: 'text', placeholder: 'เช่น น้ำมะนาว' },
        { key: 'cat', label: 'หมวด', kind: 'select', value: catId || cats[0].id, options: cats.map(c => ({ value: c.id, label: c.label })) },
        { key: 'unit', label: 'หน่วยนับ', kind: 'select', options: R9_UNITS.map(u => ({ value: u, label: u })) },
        { key: 'price', label: 'ราคาต่อหน่วย (บาท)', kind: 'number', step: 1 },
        { key: 'photo', label: 'รูปสินค้า', kind: 'image', options: R9_CAT_ICONS }
      ]
    });
    if (!res) return;
    if (!res.name) return toast('ยังไม่ได้ใส่ชื่อรายการ');
    const row = { id: 'r9-new-' + Date.now(), name: res.name, cat: res.cat, unit: res.unit, qty: 0, price: Number(res.price) || 0, photo: res.photo };
    const lastOfCat = items.reduce((n, r, i) => r.cat === res.cat ? i : n, -1);
    const list = items.slice();
    list.splice(lastOfCat + 1 || list.length, 0, row);
    commit(list);
    toast(`เพิ่ม "${res.name}" แล้ว`);
  };

  // เพิ่มหมวดใหม่ต่อท้าย
  const addCat = async () => {
    const res = await formSheet({
      title: R9_UI.addCat,
      fields: [
        { key: 'name', label: 'ชื่อหมวด', kind: 'text', placeholder: 'เช่น ของแช่แข็ง' },
        { key: 'color', label: 'สีประจำหมวด', kind: 'swatch', options: CAT_COLOR_PRESETS.map(p => ({ value: p.color })) },
        { key: 'icon', label: 'ไอคอน', kind: 'image', options: R9_CAT_ICONS }
      ]
    });
    if (!res) return;
    if (!res.name) return toast('ยังไม่ได้ใส่ชื่อหมวด');
    const preset = CAT_COLOR_PRESETS.find(p => p.color === res.color) || CAT_COLOR_PRESETS[0];
    cats = save('rama9Cats', cats.concat([{ id: 'r9c-' + Date.now(), label: res.name, icon: res.icon, color: preset.color, tint: preset.tint }]));
    draw();
    toast(`เพิ่มหมวด "${res.name}" แล้ว`);
  };

  // ล้างปริมาณ ราคา ค่าส่ง และหมายเหตุของรอบนี้
  const clearAll = async () => {
    if (!await confirmSheet({ ...R9_UI.clearAsk, okLabel: R9_UI.clearAsk.ok, danger: true })) return;
    draft.fee = 0; draft.note = '';
    saveDraft();
    commit(items.map(r => ({ ...r, qty: 0, price: 0 })));
    toast(R9_UI.cleared);
  };

  // บันทึกและส่ง: เก็บรอบนี้เข้าประวัติ
  const send = () => {
    const lines = items.filter(r => (Number(r.qty) || 0) > 0).map(r => ({ id: r.id, qty: Number(r.qty), price: Number(r.price) || 0 }));
    if (!lines.length) return toast('ยังไม่ได้กรอกปริมาณรายการใด');
    const now = new Date();
    const no = rounds.reduce((n, rd) => Math.max(n, rd.no), 0) + 1;
    const round = { id: 'r9r-' + Date.now(), no, date: draft.date, time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, status: 'done', fee: Number(draft.fee) || 0, note: draft.note, lines };
    rounds = save('rama9Rounds', rounds.concat([round]));
    view.picked[round.id] = true;
    view.tab = 'history';
    draw();
    toast(`${R9_UI.sent} (รอบ #${no})`);
  };

  // ทำซ้ำรอบเดิม: ดึงปริมาณและราคาของรอบนั้นมาใส่รอบใหม่
  const repeat = id => {
    const rd = rounds.find(r => r.id === id);
    const at = lineId => (rd.lines || []).find(l => l.id === lineId);
    draft.fee = Number(rd.fee) || 0;
    saveDraft();
    view.tab = 'send';
    commit(items.map(r => { const l = at(r.id); return { ...r, qty: l ? l.qty : 0, price: l ? l.price : r.price }; }));
    toast(`ทำซ้ำรอบ #${rd.no} แล้ว`);
  };

  // ดูรายละเอียดรอบส่ง
  const detail = id => {
    const rd = rounds.find(r => r.id === id);
    const t = r9RoundTotals(rd);
    const options = (rd.lines || []).map(l => {
      const it = items.find(i => i.id === l.id) || { name: l.id, unit: '', photo: '' };
      return { value: '', label: `${it.name} · ${weight(l.qty)} ${it.unit} × ${money(l.price)} = ${money(r9Row(l))} บาท`, image: it.photo };
    }).concat([{ value: '', label: `ค่าส่ง ${money(rd.fee)} บาท · ยอดสุทธิ ${money(t.net)} บาท`, image: 'assets/r9/truck.webp' }]);
    pickerSheet({ title: `รอบส่งของ #${rd.no} · ${dayLongTh(rd.date)}`, options });
  };

  draw();

  root.addEventListener('click', event => {
    const hit = sel => event.target.closest(sel);
    const row = hit('.r9-item[data-id]');
    const tab = hit('[data-tab]'), grp = hit('[data-group]'), tool = hit('[data-tool]'), act = hit('[data-act]');
    const range = hit('[data-range]'), pick = hit('[data-pickround]'), ex = hit('[data-export]');
    const rep = hit('[data-repeat]'), det = hit('[data-detail]'), addin = hit('[data-addin]'), rgrp = hit('[data-rgroup]');
    const rpg = hit('[data-rpage]');

    if (rpg) { view.rPage = Number(rpg.dataset.rpage); draw(); }
    else if (tab) { view.tab = tab.dataset.tab; draw(); }
    else if (rgrp) { const k = rgrp.dataset.rgroup; view.rClosed[k] = !view.rClosed[k]; draw(); }
    else if (grp) { const k = grp.dataset.group; view.closed[k] = !view.closed[k]; draw(); }
    else if (tool) {
      const id = row.dataset.id, kind = tool.dataset.tool;
      if (kind === 'photo') changePhoto(id);
      else if (kind === 'edit') editItem(id);
      else if (kind === 'delete') removeItem(id);
      else if (kind === 'move') pickerSheet({ title: 'จัดลำดับรายการ', options: [{ value: 'up', label: 'ย้ายขึ้น' }, { value: 'down', label: 'ย้ายลง' }] }).then(p => p && move(id, p === 'up' ? -1 : 1));
    }
    else if (addin) addItem(addin.dataset.addin);
    else if (act) {
      const kind = act.dataset.act;
      if (kind === 'add') addItem(null);
      else if (kind === 'addCat') addCat();
      else if (kind === 'clear') clearAll();
      else if (kind === 'send') send();
      else if (kind === 'build') { draw(); toast('สร้างรายงานตามช่วงที่เลือกแล้ว'); }
    }
    else if (range) { view.range = range.dataset.range; if (view.tab === 'report') applyRange(); draw(); }
    else if (pick) { const k = pick.dataset.pickround; view.picked[k] = !view.picked[k]; view.rPage = 0; draw(); }
    else if (rep) repeat(rep.dataset.repeat);
    else if (det) detail(det.dataset.detail);
    else if (ex) {
      if (ex.dataset.export === 'print') printArea('.r9');
      else toast('รอบนี้เปิดใช้เฉพาะพิมพ์รายงาน');
    }
  });

  // ชิปช่วงเวลาในแท็บ Report ปรับช่วงวันที่ให้ตรงกัน
  function applyRange() {
    const last = rounds[rounds.length - 1];
    if (view.range === 'month') { view.from = today.slice(0, 7) + '-01'; view.to = today; }
    else if (view.range === 'ytd' || view.range === 'year') { view.from = today.slice(0, 4) + '-01-01'; view.to = today; }
    else if (view.range === 'last' && last) { view.from = last.date; view.to = last.date; }
    else { view.from = rounds.length ? rounds[0].date : today; view.to = today; }
  }

  // กรอกปริมาณ/ราคา/ค่าส่ง/หมายเหตุ → คำนวณและเก็บทันที
  root.addEventListener('input', event => {
    const el = event.target;
    if (el.matches('[data-f]')) {
      const id = el.closest('.r9-item').dataset.id;
      revise('rama9Items', id, { [el.dataset.f]: Number(el.value) || 0 });
      items = get('rama9Items');
      const it = items.find(r => r.id === id), sum = r9Row(it);
      const cell = el.closest('.r9-item').querySelector('.r9-item__sum');
      cell.textContent = sum ? money(sum) : '-';
      cell.classList.toggle('is-zero', !sum);
      root.querySelector('#r9-sumcard').outerHTML = sumHtml(items, draft.fee);
    }
    else if (el.matches('[data-fee]')) {
      draft.fee = Number(el.value) || 0;
      saveDraft();
      // อัปเดตเฉพาะตัวเลขยอดสุทธิ เพื่อไม่ให้ช่องค่าส่งที่กำลังพิมพ์หายไป
      const goods = items.reduce((s, i) => s + r9Row(i), 0);
      el.closest('.r9-sum').querySelectorAll('.r9-sum__num')[1].innerHTML = moneyFine(goods + draft.fee) + '<small>บาท</small>';
    }
    else if (el.matches('#r9-note')) { draft.note = el.value; saveDraft(); }
    else if (el.matches('#r9-q')) { view.q = el.value.trim(); draw(); }
  });

  root.addEventListener('change', event => {
    const el = event.target;
    if (el.matches('[data-from]')) { view.from = el.value; draw(); }
    else if (el.matches('[data-to]')) { view.to = el.value; draw(); }
  });
}
