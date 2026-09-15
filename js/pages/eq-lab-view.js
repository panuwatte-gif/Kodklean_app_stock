// หน้าจอของห้องทดสอบสูตร รายวัตถุดิบ (วาด HTML อย่างเดียว ตัวคำนวณอยู่ที่ shared/fclab.js)
import { EQ_LAB_UI, FC_FAMILY_TH, FC_STATUS_TH, FC_REGIME_TH, PREP_FC_UI } from '../shared/config.js';
import { itemPhoto, glyph } from '../shared/ui.js';
import { money, pct1, fillText, dayShort } from '../shared/format.js';

const PICK_COLORS = ['#2F63C9', '#D4322A', '#6E9B1F'];
const n2 = v => (v === null || v === undefined ? '—' : String(v));

// แถบเลือกวัตถุดิบด้านบน (เลื่อนซ้าย-ขวาได้)
export const itemStripHtml = (items, sel) => `<div class="eql-strip">${items.map(i => `
  <button class="eql-chip${i.id === sel ? ' is-on' : ''}" type="button" data-item="${i.id}">
    <img src="${itemPhoto(i)}" alt="" width="26" height="26" loading="lazy" decoding="async"><span>${i.name}</span>
  </button>`).join('')}</div>`;

// ป้ายสถานการณ์
export const regimePill = r => (r && FC_REGIME_TH[r]
  ? `<span class="eql-reg" style="--c:${FC_REGIME_TH[r].color};--t:${FC_REGIME_TH[r].tint}">${FC_REGIME_TH[r].arrow} ${FC_REGIME_TH[r].label}</span>`
  : `<span class="eql-dim">ข้อมูลยังไม่พอ</span>`);

// การ์ดสภาพปัจจุบัน + สูตรที่ใช้จริงอยู่
export function stateHtml(st, reg, live, price) {
  const cells = [
    { v: n2(st.avg6), u: EQ_LAB_UI.stats[0][1], l: EQ_LAB_UI.stats[0][0] },
    { v: n2(st.sd) + (st.cv === null ? '' : ` <em>(${st.cv}%)</em>`), u: EQ_LAB_UI.stats[1][1], l: EQ_LAB_UI.stats[1][0] },
    { v: String(st.n), u: EQ_LAB_UI.stats[2][1], l: EQ_LAB_UI.stats[2][0] },
    { v: regimePill(reg.regime) + (reg.slopePct === null ? '' : ` <em>${reg.slopePct > 0 ? '+' : ''}${reg.slopePct}%</em>`), u: '', l: EQ_LAB_UI.stats[3][0] }
  ];
  return `<section class="eql-card">
    <div class="eql-card__head">${glyph('info', 14)}<span>${EQ_LAB_UI.stateHead}</span>
      <i>${st.from ? `${dayShort(st.from)} – ${dayShort(st.to)}` : ''}</i></div>
    <div class="eql-stats">${cells.map(c => `<div class="eql-stat"><span>${c.l}</span><b>${c.v}${c.u ? `<u>${c.u}</u>` : ''}</b></div>`).join('')}</div>
    <div class="eql-live">
      <span>${EQ_LAB_UI.liveHead}</span>
      <b>${live ? live.label : EQ_LAB_UI.noLive}</b>
      <i>${price === null ? EQ_LAB_UI.noPrice : `${EQ_LAB_UI.priceHead} ฿${money(price)}/กก.`}</i>
    </div>
  </section>`;
}

// แท็บย่อย ปริมาณ / มูลค่า / กราฟ
export const subTabsHtml = on => `<div class="eql-sub">${EQ_LAB_UI.subtabs.map(([id, label]) => `
  <button class="eql-subbtn${id === on ? ' is-on' : ''}" type="button" data-sub="${id}">${label}</button>`).join('')}</div>`;

