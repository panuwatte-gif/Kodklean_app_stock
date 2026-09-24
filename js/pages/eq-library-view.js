// หน้าจอของคลังสูตร และประวัติการทดสอบ (วาด HTML อย่างเดียว)
import { EQ_LIB_UI, FC_FAMILY_TH, FC_STATUS_TH, FC_VERDICT_TH, FC_SOURCE_TH, FC_REGIME_TH } from '../shared/config.js';
import { glyph } from '../shared/ui.js';
import { pct1, dayShort, dayLongTh, fillText } from '../shared/format.js';

const dash = v => (v === null || v === undefined ? '—' : String(v));

// แถวสรุปจำนวนสูตรตามสถานะ
export function sumHtml(formulas) {
  const n = k => (k === 'all' ? formulas.length : formulas.filter(f => f.status === k).length);
  return `<div class="eqf-sums">${EQ_LIB_UI.sums.map(([label, k]) => `
    <div class="eqf-sum eqf-sum--${k}"><b>${n(k)}</b><span>${label}</span></div>`).join('')}</div>`;
}

// แถบกรอง 4 ชุด
export function filterHtml(sel) {
  const sets = [
    { k: 'family', opts: Object.keys(FC_FAMILY_TH).map(v => [v, FC_FAMILY_TH[v]]) },
    { k: 'status', opts: Object.keys(FC_STATUS_TH).map(v => [v, FC_STATUS_TH[v]]) },
    { k: 'regime', opts: Object.keys(FC_REGIME_TH).map(v => [v, FC_REGIME_TH[v].label]) },
    { k: 'verdict', opts: Object.keys(FC_VERDICT_TH).map(v => [v, FC_VERDICT_TH[v]]) }
  ];
  return sets.map((s, i) => `<div class="eqf-frow"><span>${EQ_LIB_UI.filterHeads[i]}</span><div class="eqf-chips">
    <button class="eqf-chip${sel[s.k] === '' ? ' is-on' : ''}" type="button" data-f="${s.k}" data-v="">${EQ_LIB_UI.all}</button>
    ${s.opts.map(([v, label]) => `<button class="eqf-chip${sel[s.k] === v ? ' is-on' : ''}" type="button" data-f="${s.k}" data-v="${v}">${label}</button>`).join('')}
  </div></div>`).join('');
}

// ป้ายกรอบของผลทดสอบ (win rate ต้องบอกกรอบเสมอ)
const bandOfTrial = t => (t.band_value === null || t.band_value === undefined ? '' : String(t.band_type || 'SD').toUpperCase() === 'PCT' ? `±${t.band_value}%` : `±${t.band_value} SD`);

// ป้าย "ต้องทดสอบใหม่" ของผลที่มาจากสูตรรู้ยอดขายวันเดียวกัน
const retestTag = () => `<i class="eqf-v eqf-v--fail" title="${EQ_LIB_UI.retestWhy}">${EQ_LIB_UI.retestTag}</i>`;

// ตารางประวัติการทดสอบของสูตรหนึ่ง (bad = ผลของสูตร nowcast ใช้ไม่ได้)
function trialsHtml(trials, names, bad) {
  if (!trials.length) return `<p class="eqf-none">${EQ_LIB_UI.noTrial}</p>`;
  return `<div class="eqf-trials"><div class="eqf-trial eqf-trial--head">${EQ_LIB_UI.trialCols.map(c => `<span>${c}</span>`).join('')}</div>
    ${trials.map(t => `<div class="eqf-trial">
      <span>${dayShort(t.tested_at)}</span>
      <span>${t.period_from ? `${dayShort(t.period_from)}–${dayShort(t.period_to)}` : '—'}</span>
      <span>${names[t.item_id] || t.item_id}</span>
      <span>${t.regime ? FC_REGIME_TH[t.regime].label : '—'}</span>
      <span>${dash(t.n)}</span>
      <span>${t.win_rate === null ? '—' : `${pct1(t.win_rate)} <em>${bandOfTrial(t)}</em>`}</span>
      <span>${dash(t.loss_avg_kg)}</span>
      <span>${dash(t.loss_max_kg)}</span>
      ${bad ? retestTag() : `<i class="eqf-v eqf-v--${t.verdict}">${FC_VERDICT_TH[t.verdict] || t.verdict}</i>`}
    </div><p class="eqf-why">${bad ? EQ_LIB_UI.retestWhy : t.verdict_reason || ''}</p>`).join('')}</div>`;
}

// ที่มาของ best_regime: ผลผ่านล่าสุดในสถานการณ์นั้น (วัตถุดิบ กรอบ ช่วง)
function bestSrc(f, trials, names) {
  const t = trials.filter(x => x.verdict === 'pass' && x.regime === f.best_regime).sort((a, b) => (a.tested_at < b.tested_at ? 1 : -1))[0];
  return t ? ` (${fillText(EQ_LIB_UI.bestFrom, { item: names[t.item_id] || t.item_id, band: bandOfTrial(t), from: t.period_from, to: t.period_to })})` : ' (ไม่พบผลผ่านที่เป็นที่มา)';
}

