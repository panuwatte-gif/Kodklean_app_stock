// ประตูข้อมูลบานเดียวของแอป — ทุกหน้าต้องเรียกผ่านไฟล์นี้เท่านั้น
// รอบนี้อ่านจาก mock_data.js ถ้าจะเปลี่ยนไปต่อฐานจริง แก้เฉพาะไฟล์นี้ หน้าจอไม่ต้องแก้
import { MOCK_DATA } from './mock_data.js';

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

// แก้ไขข้อมูลรายการเดียวตาม id (ส่งมาแค่ช่องที่อยากเปลี่ยน)
export function revise(collection, id, changes) {
  const rows = get(collection);
  const index = rows.findIndex(row => row.id === id);
  if (index === -1) return null;
  rows[index] = { ...rows[index], ...copy(changes) };
  save(collection, rows);
  return rows[index];
}
