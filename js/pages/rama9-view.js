// ส่วนหัวของหน้าพระราม 9 ที่ใช้ร่วมทั้ง 3 แท็บ — ภาพหน้าปก การ์ดตัวเลข และแถบแท็บ
import { R9_PLACE, R9_TABS, R9_KPI } from '../shared/config.js';
import { glyph } from '../shared/ui.js';
import { money } from '../shared/format.js';

// มาสคอตและข้อความประจำแต่ละแท็บ
const HERO = {
  send: { chick: 'assets/r9/chick-clipboard.webp', quote: R9_PLACE.quoteSend, tip: R9_PLACE.bubbleSend },
  history: { chick: 'assets/r9/chick-calendar.webp', quote: R9_PLACE.quoteHistory, tip: R9_PLACE.bubbleHistory },
  report: { chick: 'assets/r9/chick-chart.webp', quote: R9_PLACE.quoteReport, tip: R9_PLACE.bubbleReport }
};

// ภาพหน้าปก: อาคารสาขา รถส่งของ กล่อง และมาสคอตของแท็บนั้น
export function heroHtml(tab) {
  const h = HERO[tab] || HERO.send;
  return `
    <img class="r9-hero__trees" src="assets/r9/trees.webp" alt="" width="78" height="58" decoding="async">
    <img class="r9-hero__build" src="assets/r9/building.webp" alt="สาขาพระราม 9" width="190" height="119" decoding="async">
    <img class="r9-hero__truck" src="assets/r9/truck.webp" alt="รถส่งของ KodKlean" width="132" height="77" decoding="async">
    <img class="r9-hero__boxes" src="assets/r9/boxes.webp" alt="" width="74" height="61" decoding="async">
    <img class="r9-hero__chick" src="${h.chick}" alt="กุ๊กไก่" width="112" decoding="async">
    <div class="r9-hero__quote">${h.quote}</div>
    <div class="r9-hero__tip">${h.tip}</div>`;
}

// การ์ดตัวเลขสรุป 4 ใบ (vals = ค่าที่คำนวณมาแล้วจาก rama9.js)
export function kpisHtml(tab, vals) {
  return (R9_KPI[tab] || []).map(k => `
    <div class="r9-kpi" style="--c:${k.color};--tint:${k.tint};--bd:${k.border}">
      <div class="r9-kpi__label">${k.label}</div>
      <div class="r9-kpi__num">${money(vals[k.key])}<small>${k.unit}</small></div>
      <div class="r9-kpi__foot">${vals[k.foot] || ''}</div>
    </div>`).join('');
}

// แถบแท็บ 3 อัน
export function tabsHtml(tab) {
  return R9_TABS.map(t => `
    <button class="r9-tab${t.id === tab ? ' is-on' : ''}" type="button" data-tab="${t.id}">
      ${glyph(t.glyph, 17)}<span>${t.label}</span>
    </button>`).join('');
}
