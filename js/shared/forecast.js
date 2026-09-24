// เอนจินพยากรณ์วัตถุดิบสำหรับเตรียมของจริง — ใช้เอนจินเดียวกับห้องทดสอบ (fclab.js) บนข้อมูล kk_forecast_history
// สูตรของแต่ละวัตถุดิบอ่านจาก kk_forecast_model_map เท่านั้น · ใช้ข้อมูลก่อนวันที่พยากรณ์เท่านั้น · สูตรยอดขายถูกบังคับเป็นโหมดล่วงหน้า
import { buildSeries, predictorOf, evalFormula, bandOf, bandLabel, advanceFormulas, isNowcast, fcCtxOf, dowIso, prevOpenIso, bkkIso, sdOf, cfgProblems, EVAL_KEYS } from './fclab.js';
import { FORECAST_MODELS } from './config.js';

const r1 = n => Math.round(n * 10) / 10;
const r2 = n => Math.round(n * 100) / 100;
const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
const wd = iso => new Date(iso + 'T00:00:00').getDay();

// ของที่ยกมา = คงเหลือสดล่าสุดก่อนวันที่เลือก + คงเหลือใช้ต่อของอาหารปรุงสำเร็จของวันเปิดก่อนหน้า (แปลงเป็นเนื้อสัตว์แล้ว · data.js แนบมากับ logs)
// อาหารสุกยกมาไม่ได้บันทึก = ใช้คงเหลือสดอย่างเดียวและติดธงเตือน · คงเหลือสดเก่ากว่า 2 วันเปิด = ติดธงเตือนแต่คำนวณต่อ
export function carryOverInfo(logs, itemId, before) {
  const rows = (logs || []).filter(l => l.count_item_id === itemId && l.entry_type === 'คงเหลือ' && l.log_date < before && l.qty !== null).sort((a, b) => (a.log_date > b.log_date ? -1 : 1));
  const fresh = rows.length ? Number(rows[0].qty) : 0;
  const date = rows.length ? rows[0].log_date : null;
  const att = logs && logs.__cooked;
  const known = !!att && att.before === before && !att.missing[itemId];
  const cooked = known ? Number(att.kg[itemId] || 0) : 0;
  return { kg: r2(fresh + cooked), fresh, cooked, cookedMissing: !known, date, stale: !!date && date < prevOpenIso(prevOpenIso(before)) };
}

// ของที่ยกมา (กก.) ใช้หักออกจากแนะเป้า
export function carryOver(logs, itemId, before) {
  return carryOverInfo(logs, itemId, before).kg;
}

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
  return { p: null, why: need ? `มีข้อมูล ${series.length} วัน ต้องการอย่างน้อย ${need} วัน` : `ข้อมูลยังไม่พอ (มี ${series.length} วัน)` };
}

// สูตรสำรองจาก kk_forecast_trial: วัตถุดิบเดียวกัน · pass · ไม่ใช้ยอดขายทั้งสาย · กรอบตรง · ช่วงทดสอบจบและทดสอบก่อน/ในวันที่จะพยากรณ์
function fallbackCandidates(itemId, trials, orig, band, dateIso) {
  return (trials || []).filter(t => t.item_id === itemId && t.verdict === 'pass' && orig[t.formula_code] && !isNowcast(orig[t.formula_code], orig)
    && String(t.band_type || '').toUpperCase() === band.type && Number(t.band_value) === band.value
    && t.period_to && t.period_to < dateIso && t.tested_at && bkkIso(t.tested_at) <= dateIso)
    .sort((a, b) => (Number(b.win_rate) - Number(a.win_rate)) || (Number(b.n) - Number(a.n)) || (Number(a.loss_avg_kg) - Number(b.loss_avg_kg)));
}

