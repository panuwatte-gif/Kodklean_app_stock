// ชิ้นส่วนหน้าจอที่ใช้ซ้ำทั้งแอป — เมนูล่าง 7 ปุ่ม + การ์ดกระจก + แผงถาม + ชุดไอคอนเส้น
import { APP_NAV, PASTEL_DOTS } from './config.js';
import { fillText } from './format.js';

// ชุดไอคอนเส้นของแอป (เรียกใช้ด้วย glyph('pencil'))
const GLYPHS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  folder: '<path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>',
  pencil: '<path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4z"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 12h10l1-12"/><path d="M10 11v5M14 11v5"/>',
  sort: '<path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l3 3M17 20l-3-3"/>',
  more: '<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  filter: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  gear: '<circle cx="12" cy="12" r="3.1"/><path d="M19.1 14.4a1.7 1.7 0 0 0 .34 1.86l.06.06a1.9 1.9 0 1 1-2.7 2.7l-.05-.06a1.7 1.7 0 0 0-2.9 1.2v.17a1.9 1.9 0 1 1-3.8 0v-.1a1.7 1.7 0 0 0-2.9-1.27l-.06.06a1.9 1.9 0 1 1-2.7-2.7l.07-.06a1.7 1.7 0 0 0-1.2-2.9h-.17a1.9 1.9 0 1 1 0-3.8h.1a1.7 1.7 0 0 0 1.27-2.9l-.06-.06a1.9 1.9 0 1 1 2.7-2.7l.06.07a1.7 1.7 0 0 0 2.9-1.2V2.7a1.9 1.9 0 1 1 3.8 0v.1a1.7 1.7 0 0 0 2.9 1.27l.06-.06a1.9 1.9 0 1 1 2.7 2.7l-.07.06a1.7 1.7 0 0 0 1.2 2.9h.17a1.9 1.9 0 1 1 0 3.8h-.1a1.7 1.7 0 0 0-1.56 1.03z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  pin: '<path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10z"/><circle cx="12" cy="11" r="2.2"/>',
  grip: '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
  warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  up: '<path d="M12 19V6M6 12l6-6 6 6"/>',
  down: '<path d="M12 5v13M6 12l6 6 6-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  sparkle: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.2 2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  chart: '<path d="M5 20V11M12 20V5M19 20v-6"/>',
  print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="2"/><path d="M7 16h10v4H7z"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  share: '<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 11l8-4M8 13l8 4"/>',
  send: '<path d="M4 12l16-7-7 16-2.5-6.5z"/>',
  box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  coin: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v6c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 13v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/>',
  copy: '<rect x="4" y="4" width="12" height="12" rx="2"/><path d="M8 20h10a2 2 0 0 0 2-2V8"/>',
  layers: '<path d="M12 3l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/>',
  music: '<circle cx="7" cy="18" r="2.6"/><circle cx="18" cy="16" r="2.6"/><path d="M9.6 18V7l11-2v11"/>',
  out: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 8l-4 4 4 4M6 12h9"/>'
};

