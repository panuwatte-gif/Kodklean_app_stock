// หน้าตาแท็บรายได้ประจำวันของแม่พัน — การ์ดเลือกร้าน จัดการช่องทาง ช่องกรอกยอด และแถวร้านอื่น
import { MAEPAN_UI as T, INCOME_UI as I, WORK_UI } from '../shared/config.js';
import { workNoteHtml } from '../shared/work-ui.js';
import { glyph } from '../shared/ui.js';
import { incomeBrandTotal } from '../shared/calc.js';
import { money, channelShort } from '../shared/format.js';

// การ์ดเลือกร้าน — โลโก้มาจากฐาน kk_income_brand
function storesHtml(inc) {
  const cards = inc.brands.map(b => `
    <button class="mp-store${b.id === inc.brand ? ' is-on' : ''}" type="button" data-brand="${b.id}">
      <img src="${b.logo || 'assets/fah/ic-income.webp'}" alt="" width="40" height="40" loading="lazy" decoding="async">
      <span class="mp-store__t"><b>${b.name}</b><em>${T.tagline[b.id] || ''}</em></span>
      ${b.id === inc.brand ? `<span class="mp-store__on">${glyph('check', 12)}</span>` : ''}
    </button>`).join('');
  return `
    <section class="mp-card">
      <div class="mp-sec">
        <img src="assets/home/ic-bag.webp" alt="" width="30" height="30" loading="lazy" decoding="async">
        <span class="mp-sec__t"><b>${T.storeTitle}</b><em>${T.storeSub}</em></span>
      </div>
      <div class="mp-stores">${cards}</div>
    </section>`;
}

// แถบจัดการช่องทาง: เปิด-ปิดช่องทางที่ใช้งาน และเพิ่มช่องทางใหม่
function channelsHtml(inc) {
  const rows = inc.all.map(c => `
    <button class="mp-sw${c.active ? ' is-on' : ''}" type="button" data-ch-sw="${c.id}">
      <span class="mp-sw__name">${channelShort(c.name)}</span>
      <span class="mp-sw__track"><i></i></span>
    </button>`).join('');
  return `
    <div class="mp-sec mp-sec--sub">
      <img src="assets/home/ic-line.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
      <span class="mp-sec__t"><b>${T.chTitle}</b><em>${T.chSub}</em></span>
    </div>
    <div class="mp-sws">
      ${rows}
      <button class="mp-sw mp-sw--add" type="button" data-ch-add="1">
        ${glyph('plus', 14)}<span class="mp-sw__name">${T.chAdd}<em>${T.chAddHint}</em></span>
      </button>
    </div>`;
}

// การ์ดกรอกยอดของร้านที่เลือกอยู่
function formHtml(brand, inc) {
  const data = inc.data[brand.id] || { note: '', amounts: {} };
  const fields = inc.channels.map(c => `
    <label class="mp-field">
      <span class="mp-field__lab">${c.name}</span>
      <span class="mp-field__box">
        <input class="mp-in" type="number" inputmode="numeric" min="0" step="1" placeholder="${I.placeholder}" data-ch="${c.id}" value="${data.amounts[c.id] ?? ''}">
        <span class="mp-field__unit">${I.unit}</span>
      </span>
    </label>`).join('') || `<p class="mp-empty">${T.chNone}</p>`;
  const total = incomeBrandTotal(data.amounts);
  return `
    <section class="mp-card mp-card--brand">
      <div class="mp-sec">
        <img src="${brand.logo || 'assets/fah/ic-income.webp'}" alt="" width="40" height="40" loading="lazy" decoding="async">
        <span class="mp-sec__t"><b>${brand.name}</b><em>${T.tagline[brand.id] || ''}</em></span>
      </div>
      ${channelsHtml(inc)}
      ${fields}
      <label class="mp-field">
        <span class="mp-field__lab">${I.noteLabel}</span>
        <textarea class="mp-area" id="mp-inote" placeholder="${I.notePlaceholder}">${data.note || ''}</textarea>
      </label>
      <div class="mp-total">
        <img src="assets/home/ic-coin.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <span>${I.total}</span>
        <b>${total === null ? '–' : money(total)}</b><em>${I.unit}</em>
      </div>
    </section>`;
}

// แถวย่อของร้านที่ยังไม่ได้เปิดกรอก
const rowHtml = (brand, inc) => {
  const total = incomeBrandTotal((inc.data[brand.id] || {}).amounts);
  return `
    <button class="mp-row" type="button" data-brand="${brand.id}">
      <img src="${brand.logo || 'assets/fah/ic-income.webp'}" alt="" width="32" height="32" loading="lazy" decoding="async">
      <span class="mp-row__t"><b>${brand.name}</b><em>${T.tagline[brand.id] || ''}</em></span>
      <span class="mp-row__val${total === null ? '' : ' is-filled'}">${total === null ? I.empty : money(total) + ' ' + I.unit}</span>
      <span class="mp-row__go">›</span>
    </button>`;
};

// เนื้อหาทั้งแท็บรายได้ประจำวัน
export function incomeBody(inc) {
  if (inc.error) return `<p class="mp-empty">${WORK_UI.loadError}</p>`;
  if (!inc.ready) return `<p class="mp-empty">${WORK_UI.loading}</p>`;
  const cur = inc.brands.find(b => b.id === inc.brand) || inc.brands[0];
  if (!cur) return `<p class="mp-empty">${WORK_UI.loadError}</p>`;
  return storesHtml(inc) + formHtml(cur, inc)
    + inc.brands.filter(b => b.id !== cur.id).map(b => rowHtml(b, inc)).join('')
    + workNoteHtml(I.info);
}
