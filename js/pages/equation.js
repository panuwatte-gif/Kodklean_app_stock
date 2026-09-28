// หน้าตรวจสอบสมการ Forecast — ตัวคุมแท็บ 4 หน้า โหลดข้อมูลจริงจากฐานครั้งเดียว แล้วส่งให้แท็บที่เปิดอยู่
import { EQ_UI, EQ_TABS, EQ_SIMPLE, FC_SYNC_UI, KITCHEN_UI, EQ_ADMIN_UI as A, FC_MODEL_SET_20260928 as SET } from '../shared/config.js';
import { getFcBundle, todayIso, getHistoryLastDate, syncHistoryFromPrep, getFcExcluded, saveExcludedDay, cancelExcludedDay, refreshFutureFcDaily, addFcFormulas, setFcModelSafe } from '../shared/data.js';
import { topBarHtml, glyph, confirmSheet, toast, openSheet } from '../shared/ui.js';
import { isAdmin } from '../shared/auth.js';
import { addDaysIso, dowIso, suspiciousDays } from '../shared/fclab.js';
import { dayShort, fillText, escHtml } from '../shared/format.js';
import { overviewHtml, loadOverview } from './eq-overview.js';
import { mountLab } from './eq-lab.js';
import { mountLibrary } from './eq-library.js';
import { mountConfig } from './eq-config.js';
import { mountSimple } from './eq-simple.js';

// สถานะของหน้า: แท็บที่เปิด + ข้อมูลทั้งก้อนจากฐาน
const state = { tab: 'overview', mode: 'simple', data: null, error: false, backfill: '', excl: [] };

// ชื่อวัตถุดิบจากรหัส (ชื่อในตารางสูตรใช้จริง > รายการนับ > รหัส)
const nameOf = (d, id) => ((d.map.find(m => m.item_id === id) || {}).item_name_th) || ((d.prices || {})[id] || {}).name || id;

// กล่องของเจ้าของ: วันที่ตัดออก (config = ตั้งในระบบ ไม่มีปุ่มยกเลิก · db = ยกเลิกได้) + วันที่น่าสงสัย (กดตัดเอง) + ปุ่มใช้ชุดสูตร 28 ก.ย.
function adminHtml(d) {
  const rows = state.excl.map((x, i) => `<div class="eqx__row"><span>${dayShort(x.date)}</span><span>${x.items === 'all' ? A.exclAll : x.items.map(id => escHtml(nameOf(d, id))).join(', ')}</span><span>${escHtml(x.note)}</span><span>${x.source === 'config' ? A.exclSystem : `${A.exclDb} <button class="eql-btn" type="button" data-excl-cancel="${i}">${A.exclCancel}</button>`}</span></div>`).join('');
  const excludedDates = new Set(state.excl.filter(x => x.items === 'all').map(x => x.date));
  const susp = suspiciousDays(d.history).filter(s => !excludedDates.has(s.date)).slice(-12).reverse();
  return `<section class="eql-card eqx">
    <div class="eql-card__head"><span>${A.exclHead}</span></div>
    ${rows ? `<div class="eqx__row eqx__row--head">${A.exclCols.map(c => `<span>${c}</span>`).join('')}</div>${rows}` : `<p class="asm__note">${A.exclNone}</p>`}
    <div class="eql-card__head" style="margin-top:10px"><span>${A.suspHead}</span></div>
    ${susp.length ? susp.map(s => `<div class="eqx__row eqx__row--susp"><span style="grid-column:1 / 4">${fillText(A.suspLine, { d: dayShort(s.date), low: s.low, n: s.n })}</span><span><button class="eql-btn" type="button" data-susp-cut="${s.date}">${A.suspCut}</button></span></div>`).join('') : `<p class="asm__note">${A.suspNone}</p>`}
    <div class="eql-acts" style="margin-top:10px"><button class="eql-btn eql-btn--main" type="button" data-model-set="1">${A.setBtn}</button></div>
  </section>`;
}

