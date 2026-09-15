// แท็บภาพรวม — สูตรที่ล็อกไว้ต่อรายการ + ผลวัดจริงแบบ walk-forward + เกณฑ์คัดเข้า-คัดออก (แสดงผลอย่างเดียว)
import { EQ_UI, PREP_FC_UI } from '../shared/config.js';
import { getPrepItems, getPrepLogRange, todayIso } from '../shared/data.js';
import { buildForecast } from '../shared/forecast.js';
import { glyph } from '../shared/ui.js';
import { shiftIso } from '../shared/format.js';

// กรอบการ์ด (ใช้สไตล์เดียวกับการ์ด Assumption ของหน้าเตรียม)
const card = (title, inner) => `<section class="asm"><div class="asm__head">${glyph('layers', 15)}<span>${title}</span></div>${inner}</section>`;

// การ์ด 1: สูตรที่ล็อกไว้ต่อรายการ + สถานะ (ใช้งานได้ / รอข้อมูล)
function regHtml(fc) {
  const rows = fc.rows.map(r => `
    <div class="eq-row">
      <b>${r.name}</b>
      <span>${r.model.label}</span>
      <i class="eq-tag eq-tag--${r.fc === null ? 'wait' : 'live'}">${r.fc === null ? (PREP_FC_UI.status[r.status] || PREP_FC_UI.insufficient) : 'ใช้งานจริง'}</i>
    </div>`).join('');
  return card(EQ_UI.regTitle, rows + `<p class="asm__note">${EQ_UI.noteNow}</p>`);
}

// การ์ด 2: ผลวัดความแม่นยำปัจจุบันต่อรายการ (ต้องครบวันขั้นต่ำตามกฎจึงแสดงตัวเลข)
function measureHtml(fc) {
  const head = `<div class="eq-row eq-row--head">${EQ_UI.measureCols.map(c => `<span>${c}</span>`).join('')}</div>`;
  const rows = fc.rows.map(r => `
    <div class="eq-row eq-row--4">
      <b>${r.name}</b>
      <span>${r.hitN} วัน</span>
      <span>${r.hitRate === null ? PREP_FC_UI.insufficient : r.hitRate + '%'}</span>
      <span>${r.wape === null ? '—' : r.wape + '%'}</span>
    </div>`).join('');
  return card(EQ_UI.measureTitle, head + rows);
}

// การ์ดเกณฑ์ (จากสเปกคลังสูตร)
const rulesHtml = () => EQ_UI.sections.map(s => card(s.head, `<ul class="eq-list">${s.items.map(i => `<li>${i}</li>`).join('')}</ul>`)).join('');

// โครงแท็บ (วาดทันที แล้วเติมผลวัดเมื่อโหลดบันทึกย้อนหลังเสร็จ)
export const overviewHtml = () => `<p class="eq-sub">${EQ_UI.sub}</p><div id="eq-ov">
  <p class="ptab__none">กำลังคำนวณผลวัดจากบันทึกจริง...</p></div>` + rulesHtml();

// โหลดรายการ + บันทึกย้อนหลัง 84 วัน แล้ววัดผลจริงด้วยกฎชุดล่าสุด
export async function loadOverview(pane, data) {
  const box = pane.querySelector('#eq-ov');
  try {
    const today = todayIso();
    const [items, logs] = await Promise.all([getPrepItems(), getPrepLogRange(shiftIso(today, -84), shiftIso(today, -1))]);
    const fc = buildForecast(items, logs, today, data.cfg);
    box.innerHTML = regHtml(fc) + measureHtml(fc);
  } catch {
    box.innerHTML = '<p class="ptab__none">ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง</p>';
  }
}
