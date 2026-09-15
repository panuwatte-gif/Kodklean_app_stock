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

// ตารางประวัติการทดสอบของสูตรหนึ่ง
function trialsHtml(trials, names) {
  if (!trials.length) return `<p class="eqf-none">${EQ_LIB_UI.noTrial}</p>`;
  return `<div class="eqf-trials"><div class="eqf-trial eqf-trial--head">${EQ_LIB_UI.trialCols.map(c => `<span>${c}</span>`).join('')}</div>
    ${trials.map(t => `<div class="eqf-trial">
      <span>${dayShort(t.tested_at)}</span>
      <span>${t.period_from ? `${dayShort(t.period_from)}–${dayShort(t.period_to)}` : '—'}</span>
      <span>${names[t.item_id] || t.item_id}</span>
      <span>${t.regime ? FC_REGIME_TH[t.regime].label : '—'}</span>
      <span>${dash(t.n)}</span>
      <span>${t.win_rate === null ? '—' : pct1(t.win_rate)}</span>
      <span>${dash(t.loss_avg_kg)}</span>
      <span>${dash(t.loss_max_kg)}</span>
      <i class="eqf-v eqf-v--${t.verdict}">${FC_VERDICT_TH[t.verdict] || t.verdict}</i>
    </div><p class="eqf-why">${t.verdict_reason || ''}</p>`).join('')}</div>`;
}

// การ์ดสูตร 1 ใบ (กดแล้วขยายดูสมการเต็ม พารามิเตอร์ และประวัติการทดสอบ)
export function formulaCardHtml(f, trials, names, open) {
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
      <i>ทดสอบ ${f.times_tested || 0} ครั้ง</i>
      ${f.last_verdict ? `<i class="eqf-v eqf-v--${f.last_verdict}">${FC_VERDICT_TH[f.last_verdict]}</i>` : ''}
      ${f.best_regime ? `<i class="eql-reg" style="--c:${FC_REGIME_TH[f.best_regime].color};--t:${FC_REGIME_TH[f.best_regime].tint}">เก่งตอน${FC_REGIME_TH[f.best_regime].label}</i>` : ''}
      ${(f.tags || []).map(t => `<i class="eqf-tag">${t}</i>`).join('')}
      <i class="eqf-src">${FC_SOURCE_TH[f.source] || f.source}</i>
    </div>
    ${open ? `<div class="eqf-det">
      <div class="eqf-det__row"><span>${EQ_LIB_UI.eqHead}</span><b>${f.equation_th || '—'}</b></div>
      <div class="eqf-det__row"><span>${EQ_LIB_UI.paramHead}</span><b>${params.length ? params.map(k => `${k} = ${JSON.stringify(f.params[k])}`).join(' · ') : 'ไม่มี'}</b></div>
      ${f.note ? `<div class="eqf-det__row"><span>บันทึก</span><b>${f.note}</b></div>` : ''}
      <div class="eqf-det__head">${EQ_LIB_UI.trialHead}</div>
      ${trialsHtml(trials, names)}
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
