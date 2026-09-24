// หน้าตรวจสอบสมการ Forecast — ตัวคุมแท็บ 4 หน้า โหลดข้อมูลจริงจากฐานครั้งเดียว แล้วส่งให้แท็บที่เปิดอยู่
import { EQ_UI, EQ_TABS, EQ_SIMPLE, FC_SYNC_UI, KITCHEN_UI } from '../shared/config.js';
import { getFcBundle, todayIso, getHistoryLastDate, syncHistoryFromPrep } from '../shared/data.js';
import { topBarHtml, glyph, confirmSheet, toast } from '../shared/ui.js';
import { isAdmin } from '../shared/auth.js';
import { addDaysIso, dowIso } from '../shared/fclab.js';
import { dayShort, fillText } from '../shared/format.js';
import { overviewHtml, loadOverview } from './eq-overview.js';
import { mountLab } from './eq-lab.js';
import { mountLibrary } from './eq-library.js';
import { mountConfig } from './eq-config.js';
import { mountSimple } from './eq-simple.js';

// สถานะของหน้า: แท็บที่เปิด + ข้อมูลทั้งก้อนจากฐาน
const state = { tab: 'overview', mode: 'simple', data: null, error: false, backfill: '' };

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
    try { state.data = await getFcBundle(); state.error = false; }
    catch { state.error = true; }
    draw();
  };

  // วาดแท็บที่เปิดอยู่
  function draw() {
    const simple = state.mode === 'simple';
    body.innerHTML = modeHtml(state.mode) + (simple ? '' : backfillHtml() + tabsHtml(state.tab)) + '<div id="eq-pane"></div>';
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
