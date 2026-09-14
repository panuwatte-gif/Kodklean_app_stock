// สถานะของผู้เล่นที่กำลังเล่นอยู่ — หน้าอื่นอ่านผ่านตัวนี้ตัวเดียว
import * as api from './api.js';
import { setLang } from './i18n.js';
import { STAGES } from '../sprite_config.js';
import { ZODIAC } from '../config.js';

const KEY = 'imjai.session';
export const S = { user:null, chr:null, pets:[], users:[] };

export const stageOf = wp => STAGES.reduce((a, s) => (wp >= s.wp ? s.id : a), STAGES[0].id);
export const nextStageWp = wp => (STAGES.find(s => s.wp > wp) || {}).wp || null;

// โหลดข้อมูลผู้เล่นทั้งชุดจากฐาน แล้วเก็บไว้ในหน่วยความจำ
export async function loadUser(user) {
  S.user = user;
  setLang(user.language || 'th');
  localStorage.setItem(KEY, user.emp_code);
  [S.chr, S.pets, S.users] = await Promise.all([api.getCharacter(user.id), api.listPets(user.id), api.listUsers()]);
  await ensureZodiacPet();
  return S;
}

// กฎ: ใครมีราศีแล้วต้องมีสัตว์ตำนานประจำราศีทันที — เช็กทุกครั้งที่เข้าเกม
// (คนที่ผ่าน onboarding ไปก่อนหน้านี้จะได้สัตว์ย้อนหลังให้ด้วย)
async function ensureZodiacPet() {
  const zod = S.user && S.user.zodiac_auto;
  if (!zod || S.pets.some(p => p.is_zodiac)) return;
  const row = ZODIAC.find(z => z[0] === zod);
  if (!row) return;
  try {
    const [pet] = await api.addPet({ user_id: S.user.id, species_id: row[2], is_zodiac: true });
    if (pet) S.pets.push(pet);
  } catch (err) { /* ต่อฐานไม่ได้ก็ปล่อยไป ไม่ให้เกมค้าง */ }
}

export function signOut() { localStorage.removeItem(KEY); S.user = null; S.chr = null; S.pets = []; }

// เพิ่มแต้มปัญญา แล้วคืนว่าเลื่อนวัยหรือยัง
export async function addWp(n) {
  const before = stageOf(S.chr.wp);
  S.chr.wp += n;
  const after = stageOf(S.chr.wp);
  await api.saveCharacter(S.user.id, { wp: S.chr.wp, stage: after });
  S.chr.stage = after;
  return after !== before ? after : null;
}
