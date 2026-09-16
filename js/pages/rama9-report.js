// แท็บ Report — วาดตัวกรองรอบ ตารางสรุปยอด ส่วนวิเคราะห์ และปุ่มพิมพ์รายงาน
import { R9_UI, R9_PLACE, R9_RANGES, R9_EXPORTS } from '../shared/config.js';
import { glyph, barChart, lineChart, donut } from '../shared/ui.js';
import { money, moneyFine, weight, dayLongTh } from '../shared/format.js';
import { r9Matrix, r9ReportKpi, r9TopItems, r9RoundTotals, r9ItemSummary } from '../shared/calc.js';

// การ์ดตัวกรอง: ช่วงวันที่ + ชิปช่วงเวลา + เลือกรอบ
export function pickHtml(view, rounds) {
  const chips = R9_RANGES.map(r => `
    <button class="r9-chip${view.range === r.id ? ' is-on' : ''}" type="button" data-range="${r.id}">${r.label}</button>`).join('');
  const checks = rounds.map(rd => `
    <button class="r9-check${view.picked[rd.id] ? ' is-on' : ''}" type="button" data-pickround="${rd.id}">
      <span class="r9-check__box">${view.picked[rd.id] ? glyph('check', 12) : ''}</span>
      <span>รอบ #${rd.no}</span>
    </button>`).join('');
  return `
    <div class="r9-card r9-noprint">
      <div class="r9-pick" style="padding-top:11px">
        <span class="r9-pick__lab">${glyph('calendar', 14)}${R9_UI.reportRange}</span>
        <input type="date" data-from="1" value="${view.from}">
        <span class="r9-pick__lab">–</span>
        <input type="date" data-to="1" value="${view.to}">
      </div>
      <div class="r9-filters" style="padding-bottom:8px">${chips}</div>
      <div class="r9-pick">
        <span class="r9-pick__lab">${glyph('layers', 14)}${R9_UI.reportPick}</span>
        ${checks}
      </div>
      <div class="r9-pick" style="padding-bottom:12px">
        <button class="r9-btn r9-btn--wide" type="button" data-act="build">${glyph('chart', 16)}<span>${R9_UI.reportBuild}</span></button>
      </div>
    </div>`;
}

// แถบเลื่อนหน้าคอลัมน์รอบ (ทีละ 3 รอบ) — ไม่แสดงตอนพิมพ์
function pagerHtml(total, page, per) {
  if (total <= per) return '';
  const pages = Math.ceil(total / per);
  const a = page * per + 1, b = Math.min(total, (page + 1) * per);
  return `
    <div class="r9-rtpage r9-noprint">
      <button type="button" data-rpage="${page - 1}"${page === 0 ? ' disabled' : ''} aria-label="รอบก่อนหน้า">${glyph('chevron', 14)}</button>
      <span>รอบที่ ${a}–${b} จาก ${total}</span>
      <button type="button" data-rpage="${page + 1}"${page >= pages - 1 ? ' disabled' : ''} aria-label="รอบถัดไป">${glyph('chevron', 14)}</button>
    </div>`;
}

