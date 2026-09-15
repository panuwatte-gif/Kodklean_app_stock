// ห้องทดสอบสูตร รายวัตถุดิบ — เลือกวัตถุดิบ 1 ตัว แล้วเอาทุกสูตรที่ยังไม่ถูกคัดออกมาแข่งกันบนข้อมูลจริงของตัวนั้น
import { EQ_LAB_UI } from '../shared/config.js';
import { buildSeries, runAll, regimeOf, itemState, verdictOf } from '../shared/fclab.js';
import { setFcLiveModel, saveFcTrials, addFcRegime, bumpFcFormulas } from '../shared/data.js';
import { confirmSheet, toast } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import { itemStripHtml, stateHtml, subTabsHtml, kgTableHtml, bahtTableHtml, chartHtml, actionsHtml } from './eq-lab-view.js';

// สถานะของแท็บนี้ (คงค่าไว้เมื่อสลับแท็บกลับมา)
const state = { item: null, sub: 'kg', picked: [], data: null, cache: {} };

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
  return { code: m.formula_code, label: `${m.formula_code} — ${f ? f.name_th : ''} · กรอบ ${m.band_value || data.cfg.band_value} ${m.band_type || data.cfg.band_type}` };
}

// วัดผลทุกสูตรของวัตถุดิบที่เลือก
function compute(item, data) {
  const series = buildSeries(data.history, item.id, data.cfg);
  return { series, rows: runAll(series, data.formulas, data.cfg), st: itemState(series, data.cfg), reg: regimeOf(series, data.cfg) };
}

// ตั้งสูตรที่ติ๊กไว้ 1 สูตรเป็นสูตรใช้จริงของวัตถุดิบนี้
async function setLive(item, calc, data, reload) {
  if (state.picked.length !== 1) return toast(EQ_LAB_UI.liveNeedOne);
  const row = calc.rows.find(r => r.code === state.picked[0]);
  if (!row) return;
  const ok = await confirmSheet({
    title: EQ_LAB_UI.liveAsk.title, okLabel: EQ_LAB_UI.liveAsk.ok,
    text: `${item.name} → ${row.code} (${row.name})${row.enough ? ` · win rate ${row.winRate}% จาก ${row.n} วัน` : ' · ข้อมูลยังไม่พอ ยังไม่ผ่านการตัดสิน'}`
  });
  if (!ok) return;
  try {
    await setFcLiveModel({
      item_id: item.id, item_name_th: item.name, model_type: 'model', formula_code: row.code,
      band_type: String(data.cfg.band_type), band_value: row.band, active: true,
      backtest_win: row.winRate, loss_baht_month: item.price === null || row.lossSum === null || !row.n
        ? null : Math.round(row.lossSum / row.n * Number(data.cfg.round_length_days) * item.price * 100) / 100,
      note: `ตั้งจากห้องทดสอบ ${new Date().toISOString().slice(0, 10)}`
    });
    toast(fillText(EQ_LAB_UI.liveDone, { c: row.code, n: item.name }));
    reload();
  } catch { toast(EQ_LAB_UI.saveErr); }
}

// บันทึกผลทดสอบทุกแถวลง kk_forecast_trial + ติดป้ายสถานการณ์ + นับรอบทดสอบของสูตร
async function saveTrials(item, calc, data, reload) {
  const cfg = data.cfg;
  const ctrl = calc.rows.find(r => r.code === 'fixed_mean') || calc.rows.find(r => r.status === 'control');
  const at = new Date().toISOString();
  const trials = calc.rows.map(r => {
    const v = verdictOf(r, ctrl, cfg);
    return {
      formula_code: r.code, item_id: item.id, band_type: String(cfg.band_type), band_value: r.band === null ? Number(cfg.band_value) : r.band,
      period_from: calc.st.from, period_to: calc.st.to, regime: calc.reg.regime, n: r.n,
      win_rate: r.winRate, loss_min_kg: r.lossMin, loss_avg_kg: r.lossAvg, loss_max_kg: r.lossMax, loss_sum_kg: r.lossSum,
      loss_avg_baht: item.price === null || r.lossAvg === null ? null : Math.round(r.lossAvg * item.price * 100) / 100,
      verdict: v.verdict, verdict_reason: v.reason, tested_at: at
    };
  });
  const ok = await confirmSheet({ title: `${EQ_LAB_UI.btnSave} ${trials.length} แถว?`, okLabel: EQ_LAB_UI.btnSave, text: `${item.name} · ช่วง ${calc.st.from} ถึง ${calc.st.to}` });
  if (!ok) return;
  try {
    await saveFcTrials(trials);
    await bumpFcFormulas(calc.rows.map(r => {
      const f = data.formulas.find(x => x.formula_code === r.code) || {};
      const v = trials.find(t => t.formula_code === r.code);
      return { formula_code: r.code, name_th: f.name_th || r.name, family: f.family || r.family, times_tested: Number(f.times_tested || 0) + 1, last_verdict: v.verdict };
    }));
    if (calc.reg.regime) await addFcRegime([{ period_from: calc.reg.from, period_to: calc.reg.to, item_id: item.id, regime: calc.reg.regime, slope_pct: calc.reg.slopePct, note: 'คิดจากเฉลี่ย 4 สัปดาห์ล่าสุดเทียบ 4 สัปดาห์ก่อนหน้า' }]);
    toast(fillText(EQ_LAB_UI.savedTrials, { n: trials.length }));
    reload();
  } catch { toast(EQ_LAB_UI.saveErr); }
}

// วาดแท็บห้องทดสอบ
export function mountLab(pane, data, reload) {
  if (state.data !== data) { state.data = data; state.cache = {}; }
  const items = itemList(data);
  if (!items.length) return void (pane.innerHTML = '<p class="ptab__none">ยังไม่มีข้อมูลใช้จริงในฐาน</p>');
  if (!state.item || !items.some(i => i.id === state.item)) state.item = items[0].id;
  const item = items.find(i => i.id === state.item);
  const calc = state.cache[item.id] || (state.cache[item.id] = compute(item, data));
  const live = liveOf(item, data);

  const body = state.sub === 'kg' ? kgTableHtml(calc.rows, data.cfg, live && live.code, state.picked)
    : state.sub === 'baht' ? bahtTableHtml(calc.rows, item.price, data.cfg)
      : chartHtml(calc.series, calc.rows, state.picked);

  pane.innerHTML = `<p class="eq-sub">${EQ_LAB_UI.sub}</p>`
    + itemStripHtml(items, state.item)
    + stateHtml(calc.st, calc.reg, live, item.price)
    + subTabsHtml(state.sub) + body + actionsHtml();

  pane.onclick = event => {
    const pick = event.target.closest('[data-item]'), sub = event.target.closest('[data-sub]');
    if (pick) { state.item = pick.dataset.item; state.picked = []; return mountLab(pane, data, reload); }
    if (sub) { state.sub = sub.dataset.sub; return mountLab(pane, data, reload); }
    if (event.target.closest('[data-set-live]')) return setLive(item, calc, data, reload);
    if (event.target.closest('[data-save-trial]')) return saveTrials(item, calc, data, reload);
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
