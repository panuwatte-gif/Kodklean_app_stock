// จัดการรายการที่ต้องนับจากในแอป: แผงกรอก + เพิ่ม/แก้/ลบ/สลับตำแหน่ง (ใช้เฉพาะหน้านับสต๊อก)
import { STOCK_GROUPS, STOCK_LOCATIONS, STOCK_COUNT_UNITS, STOCK_COUNT_UI as T } from '../shared/config.js';
import { addCountItem, saveCountItem, removeCountItem, swapCountOrder } from '../shared/data.js';
import { formSheet, confirmSheet, toast } from '../shared/ui.js';
import { fillText } from '../shared/format.js';

// แปลงรายชื่อธรรมดาเป็นตัวเลือกของช่องเลือก
const opts = list => list.map(v => ({ value: v, label: v }));

// เปิดแผงกรอก แล้วคืนค่าที่กรอก (null = ยกเลิก) — item ว่าง = เพิ่มรายการใหม่
function itemSheet(item, jobs) {
  const row = item || {};
  return formSheet({
    title: item ? T.editTitle : T.addTitle,
    fields: [
      { key: 'name', label: T.fName, kind: 'text', value: row.name, placeholder: T.fNameHint },
      { key: 'grp', label: T.fGrp, kind: 'select', value: row.grp || STOCK_GROUPS[0].id, options: STOCK_GROUPS.map(g => ({ value: g.id, label: g.label })) },
      { key: 'unit', label: T.fUnit, kind: 'select', value: row.unit || STOCK_COUNT_UNITS[0], options: opts(STOCK_COUNT_UNITS) },
      { key: 'location', label: T.fLoc, kind: 'select', value: row.location || STOCK_LOCATIONS[0], options: opts(STOCK_LOCATIONS) },
      { key: 'responsibility', label: T.fJob, kind: 'select', value: row.responsibility || jobs[0], options: opts(jobs) }
    ]
  });
}

// ตั้งรหัสและเลขลำดับให้รายการใหม่ (ต่อท้ายหมวดที่เลือก)
function newItemRow(form, rows) {
  const inGroup = rows.filter(r => r.grp === form.grp).map(r => Number(r.sort_order) || 0);
  return { ...form, id: 'item_' + Date.now(), sort_order: (inGroup.length ? Math.max(...inGroup) : 0) + 1 };
}

// ชุดคำสั่งจัดการรายการ (rows = ฟังก์ชันขอรายการล่าสุด, reload = โหลดใหม่หลังแก้)
export function itemActions({ rows, jobs, reload }) {
  const at = id => rows().find(r => r.id === id);

  // เพิ่มรายการใหม่เข้าฐาน
  const add = async () => {
    const form = await itemSheet(null, jobs());
    if (!form) return;
    if (!form.name) return toast(T.needName);
    await addCountItem(newItemRow(form, rows()));
    await reload();
    toast(fillText(T.added, { name: form.name }));
  };

  // แก้ชื่อ/หมวด/หน่วย/ที่เก็บ/งานของรายการเดียว
  const edit = async id => {
    const form = await itemSheet(at(id), jobs());
    if (!form) return;
    if (!form.name) return toast(T.needName);
    await saveCountItem(id, form);
    await reload();
    toast(fillText(T.edited2, { name: form.name }));
  };

  // ลบรายการทิ้ง = ปิดการใช้งาน (ผลนับเก่ายังอยู่ในฐาน)
  const remove = async id => {
    const item = at(id);
    if (!await confirmSheet({ title: T.delAsk, text: item.name + ' — ' + T.delText, okLabel: T.delOk, danger: true })) return;
    await removeCountItem(id);
    await reload();
    toast(fillText(T.deleted, { name: item.name }));
  };

  // สลับตำแหน่งขึ้น/ลง กับรายการที่อยู่ติดกันในหมวดเดียวกัน
  const move = async (id, step) => {
    const item = at(id);
    const mates = rows().filter(r => r.grp === item.grp);
    const next = mates[mates.indexOf(item) + step];
    if (!next) return toast(T.moveEnd);
    await swapCountOrder(item, next);
    await reload();
    toast(T.moved);
  };

  return { add, edit, remove, move };
}
