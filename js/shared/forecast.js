// เอนจินพยากรณ์วัตถุดิบสำหรับเตรียมของจริง — ใช้เอนจินเดียวกับห้องทดสอบ (fclab.js) บนข้อมูล kk_forecast_history
// สูตรของแต่ละวัตถุดิบอ่านจาก kk_forecast_model_map เท่านั้น · ใช้ข้อมูลก่อนวันที่พยากรณ์เท่านั้น · สูตรยอดขายถูกบังคับเป็นโหมดล่วงหน้า
// ค่าพยากรณ์ = ยอดใช้จริงที่คาดของวันนั้นโดยตรง ไม่บวก/ลบกับคงเหลือใดๆ คนเตรียมตัดสินใจเองว่าจะเอาออกมาเท่าไหร่
import { buildSeries, predictorOf, evalFormula, bandOf, bandLabel, advanceFormulas, isNowcast, fcCtxOf, dowIso, bkkIso, sdOf, cfgProblems, EVAL_KEYS } from './fclab.js';
import { FORECAST_MODELS, PREP_UI } from './config.js';

const r1 = n => Math.round(n * 10) / 10;
const r2 = n => Math.round(n * 100) / 100;
const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
const wd = iso => new Date(iso + 'T00:00:00').getDay();
const FALLBACK_N = 6;   // สูตรสำรองขั้นสุดท้าย = เฉลี่ย 6 วันเปิดล่าสุด (ต้องมีอย่างน้อย 3 วัน)

// ทะเบียนสูตร (รหัส → สูตร)
const regOf = list => { const r = {}; (list || []).forEach(f => { r[f.formula_code] = f; }); return r; };

// ลายเซ็นสูตรแบบเดิม (FORECAST_MODELS) ไว้เทียบกับสูตรใน kk_forecast_model_map
function oldSig(m) {
  if (!m) return null;
  if (m.kind === 'ma' || m.kind === 'mean_last') return `ma:${m.n}`;
  if (m.kind === 'ema') return `ema:${m.alpha}`;
  if (m.kind === 'ratio_theo') return `ratio_theo:${m.n}`;
  if (m.kind === 'blend') return `blend:${m.alpha}`;
  if (m.kind === 'const') return `fixed:${m.v}`;
  return m.kind;
}

// ลายเซ็นของสูตรใน kk_forecast_model_map (ชนิดสูตร + พารามิเตอร์หลัก)
function newSig(m, f) {
  if (!m) return null;
  if (m.model_type === 'fixed') return `fixed:${Number(m.fixed_kg)}`;
  if (!f) return 'none';
  const p = f.params || {}, k = p.sales_of || f.formula_code;
  if (f.family === 'mean' && p.window && !/^(MED|TRIM|WMA|naive)|bias/.test(k)) return `ma:${p.window}`;
  if (f.family === 'ema') return `ema:${p.alpha}`;
  if (f.family === 'weekday' && k === 'weekday_mean') return 'weekday_mean';
  if (f.family === 'sales' && k.startsWith('blend')) return `blend:${p.alpha === undefined ? 0.3 : p.alpha}`;
  if (f.family === 'sales' && k.startsWith('ratio_theo') && k !== 'ratio_theo_wd') return `ratio_theo:${p.window || 12}`;
  return k;
}

// เทียบสูตรเดิมกับสูตรปัจจุบันของวัตถุดิบ (คืน null = ตรงกัน)
function modelDiff(itemId, m, f) {
  const o = FORECAST_MODELS[itemId];
  const a = oldSig(o), b = newSig(m, f);
  if (a === b) return null;
  const now = !m ? 'ไม่มีแถว' : m.model_type === 'fixed' ? `เตรียมคงที่ ${m.fixed_kg} กก.` : `${m.formula_code || '—'}${f && Object.keys(f.params || {}).length ? ' ' + JSON.stringify(f.params) : ''}`;
  return { old: o ? o.label : 'ไม่มีในชุดเดิม', now };
}

