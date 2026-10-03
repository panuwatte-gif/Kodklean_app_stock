// หน้าตาแท็บต้นทุนสินค้าของแม่พัน — สรุปจำนวน · ช่องค้นหา · ชิปหมวด · ตารางต้นทุนแยกหมวด (หมวด/ลำดับ/รูป ชุดเดียวกับหน้าสต๊อก)
import { MAEPAN_UI, WORK_UI, STOCK_GROUPS, CAT_ALL } from '../shared/config.js';
import { workNoteHtml, workStatsHtml } from '../shared/work-ui.js';
import { glyph, itemPhoto, stockGroupOf } from '../shared/ui.js';
import { fillText, escHtml } from '../shared/format.js';

const C = MAEPAN_UI.cost;

// ต้นทุนที่จะแสดงของรายการ (แก้แล้วยังไม่บันทึก > กรอกเอง > ราคา App_money) · src = manual / app / null
export function costOf(it, draft) {
  if (it.id in draft) {
    const v = draft[it.id];
    if (v === null) return { value: it.cost_app, src: it.cost_app === null ? null : 'app', dirty: true };
    return { value: v, src: 'manual', dirty: true };
  }
  return { value: it.cost, src: it.cost_source === 'manual' ? 'manual' : it.cost_source ? 'app' : null, dirty: false };
}

// รายการที่ผ่านตัวกรองหมวดและคำค้น
const visible = cs => cs.items.filter(it =>
  (cs.grp === 'all' || it.grp === cs.grp) && (!cs.q || it.name.toLowerCase().includes(cs.q)));

// ตัวเลขสรุป 3 ช่อง: กรอกเองแล้ว / ใช้ราคา App_money / ยังไม่มีต้นทุน
export function statsHtml(cs) {
  const n = { manual: 0, app: 0, none: 0 };
  cs.items.forEach(it => { const s = costOf(it, cs.draft).src; n[s === 'manual' ? 'manual' : s === 'app' ? 'app' : 'none']++; });
  return workStatsHtml([{ label: C.manual, value: n.manual }, { label: C.app, value: n.app }, { label: C.none, value: n.none }]);
}

// คลาสของช่องกรอก (เขียว = ราคา App_money · ส้มอ่อน = ยังไม่มีต้นทุน · ชมพู = แก้แล้วรอบันทึก)
export function fieldClass(c) {
  return 'mp-cost__f' + (c.dirty ? ' is-dirty' : c.src === 'app' ? ' is-app' : c.src === null ? ' is-nil' : '');
}

// บรรทัดเล็กใต้ชื่อ: ที่มาของต้นทุน + ป้ายส่งพระราม 9
export function subHtml(it, c, cs) {
  const src = c.dirty ? C.edited : c.src === 'manual' ? C.manual : c.src === 'app' ? C.app : C.none;
  return `${src}${cs.r9.has(it.id) ? ` · <b>${glyph('truck', 11)}${C.r9}</b>` : ''}`;
}

// แถวรายการ 1 แถว: รูป · ชื่อ+ที่มา · ช่องกรอกต้นทุนต่อหน่วย
function rowHtml(it, cs) {
  const c = costOf(it, cs.draft);
  return `
    <li class="mp-cost" data-cid="${it.id}">
      <img class="mp-cost__img" src="${itemPhoto(it)}" alt="" width="34" height="34" loading="lazy" decoding="async">
      <span class="mp-cost__t"><b>${escHtml(it.name)}</b><em>${subHtml(it, c, cs)}</em></span>
      <label class="${fieldClass(c)}">
        <input type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-cost="${it.id}" value="${c.value ?? ''}" aria-label="${escHtml(it.name)}">
        <i>${fillText(C.perUnit, { u: it.unit })}</i>
      </label>
    </li>`;
}

// จำนวนที่มีต้นทุนแล้วในหมวด (ใช้ทั้งตอนวาดและตอนกรอก)
export const groupCountHtml = (rows, cs) =>
  `${rows.filter(it => costOf(it, cs.draft).value !== null).length}/${rows.length} <em>${C.count}</em>`;

// ตารางทั้งหมดแยกหมวด (พับเก็บได้ เหมือนหน้าสต๊อก)
export function groupsHtml(cs) {
  const list = visible(cs);
  if (!list.length) return `<p class="mp-empty">${C.empty}</p>`;
  const groups = [];
  list.forEach(it => {
    let g = groups.find(x => x.key === it.grp);
    if (!g) { g = { key: it.grp, cat: stockGroupOf(it.grp), rows: [] }; groups.push(g); }
    g.rows.push(it);
  });
  return groups.map(g => `
    <section class="stk-group${cs.closed[g.key] ? ' is-closed' : ''}" style="--c:${g.cat.color};--t:${g.cat.tint}">
      <button class="stk-group__head" type="button" data-cgroup="${g.key}">
        <img src="${g.cat.icon}" alt="" width="20" height="20" loading="lazy" decoding="async">
        <span class="stk-group__name">${g.cat.label}</span>
        <span class="stk-group__count" data-cgcount="${g.key}">${groupCountHtml(g.rows, cs)}</span>
        <span class="stk-group__caret">${glyph('chevron', 18)}</span>
      </button>
      <ul class="stk-group__rows">${g.rows.map(it => rowHtml(it, cs)).join('')}</ul>
    </section>`).join('');
}

// ชิปหมวด (เฉพาะหมวดที่มีรายการจริง)
function catsHtml(cs) {
  const used = STOCK_GROUPS.filter(g => cs.items.some(it => it.grp === g.id));
  return [CAT_ALL].concat(used).map(c => `
    <button class="stk-chip stk-chip--sm${c.id === cs.grp ? ' is-on' : ''}" type="button" data-cgrp="${c.id}" style="--c:${c.color};--t:${c.tint}">
      <img src="${c.icon}" alt="" width="19" height="19" loading="lazy" decoding="async">${c.label}
    </button>`).join('');
}

// เนื้อหาทั้งแท็บต้นทุนสินค้า
export function costBody(cs) {
  if (cs.error) return `<p class="mp-empty">${WORK_UI.loadError}</p>`;
  if (!cs.ready) return `<p class="mp-empty">${WORK_UI.loading}</p>`;
  return `
    <section class="mp-card">
      <div class="mp-sec">
        <img src="assets/home/ic-coin.webp" alt="" width="30" height="30" loading="lazy" decoding="async">
        <span class="mp-sec__t"><b>${C.sumTitle}</b><em>${C.sumSub}</em></span>
      </div>
      <div id="mp-cost-stats">${statsHtml(cs)}</div>
    </section>
    <label class="mp-search">${glyph('search', 16)}<input id="mp-cost-q" type="search" placeholder="${C.search}" value="${escHtml(cs.q)}"></label>
    <div class="mp-cats">${catsHtml(cs)}</div>
    <div class="mp-costs" id="mp-costs">${groupsHtml(cs)}</div>
    ${workNoteHtml(C.note)}`;
}
