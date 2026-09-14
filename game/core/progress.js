// นับความคืบหน้าของผู้เล่น — แต้ม อาหาร ตั๋ว ระดับคณิต อยู่ที่ไฟล์นี้ที่เดียว
import * as api from './api.js';
import { S, stageOf } from './state.js';
import { RULES } from '../config.js';

export const P = { daily:null, math:null, tickets:null };

export async function loadProgress() {
  const [d, m, t] = await Promise.all([
    api.getDaily(S.user.id).catch(() => null),
    api.getMath(S.user.id).catch(() => null),
    api.getTickets(S.user.id).catch(() => null)
  ]);
  P.daily = d || { user_id: S.user.id, questions_done: 0, correct_done: 0, math_sets_done: 0 };
  P.math = m || { user_id: S.user.id, level: 1, recent: [], lessons_seen: [], wrong_streak: 0 };
  P.tickets = t || { user_id: S.user.id, big: 0, small: 0 };
  return P;
}

// ให้รางวัล: แต้มปัญญา + อาหาร แล้วคืนวัยใหม่ถ้าเลื่อนวัย
export async function reward(wp, food) {
  const before = stageOf(S.chr.wp);
  S.chr.wp += wp; S.chr.food += food;
  const after = stageOf(S.chr.wp);
  S.chr.stage = after;
  await api.saveCharacter(S.user.id, { wp: S.chr.wp, food: S.chr.food, stage: after }).catch(() => {});
  return after !== before ? after : null;
}

// บันทึกว่าวันนี้ตอบไปกี่ข้อ ถูกกี่ข้อ
export async function countQuestion(correct) {
  P.daily.questions_done += 1;
  if (correct) P.daily.correct_done += 1;
  await api.saveDaily({ user_id: S.user.id, questions_done: P.daily.questions_done,
    correct_done: P.daily.correct_done, math_sets_done: P.daily.math_sets_done }).catch(() => {});
}

export const dailyLeft = () => Math.max(0, RULES.dailyQuestions - P.daily.questions_done);

// ผลข้อคณิต: ทำเองถูกนับเข้า 10 ข้อล่าสุด ถูก 8/10 = ปลดล็อกระดับถัดไป
export async function mathResult(ok, usedHint) {
  const recent = [...(P.math.recent || []), ok && !usedHint ? 1 : 0].slice(-10);
  P.math.recent = recent;
  P.math.wrong_streak = ok ? 0 : (P.math.wrong_streak || 0) + 1;
  let levelUp = null;
  const score = recent.reduce((a, b) => a + b, 0);
  if (recent.length === 10 && score >= 8 && P.math.level < 7) { P.math.level += 1; P.math.recent = []; levelUp = P.math.level; }
  await api.saveMath({ user_id: S.user.id, level: P.math.level, recent: P.math.recent,
    lessons_seen: P.math.lessons_seen, wrong_streak: P.math.wrong_streak }).catch(() => {});
  if (levelUp) await reward(RULES.levelUpWp, 0);
  return levelUp;
}

export async function markLessonSeen(level) {
  const seen = [...(P.math.lessons_seen || [])];
  if (seen.includes(level)) return;
  seen.push(level);
  P.math.lessons_seen = seen;
  await api.saveMath({ user_id: S.user.id, level: P.math.level, recent: P.math.recent,
    lessons_seen: seen, wrong_streak: P.math.wrong_streak }).catch(() => {});
}

// จบชุดคณิต 10 ข้อ: วันละชุดเดียวที่ได้รางวัล
export async function finishMathSet() {
  if (P.daily.math_sets_done > 0) return false;
  P.daily.math_sets_done = 1;
  await api.saveDaily({ user_id: S.user.id, questions_done: P.daily.questions_done,
    correct_done: P.daily.correct_done, math_sets_done: 1 }).catch(() => {});
  await reward(RULES.setWp, RULES.setFood);
  return true;
}

export async function addTicket(kind, n = 1) {
  P.tickets[kind] += n;
  await api.saveTickets({ user_id: S.user.id, big: P.tickets.big, small: P.tickets.small }).catch(() => {});
}

export async function useTicket(kind) {
  if (P.tickets[kind] <= 0) return false;
  P.tickets[kind] -= 1;
  await api.saveTickets({ user_id: S.user.id, big: P.tickets.big, small: P.tickets.small }).catch(() => {});
  return true;
}
