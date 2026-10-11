// หน้าตาหน้าต้นทุนอาหาร — แท็บ · ตารางราคากลาง (ทุนจริง + ราคา fix) · การ์ดต้นทุนเมนู · เครื่องคิดเมนูพิเศษ
import { FOOD_COST_UI as T, MENU_PHOTOS } from '../shared/config.js';
import { glyph, r9Photo } from '../shared/ui.js';
import { moneyFine, fillText, escHtml } from '../shared/format.js';
import { r9ByCat, menuCost } from '../shared/calc.js';

// ค่าในช่องกรอก (ว่าง = '')
const val = v => (v === null || v === undefined ? '' : v);

// รายการนี้นับเป็นกิโล (ส่วนประกอบเมนูกรอกเป็นกรัม)
export const isKg = it => ['กก.', 'กิโลกรัม'].includes(it.unit);

// แถบแท็บ 3 อัน
export const tabsHtml = tab => T.tabs.map(t =>
  `<button class="fco-tab${t.id === tab ? ' is-on' : ''}" type="button" data-tab="${t.id}">${t.label}</button>`).join('');

// แถวราคากลาง 1 รายการ: ทุนจริง (สีเขียว = จาก App_money) · ราคา fix
function priceRow(it) {
  const name = escHtml(it.name);
  return `
    <div class="fco-row" data-id="${it.id}">
      <span class="fco-name"><img src="${r9Photo(it)}" alt="" width="26" height="26" loading="lazy" decoding="async"><span><b>${name}</b><i>${fillText(T.perUnit, { u: it.unit })}</i></span></span>
      <input class="fco-in${it.actualSource === 'app_money' ? ' is-app' : ''}" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-pc="actual" value="${val(it.costActual)}" aria-label="${T.colActual} ${name}">
      <input class="fco-in" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-pc="fix" value="${val(it.costFix)}" aria-label="${T.colFix} ${name}">
    </div>`;
}

// แท็บต้นทุนวัตถุดิบ: แยกตามหมวดของหน้าพระราม 9 (แตะหัวหมวดเพื่อย่อ/ขยาย)
export function itemsHtml(items, cats, closed) {
  const groups = r9ByCat(items, cats).filter(g => g.rows.length).map(({ cat, rows }) => {
    const shut = !!closed[cat.id];
    return `
    <section class="fco-grp" style="--c:${cat.color};--t:${cat.tint}">
      <button class="fco-grp__head" type="button" data-cat="${cat.id}">
        <img src="${cat.icon}" alt="" width="22" height="22" loading="lazy" decoding="async"><b>${cat.label}</b><em>${fillText(T.nItems, { n: rows.length })}</em>
        <span class="fco-ch${shut ? ' is-shut' : ''}">${glyph('chevron', 14)}</span>
      </button>
      ${shut ? '' : rows.map(priceRow).join('')}
    </section>`;
  }).join('');
  return `<p class="fco-help">${T.itemsHelp}</p>
    <div class="fco-cols"><span>${T.colItem}</span><span>${T.colActual}</span><span>${T.colFix}</span></div>${groups}`;
}

// แถวส่วนประกอบ 1 แถว (ref = m:<id ในฐาน> ของเมนู หรือ c:<ลำดับ> ของเครื่องคิดเมนูพิเศษ)
function partRow(p, items, ref) {
  const del = `<button class="fco-del" type="button" data-del="1" aria-label="ลบ">${glyph('trash', 14)}</button>`;
  if (!p.item_id) return `
    <div class="fco-part" data-ref="${ref}">
      <input class="fco-in fco-in--label" type="text" data-f="label" value="${escHtml(p.label || '')}" placeholder="${T.flatHint}">
      <input class="fco-in" type="number" inputmode="decimal" step="any" min="0" placeholder="0" data-f="baht" value="${val(p.baht)}">
      <span class="fco-part__u">${T.baht}</span>
      <b class="fco-part__sum">${moneyFine(Number(p.baht) || 0)}</b>${del}
    </div>`;
  const it = items.find(i => i.id === p.item_id) || { id: p.item_id, name: p.item_id, unit: '' };
  const kg = isKg(it), price = it.costFix ?? it.costActual;
  const shown = kg ? Math.round((Number(p.qty) || 0) * 10000) / 10 : p.qty;
  const has = price !== null && price !== undefined;
  return `
    <div class="fco-part" data-ref="${ref}"${kg ? ' data-kg="1"' : ''}>
      <span class="fco-part__name"><img src="${r9Photo(it)}" alt="" width="22" height="22" loading="lazy" decoding="async">${escHtml(it.name)}</span>
      <input class="fco-in" type="number" inputmode="decimal" step="any" min="0" placeholder="0" data-f="qty" value="${shown || ''}" aria-label="${escHtml(it.name)}">
      <span class="fco-part__u">${kg ? T.gram : it.unit}</span>
      <b class="fco-part__sum">${has ? moneyFine((Number(p.qty) || 0) * price) : '—'}</b>${del}
    </div>`;
}

