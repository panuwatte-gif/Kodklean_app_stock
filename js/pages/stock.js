// หน้านับสต๊อก — ต่อรายการและผลนับกับฐานข้อมูลจริง (ชิ้นส่วนบนอยู่ที่ stock-list.js / แถวรายการที่ stock-rows.js / แผงกรอกที่ stock-form.js)
import { get, save, todayIso, getCountItems, getStockToday, getResponsibilities, saveStockCounts } from '../shared/data.js';
import { STOCK_COUNT_UI as T, STOCK_ITEM_ACTIONS, FOOD_PHOTOS } from '../shared/config.js';
import { fillGlyphs, toast, pickerSheet } from '../shared/ui.js';
import { dayLongTh, fillText } from '../shared/format.js';
import { countTotal, condoFromTotal, sumPlaces } from '../shared/calc.js';
import { currentUser, staffCode } from '../shared/auth.js';
import { whoHtml, tabsHtml, sumHtml, progressHtml, formulaHtml, filtersHtml, itemActionsHtml, catsHtml } from './stock-list.js';
import { setPhotos, photoOf, qtyHtml, resultHtml, isBothPlaces, isBadSplit, groupsHtml } from './stock-rows.js';
import { itemActions } from './stock-form.js';

// สิ่งที่ผู้ใช้เลือกอยู่บนหน้านี้ (ไม่แชร์ข้ามหน้า)
const view = { tab: 'all', grp: 'all', q: '', mine: true, left: false, mode: null, closed: {} };

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมรายการที่ต้องนับจากฐานข้อมูล
export async function mountStockPage(root) {
  fillGlyphs(root);
  const me = currentUser() || { name: '', avatar: 'ahhia' };
  const date = todayIso();
  const box = id => root.querySelector(id);
  const draft = {};        // ตัวเลขที่กรอกใหม่รอบนี้ รอกดบันทึก
  let rows = [], jobs = [], allJobs = [];

  box('#stk-head').textContent = T.title;
  box('#stk-date').textContent = dayLongTh(date);
  box('#stk-sum-head').textContent = T.sumHead;
  box('#stk-search').placeholder = T.search;
  box('#stk-save').textContent = T.save;
  box('#stk-empty').textContent = T.loading;
  box('#stk-empty').hidden = false;
  box('#stk-formula').innerHTML = formulaHtml();
  setPhotos(get('stockPhotos'));

  // กรองรายการตามตัวกรองที่เปิดอยู่
  const visible = () => rows.filter(item => {
    if (view.mine && jobs.length && !jobs.includes(item.responsibility)) return false;
    if (view.grp !== 'all' && item.grp !== view.grp) return false;
    if (view.left && countTotal(item) !== null) return false;
    if (view.tab === 'kitchen' && item.location === 'คอนโด') return false;
    if (view.tab === 'condo' && item.location === 'ครัวกลาง') return false;
    if (view.q && !item.name.toLowerCase().includes(view.q)) return false;
    return true;
  });

  // วาดทั้งหน้าใหม่
  const draw = () => {
    const list = visible();
    box('#stk-who').innerHTML = whoHtml(me, jobs);
    box('#stk-tabs').innerHTML = tabsHtml(view);
    box('#stk-sum').innerHTML = sumHtml(list);
    box('#stk-prog').innerHTML = progressHtml(list);
    box('#stk-filters').innerHTML = filtersHtml(view, jobs);
    box('#stk-tools').innerHTML = itemActionsHtml(view);
    box('#stk-cats').innerHTML = catsHtml(view, rows);
    box('#stk-groups').innerHTML = groupsHtml(list, view, draft);
    box('#stk-empty').textContent = T.empty;
    box('#stk-empty').hidden = list.length > 0;
  };

  // อัปเดตเฉพาะตัวเลขตอนกำลังกรอก (ไม่วาดใหม่ เพื่อไม่ให้แป้นพิมพ์ปิด)
  const refresh = id => {
    const item = rows.find(r => r.id === id);
    const row = box(`.stk-row[data-id="${id}"]`);
    if (row) {
      row.querySelector('.stk-row__qty').innerHTML = qtyHtml(item, view.tab, !!draft[id]);
      const res = row.querySelector('.stk-res');
      if (res) res.outerHTML = resultHtml(item);
    }
    const list = visible();
    box('#stk-sum').innerHTML = sumHtml(list);
    box('#stk-prog').innerHTML = progressHtml(list);
  };

  // โหลดรายการที่ต้องนับ + ตัวเลขของวันนี้ + งานที่แต่ละคนรับผิดชอบ
  const load = async () => {
    try {
      const [items, today, res] = await Promise.all([getCountItems(), getStockToday(), getResponsibilities()]);
      rows = items.map(item => {
        const found = today.find(t => t.id === item.id) || {};
        const row = { ...item, kitchen: found.kitchen_qty, condo: found.condo_qty, by: found.counted_by };
        row.total = sumPlaces(row);
        return row;
      });
      allJobs = [...new Set(res.map(r => r.responsibility))];
      jobs = res.filter(r => r.staff_code === staffCode()).map(r => r.responsibility);
      if (jobs.length === 0) view.mine = false;
      draw();
    } catch {
      box('#stk-empty').textContent = T.error;
      box('#stk-empty').hidden = false;
    }
  };
  await load();

  // เปลี่ยนรูปสินค้าของรายการหนึ่ง (จำไว้ในเครื่อง ไม่แตะข้อมูลในฐาน)
  const changePhoto = async id => {
    const item = rows.find(r => r.id === id);
    const chosen = await pickerSheet({ title: T.photoPick, options: FOOD_PHOTOS });
    if (!chosen) return;
    const list = get('stockPhotos').filter(p => p.id !== id).concat([{ id, photo: chosen }]);
    setPhotos(save('stockPhotos', list));
    box(`.stk-row[data-id="${id}"] .stk-row__thumb img`).src = photoOf(item);
    toast(T.photoDone);
  };

  // เพิ่ม/แก้/ลบ/สลับตำแหน่งรายการ (โค้ดอยู่ที่ stock-form.js)
  const manage = itemActions({ rows: () => rows, jobs: () => allJobs, reload: load });

  // บันทึกผลนับที่กรอกใหม่ทั้งหมด (แก้ตัวเลขเดิม = เพิ่มแถวใหม่ ของเก่าจะถูกปิดให้เอง)
  const saveAll = async () => {
    const ids = Object.keys(draft).filter(id => !isBadSplit(rows.find(r => r.id === id) || {}));
    const bad = Object.keys(draft).length - ids.length;
    if (bad) toast(fillText(T.badSkip, { n: bad }));
    if (!ids.length) return bad ? null : toast(T.nothing);
    const btn = box('#stk-save');
    btn.disabled = true;
    btn.textContent = T.saving;
    try {
      await saveStockCounts(ids.map(id => {
        const item = rows.find(r => r.id === id);
        return { id, kitchen: item.kitchen ?? null, condo: item.condo ?? null };
      }), date, staffCode());
      ids.forEach(id => {
        const item = rows.find(r => r.id === id);
        if (item) item.by = staffCode();
        delete draft[id];
      });
      draw();
      toast(fillText(T.saved, { n: ids.length }));
    } catch {
      toast(T.error);
    }
    btn.disabled = false;
    btn.textContent = T.save;
  };

  // สั่งงานกับรายการเดียวตามโหมดที่เปิดอยู่ (เลิกโหมดแล้ววาดหน้าใหม่ทันที)
  const runMode = id => {
    const mode = view.mode;
    view.mode = null;
    draw();
    if (mode === 'edit') manage.edit(id);
    else if (mode === 'delete') manage.remove(id);
  };

  root.addEventListener('click', event => {
    const hit = sel => event.target.closest(sel);
    const row = hit('.stk-row[data-id]');
    const tab = hit('[data-tab]'), grp = hit('[data-grp]'), group = hit('[data-group]');
    const filter = hit('[data-filter]'), act = hit('[data-act]'), move = hit('[data-move]');

    if (move) manage.move(row.dataset.id, move.dataset.move === 'up' ? -1 : 1);
    else if (hit('[data-photo]') && !view.mode) changePhoto(hit('[data-photo]').dataset.photo);
    else if (hit('#stk-save')) saveAll();
    else if (hit('#stk-reload')) load();
    else if (act) {
      const id = act.dataset.act;
      if (id === 'add') return manage.add();
      view.mode = view.mode === id ? null : id;
      draw();
      if (view.mode) toast(fillText(T.pickRow, { label: STOCK_ITEM_ACTIONS.find(a => a.id === id).label }));
    }
    else if (filter) {
      const id = filter.dataset.filter;
      if (id === 'clear') { view.mine = false; view.left = false; view.grp = 'all'; view.q = ''; box('#stk-search').value = ''; }
      else view[id] = !view[id];
      draw();
    }
    else if (tab) { view.tab = tab.dataset.tab; draw(); }
    else if (grp) { view.grp = grp.dataset.grp; draw(); }
    else if (group) { const k = group.dataset.group; view.closed[k] = !view.closed[k]; draw(); }
    else if (row && view.mode && view.mode !== 'sort') runMode(row.dataset.id);
  });

  // กรอกตัวเลข: เก็บไว้ในตัวร่างก่อน (ช่องว่าง = ยังไม่ได้นับ ห้ามแปลงเป็น 0)
  root.addEventListener('input', event => {
    const field = event.target.closest('[data-f]');
    if (!field) return;
    const id = field.dataset.id;
    const item = rows.find(r => r.id === id);
    item[field.dataset.f] = field.value === '' ? null : Number(field.value);
    // เก็บของสองที่: กรอกสต๊อกรวมกับครัวกลาง แล้วคิดคอนโดให้เอง
    if (isBothPlaces(item)) item.condo = condoFromTotal(item.total, item.kitchen);
    else item.total = sumPlaces(item);
    draft[id] = true;
    refresh(id);
  });

  box('#stk-search').addEventListener('input', event => {
    view.q = event.target.value.trim().toLowerCase();
    draw();
  });
}