// ตารางสรุปยอด: แจกแจงทุกรายการ × รอบที่เลือก (ย่อ/ขยายรายหมวดด้วยหัวหมวด)
// คอลัมน์รอบโชว์ทีละ 3 รอบบนจอ ส่วนตอนพิมพ์โชว์ครบทุกรอบ (แบ่งหลายหน้าได้)
function sumTable(picked, items, cats, closed, page) {
  const per = 3;
  const from = page * per, to = from + per;
  // คอลัมน์นอกหน้าที่เปิดอยู่ ซ่อนบนจอ แต่ยังอยู่ในตารางเพื่อให้พิมพ์ออกครบ
  const off = i => (i < from || i >= to) ? ' class="is-off"' : '';
  const m = r9Matrix(picked, items, cats);
  const head = picked.map((rd, i) => `<th${off(i)}>รอบที่ ${i + 1}<br>(#${rd.no})</th>`).join('');
  const cell = v => v ? weight(v) : '<span class="is-nil">-</span>';
  const body = m.groups.map(g => {
    const shut = !!closed[g.cat.id];
    const rows = shut ? '' : g.rows.map(r => `
    <tr class="is-item" style="--c:${g.cat.color};--tint:${g.cat.tint}">
      <td>${r.item.name}<i>${r.item.unit}</i></td>
      <td class="is-price">${r.price ? moneyFine(r.price) : cell(0)}</td>
      ${r.cells.map((v, i) => `<td${off(i)}>${cell(v)}</td>`).join('')}
      <td class="is-total">${cell(r.total)}</td>
      <td class="is-value">${r.value ? moneyFine(r.value) : cell(0)}</td>
    </tr>`).join('');
    return `
    <tr class="is-cat${shut ? ' is-closed' : ''}" data-rgroup="${g.cat.id}" style="--c:${g.cat.color};--tint:${g.cat.tint}">
      <td><img src="${g.cat.icon}" alt=""><span>${g.cat.label}</span><b class="r9-rt__ch">${glyph('chevron', 13)}</b></td>
      <td class="is-price">${g.rows.length} รายการ</td>
      ${g.cells.map((v, i) => `<td${off(i)}>${cell(v)}</td>`).join('')}
      <td class="is-total">${weight(g.total)}</td>
      <td class="is-value">${moneyFine(g.value)}</td>
    </tr>${rows}`;
  }).join('');
  return `
    ${pagerHtml(picked.length, page, per)}
    <div class="r9-rtwrap">
    <table class="r9-rt">
      <thead><tr><th>รายการสินค้า</th><th>ราคา</th>${head}<th>รวม</th><th>มูลค่า</th></tr></thead>
      <tbody>
        ${body}
        <tr class="is-fee"><td>${glyph('truck', 14)} ค่าส่ง (บาท)</td><td></td>${m.fee.cells.map((v, i) => `<td${off(i)}>${cell(v)}</td>`).join('')}<td class="is-total">${money(m.fee.total)}</td><td class="is-value">${money(m.fee.total)}</td></tr>
        <tr class="is-sum"><td>รวมทั้งสิ้น</td><td></td>${m.sum.cells.map((v, i) => `<td${off(i)}>${weight(v)}</td>`).join('')}<td>${weight(m.sum.total)}</td><td>${moneyFine(m.sum.value)}</td></tr>
      </tbody>
    </table>
    </div>`;
}

