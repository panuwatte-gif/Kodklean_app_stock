// ตารางเตรียมเนื้อสัตว์ (แท็บที่ 1) — วาดจากข้อมูลจริงของวันที่เลือก การบันทึกอยู่ที่ prep.js
import { PREP_MEAT_COLS, PREP_GROUP_OF, PREP_UI } from '../shared/config.js';
import { weightBig, fillText, dayShort } from '../shared/format.js';
import { itemPhoto, recHtml } from '../shared/ui.js';
import { personPill } from './prep-view.js';
import { assumeMeatHtml } from './prep-assume.js';

// คอลัมน์ที่พนักงานต้องกรอก → โทนสีประจำคอลัมน์
const KEY_TONE = { 2: 'mint', 3: 'cyan', 5: 'peach' };

// รูปประจำรายการ (ใช้ชุดกลางจาก ui.js)
export const photoOf = itemPhoto;

// หัวตาราง (3 ช่องกรอกหลักเป็นป้ายสีเด่น)
function headHtml() {
  return `<div class="ptab__head">${PREP_MEAT_COLS.map(([a, b], i) => {
    const tone = KEY_TONE[i];
    return `<div class="ptab__th${tone ? ` ptab__th--key ptab__th--${tone}` : ''}">${a}${b ? `<em>${b}</em>` : ''}${tone ? '<span class="ptab__th-tag">กรอก</span>' : ''}</div>`;
  }).join('')}</div>`;
}

// จุดประวัติมุมช่อง — โผล่เฉพาะช่องที่เคยถูกแก้ (rev_no > 1) กดแล้วเปิดกล่องประวัติ
export function histDot(kind, id, f, name, rev) {
  if (!rev) return '';
  return `<button class="ptab__dot" type="button" data-hist="${kind}" data-id="${id}" data-f="${f}" data-name="${name}" aria-label="${fillText(PREP_UI.histBadge, { n: rev.n })}" title="${fillText(PREP_UI.histBadge, { n: rev.n })}"></button>`;
}

// ช่องกรอกตัวเลข (กก.) — data-save บอก prep.js ว่าบันทึกไปที่ไหน
export function cellInput(id, field, value, color, save = 'meat') {
  return `<input class="ptab__in${color ? ` ptab__in--${color}` : ''}" type="number" inputmode="decimal" step="0.1" min="0" placeholder="-" data-id="${id}" data-f="${field}" data-save="${save}" value="${value === null || value === undefined ? '' : weightBig(value)}">`;
}

// บรรทัดเชื่อมสต๊อกครัวกลางใต้แถว: ยอดนับจริงเป็นหลัก / ไม่มีนับหลังวันนั้น = ประมาณจากยอดนับล่าสุด − ใช้ไปเบื้องต้น
function stockLine(row) {
  if (!row.stock) return '';
  const warn = row.stockWarn ? `<b class="ptab__stock-warn">${PREP_UI.stockWarn}</b>` : '';
  const s = row.stock;
  const text = s.mode === 'counted'
    ? fillText(PREP_UI.stockCounted, { d: dayShort(s.date), q: weightBig(s.qty) })
    : fillText(PREP_UI.stockEst, { r: s.est === null ? '—' : weightBig(s.est), d: dayShort(s.baseDate), q: weightBig(s.baseQty) });
  return `<div class="ptab__stock">${text}${warn}</div>`;
}

// แถวรายการ 1 แถว (draft = ค่าร่างจากปุ่มคัดลอก ต้องกดยืนยันทีละแถวถึงจะบันทึก)
function rowHtml(item, no, draft) {
  const cell = (f, tone) => `
    <div class="ptab__c${tone ? ` ptab__c--key ptab__c--${tone}` : ''}">${cellInput(item.id, f, item[f], tone)}${histDot('meat', item.id, f, item.name, item.revs[f])}</div>`;
  const dv = draft && (item.prep === null || item.prep === undefined) ? draft.values[item.id] : undefined;
  const draftBtn = dv !== undefined ? `<button class="ptab__draftbtn" type="button" data-apply-draft="1" data-id="${item.id}" data-v="${dv}">${fillText(PREP_UI.draftUse, { v: dv })}</button>` : '';
  const rec = recHtml(item.rec, PREP_UI.recLabel);
  return `
    <div class="ptab__row" data-id="${item.id}">
      <span class="ptab__no">${no}</span>
      <div class="ptab__item">
        <span class="ptab__thumb"><img src="${photoOf(item)}" alt="" width="28" height="28" loading="lazy" decoding="async"></span>
        <span class="ptab__name">
          <span>${item.name}</span>
          <span class="ptab__meta">${item.owners.map(personPill).join('')}</span>
          ${rec}
        </span>
      </div>
      ${cell('prep', 'mint')}${cell('extra', 'cyan')}${cell('waste')}${cell('left', 'peach')}
      <div class="ptab__c ptab__cooked" title="${PREP_UI.cookedNote}">${item.cooked ? weightBig(item.cooked) : '—'}</div>
      <div class="ptab__use">${item.use === null ? '—' : weightBig(item.use)}<small>กก.</small></div>
    </div>
    ${draftBtn ? `<div class="ptab__draftrow">${draftBtn}</div>` : ''}
    ${stockLine(item)}`;
}

// ทั้งแท็บเตรียมอาหาร: ตาราง (จัดกลุ่มตามชนิดเนื้อ) + หมายเหตุ + การ์ด Assumption
export function meatBodyHtml(rows, groups, model, draft) {
  let no = 0;
  const body = groups.map(g => {
    const list = rows.filter(i => (PREP_GROUP_OF[i.id] || 'meat') === g.id);
    if (!list.length) return '';
    return `
      <div class="ptab__group"><img src="${g.icon}" alt="" width="20" height="20" loading="lazy" decoding="async">${g.label}</div>
      ${list.map(i => rowHtml(i, ++no, draft)).join('')}`;
  }).join('');
  const sat = rows.some(r => r.rec && r.rec.sat);
  return `<section class="ptab ptab--meat">${headHtml()}${body || '<p class="ptab__none">ไม่มีรายการของคนนี้</p>'}
    <p class="ptab__footnote">${sat ? PREP_UI.satNote : PREP_UI.recOff}</p></section>${assumeMeatHtml(model)}`;
}