// คำถามรายวัน: ความรู้ / เมนู (คำ↔รูป↔เสียง) / ศัพท์ — บันไดคำใบ้ + เฉลยทุกข้อ
import { t, getLang } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { P, loadProgress, countQuestion, reward, dailyLeft } from '../core/progress.js';
import { menuQuestions, vocabQueue } from '../core/autoquiz.js';
import * as api from '../core/api.js';
import { S } from '../core/state.js';
import { RULES } from '../config.js';
import { ASSETS } from '../sprite_config.js';

const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

// สร้างชุดคำถามตามชนิดที่เลือก แล้วคืนเป็นรูปแบบกลางที่หน้าจอเดียววาดได้ทั้งหมด
async function buildQueue(kind) {
  if (kind === 'quiz-menu') {
    const menus = await api.listMenu().catch(() => []);
    const on = menus.filter(m => m.active && m.image_url);
    return shuffle(on.flatMap(m => menuQuestions(m, on))).slice(0, 10).map(q => ({
      pic: q.kind === 'img2word' ? q.prompt : null,
      audio: q.kind === 'audio2word' ? q.prompt : null,
      text: q.kind === 'word2img' ? q.prompt : null,
      picOptions: q.kind === 'word2img', options: q.options, answer: q.answer, explain: null
    }));
  }
  if (kind === 'quiz-vocab') {
    const rows = await api.listVocab().catch(() => []);
    return vocabQueue(rows).slice(0, 10).map(r => {
      const others = shuffle(rows.filter(x => x.id !== r.id)).slice(0, 3);
      const right = getLang() === 'my' && r.word_my ? r.word_my : r.word_th;
      return { text: r.word_en, options: shuffle([right, ...others.map(o =>
        getLang() === 'my' && o.word_my ? o.word_my : o.word_th)]), answer: right, explain: r.word_th };
    });
  }
  const qs = (await api.listQuestions().catch(() => [])).filter(q => q.active && q.category !== 'math');
  const mine = await api.myMastery(S.user.id).catch(() => []);
  const fresh = qs.filter(q => !mine.some(m => m.question_id === q.id && m.mastered));
  return shuffle(fresh.length ? fresh : qs).slice(0, Math.min(10, dailyLeft() || 10)).map(q => {
    const ch = (getLang() === 'my' && (q.choices_my || []).filter(Boolean).length ? q.choices_my : q.choices_th);
    return { id: q.id, pic: q.image_url, text: (getLang() === 'my' && q.q_my) || q.q_th,
      options: ch, answer: ch[q.answer_index], order: q.choices_th,
      explain: (getLang() === 'my' && q.explain_my) || q.explain_th };
  });
}

