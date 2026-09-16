// กล่องประวัติการแก้ของช่องเดียวในหน้าเตรียม-เหลือ (แถบวันที่ย้ายไปอยู่ ui.js แล้ว เพราะหน้าพระราม 9 ใช้ร่วม)
import { PREP_UI } from '../shared/config.js';
import { dayShort } from '../shared/format.js';
import { openSheet } from '../shared/ui.js';

// เวลาแบบสั้นของแถวประวัติ เช่น 12 ก.ย. 18:42
function histTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${dayShort(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// กล่องประวัติการแก้ของช่องเดียว — อ่านอย่างเดียว ไม่มีปุ่มย้อนกลับ/ลบ (อยากได้ค่าเดิมให้พิมพ์ใหม่)
export function historySheet({ title, rows, unit }) {
  const list = rows.map(r => {
    const qty = r.qty !== undefined ? r.qty : r.qty_box;
    return `
      <div class="hist__row${r.is_current ? ' is-cur' : ''}">
        <span>${PREP_UI.histRev.replace('{n}', r.rev_no)}</span>
        <b>${qty === null || qty === undefined ? '-' : Number(qty)} ${unit}</b>
        <span>${r.edited_by || r.logged_by || ''}</span>
        <em>${histTime(r.created_at)}</em>
        <i>${r.is_current ? PREP_UI.histCur : ''}</i>
      </div>`;
  }).join('');
  openSheet(`
    <div class="ask__title">${title}</div>
    <div class="hist">${list}</div>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">${PREP_UI.histClose}</button></div>`);
}
