// แท็บซื้อของเข้าร้าน — วาดแถบวันที่ การ์ดแต่ละร้าน (รายการ · ราคา · ปริมาณ · รวม + ยอดรวมกรอกเอง) ยอดรวมทุกร้าน และปุ่มบันทึก
import { R9_BUY_UI as T } from '../shared/config.js';
import { glyph, dateBarHtml, dateBandHtml } from '../shared/ui.js';
import { moneyFine, dayLongTh } from '../shared/format.js';
import { buyRow, buyShopTotal } from '../shared/calc.js';

// ค่าในช่องกรอก (ว่าง = '')
const val = v => (v === null || v === undefined ? '' : v);

// แถวรายการ 1 แถว (รายการที่เอาออกจากร้านแล้วแต่มียอดวันนี้ = ไม่มีปุ่มเอาออก)
function rowHtml(r) {
  const sum = buyRow(r.price, r.qty);
  return `
    <div class="r9-row r9-row--buy r9-item" data-vi="${r.vi}">
      <span class="r9-buyname"><b title="${r.name}">${r.name}</b><small>${r.unit || ''}</small></span>
      <input class="r9-in" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-bf="price" value="${val(r.price)}">
      <input class="r9-in" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-bf="qty" value="${val(r.qty)}">
      <span class="r9-item__sum${sum ? '' : ' is-zero'}">${sum ? moneyFine(sum) : '—'}</span>
      ${r.id ? `<button class="r9-more" type="button" data-bdel="${r.id}" aria-label="${T.remove}">${glyph('x', 14)}</button>` : '<span></span>'}
    </div>`;
}

// ร้าน 1 ร้าน: หัวร้าน (ยอดรวม) + รายการ + ปุ่มเพิ่มรายการ + ช่องยอดรวมกรอกเอง
function shopHtml(shop, rows, ed, closed) {
  const t = buyShopTotal(rows, ed.manual), shut = !!closed[shop.id];
  return `
    <div class="r9-buyshop" data-shop="${shop.id}">
      <button class="r9-grp${shut ? ' is-closed' : ''}" type="button" data-bgroup="${shop.id}" style="--c:${shop.color};--tint:${shop.tint}">
        <span class="r9-buybadge">${shop.label.slice(0, 1)}</span>
        <span class="r9-grp__name">${shop.label}</span>
        <span class="r9-grp__n" data-shophead="${shop.id}">${moneyFine(t.total)} บาท</span>
        <span class="r9-grp__ch">${glyph('chevron', 15)}</span>
      </button>
      ${shut ? '' : `
      ${rows.length ? rows.map(rowHtml).join('') : `<p class="r9-empty">${T.empty}</p>`}
      <button class="r9-addin" type="button" data-badd="${shop.id}">${glyph('plus', 14)}<span>${T.addItem}</span></button>
      <div class="r9-buyfoot">
        <label class="r9-buyman"><span>${T.manual}</span><input class="r9-in" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-bf="manual" value="${val(ed.manual)}"></label>
        <div class="r9-buysum"><span>${T.shopTotal}</span><b data-shopsum="${shop.id}">${moneyFine(t.total)}</b><small>บาท</small></div>
      </div>
      <p class="r9-buyhint" data-shopnote="${shop.id}"${t.manual ? '' : ' hidden'}>${T.manualHint}</p>`}
    </div>`;
}

// ทั้งแท็บ (rowsOf = ฟังก์ชันคืนแถวของร้าน · dayTotal = ยอดรวมทุกร้านของวันที่เลือก)
export function buyHtml(s, rowsOf, dayTotal) {
  const head = T.cols.map(c => `<span>${c}</span>`).join('');
  return `
    <div class="r9-datewrap">${dateBarHtml(s.date, 'r9-buy-pick')}${dateBandHtml(s.date, T.dateBand)}</div>
    <div class="r9-card">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/boxes.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t">
          <div class="r9-card__title">${T.title}</div>
          <div class="r9-card__sub">${T.tableSub}</div>
        </div>
      </div>
      <div class="r9-row r9-row--buy r9-thead">${head}</div>
      ${s.shops.map(sh => shopHtml(sh, rowsOf(sh.id), s.edit[sh.id], s.closed)).join('')}
    </div>
    <div class="r9-card r9-buyday"><span>${T.dayTotal} · ${dayLongTh(s.date)}</span><b id="r9-buyday">${moneyFine(dayTotal)}</b><small>บาท</small></div>
    <div class="r9-go">
      <button class="r9-btn${s.saving ? ' is-busy' : ''}" type="button" data-act="buySave"${s.saving ? ' disabled' : ''}>${s.saving ? '<span class="r9-spin"></span>' : glyph('check', 16)}<span>${s.saving ? T.saving : T.save}</span></button>
    </div>`;
}
