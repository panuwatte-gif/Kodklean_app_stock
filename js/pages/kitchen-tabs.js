// แท็บของหน้านับครัว (เอมมี่ / อัด) = หมวดที่หน้าแบ่งงานมอบให้คนนั้นในงานนับสต๊อก + แท็บเตรียมอาหาร/ประเมินผล
// มอบหมวดให้ใครในหน้าแบ่งงาน → หน้าของคนนั้นขึ้นแท็บหมวดนั้นเอง · เอาออก → แท็บหายไป (ไม่ต้องแก้โค้ด)
import { KITCHEN_UI as T } from '../shared/config.js';
import { stockGroups, stockGroupOf } from '../shared/ui.js';
import { hasAssign, ownersOf } from '../shared/assign.js';
import { fillText } from '../shared/format.js';

// หน้าตาแท็บของหมวดหนึ่ง: หมวดที่ตั้งไว้ใน config ใช้ของ config · หมวดใหม่ใช้แบบกลาง + ไอคอน/สีของหมวด
function countTab(grp, page) {
  const set = Object.values(T.tabs).find(t => t.kind === 'count' && t.grp === grp);
  if (set) return set;
  const g = stockGroupOf(grp), name = g.label;
  const b = Object.fromEntries(Object.entries(T.tabBase).map(([k, v]) => [k, fillText(v, { name })]));
  return { ...b, id: 'g:' + grp, grp, icon: g.icon, accent: g.color, tint: g.tint, hero: page.hero, chibi: page.chibi };
}

// รายการทั้งหมด + งานที่มอบไว้ → แท็บของคนนี้ เรียงตามลำดับหมวด (ยังไม่เคยแบ่งงานนับเลย = ใช้แท็บสำรองของหน้า)
// มอบทั้งหมวด = เห็นทุกรายการในหมวด · มอบบางรายการ = แท็บนั้นเห็นเฉพาะรายการของตัวเอง (only)
export function kitchenTabs(page, items, assigns) {
  const fixed = page.fixed.map(id => T.tabs[id]);
  if (!hasAssign(assigns, 'count')) return page.tabs.map(id => ({ ...T.tabs[id], only: null })).concat(fixed);
  const whole = new Set(assigns.filter(a => a.task === 'count' && a.target_type === 'group' && a.staff_code === page.owner).map(a => a.target_id));
  const mine = items.filter(i => ownersOf(assigns, 'count', i).includes(page.owner));
  const order = stockGroups().map(g => g.id);
  const rank = id => (order.indexOf(id) + 1) || 999;
  const grps = [...new Set([...whole, ...mine.map(i => i.grp)])].sort((a, b) => rank(a) - rank(b));
  return grps.map(grp => ({ ...countTab(grp, page), only: whole.has(grp) ? null : mine.filter(i => i.grp === grp).map(i => i.id) })).concat(fixed);
}
