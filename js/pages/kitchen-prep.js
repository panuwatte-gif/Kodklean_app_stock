// แท็บเตรียมอาหาร (เอมมี่ + อัด ใช้ร่วมกัน) — ใช้ข้อมูลชุดเดียวกับหน้าเตรียม-เหลือ (kk_prep_log)
import { getPrepRecs, savePrep } from '../shared/data.js';
import { prepGroupRuns } from '../shared/calc.js';
import { KITCHEN_UI as T, PREP_ENTRY, PREP_GROUP_NONE } from '../shared/config.js';
import { itemPhoto, fcHtml, prepGroupHeadHtml, dateBarHtml, dateBandHtml } from '../shared/ui.js';
import { weightBig, fillText } from '../shared/format.js';
import { splitIssues, dayBarHtml, itemTagHtml } from './prep-fc-issues.js';

const P = T.prep;

// โหลดข้อมูลของวันนั้น แล้วประกอบเป็นแถวเนื้อสัตว์ + แถวข้าว (พร้อมค่าพยากรณ์)
export async function loadPrepDay(date) {
  return (await getPrepRecs(date)).model;   // ชุดเดียวกับหน้าเตรียม-เหลือ (model.fc = ผลพยากรณ์ไว้แสดงช่วงต่ำสุด–สูงสุด)
}

// ช่องกรอกตัวเลข 1 ช่อง (kind = meat/rice · f = ชื่อช่อง)
function cell(kind, id, f, value) {
  return `<input class="kp__in" type="number" inputmode="decimal" step="0.1" min="0" placeholder="–"
    data-prep="${kind}" data-id="${id}" data-f="${f}" value="${value === null || value === undefined ? '' : weightBig(value)}">`;
}

// ช่องรูป + ชื่อรายการ (กดเพื่อแก้ชื่อ/เปลี่ยนรูป — บันทึกลงฐาน ทุกหน้าเปลี่ยนตาม)
function itemCell(item, fit = false) {
  return `<button class="kp__item" type="button" data-edit="${item.id}" title="${P.editTitle}"${fit ? ' style="width:100%;height:auto;min-height:44px;padding:3px 4px;gap:3px"' : ''}>
      <img src="${itemPhoto(item)}" alt="" width="28" height="28" loading="lazy" decoding="async"${fit ? ' style="width:20px;height:20px"' : ''}>
      <b${fit ? ' style="min-width:0;white-space:normal;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.2"' : ''}>${item.name}</b>
    </button>`;
}

// ช่องใช้ไป: ตัวเลข หรือเหตุผลสั้นๆ เมื่อยังคิดไม่ได้
const useCell = item => (item.use === null || item.use === undefined
  ? `<small style="color:#B4741B;font-weight:700">${P.why[item.useWhy] || P.none}</small>` : weightBig(item.use));

// ความกว้างคอลัมน์ตารางเนื้อสัตว์ (ป้ายพยากรณ์อยู่บรรทัดบนเหนือช่องกรอก เหมือนหน้าเตรียม-เหลือ)
const MEAT_GRID = 'grid-template-columns:88px repeat(4, minmax(0, 1fr)) 40px';

// แถวเนื้อสัตว์ 1 แถว: ใช้ไปมาจาก prepUse ใน calc.js (สูตรเดียวกับหน้าเตรียม-เหลือและข้อมูลพยากรณ์)
function meatRow(item, issues) {
  return `
    <div class="kp__row" data-id="${item.id}" style="${MEAT_GRID};row-gap:3px">
      <div style="min-width:0;grid-column:1;grid-row:1 / span 2;align-self:center">${itemCell(item, true)}${itemTagHtml(issues)}</div>
      <div class="kp__recline" style="grid-column:2 / -1;grid-row:1;display:flex;min-width:0;flex-wrap:wrap">${fcHtml(item.fcDay, item.closed, item.fcWhy)}</div>
      ${cell('meat', item.id, 'prep', item.prep)}
      ${cell('meat', item.id, 'extra', item.extra)}
      ${cell('meat', item.id, 'waste', item.waste)}
      ${cell('meat', item.id, 'left', item.left)}
      <span class="kp__sum">${useCell(item)}</span>
    </div>`;
}

