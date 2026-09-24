// คลังสูตร และประวัติการทดสอบ — เก็บทุกสูตร รู้ว่าตัวไหนเคยทดสอบแล้วผลเป็นยังไง จะได้ไม่เอากลับมาทดสอบซ้ำ
import { EQ_LIB_UI, FC_FAMILY_TH } from '../shared/config.js';
import { buildSeries, isNowcast, regimeOf, addDaysIso, dowIso } from '../shared/fclab.js';
import { evolve } from '../shared/fcevolve.js';
import { addFcFormulas, saveFcFormula, bumpFcFormulas, setFcModelSafe, setFcLiveModel, todayIso, getCountItemIds, getHistoryOn, importHistory } from '../shared/data.js';
import { confirmSheet, toast, formSheet, openSheet } from '../shared/ui.js';
import { isAdmin } from '../shared/auth.js';
import { FC_REGIME_TH } from '../shared/config.js';
import { fillText, dayLongTh } from '../shared/format.js';
import { sumHtml, filterHtml, formulaCardHtml, droppedHtml, untestedHtml, matrixHtml, libActsHtml, countHtml, passHtml, importBtnHtml } from './eq-library-view.js';

const state = { filter: { family: '', status: '', regime: '', verdict: '' }, open: null, passItem: '', passRegime: '', passOpen: {} };

// ป้ายกรอบของผลทดสอบ
const bandTxt = t => (t && t.band_value !== null && t.band_value !== undefined ? (String(t.band_type).toUpperCase() === 'PCT' ? `±${t.band_value}%` : `±${t.band_value} SD`) : '—');

// กลุ่มสูตรที่ผ่านการคัดเลือก: 1 กลุ่ม = สูตร × วัตถุดิบ (ครั้งล่าสุดเป็นแถวหลัก ครั้งก่อนเท่าที่ยังมีแถวในฐาน)
function passGroups(data, names) {
  const map = {};
  data.trials.filter(t => t.verdict === 'pass').forEach(t => { (map[t.formula_code + '|' + t.item_id] = map[t.formula_code + '|' + t.item_id] || []).push(t); });
  return Object.keys(map).map(k => {
    const list = map[k].sort((a, b) => (a.tested_at < b.tested_at ? 1 : -1));
    return { key: k, main: list[0], older: list.slice(1), item: names[list[0].item_id] || list[0].item_id };
  }).filter(g => (!state.passItem || g.main.item_id === state.passItem) && (!state.passRegime || g.main.regime === state.passRegime))
    .sort((a, b) => a.item.localeCompare(b.item, 'th') || Number(b.main.win_rate) - Number(a.main.win_rate));
}

// ใช้สูตรที่ผ่านการคัดเลือกกับวัตถุดิบนั้น — คนกดยืนยันเอง · เทียบกับสูตรปัจจุบัน · กันชนด้วย updated_at
async function useFormula(key, data, reload) {
  const [code, itemId] = key.split('|');
  const t = data.trials.filter(x => x.formula_code === code && x.item_id === itemId && x.verdict === 'pass').sort((a, b) => (a.tested_at < b.tested_at ? 1 : -1))[0];
  if (!t) return;
  const m = data.map.find(x => x.item_id === itemId) || null;
  const name = (m && m.item_name_th) || itemId;
  const cur = m && m.formula_code ? data.trials.filter(x => x.formula_code === m.formula_code && x.item_id === itemId).sort((a, b) => (a.tested_at < b.tested_at ? 1 : -1))[0] : null;
  const now = regimeOf(buildSeries(data.history, itemId, data.cfg), data.cfg).regime;
  const line = (label, c, x) => `<b>${label}</b>: ${c}${x ? ` · win rate ${x.win_rate}% · แพ้เฉลี่ย ${x.loss_avg_kg ?? '—'} กก. · กรอบ ${bandTxt(x)} · ${x.period_from}–${x.period_to}` : ` · ${EQ_LIB_UI.useNoCurTrial}`}`;
  const warn = [];
  if (cur && (cur.period_from !== t.period_from || cur.period_to !== t.period_to || bandTxt(cur) !== bandTxt(t))) warn.push(EQ_LIB_UI.useNotComparable);
  if (t.regime && now && t.regime !== now) warn.push(fillText(EQ_LIB_UI.useRegimeWarn, { a: FC_REGIME_TH[t.regime].label, b: FC_REGIME_TH[now].label }));
  if (cur && (Number(t.win_rate) < Number(cur.win_rate) || Number(t.loss_avg_kg) > Number(cur.loss_avg_kg))) warn.push(EQ_LIB_UI.useWorseWarn);
  const ok = await confirmSheet({
    title: fillText(EQ_LIB_UI.useAsk.title, { n: name }), okLabel: EQ_LIB_UI.useAsk.ok,
    text: [line(EQ_LIB_UI.useCur, m ? (m.model_type === 'fixed' ? `เตรียมคงที่ ${m.fixed_kg} กก.` : m.formula_code || '—') : 'ยังไม่ได้กำหนดสูตร', cur), line(EQ_LIB_UI.useNew, code, t), ...warn, EQ_LIB_UI.useNoteLimit].join('<br>')
  });
  if (!ok) return;
  const band = { band_type: String(t.band_type).toUpperCase() === 'PCT' ? 'PCT' : 'SD', band_value: Number(t.band_value) };
  const note = `เปลี่ยนเมื่อ ${todayIso()} จาก ${m ? (m.model_type === 'fixed' ? 'เตรียมคงที่' : m.formula_code || '—') : '—'} เป็น ${code} ผ่านการทดสอบช่วง ${t.period_from}–${t.period_to} กรอบ ${bandTxt(t)} สถานการณ์ ${t.regime ? FC_REGIME_TH[t.regime].label : '—'} win rate ${t.win_rate}%`;
  try {
    if (m) { if (!(await setFcModelSafe(itemId, m.updated_at, { model_type: 'model', formula_code: code, ...band, note }))) return toast(EQ_LIB_UI.useChanged); }
    else await setFcLiveModel({ item_id: itemId, item_name_th: name, model_type: 'model', formula_code: code, ...band, note, active: true });
    toast(fillText(EQ_LIB_UI.useDone, { n: name, c: code }));
    reload();
  } catch { toast('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'); }
}

