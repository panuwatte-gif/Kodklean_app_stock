// หน้าสูตรอาหาร — ตัวคุมหน้า: หมวดสูตร → รายการสูตร → ตารางคำนวณ batch (ข้อมูลจาก kk_core_recipes ใช้ร่วมกับ App สูตร)
import { getRecipeBook } from '../shared/data.js';
import { RECIPE_UI as T } from '../shared/config.js';
import { workTopHtml } from '../shared/work-ui.js';
import { toast } from '../shared/ui.js';
import { isAdmin, currentUser } from '../shared/auth.js';
import { recipeOut, recipeLeaves, recipeScale } from '../shared/calc.js';
import { sectionsHtml, listHtml, calcHtml, paintCalc, editHtml } from './recipe-view.js';
import { editInfo, editSteps, addLine, saveDraft, newRecipe, setActive, moveCard, failToast } from './recipe-edit.js';

// ตัวเลขจากช่องกรอก (ว่าง/ติดลบ/ไม่ใช่ตัวเลข = ไม่นับ)
const numIn = v => (v === '' || !isFinite(Number(v)) || Number(v) < 0 ? null : Number(v));

// ติดตั้งหน้าสูตรอาหาร
export function mountRecipePage(root, onGo) {
  const st = { view: 'sections', sec: null, id: null, have: {}, target: null, showOff: false, draft: null, stack: [] };
  const el = s => root.querySelector(s);
  const admin = isAdmin();
  let book = null, res = null;
  root.querySelector('.work').style.setProperty('--a', T.accent);

  // คำนวณผลของสูตรที่เปิดอยู่ใหม่จากค่าที่กรอก
  const compute = () => {
    const leaves = recipeLeaves(book, st.id);
    res = recipeScale(leaves, recipeOut(book, st.id) || 0, { target: st.target, have: st.have });
    return res;
  };

  // วาดหน้าตามสถานะปัจจุบัน
  const draw = () => {
    const me = currentUser() || {};
    const back = st.view === 'sections' ? T.back : st.view === 'list' ? T.backList : T.backCalc;
    el('#w-top').innerHTML = workTopHtml({ code: me.avatar || me.code || '', name: me.name || '', role: '' }, back);
    if (!book) return;
    const r = book.recipes[st.id];
    let html;
    if (st.view === 'sections') html = sectionsHtml(book);
    else if (st.view === 'list') html = listHtml(st.sec, book, admin, st.showOff);
    else if (st.draft) html = editHtml(r, st.draft);
    else html = calcHtml({ r, card: book.cards[st.id] || { presets: [] }, book, res: compute(), have: st.have, target: st.target, admin });
    el('#w-body').innerHTML = html;
  };

  // โหลดสูตรล่าสุดจากฐาน (ล้มเหลว = บอกตรงๆ พร้อมปุ่มลองใหม่ ไม่แสดงสูตรค้าง)
  const load = async () => {
    try { book = await getRecipeBook(); draw(); } catch {
      book = null;
      el('#w-body').innerHTML = `<p class="wempty">${T.loadError}<em><button class="rcreset" type="button" data-reload="1">${T.retry}</button></em></p>`;
    }
  };

  // เปิดสูตร 1 สูตร (จำทางกลับไว้ เผื่อเปิดสูตรย่อยต่อ)
  const open = id => {
    if (!book.recipes[id]) return;
    if (st.view === 'calc') st.stack.push(st.id);
    st.view = 'calc'; st.id = id; st.have = {}; st.target = null; st.draft = null;
    draw(); root.scrollTop = 0;
  };

  // ปุ่มกลับ: ร่างแก้ → ตารางคำนวณ → สูตรแม่ → รายการ → หมวด → หน้าอื่นๆ
  const back = () => {
    if (st.draft) { st.draft = null; return draw(); }
    if (st.view === 'calc' && st.stack.length) { st.id = st.stack.pop(); st.have = {}; st.target = null; return draw(); }
    if (st.view === 'calc') { st.view = st.sec ? 'list' : 'sections'; return draw(); }
    if (st.view === 'list') { st.view = 'sections'; return draw(); }
    onGo('other');
  };

  // ทำงานแก้ไขแล้วโหลดใหม่ (บันทึกไม่สำเร็จ = แจ้ง และโหลดฉบับล่าสุดมาแทน)
  const act = async (job, after) => {
    try { if (await job()) { if (after) after(); await load(); } } catch (e) { failToast(e); await load(); }
  };

  el('#w-body').innerHTML = `<p class="wempty">${T.loading}</p>`;
  draw();
  load();

  root.addEventListener('click', event => {
    const t = event.target, hit = s => t.closest(s);
    if (hit('[data-back]')) return back();
    if (hit('[data-reload]')) return load();
    if (!book) return;
    const r = book.recipes[st.id];
    if (hit('[data-sec]')) { st.view = 'list'; st.sec = hit('[data-sec]').dataset.sec; st.stack = []; draw(); return; }
    if (hit('[data-open]')) return open(hit('[data-open]').dataset.open);
    if (hit('[data-target]')) { st.target = Number(hit('[data-target]').dataset.target); return draw(); }
    if (hit('[data-reset]')) { st.have = {}; st.target = null; return draw(); }
    if (!admin && (hit('[data-edit]') || hit('[data-add]'))) return toast(T.onlyAdmin);
    if (hit('[data-arcview]')) { st.showOff = !st.showOff; return draw(); }
    if (hit('[data-add]')) return (async () => {
      try { const id = await newRecipe(book, st.sec); if (!id) return; await load(); open(id); st.draft = []; draw(); } catch (e) { failToast(e); await load(); }
    })();
    if (hit('[data-arc]')) return act(() => setActive(book, hit('[data-arc]').dataset.arc, false));
    if (hit('[data-restore]')) return act(() => setActive(book, hit('[data-restore]').dataset.restore, true));
    if (hit('[data-move]')) { const [s, id] = hit('[data-move]').dataset.move.split(':'); return act(() => moveCard(book, id, Number(s))); }
    if (hit('[data-info]')) return act(() => editInfo(r, book.cards[r.id] || {}));
    if (hit('[data-steps]')) return act(() => editSteps(r, book.steps[r.id]));
    if (hit('[data-edit]')) { st.draft = (book.lines[r.id] || []).map(l => ({ ...l })); return draw(); }
    if (hit('[data-dcancel]')) { st.draft = null; return draw(); }
    if (hit('[data-drm]')) { st.draft.splice(Number(hit('[data-drm]').dataset.drm), 1); return draw(); }
    if (hit('[data-dadd]')) return addLine(book, r, st.draft).then(l => { if (l) { st.draft.push(l); draw(); } });
    if (hit('[data-dsave]')) {
      const btn = hit('[data-dsave]');
      btn.disabled = true;
      return act(() => saveDraft(r, st.draft), () => { st.draft = null; }).finally(() => { btn.disabled = false; });
    }
  });

  // พิมพ์ตัวเลข: คิดใหม่ทันทีแบบไม่วาดทั้งหน้า (ช่องที่พิมพ์อยู่ไม่หลุด)
  root.addEventListener('input', event => {
    const t = event.target;
    if (t.matches('[data-have]')) { const v = numIn(t.value); if (v === null) delete st.have[t.dataset.have]; else st.have[t.dataset.have] = v; }
    else if (t.matches('[data-want]')) { st.target = numIn(t.value); root.querySelectorAll('.rcchip').forEach(c => c.classList.toggle('is-on', Number(c.dataset.target) === st.target)); }
    else if (t.matches('[data-dn]')) { st.draft[Number(t.dataset.dn)].name = t.value; return; }
    else if (t.matches('[data-dq]')) { st.draft[Number(t.dataset.dq)].qty_g = t.value === '' ? null : Number(t.value); return; }
    else return;
    paintCalc(root, compute());
  });

}
