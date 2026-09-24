// หน้าสูตรอาหาร — ชิ้นส่วนหน้าจอเฉพาะหน้านี้: หมวดสูตร รายการสูตร ตารางคำนวณ batch และโหมดแก้สูตร
import { RECIPE_SECTIONS, RECIPE_UI as T } from '../shared/config.js';
import { glyph } from '../shared/ui.js';
import { workHeroHtml } from '../shared/work-ui.js';
import { recipeOut } from '../shared/calc.js';
import { gramFine, escHtml as esc, fillText } from '../shared/format.js';

// การ์ดของหมวดนั้นที่ยังเปิดใช้ (หรือทั้งหมดถ้าขอดูที่ปิดใช้ด้วย) เรียงตามลำดับ
export const cardsOf = (book, sec, withOff = false) =>
  book.list.filter(c => c.section === sec && (withOff || c.is_active) && book.recipes[c.recipe_id])
    .sort((a, b) => a.sort_order - b.sort_order || a.recipe_id.localeCompare(b.recipe_id));

// ปุ่มเล็กแบบไอคอน
const tool = (attr, icon, label, danger) => `<button class="rctool${danger ? ' rctool--off' : ''}" type="button" ${attr} aria-label="${label}" title="${label}">${glyph(icon, 16)}</button>`;

// น้ำหนักพร้อมหน่วย (เกิน 1 กก. แสดงกิโลกรัมกำกับ)
export const gramText = g => g === null || g === undefined ? '-' : `${gramFine(g)} ${T.gram}${g >= 1000 ? ` (${gramFine(g / 1000)} ${T.kg})` : ''}`;

// หน้าแรก: 6 หมวดสูตร
export function sectionsHtml(book) {
  const cards = RECIPE_SECTIONS.map(s => `
    <button class="rcsec__card" type="button" data-sec="${s.id}">
      <img src="${s.icon}" alt="" width="54" height="54" loading="lazy" decoding="async">
      <b>${s.title}</b><em>${s.sub}</em>
      <span class="rcsec__n">${fillText(T.count, { n: cardsOf(book, s.id).length })}</span>
    </button>`).join('');
  return workHeroHtml({ ...T.hero }) + `<div class="rcsec">${cards}</div>`;
}

// หน้ารายการสูตรในหมวด (เจ้าของเห็นปุ่มเพิ่ม/เลื่อน/ปิดใช้/คืนกลับ)
export function listHtml(secId, book, admin, showOff) {
  const s = RECIPE_SECTIONS.find(x => x.id === secId);
  const list = cardsOf(book, secId, admin && showOff);
  const rows = list.map(c => {
    const r = book.recipes[c.recipe_id], out = recipeOut(book, r.id);
    const tags = [r.status === 'draft' ? `<i class="rctag">${T.draft}</i>` : '', c.is_active ? '' : `<i class="rctag rctag--off">${T.archived}</i>`].join('');
    const tools = !admin ? '' : c.is_active
      ? tool(`data-move="-1:${r.id}"`, 'up', T.up) + tool(`data-move="1:${r.id}"`, 'down', T.down) + tool(`data-arc="${r.id}"`, 'trash', T.archive, true)
      : tool(`data-restore="${r.id}"`, 'check', T.restore);
    return `
      <div class="wcard rcrow${c.is_active ? '' : ' is-off'}">
        <button class="rcrow__main" type="button" data-open="${r.id}">
          <b>${esc(r.name_th)}${tags}</b>
          <em>${out ? fillText(T.base, { g: gramFine(out) }) : T.empty}</em>
        </button>
        ${tools || '<span class="mytask__go">›</span>'}
      </div>`;
  }).join('');
  const empty = `<p class="wempty">${T.none}${admin ? `<em>${T.noneAdmin}</em>` : ''}</p>`;
  const adminBar = admin ? `
    <div class="rcbar">
      <button class="wbtn wbtn--ghost" type="button" data-arcview="1">${glyph('file', 16)}<span>${showOff ? T.hideArchived : T.showArchived}</span></button>
      <button class="wbtn wbtn--go" type="button" data-add="1">${glyph('plus', 16)}<span>${T.addRecipe}</span></button>
    </div>` : '';
  return `
    <section class="wcard wsec rchead">
      <img src="${s.icon}" alt="" width="40" height="40" decoding="async">
      <span class="wsec__text"><b>${s.title}</b><em>${fillText(T.count, { n: cardsOf(book, secId).length })}</em></span>
    </section>
    ${rows || empty}${adminBar}`;
}

