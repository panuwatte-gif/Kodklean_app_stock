// แท็บ "แปลภาษาพม่า" ในหน้างานของส้ม — ส่วนนับสต๊อก (kk_word_my) + ส่วนแปลแอป (kk_app_word_my)
// พิมพ์เสร็จแล้วแตะที่อื่น = บันทึกคำนั้นลงฐานทันที (ไม่ต้องกดปุ่มบันทึก)
import { getWordMyAll, saveWordMy, removeWordMy, getCountItemsBrief, getAppWordMy, saveAppWordMy } from '../shared/data.js';
import { SOM_MY_UI as M, MY_APP_CATS, WORK_UI } from '../shared/config.js';
import { myHeadHtml, myToolsHtml, myProgressHtml, myStockHtml, myCatsHtml, myAppHtml } from './som-translate-view.js';
import { toast, pickerSheet, formSheet, confirmSheet, itemPhoto } from '../shared/ui.js';
import { staffCode } from '../shared/auth.js';
import { appThaiList, reloadMy } from '../shared/i18n.js';

// ช่องทั้งหมดของ kk_word_my ที่ต้องส่งตอนบันทึก
const WORD_COLS = ['id', 'th_name', 'name_my', 'unit_th', 'unit_my', 'cat_th', 'cat_my', 'count_item_id', 'source', 'updated_by'];

