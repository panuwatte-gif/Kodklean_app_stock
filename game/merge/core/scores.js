// คะแนน: บันทึกลงฐาน + กระดานอันดับ (คนละ 1 แถว เอาคะแนนดีที่สุดของแต่ละคน)
import { GAME } from '../config.js';
import * as db from './db.js';
import { P } from './player.js';

const bestKey = () => 'kk.merge.best.' + (P.emp || 'guest');

export function localBest() {
  try { return Number(localStorage.getItem(bestKey())) || 0; } catch { return 0; }
}
export function setLocalBest(v) {
  try { localStorage.setItem(bestKey(), String(v)); } catch { /* ไม่เป็นไร */ }
}

export async function save(score, topTier) {
  if (P.guest || score <= 0) return false;
  await db.post(GAME.scoreTable, [{
    branch_id: GAME.branchId, emp_code: P.emp, name: P.name, score, top_tier: topTier
  }]);
  return true;
}

export async function top() {
  const rows = await db.get(`${GAME.scoreTable}?branch_id=eq.${db.enc(GAME.branchId)}` +
    '&select=emp_code,name,score,top_tier&order=score.desc&limit=300');
  const seen = new Set(), out = [];
  for (const r of rows || []) {
    if (seen.has(r.emp_code)) continue;
    seen.add(r.emp_code);
    out.push(r);
  }
  return out;
}

// คะแนนดีที่สุดของผู้เล่นคนนี้จากฐาน (ใช้ตอนเปิดเกมบนเครื่องใหม่)
export async function myBest() {
  if (P.guest) return 0;
  const rows = await db.get(`${GAME.scoreTable}?branch_id=eq.${db.enc(GAME.branchId)}` +
    `&emp_code=eq.${db.enc(P.emp)}&select=score&order=score.desc&limit=1`);
  return (rows && rows[0] && rows[0].score) || 0;
}
