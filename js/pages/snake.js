// ปุ่มพิเศษ → KodKlean Snake — เปิดเกมจากโปรเจกต์ของเกมโดยตรง จึงอัปเดตเกมครั้งเดียวแล้วแอปหลักเห็นทันที
import { SNAKE_GAME_URL } from '../shared/config.js';

const LOAD_TIMEOUT_MS = 15000;

export function mountSnakePage(root) {
  const frame = root.querySelector('[data-snake-frame]');
  const status = root.querySelector('[data-snake-status]');
  const reload = root.querySelector('[data-snake-reload]');
  const open = root.querySelector('[data-snake-open]');
  const url = new URL(SNAKE_GAME_URL, location.href);
  url.searchParams.set('embedded', 'stock-app');

  open.href = url.href;

  let timer = 0;
  const showLoading = () => {
    status.classList.remove('is-error');
    status.innerHTML = '<span class="snake-page__spinner" aria-hidden="true"></span><strong>กำลังเปิดเกม…</strong><small>ဂိမ်းကို ဖွင့်နေသည်…</small>';
    status.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => {
      status.classList.add('is-error');
      status.innerHTML = '<strong>เกมยังไม่ตอบสนอง</strong><small>เช็กอินเทอร์เน็ต แล้วกด “โหลดใหม่” หรือ “เต็มจอ”</small>';
      status.hidden = false;
    }, LOAD_TIMEOUT_MS);
  };

  const load = () => {
    showLoading();
    frame.src = url.href;
  };

  frame.addEventListener('load', () => {
    clearTimeout(timer);
    status.hidden = true;
  });

  reload.addEventListener('click', load);
  load();
}