// จำนวนวันที่สูตรต้องการอย่างน้อย (รู้ได้เฉพาะสูตรที่มี window/weeks)
const needOf = f => { const p = (f && f.params) || {}; return p.window || p.weeks || (f && f.family === 'ema' ? 1 : null); };

// ลองคำนวณค่ากลางของสูตร 1 ตัว (null = คำนวณไม่ได้ พร้อมเหตุผล)
function tryPredict(f, reg, series, dateIso, cfg) {
  if (!f) return { p: null, why: 'ไม่พบสูตรในคลังสูตร' };
  const fn = predictorOf(f, reg);
  if (!fn) return { p: null, why: 'สูตรมีปัญหา (หาตัวคำนวณไม่ได้)' };
  const target = { date: dateIso, dow: dowIso(dateIso), used: null, theo: null };
  let p = null;
  try { p = series.length ? fn(series, target, f.params || {}, f.formula_code, cfg) : null; } catch { return { p: null, why: 'สูตรมีปัญหา (คำนวณแล้วผิดพลาด)' }; }
  if (p !== null && isFinite(p)) return { p: Math.max(0, p), why: null };
  const need = needOf(f);
  if (f.family === 'sales' || f.forced) return { p: null, why: 'ไม่มียอดขายของวันเปิดก่อนหน้าให้สูตรยอดขายใช้' };
  return { p: null, need, why: need ? `มีข้อมูล ${series.length} วัน ต้องการอย่างน้อย ${need} วัน` : `ข้อมูลยังไม่พอ (มี ${series.length} วัน)` };
}

// ป้ายสั้นไม่เกิน 15 ตัวอักษรเมื่อไม่มีค่าพยากรณ์ (ใต้ชื่อรายการทุกหน้าเตรียม): ข้อมูล n/ต้องการ วัน · ยังไม่ตั้งสูตร · คำนวณไม่ได้
export function fcShortWhy(row) {
  if (!row) return PREP_UI.fcNoCalc;
  if (row.status === 'closed') return PREP_UI.fcClosed;
  if (row.status === 'no_model' || row.status === 'no_fixed') return PREP_UI.fcNoModel;
  if (row.need) return `ข้อมูล ${row.n}/${row.need} วัน`;
  return PREP_UI.fcNoCalc;
}

// สูตรสำรองจาก kk_forecast_trial: วัตถุดิบเดียวกัน · pass · ไม่ใช้ยอดขายทั้งสาย · กรอบตรง · ช่วงทดสอบจบและทดสอบก่อน/ในวันที่จะพยากรณ์
function fallbackCandidates(itemId, trials, orig, band, dateIso) {
  return (trials || []).filter(t => t.item_id === itemId && t.verdict === 'pass' && orig[t.formula_code] && !isNowcast(orig[t.formula_code], orig)
    && String(t.band_type || '').toUpperCase() === band.type && Number(t.band_value) === band.value
    && t.period_to && t.period_to < dateIso && t.tested_at && bkkIso(t.tested_at) <= dateIso)
    .sort((a, b) => (Number(b.win_rate) - Number(a.win_rate)) || (Number(b.n) - Number(a.n)) || (Number(a.loss_avg_kg) - Number(b.loss_avg_kg)));
}

