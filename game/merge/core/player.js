// ผู้เล่นคือใคร: อ่านรหัสพนักงานจากลิงก์ (?emp=) แล้วหาชื่อในฐาน ไม่มีรหัส = โหมดทดลอง
import { GAME, TEXT } from '../config.js';
import * as db from './db.js';

const q = new URLSearchParams(location.search);

export const P = {
  emp: q.get('emp') || '',
  fromVillage: q.get('from') === 'village',
  name: '',
  lang: q.get('lang') === 'my' ? 'my' : (q.get('lang') === 'th' ? 'th' : ''),
  guest: true
};

export async function loadPlayer() {
  if (P.emp) {
    try {
      const rows = await db.get(`${GAME.userTable}?branch_id=eq.${db.enc(GAME.branchId)}` +
        `&emp_code=eq.${db.enc(P.emp)}&select=name_th,language&limit=1`);
      const u = rows && rows[0];
      if (u) {
        P.name = u.name_th || P.emp;
        P.guest = false;
        if (!P.lang && (u.language === 'my' || u.language === 'th')) P.lang = u.language;
      }
    } catch { /* ฐานข้อมูลไม่ตอบ = เล่นโหมดทดลองไปก่อน */ }
  }
  if (!P.lang) P.lang = 'th';
  return P;
}

export const tx = key => (TEXT[P.lang] && TEXT[P.lang][key]) || TEXT.th[key] || key;

// ลิงก์กลับหมู่บ้าน ส่งรหัสพนักงานกลับไปด้วย
export const villageUrl = () => GAME.villagePage + (P.emp ? '?emp=' + encodeURIComponent(P.emp) : '');
