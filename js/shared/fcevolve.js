// ตัวสร้างสูตรใหม่ — ใช้ได้ 4 วิธีเท่านั้น (ขยับพารามิเตอร์ / ผสมสูตร / แก้อคติ / บีบกรอบ) ค่าทุกตัวอ่านจาก kk_forecast_config
import { evalFormula, predictorOf } from './fclab.js';

const num = v => Math.round(Number(v) * 100) / 100;

// นับพารามิเตอร์ตัวเลขของสูตร (ใช้ตรวจข้อห้าม evolve_max_params)
const paramCount = p => Object.keys(p).filter(k => typeof p[k] === 'number').length;

// ย้อนหลังที่สูตรนั้นต้องใช้ (ใช้ตรวจข้อห้าม evolve_max_lookback)
const lookback = p => Math.max(Number(p.window) || 0, (Number(p.weeks) || 0) * 6);

// ค่าแก้อคติรายวันในสัปดาห์ จาก residual ช่วง sd_window ล่าสุด (คืน [{dow, mean, share, n}])
function dowBias(series, f, cfg, reg) {
  const fn = predictorOf(f, reg);
  if (!fn) return [];
  const win = Number(cfg.sd_window), res = {};
  const from = Math.max(0, series.length - win);
  for (let i = from; i < series.length; i++) {
    const p = fn(series.slice(0, i), series[i], f.params || {}, f.formula_code, cfg);
    if (p === null || !isFinite(p)) continue;
    (res[series[i].dow] = res[series[i].dow] || []).push(series[i].used - p);
  }
  return Object.keys(res).map(d => {
    const a = res[d], m = a.reduce((s, v) => s + v, 0) / a.length;
    const same = a.filter(v => (m >= 0 ? v >= 0 : v < 0)).length;
    return { dow: Number(d), mean: num(m), share: Math.round(same / a.length * 100), n: a.length };
  });
}

// สร้างรายชื่อสูตรผู้ท้าชิงจากผลทดสอบของวัตถุดิบตัวนี้ (top-N ตาม win rate)
function ranked(trials, reg, n) {
  return trials.filter(t => reg[t.formula_code] && t.win_rate !== null)
    .sort((a, b) => Number(b.win_rate) - Number(a.win_rate))
    .slice(0, n);
}

// รวมผู้สมัครทั้ง 4 วิธี (ยังไม่ตรวจกติกา)
function candidates(series, trials, reg, cfg) {
  const out = [];
  const top3 = ranked(trials, reg, 3), top2 = ranked(trials, reg, 2);
  const step = Number(cfg.evolve_alpha_step), wstep = Number(cfg.evolve_window_step);

  // 1) ขยับพารามิเตอร์ของ 3 อันดับแรก
  top3.forEach(t => {
    const f = reg[t.formula_code], p = f.params || {};
    const add = (key, v, tag) => out.push({
      code: `${f.formula_code}_${tag}`, name: `${f.name_th} (${tag})`, family: f.family,
      params: { ...p, [key]: v, base: f.formula_code }, source: 'mutate', parent: f.formula_code,
      eq: `${f.equation_th} · ปรับ ${key} เป็น ${v}`
    });
    if (typeof p.alpha === 'number') {
      [p.alpha + step, p.alpha - step].filter(a => a >= 0.02 && a <= 0.95)
        .forEach(a => add('alpha', num(a), `a${Math.round(a * 100)}`));
    }
    if (typeof p.window === 'number') {
      [p.window + wstep, p.window - wstep].filter(w => w >= 2 && w <= Number(cfg.evolve_max_lookback))
        .forEach(w => add('window', w, `w${w}`));
    }
    if (typeof p.weeks === 'number') {
      [p.weeks + 1, p.weeks - 1].filter(w => w >= 1 && w * 6 <= Number(cfg.evolve_max_lookback))
        .forEach(w => add('weeks', w, `k${w}`));
    }
  });

  // 2) ผสม 2 สูตรที่ดีที่สุด ถ่วงน้ำหนัก 0.3 / 0.5 / 0.7
  if (top2.length === 2) {
    const [a, b] = top2;
    [0.3, 0.5, 0.7].forEach(w => out.push({
      code: `mix_${a.formula_code}_${b.formula_code}_${Math.round(w * 100)}`,
      name: `ผสม ${reg[a.formula_code].name_th} ${Math.round(w * 100)}% + ${reg[b.formula_code].name_th} ${Math.round((1 - w) * 100)}%`,
      family: reg[a.formula_code].family, params: { mix: [a.formula_code, b.formula_code], w },
      source: 'combine', parent: a.formula_code,
      eq: `${w} × ${a.formula_code} + ${num(1 - w)} × ${b.formula_code}`
    }));
  }

  // 3) แก้อคติรายวันในสัปดาห์ (เฉพาะวันที่ residual แรงและไปทางเดียวกันจริง)
  const minKg = Number(cfg.evolve_bias_min_kg), minShare = Number(cfg.evolve_bias_min_share);
  top3.forEach(t => {
    const f = reg[t.formula_code];
    const hit = dowBias(series, f, cfg, reg).filter(d => Math.abs(d.mean) >= minKg && d.share >= minShare);
    if (!hit.length) return;
    out.push({
      code: `${f.formula_code}_bwd`, name: `${f.name_th} + แก้อคติรายวัน`, family: f.family,
      params: { ...(f.params || {}), base: f.formula_code, bias: 'weekday' }, source: 'bias_correct', parent: f.formula_code,
      eq: `${f.equation_th} บวก residual เฉลี่ยของวันเดียวกันจาก ${cfg.sd_window} ค่าล่าสุด`,
      note: hit.map(d => `วัน ${d.dow}: ${d.mean > 0 ? '+' : ''}${d.mean} กก. (${d.share}%)`).join(' · ')
    });
  });

  // 4) บีบกรอบ เมื่อ win rate เกินเกณฑ์และผ่านการทดสอบมาแล้วหลายรอบ
  const tighten = Number(cfg.evolve_tighten_win), rounds = Number(cfg.promote_rounds_won);
  trials.forEach(t => {
    const f = reg[t.formula_code];
    if (!f || Number(t.win_rate) <= tighten) return;
    if (Number(f.times_tested || 0) < rounds) return;
    const band = num(Number(t.band_value || cfg.band_value) - Number(cfg.evolve_tighten_step));
    if (band <= 0) return;
    out.push({
      code: `${f.formula_code}_b${Math.round(band * 100)}`, name: `${f.name_th} (กรอบ ${band} SD)`, family: f.family,
      params: { ...(f.params || {}), base: f.formula_code, band_value: band }, source: 'band_adjust', parent: f.formula_code,
      eq: `${f.equation_th} · บีบกรอบเหลือ ${band} SD`
    });
  });
  return out;
}

