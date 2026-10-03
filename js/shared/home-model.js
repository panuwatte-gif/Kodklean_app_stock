// แปลงแถวดิบจากฐาน → ข้อมูลการ์ดของหน้าหลัก (ไฟล์นี้ไม่ยิงฐานเอง data.js เป็นคนดึงมาส่งให้)
import { STOCK_PHOTOS, STOCK_PHOTO_BY_GROUP, MENU_PHOTOS, PREP_ENTRY, HOME_RICE_GROUPS } from './config.js';
import { namesOf } from './assign.js';
import { shiftIso, dayLongTh, monthLongTh } from './format.js';

const U = PREP_ENTRY.fah.left;    // ประเภทแถว "เหลือ" ในตาราง kk_cooked_leftover
const W = PREP_ENTRY.fah.waste;   // ประเภทแถว "ทิ้ง"
const r1 = n => Math.round(n * 10) / 10;

// ค่าเฉลี่ยเฉพาะวันที่มีตัวเลข (ไม่มีข้อมูลเลย = null ห้ามแปลงเป็น 0)
function mean(list) {
  const nums = list.filter(v => v !== null && v !== undefined).map(Number);
  return nums.length ? r1(nums.reduce((s, v) => s + v, 0) / nums.length) : null;
}

// ต้นทุนต่อกก. ของรายการนับ (ต้นทุนกลางจากหน้าต้นทุนสินค้า · ไม่มี = null ห้ามเดา)
const priceKgOf = (prices, id) => (prices && prices[id] && prices[id].price !== null && prices[id].price !== undefined ? Number(prices[id].price) : null);

// รูปประจำรายการวัตถุดิบ: รูปที่เก็บในฐาน > รูปที่จับคู่ไว้ > รูปประจำหมวด
const photoOfItem = item =>
  item.photo || STOCK_PHOTOS[item.id] || STOCK_PHOTO_BY_GROUP[item.grp] || 'assets/cats/beef.webp';

// วันเปิดร้านที่มีบันทึกใช้จริง n วันล่าสุด (เรียงเก่า→ใหม่)
function openDates(history, n) {
  const all = [...new Set(history.map(h => h.use_date))].sort();
  return all.slice(Math.max(0, all.length - n));
}

// การ์ด "ใช้ไปเท่าไหร่" — ปริมาณใช้จริงรายวันของแต่ละวัตถุดิบ (kk_forecast_history)
function usageOf(history, items, dates) {
  const byItem = {};
  history.forEach(h => {
    if (h.used_kg === null || h.used_kg === undefined) return;
    (byItem[h.item_id] = byItem[h.item_id] || {})[h.use_date] = Number(h.used_kg);
  });
  const order = items.map(i => i.id);
  const series = Object.keys(byItem)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map(id => {
      const item = items.find(i => i.id === id) || { id, name: id, grp: 'เนื้อสัตว์' };
      return { id, name: item.name, photo: photoOfItem(item), daily: dates.map(d => byItem[id][d] ?? null) };
    });
  return { unit: 'กก.', dates, series };
}

// การ์ด "ยอดคงเหลือภาพรวม" — ของเหลือ/ของทิ้งรายเมนู (kk_cooked_leftover) ยังไม่มีบันทึก = ขีด ไม่ใช่ 0
// ต้นทุนต่อกรัมของเมนู = ต้นทุนเนื้อหลักต่อกก. ÷ 1000 × อัตราส่วนเนื้อ (สูตรเดียวกับการ์ดลดของเหลือ)
function leftOf(rows, menus, dates, prices) {
  const perGram = m => { const p = m.protein_item_id ? priceKgOf(prices, m.protein_item_id) : null; return p === null ? null : p / 1000 * (Number(m.protein_ratio) || 1); };
  const prior = dates.map(d => shiftIso(d, -7));
  const pick = (date, type, menuId) => rows.filter(r =>
    r.left_date === date && r.entry_type === type && (!menuId || r.menu_id === menuId));
  const sum = (date, type, menuId) => {
    const hit = pick(date, type, menuId);
    return hit.length ? r1(hit.reduce((s, r) => s + Number(r.qty_box || 0), 0)) : null;
  };
  const days = (list, type, menuId) => list.map(d => sum(d, type, menuId));
  // ค่าเฉลี่ย 30 วันจากทุกแถวของเมนูนั้น (ไม่จำกัดเฉพาะ 7 วันบนกราฟ)
  const mean30 = (menuId, type) => {
    const byDate = {};
    rows.filter(r => r.menu_id === menuId && r.entry_type === type)
      .forEach(r => { byDate[r.left_date] = (byDate[r.left_date] || 0) + Number(r.qty_box || 0); });
    return mean(Object.values(byDate));
  };
  const ranking = menus.map(m => ({
    id: m.id, name: m.name, photo: m.photo || MENU_PHOTOS[m.id] || 'assets/r9/dish-kaprao.webp',
    usable: days(dates, U, m.id), disposed: days(dates, W, m.id),
    priorUsable: days(prior, U, m.id), priorDisposed: days(prior, W, m.id),
    avg7: mean(days(dates, U, m.id)), avg30: mean30(m.id, U),
    avgNew30: mean30(m.id, U), unitCost: perGram(m)   // บาท/กรัม · ไม่มีต้นทุนเนื้อหลัก = null → ไม่ประมาณมูลค่า
  }));
  return {
    unit: 'กรัม', dates, hasData: rows.length > 0,   // hasData = มีบันทึกของเหลืออยู่บ้างแล้วหรือยัง
    usableTotal: days(dates, U), priorUsableTotal: days(prior, U),
    disposedTotal: days(dates, W), priorDisposedTotal: days(prior, W),
    ranking
  };
}

