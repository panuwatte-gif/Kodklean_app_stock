// ใครล็อกอินอยู่ + จัดการบัญชีผู้ใช้ — ที่เดียวของแอป หน้าอื่นเรียกผ่านไฟล์นี้เท่านั้น
import { LOGIN_USERS } from './config.js';
import { get, save } from './data.js';

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

// รหัสพนักงานในฐานข้อมูลของคนที่ล็อกอินอยู่ (ตรงกับ kk_staff.code เช่น fah / emmy)
export const staffCode = () => (currentUser() || {}).avatar || '';

// สิทธิ์: แอดมินเห็นทุกหน้า คนอื่นเห็นทุกหน้าเว้นหน้าที่ระบุว่าแอดมินเท่านั้น
export const isAdmin = () => { const u = currentUser(); return !!u && u.role === 'admin'; };

// แอดมินแก้รหัสได้ทุกคน คนอื่นแก้ได้แค่ของตัวเอง
export function canEdit(code) {
  const me = currentUser();
  return !!me && (me.role === 'admin' || me.code === code);
}

// เปลี่ยน PIN ของบัญชีหนึ่ง (คืน '' = สำเร็จ, ไม่ว่าง = รหัสข้อผิดพลาด)
export function setPin(code, pin) {
  if (!canEdit(code)) return 'deny';
  if (!/^\d{4}$/.test(String(pin))) return 'pin';
  const rows = users();
  const row = rows.find(u => u.code === code);
  if (!row) return 'missing';
  row.pin = String(pin);
  save('users', rows);
  return '';
}

// เพิ่มบัญชีใหม่ (แอดมินเท่านั้น)
export function addUser({ code, name, pin, role, avatar }) {
  if (!isAdmin()) return 'deny';
  if (!/^\d{4}$/.test(String(code))) return 'code';
  if (!/^\d{4}$/.test(String(pin))) return 'pin';
  if (!String(name || '').trim()) return 'name';
  const rows = users();
  if (rows.some(u => u.code === String(code))) return 'dup';
  rows.push({ code: String(code), pin: String(pin), name: String(name).trim(), role: role || 'staff', avatar: avatar || 'ahhia' });
  save('users', rows);
  return '';
}

// ลบบัญชี (แอดมินเท่านั้น ห้ามลบตัวเอง และต้องเหลือแอดมินอย่างน้อย 1 คน)
export function removeUser(code) {
  if (!isAdmin()) return 'deny';
  const me = currentUser();
  if (me && me.code === code) return 'self';
  const rows = users();
  const row = rows.find(u => u.code === code);
  if (!row) return 'missing';
  if (row.role === 'admin' && rows.filter(u => u.role === 'admin').length <= 1) return 'lastAdmin';
  save('users', rows.filter(u => u.code !== code));
  return '';
}
