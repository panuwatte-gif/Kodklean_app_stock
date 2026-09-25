// ชิ้นส่วนหน้ารายงานผู้บริหาร Grab ชุดที่ 2: อัตราส่วน · เมนู · โฆษณา · คุณภาพออเดอร์
import { GRAB_UI } from '../shared/config.js';
import { secHtml, deltaHtml } from './grab-report-view.js';
import { fillText, money, moneyFine, pct1, dayShort, escHtml } from '../shared/format.js';

const R = GRAB_UI.rep;
const pc = v => pct1(v * 100);
// รูปแบบตัวเลขของแต่ละอัตราส่วน + ทิศที่ดี (true ขึ้นดี / false ลงดี / null ไม่ตัดสิน)
const RATIO_FMT = {
  keep: [pc, true], comm: [pc, false], acos: [pc, false], roas: [v => v.toFixed(1) + '×', true], cpo: [v => '฿' + moneyFine(v), false],
  adShare: [pc, null], ctr: [pc, true], cvr: [pc, true], cancel: [pc, false], cash: [pc, null], issue: [v => v.toFixed(1), false]
};

// ตารางอัตราส่วน
export function ratioHtml(r) {
  const rows = Object.entries(R.ratio.rows).filter(([k]) => r.cur.ratio[k] !== null && r.cur.ratio[k] !== undefined).map(([k, [name, hint]]) => {
    const [fmt, good] = RATIO_FMT[k], v = r.cur.ratio[k], p = r.prev.has ? r.prev.ratio[k] : null;
    return `<div class="grrat"><span><b>${name}</b><em>${hint}</em></span><span class="grrat__v"><b>${fmt(v)}</b>${deltaHtml(v, p, good)}</span></div>`;
  });
  return rows.length ? secHtml(R.ratio.title, R.ratio.sub, rows.join('')) : '';
}

// ตารางเมนูขายดี 10 อันดับ + ข้อสังเกต 80/20 + เมนูที่โต/ลดมากสุด
export function menuHtml(r) {
  const M = R.menu, m = r.menu;
  if (!m.rows.length) return secHtml(M.title, M.sub, `<p class="wempty">${R.noData}</p>`);
  const rows = m.rows.slice(0, 10).map((x, i) => `<div class="grtb__row"><span class="grtb__name"><i>${i + 1}</i>${escHtml(x.item)}</span><span>${money(x.units)}</span><span>${money(x.sales)}</span><span>${pc(x.sales / m.total)}</span></div>`).join('');
  const mv = (title, list, cls) => (list.length ? `<h3 class="grh grh--sm">${title}</h3>${list.map(x => `<div class="grline"><span>${escHtml(x.item)}</span><b class="${cls}">${x.diff > 0 ? '+' : ''}${money(x.diff)}</b></div>`).join('')}` : '');
  return secHtml(M.title, `${M.sub} · ${fillText(M.count, { n: m.rows.length })}`, `<div class="grtb grtb--menu"><div class="grtb__row grtb__row--head">${M.cols.map(c => `<span>${c}</span>`).join('')}</div>${rows}</div>
    <p class="grkeep">${fillText(M.pareto, { n: m.pareto, p: pc(m.pareto / m.rows.length) })}</p>${mv(M.up, m.up, 'is-good')}${mv(M.down, m.down, 'is-bad')}`);
}

// โฆษณา: แคมเปญ + คีย์เวิร์ดที่ได้ผล/เสียเปล่า
export function adsHtml(r) {
  const A = R.ads, a = r.ads;
  if (!a.camps.length && !a.best.length) return '';
  const camp = a.camps.length ? `<div class="grtb grtb--ads"><div class="grtb__row grtb__row--head">${A.cols.map(c => `<span>${c}</span>`).join('')}</div>
    ${a.camps.map(c => `<div class="grtb__row"><span class="grtb__name">${escHtml(c.name)}</span><span>${money(c.spend)}</span><span>${money(c.orders)}</span><span>${c.spend ? (c.sales / c.spend).toFixed(1) + '×' : '-'}</span></div>`).join('')}</div>` : '';
  const kw = (title, list) => (list.length ? `<h3 class="grh grh--sm">${title}</h3><div class="grtb grtb--ads"><div class="grtb__row grtb__row--head">${A.kwCols.map(c => `<span>${c}</span>`).join('')}</div>
    ${list.map(k => `<div class="grtb__row"><span class="grtb__name">${escHtml(k.name)}</span><span>${money(k.clicks)}</span><span>${money(k.orders)}</span><span>${money(k.spend)}</span></div>`).join('')}</div>` : '');
  return secHtml(A.title, A.sub, camp + kw(A.kwBest, a.best) + kw(A.kwWaste, a.waste) + (a.kwLast ? `<p class="grsub">${fillText(A.kwNote, { d: dayShort(a.kwLast) })}</p>` : ''));
}

// คุณภาพออเดอร์: ของขาด/ผิด + เรตติ้ง
export function qualityHtml(r) {
  const Q = R.quality, c = r.cur, q = r.quality;
  const stat = (l, v) => `<div class="grkpi__cell"><em>${l}</em><b>${v}</b></div>`;
  const body = `<div class="grkpi grkpi--3">${stat(Q.orders, c.issues)}${stat(Q.missing, c.missing)}${stat(Q.wrong, c.wrong)}</div>`
    + (c.issues ? '' : `<p class="grsub">${Q.none}</p>`)
    + (q.items.length ? `<h3 class="grh grh--sm">${Q.items}</h3>${q.items.map(([n, v]) => `<div class="grline"><span>${escHtml(n)}</span><b>${v}</b></div>`).join('')}` : '')
    + (q.hours.length ? `<h3 class="grh grh--sm">${Q.hours}</h3>${q.hours.map(([h, v]) => `<div class="grline"><span>${h}:00–${Number(h) + 1}:00</span><b>${v}</b></div>`).join('')}` : '');
  return secHtml(Q.title, Q.sub, body);
}
