// แท็บพยากรณ์ (แท็บที่ 3) — แสดงผลพยากรณ์จากสูตรใน kk_forecast_model_map + บันทึก/เติมผลใช้จริงใน kk_forecast_daily
import { PREP_FC_UI } from '../shared/config.js';
import { weightBig, dayLongTh, fillText } from '../shared/format.js';
import { sparkBars } from '../shared/ui.js';
import { photoOf } from './prep-meat.js';
import { todayIso, recordFcDaily, refreshFcDaily } from '../shared/data.js';
import { dailyStats } from '../shared/forecast.js';
import { nextOpenIso } from '../shared/fclab.js';

const SCENARIO = 'S1';
const dash = v => (v === null || v === undefined ? '—' : weightBig(v));
const warnLine = t => `<span style="display:block;white-space:normal;overflow:visible;font-size:10px;line-height:1.35;color:#B4741B">⚠ ${t}</span>`;
const infoLine = t => `<span style="display:block;white-space:normal;overflow:visible;font-size:10px;line-height:1.35;color:#5C6B7A">${t}</span>`;
const banner = (t, tone) => `<p class="ptab__footnote" style="white-space:normal;border-radius:10px;padding:8px 10px;${tone === 'warn' ? 'color:#8A1F17;background:#FDECEA' : 'color:#8A5A12;background:#FDF3E2'}">${t}</p>`;

let seq = 0;               // กันผลของคำขอเก่ามาทับเมื่อเปลี่ยนวันระหว่างโหลด
const written = new Set(); // วันที่เขียนผลพยากรณ์ไปแล้วในรอบเปิดแอปนี้

