// แปลงแถวดิบจากฐาน → ข้อมูลการ์ดของหน้าหลัก (ไฟล์นี้ไม่ยิงฐานเอง data.js เป็นคนดึงมาส่งให้)
import { STOCK_PHOTOS, STOCK_PHOTO_BY_GROUP, MENU_PHOTOS, PREP_ENTRY, HOME_RICE_GROUPS } from './config.js';
import { buildSeries, predictorOf } from './fclab.js';
import { namesOf } from './assign.js';
import { shiftIso, dayLongTh } from './format.js';

const U = PREP_ENTRY.fah.left;    // ประเภทแถว "เหลือ" ในตาราง kk_cooked_leftover
const W = PREP_ENTRY.fah.waste;   // ประเภทแถว "ทิ้ง"
const dowOf = iso => new Date(iso + 'T00:00:00').getDay();
const r1 = n => Math.round(n * 10) / 10;

// ค่าเฉลี่ยเฉพาะวันที่มีตัวเลข (ไม่มีข้อมูลเลย = null ห้ามแปลงเป็น 0)
function mean(list) {
  const nums = list.filter(v => v !== null && v !== undefined).map(Number);
  return nums.length ? r1(nums.reduce((s, v) => s + v, 0) / nums.length) : null;
}

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
function leftOf(rows, menus, dates) {
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
    avgNew30: mean30(m.id, U), unitCost: null   // ต้นทุนต่อเสิร์ฟยังไม่มีในฐาน → ไม่ประมาณมูลค่า
  }));
  return {
    unit: 'กรัม', dates, hasData: rows.length > 0,   // hasData = มีบันทึกของเหลืออยู่บ้างแล้วหรือยัง
    usableTotal: days(dates, U), priorUsableTotal: days(prior, U),
    disposedTotal: days(dates, W), priorDisposedTotal: days(prior, W),
    ranking
  };
}

// การ์ด "แนะนำเตรียมพรุ่งนี้" — ใช้สูตรที่ล็อกไว้ต่อรายการใน kk_forecast_model_map คำนวณบนบันทึกใช้จริง
function prepOf({ history, items, map, formulas, cfg, date, duties, staff, assigns }) {
  const reg = {};
  (formulas || []).forEach(f => { reg[f.formula_code] = f; });
  const target = shiftIso(date, 1);
  const aim = { date: target, dow: dowOf(target), used: null, theo: null };
  // คนที่ต้องเตรียมรายการนั้น = ตามหน้าแบ่งงาน (ยังไม่เคยแบ่ง = ใช้คนที่มีหน้าที่บันทึกเตรียมอาหาร)
  const fallback = (duties || []).filter(d => d.responsibility === 'บันทึกเตรียมอาหาร').map(d => d.staff_code);

  const rows = (map || []).filter(m => m.active !== false).map(m => {
    const item = items.find(i => i.id === m.item_id) || { id: m.item_id, name: m.item_name_th, unit: 'กก.' };
    let qty = null;
    if (m.model_type === 'fixed') qty = m.fixed_kg === null || m.fixed_kg === undefined ? null : Number(m.fixed_kg);
    else {
      const f = reg[m.formula_code];
      const fn = f ? predictorOf(f, reg) : null;
      const series = buildSeries(history, m.item_id, cfg);
      if (fn && series.length) {
        let p = null;
        try { p = fn(series, aim, f.params || {}, f.formula_code, cfg); } catch { p = null; }
        qty = p === null || !isFinite(p) ? null : r1(Math.max(0, p));
      }
    }
    return { id: m.item_id, name: item.name || m.item_name_th, qty, unit: item.unit || 'กก.', photo: photoOfItem(item),
      staff: namesOf(assigns, staff, 'prep', item, fallback) };
  }).filter(r => r.qty !== null).sort((a, b) => b.qty - a.qty).map((r, i) => ({ ...r, rank: i + 1 }));

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
  const priceOf = id => (prices && prices[id] && prices[id].price !== null && prices[id].price !== undefined ? Number(prices[id].price) : null);
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
function salesOf(brands, income, date, target) {
  const month = date.slice(0, 7);
  const sum = rows => (rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.total) || 0), 0)) : null);
  const stores = (brands || []).map(b => {
    const mine = (income || []).filter(r => r.brand === b.id);
    return {
      id: b.id, name: b.name, logo: b.logo, color: b.color || '#125B2A',
      month: sum(mine.filter(r => r.date.slice(0, 7) === month)),
      today: sum(mine.filter(r => r.date === date)),
      target: b.monthly_target === null || b.monthly_target === undefined ? null : Number(b.monthly_target)
    };
  });
  const dates = (income || []).map(r => r.date).sort();
  const all = rows => sum(rows);
  const total = {
    today: all((income || []).filter(r => r.date === date)),
    month: all((income || []).filter(r => r.date.slice(0, 7) === date.slice(0, 7))),
    daily: target === null || target === undefined ? null : Number(target),
    openSoFar: openDaysInMonth(date), openMonth: openDaysInMonth(date, true)
  };
  return { through: dates.length ? dates[dates.length - 1] : date, updatedAt: dayLongTh(date), stores, total };
}

// รวมทุกการ์ดที่ต่อฐานได้แล้ว (การ์ดข้าว / ลดของเหลือ ยังไม่มีตารางในฐาน — หน้าจอใช้ข้อมูลตั้งต้นต่อไป)
export function buildHome(src) {
  const dates = openDates(src.history, 7);
  const last = dates[dates.length - 1] || src.date;
  const openDays = [...new Set(src.history.filter(h => h.use_date > shiftIso(src.date, -30)).map(h => h.use_date))].length;
  return {
    meta: {
      asOf: src.date, analysisEnd: last, prepDate: shiftIso(src.date, 1), prepClosed: false,
      openDaysFixture: openDays || 26, branches: [{ id: 'all', label: 'ทุกสาขา' }]
    },
    notices: (src.notices || []).map(n => ({ ...n, sort: n.sort_order, active: true })),
    usage: usageOf(src.history, src.items, dates),
    left: leftOf(src.left, src.menus, dates),
    prep: prepOf({ ...src, date: src.date }),
    sales: salesOf(src.brands, src.income, src.date, src.target),
    rice: riceOf(src.fcRows, src.items),
    save: savingsOf(src.waste || {}, src.menus, src.prices, src.date),
    r9: r9Of(src.rounds, src.r9items)
  };
}