export async function mountQuiz(root, go, kind) {
  const mode = kind || 'quiz';
  root.innerHTML = topBar() + '<p class="sub" style="padding:16px 14px">' + t('loading') + '</p>';
  await loadProgress();
  const queue = await buildQueue(mode);
  let i = 0, wrong = 0, picked = null, done = 0;   // picked = ลำดับตัวเลือกที่แตะ (null = ยังไม่ตอบ)

  if (!queue.length) {
    root.innerHTML = topBar() + `<div class="card" style="text-align:center">
      <p class="h">${t('noQuestions')}</p><p class="sub">${t('noQuestionsSub')}</p>
      <button class="btn" style="margin-top:12px" data-back>${t('back')}</button></div>`;
    wireLang(root, go, 'school');
    root.querySelector('[data-back]').onclick = () => go('school');
    return;
  }

  const draw = () => {
    const q = queue[i];
    if (!q) return finish();
    const solved = picked !== null && q.options[picked] === q.answer;   // ตอบถูกแล้วหรือยัง
    const opt = (v, n) => q.picOptions
      ? `<button data-opt="${n}" style="border:0;background:none;padding:0;cursor:pointer;${picked === n && v !== q.answer ? 'opacity:.4' : ''}">
           <img src="${v}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:14px;box-shadow:var(--shadow);${solved && v === q.answer ? 'outline:3px solid var(--lime)' : ''}"></button>`
      : `<button class="btn" data-opt="${n}" style="min-height:52px;font-size:16px;background:${solved && v === q.answer ? 'var(--lime)' : picked === n ? '#E8B4B0' : '#fff'};color:${(solved && v === q.answer) || picked === n ? '#fff' : 'var(--green)'};box-shadow:var(--shadow)">${v}</button>`;
    root.innerHTML = topBar() + `
      <div class="card">
        <p class="sub">${t('qOf', { a: i + 1, b: queue.length })}${wrong ? ' · ' + t('tryAgainN', { n: wrong }) : ''}</p>
        ${q.pic ? `<img src="${q.pic}" alt="" style="width:100%;max-height:190px;object-fit:contain;border-radius:14px;margin:8px 0">` : ''}
        ${q.audio ? `<button class="btn btn--gold" data-play style="margin:8px 0">${t('playSound')}</button>` : ''}
        ${q.text ? `<p class="h" style="font-size:20px;line-height:1.5;text-wrap:pretty">${q.text}</p>` : ''}
      </div>
      <div class="card">
        <div style="display:grid;grid-template-columns:${q.picOptions ? '1fr 1fr' : '1fr'};gap:10px">
          ${q.options.map(opt).join('')}
        </div>
        ${picked !== null && !solved && wrong === 1 ? `<p class="sub" style="margin-top:10px;color:#B3241C">${t('hint1')}</p>` : ''}
        ${solved ? `<div style="margin-top:12px">
            <p class="h" style="color:var(--green)">${t('correct')}</p>
            ${q.explain ? `<p class="sub" style="background:var(--cream);border-radius:14px;padding:10px;color:var(--ink);line-height:1.6">${q.explain}</p>` : ''}
            <button class="btn" style="margin-top:10px" data-next>${i + 1 < queue.length ? t('next') : t('finish')}</button>
          </div>` : ''}
      </div>
      <div style="padding:0 14px 22px"><button class="btn" data-quit style="background:#fff;color:var(--green);box-shadow:var(--shadow)">${t('back')}</button></div>`;
    wireLang(root, go, mode);
    const audio = root.querySelector('[data-play]');
    if (audio) audio.onclick = () => new Audio(q.audio).play().catch(() => toast(t('noSound')));
    root.querySelector('[data-quit]').onclick = () => go('school');
    const nx = root.querySelector('[data-next]');
    if (nx) nx.onclick = () => { i++; wrong = 0; picked = null; draw(); };
    root.querySelectorAll('[data-opt]').forEach(b => b.onclick = async () => {
      if (solved) return;
      picked = Number(b.dataset.opt);
      const ok = q.options[picked] === q.answer;
      if (ok) {
        done++;
        await countQuestion(true);
        const up = await reward(RULES.rightWp, RULES.rightFood);
        if (q.id) api.setMastery(q.id, S.user.id, { mastered: wrong === 0, correct_streak: wrong === 0 ? 1 : 0 }).catch(() => {});
        draw();
        toast(up ? t('stageUp', { s: t('stage_' + up) }) : t('gotReward', { w: RULES.rightWp, f: RULES.rightFood }));
      } else {
        wrong++;
        await countQuestion(false);
        if (wrong >= 3) { picked = q.options.indexOf(q.answer); draw(); toast(t('showAnswer')); }
        else draw();
      }
    });
  };

  async function finish() {
    root.innerHTML = topBar() + `<div class="card" style="text-align:center">
      <img src="${ASSETS.village}bird-cheer.webp" alt="" width="140" height="140" style="object-fit:contain">
      <p class="h">${t('setFinished', { n: done })}</p>
      <button class="btn" style="margin-top:12px" data-back>${t('back')}</button></div>`;
    wireLang(root, go, 'school');
    root.querySelector('[data-back]').onclick = () => go('school');
  }
  draw();
}
