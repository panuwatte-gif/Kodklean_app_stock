// หน้าอื่นๆ — เฉพาะข้อมูลของหน้านี้ (ชิ้นส่วนการ์ดกระจกอยู่ที่ js/shared/ui.js)
import { OTHER_CARDS, OTHER_UI } from '../shared/config.js';
import { mountGlassPage, toast } from '../shared/ui.js';
import { fillText } from '../shared/format.js';

// เมนูปลายทางที่มีหน้าของตัวเอง (goto) กดแล้วเข้าหน้านั้น ที่ยังไม่มีก็แจ้งสถานะไว้ก่อน
export function mountOtherPage(root, onGo) {
  mountGlassPage(root, OTHER_UI, OTHER_CARDS, card => {
    if (card.goto && onGo) return onGo(card.goto);
    toast(fillText(OTHER_UI.soon, { name: card.title }));
  });
}
