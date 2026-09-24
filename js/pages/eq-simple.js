// หน้าสมการ Forecast แบบอ่านง่าย: วัตถุดิบละ 1 การ์ด — ใช้สูตรอะไร แม่นแค่ไหน มีสูตรที่แม่นกว่าไหม กดเปลี่ยนได้ทันที
import { EQ_SIMPLE as T } from '../shared/config.js';
import { buildSeries, runAll, evalFormula, bandOf } from '../shared/fclab.js';
import { dailyStats } from '../shared/forecast.js';
import { setFcModelSafe, addFcFormulas, refreshFcDaily } from '../shared/data.js';
import { itemPhoto, pickerSheet, confirmSheet, formSheet, toast } from '../shared/ui.js';
import { isAdmin } from '../shared/auth.js';
import { fillText, escHtml } from '../shared/format.js';

const view = { grp: 'เนื้อสัตว์' };
const cache = {};   // ผลทดสอบทุกสูตรต่อวัตถุดิบ (คิดครั้งเดียวต่อการโหลดข้อมูล)

// ป้ายสถานะจาก % แม่น (ใช้ผลใช้จริงก่อน ถ้าวันยังไม่พอใช้ผลย้อนหลัง)
function pillOf(pct, enough) {
  if (pct === null || pct === undefined || !enough) return { cls: 'wait', text: T.pill.wait };
  return pct >= T.good ? { cls: 'good', text: T.pill.good } : pct >= T.ok ? { cls: 'ok', text: T.pill.ok } : { cls: 'bad', text: T.pill.bad };
}

// ตัวเลข % + คำอธิบายใต้ตัวเลข (ยังไม่มีผล = ขีด)
const scoreBox = (pct, sub) => `<div class="eqs-score__box"><b>${pct === null || pct === undefined ? '–' : pct + '%'}</b><small>${sub}</small></div>`;

// การ์ดวัตถุดิบ 1 ใบ (ส่วน "มีสูตรที่แม่นกว่า" เติมทีหลังเมื่อคิดเสร็จ)
function cardHtml(it) {
  const bt = it.back, lv = it.live;
  const liveOk = lv && lv.enough;
  const p = pillOf(liveOk ? lv.win : bt.winRate, liveOk || bt.enough);
  return `
    <article class="eqs-card" data-item="${it.id}">
      <header class="eqs-card__head">
        <img src="${itemPhoto({ id: it.id, grp: it.grp })}" alt="" width="40" height="40" loading="lazy" decoding="async">
        <b>${escHtml(it.name)}</b>
        <span class="eqs-pill eqs-pill--${p.cls}">${p.text}</span>
      </header>
      <div class="eqs-now"><small>${T.nowLabel}</small><b>${escHtml(it.f ? it.f.name_th : T.noFormula)}</b></div>
      <div class="eqs-score">
        ${scoreBox(bt.winRate, bt.n ? fillText(T.backSub, { n: bt.n }) : T.noBack)}
        ${scoreBox(lv && lv.n ? lv.win : null, lv && lv.n ? fillText(T.liveSub, { n: lv.n }) : T.noLive)}
      </div>
      <div class="eqs-better" data-better="${it.id}"><small>${T.checking}</small></div>
      ${isAdmin() ? `<button class="eqs-btn" type="button" data-pick-f="${it.id}">${T.pickBtn}</button>` : ''}
    </article>`;
}

// กล่อง "มีสูตรที่แม่นกว่า" (หรือบอกว่าสูตรนี้ดีที่สุดแล้ว)
function betterHtml(it, rows) {
  const cur = rows.find(r => r.code === it.code);
  const best = rows.find(r => !r.nowcast && r.enough && r.code !== it.code && r.status !== 'control');
  const base = cur && cur.winRate !== null ? cur.winRate : -1;
  if (best && best.winRate >= base + T.betterBy) {
    return `<div class="eqs-better__box"><small>${T.betterHead}</small><b>${escHtml(best.name)}</b>
      <span>${fillText(T.betterLine, { w: best.winRate, n: best.n, d: base < 0 ? '–' : Math.round((best.winRate - base) * 10) / 10 })}</span>
      ${isAdmin() ? `<button class="eqs-btn eqs-btn--main" type="button" data-use-f="${it.id}" data-code="${best.code}">${T.useBtn}</button>` : ''}</div>`;
  }
  return `<small class="eqs-better__ok">${bt(it) ? T.bestNow : T.notEnough}</small>`;
}
const bt = it => it.back.enough;

// ข้อมูลของทุกวัตถุดิบที่มีสูตร (กลุ่มตาม kk_count_item.grp)
function itemsOf(data, stats) {
  const reg = {};
  data.formulas.forEach(f => { reg[f.formula_code] = f; });
  return data.map.filter(m => m.active !== false && m.model_type === 'model').map(m => {
    const info = data.prices[m.item_id] || {};
    const series = buildSeries(data.history, m.item_id, data.cfg);
    const f = reg[m.formula_code] || null;
    const back = f ? evalFormula(series, f, data.cfg, reg, bandOf(data.cfg, m, f)) : { winRate: null, n: 0, enough: false };
    return { id: m.item_id, name: info.name || m.item_name_th, grp: info.grp, code: m.formula_code, f, m, series, back, live: stats.items[m.item_id] || null };
  });
}

