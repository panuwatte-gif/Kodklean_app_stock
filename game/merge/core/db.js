// ท่อคุยกับฐานข้อมูล Supabase ของเกมรวมร่าง
// หาไฟล์ค่าเชื่อมต่อเอง: อยู่ในโฟลเดอร์เกมหมู่บ้าน = ใช้ของหมู่บ้าน, แยกเดี่ยว = ใช้ของตัวเอง
// ลำดับที่หา: merge/connection.json (วางแยกเดี่ยว) → game/connection.json (อยู่ในเกมหมู่บ้าน)
const PLACES = ['../connection.json', '../../connection.json'];
let pending = null;   // หาครั้งเดียว ใครเรียกพร้อมกันก็รอผลเดียวกัน · ได้ null = ไม่มีฐาน (เล่นได้แต่ไม่บันทึก)

function link() {
  if (!pending) pending = (async () => {
    for (const p of PLACES) {
      try {
        const r = await fetch(new URL(p, import.meta.url), { cache: 'no-store' });
        if (r.ok) { const c = await r.json(); if (c && c.url && c.key) return c; }
      } catch { /* ลองที่ถัดไป */ }
    }
    return null;
  })();
  return pending;
}

export const online = async () => !!(await link());

async function req(path, method, body) {
  const c = await link();
  if (!c) throw new Error('no-connection');
  const h = { apikey: c.key, Authorization: (c.scheme || 'Bearer') + ' ' + c.key, 'Content-Type': 'application/json' };
  if (method === 'POST') h.Prefer = 'return=minimal';
  const r = await fetch(c.url + (c.rest || '/rest/v1/') + path,
    { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

export const get = q => req(q, 'GET');
export const post = (table, rows) => req(table, 'POST', rows);
export const enc = encodeURIComponent;
