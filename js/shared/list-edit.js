// แผงจัดการรายการที่ใช้ร่วมกันหลายหน้า — วัตถุดิบ (kk_count_item) และเมนู (kk_menu): เพิ่ม แก้ชื่อ รูป สลับ ลบ
import { LIST_EDIT_UI as T, STOCK_COUNT_UNITS } from './config.js';
import { openSheet, formSheet, confirmSheet, toast, glyph, pickPhotoWebp, itemPhoto, menuPhoto } from './ui.js';
import { fillText } from './format.js';
import * as data from './data.js';

// ดึงรายการล่าสุดจากฐาน (วัตถุดิบกรองตามหมวด · เมนูทั้งหมด)
async function fetchRows(kind, grp) {
  if (kind === 'menu') return data.getMenus();
  return (await data.getPrepItems()).filter(i => i.grp === grp);
}

// ปุ่มไอคอนเล็กในแถว
const tool = (act, id, name, danger) =>
  `<button type="button" data-pick="${act}:${id}" aria-label="${act}" style="width:36px;height:36px;flex:none;border:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${danger ? '#FDECEA' : '#F3EDE3'};color:${danger ? '#D4322A' : '#5E5343'};cursor:pointer">${glyph(name, 17)}</button>`;

// หน้าตาแผงรายการทั้งหมด
function listHtml(kind, rows) {
  const photo = r => kind === 'menu' ? menuPhoto(r) : itemPhoto(r);
  const body = rows.map(r => `
    <div style="display:flex;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid #EDE2D0">
      <button type="button" data-pick="photo:${r.id}" aria-label="รูป" style="width:44px;height:44px;flex:none;border:0;padding:0;border-radius:12px;overflow:hidden;background:#FDF3E3;cursor:pointer">
        <img src="${photo(r)}" alt="" width="44" height="44" style="width:100%;height:100%;object-fit:cover">
      </button>
      <span style="flex:1;min-width:0;font-size:14px;line-height:1.3;color:#3A3128;overflow-wrap:anywhere">${r.name}</span>
      ${tool('edit', r.id, 'pencil')}${tool('up', r.id, 'up')}${tool('down', r.id, 'down')}${tool('del', r.id, 'trash', true)}
    </div>`).join('');
  return `
    <div class="ask__title">${kind === 'menu' ? T.titleMenu : T.titleItem}</div>
    <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#8A7D6B">${T.hint}</p>
    <div style="max-height:52vh;overflow-y:auto">${body}</div>
    <div class="ask__go">
      <button class="ask__btn ask__btn--off" type="button" data-pick="close">${T.close}</button>
      <button class="ask__btn" type="button" data-pick="add">${glyph('plus', 16)} ${kind === 'menu' ? T.addMenu : T.addItem}</button>
    </div>`;
}

// ช่องกรอกของฟอร์มเพิ่ม/แก้ (เมนูเลือกวัตถุดิบหลักได้ · วัตถุดิบเลือกหน่วยได้)
async function fieldsOf(kind, row) {
  const f = [{ key: 'name', label: T.fName, value: row ? row.name : '', placeholder: T.fNameHint }];
  if (kind === 'menu') {
    const meat = (await data.getPrepItems()).filter(i => i.grp === 'เนื้อสัตว์');
    f.push({ key: 'protein', label: T.fProtein, kind: 'select', value: row ? row.protein_item_id || '' : '',
      options: [{ value: '', label: T.noProtein }].concat(meat.map(i => ({ value: i.id, label: i.name }))) });
  } else {
    f.push({ key: 'unit', label: T.fUnit, kind: 'select', value: row ? row.unit : 'กก.', options: STOCK_COUNT_UNITS.map(u => ({ value: u, label: u })) });
  }
  return f;
}

// เพิ่มรายการใหม่ต่อท้าย
async function addRow(kind, grp, rows) {
  const out = await formSheet({ title: kind === 'menu' ? T.addMenu : T.addItem, fields: await fieldsOf(kind), okLabel: T.close });
  if (!out) return;
  const name = String(out.name || '').trim();
  if (!name) return toast(T.needName);
  const order = rows.reduce((n, r) => Math.max(n, Number(r.sort_order) || 0), 0) + 1;
  const id = (kind === 'menu' ? 'menu_' : 'item_') + Date.now().toString(36);
  if (kind === 'menu') await data.addMenu({ id, name, protein_item_id: out.protein || null, sort_order: order });
  else await data.addCountItem({ id, name, grp, unit: out.unit, responsibility: 'บันทึกเตรียมอาหาร', sort_order: order });
  toast(T.saved);
}

