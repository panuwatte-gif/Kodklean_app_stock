// ชิ้นส่วนหน้ารายงานผู้บริหาร Grab ชุดที่ 4: ลูกค้าเป็นใคร — ยอดบิลกระจายตัว · บิลแต่ละขนาดสั่งอะไร · ขั้นราคาเมนูที่ขายดี
import { GRAB_UI } from '../shared/config.js';
import { axisBarChart } from '../shared/ui.js';
import { secHtml } from './grab-report-view.js';
import { fillText, money, dayShort, escHtml } from '../shared/format.js';

const X = GRAB_UI.rep.mix;
const pc = v => (v === null || v === undefined ? '-' : Math.round(v * 100) + '%');
const two = (labels, a, b) => axisBarChart({ labels, series: [{ name: a.name, color: '#8FB3E8', values: a.values.map(v => Math.round(v * 1000) / 10) }, { name: b.name, color: '#1F9D55', values: b.values.map(v => Math.round(v * 1000) / 10) }], ticks: [0, 10, 20, 30, 40, 50].filter((t, i, arr) => i < 2 || arr[i - 1] < Math.max(...a.values, ...b.values) * 100), fmt: v => String(Math.round(v)), unit: '%', h: 120 });
const stat = (l, v) => `<div class="grkpi__cell"><em>${l}</em><b>${v}</b></div>`;

// ยอดบิลกระจายตัวยังไง: แท่งคู่ % บิล vs % ยอด ต่อขั้นราคาบิล + เปอร์เซ็นไทล์ + กลุ่มหลัก
export function distHtml(r) {
  const d = r.dist;
  if (!d) return '';
  const body = `<div class="grkpi grkpi--4">${stat('25%', '฿' + money(d.p25))}${stat(X.median, '฿' + money(d.p50))}${stat('75%', '฿' + money(d.p75))}${stat('90%', '฿' + money(d.p90))}</div>
    <p class="grsub">${X.pctHint}</p>
    ${two(d.rows.map(x => x.label), { name: X.shareBills, values: d.rows.map(x => x.pn) }, { name: X.shareSales, values: d.rows.map(x => x.ps) })}
    <div class="grwho"><p><b>${X.main}</b> ${fillText(X.mainIs, { b: d.main.label, p: pc(d.main.pn), s: pc(d.main.ps) })}</p>
    <p><b>${X.money}</b> ${fillText(X.moneyIs, { b: d.money.label, p: pc(d.money.ps), n: pc(d.money.pn) })}</p>
    <p>${fillText(X.top20, { p: pc(d.top20) })}</p></div>`;
  return secHtml(X.distTitle, fillText(X.distSub, { n: money(d.n), a: money(d.avg) }), body);
}

// แถวหมวดเมนู: สัดส่วนจาน · บิลเฉลี่ยเมื่อมีหมวดนี้ · ดัชนีเทียบบิลเฉลี่ย
const catTable = rows => `<div class="grtb grtb--cat"><div class="grtb__row grtb__row--head">${X.catCols.map(c => `<span>${c}</span>`).join('')}</div>
  ${rows.map(c => `<div class="grtb__row"><span class="grtb__name">${escHtml(c.label)}</span><span>${pc(c.dish)}</span><span>${money(c.avg)}</span><span class="${c.idx >= 1.05 ? 'is-good' : c.idx <= 0.95 ? 'is-bad' : ''}">${c.idx.toFixed(2)}×</span></div>`).join('')}</div>`;

// บิลแต่ละขนาดสั่งอะไร (จากบิลที่ถ่ายรูปไว้)
export function basketHtml(k) {
  if (!k) return '';
  const seg = `<div class="grtb grtb--seg"><div class="grtb__row grtb__row--head">${X.segCols.map(c => `<span>${c}</span>`).join('')}</div>
    ${k.seg.filter(s => s.pn).map(s => `<div class="grtb__row"><span class="grtb__name">${X.seg[s.k - 1]}</span><span>${pc(s.pn)}</span><span>${pc(s.ps)}</span><span>${money(s.avg)}</span></div>`).join('')}</div>`;
  const band = `<div class="grtb grtb--band"><div class="grtb__row grtb__row--head">${X.bandCols.map(c => `<span>${c}</span>`).join('')}</div>
    ${k.byBand.map(b => `<div class="grtb__row"><span class="grtb__name">฿${b.label}</span><span>${b.dish.toFixed(1)}</span><span>${pc(b.addon)}</span><span>${escHtml(b.top || '-')}</span></div>`).join('')}</div>`;
  const pairs = k.pairs.length ? `<h3 class="grh grh--sm">${X.pairs}</h3><p class="grsub">${X.pairsHint}</p>${k.pairs.map(p => `<div class="grline"><span>${escHtml(p.a)} + ${escHtml(p.b)}</span><b class="${p.lift >= 1.2 ? 'is-good' : ''}">${fillText(X.pairIs, { n: p.n, l: p.lift.toFixed(1) })}</b></div>`).join('')}` : '';
  return secHtml(X.basketTitle, fillText(X.basketSub, { n: money(k.n), a: dayShort(k.from), b: dayShort(k.to) }),
    `<h3 class="grh grh--sm">${X.segTitle}</h3>${seg}<h3 class="grh grh--sm">${X.proteinTitle}</h3><p class="grsub">${X.idxHint}</p>${catTable(k.protein)}`
    + (k.style.length ? `<h3 class="grh grh--sm">${X.styleTitle}</h3>${catTable(k.style)}` : '')
    + `<h3 class="grh grh--sm">${X.bandTitle}</h3>${band}${pairs}<p class="grkeep">${fillText(X.berry, { p: pc(k.berry) })}</p>`);
}

// ขั้นราคาเมนู: % ชิ้นที่ขาย vs % ยอด
export function priceHtml(r) {
  const t = r.price;
  if (!t) return '';
  return secHtml(X.priceTitle, X.priceSub, two(t.rows.map(x => x.label), { name: X.shareUnits, values: t.rows.map(x => x.pu) }, { name: X.shareSales, values: t.rows.map(x => x.ps) })
    + `<p class="grkeep">${fillText(X.priceBest, { b: t.best.label, p: pc(t.best.pu), n: t.best.items })}</p>`);
}