// ตารางแข่งสูตร หน่วยกิโลกรัมทั้งตาราง
export function kgTableHtml(rows, cfg, liveCode, picked) {
  const head = EQ_LAB_UI.cols.map((c, i) => `<div class="eqt__th">${c}${EQ_LAB_UI.colUnits[i] ? `<em>${EQ_LAB_UI.colUnits[i]}</em>` : ''}</div>`).join('');
  const body = rows.map(r => {
    const tone = r.code === liveCode ? ' is-live' : r.status === 'control' ? ' is-ctrl' : '';
    const on = picked.includes(r.code);
    const cells = [`${r.n}`, pct1(r.winRate), `${r.lossN}`, n2(r.lossMax), n2(r.lossAvg), n2(r.lossMin), n2(r.lossSum), n2(r.bandAvg)];
    return `<div class="eqt__row${tone}">
      <div class="eqt__c eqt__c--pick"><label><input type="checkbox" data-pick="${r.code}"${on ? ' checked' : ''}><span></span></label></div>
      <div class="eqt__c eqt__c--code">${r.code}</div>
      <div class="eqt__c eqt__c--name">${r.name}</div>
      <div class="eqt__c">${FC_FAMILY_TH[r.family] || r.family}</div>
      ${r.enough
        ? cells.map((v, i) => `<div class="eqt__c eqt__c--num${i === 1 ? ' eqt__c--key' : ''}">${v}</div>`).join('')
        : `<div class="eqt__c eqt__c--num">${r.n}</div><div class="eqt__c eqt__c--wait" style="grid-column: span 6">${PREP_FC_UI.insufficient}</div><div class="eqt__c eqt__c--num">${n2(r.bandAvg)}</div>`}
      <div class="eqt__c"><i class="eql-tag eql-tag--${r.status}">${FC_STATUS_TH[r.status] || r.status}</i></div>
    </div>`;
  }).join('');
  return `<div class="eqt__scroll"><div class="eqt" style="--cols:26px 96px 132px 60px 46px 54px 50px 58px 58px 58px 62px 60px 78px">
    <div class="eqt__head">${`<div class="eqt__th"></div>` + head}</div>${body}</div></div>
    <p class="eqt__foot">${fillText(EQ_LAB_UI.foot, { r: cfg.round_length_days, d: cfg.min_days_to_judge })}</p>`;
}

// ตารางมูลค่า (คนละแท็บกับปริมาณ ห้ามรวมกัน)
export function bahtTableHtml(rows, price, cfg) {
  if (price === null) return `<p class="ptab__none">${EQ_LAB_UI.noPrice}</p>`;
  const perMonth = r => (r.n ? r.lossSum / r.n * Number(cfg.round_length_days) * price : null);
  const head = EQ_LAB_UI.bahtCols.map(c => `<div class="eqt__th">${c}</div>`).join('');
  const body = rows.filter(r => r.enough).map(r => `
    <div class="eqt__row">
      <div class="eqt__c eqt__c--code">${r.code}</div>
      <div class="eqt__c eqt__c--name">${r.name}</div>
      <div class="eqt__c eqt__c--num">฿${money(r.lossAvg * price)}</div>
      <div class="eqt__c eqt__c--num">฿${money(r.lossSum * price)}</div>
      <div class="eqt__c eqt__c--num eqt__c--key">฿${money(perMonth(r))}</div>
    </div>`).join('');
  return `<div class="eqt__scroll"><div class="eqt" style="--cols:96px 150px 96px 104px 108px">
    <div class="eqt__head">${head}</div>${body || `<p class="ptab__none">${PREP_FC_UI.insufficient}</p>`}</div></div>
    <p class="eqt__foot">คิดจากราคา ฿${money(price)} ต่อกิโล · แพ้รวมต่อเดือน = แพ้รวม ÷ วันทดสอบ × ${cfg.round_length_days} วันเปิด</p>`;
}

