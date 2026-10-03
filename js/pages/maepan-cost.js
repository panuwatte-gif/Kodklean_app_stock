// แท็บต้นทุนสินค้าของแม่พัน — โหลด/บันทึกต้นทุนกลางของรายการในสต๊อก (kk_count_item.cost ผ่าน kk_view_item_cost)
// ต้นทุนชุดนี้คือชุดเดียวกับช่องต้นทุนหน้าพระราม 9 และการ์ดบนหน้าหลัก (แก้ที่ไหนก็เห็นตรงกัน)
import { getItemCosts, saveItemCosts, getR9CostLinks, getStaff } from '../shared/data.js';
import { MAEPAN_UI } from '../shared/config.js';
import { workHistorySheet } from '../shared/work-ui.js';
import { toast } from '../shared/ui.js';
import { staffCode } from '../shared/auth.js';
import { moneyFine, dayLongTh, fillText } from '../shared/format.js';
import { costOf, statsHtml, fieldClass, subHtml, groupsHtml, groupCountHtml } from './maepan-cost-view.js';

const C = MAEPAN_UI.cost;

// โหลดรายการ + ต้นทุน + รายการที่ผูกกับพระราม 9 + ชื่อพนักงาน (ใช้ในประวัติ)
export async function loadCost(cs) {
  cs.error = false;
  try {
    const [items, links, staff] = await Promise.all([getItemCosts(), getR9CostLinks().catch(() => []), getStaff().catch(() => [])]);
    cs.items = items;
    cs.r9 = new Set(links.map(l => l.count_item_id));
    cs.staff = staff;
    cs.draft = {};
    cs.ready = true;
  } catch { cs.error = true; cs.ready = true; }
}

// กดบันทึก = ส่งเฉพาะรายการที่แก้ ขึ้นฐานทีเดียว (คืน true = ต้องโหลดใหม่)
export async function saveCost(cs) {
  const ids = Object.keys(cs.draft);
  if (!ids.length) { toast(C.nothing); return false; }
  if (ids.some(id => cs.draft[id] !== null && !(cs.draft[id] >= 0))) { toast(C.bad); return false; }
  try {
    await saveItemCosts(ids.map(id => ({ id, cost: cs.draft[id] })), staffCode());
    toast(fillText(C.saved, { n: ids.length }));
    return true;
  } catch { toast(C.saveError); return false; }
}

// วันที่ไทยของเวลาที่แก้ (เวลาในฐานเป็นสากล บวก 7 ชม. ให้เป็นวันของไทย)
const bkkDay = ts => new Date(new Date(ts).getTime() + 7 * 3600e3).toISOString().slice(0, 10);

// แผงประวัติ: 15 รายการที่แก้ต้นทุนล่าสุด ใครแก้ เมื่อไหร่
export function costHistory(cs) {
  const nameOf = code => (cs.staff.find(s => s.code === code) || {}).name || code || '';
  const rows = cs.items.filter(it => it.cost_updated_at)
    .sort((a, b) => String(b.cost_updated_at).localeCompare(String(a.cost_updated_at))).slice(0, 15)
    .map(it => ({
      label: it.name,
      sub: [dayLongTh(bkkDay(it.cost_updated_at)), nameOf(it.cost_updated_by)].filter(Boolean).join(' · '),
      value: it.cost_manual === null ? C.cleared : `${moneyFine(it.cost_manual)} ${fillText(C.perUnit, { u: it.unit })}`
    }));
  workHistorySheet({ title: C.histTitle, rows });
}

// กดในแท็บนี้: พับหมวด / เลือกชิปหมวด (คืน true = จัดการแล้ว)
export function costClick(event, ctx) {
  const { cs, draw } = ctx;
  const head = event.target.closest('[data-cgroup]');
  if (head) {
    const k = head.dataset.cgroup;
    cs.closed[k] = !cs.closed[k];
    head.closest('.stk-group').classList.toggle('is-closed', cs.closed[k]);
    return true;
  }
  const chip = event.target.closest('[data-cgrp]');
  if (chip) { cs.grp = chip.dataset.cgrp; draw(); return true; }
  return false;
}

// พิมพ์ในแท็บนี้: ค้นหา = วาดตารางใหม่เฉพาะส่วนตาราง · กรอกต้นทุน = เก็บลงร่าง อัปเดตเฉพาะแถวนั้น (แป้นพิมพ์ไม่ปิด)
export function costInput(event, ctx) {
  const { cs, root } = ctx;
  const elm = event.target;
  if (elm.matches('#mp-cost-q')) {
    cs.q = elm.value.trim().toLowerCase();
    root.querySelector('#mp-costs').innerHTML = groupsHtml(cs);
    return true;
  }
  if (!elm.matches('[data-cost]')) return false;
  const it = cs.items.find(x => x.id === elm.dataset.cost);
  const v = elm.value === '' ? null : Number(elm.value);
  if (v === it.cost_manual) delete cs.draft[it.id]; else cs.draft[it.id] = v;
  const c = costOf(it, cs.draft);
  const row = elm.closest('.mp-cost');
  row.querySelector('label').className = fieldClass(c);
  row.querySelector('.mp-cost__t em').innerHTML = subHtml(it, c, cs);
  root.querySelector('#mp-cost-stats').innerHTML = statsHtml(cs);
  const cnt = root.querySelector(`[data-cgcount="${CSS.escape(it.grp)}"]`);
  if (cnt) cnt.innerHTML = groupCountHtml(cs.items.filter(x => x.grp === it.grp && (!cs.q || x.name.toLowerCase().includes(cs.q))), cs);
  return true;
}
