// หน้าอื่นๆ — เฉพาะข้อมูลของหน้านี้ (ชิ้นส่วนการ์ดกระจกอยู่ที่ js/shared/ui.js)
import { OTHER_CARDS, OTHER_UI } from '../shared/config.js';
import { mountGlassPage, toast } from '../shared/ui.js';
import { fillText } from '../shared/format.js';

// เมนูปลายทางยังไม่มีหน้าของตัวเอง กดแล้วแจ้งสถานะไว้ก่อน
export function mountOtherPage(root) {
  mountGlassPage(root, OTHER_UI, OTHER_CARDS, card => toast(fillText(OTHER_UI.soon, { name: card.title })));
}
