// แท็บพยากรณ์ (แท็บที่ 3) — ตัวเลือกวัน/รูปแบบ, การ์ดตัวชี้วัด, ตารางพยากรณ์รายรายการ, ข้อเสนอแนะ
import { save } from '../shared/data.js';
import { PREP_FC_UI, PREP_FC_MODES, PREP_FC_COLS, PREP_FC_KPI, PREP_TRENDS, PREP_FC_TONES } from '../shared/config.js';
import { forecastHistory } from '../shared/calc.js';
import { weightBig, dayLongTh, shiftIso } from '../shared/format.js';
import { glyph, sparkBars, toast } from '../shared/ui.js';
import { personPill } from './prep-view.js';

// แถวเลือกวันที่พยากรณ์ + สลับรูปแบบการแสดงผล
function controlsHtml(meta, mode) {
  const modes = PREP_FC_MODES.map(m => `
    <button class="fc-seg${m.id === mode ? ' is-on' : ''}" type="button" data-fc-mode="${m.id}">${m.label}</button>`).join('');
  return `
    <div class="fc-ctl">
      <div class="fc-card">
        <div class="fc-card__label"><img src="assets/prep/ic3d-date.webp" alt="" width="18" height="18" decoding="async">${PREP_FC_UI.dateLabel}</div>
        <div class="fc-date">
          <button class="fc-date__arrow" type="button" data-fc-day="-1" aria-label="วันก่อนหน้า">${glyph('back', 15)}</button>
          <span class="fc-date__now">${dayLongTh(meta.date)}</span>
          <span class="fc-date__ic">${glyph('calendar', 15)}</span>
          <button class="fc-date__arrow fc-date__arrow--next" type="button" data-fc-day="1" aria-label="วันถัดไป">${glyph('back', 15)}</button>
        </div>
      </div>
      <div class="fc-card">
        <div class="fc-card__label"><img src="assets/prep/ic3d-forecast.webp" alt="" width="18" height="18" decoding="async">${PREP_FC_UI.modeLabel}</div>
        <div class="fc-segs">${modes}</div>
      </div>
    </div>`;
}

// การ์ดตัวชี้วัด 4 ใบ (ค่าคำนวณจากรายการที่กรองอยู่ + ข้อมูลโมเดล)
function kpiHtml(rows, meta) {
  const values = {
    count: { big: String(rows.length), sub: 'รายการ' },
    accuracy: { big: `${meta.accuracy}%`, sub: `MAPE ${meta.mape}%` },
    days: { big: `${meta.days} วัน`, sub: 'ย้อนหลัง + ล่วงหน้า' },
    date: { big: dayLongTh(meta.date), sub: `อัปเดตล่าสุด ${meta.updated}`, small: true }
  };
  return `<div class="fc-kpi">${PREP_FC_KPI.map(k => {
    const v = values[k.key];
    return `
      <div class="fc-kpi__card" style="--c:${k.color};--t:${k.tint};--b:${k.border}">
        <div class="fc-kpi__head"><img src="${k.icon}" alt="" width="18" height="18" loading="lazy" decoding="async"><span>${k.label}</span></div>
        <div class="fc-kpi__num${v.small ? ' fc-kpi__num--sm' : ''}">${v.big}</div>
        <div class="fc-kpi__sub">${v.sub}</div>
      </div>`;
  }).join('')}</div>`;
}

// ป้ายแนวโน้มขึ้น/ลง/คงที่
function trendPill(trend) {
  const t = PREP_TRENDS[trend] || PREP_TRENDS.flat;
  return `<span class="fc-trend" style="--c:${t.color};--t:${t.tint}">${t.arrow} ${t.label}</span>`;
}

// ชื่อวัตถุดิบพร้อมรูปเล็ก
function itemHtml(row) {
  return `<div class="ptab__item"><span class="ptab__thumb ptab__thumb--sm"><img src="${row.photo}" alt="" width="22" height="22" loading="lazy" decoding="async"></span><span class="ptab__name"><span>${row.name}</span></span></div>`;
}

