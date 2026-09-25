// สูตรคำนวณที่ใช้ร่วมหลายหน้า — คำนวณที่ไฟล์นี้ที่เดียว หน้าจอห้ามคำนวณเอง
import { shiftIso } from './format.js';
import { ownersOf } from './assign.js';

// ยอดคงเหลือรวมของวัตถุดิบ 1 รายการ = ครัวกลาง + คอนโด
export function stockTotal(item) {
  return (Number(item.kitchen) || 0) + (Number(item.condo) || 0);
}

// สถานะของรายการ: หมด / ใกล้หมด / ปกติ (เทียบยอดรวมกับจุดสั่งซื้อ min)
export function stockStatus(item) {
  const total = stockTotal(item);
  if (total <= 0) return 'out';
  if (item.min != null && total <= Number(item.min)) return 'low';
  return 'ok';
}

// ยอดคงเหลือของรายการตามคลังที่เลือกดู (สต๊อกรวม / ครัวกลาง / คอนโด)
export function stockByPlace(item, place) {
  if (place === 'kitchen') return Number(item.kitchen) || 0;
  if (place === 'condo') return Number(item.condo) || 0;
  return stockTotal(item);
}

// นับจำนวนรายการทั้งหมด / ใกล้หมด / หมด จากรายการที่ส่งมา
export function stockCounts(items) {
  let low = 0, out = 0;
  items.forEach(item => {
    const status = stockStatus(item);
    if (status === 'low') low += 1;
    if (status === 'out') out += 1;
  });
  return { all: items.length, low, out };
}

// ---------- หน้านับสต๊อก (ข้อมูลจริงจากฐาน) ----------

// ช่องว่าง = ยังไม่ได้นับ (null / undefined / สตริงว่าง)
const blank = v => v === null || v === undefined || v === '';

// ผลรวมจากตัวเลขสองที่ที่บันทึกไว้ (ใช้ตั้งค่าเริ่มต้นของช่องสต๊อกรวมตอนโหลด)
export function sumPlaces(row) {
  if (blank(row.kitchen) && blank(row.condo)) return null;
  return Math.round(((Number(row.kitchen) || 0) + (Number(row.condo) || 0)) * 10) / 10;
}

// ผลนับรวมของ 1 รายการ — ของที่เก็บสองที่ถือสต๊อกรวมเป็นตัวตั้ง (ยังไม่ใส่ = ยังไม่ได้นับ ห้ามเป็น 0)
export function countTotal(row) {
  if (row.location === 'ทั้งสองที่') return blank(row.total) ? null : Math.round(Number(row.total) * 10) / 10;
  return sumPlaces(row);
}

// ผลนับตามคลังที่เลือกดู (สต๊อกรวม / ครัวกลาง / คอนโด)
export function countByPlace(row, place) {
  if (place === 'kitchen') return blank(row.kitchen) ? null : Number(row.kitchen);
  if (place === 'condo') return blank(row.condo) ? null : Number(row.condo);
  return countTotal(row);
}

// คอนโดคิดให้เอง = สต๊อกรวม − ครัวกลาง (สต๊อกรวมว่าง = ยังไม่ได้นับ)
export function condoFromTotal(total, kitchen) {
  if (blank(total)) return null;
  return Math.round(((Number(total) || 0) - (Number(kitchen) || 0)) * 10) / 10;
}

// ความคืบหน้าการนับ: ทั้งหมด / นับแล้ว / ยังไม่นับ / เปอร์เซ็นต์
export function countProgress(rows) {
  const done = rows.filter(r => countTotal(r) !== null).length;
  return { all: rows.length, done, left: rows.length - done, pct: rows.length ? Math.round(done / rows.length * 100) : 0 };
}

// ---------- เตรียม-เหลือ: เนื้อสัตว์ ----------

// ปัดทศนิยม 1 ตำแหน่งกันเศษลอย (0.1+0.2)
const r1 = n => Math.round(n * 10) / 10;

// เบิกเพิ่มมีช่องเดียว (เบิกหลายรอบให้บวกรวมแก้ตัวเลขในช่อง)

// ยอดตัดสต๊อก = เตรียม + เบิกเพิ่ม − คงเหลือสด (ของทิ้งออกจากสต๊อกไปแล้ว · ไม่หักอาหารปรุงสุก) ตรงกับ used_raw_kg ในฐาน · "เตรียม" ว่าง = null / ช่องอื่นว่างถือเป็น 0
export function prepUseBase(row) {
  if (blank(row.prep)) return null;
  return r1((Number(row.prep) || 0) + (Number(row.extra) || 0) - (Number(row.left) || 0));
}

// ยอดใช้จริง (ที่เดียวของสูตรนี้ ใช้ทั้งช่องใช้ต่อวันและข้อมูลพยากรณ์ — คนละเรื่องกับการตัดสต๊อก):
// เตรียม + เบิกเพิ่ม + คงเหลือใช้ต่อของวันเปิดก่อนหน้า (carry) − ทิ้ง − (คงเหลือสด + พระราม 9 ที่ต้องบวกกลับ r9) − อาหารปรุงสำเร็จเหลือทั้งก้อนของวันนี้ (cooked)
// คืน { use, why } — use ว่างเมื่อข้อมูลไม่ครบ why = เหตุผล (no_prep / open / conflict / cooked_open / no_carry) · negative = ผลติดลบ
function useCore(r) {
  if (blank(r.prep)) return { use: null, why: 'no_prep' };
  if (blank(r.left)) return { use: null, why: 'open' };
  if (r.conflict) return { use: null, why: 'conflict' };
  if (r.cookedOpen) return { use: null, why: 'cooked_open' };
  if (r.carryMissing) return { use: null, why: 'no_carry' };
  const v = r1((Number(r.prep) || 0) + (Number(r.extra) || 0) + (Number(r.carry) || 0) - (Number(r.waste) || 0)
    - ((Number(r.left) || 0) + (Number(r.r9) || 0)) - (Number(r.cooked) || 0));
  return { use: v, why: v < 0 ? 'negative' : null };
}

// ใช้ไปจริง (กก.) — ข้อมูลไม่ครบ = null ห้ามเป็น 0
export function prepUse(row) {
  return useCore(row).use;
}

// เหตุผลที่ใช้ไปจริงเป็นค่าว่าง/ติดลบ (null = ปกติ)
export function prepUseWhy(row) {
  return useCore(row).why;
}

