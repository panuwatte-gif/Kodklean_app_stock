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

// เพิ่มแถวใหม่ (คืนแถวที่เพิ่งเพิ่ม)
export const dbPost = (table, rows) => req(table, 'POST', rows, 'return=representation');

// แก้เฉพาะช่องสถานะของแถวที่ตรงเงื่อนไข (ไม่ดึงผลกลับ)
export const dbPatch = (query, body) => req(query, 'PATCH', body, 'return=minimal');

// เพิ่มแถว ถ้าชนกุญแจเดิมให้ทับแถวนั้น (ต้องใส่ ?on_conflict=คอลัมน์ ในชื่อตาราง)
export const dbUpsert = (query, rows) => req(query, 'POST', rows, 'resolution=merge-duplicates,return=minimal');
