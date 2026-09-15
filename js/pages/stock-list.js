// การวาดชิ้นส่วนบนของหน้านับสต๊อกเท่านั้น (เจ้าของงาน แถบสลับ การ์ดสรุป ความคืบหน้า ตัวกรอง หมวด)
import { STOCK_TABS, STOCK_GROUPS, STOCK_ITEM_ACTIONS, STOCK_COUNT_UI as T, CAT_ALL } from '../shared/config.js';
import { countProgress } from '../shared/calc.js';
import { fillText } from '../shared/format.js';
import { glyph } from '../shared/ui.js';

// หาข้อมูลหมวดจากชื่อหมวดในฐาน (ไม่เจอ = ใช้ชิปกลางๆ)
export const groupOf = id => STOCK_GROUPS.find(g => g.id === id) || { ...CAT_ALL, id, label: id };

// แถบบอกว่าใครกำลังนับ และรับผิดชอบงานไหน (ทุกหน้าต้องบอกคนรับผิดชอบ)
export function whoHtml(me, jobs) {
  return `
    <img class="stk__who-av" src="assets/login/avatar-${me.avatar}.webp" alt="${me.name}" width="34" height="34" decoding="async">
    <div class="stk__who-text">
      <div class="stk__who-name">${me.name}</div>
      <div class="stk__who-role">${jobs.length ? jobs.join(' · ') : T.noWork}</div>
    </div>`;
}

// แถบสลับมุมมอง: สต๊อกรวม / ครัวกลาง / คอนโด
export function tabsHtml(view) {
  return STOCK_TABS.map(t => `
    <button class="stk-tab${t.id === view.tab ? ' is-on' : ''}" type="button" data-tab="${t.id}">${t.label}</button>`).join('');
}

// การ์ดสรุปของวัน 3 ช่อง: ต้องนับ / นับแล้ว / ยังไม่นับ
export function sumHtml(rows) {
  const p = countProgress(rows);
  const cells = [
    { label: T.cellAll, value: p.all, color: '#1E7A3C' },
    { label: T.cellDone, value: p.done, color: '#2F7A46' },
    { label: T.cellLeft, value: p.left, color: '#D9822B' }
  ];
  return cells.map(c => `
    <div class="stk-cell" style="--c:${c.color}">
      <div class="stk-cell__label">${c.label}</div>
      <div class="stk-cell__value">${c.value}</div>
      <div class="stk-cell__unit">รายการ</div>
    </div>`).join('');
}

// เส้นความคืบหน้า: กรอกครบเท่าไหร่จากทั้งหมด
export function progressHtml(rows) {
  const p = countProgress(rows);
  return `
    <div class="stk-prog__top">
      <span>${fillText(T.progress, p)}</span>
      <em class="stk-prog__pct">${p.pct}%</em>
    </div>
    <div class="stk-prog__bar"><i style="width:${p.pct}%"></i></div>`;
}

// ปุ่มตัวกรอง: งานของฉัน / เฉพาะที่ยังไม่นับ / ยกเลิกตัวกรองทั้งหมด
export function filtersHtml(view, jobs) {
  const chip = (id, label, on, color, tint, ic) => `
    <button class="stk-act${on ? ' is-on' : ''}" type="button" data-filter="${id}" style="--c:${color};--t:${tint}">
      <span class="stk-act__ic">${glyph(ic, 18)}</span>${label}
    </button>`;
  const rows = [];
  if (jobs.length) rows.push(chip('mine', T.mine, view.mine, '#2FA36B', '#E7F6EE', 'check'));
  rows.push(chip('left', T.onlyLeft, view.left, '#E08A2E', '#FDF1DF', 'filter'));
  if (view.mine || view.left || view.grp !== 'all' || view.q) rows.push(chip('clear', T.clear, false, '#4C8FD8', '#EAF3FC', 'eye'));
  return rows.join('');
}

// แถบสูตร: คอนโด = สต๊อกรวม − ครัวกลาง (ให้พนักงานอ่านวิธีคิดได้จากหน้าจอ)
export function formulaHtml() {
  return `
    <span class="stk-fx__c" style="--c:#8A5510;--t:#FDF0D8">${T.formulaSum}</span>
    <b class="stk-fx__op">−</b>
    <span class="stk-fx__c" style="--c:#2F7A46;--t:#E7F4E9">${T.formulaK}</span>
    <b class="stk-fx__op">=</b>
    <span class="stk-fx__c stk-fx__c--sum" style="--c:#2F63C9;--t:#EAF2FD">${T.formulaC}</span>`;
}

// ปุ่มจัดการรายการ: เพิ่ม / แก้ไข / ลบ / สลับตำแหน่ง (ปุ่มที่เปิดโหมดอยู่จะติดสี)
export function itemActionsHtml(view) {
  return STOCK_ITEM_ACTIONS.map(a => `
    <button class="stk-act${a.id === view.mode ? ' is-on' : ''}" type="button" data-act="${a.id}" style="--c:${a.color};--t:${a.tint}">
      <span class="stk-act__ic">${glyph(a.glyph, 18)}</span>${a.label}
    </button>`).join('');
}

// แถวชิปหมวด (เฉพาะหมวดที่มีรายการอยู่จริง)
export function catsHtml(view, rows) {
  const used = STOCK_GROUPS.filter(g => rows.some(r => r.grp === g.id));
  return [CAT_ALL].concat(used).map(c => `
    <button class="stk-chip${c.id === view.grp ? ' is-on' : ''}" type="button" data-grp="${c.id}" style="--c:${c.color};--t:${c.tint}">
      <img src="${c.icon}" alt="" width="23" height="23" loading="lazy" decoding="async">${c.label}
    </button>`).join('');
}
