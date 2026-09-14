// แท็บประวัติ — วาดตัวกรอง การ์ดรอบส่งของ และกราฟย้อนหลัง (การกดปุ่มอยู่ที่ rama9.js)
import { R9_UI, R9_PLACE, R9_RANGES, R9_STATUS } from '../shared/config.js';
import { glyph, lineChart } from '../shared/ui.js';
import { money, dayLongTh, timeTh, monthShortTh } from '../shared/format.js';
import { r9RoundTotals, r9RoundByCat, r9ByMonth } from '../shared/calc.js';

// แถบค้นหาและชิปกรองช่วงเวลา
export function filterHtml(view) {
  const chips = R9_RANGES.map(r => `
    <button class="r9-chip${view.range === r.id ? ' is-on' : ''}" type="button" data-range="${r.id}">${r.label}</button>`).join('');
  return `
    <div class="r9-card">
      <label class="r9-search">
        ${glyph('search', 16)}
        <input id="r9-q" type="search" placeholder="${R9_UI.searchHistory}" value="${view.q || ''}">
      </label>
      <div class="r9-filters">${chips}</div>
    </div>`;
}

// การ์ดรอบส่งของ 1 รอบ
function roundHtml(round, items, cats, latest) {
  const t = r9RoundTotals(round);
  const st = R9_STATUS[round.status] || R9_STATUS.done;
  const cells = r9RoundByCat(round, items, cats).map(c => `
    <div class="r9-round__cat" style="--c:${c.cat.color};--tint:${c.cat.tint}">
      <img src="${c.cat.icon}" alt="">
      <b>${c.cat.label}</b>
      <i>${c.items} รายการ</i>
      <b>${money(c.value)} บาท</b>
    </div>`).join('');
  return `
    <div class="r9-card" data-round="${round.id}">
      <div class="r9-round__head">
        <img src="assets/r9/truck.webp" alt="" width="26" height="15" loading="lazy" decoding="async">
        <span class="r9-round__no">รอบส่งของ #${round.no}</span>
        ${latest ? '<span class="r9-round__tag">ล่าสุด</span>' : ''}
        <span class="r9-round__meta">${dayLongTh(round.date)} · ${timeTh(round.time)}</span>
      </div>
      <div class="r9-round__line">
        <span>${glyph('pin', 14)}ส่งไปที่ สาขา${R9_PLACE.title}</span>
        <span>${glyph('box', 14)}${t.items} รายการ</span>
        <b>${money(t.net)} บาท</b>
      </div>
      <div class="r9-round__cats">${cells}</div>
      <div class="r9-round__state" style="--c:${st.color};--tint:${st.tint}">
        ${glyph('check', 16)}
        <span><b>${st.label}</b><br>${st.note} ${dayLongTh(round.date)} เวลา ${timeTh(round.time)}</span>
      </div>
      <div class="r9-round__go">
        <button class="r9-btn r9-btn--soft" type="button" data-detail="${round.id}">${glyph('file', 14)}<span>${R9_UI.detail}</span></button>
        <button class="r9-btn r9-btn--soft" type="button" data-repeat="${round.id}">${glyph('copy', 14)}<span>${R9_UI.repeat}</span></button>
      </div>
    </div>`;
}

// รายการการ์ดรอบส่งของทั้งหมดในช่วงที่เลือก
export function roundsHtml(rounds, items, cats, latestId) {
  if (!rounds.length) return `<div class="r9-card"><p class="r9-empty">${R9_UI.emptyHistory}</p></div>`;
  return rounds.map(rd => roundHtml(rd, items, cats, rd.id === latestId)).join('');
}

// การ์ดสรุปประวัติ + กราฟ 6 เดือนล่าสุด
export function briefHtml(all) {
  const months = r9ByMonth(all, 6);
  const last = all[all.length - 1];
  const lastT = last ? r9RoundTotals(last) : { net: 0 };
  const net = all.reduce((s, rd) => s + r9RoundTotals(rd).net, 0);
  const itemCount = all.reduce((s, rd) => s + r9RoundTotals(rd).items, 0);
  const boxes = [
    { lab: 'รอบล่าสุด', num: last ? '#' + last.no : '-', foot: last ? dayLongTh(last.date) : '', c: '#1E7A3C', tint: '#EAF6EC' },
    { lab: 'ยอดรวมทุกรอบ', num: money(net), foot: 'บาท', c: '#2F63C9', tint: '#EAF1FD' },
    { lab: 'เฉลี่ยต่อรอบ', num: money(all.length ? net / all.length : 0), foot: 'บาท', c: '#B4741B', tint: '#FDF3E2' },
    { lab: 'จำนวนรายการ', num: money(itemCount), foot: 'รายการ', c: '#8E3E96', tint: '#F5E7F6' }
  ].map(b => `
    <div class="r9-mini__box" style="--c:${b.c};--tint:${b.tint}">
      <div class="r9-mini__lab">${b.lab}</div>
      <div class="r9-mini__num">${b.num}</div>
      <div class="r9-mini__foot">${b.foot}</div>
    </div>`).join('');
  return `
    <div class="r9-card">
      <div class="r9-brief">
        <img src="assets/r9/chick-chart.webp" alt="กุ๊กไก่" width="62" loading="lazy" decoding="async">
        <div class="r9-brief__t">
          <div class="r9-card__title">${R9_UI.historySummary}</div>
          <div class="r9-card__sub">ภาพรวมการส่งของไปสาขา${R9_PLACE.title} · รอบล่าสุด ${money(lastT.net)} บาท</div>
        </div>
      </div>
      <div class="r9-mini">${boxes}</div>
      <div class="r9-card__head" style="padding-top:0">
        <div class="r9-card__t"><div class="r9-card__title" style="font-size:13px">${R9_UI.historyChart}</div></div>
      </div>
      ${lineChart(months.map(m => m.net), months.map(m => monthShortTh(m.iso)), { w: 380, h: 120 })}
      <div class="r9-legend" style="padding:0 12px 12px"><span><i style="background:#2F63C9"></i>มูลค่ารวมต่อเดือน (บาท)</span></div>
    </div>`;
}
