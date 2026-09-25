// ชิ้นส่วนหน้ารายงานผู้บริหาร Grab ชุดที่ 1: ตัวเลขหลัก · เงินไปไหน · วันขายดี · ชั่วโมงขายดี (กราฟแนวโน้มอยู่ grab-report-charts.js)
import { GRAB_UI } from '../shared/config.js';
import { niceTicks, axisBarChart } from '../shared/ui.js';
import { fillText, money, pct1 } from '../shared/format.js';

const R = GRAB_UI.rep;

// การ์ดหัวข้อของรายงาน
export const secHtml = (title, sub, body) => `<section class="wcard grsec"><h2 class="grh">${title}</h2>${sub ? `<p class="grsub">${sub}</p>` : ''}${body}</section>`;

// ป้ายเปลี่ยนแปลงเทียบช่วงก่อน (goodUp: true = ขึ้นดี, false = ลงดี, null = ไม่ตัดสิน)
export function deltaHtml(cur, prev, goodUp = true) {
  if (cur === null || prev === null || prev === undefined || !isFinite(cur) || !isFinite(prev) || !prev) return '';
  const ch = (cur - prev) / Math.abs(prev) * 100, up = ch >= 0;
  const tone = goodUp === null || Math.abs(ch) < 0.5 ? '' : up === goodUp ? ' is-good' : ' is-bad';
  return `<em class="grd${tone}">${up ? '▲' : '▼'} ${Math.abs(ch).toFixed(Math.abs(ch) < 10 ? 1 : 0)}%</em>`;
}

// ตัวเลขหลัก 8 ช่อง
export function kpiHtml(r) {
  const c = r.cur, p = r.prev.has ? r.prev : null, pv = k => (p ? p[k] : null);
  const cell = (label, k, goodUp = true, fmt = money) => `<div class="grkpi__cell"><em>${label}</em><b>${c[k] === null ? '-' : fmt(c[k])}</b>
    <span>${deltaHtml(c[k], pv(k), goodUp)}${p && pv(k) !== null ? `<i>${fillText(R.kpi.vs, { v: fmt(pv(k)) })}</i>` : ''}</span></div>`;
  const rate = v => (Math.round(v * 100) / 100).toFixed(2);
  return secHtml(R.kpi.title, '', `<div class="grkpi">
    ${cell(R.kpi.net, 'net')}
    ${c.hasTxn ? cell(R.kpi.payout, 'payout') : ''}${cell(R.kpi.orders, 'orders')}
    ${cell(R.kpi.ticket, 'ticket')}${cell(R.kpi.perDay, 'perDay')}
    ${c.rating !== null ? cell(R.kpi.rating, 'rating', true, rate) : ''}${c.share !== null ? cell(R.kpi.share, 'share', null, v => pct1(v * 100)) : ''}
  </div>`);
}

// เงินไปไหนบ้าง: ยอดขายสุทธิ → หักค่าคอม โฆษณา ภาษี/ปรับอื่นๆ → เงินเข้าจริง
export function moneyHtml(r) {
  const c = r.cur, M = R.money;
  if (!c.hasTxn) return secHtml(M.title, M.sub, `<p class="wempty">${R.noData}</p>`);
  const base = c.tSales || 1;
  const row = (label, v, kind) => `<div class="grwf__row grwf__row--${kind}"><span>${label}</span>
    <i class="grwf__bar"><i style="width:${Math.min(100, Math.abs(v) / base * 100).toFixed(1)}%"></i></i>
    <b>${money(v)}</b><em>${pct1(v / base * 100)}</em></div>`;
  return secHtml(M.title, M.sub, `<div class="grwf">
    ${row(M.net, c.tSales, 'base')}${row(M.comm, c.commission, 'cut')}${row(M.ads, c.adsPaid, 'cut')}
    ${Math.abs(c.other) >= 1 ? row(M.other, c.other, c.other > 0 ? 'add' : 'cut') : ''}${row(M.payout, c.payout, 'end')}
  </div><p class="grkeep">${fillText(M.keep, { p: pct1(c.payout / base * 100) })}</p>
  ${c.claim ? `<p class="grsub">${fillText(M.claim, { v: money(c.claim) })}</p>` : ''}
  ${r.transfers.n ? `<p class="grsub">${fillText(M.transfer, { v: money(r.transfers.sum), n: r.transfers.n })}</p>` : ''}`);
}

// ยอดขายเฉลี่ยตามวันในสัปดาห์ (เรียง จ → อา)
export function weekHtml(r) {
  const order = [1, 2, 3, 4, 5, 6, 0], vals = order.map(w => (r.week[w] === null ? null : Math.round(r.week[w])));
  if (!vals.some(v => v !== null)) return '';
  const ticks = niceTicks(Math.max(...vals.filter(v => v !== null)));
  return secHtml(R.week.title, R.week.sub, axisBarChart({ labels: order.map(w => R.week.days[w]), series: [{ color: '#2FA36B', values: vals }], ticks, fmt: v => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v)), h: 120, missingText: '-' }));
}

// ตารางความร้อน วัน × ชั่วโมง + ช่วงพีค
export function heatHtml(r) {
  const H = r.heat, order = [1, 2, 3, 4, 5, 6, 0], hours = [];
  for (let h = H.h0; h <= H.h1; h++) hours.push(h);
  const all = order.flatMap(w => hours.map(h => H.at(w, h))).filter(v => v !== null);
  if (!all.length || !Math.max(...all)) return '';
  const max = Math.max(...all);
  let best = { v: -1 };
  hours.forEach(h => { const vs = order.map(w => H.at(w, h)).filter(v => v !== null), v = vs.length ? vs.reduce((s, x) => s + x, 0) / vs.length : 0; if (v > best.v) best = { h, v }; });
  const cells = order.map(w => `<em>${R.week.days[w]}</em>${hours.map(h => { const v = H.at(w, h); return `<i style="--v:${v === null ? 0 : (v / max).toFixed(2)}" title="${R.week.days[w]} ${h}:00 · ${v === null ? '-' : v.toFixed(1)}"></i>`; }).join('')}`).join('');
  return secHtml(R.heat.title, R.heat.sub, `<div class="grheat" style="--cols:${hours.length}"><em></em>${hours.map(h => `<em>${h}</em>`).join('')}${cells}</div>
    <p class="grkeep">${fillText(R.heat.peak, { h: `${best.h}:00–${best.h + 1}:00`, n: best.v.toFixed(1) })}</p>`);
}
