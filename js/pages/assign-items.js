// จัดการรายการที่ต้องนับของหน้าแบ่งงาน — เพิ่ม แก้ ลบ สลับตำแหน่ง และใส่/ลบรูป (บันทึกลง Supabase ทันที)
import { STOCK_COUNT_UI, STOCK_COUNT_UNITS, STOCK_LOCATIONS, ASSIGN_UI, CAT_ICON_CHOICES, CAT_COLOR_PRESETS } from '../shared/config.js';
import { toast, confirmSheet, formSheet, openSheet, pickPhotoWebp, glyph, stockGroups } from '../shared/ui.js';
import { staffCode } from '../shared/auth.js';
import { fillText } from '../shared/format.js';
import * as data from '../shared/data.js';

const S = STOCK_COUNT_UI;
const T = ASSIGN_UI;

// ช่องกรอกของฟอร์มเพิ่ม/แก้รายการ
const fields = (item, grp) => [
  { key: 'name', label: S.fName, value: item ? item.name : '', placeholder: S.fNameHint },
  { key: 'grp', label: S.fGrp, kind: 'select', value: item ? item.grp : grp, options: stockGroups().map(g => ({ value: g.id, label: g.label })) },
  { key: 'unit', label: S.fUnit, kind: 'select', value: item ? item.unit : 'กก.', options: STOCK_COUNT_UNITS.map(u => ({ value: u, label: u })) },
  { key: 'location', label: S.fLoc, kind: 'select', value: item ? item.location : STOCK_LOCATIONS[0], options: STOCK_LOCATIONS.map(l => ({ value: l, label: l })) }
];

// รหัสรายการใหม่ (ภาษาอังกฤษ กันชนกับของเดิม)
const newId = () => 'item_' + Date.now().toString(36);

// เพิ่มรายการใหม่เข้าหมวดนั้น
export async function addItem(grp, items, reload) {
  const out = await formSheet({ title: S.addTitle, fields: fields(null, grp), okLabel: S.addTitle });
  if (!out) return;
  if (!String(out.name || '').trim()) return toast(S.needName);
  const last = items.filter(i => i.grp === out.grp).pop();
  const order = (last ? last.sort_order : items.length * 10) + 5;
  try {
    await data.addCountItem({ id: newId(), name: out.name.trim(), grp: out.grp, unit: out.unit, location: out.location, sort_order: order, responsibility: last ? last.responsibility || null : null });
  } catch (err) { return toast(T.saveErr); }
  await reload();
  toast(fillText(S.added, { name: out.name.trim() }));
}

// เพิ่มหมวดใหม่ลง kk_count_group (ทุกหน้าเห็นหมวดนี้) · คืนชื่อหมวด (ยกเลิก/ไม่สำเร็จ = null)
export async function addGroup(reload) {
  const out = await formSheet({ title: T.grpAddTitle, okLabel: T.grpAdd, fields: [
    { key: 'label', label: T.grpName, placeholder: T.grpNameHint },
    { key: 'icon', label: T.grpIcon, kind: 'select', value: CAT_ICON_CHOICES[0].value, options: CAT_ICON_CHOICES }
  ] });
  if (!out) return null;
  const label = String(out.label || '').trim();
  if (!label) { toast(T.grpNeedName); return null; }
  const groups = stockGroups();
  if (groups.some(g => g.id === label || g.label === label)) { toast(T.grpDup); return null; }
  const shade = CAT_COLOR_PRESETS[groups.length % CAT_COLOR_PRESETS.length];
  const last = Math.max(0, ...groups.map(g => Number(g.sort_order) || 0));
  try {
    await data.addCountGroup({ id: label, label, icon: out.icon, color: shade.color, tint: shade.tint, sort_order: last + 10, created_by: staffCode() });
  } catch (err) { toast(T.saveErr); return null; }
  await reload();
  toast(fillText(T.grpAdded, { name: label }));
  return label;
}

// แก้ชื่อ/หมวด/หน่วย/ที่เก็บของรายการ
export async function editItem(item, reload) {
  const out = await formSheet({ title: S.editTitle, fields: fields(item), okLabel: S.editTitle });
  if (!out) return;
  if (!String(out.name || '').trim()) return toast(S.needName);
  try {
    await data.saveCountItem(item.id, { name: out.name.trim(), grp: out.grp, unit: out.unit, location: out.location });
  } catch (err) { return toast(T.saveErr); }
  await reload();
  toast(fillText(S.edited2, { name: out.name.trim() }));
}

// ลบรายการ = ปิดการใช้งาน (ผลนับเก่ายังอยู่ในฐาน)
export async function deleteItem(item, reload) {
  const ok = await confirmSheet({ title: S.delAsk, text: S.delText, okLabel: S.delOk, danger: true });
  if (!ok) return;
  try { await data.removeCountItem(item.id); } catch (err) { return toast(T.saveErr); }
  await reload();
  toast(fillText(S.deleted, { name: item.name }));
}

// สลับตำแหน่งกับรายการก่อนหน้า/ถัดไปในหมวดเดียวกัน
export async function moveItem(item, items, delta, reload) {
  const same = items.filter(i => i.grp === item.grp);
  const at = same.findIndex(i => i.id === item.id);
  const other = same[at + delta];
  if (!other) return toast(S.moveEnd);
  try { await data.swapCountOrder(item, other); } catch (err) { return toast(T.saveErr); }
  await reload();
  toast(S.moved);
}

// แผงรูปของรายการ: อัปโหลดรูปใหม่ (แปลงเป็น WebP ให้เอง) หรือลบรูปออก
export async function photoItem(item, reload) {
  const picked = await openSheet(`
    <div class="ask__title">${fillText(T.photoTitle, { name: item.name })}</div>
    <div class="ask__rows">
      <button class="ask__row" type="button" data-pick="up">${glyph('image', 20)}<span>${T.photoUpload}</span></button>
      ${item.photo ? `<button class="ask__row" type="button" data-pick="clear">${glyph('trash', 20)}<span>${T.photoClear}</span></button>` : ''}
    </div>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">ปิด</button></div>`);
  if (!picked) return;
  if (picked === 'clear') {
    try { await data.clearCountPhoto(item.id); } catch (err) { return toast(T.saveErr); }
    await reload();
    return toast(T.photoCleared);
  }
  const url = await pickPhotoWebp(192);
  if (!url) return;
  try {
    const blob = await (await fetch(url)).blob();
    await data.saveCountPhoto(item.id, blob);
  } catch (err) { return toast(T.saveErr); }
  await reload();
  toast(T.photoSaved);
}