// พยากรณ์ 1 รายการ ณ วันที่เลือก: ค่ากลาง + กรอบ (ลำดับกรอบเดียวกับห้องทดสอบ) + คะแนนทดสอบย้อนหลังจากข้อมูลก่อนวันนั้น
export function forecastItem(item, dateIso, cfg, ctx) {
  const c = ctx || fcCtxOf(cfg) || {};
  const out = {
    id: item.id, name: item.name, grp: item.grp, model: { label: '' }, setCode: null, usedCode: null, fallbackWhy: null, fallbackTrial: null,
    modelType: null, n: 0, avg6: null, hist10: [], fc: null, lo: null, hi: null, sd: null, trend: null, wape: null, hitRate: null, hitN: 0,
    band: null, bandLabel: '', status: 'insufficient', statusText: '', salesWarn: false, forced: false, diff: null, need: null, fallbackAvg: false
  };
  if (!c.history) { out.status = 'no_ctx'; return out; }
  const bad = cfgProblems(cfg, EVAL_KEYS);
  if (bad.length) { out.status = 'cfg_bad'; out.statusText = bad.join(', '); return out; }
  const m = (c.map || []).find(x => x.item_id === item.id && x.active !== false);
  const orig = regOf(c.formulas), adv = regOf(advanceFormulas(c.formulas));
  out.diff = modelDiff(item.id, m, m ? orig[m.formula_code] : null);
  if (!m) { out.status = 'no_model'; out.model.label = 'ยังไม่ได้กำหนดสูตร (ไม่มีแถวใน kk_forecast_model_map)'; return out; }
  if (m.updated_at && bkkIso(m.updated_at) > dateIso) { out.status = 'map_later'; out.model.label = `ตั้งสูตรเมื่อ ${bkkIso(m.updated_at)}`; return out; }
  out.modelType = m.model_type;
  const series = buildSeries((c.history || []).filter(h => h.use_date < dateIso), item.id, cfg);
  out.n = series.length;
  out.avg6 = series.length ? r1(avg(series.slice(-6).map(s => s.used))) : null;
  out.hist10 = series.slice(-10).map(s => s.used);

  if (m.model_type === 'fixed') {
    out.setCode = 'fixed';
    out.model.label = `เตรียมคงที่ ${m.fixed_kg === null || m.fixed_kg === undefined ? '' : m.fixed_kg + ' กก.'} (ไม่มีกรอบ ไม่นับความแม่นยำ)`;
    if (m.fixed_kg === null || m.fixed_kg === undefined) { out.status = 'no_fixed'; return out; }
    out.fc = r1(Number(m.fixed_kg));
    out.status = 'fixed';
  } else {
    const band = bandOf(cfg);   // กรอบกลางจาก kk_forecast_config ค่าเดียวกันทุกวัตถุดิบ
    out.band = band; out.bandLabel = bandLabel(band);
    out.setCode = m.formula_code || null;
    out.salesWarn = isNowcast(orig[m.formula_code], orig);
    let f = m.formula_code ? adv[m.formula_code] : null;
    let res = m.formula_code ? tryPredict(f, adv, series, dateIso, cfg) : { p: null, why: 'ยังไม่ได้กำหนดสูตร' };
    if (res.p === null) {
      out.need = res.need || null;
      // สูตรที่ตั้งไว้คำนวณไม่ได้ → หาสูตรสำรองที่มีหลักฐานผ่านการทดสอบ ห้ามเดา ห้ามแก้ mapping
      out.fallbackWhy = res.why;
      const cand = fallbackCandidates(item.id, c.trials, orig, band, dateIso);
      let picked = null;
      for (const t of cand) {
        const r = tryPredict(adv[t.formula_code], adv, series, dateIso, cfg);
        if (r.p !== null) { picked = t; res = r; f = adv[t.formula_code]; break; }
      }
      if (!picked) {
        // ไม่มีสูตรสำรองที่ผ่านการทดสอบ → เฉลี่ย 6 วันเปิดล่าสุดที่ใช้ได้ (น้อยกว่า 3 วัน = ไม่พยากรณ์)
        if (series.length < 3) { out.status = 'insufficient'; out.need = FALLBACK_N; out.model.label = `${m.formula_code || '—'} · ข้อมูล ${series.length}/${FALLBACK_N} วัน`; return out; }
        f = { formula_code: 'avg6_fallback', name_th: PREP_UI.fcFallback, family: 'mean', params: { window: Math.min(FALLBACK_N, series.length) } };
        res = { p: avg(series.slice(-FALLBACK_N).map(s => s.used)), why: null };
        out.fallbackAvg = true;
      } else out.fallbackTrial = picked;
    }
    out.usedCode = f.formula_code;
    out.forced = !!f.forced;
    out.model.label = `${m.formula_code || '—'}${out.fallbackAvg ? ` → ${PREP_UI.fcFallback}` : out.fallbackTrial ? ` → ใช้ ${f.formula_code}` : ''}${f.forced ? ' (โหมดล่วงหน้า: ยอดขายวันเปิดก่อนหน้า)' : ''} · กรอบ ${out.bandLabel}`;
    const p = res.p;
    out.fc = r1(p);
    const ev = evalFormula(series, f, cfg, adv, band);
    const w = ev.resid.slice(-cfg.sd_window);
    const half = band.type === 'PCT' ? band.value / 100 * p : w.length >= cfg.sd_min_obs ? band.value * sdOf(w) : null;
    if (half !== null) {
      out.lo = r1(Math.max(0, p - half)); out.hi = r1(p + half); out.status = 'ok';
      out.sd = band.type === 'SD' ? r2(sdOf(w)) : null;
    } else { out.status = 'no_band'; out.statusText = `มี residual ${w.length} ค่า ต้องการ ${cfg.sd_min_obs} ค่า`; }
    out.hitN = ev.n;
    if (ev.enough) out.hitRate = ev.winRate;
    if (ev.nPred >= cfg.min_days_to_judge && ev.sumA > 0) out.wape = Math.round(ev.sumAbs / ev.sumA * 1000) / 10;
  }
  if (out.avg6 !== null && out.avg6 > 0) {
    const d = (out.fc - out.avg6) / out.avg6;
    out.trend = d > 0.1 ? 'up' : d < -0.1 ? 'down' : 'flat';
  }
  return out;
}

