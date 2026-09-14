// เครื่องมือทำโจทย์แต่ละระดับ — คำตอบได้จากการ "ทำ" บนจอ ไม่มีตัวเลือกให้เดา
import { ASSETS } from '../../sprite_config.js';
import { MONEY } from './gen.js';

const pic = (item, size, extra) => `<img src="${ASSETS.food}${item}.webp" alt="" width="${size}" height="${size}"
  style="object-fit:contain;${extra || ''}">`;
const tile = (inner, on) => `<span style="display:grid;place-items:center;width:60px;height:60px;border-radius:14px;
  background:${on ? '#E7F2E5' : '#fff'};box-shadow:${on ? '0 0 0 2px var(--lime)' : 'var(--shadow)'};position:relative">${inner}</span>`;
const chip = (label, on) => `<span style="display:grid;place-items:center;min-width:56px;height:44px;padding:0 10px;
  border-radius:12px;background:${on ? 'var(--gold)' : '#fff'};color:var(--ink);font-weight:600;
  box-shadow:var(--shadow)">${label}</span>`;
const readout = n => `<p style="font-size:34px;font-weight:600;margin:10px 0 0;color:var(--green)">${n}</p>`;
const row = (kids, gap) => `<div style="display:flex;flex-wrap:wrap;gap:${gap || 8}px;justify-content:center">${kids}</div>`;

// สถานะเริ่มต้นของเครื่องมือแต่ละระดับ
export function initState(task) {
  if (task.level === 1) return { tapped: [] };
  if (task.level === 2) return { moved: [] };
  if (task.level === 3) return { pos: task.start, used: [] };
  if (task.level === 4) return { picked: [] };
  if (task.level === 5) return { rows: [] };
  if (task.level === 6) return { placed: 0 };
  return { batches: [] };
}

