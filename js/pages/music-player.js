// เครื่องเล่นเพลง (การ์ดกระจก) ของหน้าเพลง — เฉพาะส่วนคุมเสียงและวาดการ์ดเล่นเพลง
import { MUSIC_UI } from '../shared/config.js';
import { glyph } from '../shared/ui.js';
import { mmss } from '../shared/format.js';

const T = MUSIC_UI;
const POS_KEY = 'kodklean.music.pos.v1';   // จำเพลงและวินาทีที่ฟังค้างไว้
const BARS = 28;

// อ่าน/เก็บตำแหน่งที่ฟังค้างไว้ (เปิดแอปใหม่ฟังต่อจากเดิมได้)
export function readPos() {
  try { return JSON.parse(localStorage.getItem(POS_KEY)) || {}; } catch { return {}; }
}
function writePos(id, t) {
  try { localStorage.setItem(POS_KEY, JSON.stringify({ id, t: Math.floor(t) })); } catch { /* เต็มก็ข้ามไป */ }
}

// ความสูงแท่งคลื่นเสียง — คิดจากรหัสเพลง เพลงเดียวกันได้คลื่นเดิมทุกครั้ง
function bars(id) {
  let seed = 0;
  for (let i = 0; i < String(id).length; i++) seed = (seed * 31 + String(id).charCodeAt(i)) % 9973;
  return Array.from({ length: BARS }, (_, i) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const wave = Math.sin((i / BARS) * Math.PI) * 0.55 + 0.35;
    return Math.round((28 + (seed % 100) * 0.52) * wave);
  });
}

// การ์ดเครื่องเล่น (ไม่มีเพลงที่เลือก = แสดงข้อความชวนเลือกเพลง)
export function playerHtml(state) {
  const track = state.tracks.find(t => t.id === state.curId);
  if (!track) return `<div class="mus__player mus__player--off"><i>${glyph('music', 26)}</i><span>${T.noTrack}</span></div>`;
  const dur = state.dur || track.duration_seconds || 0;
  const pct = dur ? Math.min(100, (state.cur / dur) * 100) : 0;
  const wave = bars(track.id).map((h, i) =>
    `<i style="height:${h}px;animation-delay:${(i % 7) * 0.09}s"></i>`).join('');
  return `
    <div class="mus__player${state.playing ? ' is-on' : ''}">
      <p class="mus__now">${T.nowPlaying}</p>
      <h2 class="mus__song">${track.title}</h2>
      <p class="mus__artist">${track.artist || T.unknownArtist}</p>
      <button class="mus__disc" type="button" data-act="toggle" aria-label="${state.playing ? 'หยุด' : 'เล่น'}">
        <span class="mus__disc-ring"></span>
        <span class="mus__disc-core">${glyph(state.playing ? 'pause' : 'play', 34)}</span>
      </button>
      <div class="mus__wave" aria-hidden="true">${wave}</div>
      <div class="mus__seek">
        <input class="mus__range" type="range" min="0" max="${Math.max(1, Math.floor(dur))}" value="${Math.floor(state.cur)}" step="1" data-act="seek" aria-label="เลื่อนตำแหน่งเพลง">
        <span class="mus__fill" style="width:${pct}%"></span>
      </div>
      <div class="mus__times"><span>${mmss(state.cur)}</span><span>${mmss(dur)}</span></div>
      <div class="mus__ctrls">
        <button class="mus__round" type="button" data-act="prev" aria-label="เพลงก่อนหน้า">${glyph('skipBack', 20)}</button>
        <button class="mus__round mus__round--main" type="button" data-act="toggle" aria-label="${state.playing ? 'หยุด' : 'เล่น'}">${glyph(state.playing ? 'pause' : 'play', 24)}</button>
        <button class="mus__round" type="button" data-act="next" aria-label="เพลงถัดไป">${glyph('skipFwd', 20)}</button>
      </div>
    </div>`;
}

// เริ่มเล่นเพลงตามรหัส (กดเพลงเดิมซ้ำ = สลับเล่น/หยุด)
export function play(state, audio, id, redraw) {
  const track = state.tracks.find(t => t.id === id);
  if (!track) return;
  if (state.curId === id && audio.src) {
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
    return;
  }
  state.curId = id;
  state.cur = 0;
  state.dur = track.duration_seconds || 0;
  audio.src = track.url;
  const pos = readPos();
  if (pos.id === id && pos.t > 2) audio.currentTime = pos.t;
  audio.play().catch(() => {});
  redraw();
}

// เพลงก่อนหน้า/ถัดไปในลำดับที่เห็นบนจอ
export function step(state, audio, delta, redraw) {
  const ids = state.view.map(t => t.id);
  if (!ids.length) return;
  const at = ids.indexOf(state.curId);
  const next = ids[(at + delta + ids.length) % ids.length];
  play(state, audio, next, redraw);
}

// ผูกเหตุการณ์ของตัวเล่นเสียงเข้ากับสถานะหน้า
export function bindAudio(audio, state, redraw, onTick) {
  audio.ontimeupdate = () => {
    state.cur = audio.currentTime;
    if (state.curId) writePos(state.curId, audio.currentTime);
    onTick();
  };
  audio.onloadedmetadata = () => { state.dur = audio.duration || state.dur; redraw(); };
  audio.onplay = () => { state.playing = true; redraw(); };
  audio.onpause = () => { state.playing = false; redraw(); };
  audio.onended = () => step(state, audio, 1, redraw);
}
