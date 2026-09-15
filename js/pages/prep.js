// หน้าเตรียม-เหลือ — คุมสถานะกลาง (วันที่/แท็บ/ตัวกรอง) โหลดข้อมูลจริงจากฐาน และรับการกรอกของทุกแท็บ
import { get, getPrepBundle, savePrep, saveLeft, saveMenuSetting, saveCookRatio, saveAssumption, getPrepHistory, getLeftHistory, getPrepLogs, getLastPrepDateBefore, todayIso } from '../shared/data.js';
import { staffCode } from '../shared/auth.js';
import { PREP_FILTERS, PREP_ENTRY, PREP_UI } from '../shared/config.js';
import { topBarHtml, toast } from '../shared/ui.js';
import { buildPrepModel, prepMeatTotals, riceTotals } from '../shared/calc.js';
import { buildForecast, recTarget, carryOver } from '../shared/forecast.js';
import { dayShort, fillText } from '../shared/format.js';
import { setPeople, heroHtml, tabsHtml, filterHtml, kpiHtml, tipHtml } from './prep-view.js';
import { dateBarHtml, dateBandHtml, handleDateClick, handleDatePick, historySheet } from './prep-date.js';
import { meatBodyHtml } from './prep-meat.js';
import { riceBodyHtml } from './prep-rice.js';
import { fahBodyHtml } from './prep-fah.js';
import { forecastBodyHtml } from './prep-forecast.js';

// สถานะกลางของหน้า: วันที่ทำงานตัวเดียว ทุกแท็บใช้ร่วมกัน สลับแท็บแล้ววันที่ไม่รีเซ็ต
const state = { tab: 'meat', filter: 'all', date: todayIso(), model: null, fc: null, draft: null, error: false };