// พยากรณ์ทุกรายการ + คะแนนทดสอบย้อนหลังรวม (เฉพาะรายการแบบสูตรที่วัดผลได้ครบ · แบบคงที่ไม่นับ · บอกกรอบที่ใช้เสมอ)
export function buildForecast(items, dateIso, cfg) {
  const ctx = fcCtxOf(cfg);
  const closed = wd(dateIso) === 0;   // วันอาทิตย์ร้านปิด ไม่พยากรณ์
  const rows = (items || []).filter(i => i.grp === 'เนื้อสัตว์' || i.grp === 'ข้าวหุง').map(i => {
    if (closed) return { id: i.id, name: i.name, grp: i.grp, model: { label: '' }, status: 'closed', fc: null, lo: null, hi: null, hist10: [] };
    try { return forecastItem(i, dateIso, cfg, ctx); }
    catch { return { id: i.id, name: i.name, grp: i.grp, model: { label: '' }, status: 'error', fc: null, lo: null, hi: null, hist10: [] }; }
  });
  const ok = rows.filter(r => r.modelType === 'model' && r.hitRate !== null && r.hitRate !== undefined);
  const bands = [...new Set(ok.map(r => r.bandLabel).filter(Boolean))];
  const accuracy = ok.length
    ? { status: 'ok', rate: Math.round(ok.reduce((s, r) => s + r.hitRate, 0) / ok.length * 10) / 10, n: ok.length, bands }
    : { status: 'insufficient', n: 0, bands };
  return { rows, accuracy, cfg, closed, date: dateIso, cfgBad: cfgProblems(cfg, EVAL_KEYS) };
}

// ---------- ผลพยากรณ์ใช้จริง (kk_forecast_daily) ----------

// แถวที่จะบันทึกเป็นผลพยากรณ์ใช้จริงของวันนั้น (S1) — แบบคงที่ใส่กรอบ = ค่าพยากรณ์ และ sd 0 · ไม่มีกรอบ = บันทึกไม่ได้ (คอลัมน์ห้ามว่าง)
export function dailyRowsOf(fc, dateIso, scenario) {
  const rows = [], noBand = [];
  fc.rows.forEach(r => {
    if (r.fc === null || r.fc === undefined) return;
    if (r.status === 'fixed') rows.push({ forecast_date: dateIso, scenario_code: scenario, item_id: r.id, forecast_kg: r.fc, lower_kg: r.fc, upper_kg: r.fc, sd_kg: 0, n_history: r.n });
    else if (r.lo !== null && r.hi !== null) rows.push({ forecast_date: dateIso, scenario_code: scenario, item_id: r.id, forecast_kg: r.fc, lower_kg: r.lo, upper_kg: r.hi, sd_kg: r.sd, n_history: r.n });
    else noBand.push(r.name);
  });
  return { rows, noBand };
}