// การ์ดสูตร 1 ใบ (กดแล้วขยายดูสมการเต็ม พารามิเตอร์ และประวัติการทดสอบ)
export function formulaCardHtml(f, trials, names, open, nowcast) {
  const params = Object.keys(f.params || {});
  return `<section class="eqf-item${open ? ' is-open' : ''}">
    <button class="eqf-top" type="button" data-open="${f.formula_code}">
      <span class="eqf-code">${f.formula_code}</span>
      <span class="eqf-name">${f.name_th}<em>${f.equation_th || ''}</em></span>
      <i class="eql-tag eql-tag--${f.status}">${FC_STATUS_TH[f.status] || f.status}</i>
      <u>${glyph('chevron', 13)}</u>
    </button>
    <div class="eqf-meta">
      <i>${FC_FAMILY_TH[f.family] || f.family}</i>
      ${f.family === 'sales' ? `<i class="eqf-tag">${nowcast ? EQ_LIB_UI.nowcastTag : EQ_LIB_UI.advanceTag}</i>` : ''}
      <i>ทดสอบ ${f.times_tested || 0} ครั้ง</i>
      ${nowcast && trials.length ? retestTag() : f.last_verdict ? `<i class="eqf-v eqf-v--${f.last_verdict}">${FC_VERDICT_TH[f.last_verdict]}</i>` : ''}
      ${f.best_regime && FC_REGIME_TH[f.best_regime] ? `<i class="eql-reg" style="--c:${FC_REGIME_TH[f.best_regime].color};--t:${FC_REGIME_TH[f.best_regime].tint}">เก่งตอน${FC_REGIME_TH[f.best_regime].label}${bestSrc(f, trials, names)}</i>` : ''}
      ${(f.tags || []).map(t => `<i class="eqf-tag">${t}</i>`).join('')}
      <i class="eqf-src">${FC_SOURCE_TH[f.source] || f.source}</i>
    </div>
    ${open ? `<div class="eqf-det">
      <div class="eqf-det__row"><span>${EQ_LIB_UI.eqHead}</span><b>${f.equation_th || '—'}</b></div>
      <div class="eqf-det__row"><span>${EQ_LIB_UI.paramHead}</span><b>${params.length ? params.map(k => `${k} = ${JSON.stringify(f.params[k])}`).join(' · ') : 'ไม่มี'}</b></div>
      ${f.note ? `<div class="eqf-det__row"><span>บันทึก</span><b>${f.note}</b></div>` : ''}
      <div class="eqf-det__head">${EQ_LIB_UI.trialHead}</div>
      ${trialsHtml(trials, names, nowcast)}
    </div>` : ''}
  </section>`;
}

// กล่องสูตรที่ไม่ผ่านแล้ว
export function droppedHtml(rows, trials) {
  const inner = rows.length ? rows.map(f => {
    const t = trials.find(x => x.formula_code === f.formula_code && x.verdict === 'fail');
    const when = t ? t.tested_at : f.updated_at;
    const days = when ? Math.round((Date.now() - new Date(when)) / 86400000) : null;
    return `<div class="eqf-drop">
      <b>${f.formula_code}</b><span>${f.name_th}</span>
      <em>${t ? t.verdict_reason : f.note || '—'}</em>
      <i>${when ? `${dayLongTh(when)}${days === null ? '' : ` (${days} วันก่อน)`}` : ''}</i>
      <button type="button" data-retest="${f.formula_code}">${EQ_LIB_UI.retestBtn}</button>
    </div>`;
  }).join('') : `<p class="eqf-none">${EQ_LIB_UI.droppedEmpty}</p>`;
  return `<section class="eqf-box"><div class="eqf-box__head">${glyph('warn', 14)}<span>${EQ_LIB_UI.droppedHead}</span></div>${inner}</section>`;
}

// กล่องสูตรที่ยังไม่เคยทดสอบ
export function untestedHtml(rows) {
  const inner = rows.length ? `<div class="eqf-untest">${rows.map(f => `
    <div class="eqf-un"><b>${f.formula_code}</b><span>${f.name_th}</span>
      <button type="button" data-send="${f.formula_code}">${EQ_LIB_UI.sendBtn}</button></div>`).join('')}</div>`
    : `<p class="eqf-none">${EQ_LIB_UI.untestedEmpty}</p>`;
  return `<section class="eqf-box"><div class="eqf-box__head">${glyph('sparkle', 14)}<span>${EQ_LIB_UI.untestedHead}</span></div>${inner}</section>`;
}

