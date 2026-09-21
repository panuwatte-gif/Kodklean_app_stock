// ใครล็อกอินอยู่ + จัดการบัญชีผู้ใช้ — ที่เดียวของแอป หน้าอื่นเรียกผ่านไฟล์นี้เท่านั้น
import { LOGIN_USERS } from './config.js';
import { get, save, getAccounts, saveAccountPin, addAccount, removeAccount } from './data.js';

const KEY = 'kodklean.session';

// รายชื่อบัญชีทั้งหมด (ถ้ายังไม่เคยแก้ในแอป ใช้ตารางตั้งต้นจาก config)
export function users() {
  const rows = get('users');
  return rows.length ? rows : LOGIN_USERS.map(u => ({ ...u }));
}

// คืนคนที่ล็อกอินอยู่ (null = ยังไม่ล็อกอิน)
export function currentUser() {
  const code = localStorage.getItem(KEY);
  return users().find(u => u.code === code) || null;
}

// ตรวจรหัส PIN แล้วจำไว้ว่าใครเข้ามา
export function signIn(code, pin) {
  const u = users().find(x => x.code === code);
  if (!u || u.pin !== pin) return null;
  localStorage.setItem(KEY, u.code);
  return u;
}

export function signOut() { localStorage.removeItem(KEY); }

// เปิดหน้า "งานของฉัน" ของใครอยู่ (จำไว้ตอนกดการ์ดพนักงาน · ไม่ได้เลือก = ตัวเอง)
const WORK_KEY = 'kodklean.workstaff';
export function setWorkStaff(code) { localStorage.setItem(WORK_KEY, code || ''); }
export function workStaff() { return localStorage.getItem(WORK_KEY) || staffCode(); }

// รหัสพนักงานในฐานข้อมูลของคนที่ล็อกอินอยู่ (ตรงกับ kk_staff.code เช่น fah / emmy)
export const staffCode = () => (currentUser() || {}).avatar || '';

// สิทธิ์: แอดมินเห็นทุกหน้า คนอื่นเห็นทุกหน้าเว้นหน้าที่ระบุว่าแอดมินเท่านั้น
export const isAdmin = () => { const u = currentUser(); return !!u && u.role === 'admin'; };

// แอดมินแก้รหัสได้ทุกคน คนอื่นแก้ได้แค่ของตัวเอง
export function canEdit(code) {
  const me = currentUser();
  return !!me && (me.role === 'admin' || me.code === code);
}

// ดึงรายชื่อบัญชีล่าสุดจากฐานมาทับรายชื่อในเครื่อง — เรียกครั้งเดียวตอนเปิดแอป
// (เพิ่ม/ลบ/แก้ PIN จากเครื่องไหนก็เห็นตรงกันทุกเครื่อง และตรงกับเกมหมู่บ้าน)
export async function loadAccounts() {
  try {
    const rows = await getAccounts();
    if (!rows || !rows.length) return;
    const old = users();
    save('users', rows.map(r => {
      const was = old.find(u => u.code === String(r.emp_code)) || {};
      return {
        code: String(r.emp_code), pin: String(r.pin), name: r.name_th, role: r.role,
        avatar: r.staff_code || was.avatar || 'ahhia', gameFolder: r.asset_folder || was.gameFolder || ''
      };
    }));
  } catch (err) { /* ต่อฐานไม่ได้ ใช้รายชื่อที่เคยบันทึกไว้ในเครื่องต่อไป */ }
}

// เปลี่ยน PIN ของบัญชีหนึ่ง (คืน '' = สำเร็จ, ไม่ว่าง = รหัสข้อผิดพลาด)
export async function setPin(code, pin) {
  if (!canEdit(code)) return 'deny';
  if (!/^\d{4}$/.test(String(pin))) return 'pin';
  const rows = users();
  const row = rows.find(u => u.code === code);
  if (!row) return 'missing';
  try { await saveAccountPin(code, pin); } catch (err) { return 'save'; }
  row.pin = String(pin);
  save('users', rows);
  return '';
}

// เพิ่มบัญชีใหม่ (แอดมินเท่านั้น) — บันทึกลงฐานก่อน แล้วค่อยจำในเครื่อง
export async function addUser({ code, name, pin, role, avatar }) {
  if (!isAdmin()) return 'deny';
  if (!/^\d{4}$/.test(String(code))) return 'code';
  if (!/^\d{4}$/.test(String(pin))) return 'pin';
  if (!String(name || '').trim()) return 'name';
  const rows = users();
  if (rows.some(u => u.code === String(code))) return 'dup';
  const staff = avatar || 'ahhia';
  const folder = (rows.find(u => u.avatar === staff) || {}).gameFolder || 'person_01';
  try {
    await addAccount({
      emp_code: String(code), pin: String(pin), name_th: String(name).trim(),
      role: role || 'staff', staff_code: staff, asset_folder: folder
    });
  } catch (err) { return 'save'; }
  rows.push({ code: String(code), pin: String(pin), name: String(name).trim(), role: role || 'staff', avatar: staff, gameFolder: folder });
  save('users', rows);
  return '';
}

// ลบบัญชี (แอดมินเท่านั้น ห้ามลบตัวเอง และต้องเหลือแอดมินอย่างน้อย 1 คน)
export async function removeUser(code) {
  if (!isAdmin()) return 'deny';
  const me = currentUser();
  if (me && me.code === code) return 'self';
  const rows = users();
  const row = rows.find(u => u.code === code);
  if (!row) return 'missing';
  if (row.role === 'admin' && rows.filter(u => u.role === 'admin').length <= 1) return 'lastAdmin';
  try { await removeAccount(code); } catch (err) { return 'save'; }
  save('users', rows.filter(u => u.code !== code));
  return '';
}