// สรุปรายสินค้า: สินค้าแต่ละตัวส่งไปกี่หน่วย กี่บาท (มาก→น้อย)
function itemSumHtml(picked, items) {
  const rows = r9ItemSummary(picked, items).map((r, i) => `
    <tr class="is-item">
      <td>${i + 1}. ${r.item.name}</td>
      <td>${weight(r.qty)}<i>${r.item.unit || ''}</i></td>
      <td>${r.rounds}</td>
      <td class="is-value">${moneyFine(r.value)}</td>
    </tr>`).join('');
  return `
    <div class="r9-card">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/icon-report.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t"><div class="r9-card__title">${R9_UI.itemSum}</div><div class="r9-card__sub">${R9_UI.itemSumSub}</div></div>
      </div>
      <div class="r9-rtwrap">
        <table class="r9-rt">
          <thead><tr><th>รายการสินค้า</th><th>ปริมาณรวม</th><th>กี่รอบ</th><th>มูลค่า (บาท)</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="4">${R9_UI.emptyReport}</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;
}

// ส่วนวิเคราะห์: กราฟแท่งตามหมวด / กราฟเส้นรายรอบ / สัดส่วน / รายการยอดนิยม
function analyzeHtml(picked, items, cats) {
  const m = r9Matrix(picked, items, cats);
  const bars = m.groups.filter(g => g.total > 0).map(g => ({ label: g.cat.label, value: g.total, top: weight(g.total), color: g.cat.color }));
  const nets = picked.map(rd => r9RoundTotals(rd).net);
  const parts = m.groups.filter(g => g.value > 0).map(g => ({ label: g.cat.label, value: g.value, color: g.cat.color }))
    .concat(m.fee.total ? [{ label: 'ค่าส่ง', value: m.fee.total, color: '#7C8A9B' }] : []);
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const legend = parts.map(p => `<span><i style="background:${p.color}"></i>${p.label} ${(p.value / total * 100).toFixed(1)}%</span>`).join('');
  const top = r9TopItems(picked, items).map((r, i) => `
    <tr class="is-item"><td>${i + 1}. ${r.item.name}</td><td>${weight(r.qty)}</td><td class="is-total">${money(r.value)}</td></tr>`).join('');
  return `
    <div class="r9-card r9-noprint">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/icon-report.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t"><div class="r9-card__title">${R9_UI.reportAnalyze}</div><div class="r9-card__sub">${R9_UI.reportAnalyzeSub}</div></div>
      </div>
      <div class="r9-card__sub" style="padding:0 12px">ยอดรวมตามหมวดหมู่ (ปริมาณ)</div>
      ${barChart(bars, { h: 92 })}
      <div class="r9-card__sub" style="padding:10px 12px 0">แนวโน้มมูลค่ารายรอบ (บาท)</div>
      ${lineChart(nets, picked.map(rd => '#' + rd.no), { w: 380, h: 110 })}
      <div class="r9-card__sub" style="padding:10px 12px 0">สัดส่วนตามหมวดหมู่</div>
      <div class="r9-donutwrap">${donut(parts)}<div class="r9-legend">${legend}</div></div>
      <div class="r9-card__sub" style="padding:0 12px 4px">รายการสินค้ายอดนิยม (ตามปริมาณ)</div>
      <table class="r9-rt"><thead><tr><th>รายการ</th><th>ปริมาณ</th><th>มูลค่า (บาท)</th></tr></thead><tbody>${top}</tbody></table>
    </div>`;
}

// การ์ดสรุปยอด + วิเคราะห์ + ปุ่มส่งออก
export function reportHtml(picked, items, cats, view, closed) {
  if (!picked.length) return `<div class="r9-card"><p class="r9-empty">${R9_UI.emptyReport}</p></div>`;
  const k = r9ReportKpi(picked);
  const exports = R9_EXPORTS.map(e => `
    <button class="r9-export" type="button" data-export="${e.id}" style="--c:${e.color};--tint:${e.tint}">${glyph(e.glyph, 16)}<span>${e.label}</span></button>`).join('');
  return `
    <div class="r9-print-only" style="padding:4px 12px 10px">
      <div class="r9-print-only__t">รายงานการส่งของ — สาขา${R9_PLACE.title}</div>
      <div class="r9-print-only__s">${dayLongTh(view.from)} – ${dayLongTh(view.to)} · ${k.rounds} รอบ · ${k.items} รายการ · ${money(k.net)} บาท</div>
    </div>
    <div class="r9-card">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/boxes.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t"><div class="r9-card__title">${R9_UI.reportSum}</div><div class="r9-card__sub">${R9_UI.reportSumSub}</div></div>
        <span class="r9-round__tag">${picked.length} รอบ</span>
      </div>
      ${sumTable(picked, items, cats, closed || {}, view.rPage || 0)}
    </div>
    ${itemSumHtml(picked, items)}
    ${analyzeHtml(picked, items, cats)}
    <div class="r9-card r9-noprint">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/icon-report.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t"><div class="r9-card__title">${R9_UI.reportExport}</div><div class="r9-card__sub">${R9_UI.reportExportSub}</div></div>
      </div>
      <div class="r9-exports">${exports}</div>
    </div>`;
}
