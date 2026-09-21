// แปลงข้อมูลดิบของหน้าแบ่งงาน → รายการที่จะแสดง และคนที่รับผิดชอบแต่ละรายการ
// กติกา "ใครรับผิดชอบอะไร" อยู่ที่ js/shared/assign.js ไฟล์เดียว (หน้าอื่นใช้ชุดเดียวกัน)
import { STOCK_GROUPS, ASSIGN_PREP_GROUPS, ASSIGN_MENU_GROUP, MENU_PHOTOS } from '../shared/config.js';
import { codesOf as codesIn, ownersOf } from '../shared/assign.js';

// รายการของงานนั้น (count = ทุกรายการนับสต๊อก · prep = เนื้อสัตว์+ข้าว · cooked = เมนูอาหาร)
export function itemsOf(task, store) {
  if (task.source === 'menu') return (store.menus || []).map(m => ({
    id: m.id, name: m.name, grp: ASSIGN_MENU_GROUP.id, unit: 'กรัม', location: '', photo: MENU_PHOTOS[m.id] || ASSIGN_MENU_GROUP.icon
  }));
  const items = store.countItems || [];
  if (task.source === 'prep') return items.filter(i => ASSIGN_PREP_GROUPS.includes(i.grp));
  return items;
}

// ข้อมูลหมวดของรายการ (ไอคอน/สี) — เมนูอาหารใช้หมวดเดียว
export function groupMeta(id) {
  return STOCK_GROUPS.find(g => g.id === id) || (id === ASSIGN_MENU_GROUP.id ? ASSIGN_MENU_GROUP : { id, label: id, icon: 'assets/cats/veg.webp', color: '#7C8A9B', tint: '#EEF3F8' });
}

// จัดรายการเข้าหมวด เรียงตามลำดับหมวดที่ตั้งไว้
export function byGroup(items) {
  const order = [...STOCK_GROUPS.map(g => g.id), ASSIGN_MENU_GROUP.id];
  const map = new Map();
  items.forEach(i => { if (!map.has(i.grp)) map.set(i.grp, []); map.get(i.grp).push(i); });
  return [...map.keys()]
    .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
    .map(id => ({ meta: groupMeta(id), items: map.get(id) }));
}

// รหัสพนักงานที่ถูกมอบหมายไว้ตรงๆ ของเป้าหมายหนึ่ง
export function codesOf(assigns, task, targetType, targetId) {
  return codesIn(assigns, task, targetType, targetId);
}

// คนที่รับผิดชอบรายการนี้จริง = คนของรายการ + คนที่ถูกมอบทั้งหมวด
export function peopleOf(store, task, item) {
  return ownersOf(store.assigns, task, item)
    .map(c => store.staff.find(s => s.code === c)).filter(Boolean);
}

// จำนวนรายการที่มีคนรับผิดชอบแล้ว จากทั้งหมด
export function progressOf(store, task) {
  const items = itemsOf(task, store);
  const done = items.filter(i => peopleOf(store, task.id, i).length).length;
  return { done, all: items.length };
}
