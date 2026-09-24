// เพลงพื้นหลัง — แยกเป็น 3 สวิตช์อิสระ ไม่ยุ่งกัน
//   ประเภท : ทั้งหมด / เพลงมีเนื้อ / เพลงบรรเลง
//   ลำดับ  : สุ่ม / เรียงลำดับ / เล่นซ้ำเพลงเดิม
//   เปิดปิด: เปิดเพลง / ปิดเพลง
// แหล่งเพลง: เพลย์ลิสต์ในหน้า "เพลง" ของแอป + ไฟล์ในโฟลเดอร์ assets/music ที่ระบุใน config.js
// ถ้าประเภทที่เลือกไม่มีเพลง = เงียบ ไม่เอาเพลงประเภทอื่นมาเล่นแทน
import { MUSIC } from '../config.js';
import * as db from './db.js';

export const TYPES = ['all', 'vocal', 'inst'];
export const ORDERS = ['shuffle', 'list', 'repeat'];
const K = { type: 'kk.merge.mtype', order: 'kk.merge.morder', on: 'kk.merge.mon' };

const lists = { vocal: [], inst: [] };
let type = pick(K.type, TYPES, MUSIC.defaultType);
let order = pick(K.order, ORDERS, MUSIC.defaultOrder);
let on = read(K.on) !== 'off';
let audio = null, started = false, loaded = false, cursor = -1;

function read(k) { try { return localStorage.getItem(k); } catch { return null; } }
function write(k, v) { try { localStorage.setItem(k, v); } catch { /* ใช้ค่าในรอบนี้ */ } }
function pick(k, allowed, dflt) { const v = read(k); return allowed.includes(v) ? v : dflt; }

export const getType = () => type;
export const getOrder = () => order;
export const isOn = () => on;

// รายชื่อเพลงของประเภทที่เลือก (ตัด URL ซ้ำออกเสมอ)
export function pool(t = type) {
  const raw = t === 'all' ? [...lists.vocal, ...lists.inst] : (lists[t] || []);
  return [...new Set(raw)];
}
export const hasSongs = t => pool(t).length > 0;

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
    // ยังไม่ได้สร้างเพลย์ลิสต์เพลงมีเนื้อ = ถือว่าทุกเพลงในคลังที่ไม่ได้อยู่ในบรรเลงเป็นเพลงมีเนื้อ
    if (vocal === null) vocal = tracks.map(t => t.url).filter(u => u && !inst.includes(u));
    lists.inst.push(...inst);
    lists.vocal.push(...vocal);
  } catch { /* ไม่มีฐานข้อมูล = ใช้เฉพาะไฟล์ในโฟลเดอร์ */ }
  loaded = true;
  if (started && on) next(true);
}

function ensure() {
  if (audio) return;
  audio = new Audio();
  audio.preload = 'none';
  audio.volume = MUSIC.volume;
  audio.addEventListener('ended', () => next(false));
  audio.addEventListener('error', () => setTimeout(() => next(false), 800));  // เพลงไหนเปิดไม่ได้ ข้ามไปเพลงถัดไป
}

// เลือกเพลงถัดไปตามโหมดลำดับ · fresh = เพิ่งกดสวิตช์ (ไม่ใช่เพลงเล่นจบเอง)
function next(fresh) {
  if (!audio || !on || !loaded) return;
  const list = pool();
  audio.loop = order === 'repeat';
  if (!list.length) { audio.pause(); audio.removeAttribute('src'); cursor = -1; return; }
  if (order === 'repeat' && !fresh && audio.src) { audio.play().catch(() => {}); return; }

  if (order === 'list') cursor = (cursor + 1) % list.length;
  else if (list.length === 1) cursor = 0;
  else { let i = cursor; while (i === cursor) i = Math.floor(Math.random() * list.length); cursor = i; }

  audio.src = list[cursor];
  audio.play().catch(() => {});
}

// เรียกตอนผู้เล่นแตะจอครั้งแรก (มือถือไม่ยอมให้เปิดเพลงเองก่อน)
export function start() {
  if (started) return;
  started = true;
  ensure();
  if (on) next(true);
}

export function setType(t) {
  if (!TYPES.includes(t)) return type;
  type = t; write(K.type, t);
  cursor = -1;
  ensure();
  if (started && on) next(true);
  return type;
}
export function setOrder(o) {
  if (!ORDERS.includes(o)) return order;
  order = o; write(K.order, o);
  ensure();
  audio.loop = order === 'repeat';
  if (started && on && !audio.src) next(true);
  return order;
}
export function setOn(v) {
  on = !!v; write(K.on, on ? 'on' : 'off');
  ensure();
  if (!on) audio.pause();
  else if (started) { if (audio.src) audio.play().catch(() => {}); else next(true); }
  return on;
}
export const cycleType = () => setType(TYPES[(TYPES.indexOf(type) + 1) % TYPES.length]);
export const cycleOrder = () => setOrder(ORDERS[(ORDERS.indexOf(order) + 1) % ORDERS.length]);
export const toggleOn = () => setOn(!on);

// พับจอ/สลับแอป = หยุดเพลง กลับมา = เล่นต่อ
document.addEventListener('visibilitychange', () => {
  if (!audio || !on || !started) return;
  if (document.hidden) audio.pause();
  else if (audio.src) audio.play().catch(() => {});
});