// วาดแท็บแปลภาษาพม่าลงกล่องที่ส่งมา
export function mountSomTranslate(box) {
  const state = { section: 'stock', q: '', todo: false, cat: MY_APP_CATS[0].id };
  let words = [], items = [], appList = appThaiList(), appMy = {}, loaded = false;
  box.innerHTML = `<div class="mwrap"><div id="my-head"></div><div id="my-tools"></div><div id="my-prog"></div><div id="my-list"><p class="sempty">${WORK_UI.loading}</p></div></div>`;
  const el = id => box.querySelector(id);
  const itemName = id => (items.find(i => i.id === id) || {}).name || '';
  const hit = (...texts) => !state.q || texts.some(t => t && String(t).includes(state.q));

  // คำนับสต๊อกที่ตรงกับคำค้น/ตัวกรอง
  const stockShown = () => words.filter(w => (!state.todo || !w.name_my) && hit(w.th_name, w.name_my, w.cat_th));
  // ข้อความแอปของหมวดที่เลือกที่ตรงกับคำค้น/ตัวกรอง
  const appShown = () => appList.map((r, i) => ({ ...r, i, my: appMy[r.th] || '' }))
    .filter(r => r.cat === state.cat && (!state.todo || !r.my) && hit(r.th, r.my));
  // นับว่าแต่ละหมวดแปลไปแล้วกี่ข้อความ
  const appCounts = () => appList.reduce((o, r) => { const c = o[r.cat] = o[r.cat] || { done: 0, all: 0 }; c.all++; if (appMy[r.th]) c.done++; return o; }, {});

  const drawList = () => {
    const empty = state.q ? M.emptyFind : (loaded ? M.empty : WORK_UI.loading);
    if (state.section === 'stock') {
      el('#my-prog').innerHTML = myProgressHtml(words.filter(w => w.name_my).length, words.length);
      el('#my-list').innerHTML = myStockHtml(stockShown(), itemName, empty);
    } else {
      const counts = appCounts(), n = counts[state.cat] || { done: 0, all: 0 };
      el('#my-prog').innerHTML = myCatsHtml(state.cat, counts) + myProgressHtml(n.done, n.all);
      el('#my-list').innerHTML = myAppHtml(appShown(), empty);
    }
  };
  const draw = () => {
    el('#my-head').innerHTML = myHeadHtml(state);
    el('#my-tools').innerHTML = myToolsHtml(state, state.section === 'stock');
    drawList();
  };

  // โหลดคำพม่าทั้งสองตาราง + รายการนับ (ใช้ผูกคำ)
  const load = async () => {
    try {
      const [w, it, app] = await Promise.all([getWordMyAll(), getCountItemsBrief(), getAppWordMy()]);
      words = w || []; items = it || [];
      appMy = {}; (app || []).forEach(r => { if (r.my) appMy[r.th] = r.my; });
      loaded = true;
      drawList();
    } catch { el('#my-list').innerHTML = `<p class="sempty">${WORK_UI.loadError}</p>`; }
  };

  // บันทึกคำนับสต๊อก 1 คำ (ส่งครบทุกช่อง)
  const saveWord = async w => {
    const row = {};
    WORD_COLS.forEach(k => { row[k] = w[k] ?? null; });
    row.name_my = w.name_my || '';
    row.updated_by = staffCode() || null;
    await saveWordMy([row]);
  };

  // เพิ่มคำใหม่: เลือกรายการนับที่ยังไม่มีคำพม่า หรือพิมพ์คำใหม่เอง
  const addWord = async () => {
    const used = new Set(words.map(w => w.count_item_id).filter(Boolean));
    const free = items.filter(i => !used.has(i.id));
    const pick = await pickerSheet({ title: M.addTitle, options: [{ value: '__free', label: M.addFree }, ...free.map(i => ({ value: i.id, label: `${i.name} · ${i.grp}`, image: itemPhoto(i) }))] });
    if (!pick) return;
    let row;
    if (pick === '__free') {
      const f = await formSheet({ title: M.addForm.title, okLabel: M.addForm.ok, fields: [{ key: 'th', label: M.addForm.th }, { key: 'unit', label: M.addForm.unit }, { key: 'cat', label: M.addForm.cat }] });
      if (!f || !f.th) return;
      row = { th_name: f.th, unit_th: f.unit || null, cat_th: f.cat || null, count_item_id: null };
    } else {
      const it = items.find(i => i.id === pick);
      row = { th_name: it.name, unit_th: it.unit || null, cat_th: it.grp || null, count_item_id: it.id };
    }
    row = { ...row, id: 'w' + Date.now().toString(36), name_my: '', unit_my: null, cat_my: null, source: 'app' };
    try { await saveWord(row); words.push(row); state.q = ''; draw(); toast(M.added); } catch { toast(WORK_UI.saveError); }
  };

  // เมนู ⋮ ของคำนับสต๊อก: ผูก/เลิกผูกรายการนับ หรือลบคำ
  const moreWord = async id => {
    const w = words.find(x => x.id === id);
    const pick = await pickerSheet({ title: M.moreTitle, options: M.moreActions.filter(a => a.value !== (w.count_item_id ? 'link' : 'unlink')) });
    try {
      if (pick === 'link') {
        const used = new Set(words.map(x => x.count_item_id).filter(Boolean));
        const to = await pickerSheet({ title: M.linkTitle, options: items.filter(i => !used.has(i.id)).map(i => ({ value: i.id, label: `${i.name} · ${i.grp}`, image: itemPhoto(i) })) });
        if (!to) return;
        w.count_item_id = to; await saveWord(w);
      } else if (pick === 'unlink') {
        w.count_item_id = null; await saveWord(w);
      } else if (pick === 'remove') {
        if (!await confirmSheet({ ...M.removeAsk, okLabel: M.removeAsk.ok, danger: true })) return;
        await removeWordMy(id); words = words.filter(x => x.id !== id); toast(M.removed);
      } else return;
      drawList(); reloadMy();
    } catch { toast(WORK_UI.saveError); }
  };

  draw();
  load();

  box.addEventListener('click', event => {
    const sec = event.target.closest('[data-my-sec]');
    const cat = event.target.closest('[data-my-cat]');
    const more = event.target.closest('[data-w-more]');
    if (sec) { state.section = sec.dataset.mySec; state.q = ''; return draw(); }
    if (cat) { state.cat = cat.dataset.myCat; return drawList(); }
    if (more) return moreWord(more.dataset.wMore);
    if (event.target.closest('[data-my-add]')) return addWord();
  });

  box.addEventListener('input', event => {
    if (event.target.matches('#my-search')) { state.q = event.target.value.trim(); drawList(); }
  });

  // พิมพ์เสร็จ (ออกจากช่อง) = บันทึกคำนั้นทันที
  box.addEventListener('change', async event => {
    const t = event.target;
    if (t.matches('#my-todo')) { state.todo = t.checked; return drawList(); }
    const wRow = t.closest('[data-w]'), aRow = t.closest('[data-app]');
    try {
      if (wRow && t.dataset.f) {
        const w = words.find(x => x.id === wRow.dataset.w);
        w[t.dataset.f] = t.value.trim() || (t.dataset.f === 'name_my' ? '' : null);
        await saveWord(w);
        wRow.classList.toggle('is-done', !!w.name_my);
      } else if (aRow) {
        const r = appList[Number(aRow.dataset.app)], my = t.value.trim();
        await saveAppWordMy(r.th, my, r.cat, staffCode());
        if (my) appMy[r.th] = my; else delete appMy[r.th];
        aRow.classList.toggle('is-done', !!my);
      } else return;
      toast(M.saved);
      reloadMy();
    } catch { toast(WORK_UI.saveError); }
  });
}
