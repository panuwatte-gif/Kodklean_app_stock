// คำถามรายวัน: ความรู้ / เมนู (คำ↔รูป↔เสียง) / ศัพท์ — บันไดคำใบ้ + เฉลยทุกข้อ
import { t, getLang } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { P, loadProgress, countQuestion, reward, dailyLeft } from '../core/progress.js';
import { menuPicQuestion, menuMyQuestion, mixTwoKinds, vocabQueue } from '../core/autoquiz.js';
import * as api from '../core/api.js';
import { S } from '../core/state.js';
import { RULES } from '../config.js';
import { ASSETS } from '../sprite_config.js';

const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

// ดึงคำถามหมวด menu_my จากคลังคำถาม แล้วแปลงเป็นรูปแบบกลางของหน้าคำถาม
async function menuMyRows() {
  const rows = (await api.listQuestions().catch(() => [])).filter(q => q.active && q.category === 'menu_my');
  return rows.map(menuMyQuestion).filter(q => q.options.length && q.answer);
}

// สร้างชุดคำถามตามชนิดที่เลือก แล้วคืนเป็นรูปแบบกลางที่หน้าจอเดียววาดได้ทั้งหมด
async function buildQueue(kind) {
  if (kind === 'quiz-menu') {
    // ฝึกอ่านเมนู: ชุดละ 10 ข้อ สุ่มสลับ 2 แบบ — ชื่อเมนู→เลือกรูป และ ชื่อไทย→ภาษาพม่า
    const menus = await api.listMenu().catch(() => []);
    const pics = menus.filter(m => m.active && m.image_url);
    const byPic = pics.map(m => menuPicQuestion(m, pics)).filter(Boolean);
    return mixTwoKinds(byPic, await menuMyRows(), 10);
  }
  if (kind === 'quiz-menumy') return shuffle(await menuMyRows()).slice(0, 10);
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
  let i = 0, wrong = 0, picked = null, done = 0, tried = [];   // picked = ลำดับตัวเลือกที่แตะ / tried = ที่แตะผิดมาแล้ว

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
    // กรอบรูป: เขียว = คำตอบที่ถูก / แดง = รูปที่แตะผิด
    const frame = (v, n) => solved && v === q.answer ? 'var(--lime)'
      : tried.indexOf(n) >= 0 && v !== q.answer ? '#D93B30' : 'transparent';
    const opt = (v, n) => q.picOptions
      ? `<button data-opt="${n}" style="border:0;background:none;padding:0;cursor:pointer;display:block;width:100%;text-align:center">
           <img src="${v}" alt="" style="display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px;box-shadow:var(--shadow);border:4px solid ${frame(v, n)}">
           ${solved ? `<p class="sub" style="margin:6px 0 0;font-size:13px;line-height:1.35;color:${v === q.answer ? 'var(--green)' : 'var(--muted)'}">${q.optionNames[n]}</p>` : ''}
         </button>`
      : `<button class="btn" data-opt="${n}" style="min-height:52px;font-size:16px;background:${solved && v === q.answer ? 'var(--lime)' : picked === n ? '#E8B4B0' : '#fff'};color:${(solved && v === q.answer) || picked === n ? '#fff' : 'var(--green)'};box-shadow:var(--shadow)">${v}</button>`;
    root.innerHTML = topBar() + `
      <div class="card">
        <p class="sub">${t('qOf', { a: i + 1, b: queue.length })}${wrong ? ' · ' + t('tryAgainN', { n: wrong }) : ''}</p>
        ${q.pic ? `<img src="${q.pic}" alt="" style="width:100%;max-height:190px;object-fit:contain;border-radius:14px;margin:8px 0">` : ''}
        ${q.text ? `<p class="h" style="font-size:${q.big ? 27 : 20}px;line-height:1.45;text-align:${q.big ? 'center' : 'left'};text-wrap:pretty">${q.text}</p>` : ''}
        ${q.speak ? `<div style="display:flex;justify-content:center"><button class="btn btn--gold" data-speak style="width:auto;min-height:44px;padding:0 22px">🔊 ${t('playSound')}</button></div>` : ''}
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
    // อ่านชื่อเมนูเป็นภาษาไทยด้วยเสียงของเครื่อง
    const say = root.querySelector('[data-speak]');
    if (say) say.onclick = () => {
      const synth = window.speechSynthesis;
      if (!synth) return toast(t('noSound'));
      const u = new SpeechSynthesisUtterance(q.speak);
      u.lang = 'th-TH'; u.rate = 0.9;
      synth.cancel(); synth.speak(u);
    };
    root.querySelector('[data-quit]').onclick = () => go('school');
    const nx = root.querySelector('[data-next]');
    if (nx) nx.onclick = () => { i++; wrong = 0; picked = null; tried = []; draw(); };
    root.querySelectorAll('[data-opt]').forEach(b => b.onclick = async () => {
      if (solved) return;
      picked = Number(b.dataset.opt);
      const ok = q.options[picked] === q.answer;
      if (!ok && tried.indexOf(picked) < 0) tried.push(picked);
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