// ตารางพยากรณ์รายรายการ (2 รูปแบบ: ค่าตัวเลข / กราฟแนวโน้ม)
function tableHtml(rows, meta, mode) {
  const cols = PREP_FC_COLS[mode];
  const head = `<div class="ptab__head">${cols.map(([a, b]) => `<div class="ptab__th">${a}${b ? `<em>${b}</em>` : ''}</div>`).join('')}</div>`;
  const body = rows.map((row, i) => {
    const t = PREP_TRENDS[row.trend] || PREP_TRENDS.flat;
    const spark = `<div class="ptab__c fc-spark">${sparkBars(forecastHistory(row, meta.days), t.color)}</div>`;
    const nums = mode === 'num'
      ? `<div class="ptab__c fc-num">${weightBig(row.avg)}</div>
         <div class="ptab__c fc-num fc-num--big">${weightBig(row.fc)}</div>
         <div class="ptab__c fc-num fc-num--dim">${weightBig(row.min)}</div>
         <div class="ptab__c fc-num fc-num--dim">${weightBig(row.max)}</div>`
      : `<div class="ptab__c fc-num fc-num--big">${weightBig(row.fc)}</div>`;
    return `
      <div class="ptab__row ptab__row--sm">
        <span class="ptab__no ptab__no--sm">${i + 1}</span>
        ${itemHtml(row)}
        <div class="ptab__c">${personPill(row.owner)}</div>
        ${nums}
        <div class="ptab__c">${trendPill(row.trend)}</div>
        ${spark}
      </div>`;
  }).join('');
  return `
    <section class="ptab ptab--fc ptab--fc-${mode}">
      <div class="ptab__title ptab__title--green fc-title">
        <img src="assets/prep/ic3d-use.webp" alt="" width="20" height="20" loading="lazy" decoding="async">
        <span>${PREP_FC_UI.tableTitle}</span>
        <button class="fc-add" type="button" data-fc-add="1">${glyph('plus', 13)}${PREP_FC_UI.addLabel}</button>
      </div>
      ${head}${rows.length ? body : '<p class="ptab__none">ไม่มีรายการในตัวกรองนี้</p>'}
    </section>`;
}

// การ์ดข้อเสนอแนะ 3 ใบใต้ตาราง
function adviceHtml(tips) {
  const cards = tips.map(tip => {
    const tone = PREP_FC_TONES[tip.tone] || PREP_FC_TONES.green;
    return `
      <div class="fc-advice__card" style="--c:${tone.color};--t:${tone.tint}">
        <img src="${tip.photo}" alt="" width="46" height="46" loading="lazy" decoding="async">
        <div class="fc-advice__name">${tip.name}</div>
        <div class="fc-advice__tag">${tip.tag}</div>
        ${tip.lines.map(l => `<div class="fc-advice__line">${l}</div>`).join('')}
      </div>`;
  }).join('');
  return `
    <section class="fc-advice">
      <div class="fc-advice__head">
        <span class="fc-advice__title"><img src="assets/prep/ic3d-forecast.webp" alt="" width="20" height="20" loading="lazy" decoding="async">${PREP_FC_UI.adviceTitle}</span>
        <button class="fc-advice__all" type="button" data-fc-all="1">${PREP_FC_UI.adviceAll}${glyph('chevron', 13)}</button>
      </div>
      <div class="fc-advice__grid">${cards}</div>
    </section>`;
}

// ทั้งแท็บพยากรณ์
export function forecastBodyHtml(rows, meta, tips, mode) {
  return controlsHtml(meta, mode) + kpiHtml(rows, meta) + tableHtml(rows, meta, mode) + adviceHtml(tips);
}

// ปุ่มบนแท็บพยากรณ์: เลื่อนวัน / สลับรูปแบบ / เพิ่มรายการ / ดูทั้งหมด
export function forecastClick(event, view, meta, redraw) {
  const hit = sel => event.target.closest(sel);
  const day = hit('[data-fc-day]'), mode = hit('[data-fc-mode]');
  if (day) {
    save('prepForecastMeta', { ...meta, date: shiftIso(meta.date, Number(day.dataset.fcDay)) });
    return redraw();
  }
  if (mode) { view.mode = mode.dataset.fcMode; return redraw(); }
  if (hit('[data-fc-add]')) return toast('เพิ่มรายการวัตถุดิบเข้าการพยากรณ์ได้ที่หน้าสต๊อก');
  if (hit('[data-fc-all]')) return toast('ข้อเสนอแนะทั้งหมดจากพยากรณ์');
}