// ตัวเลขสรุปหน้าเตรียมเนื้อสัตว์: จำนวนรายการ / เบิกเพิ่มรวม / คงเหลือรวม / ทิ้งรวม / ใช้รวม
export function prepMeatTotals(items) {
  const t = { count: items.length, extra: 0, left: 0, waste: 0, use: 0 };
  items.forEach(i => {
    t.extra += Number(i.extra) || 0;
    t.left += Number(i.left) || 0;
    t.waste += Number(i.waste) || 0;
    t.use += prepUse(i) || 0;
  });
  return { count: t.count, extra: r1(t.extra), left: r1(t.left), waste: r1(t.waste), use: r1(t.use) };
}

// ---------- เตรียม-เหลือ: ข้าว ----------

// หุงรวม (กก. ดิบ) = หุงรอบแรก + หุงเพิ่มทุกรอบ (ยังไม่กรอกเลยสักช่อง = null ไม่คำนวณ)
export function riceRaw(r) {
  if (blank(r.cook) && (r.rounds || []).every(blank)) return null;
  return r1((Number(r.cook) || 0) + (r.rounds || []).reduce((s, v) => s + (Number(v) || 0), 0));
}

// ข้าวสุกที่คาดว่าจะได้ = ดิบ × อัตราหุง (อัตราหุงยังไม่ตั้ง = null ห้ามคำนวณ)
export function riceCooked(r) {
  const raw = riceRaw(r);
  return raw === null || !(Number(r.ratio) > 0) ? null : r1(raw * Number(r.ratio));
}

// ข้าวสุกเหลือเพื่อเก็บขายต่อ = ข้าวเหลือ − ทิ้ง/เสีย − ห่อกลับบ้าน − แจก ("ข้าวเหลือ" ว่าง = ยังไม่ชั่ง ไม่คำนวณ)
export function riceResale(r) {
  if (blank(r.left)) return null;
  return r1((Number(r.left) || 0) - (Number(r.waste) || 0) - (Number(r.home) || 0) - (Number(r.give) || 0));
}

// แปลงข้าวสุกกลับเป็นข้าวดิบ (ไม่มีอัตราหุง = null)
export function riceToRaw(cooked, ratio) {
  return cooked === null || cooked === undefined || !(Number(ratio) > 0) ? null : r1(Number(cooked) / Number(ratio));
}

// ตัวเลขสรุปหน้าเตรียมข้าว (รวมเฉพาะชนิดที่คำนวณได้) + ตรวจผลรวมเทียบดิบต้องเท่าดิบที่ใช้ (คลาดเกิน 0.02 = เตือน)
export function riceTotals(list) {
  const t = { count: list.length, raw: 0, cook: 0, r1: 0, r2: 0, r3: 0, cooked: 0, left: 0, loss: 0, resale: 0, sold: 0, soldRaw: 0, lossRaw: 0, resaleRaw: 0, noRatio: 0 };
  let rawOk = 0;
  list.forEach(r => {
    const raw = riceRaw(r);
    if (raw !== null) {
      t.raw += raw; t.cook += Number(r.cook) || 0;
      t.r1 += Number(r.rounds?.[0]) || 0; t.r2 += Number(r.rounds?.[1]) || 0; t.r3 += Number(r.rounds?.[2]) || 0;
    }
    const cooked = riceCooked(r);
    if (cooked === null) { if (raw !== null && !(Number(r.ratio) > 0)) t.noRatio += 1; return; }
    rawOk += raw;
    const left = Number(r.left) || 0;
    const loss = (Number(r.waste) || 0) + (Number(r.home) || 0) + (Number(r.give) || 0);
    const resale = riceResale(r) ?? 0;
    t.cooked += cooked; t.left += left; t.loss += loss; t.resale += resale;
    t.sold += cooked - left;
    t.soldRaw += (cooked - left) / Number(r.ratio);
    t.lossRaw += loss / Number(r.ratio);
    t.resaleRaw += resale / Number(r.ratio);
  });
  const out = {}; Object.keys(t).forEach(k => { out[k] = r1(t[k]); });
  // ตรวจ: ขายจริง(ดิบ) + เก็บขายต่อ(ดิบ) + เสียเปล่า(ดิบ) ต้องเท่าข้าวดิบที่ใช้
  out.checkFail = rawOk > 0 && Math.abs(rawOk - (t.soldRaw + t.lossRaw + t.resaleRaw)) > 0.02;
  return out;
}

// ค่าเฉลี่ยของสถิติย้อนหลัง (คีย์ตัวเลขทุกตัว)
export function historyAverage(rows, keys) {
  const out = {};
  keys.forEach(k => { out[k] = rows.length ? r1(rows.reduce((s, r) => s + (Number(r[k]) || 0), 0) / rows.length) : 0; });
  return out;
}

// ---------- เตรียม-เหลือ: พยากรณ์ (รอบนี้ยังไม่เปิดใช้ — ไม่มีสูตร/ข้อมูลจำลองใดๆ ในโค้ด) ----------

// ---------- หน้าหลัก (Dashboard) ----------

// แบ่งหน้ารายการแนะนำ: หน้าละ size รายการ ถ้าหน้าที่เลือกไม่มีแล้วให้ถอยมาหน้าสุดท้ายที่มี
export function pageOf(items, index, size = 3) {
  const count = Math.max(1, Math.ceil(items.length / size));
  const i = Math.min(Math.max(0, Number(index) || 0), count - 1);
  const pages = Array.from({ length: count }, (_, p) => ({ index: p, from: p * size + 1, to: Math.min(items.length, (p + 1) * size) }));
  return { index: i, rows: items.slice(i * size, i * size + size), pages, total: items.length, from: pages[i].from, to: pages[i].to };
}

// ค่าเฉลี่ยต่อวันทำการ: นับเฉพาะวันที่มีตัวเลข (null = ยังไม่ส่งข้อมูล ไม่เติม 0) คืน { mean, used, missing }
export function meanOpenDays(values) {
  const nums = (values || []).filter(v => v !== null && v !== undefined && v !== '').map(Number);
  const missing = (values || []).length - nums.length;
  return { mean: nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length * 1000) / 1000 : null, used: nums.length, missing };
}

