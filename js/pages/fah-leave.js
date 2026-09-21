// หน้าบันทึกวันลาทีม — บันทึกวันลาของพนักงานลงตาราง kk_staff_leave (ประเภทการลามาจาก kk_leave_type)
import { todayIso, getStaff, getLeaveTypes, getLeaves, saveLeaves } from '../shared/data.js';
import { WORK_UI, LEAVE_UI as T } from '../shared/config.js';
import { workFrame, workDateHtml, workHistorySheet } from '../shared/work-ui.js';
import { toast, glyph, multiPickSheet, pickerSheet, handleDateClick, handleDatePick } from '../shared/ui.js';
import { staffCode, workStaff } from '../shared/auth.js';
import { dayShort, dayLongTh, shiftIso, fillText } from '../shared/format.js';

// ทุกวันในช่วง (รวมวันเริ่มและวันสิ้นสุด)
function daysBetween(from, to) {
  const out = [];
  for (let d = from; d <= to && out.length < 120; d = shiftIso(d, 1)) out.push(d);
  return out;
}

// ปฏิทินของเดือนที่กำลังดู (จุดสี = วันที่มีคนลา)
function calHtml(month, leaves, types, form) {
  const first = new Date(month + '-01T00:00:00');
  const start = new Date(first); start.setDate(1 - first.getDay());
  const pad = v => String(v).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const range = form.from && form.to ? daysBetween(form.from, form.to) : [];
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = iso(d), out = d.getMonth() !== first.getMonth();
    const hit = leaves.filter(l => l.leave_date === key);
    const color = hit.length ? (types.find(t => t.id === hit[0].leave_type) || {}).color || '#3B8BE0' : '';
    const cls = ['cal__day'];
    if (out) cls.push('cal__day--out');
    if (key === todayIso()) cls.push('is-today');
    if (key === form.from || key === form.to) cls.push('is-sel');
    else if (range.includes(key)) cls.push('is-range');
    return `<button class="${cls.join(' ')}" type="button" data-day="${key}">${d.getDate()}${color ? `<i class="cal__dot" style="background:${color}"></i>` : ''}</button>`;
  }).join('');
  const label = `${T.months[first.getMonth()]} ${first.getFullYear() + 543}`;
  return `
    <section class="wcard">
      <div class="cal__head">
        <button class="cal__nav" type="button" data-mon="-1" aria-label="เดือนก่อน">${glyph('back', 16)}</button>
        <b>${label}</b>
        <button class="cal__nav cal__nav--next" type="button" data-mon="1" aria-label="เดือนถัดไป">${glyph('back', 16)}</button>
      </div>
      <div class="cal__grid">${T.weekDays.map(d => `<span class="cal__dow">${d}</span>`).join('')}${cells}</div>
    </section>`;
}

// การ์ดกรอกข้อมูลการลา
function formHtml(form, staff, types, me) {
  const names = form.staff.map(c => (staff.find(s => s.code === c) || {}).name || c).join(', ');
  const type = (types.find(t => t.id === form.type) || {}).name_th || '';
  const field = (icon, label, inner) => `<div class="lfield"><span class="lfield__ic">${glyph(icon, 18)}</span><span class="lfield__lab">${label}</span>${inner}</div>`;
  return `
    <section class="wcard">
      <div class="wsec">
        <img src="assets/login/avatar-${me.code}.webp" alt="" width="34" height="34" style="border-radius:50%" decoding="async">
        <span class="wsec__text"><b>${fillText(T.who, { name: me.name })}</b></span>
        <span class="whero__script">${T.script}</span>
      </div>
      ${field('users', T.staffLabel, `<button class="lpick${names ? '' : ' is-empty'}" type="button" data-pick="staff">${names || T.staffPick}${glyph('chevron', 14)}</button>`)}
      ${field('calendar', T.fromLabel, `<input class="lpick" type="date" data-f="from" value="${form.from || ''}">`)}
      ${field('calendar', T.toLabel, `<input class="lpick" type="date" data-f="to" value="${form.to || ''}">`)}
      ${field('file', T.typeLabel, `<button class="lpick${type ? '' : ' is-empty'}" type="button" data-pick="type">${type || T.typePick}${glyph('chevron', 14)}</button>`)}
      ${field('chart', T.noteLabel, `<input class="lpick" data-f="note" maxlength="200" placeholder="${T.notePlaceholder}" value="${form.note || ''}">`)}
    </section>`;
}

