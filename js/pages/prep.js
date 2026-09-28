// หน้าเตรียม-เหลือ — คุมสถานะกลาง (วันที่/แท็บ/ตัวกรอง) โหลดข้อมูลจริงจากฐาน และรับการกรอกของทุกแท็บ
import { getPrepRecs, savePrep, saveLeft, saveMenuSetting, saveCookRatio, saveAssumption, getPrepHistory, getLeftHistory, todayIso, getFcExcluded, saveExcludedDay, cancelExcludedDay, refreshFutureFcDaily } from '../shared/data.js';
import { staffCode, isAdmin } from '../shared/auth.js';
import { PREP_FILTERS, PREP_ENTRY, PREP_UI, PREP_PEOPLE_LOOK } from '../shared/config.js';
import { topBarHtml, toast, dateBarHtml, dateBandHtml, handleDateClick, handleDatePick, pickerSheet, multiPickSheet, formSheet, confirmSheet, itemPhoto } from '../shared/ui.js';
import { prepMeatTotals, riceTotals } from '../shared/calc.js';
import { dayShort, fillText, escHtml } from '../shared/format.js';
import { dowIso } from '../shared/fclab.js';
import { setPeople, heroHtml, tabsHtml, filterHtml, kpiHtml, tipHtml } from './prep-view.js';
import { historySheet } from './prep-date.js';
import { meatBodyHtml } from './prep-meat.js';
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

// รายการตัดวันของวันที่เลือก (ชุด config + ที่ตัดจากแอป)
const exclOf = date => state.excl.filter(x => x.date === date);

// แถบใต้วันที่ (เจ้าของ · วันที่ผ่านมาแล้ว · ไม่ใช่วันอาทิตย์): ปุ่มตัดวัน หรือป้าย "ตัดออกแล้ว · เหตุผล" + ปุ่มยกเลิก (เฉพาะที่ตัดจากแอป)
function exclBarHtml(date) {
  if (!isAdmin() || date >= todayIso() || dowIso(date) === 0) return '';
  const list = exclOf(date);
  if (!list.length) return `<div class="prep-excl"><button type="button" data-excl-add="1">${PREP_UI.exclBtn}</button></div>`;
  return `<div class="prep-excl">${list.map(x => `<span class="prep-excl__done">${x.items === 'all' ? fillText(PREP_UI.exclDone, { note: escHtml(x.note) }) : fillText(PREP_UI.exclDoneSome, { n: x.items.length, note: escHtml(x.note) })}${x.source === 'config' ? ` · ${PREP_UI.exclSystem}` : ''}</span>${x.source === 'db' ? `<button type="button" data-excl-cancel="${x.ids.join(',')}">${PREP_UI.exclCancel}</button>` : ''}`).join('')}</div>`;
}

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
    if (ex) ex.innerHTML = exclBarHtml(state.date);
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
    el('#prep-date').innerHTML = dateBarHtml(state.date) + dateBandHtml(state.date) + `<div id="prep-excl">${exclBarHtml(state.date)}</div>`;
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
    if (state.tab === 'meat') {
      const rows = visible(m.meatRows);
      kpi.innerHTML = kpiHtml('meat', prepMeatTotals(rows));
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

  // หลังตัด/ยกเลิกวัน: คำนวณค่าพยากรณ์ที่บันทึกไว้ล่วงหน้าใหม่ (เฉพาะแถวที่ยังไม่มีผลจริง) แล้วโหลดหน้าใหม่
  const afterExcl = async (msgKey, d) => {
    let n = 0;
    try { n = await refreshFutureFcDaily(); } catch { toast(PREP_UI.exclRefreshFail); await load(); return; }
    toast(fillText(PREP_UI[msgKey], { d: dayShort(d), n }));
    await load();
  };

  // ตัดวันที่เลือกออกจากพยากรณ์: เลือกเหตุผล → ขอบเขต (ทุกวัตถุดิบ / เลือกบางตัว) → ยืนยัน → เขียน kk_forecast_regime
  const addExcl = async () => {
    const d = state.date, m = state.model;
    const reason = await pickerSheet({ title: PREP_UI.exclReasonTitle, options: [...PREP_UI.exclReasons.map(r => ({ value: r, label: r })), { value: '__other', label: PREP_UI.exclOther }] });
    if (!reason) return;
    let note = reason;
    if (reason === '__other') {
      const f = await formSheet({ title: PREP_UI.exclReasonTitle, fields: [{ key: 'note', label: PREP_UI.exclOtherLabel, kind: 'text' }] });
      if (!f || !f.note) return;
      note = f.note;
    }
    const all = [...m.meatRows, ...m.riceRows];
    const scope = await pickerSheet({ title: PREP_UI.exclScopeTitle, options: [{ value: 'all', label: PREP_UI.exclScopeAll }, { value: 'some', label: PREP_UI.exclScopeSome }] });
    if (!scope) return;
    let ids = all.map(r => r.id);
    if (scope === 'some') {
      ids = await multiPickSheet({ title: PREP_UI.exclPickTitle, options: all.map(r => ({ value: r.id, label: r.name, image: itemPhoto(r) })) });
      if (!ids || !ids.length) return;
    }
    const scopeText = scope === 'all' ? PREP_UI.exclScopeAll : `${ids.length} รายการ`;
    if (!await confirmSheet({ title: PREP_UI.exclBtn, text: fillText(PREP_UI.exclConfirm, { d: dayShort(d), scope: scopeText, note: escHtml(note) }), okLabel: PREP_UI.exclBtn, danger: true })) return;
    try { await saveExcludedDay(d, ids, note); }
    catch (e) { return toast(fillText(PREP_UI.exclFail, { e: String(e && e.message || e).slice(0, 160) })); }
    afterExcl('exclSaved', d);
  };

  // ยกเลิกการตัดวัน (PATCH regime = excluded_cancelled ห้ามลบแถว)
  const cancelExcl = async ids => {
    const d = state.date;
    if (!await confirmSheet({ title: PREP_UI.exclCancel, text: `${PREP_UI.exclCancel} · ${dayShort(d)}`, okLabel: PREP_UI.exclCancel })) return;
    try { await cancelExcludedDay(ids.split(',')); }
    catch (e) { return toast(fillText(PREP_UI.exclFail, { e: String(e && e.message || e).slice(0, 160) })); }
    afterExcl('exclCancelled', d);
  };

  draw();
  load();

  root.addEventListener('click', async event => {
    const hit = sel => event.target.closest(sel);
    const tab = hit('.prep-tab[data-tab]'), filter = hit('[data-filter]'), histBtn = hit('[data-hist]');
    if (tab) { state.tab = tab.dataset.tab; state.filter = 'all'; root.closest('.app-view').scrollTop = 0; draw(); }
    else if (filter) { state.filter = filter.dataset.filter; el('#prep-filter').innerHTML = filterHtml(state.tab, state.filter); drawData(); }
    else if (histBtn) openHistory(histBtn);
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
