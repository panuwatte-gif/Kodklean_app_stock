// หน้ากราฟการใช้วัตถุดิบ 1 รายการ (เปิดทับหน้าเดิม) — ใช้ร่วมหน้าเตรียม-เหลือ และตารางเตรียมหน้าครัวของพนักงาน
// ใช้จริง/เตรียมจริง = ชุดเดียวกับแท็บประเมินผล (kk_view_prep_eval + ประวัติพยากรณ์) · ควรเตรียม = kk_forecast_daily (S1)
import { PREP_CHART_UI as T, PREP_GROUP_NONE } from './config.js';
import { getPrepEval, getHistoryRange, getFcDailyRange, getPrepRecs, todayIso } from './data.js';
import { prepEvalMerge } from './calc.js';
import { itemPhoto, glyph, niceTicks } from './ui.js';
import { shiftIso, weightBig, signedKg, dayOf, dayShort, fillText, escHtml } from './format.js';

const C = { used: '#2FA35B', taken: '#3B82E0', fc: '#F08A24', grid: '#E6EAF0', txt: '#8A9199' };
const num = v => (v === null || v === undefined || v === '' ? null : Number(v));
const kg = v => (v === null || v === undefined ? '—' : weightBig(v));

// เอาออกมาเตรียมของวัน = เตรียม + เบิกเพิ่ม (ยังไม่กรอกทั้งคู่ = ว่าง)
const takenOf = it => (num(it.prep) === null && num(it.extra) === null ? null : (num(it.prep) || 0) + (num(it.extra) || 0));

// โหลดข้อมูลย้อนหลังสูงสุด dayMax วันของวัตถุดิบนี้ครั้งเดียว (เปลี่ยนจำนวนวันไม่ต้องโหลดใหม่)
async function loadRows(itemId, date) {
  const from = shiftIso(date, -T.dayMax), to = shiftIso(date, -1);
  const [ev, hist, fc] = await Promise.all([getPrepEval(from, to), getHistoryRange(from, to), getFcDailyRange(from, date).catch(() => [])]);
  const rows = prepEvalMerge(ev.filter(r => r.item_id === itemId), hist.filter(r => r.item_id === itemId));
  const fcBy = {};
  fc.filter(r => r.item_id === itemId).forEach(r => { fcBy[r.forecast_date] = num(r.forecast_kg); });
  return { rows, fcBy };
}

// ข้อมูลรายวันช่วง n วันล่าสุดถึงวันที่ทำงาน (วันทำงานใช้ตัวเลขบนการ์ดที่เพิ่งกรอก) · วันไม่มีบันทึกไม่ใส่ ไม่เดา
function daysOf(data, item, date, n) {
  const from = shiftIso(date, -(n - 1));
  const out = data.rows.filter(r => r.use_date >= from && r.use_date < date && (r.taken_kg !== null || r.used_kg !== null))
    .map(r => ({ date: r.use_date, taken: r.taken_kg, used: r.used_kg, fc: data.fcBy[r.use_date] ?? null, excluded: r.excluded }));
  const t = takenOf(item), u = num(item.use);
  if (t !== null || u !== null) out.push({ date, taken: t, used: u, fc: item.fcDay ? num(item.fcDay.fc) : data.fcBy[date] ?? null, excluded: false });
  return out;
}

