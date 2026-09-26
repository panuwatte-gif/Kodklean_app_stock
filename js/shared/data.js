// ประตูข้อมูลบานเดียวของแอป — ทุกหน้าต้องเรียกผ่านไฟล์นี้เท่านั้น
// รอบนี้อ่านจาก mock_data.js ถ้าจะเปลี่ยนไปต่อฐานจริง แก้เฉพาะไฟล์นี้ หน้าจอไม่ต้องแก้
import { MOCK_DATA } from './mock_data.js';
import { dbGet, dbPost, dbPatch, dbPatchBack, dbInsertIgnore, dbUpsert, dbUpsertBack, dbUpsertCount, dbDelete, dbUpload, dbRemoveFile } from './db.js';
import { parseCfg, withFcCtx, advanceFormulas, prevOpenIso, nextOpenIso, dowIso, bkkIso, addDaysIso } from './fclab.js';
import { shiftIso } from './format.js';
import { buildHome } from './home-model.js';
import { meatUseRows } from './calc.js';
import { R9_VOID_STATUS, FC_SYNC_UI } from './config.js';
import { showSyncNote } from './sync-note.js';
import { buildForecast, dailyRowsOf, actualPatches } from './forecast.js';

// ข้อมูลที่อ่านจากฐานไม่ครบ (db.js แจ้งมา) → ขึ้นแถบเตือนพร้อมจำนวนที่ได้
if (typeof window !== 'undefined') window.addEventListener('kk:partial', e => {
  const d = e.detail || {};
  showSyncNote({ text: FC_SYNC_UI.partial.replace('{t}', d.table).replace('{got}', d.got).replace('{total}', d.total === null ? '?' : d.total), tone: 'warn' });
});

const STORE_KEY = 'kodklean.store.v1';

// เวอร์ชันของตารางตั้งต้นแต่ละชุด — ถ้าเลขไม่ตรงกับที่เคยบันทึกไว้ จะล้างของชุดนั้นเพื่อรับตารางใหม่
const SEED_VERSION = { rama9Items: 2, rama9Rounds: 2, rama9Draft: 2, rama9Cats: 2 };

// ล้างชุดข้อมูลที่ตารางตั้งต้นถูกแก้ใหม่
function migrate(store) {
  const seen = store.__seed || {};
  let changed = false;
  Object.keys(SEED_VERSION).forEach(key => {
    if (seen[key] === SEED_VERSION[key]) return;
    delete store[key];
    seen[key] = SEED_VERSION[key];
    changed = true;
  });
  if (changed) { store.__seed = seen; localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
  return store;
}

// อ่านข้อมูลทั้งก้อนขึ้นมาถือไว้ (ของที่แก้ไว้ทับของตั้งต้น)
// ข้อมูลที่เคยบันทึกไว้ยังชี้รูปเป็น .png — สลับให้เป็น .webp ตอนอ่าน เพื่อไม่ให้รูปเสีย
function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const fixed = raw.replace(/(assets\/[A-Za-z0-9_\/-]+)\.png/g, '$1.webp');
    if (fixed !== raw) localStorage.setItem(STORE_KEY, fixed);
    return migrate(JSON.parse(fixed) || {});
  } catch { return {}; }
}

