// ชิ้นส่วนหน้ารายงานผู้บริหาร Grab ชุดที่ 3: กราฟแนวโน้ม — รายวัน = แท่ง + เส้นยอดสะสม (ดูความชัน) + เส้นประค่าเฉลี่ย · แกนรายวันข้ามวันหยุด
import { GRAB_UI } from '../shared/config.js';
import { niceTicks } from '../shared/ui.js';
import { trendOf, cumOf, meanOf } from '../shared/grab-trend.js';
import { secHtml } from './grab-report-view.js';
import { fillText, dayShort, escHtml } from '../shared/format.js';

const C = GRAB_UI.rep.charts;
const PAL = ['#1F9D55', '#E58B63', '#287DEB', '#D69B26', '#8E5BD6'];
const kfmt = v => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(Math.abs(v) >= 10000 ? 0 : 1) + 'k' : String(Math.round(v * 10) / 10));
const ok = v => v !== null && v !== undefined && isFinite(v);
const W = 340, TXT = 'font-size="9" fill="#5C7997"';

// แกน Y: เริ่ม 0 หรือพอดีข้อมูล (fit) เช่นเรตติ้ง 4.6–5
function ticksOf(vals, fit) {
  const max = Math.max(...vals), min = Math.min(...vals);
  if (!fit) return niceTicks(max);
  const step = niceTicks(Math.max(max - min, 0.01))[1], out = [];
  for (let t = Math.floor(min / step) * step; out.length < 8; t += step) { out.push(Math.round(t * 1000) / 1000); if (t >= max) break; }
  return out;
}
// ป้ายแกน X 4 จุด
const xIdx = n => [...new Set([0, Math.round((n - 1) / 3), Math.round((n - 1) * 2 / 3), n - 1])].filter(i => i >= 0);
const legendHtml = items => `<div class="ch__legend">${items.map(([name, css]) => `<span><i style="${css}"></i>${escHtml(name)}</span>`).join('')}</div>`;

// กราฟรายวัน: แท่ง = ค่ารายวัน (แกนซ้าย) · เส้นประ = ค่าเฉลี่ย · เส้นทึบ = ยอดสะสม (แกนขวา) — cum false = ไม่มีเส้นสะสม
export function comboSvg({ labels, values, color = '#2FA36B', cum = true, fmt = kfmt, fit = false, h = 170 }) {
  const vals = values.filter(ok);
  if (!vals.length) return `<p class="wempty">${GRAB_UI.rep.noData}</p>`;
  const n = labels.length, L = 32, R = cum ? 36 : 8, T = 12, B = 20, ticks = ticksOf(vals, fit), lo = ticks[0], top = ticks[ticks.length - 1] || 1;
  const cw = (W - L - R) / n, bw = Math.max(1, Math.min(14, cw * 0.72)), x = i => L + cw * i + cw / 2, y = v => T + (h - T - B) * (1 - (v - lo) / ((top - lo) || 1));
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke="#E3EAF0"/><text x="${L - 4}" y="${(y(t) + 3).toFixed(1)}" text-anchor="end" ${TXT}>${fmt(t)}</text>`).join('');
  const bars = values.map((v, i) => (ok(v) ? `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0.5, y(lo) - y(v)).toFixed(1)}" rx="${bw > 4 ? 2 : 0}" fill="${color}" fill-opacity=".55"><title>${dayShort(labels[i])} · ${fmt(v)}</title></rect>` : '')).join('');
  const avg = meanOf(values), avgEl = ok(avg) ? `<line x1="${L}" x2="${W - R}" y1="${y(avg).toFixed(1)}" y2="${y(avg).toFixed(1)}" stroke="#173A2B" stroke-width="1.3" stroke-dasharray="4 3"/><text x="${L + 2}" y="${(y(avg) - 3).toFixed(1)}" font-size="9" font-weight="700" fill="#173A2B">${C.avgIs} ${fmt(avg)}</text>` : '';
  let line = '', right = '';
  if (cum) {
    const cs = cumOf(values), ct = niceTicks(cs[cs.length - 1] || 1), cTop = ct[ct.length - 1] || 1, cy = v => T + (h - T - B) * (1 - v / cTop);
    right = ct.map(t => `<text x="${W - R + 4}" y="${(cy(t) + 3).toFixed(1)}" ${TXT}>${kfmt(t)}</text>`).join('');
    line = `<polyline points="${cs.map((v, i) => `${x(i).toFixed(1)},${cy(v).toFixed(1)}`).join(' ')}" fill="none" stroke="#0F5A30" stroke-width="2.2" stroke-linejoin="round"/>`;
  }
  const xs = xIdx(n).map(i => `<text x="${x(i).toFixed(1)}" y="${h - 5}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}" ${TXT}>${dayShort(labels[i])}</text>`).join('');
  const leg = [[C.day, `background:${color};opacity:.6`], [C.avg, 'background:none;border-top:2px dashed #173A2B;height:0;width:16px;border-radius:0']].concat(cum ? [[C.cum, 'background:#0F5A30;height:3px;width:16px']] : []);
  return legendHtml(leg) + `<svg class="grsvg" viewBox="0 0 ${W} ${h}" role="img" font-family="Sarabun, sans-serif">${grid}${bars}${avgEl}${line}${right}${xs}</svg>`;
}

