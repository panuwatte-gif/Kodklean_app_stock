// หน้านับสต๊อกเครื่องดื่มของส้ม — 4 แท็บ (เครื่องดื่ม / น้ำเชื่อม / สติ๊กเกอร์ / บรรจุภัณฑ์)
// ใช้รายการและผลนับชุดเดียวกับหน้านับสต๊อก (kk_count_item / kk_stock_count)
import { todayIso, getSomStockItems, getCountHistory, saveStockCounts, getStaff, getSomBurmese } from '../shared/data.js';
import { SOM_UI as T, WORK_UI, BURMESE_STAFF, SOM_MY_UI as MY } from '../shared/config.js';
import { mountSomTranslate } from './som-translate.js';
import { somTopHtml, somHeroHtml, somTabsHtml, somToolsHtml, somTableHtml, somFootHtml, somTagHtml } from './som-rows.js';
import { toast, pickerSheet, handleDatePick } from '../shared/ui.js';
import { itemActions } from './stock-form.js';
import { staffCode, workStaff } from '../shared/auth.js';
import { fillText } from '../shared/format.js';

// วาดหน้านับสต๊อกของส้มทั้งหน้า
export function mountSomDrinkPage(root, onGo) {
  const state = { tab: T.tabs[0].id, date: todayIso(), q: '' };
  const el = id => root.querySelector(id);
  const tabOf = () => T.tabs.find(t => t.id === state.tab) || MY.tab;
  const isMy = () => state.tab === MY.tab.id;
  let rows = [], dirty = {}, loaded = false, person = { code: workStaff(), name: '' };

  // รายการที่ตรงกับคำค้น (ค้นจากชื่อรายการ หรือชื่อพม่า)
  const shown = () => rows.filter(r => !state.q || r.name.includes(state.q) || (r.name_my && r.name_my.includes(state.q)));

  const drawTable = () => {
    el('#s-table').innerHTML = somTableHtml(shown(), tabOf(), rows.length ? T.emptyFind : (loaded ? T.empty : WORK_UI.loading));
    el('#s-foot').innerHTML = somFootHtml(rows, tabOf());
  };

  const draw = () => {
    el('#s-top').innerHTML = somTopHtml(person);
    el('#s-hero').innerHTML = somHeroHtml(tabOf());
    el('#s-tabs').innerHTML = somTabsHtml(state.tab);
    if (isMy()) return drawMy();
    el('#s-my').innerHTML = '';
    el('#s-tools').innerHTML = somToolsHtml(state, tabOf());
    drawTable();
  };

  // แท็บแปลภาษาพม่า: ซ่อนตารางนับ แล้วเปิดกล่องแปลใหม่ทุกครั้ง (ทิ้งตัวจับคลิกของรอบก่อน)
  const drawMy = () => {
    ['#s-tools', '#s-table', '#s-foot'].forEach(id => { el(id).innerHTML = ''; });
    const box = document.createElement('div');
    box.id = 's-my';
    el('#s-my').replaceWith(box);
    mountSomTranslate(box);
  };

  // โหลดรายการของแท็บนี้ + ผลนับของวันที่เลือก
  const load = async () => {
    try {
      const items = await getSomStockItems(tabOf().grp);
      // ชื่อพม่าแสดงเฉพาะเมื่อคนที่ล็อกอินอยู่ในรายชื่อ (ดูจากคนล็อกอิน ไม่ใช่หน้างานของใคร) · ไม่อยู่ = ไม่เรียกฐานเลย
      const showMy = BURMESE_STAFF.includes(staffCode());
      const ids = items.map(i => i.id);
      const [counts, my] = await Promise.all([
        items.length ? getCountHistory(ids, state.date, state.date) : [],
        showMy ? getSomBurmese(ids) : {}
      ]);
      if (isMy()) return;
      rows = items.map(i => {
        const found = counts.find(c => c.count_item_id === i.id) || {};
        const word = my[i.id] || {};
        return { ...i, qty: found.kitchen_qty ?? null, condo: found.condo_qty ?? null, name_my: word.name_my || '', unit_my: word.unit_my || '' };
      });
      dirty = {};
      loaded = true;
      drawTable();
    } catch {
      el('#s-table').innerHTML = `<p class="sempty">${WORK_UI.loadError}</p>`;
    }
  };

  // บันทึกเฉพาะรายการที่กรอกใหม่ (เพิ่มแถวใหม่ทุกครั้ง ของเก่าไม่หาย)
  const save = async () => {
    const ids = Object.keys(dirty);
    if (!ids.length) return toast(WORK_UI.nothing);
    const btn = el('[data-save]');
    btn.disabled = true;
    try {
      await saveStockCounts(ids.map(id => {
        const r = rows.find(x => x.id === id);
        return { id, kitchen: r.qty, condo: r.condo };
      }), state.date, staffCode());
      dirty = {};
      toast(fillText(T.saved, { n: ids.length }));
    } catch { toast(WORK_UI.saveError); }
    btn.disabled = false;
  };

  // เพิ่ม/แก้/ลบ/สลับลำดับรายการ (ชุดเดียวกับหน้านับสต๊อก)
  const acts = itemActions({ rows: () => rows, jobs: () => [T.job], reload: load });

  // เมนูจัดการของรายการเดียว (ปุ่ม ⋮ ท้ายแถว)
  const more = async id => {
    const pick = await pickerSheet({ title: T.moreTitle, options: T.moreActions.map(a => ({ value: a.value, label: a.label })) });
    if (pick === 'edit') return acts.edit(id);
    if (pick === 'remove') return acts.remove(id);
    if (pick === 'up') return acts.move(id, -1);
    if (pick === 'down') return acts.move(id, 1);
  };

  // ชื่อคนที่รับผิดชอบงานนี้ (มาจากตาราง kk_staff)
  getStaff().then(staff => {
    const me = staff.find(s => s.code === person.code);
    if (me) { person = { ...person, name: me.name }; el('#s-top').innerHTML = somTopHtml(person); }
  }).catch(() => {});

  draw();
  load();

  root.addEventListener('click', async event => {
    const tab = event.target.closest('[data-tab]');
    const act = event.target.closest('[data-act]');
    const row = event.target.closest('[data-more]');
    if (tab) { state.tab = tab.dataset.tab; state.q = ''; rows = []; loaded = false; draw(); return isMy() ? null : load(); }
    if (act && act.dataset.act === 'add') return acts.add();
    if (act && act.dataset.act === 'manage') {
      const pick = await pickerSheet({ title: T.manage, options: rows.map(r => ({ value: r.id, label: r.name, image: r.photo })) });
      if (pick) more(pick);
      return;
    }
    if (row) return more(row.dataset.more);
    if (event.target.closest('[data-save]')) return save();
    if (event.target.closest('[data-back]')) return onGo('staff');
  });

  root.addEventListener('input', event => {
    if (event.target.matches('#som-search')) { state.q = event.target.value.trim(); return drawTable(); }
    const input = event.target.closest('.srow__in');
    if (!input) return;
    const id = input.closest('[data-id]').dataset.id;
    const row = rows.find(r => r.id === id);
    row.qty = input.value === '' ? null : Math.max(0, Number(input.value));
    dirty[id] = true;
    input.closest('.srow').querySelector('.stag').outerHTML = somTagHtml(row.qty, tabOf());
    el('#s-foot').innerHTML = somFootHtml(rows, tabOf());
  });

  root.addEventListener('change', async event => {
    if (event.target.matches('#som-date-pick') && await handleDatePick(event.target.value, state)) { draw(); load(); }
  });
}
