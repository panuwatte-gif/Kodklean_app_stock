// รายการงานของหน้าแบ่งงาน — วาดรายการตามหมวด และเลือกว่าใครรับผิดชอบ (รายรายการ หรือทั้งหมวด)
import { ASSIGN_UI } from '../shared/config.js';
import { glyph, toast, itemPhoto, facePile, multiPickSheet } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import * as data from '../shared/data.js';
import { currentUser } from '../shared/auth.js';
import { itemsOf, byGroup, codesOf, peopleOf, progressOf } from './assign-model.js';
import { addItem, editItem, deleteItem, moveItem, photoItem } from './assign-items.js';

const T = ASSIGN_UI;

// รายการที่ผ่านตัวกรองค้นหา/เฉพาะที่ยังไม่มีคนรับ
function filtered(store, task) {
  const q = (store.q || '').trim();
  return itemsOf(task, store).filter(i =>
    (!q || i.name.includes(q)) && (!store.onlyFree || !peopleOf(store, task.id, i).length));
}

// แถวรายการหนึ่งรายการ
function rowHtml(store, task, item, tools) {
  const people = peopleOf(store, task.id, item);
  const own = codesOf(store.assigns, task.id, 'item', item.id).length;
  return `
    <div class="asg__row${people.length ? '' : ' is-free'}">
      <button class="asg__rowMain" type="button" data-assign="item" data-id="${item.id}">
        <img class="asg__pic" src="${itemPhoto(item)}" alt="" width="40" height="40" loading="lazy" decoding="async">
        <span class="asg__rowText">
          <b>${item.name}</b>
          <em>${[item.unit, item.location].filter(Boolean).join(' · ')}${own ? '' : people.length ? ' · จากหมวด' : ''}</em>
        </span>
        ${facePile(people, T.none)}
      </button>
      ${tools ? `<span class="asg__tools">
        <button class="asg__tool" type="button" data-act="edit" data-id="${item.id}" aria-label="แก้ไข">${glyph('pencil', 15)}</button>
        <button class="asg__tool" type="button" data-act="photo" data-id="${item.id}" aria-label="รูป">${glyph('image', 15)}</button>
        <button class="asg__tool" type="button" data-act="up" data-id="${item.id}" aria-label="${T.moveUp}">${glyph('up', 15)}</button>
        <button class="asg__tool" type="button" data-act="down" data-id="${item.id}" aria-label="${T.moveDown}">${glyph('down', 15)}</button>
        <button class="asg__tool asg__tool--del" type="button" data-act="del" data-id="${item.id}" aria-label="ลบ">${glyph('trash', 15)}</button>
      </span>` : ''}
    </div>`;
}

// การ์ดหมวดหนึ่งหมวด (หัวหมวดมอบงานทั้งหมวดได้)
function groupHtml(store, task, group, tools) {
  const people = codesOf(store.assigns, task.id, 'group', group.meta.id)
    .map(c => store.staff.find(s => s.code === c)).filter(Boolean);
  return `
    <section class="asg__grp" style="--c:${group.meta.color};--t:${group.meta.tint}">
      <header class="asg__grpHead">
        <img src="${group.meta.icon}" alt="" width="26" height="26" loading="lazy" decoding="async">
        <span class="asg__grpName">${group.meta.label}<em>${group.items.length} รายการ</em></span>
        <button class="asg__grpBtn" type="button" data-assign="group" data-id="${group.meta.id}">
          <span>${T.groupAll}</span>${facePile(people, '')}
        </button>
      </header>
      ${group.items.map(i => rowHtml(store, task, i, tools)).join('')}
      ${tools && task.canEditItems ? `<button class="asg__add" type="button" data-act="add" data-id="${group.meta.id}">${glyph('plus', 16)}<span>เพิ่มรายการในหมวดนี้</span></button>` : ''}
    </section>`;
}

