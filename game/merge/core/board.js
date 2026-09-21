// กติกาเกม + ฟิสิกส์: ปล่อยชิ้น, ชิ้นขั้นเดียวกันชนกันรวมเป็นขั้นถัดไป, ล้นปากโถนานเกิน = แพ้
// ไม่วาดอะไรเอง ไม่เล่นเสียงเอง — แค่แจ้งเหตุการณ์ผ่าน on.xxx ให้ส่วนอื่นจัดการ
/* global Matter */
import { JAR, ITEMS, SPAWN_WEIGHTS, POINTS, TOP_MERGE_BONUS, PLAY } from '../config.js';

const { Engine, Bodies, Composite, Body, Events } = Matter;
const MAX = ITEMS.length;
const STEP = 1000 / 60;

export const on = { merge() {}, top() {}, drop() {}, over() {} };

export const B = {
  engine: null, score: 0, topTier: 1,
  held: 1, next: 1, heldX: (JAR.wallLeft + JAR.wallRight) / 2,
  canDrop: true, over: false, danger: 0, // danger 0-1 = ใกล้แพ้แค่ไหน (ใช้วาดเส้นเตือน)
  combo: 0, comboAt: 0, fx: []           // fx = เอฟเฟกต์ที่ต้องวาด (ประกาย/ตัวเลขคะแนน)
};

let acc = 0, queue = [], overSince = 0, dropTimer = 0;

function pickSpawn() {
  const w = SPAWN_WEIGHTS.slice(0, MAX), sum = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i + 1; }
  return 1;
}

function makeItem(tier, x, y) {
  const b = Bodies.circle(x, y, ITEMS[tier - 1].r, {
    restitution: 0.12, friction: 0.25, frictionStatic: 0.5, frictionAir: 0.004, density: 0.0012, label: 'item'
  });
  b.plugin = { tier, born: performance.now(), dead: false };
  Composite.add(B.engine.world, b);
  return b;
}

export function reset() {
  if (B.engine) { Events.off(B.engine); Composite.clear(B.engine.world, false); Engine.clear(B.engine); }
  const e = Engine.create({ gravity: { x: 0, y: PLAY.gravity } });
  e.positionIterations = 10;
  e.velocityIterations = 8;
  const T = 400, L = JAR.wallLeft, R = JAR.wallRight, F = JAR.floor, H = JAR.height;
  const wall = { isStatic: true, friction: 0.3, restitution: 0.05, label: 'wall' };
  Composite.add(e.world, [
    Bodies.rectangle(L - T / 2, H / 2, T, H * 2, wall),
    Bodies.rectangle(R + T / 2, H / 2, T, H * 2, wall),
    Bodies.rectangle((L + R) / 2, F + T / 2, R - L + T * 2, T, wall)
  ]);
  Events.on(e, 'collisionStart', collide);
  Events.on(e, 'collisionActive', collide);
  Object.assign(B, { engine: e, score: 0, topTier: 1, held: pickSpawn(), next: pickSpawn(),
    canDrop: true, over: false, danger: 0, combo: 0, comboAt: 0, fx: [] });
  B.heldX = (L + R) / 2;
  acc = 0; queue = []; overSince = 0; clearTimeout(dropTimer);
}

function collide(ev) {
  for (const { bodyA: a, bodyB: b } of ev.pairs) {
    if (a.label !== 'item' || b.label !== 'item') continue;
    if (a.plugin.dead || b.plugin.dead || a.plugin.tier !== b.plugin.tier) continue;
    a.plugin.dead = b.plugin.dead = true;
    queue.push([a, b]);
  }
}

function resolveMerges() {
  const now = performance.now();
  for (const [a, b] of queue) {
    const tier = a.plugin.tier;
    const x = (a.position.x + b.position.x) / 2, y = (a.position.y + b.position.y) / 2;
    Composite.remove(B.engine.world, [a, b]);

    B.combo = now - B.comboAt < PLAY.comboWindowMs ? B.combo + 1 : 1;
    B.comboAt = now;
    const mult = Math.min(2, 1 + 0.1 * (B.combo - 1));

    if (tier >= MAX) {
      const pts = Math.round(TOP_MERGE_BONUS * mult);
      B.score += pts;
      B.fx.push({ kind: 'burst', x, y, r: ITEMS[MAX - 1].r, t: now, big: true }, { kind: 'pts', x, y, pts, t: now });
      on.top(x, y, pts, B.combo);
      continue;
    }
    const nt = tier + 1;
    const nb = makeItem(nt, x, y);
    Body.setVelocity(nb, { x: (a.velocity.x + b.velocity.x) / 2, y: Math.min(0, (a.velocity.y + b.velocity.y) / 2) });
    const pts = Math.round(POINTS[nt - 1] * mult);
    B.score += pts;
    if (nt > B.topTier) B.topTier = nt;
    B.fx.push({ kind: 'burst', x, y, r: ITEMS[nt - 1].r, t: now, big: nt >= PLAY.rareFromTier }, { kind: 'pts', x, y, pts, t: now });
    on.merge(nt, x, y, pts, B.combo);
  }
  queue = [];
}

// ขยับตำแหน่งชิ้นที่ถือ (กันไม่ให้ล้ำผนัง)
export function aim(x) {
  const r = ITEMS[B.held - 1].r;
  B.heldX = Math.max(JAR.wallLeft + r + 1, Math.min(JAR.wallRight - r - 1, x));
}

export function drop() {
  if (!B.canDrop || B.over) return false;
  const b = makeItem(B.held, B.heldX, JAR.spawnY);
  Body.setVelocity(b, { x: 0, y: 2 });
  on.drop(B.held);
  B.canDrop = false;
  dropTimer = setTimeout(() => {
    B.held = B.next;
    B.next = pickSpawn();
    aim(B.heldX);
    B.canDrop = !B.over;
  }, PLAY.dropCooldownMs);
  return true;
}

function checkOver(now) {
  let worst = -Infinity, overflow = false;
  for (const b of Composite.allBodies(B.engine.world)) {
    if (b.label !== 'item' || b.plugin.dead) continue;
    if (b.position.y > JAR.height + 300) { Composite.remove(B.engine.world, b); continue; }  // หลุดโลก
    if (now - b.plugin.born < 900) continue;             // ชิ้นที่เพิ่งปล่อยยังไม่นับ
    const top = b.position.y - ITEMS[b.plugin.tier - 1].r;
    worst = Math.max(worst, JAR.rim + PLAY.warnMarginPx - top);
    if (top < JAR.rim) overflow = true;
  }
  B.danger = worst <= 0 ? 0 : Math.min(1, worst / PLAY.warnMarginPx);
  if (overflow) {
    if (!overSince) overSince = now;
    if (now - overSince > PLAY.overLimitMs) { B.over = true; B.canDrop = false; on.over(); }
  } else overSince = 0;
}

// เดินเกมไปข้างหน้า dt มิลลิวินาที (ใช้ก้าวคงที่ ทุกเครื่องได้ผลเหมือนกัน)
export function tick(dt) {
  if (!B.engine || B.over) return;
  acc += Math.min(dt, 100);
  let n = 0;
  while (acc >= STEP && n < 5) {
    Engine.update(B.engine, STEP);
    if (queue.length) resolveMerges();
    acc -= STEP; n++;
  }
  checkOver(performance.now());
}

export const items = () => Composite.allBodies(B.engine.world).filter(b => b.label === 'item' && !b.plugin.dead);