// แถบเตือน: รายการที่ยังไม่ตั้งราคา fix / ไม่มีราคาเลย
const warnHtml = c => [
  c.noFix.length ? `<p class="fco-warn">${fillText(T.noFix, { names: c.noFix.join(', ') })}</p>` : '',
  c.noPrice.length ? `<p class="fco-warn is-bad">${fillText(T.noPrice, { names: c.noPrice.join(', ') })}</p>` : ''
].join('');

// ปุ่มเพิ่มส่วนประกอบ (menu ว่าง = เครื่องคิดเมนูพิเศษ)
const addHtml = menu => `
  <div class="fco-adds">
    <button class="fco-add" type="button" data-add="item" data-menu="${menu}">${glyph('plus', 14)}<span>${T.addItem}</span></button>
    <button class="fco-add" type="button" data-add="flat" data-menu="${menu}">${glyph('plus', 14)}<span>${T.addFlat}</span></button>
  </div>`;

// การ์ดเตือนสิ่งที่ยังไม่ได้คิดแยก (ทำละเอียดใน App สูตรภายหลัง)
const laterHtml = () => `
  <section class="fco-later">
    <b>${T.later.title}</b>
    <ul>${T.later.rows.map(r => `<li>${r}</li>`).join('')}</ul>
    <p>${T.later.note}</p>
  </section>`;

// แท็บต้นทุนเมนู: การ์ดละเมนู แตะเพื่อเปิดส่วนประกอบ
export function menusHtml(menus, parts, items, open) {
  const cards = menus.map(m => {
    const mine = parts.filter(p => p.menu_id === m.id), on = !!open[m.id], c = menuCost(mine, items);
    return `
    <section class="fco-menu${on ? ' is-open' : ''}">
      <button class="fco-mhead" type="button" data-mopen="${m.id}">
        <img src="${MENU_PHOTOS[m.id] || m.photo || 'assets/icons/ic12.webp'}" alt="" width="44" height="44" loading="lazy" decoding="async">
        <span class="fco-mhead__t"><b>${escHtml(m.name)}</b><em>${mine.length ? fillText(T.parts, { n: mine.length }) : T.noParts}</em></span>
        <span class="fco-mhead__c"><b>${mine.length ? moneyFine(c.fix) : '—'}</b><i>${mine.length ? fillText(T.actualVs, { v: moneyFine(c.actual) }) : T.perPlate}</i></span>
      </button>
      ${on ? `<div class="fco-mbody">${mine.map(p => partRow(p, items, 'm:' + p.id)).join('')}${warnHtml(c)}${addHtml(m.id)}</div>` : ''}
    </section>`;
  }).join('');
  return `<p class="fco-help">${T.menuHelp}</p>${cards}${laterHtml()}`;
}

// แท็บคิดเมนูพิเศษ: ใส่วัตถุดิบ + ปริมาณ → ต้นทุน · ใส่ราคาขาย → กำไร/ขาดทุน (ไม่บันทึกลงฐาน)
export function calcHtml(rows, items, sell) {
  const c = menuCost(rows, items), price = Number(sell) || 0, gain = Math.round((price - c.fix) * 100) / 100;
  const result = sell === '' ? '' : `
      <div class="fco-gain ${gain >= 0 ? 'is-ok' : 'is-bad'}"><span>${gain >= 0 ? T.profit : T.loss}</span><b>${moneyFine(Math.abs(gain))} ${T.baht}</b><i>${price ? fillText(T.margin, { p: Math.round(gain / price * 100) }) : ''}</i></div>`;
  return `<p class="fco-help">${T.calcHelp}</p>
    <section class="fco-menu is-open"><div class="fco-mbody">
      ${rows.length ? rows.map((p, i) => partRow(p, items, 'c:' + i)).join('') : `<p class="fco-empty">${T.calcEmpty}</p>`}
      ${warnHtml(c)}${addHtml('')}
    </div></section>
    <section class="fco-total">
      <div><span>${T.costTotal}</span><b>${moneyFine(c.fix)} ${T.baht}</b></div>
      <div><span>${T.costActual}</span><b>${moneyFine(c.actual)} ${T.baht}</b></div>
      <label class="fco-sell"><span>${T.sell}</span><input class="fco-in" type="number" inputmode="decimal" step="any" min="0" placeholder="0" data-sell="1" value="${escHtml(sell)}"><i>${T.baht}</i></label>
      ${result}
    </section>
    ${rows.length ? `<button class="fco-clear" type="button" data-act="calcClear">${T.clear}</button>` : ''}`;
}