// แถวข้าว 1 แถว: หุงเพิ่มรอบ 1-3 รวมเป็นปริมาณหุงรวม
function riceRow(item) {
  const rounds = item.rounds || [];
  const any = rounds.some(v => v !== null && v !== undefined) || (item.cook !== null && item.cook !== undefined);
  const total = any ? rounds.reduce((s, v) => s + Number(v || 0), Number(item.cook || 0)) : null;
  return `
    <div class="kp__row kp__row--rice" data-id="${item.id}">
      ${itemCell(item)}
      <span class="kp__fc">${item.closed ? T.prep.none : item.fcDay ? weightBig(item.fcDay.fc) : `<small>${item.fcWhy || P.none}</small>`}</span>
      ${cell('rice', item.id, 'r0', rounds[0])}
      ${cell('rice', item.id, 'r1', rounds[1])}
      ${cell('rice', item.id, 'r2', rounds[2])}
      <span class="kp__sum">${total === null ? P.none : weightBig(total)}</span>
    </div>`;
}

// คำเตือนใต้ตาราง: เมนูที่ไม่ได้ผูกวัตถุดิบ / ข้อมูลอาหารเหลือขัดกัน / พระราม 9 ไม่มีน้ำหนักต่อหน่วย
function warnNotes(model) {
  const w = model.useWarn || {}, out = [];
  if ((w.unbound || []).length) out.push(fillText(P.warnUnbound, { names: w.unbound.join(', ') }));
  if ((w.conflicts || []).length) out.push(fillText(P.warnConflict, { names: w.conflicts.join(', ') }));
  return out.map(t => `<p class="kp__note" style="color:#B4741B">⚠ ${t}</p>`).join('');
}

// ทั้งแท็บ: แถบเลือกวันที่ + การ์ดตารางเตรียมวัตถุดิบ + การ์ดตารางหุงข้าว (ทุกอย่างเป็นของวันที่เลือก)
export function prepBodyHtml(model, q, date) {
  const find = rows => rows.filter(r => !q || r.name.includes(q));
  const meat = find(model.meatRows), rice = find(model.riceRows);
  const head = (cols, style = '') => `<div class="kp__head"${style ? ` style="${style}"` : ''}>${cols.map(c => `<b>${c}</b>`).join('')}</div>`;
  // ผลพยากรณ์ของแถวเนื้อสัตว์ (ชุดเดียวกับตารางพยากรณ์) + คำเตือนแยกระดับวัน/รายการ
  const fcRows = ((model.fc && model.fc.rows) || []).filter(r => model.meatRows.some(m => m.id === r.id));
  const iss = splitIssues(fcRows);
  return `<div style="margin:0 0 10px">${dateBarHtml(date, 'kp-date-pick')}${dateBandHtml(date)}</div>
    <section class="kp">
      <h2 class="kp__title">${P.meatTitle}<span>${P.unit}</span></h2>
      <div class="kp__table">
        ${dayBarHtml(iss.day)}
        ${head(P.meatCols, MEAT_GRID)}
        ${meat.length ? prepGroupRuns(meat, PREP_GROUP_NONE).map(g => prepGroupHeadHtml(g.label, 'kp__group') + g.rows.map(m => meatRow(m, iss.item[m.id] || [])).join('')).join('') : `<p class="kempty">${P.noRows}</p>`}
      </div>
      <p class="kp__note">${P.useNote}</p>${warnNotes(model)}
    </section>
    <section class="kp kp--rice">
      <h2 class="kp__title">${P.riceTitle}<span>${P.unit}</span></h2>
      <div class="kp__table kp__table--rice">
        ${head(P.riceCols)}
        ${rice.length ? rice.map(riceRow).join('') : `<p class="kempty">${P.noRows}</p>`}
      </div>
    </section>`;
}

// บันทึก 1 ช่องลงฐาน (เพิ่มแถวใหม่ทุกครั้ง ของเก่าไม่หาย)
export async function savePrepCell(input, date, by) {
  const { prep: kind, id, f } = input.dataset;
  const qty = input.value === '' ? null : Math.max(0, Number(input.value));
  const entry = kind === 'rice'
    ? { type: PREP_ENTRY.rice.r, seq: Number(f[1]) + 1 }
    : { type: PREP_ENTRY.meat[f], seq: 1 };
  await savePrep({ item: id, date, type: entry.type, seq: entry.seq, qty, by });
}
