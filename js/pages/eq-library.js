// คลังสูตร และประวัติการทดสอบ — เก็บทุกสูตร รู้ว่าตัวไหนเคยทดสอบแล้วผลเป็นยังไง จะได้ไม่เอากลับมาทดสอบซ้ำ
import { EQ_LIB_UI, FC_FAMILY_TH } from '../shared/config.js';
import { buildSeries } from '../shared/fclab.js';
import { evolve } from '../shared/fcevolve.js';
import { addFcFormulas, saveFcFormula, bumpFcFormulas } from '../shared/data.js';
import { confirmSheet, toast, formSheet } from '../shared/ui.js';
import { fillText, dayLongTh } from '../shared/format.js';
import { sumHtml, filterHtml, formulaCardHtml, droppedHtml, untestedHtml, matrixHtml, libActsHtml, countHtml } from './eq-library-view.js';

const state = { filter: { family: '', status: '', regime: '', verdict: '' }, open: null };

// ตารางสูตรไหนเก่งตอนไหน: เฉลี่ย win rate ของแต่ละสูตรในแต่ละสถานการณ์
function matrixOf(trials) {
  const acc = {};
  trials.forEach(t => {
    if (!t.regime || t.win_rate === null) return;
    const a = (acc[t.formula_code] = acc[t.formula_code] || {});
    const c = (a[t.regime] = a[t.regime] || { s: 0, n: 0 });
    c.s += Number(t.win_rate); c.n += 1;
  });
  return Object.keys(acc).map(code => {
    const by = {};
    Object.keys(acc[code]).forEach(r => { by[r] = Math.round(acc[code][r].s / acc[code][r].n * 10) / 10; });
    const best = Object.keys(by).sort((a, b) => by[b] - by[a])[0];
    return { code, by, best, top: by[best] };
  }).sort((a, b) => b.top - a.top);
}

// เอาสูตรที่ตกกลับมาทดสอบใหม่ (เตือนเหตุผลและจำนวนวันที่ตกไปก่อน)
async function retest(code, data, reload) {
  const f = data.formulas.find(x => x.formula_code === code);
  const t = data.trials.find(x => x.formula_code === code && x.verdict === 'fail');
  const when = t ? t.tested_at : f.updated_at;
  const days = when ? Math.round((Date.now() - new Date(when)) / 86400000) : null;
  const why = t ? t.verdict_reason : f.note || '—';
  const ok = await confirmSheet({
    title: EQ_LIB_UI.retestAsk.title, okLabel: EQ_LIB_UI.retestAsk.ok,
    text: when ? fillText(EQ_LIB_UI.retestWarn, { d: dayLongTh(when), n: days, why }) : fillText(EQ_LIB_UI.retestNoDate, { why })
  });
  if (!ok) return;
  try { await saveFcFormula(code, { status: 'testing', active: true }); toast(fillText(EQ_LIB_UI.statusDone, { c: code })); reload(); }
  catch { toast(EQ_LIB_UI.saveErr || 'บันทึกไม่สำเร็จ'); }
}

