// ตัวเลือกช่วงวันที่ของหน้ารายงานผู้บริหาร Grab — ปุ่มช่วงบนการ์ด + แผงเลือกช่วง (ทั้งหน้า หรือเฉพาะการ์ด)
import { GRAB_UI } from '../shared/config.js';
import { openSheet } from '../shared/ui.js';
import { shiftIso, dayShort } from '../shared/format.js';

const X = GRAB_UI.rep.pick;
const firstOfMonth = iso => iso.slice(0, 8) + '01';

// แปลงปุ่มลัดเป็นช่วงวันที่ (p:30 = 30 วันล่าสุด · m:0 = เดือนนี้ · m:1 = เดือนก่อน) นับถึงวันล่าสุดที่มีข้อมูล end
export function rangeOf(preset, end) {
  const [k, v] = preset.split(':'), n = Number(v);
  if (k === 'p') return { from: shiftIso(end, -(n - 1)), to: end };
  if (n === 0) return { from: firstOfMonth(end), to: end };
  const last = shiftIso(firstOfMonth(end), -1);
  return { from: firstOfMonth(last), to: last };
}

// ข้อความช่วงวันที่ เช่น 1 ก.ค. – 30 ก.ย.
export const rangeText = r => (r.from === r.to ? dayShort(r.from) : `${dayShort(r.from)} – ${dayShort(r.to)}`);

// ปุ่มช่วงวันที่ที่อยู่ใต้หัวการ์ด (own = การ์ดนี้ตั้งช่วงเอง · label = ข้อความแทนช่วง เช่น "ทุกบิลที่มี")
export function barHtml(id, r, own, label = '') {
  return `<button class="grrbar${own ? ' is-own' : ''}" type="button" data-range="${id}" aria-label="${X.title}">
    <span>${label || rangeText(r)}</span><em>${own ? X.own : X.same}</em><i aria-hidden="true">▾</i></button>`;
}

// แผงเลือกช่วง → { from, to } · 'reset' = กลับไปใช้ช่วงของทั้งหน้า · null = ยกเลิก
export async function pickRange({ title, r, end, card }) {
  const min = shiftIso(end, -730);
  const chips = X.presets.map(([key, label]) => `<button type="button" class="grrchip" data-pick="${key}">${label}</button>`).join('');
  const picked = await openSheet(`
    <div class="ask__title">${X.title}${title ? ` · ${title}` : ''}</div>
    <div class="grrchips">${chips}</div>
    <div class="grrdates">
      <label><span>${X.from}</span><input type="date" id="grr-a" value="${r.from}" min="${min}" max="${end}"></label>
      <label><span>${X.to}</span><input type="date" id="grr-b" value="${r.to}" min="${min}" max="${end}"></label>
    </div>
    <div class="ask__go">
      <button class="ask__btn ask__btn--off" type="button" data-pick="${card ? 'reset' : ''}">${card ? X.reset : X.cancel}</button>
      <button class="ask__btn" type="button" data-pick="custom">${X.apply}</button>
    </div>`);
  if (!picked) return null;
  if (picked === 'reset') return 'reset';
  if (picked !== 'custom') return rangeOf(picked, end);
  const a = (document.getElementById('grr-a') || {}).value, b = (document.getElementById('grr-b') || {}).value;
  if (!a || !b) return null;
  return a <= b ? { from: a, to: b > end ? end : b } : { from: b, to: a };
}
