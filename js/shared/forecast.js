// เอนจินพยากรณ์วัตถุดิบ — สูตรล็อกไว้ต่อรายการ คำนวณจากบันทึกใช้จริงย้อนหลังเท่านั้น (ห้ามใช้ข้อมูลวันพยากรณ์/อนาคต ห้ามเติมค่าแทนวันว่าง)
import { FORECAST_MODELS } from './config.js';

const r1 = n => Math.round(n * 10) / 10;
const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
const wd = iso => new Date(iso + 'T00:00:00').getDay();

// sample SD (หาร n−1)
function sampleSd(a) {
  const m = avg(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1));
}

// ซีรีส์ใช้จริงรายวันของ 1 รายการ ก่อนวันที่พยากรณ์ (เตรียมว่าง = วันนั้นไม่มีข้อมูล ข้ามไป · ไม่นับวันอาทิตย์ · เสาร์ตัดตามกฎ exclude_saturday)
export function useSeries(logs, itemId, before, cfg = {}) {
  const byDate = {};
  (logs || []).forEach(l => {
    if (l.count_item_id !== itemId || l.log_date >= before || l.qty === null || l.qty === undefined) return;
    (byDate[l.log_date] = byDate[l.log_date] || {})[l.entry_type] = Number(l.qty);
  });
  const skipSat = Number(cfg.exclude_saturday) === 1;
  return Object.keys(byDate).filter(d => wd(d) !== 0 && !(skipSat && wd(d) === 6)).sort().map(d => {
    const g = byDate[d];
    if (g['เตรียม'] === undefined) return null;
    return { date: d, use: r1(g['เตรียม'] + (g['เบิกเพิ่ม'] || 0) - (g['ทิ้ง'] || 0) - (g['คงเหลือ'] || 0)) };
  }).filter(Boolean);
}

// คงเหลือสดของวันเปิดล่าสุดก่อนวันที่เลือก (ใช้หักออกจากแนะเป้า)
export function carryOver(logs, itemId, before) {
  const rows = (logs || []).filter(l => l.count_item_id === itemId && l.entry_type === 'คงเหลือ' && l.log_date < before && l.qty !== null).sort((a, b) => (a.log_date > b.log_date ? -1 : 1));
  return rows.length ? Number(rows[0].qty) : 0;
}

// ค่าพยากรณ์ดิบของโมเดล จากซีรีส์ก่อนวันนั้น (null = ข้อมูลไม่พอ/โมเดลยังคำนวณไม่ได้)
function predict(model, hist, dateIso) {
  const vals = hist.map(h => h.use);
  switch (model.kind) {
    case 'const': return model.v;
    case 'ma': case 'mean_last': return vals.length >= model.n ? avg(vals.slice(-model.n)) : null;
    case 'ema': {
      if (!vals.length) return null;
      let e = vals[0];
      vals.slice(1).forEach(v => { e = model.alpha * v + (1 - model.alpha) * e; });
      return e;
    }
    case 'weekday_mean': {
      const same = hist.filter(h => wd(h.date) === wd(dateIso)).map(h => h.use);
      return same.length ? avg(same) : null;
    }
    default: return null;   // ratio_theo / blend = รอข้อมูลยอดขายแปลงสูตร · none = ยังไม่กำหนดสูตร
  }
}

