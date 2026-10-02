// แถวของตารางส่งของพระราม 9 (บรรทัดเดียว: รูป+ชื่อ · ต้นทุน · mk % · ปริมาณ · ราคา · รวม · ปุ่ม ⋯) + การบันทึกราคากลาง
// ใช้ร่วมหน้าพระราม 9 และหน้าแม่พัน (หน้าแม่พัน tools = false: แตะรูปไม่ได้ ไม่มีปุ่ม ⋯)
import { R9_COST_UI, R9_ROW_MENU, R9_UI } from '../shared/config.js';
import { saveR9Price } from '../shared/data.js';
import { staffCode } from '../shared/auth.js';
import { glyph, r9Photo, pickerSheet, toast } from '../shared/ui.js';
import { moneyFine } from '../shared/format.js';
import { r9DraftItems } from '../shared/calc.js';
import { editR9Item, deleteR9Item, changeR9Photo, moveR9Item } from './rama9-setup.js';

// ค่าในช่องกรอก (ว่าง = '')
export const val = v => (v === null || v === undefined ? '' : v);

// แถวรายการ 1 แถว (ราคายังไม่ตั้ง = ว่างไว้ ห้ามเป็น 0) · ต้นทุนสีเขียว = เติมจากราคากลางของ vendor
export function costItemHtml(item, hasPrice, sum, tools = true) {
  const img = `<img src="${r9Photo(item)}" alt="" width="22" height="22" loading="lazy" decoding="async">`;
  const vend = item.vendorCost !== null && item.vendorCost !== undefined ? ` title="${R9_COST_UI.vendorHint}: ${item.vendorCost}"` : '';
  return `
    <div class="r9-row r9-row--cost${tools ? '' : ' r9-row--costslim'} r9-item" data-id="${item.id}">
      <span class="r9-item__name">
        ${tools ? `<button class="r9-photo" type="button" data-tool="photo" aria-label="${R9_ROW_MENU.photo}">${img}</button>` : img}
        <span title="${item.name} (${item.unit})">${item.name}</span>
      </span>
      <input class="r9-in r9-in--cost${item.costFromVendor ? ' is-vendor' : ''}" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-f="cost" value="${val(item.cost)}"${vend}>
      <input class="r9-in r9-in--mk" type="number" inputmode="decimal" step="any" placeholder="—" data-f="mk" value="${val(item.mk)}">
      <input class="r9-in" type="number" inputmode="decimal" step="0.1" min="0" placeholder="—" data-f="qty" value="${item.qty ?? ''}">
      <input class="r9-in${hasPrice ? '' : ' is-nil'}" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-f="price" value="${hasPrice ? item.price : ''}">
      <span class="r9-item__sum${sum ? '' : ' is-zero'}">${sum ? moneyFine(sum) : '—'}</span>
      ${tools ? `<button class="r9-more" type="button" data-tool="menu" aria-label="${R9_ROW_MENU.label}">${glyph('more', 16)}</button>` : ''}
    </div>`;
}

// แตะรูป = เปลี่ยนรูป · ปุ่ม ⋯ = เลือก ย้ายขึ้น/ย้ายลง/แก้ไข/ลบ (คืน true = ต้องโหลดใหม่)
export async function rowTool(kind, it, items, cats) {
  if (kind === 'photo') return changeR9Photo(it);
  const pick = await pickerSheet({ title: `${R9_ROW_MENU.label} · ${it.name}`, options: R9_ROW_MENU.options });
  if (pick === 'up' || pick === 'down') return moveR9Item(items, it.id, pick === 'up' ? -1 : 1);
  if (pick === 'edit') return editR9Item(it, cats);
  if (pick === 'delete') return deleteR9Item(it);
  return false;
}

// ออกจากช่องต้นทุน/mk/ราคา → บันทึกราคากลางของรายการนั้นลงฐานทันที (kk_rama9_item) · คืน true = จัดการแล้ว
export async function priceChange(event, items, draft) {
  const elm = event.target;
  if (!elm.matches('.r9-row--cost [data-f="cost"], .r9-row--cost [data-f="mk"], .r9-row--cost [data-f="price"]')) return false;
  const id = elm.closest('.r9-item').dataset.id;
  const it = r9DraftItems(items, draft).find(i => i.id === id);
  const num = v => (v === null || v === undefined || v === '' ? null : Number(v));
  const row = { cost: num(it.cost), markup: num(it.mk), price: num(it.price) };
  try {
    await saveR9Price({ id, ...row, by: staffCode() });
    Object.assign(items.find(i => i.id === id), row);
  } catch { toast(R9_UI.priceSaveError); }
  return true;
}