// Top N ตามค่าเฉลี่ย มาก→น้อย เสมอกันเรียงตาม id เพื่อไม่ให้อันดับสลับเอง (ทุกรายการต้องหน่วยเดียวกัน)
export function rankByMean(series, n = 5) {
  return (series || []).map(s => ({ ...s, stat: meanOpenDays(s.daily) })).filter(s => s.stat.mean !== null)
    .sort((a, b) => b.stat.mean - a.stat.mean || String(a.id).localeCompare(String(b.id))).slice(0, n);
}

// ข้าว: จำนวนหม้อจากรายการแบ่งหม้อของระบบ (ไม่คำนวณสูตรเอง) — ไม่มีข้อมูล = null
export function ricePotCount(option) {
  return Array.isArray(option?.pots) && option.pots.length ? option.pots.length : null;
}

// ของเหลือ: เลือกชุดข้อมูลกราฟตามเมนู (all = รวมทุกเมนู) และตัวชี้วัด (usable = เหลือเก็บต่อ, disposed = ทิ้งจริง)
export function leftoverSeries(lo, menuId, metric) {
  const key = metric === 'disposed' ? 'disposed' : 'usable';
  if (menuId === 'all') return { cur: lo[key + 'Total'] || [], prev: lo['prior' + key[0].toUpperCase() + key.slice(1) + 'Total'] || [] };
  const row = (lo.ranking || []).find(r => r.id === menuId);
  if (!row) return { cur: [], prev: [] };
  return { cur: row[key] || [], prev: row['prior' + key[0].toUpperCase() + key.slice(1)] || [] };
}

// ประมาณการมูลค่าของเหลือเกิดใหม่ต่อเดือน = ของเหลือเกิดใหม่เฉลี่ย/วัน × ต้นทุน/หน่วย × วันเปิดที่วางแผน (ขาดตัวใดตัวหนึ่ง = null ไม่ใช่ 0)
export function leftoverMonthly(row, openDays) {
  const a = Number(row.avgNew30), c = Number(row.unitCost), d = Number(openDays);
  return [a, c, d].every(v => Number.isFinite(v) && v > 0) ? Math.round(a * c * d) : null;
}

// ประหยัดเดือนนี้ = ต้นทุนทิ้งเดือนก่อน − เดือนนี้ (บวก = ประหยัด, ลบ = ต้นทุนเพิ่ม); % เฉพาะเมื่อฐานเดือนก่อน > 0
export function savingsSummary(prior, current) {
  if (prior === null || prior === undefined || current === null || current === undefined) return { state: 'missing' };
  const diff = Math.round((Number(prior) - Number(current)) * 100) / 100;
  return { state: diff > 0 ? 'saved' : diff < 0 ? 'worse' : 'equal', diff: Math.abs(diff), pct: prior > 0 ? Math.abs(diff) / prior * 100 : null, prior, current };
}

// ยอดขายเทียบเป้า: % จริงเกิน 100 ได้ แต่ความยาวแท่งไม่เกิน 100; ไม่มีเป้า/เป้า ≤ 0 = null
export function achievement(sales, target) {
  if (!(Number(target) > 0) || sales === null || sales === undefined) return { pct: null, width: 0 };
  const pct = Number(sales) / Number(target) * 100;
  return { pct, width: Math.min(100, Math.max(0, pct)) };
}

