// แถบวันที่ทำงานของหน้าเตรียม-เหลือ (ใช้ร่วมทุกแท็บ) + แถบเตือนเมื่อไม่ใช่วันนี้ + กล่องประวัติการแก้
import { PREP_UI } from '../shared/config.js';
import { dayLongTh, dayShort, shiftIso, fillText } from '../shared/format.js';
import { todayIso } from '../shared/data.js';
import { glyph, openSheet, confirmSheet } from '../shared/ui.js';

// วันที่เลือกห่างจากวันนี้กี่วัน (บวก = ล่วงหน้า)
const diffDays = iso => Math.round((new Date(iso + 'T00:00:00') - new Date(todayIso() + 'T00:00:00')) / 86400000);

// ป้ายสถานะวัน: วันนี้ (เทา) / ย้อนหลัง (ส้ม) / ล่วงหน้า (ฟ้า)
function statusOf(iso) {
  const d = diffDays(iso);
  if (d === 0) return { cls: 'today', text: PREP_UI.dateToday };
  if (d < 0) return { cls: 'past', text: fillText(PREP_UI.datePast, { n: -d }) };
  return { cls: 'future', text: fillText(PREP_UI.dateFuture, { n: d }) };
}

// แถบวันที่: ◀ วันที่+ปฏิทิน ▶ + ป้ายสถานะ
export function dateBarHtml(iso) {
  const s = statusOf(iso);
  return `
    <div class="pdate">
      <button class="pdate__arrow" type="button" data-date-nav="-1" aria-label="ถอยหลัง 1 วัน">${glyph('back', 16)}</button>
      <label class="pdate__mid" aria-label="เลือกวันที่จากปฏิทิน">
        <span class="pdate__ic">${glyph('calendar', 15)}</span>
        <b>${dayLongTh(iso)}</b>
        <input class="pdate__pick" id="prep-date-pick" type="date" value="${iso}">
      </label>
      <button class="pdate__arrow pdate__arrow--next" type="button" data-date-nav="1" aria-label="เดินหน้า 1 วัน">${glyph('back', 16)}</button>
      <span class="pdate__pill pdate__pill--${s.cls}">${s.text}</span>
    </div>`;
}

// แถบสีพาดเต็มความกว้างเมื่อวันที่เลือกไม่ใช่วันนี้ — กันพนักงานกรอกผิดวันแบบไม่รู้ตัว
export function dateBandHtml(iso) {
  const s = statusOf(iso);
  if (s.cls === 'today') return '';
  return `
    <div class="pdate-band pdate-band--${s.cls}">
      <span class="pdate-band__ic">${glyph('warn', 14)}</span>
      <b>${fillText(PREP_UI.dateBand, { d: dayLongTh(iso), s: s.text })}</b>
      <button type="button" data-date-today="1">${PREP_UI.dateBack}</button>
    </div>`;
}

// วันที่ไกลเกิน (ล่วงหน้า >7 / ย้อนหลัง >60 วัน) → ถามยืนยันก่อน แต่ไม่บล็อก
async function confirmFar(iso) {
  const d = diffDays(iso);
  if (d <= 7 && d >= -60) return true;
  return confirmSheet({ title: PREP_UI.farTitle, text: fillText(PREP_UI.farText, { d: dayLongTh(iso) }), okLabel: PREP_UI.farOk });
}

// เปลี่ยนวันที่ใน state กลาง (คืน true เมื่อเปลี่ยนจริง)
async function applyDate(iso, state) {
  if (!iso || iso === state.date) return false;
  if (!await confirmFar(iso)) return false;
  state.date = iso;
  return true;
}

// ปุ่ม ◀ ▶ และ "กลับมาวันนี้"
export async function handleDateClick(event, state) {
  const nav = event.target.closest('[data-date-nav]');
  if (nav) return applyDate(shiftIso(state.date, Number(nav.dataset.dateNav)), state);
  if (event.target.closest('[data-date-today]')) return applyDate(todayIso(), state);
  return false;
}

// เลือกวันที่จากปฏิทิน
export const handleDatePick = (iso, state) => applyDate(iso, state);

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
        <span>${fillText(PREP_UI.histRev, { n: r.rev_no })}</span>
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