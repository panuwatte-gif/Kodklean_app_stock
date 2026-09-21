// ชิ้นส่วนหน้าจอเฉพาะหน้านับของครัว (หัวหน้าจอ · การ์ดหัวเรื่อง · แท็บ · ตารางนับ · แถบล่าง)
import { glyph, itemPhoto } from '../shared/ui.js';
import { KITCHEN_UI as T } from '../shared/config.js';
import { dayLongTh, fillText } from '../shared/format.js';

// ขึ้นบรรทัดใหม่ในข้อความที่ตั้งไว้ใน config
const br = text => String(text || '').replace(/\n/g, '<br>');

// แถบบนสุด: ปุ่มกลับ + โลโก้ + ชื่อคนที่รับผิดชอบแท็บนี้
export function ktTopHtml(person) {
  return `
    <header class="ktop">
      <button class="ktop__back" type="button" data-back="1">${glyph('back', 17)}<span>${T.back}</span></button>
      <img class="ktop__logo" src="assets/brand/logo-lockup-256.webp" alt="KodKlean" width="74" height="35" decoding="async">
      <span class="ktop__me">
        <img src="${person.avatar}" alt="" width="34" height="34" decoding="async">
        ${person.name}<i>▾</i>
      </span>
    </header>`;
}

// การ์ดหัวเรื่องของแท็บที่เปิดอยู่ (ชื่อหน้า · คำอธิบาย · วันที่ทำงาน · ตัวการ์ตูน · คำพูด)
export function ktHeroHtml(tab, date) {
  return `
    <section class="khero${tab.kind === 'prep' ? ' khero--pair' : ''}">
      <div class="khero__text">
        <h1 class="khero__title"><img src="${tab.icon}" alt="" width="30" height="30" decoding="async">${tab.title}</h1>
        <p class="khero__sub">${tab.sub}</p>
        <label class="kdate">
          ${glyph('calendar', 20)}
          <span class="kdate__text"><em>${T.dateLabel}</em><b>${dayLongTh(date)}</b></span>
          <i class="kdate__caret">▾</i>
          <input class="kdate__pick" type="date" id="kt-date-pick" value="${date}" aria-label="${T.dateLabel}">
        </label>
      </div>
      <span class="khero__bubble">${br(tab.bubble)}</span>
      <img class="khero__char" src="${tab.hero}" alt="" height="190" decoding="async">
    </section>`;
}

// แถวแท็บของคนนั้น (2 หรือ 4 แท็บ)
export function ktTabsHtml(tabs, activeId) {
  return `<nav class="ktabs">${tabs.map(t => `
    <button class="ktab${t.id === activeId ? ' is-on' : ''}" type="button" data-tab="${t.id}" style="--a:${t.accent}">
      <img src="${t.icon}" alt="" width="24" height="24" loading="lazy" decoding="async">
      <span>${t.tab}</span>
    </button>`).join('')}</nav>`;
}

// ช่องค้นหา + ปุ่มเพิ่ม/จัดการรายการ
export function ktToolsHtml(state, tab) {
  return `
    <div class="ktools">
      <div class="ksearch">
        ${glyph('search', 19)}
        <input type="search" id="kt-search" placeholder="${tab.search}" value="${state.q}" aria-label="${tab.search}">
      </div>
      <button class="kbtn kbtn--add" type="button" data-act="add">${glyph('plus', 17)}<span>${T.add}</span></button>
      <button class="kbtn kbtn--manage" type="button" data-act="manage">${glyph('gear', 17)}<span>${T.manage}</span></button>
    </div>`;
}

// แถวกรอกจำนวน 1 รายการ
function rowHtml(item) {
  return `
    <div class="krow" data-id="${item.id}">
      <span class="krow__thumb"><img src="${itemPhoto(item)}" alt="" width="40" height="40" loading="lazy" decoding="async"></span>
      <span class="krow__name">${item.name}</span>
      <input class="krow__in" type="number" inputmode="decimal" step="0.1" min="0" placeholder="${T.waiting}" value="${item.qty ?? ''}" aria-label="${item.name}">
      <span class="krow__unit">${item.unit || ''}</span>
      <button class="krow__more" type="button" data-more="${item.id}" aria-label="${T.moreTitle}">⋮</button>
    </div>`;
}

// ตารางรายการของแท็บนี้ (การ์ดกระจก)
export function ktTableHtml(rows, tab, emptyText) {
  const body = rows.length
    ? `<div class="ktable__head"><b>${tab.col}</b><em>${T.colQty}</em></div>${rows.map(rowHtml).join('')}`
    : `<p class="kempty">${emptyText}</p>`;
  const add = rows.length ? `<button class="ktable__add" type="button" data-act="add">${glyph('plus', 16)}${tab.addRow}</button>` : '';
  return `<section class="ktable">${body}${add}</section>`;
}

// แถบคำพูดใต้ตาราง (ตัวการ์ตูนเล็ก + คำคมของแท็บนั้น)
export function ktQuoteHtml(tab) {
  return `
    <section class="kquote">
      <span class="kquote__text">${br(tab.quote)}</span>
      <img class="kquote__char" src="${tab.chibi}" alt="" height="104" loading="lazy" decoding="async">
      <span class="kquote__bubble">${br(tab.script)}</span>
    </section>`;
}

// แถบล่าง: สถานะการบันทึก + ปุ่มบันทึก
export function ktFootHtml({ done, total, dirty }, label) {
  const note = dirty ? fillText(T.dirty, { n: dirty }) : T.notSavedHint;
  return `
    <div class="kfoot">
      <span class="kfoot__state${dirty ? ' is-dirty' : ''}">
        <b>${T.notSaved}</b>
        <em>${total ? fillText(T.progress, { a: done, b: total }) : note}</em>
      </span>
      <button class="kfoot__save" type="button" data-save="1">${glyph('check', 18)}<span>${label}</span></button>
    </div>`;
}
