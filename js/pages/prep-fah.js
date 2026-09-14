// แท็บบันทึกอาหารเหลือ (แท็บที่ 4) — ตาราง 1 บันทึกของเหลือวันนี้ (กรอก) / ตาราง 2 สถิติของเหลือ 7 วัน (แสดงผล) / ตาราง 3 แปลงเป็นวัตถุดิบ
import { get, save } from '../shared/data.js';
import { FAH_UI, FAH_GROUPS } from '../shared/config.js';
import { fahKeep, fahTotals, fahToIngredient } from '../shared/calc.js';
import { count, gram } from '../shared/format.js';
import { glyph, gramCell, sparkBars, toast, confirmSheet } from '../shared/ui.js';

// หัวการ์ดตาราง: เลขวงกลม + ชื่อ + คำอธิบาย + ปุ่มด้านขวา
function cardHead(t, tools = '') {
  return `
    <div class="fah-head">
      <span class="fah-head__no">${t.no}</span>
      <span class="fah-head__text"><b>${t.title}</b><small>${t.sub}</small></span>
      ${tools}
    </div>`;
}

// ชื่อเมนู/วัตถุดิบพร้อมรูปเล็ก
function nameCell(row) {
  return `<div class="ptab__item"><span class="ptab__thumb ptab__thumb--sm"><img src="${row.photo}" alt="" width="22" height="22" loading="lazy" decoding="async"></span><span class="ptab__name"><span>${row.name}</span></span></div>`;
}

// หัวตารางแบบ 7 วัน (จันทร์-อาทิตย์ + ช่องกราฟ)
function weekHead(days, first) {
  return `<div class="ptab__head">
    <div class="ptab__th">${first}</div>
    ${days.map(d => `<div class="ptab__th">${d.label}<em>${d.date}</em></div>`).join('')}
    <div class="ptab__th">${FAH_UI.graphHead}</div>
  </div>`;
}

// ตารางที่ 2 สถิติของเหลือ 7 วันของทุกเมนู (แสดงผลอย่างเดียว) (เลือกดูทีละเมนูได้)
function statsTable(menus, days, picked) {
  const list = picked === 'all' ? menus : menus.filter(m => m.id === picked);
  const options = [{ id: 'all', name: FAH_UI.allMenus }].concat(menus)
    .map(m => `<option value="${m.id}"${m.id === picked ? ' selected' : ''}>${m.name}</option>`).join('');
  const tools = `
    <label class="fah-pick"><select data-fah-menu="1">${options}</select><span>${glyph('chevron', 12)}</span></label>
    <span class="fah-head__ic">${glyph('grid', 14)}</span>`;
  const rows = list.map(m => `
    <div class="ptab__row ptab__row--sm">
      ${nameCell(m)}
      ${m.week.map(v => `<div class="ptab__c fah-g">${count(v)}</div>`).join('')}
      <div class="ptab__c fah-spark">${sparkBars(m.week, '#3B8BE0', 22)}</div>
    </div>`).join('');
  return `<section class="ptab ptab--fah-week">${cardHead(FAH_UI.tables[0], tools)}${weekHead(days, FAH_UI.menuHead)}${rows}</section>`;
}

