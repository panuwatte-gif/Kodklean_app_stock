// เอนจินห้องทดสอบสูตรพยากรณ์ — รันสูตรทุกตัวจาก kk_forecast_formula บนข้อมูลจริง kk_forecast_history
// กติกาเหล็ก: เดินวันต่อวัน (walk-forward) ทำนายวันที่ t ใช้ได้เฉพาะข้อมูลก่อนวันที่ t · ห้ามเติมค่าแทนวันว่าง · กฎทุกข้ออ่านจาก kk_forecast_config

// ธงที่ต้องข้ามทิ้ง (ข้อมูลผิดหรือไม่มีของจริง)
const SKIP_FLAGS = ['anomaly_excluded', 'actual_missing', 'no_prep_record'];

const r1 = n => Math.round(n * 10) / 10;
const r2 = n => Math.round(n * 100) / 100;
const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// ส่วนเบี่ยงเบนมาตรฐานแบบ sample (หาร n−1)
export function sdOf(a) {
  if (a.length < 2) return 0;
  const m = avg(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1));
}

// แปลงตาราง kk_forecast_config เป็นค่าใช้งาน (ตัวเลข = number, ข้อความ = string)
export function parseCfg(rows) {
  const o = {};
  (rows || []).forEach(r => { o[r.config_key] = r.value_text === null || r.value_text === undefined ? Number(r.value_num) : r.value_text; });
  return o;
}