// เส้นกราฟ (ตัดเป็นช่วงๆ ถ้าวันไหนสูตรยังคำนวณไม่ได้ ห้ามลากข้าม)
function runs(dates, byDate, key, x, y) {
  const seg = [];
  let cur = [];
  dates.forEach((d, i) => {
    const p = byDate[d];
    if (!p) { if (cur.length > 1) seg.push(cur); cur = []; return; }
    cur.push(`${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`);
  });
  if (cur.length > 1) seg.push(cur);
  return seg.map(s => s.join(' '));
}

// กราฟเทียบสูตร: เส้นใช้จริง + เส้นพยากรณ์ + แรเงากรอบบน-ล่าง (สูงสุด 3 สูตร)
export function chartHtml(series, rows, picked) {
  if (!picked.length) return `<p class="ptab__none">${EQ_LAB_UI.chartEmpty}</p>`;
  const tail = series.slice(-24), dates = tail.map(s => s.date);
  const sel = picked.map(c => rows.find(r => r.code === c)).filter(Boolean);
  const maps = sel.map(r => { const m = {}; r.pts.forEach(p => { m[p.date] = p; }); return m; });
  const top = Math.max(...tail.map(s => s.used), ...maps.flatMap(m => dates.map(d => (m[d] ? m[d].hi : 0)))) * 1.08 || 1;
  const W = 340, H = 180, L = 30, B = 22, T = 8;
  const x = i => L + (dates.length > 1 ? (W - L - 6) * i / (dates.length - 1) : 0);
  const y = v => T + (H - T - B) * (1 - Math.min(v, top) / top);
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => `<line x1="${L}" x2="${W - 6}" y1="${y(top * f).toFixed(1)}" y2="${y(top * f).toFixed(1)}" stroke="#E6E2D8"/>
    <text x="${L - 4}" y="${(y(top * f) + 3).toFixed(1)}" text-anchor="end" font-size="8" fill="#8A8172">${Math.round(top * f)}</text>`).join('');
  const bands = sel.map((r, k) => {
    const m = maps[k];
    const up = dates.map((d, i) => (m[d] ? `${x(i).toFixed(1)},${y(m[d].hi).toFixed(1)}` : null)).filter(Boolean);
    const dn = dates.map((d, i) => (m[d] ? `${x(i).toFixed(1)},${y(m[d].lo).toFixed(1)}` : null)).filter(Boolean).reverse();
    return up.length > 1 ? `<polygon points="${up.concat(dn).join(' ')}" fill="${PICK_COLORS[k]}" opacity=".12"/>` : '';
  }).join('');
  const lines = sel.map((r, k) => runs(dates, maps[k], 'p', x, y)
    .map(p => `<polyline points="${p}" fill="none" stroke="${PICK_COLORS[k]}" stroke-width="1.8" stroke-dasharray="4 3"/>`).join('')).join('');
  const actual = runs(dates, Object.fromEntries(tail.map(s => [s.date, { a: s.used }])), 'a', x, y)
    .map(p => `<polyline points="${p}" fill="none" stroke="#3D3468" stroke-width="2.2"/>`).join('');
  const xs = dates.map((d, i) => (i % 4 === 0 ? `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="7.5" fill="#8A8172">${dayShort(d)}</text>` : '')).join('');
  const legend = `<div class="eql-leg"><span><i style="background:#3D3468"></i>${EQ_LAB_UI.chartLegend}</span>${sel.map((r, k) => `<span><i style="background:${PICK_COLORS[k]}"></i>${r.code}</span>`).join('')}</div>`;
  return `<section class="eql-card">${legend}
    <svg class="eql-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟเทียบสูตรกับใช้จริง">${grid}${bands}${lines}${actual}${xs}</svg>
    <p class="asm__note">${EQ_LAB_UI.chartHint}</p></section>`;
}

// ปุ่มลงมือ 2 ปุ่ม
export const actionsHtml = () => `<div class="eql-acts">
  <button class="eql-btn eql-btn--main" type="button" data-set-live="1">${EQ_LAB_UI.btnLive}</button>
  <button class="eql-btn" type="button" data-save-trial="1">${EQ_LAB_UI.btnSave}</button></div>`;
