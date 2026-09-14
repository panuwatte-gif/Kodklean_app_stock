// ฟอร์มแก้ไขรายการสต๊อก (ชื่อ หมวดหลัก หมวดย่อย หน่วย จำนวน รูป) — ใช้ในหน้าสต๊อกเท่านั้น
import { STOCK_UNITS } from '../shared/config.js';
import { glyph, stepperHtml } from '../shared/ui.js';

// ตัวเลือกหมวดย่อยของหมวดหลักที่เลือกอยู่
export function subOptionsHtml(subs, catId, selected) {
  const rows = subs.filter(s => s.cat === catId);
  return `<option value="">— ไม่มีหมวดย่อย —</option>`
    + rows.map(s => `<option value="${s.id}"${s.id === selected ? ' selected' : ''}>${s.label}</option>`).join('');
}

// ปุ่มไอคอนเล็กท้ายฟอร์ม (ลบ / ย้ายขึ้น / ย้ายลง)
function toolBtn(kind, label, color, tint) {
  return `<button class="stk-edit__ic" type="button" data-tool="${kind}" aria-label="${label}" title="${label}" style="--c:${color};--t:${tint}">${glyph(kind === 'delete' ? 'trash' : kind, 16)}</button>`;
}

// ฟอร์มแก้ไขทั้งแถว
export function editRowHtml(item, cats, subs) {
  const step = item.unit === 'กก.' ? 0.5 : 1;
  const catOptions = cats.map(c => `<option value="${c.id}"${c.id === item.cat ? ' selected' : ''}>${c.label}</option>`).join('');
  const unitOptions = STOCK_UNITS.map(u => `<option value="${u}"${u === item.unit ? ' selected' : ''}>${u}</option>`).join('');
  return `
    <li class="stk-row stk-row--edit" data-id="${item.id}">
      <div class="stk-edit">
        <div class="stk-edit__head">
          <button class="stk-edit__photo" type="button" data-photo="1" aria-label="เปลี่ยนรูป">
            <img src="${item.photo}" alt="" width="38" height="38" decoding="async">
            <span class="stk-edit__photo-ic">${glyph('image', 13)}</span>
          </button>
          <input class="stk-edit__name" data-f="name" value="${item.name}" placeholder="ชื่อรายการ" aria-label="ชื่อรายการ">
          <input type="hidden" data-f="photo" value="${item.photo}">
        </div>

        <div class="stk-edit__grid">
          <label class="stk-edit__field"><span>หมวดหลัก</span>
            <select data-f="cat">${catOptions}</select>
          </label>
          <label class="stk-edit__field"><span>หมวดย่อย</span>
            <select data-f="sub" id="stk-sub-select">${subOptionsHtml(subs, item.cat, item.sub)}</select>
          </label>
          <label class="stk-edit__field stk-edit__field--unit"><span>หน่วย</span>
            <select data-f="unit">${unitOptions}</select>
          </label>
        </div>

        ${stepperHtml({ name: 'kitchen', label: 'ครัวกลาง', value: item.kitchen, unit: item.unit, step })}
        ${stepperHtml({ name: 'condo', label: 'คอนโด', value: item.condo, unit: item.unit, step })}

        <div class="stk-edit__go">
          ${toolBtn('delete', 'ลบรายการ', '#D4322A', '#FDEBEA')}
          ${toolBtn('up', 'ย้ายขึ้น', '#4C8FD8', '#EAF3FC')}
          ${toolBtn('down', 'ย้ายลง', '#4C8FD8', '#EAF3FC')}
          <span class="stk-edit__spacer"></span>
          <button class="stk-edit__btn stk-edit__btn--off" type="button" data-cancel="1">ยกเลิก</button>
          <button class="stk-edit__btn" type="button" data-save="1">บันทึก</button>
        </div>
      </div>
    </li>`;
}
