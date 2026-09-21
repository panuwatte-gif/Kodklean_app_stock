// หน้าหลัก: การ์ดใช้ไปเท่าไหร่ (กราฟรายวัน + Top 5) และการ์ดยอดคงเหลือภาพรวม (กราฟเทียบช่วง + 5 เมนูที่เหลือมากสุด)
import { HOME_UI, HOME_COLORS } from '../shared/config.js';
import { dropdownHtml, axisBarChart, niceTicks } from '../shared/ui.js';
import { meanOpenDays, rankByMean, leftoverSeries, leftoverMonthly } from '../shared/calc.js';
import { dayShort, weight, weightBig, weightOrDash, baht, fillText } from '../shared/format.js';
import { cardHead } from './home-top.js';

// การ์ดใช้ไปเท่าไหร่: dropdown ซ้ายเปลี่ยนเฉพาะ KPI/กราฟ ส่วน Top 5 เป็นภาพรวมทุกวัตถุดิบ (ไม่นับวันปัจจุบัน)
export function usageCard(u, ui) {
  const t = HOME_UI.usage;
  const cur = u.series.find(s => s.id === ui.usageItem) || u.series[0];
  const stat = meanOpenDays(cur.daily);
  const dd = dropdownHtml({ name: 'usageItem', label: t.itemLabel, value: cur.id, options: u.series.map(s => ({ value: s.id, label: s.name })) });
  const kpi = stat.mean === null ? `<span class="hkpi__none">${HOME_UI.noData}</span>` : `<b>${weightBig(stat.mean)}</b><em>${u.unit}</em>`;
  const known = cur.daily.filter(v => v !== null && v !== undefined);
  const chart = axisBarChart({
    labels: u.dates.map(dayShort), ticks: niceTicks(Math.max(...known, 0), 4), unit: u.unit, fmt: weightBig,
    series: [{ name: t.legendDay, color: HOME_COLORS.teal, values: cur.daily }], mean: stat.mean, meanLabel: t.legendMean, h: 120
  });
  const top = rankByMean(u.series, 5);
  const max = top.length ? top[0].stat.mean : 1;
  const rows = top.map((s, i) => `
    <div class="htop__row">
      <span class="htop__rank">${i + 1}</span>
      <img src="${s.photo}" alt="" loading="lazy" decoding="async">
      <span class="htop__name">${s.name}</span>
      <span class="htop__bar"><i style="width:${(s.stat.mean / max * 100).toFixed(1)}%"></i></span>
      <span class="htop__val">${weightBig(s.stat.mean)} <em>${u.unit}</em></span>
    </div>`).join('');
  // การ์ดซ้าย = กราฟรายวัน / การ์ดขวา = Top 5 — สองการ์ดสูงเท่ากัน
  return `<section class="hc hc--teal huse">
    ${cardHead({ tone: 'teal', title: t.title, sub: t.sub, char: 'kid-05' })}
    <div class="hc__body huse__body">
      <div class="huse__top">${dd}<div class="hkpi"><small>${t.avg7}</small>${kpi}</div></div>
      ${chart}
    </div></section>
  <section class="hc hc--teal htop">
    ${cardHead({ tone: 'teal', title: t.topTitle, sub: t.topSub })}
    <div class="hc__body htop__body">${rows || `<p class="hc__empty">${HOME_UI.noData}</p>`}</div>
  </section>`;
}

// การ์ดยอดคงเหลือภาพรวม: dropdown เมนู + สวิตช์ "เหลือเก็บต่อ / ทิ้งจริง" คุมกราฟ ส่วนตาราง Top 5 เป็นภาพรวมสาขาเสมอ
export function leftoverCard(lo, meta, ui) {
  const t = HOME_UI.left;
  const metric = t.metrics.find(m => m.id === ui.leftMetric) || t.metrics[0];
  const s = leftoverSeries(lo, ui.leftMenu, metric.id);
  const dd = dropdownHtml({ name: 'leftMenu', label: t.menuLabel, value: ui.leftMenu, options: [{ value: 'all', label: t.allMenus }, ...lo.ranking.map(r => ({ value: r.id, label: r.name }))] });
  const seg = `<div class="seg" role="group" aria-label="${t.title}">${t.metrics.map(m => `
    <button class="seg__btn${m.id === metric.id ? ' is-on' : ''}" type="button" data-left-metric="${m.id}" aria-pressed="${m.id === metric.id}">${m.label}</button>`).join('')}</div>`;
  const known = [...s.cur, ...s.prev].filter(v => v !== null && v !== undefined);
  const chart = axisBarChart({
    labels: lo.dates.map(dayShort), ticks: niceTicks(Math.max(...known, 0), 5), unit: lo.unit, fmt: weight,
    series: [{ name: t.legendCur, color: HOME_COLORS.rose, values: s.cur }, { name: t.legendPrev, color: HOME_COLORS.prior, values: s.prev }], h: 120
  });
  // จัดอันดับเฉพาะเมนูที่มีตัวเลขจริง (ยังไม่มีบันทึก = ไม่ติดอันดับ ห้ามนับเป็น 0)
  const top = lo.ranking.filter(r => r.avg7 !== null && r.avg7 !== undefined)
    .sort((a, b) => b.avg7 - a.avg7 || String(a.id).localeCompare(String(b.id))).slice(0, 5);
  const rows = top.map((r, i) => {
    const est = leftoverMonthly(r, meta.openDaysFixture);
    return `
    <div class="hleft__row">
      <span class="htop__rank">${i + 1}</span>
      <img src="${r.photo}" alt="" loading="lazy" decoding="async">
      <span class="htop__name">${r.name}</span>
      <div class="hleft__stats">
        <span><small>${t.cols[0]}</small><b>${weightOrDash(r.avg7)} <i>${r.unit || lo.unit}</i></b></span>
        <span><small>${t.cols[1]}</small><b>${weightOrDash(r.avg30)} <i>${r.unit || lo.unit}</i></b></span>
        <span><small>${t.cols[2]}</small><b>${est === null ? `<i class="is-none">${t.noEst}</i>` : baht(est)}</b></span>
      </div>
    </div>`;
  }).join('');
  // ตารางทั้งบล็อกขึ้น "ยังไม่มีบันทึก" เมื่อไม่มีแถวของเหลือเลย (ไม่แสดงเมนูเป็น 0)
  const table = lo.hasData === false || !rows
    ? `<p class="hc__empty">${t.empty}</p>`
    : `<div class="hleft__row hleft__row--head"><span>#</span><span></span><span class="htop__name">${t.menuLabel}</span><div class="hleft__stats"><span>${t.cols[0]}</span><span>${t.cols[1]}</span><span>${t.cols[2]}</span></div></div>${rows}`;
  return `<section class="hc hc--rose hleft">
    ${cardHead({ tone: 'rose', title: t.title, sub: t.sub, char: 'kid-04', tools: dd + seg })}
    <div class="hc__body">
      <p class="hleft__desc">${metric.desc} (${lo.unit})</p>
      ${chart}
    </div>
    <div class="hc__panel">
      <div class="hc__subhead"><b>${t.topTitle}</b><small>${t.topSub}</small></div>
      ${table}
      <p class="hc__note">${fillText(t.estNote, { d: meta.openDaysFixture })}</p>
    </div></section>`;
}