// กราฟเส้นหลายเส้น (SVG) · series = [{ name, color, values }] · ป้ายค่าสุดท้ายท้ายเส้น
export function lineSvg({ labels, series, fmt = kfmt, h = 150, fit = false }) {
  const vals = series.flatMap(s => s.values.filter(ok));
  if (!vals.length) return `<p class="wempty">${GRAB_UI.rep.noData}</p>`;
  const ticks = ticksOf(vals, fit), lo = ticks[0], top = ticks[ticks.length - 1] || 1, n = labels.length, L = 32, R = 36, T = 10, B = 20;
  const x = i => L + (n > 1 ? (W - L - R) * i / (n - 1) : (W - L - R) / 2), y = v => T + (h - T - B) * (1 - (v - lo) / ((top - lo) || 1));
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke="#E3EAF0"/><text x="${L - 4}" y="${(y(t) + 3).toFixed(1)}" text-anchor="end" ${TXT}>${fmt(t)}</text>`).join('');
  const xs = xIdx(n).map(i => `<text x="${x(i).toFixed(1)}" y="${h - 5}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}" ${TXT}>${dayShort(labels[i])}</text>`).join('');
  const lines = series.map(s => {
    const pts = s.values.map((v, i) => (ok(v) ? `${x(i).toFixed(1)},${y(v).toFixed(1)}` : null)).filter(Boolean);
    const li = s.values.map((v, i) => (ok(v) ? i : -1)).filter(i => i >= 0).pop();
    const dots = n <= 16 ? s.values.map((v, i) => (ok(v) ? `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.4" fill="${s.color}"/>` : '')).join('') : '';
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="${s.color}" stroke-width="${s.w || 2.2}" stroke-linejoin="round" stroke-linecap="round"/>${dots}`
      + (li !== undefined ? `<text x="${(x(li) + 4).toFixed(1)}" y="${(y(s.values[li]) + 3).toFixed(1)}" font-size="9.5" font-weight="700" fill="${s.color}">${fmt(s.values[li])}</text>` : '');
  }).join('');
  const named = series.filter(s => s.name);
  return (named.length ? legendHtml(named.map(s => [s.name, `background:${s.color}`])) : '') + `<svg class="grsvg" viewBox="0 0 ${W} ${h}" role="img" font-family="Sarabun, sans-serif">${grid}${lines}${xs}</svg>`;
}

// กราฟแท่งซ้อนรายสัปดาห์ · ป้ายบนแท่ง = เปลี่ยนกี่ % จากสัปดาห์ก่อน
function stackSvg({ labels, stacks, fmt = kfmt, h = 160 }) {
  const n = labels.length, tot = labels.map((_, i) => stacks.reduce((s, k) => s + (ok(k.values[i]) ? k.values[i] : 0), 0));
  if (!Math.max(...tot)) return `<p class="wempty">${GRAB_UI.rep.noData}</p>`;
  const ticks = niceTicks(Math.max(...tot)), top = ticks[ticks.length - 1] || 1, L = 32, R = 6, T = 16, B = 20, cw = (W - L - R) / n, bw = Math.min(26, cw * 0.66), y = v => T + (h - T - B) * (1 - v / top);
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke="#E3EAF0"/><text x="${L - 4}" y="${(y(t) + 3).toFixed(1)}" text-anchor="end" ${TXT}>${fmt(t)}</text>`).join('');
  const every = Math.ceil(n / 6);
  const bars = labels.map((l, i) => {
    const cx = L + cw * i + cw / 2;
    let acc = 0;
    const rects = stacks.map(k => { const v = ok(k.values[i]) ? k.values[i] : 0; if (!v) return ''; const r = `<rect x="${(cx - bw / 2).toFixed(1)}" y="${y(acc + v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(acc) - y(acc + v)).toFixed(1)}" fill="${k.color}" rx="2"/>`; acc += v; return r; }).join('');
    const ch = i && tot[i - 1] && tot[i] ? (tot[i] - tot[i - 1]) / tot[i - 1] * 100 : null;
    const tag = ch === null ? '' : `<text x="${cx.toFixed(1)}" y="${(y(tot[i]) - 3).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="700" fill="${ch >= 0 ? '#17683A' : '#B03A1E'}">${ch >= 0 ? '+' : ''}${ch.toFixed(0)}%</text>`;
    return rects + tag + (i % every === 0 || i === n - 1 ? `<text x="${cx.toFixed(1)}" y="${h - 5}" text-anchor="middle" ${TXT}>${dayShort(l)}</text>` : '');
  }).join('');
  return (stacks.length > 1 ? legendHtml(stacks.map(k => [k.name, `background:${k.color}`])) : '') + `<svg class="grsvg" viewBox="0 0 ${W} ${h}" role="img" font-family="Sarabun, sans-serif">${grid}${bars}</svg>`;
}

