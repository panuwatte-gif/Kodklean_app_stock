// ตรรกะบันทึกรอบส่งของพระราม 9 ที่ใช้ร่วมกัน (หน้าพระราม 9 และหน้าของแม่พัน) — คำนวณ/ตรวจ/ส่งขึ้นฐานที่เดียว
import { newR9Key, saveR9Round, saveR9Draft } from './data.js';
import { R9_UI } from './config.js';
import { fillText, dayLongTh } from './format.js';
import { confirmSheet } from './ui.js';
import { staffCode } from './auth.js';

// ค่าว่าง = null (ห้ามแปลงเป็น 0)
const numOr = v => (v === null || v === undefined || v === '' ? null : Number(v));

// ร่างเปล่าของรอบส่งวันนั้น
export const r9EmptyDraft = date => ({ date, qty: {}, price: {}, cost: {}, mk: {}, fee: '', note: '', editing: null, key: null });

// ตรวจก่อนบันทึก: ต้องมีรายการที่กรอกปริมาณ และรายการที่กรอกต้องมีราคาครบ (คืนข้อความเตือน · ผ่าน = null)
export function r9SendProblem(items) {
  const filled = items.filter(i => Number(i.qty) > 0);
  if (!filled.length) return R9_UI.noLines;
  const noPrice = filled.filter(i => i.price === null || i.price === '' || i.price === undefined);
  if (noPrice.length) return fillText(R9_UI.noPrice, { names: noPrice.map(i => i.name).join(', ') });
  return null;
}

// 1 วัน = 1 รอบ: วันนั้นมีรอบแล้ว (และไม่ได้กดแก้) → ถามว่าบันทึกทับรอบเดิมไหม · ตกลง = เปลี่ยนเป็นแก้รอบนั้น · คืน false = ยกเลิก
export async function r9SameDay(rounds, date, draft) {
  if (draft.editing) return true;
  const rd = rounds.find(r => r.date === date);
  if (!rd) return true;
  const ok = await confirmSheet({ title: R9_UI.dupAsk.title, text: fillText(R9_UI.dupAsk.text, { d: dayLongTh(date) }), okLabel: R9_UI.dupAsk.ok });
  if (ok) { draft.editing = { id: rd.id, date: rd.date }; draft.key = null; saveR9Draft(draft); }
  return ok;
}

// ข้อความเตือนเมื่อบันทึกไม่สำเร็จ (ฐานแจ้งว่าวันนั้นมีรอบอยู่แล้ว = บอกให้ไปแก้รอบเดิม)
export const r9SaveErrorText = err => (String(err && err.message).includes('R9_DUP_DATE') ? R9_UI.dupDate : R9_UI.saveError);

// บันทึกรอบส่ง 1 รอบ (กุญแจกันกดเบิ้ลเก็บในร่าง ส่งซ้ำกุญแจเดิมไม่เกิดรอบซ้ำ · กำลังแก้ = เขียนทับรอบเดิม)
export async function r9SendRound({ date, items, draft }) {
  const lines = items.filter(i => Number(i.qty) > 0).map(i => ({ item_id: i.id, qty: Number(i.qty), price: Number(i.price), cost: numOr(i.cost), markup: numOr(i.mk) }));
  if (!draft.key) { draft.key = newR9Key(date); saveR9Draft(draft); }
  await saveR9Round({
    date, fee: Number(draft.fee) || 0, note: draft.note, by: staffCode(),
    lines, key: draft.key, replaces: draft.editing ? draft.editing.id : null
  });
}