// การ์ดตัวชี้วัด 4 ใบ (ความแม่นยำมาจาก kk_forecast_daily เท่านั้น เติมทีหลังเมื่อโหลดเสร็จ)
function kpiHtml(fc, date) {
  const cards = [
    { label: PREP_FC_UI.kpi.count, big: String(fc.rows.length), sub: 'รายการ', c: '#1E7A3C', t: '#EAF6EC', b: '#CFE8D3' },
    { id: 'fc-acc', label: PREP_FC_UI.kpi.accuracy, big: '…', sub: PREP_FC_UI.liveLoading, small: true, c: '#B4741B', t: '#FDF3E2', b: '#F3E0BD' },
    { label: PREP_FC_UI.kpi.days, big: '10 วัน', sub: 'วันเปิดร้านล่าสุด', c: '#2F63C9', t: '#EAF1FD', b: '#CFDDF5' },
    { label: PREP_FC_UI.kpi.date, big: dayLongTh(date), sub: 'ตามวันที่เลือกด้านบน', small: true, c: '#2F63C9', t: '#EAF1FD', b: '#CFDDF5' }
  ];
  return `<div class="fc-kpi">${cards.map(k => `
    <div class="fc-kpi__card"${k.id ? ` id="${k.id}"` : ''} style="--c:${k.c};--t:${k.t};--b:${k.b}">
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

// ข้อความเตือนใต้ชื่อรายการ (สูตรต่างจากเดิม · สูตรสำรอง · ยอดขาย · ของที่ยกมา)
function warnHtml(row) {
  const w = [], info = [];
  if (row.diff) w.push(fillText(PREP_FC_UI.modelDiff, row.diff));
  if (row.fallbackTrial) {
    const t = row.fallbackTrial;
    w.push(fillText(PREP_FC_UI.fallback, { set: row.setCode || '—', why: row.fallbackWhy, used: row.usedCode, from: t.period_from, to: t.period_to, win: t.win_rate, band: row.bandLabel }));
  }
  if (row.status === 'no_fallback') w.push(fillText(PREP_FC_UI.noFallback, { set: row.setCode || '—', why: row.fallbackWhy }));
  if (row.salesWarn) w.push(PREP_FC_UI.salesWarn);
  if (row.carry && row.carry.stale) w.push(fillText(PREP_FC_UI.carryStale, { d: row.carry.date }));
  if (row.carry && row.carry.cookedMissing && row.grp === 'เนื้อสัตว์') info.push(PREP_FC_UI.carryNoCooked);
  if (row.statusText) info.push(row.statusText);
  return w.map(warnLine).join('') + info.map(infoLine).join('');
}

// แถวพยากรณ์ 1 รายการ (คำนวณไม่ได้ = บอกเหตุผล ไม่เดาตัวเลข · แบบคงที่ไม่มีกรอบ · WAPE มาจากผลใช้จริง)
function rowHtml(row, i) {
  const nums = row.fc === null
    ? `<div class="ptab__c fc-status" style="grid-column: span 4;white-space:normal">${PREP_FC_UI.status[row.status] || PREP_FC_UI.insufficient}</div>`
    : `<div class="ptab__c fc-num">${dash(row.avg6)}</div>
       <div class="ptab__c ptab__c--key ptab__c--violet"><span class="fc-num fc-num--big">${weightBig(row.fc)}</span></div>
       <div class="ptab__c fc-num fc-num--dim">${dash(row.lo)}</div>
       <div class="ptab__c fc-num fc-num--dim">${dash(row.hi)}</div>`;
  return `
    <div class="ptab__row ptab__row--sm">
      <span class="ptab__no ptab__no--sm">${i + 1}</span>
      <div class="ptab__item">
        <span class="ptab__thumb ptab__thumb--sm"><img src="${photoOf(row)}" alt="" width="22" height="22" loading="lazy" decoding="async"></span>
        <span class="ptab__name"><span>${row.name}${row.status === 'fixed' ? ` <em>(${PREP_FC_UI.fixedTag})</em>` : ''}</span><small>${row.model.label}</small>${warnHtml(row)}</span>
      </div>
      ${nums}
      <div class="ptab__c">${trendPill(row.trend)}</div>
      <div class="ptab__c fc-num fc-num--dim" data-live-wape="${row.id}">…</div>
      <div class="ptab__c fc-spark">${row.hist10 && row.hist10.length ? sparkBars(row.hist10, '#7C4FD0', 22) : '<span class="fc-dim">—</span>'}</div>
    </div>`;
}

// แถบเตือนรวม: วัตถุดิบที่ผูกกับสูตรยอดขาย (หลักฐานเดิมมาจากการรู้ยอดขายวันเดียวกัน)
function salesBannerHtml(fc) {
  const names = fc.rows.filter(r => r.salesWarn).map(r => r.name);
  return names.length ? banner(`⚠ <b>${PREP_FC_UI.salesHead}</b> ${names.join(' · ')} — ${PREP_FC_UI.salesWarn}`) : '';
}

// กล่องผลทดสอบย้อนหลัง (แสดงเมื่อยังไม่มีผลใช้จริงเท่านั้น · ไม่รวมเป็นความแม่นยำใช้จริง)
function backtestHtml(fc) {
  const rows = fc.rows.filter(r => r.modelType === 'model');
  if (!rows.length) return '';
  return `<section class="ptab"><div class="ptab__title">${PREP_FC_UI.backHead}</div>
    ${rows.map(r => `<p class="ptab__footnote" style="white-space:normal">${r.name}: ${r.hitN || 0} วัน · ${r.hitRate === null || r.hitRate === undefined ? PREP_FC_UI.insufficient : `win rate ${r.hitRate}% (กรอบ ${r.bandLabel})`} · WAPE ${r.wape === null || r.wape === undefined ? '—' : r.wape + '%'}</p>`).join('')}</section>`;
}

// วาดผลความแม่นยำใช้จริงลงการ์ด KPI + คอลัมน์ WAPE + กล่องสรุป
function paintLive(fc, st, notes) {
  const cfg = fc.cfg, acc = document.getElementById('fc-acc'), box = document.getElementById('fc-live');
  const a = st.all;
  if (acc) {
    const num = acc.querySelector('.fc-kpi__num'), sub = acc.querySelector('.fc-kpi__sub');
    if (!a.n) { num.textContent = '—'; sub.textContent = PREP_FC_UI.liveNone; }
    else if (!a.enough) { num.textContent = `${a.n} วัน`; sub.textContent = fillText(PREP_FC_UI.liveNotEnough, { n: a.n, d: cfg.min_days_to_judge }); }
    else { num.textContent = a.win + '%'; sub.textContent = fillText(PREP_FC_UI.liveWin, { w: a.win, n: a.n }); }
  }
  document.querySelectorAll('[data-live-wape]').forEach(el => {
    const s = st.items[el.dataset.liveWape];
    el.textContent = !s ? '—' : !s.enough ? `${s.n} วัน` : s.wape === null ? 'คำนวณไม่ได้' : s.wape + '%';
  });
  if (!box) return;
  const items = fc.rows.filter(r => st.items[r.id]).map(r => {
    const s = st.items[r.id];
    return `<p class="ptab__footnote" style="white-space:normal">${r.name}: ${s.n} วัน · ${s.enough ? `win rate ${s.win}% · WAPE ${s.wape === null ? 'คำนวณไม่ได้' : s.wape + '%'}` : PREP_FC_UI.insufficient} · ${fillText(PREP_FC_UI.liveErr, { avg: s.errAvg, max: s.errMax })}</p>`;
  }).join('');
  box.innerHTML = notes.join('')
    + `<section class="ptab"><div class="ptab__title">${PREP_FC_UI.liveHead}</div>
      ${a.n ? `<p class="ptab__footnote" style="white-space:normal">${a.enough ? fillText(PREP_FC_UI.liveWin, { w: a.win, n: a.n }) : fillText(PREP_FC_UI.liveNotEnough, { n: a.n, d: cfg.min_days_to_judge })} · ${fillText(PREP_FC_UI.liveErr, { avg: a.errAvg, max: a.errMax })}</p>${items}`
        : `<p class="ptab__footnote">${PREP_FC_UI.liveNone}</p>`}
      <p class="ptab__footnote" style="white-space:normal">${PREP_FC_UI.liveTrace}</p></section>`
    + (a.n ? '' : backtestHtml(fc));
}

// บันทึกผลพยากรณ์ของวันนี้/วันเปิดถัดไปครั้งเดียวต่อรอบเปิดแอป (หน้าเตรียมเรียกทุกครั้งที่โหลด ไม่ต้องเปิดแท็บพยากรณ์) — คืนข้อความแจ้ง
export async function saveFcDailyOnce(fc, date) {
  const notes = [], today = todayIso();
  if (!fc || !(date === today || date === nextOpenIso(today)) || written.has(date) || fc.cfgBad.length) return notes;
  try {
    const { added, noBand } = await recordFcDaily(fc, date, SCENARIO);
    written.add(date);
    if (noBand.length) notes.push(banner(fillText(PREP_FC_UI.liveNoBand, { names: noBand.join(', ') })));
    if (added.length) notes.push(banner(fillText(PREP_FC_UI.liveSaved, { d: date, n: added.length })));
  } catch { notes.push(banner(PREP_FC_UI.liveFail, 'warn')); }
  return notes;
}

// บันทึกผลพยากรณ์ → เติมผลจริง → คำนวณความแม่นยำใช้จริง
async function liveRun(fc, date) {
  const my = ++seq;
  const cur = () => my === seq && document.getElementById('fc-live') && document.getElementById('fc-live').dataset.date === date;
  const notes = await saveFcDailyOnce(fc, date);
  let daily;
  try { daily = fc.cfgBad.length ? [] : await refreshFcDaily(fc.cfg, SCENARIO); }
  catch {
    if (!cur()) return;
    document.getElementById('fc-live').innerHTML = notes.join('') + banner(PREP_FC_UI.liveLoadFail, 'warn') + backtestHtml(fc);
    const acc = document.getElementById('fc-acc');
    if (acc) acc.querySelector('.fc-kpi__sub').textContent = PREP_FC_UI.liveLoadFail;
    return;
  }
  if (!cur()) return;
  paintLive(fc, dailyStats(daily, fc.cfg), notes);
}

// ทั้งแท็บพยากรณ์ (แสดงผลอย่างเดียว ไม่มีช่องกรอก)
export function forecastBodyHtml(fc, date) {
  if (!fc) return '<p class="ptab__none">กำลังโหลดข้อมูลจากฐาน...</p>';
  const head = `<div class="ptab__head">${PREP_FC_UI.cols.map(([a, b], i) => `<div class="ptab__th${i === 3 ? ' ptab__th--key ptab__th--violet' : ''}">${a}${b ? `<em>${b}</em>` : ''}</div>`).join('')}</div>`;
  const cfgBad = fc.cfgBad && fc.cfgBad.length ? banner(fillText(PREP_FC_UI.cfgBad, { keys: fc.cfgBad.join(', ') }), 'warn') : '';
  setTimeout(() => liveRun(fc, date), 0);
  const c = fc.cfg || {};
  return kpiHtml(fc, date) + cfgBad + salesBannerHtml(fc) + `
    <section class="ptab ptab--fc">
      <div class="ptab__title ptab__title--green">${PREP_FC_UI.tableTitle}</div>
      ${head}${fc.rows.map(rowHtml).join('')}
      <p class="ptab__footnote">${fillText(PREP_FC_UI.rules, { band: c.band_value, pct: c.band_pct, sd: c.sd_window, min: c.sd_min_obs, days: c.min_days_to_judge })}</p>
    </section>
    <div id="fc-live" data-date="${date}"><p class="ptab__none">${PREP_FC_UI.liveLoading}</p></div>`;
}
