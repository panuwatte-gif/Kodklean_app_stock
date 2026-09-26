// แท็บเตรียมอาหาร (เอมมี่ + อัด ใช้ร่วมกัน) — ใช้ข้อมูลชุดเดียวกับหน้าเตรียม-เหลือ (kk_prep_log)
import { getPrepBundle, savePrep } from '../shared/data.js';
import { buildPrepModel } from '../shared/calc.js';
import { buildForecast, applyRecs } from '../shared/forecast.js';
import { KITCHEN_UI as T, PREP_ENTRY } from '../shared/config.js';
import { itemPhoto } from '../shared/ui.js';
import { weightBig, fillText } from '../shared/format.js';
import { splitIssues, dayBarHtml, itemTagHtml } from './prep-fc-issues.js';

const P = T.prep;

// โหลดข้อมูลของวันนั้น แล้วประกอบเป็นแถวเนื้อสัตว์ + แถวข้าว (พร้อมค่าพยากรณ์)
export async function loadPrepDay(date) {
  const b = await getPrepBundle(date);
  const model = buildPrepModel(b);
  const fc = buildForecast(b.items, b.logsFc, date, b.cfg);
  model.fc = fc;   // เก็บผลพยากรณ์ชุดเดียวกับตารางพยากรณ์ ไว้แสดงช่วงต่ำสุด–สูงสุด
  return applyRecs(model, fc, b.logsFc, date);
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

// ความกว้างคอลัมน์ตารางเนื้อสัตว์ (ช่องแนะเตรียมกว้างพอตัวเลขทศนิยม 1 ตำแหน่ง + ช่วงพยากรณ์)
const MEAT_GRID = 'grid-template-columns:88px 50px repeat(4, minmax(0, 1fr)) 34px';

// ช่องแนะเตรียม 2 บรรทัด: บนตัวใหญ่ = แนะเตรียม (ขอบบน − ของยกมา · เสาร์ใช้ค่ากลาง) · ล่างตัวเล็ก = ช่วงพยากรณ์ หรือเหตุผลสั้น
function recCell(item, f, all) {
  const top = item.rec ? weightBig(item.rec.t) : P.none;
  let sub;
  if (f && f.fc !== null && f.fc !== undefined) {
    const txt = f.lo !== null && f.lo !== undefined && f.hi !== null && f.hi !== undefined
      ? fillText(P.fcRange, { lo: weightBig(f.lo), hi: weightBig(f.hi) }) : fillText(P.fcOne, { v: weightBig(f.fc) });
    sub = txt.replace(' ', '<br><span style="white-space:nowrap">') + '</span>';   // "พยากรณ์" บรรทัดหนึ่ง ตัวเลขอีกบรรทัด
  } else sub = (all[0] || {}).t || P.none;
  return `<span class="kp__fc" style="display:flex;flex-direction:column;align-items:center;line-height:1.15">
      <b style="font-size:13px;font-weight:700;color:#1F5E99;white-space:nowrap">${top}</b>
      <small style="font-size:9px;line-height:1.2;color:#5E6E7D;text-align:center">${sub}</small>
    </span>`;
}

// แถวเนื้อสัตว์ 1 แถว: ใช้ไปมาจาก prepUse ใน calc.js (สูตรเดียวกับหน้าเตรียม-เหลือและข้อมูลพยากรณ์)
function meatRow(item, f, issues, all) {
  return `
    <div class="kp__row" data-id="${item.id}" style="${MEAT_GRID}">
      <div style="min-width:0">${itemCell(item, true)}${itemTagHtml(issues)}</div>
      ${recCell(item, f, all)}
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
      <span class="kp__fc">${item.rec ? item.rec.t : P.none}</span>
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
  if ((w.r9NoUnit || []).length) out.push(fillText(P.warnR9Unit, { names: w.r9NoUnit.join(', ') }));
  return out.map(t => `<p class="kp__note" style="color:#B4741B">⚠ ${t}</p>`).join('');
}

// ทั้งแท็บ: การ์ดตารางเตรียมวัตถุดิบ + การ์ดตารางหุงข้าว
export function prepBodyHtml(model, q) {
  const find = rows => rows.filter(r => !q || r.name.includes(q));
  const meat = find(model.meatRows), rice = find(model.riceRows);
  const head = (cols, style = '') => `<div class="kp__head"${style ? ` style="${style}"` : ''}>${cols.map(c => `<b>${c}</b>`).join('')}</div>`;
  // ผลพยากรณ์ของแถวเนื้อสัตว์ (ชุดเดียวกับตารางพยากรณ์) + คำเตือนแยกระดับวัน/รายการ
  const fcRows = ((model.fc && model.fc.rows) || []).filter(r => model.meatRows.some(m => m.id === r.id));
  const fcOf = id => fcRows.find(r => r.id === id);
  const iss = splitIssues(fcRows);
  return `
    <section class="kp">
      <h2 class="kp__title">${P.meatTitle}<span>${P.unit}</span></h2>
      <div class="kp__table">
        ${dayBarHtml(iss.day)}
        ${head(P.meatCols, MEAT_GRID)}
        ${meat.length ? meat.map(m => meatRow(m, fcOf(m.id), iss.item[m.id] || [], iss.all[m.id] || [])).join('') : `<p class="kempty">${P.noRows}</p>`}
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
