// แท็บส่งของ — วาดแถบวันที่ ตารางรายการ ยอดรวม และปุ่มท้ายหน้า (การกดปุ่มอยู่ที่ rama9.js)
import { R9_UI, R9_SEND_COLS, R9_ROW_TOOLS } from '../shared/config.js';
import { glyph, dateBarHtml, dateBandHtml, r9Photo } from '../shared/ui.js';
import { money, moneyFine, fillText } from '../shared/format.js';
import { r9Row, r9Totals, r9ByCat, r9DraftItems } from '../shared/calc.js';

// แถบวันที่ของรอบส่ง + แถบเตือนเมื่อไม่ใช่วันนี้ (บันทึกด้วยวันที่นี้ ไม่ใช่วันที่ของเครื่อง)
export function dateHtml(date) {
  return `<div class="r9-datewrap">${dateBarHtml(date, 'r9-date-pick')}${dateBandHtml(date, R9_UI.dateBand)}</div>`;
}

// ปุ่มไอคอนท้ายแถว 4 ปุ่ม
function toolsHtml() {
  return R9_ROW_TOOLS.map(t => `
    <button class="r9-tool" type="button" data-tool="${t.id}" aria-label="${t.label}" style="--c:${t.color};--tint:${t.tint}">${glyph(t.glyph, 13)}</button>`).join('');
}

// แถวรายการ 1 แถว: ชื่อ + ปริมาณ + ราคา + รวม + ปุ่มจัดการ (ราคายังไม่ตั้ง = ว่างไว้ ห้ามเป็น 0)
// tools = false คือหน้าที่กรอกอย่างเดียว (หน้าแม่พัน) — การแก้รายการอยู่ที่แท็บตั้งค่าของหน้าพระราม 9
function itemHtml(item, tools = true) {
  const hasPrice = item.price !== null && item.price !== '' && item.price !== undefined;
  const sum = hasPrice ? r9Row(item) : 0;
  return `
    <div class="r9-row r9-item${tools ? '' : ' r9-row--slim'}" data-id="${item.id}">
      <span class="r9-item__name">
        <img src="${r9Photo(item)}" alt="" width="22" height="22" loading="lazy" decoding="async">
        <span title="${item.name} (${item.unit})">${item.name}</span>
      </span>
      <input class="r9-in" type="number" inputmode="decimal" step="0.1" min="0" placeholder="—" data-f="qty" value="${item.qty ?? ''}">
      <input class="r9-in${hasPrice ? '' : ' is-nil'}" type="number" inputmode="decimal" step="1" min="0" placeholder="—" data-f="price" value="${hasPrice ? item.price : ''}">
      <span class="r9-item__sum${sum ? '' : ' is-zero'}">${sum ? moneyFine(sum) : '—'}</span>
      ${tools ? `<span class="r9-item__tools">${toolsHtml()}</span>` : ''}
    </div>`;
}

// กลุ่มหมวด 1 หมวด: หัวหมวด + รายการในหมวด + ปุ่มเพิ่มรายการในหมวดนี้
function groupHtml(group, closed, tools = true) {
  const { cat, rows } = group;
  const shut = !!closed[cat.id];
  const body = shut ? '' : (rows.length
    ? rows.map(item => itemHtml(item, tools)).join('')
    : `<p class="r9-empty">${R9_UI.emptySend}</p>`);
  return `
    <button class="r9-grp${shut ? ' is-closed' : ''}" type="button" data-group="${cat.id}" style="--c:${cat.color};--tint:${cat.tint}">
      <img src="${cat.icon}" alt="">
      <span class="r9-grp__name">${cat.label}</span>
      <span class="r9-grp__n">${rows.length} รายการ</span>
      <span class="r9-grp__ch">${glyph('chevron', 15)}</span>
    </button>
    ${body}
    ${shut || !tools ? '' : `<button class="r9-addin" type="button" data-addin="${cat.id}">${glyph('plus', 14)}<span>${R9_UI.addInCat}</span></button>`}`;
}

// ตารางรายการส่งของทั้งใบ (opts.tools = false คือกรอกอย่างเดียว ไม่มีปุ่มแก้รายการ)
export function tableHtml(items, cats, closed, opts = {}) {
  const tools = opts.tools !== false;
  const cols = tools ? R9_SEND_COLS : R9_SEND_COLS.slice(0, 4);
  const head = cols.map(c => `<span>${c}</span>`).join('');
  return `
    <div class="r9-card">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/boxes.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t">
          <div class="r9-card__title">${R9_UI.tableTitle}</div>
          <div class="r9-card__sub">${R9_UI.tableSub}</div>
        </div>
      </div>
      ${tools ? `<div class="r9-filters">
        <button class="r9-btn r9-btn--green" type="button" data-act="add">${glyph('plus', 15)}<span>${R9_UI.addItem}</span></button>
        <button class="r9-btn" type="button" data-act="addCat">${glyph('plus', 15)}<span>${R9_UI.addCat}</span></button>
      </div>` : ''}
      <div class="r9-row r9-thead${tools ? '' : ' r9-row--slim'}">${head}</div>
      ${r9ByCat(items, cats).map(g => groupHtml(g, closed, tools)).join('')}
    </div>`;
}

