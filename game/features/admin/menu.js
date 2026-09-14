// แท็บคลังเมนู: เพิ่ม/แก้/ลบเมนู + ดูคำถามที่ระบบสร้างให้อัตโนมัติ 3 แบบ
import * as api from '../../core/api.js';
import { menuQuestions } from '../../core/autoquiz.js';

let edit = null;   // เมนูที่กำลังแก้ (null = ฟอร์มเพิ่มใหม่)

export function render(ctx) {
  const rows = ctx.data.menu || [];
  const groups = [...new Set(rows.map(r => r.confuse_group).filter(Boolean))];
  const e = edit || {};
  return `<div class="card">
    <p class="h">${edit ? 'แก้เมนู' : 'เพิ่มเมนูใหม่'}</p>
    <label>ชื่อเมนู (ไทย)</label><input id="m-name" value="${e.name_th || ''}" placeholder="เช่น กะเพราอกไก่">
    <label>รูปเมนู</label><input id="m-img" type="file" accept="image/*">
    ${e.image_url ? `<img src="${e.image_url}" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:12px;margin-top:6px">` : ''}
    <label>ไฟล์เสียง (ไม่บังคับ)</label><input id="m-aud" type="file" accept="audio/*">
    ${e.audio_url ? '<p class="sub">มีไฟล์เสียงแล้ว</p>' : ''}
    <label>กลุ่มสับสน (เมนูกลุ่มเดียวกันใช้เป็นตัวเลือกหลอกกันเอง)</label>
    <input id="m-grp" list="m-grps" value="${e.confuse_group || ''}" placeholder="เช่น กะเพรา">
    <datalist id="m-grps">${groups.map(g => '<option value="' + g + '"></option>').join('')}</datalist>
    <label>สถานะ</label>
    <select id="m-act"><option value="1" ${e.active !== false ? 'selected' : ''}>เปิดใช้งาน</option>
      <option value="0" ${e.active === false ? 'selected' : ''}>ปิด</option></select>
    <div style="display:flex;gap:8px;margin-top:12px">
      ${edit ? '<button class="btn" data-m-cancel style="background:#fff;color:var(--green);box-shadow:var(--shadow)">ยกเลิก</button>' : ''}
      <button class="btn" data-m-save>บันทึกเมนู</button></div>
    <p class="sub" style="margin-top:8px">บันทึกแล้วระบบสร้างคำถาม 3 แบบให้ทันที: คำไทย→เลือกรูป · รูป→เลือกคำไทย · เสียง→เลือกคำไทย</p>
  </div>
  <div class="card">${rows.length ? rows.map(r => {
    const n = menuQuestions(r, rows).length;
    return `<div class="row">
      ${r.image_url ? `<img src="${r.image_url}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:10px">` : '<span style="width:44px"></span>'}
      <span style="flex:1">${r.name_th}<br><small style="color:var(--muted)">${r.confuse_group || 'ไม่มีกลุ่ม'} · ${n} คำถาม${r.active ? '' : ' · ปิด'}</small></span>
      <button class="lang" data-m-edit="${r.id}" style="background:var(--cream);color:var(--ink)">แก้</button>
      <button class="lang" data-m-del="${r.id}" style="background:#FFE3E1;color:#B3241C">ลบ</button></div>`;
  }).join('') : '<p class="sub">ยังไม่มีเมนูในคลัง</p>'}</div>`;
}

export function wire(root, ctx) {
  const q = s => root.querySelector(s);
  const ed = root.querySelector('[data-m-edit]');
  root.querySelectorAll('[data-m-edit]').forEach(b => b.onclick = () => {
    edit = (ctx.data.menu || []).find(x => x.id === b.dataset.mEdit); ctx.draw();
  });
  root.querySelectorAll('[data-m-del]').forEach(b => b.onclick = async () => {
    await api.delMenu(b.dataset.mDel);
    ctx.data.menu = ctx.data.menu.filter(x => x.id !== b.dataset.mDel);
    edit = null; ctx.draw(); ctx.toast('ลบแล้ว');
  });
  const cancel = q('[data-m-cancel]');
  if (cancel) cancel.onclick = () => { edit = null; ctx.draw(); };

  const save = q('[data-m-save]');
  if (save) save.onclick = async () => {
    const name = q('#m-name').value.trim();
    if (!name) return ctx.toast('ใส่ชื่อเมนูก่อนนะ');
    save.disabled = true;
    try {
      const body = { name_th: name, confuse_group: q('#m-grp').value.trim() || null, active: q('#m-act').value === '1' };
      const img = q('#m-img').files[0], aud = q('#m-aud').files[0];
      if (img) body.image_url = await api.upload(img, 'menu');
      if (aud) body.audio_url = await api.upload(aud, 'audio');
      if (edit) { const [r] = await api.saveMenu(edit.id, body); Object.assign(edit, r); }
      else { const [r] = await api.addMenu(body); ctx.data.menu.unshift(r); }
      edit = null; ctx.draw(); ctx.toast('บันทึกเมนูแล้ว');
    } catch (err) { save.disabled = false; ctx.toast('บันทึกไม่สำเร็จ'); }
  };
}
