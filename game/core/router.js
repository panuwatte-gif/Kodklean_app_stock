// สลับหน้าในเกม: หน้าไหนก็วาดลงกล่องเดียวกัน แล้วอัปเดตแถบล่าง
const screens = {};
let host = null, navHost = null, onPaintNav = null, current = '';
const stack = [];                                                   // ประวัติหน้าในเกม ไว้ให้ปุ่มย้อนกลับใช้
const ROOTS = ['village', 'myhome', 'school', 'tent', 'profile'];   // หน้าหลักบนแถบล่าง

export function register(id, mount) { screens[id] = mount; }
export function init(el, nav, paintNav) { host = el; navHost = nav; onPaintNav = paintNav; }
export const currentScreen = () => current;
export const canBack = () => stack.length > 0;

// จำหน้าเดิมไว้ก่อนเปลี่ยนหน้า: แตะแถบล่าง = เริ่มประวัติใหม่ / กดกลับหน้าเดิม = ถอยออกจากกอง
function remember(id) {
  if (ROOTS.includes(id)) { stack.length = 0; if (id !== 'village') stack.push('village'); return; }
  if (!current || current === id) return;
  if (stack[stack.length - 1] === id) { stack.pop(); return; }
  stack.push(current);
}

// วาดหน้าจริง (ไม่ยุ่งกับกองประวัติ)
async function paint(id, arg) {
  current = id;
  host.innerHTML = '';
  host.scrollTop = 0;
  await screens[id](host, go, arg);
  if (onPaintNav) onPaintNav(navHost, id, go);
}

export async function go(id, arg) {
  if (!screens[id]) return;
  remember(id);
  await paint(id, arg);
}

// ถอยกลับหน้าก่อนหน้าในเกม — คืน false ถ้าไม่มีที่ให้ถอยแล้ว (แปลว่าควรออกไปแอปหลัก)
export function back() {
  if (!stack.length) return false;
  paint(stack.pop());
  return true;
}