// สร้างสูตรใหม่จริง: ตรวจซ้ำ ตรวจข้อห้าม แล้ววัดผลเทียบตัวเทียบก่อนตั้งสถานะ
// คืน { rows: แถวที่จะบันทึก, skipped: [{code, why}] }
export function evolve({ series, formulas, trials, cfg, ctrlCode = 'fixed_mean' }) {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  const ctrl = reg[ctrlCode] ? evalFormula(series, reg[ctrlCode], cfg, reg) : null;
  const rows = [], skipped = [], seen = {};
  candidates(series, trials || [], reg, cfg).forEach(c => {
    if (seen[c.code]) return;
    seen[c.code] = 1;
    if (reg[c.code]) return skipped.push({ code: c.code, why: 'มีสูตรนี้อยู่แล้วในคลัง' });
    const old = (trials || []).find(t => t.formula_code === c.code);
    if (old && old.verdict === 'fail') return skipped.push({ code: c.code, why: `เคยทดสอบแล้วไม่ผ่าน (${old.verdict_reason || '-'})` });
    if (paramCount(c.params) > Number(cfg.evolve_max_params)) return skipped.push({ code: c.code, why: `พารามิเตอร์เกิน ${cfg.evolve_max_params} ตัว` });
    if (lookback(c.params) > Number(cfg.evolve_max_lookback)) return skipped.push({ code: c.code, why: `ย้อนหลังเกิน ${cfg.evolve_max_lookback} วัน` });

    const trial = evalFormula(series, { formula_code: c.code, family: c.family, params: c.params }, cfg, reg);
    const beat = ctrl && ctrl.winRate !== null && trial.winRate !== null && trial.winRate > ctrl.winRate;
    const pass = trial.enough && beat;
    rows.push({
      formula_code: c.code, name_th: c.name, family: c.family, equation_th: c.eq,
      params: c.params, status: pass ? 'testing' : 'dropped', tags: [],
      source: c.source, parent_code: c.parent, active: pass, times_tested: 0, best_regime: null, last_verdict: null,
      note: pass
        ? `สร้างจาก${c.source} · ชนะตัวเทียบ ${ctrlCode} (${trial.winRate}% > ${ctrl.winRate}%)${c.note ? ' · ' + c.note : ''}`
        : `ไม่ผ่านด่านแรก: ${!trial.enough ? `วันวัดผล ${trial.n} วัน ไม่ถึง ${cfg.min_days_to_judge} วัน` : `แพ้ตัวเทียบ ${ctrlCode} (${trial.winRate}% ≤ ${ctrl ? ctrl.winRate : '—'}%)`}`,
      __win: trial.winRate, __n: trial.n
    });
  });
  return { rows, skipped, ctrl };
}
