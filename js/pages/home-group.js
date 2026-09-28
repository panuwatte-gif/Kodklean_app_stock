// หน้าหลัก: การ์ดคู่ KodKlean Group (ยอดขายรวมทุกร้านรายวัน) + สัดส่วนรายได้ (วงกลมแบ่งตามร้าน/ช่องทาง)
import { HOME_UI, HOME_COLORS } from '../shared/config.js';
import { donut, niceTicks, stackBarChart } from '../shared/ui.js';
import { r9Cumulative } from '../shared/calc.js';
import { dayShort, baht, moneyK, fillText } from '../shared/format.js';
import { cardHead } from './home-top.js';

// การ์ดซ้าย: โลโก้กลุ่ม + ยอดรวมเดือนนี้ + กราฟแท่งซ้อนรายวันแยกสีร้าน + เส้นเฉลี่ย
function groupCard(g, stores) {
  const t = HOME_UI.group;
  const top = Math.max(...g.daily.filter(Boolean).map(d => d.reduce((a, v) => a + v, 0)), 1000);
  const chart = stackBarChart({
    labels: g.labels.map(dayShort), ticks: niceTicks(top, 4), fmt: moneyK, mean: g.avg,
    stacks: stores.map((s, i) => ({ name: s.name, color: s.color, values: g.daily.map(d => (d ? d[i] : null)) }))
  });
  const legend = stores.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');
  return `<section class="hc hc--green hgroup__card">
    <div class="hc__head hc__head--green hgroup__head">
      <img class="hgroup__logo" src="${t.logo}" alt="KodKlean Group" decoding="async">
      <div class="hc__text"><b class="hc__title">${t.title}</b><small class="hc__sub">${t.sub}</small></div>
    </div>
    <div class="hc__body hgroup__body">
      <small class="hgroup__label">${t.total}</small>
      <b class="hgroup__big">${g.total === null ? HOME_UI.noData : baht(g.total)}</b>
      <small class="hgroup__hint">${g.avg === null ? '' : fillText(t.avg, { v: baht(g.avg), n: g.days, d: dayShort(g.last) })}</small>
      <div class="hc__subhead hgroup__sub"><b>${t.chart}</b><small>${t.mean}</small></div>
      ${chart}
      <div class="ch__legend hgroup__legend">${legend}</div>
    </div></section>`;
}

// การ์ดขวา: วงกลมสัดส่วนรายได้แบ่งตามร้าน + ยอดส่งพระราม 9 เดือนนี้ · รายการ ชื่อ / % / ยอด
function mixCard(g, r9) {
  const t = HOME_UI.mix;
  const r9v = r9 && r9.hasData !== false ? r9Cumulative(r9.shipments || []).total : 0;
  const parts = g.byStore.map(s => ({ label: s.name, value: s.value, color: s.color }))
    .concat([{ label: t.r9, value: r9v, color: HOME_COLORS.lavender }])
    .filter(p => p.value > 0).sort((a, b) => b.value - a.value);
  const sum = parts.reduce((s, p) => s + p.value, 0);
  const rows = parts.map(p => `<li><i style="background:${p.color}"></i><span>${p.label}</span><b>${Math.round(p.value / sum * 100)}%</b><small>${baht(p.value)}</small></li>`).join('');
  const body = sum ? `
      <div class="hmix__pie">${donut(parts, { size: 150, hole: 0.58 })}<span class="hmix__center"><small>${t.center}</small><b>${moneyK(sum)}</b></span></div>
      <ul class="hmix__list">${rows}</ul>` : `<p class="hc__empty">${HOME_UI.noData}</p>`;
  return `<section class="hc hc--gold hgroup__card">
    ${cardHead({ tone: 'gold', title: t.title, sub: t.sub })}
    <div class="hc__body hmix__body">${body}
      <p class="hc__note hmix__note">${t.note}</p>
    </div></section>`;
}

// การ์ดคู่วางแถวเดียวกัน กว้างเท่ากัน สูงเท่ากัน
export function groupRow(sales, r9) {
  const g = sales.group;
  if (!g) return '';
  return `<div class="hgroup">${groupCard(g, sales.stores)}${mixCard(g, r9)}</div>`;
}
