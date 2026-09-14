// ปุ่มพิเศษ → หมู่บ้านอิ่มใจ (เกม) — หน้านี้แค่เปิดกล่องเกม ไม่ยุ่งกับ logic ในเกม
import { currentUser } from '../shared/auth.js';

export function mountVillagePage(root, showPage) {
  const frame = root.querySelector('#village-frame');
  const user = currentUser();
  // ส่งรหัสพนักงานที่ล็อกอินอยู่ให้เกม เกมจะไม่ถามล็อกอินอีก
  if (frame && !frame.src) frame.src = 'game/index.html?emp=' + encodeURIComponent(user ? user.code : '');

  // เกมกดปุ่ม "‹ แอป" มา → พากลับหน้าหลักของแอป
  const back = event => {
    if (!event.data || event.data.type !== 'imjai:exit') return;
    window.removeEventListener('message', back);
    showPage('home');
  };
  window.addEventListener('message', back);
}
