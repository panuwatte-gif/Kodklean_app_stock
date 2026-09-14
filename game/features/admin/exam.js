// แท็บสอบ: เปิดรอบสอบ (ช่วงวันที่ / หมวด / จำนวนข้อ) + ดูผลสอบทุกคน
import * as api from '../../core/api.js';
import { CATS } from './questions.js';

const grade = pct => pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';

export function render(ctx) {
  const exams = ctx.data.exams || [], results = ctx.data.results || [];
  const today = new Date().toISOString().slice(0, 10);
  const name = id => (ctx.users.find(u => u.id === id) || {}).name_th || '—';
  return `<div class="card">
    <p class="h">เปิดรอบสอบ</p>
    <label>ชื่อรอบ</label><input id="x-title" placeholder="สอบประจำเดือน">
    <label>วันเริ่ม</label><input id="x-from" type="date" value="${today}">
    <label>วันสิ้นสุด</label><input id="x-to" type="date" value="${today}">
    <label>หมวดที่สอบ (เลือกได้หลายหมวด)</label>
    <div class="who" style="grid-template-columns:repeat(2,1fr)">${CATS.map(([v, l]) =>
      `<button type="button" class="x-cat" data-v="${v}" aria-pressed="false" style="font-size:13px">${l}</button>`).join('')}</div>
    <label>จำนวนข้อ</label><input id="x-n" type="number" value="20" min="5" max="100">
    <button class="btn" style="margin-top:12px" data-x-save>เปิดรอบสอบ</button>
  </div>
  <div class="card">
    <p class="h">รอบสอบ</p>
    ${exams.length ? exams.map(x => `<div class="row"><span style="flex:1">${x.title}<br>
      <small style="color:var(--muted)">${x.start_date} → ${x.end_date} · ${x.question_count} ข้อ · ${(x.categories || []).length} หมวด</small></span>
      <button class="lang" data-x-off="${x.id}" style="background:${x.active ? '#FFE3E1' : 'var(--cream)'};color:var(--ink)">${x.active ? 'ปิดรอบ' : 'ปิดแล้ว'}</button></div>`).join('')
      : '<p class="sub">ยังไม่มีรอบสอบ</p>'}
  </div>
  <div class="card">
    <p class="h">ผลสอบ</p>
    ${results.length ? results.map(r => {
      const pct = r.total ? Math.round(r.score / r.total * 100) : 0;
      return `<div class="row"><span style="flex:1">${name(r.user_id)}<br>
        <small style="color:var(--muted)">ครั้งที่ ${r.attempt} · ${r.taken_at.slice(0, 10)}</small></span>
        <b>${r.score}/${r.total}</b>
        <span class="lang" style="background:var(--cream);color:var(--ink)">${r.grade || grade(pct)}</span></div>`;
    }).join('') : '<p class="sub">ยังไม่มีใครสอบ</p>'}
  </div>`;
}

export function wire(root, ctx) {
  root.querySelectorAll('.x-cat').forEach(b => b.onclick = () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('on', on);
  });
  root.querySelectorAll('[data-x-off]').forEach(b => b.onclick = async () => {
    const x = ctx.data.exams.find(e => e.id === b.dataset.xOff);
    if (!x.active) return;
    await api.saveExam(x.id, { active: false }); x.active = false; ctx.draw();
  });
  const save = root.querySelector('[data-x-save]');
  if (save) save.onclick = async () => {
    const cats = [...root.querySelectorAll('.x-cat[aria-pressed="true"]')].map(b => b.dataset.v);
    if (!cats.length) return ctx.toast('เลือกหมวดที่สอบก่อนนะ');
    try {
      const [x] = await api.addExam({ title: root.querySelector('#x-title').value.trim() || 'รอบสอบ',
        start_date: root.querySelector('#x-from').value, end_date: root.querySelector('#x-to').value,
        categories: cats, question_count: Number(root.querySelector('#x-n').value) || 20 });
      ctx.data.exams.unshift(x); ctx.draw(); ctx.toast('เปิดรอบสอบแล้ว');
    } catch (err) { ctx.toast('บันทึกไม่สำเร็จ'); }
  };
}
