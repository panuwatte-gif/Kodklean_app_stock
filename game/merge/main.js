// จุดเริ่มเกมรวมร่าง: ต่อทุกส่วนเข้าด้วยกัน (แต่ละส่วนไม่รู้จักกันเอง แก้ส่วนหนึ่งไม่กระทบส่วนอื่น)
import { PLAY } from './config.js';
import { P, loadPlayer, tx, villageUrl } from './core/player.js';
import * as board from './core/board.js';
import * as render from './core/render.js';
import * as sound from './core/sound.js';
import * as music from './core/music.js';
import * as scores from './core/scores.js';
import * as hud from './ui/hud.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('cv');
let best = 0, playing = false, lastT = performance.now(), warnAt = 0, lastScore = -1;

// ── เหตุการณ์จากกติกาเกม → เสียง / จอ ──
board.on.drop = () => sound.play('drop', 1, 0.7);
board.on.merge = (tier, x, y, pts, combo) => {
  sound.mergeNote(tier);
  if (tier >= PLAY.rareFromTier) sound.play('rare', 1, 0.8);
  if (combo >= 3) sound.play('combo', 1, 0.6);
  hud.combo(combo);
};
board.on.top = (x, y, pts, combo) => { sound.play('rare'); sound.play('best', 1, 0.8); hud.combo(combo); };
board.on.over = finish;

// ── ปุ่มบนจอ ──
const actions = {
  sfx() { hud.setSfx(sound.toggle()); sound.play('tap'); },
  music() {
    const m = music.cycle();
    hud.setMusic(m);
    sound.play('tap');
    if (m !== 'off' && !music.hasSongs(m)) hud.toast(tx('noSongs'));
  },
  board() { sound.play('tap'); showBoard(); },
  back() { location.href = villageUrl(); }
};

async function showBoard() {
  const wasPlaying = playing;
  playing = false;
  const done = act => {
    if (act === 'close') { hud.close(); playing = wasPlaying && !board.B.over; if (board.B.over) showOver(); }
  };
  hud.boardScreen(null, done);
  try { hud.boardScreen(await scores.top(), done); }
  catch { hud.boardScreen([], done); }
}

// ── การแตะ/ลาก: ลากเพื่อเล็ง ปล่อยนิ้วเพื่อปล่อยชิ้น ──
let pressing = false;
canvas.addEventListener('pointerdown', e => {
  if (!playing || hud.isOpen()) return;
  pressing = true;
  canvas.setPointerCapture(e.pointerId);
  board.aim(render.toWorld(e.clientX, e.clientY).x);
});
canvas.addEventListener('pointermove', e => {
  if (!playing || hud.isOpen()) return;
  if (pressing || e.pointerType === 'mouse') board.aim(render.toWorld(e.clientX, e.clientY).x);
});
canvas.addEventListener('pointerup', e => {
  if (!pressing) return;
  pressing = false;
  if (!playing || hud.isOpen()) return;
  board.aim(render.toWorld(e.clientX, e.clientY).x);
  board.drop();
});
canvas.addEventListener('pointercancel', () => { pressing = false; });

// ── เริ่ม / จบ ──
function begin() {
  board.reset();
  lastScore = -1;
  playing = true;
  lastT = performance.now();
}

let lastResult = null;
async function finish() {
  playing = false;
  const score = board.B.score, isBest = score > best;
  if (isBest) { best = score; scores.setLocalBest(best); sound.play('best'); } else sound.play('over');
  lastResult = { score, best, isBest, topTier: board.B.topTier };
  setTimeout(showOver, 700);
  if (!P.guest) {
    try { await scores.save(score, board.B.topTier); hud.toast(tx('saved')); }
    catch { hud.toast(tx('saveFail')); }
  }
}
function showOver() {
  hud.overScreen(lastResult, act => {
    sound.play('tap');
    if (act === 'again') { hud.close(); begin(); }
    else if (act === 'board') showBoard();
    else if (act === 'back') location.href = villageUrl();
  });
}

// ── วงรอบหลัก: เดินฟิสิกส์ + วาด ──
function loop(now) {
  const dt = now - lastT;
  lastT = now;
  if (playing && !document.hidden) {
    board.tick(dt);
    if (board.B.danger > 0.6 && now - warnAt > 1000) { sound.play('warn', 1, 0.7); warnAt = now; }
  }
  if (board.B.score !== lastScore) { lastScore = board.B.score; hud.setScore(board.B.score, Math.max(best, board.B.score)); }
  hud.setNext(board.B.next);
  render.frame(now);
  requestAnimationFrame(loop);
}

// ── เปิดเกม ──
(async () => {
  document.body.classList.add('is-loading');
  await loadPlayer();
  document.documentElement.lang = P.lang === 'my' ? 'my' : 'th';
  document.body.classList.toggle('lang-my', P.lang === 'my');

  hud.mount(stage, actions);
  hud.setSfx(sound.isOn());
  hud.setMusic(music.getMode());
  board.reset();
  await render.init(canvas);

  best = scores.localBest();
  scores.myBest().then(v => { if (v > best) { best = v; scores.setLocalBest(v); lastScore = -1; } }).catch(() => {});
  music.load();

  document.body.classList.remove('is-loading');
  requestAnimationFrame(loop);

  // แตะเริ่มครั้งแรก = ปลดล็อกเสียง + เริ่มเพลง (มือถือบังคับให้ต้องแตะก่อน)
  hud.startScreen(async () => {
    await sound.unlock();
    music.start();
    sound.play('tap');
    begin();
  });
})();
