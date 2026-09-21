// ท่อคุยกับฐานข้อมูล Supabase (REST) — เรียกได้จาก data.js เท่านั้น ค่าเชื่อมต่ออยู่ในไฟล์ connection.json
let conn = null;

// อ่านไฟล์ค่าเชื่อมต่อครั้งแรกที่ใช้ แล้วจำไว้
async function link() {
  if (!conn) conn = await (await fetch(new URL('../../connection.json', import.meta.url))).json();
  return conn;
}

// ยิงคำขอไปฐานข้อมูลหนึ่งครั้ง (ใส่หัวคำขอให้เองจากไฟล์ค่าเชื่อมต่อ)
async function req(path, method, body, prefer) {
  const c = await link();
  const head = { apikey: c.key, Authorization: c.scheme + ' ' + c.key, 'Content-Type': 'application/json' };
  if (prefer) head.Prefer = prefer;
  const res = await fetch(c.url + c.rest + path, { method, headers: head, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// อ่านข้อมูล
export const dbGet = query => req(query, 'GET');

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

// เพิ่มแถว ถ้าชนกุญแจเดิมให้ทับแถวนั้น (ต้องใส่ ?on_conflict=คอลัมน์ ในชื่อตาราง)
export const dbUpsert = (query, rows) => req(query, 'POST', rows, 'resolution=merge-duplicates,return=minimal');

// เหมือน dbUpsert แต่ขอแถวผลลัพธ์กลับมาด้วย (ใช้ตอนต้องการ id ของแถวที่เพิ่งบันทึก)
export const dbUpsertBack = (query, rows) => req(query, 'POST', rows, 'resolution=merge-duplicates,return=representation');

// ลบแถวจริงตามเงื่อนไข (ใช้เฉพาะของที่ยังไม่มีประวัติใช้งาน เช่น รายการสินค้าที่ไม่เคยถูกส่ง)
export const dbDelete = query => req(query, 'DELETE', undefined, 'return=minimal');
