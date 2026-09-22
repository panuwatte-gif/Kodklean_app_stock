// ปุ่มพิเศษ → หมู่บ้านอิ่มใจ (เกม) — หน้านี้แค่เปิดกล่องเกม ไม่ยุ่งกับ logic ในเกม
import { currentUser } from '../shared/auth.js';

let onMsg = null, onPop = null;   // ตัวจับสัญญาณรอบก่อน (กันซ้อนกันตอนเข้าหน้านี้หลายรอบ)

// เลิกดักสัญญาณทั้งหมดของหน้านี้
function clean() {
  if (onMsg) window.removeEventListener('message', onMsg);
  if (onPop) window.removeEventListener('popstate', onPop);
  onMsg = onPop = null;
}

export function mountVillagePage(root, showPage) {
  const frame = root.querySelector('#village-frame');
  const user = currentUser();
  const url = 'game/index.html?emp=' + encodeURIComponent(user ? user.code : '');
  // โหลดเกมแบบไม่เพิ่มประวัติหน้า ถ้าเพิ่มไว้ กดปุ่มย้อนกลับของเครื่องแล้วเกมจะเด้งออกเป็นจอว่าง
  if (frame && !frame.dataset.loaded) {
    frame.dataset.loaded = '1';
    if (frame.contentWindow) frame.contentWindow.location.replace(url);
    else frame.src = url;
  }

  clean();
  history.pushState({ imjai: 1 }, '');   // กันหน้าเว้นไว้ 1 ช่อง ให้ปุ่มย้อนกลับกดโดนเกมก่อน

  // เกมกดปุ่ม "‹ แอป" หรือถอยจนสุดแล้ว → พากลับหน้าหลักของแอป
  onMsg = event => {
    if (!event.data || event.data.type !== 'imjai:exit') return;
    clean();
    history.back();          // คืนช่องประวัติที่กันไว้
    showPage('home');
  };

  // ปุ่มย้อนกลับของเครื่อง: ส่งเข้าไปให้เกมถอยหน้าเอง ยังไม่ออกจากแอป
  onPop = () => {
    if (!frame || !frame.isConnected || !frame.contentWindow) { clean(); return; }
    history.pushState({ imjai: 1 }, '');
    frame.contentWindow.postMessage({ type: 'imjai:back' }, '*');
  };

  window.addEventListener('message', onMsg);
  window.addEventListener('popstate', onPop);
}
