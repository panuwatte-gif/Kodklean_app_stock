// คำนวณรายงานผู้บริหาร Grab จากข้อมูลดิบ (ยอด เงินเข้า อัตราส่วน เมนู โฆษณา คุณภาพ) — ใช้เฉพาะหน้ารายงาน
// มาตรฐานเดียว: ยอดขาย = ยอดขายสุทธิ = ยอด − ส่วนลดร้าน − ส่วนลดค่าส่งที่ร้านออก ± เงินคืน/หักจากเคลม (ไฟล์ Transaction · วันที่ไม่มีใช้ยอดสุทธิจากไฟล์ Sales) ห้ามใช้ยอดก่อนลด
import { shiftIso } from './format.js';
import { seriesOf } from './grab-trend.js';
import { billDist, priceTiers } from './grab-mix.js';

const N = v => Number(v) || 0;
const sumBy = (a, f) => a.reduce((s, x) => s + N(f(x)), 0);
const div = (a, b) => (b ? a / b : null);
const dowOf = iso => new Date(iso + 'T00:00:00').getDay();

// ช่วงรายงาน n วันที่จบที่ end + ช่วงก่อนหน้ายาวเท่ากัน
export function periodOf(end, n) {
  const from = shiftIso(end, -(n - 1)), pt = shiftIso(from, -1);
  return { from, to: end, pf: shiftIso(pt, -(n - 1)), pt, n };
}

// ช่วงรายงานจากวันที่เริ่ม–จบที่เลือกเอง + ช่วงก่อนหน้ายาวเท่ากัน
export function periodRange(from, to) {
  const n = daysOf(from, to).length, pt = shiftIso(from, -1);
  return { from, to, pf: shiftIso(pt, -(n - 1)), pt, n };
}

// รายชื่อวันที่ตั้งแต่ a ถึง b
export function daysOf(a, b) { const o = []; for (let d = a; d <= b; d = shiftIso(d, 1)) o.push(d); return o; }

const TXN_SUM = ['orders', 'cancelled', 'cash_orders', 'gross', 'discount', 'net_sales', 'claim', 'sales', 'commission', 'order_payout', 'ads_paid', 'adjust', 'total_payout'];
// รวมเงินรายวันของหลายร้านเป็นแถวเดียวต่อวัน (แท็บรวมทุกร้าน)
function mergeTxn(rows) {
  const m = {};
  rows.forEach(t => { const x = m[t.day] = m[t.day] || { day: t.day }; TXN_SUM.forEach(k => { x[k] = N(x[k]) + N(t[k]); }); });
  return Object.values(m);
}

// รวมข้อมูลเป็นรายวัน: net = ยอดขายสุทธิ · gross = ยอดก่อนลด (ใช้แค่หาอัตราส่วนแปลงยอดรายเมนูเป็นยอดสุทธิ) · shop = ยอดสุทธิแยกร้าน
function dailyOf(b) {
  const day = {}, at = d => (day[d] = day[d] || { d, gross: null, net: null, orders: null, rating: null, txn: null, ads: null, store: null, shop: {} });
  const sales = {};
  b.sales.forEach(s => { const a = sales[s.date] = sales[s.date] || { g: 0, n: 0, o: 0, rw: 0, ro: 0, shop: {} }; a.g += N(s.gross_sales); a.n += N(s.net_sales); a.o += N(s.orders); a.shop[s.shop] = N(a.shop[s.shop]) + N(s.net_sales); if (s.rating !== null && s.rating !== undefined) { a.rw += N(s.rating) * N(s.orders); a.ro += N(s.orders); } });
  Object.entries(sales).forEach(([d, a]) => { const x = at(d); x.gross = a.g; x.net = a.n; x.orders = a.o; x.rating = a.ro ? a.rw / a.ro : null; x.shop = { ...a.shop }; });
  b.txn.forEach(t => { if (N(t.orders) > 0) at(t.day).shop[t.shop] = N(t.sales); });
  mergeTxn(b.txn).forEach(t => { const x = at(t.day); x.txn = t; if (N(t.orders) > 0) { x.gross = N(t.gross); x.net = N(t.sales); x.orders = N(t.orders); } });
  const adsT = {}, adsC = {};
  b.ads.forEach(r => { const box = r.level === 'total' ? adsT : adsC, k = r.shop + '|' + r.date, a = box[k] = box[k] || { d: r.date, spend: 0, orders: 0, sales: 0, clicks: 0, impr: 0 }; a.spend += N(r.spend); a.orders += N(r.ad_orders); a.sales += N(r.ad_sales); a.clicks += N(r.clicks); a.impr += N(r.impressions); });
  new Set([...Object.keys(adsT), ...Object.keys(adsC)]).forEach(k => {
    const src = adsT[k] || adsC[k], x = at(src.d), a = x.ads = x.ads || { spend: 0, orders: 0, sales: 0, clicks: 0, impr: 0 };
    ['spend', 'orders', 'sales', 'clicks', 'impr'].forEach(f => { a[f] += src[f]; });
  });
  b.store.forEach(s => { if (N(s.sales) > 0 && day[s.day]) day[s.day].store = N(s.sales); });
  return day;
}

