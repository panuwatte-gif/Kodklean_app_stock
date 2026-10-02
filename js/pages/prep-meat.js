// ตารางเตรียมเนื้อสัตว์ (แท็บที่ 1) — วาดจากข้อมูลจริงของวันที่เลือก การบันทึกอยู่ที่ prep.js
import { PREP_UI, PREP_GROUP_NONE, PREP_CARD_UI as K } from '../shared/config.js';
import { weightBig, fillText, dayShort } from '../shared/format.js';
import { itemPhoto, prepGroupHeadHtml, glyph } from '../shared/ui.js';
import { prepGroupRuns } from '../shared/calc.js';
import { personPill } from './prep-view.js';
import { assumeMeatHtml } from './prep-assume.js';

// รูปประจำรายการ (ใช้ชุดกลางจาก ui.js)
export const photoOf = itemPhoto;

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

// บันทึกแล้ว = กรอกอย่างน้อย 1 ช่อง (เตรียม/เบิกเพิ่ม/ทิ้ง/เหลือ)
const isSaved = i => ['prep', 'extra', 'waste', 'left'].some(f => i[f] !== null && i[f] !== undefined);

// แถบนับสถานะด้านบน: ทั้งหมด · บันทึกแล้ว · ยังไม่บันทึก · พยากรณ์
export function meatStatsHtml(rows) {
  const done = rows.filter(isSaved).length, fc = rows.some(r => r.fcDay);
  const box = (tone, icon, a, b) => `<div class="pstat pstat--${tone}"><span class="pstat__top">${icon}<b>${a}</b></span><span class="pstat__lb">${b}</span></div>`;
  return `<div class="pstats">${box('blue', glyph('file', 18), rows.length, K.stTotal)}${box('green', glyph('check', 18), done, K.stDone)}${box('orange', glyph('clock', 18), rows.length - done, K.stTodo)}${box('plain', glyph('chart', 18), fc ? K.stFc : K.stFcWait, fc ? K.stFcSub : K.stFcWaitSub)}</div>`;
}

// กล่องควรเตรียมวันนี้ (ตัวเลขพยากรณ์ + ช่วง · ร้านปิด/คำนวณไม่ได้ = ข้อความสั้น) กดแล้วเปิดหน้ากราฟ
function recHtml(item) {
  const d = item.fcDay;
  const band = d && d.lo !== null && d.lo !== undefined && d.hi !== null && d.hi !== undefined && d.lo !== d.hi;
  const body = item.closed ? `<span class="pcard__recnone">${PREP_UI.fcClosed}</span>`
    : !d ? `<span class="pcard__recnone">${item.fcWhy || PREP_UI.fcNoCalc}</span>`
    : `<b>${d.fc} <small>${K.unit}</small></b>${band ? `<small>${fillText(K.recRange, { lo: d.lo, hi: d.hi })}</small>` : ''}`;
  return `<button class="pcard__rec" type="button" data-graph="${item.id}"><em>${K.recTitle}${glyph('chart', 14)}</em>${body}</button>`;
}

// ช่องกรอก 1 ช่อง (ป้ายบน · กล่องเลข + กก.) — data-save ให้ prep.js บันทึก
function fieldHtml(item, f) {
  const [a, b] = K.fields[f];
  return `<label class="pcard__f"><span class="pcard__lb">${a}${b ? `<small>${b}</small>` : ''}</span>
    <span class="pcard__box">${cellInput(item.id, f, item[f], '', 'meat').replace('class="ptab__in"', 'class="pcard__in"')}<i>${K.unit}</i></span>${histDot('meat', item.id, f, item.name, item.revs[f])}</label>`;
}

// การ์ดวัตถุดิบ 1 ใบ: หัว (รูป ชื่อ สถานะ ควรเตรียม) · ช่องกรอก 1–5 · ใช้จริงวันนี้ + ปุ่มดูกราฟ
function cardHtml(item) {
  const saved = isSaved(item);
  const [ca, cb] = K.fields.cooked;
  return `
    <article class="pcard${saved ? '' : ' is-todo'}" data-id="${item.id}">
      <div class="pcard__top">
        <span class="pcard__photo"><img src="${photoOf(item)}" alt="" width="60" height="60" loading="lazy" decoding="async"></span>
        <div class="pcard__who">
          <div class="pcard__name"><b>${item.name}</b><span class="pcard__st${saved ? ' is-done' : ''}">${glyph(saved ? 'check' : 'clock', 12)}${saved ? K.saved : K.notSaved}</span></div>
          <span class="pcard__grp">${item.prep_group || PREP_GROUP_NONE}</span>
          <span class="pcard__owners">${item.owners.map(personPill).join('')}</span>
        </div>
        ${recHtml(item)}
      </div>
      <div class="pcard__g3">${fieldHtml(item, 'prep')}${fieldHtml(item, 'extra')}${fieldHtml(item, 'waste')}</div>
      <div class="pcard__g2">${fieldHtml(item, 'left')}
        <div class="pcard__f" title="${PREP_UI.cookedNote}"><span class="pcard__lb">${ca}<small>${cb}</small></span><span class="pcard__box pcard__box--ro"><span class="pcard__in">${item.cooked ? weightBig(item.cooked) : '—'}</span><i>${K.unit}</i></span></div>
      </div>
      ${stockLine(item)}
      <div class="pcard__foot">
        <div class="pcard__use"><img src="assets/prep/ic3d-use.webp" alt="" width="34" height="34" loading="lazy" decoding="async">
          <div><em>${K.useTitle}<span title="${K.useInfo}">${glyph('info', 14)}</span></em><b>${item.use === null || item.use === undefined ? '—' : weightBig(item.use)} <small>${K.unit}</small></b></div></div>
        <button class="pcard__graph" type="button" data-graph="${item.id}">${glyph('chart', 20)}<span>${K.graphBtn}</span></button>
      </div>
    </article>`;
}

// ทั้งแท็บเตรียมอาหาร: การ์ดรายวัตถุดิบ (แบ่งหมวดย่อยตามลำดับในฐาน — ชุดเดียวกับหน้าครัวของพนักงาน) + การ์ด Assumption
export function meatBodyHtml(rows, model) {
  const body = prepGroupRuns(rows, PREP_GROUP_NONE).map(g => prepGroupHeadHtml(g.label) + g.rows.map(cardHtml).join('')).join('');
  return `<section class="pcards">${body || '<p class="ptab__none">ไม่มีรายการของคนนี้</p>'}</section>${assumeMeatHtml(model)}`;
}