// การ์ด "พยากรณ์ใช้พรุ่งนี้" — ค่าพยากรณ์ชุดเดียวกับหน้าเตรียม-เหลือของวันเปิดถัดไป (recRows.fcDay จาก data.getPrepRecs) เรียงตามค่ากลางมาก→น้อย
function prepOf({ recRows, items, history, duties, staff, assigns }) {
  // คนที่ต้องเตรียมรายการนั้น = ตามหน้าแบ่งงาน (ยังไม่เคยแบ่ง = ใช้คนที่มีหน้าที่บันทึกเตรียมอาหาร)
  const fallback = (duties || []).filter(d => d.responsibility === 'บันทึกเตรียมอาหาร').map(d => d.staff_code);
  const band = f => (f.lo !== null && f.lo !== undefined && f.hi !== null && f.hi !== undefined && f.lo !== f.hi ? ` (${f.lo}–${f.hi})` : '');
  const rows = (recRows || []).filter(r => r.fcDay && r.fcDay.fc !== null && r.fcDay.fc !== undefined).map(r => {
    const item = (items || []).find(i => i.id === r.id) || r;
    return { id: r.id, name: item.name || r.name, qty: r.fcDay.fc, lo: r.fcDay.lo, hi: r.fcDay.hi, unit: item.unit || 'กก.', range: band(r.fcDay).trim(), photo: photoOfItem(item),
      staff: namesOf(assigns, staff, 'prep', item, fallback) };
  }).sort((a, b) => b.qty - a.qty).map((r, i) => ({ ...r, rank: i + 1 }));
  const lastDay = openDates(history, 1)[0] || null;
  return { pageSize: 3, basis: null, lastDay, items: rows };   // lastDay = วันที่ข้อมูลล่าสุด หน้าจอเป็นคนแปลงเป็นวันไทยเอง
}

// การ์ดพระราม 9 — มูลค่าของแต่ละรอบส่ง (ราคาในรอบ > ราคาตั้งต้นของรายการ)
function r9Of(rounds, r9items) {
  const priceOf = id => {
    const it = (r9items || []).find(i => i.id === id);
    return it && it.price !== null && it.price !== undefined ? Number(it.price) : null;
  };
  const shipments = (rounds || []).map(r => {
    const value = (r.lines || []).reduce((s, l) => {
      const price = l.price === null || l.price === undefined ? priceOf(l.id) : Number(l.price);
      return price === null ? s : s + Number(l.qty || 0) * price;
    }, Number(r.fee) || 0);
    return { id: r.root_id || r.id, date: r.date, value: Math.round(value) };
  });
  return { basis: 'มูลค่าของในรอบ + ค่าส่ง (จากตาราง kk_r9_round)', types: 'วัตถุดิบ + ซอส', hasData: shipments.length > 0, shipments };
}

// จำนวนวันเปิด (ไม่ใช่อาทิตย์) ตั้งแต่วันที่ 1 ของเดือนถึง date (all = ทั้งเดือน)
function openDaysInMonth(date, all = false) {
  const [y, m] = date.split('-').map(Number);
  const last = all ? new Date(y, m, 0).getDate() : Number(date.slice(8, 10));
  let n = 0;
  for (let d = 1; d <= last; d++) if (new Date(y, m - 1, d).getDay() !== 0) n++;
  return n;
}

