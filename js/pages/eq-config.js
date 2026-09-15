// ตั้งค่ากฎการทดสอบ — อ่าน/เขียน kk_forecast_config ทั้ง 27 ค่า แก้แล้วเห็นผลกระทบก่อนบันทึก
import { EQ_CFG_UI } from '../shared/config.js';
import { buildSeries, evalFormula } from '../shared/fclab.js';
import { saveFcConfig } from '../shared/data.js';
import { confirmSheet, toast, glyph } from '../shared/ui.js';
import { fillText, pct1, weightBig } from '../shared/format.js';

const state = { draft: {} };

// ค่าของแถวนั้นตอนนี้ (ค่าที่แก้ค้างไว้มาก่อนค่าในฐาน)
const now = r => (state.draft[r.config_key] !== undefined ? state.draft[r.config_key]
  : r.value_text === null || r.value_text === undefined ? Number(r.value_num) : r.value_text);
const def = r => (r.value_text === null || r.value_text === undefined ? Number(r.default_num) : r.default_text);

// ขั้นการเลื่อนที่พอเหมาะกับช่วงของค่านั้น
function stepOf(r) {
  const span = Number(r.max_num) - Number(r.min_num);
  return span <= 0.5 ? 0.01 : span <= 3 ? 0.05 : span <= 12 ? 0.5 : 1;
}

// วัดผลรวมทุกวัตถุดิบด้วยกฎชุดหนึ่ง (win rate รวม + ของที่ต้องเตรียมต่อเดือน)
function measure(data, cfg) {
  const reg = {};
  data.formulas.forEach(f => { reg[f.formula_code] = f; });
  let n = 0, wins = 0, kg = 0, items = 0;
  data.map.forEach(m => {
    if (!m.active || m.model_type !== 'model' || !m.formula_code) return;
    const f = reg[m.formula_code];
    if (!f) return;
    const s = buildSeries(data.history, m.item_id, cfg);
    if (!s.length) return;
    const r = evalFormula(s, f, cfg, reg);
    if (!r.n) return;
    n += r.n; wins += r.wins; items += 1;
    kg += r.pts.reduce((a, p) => a + p.hi, 0) / r.pts.length * Number(cfg.round_length_days);
  });
  return { rate: n ? Math.round(wins / n * 1000) / 10 : null, kg: Math.round(kg * 10) / 10, items, n };
}

// การ์ดผลกระทบ (เทียบกฎที่บันทึกไว้ กับกฎที่กำลังแก้)
function impactHtml(data) {
  const keys = Object.keys(state.draft);
  if (!keys.length) return '';
  const a = measure(data, data.cfg), b = measure(data, { ...data.cfg, ...state.draft });
  const dRate = a.rate === null || b.rate === null ? null : Math.round((b.rate - a.rate) * 10) / 10;
  const dKg = Math.round((b.kg - a.kg) * 10) / 10;
  const lines = a.rate === null || b.rate === null
    ? `<p class="eqc-imp__none">${EQ_CFG_UI.impactNone}</p>`
    : `<div class="eqc-imp__row"><span>${EQ_CFG_UI.impactWin}</span>
        <b>${pct1(a.rate)} → ${pct1(b.rate)}</b>
        <i class="${dRate > 0 ? 'is-up' : dRate < 0 ? 'is-down' : ''}">${dRate > 0 ? '+' : ''}${dRate} จุด</i></div>
       <div class="eqc-imp__row"><span>${EQ_CFG_UI.impactKg}</span>
        <b>${weightBig(a.kg)} → ${weightBig(b.kg)} กก.</b>
        <i class="${dKg > 0 ? 'is-down' : dKg < 0 ? 'is-up' : ''}">${dKg > 0 ? 'เตรียมเพิ่ม' : dKg < 0 ? 'เตรียมน้อยลง' : 'เท่าเดิม'} ${weightBig(Math.abs(dKg))} กก.</i></div>
       <p class="asm__note">วัดจากสูตรใช้จริง ${b.items} รายการ · ${b.n} วันที่วัดผลได้ · ของต่อเดือนคิดจากขอบบนของกรอบ × ${(state.draft.round_length_days || data.cfg.round_length_days)} วันเปิด</p>`;
  return `<section class="eqc-imp"><div class="eqc-imp__head">${glyph('info', 14)}<span>${EQ_CFG_UI.impactHead}</span>
      <i>${fillText(EQ_CFG_UI.dirty, { n: keys.length })}</i></div>${lines}</section>`;
}

