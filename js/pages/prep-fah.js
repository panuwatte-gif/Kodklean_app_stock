// แท็บบันทึกอาหารเหลือ (แท็บที่ 4) — กรอกของเหลือรายเมนู (กรัม) / สถิติ 7 วันจริง / แปลงเป็นเนื้อสัตว์ / ตั้งค่าเมนู
import { FAH_UI, PREP_UI, STOCK_PHOTOS } from '../shared/config.js';
import { fahTotals } from '../shared/calc.js';
import { count, gram, fillText, dayShort, weightBig } from '../shared/format.js';
import { glyph, gramCell, sparkBars, menuPhoto } from '../shared/ui.js';
import { histDot, photoOf } from './prep-meat.js';
import { assumeFahHtml } from './prep-assume.js';

// หัวการ์ดตาราง: เลขวงกลม + ชื่อ + คำอธิบาย
function cardHead(no, title, sub) {
  return `
    <div class="fah-head">
      <span class="fah-head__no">${no}</span>
      <span class="fah-head__text"><b>${title}</b><small>${sub}</small></span>
    </div>`;
}

// ชื่อเมนูพร้อมรูปเล็ก
function nameCell(row, photo) {
  return `<div class="ptab__item"><span class="ptab__thumb ptab__thumb--sm"><img src="${photo}" alt="" width="22" height="22" loading="lazy" decoding="async"></span><span class="ptab__name"><span>${row.name}</span></span></div>`;
}

// ตารางที่ 1 บันทึกของเหลือของวันที่เลือก (คงเหลือใช้ต่อ ระบบคำนวณให้)
function todayTable(rows) {
  const head = `<div class="ptab__head">
    <div class="ptab__th">${FAH_UI.menuHead}</div>
    ${FAH_UI.todayCols.map(([a, b]) => `<div class="ptab__th">${a}<em>${b}</em></div>`).join('')}
  </div>`;
  const body = rows.map(m => `
    <div class="ptab__row ptab__row--sm" data-id="${m.id}">
      ${nameCell(m, menuPhoto(m))}
      ${['left', 'waste', 'self', 'home'].map(f => `<div class="ptab__c">${gramCell(m.id, f, m[f], 'fah')}${histDot('fah', m.id, f, m.name, m.revs[f])}</div>`).join('')}
      <div class="ptab__c fah-keep${m.keep === null ? ' fah-keep--off' : ''}">${m.keep === null ? '-' : count(m.keep)}</div>
    </div>`).join('');
  const t = fahTotals(rows);
  const sum = `
    <div class="ptab__row ptab__row--sm fah-sum">
      <span>รวมทุกเมนู (ก.)</span>
      <b>${count(t.left)}</b><b>${count(t.waste)}</b><b>${count(t.self)}</b><b>${count(t.home)}</b><b>${count(t.keep)}</b>
    </div>`;
  return `<section class="ptab ptab--fah-today">${cardHead(1, FAH_UI.tables[1].title, FAH_UI.tables[1].sub)}${head}${body}${sum}</section>`;
}

// ตารางที่ 2 สถิติของเหลือ 7 วันจริง (วันไม่มีข้อมูล = ขีด)
function weekTable(rows, week) {
  const head = `<div class="ptab__head">
    <div class="ptab__th">${FAH_UI.menuHead}</div>
    ${week.days.map(d => `<div class="ptab__th">${dayShort(d)}</div>`).join('')}
    <div class="ptab__th">${FAH_UI.graphHead}</div>
  </div>`;
  const body = rows.map(m => {
    const vals = week.days.map(d => (week.byMenu[m.id] || {})[d]);
    return `
    <div class="ptab__row ptab__row--sm">
      ${nameCell(m, menuPhoto(m))}
      ${vals.map(v => `<div class="ptab__c fah-g">${gram(v ?? null)}</div>`).join('')}
      <div class="ptab__c fah-spark">${sparkBars(vals.map(v => v || 0), '#3B8BE0', 22)}</div>
    </div>`;
  }).join('');
  return `<section class="ptab ptab--fah-week">${cardHead(2, PREP_UI.weekTitle, FAH_UI.tables[0].sub)}${head}${body}</section>`;
}

// ตารางที่ 3 แปลงของเหลือวันนี้เป็นวัตถุดิบ (กก. เทียบสด) — ก้อนที่ไปหักในแท็บเตรียมอาหาร
function convTable(conv, meatItems) {
  const rows = Object.keys(conv.kg).map(id => {
    const item = meatItems.find(i => i.id === id) || { id, name: id, grp: 'เนื้อสัตว์' };
    return `
      <div class="ptab__row ptab__row--sm">
        ${nameCell(item, STOCK_PHOTOS[id] || 'assets/cats/beef.webp')}
        <div class="ptab__c fah-g fah-g--live">${weightBig(conv.kg[id])} กก.</div>
      </div>`;
  }).join('');
  const note = `<div class="fah-note fah-note--blue"><span class="fah-note__ic">${glyph('check', 14)}</span><span>${fillText(PREP_UI.boundNote, { x: conv.items, y: conv.filled })}</span></div>`;
  const unbound = conv.unbound.length
    ? `<div class="fah-note fah-note--amber"><span class="fah-note__ic">${glyph('info', 14)}</span><span><b>${PREP_UI.unboundHead}</b>${conv.unbound.join(' · ')}</span></div>`
    : '';
  return `<section class="ptab ptab--fah-week ptab--fah-ing">${cardHead(3, PREP_UI.convTitle, FAH_UI.tables[2].sub)}
    ${rows || `<p class="ptab__none">${PREP_UI.convEmpty}</p>`}
    <div class="fah-notes fah-notes--col">${note}${unbound}</div></section>`;
}

// แถบขอบคุณท้ายหน้า
function thanksHtml() {
  return `
    <section class="fah-thanks">
      <img class="fah-thanks__fah" src="assets/prep/fah-heart.webp" alt="ฟ้า" width="70" height="73" loading="lazy" decoding="async">
      <div class="fah-thanks__mid">
        <div class="fah-thanks__text">${FAH_UI.thanks.title}</div>
        <div class="fah-thanks__bubble">${FAH_UI.thanks.bubble}</div>
      </div>
      <img class="fah-thanks__mascot" src="assets/prep/mascot-sleep.webp" alt="กุ๊กไก่" width="86" height="65" loading="lazy" decoding="async">
    </section>`;
}

// ทั้งแท็บบันทึกอาหารเหลือ
export function fahBodyHtml(model) {
  if (!model.fahRows.length) return `<p class="ptab__none">${PREP_UI.noMenu}</p>`;
  return todayTable(model.fahRows) + convTable(model.conv, model.meatItems)
    + weekTable(model.fahRows, model.fahWeek) + assumeFahHtml(model.menus, model.meatItems) + thanksHtml();
}