// ป้ายแนวโน้ม: ขึ้น/ลงกี่ % ต่อสัปดาห์ (goodUp: ขึ้นดีหรือลงดี)
export function trendChip(values, goodUp = true, perStep = 6) {
  const t = trendOf(values, perStep);
  if (!t) return '';
  const flat = Math.abs(t.pct) < 1, up = t.pct > 0, tone = flat ? '' : up === goodUp ? ' is-good' : ' is-bad';
  return `<p class="grtrend${tone}">${flat ? C.flat : fillText(up ? C.up : C.down, { p: Math.abs(t.pct).toFixed(1) })}</p>`;
}

const wk = r => r.series.weeks.filter(w => w.open > 0);

// ยอดขายสุทธิรายวัน
export function salesChartHtml(r) {
  const s = r.series;
  return secHtml(C.sales, C.dailySub, trendChip(s.sales, true, s.perWeek) + comboSvg({ labels: s.labels, values: s.sales }));
}

// ยอดสะสมแต่ละร้าน (แท็บรวม) — เส้นชันกว่า = ร้านโตเร็วกว่า
export function shopChartHtml(r) {
  const s = r.series, shops = s.byShop.filter(x => x.daily.some(v => v));
  if (!shops.length) return '';
  const all = shops.reduce((t, x) => t + x.daily.reduce((a, v) => a + (v || 0), 0), 0);
  const chips = shops.map(x => { const sum = x.daily.reduce((a, v) => a + (v || 0), 0), t = trendOf(x.daily, s.perWeek); return `<span class="grshopt"><i style="background:${x.color}"></i>${escHtml(x.name)} ${Math.round(sum / all * 100)}%<b class="${t && Math.abs(t.pct) >= 1 ? (t.pct > 0 ? 'is-good' : 'is-bad') : ''}">${t ? (t.pct > 0 ? '▲' : '▼') + Math.abs(t.pct).toFixed(1) + '%' : ''}</b></span>`; }).join('');
  return secHtml(C.shops, C.shopsSub, `<div class="grshopts">${chips}</div>` + lineSvg({ labels: s.labels, series: shops.map(x => ({ name: x.name, color: x.color, values: cumOf(x.daily) })) }));
}