// กราฟแท่งคู่ (ใช้จริง เขียว · เตรียมจริง ฟ้า) + เส้นประควรเตรียม (ส้ม) · แกนบนสูงกว่าค่ามากสุดเสมอ · แตะช่องวันเพื่อดูตัวเลข
function chartSvg(days, sel) {
  const W = 360, H = 190, L = 28, R = 6, B = 22, top = 10;
  const max = Math.max(0.1, ...days.flatMap(d => [d.taken, d.used, d.fc]).filter(v => v !== null && v !== undefined));
  const ticks = niceTicks(max * 1.12, 4), tmax = ticks[ticks.length - 1];
  const step = (W - L - R) / days.length, cx = i => L + (i + 0.5) * step, bw = Math.min(12, step * 0.36);
  const y = v => top + (H - top - B) * (1 - v / tmax);
  const f = v => v.toFixed(1);
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${f(y(t))}" y2="${f(y(t))}" stroke="${C.grid}"></line><text x="${L - 4}" y="${f(y(t) + 3)}" font-size="9" text-anchor="end" fill="${C.txt}">${t}</text>`).join('');
  const slots = days.map((d, i) => `<rect data-chart-day="${i}" x="${f(cx(i) - step / 2)}" y="${top}" width="${f(step)}" height="${H - B - top}" fill="${i === sel ? 'rgba(59,130,224,.10)' : d.excluded ? 'rgba(120,120,120,.10)' : 'transparent'}" style="cursor:pointer"></rect>`).join('');
  const bar = (x, v, c, dim) => (v === null || v === undefined ? '' : `<rect x="${f(x)}" y="${f(y(v))}" width="${f(bw)}" height="${f(Math.max(1, y(0) - y(v)))}" rx="1.5" fill="${c}"${dim ? ' opacity=".4"' : ''} style="pointer-events:none"></rect>`);
  const bars = days.map((d, i) => bar(cx(i) - bw - 0.5, d.used, C.used, d.excluded) + bar(cx(i) + 0.5, d.taken, C.taken, d.excluded)).join('');
  let path = '', pen = false, dots = '';
  days.forEach((d, i) => {
    if (d.fc === null || d.fc === undefined) { pen = false; return; }
    path += `${pen ? 'L' : 'M'}${f(cx(i))} ${f(y(d.fc))} `; pen = true;
    dots += `<circle cx="${f(cx(i))}" cy="${f(y(d.fc))}" r="2.6" fill="${C.fc}" style="pointer-events:none"></circle>`;
  });
  const line = path ? `<path d="${path}" fill="none" stroke="${C.fc}" stroke-width="1.8" stroke-dasharray="4 3" style="pointer-events:none"></path>${dots}` : '';
  const k = Math.max(1, Math.ceil(days.length / 7));
  const labels = days.map((d, i) => (i % k === 0 || i === days.length - 1 ? `<text x="${f(cx(i))}" y="${H - 7}" font-size="9" text-anchor="middle" fill="${C.txt}">${dayOf(d.date)}</text>` : '')).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${T.legUsed} / ${T.legTaken} / ${T.legFc}" style="display:block">${slots}${grid}${bars}${line}${labels}</svg>`;
}

// ชิปเลือกจำนวนวัน + ช่องพิมพ์จำนวนวันเอง
function daysPickHtml(n) {
  const chips = T.dayChoices.map(d => `<button class="pgr__chip${d === n ? ' is-on' : ''}" type="button" data-chart-n="${d}">${d} ${T.dayUnit}</button>`).join('');
  const custom = !T.dayChoices.includes(n);
  return `<div class="pgr__days">${chips}<label class="pgr__chip pgr__chip--in${custom ? ' is-on' : ''}"><span>${T.dayCustom}</span><input type="number" inputmode="numeric" min="1" max="${T.dayMax}" step="1" data-chart-in="1" value="${custom ? n : ''}" placeholder="–" aria-label="${fillText(T.dayCustomTitle, { max: T.dayMax })}"></label></div>`;
}

// การ์ดแนะนำพรุ่งนี้ (ค่าพยากรณ์ชุดเดียวกับหน้าเตรียมของวันถัดไป)
function nextHtml(next, used) {
  if (next === undefined) return `<section class="pgr__next"><p class="pgr__muted">${T.loading}</p></section>`;
  if (next === 'closed') return `<section class="pgr__next"><img src="assets/home/ic-target.webp" alt="" width="40" height="40"><div><em>${T.nextTitle}</em><p class="pgr__muted">${T.nextClosed}</p></div></section>`;
  if (!next) return '';
  const pct = used ? Math.round((next.fc - used) / used * 100) : null;
  const band = next.lo !== null && next.lo !== undefined && next.hi !== null && next.hi !== undefined && next.lo !== next.hi;
  return `<section class="pgr__next"><img src="assets/home/ic-target.webp" alt="" width="40" height="40">
    <div><em>${T.nextTitle}</em><b>${weightBig(next.fc)} <small>${T.unit}</small></b><p>${band ? fillText(T.nextSub, { lo: next.lo, hi: next.hi }) : T.nextSubNoBand}</p></div>
    ${pct === null ? '' : `<span class="pgr__pct${pct < 0 ? ' is-down' : ''}" title="${T.nextVs}">${pct > 0 ? '↑ +' : pct < 0 ? '↓ ' : ''}${pct}%</span>`}</section>`;
}

