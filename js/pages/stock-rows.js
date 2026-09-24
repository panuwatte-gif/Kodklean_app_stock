// แถวรายการนับสต๊อก: รูป ชื่อ ช่องกรอกสต๊อกรวม/ครัวกลาง และคอนโดที่คิดให้เอง
import { STOCK_PHOTOS, STOCK_PHOTO_BY_GROUP, STOCK_COUNT_UI as T } from '../shared/config.js';
import { countTotal, countByPlace } from '../shared/calc.js';
import { qtyOrDash } from '../shared/format.js';
import { glyph } from '../shared/ui.js';
import { groupOf } from './stock-list.js';

// รูปของรายการ: รูปที่บันทึกไว้ในฐาน > ที่จับคู่ไว้ > รูปประจำหมวด
export function photoOf(item) {
  return item.photo || STOCK_PHOTOS[item.id] || STOCK_PHOTO_BY_GROUP[item.grp] || groupOf(item.grp).icon;
}

// รายการนี้เก็บของไว้สองที่ จึงกรอกสต๊อกรวมกับครัวกลาง แล้วให้คิดคอนโดให้เอง
export const isBothPlaces = item => item.location === 'ทั้งสองที่';

// ครัวกลางมากกว่าสต๊อกรวม หรือของสองที่ที่ยังไม่ใส่สต๊อกรวม = ยังบันทึกไม่ได้
const empty = v => v === null || v === undefined || v === '';
export function isBadSplit(item) {
  if (!isBothPlaces(item)) return false;
  if (empty(item.total)) return !empty(item.kitchen);
  return Number(item.condo) < 0;
}

// ตัวเลขผลนับท้ายแถว (เรียกซ้ำได้ตอนกรอก เพื่ออัปเดตเฉพาะตัวเลข)
export function qtyHtml(item, place, dirty) {
  const done = countTotal(item) !== null;
  const badge = dirty
    ? { label: T.edited, color: '#8A5510', tint: '#FDF0D8' }
    : done ? { label: T.counted, color: '#1E7A3C', tint: '#E7F4E9' } : { label: T.notCounted, color: '#6B6153', tint: '#F4F0E8' };
  return `
    <span class="stk-row__num">${qtyOrDash(countByPlace(item, place), item.unit)}<i>${item.unit}</i></span>
    <span class="stk-row__badge" style="--c:${badge.color};--t:${badge.tint}">${badge.label}</span>`;
}

// ช่องกรอกตัวเลขหนึ่งช่อง อยู่ในแถวเดียวกับชื่อ (ว่างไว้ = ยังไม่ได้นับ · tag = ป้ายเล็กในช่อง ใช้เฉพาะรายการสองที่)
function fieldHtml(item, field, label, color, tag = false) {
  const value = item[field];
  return `
    <label class="stk-cnt__f${tag ? ' has-tag' : ''}" style="--c:${color}" aria-label="${label}">
      ${tag ? `<span>${label}</span>` : ''}
      <input type="number" inputmode="decimal" step="0.1" min="0" placeholder="–"
        data-id="${item.id}" data-f="${field}" value="${value === null || value === undefined ? '' : value}">
      <i>${item.unit}</i>
    </label>`;
}

// บรรทัดเล็กใต้ชื่อ: คอนโดที่คิดให้เอง (หรือคำเตือนเมื่อตัวเลขยังไม่ครบ)
export function resultHtml(item) {
  if (isBadSplit(item)) {
    const text = empty(item.total) ? T.needTotal : T.badSplit;
    return `<span class="stk-res stk-res--bad">${glyph('warn', 12)}<span>${text}</span></span>`;
  }
  return `<span class="stk-res">${T.condoAuto} <b>${qtyOrDash(item.condo, item.unit)}</b> ${item.unit}</span>`;
}

// แถวรายการหนึ่งรายการ = 1 บรรทัด: รูป · ชื่อ(+ที่เก็บ) · ช่องกรอก · ผลนับ (สองที่ = กรอกรวม+ครัวกลาง, ที่เดียว = กรอกช่องเดียว)
function rowHtml(item, view, draft) {
  const both = isBothPlaces(item);
  const condo = item.location === 'คอนโด';
  const fields = both
    ? fieldHtml(item, 'total', T.formulaSum, '#8A5510', true) + fieldHtml(item, 'kitchen', T.formulaK, '#2F7A46', true)
    : condo
      ? fieldHtml(item, 'condo', T.formulaC, '#2F63C9')
      : fieldHtml(item, 'kitchen', T.formulaK, '#2F7A46');
  const sub = both ? resultHtml(item) : `<span class="stk-row__place">${condo ? T.formulaC : T.formulaK}</span>`;
  const tools = view.mode === 'sort'
    ? `<div class="stk-row__tools">${['up', 'down'].map(dir => `
        <button class="stk-tool" type="button" aria-label="ย้าย" data-move="${dir}" style="--c:#4C8FD8;--t:#EAF3FC">${glyph(dir, 16)}</button>`).join('')}</div>`
    : '';
  return `
    <li class="stk-row stk-row--count${both ? ' stk-row--both' : ''}${view.mode && view.mode !== 'sort' ? ' is-pick' : ''}" data-id="${item.id}">
      <button class="stk-row__thumb" type="button" data-photo="${item.id}" aria-label="${T.photoPick}">
        <img src="${photoOf(item)}" alt="${item.name}" width="37" height="37" loading="lazy" decoding="async">
      </button>
      <div class="stk-row__info">
        <span class="stk-row__name">${item.name}</span>
        ${sub}
      </div>
      <div class="stk-cnt">${fields}</div>
      <div class="stk-row__side">
        <div class="stk-row__qty">${qtyHtml(item, view.tab, !!draft[item.id])}</div>
        ${tools}
      </div>
    </li>`;
}

// จัดรายการเป็นกลุ่มตามหมวด (พับเก็บได้)
export function groupsHtml(items, view, draft) {
  const groups = [];
  items.forEach(item => {
    let g = groups.find(x => x.key === item.grp);
    if (!g) { g = { key: item.grp, cat: groupOf(item.grp), rows: [] }; groups.push(g); }
    g.rows.push(item);
  });
  return groups.map(g => `
    <section class="stk-group${view.closed[g.key] ? ' is-closed' : ''}" style="--c:${g.cat.color};--t:${g.cat.tint}">
      <button class="stk-group__head" type="button" data-group="${g.key}">
        <img src="${g.cat.icon}" alt="" width="20" height="20" loading="lazy" decoding="async">
        <span class="stk-group__name">${g.cat.label}</span>
        <span class="stk-group__count">${g.rows.filter(r => countTotal(r) !== null).length}/${g.rows.length} <em>รายการ</em></span>
        <span class="stk-group__caret">${glyph('chevron', 18)}</span>
      </button>
      <ul class="stk-group__rows">${g.rows.map(item => rowHtml(item, view, draft)).join('')}</ul>
    </section>`).join('');
}
