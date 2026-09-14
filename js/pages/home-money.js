// หน้าหลัก: การ์ดลดของเหลือ = ลดต้นทุน / ยอดขายเทียบเป้าหมาย / ส่งพระราม 9
import { HOME_UI, HOME_COLORS } from '../shared/config.js';
import { glyph, dropdownHtml, axisLineChart, niceTicks } from '../shared/ui.js';
import { savingsSummary, achievement, r9Cumulative } from '../shared/calc.js';
import { dayShort, dayLongTh, dayOf, dayRangeTh, money, baht, pct1, fillText } from '../shared/format.js';
import { cardHead } from './home-top.js';

// การ์ดประหยัด: วัดจากต้นทุนของทิ้งจริงสะสม เทียบจำนวนวันเท่ากันของสองเดือน (ติดลบ = ต้นทุนเพิ่ม ไม่ใช้สีเขียว)
export function savingsCard(sv) {
  const t = HOME_UI.save;
  const sum = savingsSummary(sv.priorCum[sv.priorCum.length - 1], sv.currentCum[sv.currentCum.length - 1]);
  const head = sum.state === 'saved' ? t.saved : sum.state === 'worse' ? t.worse : t.equal;
  const amount = sum.state === 'missing' ? HOME_UI.noData : sum.state === 'equal' ? '' : baht(sum.diff);
  const pctTile = sum.pct === null || sum.state === 'equal' ? '' : `
    <div class="htile htile--pct${sum.state === 'worse' ? ' is-worse' : ''}"><small>${sum.state === 'worse' ? t.up : t.down}</small><b>${pct1(sum.pct)}</b></div>`;
  const month = sv.currentPeriod[0].slice(0, 8);
  const chart = axisLineChart({
    labels: sv.days.map(d => dayShort(month + String(d).padStart(2, '0'))), ticks: sv.ticks, unit: t.unit, fmt: money,
    series: [{ name: t.prior, color: HOME_COLORS.prior, values: sv.priorCum }, { name: t.current, color: HOME_COLORS.green, values: sv.currentCum }]
  });
  return `<section class="hc hc--green hsave${sum.state === 'worse' ? ' hsave--worse' : ''}">
    ${cardHead({ tone: 'green', title: t.title, char: 'mascot' })}
    <div class="hc__body hsave__body">
      <div class="hsave__left">
        <span class="hsave__head">${head}</span>
        <b class="hsave__amount">${amount}</b>
        <small class="hsave__cmp">${fillText(t.compare, { a: dayOf(sv.currentPeriod[0]), b: dayOf(sv.currentPeriod[1]) })} (${dayRangeTh(sv.priorPeriod[0], sv.priorPeriod[1])})</small>
        <div class="hsave__tiles">
          <div class="htile"><small>${t.prior}</small><b>${baht(sum.prior)}</b></div>
          <div class="htile"><small>${t.current}</small><b>${baht(sum.current)}</b></div>
          ${pctTile}
        </div>
      </div>
      <div class="hsave__right">
        <div class="hc__subhead"><b>${t.chartTitle}</b></div>
        ${chart}
      </div>
      <p class="hc__note hsave__note">${t.note}</p>
    </div></section>`;
}

// การ์ดยอดขาย: การ์ดร้าน 2×2 (โลโก้แบรนด์ ยอด เป้า แท่ง %) — เกิน 100% เขียนได้ แต่แท่งไม่ล้น; ไม่มีข้อมูล/ไม่มีเป้าแสดงข้อความ ไม่ใช้ 0
export function salesCard(sales, ui) {
  const t = HOME_UI.sales;
  const period = t.periods.some(p => p.id === ui.salesPeriod) ? ui.salesPeriod : 'month';
  const dd = dropdownHtml({ name: 'salesPeriod', label: t.periodLabel, value: period, options: t.periods.map(p => ({ value: p.id, label: p.label })) });
  const sub = period === 'month' ? fillText(t.subMonth, { d: dayLongTh(sales.through) }) : t.subToday;
  const cards = sales.stores.map(st => {
    const value = period === 'month' ? st.month : st.today;
    const a = achievement(value, st.target);
    const pctText = value === null || value === undefined ? HOME_UI.noData : a.pct === null ? t.noTarget : `${Math.round(a.pct)}%`;
    return `
      <article class="hstore" style="--brand:${st.color}">
        <img class="hstore__logo" src="${st.logo}" alt="${st.name}" loading="lazy" decoding="async">
        <span class="hstore__name">${st.name}</span>
        <b class="hstore__val">${value === null || value === undefined ? HOME_UI.noData : baht(value)}</b>
        <small class="hstore__target">${t.target} ${st.target > 0 ? baht(st.target) : t.noTarget}</small>
        <span class="hstore__bar" role="img" aria-label="${pctText}"><i style="width:${a.width.toFixed(1)}%"></i></span>
        <b class="hstore__pct">${pctText}</b>
      </article>`;
  }).join('');
  return `<section class="hc hc--gold">
    ${cardHead({ tone: 'gold', title: t.title, sub, tools: dd })}
    <div class="hsales">${cards}</div>
    <p class="hc__note hsales__note">${t.updated} ${sales.updatedAt}</p></section>`;
}

// การ์ดพระราม 9: มูลค่าส่งสะสมเดือนนี้ (บาท) + จำนวนรอบ + ประเภท + กราฟสะสม — ไม่ใช้หน่วยกล่อง
export function r9Card(r9) {
  const t = HOME_UI.r9;
  const c = r9Cumulative(r9.shipments);
  const chart = axisLineChart({
    labels: c.points.map(p => dayShort(p.date)), ticks: niceTicks(c.total, 3), unit: t.unit, fmt: money,
    series: [{ color: HOME_COLORS.green, values: c.points.map(p => p.value) }]
  });
  return `<section class="hc hc--green">
    ${cardHead({ tone: 'green', title: t.title, sub: t.sub, char: 'kid-05', side: 'right' })}
    <div class="hc__body hr9__body">
      <div class="hr9__top">
        <img class="hr9__truck" src="assets/home/truck-green.webp" alt="รถส่งของ KodKlean" loading="lazy" decoding="async">
        <div class="hr9__stats">
          <div class="hr9__stat hr9__stat--main"><small>${t.month}</small><b>${baht(c.total)}</b><em>${r9.basis}</em></div>
          <div class="hr9__stat"><small>${t.roundsLabel}</small><b>${c.rounds} <i>${t.rounds}</i></b></div>
          <div class="hr9__stat"><small>${t.typesLabel}</small><b class="is-text">${r9.types}</b></div>
        </div>
      </div>
      <div class="hr9__right">
        <div class="hc__subhead hc__subhead--row"><b>${t.chartTitle} (${t.unit})</b><button class="hr9__btn" type="button" data-go="rama9">${t.detail}${glyph('chevron', 14)}</button></div>
        ${chart}
      </div>
    </div></section>`;
}
