// แปลงไฟล์เสียงที่ผู้ใช้เลือกให้เป็น MP3 — ไฟล์ที่เป็น MP3 อยู่แล้วส่งกลับตามเดิม
// ตัวเข้ารหัส MP3 (lamejs) โหลดจากอินเทอร์เน็ตครั้งแรกที่ต้องใช้เท่านั้น
const LAME_URL = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
const CHUNK = 1152;   // จำนวนตัวอย่างเสียงต่อ 1 เฟรม MP3

let lameLoad = null;

// โหลดตัวเข้ารหัส MP3 (โหลดซ้ำไม่ได้ยิงใหม่)
function loadLame() {
  if (window.lamejs) return Promise.resolve(window.lamejs);
  if (lameLoad) return lameLoad;
  lameLoad = new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = LAME_URL;
    tag.onload = () => (window.lamejs ? resolve(window.lamejs) : reject(new Error('lame')));
    tag.onerror = () => reject(new Error('lame'));
    document.head.appendChild(tag);
  });
  return lameLoad;
}

// ไฟล์นี้เป็น MP3 อยู่แล้วไหม
export const isMp3 = file => /audio\/mpeg|audio\/mp3/.test(file.type || '') || /\.mp3$/i.test(file.name || '');

// เป็นไฟล์เสียง/วิดีโอที่ถอดเสียงได้ไหม
export const isAudioLike = file => /^audio\//.test(file.type || '') || /^video\//.test(file.type || '') ||
  /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac|webm|mp4|m4b|aiff?)$/i.test(file.name || '');

// ชื่อเพลงจากชื่อไฟล์ (ตัดนามสกุลออก)
export const titleOf = file => String(file.name || 'เพลง').replace(/\.[^.]+$/, '').trim() || 'เพลง';

// ความยาวเพลงเป็นวินาที (อ่านจากตัวเล่นของเบราว์เซอร์ ไม่ต้องถอดเสียงทั้งไฟล์)
export function seconds(blob) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(blob);
    const el = document.createElement('audio');
    el.preload = 'metadata';
    el.onloadedmetadata = () => { const d = el.duration; URL.revokeObjectURL(url); resolve(Number.isFinite(d) ? d : 0); };
    el.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    el.src = url;
  });
}

// แปลงคลื่นเสียงทศนิยม → จำนวนเต็ม 16 บิต ตามที่ตัวเข้ารหัสต้องการ
function toInt16(channel) {
  const out = new Int16Array(channel.length);
  for (let i = 0; i < channel.length; i++) {
    const v = Math.max(-1, Math.min(1, channel[i]));
    out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  return out;
}

// แปลงไฟล์ให้เป็น MP3 (คืน { blob, seconds, converted })
export async function toMp3(file) {
  if (isMp3(file)) return { blob: file, seconds: await seconds(file), converted: false };

  const lame = await loadLame();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const audio = await ctx.decodeAudioData(await file.arrayBuffer());
  await ctx.close();

  const channels = Math.min(2, audio.numberOfChannels);
  const left = toInt16(audio.getChannelData(0));
  const right = channels > 1 ? toInt16(audio.getChannelData(1)) : null;
  const encoder = new lame.Mp3Encoder(channels, audio.sampleRate, 192);
  const parts = [];
  for (let i = 0; i < left.length; i += CHUNK) {
    const l = left.subarray(i, i + CHUNK);
    const buf = right ? encoder.encodeBuffer(l, right.subarray(i, i + CHUNK)) : encoder.encodeBuffer(l);
    if (buf.length) parts.push(new Uint8Array(buf));
  }
  const tail = encoder.flush();
  if (tail.length) parts.push(new Uint8Array(tail));

  return { blob: new Blob(parts, { type: 'audio/mpeg' }), seconds: audio.duration, converted: true };
}

// เปิดหน้าต่างเลือกไฟล์เสียงจากเครื่อง (คืนรายการไฟล์ที่เลือก)
export function pickAudioFiles() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac';
    input.multiple = true;
    input.onchange = () => resolve([...(input.files || [])]);
    input.click();
  });
}
