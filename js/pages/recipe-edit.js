// หน้าสูตรอาหาร — แผงแก้ไขสูตร (เจ้าของร้านเท่านั้น): ชื่อ/ค่าตั้ง วิธีทำ เพิ่มวัตถุดิบ เพิ่มสูตร ปิดใช้/คืนกลับ เลื่อนลำดับ
import { RECIPE_SECTIONS, RECIPE_UI as T } from '../shared/config.js';
import { formSheet, openSheet, confirmSheet, toast } from '../shared/ui.js';
import { saveRecipe, addRecipe, saveRecipeCard } from '../shared/data.js';
import { staffCode } from '../shared/auth.js';
import { escHtml as esc, fillText } from '../shared/format.js';
import { cardsOf } from './recipe-view.js';

// แปลงข้อความ "500, 1000" เป็นรายการตัวเลข (ตัดค่าที่ไม่ใช่ตัวเลขบวกทิ้ง)
const numList = text => String(text || '').split(/[,\s]+/).map(Number).filter(n => isFinite(n) && n > 0);

// ตัวเลขไม่ติดลบจากช่องกรอก (ว่าง = null · ผิด = NaN)
const numOrNull = v => (v === '' || v === null || v === undefined ? null : Number(v));

// แจ้งผลบันทึกไม่สำเร็จ แยกกรณีมีคนแก้ก่อน
export const failToast = e => toast(String(e && e.message) === 'conflict' ? T.conflict : T.saveErr);

// แก้ชื่อสูตร รายละเอียด % หลังปรุง หน่วย และค่าตั้งการ์ด (ปุ่ม batch / กลุ่มไม่รวมน้ำหนัก)
export async function editInfo(r, card) {
  const out = await formSheet({
    title: T.infoBtn, okLabel: T.saveEdit, fields: [
      { key: 'name', label: T.fName, value: r.name_th },
      { key: 'desc', label: T.fDesc, value: r.description || '' },
      { key: 'note', label: T.fNote, value: r.usage_ratio_note || '' },
      { key: 'yield', label: T.fYield, kind: 'number', step: 1, value: r.yield_percent ?? 100 },
      { key: 'usize', label: T.fUnitSize, kind: 'number', value: r.unit_size_g ?? '' },
      { key: 'ulabel', label: T.fUnitLabel, value: r.unit_label || '' },
      { key: 'presets', label: T.fPresets, value: (card.presets || []).join(', ') },
      { key: 'exclude', label: T.fExclude, value: (card.exclude_groups || []).join(', ') }
    ]
  });
  if (!out) return false;
  if (!out.name) { toast(T.needName); return false; }
  const y = numOrNull(out.yield), u = numOrNull(out.usize);
  if ((y !== null && !(y > 0)) || (u !== null && !(u >= 0))) { toast(T.badQty); return false; }
  await saveRecipe({ id: r.id, loadedAt: r.updated_at, head: { name_th: out.name, description: out.desc, usage_ratio_note: out.note, yield_percent: y ?? 100, unit_size_g: u, unit_label: out.ulabel } });
  await saveRecipeCard(r.id, { presets: numList(out.presets), exclude_groups: String(out.exclude || '').split(',').map(s => s.trim()).filter(Boolean) }, staffCode());
  toast(T.saved);
  return true;
}

// แก้วิธีทำ (1 บรรทัด = 1 ขั้นตอน · บันทึกแทนชุดเดิมทั้งชุด)
export async function editSteps(r, steps) {
  let text = (steps || []).map(s => s.instruction).join('\n');
  const wait = openSheet(`
    <div class="ask__title">${T.stepsBtn}</div>
    <p class="rcnote">${T.stepsHint}</p>
    <textarea class="iarea rcsteps__in" data-steps-in="1" rows="9">${esc(text)}</textarea>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">${T.cancel}</button><button class="ask__btn" type="button" data-pick="ok">${T.saveEdit}</button></div>`);
  const box = document.querySelector('[data-steps-in]');
  if (box) box.addEventListener('input', () => { text = box.value; });
  if (await wait !== 'ok') return false;
  await saveRecipe({ id: r.id, loadedAt: r.updated_at, steps: text.split('\n').map(s => s.trim()).filter(Boolean) });
  toast(T.saved);
  return true;
}

