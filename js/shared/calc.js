// สูตรคำนวณที่ใช้ร่วมหลายหน้า — คำนวณที่ไฟล์นี้ที่เดียว หน้าจอห้ามคำนวณเอง

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

// ---------- เตรียม-เหลือ: เนื้อสัตว์ ----------

// ปัดทศนิยม 1 ตำแหน่งกันเศษลอย (0.1+0.2)
const r1 = n => Math.round(n * 10) / 10;

// เบิกเพิ่มรวมของรายการ (บวกทุกรอบ)
export function prepExtra(item) {
  return r1((item.extras || []).reduce((s, v) => s + (Number(v) || 0), 0));
}

// ใช้จริง/วัน = เตรียม + เบิกเพิ่ม − ทิ้ง/เสีย − คงเหลือ
export function prepUse(item) {
  return r1((Number(item.prep) || 0) + prepExtra(item) - (Number(item.waste) || 0) - (Number(item.left) || 0));
}

// ตัวเลขสรุปหน้าเตรียมเนื้อสัตว์: จำนวนรายการ / รอบเบิกเพิ่ม / คงเหลือรวม / ทิ้งรวม / ใช้รวม
export function prepMeatTotals(items) {
  const t = { count: items.length, rounds: 0, left: 0, waste: 0, use: 0 };
  items.forEach(i => {
    t.rounds += (i.extras || []).length;
    t.left += Number(i.left) || 0;
    t.waste += Number(i.waste) || 0;
    t.use += prepUse(i);
  });
  return { ...t, left: r1(t.left), waste: r1(t.waste), use: r1(t.use) };
}

// ---------- เตรียม-เหลือ: ข้าว ----------

// หุงรวม (กก. ดิบ) = หุงรอบแรก + หุงเพิ่มทุกรอบ
export function riceRaw(r) {
  return r1((Number(r.cook) || 0) + (r.rounds || []).reduce((s, v) => s + (Number(v) || 0), 0));
}

// ข้าวสุกที่คาดว่าจะได้ = ดิบ × อัตราแปลง
export function riceCooked(r) {
  return r1(riceRaw(r) * (Number(r.ratio) || 1));
}

// ข้าวสุกเหลือเพื่อเก็บขายต่อ = ข้าวเหลือ − ทิ้ง/เสีย − ห่อกลับบ้าน − แจก
export function riceResale(r) {
  return r1((Number(r.left) || 0) - (Number(r.waste) || 0) - (Number(r.home) || 0) - (Number(r.give) || 0));
}

// แปลงข้าวสุกกลับเป็นข้าวดิบ
export function riceToRaw(cooked, ratio) {
  return r1((Number(cooked) || 0) / (Number(ratio) || 1));
}

// ตัวเลขสรุปหน้าเตรียมข้าว (รวมทุกชนิด)
export function riceTotals(list) {
  const t = { count: list.length, raw: 0, cook: 0, r1: 0, r2: 0, r3: 0, cooked: 0, left: 0, loss: 0, resale: 0, soldRaw: 0, lossRaw: 0, resaleRaw: 0 };
  list.forEach(r => {
    const raw = riceRaw(r), cooked = riceCooked(r);
    const loss = (Number(r.waste) || 0) + (Number(r.home) || 0) + (Number(r.give) || 0);
    const resale = riceResale(r);
    t.raw += raw; t.cook += Number(r.cook) || 0;
    t.r1 += Number(r.rounds?.[0]) || 0; t.r2 += Number(r.rounds?.[1]) || 0; t.r3 += Number(r.rounds?.[2]) || 0;
    t.cooked += cooked; t.left += Number(r.left) || 0; t.loss += loss; t.resale += resale;
    t.soldRaw += riceToRaw(cooked - (Number(r.left) || 0), r.ratio);
    t.lossRaw += riceToRaw(loss, r.ratio);
    t.resaleRaw += riceToRaw(resale, r.ratio);
  });
  const out = {}; Object.keys(t).forEach(k => { out[k] = r1(t[k]); });
  out.sold = r1(t.cooked - t.left);   // ใช้ขายจริง (กก. สุก) = สุกทั้งหมด − ที่เหลือ
  return out;
}

// ค่าเฉลี่ยของสถิติย้อนหลัง (คีย์ตัวเลขทุกตัว)
export function historyAverage(rows, keys) {
  const out = {};
  keys.forEach(k => { out[k] = rows.length ? r1(rows.reduce((s, r) => s + (Number(r[k]) || 0), 0) / rows.length) : 0; });
  return out;
}

// ---------- เตรียม-เหลือ: พยากรณ์ ----------

// สร้างชุดตัวเลขย้อนหลังของกราฟเล็ก จากค่าใช้จริงเฉลี่ยและแนวโน้มของรายการนั้น
export function forecastHistory(row, days = 10) {
  const slope = row.trend === 'up' ? 0.05 : row.trend === 'down' ? -0.045 : 0;
  const seed = String(row.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: days }, (_, i) => {
    const wobble = Math.sin(seed + i * 1.7) * 0.11;
    return Math.max(0.1, r1((Number(row.avg) || 0) * (1 + slope * (i - days / 2) + wobble)));
  });
}

// ส่วนต่างของค่าพยากรณ์เทียบค่าเฉลี่ย เป็นเปอร์เซ็นต์ (บวก = ต้องเตรียมมากขึ้น)
export function forecastGap(row) {
  const avg = Number(row.avg) || 0;
  return avg ? Math.round(((Number(row.fc) || 0) - avg) / avg * 100) : 0;
}

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

// แปลงของเหลือวันนี้เป็นวัตถุดิบ: รวมคงเหลือใช้ต่อของทุกเมนูที่ใช้วัตถุดิบตัวเดียวกัน
export function fahToIngredient(rows, menuIds) {
  return (menuIds || []).reduce((sum, id) => {
    const row = rows.find(r => r.id === id);
    return sum + (row ? fahKeep(row) : 0);
  }, 0);
}

// ---------- หน้าพระราม 9 (ส่งของ / ประวัติ / Report) ----------

const r2 = n => Math.round(n * 100) / 100;

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

// จัดกลุ่มรอบส่งตามเดือน (ใช้ทำกราฟย้อนหลังในแท็บประวัติ)
export function r9ByMonth(rounds, months = 6) {
  const key = iso => iso.slice(0, 7);
  const keys = [...new Set(rounds.map(rd => key(rd.date)))].sort().slice(-months);
  return keys.map(k => {
    const list = rounds.filter(rd => key(rd.date) === k);
    return { key: k, iso: k + '-01', rounds: list.length, net: r2(list.reduce((s, rd) => s + r9RoundTotals(rd).net, 0)), items: list.reduce((s, rd) => s + r9RoundTotals(rd).items, 0) };
  });
}