// แปลงช่องบนจอ → ประเภทแถวในฐาน (แท็บข้าว r0-r2 = หุงเพิ่มรอบ 1-3)
function entryOf(kind, f) {
  if (kind === 'rice' && /^r\d$/.test(f)) return { type: PREP_ENTRY.rice.r, seq: Number(f[1]) + 1 };
  return { type: PREP_ENTRY[kind][f], seq: 1 };
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมข้อมูลจริง
export function mountPrepPage(root) {
  setPeople(get('prepPeople'));
  root.querySelector('#prep-bar').innerHTML = topBarHtml({ title: 'เตรียม-เหลือ', date: dayShort(state.date), dateId: 'prep-date-top' });
  const el = id => root.querySelector(id);
  state.date = todayIso();   // เปิดหน้าครั้งแรก = วันนี้เสมอ

  // โหลดข้อมูลทุกชุดของวันที่เลือกในครั้งเดียว แล้ววาดใหม่
  const load = async () => {
    state.error = false;
    try {
      const b = await getPrepBundle(state.date);
      state.model = buildPrepModel(b);
      state.fc = buildForecast(b.items, b.logsFc, state.date, b.cfg);
      // แนะเป้าเตรียม = ขอบบนพยากรณ์ − คงเหลือเมื่อวาน (เสาร์ห้ามเผื่อ)
      state.model.meatRows.forEach(r => {
        r.rec = recTarget(state.fc.rows.find(x => x.id === r.id), carryOver(b.logsFc, r.id, state.date), state.date);
      });
    }
    catch { state.error = true; }
    drawData();
  };

  // กรองรายการตามชิปที่เลือก (ช่วยหา ไม่ใช่จำกัดสิทธิ์ — ใครก็กรอกช่องไหนก็ได้)
  const visible = rows => {
    const f = (PREP_FILTERS[state.tab] || []).find(x => x.id === state.filter) || {};
    const who = f.people || [];
    return who.length ? rows.filter(r => (r.owners || []).some(id => who.includes(id))) : rows;
  };

  // วาดส่วนที่เปลี่ยนตามแท็บ/วันที่
  const draw = () => {
    root.querySelector('.prep').dataset.tab = state.tab;
    el('#prep-hero').innerHTML = heroHtml(state.tab);
    el('#prep-tabs').innerHTML = tabsHtml(state.tab);
    el('#prep-date').innerHTML = dateBarHtml(state.date) + dateBandHtml(state.date);
    el('#prep-filter').innerHTML = filterHtml(state.tab, state.filter);
    el('#prep-tip').innerHTML = tipHtml(state.tab);
    const top = el('#prep-date-top');
    if (top) top.textContent = dayShort(state.date);
    drawData();
  };

  // วาดเฉพาะตัวเลขสรุป + ตาราง (เรียกซ้ำเมื่อข้อมูลเปลี่ยน)
  const drawData = () => {
    const kpi = el('#prep-kpi'), body = el('#prep-body');
    kpi.innerHTML = '';
    if (state.error) { body.innerHTML = `<div class="prep-err">${PREP_UI.loadError} <button type="button" data-retry="1">${PREP_UI.retry}</button></div>`; return; }
    if (!state.model || state.model.date !== state.date) { body.innerHTML = `<p class="ptab__none">${PREP_UI.loading}</p>`; return; }
    const m = state.model;
    // เลือกวันล่วงหน้า = มีปุ่มคัดลอกค่า "เตรียม/หุง" จากวันที่มีข้อมูลล่าสุดมาเป็นร่าง (ยืนยันทีละแถว)
    const copyBtn = state.date > todayIso() && (state.tab === 'meat' || state.tab === 'rice')
      ? `<div class="prep-copy"><button type="button" data-copy-prev="1">${PREP_UI.copyPrev}</button></div>` : '';
    if (state.tab === 'meat') {
      const rows = visible(m.meatRows);
      kpi.innerHTML = kpiHtml('meat', prepMeatTotals(rows));
      body.innerHTML = copyBtn + meatBodyHtml(rows, get('prepMeatGroups'), m, state.draft);
    } else if (state.tab === 'rice') {
      const rows = visible(m.riceRows);
      const t = riceTotals(rows);
      kpi.innerHTML = kpiHtml('rice', t);
      body.innerHTML = copyBtn + riceBodyHtml(rows, t, m, state.draft);
    } else if (state.tab === 'forecast') body.innerHTML = forecastBodyHtml(state.fc, state.date);
    else body.innerHTML = fahBodyHtml(m);
  };

  // บันทึก 1 ช่องลงฐาน (append-only ผ่าน data.js) ด้วยวันที่ที่เลือก แล้วโหลดข้อมูลวันเดิมมาใหม่
  const saveCell = async input => {
    const { save: kind, f, id, key } = input.dataset;
    const qty = input.value === '' ? null : Math.max(0, Number(input.value));
    input.disabled = true;
    try {
      if (kind === 'fah') await saveLeft({ menu: id, date: state.date, type: PREP_ENTRY.fah[f], qty, by: staffCode() });
      else if (kind === 'ratio') await saveCookRatio(id, qty);
      else if (kind === 'menuRatio') await saveMenuSetting(id, { protein_ratio: qty });
      else if (kind === 'assume') await saveAssumption(key, qty, staffCode());
      else { const e = entryOf(kind, f); await savePrep({ item: id, date: state.date, type: e.type, seq: e.seq, qty, by: staffCode() }); }
      await load();
    } catch { input.disabled = false; toast(PREP_UI.saveError); }
  };

  // เปิดกล่องประวัติการแก้ของช่องนั้น (อ่านจากฐานทุกครั้ง)
  const openHistory = async btn => {
    const { hist, id, f, name } = btn.dataset;
    const isFah = hist === 'fah';
    const e = isFah ? { type: PREP_ENTRY.fah[f] } : entryOf(hist, f);
    const rows = isFah ? await getLeftHistory(id, state.date, e.type) : await getPrepHistory(id, state.date, e.type, e.seq);
    historySheet({ title: `${name || ''} ${e.type} · ${dayShort(state.date)}`.trim(), rows, unit: isFah ? 'ก.' : 'กก.' });
  };

  // ดึงค่า "เตรียม/หุง" ของวันที่มีข้อมูลล่าสุดมาเป็นร่าง — ยังไม่บันทึก ต้องกดยืนยันทีละแถว
  const copyPrev = async () => {
    const type = state.tab === 'rice' ? PREP_ENTRY.rice.cook : PREP_ENTRY.meat.prep;
    const last = await getLastPrepDateBefore(state.date, type);
    if (!last) return toast(PREP_UI.copyNone);
    const values = {};
    (await getPrepLogs(last)).forEach(l => { if (l.entry_type === type && l.seq === 1 && l.qty !== null) values[l.count_item_id] = Number(l.qty); });
    state.draft = { kind: state.tab, values };
    drawData();
    toast(fillText(PREP_UI.copyDrafted, { d: dayShort(last) }));
  };

  // ยืนยันใช้ค่าร่างของแถวนั้น → บันทึกจริงลงฐาน
  const applyDraft = async btn => {
    const type = state.tab === 'rice' ? PREP_ENTRY.rice.cook : PREP_ENTRY.meat.prep;
    try {
      await savePrep({ item: btn.dataset.id, date: state.date, type, seq: 1, qty: Number(btn.dataset.v), by: staffCode() });
      if (state.draft) delete state.draft.values[btn.dataset.id];
      await load();
    } catch { toast(PREP_UI.saveError); }
  };

  draw();
  load();

  root.addEventListener('click', async event => {
    const hit = sel => event.target.closest(sel);
    const tab = hit('.prep-tab[data-tab]'), filter = hit('[data-filter]'), histBtn = hit('[data-hist]'), draftBtn = hit('[data-apply-draft]');
    if (tab) { state.tab = tab.dataset.tab; state.filter = 'all'; state.draft = null; root.closest('.app-view').scrollTop = 0; draw(); }
    else if (filter) { state.filter = filter.dataset.filter; el('#prep-filter').innerHTML = filterHtml(state.tab, state.filter); drawData(); }
    else if (histBtn) openHistory(histBtn);
    else if (draftBtn) applyDraft(draftBtn);
    else if (hit('[data-copy-prev]')) copyPrev();
    else if (hit('[data-retry]')) load();
    else if (await handleDateClick(event, state)) { state.draft = null; draw(); load(); }
  });

  root.addEventListener('change', async event => {
    const t = event.target;
    if (t.matches('input[data-save]')) return saveCell(t);
    if (t.matches('select[data-menu-set]')) {   // เลือกเนื้อสัตว์ของเมนู (การ์ด Assumption แท็บอาหารเหลือ)
      try { await saveMenuSetting(t.dataset.id, { protein_item_id: t.value || null }); await load(); }
      catch { toast(PREP_UI.saveError); }
      return;
    }
    if (t.matches('#prep-date-pick') && await handleDatePick(t.value, state)) { state.draft = null; draw(); load(); }
  });
}