// การ์ดสรุปก่อนบันทึก
function sumHtml(form, staff, types) {
  const ok = form.staff.length && form.type && form.from;
  const to = form.to || form.from;
  const text = ok
    ? fillText(T.sumText, {
      names: form.staff.map(c => (staff.find(s => s.code === c) || {}).name || c).join(', '),
      type: (types.find(t => t.id === form.type) || {}).name_th || '',
      range: form.from === to ? dayLongTh(form.from) : `${dayShort(form.from)} – ${dayLongTh(to)}`,
      n: daysBetween(form.from, to).length * form.staff.length
    })
    : T.sumNone;
  return `
    <section class="wcard lsum">
      <img src="assets/fah/ic3d-clipboard.webp" alt="" width="40" height="40" loading="lazy" decoding="async">
      <span class="lsum__text${ok ? '' : ' lsum__none'}">${text}</span>
    </section>`;
}

// เอาโครงหน้างานมาเติมปฏิทินและฟอร์มวันลาจากฐาน
export function mountLeavePage(root, onGo) {
  workFrame(root, 'fah-leave');
  const state = { date: todayIso(), month: todayIso().slice(0, 7) };
  const form = { staff: [], from: '', to: '', type: '', note: '' };
  const el = id => root.querySelector(id);
  let staff = [], types = [], leaves = [], me = { code: workStaff(), name: '' };

  const draw = () => {
    el('#w-date').innerHTML = workDateHtml(state.date);
    el('#w-body').innerHTML = staff.length
      ? calHtml(state.month, leaves, types, form) + formHtml(form, staff, types, me) + sumHtml(form, staff, types)
      : `<p class="wempty">${WORK_UI.loading}</p>`;
  };

  const load = async () => {
    try {
      const [s, t, l] = await Promise.all([
        getStaff(), getLeaveTypes(), getLeaves(state.month + '-01', shiftIso(state.month + '-01', 45))
      ]);
      staff = s; types = t; leaves = l;
      me = { code: workStaff(), name: (s.find(x => x.code === workStaff()) || {}).name || '' };
      draw();
    } catch { el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loadError}</p>`; }
  };

  // บันทึกวันลา 1 แถวต่อคนต่อวัน
  const save = async () => {
    if (!form.staff.length) return toast(T.needStaff);
    if (!form.from) return toast(T.needDate);
    if (!form.type) return toast(T.needType);
    const days = daysBetween(form.from, form.to || form.from);
    const rows = [];
    form.staff.forEach(code => days.forEach(d => rows.push({
      staff_code: code, leave_date: d, leave_type: form.type, note: form.note || null, recorded_by: staffCode()
    })));
    const btn = el('[data-save]');
    btn.disabled = true;
    try {
      await saveLeaves(rows);
      form.staff = []; form.from = ''; form.to = ''; form.type = ''; form.note = '';
      await load();
      toast(fillText(T.saved, { n: rows.length }));
    } catch { toast(WORK_UI.saveError); }
    btn.disabled = false;
  };

  const list = () => workHistorySheet({
    title: T.listTitle,
    rows: leaves.map(l => ({
      label: (staff.find(s => s.code === l.staff_code) || {}).name || l.staff_code,
      sub: (types.find(t => t.id === l.leave_type) || {}).name_th || l.leave_type,
      value: dayShort(l.leave_date)
    }))
  });

  draw();
  load();

  root.addEventListener('click', async event => {
    const mon = event.target.closest('[data-mon]'), day = event.target.closest('[data-day]'), pick = event.target.closest('[data-pick]');
    if (mon) { state.month = shiftIso(state.month + '-15', Number(mon.dataset.mon) * 30).slice(0, 7); draw(); return load(); }
    if (day) { if (!form.from || form.to) { form.from = day.dataset.day; form.to = ''; } else form.to = day.dataset.day < form.from ? form.from : day.dataset.day; return draw(); }
    if (pick && pick.dataset.pick === 'staff') {
      const picked = await multiPickSheet({
        title: T.staffPick, options: staff.map(s => ({ value: s.code, label: s.name, image: `assets/login/avatar-${s.code}.webp` })), selected: form.staff
      });
      if (picked) { form.staff = picked; draw(); }
      return;
    }
    if (pick && pick.dataset.pick === 'type') {
      const picked = await pickerSheet({ title: T.typePick, options: types.map(t => ({ value: t.id, label: t.name_th })) });
      if (picked) { form.type = picked; draw(); }
      return;
    }
    if (event.target.closest('[data-save]')) return save();
    if (event.target.closest('[data-hist]')) return list();
    if (event.target.closest('[data-back]')) return onGo('mywork');
    if (await handleDateClick(event, state)) { state.month = state.date.slice(0, 7); draw(); load(); }
  });

  root.addEventListener('input', event => {
    const f = event.target.closest('[data-f]');
    if (f) { form[f.dataset.f] = event.target.value; if (f.dataset.f !== 'note') draw(); }
  });

  root.addEventListener('change', async event => {
    if (event.target.matches('#w-date-pick') && await handleDatePick(event.target.value, state)) { state.month = state.date.slice(0, 7); draw(); load(); }
  });
}
