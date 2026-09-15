// แท็บพยากรณ์ (แท็บที่ 3) — หน้าแสดงผลอย่างเดียว: สูตรล็อกต่อรายการ + กรอบ ±2SD + วัดผลแบบ walk-forward จากบันทึกจริง
import { PREP_FC_UI } from '../shared/config.js';
import { weightBig, dayLongTh, fillText } from '../shared/format.js';
import { sparkBars } from '../shared/ui.js';
import { photoOf } from './prep-meat.js';

const dash = v => (v === null || v === undefined ? '—' : weightBig(v));

// การ์ดตัวชี้วัด 4 ใบ (ความแม่นยำจากวันที่ทำนายล่วงหน้าจริงเท่านั้น ไม่พอ = บอกว่าไม่พอ)
function kpiHtml(fc, date) {
  const need = fillText(PREP_FC_UI.needDays, { days: (fc.cfg || {}).min_days_to_judge });
  const cards = [
    { label: PREP_FC_UI.kpi.count, big: String(fc.rows.length), sub: 'รายการ', c: '#1E7A3C', t: '#EAF6EC', b: '#CFE8D3' },
    fc.accuracy.status === 'ok'
      ? { label: PREP_FC_UI.kpi.accuracy, big: fc.accuracy.rate + '%', sub: `จาก ${fc.accuracy.n} รายการที่วัดได้`, c: '#D4322A', t: '#FDECEA', b: '#F5CFCB' }
      : { label: PREP_FC_UI.kpi.accuracy, big: PREP_FC_UI.insufficient, sub: need, small: true, c: '#B4741B', t: '#FDF3E2', b: '#F3E0BD' },
    { label: PREP_FC_UI.kpi.days, big: '10 วัน', sub: 'วันเปิดร้านล่าสุด', c: '#2F63C9', t: '#EAF1FD', b: '#CFDDF5' },
    { label: PREP_FC_UI.kpi.date, big: dayLongTh(date), sub: 'ตามวันที่เลือกด้านบน', small: true, c: '#2F63C9', t: '#EAF1FD', b: '#CFDDF5' }
  ];
  return `<div class="fc-kpi">${cards.map(k => `
    <div class="fc-kpi__card" style="--c:${k.c};--t:${k.t};--b:${k.b}">
      <div class="fc-kpi__head"><span>${k.label}</span></div>
      <div class="fc-kpi__num${k.small ? ' fc-kpi__num--sm' : ''}">${k.big}</div>
      <div class="fc-kpi__sub">${k.sub}</div>
    </div>`).join('')}</div>`;
}

// ป้ายแนวโน้ม
function trendPill(trend) {
  if (!trend) return '<span class="fc-dim">—</span>';
  const t = PREP_FC_UI.trends[trend];
  return `<span class="fc-trend" style="--c:${t.color};--t:${t.tint}">${t.arrow} ${t.label}</span>`;
}

// แถวพยากรณ์ 1 รายการ (คำนวณไม่ได้ = บอกเหตุผล ไม่เดาตัวเลข)
function rowHtml(row, i) {
  const nums = row.fc === null
    ? `<div class="ptab__c fc-status" style="grid-column: span 4">${PREP_FC_UI.status[row.status] || PREP_FC_UI.insufficient}</div>`
    : `<div class="ptab__c fc-num">${dash(row.avg6)}</div>
       <div class="ptab__c ptab__c--key ptab__c--violet"><span class="fc-num fc-num--big">${weightBig(row.fc)}</span></div>
       <div class="ptab__c fc-num fc-num--dim">${dash(row.lo)}</div>
       <div class="ptab__c fc-num fc-num--dim">${dash(row.hi)}</div>`;
  return `
    <div class="ptab__row ptab__row--sm">
      <span class="ptab__no ptab__no--sm">${i + 1}</span>
      <div class="ptab__item">
        <span class="ptab__thumb ptab__thumb--sm"><img src="${photoOf(row)}" alt="" width="22" height="22" loading="lazy" decoding="async"></span>
        <span class="ptab__name"><span>${row.name}</span><small>${row.model.label}</small></span>
      </div>
      ${nums}
      <div class="ptab__c">${trendPill(row.trend)}</div>
      <div class="ptab__c fc-num fc-num--dim">${row.wape === null ? '—' : row.wape}</div>
      <div class="ptab__c fc-spark">${row.hist10.length ? sparkBars(row.hist10, '#7C4FD0', 22) : '<span class="fc-dim">—</span>'}</div>
    </div>`;
}

// ทั้งแท็บพยากรณ์ (แสดงผลอย่างเดียว ไม่มีช่องกรอก)
export function forecastBodyHtml(fc, date) {
  if (!fc) return '<p class="ptab__none">กำลังโหลดข้อมูลจากฐาน...</p>';
  const head = `<div class="ptab__head">${PREP_FC_UI.cols.map(([a, b], i) => `<div class="ptab__th${i === 3 ? ' ptab__th--key ptab__th--violet' : ''}">${a}${b ? `<em>${b}</em>` : ''}</div>`).join('')}</div>`;
  return kpiHtml(fc, date) + `
    <section class="ptab ptab--fc">
      <div class="ptab__title ptab__title--green">${PREP_FC_UI.tableTitle}</div>
      ${head}${fc.rows.map(rowHtml).join('')}
      <p class="ptab__footnote">${fillText(PREP_FC_UI.rules, { band: (fc.cfg || {}).band_value, sd: (fc.cfg || {}).sd_window, min: (fc.cfg || {}).sd_min_obs, days: (fc.cfg || {}).min_days_to_judge })}</p>
    </section>`;
}