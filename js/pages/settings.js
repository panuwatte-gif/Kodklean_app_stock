// หน้าตั้งค่า → การ์ดพนักงาน: เพิ่ม แก้ชื่อ พักงาน (freeze) เรียกกลับ และลบออกจากระบบ
import { SETTINGS_UI, ACCOUNT_AVATARS } from '../shared/config.js';
import { glyph, fillGlyphs, toast, confirmSheet, formSheet } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import { isAdmin } from '../shared/auth.js';
import * as data from '../shared/data.js';

const T = SETTINGS_UI;
let rows = [];

// แถวพนักงาน 1 คน
function rowHtml(s, canEdit) {
  return `
    <div class="set__row${s.frozen ? ' is-frozen' : ''}">
      <img class="set__face" src="assets/login/avatar-${s.avatar || 'ahhia'}.webp" alt="" width="42" height="42" loading="lazy" decoding="async">
      <div class="set__rowText">
        <b>${s.name}${s.frozen ? `<em>${T.frozenTag}</em>` : ''}</b>
        <span>${T.roleName[s.role] || s.role} · ${s.code}</span>
      </div>
      ${canEdit ? `<div class="set__tools">
        <button class="set__tool" type="button" data-act="edit" data-code="${s.code}" aria-label="${T.edit}">${glyph('pencil', 15)}</button>
        <button class="set__tool${s.frozen ? ' is-on' : ''}" type="button" data-act="freeze" data-code="${s.code}" aria-label="${s.frozen ? T.unfreeze : T.freeze}">${glyph('snow', 15)}</button>
        <button class="set__tool set__tool--del" type="button" data-act="del" data-code="${s.code}" aria-label="${T.remove}">${glyph('trash', 15)}</button>
      </div>` : ''}
    </div>`;
}

// วาดรายชื่อทั้งหมดใหม่
function draw(root) {
  const canEdit = isAdmin();
  root.querySelector('#set-count').textContent = fillText(T.count, { n: rows.filter(s => !s.frozen).length });
  root.querySelector('#set-list').innerHTML = rows.map(s => rowHtml(s, canEdit)).join('') || `<p class="set__empty">${T.loading}</p>`;
  root.querySelector('#set-add').hidden = !canEdit;
}

// โหลดรายชื่อจากฐาน
async function load(root) {
  try {
    rows = (await data.getStaff()) || [];
    draw(root);
  } catch (err) {
    root.querySelector('#set-list').innerHTML = `<p class="set__empty">${T.error}</p>`;
  }
}

// เพิ่มพนักงานใหม่
async function askAdd(root) {
  const out = await formSheet({
    title: T.addAsk.title,
    fields: [
      { key: 'name', label: T.addAsk.name, value: '', placeholder: 'ชื่อเล่น' },
      { key: 'code', label: T.addAsk.code, value: '', placeholder: 'nong' },
      { key: 'role', label: T.addAsk.role, kind: 'select', value: 'staff', options: T.roles },
      { key: 'avatar', label: T.addAsk.avatar, kind: 'image', options: ACCOUNT_AVATARS }
    ],
    okLabel: T.addAsk.ok
  });
  if (!out) return;
  const name = String(out.name || '').trim();
  const code = String(out.code || '').trim().toLowerCase();
  if (!name) return toast(T.err.name);
  if (!/^[a-z0-9_]{2,16}$/.test(code)) return toast(T.err.code);
  if (rows.some(s => s.code === code)) return toast(T.err.dup);
  try {
    await data.addStaff({ code, name, role: out.role, avatar: out.avatar, sort_order: rows.length + 1 });
  } catch (err) { return toast(T.err.save); }
  await load(root);
  toast(fillText(T.done.add, { name }));
}

// แก้ชื่อ/ตำแหน่ง
async function askEdit(root, s) {
  const out = await formSheet({
    title: fillText(T.editAsk.title, { name: s.name }),
    fields: [
      { key: 'name', label: T.editAsk.name, value: s.name },
      { key: 'role', label: T.editAsk.role, kind: 'select', value: s.role, options: T.roles }
    ],
    okLabel: T.editAsk.ok
  });
  if (!out) return;
  const name = String(out.name || '').trim();
  if (!name) return toast(T.err.name);
  try { await data.saveStaff(s.code, { name, role: out.role }); } catch (err) { return toast(T.err.save); }
  await load(root);
  toast(fillText(T.done.edit, { name }));
}

// พักงานชั่วคราว / เรียกกลับ — พักงานแล้วงานที่รับผิดชอบถูกล้างทั้งหมด
async function askFreeze(root, s) {
  if (!s.frozen) {
    const ok = await confirmSheet({ title: fillText(T.freezeAsk.title, { name: s.name }), text: T.freezeAsk.text, okLabel: T.freezeAsk.ok, danger: true });
    if (!ok) return;
  }
  try {
    await data.saveStaff(s.code, { frozen: !s.frozen });
    if (!s.frozen) { await data.clearAssignsOf(s.code); await data.clearDutiesOf(s.code); }
  } catch (err) { return toast(T.err.save); }
  await load(root);
  toast(fillText(s.frozen ? T.done.unfreeze : T.done.freeze, { name: s.name }));
}

// ลบออกจากระบบ (ปิดการใช้งาน + ล้างงานที่รับผิดชอบ)
async function askDel(root, s) {
  const ok = await confirmSheet({ title: fillText(T.delAsk.title, { name: s.name }), text: T.delAsk.text, okLabel: T.delAsk.ok, danger: true });
  if (!ok) return;
  try {
    await data.removeStaff(s.code);
    await data.clearAssignsOf(s.code);
    await data.clearDutiesOf(s.code);   // ปิดหน้าที่เดิมด้วย ชื่อจะไม่โผล่เป็นผู้รับผิดชอบที่ไหนอีก
  } catch (err) { return toast(T.err.save); }
  await load(root);
  toast(fillText(T.done.del, { name: s.name }));
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมการ์ดพนักงาน
export function mountSettingsPage(root) {
  rows = [];
  root.querySelector('#set-title').textContent = T.title;
  root.querySelector('#set-sub').textContent = T.sub;
  root.querySelector('#set-staff-title').textContent = T.staffTitle;
  root.querySelector('#set-staff-sub').textContent = T.staffSub;
  root.querySelector('#set-add').innerHTML = `${glyph('plus', 17)}<span>${T.add}</span>`;
  root.querySelector('#set-list').innerHTML = `<p class="set__empty">${T.loading}</p>`;
  fillGlyphs(root, 20);

  root.querySelector('#set-add').onclick = () => askAdd(root);
  root.addEventListener('click', event => {
    const hit = event.target.closest('[data-act]');
    if (!hit) return;
    const s = rows.find(r => r.code === hit.dataset.code);
    if (!s) return;
    if (hit.dataset.act === 'edit') return askEdit(root, s);
    if (hit.dataset.act === 'freeze') return askFreeze(root, s);
    if (hit.dataset.act === 'del') return askDel(root, s);
  });

  load(root);
}
