// การ์ดสร้างรายงานของหน้าส่งพระราม 9 — เลือกวันเดียว = รายงานของวันนั้น · เลือกช่วง = รวมทั้งช่วง + แยกตามวัน (พิมพ์/ดาวน์โหลดได้)
import { MAEPAN_UI as T, R9_PLACE } from '../shared/config.js';
import { glyph } from '../shared/ui.js';
import { r9SentLines, r9ItemSummary, r9ByDate, r9RoundTotals } from '../shared/calc.js';
import { money, moneyFine, weight, dayLongTh, fillText } from '../shared/format.js';

const R = T.report;

// รอบส่งที่อยู่ในช่วงวันที่เลือก
export const pickedRounds = (rounds, state) => rounds.filter(rd => rd.date >= state.from && rd.date <= state.to);

// การ์ดเลือกช่วงวันที่ + ปุ่มสร้าง/พิมพ์/ดาวน์โหลด
export function reportCardHtml(state) {
  return `
    <section class="mp-card r9-noprint">
      <div class="mp-sec">
        <img src="assets/r9/icon-report.webp" alt="" width="30" height="30" loading="lazy" decoding="async">
        <span class="mp-sec__t"><b>${R.title}</b><em>${R.sub}</em></span>
      </div>
      <div class="mp-dates">
        <label class="mp-datefield"><span>${R.from}</span><input type="date" data-from="1" value="${state.from}"></label>
        <label class="mp-datefield"><span>${R.to}</span><input type="date" data-to="1" value="${state.to}"></label>
      </div>
      <button class="mp-btn mp-btn--go" type="button" data-act="build">${glyph('chart', 16)}<span>${R.build}</span></button>
      ${state.built ? `
      <div class="mp-exports">
        <button class="mp-btn" type="button" data-act="print">${glyph('print', 16)}<span>${R.print}</span></button>
        <button class="mp-btn" type="button" data-act="csv">${glyph('down', 16)}<span>${R.csv}</span></button>
      </div>` : ''}
    </section>`;
}

// หัวกระดาษตอนสั่งพิมพ์
function paperHead(state, rounds) {
  const t = rounds.reduce((a, rd) => a + r9RoundTotals(rd).net, 0);
  const when = state.from === state.to ? dayLongTh(state.from) : `${dayLongTh(state.from)} – ${dayLongTh(state.to)}`;
  return `
    <div class="r9-print-only" style="padding:4px 0 8px">
      <div class="r9-print-only__t">รายงานการส่งของ — สาขา${R9_PLACE.title}</div>
      <div class="r9-print-only__s">${when} · ${fillText(R.rounds, { n: rounds.length })} · ${money(t)} บาท</div>
    </div>`;
}

// หัวการ์ดรายงาน
const cardHead = (title, sub, tag = '') => `
  <div class="r9-card__head">
    <img class="r9-card__ic" src="assets/r9/icon-report.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
    <div class="r9-card__t"><div class="r9-card__title">${title}</div><div class="r9-card__sub">${sub}</div></div>
    ${tag ? `<span class="r9-round__tag">${tag}</span>` : ''}
  </div>`;

// รายงานของวันเดียว: ส่งอะไรไปบ้าง ราคาต่อหน่วย รวมแต่ละรายการ + ค่าส่ง + ยอดรวมทั้งหมด
function dayCard(rounds, items, state) {
  const lines = r9SentLines(rounds, items);
  const fee = rounds.reduce((s, rd) => s + (Number(rd.fee) || 0), 0);
  const goods = lines.reduce((s, l) => s + l.value, 0);
  const rows = lines.map(l => `
    <tr class="is-item">
      <td>${l.item.name}<i>${l.item.unit || ''}</i></td>
      <td>${weight(l.qty)}</td>
      <td class="is-price">${moneyFine(l.price)}</td>
      <td class="is-value">${moneyFine(l.value)}</td>
    </tr>`).join('');
  return `
    <div class="r9-card">
      ${cardHead(fillText(R.dayTitle, { d: dayLongTh(state.from) }), R.daySub, fillText(R.rounds, { n: rounds.length }))}
      <div class="r9-rtwrap"><table class="r9-rt">
        <thead><tr><th>${R.colItem}</th><th>${R.colQty}</th><th>${R.colPrice}</th><th>${R.colSum}</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="is-fee"><td>${glyph('truck', 14)} ${R.fee}</td><td></td><td></td><td class="is-value">${money(fee)}</td></tr>
          <tr class="is-sum"><td>${R.grand}</td><td></td><td></td><td>${moneyFine(goods + fee)}</td></tr>
        </tbody>
      </table></div>
    </div>`;
}