// การ์ดหุงข้าว: ค่าพยากรณ์ข้าวดิบของพรุ่งนี้ต่อชนิด (สูตรเดียวกับหน้าเตรียมข้าว) · น้ำ/หม้อ ยังไม่มีสูตร = null
function riceOf(fcRows, items) {
  return HOME_RICE_GROUPS.map(g => ({ ...g, options: g.items.map(id => {
    const it = (items || []).find(i => i.id === id) || { name: id };
    const f = (fcRows || []).find(r => r.id === id);
    return { id, label: it.name, raw: f && f.fc !== null ? Math.ceil(f.fc * 10) / 10 : null, water: null, pots: null };
  }) }));
}

// การ์ดลดของเหลือ = ลดต้นทุน: ต้นทุนของทิ้งจริงสะสม (กก. × ราคาต่อกก.) เดือนนี้เทียบช่วงวันเดียวกันของเดือนก่อน
// ของทิ้งดิบ = kk_prep_log "ทิ้ง" · อาหารปรุงสำเร็จทิ้ง = กรัม ÷ 1000 × อัตราส่วนเนื้อ × ราคาเนื้อหลักของเมนู · ไม่มีราคา = ไม่นับ (บอกจำนวนไว้)
function savingsOf(waste, menus, prices, date) {
  const priceOf = id => priceKgOf(prices, id);
  const byDate = {}, noPrice = new Set();
  const add = (d, id, kg) => { const p = priceOf(id); if (p === null) { noPrice.add(id); return; } byDate[d] = (byDate[d] || 0) + kg * p; };
  (waste.raw || []).forEach(r => add(r.log_date, r.count_item_id, Number(r.qty) || 0));
  (waste.cooked || []).forEach(r => {
    const m = (menus || []).find(x => x.id === r.menu_id);
    if (m && m.protein_item_id) add(r.left_date, m.protein_item_id, (Number(r.qty_box) || 0) / 1000 * (Number(m.protein_ratio) || 1));
  });
  const day = Number(date.slice(8, 10)), cur = date.slice(0, 8);
  const prev = shiftIso(date.slice(0, 7) + '-01', -1).slice(0, 8);
  const prevLast = Number(shiftIso(date.slice(0, 7) + '-01', -1).slice(8, 10));
  const days = Array.from({ length: day }, (_, i) => i + 1);
  const cum = (month, cap) => { let s = 0; return days.map(d => { if (d <= cap) s += byDate[month + String(d).padStart(2, '0')] || 0; return Math.round(s); }); };
  const has = Object.keys(byDate).length > 0;   // มีของทิ้งที่มีราคาอย่างน้อย 1 แถว (ไม่มีราคาเลย = ยังไม่มีข้อมูล ไม่ใช่ ฿0)
  const priorCum = cum(prev, prevLast), currentCum = cum(cur, day);
  if (!has) { priorCum[priorCum.length - 1] = null; currentCum[currentCum.length - 1] = null; }
  const pad = d => String(d).padStart(2, '0');
  return { days, priorCum, currentCum, ticks: null,
    currentPeriod: [cur + '01', date], priorPeriod: [prev + '01', prev + pad(Math.min(day, prevLast))], noPrice: noPrice.size };
}

// ยอดขายเทียบเป้า: ยอดจริงจากตารางรายได้ประจำวัน (kk_daily_income ที่ฟ้า/แม่พันบันทึก) · เป้ารวมต่อวันจาก kk_sales_target
// ยังไม่มีบันทึก = null (แสดง "ยังไม่มีข้อมูล") ห้ามเดาเป็น 0 · เป้าเดือนถึงวันนี้ = เป้าต่อวัน × วันเปิดที่ผ่านมา
// รวมยอดขาย 1 ร้าน 1 วัน แยกช่องทาง: ยอดที่บันทึกในรายได้ประจำวันมาก่อน · ช่อง Grab ที่ยังไม่ได้กรอก ใช้ยอดขายสุทธิจากรายงาน Grab (วันที่มีออเดอร์)
function mergeIncome(income, grab) {
  const map = new Map();
  const at = (brand, date) => { const k = brand + '|' + date; if (!map.has(k)) map.set(k, { brand, date, ch: {} }); return map.get(k); };
  (income || []).forEach(r => {
    const x = at(r.brand, r.date), ch = r.ch || { other: Number(r.total) || 0 };
    Object.keys(ch).forEach(c => { x.ch[c] = (x.ch[c] || 0) + ch[c]; });
  });
  (grab || []).forEach(g => {
    if (!(Number(g.orders) > 0)) return;
    const x = at(g.shop, g.day);
    if (x.ch.grab === undefined) x.ch.grab = Number(g.sales) || 0;
  });
  return [...map.values()].map(x => ({ ...x, total: Object.values(x.ch).reduce((s, v) => s + v, 0) }));
}