// ตรวจข้อความที่วางนำเข้า: วันที่ไทยจริง · รหัสมีใน kk_count_item · ตัวเลขจริงไม่ติดลบ · แถวซ้ำ · ชนของเดิม
function parseImport(text, ids, existing) {
  const today = todayIso(), ok = [], bad = [], clash = [], seen = new Set();
  const num = v => /^\d+(\.\d+)?$/.test(v);
  const old = {};
  existing.forEach(e => { old[e.use_date + '|' + e.item_id] = e.source || 'cleaned_v2'; });
  text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).forEach((line, i) => {
    const c = line.split(/\t|,/).map(x => x.trim());
    const [d, id, used, theo = ''] = c;
    const why = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d || '') || addDaysIso(d, 0) !== d) why.push('วันที่ไม่ถูกต้อง');
    else if (d > today) why.push('วันที่เลยวันนี้ (เวลาไทย)');
    if (!ids.has(id)) why.push('ไม่มีรหัสวัตถุดิบนี้ใน kk_count_item');
    if (!num(used || '')) why.push('ใช้จริงต้องเป็นตัวเลขไม่ติดลบ');
    if (theo !== '' && !num(theo)) why.push('ยอดขายต้องเป็นตัวเลขไม่ติดลบ หรือเว้นว่าง');
    const k = d + '|' + id;
    if (!why.length && seen.has(k)) why.push('ซ้ำกับบรรทัดก่อนหน้าในข้อความที่วาง');
    if (why.length) return bad.push({ no: i + 1, line, why: why.join(', ') });
    seen.add(k);
    if (old[k] && old[k] !== 'manual_import') return clash.push({ no: i + 1, line, why: `มีข้อมูลเดิม (${old[k]})` });
    ok.push({ use_date: d, item_id: id, used_kg: Number(used), theo_kg: theo === '' ? null : Number(theo), dow_num: dowIso(d), flag: 'ok' });
  });
  return { ok, bad, clash };
}

// นำเข้าประวัติย้อนหลัง (เจ้าของเท่านั้น): วาง → ตรวจ → ดูตัวอย่าง → ยืนยันจึงเขียน
async function runImport(reload) {
  const pick = await openSheet(`<div class="ask__title">${EQ_LIB_UI.importTitle}</div><div class="ask__text">${EQ_LIB_UI.importHelp}</div>
    <textarea data-import-text="1" rows="8" style="width:100%;box-sizing:border-box;font:inherit;font-size:13px;border:1px solid #E0D9CC;border-radius:10px;padding:8px" placeholder="2026-08-01,meat_chicken_soft,12.5,11"></textarea>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">ยกเลิก</button><button class="ask__btn" type="button" data-pick="ok">${EQ_LIB_UI.importPreview}</button></div>`);
  const box = document.querySelector('[data-import-text]');
  const text = box ? box.value : '';
  if (pick !== 'ok' || !text.trim()) return;
  try {
    const ids = new Set((await getCountItemIds()).map(i => i.id));
    const dates = [...new Set(text.split(/\r?\n/).map(l => l.split(/\t|,/)[0].trim()).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)))];
    const r = parseImport(text, ids, await getHistoryOn(dates));
    const list = (rows, max = 6) => rows.slice(0, max).map(x => `#${x.no} ${x.line} — ${x.why}`).join('<br>') + (rows.length > max ? `<br>…อีก ${rows.length - max} แถว` : '');
    const text2 = [fillText(EQ_LIB_UI.importOk, { n: r.ok.length }), r.bad.length ? fillText(EQ_LIB_UI.importBad, { n: r.bad.length }) + '<br>' + list(r.bad) : '', r.clash.length ? fillText(EQ_LIB_UI.importClash, { n: r.clash.length }) + '<br>' + list(r.clash) : ''].filter(Boolean).join('<br><br>');
    if (!r.ok.length) return confirmSheet({ title: EQ_LIB_UI.importNone, text: text2, okLabel: 'ปิด' });
    const ok = await confirmSheet({ title: fillText(EQ_LIB_UI.importConfirm, { n: r.ok.length }), okLabel: EQ_LIB_UI.importConfirm.replace('{n}', r.ok.length), text: text2 });
    if (!ok) return;
    const n = await importHistory(r.ok);
    toast(fillText(EQ_LIB_UI.importDone, { n }));
    reload();
  } catch { toast(EQ_LIB_UI.importFail); }
}

