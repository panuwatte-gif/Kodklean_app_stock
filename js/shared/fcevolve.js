// ตัวสร้างสูตรใหม่ — ใช้ได้ 3 วิธี (ขยับพารามิเตอร์ / ผสมสูตร / แก้อคติรายวัน) ค่าทุกตัวอ่านจาก kk_forecast_config
// กติกากันเข้าข้างตัวเอง: เลือกสูตรแม่ ค่าแก้อคติ และผู้ท้าชิงจากส่วนคัด (2/3 วันแรก) เท่านั้น · วัดผลสูตรใหม่บนส่วนตัดสิน (1/3 วันหลัง) เท่านั้น
// ผลลัพธ์บันทึกเป็น "ผู้สมัคร" (status bench · active false · tag candidate) รอเจ้าของกดเอง ห้ามตั้ง testing/active อัตโนมัติ
import { evalFormula, predictorOf, splitDays, JUDGE_MIN_DAYS } from './fclab.js';

const num = v => Math.round(Number(v) * 100) / 100;

// นับพารามิเตอร์ตัวเลขของสูตร (ใช้ตรวจข้อห้าม evolve_max_params)
const paramCount = p => Object.keys(p).filter(k => typeof p[k] === 'number').length;

// ย้อนหลังที่สูตรนั้นต้องใช้ (ใช้ตรวจข้อห้าม evolve_max_lookback)
const lookback = p => Math.max(Number(p.window) || 0, (Number(p.weeks) || 0) * 6);

// ค่าแก้อคติรายวันในสัปดาห์ จาก residual ช่วง sd_window ล่าสุดของส่วนคัด (คืน [{dow, mean, share, n}])
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

// จัดอันดับสูตรแม่จากผลบนส่วนคัดเท่านั้น (สูตรที่เคยทดสอบกับวัตถุดิบนี้ · ไม่ใช้ค่า win_rate เก่าจาก trial)
function ranked(cutSeries, trials, reg, cfg, n) {
  const codes = [...new Set(trials.map(t => t.formula_code).filter(c => reg[c] && reg[c].status !== 'dropped' && reg[c].status !== 'control'))];
  return codes.map(c => ({ formula_code: c, win: evalFormula(cutSeries, reg[c], cfg, reg).winRate }))
    .filter(r => r.win !== null).sort((a, b) => b.win - a.win).slice(0, n);
}

// รวมผู้สมัครทั้ง 3 วิธี (ยังไม่ตรวจกติกา) — ทุกอย่างคิดจากส่วนคัด
function candidates(cutSeries, trials, reg, cfg) {
  const out = [];
  const top3 = ranked(cutSeries, trials, reg, cfg, 3), top2 = top3.slice(0, 2);
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

  // 3) แก้อคติรายวันในสัปดาห์ (เฉพาะวันที่ residual แรงและไปทางเดียวกันจริง — คิดจากส่วนคัด)
  const minKg = Number(cfg.evolve_bias_min_kg), minShare = Number(cfg.evolve_bias_min_share);
  top3.forEach(t => {
    const f = reg[t.formula_code];
    const hit = dowBias(cutSeries, f, cfg, reg).filter(d => Math.abs(d.mean) >= minKg && d.share >= minShare);
    if (!hit.length) return;
    out.push({
      code: `${f.formula_code}_bwd`, name: `${f.name_th} + แก้อคติรายวัน`, family: f.family,
      params: { ...(f.params || {}), base: f.formula_code, bias: 'weekday' }, source: 'bias_correct', parent: f.formula_code,
      eq: `${f.equation_th} บวก residual เฉลี่ยของวันเดียวกันจาก ${cfg.sd_window} ค่าล่าสุด`,
      note: hit.map(d => `วัน ${d.dow}: ${d.mean > 0 ? '+' : ''}${d.mean} กก. (${d.share}%)`).join(' · ')
    });
  });
  return out;
}

// สร้างสูตรใหม่จริง: ตรวจซ้ำ ตรวจข้อห้าม แล้ววัดผลบนส่วนตัดสินเทียบตัวเทียบ (ชุดวันเดียวกัน)
// คืน { rows: แถวที่จะบันทึก (ผู้สมัครทั้งหมด), skipped: [{code, why}], ctrl, judge }
export function evolve({ series, formulas, trials, cfg, ctrlCode = 'fixed_mean' }) {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  const parts = splitDays(series.map(s => s.date));
  const cutSeries = series.filter(s => parts.cut.includes(s.date));
  const judgeFrom = parts.judge[0] || null;
  const judge = { n: parts.judge.length, from: judgeFrom, to: parts.judge[parts.judge.length - 1] || null };
  const onJudge = f => evalFormula(series, f, cfg, reg, undefined, { from: judgeFrom });
  const ctrl = reg[ctrlCode] && judgeFrom ? onJudge(reg[ctrlCode]) : null;
  const rows = [], skipped = [], seen = {};
  if (parts.judge.length < JUDGE_MIN_DAYS) return { rows, skipped: [{ code: '-', why: `ส่วนตัดสินมี ${parts.judge.length} วัน ต้องมีอย่างน้อย ${JUDGE_MIN_DAYS} วัน` }], ctrl, judge };
  candidates(cutSeries, trials || [], reg, cfg).forEach(c => {
    if (seen[c.code]) return;
    seen[c.code] = 1;
    if (reg[c.code]) return skipped.push({ code: c.code, why: 'มีสูตรนี้อยู่แล้วในคลัง' });
    const old = (trials || []).find(t => t.formula_code === c.code);
    if (old && old.verdict === 'fail') return skipped.push({ code: c.code, why: `เคยทดสอบแล้วไม่ผ่าน (${old.verdict_reason || '-'})` });
    if (paramCount(c.params) > Number(cfg.evolve_max_params)) return skipped.push({ code: c.code, why: `พารามิเตอร์เกิน ${cfg.evolve_max_params} ตัว` });
    if (lookback(c.params) > Number(cfg.evolve_max_lookback)) return skipped.push({ code: c.code, why: `ย้อนหลังเกิน ${cfg.evolve_max_lookback} วัน` });

    const trial = onJudge({ formula_code: c.code, family: c.family, params: c.params });
    const beat = ctrl && ctrl.winRate !== null && trial.winRate !== null && trial.winRate > ctrl.winRate;
    rows.push({
      formula_code: c.code, name_th: c.name, family: c.family, equation_th: c.eq,
      params: c.params, status: 'bench', tags: ['candidate'],
      source: c.source, parent_code: c.parent, active: false, times_tested: 0, best_regime: null, last_verdict: null,
      note: `ผู้สมัครจาก${c.source} · ส่วนตัดสิน ${judge.from}–${judge.to} (${trial.n} วัน) win ${trial.winRate === null ? '—' : trial.winRate + '%'} เทียบ ${ctrlCode} ${ctrl && ctrl.winRate !== null ? ctrl.winRate + '%' : '—'} → ${beat ? 'ชนะ' : 'ไม่ชนะ'} · รอเจ้าของกดใช้${c.note ? ' · ' + c.note : ''}`,
      __win: trial.winRate, __n: trial.n, __beat: beat
    });
  });
  return { rows, skipped, ctrl, judge };
}