// สร้างโค้ดไอคอนเส้นหนึ่งอัน (สีตามตัวอักษรที่ครอบ)
export function glyph(name, size = 20) {
  const body = GLYPHS[name] || '';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// เติมไอคอนให้ทุกช่องที่เขียน data-glyph="ชื่อ" ไว้ในโครงหน้า
export function fillGlyphs(root, size = 20) {
  root.querySelectorAll('[data-glyph]').forEach(el => { el.innerHTML = glyph(el.dataset.glyph, size); });
}

// แถบหัวเรื่องของหน้า: ปุ่มกลับ + ชื่อหน้า + วันที่ + ตั้งค่า (ใช้ได้ทุกหน้า)
export function topBarHtml({ title, date, dateId = 'bar-date' }) {
  return `
    <header class="bar">
      <button class="bar__round" type="button" aria-label="ย้อนกลับ" data-back="1">${glyph('back')}</button>
      <h1 class="bar__title"><span>${title}</span></h1>
      <button class="bar__date" type="button"><span class="bar__date-ic">${glyph('calendar', 17)}</span><span id="${dateId}">${date || ''}</span></button>
      <button class="bar__round bar__round--gear" type="button" aria-label="ตั้งค่า">${glyph('gear')}</button>
    </header>`;
}

// วาดปุ่มเมนู 1 ปุ่ม
function navButton(item, activeId) {
  const cls = ['nav__btn'];
  if (item.id === activeId) cls.push('is-active');
  if (item.kind === 'special') cls.push('nav__btn--special');
  return `
    <button class="${cls.join(' ')}" type="button" data-nav="${item.id}" style="--accent:${item.accent}">
      <span class="nav__icon"><img src="${item.icon}" alt="${item.navLabel}" width="54" height="54" decoding="async"></span>
    </button>`;
}

// วาดแผงรายการย่อยของปุ่มที่กด
function sheetHtml(item) {
  const rows = item.items.map((name, i) => `
    <button class="sheet__row" type="button" data-sub="${(item.goto && item.goto[name]) || ''}">
      <span class="sheet__dot" style="background:${PASTEL_DOTS[i % PASTEL_DOTS.length]}"></span>
      <span>${name}</span>
    </button>`).join('');
  return `
    <div class="sheet__scrim" data-close="1"></div>
    <div class="sheet" style="--accent:${item.accent}">
      <div class="sheet__head">
        <span class="sheet__title">${item.label}</span>
        <button class="sheet__close" type="button" data-close="1" aria-label="ปิด">✕</button>
      </div>
      <div class="sheet__rows">${rows}</div>
    </div>`;
}

// ติดตั้งเมนูล่างลงในกล่องที่ส่งมา (activeId = หน้าที่กำลังเปิดอยู่, onGo = พาไปหน้าอื่น)
export function mountNav(host, activeId, onGo) {
  host.innerHTML = `
    <div class="nav__layer" id="nav-layer"></div>
    <nav class="nav" aria-label="เมนูหลัก">${APP_NAV.map(i => navButton(i, activeId)).join('')}</nav>`;

  // หากล่องแผงรายการย่อยตอนจะใช้จริง (กล่องถูกวาดใหม่ทุกครั้งที่เปลี่ยนหน้า)
  const layerNow = () => host.querySelector('#nav-layer');

  // ปิดแผงรายการย่อย
  const close = () => { const layer = layerNow(); if (!layer) return; layer.innerHTML = ''; layer.classList.remove('is-open'); };

  // เปิดแผงรายการย่อยของปุ่มนั้น
  const open = item => {
    const layer = layerNow();
    if (!layer) return;
    layer.innerHTML = sheetHtml(item);
    requestAnimationFrame(() => layer.classList.add('is-open'));
  };

  // ใช้ onclick (ไม่ใช่ addEventListener) เพื่อไม่ให้ตัวจับคลิกทับซ้อนกันทุกครั้งที่เปลี่ยนหน้า
  host.onclick = event => {
    // รายการย่อยที่มีหน้าปลายทาง กดแล้วพาไปหน้านั้น นอกนั้นแค่ปิดแผง
    const sub = event.target.closest('.sheet__row');
    if (sub) { close(); if (sub.dataset.sub && onGo) onGo(sub.dataset.sub); return; }
    if (event.target.closest('[data-close]')) return close();
    const btn = event.target.closest('[data-nav]');
    if (!btn) return;
    const item = APP_NAV.find(i => i.id === btn.dataset.nav);
    if (!item) return;
    close();
    // ปุ่มที่มีรายการย่อย เด้งแผงขึ้นมา นอกนั้นพาไปหน้านั้นตรงๆ
    if (item.items) open(item);
    else if (onGo) onGo(item.id);
  };
}

// กล่องของแอปที่ใช้วางข้อความ/แผงต่างๆ
function appHost() { return document.querySelector('.app') || document.body; }

// ข้อความแจ้งผลสั้นๆ ลอยขึ้นมาแล้วหายเอง
export function toast(message) {
  const host = appHost();
  host.querySelectorAll('.toast').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-on'));
  setTimeout(() => { el.classList.remove('is-on'); setTimeout(() => el.remove(), 240); }, 2200);
}

// เปิดแผงลอยด้านล่าง คืนค่าที่ผู้ใช้เลือก (null = ปิดไปเฉยๆ)
function openSheet(inner) {
  return new Promise(resolve => {
    const host = appHost();
    const wrap = document.createElement('div');
    wrap.className = 'ask';
    wrap.innerHTML = `<div class="ask__scrim" data-pick=""></div><div class="ask__box">${inner}</div>`;
    host.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('is-on'));
    wrap.addEventListener('click', event => {
      const hit = event.target.closest('[data-pick]');
      if (!hit) return;
      wrap.classList.remove('is-on');
      setTimeout(() => wrap.remove(), 240);
      resolve(hit.dataset.pick || null);
    });
  });
}

// ถามยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ เช่น ลบ
export async function confirmSheet({ title, text = '', okLabel = 'ตกลง', danger = false }) {
  const picked = await openSheet(`
    <div class="ask__title">${title}</div>
    ${text ? `<div class="ask__text">${text}</div>` : ''}
    <div class="ask__go">
      <button class="ask__btn ask__btn--off" type="button" data-pick="">ยกเลิก</button>
      <button class="ask__btn${danger ? ' ask__btn--danger' : ''}" type="button" data-pick="ok">${okLabel}</button>
    </div>`);
  return picked === 'ok';
}

// แผงให้เลือก 1 อย่างจากรายการ (options = [{ value, label, image }])
export function pickerSheet({ title, options }) {
  const rows = options.map(o => `
    <button class="ask__row" type="button" data-pick="${o.value}">
      ${o.image ? `<img src="${o.image}" alt="" width="36" height="36" loading="lazy" decoding="async">` : ''}<span>${o.label}</span>
    </button>`).join('');
  return openSheet(`
    <div class="ask__title">${title}</div>
    <div class="ask__rows">${rows}</div>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">ปิด</button></div>`);
}

// ช่องกรอกตัวเลขพร้อมปุ่มลด/เพิ่ม (ใช้ได้ทุกหน้า)
export function stepperHtml({ name, label, value, unit, step = 1 }) {
  return `
    <div class="num">
      <span class="num__label">${label}</span>
      <button class="num__btn" type="button" data-step="-${step}" aria-label="ลด">−</button>
      <input class="num__input" type="number" inputmode="decimal" step="${step}" min="0" data-f="${name}" value="${value}">
      <span class="num__unit">${unit}</span>
      <button class="num__btn" type="button" data-step="${step}" aria-label="เพิ่ม">+</button>
    </div>`;
}

// ทำให้ปุ่มลด/เพิ่มของช่องตัวเลขในกล่องนี้ใช้งานได้
export function bindSteppers(root) {
  root.addEventListener('click', event => {
    const btn = event.target.closest('[data-step]');
    if (!btn) return;
    const input = btn.closest('.num').querySelector('input');
    const next = (Number(input.value) || 0) + Number(btn.dataset.step);
    input.value = Math.max(0, Math.round(next * 100) / 100);
  });
}

// ช่องกรอกตัวเลขหน่วยกรัม (จำนวนเต็ม) ใช้ในตารางของหลายหน้า
export function gramCell(id, field, value) {
  return `<input class="ptab__in ptab__in--g" type="number" inputmode="numeric" step="10" min="0" placeholder="-" data-id="${id}" data-f="${field}" value="${value === null || value === undefined ? '' : Math.round(value)}">`;
}

// กราฟแท่งเล็กท้ายแถว (sparkline) — ใช้ทั้งหน้าพยากรณ์และหน้าของฟ้าทั้งหมด
export function sparkBars(values, color = '#3B8BE0', h = 24) {
  const nums = values.map(v => Number(v) || 0);
  const max = Math.max(...nums, 1);
  const w = nums.length * 5 - 1;
  const bars = nums.map((v, i) => {
    const bh = Math.max(2, v / max * h);
    return `<rect x="${i * 5}" y="${(h - bh).toFixed(1)}" width="4" height="${bh.toFixed(1)}" rx="1.2" fill="${color}" opacity="${(0.4 + 0.6 * (v / max)).toFixed(2)}"/>`;
  }).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}

