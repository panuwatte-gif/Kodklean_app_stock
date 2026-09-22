// ตรรกะบันทึกรอบส่งของพระราม 9 ที่ใช้ร่วมกัน (หน้าพระราม 9 และหน้าของแม่พัน) — คำนวณ/ตรวจ/ส่งขึ้นฐานที่เดียว
import { newR9Key, saveR9Round, saveR9Draft } from './data.js';
import { R9_UI } from './config.js';
import { fillText } from './format.js';
import { staffCode } from './auth.js';

// ร่างเปล่าของรอบส่งวันนั้น
export const r9EmptyDraft = date => ({ date, qty: {}, price: {}, fee: '', note: '', editing: null, key: null });

// ตรวจก่อนบันทึก: ต้องมีรายการที่กรอกปริมาณ และรายการที่กรอกต้องมีราคาครบ (คืนข้อความเตือน · ผ่าน = null)
export function r9SendProblem(items) {
  const filled = items.filter(i => Number(i.qty) > 0);
  if (!filled.length) return R9_UI.noLines;
  const noPrice = filled.filter(i => i.price === null || i.price === '' || i.price === undefined);
  if (noPrice.length) return fillText(R9_UI.noPrice, { names: noPrice.map(i => i.name).join(', ') });
  return null;
}

// บันทึกรอบส่ง 1 รอบ (กุญแจกันกดเบิ้ลเก็บในร่าง ส่งซ้ำกุญแจเดิมไม่เกิดรอบซ้ำ)
export async function r9SendRound({ date, items, draft }) {
  const lines = items.filter(i => Number(i.qty) > 0).map(i => ({ item_id: i.id, qty: Number(i.qty), price: Number(i.price) }));
  if (!draft.key) { draft.key = newR9Key(date); saveR9Draft(draft); }
  await saveR9Round({
    date, fee: Number(draft.fee) || 0, note: draft.note, by: staffCode(),
    lines, key: draft.key, replaces: draft.editing ? draft.editing.id : null
  });
}