// สรุปตัวเลขของช่วงหนึ่ง (ไม่มีข้อมูลเลย = has false)
function summary(day, b, a, z) {
  const ds = daysOf(a, z).map(d => day[d]).filter(Boolean), sales = ds.filter(x => x.orders !== null);
  const tx = ds.filter(x => x.txn).map(x => x.txn), ad = ds.filter(x => x.ads).map(x => x.ads), both = ds.filter(x => x.store && x.net);
  const rated = sales.filter(x => x.rating !== null), iss = b.issueOrd.filter(r => r.date >= a && r.date <= z);
  const s = {
    has: sales.length > 0, net: sumBy(sales, x => x.net), gross: sumBy(sales, x => x.gross), orders: sumBy(sales, x => x.orders), open: sales.filter(x => x.orders > 0).length,
    rating: rated.length ? sumBy(rated, x => x.rating * x.orders) / sumBy(rated, x => x.orders) : null,
    hasTxn: tx.length > 0, tSales: sumBy(tx, t => t.sales), claim: sumBy(tx, t => t.claim), commission: sumBy(tx, t => t.commission),
    adsPaid: sumBy(tx, t => t.ads_paid), payout: sumBy(tx, t => t.total_payout), tOrders: sumBy(tx, t => t.orders), cancelled: sumBy(tx, t => t.cancelled), cash: sumBy(tx, t => t.cash_orders),
    hasAds: ad.length > 0, spend: sumBy(ad, x => x.spend), adOrders: sumBy(ad, x => x.orders), adSales: sumBy(ad, x => x.sales), clicks: sumBy(ad, x => x.clicks), impr: sumBy(ad, x => x.impr),
    issues: iss.length, missing: iss.filter(r => /Missing/.test(r.disposition)).length, wrong: iss.filter(r => /Wrong/.test(r.disposition)).length,
    share: both.length ? div(sumBy(both, x => x.net), sumBy(both, x => x.store)) : null
  };
  s.other = s.payout - s.tSales - s.commission - s.adsPaid;
  s.ticket = div(s.net, s.orders); s.perDay = div(s.net, s.open); s.toNet = div(s.net, s.gross) || 1;
  s.ratio = {
    keep: s.hasTxn ? div(s.payout, s.tSales) : null, comm: s.hasTxn ? div(-s.commission, s.tSales) : null,
    acos: s.hasAds ? div(s.spend, s.net) : null, roas: s.hasAds ? div(s.adSales, s.spend) : null, cpo: s.hasAds ? div(s.spend, s.adOrders) : null,
    adShare: s.hasAds ? div(s.adOrders, s.orders) : null, ctr: s.hasAds ? div(s.clicks, s.impr) : null, cvr: s.hasAds ? div(s.adOrders, s.clicks) : null,
    cancel: s.hasTxn ? div(s.cancelled, s.tOrders + s.cancelled) : null, cash: s.hasTxn ? div(s.cash, s.tOrders) : null,
    issue: b.issueOrd.length ? div(s.issues * 1000, s.orders) : null
  };
  return s;
}

// รวมยอดรายเมนูของช่วงหนึ่ง (แปลงเป็นยอดสุทธิด้วยอัตราส่วนสุทธิ÷ก่อนลดของช่วงนั้น)
function menuOf(rows, a, z, k) {
  const m = {};
  rows.forEach(r => { if (r.date < a || r.date > z) return; const x = m[r.item] = m[r.item] || { item: r.item, units: 0, sales: 0 }; x.units += N(r.units); x.sales += N(r.gross_sales) * k; });
  return m;
}