// รหัสสูตรย่อยทุกชั้นที่สูตรนี้เรียกใช้ (กันวนซ้ำ)
function subIds(book, id, seen = []) {
  const out = [];
  (book.lines[id] || []).forEach(l => {
    if (!l.sub_recipe_id || seen.includes(l.sub_recipe_id) || l.sub_recipe_id === id) return;
    out.push(l.sub_recipe_id, ...subIds(book, l.sub_recipe_id, [...seen, id, l.sub_recipe_id]));
  });
  return [...new Set(out)];
}

// ตารางวัตถุดิบ: แบ่งหัวข้อตามสูตรย่อย/กลุ่ม · ช่อง "มีอยู่" กรอกได้ทุกแถว
function tableHtml(res, have) {
  let head = '';
  const rows = res.rows.map(l => {
    const h = l.via ? 'v:' + l.via.key : 'g:' + (l.group || '');
    let top = '';
    if (h !== head) {
      head = h;
      top = l.via
        ? `<div class="rct__grp"><span>${esc(l.via.name)} · <b data-subneed="${l.via.key}">${fillText(T.subUse, { g: gramFine(l.via.qty * res.factor) })}</b></span><button type="button" data-open="${l.via.id}">${T.openSub} ›</button></div>`
        : (l.group ? `<div class="rct__grp"><span>${esc(l.group)}</span></div>` : '');
    }
    const err = l.error ? `<em class="rct__err">${l.error === 'cycle' ? T.cycle : T.noSub}</em>` : '';
    return top + `
      <div class="rct__row${l.excluded ? ' is-ex' : ''}${res.limitKey === l.key ? ' is-limit' : ''}" data-row="${l.key}">
        <span class="rct__name">${esc(l.name)}<em>×1 ${gramFine(l.qty)}${l.excluded ? ' · ' + T.excluded : ''}</em>${err}</span>
        <b class="rct__need" data-need="${l.key}">${gramFine(l.need)}</b>
        <span class="rct__have"><input class="wfield__in" type="number" inputmode="decimal" min="0" step="any" placeholder="-" data-have="${l.key}" value="${have[l.key] ?? ''}"${l.error ? ' disabled' : ''}><em data-left="${l.key}">${l.left === null ? '' : fillText(T.left, { g: gramFine(l.left) })}</em></span>
      </div>`;
  }).join('');
  return `
    <section class="wcard rct">
      <div class="rct__row rct__row--head"><span>${T.colName}</span><span>${T.colNeed} (${T.gram})</span><span>${T.colHave} (${T.gram})</span></div>
      ${rows}
    </section>`;
}

// ข้อความสรุปผลคำนวณ (ได้เท่าไหร่ · × กี่เท่า · อะไรหมดก่อน)
export function summaryText(res) {
  const lim = res.limitKey ? res.rows.find(r => r.key === res.limitKey) : null;
  const why = !res.given ? T.idle : lim ? fillText(T.limit, { name: esc(lim.name) }) : T.byTarget;
  return `<b>${gramText(res.output)}</b><em>${fillText(T.factor, { f: gramFine(res.factor) })} · ${why}</em>`;
}

