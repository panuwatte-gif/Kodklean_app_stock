// แท็บเตรียมอาหาร (เอมมี่ + อัด ใช้ร่วมกัน) — ใช้ข้อมูลชุดเดียวกับหน้าเตรียม-เหลือ (kk_prep_log)
import { getPrepBundle, savePrep } from '../shared/data.js';
import { buildPrepModel } from '../shared/calc.js';
import { buildForecast, recTarget, carryOver } from '../shared/forecast.js';
import { KITCHEN_UI as T, PREP_ENTRY } from '../shared/config.js';
import { itemPhoto } from '../shared/ui.js';
import { weightBig } from '../shared/format.js';

const P = T.prep;

// โหลดข้อมูลของวันนั้น แล้วประกอบเป็นแถวเนื้อสัตว์ + แถวข้าว (พร้อมค่าพยากรณ์)
export async function loadPrepDay(date) {
  const b = await getPrepBundle(date);
  const model = buildPrepModel(b);
  const fc = buildForecast(b.items, b.logsFc, date, b.cfg);
  model.meatRows.forEach(r => {
    r.rec = recTarget(fc.rows.find(x => x.id === r.id), carryOver(b.logsFc, r.id, date), date);
  });
  return model;
}

// ช่องกรอกตัวเลข 1 ช่อง (kind = meat/rice · f = ชื่อช่อง)
function cell(kind, id, f, value) {
  return `<input class="kp__in" type="number" inputmode="decimal" step="0.1" min="0" placeholder="–"
    data-prep="${kind}" data-id="${id}" data-f="${f}" value="${value === null || value === undefined ? '' : weightBig(value)}">`;
}

// ช่องรูป + ชื่อรายการ (กดเพื่อแก้ชื่อ/เปลี่ยนรูป — บันทึกลงฐาน ทุกหน้าเปลี่ยนตาม)
function itemCell(item) {
  return `<button class="kp__item" type="button" data-edit="${item.id}" title="${P.editTitle}">
      <img src="${itemPhoto(item)}" alt="" width="28" height="28" loading="lazy" decoding="async">
      <b>${item.name}</b>
    </button>`;
}

// แถวเนื้อสัตว์ 1 แถว: ใช้ไป = เตรียม + เบิกเพิ่ม − ทิ้ง/เสีย − คงเหลือสด − อาหารปรุงสุกเหลือ (สูตรเดียวกับหน้าเตรียม-เหลือ)
function meatRow(item) {
  return `
    <div class="kp__row" data-id="${item.id}">
      ${itemCell(item)}
      <span class="kp__fc">${item.rec ? item.rec.t : P.none}</span>
      ${cell('meat', item.id, 'prep', item.prep)}
      ${cell('meat', item.id, 'extra', item.extra)}
      ${cell('meat', item.id, 'waste', item.waste)}
      ${cell('meat', item.id, 'left', item.left)}
      <span class="kp__sum">${item.use === null || item.use === undefined ? P.none : weightBig(item.use)}</span>
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
      ${cell('rice', item.id, 'r0', rounds[0])}
      ${cell('rice', item.id, 'r1', rounds[1])}
      ${cell('rice', item.id, 'r2', rounds[2])}
      <span class="kp__sum">${total === null ? P.none : weightBig(total)}</span>
    </div>`;
}

// ทั้งแท็บ: การ์ดตารางเตรียมวัตถุดิบ + การ์ดตารางหุงข้าว
export function prepBodyHtml(model, q) {
  const find = rows => rows.filter(r => !q || r.name.includes(q));
  const meat = find(model.meatRows), rice = find(model.riceRows);
  const head = cols => `<div class="kp__head">${cols.map(c => `<b>${c}</b>`).join('')}</div>`;
  return `
    <section class="kp">
      <h2 class="kp__title">${P.meatTitle}<span>${P.unit}</span></h2>
      <div class="kp__table">
        ${head(P.meatCols)}
        ${meat.length ? meat.map(meatRow).join('') : `<p class="kempty">${P.noRows}</p>`}
      </div>
      <p class="kp__note">${P.useNote}</p>
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