// แก้ชื่อ (และหน่วย/วัตถุดิบหลัก)
async function editRow(kind, row) {
  const out = await formSheet({ title: T.editTitle, fields: await fieldsOf(kind, row), okLabel: T.editTitle });
  if (!out) return;
  const name = String(out.name || '').trim();
  if (!name) return toast(T.needName);
  if (kind === 'menu') await data.saveMenuSetting(row.id, { name, protein_item_id: out.protein || null });
  else await data.saveCountItem(row.id, { name, unit: out.unit });
  toast(T.saved);
}

// เปลี่ยนรูป (แปลงเป็น WebP ให้อัตโนมัติ) หรือลบรูป
async function photoRow(kind, row) {
  const pick = await openSheet(`
    <div class="ask__title">${fillText(T.photoTitle, { name: row.name })}</div>
    <div class="ask__rows">
      <button class="ask__row" type="button" data-pick="up">${glyph('image', 20)}<span>${T.photoUpload}</span></button>
      ${row.photo ? `<button class="ask__row" type="button" data-pick="clear">${glyph('trash', 20)}<span>${T.photoClear}</span></button>` : ''}
    </div>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">ปิด</button></div>`);
  if (!pick) return;
  if (pick === 'clear') {
    await (kind === 'menu' ? data.clearMenuPhoto(row.id) : data.clearCountPhoto(row.id));
    return toast(T.saved);
  }
  const url = await pickPhotoWebp(192);
  if (!url) return;
  if (kind === 'menu') await data.saveMenuPhoto(row.id, url);
  else await data.saveCountPhoto(row.id, await (await fetch(url)).blob());
  toast(T.saved);
}

// สลับลำดับกับรายการข้างเคียง
async function moveRow(kind, rows, row, step) {
  const other = rows[rows.indexOf(row) + step];
  if (!other) return toast(T.moveEnd);
  await (kind === 'menu' ? data.swapMenuOrder(row, other) : data.swapCountOrder(row, other));
}

// ลบรายการ (ปิดการใช้งาน ประวัติเก่ายังอยู่)
async function deleteRow(kind, row) {
  if (!await confirmSheet({ title: fillText(T.delAsk, { name: row.name }), text: T.delText, okLabel: T.delOk, danger: true })) return;
  await (kind === 'menu' ? data.removeMenu(row.id) : data.removeCountItem(row.id));
  toast(T.saved);
}

// เปิดแผงจัดการ (kind = 'item' | 'menu', grp = หมวดวัตถุดิบ) — ปิดแผงแล้วเรียก onDone ให้หน้าโหลดใหม่
export async function manageList({ kind, grp, onDone }) {
  let changed = false;
  for (;;) {
    let rows;
    try { rows = await fetchRows(kind, grp); } catch { toast(T.saveErr); break; }
    const pick = await openSheet(listHtml(kind, rows));
    if (!pick || pick === 'close') break;
    const [act, id] = pick.split(':');
    const row = rows.find(r => r.id === id);
    try {
      if (act === 'add') await addRow(kind, grp, rows);
      else if (act === 'edit') await editRow(kind, row);
      else if (act === 'photo') await photoRow(kind, row);
      else if (act === 'up' || act === 'down') await moveRow(kind, rows, row, act === 'up' ? -1 : 1);
      else if (act === 'del') await deleteRow(kind, row);
      changed = true;
    } catch { toast(T.saveErr); }
  }
  if (changed && onDone) onDone();
}

// ปุ่ม "จัดการรายการ" สำหรับวางบนหน้า (data-manage = ชนิด · data-grp = หมวด)
export const manageBtnHtml = (kind, grp = '') =>
  `<div style="display:flex;justify-content:flex-end;margin:0 0 8px"><button type="button" data-manage="${kind}" data-grp="${grp}" style="display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 16px;border:1.5px solid #EDE2D0;border-radius:999px;background:#fff;color:#5E5343;font:500 13px Mitr,sans-serif;cursor:pointer">${glyph('pencil', 15)}${T.btn}</button></div>`;