// แผงกรอกข้อมูลสั้นๆ คืนค่าเป็นวัตถุตาม key ของแต่ละช่อง (null = ยกเลิก)
export function formSheet({ title, fields, okLabel = 'บันทึก' }) {
  const fieldHtml = f => {
    if (f.kind === 'select') return `<label class="ask__field"><span>${f.label}</span><select data-k="${f.key}">${f.options.map(o => `<option value="${o.value}"${o.value === f.value ? ' selected' : ''}>${o.label}</option>`).join('')}</select></label>`;
    if (f.kind === 'swatch') return `<div class="ask__field"><span>${f.label}</span><div class="ask__swatches" data-k="${f.key}">${f.options.map((o, i) => `<button class="ask__swatch${i === 0 ? ' is-on' : ''}" type="button" data-v="${o.value}" style="background:${o.value}" aria-label="สี"></button>`).join('')}</div></div>`;
    if (f.kind === 'image') return `<div class="ask__field"><span>${f.label}</span><div class="ask__icons" data-k="${f.key}">${f.options.map((o, i) => `<button class="ask__icon${i === 0 ? ' is-on' : ''}" type="button" data-v="${o.value}" title="${o.label}"><img src="${o.image}" alt="${o.label}"></button>`).join('')}</div></div>`;
    if (f.kind === 'number') return `<label class="ask__field"><span>${f.label}</span><input type="number" inputmode="decimal" step="${f.step || 0.1}" min="0" data-k="${f.key}" value="${f.value ?? ''}" placeholder="${f.placeholder || ''}"></label>`;
    return `<label class="ask__field"><span>${f.label}</span><input data-k="${f.key}" value="${f.value || ''}" placeholder="${f.placeholder || ''}"></label>`;
  };
  return new Promise(resolve => {
    const host = appHost();
    const wrap = document.createElement('div');
    wrap.className = 'ask';
    wrap.innerHTML = `<div class="ask__scrim" data-x="1"></div>
      <div class="ask__box">
        <div class="ask__title">${title}</div>
        <div class="ask__form">${fields.map(fieldHtml).join('')}</div>
        <div class="ask__go">
          <button class="ask__btn ask__btn--off" type="button" data-x="1">ยกเลิก</button>
          <button class="ask__btn" type="button" data-ok="1">${okLabel}</button>
        </div>
      </div>`;
    host.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('is-on'));
    const done = value => { wrap.classList.remove('is-on'); setTimeout(() => wrap.remove(), 240); resolve(value); };
    wrap.addEventListener('click', event => {
      const pick = event.target.closest('.ask__swatch, .ask__icon');
      if (pick) {
        pick.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('is-on'));
        pick.classList.add('is-on');
        return;
      }
      if (event.target.closest('[data-x]')) return done(null);
      if (!event.target.closest('[data-ok]')) return;
      const out = {};
      wrap.querySelectorAll('[data-k]').forEach(el => {
        out[el.dataset.k] = el.matches('input, select') ? String(el.value).trim() : (el.querySelector('.is-on') || {}).dataset?.v || '';
      });
      done(out);
    });
  });
}

// กราฟแท่งพร้อมป้ายชื่อใต้แท่ง (ใช้ทั้งแท็บประวัติและ Report)
export function barChart(rows, { h = 96, color = '#3B8BE0' } = {}) {
  const max = Math.max(...rows.map(r => Number(r.value) || 0), 1);
  const bars = rows.map(r => {
    const v = Number(r.value) || 0;
    const bh = Math.max(2, Math.round(v / max * h));
    return `<div class="chart__col">
      <span class="chart__val">${r.top ?? ''}</span>
      <span class="chart__bar" style="height:${bh}px;background:${r.color || color}"></span>
      <span class="chart__lab">${r.label}</span>
    </div>`;
  }).join('');
  return `<div class="chart" style="--chart-h:${h}px">${bars}</div>`;
}