// แถวค่า 1 ค่า
function rowHtml(r) {
  const v = now(r), picks = EQ_CFG_UI.picks[r.config_key];
  const ctrl = picks
    ? `<div class="eqc-pick">${picks.map(([val, label]) => `
        <button class="eqc-pickbtn${String(v) === val ? ' is-on' : ''}" type="button" data-pick="${r.config_key}" data-v="${val}">${label}</button>`).join('')}</div>`
    : `<div class="eqc-num">
        <input class="eqc-in" type="number" inputmode="decimal" step="${stepOf(r)}" min="${r.min_num}" max="${r.max_num}" data-k="${r.config_key}" value="${v}">
        ${r.unit_th ? `<span class="eqc-unit">${r.unit_th}</span>` : ''}
        <input class="eqc-range" type="range" step="${stepOf(r)}" min="${r.min_num}" max="${r.max_num}" data-k="${r.config_key}" value="${v}" aria-label="${r.label_th}">
        <em>${r.min_num} – ${r.max_num}</em></div>`;
  return `<div class="eqc-row${state.draft[r.config_key] !== undefined ? ' is-dirty' : ''}">
    <div class="eqc-row__top"><b>${r.label_th}</b><code>${r.config_key}</code></div>
    ${ctrl}${r.help_th ? `<p class="eqc-help">${r.help_th}</p>` : ''}</div>`;
}

// บันทึกทุกค่าที่แก้ (เขียนทีละค่าลง kk_forecast_config)
async function save(data, reload) {
  const keys = Object.keys(state.draft);
  if (!keys.length) return toast(EQ_CFG_UI.saveNone);
  try {
    await Promise.all(keys.map(k => {
      const r = data.cfgRows.find(x => x.config_key === k);
      return saveFcConfig(k, r.value_text === null || r.value_text === undefined ? { value_num: state.draft[k] } : { value_text: state.draft[k] });
    }));
    state.draft = {};
    toast(fillText(EQ_CFG_UI.saveDone, { n: keys.length }));
    reload();
  } catch { toast(EQ_CFG_UI.saveErr); }
}

// คืนค่าเริ่มต้นของระบบทั้ง 27 ค่า
async function reset(data, reload) {
  if (!await confirmSheet({ title: EQ_CFG_UI.resetAsk.title, text: EQ_CFG_UI.resetAsk.text, okLabel: EQ_CFG_UI.resetAsk.ok })) return;
  const changed = data.cfgRows.filter(r => String(def(r)) !== String(now(r)));
  try {
    await Promise.all(changed.map(r => saveFcConfig(r.config_key,
      r.value_text === null || r.value_text === undefined ? { value_num: r.default_num } : { value_text: r.default_text })));
    state.draft = {};
    toast(EQ_CFG_UI.resetDone);
    reload();
  } catch { toast(EQ_CFG_UI.saveErr); }
}

// วาดแท็บตั้งค่ากฎ
export function mountConfig(pane, data, reload) {
  const groups = EQ_CFG_UI.groups.filter(g => data.cfgRows.some(r => r.group_th === g));
  pane.innerHTML = `<p class="eq-sub">${EQ_CFG_UI.sub}</p>` + impactHtml(data)
    + groups.map(g => `<section class="eqc-grp"><div class="eqc-grp__head">${g}</div>
        ${data.cfgRows.filter(r => r.group_th === g).map(rowHtml).join('')}</section>`).join('')
    + `<div class="eql-acts">
        <button class="eql-btn" type="button" data-reset="1">${EQ_CFG_UI.reset}</button>
        <button class="eql-btn eql-btn--main" type="button" data-save="1">${EQ_CFG_UI.save}</button></div>`;

  // แก้ค่าแล้ววาดใหม่เพื่อคำนวณผลกระทบทันที (ก่อนบันทึก)
  const set = (key, value) => { state.draft[key] = value; mountConfig(pane, data, reload); };

  pane.onclick = event => {
    const pick = event.target.closest('[data-pick]');
    if (pick) return set(pick.dataset.pick, pick.dataset.v);
    if (event.target.closest('[data-save]')) return save(data, reload);
    if (event.target.closest('[data-reset]')) return reset(data, reload);
  };
  pane.onchange = event => {
    const el = event.target.closest('[data-k]');
    if (!el) return;
    const r = data.cfgRows.find(x => x.config_key === el.dataset.k);
    const lo = Number(r.min_num), hi = Number(r.max_num);
    let v = Number(el.value);
    if (!isFinite(v)) return;
    if (v < lo || v > hi) { toast(fillText(EQ_CFG_UI.outRange, { a: lo, b: hi })); v = Math.min(hi, Math.max(lo, v)); }
    set(r.config_key, Math.round(v * 1000) / 1000);
  };
}
