// การ์ด Report ค่าใช้จ่ายของแท็บซื้อของเข้าร้าน: เลือกช่วงวัน/วันเดียว + ร้าน (+ ยอดส่งพระราม 9) → ยอดแยกร้าน + แยกรายวัน + รวม
import { R9_BUY_UI as T } from '../shared/config.js';
import { glyph } from '../shared/ui.js';
import { moneyFine, dayLongTh, fillText } from '../shared/format.js';
import { buyReport } from '../shared/calc.js';

// ปุ่มติ๊กเลือก 1 อัน
const checkHtml = (attr, on, label) => `
  <button class="r9-check${on ? ' is-on' : ''}" type="button" ${attr}>
    <span class="r9-check__box">${on ? glyph('check', 12) : ''}</span><span>${label}</span>
  </button>`;

// ผลรายงาน (ยังไม่กดสร้าง = ไม่แสดง)
function resultHtml(s, rounds) {
  const rep = s.rep;
  const r = buyReport(s.logs, rounds, { from: rep.from, to: rep.to, shops: rep.shops, withR9: rep.r9 });
  const shopOf = id => s.shops.find(x => x.id === id) || {};
  const name = id => (id === 'r9' ? T.rep.r9 : shopOf(id).label || id);
  const color = id => (id === 'r9' ? '#B4741B' : shopOf(id).color || '#2F63C9');
  const range = rep.from === rep.to ? dayLongTh(rep.from) : `${dayLongTh(rep.from)} – ${dayLongTh(rep.to)}`;
  if (!r.days.length) return `<div class="r9-buyres"><div class="r9-buyres__range">${range}</div><p class="r9-empty">${T.rep.none}</p></div>`;
  return `
    <div class="r9-buyres">
      <div class="r9-buyres__range">${range}</div>
      <div class="r9-buyres__total"><span>${T.rep.total}</span><b>${moneyFine(r.total)}</b><small>บาท</small></div>
      <div class="r9-buyres__h">${T.rep.byShop}</div>
      ${r.byShop.map(b => `
        <div class="r9-buyres__row" style="--c:${color(b.id)}">
          <i></i><span>${name(b.id)}${b.id === 'r9' ? `<small>${T.rep.r9Note}</small>` : ''}</span>
          <em>${fillText(T.rep.days, { n: b.days })}</em><b>${moneyFine(b.total)}</b>
        </div>`).join('')}
      <div class="r9-buyres__h">${T.rep.byDay}</div>
      ${r.days.map(d => `
        <div class="r9-buyres__day">
          <div><b>${dayLongTh(d.date)}</b><small>${Object.entries(d.parts).map(([k, v]) => `${name(k)} ${moneyFine(v)}`).join(' · ')}</small></div>
          <b>${moneyFine(d.total)}</b>
        </div>`).join('')}
      <div class="r9-noprint" style="padding-top:10px">
        <button class="r9-btn r9-btn--soft r9-btn--wide" type="button" data-act="buyPrint">${glyph('print', 16)}<span>${T.rep.print}</span></button>
      </div>
    </div>`;
}

// การ์ด Report ทั้งใบ (rounds = รอบส่งพระราม 9 ที่หน้าโหลดไว้แล้ว)
export function buyReportHtml(s, rounds) {
  const rep = s.rep;
  const checks = s.shops.map(sh => checkHtml(`data-repshop="${sh.id}"`, rep.shops.includes(sh.id), sh.label)).join('')
    + checkHtml('data-repr9="1"', rep.r9, T.rep.r9);
  return `
    <div class="r9-card" id="r9-buyrep">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/icon-report.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t">
          <div class="r9-card__title">${T.rep.title}</div>
          <div class="r9-card__sub">${T.rep.sub}</div>
        </div>
      </div>
      <div class="r9-noprint">
        <div class="r9-pick">
          <span class="r9-pick__lab">${glyph('calendar', 14)}${T.rep.range}</span>
          <input type="date" data-repfrom="1" value="${rep.from}">
          <span class="r9-pick__lab">–</span>
          <input type="date" data-repto="1" value="${rep.to}">
          <button class="r9-chip" type="button" data-repday="1">${T.rep.oneDay}</button>
        </div>
        <div class="r9-pick"><span class="r9-pick__lab">${glyph('layers', 14)}${T.rep.shops}</span>${checks}</div>
        <div class="r9-pick" style="padding-bottom:12px">
          <button class="r9-btn r9-btn--wide" type="button" data-act="buyBuild">${glyph('chart', 16)}<span>${T.rep.build}</span></button>
        </div>
      </div>
      ${rep.built ? resultHtml(s, rounds) : ''}
    </div>`;
}