// กราฟเส้นแบบ SVG จริง (values = ตัวเลขตามลำดับ, labels = ป้ายแกนล่าง)
export function lineChart(values, labels, { w = 320, h = 110, color = '#2F63C9', fill = 'rgba(59,139,224,.14)' } = {}) {
  const nums = values.map(v => Number(v) || 0);
  const max = Math.max(...nums, 1), pad = 18;
  const stepX = nums.length > 1 ? (w - pad * 2) / (nums.length - 1) : 0;
  const pt = i => [pad + stepX * i, h - pad - (nums[i] / max) * (h - pad * 2)];
  const line = nums.map((_, i) => pt(i).map(n => n.toFixed(1)).join(',')).join(' ');
  const area = `${pad},${h - pad} ${line} ${(pad + stepX * (nums.length - 1)).toFixed(1)},${h - pad}`;
  const dots = nums.map((v, i) => { const [x, y] = pt(i); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#fff" stroke="${color}" stroke-width="2"/>`; }).join('');
  const ticks = (labels || []).map((l, i) => `<text x="${pt(i)[0].toFixed(1)}" y="${h - 4}" text-anchor="middle" font-size="9" fill="#7C8A9B">${l}</text>`).join('');
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}" role="img">
    <polygon points="${area}" fill="${fill}"/>
    <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>
    ${dots}${ticks}
  </svg>`;
}

// วงโดนัทสัดส่วน (parts = [{ label, value, color }])
export function donut(parts, { size = 108, hole = 0.62 } = {}) {
  const total = parts.reduce((s, p) => s + (Number(p.value) || 0), 0) || 1;
  const r = size / 2, rr = r * (1 + hole) / 2, sw = r * (1 - hole);
  const c = 2 * Math.PI * rr;
  let acc = 0;
  const rings = parts.map(p => {
    const frac = (Number(p.value) || 0) / total;
    const seg = `<circle cx="${r}" cy="${r}" r="${rr.toFixed(2)}" fill="none" stroke="${p.color}" stroke-width="${sw.toFixed(2)}" stroke-dasharray="${(c * frac).toFixed(2)} ${(c * (1 - frac)).toFixed(2)}" stroke-dashoffset="${(-c * acc).toFixed(2)}" transform="rotate(-90 ${r} ${r})"/>`;
    acc += frac;
    return seg;
  }).join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" role="img">${rings}</svg>`;
}

// dropdown มีป้ายกำกับ ใช้ <select> ของเบราว์เซอร์ในกรอบสวยๆ (เปิดด้วยคีย์บอร์ด / ปิดด้วย Escape ได้เอง)
// หน้าที่ใช้จับ event 'change' ที่ root แล้วอ่าน data-dd = name (hideLabel = ซ่อนป้ายทางสายตา แต่ยังอ่านออกเสียงได้)
export function dropdownHtml({ name, label, value, options, hideLabel = false, block = false }) {
  const opts = options.map(o => `<option value="${o.value}"${String(o.value) === String(value) ? ' selected' : ''}>${o.label}</option>`).join('');
  return `<label class="dd${block ? ' dd--block' : ''}"><span class="dd__label${hideLabel ? ' is-hidden' : ''}">${label}</span><select class="dd__select" data-dd="${name}" aria-label="${label}">${opts}</select>${glyph('chevron', 14)}</label>`;
}

// ค่าแบ่งแกน Y แบบกลมๆ จากค่ามากสุด เช่น 5.8 → [0, 2, 4, 6, 8]
export function niceTicks(max, count = 4) {
  const m = Math.max(Number(max) || 0, 1e-9);
  const rough = m / count, mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 2.5, 5, 10].map(k => k * mag).find(s => s * count >= m);
  return Array.from({ length: count + 1 }, (_, i) => Math.round(step * i * 1000) / 1000);
}