// สูตรนี้เรียกสูตร target อยู่แล้วหรือไม่ (ใช้กันเลือกสูตรย่อยที่ทำให้วนกลับ)
function reaches(book, from, target, seen = []) {
  if (from === target) return true;
  if (seen.includes(from)) return false;
  return (book.lines[from] || []).some(l => l.sub_recipe_id && reaches(book, l.sub_recipe_id, target, [...seen, from]));
}

// เพิ่มวัตถุดิบ 1 บรรทัดลงร่าง (เลือกเป็นสูตรย่อยได้ · กันวนกลับ)
export async function addLine(book, r, draft) {
  const subs = Object.values(book.recipes).filter(x => x.id !== r.id).sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'));
  const groups = [...new Set(draft.map(l => l.group_name).filter(Boolean))];
  const out = await formSheet({
    title: T.addLine, okLabel: T.addLine, fields: [
      { key: 'name', label: T.fName, value: '' },
      { key: 'qty', label: T.fQty, kind: 'number', value: '' },
      { key: 'group', label: T.fGroup, value: groups[groups.length - 1] || '' },
      { key: 'sub', label: T.fSub, kind: 'select', value: '', options: [{ value: '', label: T.noSubPick }].concat(subs.map(x => ({ value: x.id, label: x.name_th }))) }
    ]
  });
  if (!out) return null;
  const qty = numOrNull(out.qty);
  if (qty === null || !(qty >= 0)) { toast(T.badQty); return null; }
  if (out.sub && reaches(book, out.sub, r.id)) { toast(T.cycleErr); return null; }
  const name = out.sub ? book.recipes[out.sub].name_th : out.name;
  if (!name) { toast(T.needName); return null; }
  return { id: null, name, custom_name: out.sub ? null : name, qty_g: qty, group_name: out.group || null, sub_recipe_id: out.sub || null };
}

// บันทึกร่างวัตถุดิบทั้งชุด (ตรวจตัวเลขก่อน ส่งครั้งเดียว)
export async function saveDraft(r, draft) {
  if (draft.some(l => l.qty_g === null || !(Number(l.qty_g) >= 0))) { toast(T.badQty); return false; }
  if (draft.some(l => !String(l.name || '').trim())) { toast(T.needName); return false; }
  const lines = draft.map(l => ({ id: l.id, custom_name: l.sub_recipe_id ? l.custom_name : (l.name === l.master_name ? l.custom_name : l.name), qty_g: Number(l.qty_g), group_name: l.group_name, sub_recipe_id: l.sub_recipe_id }));
  await saveRecipe({ id: r.id, loadedAt: r.updated_at, lines });
  toast(T.saved);
  return true;
}

// เพิ่มสูตรใหม่ต่อท้ายหมวด คืนรหัสสูตรใหม่
export async function newRecipe(book, secId) {
  const out = await formSheet({ title: T.addRecipe, okLabel: T.addRecipe, fields: [{ key: 'name', label: T.newName, value: '' }] });
  if (!out) return null;
  if (!out.name) { toast(T.needName); return null; }
  const sec = RECIPE_SECTIONS.find(s => s.id === secId);
  const order = cardsOf(book, secId, true).reduce((n, c) => Math.max(n, c.sort_order || 0), 0) + 1;
  const id = await addRecipe({ name: out.name, type: sec.type, section: secId, order, by: staffCode() });
  toast(T.saved);
  return id;
}

// ปิดใช้ (ถามก่อน) / คืนกลับ — สูตรไม่ถูกลบ
export async function setActive(book, id, on) {
  if (!on && !await confirmSheet({ title: fillText(T.archiveAsk, { name: book.recipes[id].name_th }), text: T.archiveText, okLabel: T.archiveOk, danger: true })) return false;
  await saveRecipeCard(id, { is_active: on }, staffCode());
  toast(T.saved);
  return true;
}

// สลับลำดับกับสูตรข้างเคียงในหมวดเดียวกัน (เขียนเลขลำดับใหม่ทั้งหมวดให้ไม่ซ้ำ)
export async function moveCard(book, id, step) {
  const card = book.cards[id];
  const list = cardsOf(book, card.section);
  const i = list.indexOf(card), j = i + step;
  if (j < 0 || j >= list.length) { toast(T.moveEnd); return false; }
  [list[i], list[j]] = [list[j], list[i]];
  for (let k = 0; k < list.length; k++) if (list[k].sort_order !== k + 1) await saveRecipeCard(list[k].recipe_id, { sort_order: k + 1 }, staffCode());
  return true;
}
