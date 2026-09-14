// แท็บคำถามความรู้: พิมพ์รายข้อ + นำเข้าเป็นชุด + แก้เฉลยหมวดเปลี่ยนบ่อยแล้วล้าง "จำได้แล้ว"
import * as api from '../../core/api.js';
import { VOLATILE } from '../../core/autoquiz.js';

export const CATS = [['storage','เก็บอาหาร'], ['recipe','สูตร'], ['webapp','webapp'], ['grab','Grab'], ['ourshop','ร้านของเรา']];
let edit = null, importing = false;

const catName = id => (CATS.find(c => c[0] === id) || [,id])[1];

export function render(ctx) {
  const rows = ctx.data.questions || [];
  const e = edit || {};
  const ch = e.choices_th || ['', ''], chMy = e.choices_my || [];
  if (importing) return `<div class="card">
    <p class="h">นำเข้าจากข้อความ</p>
    <p class="sub">วางได้หลายข้อ 1 บรรทัด = 1 ข้อ รูปแบบ:<br>
      หมวด | ระดับ | คำถามไทย | ตัวเลือกคั่นด้วย ; | เลขข้อถูก(เริ่ม 1) | คำอธิบาย</p>
    <textarea id="q-bulk" rows="8" placeholder="grab | 2 | ลูกค้ายกเลิกออเดอร์ต้องทำอะไรก่อน | แจ้งหัวหน้า;ทิ้งอาหาร;กดรับใหม่ | 1 | แจ้งหัวหน้าเพื่อบันทึกสาเหตุ"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" data-q-impcancel style="background:#fff;color:var(--green);box-shadow:var(--shadow)">ยกเลิก</button>
      <button class="btn" data-q-imp>นำเข้า</button></div>
  </div>`;

  return `<div class="card">
    <p class="h">${edit ? 'แก้คำถาม' : 'เพิ่มคำถาม'}</p>
    <label>หมวด</label><select id="q-cat">${CATS.map(([v, l]) =>
      `<option value="${v}" ${e.category === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <label>ระดับความยาก 1–5</label><select id="q-lv">${[1,2,3,4,5].map(n =>
      `<option value="${n}" ${e.level === n ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <label>ประเภท</label><select id="q-type">
      <option value="choice" ${e.qtype !== 'tf' ? 'selected' : ''}>ตัวเลือก</option>
      <option value="tf" ${e.qtype === 'tf' ? 'selected' : ''}>ถูก-ผิด</option></select>
    <label>คำถามไทย</label><textarea id="q-th" rows="2">${e.q_th || ''}</textarea>
    <label>คำถามพม่า</label><textarea id="q-my" rows="2">${e.q_my || ''}</textarea>
    <div id="q-choices">${[0,1,2,3].map(i => `<label>ตัวเลือก ${i + 1}${i < 2 ? '' : ' (ไม่บังคับ)'}</label>
      <input class="q-ch" data-i="${i}" value="${ch[i] || ''}" placeholder="ไทย">
      <input class="q-chmy" data-i="${i}" value="${chMy[i] || ''}" placeholder="พม่า (ไม่บังคับ)">`).join('')}</div>
    <label>ข้อที่ถูก</label><select id="q-ans">${[0,1,2,3].map(i =>
      `<option value="${i}" ${(e.answer_index || 0) === i ? 'selected' : ''}>ตัวเลือก ${i + 1}</option>`).join('')}</select>
    <label>คำอธิบายเฉลยไทย</label><textarea id="q-exth" rows="2">${e.explain_th || ''}</textarea>
    <label>คำอธิบายเฉลยพม่า</label><textarea id="q-exmy" rows="2">${e.explain_my || ''}</textarea>
    <label>รูปประกอบ (ไม่บังคับ)</label><input id="q-img" type="file" accept="image/*">
    <label>สถานะ</label><select id="q-act">
      <option value="1" ${e.active !== false ? 'selected' : ''}>เปิดใช้งาน</option>
      <option value="0" ${e.active === false ? 'selected' : ''}>ปิด</option></select>
    <div style="display:flex;gap:8px;margin-top:12px">
      ${edit ? '<button class="btn" data-q-cancel style="background:#fff;color:var(--green);box-shadow:var(--shadow)">ยกเลิก</button>' : ''}
      <button class="btn" data-q-save>บันทึกคำถาม</button></div>
    <button class="btn btn--gold" style="margin-top:8px" data-q-impopen>นำเข้าจากข้อความ</button>
  </div>
  <div class="card">${rows.length ? rows.map(r => `<div class="row">
      <span style="flex:1">${r.q_th}<br><small style="color:var(--muted)">${catName(r.category)} · ระดับ ${r.level}${r.active ? '' : ' · ปิด'}</small></span>
      <button class="lang" data-q-edit="${r.id}" style="background:var(--cream);color:var(--ink)">แก้</button>
      <button class="lang" data-q-del="${r.id}" style="background:#FFE3E1;color:#B3241C">ลบ</button></div>`).join('')
    : '<p class="sub">ยังไม่มีคำถาม</p>'}</div>`;
}

export function wire(root, ctx) {
  const q = s => root.querySelector(s);
  const open = q('[data-q-impopen]'); if (open) open.onclick = () => { importing = true; ctx.draw(); };
  const cancelImp = q('[data-q-impcancel]'); if (cancelImp) cancelImp.onclick = () => { importing = false; ctx.draw(); };
  const cancel = q('[data-q-cancel]'); if (cancel) cancel.onclick = () => { edit = null; ctx.draw(); };

  root.querySelectorAll('[data-q-edit]').forEach(b => b.onclick = () => {
    edit = ctx.data.questions.find(x => x.id === b.dataset.qEdit); importing = false; ctx.draw();
  });
  root.querySelectorAll('[data-q-del]').forEach(b => b.onclick = async () => {
    await api.delQuestion(b.dataset.qDel);
    ctx.data.questions = ctx.data.questions.filter(x => x.id !== b.dataset.qDel);
    edit = null; ctx.draw(); ctx.toast('ลบแล้ว');
  });

  const imp = q('[data-q-imp]');
  if (imp) imp.onclick = async () => {
    const lines = q('#q-bulk').value.split('\n').map(s => s.trim()).filter(Boolean);
    const rows = [];
    for (const line of lines) {
      const p = line.split('|').map(s => s.trim());
      if (p.length < 5) continue;
      const choices = p[3].split(';').map(s => s.trim()).filter(Boolean);
      rows.push({ category: p[0], level: Number(p[1]) || 1, qtype: choices.length === 2 ? 'choice' : 'choice',
        q_th: p[2], choices_th: choices, answer_index: Math.max(0, (Number(p[4]) || 1) - 1), explain_th: p[5] || null });
    }
    if (!rows.length) return ctx.toast('อ่านข้อความไม่ออก ตรวจรูปแบบอีกครั้ง');
    try {
      const saved = await api.addQuestions(rows);
      ctx.data.questions.unshift(...saved);
      importing = false; ctx.draw(); ctx.toast(`นำเข้า ${saved.length} ข้อแล้ว`);
    } catch (err) { ctx.toast('นำเข้าไม่สำเร็จ'); }
  };

  const save = q('[data-q-save]');
  if (save) save.onclick = async () => {
    const th = q('#q-th').value.trim();
    if (!th) return ctx.toast('ใส่คำถามไทยก่อนนะ');
    const chs = [...root.querySelectorAll('.q-ch')].map(i => i.value.trim());
    const chsMy = [...root.querySelectorAll('.q-chmy')].map(i => i.value.trim());
    const keep = chs.map((v, i) => ({ v, my: chsMy[i] })).filter(o => o.v);
    if (keep.length < 2) return ctx.toast('ต้องมีตัวเลือกอย่างน้อย 2 ข้อ');
    const ans = Number(q('#q-ans').value);
    if (!chs[ans]) return ctx.toast('ข้อที่ถูกยังว่างอยู่');
    save.disabled = true;
    try {
      const body = { category: q('#q-cat').value, level: Number(q('#q-lv').value), qtype: q('#q-type').value,
        q_th: th, q_my: q('#q-my').value.trim() || null,
        choices_th: keep.map(o => o.v), choices_my: keep.map(o => o.my),
        answer_index: chs.slice(0, ans + 1).filter(Boolean).length - 1,
        explain_th: q('#q-exth').value.trim() || null, explain_my: q('#q-exmy').value.trim() || null,
        active: q('#q-act').value === '1', updated_at: new Date().toISOString() };
      const img = q('#q-img').files[0];
      if (img) body.image_url = await api.upload(img, 'quiz');
      if (edit) {
        // เฉลยเปลี่ยนในหมวด Grab / ร้านของเรา = ทุกคนต้องกลับมาเรียนข้อนี้ใหม่
        const answerChanged = edit.answer_index !== body.answer_index ||
          JSON.stringify(edit.choices_th) !== JSON.stringify(body.choices_th);
        const [r] = await api.saveQuestion(edit.id, body);
        if (answerChanged && VOLATILE.includes(body.category)) {
          await api.resetMastery(edit.id).catch(() => {});
          ctx.toast('แก้เฉลยแล้ว — ล้างสถานะจำได้ของทุกคน');
        } else ctx.toast('บันทึกแล้ว');
        Object.assign(edit, r);
      } else {
        const [r] = await api.addQuestions([body]);
        ctx.data.questions.unshift(r); ctx.toast('บันทึกแล้ว');
      }
      edit = null; ctx.draw();
    } catch (err) { save.disabled = false; ctx.toast('บันทึกไม่สำเร็จ'); }
  };
}