// หน้าคำนวณสูตร 1 สูตร
export function calcHtml({ r, card, book, res, have, target, admin }) {
  const unit = Number(r.unit_size_g) > 0 ? r.unit_size_g : null;
  const chips = (card.presets || []).map(g => `<button class="rcchip${Number(target) === Number(g) ? ' is-on' : ''}" type="button" data-target="${g}">${gramFine(g)}</button>`).join('')
    + (unit ? [1, 2, 3, 4].map(n => `<button class="rcchip${Number(target) === n * unit ? ' is-on' : ''}" type="button" data-target="${n * unit}">${n} ${esc(r.unit_label || '')}</button>`).join('') : '');
  const notes = [r.description, r.usage_ratio_note, Number(r.yield_percent) && Number(r.yield_percent) !== 100 ? fillText(T.yieldNote, { p: gramFine(r.yield_percent) }) : '']
    .filter(Boolean).map(t => `<p class="rcnote">${esc(t)}</p>`).join('');
  const steps = [r.id, ...subIds(book, r.id)].filter(id => (book.steps[id] || []).length).map(id => `
    <div class="rcsteps__grp"><b>${fillText(T.stepsOf, { name: esc(book.recipes[id].name_th) })}</b>
      <ol>${book.steps[id].map(s => `<li>${esc(s.instruction)}</li>`).join('')}</ol></div>`).join('');
  const tools = admin ? `
    <div class="rcbar rcbar--3">
      <button class="wbtn wbtn--ghost" type="button" data-edit="1">${glyph('pencil', 16)}<span>${T.editBtn}</span></button>
      <button class="wbtn wbtn--ghost" type="button" data-info="1">${glyph('gear', 16)}<span>${T.infoBtn}</span></button>
      <button class="wbtn wbtn--ghost" type="button" data-steps="1">${glyph('file', 16)}<span>${T.stepsBtn}</span></button>
    </div>` : '';
  return `
    <section class="wcard rchead">
      <b class="rchead__name">${esc(r.name_th)}${r.status === 'draft' ? `<i class="rctag">${T.draft}</i>` : ''}</b>
      ${notes}
    </section>
    <section class="wcard rcctl">
      <label class="rcctl__want"><span>${T.want}</span>
        <input class="wfield__in" type="number" inputmode="decimal" min="0" step="any" placeholder="${gramFine(recipeOut(book, r.id))}" data-want="1" value="${target ?? ''}">
        <em>${T.gram}</em></label>
      ${chips ? `<div class="rcchips">${chips}</div>` : ''}
      <div class="rcout" data-out="1">${summaryText(res)}</div>
      <p class="rchow">${T.howto}</p>
      <button class="rcreset" type="button" data-reset="1">${glyph('back', 14)} ${T.reset}</button>
    </section>
    ${res.rows.length ? tableHtml(res, have) : `<p class="wempty">${T.empty}</p>`}
    <section class="wcard rcsteps"><b class="rcsteps__title">${T.steps}</b>${steps || `<p class="rcnote">${T.stepsNone}</p>`}</section>
    ${tools}`;
}

// อัปเดตตัวเลขในตารางโดยไม่วาดใหม่ทั้งหน้า (ช่องที่กำลังพิมพ์ไม่หลุด)
export function paintCalc(root, res) {
  const out = root.querySelector('[data-out]');
  if (out) out.innerHTML = summaryText(res);
  res.rows.forEach(l => {
    const k = CSS.escape(l.key);
    const need = root.querySelector(`[data-need="${k}"]`), left = root.querySelector(`[data-left="${k}"]`), row = root.querySelector(`[data-row="${k}"]`);
    if (need) need.textContent = gramFine(l.need);
    if (left) left.textContent = l.left === null ? '' : fillText(T.left, { g: gramFine(l.left) });
    if (row) row.classList.toggle('is-limit', res.limitKey === l.key);
    if (l.via) { const s = root.querySelector(`[data-subneed="${CSS.escape(l.via.key)}"]`); if (s) s.textContent = fillText(T.subUse, { g: gramFine(l.via.qty * res.factor) }); }
  });
}

// โหมดแก้วัตถุดิบ (บรรทัดของสูตรนี้ชั้นเดียว · บรรทัดสูตรย่อยแก้ได้แค่ปริมาณที่ใช้)
export function editHtml(r, draft) {
  const rows = draft.map((l, i) => `
    <div class="rce__row">
      <input class="wfield__in" data-dn="${i}" value="${esc(l.name)}" maxlength="80"${l.sub_recipe_id ? ' disabled' : ''}>
      <input class="wfield__in rce__qty" type="number" inputmode="decimal" min="0" step="any" data-dq="${i}" value="${l.qty_g ?? ''}">
      ${tool(`data-drm="${i}"`, 'trash', T.archive, true)}
      <em>${esc(l.group_name || '')}${l.sub_recipe_id ? ' · ' + T.fSub : ''}</em>
    </div>`).join('');
  return `
    <section class="wcard rchead"><b class="rchead__name">${esc(r.name_th)}</b><p class="rcnote">${T.editHint}</p></section>
    <section class="wcard rce">${rows || `<p class="rcnote">${T.empty}</p>`}
      <button class="rcreset" type="button" data-dadd="1">${glyph('plus', 14)} ${T.addLine}</button>
    </section>
    <div class="wfoot">
      <button class="wbtn wbtn--ghost" type="button" data-dcancel="1"><span>${T.cancel}</span></button>
      <button class="wbtn wbtn--go" type="button" data-dsave="1">${glyph('check', 18)}<span>${T.saveEdit}</span></button>
    </div>`;
}
