// หน้าเข้าสู่ระบบ: เลือกตัวละคร → ใส่ PIN 4 หลัก → เข้าแอป
import { signIn, users } from '../shared/auth.js';

export function mountLoginPage(root, onDone) {
  const cast = root.querySelector('#login-cast');
  const pin = root.querySelector('#login-pin');
  const go = root.querySelector('#login-go');
  const err = root.querySelector('#login-err');
  const eye = root.querySelector('#login-eye');
  let picked = null;

  cast.innerHTML = users().map(u => `
    <button type="button" data-code="${u.code}" aria-pressed="false">
      <img src="assets/login/avatar-${u.avatar}.webp" alt="" width="60" height="66" decoding="async">
      <span>${u.name}</span>
    </button>`).join('');

  // เปิด/ปิดปุ่มเข้าแอปตามความพร้อม: ต้องเลือกคน + ใส่ PIN ครบ 4 หลัก
  const sync = () => { go.disabled = !(picked && pin.value.length === 4); };

  cast.onclick = event => {
    const b = event.target.closest('[data-code]');
    if (!b) return;
    picked = b.dataset.code;
    cast.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    err.hidden = true;
    pin.focus();
    sync();
  };

  pin.oninput = () => { pin.value = pin.value.replace(/\D/g, '').slice(0, 4); err.hidden = true; sync(); };
  pin.onkeydown = event => { if (event.key === 'Enter' && !go.disabled) go.click(); };

  eye.onclick = () => {
    const on = eye.getAttribute('aria-pressed') !== 'true';
    eye.setAttribute('aria-pressed', String(on));
    pin.type = on ? 'text' : 'password';
  };

  go.onclick = () => {
    const user = signIn(picked, pin.value);
    if (!user) { err.hidden = false; err.textContent = 'รหัสไม่ถูกต้อง ลองใหม่นะ'; pin.value = ''; sync(); return; }
    onDone(user);
  };
}