// เขียนข้อมูลทั้งก้อนกลับลงที่เก็บ
function writeStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// คัดลอกข้อมูลออกมาให้หน้าจอ เพื่อไม่ให้หน้าจอแก้ของต้นฉบับโดยไม่ตั้งใจ
function copy(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// ขอข้อมูลไปแสดง เช่น get('staff') = รายชื่อพนักงานทั้งหมด
export function get(collection) {
  const store = readStore();
  return copy(store[collection] ?? MOCK_DATA[collection] ?? []);
}

// บันทึกข้อมูลทั้งชุดของหมวดนั้นทับของเดิม
export function save(collection, rows) {
  const store = readStore();
  store[collection] = copy(rows);
  writeStore(store);
  return get(collection);
}

// ---------- ข้อมูลจริงจากฐาน: หน้านับสต๊อก ----------

// วันที่ "วันนี้" ตามเวลาไทย (เก็บเป็น 2026-09-14) ให้ตรงกับวันที่ในฐาน
export function todayIso() {
  return bkkIso(Date.now());
}

// รายการที่ต้องนับ เฉพาะที่ยังเปิดใช้ (ปิดแล้วไม่ส่งมา) เรียงตามลำดับในฐาน
export const getCountItems = () =>
  dbGet('kk_count_item?active=eq.true&select=id,name,grp,unit,location,responsibility,ingredient_id,photo,sort_order&order=sort_order,id');

// ตัวเลขที่นับไว้ของวันนี้ + ธงยังไม่ได้นับ (ดึงจากวิวทีเดียวได้ครบ)
export const getStockToday = () =>
  dbGet('kk_view_stock_today?select=id,count_date,kitchen_qty,condo_qty,not_counted_yet,counted_by');

// งานไหนใครรับผิดชอบ (1 งานมีหลายคนได้)
export const getResponsibilities = () =>
  dbGet('kk_staff_responsibility?active=eq.true&select=responsibility,staff_code&order=sort_order');

// บันทึกผลนับผ่าน RPC kk_stock_counts_save ทีเดียวทุกรายการ (แก้ = แถวใหม่ rev+1 ของเก่าไม่หาย · กดซ้ำ key เดิม = ไม่เพิ่มแถว · ล็อกกันชนต่อรายการ)
export async function saveStockCounts(rows, date, staffCode) {
  if (!rows.length) return [];
  const num = v => (v === null || v === undefined || v === '' ? null : Number(v));
  await dbPost('rpc/kk_stock_counts_save', { p: {
    date, by: staffCode, key: `count:${date}:${crypto.randomUUID()}`,
    rows: rows.map(r => ({ id: r.id, kitchen: num(r.kitchen), condo: num(r.condo) }))
  } });
  return rows;
}

// เพิ่มรายการที่ต้องนับรายการใหม่ (ต่อท้ายหมวดนั้น)
export const addCountItem = row => dbPost('kk_count_item', [{ ...row, active: true }]);

// แก้รายการที่ต้องนับ: ชื่อ หมวด หน่วย ที่เก็บ งานที่รับผิดชอบ
export const saveCountItem = (id, changes) =>
  dbPatch(`kk_count_item?id=eq.${encodeURIComponent(id)}`, changes);

// ลบรายการทิ้ง = ปิดการใช้งาน (ผลนับเก่ายังอยู่ในฐาน ไม่หายไปด้วย)
export const removeCountItem = id =>
  dbPatch(`kk_count_item?id=eq.${encodeURIComponent(id)}`, { active: false });

// สลับตำแหน่งรายการสองรายการ (สลับเลขลำดับกัน)
export async function swapCountOrder(a, b) {
  await saveCountItem(a.id, { sort_order: b.sort_order });
  await saveCountItem(b.id, { sort_order: a.sort_order });
}

// แก้ไขข้อมูลรายการเดียวตาม id (ส่งมาแค่ช่องที่อยากเปลี่ยน)
export function revise(collection, id, changes) {
  const rows = get(collection);
  const index = rows.findIndex(row => row.id === id);
  if (index === -1) return null;
  rows[index] = { ...rows[index], ...copy(changes) };
  save(collection, rows);
  return rows[index];
}

// ---------- ข้อมูลจริงจากฐาน: หน้าเตรียม-เหลือ ----------

const enc = encodeURIComponent;

// กุญแจกันกดเบิ้ล สร้างใหม่ตอนกดบันทึกครั้งเดียว (ส่งซ้ำ key เดิม = ไม่เกิดแถวซ้ำ)
const idemKey = (t, id, date, type, seq) => `${t}:${id}:${date}:${type}:${seq}:${crypto.randomUUID()}`;

// รายการของหน้าเตรียม (รวมอัตราหุงข้าว)
export const getPrepItems = () =>
  dbGet('kk_count_item?active=eq.true&select=id,name,grp,unit,responsibility,cook_ratio,photo,sort_order&order=sort_order,id');

// บันทึกเตรียม/ข้าวของวันที่เลือก (เฉพาะค่าล่าสุด)
export const getPrepLogs = date =>
  dbGet(`kk_prep_log?log_date=eq.${date}&is_current=is.true&select=count_item_id,entry_type,seq,qty,rev_no,logged_by,edited_by`);

// บันทึกช่วงวัน (ใช้ทำสถิติย้อนหลัง)
export const getPrepLogRange = (from, to) =>
  dbGet(`kk_prep_log?log_date=gte.${from}&log_date=lte.${to}&is_current=is.true&select=count_item_id,log_date,entry_type,seq,qty&order=log_date,id`);

// ของเหลือของวันที่เลือก / ช่วงวัน (เฉพาะช่อง "เหลือ")
export const getLeftovers = date =>
  dbGet(`kk_cooked_leftover?left_date=eq.${date}&is_current=is.true&select=menu_id,entry_type,qty_box,rev_no,logged_by,edited_by`);
export const getLeftoverRange = (from, to) =>
  dbGet(`kk_cooked_leftover?left_date=gte.${from}&left_date=lte.${to}&is_current=is.true&entry_type=eq.${enc('เหลือ')}&select=menu_id,left_date,qty_box&order=left_date,id`);

// เมนูทั้งหมด (พร้อมค่าผูกเนื้อสัตว์)
export const getMenus = () =>
  dbGet('kk_menu?active=eq.true&select=id,name,protein_item_id,protein_ratio,photo,sort_order&order=sort_order,id');

// เพิ่มเมนูใหม่ต่อท้าย (ใช้ร่วมทุกหน้าที่มีรายการเมนู)
export const addMenu = row => dbPost('kk_menu', [{ active: true, protein_ratio: 1, ...row }]);

// ลบเมนู = ปิดการใช้งาน (บันทึกของเหลือเก่ายังอยู่ในฐาน)
export const removeMenu = id => dbPatch(`kk_menu?id=eq.${enc(id)}`, { active: false });

// สลับตำแหน่งเมนูสองรายการ (สลับเลขลำดับกัน)
export async function swapMenuOrder(a, b) {
  await saveMenuSetting(a.id, { sort_order: b.sort_order });
  await saveMenuSetting(b.id, { sort_order: a.sort_order });
}

// อัพรูป WebP (data URL ที่แปลงแล้ว) ขึ้นที่เก็บไฟล์ คืนลิงก์ถาวร
export async function uploadWebp(folder, id, dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  return dbUpload('item-images', `${folder}/${id}-${Date.now()}.webp`, blob, 'image/webp');
}

// ใส่รูปเมนู / ลบรูปเมนู (ลบแล้วกลับไปใช้รูปตั้งต้น)
export async function saveMenuPhoto(id, dataUrl) {
  const url = await uploadWebp('menu', id, dataUrl);
  await saveMenuSetting(id, { photo: url });
  return url;
}
export const clearMenuPhoto = id => saveMenuSetting(id, { photo: null });

// ค่าตั้งการคำนวณ (การ์ด Assumption)
export const getAssumptions = () => dbGet('kk_prep_assumption?select=key,value,label');

// ผลนับสต๊อกครัวกลางรอบๆ วันที่เลือก (±21 วัน ใช้โยงหักสต๊อก)
export const getStocksNear = date =>
  dbGet(`kk_stock_count?is_current=is.true&count_date=gte.${shiftIso(date, -21)}&count_date=lte.${shiftIso(date, 21)}&select=count_item_id,count_date,kitchen_qty&order=count_date,id`);

// รอบส่งพระราม 9 ที่เป็นค่าล่าสุดของวันเดียว (ใช้บวกกลับยอดใช้จริง)
const getR9RoundsOn = date =>
  dbGet(`kk_r9_round?is_current=is.true&date=eq.${date}&select=id,date,status,is_current,lines`);

// รายการส่งพระราม 9 ที่ต้องบวกกลับเข้ายอดใช้จริง (ยึดค่า deduct_from_use ในฐานเท่านั้น)
const getR9Deduct = () =>
  dbGet('kk_r9_item?deduct_from_use=is.true&select=id,name,count_item_id,deduct_from_use,kg_per_unit');

// ชุดข้อมูลขั้นต่ำสำหรับคิดยอดใช้จริงของวันเดียว (วันนั้น + อาหารเหลือของวันเปิดก่อนหน้า + พระราม 9 ของวันนั้น) — อ่านใหม่จากฐานทุกครั้ง
async function getUseBundle(date) {
  const prevDate = prevOpenIso(date);
  const [items, logs, leftovers, leftPrev, menus, assumptions, r9Rounds, r9Items] = await Promise.all([
    getPrepItems(), getPrepLogs(date), getLeftovers(date), getLeftovers(prevDate), getMenus(), getAssumptions(), getR9RoundsOn(date), getR9Deduct()
  ]);
  return { date, prevDate, items, logs, leftovers, leftPrev, menus, assumptions, r9Rounds, r9Items, r9VoidStatus: R9_VOID_STATUS };
}

// โหลดข้อมูลทั้งหน้าของวันเดียวในครั้งเดียว (รวมกฎการทดสอบ + ประวัติพยากรณ์ + สูตรที่ผูก เพื่อให้ทุกหน้าคำนวณด้วยเอนจินเดียวกัน)
export async function getPrepBundle(date) {
  const prevDate = prevOpenIso(date);
  const [items, logs, logs7, logsFc, leftovers, left7, menus, assumptions, resp, stocks, cfg, staff, assigns, leftPrev, r9Rounds, r9Items, history, map, formulas, trials] = await Promise.all([
    getPrepItems(), getPrepLogs(date), getPrepLogRange(shiftIso(date, -6), date), getPrepLogRange(shiftIso(date, -84), shiftIso(date, -1)),
    getLeftovers(date), getLeftoverRange(shiftIso(date, -6), date),
    getMenus(), getAssumptions(), getResponsibilities(), getStocksNear(date), getFcRules(), getStaff(), getAssigns(),
    getLeftovers(prevDate), getR9RoundsOn(date), getR9Deduct(), getFcHistory(), getFcModelMap(), getFcFormulas(), getFcTrials()
  ]);
  const b = { date, prevDate, items, logs, logs7, logsFc, leftovers, left7, leftPrev, menus, assumptions, resp, stocks, cfg, staff, assigns, r9Rounds, r9Items, r9VoidStatus: R9_VOID_STATUS };
  withFcCtx(cfg, { history, map, formulas, trials });
  // คงเหลือใช้ต่อของอาหารปรุงสำเร็จวันเปิดก่อนหน้า (แปลงเป็นเนื้อสัตว์ด้วย calc.js) แนบไปกับบันทึกย้อนหลัง ให้ carryOver รวมเป็นของที่ยกมา
  const kg = {}, missing = {};
  meatUseRows(b, R9_VOID_STATUS).rows.forEach(({ row }) => { kg[row.id] = row.carry; if (row.carryMissing) missing[row.id] = true; });
  Object.defineProperty(logsFc, '__cooked', { value: { before: date, prevDate, kg, missing }, enumerable: false });
  return b;
}

// วันล่าสุดก่อนวันที่เลือกที่มีการกรอกช่องนั้น (ใช้กับปุ่มคัดลอกจากวันก่อนหน้า)
export const getLastPrepDateBefore = (date, type) =>
  dbGet(`kk_prep_log?log_date=lt.${date}&entry_type=eq.${enc(type)}&is_current=is.true&qty=not.is.null&select=log_date&order=log_date.desc&limit=1`).then(r => (r[0] || {}).log_date || null);

// บันทึก 1 ช่องของแท็บเตรียม/ข้าว แบบเพิ่มแถวใหม่ (แก้ = rev_no+1 ของเก่าไม่หาย ทำครบในคำสั่งเดียวฝั่งฐาน)
export async function savePrep({ item, date, type, seq = 1, qty, by }) {
  const r = await dbPost('rpc/kk_prep_save', { p_item: item, p_date: date, p_type: type, p_seq: seq, p_qty: qty, p_by: by, p_key: idemKey('prep', item, date, type, seq) });
  queueSync(date);
  return r;
}

// บันทึก 1 ช่องของแท็บอาหารเหลือ (กติกาเดียวกัน)
// (คงเหลือใช้ต่อของวันนี้กระทบยอดใช้จริงของวันเปิดถัดไป จึงอัปเดตประวัติทั้งสองวัน)
export async function saveLeft({ menu, date, type, qty, by }) {
  const r = await dbPost('rpc/kk_left_save', { p_menu: menu, p_date: date, p_type: type, p_qty: qty, p_by: by, p_key: idemKey('left', menu, date, type, 1) });
  queueSync(date);
  queueSync(nextOpenIso(date));
  return r;
}

// ประวัติการแก้ของช่องเดียว (ทุกครั้ง เรียงใหม่สุดขึ้นก่อน)
export const getPrepHistory = (item, date, type, seq = 1) =>
  dbGet(`kk_prep_log?count_item_id=eq.${enc(item)}&log_date=eq.${date}&entry_type=eq.${enc(type)}&seq=eq.${seq}&select=qty,rev_no,logged_by,edited_by,created_at,is_current&order=rev_no.desc`);
export const getLeftHistory = (menu, date, type) =>
  dbGet(`kk_cooked_leftover?menu_id=eq.${enc(menu)}&left_date=eq.${date}&entry_type=eq.${enc(type)}&select=qty_box,rev_no,logged_by,edited_by,created_at,is_current&order=rev_no.desc`);

// ค่าตั้ง: เมนู (เนื้อสัตว์/อัตราส่วน) / อัตราหุงข้าว / ค่า Assumption — เป็นค่าตั้ง ไม่ใช่บันทึกรายวัน จึงแก้ทับได้
export const saveMenuSetting = (id, changes) => dbPatch(`kk_menu?id=eq.${enc(id)}`, changes);
export const saveCookRatio = (id, ratio) => dbPatch(`kk_count_item?id=eq.${enc(id)}`, { cook_ratio: ratio });
export const saveAssumption = (key, value, by) =>
  dbPatch(`kk_prep_assumption?key=eq.${enc(key)}`, { value, updated_by: by, updated_at: new Date().toISOString() });

// ---------- ข้อมูลจริงจากฐาน: ห้องทดสอบสูตรพยากรณ์ (หน้าสมการ Forecast) ----------

// กฎการทดสอบทั้ง 27 ค่า (ทุกหน้าที่คำนวณต้องอ่านจากที่นี่ ห้าม hardcode)
export const getFcConfig = () =>
  dbGet('kk_forecast_config?select=config_key,value_num,value_text,label_th,group_th,unit_th,min_num,max_num,help_th,default_num,default_text&order=id');
export const saveFcConfig = (key, changes) =>
  dbPatch(`kk_forecast_config?config_key=eq.${enc(key)}`, { ...changes, updated_at: new Date().toISOString() });

// กฎที่แปลงเป็นค่าใช้งานแล้ว (ทุกหน้าที่คำนวณเรียกตัวนี้)
export const getFcRules = () => getFcConfig().then(parseCfg);

// คลังสูตรทั้งหมด / แก้สถานะ / เพิ่มสูตรใหม่
export const getFcFormulas = () =>
  dbGet('kk_forecast_formula?select=formula_code,name_th,family,equation_th,params,status,tags,source,parent_code,note,best_regime,times_tested,last_verdict,updated_at&order=id');
export const addFcFormulas = rows => dbPost('kk_forecast_formula', rows);
export const saveFcFormula = (code, changes) =>
  dbPatch(`kk_forecast_formula?formula_code=eq.${enc(code)}`, { ...changes, updated_at: new Date().toISOString() });

// นับรอบทดสอบ + ผลล่าสุดของหลายสูตรในคำขอเดียว (ทับเฉพาะช่องที่ส่งไป)
export const bumpFcFormulas = rows =>
  dbUpsert('kk_forecast_formula?on_conflict=formula_code', rows.map(r => ({ ...r, updated_at: new Date().toISOString() })));

// ข้อมูลใช้จริงย้อนหลังของทุกวัตถุดิบ (ใช้เป็นสนามทดสอบและพยากรณ์) — db.js อ่านต่อทีละหน้าจนครบเอง
// (อ่านจากวิว kk_view_forecast_history เท่านั้น = import ถึง 5 ก.ย. + บันทึกเตรียมจริงหลังจากนั้น · ห้ามอ่านตารางตรง)
const FC_HIST = 'kk_view_forecast_history';
// ยอดใช้จริงติดลบ (เตรียมน้อยกว่าคงเหลือ = กรอกผิด) ไม่ใช่ข้อมูลจริง → ตัดเป็นว่าง ติดธง actual_missing เหมือนที่แอปเคยทำตอนเขียนประวัติ
const cleanHist = rows => rows.map(r => (r.used_kg !== null && Number(r.used_kg) < 0 ? { ...r, used_kg: null, flag: 'actual_missing' } : r));
export const getFcHistory = () =>
  dbGet(FC_HIST + '?select=use_date,item_id,used_kg,theo_kg,dow_num,flag,source&order=use_date,item_id').then(cleanHist);

// วันล่าสุดที่มีในประวัติพยากรณ์ (ใช้กับปุ่มเติมประวัติย้อนหลัง)
export const getHistoryLastDate = () =>
  dbGet(FC_HIST + '?select=use_date&order=use_date.desc&limit=1').then(r => (r[0] || {}).use_date || null);

// แถวประวัติของวันที่ระบุ (ใช้ตรวจชนก่อนนำเข้า)
export const getHistoryOn = dates =>
  dates.length ? dbGet(`${FC_HIST}?use_date=in.(${dates.join(',')})&select=use_date,item_id,source&order=use_date,item_id`) : Promise.resolve([]);

// นำเข้าประวัติย้อนหลังจากแอปเก่า (source = manual_import) — คืนจำนวนที่เขียนสำเร็จจริงจากฐาน
export async function importHistory(rows) {
  if (!rows.length) return 0;
  const done = await dbUpsertCount('kk_forecast_history?on_conflict=use_date,item_id', rows.map(r => ({ ...r, source: 'manual_import' })));
  return Array.isArray(done) ? done.length : 0;
}

// รหัสวัตถุดิบทั้งหมดใน kk_count_item (ใช้ตรวจข้อมูลนำเข้า)
export const getCountItemIds = () => dbGet('kk_count_item?select=id,name,grp&order=id');

// ---------- เติม kk_forecast_history จากบันทึกจริงของแอป (source = app_live) ----------

const SYNC_BAD = ['anomaly_excluded', 'actual_missing', 'no_prep_record', 'incomplete'];
const medianOf = a => { const x = [...a].sort((p, q) => p - q), m = x.length >> 1; return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2; };

// คิดยอดใช้จริงของวันนั้นด้วย prepUse (ผ่าน meatUseRows ใน calc.js) แล้วเขียนลงประวัติพยากรณ์ — ไม่คิดสูตรเองในนี้
export async function syncHistoryFromPrep(date) {
  const b = await getUseBundle(date);
  if (!(b.logs || []).length) return { date, written: 0, skipOld: [], anomaly: [], negative: [], incomplete: [], noData: true };
  const [map, existing, past] = await Promise.all([
    getFcModelMap(),
    dbGet(`${FC_HIST}?use_date=eq.${date}&select=item_id,source`),
    dbGet(`${FC_HIST}?use_date=lt.${date}&use_date=gte.${addDaysIso(date, -60)}&used_kg=not.is.null&select=item_id,use_date,used_kg,dow_num,flag&order=use_date.desc,item_id`)
  ]);
  const inMap = new Set(map.map(m => m.item_id));
  const old = {};
  existing.forEach(e => { old[e.item_id] = e.source || 'cleaned_v2'; });
  const res = { date, written: 0, skipOld: [], anomaly: [], negative: [], incomplete: [] }, out = [];
  meatUseRows(b, b.r9VoidStatus).rows.forEach(({ row }) => {
    if (!inMap.has(row.id)) return;
    if (old[row.id] && !['app_live', 'kk_prep_log'].includes(old[row.id])) { res.skipOld.push(row.name); return; }
    let used = row.use, flag = 'ok';
    if (used === null) { flag = 'incomplete'; res.incomplete.push({ name: row.name, why: row.useWhy }); }
    else if (used < 0) { used = null; flag = 'actual_missing'; res.negative.push(row.name); }
    else {
      const ref = past.filter(p => p.item_id === row.id && Number(p.dow_num) !== 0 && !SYNC_BAD.includes(p.flag)).slice(0, 28).map(p => Number(p.used_kg));
      if (ref.length >= 10) {
        const md = medianOf(ref);
        if (md > 0 && used > 5 * md) { used = null; flag = 'actual_missing'; res.anomaly.push(row.name); }
      }
    }
    out.push({ use_date: date, item_id: row.id, used_kg: used, theo_kg: null, dow_num: dowIso(date), flag, source: 'app_live' });
  });
  // ไม่เขียนลง kk_forecast_history แล้ว (ตารางอ่านอย่างเดียว) — วิวคิดยอดใช้จริงจาก kk_prep_log ให้เอง ฟังก์ชันนี้เหลือหน้าที่ตรวจเตือนข้อมูลผิดปกติ
  res.written = out.length;
  return res;
}

// แจ้งบนจอเมื่อมีรายการที่ข้าม/ตัดออก
function reportSync(r) {
  const T = FC_SYNC_UI, parts = [];
  if (r.skipOld.length) parts.push(T.skipOld.replace('{d}', r.date).replace('{names}', r.skipOld.join(', ')));
  if (r.anomaly.length) parts.push(T.anomaly.replace('{d}', r.date).replace('{names}', r.anomaly.join(', ')));
  if (r.negative.length) parts.push(T.negative.replace('{d}', r.date).replace('{names}', r.negative.join(', ')));
  if (parts.length) showSyncNote({ text: parts.join(' · '), tone: 'info' });
}

// คิวอัปเดตประวัติทีละวัน ต่อแถวกัน (บันทึกถี่ๆ = รอบหลังอ่านข้อมูลล่าสุดใหม่แล้วเขียนทับทีหลังเสมอ) · ล้มเหลว = ขึ้นแถบเตือนพร้อมปุ่มลองใหม่ การบันทึกหลักไม่ย้อน
const syncChain = {};
function queueSync(date) {
  if (!date) return Promise.resolve();
  const run = () => syncHistoryFromPrep(date).then(reportSync, () => {
    showSyncNote({ text: `${FC_SYNC_UI.fail} (${date})`, tone: 'warn', retry: () => queueSync(date) });
  });
  syncChain[date] = (syncChain[date] || Promise.resolve()).then(run, run);
  return syncChain[date];
}

// สูตรที่ใช้จริงต่อวัตถุดิบ + ตั้งสูตรใช้จริงตัวใหม่
export const getFcModelMap = () =>
  dbGet('kk_forecast_model_map?select=item_id,item_name_th,model_type,formula_code,band_type,band_value,fixed_kg,backtest_win,forward_win,note,active,updated_at&order=id');
export const setFcLiveModel = row =>
  dbUpsert('kk_forecast_model_map?on_conflict=item_id', [{ ...row, updated_at: new Date().toISOString() }]);

// เปลี่ยนสูตรใช้จริงของวัตถุดิบ แบบกันชน: เขียนได้เฉพาะเมื่อ updated_at ในฐานยังตรงกับที่อ่านมา (คืน false = มีคนแก้ก่อน ต้องโหลดใหม่)
export async function setFcModelSafe(itemId, readAt, changes) {
  const cur = await dbGet(`kk_forecast_model_map?item_id=eq.${enc(itemId)}&select=updated_at&limit=1`);
  if (!cur.length || cur[0].updated_at !== readAt) return false;
  const done = await dbPatchBack(`kk_forecast_model_map?item_id=eq.${enc(itemId)}&updated_at=eq.${enc(readAt)}`, { ...changes, updated_at: new Date().toISOString() });
  return Array.isArray(done) && done.length > 0;
}

// ---------- ผลพยากรณ์ใช้จริง (kk_forecast_daily) ----------

// ผลพยากรณ์ใช้จริงทั้งหมดของชุด scenario
export const getFcDaily = scenario =>
  dbGet(`kk_forecast_daily?scenario_code=eq.${enc(scenario)}&select=id,forecast_date,scenario_code,item_id,forecast_kg,lower_kg,upper_kg,sd_kg,n_history,actual_kg,hit,loss_kg&order=forecast_date,item_id,id`);

// เพิ่มผลพยากรณ์ของวัน — แถวที่มีอยู่แล้วไม่ถูกแตะ (คืนแถวที่เพิ่มได้จริง)
export const addFcDaily = rows => (rows.length ? dbInsertIgnore('kk_forecast_daily?on_conflict=forecast_date,scenario_code,item_id', rows) : Promise.resolve([]));

// เติม/แก้เฉพาะผลจริงของแถว (actual_kg hit loss_kg) ห้ามแก้ค่าพยากรณ์
export const patchFcDailyActual = p => dbPatch(`kk_forecast_daily?id=eq.${p.id}`, { actual_kg: p.actual_kg, hit: p.hit, loss_kg: p.loss_kg });

// บันทึกผลพยากรณ์ของวันนั้นลง kk_forecast_daily (แถวที่มีแล้วไม่ถูกแตะ) — คืน { added, noBand }
export async function recordFcDaily(fc, date, scenario = 'S1') {
  const { rows, noBand } = dailyRowsOf(fc, date, scenario);
  const added = await addFcDaily(rows);
  return { added: added || [], noBand };
}

// อ่านผลพยากรณ์ใช้จริงทั้งหมด แล้วเติม/แก้ผลจริง (ใช้จริง/แม่นไหม/พลาดกี่กก.) จากประวัติใช้จริงก่อนส่งกลับ
export async function refreshFcDaily(cfg, scenario = 'S1') {
  let daily = await getFcDaily(scenario);
  if (!daily.length) return daily;
  const dates = daily.map(x => x.forecast_date).sort();
  const hist = await getHistoryRange(dates[0], dates[dates.length - 1]);
  const patches = actualPatches(daily, hist, cfg);
  await Promise.all(patches.map(patchFcDailyActual));
  const byId = {};
  patches.forEach(p => { byId[p.id] = p; });
  return daily.map(x => (byId[x.id] ? { ...x, ...byId[x.id] } : x));
}

// ประวัติใช้จริงของช่วงวัน (ใช้เติมผลจริง)
export const getHistoryRange = (from, to) =>
  dbGet(`${FC_HIST}?use_date=gte.${from}&use_date=lte.${to}&select=use_date,item_id,used_kg,flag&order=use_date,item_id`).then(cleanHist);

// ผลการทดสอบ (1 แถวต่อ สูตร×วัตถุดิบ×กรอบ — ทดสอบซ้ำจะทับแถวเดิม)
export const getFcTrials = () =>
  dbGet('kk_forecast_trial?select=id,formula_code,item_id,band_type,band_value,period_from,period_to,regime,n,win_rate,loss_min_kg,loss_avg_kg,loss_max_kg,loss_sum_kg,loss_avg_baht,verdict,verdict_reason,tested_at&order=tested_at.desc,id');
export const saveFcTrials = rows =>
  dbUpsert('kk_forecast_trial?on_conflict=formula_code,item_id,band_type,band_value,period_from,period_to', rows);

// ป้ายสถานการณ์ของวัตถุดิบตามช่วงเวลา
export const addFcRegime = rows => dbPost('kk_forecast_regime', rows);

// ราคาต่อกิโลของแต่ละรายการ (kk_count_item ผูกกับราคาวัตถุดิบ — ไม่มีราคาในฐาน = คืน null ห้ามเดา)
export async function getFcPrices() {
  const [items, ings] = await Promise.all([
    dbGet('kk_count_item?select=id,name,grp,ingredient_id&order=id'),
    dbGet('kk_ingredient?select=id,price_per_kg&order=id')
  ]);
  const byIng = {};
  ings.forEach(i => { byIng[i.id] = i.price_per_kg === null ? null : Number(i.price_per_kg); });
  const out = {};
  items.forEach(i => { out[i.id] = { name: i.name, grp: i.grp, price: i.ingredient_id ? byIng[i.ingredient_id] ?? null : null }; });
  return out;
}

// โหลดของหน้าสมการ Forecast ทั้งหน้าในครั้งเดียว (cfgRows = ค่าดิบพร้อมป้ายกำกับ · cfg = กฎที่แปลงเป็นค่าใช้งาน)
export async function getFcBundle() {
  const [cfgRows, formulas, history, map, trials, prices] = await Promise.all([
    getFcConfig(), getFcFormulas(), getFcHistory(), getFcModelMap(), getFcTrials(), getFcPrices()
  ]);
  return { cfgRows, cfg: withFcCtx(parseCfg(cfgRows), { history, map, formulas, trials }), formulas, history, map, trials, prices };
}

// ---------- ข้อมูลจริงจากฐาน: หน้าพระราม 9 (ส่งของไปสาขา) ----------

// แปลงแถวจากฐาน → รูปแบบที่หน้าจอและ calc.js ใช้ (ราคายังไม่ตั้ง = null ห้ามแปลงเป็น 0)
const numOrNull = v => (v === null || v === undefined || v === '' ? null : Number(v));
const toR9Item = r => ({
  id: r.id, name: r.name, cat: r.cat_id, unit: r.unit, price: numOrNull(r.price), photo: r.photo,
  kind: r.kind, sortOrder: r.sort_order, active: r.active, used: Number(r.used_rounds) || 0, qty: 0
});
const toR9Round = r => ({
  id: r.id, no: r.no, date: r.date, time: r.time, status: r.status, fee: Number(r.fee) || 0, note: r.note || '',
  rev: r.rev_no, rootId: r.root_id, sentBy: r.sent_by, editedBy: r.edited_by, createdAt: r.created_at,
  lines: (r.lines || []).map(l => ({ id: l.id, qty: Number(l.qty), price: numOrNull(l.price) }))
});

// หมวดสินค้า (ส่งมาทั้งที่ปิดไว้ เพื่อให้หน้าตั้งค่าเปิดกลับได้)
export const getR9Cats = () =>
  dbGet('kk_rama9_cat?select=id,label,icon,color,tint,sort_order,active&order=sort_order');

// รายการสินค้า + จำนวนรอบที่เคยถูกส่ง (ฐานนับมาให้จากวิว หน้าจอไม่ต้องนับเอง)
export const getR9Items = () =>
  dbGet('kk_r9_item?select=id,name,cat_id,unit,price,photo,kind,note,sort_order,active,used_rounds&order=sort_order,id');

// รอบส่งที่เป็นค่าล่าสุด (แถวที่ถูกแก้ไปแล้วไม่ส่งมา จึงไม่มียอดเบิ้ล)
export const getR9Rounds = () =>
  dbGet('kk_r9_round?is_current=is.true&select=id,no,root_id,date,time,status,fee,note,sent_by,edited_by,rev_no,created_at,lines&order=date,created_at,id');

// ทุกครั้งที่แก้ของรอบนั้น ใหม่→เก่า (ดูได้ว่าเดิมเท่าไหร่ ใครแก้ เมื่อไหร่)
export const getR9Revisions = rootId =>
  dbGet(`kk_r9_round?root_id=eq.${rootId}&select=id,no,date,fee,note,sent_by,edited_by,rev_no,is_current,created_at,lines&order=rev_no.desc`);

// โหลดข้อมูลทั้งหน้าพระราม 9 ในครั้งเดียว
export async function getR9Bundle() {
  const [cats, items, rounds] = await Promise.all([getR9Cats(), getR9Items(), getR9Rounds()]);
  return { cats, items: items.map(toR9Item), rounds: rounds.map(toR9Round) };
}

// กุญแจกันกดเบิ้ล — สร้างครั้งเดียวตอนกดปุ่ม ส่งซ้ำกุญแจเดิม = ไม่เกิดรอบใหม่
export const newR9Key = date => `r9:${date}:${crypto.randomUUID()}`;

// บันทึกรอบส่ง 1 รอบ (หัวรอบ + รายการ ในคำสั่งเดียวฝั่งฐาน) · ส่ง replaces = แก้รอบเก่าแบบไม่ทับของเดิม
// วันที่ของรอบส่ง (ใช้อัปเดตประวัติพยากรณ์ของวันนั้นหลังแก้/ยกเลิก)
const r9DateOf = id => dbGet(`kk_r9_round?id=eq.${id}&select=date`).then(r => (r[0] || {}).date || null).catch(() => null);

export async function saveR9Round({ date, fee, note, by, lines, key, replaces = null }) {
  const oldDate = replaces ? await r9DateOf(replaces) : null;
  const r = await dbPost('rpc/kk_r9_save', { p_date: date, p_fee: fee, p_note: note, p_by: by, p_lines: lines, p_key: key, p_replaces: replaces });
  queueSync(date);
  if (oldDate && oldDate !== date) queueSync(oldDate);
  return r;
}

// ลบรอบส่ง = ปิดไม่ให้นับ (ของเก่ายังอยู่ในฐาน)
export async function voidR9Round(id, by) {
  const date = await r9DateOf(id);
  const r = await dbPost('rpc/kk_r9_void', { p_id: id, p_by: by });
  queueSync(date);
  return r;
}

// หน้าตั้งค่ารายการ: เพิ่ม / แก้ / ลบ / เปิด-ปิด / ย้ายหมวด (ราคาตั้งต้นเป็นค่าตั้ง แก้ทับได้)
export const addR9Item = row => dbPost('kk_rama9_item', [{ active: true, ...row }]);
export const saveR9Item = (id, changes) =>
  dbPatch(`kk_rama9_item?id=eq.${enc(id)}`, { ...changes, updated_at: new Date().toISOString() });
export const removeR9Item = id => dbDelete(`kk_rama9_item?id=eq.${enc(id)}`);
export const setR9CatActive = (catId, active) => dbPatch(`kk_rama9_cat?id=eq.${enc(catId)}`, { active });
export const setR9ItemsActive = (catId, active) => dbPatch(`kk_rama9_item?cat_id=eq.${enc(catId)}`, { active });
export const moveR9Items = (ids, catId) =>
  dbPatch(`kk_rama9_item?id=in.(${ids.map(enc).join(',')})`, { cat_id: catId });
export const addR9Cat = row => dbPost('kk_rama9_cat', [{ active: true, ...row }]);

// ---------- บัญชีพนักงาน: PIN เก็บที่ฐานเดียวกับเกม ทุกเครื่องจึงเห็นรหัสตรงกัน ----------

// รายชื่อบัญชีพร้อม PIN ล่าสุดจากฐาน (staff_code = รหัสพนักงานใน kk_staff ของบัญชีนั้น)
export const getAccounts = () =>
  dbGet('game_users?select=emp_code,pin,name_th,role,staff_code,asset_folder&order=emp_code');

// เปลี่ยน PIN ของบัญชีหนึ่งลงฐาน (ทุกเครื่องเห็นผลทันทีที่เปิดแอปรอบถัดไป)
export const saveAccountPin = (code, pin) =>
  dbPatch(`game_users?emp_code=eq.${enc(code)}`, { pin: String(pin) });

// เพิ่มบัญชีใหม่ลงฐาน (ทุกเครื่องและเกมหมู่บ้านเห็นบัญชีเดียวกัน)
export const addAccount = row => dbPost('game_users', [row]);

// ลบบัญชีออกจากฐาน
export const removeAccount = code => dbDelete(`game_users?emp_code=eq.${enc(code)}`);

// ร่างที่กำลังกรอกของรอบนี้ (เก็บในเครื่อง ยังไม่ขึ้นฐานจนกดบันทึก)
export function getR9Draft() {
  const store = readStore();
  return copy(store.r9Draft) || { date: '', qty: {}, price: {}, fee: '', note: '', editing: null, key: null };
}
export function saveR9Draft(draft) {
  const store = readStore();
  store.r9Draft = copy(draft);
  writeStore(store);
  return getR9Draft();
}

// ---------- พนักงาน (ตาราง kk_staff — ใช้ร่วมกันทุกหน้าที่มีรายชื่อคน) ----------

// รายชื่อพนักงานทั้งหมดที่ยังไม่ถูกลบ (frozen = พักงานชั่วคราว ยังอยู่ในระบบ)
export const getStaff = () =>
  dbGet('kk_staff?active=eq.true&select=code,name,role,avatar,sort_order,frozen&order=sort_order,code');

// เพิ่มพนักงานใหม่ต่อท้ายรายชื่อ
export const addStaff = row => dbPost('kk_staff', [{ ...row, active: true, frozen: false }]);

// แก้ชื่อ/สิทธิ์/รูป หรือสั่งพักงาน-เลิกพักงาน
export const saveStaff = (code, changes) =>
  dbPatch(`kk_staff?code=eq.${enc(code)}`, { ...changes, updated_at: new Date().toISOString() });

// ลบพนักงาน = ปิดการใช้งาน (ประวัติงานเก่ายังอยู่ในฐาน)
export const removeStaff = code => saveStaff(code, { active: false });

// งานประจำของแต่ละคน (ตาราง kk_staff_responsibility — ใช้ในหน้าหลักและหน้าเตรียม)
export const getStaffDuties = () =>
  dbGet('kk_staff_responsibility?active=eq.true&select=staff_code,responsibility,sort_order&order=sort_order');

// ---------- แบ่งงาน (ตาราง kk_task_assign — ใครรับผิดชอบงานอะไร) ----------

// งานที่มอบหมายไว้ทั้งหมด (1 เป้าหมายมีหลายคนได้)
export const getAssigns = () =>
  dbGet('kk_task_assign?active=eq.true&select=task,target_type,target_id,staff_code');

// ติ๊กเลือก/ยกเลิกคนรับผิดชอบ 1 เป้าหมาย (เป้าหมาย = รายการเดียว หรือทั้งหมวด)
export function setAssign({ task, targetType, targetId, staffCode, on, by }) {
  const q = `kk_task_assign?task=eq.${enc(task)}&target_type=eq.${enc(targetType)}&target_id=eq.${enc(targetId)}&staff_code=eq.${enc(staffCode)}`;
  if (!on) return dbDelete(q);
  return dbUpsert('kk_task_assign?on_conflict=task,target_type,target_id,staff_code',
    [{ task, target_type: targetType, target_id: targetId, staff_code: staffCode, active: true, assigned_by: by || null }]);
}

// ล้างงานที่คนนี้รับผิดชอบทั้งหมด (ใช้เมื่อลาออกหรือถูกพักงาน — งานจะกลายเป็นยังไม่มีคนรับ)
export const clearAssignsOf = code => dbDelete(`kk_task_assign?staff_code=eq.${enc(code)}`);

// ปิดหน้าที่เดิมของคนนี้ในตารางหน้าที่ประจำ (ลาออก/พักงานแล้ว ชื่อจะไม่โผล่เป็นผู้รับผิดชอบที่ไหนอีก)
export const clearDutiesOf = code =>
  dbPatch(`kk_staff_responsibility?staff_code=eq.${enc(code)}`, { active: false });

// ---------- ข้อมูลจริงจากฐาน: หน้าหลัก (Dashboard) ----------

// ประกาศบนหน้าหลัก (ตาราง kk_home_notice — แก้ข้อความได้ที่ฐาน ไม่ต้องแก้โค้ด)
export const getHomeNotices = () =>
  dbGet('kk_home_notice?active=eq.true&select=id,text,tone,character,icon,sort_order&order=sort_order');

// แก้ข้อความประกาศ 1 ใบ (ทุกเครื่องเห็นข้อความใหม่ทันทีที่เปิดหน้าหลัก)
export const saveHomeNotice = (id, text) => dbPatch(`kk_home_notice?id=eq.${enc(id)}`, { text });

// เป้ายอดขายรวมต่อวัน (ตาราง kk_sales_target · ไม่มีแถว = ยังไม่ตั้งเป้า)
export const getSalesTarget = () =>
  dbGet('kk_sales_target?target_key=eq.all&select=daily_amount,updated_by,updated_at&limit=1').then(r => (r[0] ? Number(r[0].daily_amount) : null));

// ตั้งเป้ายอดขายรวมต่อวัน (เจ้าของกดตั้งจากการ์ดยอดขายหน้าหลัก)
export const saveSalesTarget = (amount, by) =>
  dbUpsert('kk_sales_target?on_conflict=target_key', [{ target_key: 'all', daily_amount: amount, updated_by: by || null, updated_at: new Date().toISOString() }]);

// ของที่ทิ้งจริงในช่วงวัน: วัตถุดิบดิบ (kk_prep_log "ทิ้ง" กก.) + อาหารปรุงสำเร็จ (kk_cooked_leftover "ทิ้ง" กรัม) — ใช้คิดต้นทุนของทิ้ง
export async function getWasteRange(from, to) {
  const t = enc('ทิ้ง');
  const [raw, cooked] = await Promise.all([
    dbGet(`kk_prep_log?log_date=gte.${from}&log_date=lte.${to}&is_current=is.true&entry_type=eq.${t}&qty=not.is.null&select=count_item_id,log_date,qty&order=log_date,id`),
    dbGet(`kk_cooked_leftover?left_date=gte.${from}&left_date=lte.${to}&is_current=is.true&entry_type=eq.${t}&qty_box=not.is.null&select=menu_id,left_date,qty_box&order=left_date,id`)
  ]);
  return { raw, cooked };
}

// บันทึกใช้จริงย้อนหลังตั้งแต่วันที่กำหนด (ใช้ทั้งกราฟใช้ไปและการพยากรณ์)
export const getUseHistoryFrom = from =>
  dbGet(`${FC_HIST}?use_date=gte.${from}&select=use_date,item_id,used_kg,theo_kg,dow_num,flag,source&order=use_date,item_id`).then(cleanHist);

// ของเหลือ/ของทิ้งรายเมนูในช่วงวัน (ทุกประเภทแถว ไม่เฉพาะ "เหลือ")
export const getLeftoverAll = (from, to) =>
  dbGet(`kk_cooked_leftover?left_date=gte.${from}&left_date=lte.${to}&is_current=is.true&select=menu_id,left_date,entry_type,qty_box`);

// โหลดข้อมูลหน้าหลักทั้งหน้าในครั้งเดียว แล้วแปลงเป็นข้อมูลการ์ดด้วย home-model.js
export async function getHomeBundle(date) {
  const d = date || todayIso();
  const prevStart = shiftIso(d.slice(0, 7) + '-01', -1).slice(0, 7) + '-01';   // วันที่ 1 ของเดือนก่อน (เทียบต้นทุนของทิ้ง)
  const [notices, history, items, menus, left, rounds, r9items, map, formulas, cfg, staff, duties, assigns, brands, income, trials, target, waste, prices] = await Promise.all([
    getHomeNotices(), getFcHistory(), getPrepItems(), getMenus(),
    getLeftoverAll(shiftIso(d, -37), d), getR9Rounds(), getR9Items(),
    getFcModelMap(), getFcFormulas(), getFcRules(), getStaff(), getStaffDuties(), getAssigns(),
    getIncomeBrands(), getIncomeHistory(d.slice(0, 7) + '-01', d), getFcTrials(),
    getSalesTarget().catch(() => null), getWasteRange(prevStart, d), getFcPrices()
  ]);
  // ประวัติชุดเดียวกับหน้าพยากรณ์ + สูตรยอดขายบังคับโหมดล่วงหน้า + สูตรที่ใช้จริง (รวมสูตรสำรอง) ของพรุ่งนี้ → ค่าพยากรณ์ตรงกับหน้าเตรียม-เหลือ
  withFcCtx(cfg, { history, map, formulas, trials });
  const fc = buildForecast(items, [], shiftIso(d, 1), cfg);
  const used = map.map(m => {
    const r = fc.rows.find(x => x.id === m.item_id);
    if (!r) return m;
    if (r.fc === null) return { ...m, model_type: 'fixed', fixed_kg: null };
    return m.model_type === 'fixed' ? m : { ...m, formula_code: r.usedCode };
  });
  return buildHome({ date: d, notices, history, items, menus, left, rounds: rounds.map(toR9Round), r9items, map: used, formulas: advanceFormulas(formulas), cfg, staff, duties, assigns, brands, income, target, waste, prices, fcRows: fc.rows });
}

// ---------- รูปของรายการนับสต๊อก (เก็บที่ฐาน+ที่เก็บไฟล์ ทุกหน้าเห็นรูปเดียวกัน) ----------
// อัพรูป WebP ขึ้นที่เก็บไฟล์ แล้วจำลิงก์ไว้ในตารางรายการ
export async function saveCountPhoto(id, blob) {
  const path = `count-item/${id}-${Date.now()}.webp`;
  const url = await dbUpload('item-images', path, blob, 'image/webp');
  await saveCountItem(id, { photo: url });
  return url;
}

// ลบรูปของรายการ (กลับไปใช้รูปประจำหมวด)
export const clearCountPhoto = id => saveCountItem(id, { photo: null });

// ---------- เพลง (ตาราง music_tracks + เพลย์ลิสต์ kk_music_playlist) ----------

// เพลงทั้งหมดในคลัง
export const getTracks = () =>
  dbGet('music_tracks?active=eq.true&select=id,title,artist,url,storage_path,duration_seconds,sort_order&order=sort_order,id');

// เพลย์ลิสต์ทั้งหมด
export const getPlaylists = () =>
  dbGet('kk_music_playlist?active=eq.true&select=id,name,cover,sort_order&order=sort_order,id');

// เพลงที่อยู่ในเพลย์ลิสต์แต่ละอัน
export const getPlaylistTracks = () =>
  dbGet('kk_music_playlist_track?select=playlist_id,track_id,sort_order&order=sort_order,id');

// สร้างเพลย์ลิสต์ใหม่
export const addPlaylist = (name, by) =>
  dbPost('kk_music_playlist', [{ id: 'pl_' + Date.now(), name, sort_order: Date.now() % 100000, created_by: by || null }]);

// แก้ชื่อเพลย์ลิสต์
export const savePlaylist = (id, changes) => dbPatch(`kk_music_playlist?id=eq.${enc(id)}`, changes);

// ลบเพลย์ลิสต์ (เพลงในคลังยังอยู่)
export const removePlaylist = id => dbDelete(`kk_music_playlist?id=eq.${enc(id)}`);

// ใส่เพลงเข้าเพลย์ลิสต์ / เอาเพลงออกจากเพลย์ลิสต์
export const addTrackToPlaylist = (playlistId, trackId, order) =>
  dbUpsert('kk_music_playlist_track?on_conflict=playlist_id,track_id', [{ playlist_id: playlistId, track_id: trackId, sort_order: order || 0 }]);
export const removeTrackFromPlaylist = (playlistId, trackId) =>
  dbDelete(`kk_music_playlist_track?playlist_id=eq.${enc(playlistId)}&track_id=eq.${enc(trackId)}`);

// อัพไฟล์เพลงขึ้นที่เก็บไฟล์ แล้วเพิ่มเข้าคลังเพลง (ไฟล์ที่ส่งมาต้องเป็น MP3 แล้ว)
export async function addTrack({ title, artist, blob, seconds, by }) {
  const id = 'mt_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const path = `tracks/${id}.mp3`;
  const url = await dbUpload('music', path, blob, 'audio/mpeg');
  const rows = await dbPost('music_tracks', [{
    id, title, artist: artist || by || null, url, storage_path: path,
    duration_seconds: Math.round(seconds || 0), sort_order: Date.now() % 100000, active: true
  }]);
  return (rows && rows[0]) || { id, title, artist, url, storage_path: path, duration_seconds: Math.round(seconds || 0) };
}

// ลบเพลงออกจากคลัง (ลบไฟล์เสียงด้วย)
export async function removeTrack(track) {
  await dbDelete(`kk_music_playlist_track?track_id=eq.${enc(track.id)}`);
  await dbDelete(`music_tracks?id=eq.${enc(track.id)}`);
  if (track.storage_path) await dbRemoveFile('music', track.storage_path);
}

// ---------- งานของฉัน: การ์ดงานรายคน (ตาราง kk_my_task) ----------

// การ์ดงานของพนักงานคนนั้น เรียงตามลำดับในฐาน
export const getMyTasks = code =>
  dbGet(`kk_my_task?active=eq.true&staff_code=eq.${enc(code)}&select=id,title,subtitle,detail,icon,page,responsibility,sort_order&order=sort_order,id`);

// วันนี้บันทึกงานไหนไปแล้วบ้าง (ใช้ติดป้ายสถานะบนการ์ด — ไม่มีแถว = ยังไม่ได้ทำ)
export async function getMyWorkDone(date) {
  const one = q => dbGet(q).then(r => r.length > 0).catch(() => false);
  const packIds = (await getPackItems()).map(i => i.id);
  const [pack, chicken, cooked, income] = await Promise.all([
    packIds.length ? one(`kk_stock_count?count_date=eq.${date}&is_current=is.true&count_item_id=in.(${packIds.map(enc).join(',')})&kitchen_qty=not.is.null&select=id&limit=1`) : false,
    one(`kk_prep_log?log_date=eq.${date}&is_current=is.true&count_item_id=eq.meat_chicken_soft&qty=not.is.null&select=id&limit=1`),
    one(`kk_cooked_leftover?left_date=eq.${date}&is_current=is.true&qty_box=not.is.null&select=id&limit=1`),
    one(`kk_daily_income?income_date=eq.${date}&select=id&limit=1`)
  ]);
  return { 'fah-pack': pack, 'fah-chicken': chicken, 'fah-cooked': cooked, 'fah-income': income };
}

// ---------- นับกล่องและช้อนส้อม (ใช้ตารางเดียวกับหน้านับสต๊อก) ----------

// รายการที่หน้านับกล่องต้องนับ (กรองด้วยงานที่รับผิดชอบ เรียงลำดับเดียวกับหน้านับสต๊อก)
export const getPackItems = (resp = 'นับบรรจุภัณฑ์อาหาร') =>
  dbGet(`kk_count_item?active=eq.true&responsibility=eq.${enc(resp)}&select=id,name,grp,unit,location,photo,sort_order&order=sort_order,id`);

// รายการที่หน้านับสต๊อกเครื่องดื่มของส้มต้องนับ (ทีละหมวดตามแท็บ — ชุดเดียวกับหน้านับสต๊อก)
export const getSomStockItems = grp =>
  dbGet(`kk_count_item?active=eq.true&grp=eq.${enc(grp)}&responsibility=eq.${enc('นับเครื่องดื่มและบรรจุภัณฑ์น้ำ')}&select=id,name,grp,unit,location,responsibility,photo,sort_order&order=sort_order,id`);

// คำพม่าของรายการนับที่ระบุ (ตาราง kk_word_my) คืน { count_item_id: { name_my, unit_my } } · ว่าง/ต่อฐานไม่ได้ = {} เงียบๆ
export async function getSomBurmese(ids) {
  if (!ids || !ids.length) return {};
  try {
    const rows = await dbGet(`kk_word_my?count_item_id=in.(${ids.map(enc).join(',')})&select=count_item_id,name_my,unit_my`);
    const out = {};
    (rows || []).forEach(r => { out[r.count_item_id] = { name_my: r.name_my || '', unit_my: r.unit_my || '' }; });
    return out;
  } catch { return {}; }
}

// ---------- แปลภาษาพม่า (kk_word_my = คำของรายการนับ · kk_app_word_my = ข้อความบนจอแอป) ----------

// คำพม่าของรายการนับทั้งหมด (แท็บแปลภาษาพม่า + สวิตช์พม่ากำกับทั้งแอป)
export const getWordMyAll = () =>
  dbGet('kk_word_my?select=id,th_name,name_my,unit_th,unit_my,cat_th,cat_my,count_item_id,source&order=cat_th.nullslast,th_name,id');

// บันทึกคำพม่าของรายการนับ (แถวเดิมทับตาม id · แถวใหม่เพิ่ม) ต้องส่งครบทุกช่อง
export const saveWordMy = rows => dbUpsert('kk_word_my?on_conflict=id', rows.map(r => ({ ...r, updated_at: new Date().toISOString() })));

// ลบคำพม่าของรายการนับ 1 คำ
export const removeWordMy = id => dbDelete(`kk_word_my?id=eq.${enc(id)}`);

// รายการนับทั้งหมดที่ยังใช้อยู่ (ให้เลือกผูกกับคำพม่า)
export const getCountItemsBrief = () =>
  dbGet('kk_count_item?active=eq.true&select=id,name,grp,unit,photo,sort_order&order=sort_order,id');

// คำแปลพม่าของข้อความบนจอแอป
export const getAppWordMy = () => dbGet('kk_app_word_my?select=th,my,cat&order=th');

// บันทึกคำแปลข้อความบนจอ 1 คำ (ข้อความไทยเป็นกุญแจ)
export const saveAppWordMy = (th, my, cat, by) =>
  dbUpsert('kk_app_word_my?on_conflict=th', [{ th, my, cat, updated_by: by || null, updated_at: new Date().toISOString() }]);

// รายการนับทั้งหมดของหมวดหนึ่ง (หน้านับผัก/ซอส/เครื่องปรุง/เนื้อสัตว์ — ชุดเดียวกับหน้านับสต๊อก)
export const getCountItemsByGroup = grp =>
  dbGet(`kk_count_item?active=eq.true&grp=eq.${enc(grp)}&select=id,name,grp,unit,location,responsibility,photo,sort_order&order=sort_order,id`);

// ผลนับย้อนหลังของรายการที่ระบุ (ใช้ในแผงดูประวัติ)
export const getCountHistory = (ids, from, to) =>
  dbGet(`kk_stock_count?is_current=is.true&count_date=gte.${from}&count_date=lte.${to}&count_item_id=in.(${ids.map(enc).join(',')})&select=count_item_id,count_date,kitchen_qty,condo_qty,counted_by&order=count_date.desc,id`);

// ---------- รายได้ประจำวัน (ตาราง kk_income_brand / kk_income_channel / kk_daily_income) ----------

// ร้านและช่องทางขายที่เปิดใช้อยู่
export const getIncomeBrands = () =>
  dbGet('kk_income_brand?active=eq.true&select=id,name,logo,color,monthly_target,sort_order&order=sort_order,id');
export const getIncomeChannels = () =>
  dbGet('kk_income_channel?active=eq.true&select=id,name,icon,sort_order&order=sort_order,id');

// ช่องทางขายทั้งหมด รวมที่ปิดไว้ (หน้าจัดการช่องทางต้องเห็นเพื่อเปิดกลับได้)
export const getIncomeChannelsAll = () =>
  dbGet('kk_income_channel?select=id,name,icon,sort_order,active&order=sort_order,id');

// เปิด-ปิดช่องทางขาย 1 ช่องทาง (ทุกหน้าที่บันทึกรายได้ใช้ชุดเดียวกัน)
export const setIncomeChannelActive = (id, active) =>
  dbPatch(`kk_income_channel?id=eq.${enc(id)}`, { active });

// เพิ่มช่องทางขายใหม่ต่อท้าย
export const addIncomeChannel = row => dbPost('kk_income_channel', [{ active: true, ...row }]);

// ยอดขายของวันที่เลือก (หัวบันทึก + ยอดแต่ละช่องทาง)
export async function getIncomeDay(date) {
  const [brands, channels, heads] = await Promise.all([
    getIncomeBrands(), getIncomeChannels(),
    dbGet(`kk_daily_income?income_date=eq.${date}&select=id,brand_id,note,recorded_by`)
  ]);
  const ids = heads.map(h => h.id);
  const lines = ids.length
    ? await dbGet(`kk_daily_income_line?income_id=in.(${ids.join(',')})&select=income_id,channel_id,amount`)
    : [];
  return { brands, channels, heads, lines };
}

// บันทึกยอดขาย 1 ร้านของวันนั้น
// (บันทึกทีเดียวทั้งหัวและทุกช่องทางผ่าน RPC kk_income_save · ค่าเดิมก่อนแก้ถูกเก็บลง kk_daily_income_rev ไม่หาย · ช่องว่าง = ลบยอดช่องนั้น ไม่ใช่ 0)
export async function saveIncomeDay({ date, brand, note, by, amounts }) {
  const id = await dbPost('rpc/kk_income_save', { p_date: date, p_brand: brand, p_note: note || '', p_by: by || null, p_amounts: amounts || {} });
  if (!id) throw new Error('no income id');
  return id;
}

// ยอดขายย้อนหลัง (ใช้ในแผงดูประวัติ)
export const getIncomeRange = (from, to) =>
  dbGet(`kk_daily_income?income_date=gte.${from}&income_date=lte.${to}&select=id,income_date,brand_id,note&order=income_date.desc,id`);

// ยอดขายย้อนหลังพร้อมยอดรวมต่อวันต่อร้าน (รวมยอดให้เรียบร้อยก่อนส่งให้หน้าจอ)
export async function getIncomeHistory(from, to) {
  const heads = await getIncomeRange(from, to);
  if (!heads.length) return [];
  const lines = await dbGet(`kk_daily_income_line?income_id=in.(${heads.map(h => h.id).join(',')})&select=income_id,amount&order=id`);
  return heads.map(h => ({
    date: h.income_date,
    brand: h.brand_id,
    total: lines.filter(l => l.income_id === h.id).reduce((s, l) => s + (Number(l.amount) || 0), 0)
  }));
}

// ---------- วันลาทีม (ตาราง kk_staff_leave + kk_leave_type) ----------

export const getLeaveTypes = () =>
  dbGet('kk_leave_type?active=eq.true&select=id,name_th,color,sort_order&order=sort_order,id');

// วันลาในช่วงวัน (ใช้ทั้งปฏิทินและรายการลา)
export const getLeaves = (from, to) =>
  dbGet(`kk_staff_leave?leave_date=gte.${from}&leave_date=lte.${to}&select=id,staff_code,leave_date,leave_type,note,recorded_by&order=leave_date,id`);

// บันทึกวันลา: 1 แถวต่อคนต่อวัน (คนเดิมวันเดิมบันทึกซ้ำ = ทับของเดิม)
export const saveLeaves = rows =>
  dbUpsert('kk_staff_leave?on_conflict=staff_code,leave_date', rows);

// ยกเลิกวันลา 1 แถว
export const removeLeave = id => dbDelete(`kk_staff_leave?id=eq.${id}`);

// ---------- การมาทำงาน (kk_view_open_day = วันร้านเปิด+ยอดขาย · kk_view_leave_all = วันลาแอปใหม่+แอปเก่า) ----------

// โหลดข้อมูลสรุปการมาทำงานทั้งชุด (พนักงาน = ทุกคนที่ทำงานอยู่ ไม่รวมเจ้าของร้าน)
export async function getAttendanceBundle() {
  const [days, leaves, staff] = await Promise.all([
    dbGet('kk_view_open_day?select=day,dow,sales,is_open&order=day'),
    dbGet(`kk_view_leave_all?leave_date=lte.${todayIso()}&select=staff_code,leave_date,days`),
    dbGet('kk_staff?active=eq.true&frozen=not.is.true&role=neq.owner&select=code,name,avatar,start_date,sort_order&order=sort_order,code')
  ]);
  const first = days.length ? days[0].day : todayIso();
  const people = staff.map(s => ({ code: s.code, name: s.name, avatar: s.avatar || s.code, startSet: s.start_date || null, start: s.start_date || first }));
  return { days: days.map(d => ({ ...d, sales: Number(d.sales) || 0 })), leaves, people, first };
}

// ---------- สูตรอาหาร (kk_recipe_card = การ์ดในหมวด · ตัวสูตรใช้ร่วมกับ App สูตร: kk_core_recipes / _ingredients / _steps) ----------

// โหลดสูตรทั้งหมด จัดเป็นชุดพร้อมใช้ { recipes, lines, steps, cards } (ชื่อวัตถุดิบที่ผูกตารางกลางอ่านจาก ingredients_master)
export async function getRecipeBook() {
  const [cards, recipes, lines, steps] = await Promise.all([
    dbGet('kk_recipe_card?select=recipe_id,section,sort_order,presets,exclude_groups,is_active&order=section,sort_order,recipe_id'),
    dbGet('kk_core_recipes?select=id,name_th,recipe_type,recipe_subtype,base_batch_g,yield_percent,unit_size_g,unit_label,description,usage_ratio_note,status,photo_url,updated_at&order=id'),
    dbGet('kk_core_recipe_ingredients?select=id,recipe_id,ingredient_id,custom_name,qty_g,group_name,group_order,sort_order,sub_recipe_id,sub_recipe_qty_g&order=recipe_id,group_order,sort_order,id'),
    dbGet('kk_core_recipe_steps?select=id,recipe_id,step_order,instruction&order=recipe_id,step_order,id')
  ]);
  const ingIds = [...new Set(lines.map(l => l.ingredient_id).filter(Boolean))];
  const master = ingIds.length ? await dbGet(`ingredients_master?id=in.(${ingIds.map(enc).join(',')})&select=id,name_th&order=id`) : [];
  const book = { recipes: {}, lines: {}, steps: {}, cards: {}, list: cards };
  recipes.forEach(r => { book.recipes[r.id] = r; });
  cards.forEach(c => { book.cards[c.recipe_id] = c; });
  lines.forEach(l => {
    const m = master.find(x => x.id === l.ingredient_id);
    const sub = l.sub_recipe_id && book.recipes[l.sub_recipe_id];
    const name = l.custom_name || (m && m.name_th) || (sub && sub.name_th) || l.ingredient_id || '';
    (book.lines[l.recipe_id] = book.lines[l.recipe_id] || []).push({ ...l, name, master_name: m ? m.name_th : null });
  });
  steps.forEach(s => { (book.steps[s.recipe_id] = book.steps[s.recipe_id] || []).push(s); });
  return book;
}

// บันทึกสูตร (หัวสูตร / วัตถุดิบทั้งชุด / วิธีทำ) ทีเดียวผ่าน RPC · loadedAt ไม่ตรง = มีคนแก้ก่อน → โยน 'conflict'
export async function saveRecipe({ id, loadedAt, head = null, lines = null, steps = null }) {
  try {
    return await dbPost('rpc/kk_recipe_save', { p_recipe: id, p_loaded: loadedAt || null, p_head: head, p_lines: lines, p_steps: steps });
  } catch (e) {
    if (/CONFLICT/.test(String(e && e.message))) throw new Error('conflict');
    throw e;
  }
}

// เพิ่มสูตรใหม่ในหมวด (สร้างหัวสูตร status active แล้วสร้างการ์ดต่อท้ายหมวด)
export async function addRecipe({ name, type, section, order, by }) {
  const id = 'rec_' + Date.now().toString(36);
  await dbPost('kk_core_recipes', [{ id, name_th: name, recipe_type: type, recipe_subtype: 'standard', status: 'active', portions: 1, yield_percent: 100 }]);
  await dbPost('kk_recipe_card', [{ recipe_id: id, section, sort_order: order, updated_by: by || null }]);
  return id;
}

// แก้การ์ดสูตร: ปุ่ม batch / กลุ่มไม่รวมน้ำหนัก / ลำดับ / ปิดใช้-คืนกลับ (ไม่ลบสูตร)
export const saveRecipeCard = (id, changes, by) =>
  dbPatch(`kk_recipe_card?recipe_id=eq.${enc(id)}`, { ...changes, updated_by: by || null, updated_at: new Date().toISOString() });

// ---------- Grab (import · ออเดอร์ · รายงาน) — ทุกไฟล์เก็บตารางเดียว kk_grab_report แยกร้าน (shop = kk_income_brand.id) ----------

const grabShopQ = shop => (Array.isArray(shop) ? `shop=in.(${shop.map(enc).join(',')})` : `shop=eq.${enc(shop)}`);

// บันทึกไฟล์ Grab ที่อ่านแล้วของร้าน shop ทีละ 500 แถว (ซ้ำกุญแจเดิม = ทับด้วยค่าใหม่) แล้วจดประวัติไฟล์ · onStep(เสร็จกี่แถว)
export async function saveGrabImport(p, shop, by, onStep) {
  const size = 500, now = new Date().toISOString();
  for (let i = 0; i < p.rows.length; i += size) {
    const part = p.rows.slice(i, i + size).map(r => ({ shop, ds: p.kind, row_key: r.row_key, day: r.day, data: r.data, file_name: p.name, uploaded_by: by || null, uploaded_at: now }));
    await dbUpsert('kk_grab_report?on_conflict=shop,ds,row_key', part);
    if (onStep) onStep(Math.min(i + size, p.rows.length));
  }
  await dbPost('kk_grab_report', [{ shop, ds: 'file', row_key: `${now}|${p.name}`, day: p.from, file_name: p.name, uploaded_by: by || null,
    data: { file_type: p.kind, period_start: p.from, period_end: p.to, row_count: p.rows.length, file_name: p.name, note: p.capped ? 'capped' : null } }]);
}

// ประวัติไฟล์ที่ import + วันที่ที่มีข้อมูลจริงของแต่ละชุด ของร้านเดียว (ใช้ทำตารางความครบ)
export async function getGrabCoverage(shop) {
  const [files, days] = await Promise.all([
    dbGet(`kk_grab_report?${grabShopQ(shop)}&ds=eq.file&select=uploaded_by,uploaded_at,data&order=uploaded_at.desc,id.desc`),
    dbGet(`kk_view_grab_report_coverage?${grabShopQ(shop)}&select=ds,d,n&order=ds,d`)
  ]);
  return { files: files.map(f => ({ ...f.data, uploaded_by: f.uploaded_by, uploaded_at: f.uploaded_at })), days };
}

// ออเดอร์ Grab ของร้านเดียววันเดียว (จากไฟล์ Transaction) + บิลที่ถ่ายรูปไว้วันนั้น (kk_grab_orders) เอาไว้ดูเมนู
export async function getGrabOrdersDay(shop, iso) {
  const [txns, bills] = await Promise.all([
    dbGet(`kk_grab_report?${grabShopQ(shop)}&ds=eq.transactions&day=eq.${iso}&select=data&order=id`),
    dbGet(`kk_grab_orders?order_date=eq.${iso}&select=order_number,customer_name,order_time,main_menu,add_on,drinks,customer_note,total_amount,menu_details&order=id`)
  ]);
  return { txns: txns.map(t => t.data).sort((x, y) => String(x.created_at).localeCompare(String(y.created_at))), bills };
}

// วันล่าสุดที่มีข้อมูล Grab ของร้าน (ส่งรายการร้านได้) · หน้าออเดอร์ใช้วันล่าสุดของไฟล์ Transaction · รายงานใช้วันล่าสุดของไฟล์ Sales ก่อน (ไฟล์ Transaction มักมีวันสุดท้ายไม่ครบวัน)
export async function getGrabLastDay(shop, forReport = false) {
  const q = grabShopQ(shop);
  const [r, s] = await Promise.all([dbGet(`kk_view_grab_report_txn?${q}&select=day&order=day.desc&limit=1`), dbGet(`kk_grab_report?${q}&ds=eq.sales&select=day&order=day.desc&limit=1`)]);
  const t = (r[0] || {}).day || null, d = (s[0] || {}).day || null;
  return forReport ? d || t : t || d;
}

// ข้อมูลทั้งหมดของรายงานผู้บริหาร ของร้านที่เลือก (รายการร้าน) ช่วง from–to (pf = วันแรกของช่วงก่อนหน้า ไว้เทียบ)
export async function getGrabReport(shops, pf, from, to) {
  const q = grabShopQ(shops);
  const r = (ds, a, cols, extra = '') => dbGet(`kk_grab_report?${q}&ds=eq.${ds}&day=gte.${a}&day=lte.${to}${extra}&select=shop,date:day,${cols.map(c => `${c}:data->>${c}`).join(',')}&order=day,id`);
  const [sales, txn, menu, peak, adsT, adsC, kw, issue, issueOrd, transfers, store, bills] = await Promise.all([
    r('sales', pf, ['gross_sales', 'net_sales', 'orders', 'rating']),
    dbGet(`kk_view_grab_report_txn?${q}&day=gte.${pf}&day=lte.${to}&select=*&order=day,shop`),
    r('menu', pf, ['item', 'units', 'gross_sales']),
    r('peak', from, ['hour', 'orders']),
    r('ads_daily', pf, ['campaign', 'level', 'spend', 'ad_orders', 'ad_sales', 'impressions', 'clicks']),
    r('ads_campaign', pf, ['campaign', 'level', 'spend', 'ad_orders', 'ad_sales', 'impressions', 'clicks']),
    r('ads_keyword', from, ['keyword', 'impressions', 'clicks', 'ad_orders', 'ad_sales', 'spend']),
    r('miwi_item', from, ['item_name', 'missing', 'wrong', 'total']),
    r('miwi_order', pf, ['hour', 'disposition']),
    r('transfers', from, ['amount', 'status']),
    dbGet(`kk_view_open_day?day=gte.${pf}&day=lte.${to}&select=day,sales&order=day`),
    r('transactions', from, ['net_sales'], `&data->>category=eq.${enc('ชำระเงิน')}`)
  ]);
  return { sales, txn, menu, peak, ads: [...adsT, ...adsC], kw: kw.filter(k => Number(k.clicks) > 0 || Number(k.ad_orders) > 0), issue, issueOrd, transfers, store, bills: bills.map(x => Number(x.net_sales) || 0) };
}

// บิลที่ถ่ายรูปไว้ (เมนูในบิล) ที่จับคู่ออเดอร์ในไฟล์ Transaction ได้ ของร้านที่เลือก — ใช้ดูว่าบิลแต่ละขนาดสั่งเมนูอะไร
export const getGrabBaskets = shops =>
  dbGet(`kk_view_grab_basket?${grabShopQ(shops)}&select=order_date,main_menu,add_on,drinks,net_sales&order=order_date,order_number`);

// ยอดขายสุทธิ Grab รายวันต่อร้าน ตั้งแต่ 1 ม.ค. ของปีถึงวัน end (ใช้คิดภาษีทั้งปี)
export const getGrabYear = (shops, end) =>
  dbGet(`kk_view_grab_report_txn?${grabShopQ(shops)}&day=gte.${end.slice(0, 4)}-01-01&day=lte.${end}&select=shop,day,sales&order=day,shop`);

// ตั้งค่าคำนวณภาษีต่อร้าน (ยังไม่เคยตั้ง = ไม่มีแถว ใช้ค่าเริ่มต้นใน config)
export const getTaxSettings = () => dbGet('kk_tax_setting?select=*&order=shop');

// บันทึกตั้งค่าภาษีของร้าน (ทับของเดิม)
export const saveTaxSetting = (shop, changes, by) =>
  dbUpsert('kk_tax_setting?on_conflict=shop', [{ shop, ...changes, updated_by: by || null, updated_at: new Date().toISOString() }]);