// ยอดขายสุทธิเฉลี่ยต่อวัน รายสัปดาห์ (แท็บรวม = ซ้อนตามร้าน)
export function weekBarsHtml(r, isAll) {
  const w = wk(r);
  if (w.length < 3) return '';
  const stacks = isAll ? r.series.byShop.map(s => ({ name: s.name, color: s.color, values: w.map(x => x.shop[s.id]) })).filter(k => k.values.some(v => v)) : [{ name: C.sales, color: '#2FA36B', values: w.map(x => x.sales) }];
  return secHtml(C.weeks, C.weeksSub, trendChip(w.map(x => x.sales), true, 1) + stackSvg({ labels: w.map(x => x.start), stacks }));
}

// ออเดอร์ต่อวัน + บิลเฉลี่ยรายวัน
export function ordersChartHtml(r) {
  const s = r.series;
  return secHtml(C.orders, C.dailySub, trendChip(s.orders, true, s.perWeek) + comboSvg({ labels: s.labels, values: s.orders, color: '#287DEB', fmt: v => String(Math.round(v)) }))
    + secHtml(C.ticket, C.ticketSub, trendChip(s.ticket, true, s.perWeek) + comboSvg({ labels: s.labels, values: s.ticket, color: '#D69B26', cum: false, fit: true, fmt: v => '฿' + Math.round(v) }));
}

// สัดส่วนเงินรายสัปดาห์ต่อยอดขายสุทธิ: เงินเข้าจริง · ค่าคอม
export function moneyTrendHtml(r) {
  const w = wk(r).filter(x => ok(x.keep));
  if (w.length < 3) return '';
  return secHtml(C.money, C.moneySub, lineSvg({ labels: w.map(x => x.start), fmt: v => Math.round(v * 100) + '%', fit: true,
    series: [{ name: C.keep, color: '#1F9D55', values: w.map(x => x.keep), w: 2.6 }, { name: C.comm, color: '#E58B63', values: w.map(x => x.comm) }] }));
}

// โฆษณา: ค่าโฆษณาสะสม vs ยอดจากโฆษณาสะสม + ROAS รายสัปดาห์
export function adsChartHtml(r) {
  const s = r.series, w = wk(r).filter(x => ok(x.roas));
  if (!s.spend.length) return '';
  return secHtml(C.ads, C.adsSub, lineSvg({ labels: s.adLabels, series: [{ name: C.adSales, color: '#1F9D55', values: cumOf(s.adSales) }, { name: C.spend, color: '#E58B63', values: cumOf(s.spend) }] }))
    + (w.length >= 3 ? secHtml(C.roas, C.roasSub, trendChip(w.map(x => x.roas), true, 1) + lineSvg({ labels: w.map(x => x.start), series: [{ color: '#287DEB', values: w.map(x => x.roas) }], fit: true, fmt: v => v.toFixed(1) + '×' })) : '');
}

// เมนูขายดี 5 อันดับ ขายกี่ชิ้นต่อวัน รายสัปดาห์
export function menuTrendHtml(r) {
  const w = wk(r), top = r.series.menuTop;
  if (w.length < 3 || !top.length) return '';
  return secHtml(C.menu, C.menuSub, lineSvg({ labels: w.map(x => x.start), fmt: v => String(Math.round(v)), h: 170, series: top.map((m, i) => ({ name: m, color: PAL[i], values: w.map(x => x.menu[m]) })) }));
}

// เรตติ้งรายวัน
export function ratingChartHtml(r) {
  const s = r.series;
  if (s.rating.filter(ok).length < 3) return '';
  return secHtml(C.rating, '', comboSvg({ labels: s.labels, values: s.rating, color: '#D69B26', cum: false, fit: true, fmt: v => v.toFixed(2) }));
}
