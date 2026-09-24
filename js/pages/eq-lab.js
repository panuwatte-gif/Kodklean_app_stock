// ห้องทดสอบสูตร รายวัตถุดิบ — ผู้ใช้เลือกวัตถุดิบ ช่วงวันที่ แหล่งข้อมูล และกรอบเอง แล้วกดเริ่มทดสอบ (ไม่รันเองตอนเปิดหน้า)
// ทุกสูตรใน run เดียวกันใช้ข้อมูลชุดเดียวกัน กรอบเดียวกัน และนับคะแนนบนชุดวันเดียวกัน (รวมตัวเทียบ fixed_mean)
import { EQ_LAB_UI } from '../shared/config.js';
import { buildSeries, runLab, regimeOf, itemState, verdictOf, bandOf, bandLabel, cfgProblems, EVAL_KEYS } from '../shared/fclab.js';
import { setFcLiveModel, setFcModelSafe, saveFcTrials, addFcRegime, bumpFcFormulas, todayIso } from '../shared/data.js';
import { confirmSheet, toast } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import { itemStripHtml, stateHtml, subTabsHtml, kgTableHtml, bahtTableHtml, chartHtml, actionsHtml, srcHtml, runFormHtml, runInfoHtml } from './eq-lab-view.js';

const LAB_KEYS = [...EVAL_KEYS, 'elim_win_threshold', 'elim_loss_vs_live_pct', 'round_length_days', 'regime_growth_pct', 'regime_decline_pct'];

// สถานะของแท็บนี้ (ค่าที่เลือกเก็บต่อวัตถุดิบ+แหล่งข้อมูล · ผลทดสอบเก็บเฉพาะรอบที่กดเริ่มล่าสุด)
const state = { item: null, sub: 'kg', picked: [], data: null, src: 'all', form: {}, result: null };

// รายชื่อวัตถุดิบที่มีข้อมูลใช้จริงในฐาน (ชื่อจากตารางสูตรใช้จริง ถ้าไม่มีใช้ชื่อในรายการนับ)
function itemList(data) {
  const ids = [...new Set(data.history.map(h => h.item_id))];
  return ids.map(id => {
    const m = data.map.find(x => x.item_id === id) || {};
    const p = data.prices[id] || {};
    return { id, name: m.item_name_th || p.name || id, grp: p.grp || 'เนื้อสัตว์', price: p.price === undefined ? null : p.price, map: m };
  }).sort((a, b) => a.name.localeCompare(b.name, 'th'));
}

// ป้ายสูตรที่ใช้จริงอยู่กับวัตถุดิบตัวนี้
function liveOf(item, data) {
  const m = item.map || {};
  if (m.model_type === 'fixed') return { code: null, label: `${EQ_LAB_UI.fixedModel}${m.fixed_kg ? ` ${m.fixed_kg} กก.` : ''}` };
  if (!m.formula_code) return null;
  const f = data.formulas.find(x => x.formula_code === m.formula_code);
  return { code: m.formula_code, label: `${m.formula_code} — ${f ? f.name_th : ''} · กรอบ ${bandLabel(bandOf(data.cfg, m, f))}` };
}

// ค่าตั้งของรอบทดสอบ (แสดงให้เห็นบนจอทุกค่า: ช่วงข้อมูลของวัตถุดิบ + กรอบที่ตั้งรายวัตถุดิบ/ค่ากลาง)
function formOf(item, series, data) {
  const key = item.id + '|' + state.src;
  if (!state.form[key]) {
    const b = bandOf(data.cfg, item.map, null);
    state.form[key] = { from: series.length ? series[0].date : '', to: series.length ? series[series.length - 1].date : '', type: b.type || 'SD', value: b.value === null ? '' : String(b.value) };
  }
  return state.form[key];
}

// รันทุกสูตรด้วยค่าที่เลือก (เรียกเมื่อกดปุ่มเท่านั้น)
function run(item, series, data, form) {
  const band = { type: form.type, value: Number(form.value), src: 'lab' };
  const lab = runLab(series.filter(s => s.date <= form.to), data.formulas, data.cfg, band, form.from, form.to);
  const live = lab.rows.find(r => r.code === (item.map || {}).formula_code) || null;
  lab.rows.forEach(r => { r.verdict = verdictOf(r, lab.ctrl, data.cfg, live); });
  const reg = lab.period.from ? regimeOf(series.filter(s => s.date < lab.period.from), data.cfg) : { regime: null, slopePct: null, from: null, to: null };
  return { key: `${item.id}|${state.src}|${form.from}|${form.to}|${form.type}|${form.value}`, band, lab, reg, series: series.filter(s => s.date <= form.to) };
}

