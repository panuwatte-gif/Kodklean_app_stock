// การวาดชิ้นส่วนของหน้าสต๊อกเท่านั้น (แถบสลับ การ์ดสรุป ปุ่มจัดการ หมวดหมู่ รายการ)
import { STOCK_TABS, STOCK_ACTIONS, STOCK_STATUS, STOCK_ROW_TOOLS, CAT_ALL } from '../shared/config.js';
import { editRowHtml } from './stock-edit.js';
import { stockByPlace, stockStatus } from '../shared/calc.js';
import { amount, amountSmall } from '../shared/format.js';
import { glyph } from '../shared/ui.js';

// รายชื่อหมวดที่หน้านี้กำลังใช้ (ตั้งค่าจาก stock.js ทุกครั้งที่ข้อมูลหมวดเปลี่ยน)
let cats = [], subs = [];
export function setLists(nextCats, nextSubs) { cats = nextCats; subs = nextSubs; }

// หาข้อมูลหมวดหลัก/หมวดย่อยจาก id
export const catOf = id => cats.find(c => c.id === id) || CAT_ALL;
export const subOf = id => subs.find(s => s.id === id);

// แถบสลับมุมมอง: สต๊อกรวม / ครัวกลาง / คอนโด
export function tabsHtml(view) {
  return STOCK_TABS.map(t => `
    <button class="stk-tab${t.id === view.tab ? ' is-on' : ''}" type="button" data-tab="${t.id}">${t.label}</button>`).join('');
}

// การ์ดสรุปยอดของวัน 3 ช่อง
export function sumHtml(sum) {
  const cells = [
    { label: 'ทั้งหมด', value: sum.all, color: '#1E7A3C' },
    { label: 'ใกล้หมด', value: sum.low, color: '#D9822B' },
    { label: 'หมด', value: sum.out, color: '#D4322A' }
  ];
  return cells.map(c => `
    <div class="stk-cell" style="--c:${c.color}">
      <div class="stk-cell__label">${c.label}</div>
      <div class="stk-cell__value">${c.value}</div>
      <div class="stk-cell__unit">รายการ</div>
    </div>`).join('');
}

// แถวปุ่มจัดการรายการ (ปุ่มที่กำลังเปิดโหมดอยู่จะติดสี)
export function actionsHtml(view) {
  return STOCK_ACTIONS.map(a => `
    <button class="stk-act${a.id === view.mode ? ' is-on' : ''}" type="button" data-act="${a.id}" style="--c:${a.color};--t:${a.tint}">
      <span class="stk-act__ic">${glyph(a.glyph, 18)}</span>${a.label}
    </button>`).join('');
}

// แถวหมวดหมู่หลัก และหมวดย่อยของหมวดที่เลือก
export function catsHtml(view) {
  return [CAT_ALL].concat(cats).map(c => `
    <button class="stk-chip${c.id === view.cat ? ' is-on' : ''}" type="button" data-cat="${c.id}" style="--c:${c.color};--t:${c.tint}">
      <img src="${c.icon}" alt="" width="23" height="23" loading="lazy" decoding="async">${c.label}
    </button>`).join('');
}

export function subsHtml(view) {
  const rows = subs.filter(s => s.cat === view.cat);
  if (!rows.length) return '';
  const head = catOf(view.cat);
  return `<button class="stk-chip stk-chip--sm is-on" type="button" data-sub="" style="--c:${head.color};--t:${head.tint}"><img src="${head.icon}" alt="" width="19" height="19" loading="lazy" decoding="async">${head.label}</button>`
    + rows.map(s => `
    <button class="stk-chip stk-chip--sm${s.id === view.sub ? ' is-pick' : ''}" type="button" data-sub="${s.id}" style="--c:${head.color};--t:${head.tint}">
      <img src="${s.icon}" alt="" width="19" height="19" loading="lazy" decoding="async">${s.label}
    </button>`).join('');
}

// แถวรายการ 1 รายการในสต๊อก
function rowHtml(item, view) {
  if (view.edit === item.id) return editRowHtml(item, cats, subs);
  const cat = catOf(item.cat);
  const status = STOCK_STATUS[stockStatus(item)];
  const tag = subOf(item.sub) || cat;
  const tools = view.mode === 'sort'
    ? ['up', 'down'].map(dir => `
      <button class="stk-tool" type="button" aria-label="ย้าย" data-tool="${dir}" style="--c:#4C8FD8;--t:#EAF3FC">${glyph(dir, 16)}</button>`).join('')
    : STOCK_ROW_TOOLS.map(t => `
      <button class="stk-tool" type="button" aria-label="${t.label}" data-tool="${t.id}" style="--c:${t.color};--t:${t.tint}">${glyph(t.glyph, 16)}</button>`).join('');
  return `
    <li class="stk-row" data-id="${item.id}">
      <span class="stk-row__grip">${glyph('grip', 16)}</span>
      <span class="stk-row__thumb"><img src="${item.photo}" alt="${item.name}" width="37" height="37" loading="lazy" decoding="async"></span>
      <div class="stk-row__info">
        <div class="stk-row__top">
          <span class="stk-row__name">${item.name || 'รายการใหม่'}</span>
          <span class="stk-row__tag" style="--c:${cat.color};--t:${cat.tint}">${tag.label}</span>
        </div>
        <div class="stk-row__where">
          <span>${glyph('pin', 11)} ครัวกลาง ${amountSmall(item.kitchen, item.unit)} ${item.unit}</span>
          <span>${glyph('pin', 11)} คอนโด ${amountSmall(item.condo, item.unit)} ${item.unit}</span>
        </div>
      </div>
      <div class="stk-row__qty">
        <span class="stk-row__num">${amount(stockByPlace(item, view.tab), item.unit)}<i>${item.unit}</i></span>
        ${status ? `<span class="stk-row__badge" style="--c:${status.color};--t:${status.tint}">${status.label}</span>` : ''}
      </div>
      <div class="stk-row__tools">${tools}</div>
    </li>`;
}

// จัดรายการเป็นกลุ่ม "หมวดหลัก > หมวดย่อย" ตามลำดับที่พบ
export function groupsHtml(items, view) {
  const groups = [];
  items.forEach(item => {
    const key = `${item.cat}|${item.sub || ''}`;
    let g = groups.find(x => x.key === key);
    if (!g) {
      const cat = catOf(item.cat);
      const sub = subOf(item.sub);
      g = { key, cat, label: sub ? `${cat.label} > ${sub.label}` : cat.label, rows: [] };
      groups.push(g);
    }
    g.rows.push(item);
  });
  return groups.map(g => `
    <section class="stk-group${view.closed[g.key] ? ' is-closed' : ''}" style="--c:${g.cat.color};--t:${g.cat.tint}">
      <button class="stk-group__head" type="button" data-group="${g.key}">
        <img src="${g.cat.icon}" alt="" width="20" height="20" loading="lazy" decoding="async">
        <span class="stk-group__name">${g.label}</span>
        <span class="stk-group__count">${g.rows.length} <em>รายการ</em></span>
        <span class="stk-group__caret">${glyph('chevron', 18)}</span>
      </button>
      <ul class="stk-group__rows">${g.rows.map(item => rowHtml(item, view)).join('')}</ul>
    </section>`).join('');
}
