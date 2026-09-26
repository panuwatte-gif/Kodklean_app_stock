// ชิ้นส่วนหน้าจอของแท็บ "แปลภาษาพม่า" ในหน้างานของส้ม (สวิตช์ · ตารางคำนับสต๊อก · ตารางข้อความแอป)
import { glyph } from '../shared/ui.js';
import { SOM_MY_UI as M, MY_APP_CATS } from '../shared/config.js';
import { escHtml, fillText } from '../shared/format.js';

// ข้อความไทยที่มี <br> หรือขึ้นบรรทัด → แสดงเป็นหลายบรรทัด
const thHtml = th => escHtml(th).replace(/&lt;br\s*\/?&gt;|\n/g, '<br>');

// แถบบน: ปุ่มเลือก 2 ส่วน
export function myHeadHtml(state) {
  return `
    <nav class="mseg">${M.sections.map(s => `
      <button class="mseg__btn${s.id === state.section ? ' is-on' : ''}" type="button" data-my-sec="${s.id}">${s.label}</button>`).join('')}
    </nav>`;
}

// แถบค้นหา + ติ๊กเฉพาะที่ยังไม่แปล (+ ปุ่มเพิ่มคำของส่วนนับสต๊อก)
export function myToolsHtml(state, withAdd) {
  return `
    <div class="mtools">
      <div class="ssearch">
        ${glyph('search', 20)}
        <input type="search" id="my-search" placeholder="${M.search}" value="${escHtml(state.q)}" aria-label="${M.search}">
      </div>
      ${withAdd ? `<button class="sbtn sbtn--add mtools__add" type="button" data-my-add="1">${glyph('plus', 18)}<span>${M.add}</span></button>` : ''}
    </div>
    <label class="mtodo"><input type="checkbox" id="my-todo"${state.todo ? ' checked' : ''}><span>${M.todo}</span></label>`;
}

// แถบความคืบหน้า แปลแล้วกี่คำ
export function myProgressHtml(done, all) {
  const pct = all ? Math.round(done / all * 100) : 0;
  return `<div class="mprog"><span>${fillText(M.progress, { done, all })}</span><b>${pct}%</b><i><s style="width:${pct}%"></s></i></div>`;
}

// แถวคำของรายการนับ 1 คำ (ไทย → ชื่อพม่า + หน่วยพม่า)
function stockRowHtml(w, linkName) {
  const meta = [w.unit_th ? `${M.unit} ${escHtml(w.unit_th)}` : '', w.count_item_id ? `${M.linked}${linkName ? ' · ' + escHtml(linkName) : ''}` : M.notLinked].filter(Boolean).join(' · ');
  return `
    <div class="mrow${w.name_my ? ' is-done' : ''}" data-w="${escHtml(w.id)}">
      <span class="mrow__th"><b>${escHtml(w.th_name)}</b><em>${meta}</em></span>
      <span class="mrow__my">
        <input class="mrow__in" data-f="name_my" value="${escHtml(w.name_my)}" placeholder="${M.phName}" lang="my" aria-label="${M.phName}">
        <input class="mrow__in mrow__in--unit" data-f="unit_my" value="${escHtml(w.unit_my || '')}" placeholder="${M.phUnit}" lang="my" aria-label="${M.phUnit}">
      </span>
      <button class="mrow__more" type="button" data-w-more="${escHtml(w.id)}" aria-label="${M.moreTitle}">⋮</button>
    </div>`;
}

// ตารางคำนับสต๊อก แยกตามหมวด
export function myStockHtml(words, itemName, emptyText) {
  if (!words.length) return `<p class="sempty">${emptyText}</p>`;
  const groups = {};
  words.forEach(w => { const g = w.cat_th || M.noCat; (groups[g] = groups[g] || []).push(w); });
  return Object.entries(groups).map(([g, list]) => `
    <section class="mgroup" data-no-my="1">
      <h3 class="mgroup__title">${escHtml(g)}<span>${list.filter(w => w.name_my).length}/${list.length}</span></h3>
      <div class="mgroup__head"><b>${M.colTh}</b><b>${M.colMy}</b></div>
      ${list.map(w => stockRowHtml(w, itemName(w.count_item_id))).join('')}
    </section>`).join('');
}

// ชิปหมวดของข้อความแอป (ตัวเลข = แปลแล้ว/ทั้งหมด)
export function myCatsHtml(active, counts) {
  return `<div class="mcats">${MY_APP_CATS.map(c => {
    const n = counts[c.id] || { done: 0, all: 0 };
    return `<button class="mcat${c.id === active ? ' is-on' : ''}" type="button" data-my-cat="${c.id}">${c.label}<i>${n.done}/${n.all}</i></button>`;
  }).join('')}</div>`;
}

// ตารางข้อความแอปของหมวดที่เลือก (ไทย → พม่า ช่องละ 1 ข้อความ)
export function myAppHtml(rows, emptyText) {
  if (!rows.length) return `<p class="sempty">${emptyText}</p>`;
  return `
    <p class="mhint">${M.hint}</p>
    <section class="mgroup" data-no-my="1">
      <div class="mgroup__head"><b>${M.colTh}</b><b>${M.colMy}</b></div>
      ${rows.map(r => `
        <div class="mrow mrow--app${r.my ? ' is-done' : ''}" data-app="${r.i}">
          <span class="mrow__th"><b>${thHtml(r.th)}</b></span>
          <textarea class="mrow__in mrow__in--area" rows="2" lang="my" placeholder="${M.phMy}" aria-label="${M.colMy}">${escHtml(r.my)}</textarea>
        </div>`).join('')}
    </section>`;
}
