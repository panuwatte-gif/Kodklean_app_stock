// หน้าแบ่งงาน — การ์ดงาน 3 ใบ (นับสต๊อก · เตรียมอาหาร · อาหารปรุงสำเร็จคงเหลือ) เห็นเฉพาะอาเฮียกับแม่พัน
import { ASSIGN_UI, ASSIGN_TASKS } from '../shared/config.js';
import { glyph, facePile } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import { currentUser } from '../shared/auth.js';
import * as data from '../shared/data.js';
import { progressOf, itemsOf, peopleOf } from './assign-model.js';
import { detailHtml, groupsHtml, onDetailClick } from './assign-list.js';

const T = ASSIGN_UI;
const OWNERS = ['1001', '1004'];   // รหัสล็อกอินของอาเฮียและแม่พัน
let store = null;

// คนที่มีงานในงานนั้นอย่างน้อย 1 รายการ (เอาไปโชว์หน้าการ์ด)
function peopleInTask(task) {
  const codes = new Set();
  itemsOf(task, store).forEach(i => peopleOf(store, task.id, i).forEach(p => codes.add(p.code)));
  return [...codes].map(c => store.staff.find(s => s.code === c)).filter(Boolean);
}

// การ์ดงาน 1 ใบ
function taskCard(task) {
  const p = progressOf(store, task);
  const pct = p.all ? Math.round((p.done / p.all) * 100) : 0;
  return `
    <button class="asg__card" type="button" data-task="${task.id}" style="--c:${task.accent};--t:${task.accent2}">
      <img class="asg__cardIcon" src="${task.icon}" alt="" width="46" height="46" decoding="async">
      <span class="asg__cardText">
        <b>${task.title}</b>
        <em>${task.sub}</em>
        <i class="asg__meta">${fillText(T.taskMeta, p)}</i>
        <i class="asg__track"><u style="width:${pct}%"></u></i>
      </span>
      <span class="asg__cardSide">${facePile(peopleInTask(task), T.none)}${glyph('chevron', 18)}</span>
    </button>`;
}

// หน้ารวมการ์ดงาน
function drawTasks(root) {
  store.taskId = null;
  root.querySelector('#asg-count').textContent = fillText(T.count, { n: ASSIGN_TASKS.length });
  root.querySelector('#asg-body').innerHTML = `<div class="asg__cards">${ASSIGN_TASKS.map(taskCard).join('')}</div>`;
}

// หน้ารายละเอียดของงานที่เลือก
function drawDetail(root) {
  const task = ASSIGN_TASKS.find(t => t.id === store.taskId);
  if (!task) return drawTasks(root);
  root.querySelector('#asg-count').textContent = fillText(T.taskMeta, progressOf(store, task));
  root.querySelector('#asg-body').innerHTML = detailHtml(store, task);
}

// วาดเฉพาะรายการใหม่ตอนค้นหา (ช่องค้นหาไม่เสียจุดที่พิมพ์)
function drawGroups(root) {
  const task = ASSIGN_TASKS.find(t => t.id === store.taskId);
  const host = root.querySelector('#asg-groups');
  if (task && host) host.innerHTML = groupsHtml(store, task);
}

// วาดหน้าตามสถานะปัจจุบัน
const draw = root => (store.taskId ? drawDetail(root) : drawTasks(root));

// โหลดข้อมูลทั้งหน้าจากฐานในครั้งเดียว
async function load(root) {
  try {
    const [staff, assigns, countItems, menus] = await Promise.all([
      data.getStaff(), data.getAssigns(), data.getCountItems(), data.getMenus()
    ]);
    store.staff = (staff || []).filter(s => !s.frozen).concat((staff || []).filter(s => s.frozen));
    store.assigns = assigns || [];
    store.countItems = countItems || [];
    store.menus = menus || [];
    draw(root);
  } catch (err) {
    root.querySelector('#asg-body').innerHTML = `<p class="asg__empty">${T.error}</p>`;
  }
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมการ์ดงานและรายการ
export function mountAssignPage(root) {
  const me = currentUser();
  root.querySelector('#asg-title').textContent = T.title;
  root.querySelector('#asg-sub').textContent = T.sub;

  if (!me || !OWNERS.includes(me.code)) {
    root.querySelector('#asg-body').innerHTML = `<p class="asg__empty">${T.deny}</p>`;
    return;
  }

  store = { staff: [], assigns: [], countItems: [], menus: [], taskId: null, q: '', onlyFree: false, manage: false };
  root.querySelector('#asg-body').innerHTML = `<p class="asg__empty">${T.loading}</p>`;

  root.addEventListener('input', event => {
    if (event.target.id !== 'asg-q') return;
    store.q = event.target.value;
    drawGroups(root);
  });

  root.addEventListener('click', async event => {
    const card = event.target.closest('[data-task]');
    if (card) { store.taskId = card.dataset.task; store.q = ''; store.onlyFree = false; store.manage = false; return draw(root); }
    if (event.target.closest('[data-act="back"]')) { store.taskId = null; return draw(root); }
    const task = ASSIGN_TASKS.find(t => t.id === store.taskId);
    if (task) await onDetailClick(event, store, task, () => load(root), () => drawDetail(root));
  });

  load(root);
}
