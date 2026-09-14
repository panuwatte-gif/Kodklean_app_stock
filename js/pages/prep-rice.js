// ตารางเตรียมข้าว (แท็บที่ 2): ตาราง 2.1 หุงข้าวดิบ / 2.2 ข้าวสุกคงเหลือ / สมการ / 2.3 สมมุติฐาน / สถิติ 7 วัน
import { PREP_RICE_COLS, PREP_RICE_EQ, PREP_CHART_SERIES } from '../shared/config.js';
import { riceRaw, riceCooked, riceResale, riceToRaw, historyAverage } from '../shared/calc.js';
import { weightBig } from '../shared/format.js';
import { personPill } from './prep-view.js';
import { cellInput } from './prep-meat.js';

// หัวตาราง (คอลัมน์ตาม config)
function headHtml(cols) {
  return `<div class="ptab__head">${cols.map(([a, b]) => `<div class="ptab__th">${a}${b ? `<em>${b}</em>` : ''}</div>`).join('')}</div>`;
}

// หัวข้อการ์ดตาราง เช่น "ตาราง 2.1 เตรียมหุงข้าว (ข้าวดิบ)"
function cardTitle(icon, text, tone) {
  return `<div class="ptab__title ptab__title--${tone}"><img src="${icon}" alt="" width="20" height="20" loading="lazy" decoding="async">${text}</div>`;
}

// ชื่อข้าวพร้อมรูปเล็ก
function riceName(r, no, small) {
  return `
    <span class="ptab__no${small ? ' ptab__no--sm' : ''}">${no}</span>
    <div class="ptab__item"><span class="ptab__thumb${small ? ' ptab__thumb--sm' : ''}"><img src="${r.photo}" alt="" width="${small ? 22 : 28}" height="${small ? 22 : 28}" loading="lazy" decoding="async"></span><span class="ptab__name"><span>${r.name}</span></span></div>`;
}

// ตาราง 2.1 เตรียมหุงข้าว (ข้าวดิบ) + แถวรวม
function cookTable(list, t) {
  const rows = list.map((r, i) => `
    <div class="ptab__row" data-id="${r.id}">
      ${riceName(r, i + 1)}
      <div class="ptab__owners">${r.owners.map(personPill).join('<i>+</i>')}</div>
      <div class="ptab__c">${cellInput(r.id, 'cook', r.cook)}</div>
      ${[0, 1, 2].map(k => `<div class="ptab__c">${cellInput(r.id, 'r' + k, r.rounds[k])}</div>`).join('')}
      <div class="ptab__use">${weightBig(riceRaw(r))}<small>≈สุก ${weightBig(riceCooked(r))} กก.</small></div>
    </div>`).join('');
  const sum = `
    <div class="ptab__sum">
      <span>รวมทั้งหมด (กก. ดิบ)</span>
      <b>${weightBig(t.cook)}</b><b>${weightBig(t.r1)}</b><b>${weightBig(t.r2)}</b><b>${weightBig(t.r3)}</b><b>${weightBig(t.raw)}</b>
    </div>`;
  return `<section class="ptab ptab--cook">${cardTitle('assets/prep/ic3d-prep.webp', 'ตาราง 2.1 เตรียมหุงข้าว (ข้าวดิบ)', 'green')}${headHtml(PREP_RICE_COLS.cook)}${rows}${sum}</section>`;
}

// ตาราง 2.2 ข้าวสุกคงเหลือและการแปลงค่า
function leftTable(list) {
  const rows = list.map((r, i) => `
    <div class="ptab__row ptab__row--sm" data-id="${r.id}">
      ${riceName(r, i + 1, true)}
      ${['left', 'waste', 'home', 'give'].map(f => `<div class="ptab__c">${cellInput(r.id, f, r[f])}</div>`).join('')}
      <div class="ptab__c ptab__val">${weightBig(riceResale(r))}</div>
      <div class="ptab__c ptab__val ptab__val--green">${weightBig(riceToRaw(riceResale(r), r.ratio))} กก.</div>
    </div>`).join('');
  return `<section class="ptab ptab--left">${cardTitle('assets/prep/ic3d-left.webp', 'ตาราง 2.2 ข้าวสุกคงเหลือและการแปลงค่า', 'blue')}${headHtml(PREP_RICE_COLS.left)}${rows}</section>`;
}

