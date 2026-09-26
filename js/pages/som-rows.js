// ชิ้นส่วนหน้าจอเฉพาะหน้านับสต๊อกเครื่องดื่มของส้ม (หัวหน้าจอ · แท็บ · ตาราง · แถบสรุป)
import { glyph, itemPhoto } from '../shared/ui.js';
import { SOM_UI as T, SOM_MY_UI as MY } from '../shared/config.js';
import { money, dayLongTh } from '../shared/format.js';

// ขึ้นบรรทัดใหม่ในข้อความที่ตั้งไว้ใน config
const br = text => String(text).replace(/\n/g, '<br>');

// แถบบนสุด: ปุ่มกลับ + โลโก้ + ชื่อคนที่รับผิดชอบงานนี้
export function somTopHtml(person) {
  return `
    <header class="stop">
      <button class="stop__back" type="button" data-back="1" aria-label="กลับ">${glyph('back', 18)}</button>
      <img class="stop__logo" src="assets/brand/logo-lockup-256.webp" alt="KodKlean" width="72" height="34" decoding="async">
      <span class="stop__gap"></span>
      <span class="stop__me">
        <img src="assets/login/avatar-${person.code}.webp" alt="" width="34" height="34" decoding="async">
        ${person.name}<i>▾</i>
      </span>
    </header>`;
}

// การ์ดหัวเรื่องของแท็บที่เปิดอยู่ (ชื่อหน้า คำอธิบาย ตัวการ์ตูนส้ม คำพูด)
export function somHeroHtml(tab) {
  return `
    <section class="shero">
      <h1 class="shero__title">${br(tab.title)}</h1>
      <p class="shero__sub">${tab.sub}</p>
      <span class="shero__bubble">${br(tab.bubble)}</span>
      <img class="shero__char" src="${tab.char}" alt="ส้ม" height="188" decoding="async">
      <span class="shero__script">${br(tab.script)}</span>
      <img class="shero__leaf shero__leaf--a" src="assets/som/theme-leaf-2.webp" alt="" width="30" height="28" decoding="async">
      <img class="shero__leaf shero__leaf--b" src="assets/som/theme-leaf-3.webp" alt="" width="14" height="30" decoding="async">
      <img class="shero__leaf shero__leaf--c" src="assets/som/theme-bubble.webp" alt="" width="14" height="14" decoding="async">
    </section>`;
}

// แถวแท็บ 4 หมวด + แท็บแปลภาษาพม่า
export function somTabsHtml(activeId) {
  return `<nav class="stabs">${[...T.tabs, MY.tab].map(t => `
    <button class="stab${t.id === activeId ? ' is-on' : ''}" type="button" data-tab="${t.id}">
      ${t.glyph ? `<i class="stab__glyph">${glyph(t.glyph, 22)}</i>` : `<img src="${t.icon}" alt="" width="26" height="26" loading="lazy" decoding="async">`}
      <span>${br(t.tab)}</span>
    </button>`).join('')}</nav>`;
}

// แถบวันที่ + ช่องค้นหา + ปุ่มเพิ่ม/จัดการรายการ
export function somToolsHtml(state, tab) {
  return `
    <div class="stools">
      <label class="sdate">
        ${glyph('calendar', 22)}
        <span class="sdate__text"><em>${T.dateLabel}</em><b>${dayLongTh(state.date)}</b></span>
        <input class="sdate__pick" type="date" id="som-date-pick" value="${state.date}" aria-label="${T.dateLabel}">
      </label>
      <div class="ssearch">
        ${glyph('search', 20)}
        <input type="search" id="som-search" placeholder="${tab.search}" value="${state.q}" aria-label="${tab.search}">
      </div>
    </div>
    <div class="sacts">
      <button class="sbtn sbtn--add" type="button" data-act="add">${glyph('plus', 18)}<span>${T.add}</span></button>
      <button class="sbtn sbtn--manage" type="button" data-act="manage">${glyph('filter', 18)}<span>${T.manage}</span></button>
    </div>`;
}

// ป้ายสถานะของแถว (ยังไม่กรอก = ยังไม่นับ ห้ามแปลงเป็น 0)
export function somTagHtml(qty, tab) {
  if (qty === null || qty === undefined || qty === '') return `<span class="stag stag--none">${T.waiting}</span>`;
  return Number(qty) > 0
    ? `<span class="stag stag--ok"><i></i>${tab.ok}</span>`
    : `<span class="stag stag--out"><i></i>${tab.out}</span>`;
}

// แถวกรอกจำนวน 1 รายการ
function rowHtml(item, index, tab) {
  return `
    <div class="srow" data-id="${item.id}">
      <span class="srow__no">${index + 1}</span>
      <span class="srow__item">
        <span class="srow__thumb"><img src="${itemPhoto(item)}" alt="" width="38" height="38" loading="lazy" decoding="async"></span>
        <span class="srow__name"><b${item.name_my ? ' data-no-my="1"' : ''}>${item.name}</b>${item.name_my ? `<span class="srow__my" lang="my">${item.name_my}</span>` : ''}<em>${item.location}</em></span>
      </span>
      <input class="srow__in" type="number" inputmode="numeric" min="0" step="1" placeholder="-" value="${item.qty ?? ''}" aria-label="${item.name}">
      <span class="srow__unit"${item.unit_my ? ' data-no-my="1"' : ''}>${item.unit || ''}${item.unit_my ? ` / <span class="srow__my" lang="my">${item.unit_my}</span>` : ''}</span>
      ${somTagHtml(item.qty, tab)}
      <button class="srow__more" type="button" data-more="${item.id}" aria-label="${T.moreTitle}">⋮</button>
    </div>`;
}

// ตารางรายการทั้งหมดของแท็บนี้
export function somTableHtml(rows, tab, emptyText) {
  const head = `
    <div class="srow srow--head">
      <b>${T.colNo}</b><b>${tab.col}</b><b>${T.colQty}</b><b>${T.colUnit}</b><b>${T.colStatus}</b><b></b>
    </div>`;
  const body = rows.length
    ? rows.map((r, i) => rowHtml(r, i, tab)).join('')
    : `<p class="sempty">${emptyText}</p>`;
  return `<section class="stable">${head}${body}</section>`;
}

// แถบสรุปล่าง: จำนวนรายการ + ยอดรวมที่นับได้ + ปุ่มบันทึก
export function somFootHtml(rows, tab) {
  const counted = rows.filter(r => r.qty !== null && r.qty !== undefined && r.qty !== '');
  const total = counted.reduce((sum, r) => sum + Number(r.qty), 0);
  const units = [...new Set(rows.map(r => r.unit).filter(Boolean))];
  const unit = units.length === 1 ? units[0] : 'หน่วย';
  return `
    <div class="sfoot">
      <div class="sfoot__stats">
        <span class="sfoot__cell"><em>${tab.totalLabel}</em><b>${money(rows.length)} <span>รายการ</span></b></span>
        <span class="sfoot__cell"><em>${tab.qtyLabel}</em><b>${money(total)} <span>${unit}</span></b></span>
      </div>
      <button class="sfoot__save" type="button" data-save="1">${glyph('check', 18)}<span>${T.save}</span></button>
    </div>`;
}
