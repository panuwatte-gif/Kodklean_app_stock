// S4 โรงเรียน: การ์ดกิจกรรม 5 ใบ — ประตูเข้าสู่กิจกรรมเรียนรู้ทั้งหมด
import { t } from '../core/i18n.js';
import { topBar, wireLang } from '../core/ui.js';
import { P, loadProgress, dailyLeft } from '../core/progress.js';
import * as api from '../core/api.js';
import { RULES } from '../config.js';
import { ASSETS } from '../sprite_config.js';

const LEVEL_NAMES = ['', 'L1 นับ', 'L2 บวก-ลบ', 'L3 บวกเงิน', 'L4 ทอนเงิน', 'L5 คูณ', 'L6 หาร', 'L7 หน้างาน'];

export async function mountSchool(root, go) {
  root.innerHTML = topBar() + '<p class="sub" style="padding:16px 14px">' + t('loading') + '</p>';
  await loadProgress();
  const exam = await api.activeExam().catch(() => null);
  const left = dailyLeft();

  const card = (icon, title, sub, target, cta, disabled) => `<div class="card">
    <div style="display:flex;align-items:center;gap:12px">
      <img src="${icon}" alt="" width="52" height="52" style="object-fit:contain">
      <div style="flex:1"><p class="h" style="margin:0">${title}</p><p class="sub">${sub}</p></div>
    </div>
    <button class="btn${disabled ? '' : ' btn--gold'}" style="margin-top:12px" ${disabled ? 'disabled' : 'data-go="' + target + '"'}>${cta}</button>
  </div>`;

  root.innerHTML = topBar() + `
    <div style="text-align:center;padding:12px 0 0">
      <img src="${ASSETS.village}school.webp" alt="" width="150" height="150" style="object-fit:contain">
    </div>` +
    card(ASSETS.icons + 'cap.webp', t('actDaily'),
      t('dailyLeft', { a: P.daily.questions_done, b: RULES.dailyQuestions }), 'quiz',
      left ? t('actStart') : t('doneToday'), !left) +
    card(ASSETS.icons + 'wp.webp', t('actMath'),
      LEVEL_NAMES[P.math.level] + ' · ' + t(P.daily.math_sets_done ? 'setDone' : 'setOpen'), 'math', t('actStart')) +
    card(ASSETS.icons + 'food.webp', t('actMenu'), t('actMenuSub'), 'quiz-menu', t('actStart')) +
    card(ASSETS.village + 'board.webp', t('actMenuMy'), t('actMenuMySub'), 'quiz-menumy', t('actStart')) +
    card(ASSETS.icons + 'bell.webp', t('actVocab'), t('actVocabSub'), 'quiz-vocab', t('actStart')) +
    card(ASSETS.icons + 'trophy.webp', t('actExam'),
      exam ? exam.title + ' · ' + exam.start_date + ' → ' + exam.end_date : t('noExam'), 'exam',
      exam ? t('actStart') : t('noExam'), !exam) +
    '<div style="height:14px"></div>';
  wireLang(root, go, 'school');
  root.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
}
