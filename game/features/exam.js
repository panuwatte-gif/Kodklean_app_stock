// สอบรายเดือน: สุ่มข้อจากหมวดที่แอดมินเปิด ปิดคำใบ้ ตัดเกรดแล้วให้รางวัลตามเกรด
import { t, getLang } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { loadProgress, reward, addTicket } from '../core/progress.js';
import * as api from '../core/api.js';
import { S } from '../core/state.js';
import { ASSETS } from '../sprite_config.js';

const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);
const gradeOf = pct => pct >= 90 ? 'A' : pct >= 75 ? 'B' : pct >= 60 ? 'C' : 'F';

// รางวัลตามเกรด (สเปกข้อ 10)
async function payout(grade) {
  if (grade === 'A') { await addTicket('big', 1); return t('examPrizeA'); }
  if (grade === 'B') { await reward(100, 20); return t('examPrizeB'); }
  if (grade === 'C') { await reward(0, 10); return t('examPrizeC'); }
  return t('examPrizeF');
}

export async function mountExam(root, go) {
  root.innerHTML = topBar() + '<p class="sub" style="padding:16px 14px">' + t('loading') + '</p>';
  await loadProgress();
  const exam = await api.activeExam().catch(() => null);
  if (!exam) return done(t('noExam'), '');

  const all = (await api.listQuestions().catch(() => [])).filter(q =>
    q.active && (exam.categories || []).includes(q.category));
  const queue = shuffle(all).slice(0, exam.question_count || 20);
  const mine = await api.myResults(S.user.id).catch(() => []);
  const attempt = mine.filter(r => r.exam_id === exam.id).length + 1;
  let i = 0, score = 0, picked = null, phase = queue.length ? 'play' : 'empty';

  function done(title, sub) {
    root.innerHTML = topBar() + `<div class="card" style="text-align:center">
      <img src="${ASSETS.icons}trophy.webp" alt="" width="96" height="96" style="object-fit:contain">
      <p class="h">${title}</p><p class="sub">${sub}</p>
      <button class="btn" style="margin-top:12px" data-back>${t('back')}</button></div>`;
    wireLang(root, go, 'school');
    root.querySelector('[data-back]').onclick = () => go('school');
  }

  async function finish() {
    const pct = Math.round(score / queue.length * 100), grade = gradeOf(pct);
    const prize = await payout(grade);
    await api.addResult({ exam_id: exam.id, user_id: S.user.id, score, total: queue.length, grade, attempt }).catch(() => {});
    done(t('examResult', { s: score, n: queue.length, g: grade }), prize);
  }

  function draw() {
    if (phase === 'empty') return done(t('noQuestions'), t('noQuestionsSub'));
    const q = queue[i];
    const ch = (getLang() === 'my' && (q.choices_my || []).filter(Boolean).length ? q.choices_my : q.choices_th);
    root.innerHTML = topBar() + `
      <div class="card">
        <p class="sub">${exam.title} · ${t('qOf', { a: i + 1, b: queue.length })} · ${t('attemptN', { n: attempt })}</p>
        ${q.image_url ? `<img src="${q.image_url}" alt="" style="width:100%;max-height:180px;object-fit:contain;border-radius:14px;margin:8px 0">` : ''}
        <p class="h" style="font-size:19px;line-height:1.5;text-wrap:pretty">${(getLang() === 'my' && q.q_my) || q.q_th}</p>
      </div>
      <div class="card">
        <div style="display:grid;gap:10px">${ch.map((v, n) => `<button class="btn" data-opt="${n}"
          style="min-height:52px;font-size:16px;background:${picked === String(n) ? 'var(--green)' : '#fff'};
          color:${picked === String(n) ? '#fff' : 'var(--green)'};box-shadow:var(--shadow)">${v}</button>`).join('')}</div>
        <button class="btn btn--gold" style="margin-top:14px" data-send ${picked === null ? 'disabled' : ''}>
          ${i + 1 < queue.length ? t('next') : t('finish')}</button>
        <p class="sub" style="margin-top:8px">${t('examNoHint')}</p>
      </div>`;
    wireLang(root, go, 'exam');
    root.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => { picked = b.dataset.opt; draw(); });
    root.querySelector('[data-send]').onclick = async () => {
      if (picked === null) return;
      if (Number(picked) === q.answer_index) score++;
      picked = null;
      if (i + 1 < queue.length) { i++; draw(); } else await finish();
    };
  }
  draw();
}
