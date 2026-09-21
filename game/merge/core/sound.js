// เสียงเอฟเฟกต์ — โหลดครั้งเดียว เล่นซ้ำได้ไม่จำกัดโดยไม่หน่วง
// เบราว์เซอร์มือถือไม่ให้มีเสียงก่อนผู้เล่นแตะจอ จึงต้องเรียก unlock() ตอนแตะครั้งแรก
import { SFX } from '../config.js';

const KEY = 'kk.merge.sfx';
let ctx = null, gain = null;
const buf = {};
const last = {};
let on = read();

function read() { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } }

export const isOn = () => on;
export function toggle() {
  on = !on;
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* เก็บไม่ได้ก็ใช้ค่าในรอบนี้ */ }
  return on;
}

export async function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    gain = ctx.createGain();
    gain.gain.value = SFX.volume;
    gain.connect(ctx.destination);
    await Promise.all(Object.entries(SFX.files).map(async ([name, file]) => {
      try {
        const data = await (await fetch(SFX.folder + file)).arrayBuffer();
        buf[name] = await ctx.decodeAudioData(data);
      } catch { /* ไฟล์ไหนหาย เกมยังเล่นได้ แค่ไม่มีเสียงนั้น */ }
    }));
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function play(name, rate = 1, vol = 1) {
  if (!on || !ctx || !buf[name]) return;
  const now = ctx.currentTime;
  if (last[name] && now - last[name] < 0.035) return;   // กันเสียงซ้อนกันรัวจนแตก
  last[name] = now;
  const src = ctx.createBufferSource();
  src.buffer = buf[name];
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(g).connect(gain);
  src.start();
}

// เสียงรวมร่าง: ไล่เสียงสูงขึ้นตามขั้นที่ได้ (ขั้น 1 ต่ำสุด)
export function mergeNote(tier) {
  const step = SFX.mergeScale[Math.min(tier, SFX.mergeScale.length) - 1] || 0;
  play('merge', SFX.mergeBaseRate * Math.pow(2, step / 12));
}