// กราฟแท่งมีแกน Y: labels = ป้ายแกน X, series = [{ name, color, values }] (ค่า null = วันไม่มีข้อมูล แสดงช่องว่าง), mean = เส้นประค่าเฉลี่ย
export function axisBarChart({ labels, series, ticks, unit = '', mean = null, meanLabel = '', fmt = v => String(v), h = 120, missingText = 'ยังไม่มีข้อมูล' }) {
  const top = ticks[ticks.length - 1] || 1, pct = v => Math.min(100, Math.max(0, v / top * 100)).toFixed(1);
  const legend = series.filter(s => s.name).map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`)
    .concat(mean !== null && meanLabel ? [`<span><i class="is-line"></i>${meanLabel}</span>`] : []).join('');
  const ys = ticks.map(t => `<span style="bottom:${pct(t)}%">${fmt(t)}</span>`).join('');
  const lines = ticks.map(t => `<i class="ch__line" style="bottom:${pct(t)}%"></i>`).join('');
  const meanEl = mean !== null ? `<i class="ch__mean" style="bottom:${pct(mean)}%" title="${meanLabel} ${fmt(mean)} ${unit}"></i>` : '';
  const cols = labels.map((l, i) => `<div class="ch__col">${series.map(s => {
    const v = s.values[i];
    if (v === null || v === undefined) return `<span class="ch__bar ch__bar--none" title="${l} · ${missingText}" aria-label="${l} ${missingText}"><b>–</b></span>`;
    return `<span class="ch__bar" style="height:${pct(v)}%;background:${s.color}" title="${l} · ${fmt(v)} ${unit}" aria-label="${l} ${fmt(v)} ${unit}"><b>${fmt(v)}</b></span>`;
  }).join('')}</div>`).join('');
  return `<div class="ch">${legend ? `<div class="ch__legend">${legend}</div>` : ''}
    <div class="ch__body" style="--h:${h}px"><div class="ch__y"><span class="ch__unit">${unit}</span>${ys}</div>
    <div class="ch__plot">${lines}${meanEl}<div class="ch__cols">${cols}</div></div></div>
    <div class="ch__x">${labels.map(l => `<em>${l}</em>`).join('')}</div></div>`;
}

// กราฟเส้นสะสมมีแกน Y (SVG): labels = แกน X, series = [{ name, color, values }], ticks = ค่าแกน Y, fmt = แปลงตัวเลขบนป้าย
export function axisLineChart({ labels, series, ticks, unit = '', fmt = v => String(v) }) {
  const W = 320, H = 140, L = 44, R = 56, T = 16, B = 24, n = labels.length;
  const top = ticks[ticks.length - 1] || 1;
  const x = i => L + (n > 1 ? (W - L - R) * i / (n - 1) : 0);
  const y = v => T + (H - T - B) * (1 - v / top);
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke="#E6ECE9"/><text x="${L - 6}" y="${(y(t) + 3).toFixed(1)}" text-anchor="end" font-size="9.5" fill="#667B83">${fmt(t)}</text>`).join('');
  const xs = labels.map((l, i) => `<text x="${x(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="9.5" fill="#667B83">${l}</text>`).join('');
  const lines = series.map(s => {
    const pts = s.values.map((v, i) => [x(i), y(v)]);
    const dots = pts.map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.4" fill="#fff" stroke="${s.color}" stroke-width="2"/>`).join('');
    const [ex, ey] = pts[pts.length - 1], label = fmt(s.values[s.values.length - 1]), pw = label.length * 6 + 12;
    return `<polyline points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linejoin="round"/>${dots}
      <rect x="${(ex + 7).toFixed(1)}" y="${(ey - 9).toFixed(1)}" width="${pw}" height="18" rx="9" fill="${s.color}"/>
      <text x="${(ex + 7 + pw / 2).toFixed(1)}" y="${(ey + 3.5).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="600" fill="#fff">${label}</text>`;
  }).join('');
  const legend = series.some(s => s.name) ? `<div class="ch__legend">${series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('')}</div>` : '';
  const desc = series.map(s => `${s.name || ''} ${s.values.map((v, i) => `${labels[i]} ${fmt(v)} ${unit}`).join(', ')}`).join('; ');
  return `<div class="ch">${legend}<svg class="lc" viewBox="0 0 ${W} ${H}" role="img" aria-label="${desc}" font-family="Sarabun, sans-serif">
    <text x="${L - 6}" y="9" text-anchor="end" font-size="9" fill="#667B83">${unit}</text>${grid}${xs}${lines}</svg></div>`;
}

// ---------- การ์ดเมนูแบบกระจกฝ้า (ใช้ทั้งหน้าอื่นๆ และหน้าปุ่มพิเศษ) ----------

// รูปหรือไอคอนเส้นในกรอบกระจกเล็ก
function gBadge(card, size) {
  const art = card.icon
    ? `<img src="${card.icon}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async">`
    : glyph(card.glyph, size - 14);
  return `<span class="gcard__badge" style="--bw:${size}px">${art}</span>`;
}

