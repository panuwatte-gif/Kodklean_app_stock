// เอนจินห้องทดสอบสูตรพยากรณ์ — รันสูตรทุกตัวจาก kk_forecast_formula บนข้อมูลจริง kk_forecast_history
// กติกาเหล็ก: เดินวันต่อวัน (walk-forward) ทำนายวันที่ t ใช้ได้เฉพาะข้อมูลก่อนวันที่ t · ห้ามเติมค่าแทนวันว่าง · กฎทุกข้ออ่านจาก kk_forecast_config

// ธงที่ต้องข้ามทิ้ง (ข้อมูลผิดหรือไม่มีของจริง)
const SKIP_FLAGS = ['anomaly_excluded', 'actual_missing', 'no_prep_record', 'incomplete'];

// ---------- วันที่ (คิดบนปฏิทินล้วน ไม่ขึ้นกับเขตเวลาเครื่อง · วันที่ในฐานเป็นวันตามเวลาไทยอยู่แล้ว) ----------

// เลื่อนวันที่แบบ YYYY-MM-DD ไป n วัน
export function addDaysIso(iso, n) {
  const x = new Date(iso + 'T00:00:00Z');
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
}

// วันในสัปดาห์ของวันที่ (อาทิตย์ 0 จันทร์ 1 … เสาร์ 6)
export const dowIso = iso => new Date(iso + 'T00:00:00Z').getUTCDay();

// วันเปิดก่อนหน้า = วันล่าสุดก่อนวันที่นั้นที่ไม่ใช่วันอาทิตย์ (จันทร์ → เสาร์)
export function prevOpenIso(iso) {
  let d = addDaysIso(iso, -1);
  while (dowIso(d) === 0) d = addDaysIso(d, -1);
  return d;
}

// วันเปิดถัดไป (เสาร์ → จันทร์)
export function nextOpenIso(iso) {
  let d = addDaysIso(iso, 1);
  while (dowIso(d) === 0) d = addDaysIso(d, 1);
  return d;
}

// แปลงเวลา (timestamp) เป็นวันที่ตามเวลาไทย Asia/Bangkok
export const bkkIso = t => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t));

// ---------- แนบข้อมูลพยากรณ์ไปกับกฎ (ประวัติ + สูตรที่ผูก + คลังสูตร) โดยไม่โผล่ตอนวนค่าของกฎ ----------
export function withFcCtx(cfg, ctx) {
  Object.defineProperty(cfg, '__fc', { value: ctx, enumerable: false, configurable: true });
  return cfg;
}
// อ่านข้อมูลพยากรณ์ที่แนบไว้ (ไม่มี = null)
export const fcCtxOf = cfg => (cfg && cfg.__fc) || null;

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

// ชื่อกฎที่ต้องเป็นข้อความ (ที่เหลือต้องเป็นตัวเลข)
const CFG_TEXT = ['band_type', 'loss_mode'];

// แปลงตาราง kk_forecast_config เป็นค่าใช้งาน — แยก "ไม่มีค่า" "ค่าว่าง" "แปลงเป็นตัวเลขไม่ได้" ออกจากเลข 0 (ค่าที่มีปัญหาเก็บเป็น undefined และจดชื่อไว้)
export function parseCfg(rows) {
  const o = {}, bad = {};
  (rows || []).forEach(r => {
    const k = r.config_key;
    const txt = r.value_text === null || r.value_text === undefined ? null : String(r.value_text).trim();
    if (CFG_TEXT.includes(k)) {
      if (txt) o[k] = txt; else { o[k] = undefined; bad[k] = 'ไม่มีค่า'; }
      return;
    }
    if (txt) { o[k] = txt; return; }
    const raw = r.value_num;
    if (raw === null || raw === undefined) { o[k] = undefined; bad[k] = 'ไม่มีค่า'; return; }
    if (String(raw).trim() === '') { o[k] = undefined; bad[k] = 'ค่าว่าง'; return; }
    const n = Number(raw);
    if (!Number.isFinite(n)) { o[k] = undefined; bad[k] = 'ไม่ใช่ตัวเลข'; return; }
    o[k] = n;
  });
  Object.defineProperty(o, '__bad', { value: bad, enumerable: false, configurable: true });
  return o;
}