// การ์ด KodKlean Group + สัดส่วนรายได้: ยอดรวมทุกร้านรายวัน (แยกสีร้าน) ตั้งแต่วันที่ 1 ถึงวันอ้างอิง (วันล่าสุดที่มีข้อมูล) + ยอดต่อร้าน/ต่อช่องทางทั้งเดือน
function groupOf(stores, rows, channels, date) {
  const month = date.slice(0, 7), mine = rows.filter(r => r.date.slice(0, 7) === month);
  const labels = Array.from({ length: Number(date.slice(8)) }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
  const daily = labels.map(d => {
    const rs = mine.filter(r => r.date === d);
    return rs.length ? stores.map(s => rs.filter(r => r.brand === s.id).reduce((a, r) => a + r.total, 0)) : null;
  });
  const has = daily.filter(Boolean), total = mine.reduce((s, r) => s + r.total, 0);
  const chIds = [...new Set([...(channels || []).map(c => c.id), ...mine.flatMap(r => Object.keys(r.ch))])];
  return {
    labels, daily, total: mine.length ? Math.round(total) : null, days: has.length,
    avg: has.length ? Math.round(total / has.length) : null,
    last: has.length ? labels[daily.lastIndexOf(has[has.length - 1])] : null,
    byStore: stores.map(s => ({ id: s.id, name: s.name, color: s.color, value: mine.filter(r => r.brand === s.id).reduce((a, r) => a + r.total, 0) })),
    byChannel: chIds.map(id => ({ id, name: ((channels || []).find(c => c.id === id) || {}).name || id, value: mine.reduce((a, r) => a + (r.ch[id] || 0), 0) }))
  };
}

// รายได้ส่วนใหญ่บันทึกหลังปิดร้าน (หรือหลังเที่ยงคืน) จึงยึด "วันล่าสุดที่มีข้อมูล" เป็นวันอ้างอิง ไม่ใช่วันนี้
// เช่น วันที่ 1 ต.ค. ยังไม่มีใครกรอก → การ์ดรายได้แสดงเดือน ก.ย. ถึงวันที่ 30 แทนที่จะว่างทั้งการ์ด
function salesOf(brands, rawIncome, date, target, grab, channels) {
  const income = mergeIncome(rawIncome, grab).filter(r => r.date <= date);
  const dates = income.map(r => r.date).sort();
  const ref = dates.length ? dates[dates.length - 1] : date;   // วันล่าสุดที่มีรายได้
  const month = ref.slice(0, 7);
  const sum = rows => (rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.total) || 0), 0)) : null);
  const stores = (brands || []).map(b => {
    const mine = (income || []).filter(r => r.brand === b.id);
    return {
      id: b.id, name: b.name, logo: b.logo, color: b.color || '#125B2A',
      month: sum(mine.filter(r => r.date.slice(0, 7) === month)),
      today: sum(mine.filter(r => r.date === ref)),
      target: b.monthly_target === null || b.monthly_target === undefined ? null : Number(b.monthly_target)
    };
  });
  const all = rows => sum(rows);
  const total = {
    today: all(income.filter(r => r.date === ref)),
    month: all(income.filter(r => r.date.slice(0, 7) === month)),
    daily: target === null || target === undefined ? null : Number(target),
    openSoFar: openDaysInMonth(ref), openMonth: openDaysInMonth(ref, true)
  };
  return { through: ref, month, monthLabel: monthLongTh(month), updatedAt: dayLongTh(date), stores, total, group: groupOf(stores, income, channels, ref) };
}

// รวมทุกการ์ดที่ต่อฐานได้แล้ว (การ์ดข้าว / ลดของเหลือ ยังไม่มีตารางในฐาน — หน้าจอใช้ข้อมูลตั้งต้นต่อไป)
export function buildHome(src) {
  const dates = openDates(src.history, 7);
  const last = dates[dates.length - 1] || src.date;
  const openDays = [...new Set(src.history.filter(h => h.use_date > shiftIso(src.date, -30)).map(h => h.use_date))].length;
  return {
    meta: {
      asOf: src.date, analysisEnd: last, prepDate: src.prepDate || shiftIso(src.date, 1), prepClosed: false,
      openDaysFixture: openDays || 26, branches: [{ id: 'all', label: 'ทุกสาขา' }]
    },
    notices: (src.notices || []).map(n => ({ ...n, sort: n.sort_order, active: true })),
    usage: usageOf(src.history, src.items, dates),
    left: leftOf(src.left, src.menus, dates, src.prices),
    prep: prepOf({ ...src, date: src.date }),
    sales: salesOf(src.brands, src.income, src.date, src.target, src.grab, src.channels),
    rice: riceOf(src.fcRows, src.items),
    save: savingsOf(src.waste || {}, src.menus, src.prices, src.date),
    r9: r9Of(src.rounds, src.r9items)
  };
}