// พยากรณ์ 1 รายการ ณ วันที่เลือก: ค่ากลาง + กรอบ (ลำดับกรอบเดียวกับห้องทดสอบ) + คะแนนทดสอบย้อนหลังจากข้อมูลก่อนวันนั้น
export function forecastItem(item, logs, dateIso, cfg, ctx) {
  const c = ctx || fcCtxOf(cfg) || {};
  const out = {
    id: item.id, name: item.name, grp: item.grp, model: { label: '' }, setCode: null, usedCode: null, fallbackWhy: null, fallbackTrial: null,
    modelType: null, n: 0, avg6: null, hist10: [], fc: null, lo: null, hi: null, sd: null, trend: null, wape: null, hitRate: null, hitN: 0,
    band: null, bandLabel: '', status: 'insufficient', statusText: '', salesWarn: false, forced: false, diff: null,
    carry: carryOverInfo(logs, item.id, dateIso)
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
    const band = bandOf(cfg, m, null);
    out.band = band; out.bandLabel = bandLabel(band);
    out.setCode = m.formula_code || null;
    out.salesWarn = isNowcast(orig[m.formula_code], orig);
    let f = m.formula_code ? adv[m.formula_code] : null;
    let res = m.formula_code ? tryPredict(f, adv, series, dateIso, cfg) : { p: null, why: 'ยังไม่ได้กำหนดสูตร' };
    if (res.p === null) {
      // สูตรที่ตั้งไว้คำนวณไม่ได้ → หาสูตรสำรองที่มีหลักฐานผ่านการทดสอบ ห้ามเดา ห้ามแก้ mapping
      out.fallbackWhy = res.why;
      const cand = fallbackCandidates(item.id, c.trials, orig, band, dateIso);
      let picked = null;
      for (const t of cand) {
        const r = tryPredict(adv[t.formula_code], adv, series, dateIso, cfg);
        if (r.p !== null) { picked = t; res = r; f = adv[t.formula_code]; break; }
      }
      if (!picked) { out.status = 'no_fallback'; out.model.label = `${m.formula_code || '—'} · กรอบ ${out.bandLabel}`; return out; }
      out.fallbackTrial = picked;
    }
    out.usedCode = f.formula_code;
    out.forced = !!f.forced;
    out.model.label = `${m.formula_code || '—'}${out.fallbackTrial ? ` → ใช้ ${f.formula_code}` : ''}${f.forced ? ' (โหมดล่วงหน้า: ยอดขายวันเปิดก่อนหน้า)' : ''} · กรอบ ${out.bandLabel}`;
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
export function buildForecast(items, logs, dateIso, cfg) {
  const ctx = fcCtxOf(cfg);
  const rows = (items || []).filter(i => i.grp === 'เนื้อสัตว์' || i.grp === 'ข้าวหุง').map(i => {
    try { return forecastItem(i, logs, dateIso, cfg, ctx); }
    catch { return { id: i.id, name: i.name, grp: i.grp, model: { label: '' }, status: 'error', fc: null, lo: null, hi: null, hist10: [], carry: null }; }
  });
  const ok = rows.filter(r => r.modelType === 'model' && r.hitRate !== null && r.hitRate !== undefined);
  const bands = [...new Set(ok.map(r => r.bandLabel).filter(Boolean))];
  const accuracy = ok.length
    ? { status: 'ok', rate: Math.round(ok.reduce((s, r) => s + r.hitRate, 0) / ok.length * 10) / 10, n: ok.length, bands }
    : { status: 'insufficient', n: 0, bands };
  return { rows, accuracy, cfg, cfgBad: cfgProblems(cfg, EVAL_KEYS) };
}

// แนะเป้าเตรียมของวัน = ขอบบน − ของที่ยกมา (ต่ำสุด 0, ปัดขึ้น 1 ตำแหน่ง) · วันเสาร์ใช้ค่าพยากรณ์ตรงๆ เพราะอาทิตย์ปิด ห้ามเผื่อ
export function recTarget(fcRow, carryKg, dateIso) {
  if (!fcRow || fcRow.fc === null) return null;
  const sat = wd(dateIso) === 6;
  const up = n => Math.ceil(Math.max(0, n - (carryKg || 0)) * 10) / 10;
  if (sat) return { t: up(fcRow.fc), lo: up(fcRow.fc), hi: up(fcRow.fc), sat };
  if (fcRow.hi === null) return { t: up(fcRow.fc), lo: null, hi: null, sat };
  return { t: up(fcRow.hi), lo: up(fcRow.lo), hi: up(fcRow.hi), sat };
}

// ใส่ค่าแนะนำให้แถวเนื้อสัตว์ (ขอบบน − ของที่ยกมา) และแถวข้าว (ค่าพยากรณ์ปัดขึ้น) — ใช้ร่วมหน้าเตรียม-เหลือ หน้าครัวอัด/เอมมี่ และหน้างานพนักงาน
export function applyRecs(model, fc, logs, dateIso) {
  const up = v => (v === null || v === undefined ? null : Math.ceil(v * 10) / 10);
  const rowOf = id => fc.rows.find(x => x.id === id);
  (model.meatRows || []).forEach(r => {
    const f = rowOf(r.id);
    r.rec = recTarget(f, carryOver(logs, r.id, dateIso), dateIso);
    r.carryStale = !!(f && f.carry && f.carry.stale);
    r.carryNoCooked = !!(f && f.carry && f.carry.cookedMissing);
  });
  (model.riceRows || []).forEach(r => {
    const f = rowOf(r.id);
    r.rec = f && f.fc !== null ? { t: up(f.fc), lo: up(f.lo), hi: up(f.hi), sat: false } : null;
  });
  return model;
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