// แถวแบบเตรียมคงที่ (ดูจากค่าที่ออกผลไว้ ณ วันนั้น: กรอบเท่าค่าพยากรณ์และ sd 0)
const isFixedDaily = d => Number(d.sd_kg) === 0 && Number(d.lower_kg) === Number(d.forecast_kg) && Number(d.upper_kg) === Number(d.forecast_kg);

// ถูก/ผิด และความเสียหายของ 1 แถว ด้วยกรอบเดิมของแถวนั้น (กฎขอบและ loss_mode จาก kk_forecast_config)
function scoreOf(d, a, cfg) {
  const lo = Number(d.lower_kg), hi = Number(d.upper_kg), f = Number(d.forecast_kg);
  const hit = cfg.edge_counts_as_win === 1 ? a >= lo && a <= hi : a > lo && a < hi;
  const loss = hit ? 0 : cfg.loss_mode === 'full' ? Math.abs(a - f) : a > hi ? a - hi : lo - a;
  return { hit, loss_kg: r2(loss) };
}

// วัตถุดิบพร้อมบันทึกค่าพยากรณ์ของวัน D หรือยัง = วันเปิดก่อนหน้า D ของวัตถุดิบนั้นมี used_kg ในประวัติแล้ว หรือถูกตัดออก (anomaly_excluded)
export function fcReadyFor(history, itemId, prevDate) {
  return (history || []).some(h => h.item_id === itemId && h.use_date === prevDate
    && (h.flag === 'anomaly_excluded' || (h.used_kg !== null && h.used_kg !== undefined && !['actual_missing', 'no_prep_record', 'incomplete'].includes(h.flag))));
}

// ค่าพยากรณ์ที่ต้องแก้ในแถว kk_forecast_daily ที่ยังไม่มีผลจริง (หลังตัดวันผิดปกติ) — เทียบกับค่าที่คำนวณใหม่ แถวที่เท่าเดิมไม่แตะ
export function forecastPatches(daily, fc) {
  const { rows } = dailyRowsOf(fc, fc.date || '', 'S1');
  const out = [];
  (daily || []).forEach(d => {
    if (d.actual_kg !== null && d.actual_kg !== undefined) return;
    const n = rows.find(r => r.item_id === d.item_id);
    if (!n) return;
    const same = ['forecast_kg', 'lower_kg', 'upper_kg', 'sd_kg', 'n_history'].every(k => Number(d[k]) === Number(n[k]));
    if (!same) out.push({ id: d.id, forecast_kg: n.forecast_kg, lower_kg: n.lower_kg, upper_kg: n.upper_kg, sd_kg: n.sd_kg, n_history: n.n_history });
  });
  return out;
}

// ผลจริงที่ต้องเติม/แก้ใน kk_forecast_daily จาก kk_forecast_history (ห้ามแตะค่าพยากรณ์เดิม)
export function actualPatches(daily, history, cfg) {
  const BAD = ['anomaly_excluded', 'actual_missing', 'no_prep_record', 'incomplete'];
  const act = {};
  (history || []).forEach(h => { if (h.used_kg !== null && h.used_kg !== undefined && !BAD.includes(h.flag)) act[h.use_date + '|' + h.item_id] = Number(h.used_kg); });
  return (daily || []).map(d => {
    const a = act[d.forecast_date + '|' + d.item_id];
    const cur = d.actual_kg === null || d.actual_kg === undefined ? null : Number(d.actual_kg);
    const want = a === undefined ? null : a;
    if (cur === want) return null;
    return want === null ? { id: d.id, actual_kg: null, hit: null, loss_kg: null } : { id: d.id, actual_kg: want, ...scoreOf(d, want, cfg) };
  }).filter(Boolean);
}