// แถบยอดรวม: รวมค่าสินค้า + ค่าส่ง = ยอดสุทธิ
export function sumHtml(items, fee) {
  const t = r9Totals(items, fee);
  return `
    <div class="r9-card" id="r9-sumcard">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/icon-report.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t">
          <div class="r9-card__title">ยอดรอบนี้</div>
          <div class="r9-card__sub">กรอกแล้ว ${t.filled} จาก ${t.count} รายการ</div>
        </div>
      </div>
      <div class="r9-sum" style="padding:0 10px 12px">
        <div class="r9-sum__box" style="--c:#B9436F;--tint:#FCE1EA">
          <div class="r9-sum__lab">${R9_UI.goods}</div>
          <div class="r9-sum__num">${moneyFine(t.goods)}<small>บาท</small></div>
        </div>
        <span class="r9-sum__op">+</span>
        <div class="r9-sum__box" style="--c:#2F63C9;--tint:#EAF1FD">
          <div class="r9-sum__lab">${R9_UI.fee}</div>
          <input class="r9-in r9-sum__fee" type="number" inputmode="decimal" step="1" min="0" placeholder="0" data-fee="1" value="${fee || ''}">
        </div>
        <span class="r9-sum__op">=</span>
        <div class="r9-sum__box" style="--c:#D4322A;--tint:#FDECEA">
          <div class="r9-sum__lab">${R9_UI.net}</div>
          <div class="r9-sum__num">${moneyFine(t.net)}<small>บาท</small></div>
        </div>
      </div>
    </div>`;
}

// กรอกปริมาณ/ราคา/ค่าส่ง → เก็บลงร่างแล้วอัปเดตเฉพาะตัวเลขที่เกี่ยว (ไม่วาดใหม่ทั้งหน้า ช่องที่กำลังพิมพ์จึงไม่หาย) · คืน true = จัดการแล้ว
export function sendInput(event, { draft, items, root, save }) {
  const elm = event.target;
  if (elm.matches('[data-f]')) {
    const id = elm.closest('.r9-item').dataset.id, f = elm.dataset.f;
    draft[f][id] = elm.value === '' ? (f === 'price' ? null : '') : Number(elm.value);
    save();
    const rows = r9DraftItems(items, draft), it = rows.find(r => r.id === id);
    const sum = it.price === null ? 0 : r9Row(it);
    const cell = elm.closest('.r9-item').querySelector('.r9-item__sum');
    cell.textContent = sum ? moneyFine(sum) : '—';
    cell.classList.toggle('is-zero', !sum);
    root.querySelector('#r9-sumcard').outerHTML = sumHtml(rows, draft.fee);
    return true;
  }
  if (elm.matches('[data-fee]')) {
    draft.fee = elm.value === '' ? '' : Number(elm.value);
    save();
    const goods = r9DraftItems(items, draft).reduce((s, i) => s + (i.price === null ? 0 : r9Row(i)), 0);
    elm.closest('.r9-sum').querySelectorAll('.r9-sum__num')[1].innerHTML = moneyFine(goods + (Number(draft.fee) || 0)) + '<small>บาท</small>';
    return true;
  }
  return false;
}

// ช่องหมายเหตุ + ปุ่มล้างทั้งหมด / บันทึกและส่ง (กำลังบันทึก = กดไม่ได้ + วงหมุน)
export function footHtml({ note, saving, editing }) {
  const label = saving ? R9_UI.saving : editing ? R9_UI.editSave : R9_UI.send;
  return `
    ${editing ? `<div class="r9-editbar">${glyph('pencil', 14)}<b>${fillText(R9_UI.editing, { no: editing.no })}</b><button type="button" data-act="editCancel">${R9_UI.editCancel}</button></div>` : ''}
    <textarea class="r9-note" id="r9-note" placeholder="${R9_UI.notePlaceholder}">${note || ''}</textarea>
    <div class="r9-go">
      <button class="r9-btn r9-btn--danger" type="button" data-act="clear"${saving ? ' disabled' : ''}>${glyph('trash', 16)}<span>${R9_UI.clear}</span></button>
      <button class="r9-btn${saving ? ' is-busy' : ''}" type="button" data-act="send"${saving ? ' disabled' : ''}>${saving ? '<span class="r9-spin"></span>' : glyph('send', 16)}<span>${label}</span></button>
    </div>`;
}
