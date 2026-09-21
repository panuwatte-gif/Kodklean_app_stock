// เพลงพื้นหลัง 3 โหมด: มีเนื้อ / บรรเลง / ปิด — สุ่มเพลง ไม่ซ้ำเพลงที่เพิ่งเล่น เล่นจบแล้วต่อเพลงใหม่
// แหล่งเพลง: (1) เพลย์ลิสต์ในหน้า "เพลง" ของแอป  (2) ไฟล์ในโฟลเดอร์ assets/music ที่ระบุใน config.js
import { MUSIC } from '../config.js';
import * as db from './db.js';

const KEY = 'kk.merge.music';
const MODES = ['vocal', 'inst', 'off'];
const lists = { vocal: [], inst: [] };
let mode = read();
let audio = null, lastUrl = '', started = false, loaded = false;

function read() {
  try { const v = localStorage.getItem(KEY); return MODES.includes(v) ? v : MUSIC.defaultMode; }
  catch { return MUSIC.defaultMode; }
}

export const getMode = () => mode;
export const hasSongs = m => (lists[m] || []).length > 0;

// โหลดรายชื่อเพลง (ไม่โหลดไฟล์เพลงจริง — ไฟล์จะโหลดเฉพาะเพลงที่สุ่มได้)
export async function load() {
  lists.vocal = MUSIC.bundledVocal.map(f => MUSIC.folder + f);
  lists.inst = MUSIC.bundledInst.map(f => MUSIC.folder + f);
  try {
    const [tracks, pls, links] = await Promise.all([
      db.get('music_tracks?active=eq.true&select=id,url'),
      db.get('kk_music_playlist?active=eq.true&select=id,name'),
      db.get('kk_music_playlist_track?select=playlist_id,track_id')
    ]);
    const urlOf = id => (tracks.find(t => t.id === id) || {}).url;
    const inList = name => {
      const pl = pls.find(p => (p.name || '').trim() === name);
      return pl ? links.filter(l => l.playlist_id === pl.id).map(l => urlOf(l.track_id)).filter(Boolean) : null;
    };
    const inst = inList(MUSIC.instPlaylist) || [];
    let vocal = inList(MUSIC.vocalPlaylist);
    // ยังไม่ได้สร้างเพลย์ลิสต์เพลงมีเนื้อ = ถือว่าทุกเพลงในคลังที่ไม่ใช่บรรเลงเป็นเพลงมีเนื้อ
    if (vocal === null) vocal = tracks.map(t => t.url).filter(u => u && !inst.includes(u));
    lists.inst.push(...inst);
    lists.vocal.push(...vocal);
  } catch { /* ไม่มีฐานข้อมูล = ใช้เฉพาะไฟล์ในโฟลเดอร์ */ }
  loaded = true;
  if (started) playNext();
}

function ensure() {
  if (audio) return;
  audio = new Audio();
  audio.preload = 'none';
  audio.volume = MUSIC.volume;
  audio.addEventListener('ended', playNext);
  audio.addEventListener('error', () => setTimeout(playNext, 800));   // เพลงไหนเปิดไม่ได้ ข้ามไปเพลงถัดไป
}

function playNext() {
  if (!audio || mode === 'off' || !loaded) return;
  const pool = lists[mode] || [];
  if (!pool.length) { audio.pause(); return; }
  let pick = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1) while (pick === lastUrl) pick = pool[Math.floor(Math.random() * pool.length)];
  lastUrl = pick;
  audio.src = pick;
  audio.play().catch(() => {});
}

// เรียกตอนผู้เล่นแตะจอครั้งแรก (มือถือไม่ยอมให้เปิดเพลงเองก่อน)
export function start() {
  if (started) return;
  started = true;
  ensure();
  playNext();
}

// สลับโหมดวนไป มีเนื้อ → บรรเลง → ปิด (คืนค่าโหมดใหม่)
export function cycle() {
  mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  try { localStorage.setItem(KEY, mode); } catch { /* ใช้ค่าในรอบนี้ */ }
  ensure();
  lastUrl = '';
  if (mode === 'off') audio.pause(); else if (started) playNext();
  return mode;
}

// ออกจากแอป/พับจอ = หยุดเพลง กลับมา = เล่นต่อ
document.addEventListener('visibilitychange', () => {
  if (!audio || mode === 'off' || !started) return;
  if (document.hidden) audio.pause(); else if (audio.src) audio.play().catch(() => {});
});
