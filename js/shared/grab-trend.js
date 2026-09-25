// ชุดตัวเลขสำหรับกราฟแนวโน้มของรายงานผู้บริหาร Grab (เรียกจาก grab-model.js) — แกนรายวันนับเฉพาะวันที่ขาย (ข้ามวันหยุด)
import { shiftIso } from './format.js';

const N = v => Number(v) || 0;
const div = (a, b) => (b ? a / b : null);
const dowOf = iso => new Date(iso + 'T00:00:00').getDay();

// ยอดสะสม (ค่า null นับเป็น 0)
export const cumOf = arr => { let s = 0; return arr.map(v => (s += N(v))); };

// ค่าเฉลี่ยของตัวเลขที่มีค่า (ไม่มีเลย = null)
export const meanOf = arr => { const v = arr.filter(x => x !== null && x !== undefined && isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };

// แนวโน้มจากเส้นตรงที่ลากผ่านทุกจุด (least squares) → เปลี่ยนกี่ % ต่อ perStep จุด เทียบค่าเฉลี่ย · น้อยกว่า 6 จุด = null
export function trendOf(values, perStep = 6) {
  const pts = values.map((v, i) => [i, v]).filter(([, v]) => v !== null && v !== undefined && isFinite(v));
  if (pts.length < 6) return null;
  const n = pts.length, mx = pts.reduce((s, [x]) => s + x, 0) / n, my = pts.reduce((s, [, y]) => s + y, 0) / n;
  let sxy = 0, sxx = 0;
  pts.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; });
  if (!sxx || !my) return null;
  return { pct: (sxy / sxx) * perStep / Math.abs(my) * 100, n };
}

const mondayOf = iso => shiftIso(iso, -((dowOf(iso) + 6) % 7));

// รวมเป็นรายสัปดาห์ (จันทร์–อาทิตย์) · ค่ายอด = เฉลี่ยต่อวันที่ขาย · สัดส่วนเงินคิดต่อยอดขายสุทธิ
function weeksOf(list, shops, menuTop, menuDay) {
  const map = new Map();
  list.forEach(x => {
    const k = mondayOf(x.d), w = map.get(k) || { start: k, open: 0, sales: 0, orders: 0, shop: {}, payout: 0, comm: 0, tSales: 0, spend: 0, adSales: 0, menu: {} };
    map.set(k, w);
    if (x.orders > 0) { w.open++; w.sales += N(x.net); w.orders += N(x.orders); shops.forEach(s => { w.shop[s.id] = N(w.shop[s.id]) + N(x.shop[s.id]); }); }
    if (x.txn) { w.payout += N(x.txn.total_payout); w.comm += -N(x.txn.commission); w.tSales += N(x.txn.sales); }
    if (x.ads) { w.spend += N(x.ads.spend); w.adSales += N(x.ads.sales); }
    menuTop.forEach(m => { w.menu[m] = N(w.menu[m]) + N((menuDay[x.d] || {})[m]); });
  });
  return [...map.values()].map(w => ({
    start: w.start, open: w.open, sales: div(w.sales, w.open),
    shop: Object.fromEntries(shops.map(s => [s.id, w.open ? N(w.shop[s.id]) / w.open : null])),
    keep: div(w.payout, w.tSales), comm: div(w.comm, w.tSales), roas: div(w.adSales, w.spend),
    menu: Object.fromEntries(menuTop.map(m => [m, w.open ? N(w.menu[m]) / w.open : null]))
  }));
}

// ชุดข้อมูลกราฟทั้งหมดของช่วงรายงาน (list = ทุกวันในช่วงจาก dailyOf · open = เฉพาะวันที่ขาย)
export function seriesOf(list, b, p, shops) {
  const open = list.filter(x => x.orders > 0), perWeek = list.length ? 7 * open.length / list.length : 6;
  const tot = {}, menuDay = {};
  b.menu.forEach(r => { if (r.date < p.from) return; tot[r.item] = N(tot[r.item]) + N(r.gross_sales); const d = menuDay[r.date] = menuDay[r.date] || {}; d[r.item] = N(d[r.item]) + N(r.units); });
  const menuTop = Object.entries(tot).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([k]) => k);
  const ads = open.filter(x => x.ads);
  return {
    labels: open.map(x => x.d), perWeek,
    sales: open.map(x => N(x.net)), orders: open.map(x => N(x.orders)), ticket: open.map(x => div(N(x.net), N(x.orders))),
    rating: open.map(x => (x.rating === null || x.rating === undefined ? null : x.rating)),
    byShop: shops.map(s => ({ ...s, daily: open.map(x => (x.shop[s.id] === undefined ? null : N(x.shop[s.id]))) })),
    adLabels: ads.map(x => x.d), spend: ads.map(x => N(x.ads.spend)), adSales: ads.map(x => N(x.ads.sales)),
    weeks: weeksOf(list, shops, menuTop, menuDay), menuTop
  };
}
