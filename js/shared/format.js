// แปลงหน่วย/ตัวเลข/วันที่ ให้หน้าตาเหมือนกันทุกหน้าของแอป

// ตัวเลขน้ำหนัก: 12.5 / 4 / 0.3 (ทศนิยม 1 ตำแหน่งเฉพาะเมื่อมีเศษ)
export function weight(value) {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// ตัวเลขน้ำหนักแบบบังคับทศนิยม 1 ตำแหน่ง (ใช้กับยอดรวมตัวใหญ่)
export function weightBig(value) {
  const n = Number(value) || 0;
  return n.toFixed(1);
}

// จำนวนนับแบบชิ้น/ใบ/ขวด (ไม่มีทศนิยม)
export function count(value) {
  return String(Math.round(Number(value) || 0));
}

// เลือกวิธีแสดงตัวเลขตามหน่วย: กก. ใช้ทศนิยม หน่วยนับใช้จำนวนเต็ม
export function amount(value, unit) {
  return unit === 'กก.' ? weightBig(value) : count(value);
}

// ตัวเลขย่อยในบรรทัดตำแหน่งเก็บของ (สั้นกว่ายอดรวม)
export function amountSmall(value, unit) {
  return unit === 'กก.' ? weight(value) : count(value);
}

// ตัวเลขผลนับสต๊อก: ช่องว่าง = ยังไม่ได้นับ แสดงขีด (ห้ามแปลงเป็น 0)
export function qtyOrDash(value, unit) {
  return value === null || value === undefined || value === '' ? '–' : amount(value, unit);
}

// วันที่แบบไทยย่อ พ.ศ. เช่น 2 ก.ย.
const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// แปลงค่าเก็บแบบ 2026-09-03 เป็น Date ตามเวลาเครื่อง (ไม่ให้เขตเวลาเลื่อนวัน)
function toDate(value) {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
}

export function dayShort(date) {
  const d = toDate(date);
  return `${d.getDate()} ${TH_MONTH[d.getMonth()]}`;
}

// เลขวันของวันที่ เช่น 2026-09-09 → 9
export function dayOf(iso) {
  return toDate(iso).getDate();
}

// ช่วงวันที่แบบไทย เช่น 1–9 ส.ค. 2569 (เดือนเดียวกัน) หรือ 28 ส.ค. – 3 ก.ย. 2569
export function dayRangeTh(a, b) {
  const d1 = toDate(a), d2 = toDate(b);
  if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) return `${d1.getDate()}–${d2.getDate()} ${TH_MONTH[d1.getMonth()]} ${d1.getFullYear() + 543}`;
  return `${dayShort(d1)} – ${dayLongTh(d2)}`;
}

// ตัวเลขทศนิยม 1 ตำแหน่ง แต่ถ้าไม่มีค่า (null/ว่าง) แสดงขีด
export function weightOrDash(value) {
  return value === null || value === undefined || value === '' ? '-' : weightBig(value);
}

// ช่วงแนะนำ เช่น (1.6–2.4)
export function rangeText(min, max) {
  return `(${weightBig(min)}–${weightBig(max)})`;
}

// ตัวเลขนำหน้าด้วยเครื่องหมายบวก เช่น + 0.6
export function plus(value) {
  return `+ ${weightBig(value)}`;
}

// วันที่ไทยแบบมีปี พ.ศ. เช่น 3 ก.ย. 2567 (รับค่าเก็บแบบ 2024-09-03)
export function dayLongTh(iso) {
  const d = toDate(iso);
  return `${d.getDate()} ${TH_MONTH[d.getMonth()]} ${d.getFullYear() + 543}`;
}

// เลื่อนวันที่เก็บไปข้างหน้า/ข้างหลัง n วัน (คืนค่าแบบ 2026-09-03)
export function shiftIso(iso, n) {
  const d = toDate(iso);
  d.setDate(d.getDate() + n);
  const p = v => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ตัวเลขหน่วยกรัม (จำนวนเต็ม) ถ้าไม่มีค่าแสดงขีด
export function gram(value) {
  return value === null || value === undefined || value === '' ? '-' : count(value);
}

// เปอร์เซนต์พร้อมเครื่องหมาย เช่น +12% / -8%
export function percent(value) {
  const n = Math.round(Number(value) || 0);
  return `${n > 0 ? '+' : ''}${n}%`;
}

// จำนวนเงินบาทแบบมีลูกน้ำ เช่น 8,638 (เศษสตางค์ปัดทิ้ง)
export function money(value) {
  return Math.round(Number(value) || 0).toLocaleString('en-US');
}

// จำนวนเงินบาทแบบเก็บทศนิยม 2 ตำแหน่งเมื่อมีเศษ
export function moneyFine(value) {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? money(n) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// เวลาแบบไทย เช่น 10:30 น.
export function timeTh(hhmm) {
  return hhmm ? hhmm + ' น.' : '';
}

// เดือน/ปี พ.ศ. แบบย่อ เช่น ก.ย. 67
export function monthShortTh(iso) {
  const d = toDate(iso);
  return TH_MONTH[d.getMonth()] + ' ' + String(d.getFullYear() + 543).slice(2);
}

// จำนวนเงินมีสัญลักษณ์บาทนำหน้า เช่น ฿2,380
export function baht(value) {
  return '฿' + money(value);
}

// เปอร์เซ็นต์ทศนิยม 1 ตำแหน่ง เช่น 28.3%
export function pct1(value) {
  return (Math.round(Number(value) * 10) / 10).toFixed(1) + '%';
}

// เวลาเพลงจากวินาที เช่น 263 → 4:23
export function mmss(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ชื่อช่องทางขายแบบสั้น (ตัดคำว่า "ยอดขาย" ข้างหน้าออก) เช่น ยอดขาย Grab → Grab
export function channelShort(name) {
  return String(name || '').replace(/^ยอดขาย\s*/, '');
}

// เติมค่าลงข้อความแม่แบบ เช่น fillText('เฉลี่ยจาก {n} วัน', { n: 6 })
export function fillText(template, values) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (values[k] === undefined ? '' : values[k]));
}
