// หน้าปุ่มพิเศษ — เฉพาะข้อมูลของหน้านี้ (ชิ้นส่วนการ์ดกระจกอยู่ที่ js/shared/ui.js)
import { SPECIAL_CARDS, SPECIAL_UI } from '../shared/config.js';
import { mountGlassPage, toast } from '../shared/ui.js';
import { fillText } from '../shared/format.js';

// การ์ดที่มีหน้าปลายทาง (goto) กดแล้วพาไปหน้านั้น ที่ยังไม่มีก็แจ้งสถานะไว้ก่อน
export function mountSpecialPage(root, onGo) {
  mountGlassPage(root, SPECIAL_UI, SPECIAL_CARDS, card => {
    if (card.goto && onGo) return onGo(card.goto);
    toast(fillText(SPECIAL_UI.soon, { name: card.title }));
  });
}
