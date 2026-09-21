// ชิ้นส่วนหน้าจอที่ใช้ซ้ำในหน้างานรายวันของพนักงาน — หัวหน้าจอ การ์ดหัวเรื่อง การ์ดตัวการ์ตูน ปุ่มล่าง แผงประวัติ
import { glyph, openSheet, dateBarHtml, dateBandHtml } from './ui.js';
import { WORK_UI, WORK_PAGES } from './config.js';
import { getStaff } from './data.js';
import { workStaff } from './auth.js';

// แถบบนสุดของหน้างาน: ปุ่มกลับ + โลโก้ + ชื่อคนที่เป็นเจ้าของงาน
export function workTopHtml(person, back = WORK_UI.back) {
  return `
    <header class="wtop">
      <button class="wtop__back" type="button" data-back="1">${glyph('back', 16)}<span>${back}</span></button>
      <img class="wtop__logo" src="assets/brand/logo-lockup-256.webp" alt="KodKlean" width="74" height="36" decoding="async">
      <span class="wtop__me">
        <img src="assets/login/avatar-${person.code}.webp" alt="" width="42" height="42" decoding="async">
        <span class="wtop__meText"><b>${person.name}</b><em>${person.role}</em></span>
      </span>
    </header>`;
}

// การ์ดหัวเรื่องของหน้า: ไอคอน + ชื่อหน้า + คำอธิบาย + ข้อความลายมือ
export function workHeroHtml(page) {
  return `
    <section class="whero">
      <span class="whero__icon"><img src="${page.icon}" alt="" width="54" height="54" decoding="async"></span>
      <span class="whero__text"><b>${page.title}</b><em>${page.sub}</em></span>
      <span class="whero__script">${String(page.script).replace(/\n/g, '<br>')}</span>
    </section>`;
}

// การ์ดตัวการ์ตูนประจำหน้า + คำพูดสั้นๆ (แต่ละหน้าใช้คนละท่า)
export function workCharHtml(page) {
  return `
    <section class="wchar">
      <span class="wchar__bubble">${page.tip || ''}</span>
      <img class="wchar__img" src="${page.char}" alt="" height="150" loading="lazy" decoding="async">
    </section>`;
}

// แถบปุ่มล่างสุด: ดูประวัติ + ปุ่มบันทึกหลัก
export function workFootHtml(saveLabel, historyLabel = WORK_UI.history) {
  return `
    <div class="wfoot">
      <button class="wbtn wbtn--ghost" type="button" data-hist="1">${glyph('file', 18)}<span>${historyLabel}</span></button>
      <button class="wbtn wbtn--go" type="button" data-save="1">${glyph('check', 18)}<span>${saveLabel}</span></button>
    </div>`;
}

// แถวตัวเลขสรุป (ไม่มีค่า = ขีด ห้ามเดาเป็น 0)
export function workStatsHtml(items) {
  return `<div class="wstat">${items.map(s => `
    <span class="wstat__cell">
      <em>${s.label}</em>
      <b${s.wait ? ' class="wstat__wait"' : ''}>${s.value}</b>
    </span>`).join('')}</div>`;
}

// บรรทัดคำอธิบายใต้การ์ด
export function workNoteHtml(text) {
  return `<p class="wnote">${glyph('info', 14)}<span>${text}</span></p>`;
}

// แผงรายการย้อนหลัง (rows = [{ label, value, sub }])
export function workHistorySheet({ title, rows }) {
  const body = rows.length
    ? rows.map(r => `<div class="whist__row"><span><b>${r.label}</b>${r.sub ? `<em>${r.sub}</em>` : ''}</span><b>${r.value}</b></div>`).join('')
    : `<p class="whist__none">${WORK_UI.historyNone}</p>`;
  return openSheet(`
    <div class="ask__title">${title}</div>
    <div class="whist">${body}</div>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">${WORK_UI.close}</button></div>`);
}

// ชื่อตำแหน่งบนแถบบนสุด
const ROLE_TEXT = { owner: 'เจ้าของร้าน', lead: 'หัวหน้า', staff: 'พนักงาน' };

// วางโครงหน้างาน 1 หน้า (หัวหน้าจอ · การ์ดหัวเรื่อง · ตัวการ์ตูน · ปุ่มล่าง) แล้วคืนค่าตั้งของหน้านั้น
export function workFrame(root, pageId) {
  const page = WORK_PAGES[pageId];
  const code = workStaff();
  root.querySelector('.work').style.setProperty('--a', page.accent);
  root.querySelector('#w-top').innerHTML = workTopHtml({ code, name: '', role: '' });
  root.querySelector('#w-hero').innerHTML = workHeroHtml(page);
  root.querySelector('#w-char').innerHTML = workCharHtml(page);
  root.querySelector('#w-foot').innerHTML = workFootHtml(page.save, page.hist || WORK_UI.history);
  // ชื่อคนมาจากฐาน (kk_staff) เติมทีหลังเมื่อโหลดเสร็จ
  getStaff().then(staff => {
    const me = staff.find(s => s.code === code);
    if (me) root.querySelector('#w-top').innerHTML = workTopHtml({ code, name: me.name, role: ROLE_TEXT[me.role] || 'พนักงาน' });
  }).catch(() => {});
  return page;
}

// แถบวันที่ทำงานของหน้างาน (ใช้ชุดเดียวกับหน้าเตรียม-เหลือ)
export function workDateHtml(iso) {
  return dateBarHtml(iso, 'w-date-pick') + dateBandHtml(iso);
}
