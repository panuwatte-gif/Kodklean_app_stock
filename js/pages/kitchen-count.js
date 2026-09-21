// หน้านับของครัวของเอมมี่และอัด — แท็บนับ (ผัก/เครื่องปรุง/ซอส/เนื้อสัตว์) + แท็บเตรียมอาหารที่ใช้ร่วมกัน
// ใช้รายการและผลนับชุดเดียวกับหน้านับสต๊อก (kk_count_item / kk_stock_count) และหน้าเตรียม-เหลือ (kk_prep_log)
import { todayIso, getCountItemsByGroup, getCountHistory, saveStockCounts, getStaff, saveCountItem } from '../shared/data.js';
import { KITCHEN_UI as T } from '../shared/config.js';
import { ktTopHtml, ktHeroHtml, ktTabsHtml, ktToolsHtml, ktTableHtml, ktQuoteHtml, ktFootHtml } from './kitchen-rows.js';
import { loadPrepDay, prepBodyHtml, savePrepCell } from './kitchen-prep.js';
import { toast, pickerSheet, handleDatePick, formSheet } from '../shared/ui.js';
import { itemActions } from './stock-form.js';
import { staffCode } from '../shared/auth.js';
import { fillText } from '../shared/format.js';

// วาดหน้านับของครัว 1 คน (pageId = emmy-count / ad-count)
export function mountKitchenPage(root, onGo, pageId) {
  const page = T.pages[pageId];
  const tabs = page.tabs.map(id => T.tabs[id]);
  const state = { tab: tabs[0].id, date: todayIso(), q: '' };
  const el = id => root.querySelector(id);
  const tabOf = () => tabs.find(t => t.id === state.tab);
  let rows = [], model = null, dirty = {}, loaded = false;
  let person = { name: page.name, avatar: page.avatar };

  // แท็บเตรียมอาหารเป็นงานร่วมของสองคน จึงขึ้นชื่อคู่
  const whoOf = () => (tabOf().kind === 'prep' ? { name: T.pairName, avatar: T.pairAvatar } : person);
  const shown = () => rows.filter(r => !state.q || r.name.includes(state.q));
  const filled = () => rows.filter(r => r.qty !== null && r.qty !== undefined && r.qty !== '').length;

  const drawFoot = () => {
    const tab = tabOf();
    const stat = tab.kind === 'prep'
      ? { done: 0, total: 0, dirty: Object.keys(dirty).length }
      : { done: filled(), total: rows.length, dirty: Object.keys(dirty).length };
    el('#k-foot').innerHTML = ktFootHtml(stat, tab.kind === 'prep' ? T.savePrep : T.save);
  };

  const drawBody = () => {
    const tab = tabOf();
    if (tab.kind === 'prep') {
      el('#k-body').innerHTML = model ? prepBodyHtml(model, state.q) : `<p class="kempty">${loaded ? T.loadError : T.loading}</p>`;
    } else {
      el('#k-body').innerHTML = ktTableHtml(shown(), tab, rows.length ? T.emptyFind : (loaded ? T.empty : T.loading));
    }
    drawFoot();
  };

  const draw = () => {
    const tab = tabOf();
    root.querySelector('.kt').style.setProperty('--a', tab.accent);
    root.querySelector('.kt').style.setProperty('--tint', tab.tint);
    el('#k-top').innerHTML = ktTopHtml(whoOf());
    el('#k-hero').innerHTML = ktHeroHtml(tab, state.date);
    el('#k-tabs').innerHTML = ktTabsHtml(tabs, state.tab);
    el('#k-tools').innerHTML = ktToolsHtml(state, tab);
    el('#k-tools').hidden = tab.kind === 'prep';
    el('#k-quote').innerHTML = ktQuoteHtml(tab);
    drawBody();
  };

  // โหลดข้อมูลของแท็บที่เปิดอยู่ ตามวันที่ที่เลือก
  const load = async () => {
    const tab = tabOf();
    try {
      if (tab.kind === 'prep') { model = await loadPrepDay(state.date); }
      else {
        const all = await getCountItemsByGroup(tab.grp);
        const items = tab.pick ? all.filter(i => i.id.startsWith(tab.pick)) : all;
        const counts = items.length ? await getCountHistory(items.map(i => i.id), state.date, state.date) : [];
        rows = items.map(i => {
          const found = counts.find(c => c.count_item_id === i.id) || {};
          return { ...i, qty: found.kitchen_qty ?? null, condo: found.condo_qty ?? null };
        });
      }
      dirty = {};
      loaded = true;
      drawBody();
    } catch {
      loaded = true;
      el('#k-body').innerHTML = `<p class="kempty">${T.loadError}</p>`;
    }
  };

  // บันทึกช่องที่กรอกใหม่ทั้งหมด (นับสต๊อก = ทับด้วยแถวใหม่ · เตรียมอาหาร = บันทึกทีละช่อง)
  const save = async () => {
    const keys = Object.keys(dirty);
    if (!keys.length) return toast(T.nothing);
    const btn = el('[data-save]');
    btn.disabled = true;
    try {
      if (tabOf().kind === 'prep') {
        for (const k of keys) await savePrepCell(dirty[k], state.date, staffCode());
        model = await loadPrepDay(state.date);
      } else {
        await saveStockCounts(keys.map(id => {
          const r = rows.find(x => x.id === id);
          return { id, kitchen: r.qty, condo: r.condo };
        }), state.date, staffCode());
      }
      dirty = {};
      toast(fillText(T.saved, { n: keys.length }));
      drawBody();
    } catch { toast(T.saveError); }
    btn.disabled = false;
  };

  // เพิ่ม/แก้/ลบ/สลับลำดับรายการ (ชุดเดียวกับหน้านับสต๊อก)
  const acts = itemActions({
    rows: () => rows,
    jobs: () => [...new Set(rows.map(r => r.responsibility).filter(Boolean))],
    reload: load
  });

  const more = async id => {
    const pick = await pickerSheet({ title: T.moreTitle, options: T.moreActions });
    if (pick === 'edit') return acts.edit(id);
    if (pick === 'remove') return acts.remove(id);
    if (pick === 'up') return acts.move(id, -1);
    if (pick === 'down') return acts.move(id, 1);
  };

  // แก้ชื่อ/เปลี่ยนรูปของรายการในตารางเตรียมอาหาร (บันทึกลง kk_count_item — ทุกหน้าที่ใช้รายการนี้เปลี่ยนตาม)
  const editPrepItem = async id => {
    const item = [...(model ? model.meatRows : []), ...(model ? model.riceRows : [])].find(r => r.id === id);
    if (!item) return;
    const form = await formSheet({
      title: T.prep.editTitle,
      fields: [
        { key: 'name', label: T.prep.fName, kind: 'text', value: item.name },
        { key: 'photo', label: T.prep.fPhoto, kind: 'select', value: item.photo || '', options: T.prep.photos }
      ]
    });
    if (!form || !form.name) return;
    try {
      await saveCountItem(id, { name: form.name, photo: form.photo || null });
      model = await loadPrepDay(state.date);
      drawBody();
      toast(fillText(T.prep.edited, { name: form.name }));
    } catch { toast(T.saveError); }
  };

  // ชื่อจริงของคนที่รับผิดชอบ (จากตาราง kk_staff)
  getStaff().then(staff => {
    const me = staff.find(s => s.code === page.owner);
    if (me) { person = { ...person, name: me.name }; el('#k-top').innerHTML = ktTopHtml(whoOf()); }
  }).catch(() => {});

  draw();
  load();

  root.addEventListener('click', async event => {
    const tab = event.target.closest('[data-tab]');
    const act = event.target.closest('[data-act]');
    const row = event.target.closest('[data-more]');
    const edit = event.target.closest('[data-edit]');
    if (edit) return editPrepItem(edit.dataset.edit);
    if (tab) { state.tab = tab.dataset.tab; state.q = ''; rows = []; model = null; dirty = {}; loaded = false; draw(); return load(); }
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
    const t = event.target;
    if (t.matches('#kt-search')) { state.q = t.value.trim(); return drawBody(); }
    if (t.matches('.kp__in')) { dirty[t.dataset.id + ':' + t.dataset.f] = t; return drawFoot(); }
    const input = t.closest('.krow__in');
    if (!input) return;
    const id = input.closest('[data-id]').dataset.id;
    const row = rows.find(r => r.id === id);
    row.qty = input.value === '' ? null : Math.max(0, Number(input.value));
    dirty[id] = true;
    drawFoot();
  });

  root.addEventListener('change', async event => {
    if (event.target.matches('#kt-date-pick') && await handleDatePick(event.target.value, state)) { draw(); load(); }
  });
}

// ประตูเข้าหน้าของแต่ละคน (app.js เรียกใช้)
export const mountEmmyCountPage = (root, onGo) => mountKitchenPage(root, onGo, 'emmy-count');
export const mountAdCountPage = (root, onGo) => mountKitchenPage(root, onGo, 'ad-count');
