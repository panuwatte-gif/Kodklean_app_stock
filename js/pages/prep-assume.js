// การ์ด Assumption — สูตรคำนวณทุกสูตรแสดงเป็นชิป + ค่าตั้งที่เจ้าของปรับได้อิสระ (บันทึกลงฐาน ห้ามฝังในโค้ด)
import { PREP_UI } from '../shared/config.js';
import { glyph } from '../shared/ui.js';

// ชิปสูตร 1 ตัว (เครื่องหมาย + สี)
const chip = (op, text, tone) => `<span class="asm__chip asm__chip--${tone}">${op ? `<b>${op}</b>` : ''}${text}</span>`;

// กรอบการ์ด Assumption
function card(title, inner) {
  return `
    <section class="asm">
      <div class="asm__head">${glyph('layers', 15)}<span>${title}</span></div>
      ${inner}
    </section>`;
}

// ช่องปรับค่าตั้ง 1 ค่า (data-save บอก prep.js ว่าเก็บลงที่ไหน)
function paramRow(label, inputHtml) {
  return `<label class="asm__param"><span>${label}</span>${inputHtml}</label>`;
}

// การ์ดสูตรของแท็บเตรียมอาหาร: สมการใช้ไปจริง + อัตราแปลงปรุงสุก→สด (แก้ได้) + กติกาเชื่อมสต๊อก
export function assumeMeatHtml(model) {
  const eq = [
    chip('', 'เตรียม', 'mint'), chip('+', 'เบิกเพิ่ม', 'cyan'), chip('−', 'ทิ้ง/เสีย', 'gray'),
    chip('−', 'คงเหลือสด', 'peach'), chip('−', 'ปรุงสุกเหลือ', 'violet'), chip('=', 'ใช้ไปจริง', 'green')
  ].join('');
  const input = `<input class="asm__in" type="number" inputmode="decimal" step="0.05" min="0" data-save="assume" data-key="cooked_to_raw" data-f="value" data-id="cooked_to_raw" value="${model.cookedToRaw ?? ''}">`;
  return card(PREP_UI.assumeTitle, `
    <div class="asm__eq">${eq}</div>
    ${paramRow(PREP_UI.assumeCookedLabel, input)}
    <p class="asm__note">${PREP_UI.assumeStockNote}</p>`);
}

// การ์ดตั้งค่าเมนูของแท็บอาหารเหลือ: เมนูนี้ใช้เนื้อตัวไหน + อาหาร 1 ก. คิดเป็นเนื้อกี่ ก. (แก้ได้ทุกเมนู)
export function assumeFahHtml(menus, meatItems) {
  const options = m => ['<option value=""' + (!m.protein_item_id ? ' selected' : '') + `>${PREP_UI.assumeNoProtein}</option>`]
    .concat(meatItems.map(i => `<option value="${i.id}"${i.id === m.protein_item_id ? ' selected' : ''}>${i.name}</option>`)).join('');
  const rows = menus.map(m => `
    <div class="asm__menu" data-id="${m.id}">
      <span class="asm__menu-name">${m.name}</span>
      <label class="asm__pick"><select data-menu-set="protein_item_id" data-id="${m.id}">${options(m)}</select>${glyph('chevron', 12)}</label>
      <input class="asm__in asm__in--sm" type="number" inputmode="decimal" step="0.05" min="0" placeholder="-" data-save="menuRatio" data-f="protein_ratio" data-id="${m.id}" value="${m.protein_ratio ?? ''}">
    </div>`).join('');
  return card(PREP_UI.assumeMenuTitle, `
    <p class="asm__note asm__note--top">${PREP_UI.assumeMenuEq}</p>
    <div class="asm__menu asm__menu--head"><span>เมนู</span><span>ใช้เนื้อสัตว์</span><span>1 ก. = เนื้อ (ก.)</span></div>
    ${rows}`);
}