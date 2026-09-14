// ตารางเตรียมเนื้อสัตว์ (แท็บที่ 1) — วาดอย่างเดียว การกดปุ่มจัดการที่ prep.js
import { PREP_MEAT_COLS, PREP_ROW_HILITE } from '../shared/config.js';
import { prepExtra, prepUse } from '../shared/calc.js';
import { weightBig, rangeText, plus } from '../shared/format.js';
import { glyph } from '../shared/ui.js';
import { personPill, personOf } from './prep-view.js';

// หัวตาราง (คอลัมน์ที่มีเจ้าของ จะติดรูป+ชื่อคนนั้นกำกับไว้)
function headHtml() {
  return `<div class="ptab__head">${PREP_MEAT_COLS.map(([a, b, owner], i) => {
    if (i === PREP_MEAT_COLS.length - 1) return `<div class="ptab__th"><span class="ptab__info">${glyph('info', 12)}</span></div>`;
    if (!owner) return `<div class="ptab__th">${a}${b ? `<em>${b}</em>` : ''}</div>`;
    const p = personOf(owner);
    return `<div class="ptab__th ptab__th--own" style="--c:${p.color};--t:${p.tint}">${a}${b ? `<em>${b}</em>` : ''}
      <span class="ptab__th-who"><img src="${p.round}" alt="" width="16" height="16" decoding="async">${p.name}</span></div>`;
  }).join('')}</div>`;
}

// ช่องกรอกตัวเลขในตาราง
export function cellInput(id, field, value, color) {
  return `<input class="ptab__in${color ? ` ptab__in--${color}` : ''}" type="number" inputmode="decimal" step="0.1" min="0" placeholder="-" data-id="${id}" data-f="${field}" value="${value === null || value === undefined ? '' : weightBig(value)}">`;
}

// แถวรายการ 1 แถว (ช่องคงเหลือเป็นหน้าที่เอมมี่ ทำสีเหลือง / แถวของฟ้าทำสีฟ้าพาสเตล)
function rowHtml(item, no) {
  const hilite = PREP_ROW_HILITE[item.id];
  return `
    <div class="ptab__row${hilite ? ` ptab__row--own ptab__row--own-${hilite}` : ''}" data-id="${item.id}">
      <span class="ptab__no">${no}</span>
      <div class="ptab__item">
        <span class="ptab__thumb"><img src="${item.photo}" alt="" width="28" height="28" loading="lazy" decoding="async"></span>
        <span class="ptab__name"><span>${item.name}</span>${item.note ? `<small>${item.note}</small>` : ''}</span>
      </div>
      <div class="ptab__c">${personPill(item.owner)}</div>
      <div class="ptab__rec">${weightBig(item.rec)} กก.<small>${rangeText(item.recMin, item.recMax)}</small></div>
      <div class="ptab__c">${cellInput(item.id, 'prep', item.prep)}</div>
      <div class="ptab__c"><button class="ptab__extra" type="button" data-extra="${item.id}" aria-label="เบิกเพิ่ม">${plus(prepExtra(item))}</button></div>
      <div class="ptab__c">${cellInput(item.id, 'waste', item.waste)}</div>
      <div class="ptab__c ptab__c--left">${cellInput(item.id, 'left', item.left, 'amber')}</div>
      <div class="ptab__use">${weightBig(prepUse(item))}<small>กก./วัน</small></div>
      <div class="ptab__c"><button class="ptab__edit" type="button" data-edit="${item.id}" aria-label="แก้ไข">${glyph('pencil', 12)}</button></div>
    </div>`;
}

// ตารางทั้งชุด จัดกลุ่มตามชนิดเนื้อ เลขลำดับต่อกันทั้งตาราง
export function meatTableHtml(items, groups) {
  let no = 0;
  const body = groups.map(g => {
    const rows = items.filter(i => i.group === g.id);
    if (!rows.length) return '';
    return `
      <div class="ptab__group"><img src="${g.icon}" alt="" width="20" height="20" loading="lazy" decoding="async">${g.label}</div>
      ${rows.map(i => rowHtml(i, ++no)).join('')}`;
  }).join('');
  return `<section class="ptab ptab--meat">${headHtml()}${body || '<p class="ptab__none">ไม่มีรายการของคนนี้</p>'}</section>`;
}
