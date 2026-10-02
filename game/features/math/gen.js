// สร้างโจทย์คณิตตามระดับ — ตัวเลขล้วน ไม่ต้องอ่านไทย (กติกาข้อ 4) · ข้อความคำใบ้มาจาก i18n (ไทย/พม่า)
import { t } from '../../core/i18n.js';
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const ITEMS = ['rice', 'noodle', 'chicken', 'pork', 'beef', 'shrimp', 'salmon'];
const pick = a => a[Math.floor(Math.random() * a.length)];

export const MONEY = [1, 5, 10, 20, 50, 100];

export function makeTask(level) {
  const item = pick(ITEMS);
  if (level === 1) { const n = rnd(3, 12); return { level, item, n, answer: n }; }
  if (level === 2) {
    if (Math.random() < .5) { const a = rnd(2, 6), b = rnd(1, 4); return { level, item, op: 'add', a, b, answer: a + b }; }
    const a = rnd(5, 10), b = rnd(1, a - 1); return { level, item, op: 'sub', a, b, answer: a - b };
  }
  if (level === 3) {
    const start = rnd(2, 10) * 10, jumps = [pick([10, 20, 50]), pick([5, 10, 20])];
    return { level, start, jumps, answer: start + jumps[0] + jumps[1] };
  }
  if (level === 4) {
    const price = rnd(3, 18) * 5, paid = price <= 50 ? (price <= 20 ? 50 : 100) : (price <= 100 ? 100 : 200);
    return { level, price, paid, answer: paid - price };
  }
  if (level === 5) { const r = rnd(2, 5), c = rnd(3, 6); return { level, item, rows: r, cols: c, answer: r * c }; }
  if (level === 6) { const cups = rnd(2, 4), per = rnd(2, 5); return { level, item, cups, n: cups * per, answer: per }; }
  const menus = [['drinkTea', 2], ['drinkMilk', 1], ['drinkOliang', 3]];   // รหัสเมนู → ชื่อใน i18n
  const bills = [[], [], []];
  menus.forEach(([name, n]) => { for (let k = 0; k < n; k++) bills[rnd(0, 2)].push(name); });
  const distinct = [...new Set(bills.flat())].length;
  return { level, bills, answer: distinct };
}

// คำใบ้ 3 ขั้น: ไฮไลต์ → ทำขั้นแรกให้ → เฉลยทีละขั้น
export function hintText(task, step) {
  const L = task.level, op = task.op === 'add' ? 'add' : 'sub';
  if (step === 1) return t(L === 2 ? 'mh1_2' + op : 'mh1_' + L);
  if (step === 2) return L === 1 ? t('mh2_1', { n: task.n })
    : L === 2 ? t('mh2_2' + op, { a: task.a, b: task.b })
    : L === 3 ? t('mh2_3', { s: task.start, j: task.jumps[0], r: task.start + task.jumps[0] })
    : L === 4 ? t('mh2_4', { p: task.price, q: task.paid })
    : L === 5 ? t('mh2_5', { c: task.cols })
    : L === 6 ? t('mh2_6', { n: task.n, c: task.cups })
    : t('mh2_7');
  return t('mh3', { n: task.answer });
}
