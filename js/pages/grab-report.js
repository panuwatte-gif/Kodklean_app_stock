// หน้ารายงานผู้บริหาร Grab — แท็บร้าน (รวมทุกร้าน + รายร้าน) · ช่วงทั้งหน้า 7/30/90/180 วัน/เลือกเอง · ทุกการ์ดเลือกช่วงวันที่ของตัวเองได้ (เทียบช่วงก่อนหน้าที่ยาวเท่ากัน)
import { GRAB_UI } from '../shared/config.js';
import { getGrabReport, getGrabLastDay, getIncomeBrands, getGrabBaskets, getGrabYear, getTaxSettings } from '../shared/data.js';
import { buildGrabReport, periodRange } from '../shared/grab-model.js';
import { basketOf } from '../shared/grab-mix.js';
import { grabFrame, shopTabsHtml } from './grab.js';
import { workNoteHtml } from '../shared/work-ui.js';
import { secHtml, kpiHtml, moneyHtml, weekHtml, heatHtml } from './grab-report-view.js';
import { ratioHtml, menuHtml, adsHtml, qualityHtml } from './grab-report-more.js';
import { salesChartHtml, shopChartHtml, weekBarsHtml, ordersChartHtml, moneyTrendHtml, adsChartHtml, menuTrendHtml, ratingChartHtml } from './grab-report-charts.js';
import { distHtml, basketHtml, priceHtml } from './grab-report-mix.js';
import { taxHtml, bindTax } from './grab-report-tax.js';
import { rangeOf, rangeText, barHtml, pickRange } from './grab-report-range.js';
import { fillText, dayShort } from '../shared/format.js';

const R = GRAB_UI.rep, C = R.charts, X = R.mix;
// การ์ดทั้งหมดตามลำดับบนจอ: [id, หัวข้อ (ใช้ตอนช่วงที่เลือกไม่มีข้อมูล), วาดการ์ด(r, ctx)] · tax = ภาษีทั้งปี ไม่มีตัวเลือกช่วง
const CARDS = [
  ['kpi', R.kpi.title, r => kpiHtml(r)], ['sales', C.sales, salesChartHtml], ['shops', C.shops, (r, x) => (x.isAll ? shopChartHtml(r) : '')],
  ['weeks', C.weeks, (r, x) => weekBarsHtml(r, x.isAll)], ['orders', C.orders, ordersChartHtml],
  ['dist', X.distTitle, distHtml], ['basket', X.basketTitle, null], ['price', X.priceTitle, priceHtml],
  ['money', R.money.title, moneyHtml], ['moneyTrend', C.money, moneyTrendHtml], ['tax', '', null],
  ['ratio', R.ratio.title, ratioHtml], ['week', R.week.title, weekHtml], ['heat', R.heat.title, heatHtml],
  ['menu', R.menu.title, menuHtml], ['menuTrend', C.menu, menuTrendHtml], ['ads', R.ads.title, adsHtml], ['adsChart', C.ads, adsChartHtml],
  ['rating', C.rating, ratingChartHtml], ['quality', R.quality.title, qualityHtml]
];