// พยากรณ์ 1 รายการ ณ วันที่เลือก: ค่ากลาง + กรอบตามกฎใน kk_forecast_config + วัดผลแบบ walk-forward เท่านั้น (cfg = กฎจากฐาน ห้าม hardcode)
export function forecastItem(item, logs, dateIso, cfg) {
  const bandV = Number(cfg.band_value), sdWin = Number(cfg.sd_window), sdMin = Number(cfg.sd_min_obs), minDays = Number(cfg.min_days_to_judge);
  const model = FORECAST_MODELS[item.id] || (item.grp === 'ข้าว' ? { kind: 'ratio_theo', label: 'ratio_theo6 (รอข้อมูลยอดขาย)' } : { kind: 'none', label: 'ยังไม่กำหนดสูตร' });
  const series = useSeries(logs, item.id, dateIso, cfg);
  const out = {
    id: item.id, name: item.name, grp: item.grp, model, n: series.length,
    avg6: series.length ? r1(avg(series.slice(-6).map(s => s.use))) : null,
    hist10: series.slice(-10).map(s => s.use),
    fc: null, lo: null, hi: null, trend: null, wape: null, hitRate: null, hitN: 0, status: 'insufficient'
  };
  const fc = predict(model, series, dateIso);
  if (fc === null) {
    out.status = model.kind === 'ratio_theo' || model.kind === 'blend' ? 'no_theo' : model.kind === 'none' ? 'no_model' : 'insufficient';
    return out;
  }
  out.fc = r1(fc);
  // เดินย้อนวันต่อวัน: ทำนายด้วยข้อมูลก่อนหน้าเท่านั้น เก็บ residual / นับถูก-ผิดในกรอบของวันนั้นจริงๆ
  const resid = [], errs = [];
  let hit = 0, nHit = 0;
  series.forEach((s, i) => {
    const p = predict(model, series.slice(0, i), s.date);
    if (p === null) return;
    const rw = resid.slice(-sdWin);
    if (rw.length >= sdMin) {
      const sd = sampleSd(rw);
      nHit += 1;
      if (s.use >= Math.max(0, p - bandV * sd) && s.use <= p + bandV * sd) hit += 1;
    }
    resid.push(s.use - p);
    errs.push({ a: s.use, p });
  });
  const rw = resid.slice(-sdWin);
  if (rw.length >= sdMin) {
    const sd = sampleSd(rw);
    out.lo = r1(Math.max(0, fc - bandV * sd));
    out.hi = r1(fc + bandV * sd);
    out.status = 'ok';
  } else out.status = 'no_band';
  out.hitN = nHit;
  if (nHit >= minDays) out.hitRate = Math.round(hit / nHit * 1000) / 10;
  const sumA = errs.reduce((s, e) => s + e.a, 0);
  if (errs.length >= minDays && sumA > 0) out.wape = Math.round(errs.reduce((s, e) => s + Math.abs(e.a - e.p), 0) / sumA * 1000) / 10;
  if (out.avg6 !== null && out.avg6 > 0) {
    const d = (out.fc - out.avg6) / out.avg6;
    out.trend = d > 0.1 ? 'up' : d < -0.1 ? 'down' : 'flat';
  }
  return out;
}

// พยากรณ์ทุกรายการ + ความแม่นยำรวม (เฉลี่ย hit rate เฉพาะรายการที่วัดผลได้ครบตามกฎ min_days_to_judge)
export function buildForecast(items, logs, dateIso, cfg) {
  const rows = (items || []).filter(i => i.grp === 'เนื้อสัตว์' || i.grp === 'ข้าว').map(i => forecastItem(i, logs, dateIso, cfg));
  const ok = rows.filter(r => r.hitRate !== null);
  const accuracy = ok.length
    ? { status: 'ok', rate: Math.round(ok.reduce((s, r) => s + r.hitRate, 0) / ok.length * 10) / 10, n: ok.length }
    : { status: 'insufficient', n: 0 };
  return { rows, accuracy, cfg };
}

// แนะเป้าเตรียมของวัน = ขอบบน − คงเหลือเมื่อวาน (ต่ำสุด 0, ปัดขึ้น 1 ตำแหน่ง) · วันเสาร์ใช้ค่าพยากรณ์ตรงๆ เพราะอาทิตย์ปิด ห้ามเผื่อ
export function recTarget(fcRow, carryKg, dateIso) {
  if (!fcRow || fcRow.fc === null) return null;
  const sat = wd(dateIso) === 6;
  const up = n => Math.ceil(Math.max(0, n - (carryKg || 0)) * 10) / 10;
  if (sat) return { t: up(fcRow.fc), lo: up(fcRow.fc), hi: up(fcRow.fc), sat };
  if (fcRow.hi === null) return { t: up(fcRow.fc), lo: null, hi: null, sat };
  return { t: up(fcRow.hi), lo: up(fcRow.lo), hi: up(fcRow.hi), sat };
}