// วาดเครื่องมือ + คืนค่าคำตอบปัจจุบันที่ผู้เล่นทำได้
export function render(task, st, hint) {
  const L = task.level;
  if (L === 1) return `<p class="sub">แตะของทีละชิ้น</p>
    ${row(Array.from({ length: task.n }, (_, k) =>
      `<button data-tap="${k}" style="border:0;background:none;padding:0;cursor:pointer">
        ${tile(pic(task.item, 40) + (st.tapped.includes(k) ? '<span style="position:absolute;right:2px;bottom:2px;color:var(--green);font-weight:700">✓</span>' : ''),
          hint >= 1 && !st.tapped.includes(k))}</button>`).join(''))}
    ${readout(st.tapped.length)}`;

  if (L === 2) {
    const total = task.op === 'add' ? task.a + task.b : task.a;
    const left = Array.from({ length: total }, (_, k) => k).filter(k => !st.moved.includes(k));
    return `<p class="sub">${task.op === 'add' ? 'ย้ายของทั้งสองกองมารวมในตะกร้า' : `เอาของออก ${task.b} ชิ้น แล้วนับที่เหลือ`}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div style="background:#fff;border-radius:16px;padding:10px;box-shadow:var(--shadow);min-height:96px">
          ${row(left.map(k => `<button data-move="${k}" style="border:0;background:none;padding:0;cursor:pointer">${tile(pic(task.item, 34), hint >= 1)}</button>`).join(''), 6)}
        </div>
        <div style="background:var(--cream);border-radius:16px;padding:10px;min-height:96px">
          ${row(st.moved.map(() => tile(pic(task.item, 34), false)).join(''), 6)}
        </div>
      </div>
      ${readout(task.op === 'add' ? st.moved.length : left.length)}`;
  }

  if (L === 3) {
    const pct = Math.min(100, st.pos / 200 * 100);
    return `<p class="sub">เริ่มที่ ${task.start} — กดกระโดดให้ครบ</p>
      <div style="position:relative;height:52px;margin:14px 0">
        <div class="bar" style="height:10px;margin-top:20px"><i style="width:${pct}%"></i></div>
        <span style="position:absolute;top:0;left:calc(${pct}% - 14px);font-weight:700;color:var(--green)">▼</span>
        <span class="sub" style="position:absolute;bottom:-4px;left:0">0</span>
        <span class="sub" style="position:absolute;bottom:-4px;right:0">200</span>
      </div>
      ${row(task.jumps.map((j, k) => `<button data-jump="${k}" ${st.used.includes(k) ? 'disabled' : ''}
        style="border:0;border-radius:14px;min-height:48px;padding:0 18px;font:inherit;font-size:17px;font-weight:600;
        background:${st.used.includes(k) ? '#DED5C4' : 'var(--gold)'};color:#4A3E30;cursor:pointer">+${j}</button>`).join(''))}
      ${readout(st.pos)}`;
  }

  if (L === 4) {
    const got = st.picked.reduce((a, b) => a + b, 0);
    return `<p class="sub">ค่าอาหาร ${task.price} · ลูกค้าจ่าย ${task.paid}</p>
      <p class="sub">หยิบเงินนับต่อจาก ${task.price} ไปให้ถึง ${task.paid}</p>
      ${row(MONEY.map(m => `<button data-money="${m}" style="border:0;background:none;padding:0;cursor:pointer">${chip(m, hint >= 1)}</button>`).join(''))}
      <div style="background:var(--cream);border-radius:16px;padding:10px;margin-top:12px;min-height:60px">
        ${row(st.picked.map((m, k) => `<button data-undo="${k}" style="border:0;background:none;padding:0;cursor:pointer">${chip(m, true)}</button>`).join('') || '<span class="sub">ยังไม่หยิบ</span>')}
      </div>
      ${readout(task.price + got + ' / ' + task.paid)}
      <p class="sub">เงินทอน = ${got}</p>`;
  }

  if (L === 5) {
    return `<p class="sub">แตะทีละแถว</p>
      <div style="display:grid;gap:8px;margin-top:10px">
        ${Array.from({ length: task.rows }, (_, r) => `<button data-row="${r}"
          style="border:0;background:${st.rows.includes(r) ? '#E7F2E5' : '#fff'};border-radius:14px;padding:8px;
          box-shadow:${st.rows.includes(r) ? '0 0 0 2px var(--lime)' : 'var(--shadow)'};cursor:pointer;display:flex;gap:6px;justify-content:center">
          ${Array.from({ length: task.cols }, () => pic(task.item, 30)).join('')}</button>`).join('')}
      </div>
      ${readout(st.rows.length * task.cols)}`;
  }

  if (L === 6) {
    const perCup = Array.from({ length: task.cups }, (_, c) => Math.floor(st.placed / task.cups) + (st.placed % task.cups > c ? 1 : 0));
    return `<p class="sub">ของ ${task.n} ชิ้น แบ่งใส่ ${task.cups} ถ้วยเท่าๆ กัน</p>
      ${row(Array.from({ length: task.n - st.placed }, () =>
        `<button data-place style="border:0;background:none;padding:0;cursor:pointer">${tile(pic(task.item, 32), hint >= 1)}</button>`).join(''), 6)}
      <div style="display:grid;grid-template-columns:repeat(${task.cups},1fr);gap:8px;margin-top:12px">
        ${perCup.map(n => `<div style="background:var(--cream);border-radius:16px;padding:10px;text-align:center">
          <p style="font-size:22px;font-weight:600;margin:0;color:var(--green)">${n}</p></div>`).join('')}
      </div>
      ${readout(perCup[0] || 0)}`;
  }

  const names = [...new Set(task.bills.flat())];
  return `<p class="sub">ลากแก้วจาก 3 บิลลงโถปั่น — เมนูเดียวกันปั่นรอบเดียว</p>
    <div style="display:grid;gap:8px;margin-top:10px">
      ${task.bills.map((b, k) => `<div style="background:#fff;border-radius:14px;padding:8px;box-shadow:var(--shadow)">
        <p class="sub" style="margin:0 0 4px">บิล ${k + 1}</p>
        ${row(b.map(n => `<button data-glass="${n}" style="border:0;background:none;padding:0;cursor:pointer">${chip(n, st.batches.includes(n))}</button>`).join('') || '<span class="sub">—</span>', 6)}
      </div>`).join('')}
    </div>
    <div style="background:var(--cream);border-radius:16px;padding:10px;margin-top:12px">
      <p class="sub" style="margin:0">โถปั่น ${st.batches.length} รอบ</p>
      ${row(st.batches.map(n => chip(n, true)).join('') || '<span class="sub">ยังไม่ใส่</span>', 6)}
    </div>
    ${readout(st.batches.length)}
    <p class="sub">ทำทีละบิลต้องปั่น ${task.bills.flat().length} รอบ · รวมเมนูซ้ำเหลือ ${names.length} รอบ</p>`;
}

// ผูกการแตะ/กด แล้วคืนค่าคำตอบที่ผู้เล่นทำได้ ผ่าน onChange
export function wire(root, task, st, onChange) {
  const L = task.level, ch = () => onChange(answerOf(task, st));
  if (L === 1) root.querySelectorAll('[data-tap]').forEach(b => b.onclick = () => {
    const k = Number(b.dataset.tap); if (!st.tapped.includes(k)) st.tapped.push(k); ch(); });
  if (L === 2) root.querySelectorAll('[data-move]').forEach(b => b.onclick = () => {
    st.moved.push(Number(b.dataset.move)); ch(); });
  if (L === 3) root.querySelectorAll('[data-jump]').forEach(b => b.onclick = () => {
    const k = Number(b.dataset.jump); if (st.used.includes(k)) return;
    st.used.push(k); st.pos += task.jumps[k]; ch(); });
  if (L === 4) {
    root.querySelectorAll('[data-money]').forEach(b => b.onclick = () => { st.picked.push(Number(b.dataset.money)); ch(); });
    root.querySelectorAll('[data-undo]').forEach(b => b.onclick = () => { st.picked.splice(Number(b.dataset.undo), 1); ch(); });
  }
  if (L === 5) root.querySelectorAll('[data-row]').forEach(b => b.onclick = () => {
    const r = Number(b.dataset.row); if (!st.rows.includes(r)) st.rows.push(r); ch(); });
  if (L === 6) root.querySelectorAll('[data-place]').forEach(b => b.onclick = () => {
    if (st.placed < task.n) st.placed++; ch(); });
  if (L === 7) root.querySelectorAll('[data-glass]').forEach(b => b.onclick = () => {
    const n = b.dataset.glass; if (!st.batches.includes(n)) st.batches.push(n); ch(); });
}

// คำตอบที่ "ทำได้" ตอนนี้ (null = ยังทำไม่เสร็จ กดยืนยันไม่ได้)
export function answerOf(task, st) {
  const L = task.level;
  if (L === 1) return st.tapped.length === task.n ? st.tapped.length : null;
  if (L === 2) { const total = task.op === 'add' ? task.a + task.b : task.a;
    if (task.op === 'add') return st.moved.length === total ? total : null;
    return st.moved.length === task.b ? total - task.b : null; }
  if (L === 3) return st.used.length === task.jumps.length ? st.pos : null;
  if (L === 4) { const got = st.picked.reduce((a, b) => a + b, 0);
    return task.price + got === task.paid ? got : null; }
  if (L === 5) return st.rows.length === task.rows ? task.rows * task.cols : null;
  if (L === 6) return st.placed === task.n ? task.answer : null;
  return st.batches.length ? st.batches.length : null;
}