// ติดตั้งหน้ารายงาน
export function mountGrabReportPage(root, onGo) {
  const el = s => root.querySelector(s);
  const hero = grabFrame(root, R, GRAB_UI.backHub);
  let n = 30, custom = null, shop = 'all', shops = [], mine = 0;
  const ends = {}, baskets = {}, built = new Map(), own = {}, tax = { shops: [], year: [], settings: [], end: null };
  const tabs = () => `<div class="grtabs" role="tablist" style="--n:${R.periods.length + 1}">${R.periods.concat([{ n: 'custom', label: R.pick.custom }]).map(p => `<button type="button" role="tab" data-n="${p.n}" aria-selected="${p.n === n}" class="${p.n === n ? 'is-on' : ''}">${p.label}</button>`).join('')}</div>`;
  el('#w-body').innerHTML = hero + `<div id="gr-shops"></div><div id="gr-tabs">${tabs()}</div><div id="gr-rep" class="grbody"><p class="wempty">${GRAB_UI.loading}</p></div>`;
  const empty = () => `<p class="wempty">${R.empty}<em>${R.emptyHint}</em></p>`;
  const fail = () => `<p class="wempty">${GRAB_UI.loadError}<em><button class="atbtn" type="button" data-reload="1">${GRAB_UI.retry}</button></em></p>`;
  const ctx = () => { const isAll = shop === 'all', inTab = isAll ? shops : shops.filter(s => s.id === shop); return { isAll, inTab, ids: inTab.map(s => s.id), end: ends[shop] }; };
  const baseRange = end => (n === 'custom' && custom ? custom : rangeOf('p:' + n, end));
  bindTax(root, tax);

  // รายงานของช่วงหนึ่ง (จำไว้ ไม่โหลดซ้ำ)
  const reportOf = async (x, range) => {
    const key = `${shop}|${range.from}|${range.to}`;
    if (!built.has(key)) {
      const p = periodRange(range.from, range.to);
      built.set(key, getGrabReport(x.ids, p.pf, p.from, p.to).then(b => { const r = buildGrabReport(b, p, x.inTab, X); if (!x.isAll) r.cur.share = null; return r; }));
      built.get(key).catch(() => built.delete(key));
    }
    return built.get(key);
  };

  // วาดการ์ดเดียว (ใส่ปุ่มช่วงวันที่ใต้หัวการ์ด · ช่วงที่ตั้งเองแล้วไม่มีข้อมูล = การ์ดว่างพร้อมปุ่ม ให้เปลี่ยนกลับได้)
  const cardHtml = async (x, [id, title, fn]) => {
    if (id === 'tax') return taxHtml(tax);
    const mineR = own[id], range = mineR || baseRange(x.end);
    let html;
    if (id === 'basket') {
      const rows = baskets[shop] || [];
      html = basketHtml(basketOf(mineR ? rows.filter(o => o.order_date >= range.from && o.order_date <= range.to) : rows, X.cats, X.billBands));
    } else html = fn(await reportOf(x, range), x);
    const bar = barHtml(id, range, !!mineR, id === 'basket' && !mineR ? R.pick.allBills : '');
    if (!html) return mineR ? `<div data-card="${id}">${secHtml(title, '', bar + `<p class="wempty">${R.noData}</p>`)}</div>` : '';
    return `<div class="grcard" data-card="${id}">${html.replace('</h2>', '</h2>' + bar)}</div>`;
  };

  // โหลดข้อมูลร้าน/ช่วงที่เลือกแล้ววาดรายงานทั้งหน้า
  const load = async () => {
    const t = ++mine;
    el('#gr-shops').innerHTML = shopTabsHtml(shops, shop, true);
    el('#gr-tabs').innerHTML = tabs();
    el('#gr-rep').innerHTML = `<p class="wempty">${GRAB_UI.loading}</p>`;
    try {
      if (!(shop in ends)) ends[shop] = await getGrabLastDay(ctx().ids, true);
      const x = ctx();
      if (t !== mine) return;
      if (!x.end) { el('#gr-rep').innerHTML = empty(); return; }
      if (!(shop in baskets)) baskets[shop] = await getGrabBaskets(x.ids).catch(() => []);
      const base = baseRange(x.end), [first, year, settings] = await Promise.all([reportOf(x, base), getGrabYear(x.ids, x.end), getTaxSettings()]);
      if (t !== mine) return;
      if (!first.cur.has && !first.cur.hasTxn) { el('#gr-rep').innerHTML = empty(); return; }
      Object.assign(tax, { shops: x.inTab, year, settings, end: x.end });
      const cards = await Promise.all(CARDS.map(c => cardHtml(x, c)));
      if (t !== mine) return;
      const p = periodRange(base.from, base.to);
      el('#gr-rep').innerHTML = `<p class="grsub grsub--range">${fillText(R.range, { a: dayShort(p.from), b: dayShort(p.to), c: dayShort(p.pf), d: dayShort(p.pt) })}</p>` + cards.join('') + workNoteHtml(R.note);
    } catch {
      if (t === mine) el('#gr-rep').innerHTML = fail();
    }
  };

  // เปลี่ยนช่วงของการ์ดเดียว แล้ววาดใหม่เฉพาะการ์ดนั้น
  const pickCard = async id => {
    const x = ctx(), card = CARDS.find(c => c[0] === id);
    const got = await pickRange({ title: card[1], r: own[id] || baseRange(x.end), end: x.end, card: true });
    if (!got) return;
    if (got === 'reset') delete own[id]; else own[id] = got;
    const box = el(`[data-card="${id}"]`);
    if (box) box.style.opacity = '.5';
    try { const html = await cardHtml(x, card); if (box) box.outerHTML = html || `<div data-card="${id}"></div>`; }
    catch { if (box) box.style.opacity = ''; }
  };

  getIncomeBrands().then(b => { shops = b; load(); }).catch(() => { el('#gr-rep').innerHTML = fail(); });

  root.addEventListener('click', async event => {
    const hit = s => event.target.closest(s);
    if (hit('[data-back]')) return onGo('grab');
    if (hit('[data-reload]')) return shops.length ? load() : onGo('grab-report');
    if (hit('[data-shop]')) { shop = hit('[data-shop]').dataset.shop; return load(); }
    if (hit('[data-range]')) return pickCard(hit('[data-range]').dataset.range);
    if (hit('[data-n]')) {
      const v = hit('[data-n]').dataset.n;
      if (v !== 'custom') { n = Number(v); return load(); }
      const end = ends[shop];
      if (!end) return;
      const got = await pickRange({ title: '', r: baseRange(end), end, card: false });
      if (got && got !== 'reset') { custom = got; n = 'custom'; load(); }
    }
  });
}
