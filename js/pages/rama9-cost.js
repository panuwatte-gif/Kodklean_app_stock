// ชิ้นส่วนแถวของตารางส่งของพระราม 9: ปุ่มท้ายแถว + แถวแบบมีต้นทุน/mark up (แยกจาก rama9-send.js)
import { R9_ROW_TOOLS, R9_COST_UI } from '../shared/config.js';
import { glyph, r9Photo } from '../shared/ui.js';
import { moneyFine } from '../shared/format.js';

// ปุ่มไอคอนท้ายแถว 4 ปุ่ม
export function toolsHtml() {
  return R9_ROW_TOOLS.map(t => `
    <button class="r9-tool" type="button" data-tool="${t.id}" aria-label="${t.label}" style="--c:${t.color};--tint:${t.tint}">${glyph(t.glyph, 13)}</button>`).join('');
}

// ค่าในช่องกรอก (ว่าง = '')
export const val = v => (v === null || v === undefined ? '' : v);

// แถวแบบมีต้นทุน (หน้าพระราม 9): บรรทัดบน = ชื่อ + ปุ่ม · บรรทัดล่าง = ต้นทุน · mark up % · ปริมาณ · ราคา · รวม
export function costItemHtml(item, hasPrice, sum) {
    return `
    <div class="r9-row r9-row--cost r9-item" data-id="${item.id}">
      <span class="r9-item__name">
        <img src="${r9Photo(item)}" alt="" width="22" height="22" loading="lazy" decoding="async">
        <span title="${item.name} (${item.unit})">${item.name} <small>(${item.unit})</small></span>
      </span>
      <span class="r9-item__tools">${toolsHtml()}</span>
      <input class="r9-in r9-in--cost${item.costFromVendor ? ' is-vendor' : ''}" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-f="cost" value="${val(item.cost)}"${item.vendorCost !== null && item.vendorCost !== undefined ? ` title="${R9_COST_UI.vendorHint}: ${item.vendorCost}"` : ''}>
      <input class="r9-in r9-in--mk" type="number" inputmode="decimal" step="any" placeholder="—" data-f="mk" value="${val(item.mk)}">
      <input class="r9-in" type="number" inputmode="decimal" step="0.1" min="0" placeholder="—" data-f="qty" value="${item.qty ?? ''}">
      <input class="r9-in${hasPrice ? '' : ' is-nil'}" type="number" inputmode="decimal" step="any" min="0" placeholder="—" data-f="price" value="${hasPrice ? item.price : ''}">
      <span class="r9-item__sum${sum ? '' : ' is-zero'}">${sum ? moneyFine(sum) : '—'}</span>
    </div>`;
}

