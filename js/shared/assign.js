// ใครรับผิดชอบงานอะไร — ที่เดียวของแอป
// แหล่งจริงคือตาราง kk_task_assign ที่หน้า "แบ่งงาน" (อื่นๆ → แบ่งงาน) เป็นคนกำหนด
// ทุกหน้าที่ต้องรู้ว่า "ใครทำรายการไหน" ต้องเรียกไฟล์นี้ ห้ามอ่านตารางเองหรือเขียนกฎซ้ำ
// ถ้ายังไม่เคยแบ่งงานในหน้านั้นเลย (ไม่มีแถวของงานนั้นในฐาน) จะถอยไปใช้ตารางหน้าที่เดิม kk_staff_responsibility ให้ก่อน

// มีการแบ่งงานของงานนี้ในฐานแล้วหรือยัง
export const hasAssign = (assigns, task) => (assigns || []).some(a => a.task === task);

// รหัสพนักงานที่ถูกมอบหมายให้เป้าหมายหนึ่งตรงๆ (เป้าหมาย = รายการเดียว หรือทั้งหมวด)
export const codesOf = (assigns, task, targetType, targetId) =>
  (assigns || []).filter(a => a.task === task && a.target_type === targetType && a.target_id === targetId)
    .map(a => a.staff_code);

// คนที่รับผิดชอบรายการนี้จริง = คนของรายการ + คนที่ถูกมอบทั้งหมวด (ยังไม่เคยแบ่งงาน = ใช้ค่าสำรองที่ส่งมา)
export function ownersOf(assigns, task, item, fallback = []) {
  if (!hasAssign(assigns, task)) return fallback;
  return [...new Set([...codesOf(assigns, task, 'item', item.id), ...codesOf(assigns, task, 'group', item.grp)])];
}

// รายการนี้เป็นงานของคนนี้ไหม
export const isMine = (assigns, task, item, staffCode, fallback = []) =>
  ownersOf(assigns, task, item, fallback).includes(staffCode);

// ชื่อคนที่รับผิดชอบ (แปลงรหัส → ชื่อเล่นจาก kk_staff)
export const namesOf = (assigns, staff, task, item, fallback = []) =>
  ownersOf(assigns, task, item, fallback)
    .map(code => (staff || []).find(s => s.code === code))
    .filter(Boolean).map(s => s.name);