// ซีรีส์ใช้จริงรายวันของ 1 วัตถุดิบ เรียงเก่า→ใหม่ (ข้ามแถวที่ used_kg ว่างหรือติดธงที่ต้องตัด · อาทิตย์ร้านปิด · เสาร์ตัดตามกฎ)
export function buildSeries(history, itemId, cfg) {
  return (history || [])
    .filter(h => h.item_id === itemId && h.used_kg !== null && h.used_kg !== undefined
      && !SKIP_FLAGS.includes(h.flag) && Number(h.dow_num) !== 0
      && !(Number(cfg.exclude_saturday) === 1 && Number(h.dow_num) === 6))
    .map(h => ({ date: h.use_date, used: Number(h.used_kg), theo: h.theo_kg === null ? null : Number(h.theo_kg), dow: Number(h.dow_num) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

// ---------- ตัวช่วยของสูตร (h = ข้อมูลก่อนวันที่ทำนายเท่านั้น) ----------
const vals = h => h.map(x => x.used);
const win = (h, n, f) => (h.length >= n ? f(vals(h).slice(-n)) : null);
const emaOf = (h, alpha) => { const v = vals(h); if (!v.length) return null; let e = v[0]; for (let i = 1; i < v.length; i++) e = alpha * v[i] + (1 - alpha) * e; return e; };
const sameDow = (h, dow) => h.filter(x => x.dow === dow).map(x => x.used);

// ตัวคูณของวันในสัปดาห์ = เฉลี่ยวันนั้น ÷ เฉลี่ยรวม
function dowFactor(h, dow) {
  const same = sameDow(h, dow), all = vals(h);
  if (!same.length || !all.length) return null;
  const m = avg(all);
  return m > 0 ? avg(same) / m : null;
}

// เฉลี่ยตัดหัวท้าย (ตัดค่าสูงสุดและต่ำสุดออก)
function trimMean(h, n) {
  if (h.length < n) return null;
  const s = vals(h).slice(-n).sort((a, b) => a - b);
  return avg(s.slice(1, -1));
}

// ถ่วงน้ำหนักวันล่าสุดหนักสุด (6,5,4,3,2,1 ÷ 21)
function wma(h, n) {
  if (h.length < n) return null;
  const s = vals(h).slice(-n);
  let num = 0, den = 0;
  s.forEach((v, i) => { const w = i + 1; num += v * w; den += w; });
  return num / den;
}

// MA + ค่าแก้อคติของวันในสัปดาห์ (residual เฉลี่ยจากช่วง sd_window ล่าสุด)
function biasWd(h, target, n, sdWin) {
  const base = win(h, n, avg);
  if (base === null) return null;
  const from = Math.max(n, h.length - sdWin), res = [];
  for (let i = from; i < h.length; i++) {
    if (h[i].dow !== target.dow) continue;
    const p = win(h.slice(0, i), n, avg);
    if (p !== null) res.push(h[i].used - p);
  }
  return res.length ? base + avg(res) : base;
}

// อัตราส่วนใช้จริง ÷ ยอดขายแปลง (นับเฉพาะวันที่ยอดขายมากกว่า 0.05)
function ratios(h, { window: w, dow }) {
  const pool = dow === undefined ? (w ? h.slice(-w) : h) : h.filter(x => x.dow === dow);
  return pool.filter(x => x.theo !== null && x.theo > 0.05).map(x => x.used / x.theo);
}

// ค่าพยากรณ์จากยอดขายแปลง (null = วันนั้นไม่มียอดขาย หรืออัตราส่วนย้อนหลังไม่มี)
function theoPred(h, target, opt, useMean) {
  if (target.theo === null || target.theo <= 0.05) return null;
  const rs = ratios(h, opt);
  return rs.length ? target.theo * (useMean ? avg(rs) : med(rs)) : null;
}

// ---------- ตัวคำนวณของแต่ละกลุ่มสูตร ----------
const FAMILY = {
  mean: (h, t, p, code, cfg) => {
    if (code === 'naive_last') return h.length ? h[h.length - 1].used : null;
    if (code === 'MED3' || code === 'MED6') return win(h, p.window, med);
    if (code === 'TRIM6') return trimMean(h, p.window);
    if (code === 'WMA6') return wma(h, p.window);
    if (code === 'MA6_bias_wd') return biasWd(h, t, p.window, Number(cfg.sd_window));
    return win(h, p.window || 6, avg);
  },
  ema: (h, t, p) => emaOf(h, p.alpha),
  weekday: (h, t, p, code) => {
    const same = sameDow(h, t.dow);
    if (code === 'sameday_lastwk') return same.length ? same[same.length - 1] : null;
    if (code === 'weekday_med') return same.length ? med(same) : null;
    if (code === 'weekday_mean') return same.length ? avg(same) : null;
    if (code === 'weekday_ratio') { const b = win(h, p.window || 12, avg), f = dowFactor(h, t.dow); return b === null || f === null ? null : b * f; }
    if (code === 'EMA_wd_adj') { const e = emaOf(h, p.alpha || 0.3), f = dowFactor(h, t.dow); return e === null || f === null ? null : e * f; }
    return p.weeks && same.length >= p.weeks ? avg(same.slice(-p.weeks)) : null;
  },
  sales: (h, t, p, code) => {
    if (code === 'theo_direct') return theoPred(h, t, {}, true);
    if (code === 'ratio_theo_wd') return theoPred(h, t, { dow: t.dow }, false);
    if (code.startsWith('blend')) {
      const e = emaOf(h, p.alpha || 0.3), r = theoPred(h, t, { window: code === 'blend_EMA_theo' ? 12 : 6 }, false);
      if (e === null || r === null) return null;
      const w = p.w === undefined ? 0.5 : p.w;
      return w * e + (1 - w) * r;
    }
    return theoPred(h, t, { window: p.window || 12 }, false);
  },
  trend: (h, t, p, code) => {
    const v = vals(h);
    if (code === 'AR1') {
      if (v.length < 4) return null;
      const m = avg(v);
      let num = 0, den = 0;
      for (let i = 1; i < v.length; i++) num += (v[i] - m) * (v[i - 1] - m);
      v.forEach(x => { den += (x - m) * (x - m); });
      const phi = den > 0 ? Math.min(0.95, Math.max(-0.95, num / den)) : 0;
      return m + phi * (v[v.length - 1] - m);
    }
    if (code === 'drift') {
      const w = p.window || 12;
      if (v.length < w) return null;
      const s = v.slice(-w);
      return s[w - 1] + (s[w - 1] - s[0]) / (w - 1);
    }
    if (v.length < 3) return null;
    let l = v[0], b = v[1] - v[0];
    const a = p.alpha || 0.3, be = p.beta || 0.1, d = p.damp || 0.7;
    for (let i = 1; i < v.length; i++) { const pl = l; l = a * v[i] + (1 - a) * (pl + d * b); b = be * (l - pl) + (1 - be) * d * b; }
    return l + d * b;
  },
  control: h => (h.length ? avg(vals(h)) : null)
};

// เลือกตัวคำนวณของสูตร — รองรับสูตรที่ระบบสร้างใหม่: ผสมสองสูตร (mix) · อ้างสูตรแม่ (base) · ชั้นแก้อคติรายวัน (bias)
export function predictorOf(f, reg) {
  const p = f.params || {};
  if (p.mix && reg) {
    const A = reg[p.mix[0]], B = reg[p.mix[1]];
    if (!A || !B) return null;
    const fa = predictorOf(A, reg), fb = predictorOf(B, reg);
    if (!fa || !fb) return null;
    const w = p.w === undefined ? 0.5 : p.w;
    return (h, t, cp, code, cfg) => {
      const a = fa(h, t, A.params || {}, A.formula_code, cfg), b = fb(h, t, B.params || {}, B.formula_code, cfg);
      return a === null || b === null ? null : w * a + (1 - w) * b;
    };
  }
  if (p.base && reg && reg[p.base]) {
    const B = reg[p.base], fb = FAMILY[B.family];
    if (!fb) return null;
    // ใช้ตัวคำนวณของสูตรแม่ แต่ใช้ค่าพารามิเตอร์ของสูตรใหม่
    const base = (h, t, cp, code, cfg) => fb(h, t, cp, B.formula_code, cfg);
    if (p.bias !== 'weekday') return base;
    return (h, t, cp, code, cfg) => {
      const b0 = base(h, t, cp, code, cfg);
      if (b0 === null) return null;
      const from = Math.max(0, h.length - Number(cfg.sd_window)), res = [];
      for (let i = from; i < h.length; i++) {
        if (h[i].dow !== t.dow) continue;
        const q = base(h.slice(0, i), h[i], cp, code, cfg);
        if (q !== null && isFinite(q)) res.push(h[i].used - q);
      }
      return res.length ? b0 + avg(res) : b0;
    };
  }
  return FAMILY[f.family] || null;
}

// วัดผลสูตร 1 ตัวบนวัตถุดิบ 1 ตัว แบบ walk-forward (คืนตัวเลขปริมาณ หน่วยกิโลกรัมเท่านั้น)
export function evalFormula(series, f, cfg, reg) {
  const fn = predictorOf(f, reg);
  const out = { code: f.formula_code, name: f.name_th, family: f.family, status: f.status, n: 0, wins: 0, lossN: 0, winRate: null, lossMax: null, lossAvg: null, lossMin: null, lossSum: null, bandAvg: null, band: null, pts: [], enough: false };
  if (!fn || !series.length) return out;
  const isPct = String(cfg.band_type).toUpperCase() === 'PCT';
  const own = (f.params || {}).band_value;
  const bv = own === undefined ? Number(cfg.band_value) : Number(own), bp = Number(cfg.band_pct) / 100;
  const sdWin = Number(cfg.sd_window), sdMin = Number(cfg.sd_min_obs);
  const edgeWin = Number(cfg.edge_counts_as_win) === 1, full = String(cfg.loss_mode) === 'full';
  const res = [], losses = [];
  let bandSum = 0;
  for (let i = 0; i < series.length; i++) {
    const row = series[i], h = series.slice(0, i);
    let p = null;
    try { p = fn(h, row, f.params || {}, f.formula_code, cfg); } catch { p = null; }
    if (p === null || !isFinite(p)) continue;
    p = Math.max(0, p);
    let half = null;
    if (isPct) half = bp * p;
    else { const w = res.slice(-sdWin); if (w.length >= sdMin) half = bv * sdOf(w); }
    if (half !== null) {
      const lo = Math.max(0, p - half), hi = p + half;
      const inside = edgeWin ? row.used >= lo && row.used <= hi : row.used > lo && row.used < hi;
      out.n += 1;
      bandSum += hi - lo;
      if (inside) out.wins += 1;
      else losses.push(full ? Math.abs(row.used - p) : row.used > hi ? row.used - hi : lo - row.used);
      out.pts.push({ date: row.date, a: r2(row.used), p: r2(p), lo: r2(lo), hi: r2(hi), win: inside });
    }
    res.push(row.used - p);
  }
  if (!out.n) return out;
  out.band = isPct ? Number(cfg.band_pct) : bv;
  out.lossN = losses.length;
  out.winRate = Math.round(out.wins / out.n * 1000) / 10;
  out.bandAvg = r2(bandSum / out.n);
  if (losses.length) {
    out.lossMax = r2(Math.max(...losses));
    out.lossMin = r2(Math.min(...losses));
    out.lossSum = r2(losses.reduce((s, v) => s + v, 0));
    out.lossAvg = r2(out.lossSum / losses.length);
  } else { out.lossMax = 0; out.lossMin = 0; out.lossSum = 0; out.lossAvg = 0; }
  out.enough = out.n >= Number(cfg.min_days_to_judge);
  return out;
}

// รันทุกสูตรที่ยังไม่ถูกคัดออก แล้วเรียง win rate สูง→ต่ำ ถ้าเท่ากันเรียงแพ้เฉลี่ยน้อย→มาก
export function runAll(series, formulas, cfg) {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  return (formulas || []).filter(f => f.status !== 'dropped')
    .map(f => evalFormula(series, f, cfg, reg))
    .sort((a, b) => {
      const aw = a.winRate === null ? -1 : a.winRate, bw = b.winRate === null ? -1 : b.winRate;
      if (bw !== aw) return bw - aw;
      return (a.lossAvg === null ? 9e9 : a.lossAvg) - (b.lossAvg === null ? 9e9 : b.lossAvg);
    });
}

// สถานการณ์ของวัตถุดิบ: เฉลี่ย 4 สัปดาห์ล่าสุด เทียบ 4 สัปดาห์ก่อนหน้า
export function regimeOf(series, cfg) {
  if (series.length < 8) return { regime: null, slopePct: null, from: null, to: null };
  const end = series[series.length - 1].date;
  const shift = d => { const x = new Date(end + 'T00:00:00'); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); };
  const c1 = shift(28), c2 = shift(56);
  const recent = series.filter(s => s.date > c1).map(s => s.used);
  const prev = series.filter(s => s.date > c2 && s.date <= c1).map(s => s.used);
  if (recent.length < 4 || prev.length < 4 || avg(prev) <= 0) return { regime: null, slopePct: null, from: c2, to: end };
  const pct = (avg(recent) - avg(prev)) / avg(prev) * 100;
  const g = Number(cfg.regime_growth_pct), d = Number(cfg.regime_decline_pct);
  return { regime: pct > g ? 'growth' : pct < d ? 'decline' : 'stable', slopePct: r1(pct), from: c2, to: end };
}

// สภาพปัจจุบันของวัตถุดิบ: เฉลี่ยใช้จริง 6 วัน · ความแกว่ง · จำนวนวันที่มีข้อมูล
export function itemState(series, cfg) {
  const v = vals(series);
  const last6 = v.slice(-6);
  const swing = v.slice(-Number(cfg.sd_window));
  const m = last6.length ? avg(last6) : null;
  const s = swing.length >= 2 ? sdOf(swing) : null;
  return {
    n: v.length,
    avg6: m === null ? null : r2(m),
    sd: s === null ? null : r2(s),
    cv: s === null || !m ? null : Math.round(s / avg(swing) * 100),
    from: series.length ? series[0].date : null,
    to: series.length ? series[series.length - 1].date : null
  };
}

// ตัดสินผ่าน/ไม่ผ่านตามเกณฑ์ใน config (ctrl = ผลของสูตรตัวเทียบ)
export function verdictOf(row, ctrl, cfg) {
  const min = Number(cfg.min_days_to_judge);
  if (!row.enough) return { verdict: 'inconclusive', reason: `วันวัดผล ${row.n} วัน ยังไม่ถึงขั้นต่ำ ${min} วัน` };
  const th = Number(cfg.elim_win_threshold);
  if (Number(cfg.elim_lose_to_control) === 1 && ctrl && ctrl.winRate !== null && row.code !== ctrl.code && row.winRate < ctrl.winRate)
    return { verdict: 'fail', reason: `แพ้ตัวเทียบ ${ctrl.code} (${row.winRate}% < ${ctrl.winRate}%)` };
  if (row.winRate < th) return { verdict: 'fail', reason: `win rate ${row.winRate}% ต่ำกว่าเกณฑ์ ${th}%` };
  return { verdict: 'pass', reason: `win rate ${row.winRate}% ถึงเกณฑ์ ${th}% และไม่แพ้ตัวเทียบ` };
}