// รายงานช่วงวัน ส่วนที่ 1: ยอดรวมแต่ละรายการ + ค่าส่งรวมทุกครั้ง + รวมยอดทั้งหมด
function rangeSumCard(rounds, items, state) {
  const sum = r9ItemSummary(rounds, items);
  const fee = rounds.reduce((s, rd) => s + (Number(rd.fee) || 0), 0);
  const goods = sum.reduce((s, r) => s + r.value, 0);
  const rows = sum.map(r => `
    <tr class="is-item">
      <td>${r.item.name}<i>${r.item.unit || ''}</i></td>
      <td>${weight(r.qty)}</td>
      <td class="is-value">${moneyFine(r.value)}</td>
    </tr>`).join('');
  return `
    <div class="r9-card">
      ${cardHead(R.sumTitle, fillText(R.sumSub, { from: dayLongTh(state.from), to: dayLongTh(state.to) }), fillText(R.rounds, { n: rounds.length }))}
      <div class="r9-rtwrap"><table class="r9-rt">
        <thead><tr><th>${R.colItem}</th><th>${R.colQty}</th><th>${R.colSum}</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="is-fee"><td>${glyph('truck', 14)} ${R.feeAll}</td><td></td><td class="is-value">${money(fee)}</td></tr>
          <tr class="is-sum"><td>${R.grand}</td><td></td><td>${moneyFine(goods + fee)}</td></tr>
        </tbody>
      </table></div>
    </div>`;
}

// รายงานช่วงวัน ส่วนที่ 2: แยกตามวันที่ส่ง (ทุกวันที่มีการส่งในช่วง)
function rangeDayCard(rounds) {
  const days = r9ByDate(rounds);
  const rows = days.map(d => `
    <tr class="is-item">
      <td>${dayLongTh(d.date)}</td>
      <td>${d.items}</td>
      <td class="is-price">${money(d.fee)}</td>
      <td class="is-value">${moneyFine(d.net)}</td>
    </tr>`).join('');
  const all = days.reduce((a, d) => ({ items: a.items + d.items, fee: a.fee + d.fee, net: a.net + d.net }), { items: 0, fee: 0, net: 0 });
  return `
    <div class="r9-card">
      ${cardHead(R.dayListTitle, R.dayListSub, `${days.length} วัน`)}
      <div class="r9-rtwrap"><table class="r9-rt">
        <thead><tr><th>${R.colDate}</th><th>${R.colLines}</th><th>${R.colFee}</th><th>${R.colSum}</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="is-sum"><td>${R.grand}</td><td>${all.items}</td><td>${money(all.fee)}</td><td>${moneyFine(all.net)}</td></tr>
        </tbody>
      </table></div>
    </div>`;
}

// รายงานทั้งใบตามช่วงที่เลือก
export function reportHtml(state, r9) {
  const rounds = pickedRounds(r9.rounds, state);
  if (!rounds.length) return `<div class="r9-card"><p class="r9-empty">${R.empty}</p></div>`;
  const body = state.from === state.to
    ? dayCard(rounds, r9.items, state)
    : rangeSumCard(rounds, r9.items, state) + rangeDayCard(rounds);
  return paperHead(state, rounds) + body;
}

// ไฟล์ดาวน์โหลด (CSV) ของรายงานชุดเดียวกับที่เห็นบนจอ
export function reportFile(state, r9) {
  const rounds = pickedRounds(r9.rounds, state);
  const one = state.from === state.to;
  const fee = rounds.reduce((s, rd) => s + (Number(rd.fee) || 0), 0);
  const cell = v => `"${String(v).replace(/"/g, '""')}"`;
  const line = arr => arr.map(cell).join(',');
  const out = [line([`รายงานการส่งของ สาขา${R9_PLACE.title}`]), line([one ? dayLongTh(state.from) : `${dayLongTh(state.from)} ถึง ${dayLongTh(state.to)}`]), ''];
  if (one) {
    const lines = r9SentLines(rounds, r9.items);
    out.push(line([R.colItem, R.colQty, 'หน่วย', R.colPrice, R.colSum]));
    lines.forEach(l => out.push(line([l.item.name, weight(l.qty), l.item.unit || '', l.price, l.value])));
    out.push(line([R.fee, '', '', '', fee]));
    out.push(line([R.grand, '', '', '', lines.reduce((s, l) => s + l.value, 0) + fee]));
  } else {
    const sum = r9ItemSummary(rounds, r9.items);
    out.push(line([R.sumTitle]), line([R.colItem, R.colQty, 'หน่วย', R.colSum]));
    sum.forEach(r => out.push(line([r.item.name, weight(r.qty), r.item.unit || '', r.value])));
    out.push(line([R.feeAll, '', '', fee]));
    out.push(line([R.grand, '', '', sum.reduce((s, r) => s + r.value, 0) + fee]), '');
    out.push(line([R.dayListTitle]), line([R.colDate, R.colLines, R.colFee, R.colSum]));
    r9ByDate(rounds).forEach(d => out.push(line([dayLongTh(d.date), d.items, d.fee, d.net])));
  }
  const name = one ? fillText(R.fileDay, { d: state.from }) : fillText(R.fileRange, { from: state.from, to: state.to });
  return { name, text: out.join('\r\n') };
}
