// หน้าบัญชีและรหัสผ่าน — ดู/แก้ PIN เพิ่มและลบบัญชี (เฉพาะสิ่งที่หน้านี้มีคนเดียว)
import { ACCOUNT_UI, ACCOUNT_ROLES, ACCOUNT_AVATARS } from '../shared/config.js';
import { users, currentUser, isAdmin, canEdit, setPin, addUser, removeUser } from '../shared/auth.js';
import { glyph, toast, confirmSheet, formSheet } from '../shared/ui.js';
import { fillText } from '../shared/format.js';

const T = ACCOUNT_UI;
let shown = {};   // รหัสพนักงานที่กำลังเปิดดู PIN อยู่

// แถวบัญชี 1 คน
function rowHtml(u, me) {
  const mine = me && me.code === u.code;
  const open = !!shown[u.code];
  const tools = [
    canEdit(u.code) ? `<button class="acc__btn" type="button" data-act="pin" data-code="${u.code}">${T.editPin}</button>` : '',
    isAdmin() && !mine ? `<button class="acc__btn acc__btn--del" type="button" data-act="del" data-code="${u.code}">${T.remove}</button>` : ''
  ].join('');
  return `
    <div class="acc">
      <img class="acc__face" src="assets/login/avatar-${u.avatar}.webp" alt="" width="46" height="46" loading="lazy" decoding="async">
      <div class="acc__main">
        <div class="acc__name">${u.name}${mine ? `<em>${T.meTag}</em>` : ''}</div>
        <div class="acc__role">${T.roleName[u.role] || u.role}</div>
        <div class="acc__keys">
          <span class="acc__key"><b>${T.codeLabel}</b>${u.code}</span>
          <span class="acc__key"><b>${T.pinLabel}</b>${open ? u.pin : '••••'}</span>
          <button class="acc__eye" type="button" data-act="eye" data-code="${u.code}"
            aria-label="${open ? T.hide : T.show}" aria-pressed="${open}">${glyph(open ? 'eyeOff' : 'eye', 15)}</button>
        </div>
      </div>
      <div class="acc__tools">${tools}</div>
    </div>`;
}

// วาดรายการบัญชีทั้งหมดใหม่
function draw(root) {
  const me = currentUser();
  const rows = isAdmin() ? users() : users().filter(u => me && u.code === me.code);
  root.querySelector('#g-count').textContent = fillText(T.count, { n: rows.length });
  root.querySelector('#acc-note').textContent = isAdmin() ? T.adminNote : T.staffNote;
  root.querySelector('#acc-list').innerHTML = rows.map(u => rowHtml(u, me)).join('');
  root.querySelector('#acc-add').hidden = !isAdmin();
}

// แก้ PIN ของบัญชีที่เลือก
async function askPin(root, user) {
  const out = await formSheet({
    title: fillText(T.pinAsk.title, { name: user.name }),
    fields: [{ key: 'pin', label: T.pinAsk.field, value: '', placeholder: '0000' }],
    okLabel: T.pinAsk.ok
  });
  if (!out) return;
  const err = await setPin(user.code, out.pin);
  if (err) return toast(T.err[err]);
  draw(root);
  toast(fillText(T.done.pin, { name: user.name }));
}

// เพิ่มบัญชีใหม่
async function askAdd(root) {
  const out = await formSheet({
    title: T.addAsk.title,
    fields: [
      { key: 'name', label: T.addAsk.name, value: '', placeholder: 'ชื่อเล่น' },
      { key: 'code', label: T.addAsk.code, value: '', placeholder: '1007' },
      { key: 'pin', label: T.addAsk.pin, value: '', placeholder: '0000' },
      { key: 'role', label: T.addAsk.role, kind: 'select', value: 'staff', options: ACCOUNT_ROLES },
      { key: 'avatar', label: T.addAsk.avatar, kind: 'image', options: ACCOUNT_AVATARS }
    ],
    okLabel: T.addAsk.ok
  });
  if (!out) return;
  const err = addUser(out);
  if (err) return toast(T.err[err]);
  draw(root);
  toast(fillText(T.done.add, { name: out.name }));
}

// ลบบัญชี
async function askDel(root, user) {
  const ok = await confirmSheet({
    title: fillText(T.delAsk.title, { name: user.name }),
    text: T.delAsk.text, okLabel: T.delAsk.ok, danger: true
  });
  if (!ok) return;
  const err = removeUser(user.code);
  if (err) return toast(T.err[err]);
  draw(root);
  toast(fillText(T.done.del, { name: user.name }));
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมรายการบัญชีและปุ่มจัดการ
export function mountAccountsPage(root) {
  shown = {};
  root.querySelector('#g-title').textContent = T.title;
  root.querySelector('#g-sub').textContent = T.sub;
  root.querySelector('#acc-add').textContent = T.add;
  draw(root);

  root.onclick = event => {
    const hit = event.target.closest('[data-act]');
    if (event.target.closest('#acc-add')) return askAdd(root);
    if (!hit) return;
    const user = users().find(u => u.code === hit.dataset.code);
    if (!user) return;
    if (hit.dataset.act === 'eye') { shown[user.code] = !shown[user.code]; return draw(root); }
    if (hit.dataset.act === 'pin') return askPin(root, user);
    if (hit.dataset.act === 'del') return askDel(root, user);
  };
}
