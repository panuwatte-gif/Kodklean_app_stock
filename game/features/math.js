// S4b ห้องเรียนคณิต L1–L7: สอนก่อนถาม → บันไดคำใบ้ → เลื่อนระดับด้วยความชำนาญ
import { t } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { P, loadProgress, mathResult, markLessonSeen, finishMathSet } from '../core/progress.js';
import { makeTask, hintText } from './math/gen.js';
import * as tools from './math/tools.js';
import { ASSETS } from '../sprite_config.js';

const NAMES = ['', 'L1 นับ 1-20', 'L2 บวก-ลบ ไม่เกิน 10', 'L3 บวกเงิน', 'L4 ทอนเงิน',
  'L5 คูณ (นับข้าม)', 'L6 หาร แบ่งเท่าๆ กัน', 'L7 หน้างาน จัดคิวปั่น'];
const SET = 10;

export async function mountMath(root, go) {
  root.innerHTML = topBar() + '<p class="sub" style="padding:16px 14px">' + t('loading') + '</p>';
  await loadProgress();
  let level = P.math.level, phase = 'menu', idx = 0, hint = 0;
  let task = null, st = null, answer = null, checked = null;

  // เริ่มระดับ: ยังไม่เคยดูบทเรียนระดับนี้ = ให้ดูบทเรียนก่อน (กติกาข้อ 2)
  const start = lv => {
    level = lv; idx = 0;
    phase = (P.math.lessons_seen || []).includes(lv) ? 'play' : 'lesson';
    newTask(); draw();
  };
  const newTask = () => { task = makeTask(level); st = tools.initState(task); hint = 0; answer = null; checked = null; };

  function menu() {
    const recent = P.math.recent || [];
    return `<div style="text-align:center;padding:10px 0 0">
        <img src="${ASSETS.icons}cap.webp" alt="" width="86" height="86" style="object-fit:contain">
        <p class="h">${t('actMath')}</p>
        <p class="sub">${t('mathSkill', { a: recent.reduce((a, b) => a + b, 0), b: recent.length })}</p>
      </div>
      <div class="card">${NAMES.slice(1).map((n, k) => {
        const lv = k + 1, locked = lv > P.math.level;
        return `<div class="row">
          <span style="flex:1${locked ? ';color:var(--muted)' : ''}">${n}</span>
          ${lv === P.math.level ? '<span class="lang" style="background:var(--gold);color:#4A3E30">' + t('mathNow') + '</span>' : ''}
          <button class="lang" ${locked ? 'disabled style="background:#EDE2D0;color:#B4A893"'
            : 'data-lv="' + lv + '" style="background:var(--green);color:#fff"'}>${locked ? t('locked') : t('actStart')}</button>
        </div>`; }).join('')}</div>
      <div style="padding:0 14px 22px"><button class="btn" data-back style="background:#fff;color:var(--green);box-shadow:var(--shadow)">${t('back')}</button></div>`;
  }

  function lesson() {
    return `<div class="card" style="text-align:center">
        <p class="sub">${t('lessonTitle')}</p>
        <p class="h">${NAMES[level]}</p>
        <p class="sub" style="background:var(--cream);border-radius:14px;padding:12px;color:var(--ink);line-height:1.7;text-align:left">
          ${hintText(task, 1)}<br>${hintText(task, 2)}</p>
      </div>
      <div class="card">${tools.render(task, st, 2)}</div>
      <div style="padding:0 14px 22px"><button class="btn btn--gold" data-lesson-done>${t('lessonDone')}</button></div>`;
  }

  function play() {
    return `<div class="card">
        <p class="sub">${NAMES[level]} · ${t('qOf', { a: idx + 1, b: SET })}</p>
        ${tools.render(task, st, hint)}
        ${hint > 0 ? `<p class="sub" style="background:var(--cream);border-radius:14px;padding:10px;margin-top:10px;color:var(--ink);line-height:1.6">${hintText(task, hint)}</p>` : ''}
        ${checked === true ? `<p class="h" style="color:var(--green);margin-top:10px">${t('correct')}</p>` : ''}
        ${checked === false ? `<p class="h" style="color:#B3241C;margin-top:10px">${t('tryAgain')}</p>` : ''}
      </div>
      <div style="padding:0 14px 8px">
        ${checked === true
          ? `<button class="btn" data-next>${idx + 1 < SET ? t('next') : t('finish')}</button>`
          : `<button class="btn btn--gold" data-check ${answer === null ? 'disabled' : ''}>${t('confirm')}</button>`}
      </div>
      <div style="padding:0 14px 22px"><button class="btn" data-quit style="background:#fff;color:var(--green);box-shadow:var(--shadow)">${t('back')}</button></div>`;
  }

  function draw() {
    root.innerHTML = topBar() + (phase === 'menu' ? menu() : phase === 'lesson' ? lesson() : play());
    wireLang(root, go, 'math');
    const q = s => root.querySelector(s);
    if (phase === 'menu') {
      root.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => start(Number(b.dataset.lv)));
      q('[data-back]').onclick = () => go('school');
      return;
    }
    if (phase === 'lesson') {
      q('[data-lesson-done]').onclick = async () => { await markLessonSeen(level); phase = 'play'; newTask(); draw(); };
      return;
    }
    tools.wire(root, task, st, v => { answer = v; draw(); });
    q('[data-quit]').onclick = () => { phase = 'menu'; draw(); };
    const nx = q('[data-next]');
    if (nx) nx.onclick = async () => {
      if (idx + 1 < SET) { idx++; newTask(); draw(); return; }
      const got = await finishMathSet();
      toast(got ? t('setReward') : t('setAlready'));
      phase = 'menu'; await loadProgress(); draw();
    };
    const ck = q('[data-check]');
    if (ck) ck.onclick = async () => {
      if (answer === null) return;
      if (Number(answer) === task.answer) {
        checked = true;
        const up = await mathResult(true, hint > 0);
        draw();
        if (up) toast(t('mathLevelUp', { n: up }));
        return;
      }
      // ผิด: ไต่บันไดคำใบ้ ไม่มีทางตัน (กติกาข้อ 3)
      hint = Math.min(3, hint + 1);
      checked = false;
      await mathResult(false, true);
      if (hint >= 3) { st = tools.initState(task); answer = null; toast(t('showAnswer')); }
      if ((P.math.wrong_streak || 0) >= 3) { P.math.wrong_streak = 0; phase = 'lesson'; }
      draw();
    };
  }
  draw();
}
