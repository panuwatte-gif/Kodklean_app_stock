// ท่อคุยกับฐานข้อมูล Supabase (REST) — เรียกได้จาก data.js เท่านั้น ค่าเชื่อมต่ออยู่ในไฟล์ connection.json
let conn = null;

// อ่านไฟล์ค่าเชื่อมต่อครั้งแรกที่ใช้ แล้วจำไว้
async function link() {
  if (!conn) conn = await (await fetch(new URL('../../connection.json', import.meta.url))).json();
  return conn;
}

// ยิงคำขอไปฐานข้อมูลหนึ่งครั้ง (ใส่หัวคำขอให้เองจากไฟล์ค่าเชื่อมต่อ · extra = หัวคำขอเพิ่ม · withRange = คืนหัว Content-Range ด้วย)
async function req(path, method, body, prefer, extra, withRange) {
  const c = await link();
  const head = { apikey: c.key, Authorization: c.scheme + ' ' + c.key, 'Content-Type': 'application/json', ...(extra || {}) };
  if (prefer) head.Prefer = prefer;
  const res = await fetch(c.url + c.rest + path, { method, headers: head, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return withRange ? { data, range: res.headers.get('Content-Range') } : data;
}

const PAGE = 1000;   // ฐานตัดผลที่ 1000 แถวต่อคำขอ

// แจ้งหน้าจอว่าข้อมูลที่อ่านมาไม่ครบ (data.js รับไปขึ้นแถบเตือน)
function notifyPartial(query, got, total, why) {
  try { window.dispatchEvent(new CustomEvent('kk:partial', { detail: { table: query.split('?')[0], got, total, why } })); } catch { /* ไม่มีหน้าจอ */ }
}

// อ่านข้อมูล — ถ้าผลถูกตัดที่ 1000 แถว อ่านต่อทีละหน้าด้วยหัว Range จนครบตามจำนวนใน Content-Range
// คำขอที่ใส่ limit เอง (ตั้งใจอ่านแถวเดียว/จำนวนจำกัด) ยิงครั้งเดียวเหมือนเดิม · อ่านไม่ครบ = แจ้งหน้าจอแล้วโยนข้อผิดพลาด ห้ามคำนวณต่อเงียบๆ
export async function dbGet(query) {
  if (/[?&]limit=/.test(query)) return req(query, 'GET');
  const out = [];
  let total = null;
  for (let from = 0; ; from += PAGE) {
    const { data, range } = await req(query, 'GET', undefined, 'count=exact', { 'Range-Unit': 'items', Range: `${from}-${from + PAGE - 1}` }, true);
    if (!Array.isArray(data)) return data;
    out.push(...data);
    const m = /\/(\d+)\s*$/.exec(range || '');
    if (m) total = Number(m[1]);
    const more = total !== null ? out.length < total : data.length === PAGE;
    if (!more || !data.length) break;
    if (from === 0 && !/[?&]order=/.test(query)) {
      notifyPartial(query, out.length, total, 'no_order');
      throw new Error(`อ่านเกิน ${PAGE} แถวแต่คำขอไม่มี order: ${query.split('?')[0]}`);
    }
  }
  if (total !== null && out.length !== total) {
    notifyPartial(query, out.length, total, 'partial');
    throw new Error(`ข้อมูลไม่ครบ ได้ ${out.length} จาก ${total} แถว: ${query.split('?')[0]}`);
  }
  return out;
}

// อัพไฟล์ขึ้นที่เก็บไฟล์ของฐาน แล้วคืนลิงก์ถาวรของไฟล์นั้น (ทับไฟล์ชื่อเดิมได้)
export async function dbUpload(bucket, path, blob, type) {
  const c = await link();
  const res = await fetch(`${c.url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { apikey: c.key, Authorization: c.scheme + ' ' + c.key, 'Content-Type': type || blob.type || 'application/octet-stream', 'x-upsert': 'true' },
    body: blob
  });
  if (!res.ok) throw new Error(await res.text());
  return `${c.url}/storage/v1/object/public/${bucket}/${path}`;
}

// ลบไฟล์ออกจากที่เก็บไฟล์ (ไม่มีไฟล์อยู่ก็ไม่เป็นไร)
export async function dbRemoveFile(bucket, path) {
  const c = await link();
  await fetch(`${c.url}/storage/v1/object/${bucket}/${path}`, {
    method: 'DELETE',
    headers: { apikey: c.key, Authorization: c.scheme + ' ' + c.key }
  }).catch(() => {});
}

// เพิ่มแถวใหม่ (คืนแถวที่เพิ่งเพิ่ม)
export const dbPost = (table, rows) => req(table, 'POST', rows, 'return=representation');

// แก้เฉพาะช่องสถานะของแถวที่ตรงเงื่อนไข (ไม่ดึงผลกลับ)
export const dbPatch = (query, body) => req(query, 'PATCH', body, 'return=minimal');

// แก้แถวที่ตรงเงื่อนไขแล้วคืนแถวที่ถูกแก้จริง (ว่าง = ไม่มีแถวไหนตรงเงื่อนไข ใช้ตรวจว่ามีคนแก้ก่อนหรือไม่)
export const dbPatchBack = (query, body) => req(query, 'PATCH', body, 'return=representation');

// เพิ่มแถวใหม่ ถ้าชนกุญแจเดิมให้ข้าม ไม่แก้ของเดิม (คืนเฉพาะแถวที่เพิ่มได้จริง)
export const dbInsertIgnore = (query, rows) => req(query, 'POST', rows, 'resolution=ignore-duplicates,return=representation');

// เหมือน dbUpsert แต่คืนแถวที่เขียนได้จริง (ใช้นับจำนวนที่สำเร็จจริง)
export const dbUpsertCount = (query, rows) => req(query, 'POST', rows, 'resolution=merge-duplicates,return=representation');

// เพิ่มแถว ถ้าชนกุญแจเดิมให้ทับแถวนั้น (ต้องใส่ ?on_conflict=คอลัมน์ ในชื่อตาราง)
export const dbUpsert = (query, rows) => req(query, 'POST', rows, 'resolution=merge-duplicates,return=minimal');

// เหมือน dbUpsert แต่ขอแถวผลลัพธ์กลับมาด้วย (ใช้ตอนต้องการ id ของแถวที่เพิ่งบันทึก)
export const dbUpsertBack = (query, rows) => req(query, 'POST', rows, 'resolution=merge-duplicates,return=representation');

// ลบแถวจริงตามเงื่อนไข (ใช้เฉพาะของที่ยังไม่มีประวัติใช้งาน เช่น รายการสินค้าที่ไม่เคยถูกส่ง)
export const dbDelete = query => req(query, 'DELETE', undefined, 'return=minimal');