// ตารางที่ 1 บันทึกของเหลือวันนี้ (พนักงานกรอกก่อน) (คงเหลือใช้ต่อ ระบบคำนวณให้)
function todayTable(menus, today) {
  const tools = `
    <button class="fah-btn fah-btn--pink" type="button" data-fah-copy="1">${glyph('image', 13)}${FAH_UI.copy}</button>
    <button class="fah-btn" type="button" data-fah-reset="1">${glyph('sort', 13)}${FAH_UI.reset}</button>`;
  const head = `<div class="ptab__head">
    <div class="ptab__th">${FAH_UI.menuHead}</div>
    ${FAH_UI.todayCols.map(([a, b]) => `<div class="ptab__th">${a}<em>${b}</em></div>`).join('')}
  </div>`;
  const rows = menus.map(m => {
    const rec = today.find(r => r.id === m.id) || { id: m.id };
    const empty = rec.left === null || rec.left === undefined;
    return `
      <div class="ptab__row ptab__row--sm" data-id="${m.id}">
        ${nameCell(m)}
        ${['left', 'waste', 'self', 'home'].map(f => `<div class="ptab__c">${gramCell(m.id, f, rec[f])}</div>`).join('')}
        <div class="ptab__c fah-keep${empty ? ' fah-keep--off' : ''}">${empty ? '-' : count(fahKeep(rec))}</div>
      </div>`;
  }).join('');
  const t = fahTotals(today);
  const sum = `
    <div class="ptab__row ptab__row--sm fah-sum">
      <span>รวมทุกเมนู (ก.)</span>
      <b>${count(t.left)}</b><b>${count(t.waste)}</b><b>${count(t.self)}</b><b>${count(t.home)}</b><b>${count(t.keep)}</b>
    </div>`;
  const notes = FAH_UI.notes.map(n => `
    <div class="fah-note fah-note--${n.tone}">
      <span class="fah-note__ic">${glyph(n.tone === 'amber' ? 'info' : 'check', 14)}</span>
      <span><b>${n.head}</b>${n.text}</span>
    </div>`).join('');
  return `<section class="ptab ptab--fah-today">${cardHead(FAH_UI.tables[1], tools)}${head}${rows}${sum}
    <div class="fah-notes">${notes}</div></section>`;
}

// ตารางที่ 3 แปลงของเหลือเป็นวัตถุดิบ (คอลัมน์วันสุดท้าย = ของเหลือวันนี้ที่แปลงได้ ถ้ามีการกรอกไว้)
function ingredientTable(items, days, today) {
  const rows = items.map(item => {
    const ids = FAH_GROUPS[item.id];
    const filled = ids && ids.some(id => {
      const r = today.find(x => x.id === id);
      return r && r.left !== null && r.left !== undefined;
    });
    const week = filled ? item.week.slice(0, -1).concat([fahToIngredient(today, ids)]) : item.week;
    return `
      <div class="ptab__row ptab__row--sm">
        ${nameCell(item)}
        ${week.map((v, i) => `<div class="ptab__c fah-g${filled && i === week.length - 1 ? ' fah-g--live' : ''}">${gram(v)}</div>`).join('')}
        <div class="ptab__c fah-spark">${sparkBars(week, '#7C4FD0', 22)}</div>
      </div>`;
  }).join('');
  return `<section class="ptab ptab--fah-week ptab--fah-ing">${cardHead(FAH_UI.tables[2])}${weekHead(days, FAH_UI.ingHead)}${rows}
    <div class="fah-foot"><img src="assets/bg/bg-leaf.webp" alt="" width="74" height="135" loading="lazy" decoding="async"><b>${FAH_UI.foot.text}</b><small>${FAH_UI.foot.sub}</small></div></section>`;
}

// แถบขอบคุณท้ายหน้า (ฟ้า + น้องไก่หลับ)
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
export function fahBodyHtml(view) {
  const menus = get('fahMenus'), days = get('fahDays'), today = get('fahToday');
  return todayTable(menus, today) + statsTable(menus, days, view.fahMenu)
    + ingredientTable(get('fahIngredients'), days, today) + thanksHtml();
}

// ปุ่มบนแท็บบันทึกอาหารเหลือ: คัดลอกจากเมื่อวาน / รีเซ็ต
export async function fahClick(event, redraw) {
  const hit = sel => event.target.closest(sel);
  if (hit('[data-fah-copy]')) {
    // คัดลอกจากเมื่อวาน = เอาของเหลือวันสุดท้ายในสถิติ 7 วัน มาเป็นช่อง "เหลือ" ของวันนี้
    const menus = get('fahMenus');
    save('fahToday', get('fahToday').map(r => {
      const menu = menus.find(m => m.id === r.id);
      return { ...r, left: menu ? menu.week[menu.week.length - 1] : 0, waste: 0, self: 0, home: 0 };
    }));
    redraw();
    return toast(FAH_UI.copyDone);
  }
  if (hit('[data-fah-reset]')) {
    if (!await confirmSheet({ title: FAH_UI.resetAsk.title, text: FAH_UI.resetAsk.text, okLabel: FAH_UI.resetAsk.ok, danger: true })) return;
    save('fahToday', get('fahToday').map(r => ({ ...r, left: 0, waste: 0, self: 0, home: 0 })));
    redraw();
    toast(FAH_UI.resetDone);
  }
}
