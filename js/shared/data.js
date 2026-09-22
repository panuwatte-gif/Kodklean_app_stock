// ประตูข้อมูลบานเดียวของแอป — ทุกหน้าต้องเรียกผ่านไฟล์นี้เท่านั้น
// รอบนี้อ่านจาก mock_data.js ถ้าจะเปลี่ยนไปต่อฐานจริง แก้เฉพาะไฟล์นี้ หน้าจอไม่ต้องแก้
import { MOCK_DATA } from './mock_data.js';
import { dbGet, dbPost, dbPatch, dbUpsert, dbUpsertBack, dbDelete, dbUpload, dbRemoveFile } from './db.js';
import { parseCfg } from './fclab.js';
import { shiftIso } from './format.js';
import { buildHome } from './home-model.js';

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
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
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

// บันทึกผลนับ: ปิดแถวเก่าให้ไม่ใช่ค่าล่าสุด แล้วเพิ่มแถวใหม่ทุกครั้ง (ห้าม update ทับของเดิม)
export async function saveStockCounts(rows, date, staffCode) {
  if (!rows.length) return [];
  const ids = rows.map(r => encodeURIComponent(r.id)).join(',');
  await dbPatch(`kk_stock_count?count_date=eq.${date}&is_current=is.true&count_item_id=in.(${ids})`, { is_current: false });
  return dbPost('kk_stock_count', rows.map(r => ({
    count_item_id: r.id,
    count_date: date,
    kitchen_qty: r.kitchen,
    condo_qty: r.condo,
    counted_by: staffCode,
    is_current: true
  })));
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
  dbGet(`kk_prep_log?log_date=gte.${from}&log_date=lte.${to}&is_current=is.true&select=count_item_id,log_date,entry_type,seq,qty`);

// ของเหลือของวันที่เลือก / ช่วงวัน (เฉพาะช่อง "เหลือ")
export const getLeftovers = date =>
  dbGet(`kk_cooked_leftover?left_date=eq.${date}&is_current=is.true&select=menu_id,entry_type,qty_box,rev_no,logged_by,edited_by`);
export const getLeftoverRange = (from, to) =>
  dbGet(`kk_cooked_leftover?left_date=gte.${from}&left_date=lte.${to}&is_current=is.true&entry_type=eq.${enc('เหลือ')}&select=menu_id,left_date,qty_box`);

// เมนูทั้งหมด (พร้อมค่าผูกเนื้อสัตว์)
export const getMenus = () =>
  dbGet('kk_menu?active=eq.true&select=id,name,protein_item_id,protein_ratio,sort_order&order=sort_order,id');

// ค่าตั้งการคำนวณ (การ์ด Assumption)
export const getAssumptions = () => dbGet('kk_prep_assumption?select=key,value,label');

// ผลนับสต๊อกครัวกลางรอบๆ วันที่เลือก (±21 วัน ใช้โยงหักสต๊อก)
export const getStocksNear = date =>
  dbGet(`kk_stock_count?is_current=is.true&count_date=gte.${shiftIso(date, -21)}&count_date=lte.${shiftIso(date, 21)}&select=count_item_id,count_date,kitchen_qty`);

// โหลดข้อมูลทั้งหน้าของวันเดียวในครั้งเดียว (รวมกฎการทดสอบ เพื่อให้การคำนวณใช้ค่าล่าสุดจากฐานเสมอ)
export async function getPrepBundle(date) {
  const [items, logs, logs7, logsFc, leftovers, left7, menus, assumptions, resp, stocks, cfg, staff, assigns] = await Promise.all([
    getPrepItems(), getPrepLogs(date), getPrepLogRange(shiftIso(date, -6), date), getPrepLogRange(shiftIso(date, -84), shiftIso(date, -1)),
    getLeftovers(date), getLeftoverRange(shiftIso(date, -6), date),
    getMenus(), getAssumptions(), getResponsibilities(), getStocksNear(date), getFcRules(), getStaff(), getAssigns()
  ]);
  return { date, items, logs, logs7, logsFc, leftovers, left7, menus, assumptions, resp, stocks, cfg, staff, assigns };
}

// วันล่าสุดก่อนวันที่เลือกที่มีการกรอกช่องนั้น (ใช้กับปุ่มคัดลอกจากวันก่อนหน้า)
export const getLastPrepDateBefore = (date, type) =>
  dbGet(`kk_prep_log?log_date=lt.${date}&entry_type=eq.${enc(type)}&is_current=is.true&qty=not.is.null&select=log_date&order=log_date.desc&limit=1`).then(r => (r[0] || {}).log_date || null);

// บันทึก 1 ช่องของแท็บเตรียม/ข้าว แบบเพิ่มแถวใหม่ (แก้ = rev_no+1 ของเก่าไม่หาย ทำครบในคำสั่งเดียวฝั่งฐาน)
export const savePrep = ({ item, date, type, seq = 1, qty, by }) =>
  dbPost('rpc/kk_prep_save', { p_item: item, p_date: date, p_type: type, p_seq: seq, p_qty: qty, p_by: by, p_key: idemKey('prep', item, date, type, seq) });

// บันทึก 1 ช่องของแท็บอาหารเหลือ (กติกาเดียวกัน)
export const saveLeft = ({ menu, date, type, qty, by }) =>
  dbPost('rpc/kk_left_save', { p_menu: menu, p_date: date, p_type: type, p_qty: qty, p_by: by, p_key: idemKey('left', menu, date, type, 1) });

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

// ข้อมูลใช้จริงย้อนหลังของทุกวัตถุดิบ (ใช้เป็นสนามทดสอบ)
export const getFcHistory = () =>
  dbGet('kk_forecast_history?select=use_date,item_id,used_kg,theo_kg,dow_num,flag&order=use_date&limit=5000');

// สูตรที่ใช้จริงต่อวัตถุดิบ + ตั้งสูตรใช้จริงตัวใหม่
export const getFcModelMap = () =>
  dbGet('kk_forecast_model_map?select=item_id,item_name_th,model_type,formula_code,band_type,band_value,fixed_kg,backtest_win,forward_win,note,active,updated_at&order=id');
export const setFcLiveModel = row =>
  dbUpsert('kk_forecast_model_map?on_conflict=item_id', [{ ...row, updated_at: new Date().toISOString() }]);

// ผลการทดสอบ (1 แถวต่อ สูตร×วัตถุดิบ×กรอบ — ทดสอบซ้ำจะทับแถวเดิม)
export const getFcTrials = () =>
  dbGet('kk_forecast_trial?select=formula_code,item_id,band_type,band_value,period_from,period_to,regime,n,win_rate,loss_min_kg,loss_avg_kg,loss_max_kg,loss_sum_kg,loss_avg_baht,verdict,verdict_reason,tested_at&order=tested_at.desc&limit=5000');
export const saveFcTrials = rows =>
  dbUpsert('kk_forecast_trial?on_conflict=formula_code,item_id,band_type,band_value,period_from,period_to', rows);

// ป้ายสถานการณ์ของวัตถุดิบตามช่วงเวลา
export const addFcRegime = rows => dbPost('kk_forecast_regime', rows);

// ราคาต่อกิโลของแต่ละรายการ (kk_count_item ผูกกับราคาวัตถุดิบ — ไม่มีราคาในฐาน = คืน null ห้ามเดา)
export async function getFcPrices() {
  const [items, ings] = await Promise.all([
    dbGet('kk_count_item?select=id,name,grp,ingredient_id'),
    dbGet('kk_ingredient?select=id,price_per_kg')
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
  return { cfgRows, cfg: parseCfg(cfgRows), formulas, history, map, trials, prices };
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
  dbGet('kk_r9_round?is_current=is.true&select=id,no,root_id,date,time,status,fee,note,sent_by,edited_by,rev_no,created_at,lines&order=date,created_at');

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
export const saveR9Round = ({ date, fee, note, by, lines, key, replaces = null }) =>
  dbPost('rpc/kk_r9_save', { p_date: date, p_fee: fee, p_note: note, p_by: by, p_lines: lines, p_key: key, p_replaces: replaces });

// ลบรอบส่ง = ปิดไม่ให้นับ (ของเก่ายังอยู่ในฐาน)
export const voidR9Round = (id, by) => dbPost('rpc/kk_r9_void', { p_id: id, p_by: by });

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

// บันทึกใช้จริงย้อนหลังตั้งแต่วันที่กำหนด (ใช้ทั้งกราฟใช้ไปและการพยากรณ์)
export const getUseHistoryFrom = from =>
  dbGet(`kk_forecast_history?use_date=gte.${from}&select=use_date,item_id,used_kg,theo_kg,dow_num,flag&order=use_date`);

// ของเหลือ/ของทิ้งรายเมนูในช่วงวัน (ทุกประเภทแถว ไม่เฉพาะ "เหลือ")
export const getLeftoverAll = (from, to) =>
  dbGet(`kk_cooked_leftover?left_date=gte.${from}&left_date=lte.${to}&is_current=is.true&select=menu_id,left_date,entry_type,qty_box`);

// โหลดข้อมูลหน้าหลักทั้งหน้าในครั้งเดียว แล้วแปลงเป็นข้อมูลการ์ดด้วย home-model.js
export async function getHomeBundle(date) {
  const d = date || todayIso();
  const [notices, history, items, menus, left, rounds, r9items, map, formulas, cfg, staff, duties, assigns, brands, income] = await Promise.all([
    getHomeNotices(), getUseHistoryFrom(shiftIso(d, -180)), getPrepItems(), getMenus(),
    getLeftoverAll(shiftIso(d, -37), d), getR9Rounds(), getR9Items(),
    getFcModelMap(), getFcFormulas(), getFcRules(), getStaff(), getStaffDuties(), getAssigns(),
    getIncomeBrands(), getIncomeHistory(d.slice(0, 7) + '-01', d)
  ]);
  return buildHome({ date: d, notices, history, items, menus, left, rounds: rounds.map(toR9Round), r9items, map, formulas, cfg, staff, duties, assigns, brands, income });
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

// รายการนับทั้งหมดของหมวดหนึ่ง (หน้านับผัก/ซอส/เครื่องปรุง/เนื้อสัตว์ — ชุดเดียวกับหน้านับสต๊อก)
export const getCountItemsByGroup = grp =>
  dbGet(`kk_count_item?active=eq.true&grp=eq.${enc(grp)}&select=id,name,grp,unit,location,responsibility,photo,sort_order&order=sort_order,id`);

// ผลนับย้อนหลังของรายการที่ระบุ (ใช้ในแผงดูประวัติ)
export const getCountHistory = (ids, from, to) =>
  dbGet(`kk_stock_count?is_current=is.true&count_date=gte.${from}&count_date=lte.${to}&count_item_id=in.(${ids.map(enc).join(',')})&select=count_item_id,count_date,kitchen_qty,condo_qty,counted_by&order=count_date.desc`);

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

// บันทึกยอดขาย 1 ร้านของวันนั้น (หัวบันทึกทับของเดิม แล้วทับยอดรายช่องทาง)
export async function saveIncomeDay({ date, brand, note, by, amounts }) {
  const rows = await dbUpsertBack('kk_daily_income?on_conflict=income_date,brand_id',
    [{ income_date: date, brand_id: brand, note: note || null, recorded_by: by || null, updated_at: new Date().toISOString() }]);
  const id = (rows && rows[0] || {}).id;
  if (!id) throw new Error('no income id');
  const lines = Object.keys(amounts).map(ch => ({ income_id: id, channel_id: ch, amount: amounts[ch] }));
  if (lines.length) await dbUpsert('kk_daily_income_line?on_conflict=income_id,channel_id', lines);
  return id;
}

// ยอดขายย้อนหลัง (ใช้ในแผงดูประวัติ)
export const getIncomeRange = (from, to) =>
  dbGet(`kk_daily_income?income_date=gte.${from}&income_date=lte.${to}&select=id,income_date,brand_id,note&order=income_date.desc`);

// ยอดขายย้อนหลังพร้อมยอดรวมต่อวันต่อร้าน (รวมยอดให้เรียบร้อยก่อนส่งให้หน้าจอ)
export async function getIncomeHistory(from, to) {
  const heads = await getIncomeRange(from, to);
  if (!heads.length) return [];
  const lines = await dbGet(`kk_daily_income_line?income_id=in.(${heads.map(h => h.id).join(',')})&select=income_id,amount`);
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
  dbGet(`kk_staff_leave?leave_date=gte.${from}&leave_date=lte.${to}&select=id,staff_code,leave_date,leave_type,note,recorded_by&order=leave_date`);

// บันทึกวันลา: 1 แถวต่อคนต่อวัน (คนเดิมวันเดิมบันทึกซ้ำ = ทับของเดิม)
export const saveLeaves = rows =>
  dbUpsert('kk_staff_leave?on_conflict=staff_code,leave_date', rows);

// ยกเลิกวันลา 1 แถว
export const removeLeave = id => dbDelete(`kk_staff_leave?id=eq.${id}`);
