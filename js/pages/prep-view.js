// ชิ้นส่วนของหน้าเตรียม-เหลือที่ใช้ร่วมทุกแท็บ: การ์ดหัวเรื่อง แท็บ ชิปกรอง การ์ดตัวเลข การ์ดคำแนะนำ
import { PREP_TABS, PREP_HERO, PREP_FILTERS, PREP_NOTES, PREP_KPI, PREP_TIPS } from '../shared/config.js';
import { glyph } from '../shared/ui.js';
import { weightBig, count } from '../shared/format.js';

// รายชื่อคนรับผิดชอบ (ตั้งค่าจาก prep.js)
let people = [];
export function setPeople(list) { people = list; }

// หาข้อมูลคนจาก id
export const personOf = id => people.find(p => p.id === id) || { id, name: '?', color: '#9A8E7E', tint: '#F4F0E8', round: '', half: '' };

// ป้ายชื่อคนเล็กๆ ในตาราง
export function personPill(id) {
  const p = personOf(id);
  return `<span class="prep-pill" style="--c:${p.color};--t:${p.tint}">${p.name}</span>`;
}

// การ์ดหัวเรื่อง: มาสคอต + ชื่องาน + คนรับผิดชอบ
export function heroHtml(tab) {
  const h = PREP_HERO[tab];
  const cast = h.people.map(personOf);
  return `
    <img class="prep-hero__leaf" src="assets/bg/bg-leaf.webp" alt="" width="430" height="782" decoding="async">
    <img class="prep-hero__mascot" src="assets/prep/mascot-wave.webp" alt="กุ๊กไก่" width="104" height="131" decoding="async">
    <div class="prep-hero__text">
      <h2 class="prep-hero__title">${h.title}</h2>
      <p class="prep-hero__sub">${h.sub}</p>
    </div>
    <div class="prep-hero__cast prep-hero__cast--${cast.length}">
      ${cast.map(p => `
        <figure class="prep-hero__person">
          <img src="${p.half}" alt="${p.name}" height="112" decoding="async">
          <figcaption style="background:${p.color}">${p.name}</figcaption>
        </figure>`).join('')}
    </div>`;
}

// แท็บหลัก 4 อัน
export function tabsHtml(active) {
  return PREP_TABS.map(t => `
    <button class="prep-tab${t.id === active ? ' is-on' : ''}" type="button" data-tab="${t.id}">
      ${t.id === active ? `<span class="prep-tab__spark">${glyph('sparkle', 10)}</span>` : ''}
      <img src="${t.icon}" alt="" width="30" height="30" decoding="async">
      <span>${t.label}</span>
    </button>`).join('');
}

// ชิปกรองผู้รับผิดชอบ/หมวด + กล่องข้อความกำกับ (แท็บที่ไม่มีชิปกรอง จะไม่แสดงแถบนี้)
export function filterHtml(tab, active) {
  const list = PREP_FILTERS[tab];
  if (!list) return '';
  const chips = list.map(f => {
    const faces = f.people.map(personOf).map(p => `<img src="${p.round}" alt="" width="22" height="22" loading="lazy" decoding="async">`).join('');
    const lead = f.people.length ? `<span class="prep-chip__faces">${faces}</span>`
      : f.icon ? `<img class="prep-chip__ic" src="${f.icon}" alt="" width="20" height="20" loading="lazy" decoding="async">`
      : `<span class="prep-chip__grid">${glyph('grid', 18)}</span>`;
    return `<button class="prep-chip${f.id === active ? ' is-on' : ''}" type="button" data-filter="${f.id}">${lead}<span>${f.label}</span></button>`;
  }).join('');
  const note = PREP_NOTES[tab];
  return `
    <div class="prep-filter__chips${list.length > 4 ? ' prep-filter__chips--many' : ''}">${chips}</div>
    ${note ? `<div class="prep-note${note.image ? ' prep-note--img' : ''}"><span class="prep-note__ic">${glyph('info', 16)}</span><span>${note.text}</span>${note.image ? `<img src="${note.image}" alt="" width="52" loading="lazy" decoding="async">` : ''}</div>` : ''}`;
}

// การ์ดตัวเลขสรุป 5 ใบ
export function kpiHtml(tab, totals) {
  return (PREP_KPI[tab] || []).map(k => `
    <div class="prep-kpi" style="--c:${k.color};--t:${k.tint};--b:${k.border}">
      <div class="prep-kpi__head"><img src="${k.icon}" alt="" width="16" height="16" loading="lazy" decoding="async"><span>${k.label}</span></div>
      <div class="prep-kpi__num">${k.digits ? weightBig(totals[k.key]) : count(totals[k.key])}</div>
      <div class="prep-kpi__unit">${k.unit}</div>
    </div>`).join('');
}

// การ์ดคำแนะนำท้ายหน้า (เนื้อสัตว์ = 3 ขั้นตอน, ข้าว = 3 ข้อสรุป)
export function tipHtml(tab) {
  const tip = PREP_TIPS[tab];
  if (!tip) return '';
  if (tip.steps) return `
    <img class="prep-tip__mascot" src="assets/prep/mascot-thumbs.webp" alt="กุ๊กไก่" width="96" height="126" loading="lazy" decoding="async">
    <div class="prep-tip__steps">
      ${tip.steps.map((s, i) => `
        <div class="prep-step">
          <div class="prep-step__row"><span class="prep-step__no" style="background:${s.color}">${i + 1}</span><span class="prep-step__text">${s.text}</span></div>
          <img src="${s.icon}" alt="" width="34" height="34" loading="lazy" decoding="async">
        </div>`).join('')}
    </div>
    <div class="prep-tip__foot">${glyph('info', 15)}<span>${tip.foot}</span></div>`;
  return `
    <img class="prep-tip__mascot" src="assets/prep/mascot-thumbs.webp" alt="กุ๊กไก่" width="96" height="126" loading="lazy" decoding="async">
    <div class="prep-tip__body">
      ${tip.title ? `<div class="prep-tip__title">${tip.title}</div>` : ''}
      <ul class="prep-tip__checks">
        ${tip.checks.map(c => `<li><span class="prep-tip__check">${glyph('check', 12)}</span>${c}</li>`).join('')}
      </ul>
    </div>
    ${tip.image ? `<img class="prep-tip__art" src="${tip.image}" alt="" width="62" loading="lazy" decoding="async">` : ''}
    ${tip.bubble ? `<div class="prep-tip__bubble">${tip.bubble}</div>` : ''}`;
}

// แท็บที่ยังไม่มีข้อมูล
export function emptyHtml() {
  return `<div class="prep-empty"><img src="assets/prep/mascot-thumbs.webp" alt="" width="110" height="145" loading="lazy" decoding="async">กำลังจัดเตรียมหน้านี้</div>`;
}
