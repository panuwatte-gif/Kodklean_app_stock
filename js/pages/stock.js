// หน้าสต๊อก — ต่อปุ่มทุกปุ่มเข้ากับข้อมูล (การวาดอยู่ที่ stock-list.js / ฟอร์มแก้ไขที่ stock-edit.js)
import { get, save, revise } from '../shared/data.js';
import { STOCK_ACTIONS, FOOD_PHOTOS, CAT_COLOR_PRESETS, CAT_ICON_CHOICES } from '../shared/config.js';
import { fillGlyphs, bindSteppers, toast, confirmSheet, pickerSheet, formSheet } from '../shared/ui.js';
import { setLists, tabsHtml, sumHtml, actionsHtml, catsHtml, subsHtml, groupsHtml } from './stock-list.js';
import { subOptionsHtml } from './stock-edit.js';

// สิ่งที่ผู้ใช้เลือกอยู่บนหน้านี้ (ไม่แชร์ข้ามหน้า)
const view = { tab: 'all', cat: 'all', sub: null, q: '', closed: {}, edit: null, mode: null };

// กรองรายการตามหมวด/หมวดย่อย/คำค้น
function visibleItems(all) {
  return all.filter(item => {
    if (view.cat !== 'all' && item.cat !== view.cat) return false;
    if (view.sub && item.sub !== view.sub) return false;
    if (view.q && !item.name.toLowerCase().includes(view.q)) return false;
    return true;
  });
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมข้อมูลสต๊อกจากประตูข้อมูล
export function mountStockPage(root) {
  let items = get('stock');
  let cats = get('stockCats');
  let subs = get('stockSubs');
  setLists(cats, subs);

  const sum = get('stockSummary');
  fillGlyphs(root);
  bindSteppers(root);
  root.querySelector('#stk-date').textContent = sum.date;
  root.querySelector('#stk-sum').innerHTML = sumHtml(sum);

  const draw = () => {
    root.querySelector('#stk-tabs').innerHTML = tabsHtml(view);
    root.querySelector('#stk-actions').innerHTML = actionsHtml(view);
    root.querySelector('#stk-cats').innerHTML = catsHtml(view);
    root.querySelector('#stk-subs').innerHTML = subsHtml(view);
    const rows = visibleItems(items);
    root.querySelector('#stk-groups').innerHTML = groupsHtml(rows, view);
    root.querySelector('#stk-empty').hidden = rows.length > 0;
  };

  // เก็บรายการทั้งชุดลงที่เก็บ แล้ววาดใหม่
  const commit = list => { items = save('stock', list); draw(); };

  // สลับตำแหน่งรายการขึ้น/ลง
  const move = (id, step) => {
    const list = items.slice();
    const at = list.findIndex(row => row.id === id);
    const to = at + step;
    if (at < 0 || to < 0 || to >= list.length) return toast('อยู่สุดทางแล้ว');
    [list[at], list[to]] = [list[to], list[at]];
    commit(list);
  };

  // เปลี่ยนรูปสินค้าโดยเลือกจากคลังรูป (ถ้าอยู่ในฟอร์มแก้ไข จะเปลี่ยนให้เห็นก่อนกดบันทึก)
  const changePhoto = async id => {
    const picked = await pickerSheet({ title: 'เลือกรูปสินค้า', options: FOOD_PHOTOS });
    if (!picked) return;
    const form = root.querySelector(`.stk-row--edit[data-id="${id}"]`);
    if (form) {
      form.querySelector('.stk-edit__photo img').src = picked;
      form.querySelector('[data-f="photo"]').value = picked;
      return;
    }
    revise('stock', id, { photo: picked });
    items = get('stock');
    draw();
    toast('เปลี่ยนรูปแล้ว');
  };

  // ลบรายการ (ถามยืนยันก่อน)
  const removeItem = async id => {
    const item = items.find(row => row.id === id);
    const ok = await confirmSheet({ title: 'ลบรายการนี้?', text: item.name, okLabel: 'ลบ', danger: true });
    if (!ok) return;
    view.edit = null;
    commit(items.filter(row => row.id !== id));
    toast('ลบแล้ว');
  };

  // เพิ่มรายการใหม่เข้าหมวดที่กำลังดูอยู่ แล้วเปิดฟอร์มให้กรอกทันที
  const addItem = () => {
    const id = 'new-' + Date.now();
    const cat = view.cat === 'all' ? cats[0].id : view.cat;
    view.edit = id;
    view.mode = null;
    commit(items.concat([{ id, name: '', cat, sub: view.sub, unit: 'กก.', kitchen: 0, condo: 0, min: 0, photo: FOOD_PHOTOS[0].value }]));
  };

  // เพิ่มหมวดใหม่ (หมวดหลัก หรือหมวดย่อยของหมวดหลักที่เลือก)
  const addCat = async () => {
    const res = await formSheet({
      title: 'เพิ่มหมวดใหม่',
      fields: [
        { key: 'kind', label: 'ชนิดหมวด', kind: 'select', options: [{ value: 'main', label: 'หมวดหลัก' }, { value: 'sub', label: 'หมวดย่อย' }] },
        { key: 'name', label: 'ชื่อหมวด', kind: 'text', placeholder: 'เช่น ไข่' },
        { key: 'parent', label: 'ถ้าเป็นหมวดย่อย ให้อยู่ใน', kind: 'select', value: view.cat, options: cats.map(c => ({ value: c.id, label: c.label })) },
        { key: 'color', label: 'สีประจำหมวด', kind: 'swatch', options: CAT_COLOR_PRESETS.map(p => ({ value: p.color })) },
        { key: 'icon', label: 'ไอคอน', kind: 'image', options: CAT_ICON_CHOICES }
      ]
    });
    if (!res) return;
    if (!res.name) return toast('ยังไม่ได้ใส่ชื่อหมวด');
    const id = 'c' + Date.now();
    if (res.kind === 'main') {
      const preset = CAT_COLOR_PRESETS.find(p => p.color === res.color) || CAT_COLOR_PRESETS[0];
      cats = save('stockCats', cats.concat([{ id, label: res.name, icon: res.icon, color: preset.color, tint: preset.tint }]));
      view.cat = id;
      view.sub = null;
    } else {
      subs = save('stockSubs', subs.concat([{ id, label: res.name, cat: res.parent, icon: res.icon }]));
      view.cat = res.parent;
      view.sub = id;
    }
    setLists(cats, subs);
    draw();
    toast(`เพิ่มหมวด "${res.name}" แล้ว`);
  };

  // เมนู "เพิ่มเติม" ท้ายแถว
  const rowMenu = async id => {
    const picked = await pickerSheet({
      title: 'จัดการรายการ',
      options: [
        { value: 'edit', label: 'แก้ไขชื่อ/จำนวน/หมวด' },
        { value: 'photo', label: 'เปลี่ยนรูป' },
        { value: 'up', label: 'ย้ายขึ้น' },
        { value: 'down', label: 'ย้ายลง' },
        { value: 'delete', label: 'ลบรายการ' }
      ]
    });
    if (picked) runRowAction(picked, id);
  };

  // สั่งงานกับรายการเดียวตามชนิดปุ่มที่กด
  function runRowAction(kind, id) {
    if (kind === 'edit') { view.edit = id; view.mode = null; draw(); }
    else if (kind === 'photo') changePhoto(id);
    else if (kind === 'delete') removeItem(id);
    else if (kind === 'up') move(id, -1);
    else if (kind === 'down') move(id, 1);
    else if (kind === 'more') rowMenu(id);
  }

  // เก็บค่าที่กรอกในฟอร์มแก้ไขลงข้อมูล
  function saveForm(row) {
    const changes = {};
    row.querySelectorAll('[data-f]').forEach(input => {
      changes[input.dataset.f] = input.type === 'number' ? Number(input.value) : String(input.value).trim();
    });
    changes.sub = changes.sub || null;
    if (!changes.name) return toast('ยังไม่ได้ใส่ชื่อรายการ');
    revise('stock', row.dataset.id, changes);
    items = get('stock');
    view.edit = null;
    draw();
    toast('บันทึกแล้ว');
  }

  // ปุ่มแถวจัดการด้านบน: ปุ่มที่ต้องเลือกรายการก่อนจะเปิดเป็น "โหมด" ค้างไว้
  const runAction = id => {
    if (id === 'add') return addItem();
    if (id === 'addCat') return addCat();
    view.mode = view.mode === id ? null : id;
    view.edit = null;
    draw();
    if (view.mode) toast(`แตะรายการที่ต้องการ${STOCK_ACTIONS.find(a => a.id === id).label}`);
  };

  draw();

  root.addEventListener('click', event => {
    if (event.target.closest('[data-step]')) return;
    const hit = sel => event.target.closest(sel);
    const row = hit('.stk-row[data-id]');
    const tool = hit('[data-tool]'), act = hit('[data-act]');
    const tab = hit('[data-tab]'), cat = hit('[data-cat]'), sub = hit('[data-sub]'), group = hit('[data-group]');

    if (hit('[data-save]')) saveForm(row);
    else if (hit('[data-photo]')) changePhoto(row.dataset.id);
    else if (hit('[data-cancel]')) {
      const item = items.find(r => r.id === view.edit);
      view.edit = null;
      if (item && !item.name) commit(items.filter(r => r.id !== item.id)); else draw();
    }
    else if (tool) runRowAction(tool.dataset.tool, row.dataset.id);
    else if (act) runAction(act.dataset.act);
    else if (tab) { view.tab = tab.dataset.tab; draw(); }
    else if (cat) { view.cat = cat.dataset.cat; view.sub = null; draw(); }
    else if (sub) { view.sub = sub.dataset.sub || null; draw(); }
    else if (group) { const k = group.dataset.group; view.closed[k] = !view.closed[k]; draw(); }
    else if (row && view.mode) { runRowAction(view.mode, row.dataset.id); view.mode = null; }
  });

  // เปลี่ยนหมวดหลักในฟอร์ม → เปลี่ยนตัวเลือกหมวดย่อยให้ตรงกัน
  root.addEventListener('change', event => {
    if (!event.target.matches('[data-f="cat"]')) return;
    root.querySelector('#stk-sub-select').innerHTML = subOptionsHtml(subs, event.target.value, null);
  });

  root.querySelector('#stk-search').addEventListener('input', event => {
    view.q = event.target.value.trim().toLowerCase();
    draw();
  });
}