// รหัสสูตรที่ใช้ยอดขายของวันที่ทำนาย (nowcast) — ผลทดสอบของสูตรเหล่านี้ใช้เป็นหลักฐานพยากรณ์ล่วงหน้าไม่ได้
function nowcastCodes(formulas) {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  return new Set((formulas || []).filter(f => isNowcast(f, reg)).map(f => f.formula_code));
}

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
  const nc = nowcastCodes(data.formulas);
  const valid = data.trials.filter(t => !nc.has(t.formula_code));   // ไม่เอาผลของสูตรที่รู้ยอดขายแล้วมาเป็นฐานสร้างสูตร
  if (!valid.length) return toast(EQ_LIB_UI.evolveNoTrial);
  const itemId = valid[0].item_id;
  const series = buildSeries(data.history, itemId, data.cfg);
  const mine = valid.filter(t => t.item_id === itemId);
  const { rows, skipped } = evolve({ series, formulas: data.formulas, trials: mine, cfg: data.cfg });
  if (!rows.length) return toast(`${EQ_LIB_UI.evolveNone}${skipped.length ? ` (ข้ามซ้ำ/ผิดกติกา ${skipped.length} ตัว)` : ''}`);
  const pass = rows.filter(r => r.status === 'testing').length;
  const ok = await confirmSheet({
    title: fillText(EQ_LIB_UI.evolveAsk.title, { n: rows.length }), okLabel: EQ_LIB_UI.evolveAsk.ok,
    text: `ทดลองบน ${itemId}<br>${rows.slice(0, 8).map(r => `${r.formula_code} · ${r.status === 'testing' ? `เข้าทดสอบ (${r.__win}%)` : 'ตกด่านแรก'}`).join('<br>')}${rows.length > 8 ? `<br>…และอีก ${rows.length - 8} สูตร` : ''}`
  });
  if (!ok) return;
  try {
    await addFcFormulas(rows.map(r => { const c = { ...r, status: r.status === 'dropped' ? 'bench' : r.status }; delete c.__win; delete c.__n; return c; }));   // ระบบเสนอได้อย่างเดียว ห้ามตั้ง dropped เอง
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
  const nc = nowcastCodes(data.formulas);
  const matrix = matrixOf(data.trials.filter(t => !nc.has(t.formula_code)));

  const passItems = [...new Set(data.trials.filter(t => t.verdict === 'pass').map(t => t.item_id))].map(id => ({ id, name: names[id] || id }));
  pane.innerHTML = `<p class="eq-sub">${EQ_LIB_UI.sub}</p>`
    + (isAdmin() ? importBtnHtml() : '')
    + passHtml(passGroups(data, names), nc, passItems, state)
    + sumHtml(data.formulas) + filterHtml(f) + countHtml(shown.length, data.formulas.length)
    + shown.map(x => formulaCardHtml(x, data.trials.filter(t => t.formula_code === x.formula_code), names, state.open === x.formula_code, nc.has(x.formula_code))).join('')
    + droppedHtml(data.formulas.filter(x => x.status === 'dropped'), data.trials)
    + untestedHtml(data.formulas.filter(x => !Number(x.times_tested)))
    + matrixHtml(matrix) + libActsHtml();

  pane.onclick = event => {
    const chip = event.target.closest('[data-f]'), open = event.target.closest('[data-open]');
    const re = event.target.closest('[data-retest]'), send = event.target.closest('[data-send]');
    const pf = event.target.closest('[data-pf]'), po = event.target.closest('[data-pass-open]'), pu = event.target.closest('[data-pass-use]');
    if (pf) { state[pf.dataset.pf] = pf.dataset.v; return mountLibrary(pane, data, reload); }
    if (po) { state.passOpen[po.dataset.passOpen] = !state.passOpen[po.dataset.passOpen]; return mountLibrary(pane, data, reload); }
    if (pu) return useFormula(pu.dataset.passUse, data, reload);
    if (event.target.closest('[data-import]')) return runImport(reload);
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