// สร้างรายงานทั้งชุดของช่วง p (จาก periodOf) · shops = ร้านในแท็บนี้ · T = ค่าตั้ง (ขั้นบิล/ขั้นราคา)
export function buildGrabReport(b, p, shops, T) {
  const day = dailyOf(b), cur = summary(day, b, p.from, p.to), prev = summary(day, b, p.pf, p.pt);
  const list = daysOf(p.from, p.to).map(d => day[d] || { d, shop: {} });
  const week = Array.from({ length: 7 }, (_, w) => { const xs = list.filter(x => x.orders > 0 && dowOf(x.d) === w); return xs.length ? sumBy(xs, x => x.net) / xs.length : null; });
  const heat = {}, heatDays = {};
  b.peak.forEach(r => { const w = dowOf(r.date); heat[w + ':' + r.hour] = N(heat[w + ':' + r.hour]) + N(r.orders); (heatDays[w] = heatDays[w] || new Set()).add(r.date); });
  const hrs = b.peak.filter(r => N(r.orders) > 0).map(r => N(r.hour));
  const heatMap = { h0: hrs.length ? Math.min(...hrs) : 9, h1: hrs.length ? Math.max(...hrs) : 20, at: (w, h) => (heatDays[w] ? N(heat[w + ':' + h]) / heatDays[w].size : null) };
  const mc = menuOf(b.menu, p.from, p.to, cur.toNet), mp = menuOf(b.menu, p.pf, p.pt, prev.toNet);
  const menus = Object.values(mc).sort((x, y) => y.sales - x.sales), mTotal = sumBy(menus, x => x.sales);
  let acc = 0, pareto = 0;
  for (const m of menus) { if (acc >= mTotal * 0.8) break; acc += m.sales; pareto++; }
  const moves = Object.keys(mp).length ? [...new Set([...Object.keys(mc), ...Object.keys(mp)])].map(k => ({ item: k, diff: N((mc[k] || {}).sales) - N((mp[k] || {}).sales) })) : [];
  const camp = {};
  b.ads.filter(r => r.level === 'campaign' && r.date >= p.from).forEach(r => { const x = camp[r.campaign] = camp[r.campaign] || { name: r.campaign, spend: 0, orders: 0, sales: 0 }; x.spend += N(r.spend); x.orders += N(r.ad_orders); x.sales += N(r.ad_sales); });
  const kw = {};
  b.kw.forEach(r => { const x = kw[r.keyword] = kw[r.keyword] || { name: r.keyword, clicks: 0, orders: 0, spend: 0 }; x.clicks += N(r.clicks); x.orders += N(r.ad_orders); x.spend += N(r.spend); });
  const kws = Object.values(kw), itemIss = {}, hourIss = {};
  b.issue.forEach(r => { itemIss[r.item_name] = N(itemIss[r.item_name]) + N(r.total); });
  b.issueOrd.filter(r => r.date >= p.from).forEach(r => { hourIss[r.hour] = N(hourIss[r.hour]) + 1; });
  return {
    p, cur, prev, week, heat: heatMap, series: seriesOf(list, b, p, shops, cur.toNet),
    dist: billDist(b.bills, T.billBands), price: priceTiers(Object.values(mc), T.priceBands),
    menu: { rows: menus, total: mTotal, pareto, up: moves.filter(m => m.diff > 0).sort((x, y) => y.diff - x.diff).slice(0, 3), down: moves.filter(m => m.diff < 0).sort((x, y) => x.diff - y.diff).slice(0, 3) },
    ads: { camps: Object.values(camp).sort((x, y) => y.spend - x.spend), best: kws.filter(k => k.orders > 0).sort((x, y) => y.orders - x.orders || x.spend - y.spend).slice(0, 5), waste: kws.filter(k => !k.orders && k.spend > 0).sort((x, y) => y.spend - x.spend).slice(0, 5), kwLast: b.kw.length ? b.kw.map(r => r.date).sort().pop() : null },
    quality: { items: Object.entries(itemIss).sort((x, y) => y[1] - x[1]).slice(0, 5), hours: Object.entries(hourIss).sort((x, y) => y[1] - x[1]).slice(0, 4) },
    transfers: { sum: sumBy(b.transfers, t => t.amount), n: b.transfers.length }
  };
}