// หลังตัด/ยกเลิก: คำนวณค่าพยากรณ์ที่บันทึกล่วงหน้าใหม่ แล้วโหลดหน้า
async function afterExcl(reload) {
  try { const n = await refreshFutureFcDaily(); toast(`คำนวณค่าพยากรณ์ที่บันทึกไว้ใหม่ ${n} แถว`); } catch { toast(A.saveErr.replace('{e}', 'refresh')); }
  reload();
}

// ตัดวันที่น่าสงสัย (ทุกวัตถุดิบที่มีสูตร) — กดเองเท่านั้น
async function cutSusp(d, date, reload) {
  if (!await confirmSheet({ title: A.suspCut, text: fillText(A.suspNote, { d: dayShort(date) }), okLabel: A.suspCut, danger: true })) return;
  try { await saveExcludedDay(date, d.map.map(m => m.item_id), 'ใช้จริงต่ำผิดปกติ'); }
  catch (e) { return toast(fillText(A.saveErr, { e: String(e && e.message || e).slice(0, 160) })); }
  afterExcl(reload);
}

// ยกเลิกการตัด (PATCH regime = excluded_cancelled)
async function cancelExcl(d, x, reload) {
  if (!await confirmSheet({ title: A.exclCancel, text: fillText(A.exclCancelAsk, { d: dayShort(x.date), items: x.items === 'all' ? A.exclAll : x.items.map(id => nameOf(d, id)).join(', ') }), okLabel: A.exclCancel })) return;
  try { await cancelExcludedDay(x.ids); }
  catch (e) { return toast(fillText(A.saveErr, { e: String(e && e.message || e).slice(0, 160) })); }
  afterExcl(reload);
}

// ใช้ชุดสูตร 28 ก.ย.: แสดงตารางก่อนเปลี่ยน → ยืนยัน → เพิ่มสูตรที่ยังไม่มี → เปลี่ยน kk_forecast_model_map ทีละแถวแบบกันชน (แถวที่สำเร็จไม่ย้อนกลับ)
async function applyModelSet(d, reload) {
  const plan = SET.rows.map(r => { const m = d.map.find(x => x.item_id === r.item_id) || null; return { ...r, m, cur: m ? (m.model_type === 'fixed' ? `เตรียมคงที่ ${m.fixed_kg ?? ''} กก.` : m.formula_code || '—') : 'ไม่มีแถว', same: !!m && m.model_type === 'model' && m.formula_code === r.formula_code }; });
  const todo = plan.filter(p => !p.same && p.m);
  if (!todo.length) return toast(A.setAlready);
  const table = `<div class="ask__title">${A.setHead}</div><div class="eqx__row eqx__row--head" style="grid-template-columns:1fr 1fr 1fr">${A.setCols.map(c => `<span>${c}</span>`).join('')}</div>`
    + plan.map(p => `<div class="eqx__row" style="grid-template-columns:1fr 1fr 1fr;opacity:${p.same ? .5 : 1}"><span>${escHtml(nameOf(d, p.item_id))}</span><span>${escHtml(p.cur)}</span><span>${p.formula_code}${p.same ? ' ✓' : ''}</span></div>`).join('')
    + `<div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">ยกเลิก</button><button class="ask__btn" type="button" data-pick="ok">${fillText(A.setOk, { n: todo.length })}</button></div>`;
  if (await openSheet(table) !== 'ok') return;
  // เพิ่มสูตรใหม่ที่คลังยังไม่มี (status testing · active true)
  for (const p of todo.filter(x => x.formula && !d.formulas.some(f => f.formula_code === x.formula_code))) {
    try { await addFcFormulas([{ formula_code: p.formula_code, ...p.formula, status: 'testing', active: true, source: 'manual', parent_code: p.formula.params.base || null }]); d.formulas.push({ formula_code: p.formula_code, ...p.formula }); }
    catch (e) { return toast(fillText(A.setAddFail, { code: p.formula_code, e: String(e && e.message || e).slice(0, 120) })); }
  }
  const ok = [], fail = [];
  for (const p of todo) {
    try {
      const done = await setFcModelSafe(p.item_id, p.m.updated_at, { model_type: 'model', formula_code: p.formula_code, note: `ชุดสูตร 28 ก.ย. 69 (เดิม ${p.cur}) เปลี่ยนเมื่อ ${todayIso()}` });
      if (done) ok.push(p.item_id); else fail.push(`${nameOf(d, p.item_id)}: ${A.setConflict}`);
    } catch (e) { fail.push(`${nameOf(d, p.item_id)}: ${String(e && e.message || e).slice(0, 100)}`); }
  }
  toast(fillText(A.setDone, { ok: ok.length, fail: fail.length ? fillText(A.setFailPart, { list: fail.join(' · ') }) : '' }));
  reload();
}

