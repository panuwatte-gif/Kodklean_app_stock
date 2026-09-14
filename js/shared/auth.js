// ใครล็อกอินอยู่ — ที่เดียวของแอป หน้าอื่นเรียกผ่านไฟล์นี้เท่านั้น
import { LOGIN_USERS } from './config.js';

const KEY = 'kodklean.session';

// คืนคนที่ล็อกอินอยู่ (null = ยังไม่ล็อกอิน)
export function currentUser() {
  const code = localStorage.getItem(KEY);
  return LOGIN_USERS.find(u => u.code === code) || null;
}

// ตรวจรหัส PIN แล้วจำไว้ว่าใครเข้ามา
export function signIn(code, pin) {
  const u = LOGIN_USERS.find(x => x.code === code);
  if (!u || u.pin !== pin) return null;
  localStorage.setItem(KEY, u.code);
  return u;
}

export function signOut() { localStorage.removeItem(KEY); }

// สิทธิ์: แอดมินเห็นทุกหน้า คนอื่นเห็นทุกหน้าเว้นหน้าที่ระบุว่าแอดมินเท่านั้น
export const isAdmin = () => { const u = currentUser(); return !!u && u.role === 'admin'; };