// ความแม่นยำใช้จริงจาก kk_forecast_daily เท่านั้น (ไม่รวมแถวคงที่ / ยังไม่มีผลจริง) — รวม และรายวัตถุดิบ
export function dailyStats(daily, cfg) {
  const scored = (daily || []).filter(d => d.actual_kg !== null && d.actual_kg !== undefined && d.hit !== null && d.hit !== undefined && !isFixedDaily(d));
  const sum = list => {
    const n = list.length, hits = list.filter(d => d.hit === true).length;
    const errs = list.map(d => Math.abs(Number(d.actual_kg) - Number(d.forecast_kg)));
    const sumA = list.reduce((s, d) => s + Number(d.actual_kg), 0);
    return {
      n, enough: n >= cfg.min_days_to_judge,
      win: n ? Math.round(hits / n * 1000) / 10 : null,
      errAvg: n ? r2(avg(errs)) : null, errMax: n ? r2(Math.max(...errs)) : null,
      wape: n && sumA > 0 ? Math.round(errs.reduce((s, v) => s + v, 0) / sumA * 1000) / 10 : null
    };
  };
  const byItem = {};
  scored.forEach(d => { (byItem[d.item_id] = byItem[d.item_id] || []).push(d); });
  const items = {};
  Object.keys(byItem).forEach(k => { items[k] = sum(byItem[k]); });
  return { rows: (daily || []).length, all: sum(scored), items };
}

// ---------- ทดสอบสูตรที่ใช้อยู่กับข้อมูลจริง (หน้าสมการ Forecast) ----------

// ทายย้อนหลังทีละวันเปิดด้วยข้อมูลก่อนวันนั้นเท่านั้น · win = ใช้จริงอยู่ในกรอบ · loss = |ใช้จริง − ค่ากลาง| (เฉพาะวันที่หลุดกรอบ) · สรุป n วันล่าสุดต่อช่วง
export function liveTestOf(series, f, cfg, reg, band, windows) {
  if (!f) return null;
  const ev = evalFormula(series, f, { ...cfg, loss_mode: 'full' }, reg, band);
  const out = {};
  windows.forEach(w => {
    const pts = ev.pts.slice(-w);
    if (!pts.length) { out[w] = null; return; }
    const losses = pts.filter(p => !p.win).map(p => p.loss);
    out[w] = {
      n: pts.length,
      win: Math.round(pts.filter(p => p.win).length / pts.length * 1000) / 10,
      lossAvg: losses.length ? r2(losses.reduce((s, v) => s + v, 0) / losses.length) : 0,
      lossMax: losses.length ? r2(Math.max(...losses)) : 0
    };
  });
  return out;
}

// ผลใช้งานจริง (real time) ของวัตถุดิบ 1 ตัว จาก kk_forecast_daily: ค่าที่แนะนำไว้ล่วงหน้าจริง เทียบใช้จริงของวันนั้น
// win = ใช้จริงอยู่ในกรอบ · loss = |ใช้จริง − ค่ากลาง| เฉพาะวันที่หลุดกรอบ · ไม่นับวันที่ยังไม่มีผลจริง (วันหยุด/ยังไม่ปิดยอด) และแถวเตรียมคงที่
export function liveDailyOf(daily, itemId, windows) {
  const list = (daily || []).filter(d => d.item_id === itemId && d.actual_kg !== null && d.actual_kg !== undefined && !isFixedDaily(d))
    .sort((a, b) => (a.forecast_date < b.forecast_date ? -1 : 1));
  const out = {};
  windows.forEach(w => {
    const pts = list.slice(-w);
    if (!pts.length) { out[w] = null; return; }
    const losses = [];
    let wins = 0;
    pts.forEach(p => {
      const a = Number(p.actual_kg), lo = Number(p.lower_kg), hi = Number(p.upper_kg);
      if (a >= lo && a <= hi) wins += 1; else losses.push(Math.abs(a - Number(p.forecast_kg)));
    });
    out[w] = { n: pts.length, win: Math.round(wins / pts.length * 1000) / 10,
      lossAvg: losses.length ? r2(losses.reduce((s, v) => s + v, 0) / losses.length) : 0, lossMax: losses.length ? r2(Math.max(...losses)) : 0 };
  });
  return out;
}
