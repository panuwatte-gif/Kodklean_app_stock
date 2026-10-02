// หน้าเตรียม-เหลือ — คุมสถานะกลาง (วันที่/แท็บ/ตัวกรอง) โหลดข้อมูลจริงจากฐาน และรับการกรอกของทุกแท็บ
import { getPrepRecs, savePrep, saveLeft, saveMenuSetting, saveCookRatio, saveAssumption, getPrepHistory, getLeftHistory, todayIso, getFcExcluded } from '../shared/data.js';
import { staffCode } from '../shared/auth.js';
import { PREP_FILTERS, PREP_ENTRY, PREP_UI, PREP_PEOPLE_LOOK } from '../shared/config.js';
import { topBarHtml, toast, dateBarHtml, dateBandHtml, handleDateClick, handleDatePick } from '../shared/ui.js';
import { riceTotals } from '../shared/calc.js';
import { dayShort } from '../shared/format.js';
import { exclBarHtml, exclActions } from './prep-excl.js';
import { setPeople, heroHtml, tabsHtml, filterHtml, kpiHtml, tipHtml } from './prep-view.js';
import { historySheet } from './prep-date.js';
import { meatBodyHtml, meatStatsHtml } from './prep-meat.js';
import { openPrepChart } from '../shared/prep-chart.js';
import { riceBodyHtml } from './prep-rice.js';
import { fahBodyHtml } from './prep-fah.js';
import { forecastBodyHtml, saveFcDailyOnce } from './prep-forecast.js';
import { evalBodyHtml, mountEval } from '../shared/prep-eval.js';
import { manageList, manageBtnHtml } from '../shared/list-edit.js';

// สถานะกลางของหน้า: วันที่ทำงานตัวเดียว ทุกแท็บใช้ร่วมกัน สลับแท็บแล้ววันที่ไม่รีเซ็ต
const state = { tab: 'meat', filter: 'all', date: todayIso(), recDate: null, model: null, fc: null, excl: [], error: false };

// แปลงช่องบนจอ → ประเภทแถวในฐาน (แท็บข้าว r0-r2 = หุงเพิ่มรอบ 1-3)
function entryOf(kind, f) {
  if (kind === 'rice' && /^r\d$/.test(f)) return { type: PREP_ENTRY.rice.r, seq: Number(f[1]) + 1 };
  return { type: PREP_ENTRY[kind][f], seq: 1 };
}

// คนที่รับผิดชอบงานเตรียม: ชื่อจากตาราง kk_staff · สี/รูปประจำตัวจาก config
const peopleOf = staff => (staff || []).filter(s => PREP_PEOPLE_LOOK[s.code])
  .map(s => ({ id: s.code, name: s.name, ...PREP_PEOPLE_LOOK[s.code] }));

