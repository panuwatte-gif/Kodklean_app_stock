// จุดเข้าเกม: ลงทะเบียนทุกหน้า แล้วเปิดหน้าแรก
import { CONFIG } from './config.js';
import * as router from './core/router.js';
import { loadSpriteMap } from './core/sprites.js';
import { bottomNav } from './core/ui.js';
import { S, loadUser } from './core/state.js';
import * as api from './core/api.js';
import { mountOnboarding } from './features/onboarding.js';
import { mountVillage } from './features/village.js';
import { mountMyHome } from './features/myhome.js';
import { mountProfile } from './features/profile.js';
import { mountAdmin } from './features/admin.js';
import { mountSoon, mountNoUser } from './features/soon.js';
import { mountSchool } from './features/school.js';
import { mountQuiz } from './features/quiz.js';
import { mountMath } from './features/math.js';
import { mountWheel } from './features/wheel.js';
import { mountExam } from './features/exam.js';
import { mountTent } from './features/tent.js';

router.register('onboarding', mountOnboarding);
router.register('village', mountVillage);
router.register('myhome', mountMyHome);
router.register('school', mountSchool);
router.register('quiz', (root, go) => mountQuiz(root, go, 'quiz'));
router.register('quiz-menu', (root, go) => mountQuiz(root, go, 'quiz-menu'));
router.register('quiz-vocab', (root, go) => mountQuiz(root, go, 'quiz-vocab'));
router.register('quiz-menumy', (root, go) => mountQuiz(root, go, 'quiz-menumy'));
router.register('math', mountMath);
router.register('wheel', mountWheel);
router.register('exam', mountExam);
router.register('tent', mountTent);
router.register('profile', mountProfile);
router.register('admin', mountAdmin);

// หน้าล็อกอินกับ onboarding ไม่มีแถบล่าง (สเปกข้อ 4)
router.init(document.getElementById('screen'), document.getElementById('nav'), (host, id, go) => {
  if (id === 'onboarding' || id === 'nouser') { host.innerHTML = ''; return; }
  // หน้ากิจกรรมย่อยให้แถบล่างชี้ที่หน้าแม่ของมัน
  const parent = { quiz:'school', 'quiz-menu':'school', 'quiz-vocab':'school', 'quiz-menumy':'school', math:'school', exam:'school', wheel:'village' }[id];
  if (parent) return bottomNav(host, parent, go);
  bottomNav(host, id, go);
});

router.register('nouser', mountNoUser);

// ปุ่มย้อนกลับของเครื่องส่งมาจากแอปแม่: ถอยหน้าในเกมก่อน ถ้าไม่มีที่ถอยแล้วค่อยออกไปแอปหลัก
window.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'imjai:back') return;
  if (!router.back()) window.parent.postMessage({ type: 'imjai:exit' }, '*');
});

(async () => {
  await loadSpriteMap();
  // ผู้เล่น = คนที่ล็อกอินแอปอยู่ (แอปส่งรหัสพนักงานมาทาง ?emp=)
  const code = new URLSearchParams(location.search).get('emp') || CONFIG.empCodeFromHost;
  if (!code) return router.go('nouser');
  const u = await api.findUser(code).catch(() => null);
  if (!u) return router.go('nouser');
  await loadUser(u);
  router.go(S.chr && S.chr.onboarded ? 'village' : 'onboarding');
})();