// ตารางสูตรไหนเก่งตอนไหน (แกนตั้ง = สูตร · แกนนอน = สถานการณ์)
export function matrixHtml(matrix) {
  const keys = Object.keys(FC_REGIME_TH);
  if (!matrix.length) return `<section class="eqf-box"><div class="eqf-box__head">${glyph('grid', 14)}<span>${EQ_LIB_UI.matrixHead}</span></div>
    <p class="eqf-none">${EQ_LIB_UI.matrixEmpty}</p></section>`;
  const head = `<div class="eqf-mx eqf-mx--head"><span></span>${keys.map(k => `<span>${FC_REGIME_TH[k].label}</span>`).join('')}</div>`;
  const rows = matrix.map(m => `<div class="eqf-mx">
    <span>${m.code}</span>
    ${keys.map(k => {
      const v = m.by[k];
      const on = m.best === k;
      return `<span class="eqf-cell${on ? ' is-best' : ''}"${v === undefined ? '' : ` style="--h:${Math.round(v)}"`}>${v === undefined ? '' : pct1(v)}</span>`;
    }).join('')}</div>`).join('');
  return `<section class="eqf-box"><div class="eqf-box__head">${glyph('grid', 14)}<span>${EQ_LIB_UI.matrixHead}</span>
      <button type="button" data-best="1">อัปเดตคอลัมน์ "เก่งตอน"</button></div>
    ${head}${rows}<p class="asm__note">${EQ_LIB_UI.matrixNote}</p></section>`;
}

// ปุ่มเพิ่มสูตรเอง + ให้ระบบสร้างสูตรใหม่
export const libActsHtml = () => `<div class="eql-acts">
  <button class="eql-btn" type="button" data-add="1">${EQ_LIB_UI.addBtn}</button>
  <button class="eql-btn eql-btn--main" type="button" data-evolve="1">${EQ_LIB_UI.evolveBtn}</button></div>`;

// ข้อความจำนวนสูตรที่เห็นหลังกรอง
export const countHtml = (shown, total) => `<p class="eqf-count">${fillText('เห็น {a} จาก {b} สูตร', { a: shown, b: total })}</p>`;

// ปุ่มนำเข้าประวัติย้อนหลัง (เจ้าของเท่านั้น)
export const importBtnHtml = () => `<div class="eql-acts"><button class="eql-btn" type="button" data-import="1">${EQ_LIB_UI.importBtn}</button></div>`;

// แถวสูตรที่ผ่าน 1 ครั้ง
function passRowHtml(t, item, bad, main) {
  const reg = t.regime && FC_REGIME_TH[t.regime] ? FC_REGIME_TH[t.regime].label : '—';
  const cells = [`${t.formula_code}`, item, reg, bandOfTrial(t), `${dash(t.n)} วัน`, `${pct1(t.win_rate)} <em>${bandOfTrial(t)}</em>`, `${dash(t.loss_avg_kg)} กก.`, `${dash(t.loss_max_kg)} กก.`, `${t.period_from ? dayShort(t.period_from) : '—'}–${t.period_to ? dayShort(t.period_to) : '—'}`, dayShort(t.tested_at)];
  return `<div class="eqf-trial"${main ? '' : ' style="opacity:.75"'}>${cells.map(c => `<span>${c}</span>`).join('')}</div>`;
}

// กล่องสูตรที่ผ่านการคัดเลือก (อ่านจาก kk_forecast_trial verdict = pass · วางเหนือคลังสูตรเดิม)
export function passHtml(groups, nc, items, st) {
  const chip = (k, v, label) => `<button class="eqf-chip${st[k] === v ? ' is-on' : ''}" type="button" data-pf="${k}" data-v="${v}">${label}</button>`;
  const filters = `<div class="eqf-frow"><span>${EQ_LIB_UI.passFilterItem}</span><div class="eqf-chips">${chip('passItem', '', EQ_LIB_UI.all)}${items.map(i => chip('passItem', i.id, i.name)).join('')}</div></div>
    <div class="eqf-frow"><span>${EQ_LIB_UI.passFilterRegime}</span><div class="eqf-chips">${chip('passRegime', '', EQ_LIB_UI.all)}${Object.keys(FC_REGIME_TH).map(k => chip('passRegime', k, FC_REGIME_TH[k].label)).join('')}</div></div>`;
  const head = `<div class="eqf-trial eqf-trial--head">${EQ_LIB_UI.passCols.map(c => `<span>${c}</span>`).join('')}</div>`;
  const body = groups.length ? groups.map(g => {
    const bad = nc.has(g.main.formula_code);
    const open = st.passOpen[g.key];
    return `<div class="eqf-item">${head}${passRowHtml(g.main, g.item, bad, true)}
      ${bad ? `<p class="eqf-why" style="color:#8A1F17">${EQ_LIB_UI.passBadEvidence}</p>` : ''}
      <div class="eql-acts">
        ${g.older.length ? `<button class="eql-btn" type="button" data-pass-open="${g.key}">${fillText(EQ_LIB_UI.passOlder, { n: g.older.length })}</button>` : ''}
        ${bad || g.main.verdict !== 'pass' ? '' : `<button class="eql-btn eql-btn--main" type="button" data-pass-use="${g.key}">${EQ_LIB_UI.passUse}</button>`}
      </div>
      ${open ? g.older.map(t => passRowHtml(t, g.item, bad, false)).join('') : ''}</div>`;
  }).join('') : `<p class="eqf-none">${EQ_LIB_UI.passEmpty}</p>`;
  return `<section class="eqf-box"><div class="eqf-box__head">${glyph('check', 14)}<span>${EQ_LIB_UI.passHead}</span></div>${filters}<div class="eqt__scroll">${body}</div></section>`;
}
