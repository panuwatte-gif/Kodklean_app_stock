// ทางเข้าออกข้อมูลทางเดียวของเกม (Supabase REST) — ค่าเชื่อมต่ออยู่ในไฟล์ connection.json
import { CONFIG } from '../config.js';

let conn = null;
// อ่านไฟล์ค่าเชื่อมต่อครั้งแรกที่ใช้ แล้วจำไว้
async function link() {
  if (!conn) conn = await (await fetch(new URL('../connection.json', import.meta.url))).json();
  return conn;
}

// ยิงคำขอไปฐานข้อมูล (ใส่หัวคำขอให้เองจากไฟล์ค่าเชื่อมต่อ)
async function req(path, method, body, prefer) {
  const c = await link();
  const h = { apikey: c.key, Authorization: c.scheme + ' ' + c.key, 'Content-Type': 'application/json' };
  if (prefer) h.Prefer = prefer;
  const r = await fetch(c.url + c.rest + path,
    { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.status === 204 ? null : r.json();
}

const RET = 'return=representation';
const MERGE = 'resolution=merge-duplicates,return=representation';
const branch = 'branch_id=eq.' + CONFIG.branchId;

export const get  = q => req(q, 'GET');
export const post = (tbl, body) => req(tbl, 'POST', body, RET);
export const patch = (q, body) => req(q, 'PATCH', body, RET);
const del = q => req(q, 'DELETE');                       // ลบแถว
const upsert = (tbl, rows) => req(tbl, 'POST', rows, MERGE);   // มีแล้วทับ ไม่มีก็เพิ่ม

export const listUsers = () => get(`game_users?${branch}&select=*&order=joined_at`);
export const findUser  = code => get(`game_users?${branch}&emp_code=eq.${encodeURIComponent(code)}&select=*`).then(r => r[0]);
export const saveUser  = (id, body) => patch('game_users?id=eq.' + id, body);

export const getCharacter = uid => get(`game_characters?user_id=eq.${uid}&select=*`).then(r => r[0]);
export const saveCharacter = (uid, body) => patch('game_characters?user_id=eq.' + uid, body);
export const listCharacters = () => get(`game_characters?${branch}&select=*`);

export const listPets = uid => get(`game_pets?user_id=eq.${uid}&select=*&order=is_zodiac`);
export const allPets  = () => get(`game_pets?${branch}&select=*`);
export const addPet   = body => post('game_pets', { branch_id: CONFIG.branchId, ...body });
export const savePet  = (id, body) => patch('game_pets?id=eq.' + id, body);

export const activeNotices = () => get(`game_announcements?${branch}&active=eq.true&select=*&order=created_at.desc`);
export const addNotice = body => post('game_announcements', { branch_id: CONFIG.branchId, ...body });
export const noticeReads = () => get('game_announcement_reads?select=announcement_id,user_id');
export const markRead = (aid, uid) => post('game_announcement_reads', { announcement_id: aid, user_id: uid });

// ---------- คลังเมนู ----------
export const listMenu = () => get(`game_menu_items?${branch}&select=*&order=created_at.desc`);
export const addMenu = body => post('game_menu_items', { branch_id: CONFIG.branchId, ...body });
export const saveMenu = (id, body) => patch('game_menu_items?id=eq.' + id, body);
export const delMenu = id => del('game_menu_items?id=eq.' + id);

// ---------- คลังศัพท์ ----------
export const listVocab = () => get(`game_vocab?${branch}&select=*&order=created_at.desc`);
export const addVocab = body => post('game_vocab', { branch_id: CONFIG.branchId, ...body });
export const saveVocab = (id, body) => patch('game_vocab?id=eq.' + id, body);
export const delVocab = id => del('game_vocab?id=eq.' + id);

// ---------- คำถามความรู้ ----------
export const listQuestions = () => get(`game_questions?${branch}&select=*&order=created_at.desc`);
export const addQuestions = rows => post('game_questions', rows.map(r => ({ branch_id: CONFIG.branchId, ...r })));
export const saveQuestion = (id, body) => patch('game_questions?id=eq.' + id, body);
export const delQuestion = id => del('game_questions?id=eq.' + id);
// ล้างสถานะ "จำได้แล้ว" ของคำถามหนึ่งข้อ ของพนักงานทุกคน
export const resetMastery = qid => del('game_question_mastery?question_id=eq.' + qid);

// ---------- สอบ ----------
export const listExams = () => get(`game_exams?${branch}&select=*&order=created_at.desc`);
export const addExam = body => post('game_exams', { branch_id: CONFIG.branchId, ...body });
export const saveExam = (id, body) => patch('game_exams?id=eq.' + id, body);
export const examResults = () => get('game_exam_results?select=*&order=taken_at.desc');

// ---------- กงล้อ ----------
export const listPrizes = () => get(`game_wheel_prizes?${branch}&select=*&order=wheel,slot`);
export const savePrizes = rows => upsert('game_wheel_prizes', rows.map(r => ({ branch_id: CONFIG.branchId, ...r })));
export const listSpins = () => get(`game_wheel_spins?${branch}&select=*&order=spun_at.desc&limit=100`);
export const paySpin = (id, paid) => patch('game_wheel_spins?id=eq.' + id, { paid });

// ---------- อัปโหลดไฟล์ (รูปเมนู / ไฟล์เสียง) ----------
export async function upload(file, folder) {
  const c = await link();
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = await fetch(c.url + c.storage + c.bucket + '/' + path, {
    method: 'POST',
    headers: { apikey: c.key, Authorization: c.scheme + ' ' + c.key,
      'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' },
    body: file
  });
  if (!r.ok) throw new Error(await r.text());
  return c.url + c.storage + 'public/' + c.bucket + '/' + path;
}

// ---------- ความคืบหน้ารายวัน / ห้องเรียนคณิต / ตั๋วกงล้อ ----------
const today = () => new Date().toISOString().slice(0, 10);

export const getDaily = uid => get(`game_daily?user_id=eq.${uid}&day=eq.${today()}&select=*`).then(r => r[0]);
export const saveDaily = body => upsert('game_daily', [{ day: today(), ...body }]);

export const getMath = uid => get(`game_math_progress?user_id=eq.${uid}&select=*`).then(r => r[0]);
export const saveMath = body => upsert('game_math_progress', [body]);

export const getTickets = uid => get(`game_tickets?user_id=eq.${uid}&select=*`).then(r => r[0]);
export const saveTickets = body => upsert('game_tickets', [body]);

export const setMastery = (qid, uid, body) => upsert('game_question_mastery', [{ question_id: qid, user_id: uid, ...body }]);
export const myMastery = uid => get(`game_question_mastery?user_id=eq.${uid}&select=*`);

export const activeExam = () => get(`game_exams?${branch}&active=eq.true&select=*&order=created_at.desc&limit=1`).then(r => r[0]);
export const addResult = body => post('game_exam_results', body);
export const myResults = uid => get(`game_exam_results?user_id=eq.${uid}&select=*&order=taken_at.desc`);
export const addSpin = body => post('game_wheel_spins', { branch_id: CONFIG.branchId, ...body });