// กลุ่มรายการตามหมวด (ส่วนที่วาดใหม่เวลาค้นหา ไม่แตะแถบค้นหา จะไม่เสียจุดที่พิมพ์)
export function groupsHtml(store, task) {
  const rows = filtered(store, task);
  if (!rows.length) return `<p class="asg__empty">${T.empty}</p>`;
  return byGroup(rows).map(g => groupHtml(store, task, g, store.manage)).join('');
}

// หน้ารายละเอียดของงานหนึ่งงาน
export function detailHtml(store, task) {
  const p = progressOf(store, task);
  const tools = store.manage;
  return `
    <button class="asg__back" type="button" data-act="back">${glyph('back', 16)}<span>${T.back}</span></button>
    <header class="asg__head" style="--c:${task.accent};--t:${task.accent2}">
      <img src="${task.icon}" alt="" width="42" height="42" decoding="async">
      <div><h2>${task.title}</h2><p>${fillText(T.taskMeta, p)}</p></div>
    </header>
    <div class="asg__bar">
      <input class="asg__search" type="search" id="asg-q" placeholder="${T.search}" value="${store.q || ''}">
      <button class="asg__pill${store.onlyFree ? ' is-on' : ''}" type="button" data-act="free">${store.onlyFree ? T.showAll : T.onlyFree}</button>
      ${task.canEditItems ? `<button class="asg__pill${tools ? ' is-on' : ''}" type="button" data-act="tools">${tools ? T.toolsOff : T.tools}</button>` : ''}
    </div>
    <p class="asg__note">${T.groupNote}</p>
    <div id="asg-groups">${groupsHtml(store, task)}</div>`;
}

// เปิดแผงเลือกคนรับผิดชอบ แล้วบันทึกส่วนที่เปลี่ยนลงฐาน
async function pickPeople(store, task, targetType, targetId, name, reload) {
  const before = codesOf(store.assigns, task.id, targetType, targetId);
  const options = store.staff.filter(s => !s.frozen)
    .map(s => ({ value: s.code, label: s.name, image: `assets/login/avatar-${s.avatar || s.code}.webp` }));
  const picked = await multiPickSheet({
    title: fillText(targetType === 'group' ? T.pickGroupTitle : T.pickTitle, { name }),
    hint: T.pickHint, options, selected: before, okLabel: T.pickDone
  });
  if (!picked) return;
  const me = currentUser();
  const add = picked.filter(c => !before.includes(c));
  const off = before.filter(c => !picked.includes(c));
  try {
    for (const code of add) await data.setAssign({ task: task.id, targetType, targetId, staffCode: code, on: true, by: me && me.code });
    for (const code of off) await data.setAssign({ task: task.id, targetType, targetId, staffCode: code, on: false });
  } catch (err) { return toast(T.saveErr); }
  await reload();
  toast(fillText(T.saved, { name }));
}

// ปุ่มทั้งหมดในหน้ารายละเอียด
export async function onDetailClick(event, store, task, reload, redraw) {
  const hit = event.target.closest('[data-assign], [data-act]');
  if (!hit) return;
  const items = itemsOf(task, store);
  const item = hit.dataset.id ? items.find(i => i.id === hit.dataset.id) : null;

  if (hit.dataset.assign === 'group') return pickPeople(store, task, 'group', hit.dataset.id, hit.dataset.id, reload);
  if (hit.dataset.assign === 'item' && item) return pickPeople(store, task, 'item', item.id, item.name, reload);

  const act = hit.dataset.act;
  if (act === 'free') { store.onlyFree = !store.onlyFree; return redraw(); }
  if (act === 'tools') { store.manage = !store.manage; return redraw(); }
  if (act === 'add') return addItem(hit.dataset.id, store.countItems, reload);
  if (!item) return;
  if (act === 'edit') return editItem(item, reload);
  if (act === 'photo') return photoItem(item, reload);
  if (act === 'del') return deleteItem(item, reload);
  if (act === 'up') return moveItem(item, store.countItems, -1, reload);
  if (act === 'down') return moveItem(item, store.countItems, 1, reload);
}
