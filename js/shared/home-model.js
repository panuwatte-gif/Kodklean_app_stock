// แปลงแถวดิบจากฐาน → ข้อมูลการ์ดของหน้าหลัก (ไฟล์นี้ไม่ยิงฐานเอง data.js เป็นคนดึงมาส่งให้)
import { STOCK_PHOTOS, STOCK_PHOTO_BY_GROUP, MENU_PHOTOS, PREP_ENTRY } from './config.js';
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
    id: m.id, name: m.name, photo: MENU_PHOTOS[m.id] || 'assets/r9/dish-kaprao.webp',
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

// ยอดขายเทียบเป้า: ยอดจริงจากตารางรายได้ประจำวัน (kk_daily_income ที่ฟ้า/แม่พันบันทึก) เทียบเป้ารายร้าน
// ยังไม่มีบันทึกของร้านไหน = null (แสดง "ยังไม่มีข้อมูล") ห้ามเดาเป็น 0 · ไม่ได้ตั้งเป้า = null เช่นกัน
function salesOf(brands, income, date) {
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
  return { through: dates.length ? dates[dates.length - 1] : date, updatedAt: dayLongTh(date), stores };
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
    sales: salesOf(src.brands, src.income, src.date),
    r9: r9Of(src.rounds, src.r9items)
  };
}
