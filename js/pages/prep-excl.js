// แถบตัดวันออกจากพยากรณ์ของหน้าเตรียม-เหลือ (ป้าย/ปุ่ม + ขั้นตอนตัดวัน/ยกเลิก) — แยกจาก prep.js
import { isAdmin } from '../shared/auth.js';
import { PREP_UI } from '../shared/config.js';
import { todayIso, saveExcludedDay, cancelExcludedDay, refreshFutureFcDaily } from '../shared/data.js';
import { toast, pickerSheet, multiPickSheet, formSheet, confirmSheet, itemPhoto } from '../shared/ui.js';
import { dayShort, fillText, escHtml } from '../shared/format.js';
import { dowIso } from '../shared/fclab.js';

// รายการตัดวันของวันที่เลือก (ชุด config + ที่ตัดจากแอป)
const exclOf = (state, date) => state.excl.filter(x => x.date === date);

// แถบใต้วันที่ (เจ้าของ · วันที่ผ่านมาแล้ว · ไม่ใช่วันอาทิตย์): ปุ่มตัดวัน หรือป้าย "ตัดออกแล้ว · เหตุผล" + ปุ่มยกเลิก (เฉพาะที่ตัดจากแอป)
export function exclBarHtml(state, date) {
  if (!isAdmin() || date >= todayIso() || dowIso(date) === 0) return '';
  const list = exclOf(state, date);
  if (!list.length) return `<div class="prep-excl"><button type="button" data-excl-add="1">${PREP_UI.exclBtn}</button></div>`;
  return `<div class="prep-excl">${list.map(x => `<span class="prep-excl__done">${x.items === 'all' ? fillText(PREP_UI.exclDone, { note: escHtml(x.note) }) : fillText(PREP_UI.exclDoneSome, { n: x.items.length, note: escHtml(x.note) })}${x.source === 'config' ? ` · ${PREP_UI.exclSystem}` : ''}</span>${x.source === 'db' ? `<button type="button" data-excl-cancel="${x.ids.join(',')}">${PREP_UI.exclCancel}</button>` : ''}`).join('')}</div>`;
}


// สร้างชุดคำสั่งตัดวัน/ยกเลิก ผูกกับสถานะหน้า (state) และตัวโหลดหน้าใหม่ (load)
export function exclActions(state, load) {
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


  return { addExcl, cancelExcl };
}