// การ์ดสมการ 3 ใบ: ใช้ขายจริง = ของเสีย + ข้าวเหลือขายต่อ
function eqHtml(t) {
  return `<div class="prep-eq">${PREP_RICE_EQ.map((e, i) => `
    ${i ? `<span class="prep-eq__op">${i === 1 ? '=' : '+'}</span>` : ''}
    <div class="prep-eq__card" style="--c:${e.color};--t:${e.tint};--b:${e.border}">
      <img src="${e.icon}" alt="" width="24" height="24" loading="lazy" decoding="async">
      <div class="prep-eq__label">${e.label}</div>
      <div class="prep-eq__big">${weightBig(t[e.key])} <small>กก. สุก</small></div>
      <div class="prep-eq__raw">= ${weightBig(t[e.rawKey])} <small>กก. ดิบ</small></div>
      ${e.note ? `<div class="prep-eq__note">${e.note}</div>` : ''}
    </div>`).join('')}</div>`;
}

// ตาราง 2.3 สมมุติฐานการหุงข้าวแต่ละชนิด
function ratioTable(list) {
  const rows = list.map((r, i) => `
    <div class="ptab__row ptab__row--sm">
      ${riceName(r, i + 1, true)}
      <div class="ptab__formula">${r.formula}</div>
      <div class="ptab__c ptab__val">1 : ${r.ratio}</div>
    </div>`).join('');
  return `<section class="ptab ptab--ratio">${cardTitle('assets/prep/ic3d-history.webp', 'ตาราง 2.3 สมมุติฐานการหุงข้าวแต่ละชนิด', 'amber')}${headHtml(PREP_RICE_COLS.ratio)}${rows}</section>`;
}

// กราฟเส้น+แท่ง 7 วัน (แท่งข้าวเหลือขยาย ×10 ให้มองเห็น)
function chartSvg(rows) {
  const W = 380, H = 170, L = 28, R = 8, T = 10, B = 26, max = 60;
  const x = i => L + (i + 0.5) * ((W - L - R) / rows.length);
  const y = v => T + (H - T - B) * (1 - Math.min(v, max) / max);
  const grid = [0, 10, 20, 30, 40, 50, 60].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#EDE2D0"/><text x="${L - 5}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="#8C8172">${v}</text>`).join('');
  const labels = rows.map((r, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="9" fill="#6B6153">${r.date}</text>`).join('');
  const series = PREP_CHART_SERIES.map(s => {
    if (s.kind === 'bar') return rows.map((r, i) => `<rect x="${x(i) - 6}" y="${y(r[s.key] * 10)}" width="12" height="${y(0) - y(r[s.key] * 10)}" rx="2" fill="${s.color}"/>`).join('');
    const pts = rows.map((r, i) => `${x(i)},${y(r[s.key])}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round"/>${rows.map((r, i) => `<circle cx="${x(i)}" cy="${y(r[s.key])}" r="3.2" fill="${s.color}" stroke="#fff" stroke-width="1.5"/>`).join('')}`;
  }).join('');
  return `<svg class="prep-chart__svg" viewBox="0 0 ${W} ${H}" aria-label="กราฟสถิติ 7 วัน">${grid}${series}${labels}</svg>`;
}

// สถิติย้อนหลัง 7 วัน: กราฟ + ตาราง + ค่าเฉลี่ย
function statsHtml(rows) {
  const avg = historyAverage(rows, ['sold', 'soldRaw', 'left']);
  const legend = PREP_CHART_SERIES.map(s => `<span><i style="background:${s.color}"></i>${s.label}${s.kind === 'bar' ? ' (×10)' : ''}</span>`).join('');
  const table = `
    <div class="prep-stat">
      <div class="prep-stat__head"><span>วันที่</span><span>ขายจริง<em>(กก. สุก)</em></span><span>ขายจริง<em>(เทียบข้าวดิบ)</em></span><span>ข้าวเหลือ<em>(กก. สุก)</em></span></div>
      ${rows.map(r => `<div class="prep-stat__row"><span>${r.date}</span><span>${weightBig(r.sold)}</span><span>${weightBig(r.soldRaw)}</span><span>${weightBig(r.left)}</span></div>`).join('')}
      <div class="prep-stat__row prep-stat__row--avg"><span>เฉลี่ย 7 วัน</span><span>${weightBig(avg.sold)}</span><span>${weightBig(avg.soldRaw)}</span><span>${weightBig(avg.left)}</span></div>
    </div>`;
  return `<section class="ptab ptab--stats">${cardTitle('assets/prep/ic3d-forecast.webp', 'สถิติย้อนหลัง 7 วัน', 'green')}
    <div class="prep-chart"><div class="prep-chart__legend">${legend}</div>${chartSvg(rows)}</div>${table}</section>`;
}

// ทั้งแท็บข้าว
export function riceBodyHtml(list, totals, history) {
  if (!list.length) return '<p class="ptab__none">ไม่มีรายการของคนนี้</p>';
  return cookTable(list, totals) + leftTable(list) + eqHtml(totals) + ratioTable(list) + statsHtml(history);
}