// ตั้งสูตรที่ติ๊กไว้ 1 สูตรเป็นสูตรใช้จริง (คนเลือกเอง · กันชนด้วย updated_at)
async function setLive(item, res, data, reload) {
  if (!res) return toast(EQ_LAB_UI.runNeed);
  if (state.picked.length !== 1) return toast(EQ_LAB_UI.liveNeedOne);
  const row = res.lab.rows.find(r => r.code === state.picked[0]);
  if (!row) return;
  if (row.nowcast) return toast(EQ_LAB_UI.nowcastLive);
  const ok = await confirmSheet({
    title: EQ_LAB_UI.liveAsk.title, okLabel: EQ_LAB_UI.liveAsk.ok,
    text: `${item.name} → ${row.code} (${row.name})${row.enough ? ` · win rate ${row.winRate}% (กรอบ ${row.bandLabel}) จาก ${row.n} วัน` : ' · ข้อมูลยังไม่พอ ยังไม่ผ่านการตัดสิน'} · ${row.verdict.reason}`
  });
  if (!ok) return;
  const m = item.map || {};
  const note = `เปลี่ยนเมื่อ ${todayIso()} จาก ${m.formula_code || (m.model_type === 'fixed' ? 'เตรียมคงที่' : '—')} เป็น ${row.code} (ห้องทดสอบ ช่วง ${res.lab.period.from}–${res.lab.period.to} กรอบ ${row.bandLabel} สถานการณ์ ${res.reg.regime || '—'} win rate ${row.winRate === null ? '—' : row.winRate + '%'})`;
  const changes = { model_type: 'model', formula_code: row.code, band_type: row.bandType, band_value: row.band, note, backtest_win: row.winRate };
  try {
    if (m.item_id) {
      if (!(await setFcModelSafe(item.id, m.updated_at, changes))) return toast(EQ_LAB_UI.mapChanged);
    } else await setFcLiveModel({ item_id: item.id, item_name_th: item.name, active: true, ...changes });
    toast(fillText(EQ_LAB_UI.liveDone, { c: row.code, n: item.name }));
    reload();
  } catch { toast(EQ_LAB_UI.saveErr); }
}

// บันทึกผลทุกสูตรที่ประเมินลง kk_forecast_trial (period = ช่วงที่นับคะแนนจริง) แล้วนับรอบทดสอบเฉพาะเมื่อบันทึกสำเร็จ
async function saveTrials(item, res, data, reload) {
  if (!res) return toast(EQ_LAB_UI.runNeed);
  const { lab, reg } = res;
  if (!lab.period.from) return toast(PREP_NONE);
  const at = new Date().toISOString();
  const trials = lab.rows.map(r => ({
    formula_code: r.code, item_id: item.id, band_type: res.band.type, band_value: res.band.value,
    period_from: lab.period.from, period_to: lab.period.to, regime: reg.regime, n: r.n,
    win_rate: r.winRate, loss_min_kg: r.lossMin, loss_avg_kg: r.lossAvg, loss_max_kg: r.lossMax, loss_sum_kg: r.lossSum,
    loss_avg_baht: item.price === null || r.lossAvg === null ? null : Math.round(r.lossAvg * item.price * 100) / 100,
    verdict: r.verdict.verdict, verdict_reason: r.verdict.reason, tested_at: at
  }));
  const ok = await confirmSheet({ title: `${EQ_LAB_UI.btnSave} ${trials.length} แถว?`, okLabel: EQ_LAB_UI.btnSave, text: `${item.name} · นับคะแนน ${lab.period.from} ถึง ${lab.period.to} (${lab.days} วัน) · กรอบ ${bandLabel(res.band)}` });
  if (!ok) return;
  try {
    await saveFcTrials(trials);
    await bumpFcFormulas(lab.rows.map(r => {
      const f = data.formulas.find(x => x.formula_code === r.code) || {};
      const row = { formula_code: r.code, name_th: f.name_th || r.name, family: f.family || r.family, times_tested: Number(f.times_tested || 0) + 1, last_verdict: r.verdict.verdict };
      if (r.verdict.verdict === 'pass' && reg.regime) row.best_regime = reg.regime;
      return row;
    }));
    if (reg.regime) await addFcRegime([{ period_from: reg.from, period_to: reg.to, item_id: item.id, regime: reg.regime, slope_pct: reg.slopePct, note: 'คิดจากข้อมูลก่อนช่วงที่ทดสอบ เฉลี่ย 4 สัปดาห์ล่าสุดเทียบ 4 สัปดาห์ก่อนหน้า' }]);
    toast(fillText(EQ_LAB_UI.savedTrials, { n: trials.length }));
    reload();
  } catch { toast(EQ_LAB_UI.saveErr); }
}
const PREP_NONE = 'ไม่มีวันที่ทุกสูตรมีผลร่วมกันในช่วงนี้ จึงบันทึกไม่ได้';

