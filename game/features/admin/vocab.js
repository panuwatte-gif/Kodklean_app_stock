// แท็บคลังศัพท์: อังกฤษ/ไทย/พม่า + ระดับความสำคัญ (สูง = วนถามถี่ 2 เท่า)
import * as api from '../../core/api.js';
import { vocabQueue } from '../../core/autoquiz.js';

export function render(ctx) {
  const rows = ctx.data.vocab || [];
  return `<div class="card">
    <p class="h">เพิ่มคำศัพท์</p>
    <label>คำอังกฤษ</label><input id="v-en" placeholder="chicken">
    <label>คำแปลไทย</label><input id="v-th" placeholder="ไก่">
    <label>คำแปลพม่า</label><input id="v-my" placeholder="ကြက်">
    <label>ระดับความสำคัญ</label>
    <select id="v-pri"><option value="normal">ปกติ</option><option value="high">สูง (วนถามถี่ 2 เท่า)</option></select>
    <button class="btn" style="margin-top:12px" data-v-save>บันทึกคำศัพท์</button>
    <p class="sub" style="margin-top:8px">คิวถามตอนนี้ ${vocabQueue(rows).length} ข้อ จาก ${rows.length} คำ</p>
  </div>
  <div class="card">${rows.length ? rows.map(r => `<div class="row">
      <span style="flex:1">${r.word_en}<br><small style="color:var(--muted)">${r.word_th}${r.word_my ? ' · ' + r.word_my : ''}</small></span>
      ${r.priority === 'high' ? '<span class="lang" style="background:var(--gold);color:#4A3E30">สูง</span>' : ''}
      <button class="lang" data-v-del="${r.id}" style="background:#FFE3E1;color:#B3241C">ลบ</button></div>`).join('')
    : '<p class="sub">ยังไม่มีคำศัพท์</p>'}</div>`;
}

export function wire(root, ctx) {
  root.querySelectorAll('[data-v-del]').forEach(b => b.onclick = async () => {
    await api.delVocab(b.dataset.vDel);
    ctx.data.vocab = ctx.data.vocab.filter(x => x.id !== b.dataset.vDel);
    ctx.draw(); ctx.toast('ลบแล้ว');
  });
  const save = root.querySelector('[data-v-save]');
  if (save) save.onclick = async () => {
    const en = root.querySelector('#v-en').value.trim(), th = root.querySelector('#v-th').value.trim();
    if (!en || !th) return ctx.toast('ใส่คำอังกฤษและคำแปลไทยก่อนนะ');
    try {
      const [r] = await api.addVocab({ word_en: en, word_th: th,
        word_my: root.querySelector('#v-my').value.trim() || null, priority: root.querySelector('#v-pri').value });
      ctx.data.vocab.unshift(r); ctx.draw(); ctx.toast('บันทึกแล้ว');
    } catch (err) { ctx.toast('บันทึกไม่สำเร็จ'); }
  };
}