// สวิตช์ แบบง่าย / แบบละเอียด (เปิดหน้ามา = แบบง่ายเสมอ)
const modeHtml = on => `<div class="eqs-mode">${EQ_SIMPLE.modes.map(m => `<button type="button" class="${m.id === on ? 'is-on' : ''}" data-eqmode="${m.id}">${m.label}</button>`).join('')}</div>`;

// แถบแท็บ 4 หน้า
const tabsHtml = on => `<div class="eq-tabs">${EQ_TABS.map(t => `
  <button class="eq-tab${t.id === on ? ' is-on' : ''}" type="button" data-eqtab="${t.id}">${glyph(t.glyph, 15)}<span>${t.label}</span></button>`).join('')}</div>`;

// วันเปิด (ไม่ใช่วันอาทิตย์) ตั้งแต่ from ถึง to
function openDays(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDaysIso(d, 1)) if (dowIso(d) !== 0) out.push(d);
  return out;
}

// ปุ่มเติมประวัติจากบันทึกเตรียม (เจ้าของเท่านั้น · กดเองเท่านั้น ไม่รันตอนเปิดแอป)
// ปิดแล้ว 24 ก.ย.: ประวัติใช้จริงหลัง 5 ก.ย. คิดจาก kk_prep_log ในฐานให้อัตโนมัติ ไม่ต้องกดเติม (kk_forecast_history อ่านอย่างเดียว)
const backfillHtml = () => (false && isAdmin() ? `<div class="eql-acts"><button class="eql-btn" type="button" data-backfill="1">${FC_SYNC_UI.backfillBtn}</button></div><div id="eq-backfill">${state.backfill}</div>` : '');

// เติมประวัติทีละวันเปิด ตั้งแต่วันถัดจากวันล่าสุดใน kk_forecast_history ถึงเมื่อวาน แล้วแสดงผลรายวัน
async function runBackfill(root, reload) {
  const box = root.querySelector('#eq-backfill');
  let last;
  try { last = await getHistoryLastDate(); } catch { return toast('ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง'); }
  const to = addDaysIso(todayIso(), -1);
  const from = last ? addDaysIso(last, 1) : to;
  const days = from <= to ? openDays(from, to) : [];
  if (!days.length) return void (box.innerHTML = state.backfill = `<p class="asm__note">${fillText(FC_SYNC_UI.backfillNone, { d: last || '—' })}</p>`);
  const ok = await confirmSheet({ title: FC_SYNC_UI.backfillBtn, okLabel: FC_SYNC_UI.backfillBtn, text: fillText(FC_SYNC_UI.backfillAsk, { from, to, n: days.length }) });
  if (!ok) return;
  const lines = [];
  const paint = () => { const b = root.querySelector('#eq-backfill') || box; b.innerHTML = state.backfill = lines.map(l => `<p class="asm__note" style="white-space:normal">${l}</p>`).join(''); };
  for (const d of days) {
    try {
      const r = await syncHistoryFromPrep(d);
      if (r.noData) lines.push(fillText(FC_SYNC_UI.backfillSkip, { d }));
      else {
        const why = r.incomplete.length ? ' (' + r.incomplete.map(x => `${x.name}: ${KITCHEN_UI.prep.why[x.why] || x.why}`).join(', ') + ')' : '';
        const extra = [r.skipOld.length ? `ข้ามข้อมูลเดิม ${r.skipOld.join(', ')}` : '', r.anomaly.length ? `สงสัยพิมพ์ผิด ${r.anomaly.join(', ')}` : '', r.negative.length ? `ติดลบ ${r.negative.join(', ')}` : ''].filter(Boolean).join(' · ');
        lines.push(fillText(FC_SYNC_UI.backfillDay, { d, w: r.written, i: r.incomplete.length, why }) + (extra ? ' · ' + extra : ''));
      }
    } catch { lines.push(fillText(FC_SYNC_UI.backfillErr, { d })); }
    paint();
  }
  lines.push(FC_SYNC_UI.backfillDone);
  paint();
  reload();
}