// ทั้งหน้า: หัว · การ์ดวัตถุดิบ · กราฟ · ตัวเลขวันทำงาน · แนะนำพรุ่งนี้ · ประวัติ · หมายเหตุ
function pageHtml(item, date, st) {
  const used = num(item.use), taken = takenOf(item);
  const diff = used === null || taken === null ? null : taken - used;
  let trend = `<p class="pgr__muted">${st.err ? T.loadError : T.loading}</p>`, hist = '';
  if (st.data) {
    const days = daysOf(st.data, item, date, st.n);
    if (st.sel === null || st.sel >= days.length) st.sel = days.length - 1;
    const d = days[st.sel];
    trend = days.length ? chartSvg(days, st.sel) + (d ? `<p class="pgr__dayline">${d.excluded ? `${T.excluded} · ` : ''}${fillText(T.dayLine, { d: dayShort(d.date), a: kg(d.taken), b: kg(d.used), c: kg(d.fc) })}</p>` : '') : `<p class="pgr__muted">${T.none}</p>`;
    const list = days.slice().reverse(), shown = st.all ? list : list.slice(0, 3);
    hist = list.length ? `<section class="pgr__card"><div class="pgr__head"><b>${T.histTitle}</b>${list.length > 3 ? `<button type="button" class="pgr__link" data-chart-all="1">${st.all ? T.histLess : T.histAll} ›</button>` : ''}</div>
      ${shown.map(x => `<div class="pgr__hrow"><span>${dayShort(x.date)}${x.excluded ? ` · ${T.excluded}` : ''}</span><span>${fillText(T.histLine, { a: kg(x.taken), b: kg(x.used) })}</span></div>`).join('')}</section>` : '';
  }
  const legend = (c, t, dash) => `<span><i style="background:${c}${dash ? ';height:3px;border-radius:2px' : ''}"></i>${t}</span>`;
  return `<div class="pgr__page">
    <header class="pgr__bar"><button class="pgr__back" type="button" data-chart-close="1" aria-label="${T.back}">${glyph('back', 20)}</button><h2>${escHtml(item.name)}</h2></header>
    <section class="pgr__item"><img src="${itemPhoto(item)}" alt="" width="64" height="64" decoding="async"><div><b>${escHtml(item.name)}</b><span>${escHtml(item.prep_group || PREP_GROUP_NONE)}</span></div></section>
    <section class="pgr__card">
      <div class="pgr__head"><b>${fillText(T.trendTitle, { n: st.n })}</b></div>
      ${daysPickHtml(st.n)}
      <div class="pgr__legend">${legend(C.used, T.legUsed)}${legend(C.taken, T.legTaken)}${legend(C.fc, T.legFc, true)}</div>
      ${trend}
    </section>
    <section class="pgr__stats">
      <div class="pgr__stat"><em>${date === todayIso() ? T.statUsed : fillText(T.statDay, { d: dayShort(date) })}</em><b style="color:#1E7A3C">${kg(used)}</b><small>${T.unit}</small></div>
      <div class="pgr__stat pgr__stat--blue"><em>${T.statTaken}</em><b style="color:#2F63C9">${kg(taken)}</b><small>${T.unit}</small></div>
      <div class="pgr__stat pgr__stat--red"><em>${T.statDiff}</em><b style="color:${diff > 0.005 ? '#D4322A' : diff < -0.005 ? '#2F63C9' : '#1E7A3C'}">${diff === null ? '—' : signedKg(diff)}</b><small>${T.unit}</small></div>
    </section>
    ${nextHtml(st.next, used)}
    ${hist}
    <section class="pgr__foot"><img src="assets/prep/mascot-thumbs.webp" alt="" width="44" height="58" loading="lazy" decoding="async"><p>${T.foot}</p></section>
  </div>`;
}

// เปิดหน้ากราฟของวัตถุดิบ (item = แถวจากหน้าเตรียม · date = วันที่ทำงาน) · ค่าเริ่มต้นย้อนหลัง dayDefault วัน
export function openPrepChart(item, date) {
  if (!item) return;
  const box = document.createElement('div');
  box.className = 'pgr';
  document.body.appendChild(box);
  const st = { n: T.dayDefault, sel: null, all: false, data: null, err: false, next: undefined };
  const paint = () => { const top = box.scrollTop; box.innerHTML = pageHtml(item, date, st); box.scrollTop = top; };
  paint();
  loadRows(item.id, date).then(d => { st.data = d; paint(); }).catch(() => { st.err = true; paint(); });
  getPrepRecs(shiftIso(date, 1)).then(r => {
    const row = [...r.model.meatRows, ...r.model.riceRows].find(x => x.id === item.id);
    st.next = !row ? null : row.closed ? 'closed' : row.fcDay || null; paint();
  }).catch(() => { st.next = null; paint(); });
  box.addEventListener('click', e => {
    const hit = s => e.target.closest(s);
    if (hit('[data-chart-close]')) return box.remove();
    if (hit('[data-chart-n]')) { st.n = Number(hit('[data-chart-n]').dataset.chartN); st.sel = null; return paint(); }
    if (hit('[data-chart-all]')) { st.all = !st.all; return paint(); }
    if (hit('[data-chart-day]')) { st.sel = Number(hit('[data-chart-day]').dataset.chartDay); paint(); }
  });
  box.addEventListener('change', e => {
    if (!e.target.matches('[data-chart-in]')) return;
    const n = Math.round(Number(e.target.value));
    if (n >= 1 && n <= T.dayMax) { st.n = n; st.sel = null; }
    paint();
  });
}