// ผลทดสอบเก่าล่าสุดของแต่ละสูตรกับวัตถุดิบนี้ (แสดงดูเท่านั้น ไม่นำมาใช้แทนการทดสอบใหม่)
function prevTrials(data, itemId) {
  const out = {};
  (data.trials || []).filter(t => t.item_id === itemId).forEach(t => { if (!out[t.formula_code]) out[t.formula_code] = t; });
  return out;
}

// วาดแท็บห้องทดสอบ
export function mountLab(pane, data, reload) {
  if (state.data !== data) { state.data = data; state.result = null; }
  const items = itemList(data);
  if (!items.length) return void (pane.innerHTML = '<p class="ptab__none">ยังไม่มีข้อมูลใช้จริงในฐาน</p>');
  if (!state.item || !items.some(i => i.id === state.item)) state.item = items[0].id;
  const item = items.find(i => i.id === state.item);
  const bad = cfgProblems(data.cfg, LAB_KEYS);
  if (bad.length) return void (pane.innerHTML = itemStripHtml(items, state.item) + `<p class="ptab__none">ค่ากฎในตาราง kk_forecast_config หายหรือผิดชนิด จึงทดสอบไม่ได้: ${bad.join(', ')}</p>`);
  const series = buildSeries(data.history, item.id, data.cfg, state.src);
  const liveN = buildSeries(data.history, item.id, data.cfg, 'app_live').length;
  const form = formOf(item, series, data);
  const key = `${item.id}|${state.src}|${form.from}|${form.to}|${form.type}|${form.value}`;
  const res = state.result && state.result.key === key ? state.result : null;
  const live = liveOf(item, data);
  const st = itemState(series, data.cfg);

  const body = !res ? `<p class="ptab__none">${EQ_LAB_UI.runNeed}</p>`
    : state.sub === 'kg' ? kgTableHtml(res.lab.rows, data.cfg, live && live.code, state.picked, prevTrials(data, item.id))
      : state.sub === 'baht' ? bahtTableHtml(res.lab.rows.filter(r => r.n), item.price, data.cfg)
        : chartHtml(res.series, res.lab.rows, state.picked);

  pane.innerHTML = `<p class="eq-sub">${EQ_LAB_UI.sub}</p>`
    + itemStripHtml(items, state.item)
    + srcHtml(state.src, liveN, data.cfg.min_days_to_judge)
    + stateHtml(st, regimeOf(series, data.cfg), live, item.price, res ? res.band : null)
    + runFormHtml(form) + (res ? runInfoHtml(res.lab, res.reg) : '')
    + subTabsHtml(state.sub) + body + actionsHtml();

  pane.onclick = event => {
    const pick = event.target.closest('[data-item]'), sub = event.target.closest('[data-sub]'), src = event.target.closest('[data-src]');
    if (src) { state.src = src.dataset.src; state.picked = []; return mountLab(pane, data, reload); }
    if (pick) { state.item = pick.dataset.item; state.picked = []; return mountLab(pane, data, reload); }
    if (sub) { state.sub = sub.dataset.sub; return mountLab(pane, data, reload); }
    if (event.target.closest('[data-run]')) {
      const v = k => (pane.querySelector(`[data-lab="${k}"]`) || {}).value || '';
      const f = { from: v('from'), to: v('to'), type: v('type') === 'PCT' ? 'PCT' : 'SD', value: v('value') };
      if (!f.from || !f.to || f.from > f.to) return toast(EQ_LAB_UI.runBadRange);
      if (!/^\d+(\.\d+)?$/.test(f.value) || !(Number(f.value) > 0)) return toast(EQ_LAB_UI.runBadBand);
      state.form[item.id + '|' + state.src] = f;
      state.picked = [];
      state.result = run(item, series, data, f);
      return mountLab(pane, data, reload);
    }
    if (event.target.closest('[data-set-live]')) return setLive(item, res, data, reload);
    if (event.target.closest('[data-save-trial]')) return saveTrials(item, res, data, reload);
  };
  pane.onchange = event => {
    const box = event.target.closest('[data-pick]');
    if (!box) return;
    const code = box.dataset.pick;
    if (box.checked) {
      if (state.picked.length >= 3) { box.checked = false; return toast(EQ_LAB_UI.max3); }
      state.picked.push(code);
    } else state.picked = state.picked.filter(c => c !== code);
  };
}