// ติดตั้งหน้า
export async function mountEquationPage(root) {
  root.querySelector('#eq-bar').innerHTML = topBarHtml({ title: EQ_UI.title, date: dayShort(todayIso()) });
  const body = root.querySelector('#eq-body');

  // โหลดข้อมูลใหม่ทั้งก้อน (หน้าลูกเรียกหลังเขียนลงฐาน เพื่อให้ทุกแท็บเห็นค่าใหม่)
  const reload = async () => {
    try { [state.data, state.excl] = await Promise.all([getFcBundle(), getFcExcluded().catch(() => [])]); state.error = false; }
    catch { state.error = true; }
    draw();
  };

  // วาดแท็บที่เปิดอยู่ (เจ้าของเห็นกล่องวันที่ตัดออก + ปุ่มชุดสูตรเหนือสุดทุกโหมด)
  function draw() {
    const simple = state.mode === 'simple';
    body.innerHTML = modeHtml(state.mode) + (isAdmin() && state.data ? adminHtml(state.data) : '') + (simple ? '' : backfillHtml() + tabsHtml(state.tab)) + '<div id="eq-pane"></div>';
    const ax = body.querySelector('.eqx');
    if (ax) ax.onclick = event => {
      const c = event.target.closest('[data-excl-cancel]'), s = event.target.closest('[data-susp-cut]');
      if (c) return cancelExcl(state.data, state.excl[Number(c.dataset.exclCancel)], reload);
      if (s) return cutSusp(state.data, s.dataset.suspCut, reload);
      if (event.target.closest('[data-model-set]')) return applyModelSet(state.data, reload);
    };
    body.querySelector('.eqs-mode').onclick = event => {
      const hit = event.target.closest('[data-eqmode]');
      if (!hit || hit.dataset.eqmode === state.mode) return;
      state.mode = hit.dataset.eqmode;
      draw();
    };
    const bf = body.querySelector('[data-backfill]');
    if (bf) bf.onclick = () => runBackfill(body, reload);
    const tabs = body.querySelector('.eq-tabs');
    if (tabs) tabs.onclick = event => {
      const hit = event.target.closest('[data-eqtab]');
      if (!hit || hit.dataset.eqtab === state.tab) return;
      state.tab = hit.dataset.eqtab;
      const view = root.closest('.app-view');
      if (view) view.scrollTop = 0;
      draw();
    };
    const pane = body.querySelector('#eq-pane');
    if (state.error) return void (pane.innerHTML = '<p class="ptab__none">ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง</p>');
    if (!state.data) return void (pane.innerHTML = '<p class="ptab__none">กำลังโหลดข้อมูลจากฐาน...</p>');
    if (simple) return mountSimple(pane, state.data, reload);
    if (state.tab === 'overview') { pane.innerHTML = overviewHtml(state.data); loadOverview(pane, state.data); return; }
    if (state.tab === 'lab') return mountLab(pane, state.data, reload);
    if (state.tab === 'lib') return mountLibrary(pane, state.data, reload);
    mountConfig(pane, state.data, reload);
  }

  draw();
  reload();
}