// บรรทัดข้อความกำกับใต้ชื่อการ์ด (มีก็แสดง ไม่มีก็ข้าม)
function gSub(card) {
  return card.sub ? `<span class="gcard__sub">${card.sub}</span>` : '';
}

// เนื้อการ์ดแต่ละรูปแบบ (hero ใบใหญ่ / half ครึ่งจอ / stack ซ้อนรายการ / capsule แคปซูล / data การ์ดวิเคราะห์)
const GLASS_SHAPES = {
  hero: card => `
    ${gBadge(card, 76)}
    <span class="gcard__body">
      <span class="gcard__kicker">${card.kicker}</span>
      <span class="gcard__title">${card.title}</span>
      ${gSub(card)}
      <span class="gcard__meta">${card.meta}</span>
    </span><span class="gcard__go">›</span>`,
  half: card => `
    ${gBadge(card, 48)}
    <span class="gcard__body">
      <span class="gcard__title">${card.title}</span>
      ${gSub(card)}
      <span class="gcard__meta">${card.meta}</span>
    </span>`,
  stack: card => `
    <span class="gcard__top">
      ${gBadge(card, 44)}
      <span class="gcard__body">
        <span class="gcard__title">${card.title}</span>
        ${gSub(card)}
      </span><span class="gcard__go">›</span>
    </span>
    <span class="gcard__rows">${card.rows.map(r => `
      <span class="grow">
        <span class="grow__label">${r.label}</span>
        <span class="grow__value grow__value--${r.tone}">${r.value}</span>
      </span>`).join('')}</span>`,
  capsule: card => `
    ${gBadge(card, 42)}
    <span class="gcard__body">
      <span class="gcard__title">${card.title}</span>
      ${gSub(card)}
    </span>
    <span class="gcard__pill">${card.meta}</span><span class="gcard__go">›</span>`,
  data: card => `
    <span class="gcard__top">
      ${gBadge(card, 42)}
      <span class="gcard__body">
        <span class="gcard__kicker">${card.kicker}</span>
        <span class="gcard__title">${card.title}</span>
        ${gSub(card)}
      </span><span class="gcard__go">›</span>
    </span>
    <span class="gcard__stats">${card.stats.map(s => `
      <span class="gstat">
        <span class="gstat__label">${s.label}</span>
        <span class="gstat__value">${s.value}<em>${s.unit}</em></span>
      </span>`).join('')}</span>
    <span class="gcard__spark">
      <span class="gcard__sparkLabel">${card.sparkLabel}</span>
      ${sparkBars(card.spark, '#7FE8E6', 30)}
    </span>`
};

// วาดการ์ดกระจกทั้งชุด
export function glassCards(cards) {
  return cards.map(card => `
    <button class="gcard gcard--${card.kind}" type="button" data-card="${card.id}"
      style="--a:${card.accent};--a2:${card.accent2}">
      <span class="gcard__gloss"></span>${GLASS_SHAPES[card.kind](card)}
    </button>`).join('');
}

// ติดตั้งหน้าการ์ดกระจก 1 หน้า (ui = ข้อความหัวหน้า, cards = การ์ด, onPick = กดการ์ดแล้วทำอะไร)
export function mountGlassPage(root, ui, cards, onPick) {
  root.querySelector('#g-title').textContent = ui.title;
  root.querySelector('#g-sub').textContent = ui.sub;
  root.querySelector('#g-count').textContent = fillText(ui.count, { n: cards.length });
  root.querySelector('#g-grid').innerHTML = glassCards(cards);
  root.onclick = event => {
    const hit = event.target.closest('[data-card]');
    if (hit) onPick(cards.find(c => c.id === hit.dataset.card));
  };
}

// สั่งพิมพ์เฉพาะกล่องที่ระบุ (ใช้กับรายงาน)
export function printArea(selector) {
  const app = document.querySelector('.app') || document.body;
  const target = document.querySelector(selector);
  if (!target) return;
  target.classList.add('is-printing');
  app.classList.add('printing');
  const done = () => { app.classList.remove('printing'); target.classList.remove('is-printing'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 60);
}
