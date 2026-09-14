// สร้างโจทย์คณิตตามระดับ — ตัวเลขล้วน ไม่ต้องอ่านไทย (กติกาข้อ 4)
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
  const menus = [['ชาเย็น', 2], ['นมเย็น', 1], ['โอเลี้ยง', 3]].filter(() => true);
  const bills = [[], [], []];
  menus.forEach(([name, n]) => { for (let k = 0; k < n; k++) bills[rnd(0, 2)].push(name); });
  const distinct = [...new Set(bills.flat())].length;
  return { level, bills, answer: distinct };
}

// คำใบ้ 3 ขั้น: ไฮไลต์ → ทำขั้นแรกให้ → เฉลยทีละขั้น
export function hintText(task, step) {
  const L = task.level;
  if (step === 1) return L === 1 ? 'แตะของทีละชิ้นให้ครบทุกชิ้น'
    : L === 2 ? (task.op === 'add' ? 'ย้ายของทั้งสองกองมารวมในตะกร้า' : 'เอาของออกไปในถังตามจำนวนที่กำหนด')
    : L === 3 ? 'กดปุ่มกระโดดให้ครบทุกก้อน'
    : L === 4 ? 'หยิบเงินเพิ่มจากราคาอาหารไปจนถึงเงินที่ลูกค้าจ่าย'
    : L === 5 ? 'แตะทีละแถว ดูตัวเลขนับข้ามแถว'
    : L === 6 ? 'ลากของใส่ถ้วยวนไปเรื่อยๆ จนของหมด'
    : 'แก้วเมนูเดียวกันปั่นรอบเดียวได้ แม้จะมาจากบิลต่างกัน';
  if (step === 2) return L === 1 ? `ของมี ${task.n} ชิ้น แตะไล่ไปทีละชิ้น จนครบ`
    : L === 2 ? (task.op === 'add' ? `กองแรกมี ${task.a} ชิ้น เริ่มนับต่อจาก ${task.a}`
                              : `เอาออก ${task.b} ชิ้น จากทั้งหมด ${task.a} ชิ้น`)
    : L === 3 ? `เริ่มที่ ${task.start} กระโดด +${task.jumps[0]} ได้ ${task.start + task.jumps[0]}`
    : L === 4 ? `ราคา ${task.price} → หยิบให้ถึง ${task.paid}`
    : L === 5 ? `แถวละ ${task.cols} ชิ้น แถวแรกได้ ${task.cols}`
    : L === 6 ? `ของ ${task.n} ชิ้น แบ่ง ${task.cups} ถ้วย`
    : 'นับว่ามีเมนูต่างกันกี่ชนิด';
  return `คำตอบคือ ${task.answer}`;
}
