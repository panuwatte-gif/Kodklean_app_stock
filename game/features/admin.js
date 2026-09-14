// S9 แอดมิน — โครง 9 แท็บ เนื้อของแต่ละแท็บอยู่ไฟล์ตัวเองใน features/admin/
import { topBar, wireLang, toast } from '../core/ui.js';
import { t } from '../core/i18n.js';
import { S } from '../core/state.js';
import * as api from '../core/api.js';
import * as menu from './admin/menu.js';
import * as vocab from './admin/vocab.js';
import * as questions from './admin/questions.js';
import * as staff from './admin/staff.js';
import * as notice from './admin/notice.js';
import * as exam from './admin/exam.js';
import * as wheel from './admin/wheel.js';
import * as stat from './admin/stat.js';
import * as sprite from './admin/sprite.js';

const TABS = [
  ['menu', 'คลังเมนู', menu], ['vocab', 'คลังศัพท์', vocab], ['questions', 'คำถามความรู้', questions],
  ['staff', 'พนักงาน', staff], ['notice', 'ประกาศ', notice], ['exam', 'สอบ', exam],
  ['wheel', 'กงล้อ', wheel], ['stat', 'สถิติ', stat], ['sprite', 'พรีวิว sprite', sprite]
];

export async function mountAdmin(root, go) {
  let tab = 'menu';
  root.innerHTML = topBar() + '<p class="sub" style="padding:16px 14px">' + t('loading') + '</p>';

  const [chars, pets, notices, reads, menus, vocabs, qs, exams, results, prizes, spins] = await Promise.all([
    api.listCharacters(), api.allPets(), api.activeNotices(), api.noticeReads().catch(() => []),
    api.listMenu().catch(() => []), api.listVocab().catch(() => []), api.listQuestions().catch(() => []),
    api.listExams().catch(() => []), api.examResults().catch(() => []),
    api.listPrizes().catch(() => []), api.listSpins().catch(() => [])
  ]);

  const ctx = {
    users: S.users, toast, draw: () => draw(),
    chr: id => chars.find(c => c.user_id === id) || { wp: 0 },
    data: { chars, pets, notices, reads, menu: menus, vocab: vocabs, questions: qs, exams, results, prizes, spins }
  };

  function draw() {
    const [, , mod] = TABS.find(x => x[0] === tab);
    root.innerHTML = topBar() +
      '<div class="tabs">' + TABS.map(([id, label]) =>
        `<button data-tab="${id}" class="${tab === id ? 'on' : ''}">${label}</button>`).join('') + '</div>' +
      mod.render(ctx) +
      '<div style="padding:6px 14px 24px"><button class="btn" data-back style="background:#fff;color:var(--green);box-shadow:var(--shadow)">' + t('back') + '</button></div>';
    wireLang(root, go, 'admin');
    root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
    root.querySelector('[data-back]').onclick = () => go('profile');
    mod.wire(root, ctx);
  }
  draw();
}