// รูป/สีไว้ใช้ระหว่างรอโหลดชื่อจากฐาน (กันรูปแตกตอนเปิดหน้าวินาทีแรก)
const PEOPLE_WAIT = Object.keys(PREP_PEOPLE_LOOK).map(id => ({ id, name: '', ...PREP_PEOPLE_LOOK[id] }));

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมข้อมูลจริง
export function mountPrepPage(root) {
  setPeople(PEOPLE_WAIT);
  root.querySelector('#prep-bar').innerHTML = topBarHtml({ title: 'เตรียม-เหลือ', date: dayShort(state.date), dateId: 'prep-date-top' });
  const el = id => root.querySelector(id);
  state.date = todayIso();   // เปิดหน้าครั้งแรก = วันนี้เสมอ

  // โหลดข้อมูลทุกชุดของวันที่เลือกในครั้งเดียว แล้ววาดใหม่
  const load = async () => {
    state.error = false;
    try {
      const [r, excl] = await Promise.all([getPrepRecs(state.date), getFcExcluded().catch(() => [])]);   // ตาราง + พยากรณ์ = ของวันที่เลือกวันเดียว (ชุดเดียวกับหน้าครัวพนักงาน)
      setPeople(peopleOf(r.b.staff));
      state.model = r.model; state.fc = r.fc; state.recDate = r.recDate; state.excl = excl;
      saveFcDailyOnce(state.fc, state.recDate);   // เก็บผลพยากรณ์ของวันนั้นไว้วัดความแม่นยำ (ทีละวัตถุดิบ ไม่ทับของเดิม)
    }
    catch { state.error = true; }
    const ex = el('#prep-excl');
    if (ex) ex.innerHTML = exclBarHtml(state, state.date);
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
    el('#prep-date').innerHTML = dateBarHtml(state.date) + dateBandHtml(state.date) + `<div id="prep-excl">${exclBarHtml(state, state.date)}</div>`;
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
    kpi.dataset.tab = state.tab;
    if (state.error) { body.innerHTML = `<div class="prep-err">${PREP_UI.loadError} <button type="button" data-retry="1">${PREP_UI.retry}</button></div>`; return; }
    if (!state.model || state.model.date !== state.date) { body.innerHTML = `<p class="ptab__none">${PREP_UI.loading}</p>`; return; }
    const m = state.model;
    if (state.tab === 'meat') {
      const rows = visible(m.meatRows);
      kpi.innerHTML = meatStatsHtml(rows);
      body.innerHTML = manageBtnHtml('item', 'เนื้อสัตว์') + meatBodyHtml(rows, m);
    } else if (state.tab === 'rice') {
      const rows = visible(m.riceRows);
      const t = riceTotals(rows);
      kpi.innerHTML = kpiHtml('rice', t);
      body.innerHTML = manageBtnHtml('item', 'ข้าวหุง') + riceBodyHtml(rows, t, m);
    } else if (state.tab === 'forecast') body.innerHTML = forecastBodyHtml(state.fc, state.recDate);
    else if (state.tab === 'eval') { body.innerHTML = evalBodyHtml(); mountEval(body, [...m.meatRows, ...m.riceRows]); }
    else body.innerHTML = manageBtnHtml('menu') + fahBodyHtml(m);
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

  const { addExcl, cancelExcl } = exclActions(state, () => load());
  draw();
  load();

  root.addEventListener('click', async event => {
    const hit = sel => event.target.closest(sel);
    const tab = hit('.prep-tab[data-tab]'), filter = hit('[data-filter]'), histBtn = hit('[data-hist]');
    if (tab) { state.tab = tab.dataset.tab; state.filter = 'all'; root.closest('.app-view').scrollTop = 0; draw(); }
    else if (filter) { state.filter = filter.dataset.filter; el('#prep-filter').innerHTML = filterHtml(state.tab, state.filter); drawData(); }
    else if (histBtn) openHistory(histBtn);
    else if (hit('[data-graph]')) openPrepChart(state.model && state.model.meatRows.find(r => r.id === hit('[data-graph]').dataset.graph), state.date);
    else if (hit('[data-excl-add]')) addExcl();
    else if (hit('[data-excl-cancel]')) cancelExcl(hit('[data-excl-cancel]').dataset.exclCancel);
    else if (hit('[data-manage]')) { const b = hit('[data-manage]'); manageList({ kind: b.dataset.manage, grp: b.dataset.grp, onDone: load }); }
    else if (hit('[data-retry]')) load();
    else if (await handleDateClick(event, state)) { draw(); load(); }
  });

  root.addEventListener('change', async event => {
    const t = event.target;
    if (t.matches('input[data-save]')) return saveCell(t);
    if (t.matches('select[data-menu-set]')) {   // เลือกเนื้อสัตว์ของเมนู (การ์ด Assumption แท็บอาหารเหลือ)
      try { await saveMenuSetting(t.dataset.id, { protein_item_id: t.value || null }); await load(); }
      catch { toast(PREP_UI.saveError); }
      return;
    }
    if (t.matches('#prep-date-pick') && await handleDatePick(t.value, state)) { draw(); load(); }
  });
}