// พระราม 9: รวมรอบส่งที่ยืนยันแล้ว (shipment id ซ้ำนับครั้งเดียว) คืน มูลค่ารวม จำนวนรอบ และจุดสะสมตามวัน
export function r9Cumulative(shipments) {
  const seen = new Map();
  (shipments || []).forEach(s => { if (!seen.has(s.id)) seen.set(s.id, s); });
  const rows = [...seen.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  let acc = 0;
  const points = rows.map(s => { acc += Number(s.value) || 0; return { date: s.date, value: acc }; });
  return { total: acc, rounds: rows.length, points };
}

// ---------- เตรียม-เหลือ: ของฟ้าทั้งหมด ----------

// คงเหลือใช้ต่อ = เหลือ − ทิ้ง/เสีย − กินเอง − ห่อกลับบ้าน (ไม่ต่ำกว่า 0)
export function fahKeep(row) {
  const v = (Number(row.left) || 0) - (Number(row.waste) || 0) - (Number(row.self) || 0) - (Number(row.home) || 0);
  return Math.max(0, Math.round(v));
}

// รวมทุกช่องของตารางบันทึกของเหลือวันนี้
export function fahTotals(rows) {
  const t = { left: 0, waste: 0, self: 0, home: 0, keep: 0 };
  rows.forEach(r => {
    t.left += Number(r.left) || 0; t.waste += Number(r.waste) || 0;
    t.self += Number(r.self) || 0; t.home += Number(r.home) || 0; t.keep += fahKeep(r);
  });
  return t;
}

// คงเหลือใช้ต่อ แบบเคารพช่องว่าง: "เหลือ" ว่าง = ยังไม่กรอกเมนูนี้ → null (ช่องอื่นว่าง = 0)
export function fahKeepOrNull(row) {
  return row.left === null || row.left === undefined || row.left === '' ? null : fahKeep(row);
}

// แปลงของเหลือเมนู → น้ำหนักเนื้อสัตว์ (กก. เทียบวัตถุดิบสด) ตาม protein_item_id / protein_ratio ของแต่ละเมนู
// เมนูที่ยังไม่ผูกเนื้อ/อัตราส่วน ถูกตัดออกจากผลรวม (ห้ามเดาอัตราส่วนเอง)
export function leftoverByProtein(menus, recOf, cookedToRaw = 1) {
  const grams = {}, unboundFilled = [];
  let boundMenus = 0, filled = 0;
  (menus || []).forEach(m => {
    const keep = fahKeepOrNull(recOf(m.id) || {});
    if (keep === null) return;
    filled += 1;
    if (!m.protein_item_id || !(Number(m.protein_ratio) > 0)) { unboundFilled.push(m.name); return; }
    boundMenus += 1;
    grams[m.protein_item_id] = (grams[m.protein_item_id] || 0) + keep * Number(m.protein_ratio);
  });
  const kg = {};
  Object.keys(grams).forEach(k => { kg[k] = Math.round(grams[k] / 1000 * (Number(cookedToRaw) || 1) * 100) / 100; });
  const unbound = (menus || []).filter(m => !m.protein_item_id || !(Number(m.protein_ratio) > 0)).map(m => m.name);
  return { kg, grams, items: Object.keys(kg).length, boundMenus, filled, unbound, unboundFilled };
}

// น้ำหนักพระราม 9 ที่ต้องบวกกลับเข้าคงเหลือ: เฉพาะรอบปัจจุบันของวันนั้น และรายการที่ deduct_from_use จริงในฐาน (qty × kg_per_unit → count_item_id)
// รายการที่ต้องบวกกลับแต่ไม่มี kg_per_unit = ข้าม แล้วคืนชื่อไว้เตือน (ห้ามเดาหน่วย)
export function r9AddBack(rounds, r9items, voidStatus = []) {
  const kg = {}, noUnit = new Set();
  const byId = {};
  (r9items || []).forEach(i => { byId[i.id] = i; });
  (rounds || []).filter(rd => rd.is_current !== false && !voidStatus.includes(rd.status)).forEach(rd => (rd.lines || []).forEach(l => {
    const it = byId[l.id];
    if (!it || it.deduct_from_use !== true || !it.count_item_id || !(Number(l.qty) > 0)) return;
    if (it.kg_per_unit === null || it.kg_per_unit === undefined || it.kg_per_unit === '') { noUnit.add(it.name || it.id); return; }
    kg[it.count_item_id] = r2x((kg[it.count_item_id] || 0) + Number(l.qty) * Number(it.kg_per_unit));
  }));
  return { kg, noUnit: [...noUnit] };
}
const r2x = n => Math.round(n * 100) / 100;

// แถวอาหารเหลือของวันหนึ่งรายเมนู (ช่องว่าง = null)
function leftRowsOf(list) {
  const map = {};
  (list || []).forEach(l => { (map[l.menu_id] = map[l.menu_id] || {})[l.entry_type] = l; });
  const box = l => (l ? (l.qty_box === null || l.qty_box === undefined ? null : Number(l.qty_box)) : null);
  const out = {};
  Object.keys(map).forEach(id => {
    const r = map[id];
    out[id] = { left: box(r['เหลือ']), waste: box(r['ทิ้ง']), self: box(r['กินเอง']), home: box(r['ห่อกลับบ้าน']) };
  });
  return out;
}

// ทิ้ง + กินเอง + ห่อกลับบ้าน มากกว่าเหลือ = ข้อมูลขัดกัน
const leftConflict = r => !!r && !blank(r.left) && (Number(r.waste) || 0) + (Number(r.self) || 0) + (Number(r.home) || 0) > Number(r.left);

// แถวใช้จริงของเนื้อสัตว์ทุกตัวของวันเดียว (ใช้ทั้งหน้าเตรียมของ และตอนเติม kk_forecast_history) — b ต้องมี items, logs, leftovers, leftPrev, menus, assumptions, r9Rounds, r9Items
export function meatUseRows(b, voidStatus = []) {
  const asum = {}; (b.assumptions || []).forEach(a => { asum[a.key] = a.value === null ? null : Number(a.value); });
  const cookedToRaw = asum.cooked_to_raw ?? 1;
  const logMap = {};
  (b.logs || []).forEach(l => { (logMap[l.count_item_id] = logMap[l.count_item_id] || {})[l.entry_type + ':' + l.seq] = l; });
  const today = leftRowsOf(b.leftovers), prev = leftRowsOf(b.leftPrev);
  const menus = b.menus || [];
  // แปลงครั้งที่ 1: เหลือทั้งก้อนของวันนี้ · ครั้งที่ 2: คงเหลือใช้ต่อของวันเปิดก่อนหน้า (แยกกันเสมอ)
  const convLeft = leftoverByProtein(menus, id => (today[id] ? { left: today[id].left } : {}), cookedToRaw);
  const convPrev = leftoverByProtein(menus, id => prev[id] || {}, cookedToRaw);
  const r9 = r9AddBack(b.r9Rounds, b.r9Items, voidStatus);
  const conflicts = new Set();
  const rows = (b.items || []).filter(i => i.grp === 'เนื้อสัตว์').map(i => {
    const lg = logMap[i.id] || {};
    const bound = menus.filter(m => m.protein_item_id === i.id && Number(m.protein_ratio) > 0);
    const bad = bound.filter(m => leftConflict(today[m.id]) || leftConflict(prev[m.id]));
    bad.forEach(m => conflicts.add(m.name));
    const row = {
      ...i,
      prep: qtyOf(lg['เตรียม:1']), extra: qtyOf(lg['เบิกเพิ่ม:1']), waste: qtyOf(lg['ทิ้ง:1']), left: qtyOf(lg['คงเหลือ:1']),
      cooked: convLeft.kg[i.id] || 0, carry: convPrev.kg[i.id] || 0, r9: r9.kg[i.id] || 0,
      cookedOpen: bound.some(m => blank((today[m.id] || {}).left)),
      carryMissing: bound.some(m => blank((prev[m.id] || {}).left)),
      conflict: bad.length > 0
    };
    row.use = prepUse(row);
    row.useWhy = prepUseWhy(row);
    return { row, lg };
  });
  return { rows, cookedToRaw, convLeft, convPrev, r9, conflicts: [...conflicts], unbound: convLeft.unbound };
}

// สต๊อกครัวกลางของรายการ ณ วันที่เลือก: ถ้ามีนับสต๊อกหลังวันนั้น ยึดยอดนับจริง / ยังไม่มี = ยอดนับล่าสุด − ใช้ไปเบื้องต้น
export function stockAfterPrep(counts, itemId, date, useBase) {
  const mine = (counts || []).filter(c => c.count_item_id === itemId && c.kitchen_qty !== null && c.kitchen_qty !== undefined);
  const after = mine.filter(c => c.count_date > date).sort((a, b) => (a.count_date < b.count_date ? -1 : 1))[0];
  if (after) return { mode: 'counted', qty: Number(after.kitchen_qty), date: after.count_date };
  const base = mine.filter(c => c.count_date <= date).sort((a, b) => (a.count_date > b.count_date ? -1 : 1))[0];
  if (!base) return null;
  return { mode: 'est', baseQty: Number(base.kitchen_qty), baseDate: base.count_date, est: useBase === null ? null : r1(Number(base.kitchen_qty) - useBase) };
}

// ---------- ประกอบข้อมูลหน้าเตรียม-เหลือจากฐาน (ทุกแท็บใช้วันที่เดียวกัน) ----------

// ค่าจากแถวบันทึก (ไม่มีแถว/ค่าว่าง = null ห้ามเติม 0)
const qtyOf = log => (log ? (log.qty === null || log.qty === undefined ? null : Number(log.qty)) : null);
// ค่าจากแถวบันทึกอาหารเหลือ (ตาราง kk_cooked_leftover เก็บจำนวนไว้ในช่อง qty_box)
const boxOf = log => (log ? (log.qty_box === null || log.qty_box === undefined ? null : Number(log.qty_box)) : null);
// ข้อมูลการแก้: เคยแก้ (rev_no > 1) ถึงจะมีจุดประวัติ
const revOf = log => (log && log.rev_no > 1 ? { n: log.rev_no, by: log.edited_by || log.logged_by } : null);

// ประกอบโมเดลทั้งหน้าจากชุดข้อมูลดิบของวัน (getPrepBundle)
export function buildPrepModel(b) {
  const asum = {}; (b.assumptions || []).forEach(a => { asum[a.key] = a.value === null ? null : Number(a.value); });
  const cookedToRaw = asum.cooked_to_raw ?? 1;
  const respMap = {};
  (b.resp || []).forEach(r => (respMap[r.responsibility] = respMap[r.responsibility] || []).push(r.staff_code));
  // ใครรับผิดชอบรายการไหน ถามหน้าแบ่งงานก่อน (ยังไม่เคยแบ่ง = ใช้ตารางหน้าที่เดิม)
  const whoOf = i => ownersOf(b.assigns, 'prep', i, respMap[i.responsibility] || []);
  const logMap = {};
  (b.logs || []).forEach(l => { (logMap[l.count_item_id] = logMap[l.count_item_id] || {})[l.entry_type + ':' + l.seq] = l; });
  const leftMap = {};
  (b.leftovers || []).forEach(l => { (leftMap[l.menu_id] = leftMap[l.menu_id] || {})[l.entry_type] = l; });

  // แถวแท็บบันทึกอาหารเหลือ (หน่วยกรัม)
  const fahRows = (b.menus || []).map(m => {
    const rec = leftMap[m.id] || {};
    const row = {
      ...m,
      left: boxOf(rec['เหลือ']), waste: boxOf(rec['ทิ้ง']), self: boxOf(rec['กินเอง']), home: boxOf(rec['ห่อกลับบ้าน']),
      revs: { left: revOf(rec['เหลือ']), waste: revOf(rec['ทิ้ง']), self: revOf(rec['กินเอง']), home: revOf(rec['ห่อกลับบ้าน']) }
    };
    row.keep = fahKeepOrNull(row);
    return row;
  });
  const conv = leftoverByProtein(b.menus || [], id => fahRows.find(r => r.id === id), cookedToRaw);

  // แถวแท็บเตรียมอาหาร (เนื้อสัตว์) — ยอดใช้จริงมาจาก meatUseRows ชุดเดียวกับที่เติมข้อมูลพยากรณ์
  const meatItems = (b.items || []).filter(i => i.grp === 'เนื้อสัตว์');
  const use = meatUseRows(b, b.r9VoidStatus || []);
  const meatRows = use.rows.map(({ row: u, lg }) => {
    const i = u;
    const row = {
      ...u, owners: whoOf(i),
      revs: { prep: revOf(lg['เตรียม:1']), extra: revOf(lg['เบิกเพิ่ม:1']), waste: revOf(lg['ทิ้ง:1']), left: revOf(lg['คงเหลือ:1']) }
    };
    row.useBase = prepUseBase(row);
    row.stock = stockAfterPrep(b.stocks, i.id, b.date, row.useBase);
    const same = (b.stocks || []).find(c => c.count_item_id === i.id && c.count_date === b.date && c.kitchen_qty !== null);
    row.stockWarn = !!(row.left !== null && same && Number(row.left) > Number(same.kitchen_qty));
    return row;
  });

  // แถวแท็บเตรียมข้าว (รายการข้าวที่หุงประจำวัน — คนละชุดกับข้าวสารในสต๊อก)
  const riceItems = (b.items || []).filter(i => i.grp === 'ข้าวหุง');
  const riceRows = riceItems.map(i => {
    const lg = logMap[i.id] || {};
    return {
      ...i, owners: whoOf(i), ratio: i.cook_ratio === null || i.cook_ratio === undefined ? null : Number(i.cook_ratio),
      cook: qtyOf(lg['หุง:1']), rounds: [qtyOf(lg['หุงเพิ่ม:1']), qtyOf(lg['หุงเพิ่ม:2']), qtyOf(lg['หุงเพิ่ม:3'])],
      left: qtyOf(lg['คงเหลือสุก:1']), waste: qtyOf(lg['ทิ้ง:1']), home: qtyOf(lg['ห่อกลับบ้าน:1']), give: qtyOf(lg['แจก:1']),
      revs: {
        cook: revOf(lg['หุง:1']), r0: revOf(lg['หุงเพิ่ม:1']), r1: revOf(lg['หุงเพิ่ม:2']), r2: revOf(lg['หุงเพิ่ม:3']),
        left: revOf(lg['คงเหลือสุก:1']), waste: revOf(lg['ทิ้ง:1']), home: revOf(lg['ห่อกลับบ้าน:1']), give: revOf(lg['แจก:1'])
      }
    };
  });

  return {
    date: b.date, cookedToRaw, meatRows, riceRows, fahRows, conv,
    useWarn: { unbound: use.unbound, conflicts: use.conflicts, r9NoUnit: use.r9.noUnit, prevDate: b.prevDate || null },
    menus: b.menus || [], meatItems,
    riceStats: riceHistory(b.logs7 || [], riceItems, b.date),
    fahWeek: leftoverWeek(b.left7 || [], b.date)
  };
}

// สถิติข้าว 7 วันย้อนหลังจากบันทึกจริง (คิดเฉพาะชนิดที่มีอัตราหุง · วันที่ไม่มีข้อมูล = แสดงขีด ไม่เดา)
export function riceHistory(logs, riceItems, endDate) {
  const ratio = {};
  riceItems.forEach(i => { if (Number(i.cook_ratio) > 0) ratio[i.id] = Number(i.cook_ratio); });
  const byDate = {};
  (logs || []).forEach(l => { if (ratio[l.count_item_id]) (byDate[l.log_date] = byDate[l.log_date] || []).push(l); });
  const days = [];
  for (let k = 6; k >= 0; k--) {
    const d = shiftIso(endDate, -k);
    const rows = byDate[d] || [];
    if (!rows.length) { days.push({ date: d, has: false }); continue; }
    let cooked = 0, left = 0, soldRaw = 0;
    const per = {};
    rows.forEach(l => (per[l.count_item_id] = per[l.count_item_id] || []).push(l));
    Object.keys(per).forEach(id => {
      let raw = 0, lf = 0;
      per[id].forEach(l => {
        if (l.entry_type === 'หุง' || l.entry_type === 'หุงเพิ่ม') raw += Number(l.qty) || 0;
        if (l.entry_type === 'คงเหลือสุก') lf += Number(l.qty) || 0;
      });
      const ck = raw * ratio[id];
      cooked += ck; left += lf; soldRaw += (ck - lf) / ratio[id];
    });
    days.push({ date: d, has: true, sold: r1(cooked - left), soldRaw: r1(soldRaw), left: r1(left) });
  }
  return days;
}

// ของเหลือ 7 วันย้อนหลัง (เฉพาะช่อง "เหลือ") → รายเมนูรายวัน
export function leftoverWeek(rows, endDate) {
  const days = [];
  for (let k = 6; k >= 0; k--) days.push(shiftIso(endDate, -k));
  const byMenu = {};
  (rows || []).forEach(r => { (byMenu[r.menu_id] = byMenu[r.menu_id] || {})[r.left_date] = Number(r.qty_box); });
  return { days, byMenu };
}

// ---------- หน้าพระราม 9 (ส่งของ / ประวัติ / Report) ----------

const r2 = n => Math.round(n * 100) / 100;

// ยอดรวมของร้านหนึ่งในหน้ารายได้ (ยังไม่กรอกสักช่อง = null ห้ามแสดง 0)
export function incomeBrandTotal(amounts) {
  const nums = Object.values(amounts || {}).filter(v => v !== null && v !== undefined && v !== '');
  return nums.length ? nums.reduce((s, v) => s + Number(v), 0) : null;
}

// รายการที่เปิดใช้ + ค่าที่กำลังกรอกในร่างรอบส่ง (ราคาว่าง = ยังไม่ตั้งราคา ต้องเป็น null ห้ามเป็น 0)
export function r9DraftItems(items, draft) {
  return items.filter(i => i.active).map(i => ({
    ...i,
    qty: i.id in draft.qty ? draft.qty[i.id] : '',
    price: i.id in draft.price ? draft.price[i.id] : i.price
  }));
}

// รวมของ 1 แถว = ปริมาณ × ราคา
export function r9Row(line) {
  return r2((Number(line.qty) || 0) * (Number(line.price) || 0));
}

// ยอดของรอบที่กำลังกรอก: นับรายการที่กรอกแล้ว / ค่าสินค้า / ค่าส่ง / ยอดสุทธิ
export function r9Totals(items, fee) {
  const filled = items.filter(i => (Number(i.qty) || 0) > 0);
  const goods = r2(items.reduce((s, i) => s + r9Row(i), 0));
  const shipping = Number(fee) || 0;
  return { count: items.length, filled: filled.length, goods, fee: shipping, net: r2(goods + shipping) };
}

// สรุปรายหมวดของชุดรายการ: จำนวนรายการที่กรอก + มูลค่า + ปริมาณรวม
export function r9ByCat(items, cats) {
  return cats.map(cat => {
    const rows = items.filter(i => i.cat === cat.id);
    return {
      cat,
      rows,
      filled: rows.filter(i => (Number(i.qty) || 0) > 0).length,
      qty: r2(rows.reduce((s, i) => s + (Number(i.qty) || 0), 0)),
      value: r2(rows.reduce((s, i) => s + r9Row(i), 0))
    };
  });
}

// ยอดของรอบที่บันทึกไว้แล้ว 1 รอบ
export function r9RoundTotals(round) {
  const lines = round.lines || [];
  const goods = r2(lines.reduce((s, l) => s + r9Row(l), 0));
  return { items: lines.filter(l => (Number(l.qty) || 0) > 0).length, goods, fee: Number(round.fee) || 0, net: r2(goods + (Number(round.fee) || 0)) };
}

// รวมรอบส่งเป็นรายวัน: วันไหนส่งกี่รายการ ค่าส่งเท่าไหร่ รวมเท่าไหร่ (ใช้ในรายงานแยกตามวัน)
export function r9ByDate(rounds) {
  const map = new Map();
  (rounds || []).forEach(rd => {
    const t = r9RoundTotals(rd);
    const cur = map.get(rd.date) || { date: rd.date, rounds: 0, items: 0, fee: 0, goods: 0, net: 0 };
    cur.rounds += 1; cur.items += t.items; cur.fee += t.fee;
    cur.goods = r2(cur.goods + t.goods); cur.net = r2(cur.net + t.net);
    map.set(rd.date, cur);
  });
  return [...map.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

// รายการที่ส่งไปจริงของรอบที่เลือก: ชื่อ + ปริมาณ + ราคาต่อหน่วย + รวม (ราคาเดียวกันรวมเป็นแถวเดียว)
export function r9SentLines(rounds, items) {
  const map = new Map();
  (rounds || []).forEach(rd => (rd.lines || []).forEach(l => {
    if (!(Number(l.qty) > 0)) return;
    const key = `${l.id}|${l.price}`;
    const item = items.find(i => i.id === l.id) || { id: l.id, name: l.id, unit: '' };
    const cur = map.get(key) || { item, price: l.price, qty: 0, value: 0 };
    cur.qty = r2(cur.qty + (Number(l.qty) || 0));
    cur.value = r9Row({ qty: cur.qty, price: cur.price });
    map.set(key, cur);
  }));
  const order = id => { const i = items.findIndex(x => x.id === id); return i < 0 ? 9999 : i; };
  return [...map.values()].sort((a, b) => order(a.item.id) - order(b.item.id));
}

// สรุปรายหมวดของรอบที่บันทึกไว้ (ใช้บนการ์ดประวัติ)
export function r9RoundByCat(round, items, cats) {
  const at = id => items.find(i => i.id === id);
  return cats.map(cat => {
    const lines = (round.lines || []).filter(l => (at(l.id) || {}).cat === cat.id);
    return { cat, items: lines.length, value: r2(lines.reduce((s, l) => s + r9Row(l), 0)) };
  });
}

// ตารางสรุปยอดของ Report: แถวหมวด + แถวรายการ ตามรอบที่เลือก (ค่าเป็นปริมาณ)
export function r9Matrix(rounds, items, cats) {
  const qty = (round, id) => {
    const line = (round.lines || []).find(l => l.id === id);
    return line ? Number(line.qty) || 0 : 0;
  };
  // แจกแจงทุกรายการในตารางแม่ ไม่ตัดแถวที่ยังเป็น 0 ออก
  const groups = cats.map(cat => {
    const rows = items.filter(i => i.cat === cat.id).map(item => {
      const cells = rounds.map(rd => qty(rd, item.id));
      const total = r2(cells.reduce((s, v) => s + v, 0));
      return { item, cells, total, price: Number(item.price) || 0, value: r2(total * (Number(item.price) || 0)) };
    });
    const cells = rounds.map((_, i) => r2(rows.reduce((s, r) => s + r.cells[i], 0)));
    return {
      cat, rows, cells,
      total: r2(cells.reduce((s, v) => s + v, 0)),
      value: r2(rows.reduce((s, r) => s + r.value, 0))
    };
  });
  const feeCells = rounds.map(rd => Number(rd.fee) || 0);
  const sumCells = rounds.map((_, i) => r2(groups.reduce((s, g) => s + g.cells[i], 0) + feeCells[i]));
  const feeTotal = r2(feeCells.reduce((s, v) => s + v, 0));
  return {
    groups,
    fee: { cells: feeCells, total: feeTotal },
    sum: {
      cells: sumCells,
      total: r2(sumCells.reduce((s, v) => s + v, 0)),
      value: r2(groups.reduce((s, g) => s + g.value, 0) + feeTotal)
    }
  };
}

// ตัวเลขสรุปหัว Report ของรอบที่เลือก
export function r9ReportKpi(rounds) {
  const t = rounds.reduce((a, rd) => {
    const s = r9RoundTotals(rd);
    return { items: a.items + s.items, goods: a.goods + s.goods, fee: a.fee + s.fee };
  }, { items: 0, goods: 0, fee: 0 });
  return { rounds: rounds.length, items: t.items, goods: r2(t.goods), fee: r2(t.fee), net: r2(t.goods + t.fee) };
}

// รายการขายดีตามปริมาณ (ใช้ในส่วนวิเคราะห์ของ Report)
export function r9TopItems(rounds, items, top = 5) {
  const map = new Map();
  rounds.forEach(rd => (rd.lines || []).forEach(l => {
    const cur = map.get(l.id) || { qty: 0, value: 0 };
    map.set(l.id, { qty: cur.qty + (Number(l.qty) || 0), value: cur.value + r9Row(l) });
  }));
  return [...map.entries()]
    .map(([id, v]) => ({ item: items.find(i => i.id === id), qty: r2(v.qty), value: r2(v.value) }))
    .filter(r => r.item && r.qty > 0)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, top);
}

// สรุปรายสินค้าของรอบที่เลือก: ส่งไปกี่หน่วย กี่บาท เรียงมาก→น้อย (ตอบว่า "น้ำใบเตย 42 ขวด 672 บาท")
export function r9ItemSummary(rounds, items) {
  const map = new Map();
  rounds.forEach(rd => (rd.lines || []).forEach(l => {
    const cur = map.get(l.id) || { qty: 0, value: 0, rounds: 0 };
    map.set(l.id, { qty: cur.qty + (Number(l.qty) || 0), value: cur.value + r9Row(l), rounds: cur.rounds + 1 });
  }));
  return [...map.entries()]
    .map(([id, v]) => ({ item: items.find(i => i.id === id) || { id, name: id, unit: '' }, qty: r2(v.qty), value: r2(v.value), rounds: v.rounds }))
    .filter(r => r.qty > 0)
    .sort((a, b) => b.value - a.value || b.qty - a.qty);
}

// จัดกลุ่มรอบส่งตามเดือน (ใช้ทำกราฟย้อนหลังในแท็บประวัติ)
export function r9ByMonth(rounds, months = 6) {
  const key = iso => iso.slice(0, 7);
  const keys = [...new Set(rounds.map(rd => key(rd.date)))].sort().slice(-months);
  return keys.map(k => {
    const list = rounds.filter(rd => key(rd.date) === k);
    return { key: k, iso: k + '-01', rounds: list.length, net: r2(list.reduce((s, rd) => s + r9RoundTotals(rd).net, 0)), items: list.reduce((s, rd) => s + r9RoundTotals(rd).items, 0) };
  });
}

// ---------- สูตรอาหาร: แตกสูตรย่อย + คิดสัดส่วน batch (ใช้กับหน้าสูตรอาหาร) ----------

// ปริมาณของบรรทัดสูตร (บรรทัดสูตรย่อยใช้ sub_recipe_qty_g ถ้ามี)
const recipeLineQty = l => Number(l.sub_recipe_id ? (l.sub_recipe_qty_g ?? l.qty_g) : l.qty_g) || 0;

// น้ำหนักที่ได้จาก 1 สูตร = ผลรวมกลุ่มที่นับน้ำหนัก × % หลังปรุง (null = สูตรยังไม่มีวัตถุดิบ)
export function recipeOut(book, id) {
  const r = book.recipes[id];
  if (!r) return null;
  const skip = (book.cards[id] || {}).exclude_groups || [];
  const sum = (book.lines[id] || []).filter(l => !skip.includes(l.group_name)).reduce((s, l) => s + recipeLineQty(l), 0);
  if (!(sum > 0)) return null;
  // ใช้ขนาด batch ที่ตั้งในสูตร (base_batch_g) ถ้าต่างจากผลรวมไม่เกิน 2% (สูตรต้นทางปัดเลขกลมไว้) — ต่างมากกว่านั้น = ค่าตั้งผิด ใช้ผลรวมจริง
  const base = Number(r.base_batch_g);
  const size = base > 0 && Math.abs(base - sum) / sum <= 0.02 ? base : sum;
  return size * (Number(r.yield_percent) || 100) / 100;
}

// แตกสูตรเป็นวัตถุดิบชั้นล่างสุด ปริมาณต่อ 1 สูตรแม่ (สูตรย่อยคูณสัดส่วนให้แล้ว · ติดธง cycle = วนกลับ / noSub = สูตรย่อยว่าง)
export function recipeLeaves(book, id, scale = 1, seen = [], via = null, off = false, prefix = '') {
  const skip = (book.cards[id] || {}).exclude_groups || [];
  const out = [];
  (book.lines[id] || []).forEach(l => {
    const qty = recipeLineQty(l) * scale;
    const excluded = off || skip.includes(l.group_name);
    const key = prefix + l.id;
    if (!l.sub_recipe_id) { out.push({ key, name: l.name, group: l.group_name, via, qty, excluded }); return; }
    const sub = book.recipes[l.sub_recipe_id];
    const subName = sub ? sub.name_th : l.name;
    const tag = via || { id: l.sub_recipe_id, name: subName, qty, key };
    if ([...seen, id].includes(l.sub_recipe_id)) { out.push({ key, name: subName, via, qty, excluded, error: 'cycle' }); return; }
    const so = recipeOut(book, l.sub_recipe_id);
    if (!so) { out.push({ key, name: subName, via, qty, excluded, error: 'noSub' }); return; }
    out.push(...recipeLeaves(book, l.sub_recipe_id, qty / so, [...seen, id], tag, excluded, key + '/'));
  });
  return out;
}

// คิดปริมาณจริง: target = กรัมที่อยากได้ · have = { key: กรัมที่มีอยู่ } → ใช้ตัวคูณที่น้อยที่สุด (ของที่หมดก่อน) ของที่เกินแสดงเป็นเหลือ
export function recipeScale(leaves, baseOut, { target = null, have = {} } = {}) {
  const cand = [];
  if (target !== null && target >= 0 && baseOut > 0) cand.push({ f: target / baseOut, key: null });
  leaves.forEach(l => {
    const h = have[l.key];
    if (h !== null && h !== undefined && l.qty > 0 && !l.error) cand.push({ f: h / l.qty, key: l.key });
  });
  const pick = cand.length ? cand.reduce((a, b) => (b.f < a.f ? b : a)) : { f: 1, key: null };
  const f = pick.f;
  const tidy = v => (Math.abs(v) < 1e-9 ? 0 : v);
  return {
    factor: f, output: baseOut * f, limitKey: pick.key, given: cand.length > 0,
    rows: leaves.map(l => ({ ...l, need: l.error ? null : l.qty * f, left: have[l.key] === null || have[l.key] === undefined ? null : tidy(have[l.key] - l.qty * f) }))
  };
}

// ---------- การมาทำงาน (หน้าสรุปวันลา + หน้าโบนัส) ----------

// น้ำหนักของแต่ละวันเปิด = เฉลี่ยยอดขายวันเดียวกันในสัปดาห์ ÷ เฉลี่ยยอดขายรวม (14 วันก่อนหน้า นับเฉพาะวันที่ยอด > 0 · ไม่มีข้อมูล = 1)
export function dayWeights(days) {
  const out = {};
  const avg = list => list.reduce((s, x) => s + Number(x.sales), 0) / list.length;
  days.forEach(d => {
    if (!d.is_open) return;
    const from = shiftIso(d.day, -14);
    const win = days.filter(x => x.day >= from && x.day < d.day && Number(x.sales) > 0);
    if (!win.length) { out[d.day] = 1; return; }
    const same = win.filter(x => x.dow === d.dow);
    out[d.day] = same.length ? avg(same) / avg(win) : 1;
  });
  return out;
}

// สรุปการมาทำงานของทุกคนในช่วงวันที่: วันต้องมา = วันเปิดตั้งแต่วันเริ่มงาน · หยุดครึ่งวัน = 0.5
// คะแนนหลัก = 100 × (1 − น้ำหนักวันหยุด ÷ น้ำหนักรวม) · แต้มช่วยเพื่อน = 100 × ภาระที่รับแทน ÷ น้ำหนักรวม
export function attendance({ days, leaves, people, from, to }) {
  const w = dayWeights(days);
  const off = {};
  leaves.forEach(l => { (off[l.staff_code] = off[l.staff_code] || {})[l.leave_date] = Math.min(1, Number(l.days) || 1); });
  const rows = people.map(p => ({ ...p, open: 0, off: 0, wAll: 0, wOff: 0, help: 0 }));
  days.filter(d => d.is_open && d.day >= from && d.day <= to).forEach(({ day }) => {
    let lost = 0;
    const came = [];
    rows.filter(r => day >= r.start).forEach(r => {
      const f = (off[r.code] || {})[day] || 0;
      r.open += 1; r.off += f; r.wAll += w[day]; r.wOff += w[day] * f; lost += w[day] * f;
      if (!f) came.push(r);
    });
    if (lost > 0 && came.length) came.forEach(r => { r.help += lost / came.length; });
  });
  return rows.map(r => ({
    ...r,
    worked: r.open - r.off,
    pct: r.open ? (r.open - r.off) / r.open * 100 : null,
    score: r.wAll ? Math.min(100, Math.max(0, 100 * (1 - r.wOff / r.wAll))) : null,
    helpPts: r.wAll ? 100 * r.help / r.wAll : null
  }));
}

// ภาษีเงินได้บุคคลธรรมดา (ประมาณ) ของเงินได้ทั้งปี income · หักค่าใช้จ่ายเหมา (flat_rate) หรือตามจริง (actual_expense) · ลดหย่อน allowance
// T = { brackets: [[เพดาน, อัตรา]...], minRate, minIncome, minFloor } · ภาษีขั้นต่ำ: เงินได้ ≥ minIncome ให้เทียบ minRate × เงินได้ เสียอันที่มากกว่า (ไม่เกิน minFloor ไม่ต้องเสียแบบขั้นต่ำ)
export function personalTax(income, set, T) {
  const inc = Math.max(0, Number(income) || 0);
  const expense = set.expense_mode === 'actual' ? Math.min(inc, Math.max(0, Number(set.actual_expense) || 0)) : inc * (Number(set.flat_rate) || 0);
  const net = Math.max(0, inc - expense - (Number(set.allowance) || 0));
  let prev = 0, tax = 0;
  const steps = T.brackets.map(([cap, rate]) => { const part = Math.max(0, Math.min(net, cap) - prev), t = part * rate; prev = cap; tax += t; return { cap, rate, part, tax: t }; }).filter(x => x.part > 0);
  const minTax = inc >= T.minIncome ? inc * T.minRate : 0, useMin = minTax > T.minFloor && minTax > tax;
  const pay = useMin ? minTax : tax;
  return { income: inc, expense, net, steps, progressive: tax, minTax, useMin, pay, eff: inc ? pay / inc : 0 };
}
