// วาดทุกอย่างลงจอ: พื้นหลังโถ, ชิ้นในโถ, ชิ้นที่ถืออยู่, เส้นเล็ง, เส้นเตือน, ประกาย, ตัวเลขคะแนน
import { JAR, ITEMS } from '../config.js';
import { B, items } from './board.js';

const img = { bg: null, items: [] };
let cv, ctx, k = 1, ox = 0, oy = 0, dpr = 1;

function loadImg(src) {
  return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}

export async function init(canvas) {
  cv = canvas;
  ctx = cv.getContext('2d');
  const [bg, ...its] = await Promise.all([loadImg(JAR.image), ...ITEMS.map(it => loadImg('assets/items/' + it.img + '.webp'))]);
  img.bg = bg; img.items = its;
  fit();
  new ResizeObserver(fit).observe(cv.parentElement);
}

// ขยาย/ย่อภาพโถให้พอดีจอ ไม่บิดสัดส่วน
function fit() {
  const box = cv.parentElement.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(box.width * dpr);
  cv.height = Math.round(box.height * dpr);
  cv.style.width = box.width + 'px';
  cv.style.height = box.height + 'px';
  k = Math.min(box.width / JAR.width, box.height / JAR.height);
  ox = (box.width - JAR.width * k) / 2;
  oy = (box.height - JAR.height * k) / 2;
}

// ตำแหน่งนิ้วบนจอ → พิกัดในโถ
export function toWorld(clientX, clientY) {
  const r = cv.getBoundingClientRect();
  return { x: (clientX - r.left - ox) / k, y: (clientY - r.top - oy) / k };
}

// ตำแหน่งในโถ → ตำแหน่งบนจอ (ใช้วาง HUD ให้ตรงชั้นวาง)
export const view = () => ({ k, ox, oy });

function drawItem(tier, x, y, angle, scale = 1, alpha = 1) {
  const it = ITEMS[tier - 1], im = img.items[tier - 1];
  const s = it.r * 2 * it.draw * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (im) ctx.drawImage(im, -s / 2, -s / 2, s, s);
  else { ctx.fillStyle = '#A6BE40'; ctx.beginPath(); ctx.arc(0, 0, it.r, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

export function frame(now) {
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#F3E6CF';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
  if (img.bg) ctx.drawImage(img.bg, 0, 0, JAR.width, JAR.height);

  // เส้นเตือนที่ปากโถ — กะพริบแรงขึ้นเมื่อใกล้แพ้
  if (B.danger > 0) {
    const a = 0.35 + 0.45 * B.danger * (0.5 + 0.5 * Math.sin(now / 90));
    ctx.strokeStyle = `rgba(226,58,52,${a})`;
    ctx.lineWidth = 7;
    ctx.setLineDash([22, 14]);
    ctx.beginPath(); ctx.moveTo(JAR.wallLeft, JAR.rim); ctx.lineTo(JAR.wallRight, JAR.rim); ctx.stroke();
    ctx.setLineDash([]);
  }

  // เส้นเล็งจุดตก + ชิ้นที่ถืออยู่
  if (!B.over) {
    const r = ITEMS[B.held - 1].r;
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 12]);
    ctx.beginPath(); ctx.moveTo(B.heldX, JAR.spawnY + r); ctx.lineTo(B.heldX, JAR.floor); ctx.stroke();
    ctx.setLineDash([]);
    drawItem(B.held, B.heldX, JAR.spawnY, 0, 1, B.canDrop ? 1 : 0.35);
  }

  // ชิ้นในโถ (ชิ้นเกิดใหม่ขยายจาก 60% เป็นเต็มใน 0.16 วินาที)
  for (const b of items()) {
    const age = now - b.plugin.born;
    const sc = age < 160 ? 0.6 + 0.4 * (age / 160) : 1;
    drawItem(b.plugin.tier, b.position.x, b.position.y, b.angle, sc);
  }

  drawFx(now);
}

function drawFx(now) {
  B.fx = B.fx.filter(f => now - f.t < (f.kind === 'pts' ? 900 : 520));
  for (const f of B.fx) {
    const p = (now - f.t) / (f.kind === 'pts' ? 900 : 520);
    if (f.kind === 'burst') {
      const n = f.big ? 16 : 9, dist = f.r * (0.9 + p * (f.big ? 1.4 : 0.8));
      ctx.fillStyle = f.big ? `rgba(247,195,70,${1 - p})` : `rgba(255,255,255,${0.9 * (1 - p)})`;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(f.x + Math.cos(a) * dist, f.y + Math.sin(a) * dist, (f.big ? 11 : 7) * (1 - p) + 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.font = `600 ${f.pts >= 50 ? 64 : 46}px Mitr, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 9;
      ctx.strokeStyle = 'rgba(18,91,42,.85)';
      ctx.fillStyle = '#FFF4C8';
      const y = f.y - p * 90;
      ctx.strokeText('+' + f.pts, f.x, y);
      ctx.fillText('+' + f.pts, f.x, y);
      ctx.restore();
    }
  }
}
