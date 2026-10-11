// หน้าต้นทุนอาหาร (อื่นๆ → ต้นทุนอาหาร) — ราคากลางของวัตถุดิบ (ทุนจริง + ราคา fix) · ต้นทุนเมนูต่อจาน · คิดเมนูพิเศษ
// ราคากลาง = รายการชุดเดียวกับของส่งพระราม 9 (kk_rama9_item / kk_r9_item) · ส่วนประกอบเมนูเก็บที่ kk_menu_cost_part
import { FOOD_COST_UI as T, COST_OWNERS } from '../shared/config.js';
import { getFoodCostBundle, savePriceCenter, addMenuCostPart, saveMenuCostPart, removeMenuCostPart } from '../shared/data.js';
import { currentUser, staffCode } from '../shared/auth.js';
import { toast, pickerSheet, formSheet, r9Photo } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import { tabsHtml, itemsHtml, menusHtml, calcHtml } from './food-cost-view.js';

// ช่องว่าง = null
const num = v => (v === '' || v === null || v === undefined ? null : Number(v));

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมราคากลางและต้นทุนเมนูจากฐาน
export function mountFoodCostPage(root) {
  const el = id => root.querySelector(id);
  const s = { tab: 'items', closed: {}, open: {}, calc: [], sell: '', items: [], cats: [], menus: [], parts: [], ready: false, error: false };
  el('#fco-title').textContent = T.title;
  el('#fco-sub').textContent = T.sub;
  const me = currentUser();
  if (!me || !COST_OWNERS.includes(me.code)) { el('#fco-body').innerHTML = `<p class="fco-empty">${T.deny}</p>`; return; }

  const active = () => s.items.filter(i => i.active);

  // วาดแท็บและเนื้อหาของแท็บที่เปิดอยู่
  const draw = () => {
    el('#fco-tabs').innerHTML = tabsHtml(s.tab);
    const body = el('#fco-body');
    if (s.error) { body.innerHTML = `<p class="fco-empty">${T.error}</p>`; return; }
    if (!s.ready) { body.innerHTML = `<p class="fco-empty">${T.loading}</p>`; return; }
    if (s.tab === 'items') body.innerHTML = itemsHtml(active(), s.cats.filter(c => c.active), s.closed);
    else if (s.tab === 'menu') body.innerHTML = menusHtml(s.menus, s.parts, active(), s.open);
    else body.innerHTML = calcHtml(s.calc, active(), s.sell);
  };

  // โหลดหมวด ราคากลาง เมนู และส่วนประกอบทั้งหมดในครั้งเดียว
  const load = async () => {
    try { Object.assign(s, await getFoodCostBundle(), { ready: true, error: false }); }
    catch { s.error = true; }
    draw();
  };

  // เลือกวัตถุดิบจากราคากลาง (คืน id · ยกเลิก = null)
  const pickItem = () => pickerSheet({ title: T.pickItem, options: active().map(i => ({ value: i.id, label: `${i.name} (${i.unit})`, image: r9Photo(i) })) });

  // ถามชื่อ + บาทของค่าอื่นๆ ต่อจาน (คืน { label, baht } · ยกเลิก = null)
  const askFlat = async () => {
    const out = await formSheet({ title: T.flatTitle, okLabel: T.flatOk, fields: [
      { key: 'label', label: T.flatLabel, placeholder: T.flatHint },
      { key: 'baht', label: T.flatBaht, kind: 'number', step: 0.5 }
    ] });
    if (!out) return null;
    const label = String(out.label || '').trim(), baht = num(out.baht);
    if (!label) { toast(T.needLabel); return null; }
    if (baht === null || !(baht >= 0)) { toast(T.bad); return null; }
    return { label, baht };
  };

  // เพิ่มส่วนประกอบ: menuId ว่าง = เครื่องคิดเมนูพิเศษ (เก็บในหน้าอย่างเดียว) · มี = บันทึกลงฐาน
  const addPart = async (menuId, kind) => {
    let row = null;
    if (kind === 'item') { const id = await pickItem(); if (id) row = { item_id: id, qty: 0 }; }
    else row = await askFlat();
    if (!row) return;
    if (!menuId) { s.calc.push(row); return draw(); }
    try {
      const order = s.parts.filter(p => p.menu_id === menuId).length + 1;
      await addMenuCostPart({ menu_id: menuId, ...row, sort_order: order, updated_by: staffCode() });
      await load();
    } catch { toast(T.saveErr); }
  };

  // ลบส่วนประกอบ 1 แถว
  const delPart = async (kind, key) => {
    if (kind === 'c') { s.calc.splice(Number(key), 1); return draw(); }
    try { await removeMenuCostPart(key); await load(); } catch { toast(T.saveErr); }
  };

  // ออกจากช่องราคากลาง → บันทึกทันที (ทุนจริงว่าง = กลับไปใช้ราคา App_money)
  const savePrice = async input => {
    const it = s.items.find(i => i.id === input.closest('[data-id]').dataset.id), v = num(input.value), f = input.dataset.pc;
    if (v !== null && !(v >= 0)) { toast(T.bad); return draw(); }
    try {
      await savePriceCenter(it.id, f, v, staffCode());
      toast(fillText(T.saved, { f: f === 'fix' ? T.fFix : T.fActual, name: it.name }));
      await load();
    } catch { toast(T.saveErr); draw(); }
  };

  // ออกจากช่องของส่วนประกอบ → เมนู = บันทึกลงฐาน · เมนูพิเศษ = เก็บในหน้า แล้วคิดยอดใหม่
  const savePart = async (input, ref) => {
    const f = input.dataset.f, [kind, key] = ref.dataset.ref.split(':');
    let v = f === 'label' ? input.value.trim() : num(input.value);
    if (f !== 'label' && v !== null && !(v >= 0)) { toast(T.bad); return draw(); }
    if (f !== 'label' && v === null) v = 0;
    if (f === 'qty' && ref.dataset.kg) v = v / 1000;   // รายการเป็นกิโล กรอกเป็นกรัม
    if (kind === 'c') { s.calc[Number(key)][f] = v; return draw(); }
    try {
      await saveMenuCostPart(key, { [f]: v, updated_by: staffCode() });
      const p = s.parts.find(x => x.id === Number(key));
      if (p) p[f] = v;
      draw();
    } catch { toast(T.saveErr); }
  };

  draw();
  load();

  root.addEventListener('click', event => {
    const hit = sel => event.target.closest(sel);
    const tab = hit('[data-tab]'), cat = hit('[data-cat]'), open = hit('[data-mopen]'), add = hit('[data-add]'), del = hit('[data-del]');
    if (tab) { s.tab = tab.dataset.tab; draw(); }
    else if (cat) { s.closed[cat.dataset.cat] = !s.closed[cat.dataset.cat]; draw(); }
    else if (open) { s.open[open.dataset.mopen] = !s.open[open.dataset.mopen]; draw(); }
    else if (add) addPart(add.dataset.menu || null, add.dataset.add);
    else if (del) { const [kind, key] = del.closest('[data-ref]').dataset.ref.split(':'); delPart(kind, key); }
    else if (hit('[data-act="calcClear"]')) { s.calc = []; s.sell = ''; draw(); }
  });

  root.addEventListener('change', event => {
    const t = event.target, ref = t.closest('[data-ref]');
    if (t.matches('[data-pc]')) savePrice(t);
    else if (t.matches('[data-sell]')) { s.sell = t.value; draw(); }
    else if (ref && t.dataset.f) savePart(t, ref);
  });
}
