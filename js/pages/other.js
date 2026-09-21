// หน้าอื่นๆ — เฉพาะข้อมูลของหน้านี้ (ชิ้นส่วนการ์ดกระจกอยู่ที่ js/shared/ui.js)
import { OTHER_CARDS, OTHER_UI } from '../shared/config.js';
import { mountGlassPage, toast } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import { currentUser } from '../shared/auth.js';

// เมนูปลายทางที่มีหน้าของตัวเอง (goto) กดแล้วเข้าหน้านั้น ที่ยังไม่มีก็แจ้งสถานะไว้ก่อน
// การ์ดที่ใส่ only ไว้ จะเห็นเฉพาะรหัสที่ระบุไว้ (เช่น การ์ดแบ่งงาน เห็นเฉพาะอาเฮียกับแม่พัน)
export function mountOtherPage(root, onGo) {
  const me = currentUser();
  const cards = OTHER_CARDS.filter(card => !card.only || (me && card.only.includes(me.code)));
  mountGlassPage(root, OTHER_UI, cards, card => {
    if (card.goto && onGo) return onGo(card.goto);
    toast(fillText(OTHER_UI.soon, { name: card.title }));
  });
}