// กฎที่ต้องใช้แต่หาย/ผิดชนิด (คืนรายชื่อพร้อมเหตุผล ว่าง = ใช้ได้ครบ) — ห้ามเดาค่าแทน
export function cfgProblems(cfg, keys) {
  const bad = (cfg && cfg.__bad) || {};
  return keys.filter(k => {
    const v = cfg ? cfg[k] : undefined;
    if (CFG_TEXT.includes(k)) return typeof v !== 'string' || !v;
    return typeof v !== 'number' || !Number.isFinite(v);
  }).map(k => `${k} (${bad[k] || (cfg && k in cfg ? 'ผิดชนิด' : 'ไม่มีในตาราง')})`);
}

// ชุดกฎที่การวัดผลแบบ walk-forward ต้องใช้
export const EVAL_KEYS = ['band_type', 'band_value', 'band_pct', 'edge_counts_as_win', 'loss_mode', 'sd_window', 'sd_min_obs', 'min_days_to_judge', 'exclude_saturday'];

// ซีรีส์ใช้จริงรายวันของ 1 วัตถุดิบ เรียงเก่า→ใหม่ (ข้ามแถวที่ used_kg ว่างหรือติดธงที่ต้องตัด · อาทิตย์ร้านปิด · เสาร์ตัดตามกฎ · src = กรองตามแหล่งข้อมูล)
export function buildSeries(history, itemId, cfg, src) {
  return (history || [])
    .filter(h => h.item_id === itemId && h.used_kg !== null && h.used_kg !== undefined
      && (!src || src === 'all' || (h.source || 'cleaned_v2') === src)
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

// ยอดขายแปลงที่สูตรได้ใช้ของวันที่ทำนาย
// โหมด advance = ใช้ยอดขายที่รู้ก่อนวันทำนายเท่านั้น (วันเปิดก่อนหน้า หรือวันเดียวกันสัปดาห์ก่อน) · โหมด nowcast = ยอดขายของวันนั้นเอง
function theoAt(h, t, p) {
  if (p.mode !== 'advance') return t.theo;
  const want = p.theo_from === 'same_dow_last_week' ? addDaysIso(t.date, -7) : prevOpenIso(t.date);
  for (let i = h.length - 1; i >= 0; i--) if (h[i].date === want) return h[i].theo;
  return null;
}

// ค่าพยากรณ์จากยอดขายแปลง (null = ไม่มียอดขายที่ใช้ได้ หรืออัตราส่วนย้อนหลังไม่มี)
function theoPred(h, target, opt, useMean, p) {
  const th = theoAt(h, target, p || {});
  if (th === null || th === undefined || th <= 0.05) return null;
  const rs = ratios(h, opt);
  return rs.length ? th * (useMean ? avg(rs) : med(rs)) : null;
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
    // กลุ่มวัน (เช่น จ–พฤ / ศ–ส): เฉลี่ย n วันเปิดล่าสุดที่อยู่กลุ่มเดียวกับวันที่ทำนาย (มีไม่ถึง n ใช้เท่าที่มี ขั้นต่ำ 2 วัน)
    if (p.dow_groups) {
      const g = p.dow_groups.find(x => x.includes(t.dow));
      const pool = g ? h.filter(x => g.includes(x.dow)).map(x => x.used) : [];
      return pool.length >= 2 ? avg(pool.slice(-(p.n || 5))) : null;
    }
    const same = sameDow(h, t.dow);
    if (code === 'sameday_lastwk') return same.length ? same[same.length - 1] : null;
    if (code === 'weekday_med') return same.length ? med(same) : null;
    if (code === 'weekday_mean') return same.length ? avg(same) : null;
    if (code === 'weekday_ratio') { const b = win(h, p.window || 12, avg), f = dowFactor(h, t.dow); return b === null || f === null ? null : b * f; }
    if (code === 'EMA_wd_adj') { const e = emaOf(h, p.alpha || 0.3), f = dowFactor(h, t.dow); return e === null || f === null ? null : e * f; }
    return p.weeks && same.length >= p.weeks ? avg(same.slice(-p.weeks)) : null;
  },
  sales: (h, t, p, code) => {
    const k = p.sales_of || code;   // สูตรโหมด advance อ้างรหัสสูตรต้นแบบไว้ใน params.sales_of
    if (k === 'theo_direct') return theoPred(h, t, {}, true, p);
    if (k === 'ratio_theo_wd') return theoPred(h, t, { dow: t.dow }, false, p);
    if (k.startsWith('blend')) {
      const e = emaOf(h, p.alpha || 0.3), r = theoPred(h, t, { window: k === 'blend_EMA_theo' ? 12 : 6 }, false, p);
      if (e === null || r === null) return null;
      const w = p.w === undefined ? 0.5 : p.w;
      return w * e + (1 - w) * r;
    }
    return theoPred(h, t, { window: p.window || 12 }, false, p);
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

// สูตรนี้ใช้ยอดขายของวันที่กำลังทำนาย (nowcast) หรือไม่ — รวมสูตรผสม/สูตรที่อ้างสูตรแม่
export function isNowcast(f, reg) {
  if (!f) return false;
  const p = f.params || {};
  if (p.mix && reg) return p.mix.some(c => isNowcast(reg[c], reg));
  const fam = p.base && reg && reg[p.base] ? reg[p.base].family : f.family;
  return fam === 'sales' && p.mode !== 'advance';
}

// คลังสูตรฉบับใช้พยากรณ์ล่วงหน้า: สูตรยอดขายที่ยังเป็น nowcast ถูกบังคับเป็นโหมด advance (ยอดขายวันเปิดก่อนหน้า) และติดป้าย forced
export function advanceFormulas(formulas) {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  return (formulas || []).map(f => {
    const p = f.params || {};
    const fam = p.base && reg[p.base] ? reg[p.base].family : f.family;
    if (fam !== 'sales' || p.mode === 'advance') return f;
    return { ...f, forced: true, params: { ...p, mode: 'advance', theo_from: p.theo_from || 'prev_open' } };
  });
}

// กรอบที่ใช้วัดผล: ค่ารายวัตถุดิบใน kk_forecast_model_map มาก่อน > ค่าของสูตรเอง (สูตรที่สร้างมาทดสอบกรอบ) > ค่ากลางใน kk_forecast_config — ลำดับเดียวกันทั้ง SD และ PCT
export function bandOf(cfg, mapRow, f) {
  const m = mapRow || {};
  const t = m.band_type || cfg.band_type;
  if (!t) return { type: null, value: null, src: 'missing' };
  const type = String(t).toUpperCase() === 'PCT' ? 'PCT' : 'SD';
  if (m.band_value !== null && m.band_value !== undefined && m.band_value !== '') return { type, value: Number(m.band_value), src: 'item' };
  const own = ((f && f.params) || {}).band_value;
  if (own !== undefined && own !== null && type === 'SD') return { type, value: Number(own), src: 'formula' };
  const v = type === 'PCT' ? cfg.band_pct : cfg.band_value;
  return { type, value: typeof v === 'number' ? v : null, src: typeof v === 'number' ? 'config' : 'missing' };
}

// ป้ายกรอบสั้นๆ ไว้แสดงคู่กับ win rate ทุกครั้ง (เทียบข้ามกรอบไม่ได้)
export const bandLabel = b => (!b || b.value === null || b.value === undefined || isNaN(b.value) ? '' : b.type === 'PCT' ? `±${b.value}%` : `±${b.value} SD`);

// วัดผลสูตร 1 ตัวบนวัตถุดิบ 1 ตัว แบบ walk-forward (คืนตัวเลขปริมาณ หน่วยกิโลกรัมเท่านั้น · band = กรอบจาก bandOf · opt.from/to = นับคะแนนเฉพาะช่วงนี้ ข้อมูลก่อนหน้าใช้สะสมเท่านั้น)
export function evalFormula(series, f, cfg, reg, band, opt = {}) {
  const fn = predictorOf(f, reg);
  const B = band || bandOf(cfg, null, f);
  const out = { code: f.formula_code, name: f.name_th, family: f.family, status: f.status, nowcast: isNowcast(f, reg), n: 0, wins: 0, lossN: 0, winRate: null, lossMax: null, lossAvg: null, lossMin: null, lossSum: null, bandAvg: null, band: B.value, bandType: B.type, bandLabel: bandLabel(B), pts: [], resid: [], sumA: 0, sumAbs: 0, nPred: 0, enough: false };
  if (B.value === null || B.value === undefined || !B.type) { out.bandMissing = true; return out; }
  if (!fn || !series.length) return out;
  const isPct = B.type === 'PCT';
  const bv = B.value, bp = B.value / 100;
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
    const scored = (!opt.from || row.date >= opt.from) && (!opt.to || row.date <= opt.to);
    if (half !== null && scored) {
      const lo = Math.max(0, p - half), hi = p + half;
      const inside = edgeWin ? row.used >= lo && row.used <= hi : row.used > lo && row.used < hi;
      const loss = inside ? 0 : full ? Math.abs(row.used - p) : row.used > hi ? row.used - hi : lo - row.used;
      out.n += 1;
      bandSum += hi - lo;
      if (inside) out.wins += 1;
      else losses.push(loss);
      out.pts.push({ date: row.date, a: r2(row.used), p: r2(p), lo: r2(lo), hi: r2(hi), win: inside, loss: r2(loss) });
    }
    res.push(row.used - p);
    out.nPred += 1; out.sumA += row.used; out.sumAbs += Math.abs(row.used - p);
  }
  out.resid = res;
  if (!out.n) return out;
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

// สรุปผลของสูตร 1 ตัวใหม่ เฉพาะวันที่อยู่ในชุดวันที่กำหนด (ใช้ให้ทุกสูตรนับคะแนนบนชุดวันเดียวกัน)
function restrict(ev, days, cfg) {
  const pts = ev.pts.filter(p => days.has(p.date));
  const out = { ...ev, pts, n: pts.length, wins: pts.filter(p => p.win).length };
  const losses = pts.filter(p => !p.win).map(p => p.loss);
  out.lossN = losses.length;
  out.winRate = out.n ? Math.round(out.wins / out.n * 1000) / 10 : null;
  out.bandAvg = out.n ? r2(pts.reduce((s, p) => s + (p.hi - p.lo), 0) / out.n) : null;
  out.lossMax = losses.length ? r2(Math.max(...losses)) : out.n ? 0 : null;
  out.lossMin = losses.length ? r2(Math.min(...losses)) : out.n ? 0 : null;
  out.lossSum = out.n ? r2(losses.reduce((s, v) => s + v, 0)) : null;
  out.lossAvg = losses.length ? r2(out.lossSum / losses.length) : out.n ? 0 : null;
  out.enough = out.n >= Number(cfg.min_days_to_judge);
  return out;
}

// ห้องแล็บ 1 รอบ: ทุกสูตรใช้ข้อมูลชุดเดียวกัน กรอบเดียวกัน นับคะแนนในช่วง from–to บนชุดวันที่ทุกสูตรมีผล (รวมตัวเทียบ fixed_mean)
export function runLab(series, formulas, cfg, band, from, to, ctrlCode = 'fixed_mean') {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  const evs = (formulas || []).filter(f => f.status !== 'dropped').map(f => evalFormula(series, f, cfg, reg, band, { from, to }));
  const withPts = evs.filter(e => e.pts.length);
  const none = evs.filter(e => !e.pts.length);
  let days = null;
  withPts.forEach(e => { const d = new Set(e.pts.map(p => p.date)); days = days === null ? d : new Set([...days].filter(x => d.has(x))); });
  days = days || new Set();
  const rows = withPts.map(e => restrict(e, days, cfg)).concat(none.map(e => restrict(e, days, cfg)))
    .sort((a, b) => {
      if (a.nowcast !== b.nowcast) return a.nowcast ? 1 : -1;
      const aw = a.winRate === null ? -1 : a.winRate, bw = b.winRate === null ? -1 : b.winRate;
      if (bw !== aw) return bw - aw;
      return (a.lossAvg === null ? 9e9 : a.lossAvg) - (b.lossAvg === null ? 9e9 : b.lossAvg);
    });
  const sorted = [...days].sort();
  const fewest = withPts.length ? Math.min(...withPts.map(e => e.pts.length)) : 0;
  const limiting = withPts.filter(e => e.pts.length === fewest).map(e => `${e.code} (${fewest} วัน)`);
  return { rows, days: sorted.length, limiting, period: { from: sorted[0] || null, to: sorted[sorted.length - 1] || null }, none: none.map(e => e.code), ctrl: rows.find(r => r.code === ctrlCode) || null };
}

// รันทุกสูตรที่ยังไม่ถูกคัดออก (กรอบตามวัตถุดิบ mapRow) แล้วเรียง: สูตรล่วงหน้าก่อน nowcast · win rate สูง→ต่ำ · แพ้เฉลี่ยน้อย→มาก
export function runAll(series, formulas, cfg, mapRow) {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  return (formulas || []).filter(f => f.status !== 'dropped')
    .map(f => evalFormula(series, f, cfg, reg, bandOf(cfg, mapRow, f)))
    .sort((a, b) => {
      if (a.nowcast !== b.nowcast) return a.nowcast ? 1 : -1;
      const aw = a.winRate === null ? -1 : a.winRate, bw = b.winRate === null ? -1 : b.winRate;
      if (bw !== aw) return bw - aw;
      return (a.lossAvg === null ? 9e9 : a.lossAvg) - (b.lossAvg === null ? 9e9 : b.lossAvg);
    });
}

// สถานการณ์ของวัตถุดิบ: เฉลี่ย 4 สัปดาห์ล่าสุด เทียบ 4 สัปดาห์ก่อนหน้า
export function regimeOf(series, cfg) {
  if (series.length < 8) return { regime: null, slopePct: null, from: null, to: null };
  const end = series[series.length - 1].date;
  const shift = d => addDaysIso(end, -d);
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

// ตัดสินผ่าน/ไม่ผ่าน (ctrl = ผลของ fixed_mean บนชุดวันเดียวกัน · live = ผลของสูตรใช้จริงของวัตถุดิบนี้ในรอบเดียวกัน)
// pass = ครบทุกเกณฑ์และ win rate มากกว่า fixed_mean เท่านั้น · fail = ข้อมูลพอแต่ตก (เหตุผลเป็นข้อพร้อมค่าจริง/เกณฑ์) · inconclusive = วันไม่พอ หรือ fixed_mean ไม่มีผล
export function verdictOf(row, ctrl, cfg, live) {
  const min = cfg.min_days_to_judge;
  if (row.nowcast) return { verdict: 'inconclusive', reason: 'สูตร nowcast ใช้ยอดขายของวันที่ทำนาย ไม่นับเป็นความแม่นยำล่วงหน้า' };
  if (ctrl && row.code === ctrl.code) return { verdict: 'inconclusive', reason: 'เป็นตัวเทียบ ไม่ตัดสินตัวเอง' };
  if (!ctrl || ctrl.winRate === null) return { verdict: 'inconclusive', reason: 'ตัวเทียบ fixed_mean ไม่มีผลในช่วงเดียวกัน จึงตัดสินไม่ได้' };
  if (!row.enough) return { verdict: 'inconclusive', reason: `วันที่นับคะแนน ${row.n} วัน ยังไม่ถึงขั้นต่ำ ${min} วัน` };
  const why = [];
  if (!(row.winRate > ctrl.winRate)) why.push(`win rate ${row.winRate}% ไม่มากกว่า fixed_mean ${ctrl.winRate}% (ชุดวันเดียวกัน ${row.n} วัน)`);
  if (row.winRate < cfg.elim_win_threshold) why.push(`win rate ${row.winRate}% ต่ำกว่าเกณฑ์ elim_win_threshold ${cfg.elim_win_threshold}%`);
  if (live && live.code !== row.code && live.lossAvg !== null && row.lossAvg !== null && typeof cfg.elim_loss_vs_live_pct === 'number'
    && row.lossAvg > live.lossAvg * (1 + cfg.elim_loss_vs_live_pct / 100))
    why.push(`แพ้เฉลี่ย ${row.lossAvg} กก. สูงกว่าสูตรใช้จริง ${live.code} ${live.lossAvg} กก. เกิน ${cfg.elim_loss_vs_live_pct}%`);
  if (why.length) return { verdict: 'fail', reason: why.map((w, i) => `${i + 1}) ${w}`).join(' ') };
  return { verdict: 'pass', reason: `win rate ${row.winRate}% มากกว่า fixed_mean ${ctrl.winRate}% · ถึงเกณฑ์ ${cfg.elim_win_threshold}% · ${row.n} วัน` };
}
