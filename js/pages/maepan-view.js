// ชิ้นส่วนหัวหน้างานของแม่พัน — การ์ดหัวเรื่องและแท็บสลับหน้า (ข้อความทั้งหมดอยู่ที่ config.js)
import { MAEPAN_UI as T } from '../shared/config.js';
import { glyph } from '../shared/ui.js';

// การ์ดหัวเรื่อง: ไอคอน + ชื่อหน้า + คำอธิบาย + คำพูดแม่พัน + รูปแม่พัน
export function heroHtml(tab) {
  const page = T.pages[tab];
  return `
    <section class="mp-hero">
      <span class="mp-hero__ic"><img src="${page.icon}" alt="" width="42" height="42" decoding="async"></span>
      <span class="mp-hero__text"><b>${page.title}</b><em>${page.sub}</em></span>
      <span class="mp-hero__script">${String(page.script).replace(/\n/g, '<br>')}</span>
      <img class="mp-hero__char" src="${T.char}" alt="แม่พัน" height="128" decoding="async">
    </section>`;
}

// แท็บสลับ 2 หน้างาน
export function tabsHtml(tab) {
  return `<div class="mp-tabs">${T.tabs.map(t => `
    <button class="mp-tab${t.id === tab ? ' is-on' : ''}" type="button" data-tab="${t.id}">
      ${glyph(t.glyph, 17)}<span>${t.label}</span>
    </button>`).join('')}</div>`;
}