// เพิ่มสูตรเอง (source = manual)
async function addOwn(data, reload) {
  const v = await formSheet({
    title: EQ_LIB_UI.addForm.title, okLabel: EQ_LIB_UI.addForm.ok,
    fields: [
      { key: 'code', label: EQ_LIB_UI.addForm.code, placeholder: 'MA7' },
      { key: 'name', label: EQ_LIB_UI.addForm.name, placeholder: 'ค่าเฉลี่ย 7 วัน' },
      { key: 'family', kind: 'select', label: EQ_LIB_UI.addForm.family, value: 'mean', options: Object.keys(FC_FAMILY_TH).map(k => ({ value: k, label: `${k} — ${FC_FAMILY_TH[k]}` })) },
      { key: 'eq', label: EQ_LIB_UI.addForm.eq, placeholder: 'เฉลี่ยใช้จริง 7 วันเปิดล่าสุด' },
      { key: 'params', label: EQ_LIB_UI.addForm.params, placeholder: '{"window":7}' }
    ]
  });
  if (!v) return;
  if (!v.code || !v.name) return toast(EQ_LIB_UI.addBad);
  if (data.formulas.some(f => f.formula_code === v.code)) return toast(EQ_LIB_UI.addDup);
  let params = {};
  if (v.params) { try { params = JSON.parse(v.params); } catch { return toast(EQ_LIB_UI.addBadParams); } }
  try {
    await addFcFormulas([{ formula_code: v.code, name_th: v.name, family: v.family, equation_th: v.eq, params, status: 'testing', tags: [], source: 'manual', active: true, times_tested: 0 }]);
    toast(fillText(EQ_LIB_UI.addDone, { c: v.code }));
    reload();
  } catch { toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'); }
}

// ให้ระบบสร้างสูตรใหม่ (4 วิธีตามกฎ · ต้องชนะตัวเทียบก่อนจึงเข้าทดสอบ)
async function runEvolve(data, reload) {
  if (!data.trials.length) return toast(EQ_LIB_UI.evolveNoTrial);
  const itemId = data.trials[0].item_id;
  const series = buildSeries(data.history, itemId, data.cfg);
  const mine = data.trials.filter(t => t.item_id === itemId);
  const { rows, skipped } = evolve({ series, formulas: data.formulas, trials: mine, cfg: data.cfg });
  if (!rows.length) return toast(`${EQ_LIB_UI.evolveNone}${skipped.length ? ` (ข้ามซ้ำ/ผิดกติกา ${skipped.length} ตัว)` : ''}`);
  const pass = rows.filter(r => r.status === 'testing').length;
  const ok = await confirmSheet({
    title: fillText(EQ_LIB_UI.evolveAsk.title, { n: rows.length }), okLabel: EQ_LIB_UI.evolveAsk.ok,
    text: `ทดลองบน ${itemId}<br>${rows.slice(0, 8).map(r => `${r.formula_code} · ${r.status === 'testing' ? `เข้าทดสอบ (${r.__win}%)` : 'ตกด่านแรก'}`).join('<br>')}${rows.length > 8 ? `<br>…และอีก ${rows.length - 8} สูตร` : ''}`
  });
  if (!ok) return;
  try {
    await addFcFormulas(rows.map(r => { const c = { ...r }; delete c.__win; delete c.__n; return c; }));
    toast(fillText(EQ_LIB_UI.evolveDone, { n: rows.length, p: pass, d: rows.length - pass }));
    reload();
  } catch { toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'); }
}

// อัปเดตคอลัมน์ best_regime จากตารางสูตรไหนเก่งตอนไหน
async function saveBest(matrix, data, reload) {
  const rows = matrix.map(m => {
    const f = data.formulas.find(x => x.formula_code === m.code) || {};
    return { formula_code: m.code, name_th: f.name_th, family: f.family, best_regime: m.best };
  }).filter(r => r.name_th && r.best);
  if (!rows.length) return;
  try { await bumpFcFormulas(rows); toast(fillText(EQ_LIB_UI.bestDone, { n: rows.length })); reload(); }
  catch { toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'); }
}

// วาดแท็บคลังสูตร
export function mountLibrary(pane, data, reload) {
  const f = state.filter;
  const names = {};
  data.map.forEach(m => { names[m.item_id] = m.item_name_th; });
  const shown = data.formulas.filter(x => (!f.family || x.family === f.family) && (!f.status || x.status === f.status)
    && (!f.regime || x.best_regime === f.regime) && (!f.verdict || x.last_verdict === f.verdict));
  const matrix = matrixOf(data.trials);

  pane.innerHTML = `<p class="eq-sub">${EQ_LIB_UI.sub}</p>`
    + sumHtml(data.formulas) + filterHtml(f) + countHtml(shown.length, data.formulas.length)
    + shown.map(x => formulaCardHtml(x, data.trials.filter(t => t.formula_code === x.formula_code), names, state.open === x.formula_code)).join('')
    + droppedHtml(data.formulas.filter(x => x.status === 'dropped'), data.trials)
    + untestedHtml(data.formulas.filter(x => !Number(x.times_tested)))
    + matrixHtml(matrix) + libActsHtml();

  pane.onclick = event => {
    const chip = event.target.closest('[data-f]'), open = event.target.closest('[data-open]');
    const re = event.target.closest('[data-retest]'), send = event.target.closest('[data-send]');
    if (chip) { state.filter[chip.dataset.f] = chip.dataset.v; return mountLibrary(pane, data, reload); }
    if (open) { state.open = state.open === open.dataset.open ? null : open.dataset.open; return mountLibrary(pane, data, reload); }
    if (re) return retest(re.dataset.retest, data, reload);
    if (send) return saveFcFormula(send.dataset.send, { status: 'testing', active: true })
      .then(() => { toast(fillText(EQ_LIB_UI.statusDone, { c: send.dataset.send })); reload(); })
      .catch(() => toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'));
    if (event.target.closest('[data-add]')) return addOwn(data, reload);
    if (event.target.closest('[data-evolve]')) return runEvolve(data, reload);
    if (event.target.closest('[data-best]')) return saveBest(matrix, data, reload);
  };
}