// วาดทั้งหน้า แล้วคิดสูตรที่แม่นกว่าทีละวัตถุดิบ (ไม่ให้จอค้าง)
export async function mountSimple(pane, data, reload) {
  let stats = { items: {} };
  const draw = () => {
    const items = itemsOf(data, stats).filter(i => i.grp === view.grp);
    pane.innerHTML = `
      <section class="eqs-intro"><b>${T.introHead}</b><p>${T.intro}</p><p class="eqs-intro__eg">${T.introEg}</p></section>
      <div class="eqs-seg">${T.groups.map(g => `<button type="button" class="${g.grp === view.grp ? 'is-on' : ''}" data-grp="${g.grp}">${g.label}</button>`).join('')}</div>
      ${items.length ? items.map(cardHtml).join('') : `<p class="ptab__none">${T.empty}</p>`}
      <p class="eqs-foot">${T.foot}</p>`;
    let i = 0;
    const next = () => {
      if (i >= items.length || !pane.isConnected) return;
      const it = items[i++];
      cache[it.id] = cache[it.id] || runAll(it.series, data.formulas, data.cfg, it.m);
      const box = pane.querySelector(`[data-better="${it.id}"]`);
      if (box) box.innerHTML = betterHtml(it, cache[it.id]);
      setTimeout(next, 0);
    };
    setTimeout(next, 30);
    return items;
  };
  let items = draw();
  refreshFcDaily(data.cfg).then(daily => { stats = dailyStats(daily, data.cfg); items = draw(); }).catch(() => {});

  // เปลี่ยนสูตรของวัตถุดิบ (กันชนด้วยเวลาที่อ่านมา) แล้วโหลดใหม่ทุกแท็บ
  const apply = async (it, code) => {
    const f = data.formulas.find(x => x.formula_code === code);
    if (!await confirmSheet({ title: fillText(T.askTitle, { item: it.name }), text: fillText(T.askText, { from: it.f ? it.f.name_th : '–', to: f ? f.name_th : code }), okLabel: T.useBtn })) return;
    try {
      const ok = await setFcModelSafe(it.id, it.m.updated_at, { model_type: 'model', formula_code: code });
      if (!ok) return toast(T.conflict);
      Object.keys(cache).forEach(k => delete cache[k]);
      toast(T.saved);
      reload();
    } catch { toast(T.saveErr); }
  };

  // เลือกสูตรเอง: เรียงตาม % แม่นย้อนหลัง · สูตรเฉลี่ยกลุ่มวัน ปรับจำนวนวันย้อนหลังได้ (สร้างสูตรลูกให้อัตโนมัติ)
  const pick = async it => {
    const rows = cache[it.id] || (cache[it.id] = runAll(it.series, data.formulas, data.cfg, it.m));
    const code = await pickerSheet({ title: fillText(T.pickTitle, { item: it.name }), options: rows.filter(r => !r.nowcast).map(r => ({
      value: r.code, label: `${r.code === it.code ? '✓ ' : ''}${r.name} · ${r.winRate === null ? T.noScore : fillText(T.pickScore, { w: r.winRate, n: r.n })}`
    })) });
    if (!code) return;
    const f = data.formulas.find(x => x.formula_code === code);
    const p = (f && f.params) || {};
    if (!p.dow_groups) return code === it.code ? null : apply(it, code);
    const res = await formSheet({ title: T.daysTitle, fields: [{ key: 'n', kind: 'number', step: 1, label: T.daysLabel, value: p.n || 5 }] });
    if (!res) return;
    const n = Math.max(1, Math.min(30, Math.round(Number(res.n) || p.n || 5)));
    const root = f.parent_code && data.formulas.find(x => x.formula_code === f.parent_code && (x.params || {}).dow_groups) || f;
    const want = `wdgroup_mean${n}`;
    if (!data.formulas.some(x => x.formula_code === want)) {
      try {
        await addFcFormulas([{ formula_code: want, name_th: fillText(T.daysName, { n }), family: 'weekday', equation_th: fillText(T.daysEq, { n }),
          params: { ...(root.params || {}), n }, status: 'testing', source: 'mutate', parent_code: root.formula_code }]);
      } catch { return toast(T.saveErr); }
      data.formulas.push({ formula_code: want, name_th: fillText(T.daysName, { n }), family: 'weekday', params: { ...(root.params || {}), n }, status: 'testing' });
    }
    if (want !== it.code) apply(it, want);
  };

  pane.onclick = event => {
    const hit = s => event.target.closest(s);
    const find = id => items.find(x => x.id === id);
    if (hit('[data-grp]')) { view.grp = hit('[data-grp]').dataset.grp; items = draw(); }
    else if (hit('[data-use-f]')) { const b = hit('[data-use-f]'); apply(find(b.dataset.useF), b.dataset.code); }
    else if (hit('[data-pick-f]')) pick(find(hit('[data-pick-f]').dataset.pickF));
  };
}
