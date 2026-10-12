// แท็บซื้อของเข้าร้าน — เพิ่ม/เอาออกรายการประจำของร้าน (เลือกจากตารางร้าน kk_vendor_item) · คืน true = ต้องโหลดใหม่
import { getVendorItems, addBuyItem, removeBuyItem } from '../shared/data.js';
import { R9_BUY_UI as T } from '../shared/config.js';
import { toast, confirmSheet, pickerSheet } from '../shared/ui.js';
import { moneyFine, fillText } from '../shared/format.js';

// เพิ่มวัตถุดิบจากตารางร้าน (kk_vendor_item) เข้าร้าน — ของร้านนั้นขึ้นก่อน ร้านอื่นบอกชื่อร้านต่อท้าย
export async function addBuyShopItem(buy, shopId) {
  const shop = buy.shops.find(s => s.id === shopId);
  let list;
  try { list = await getVendorItems(); } catch { toast(T.loadError); return false; }
  const have = new Set(buy.items.filter(i => i.shop === shopId).map(i => i.vi));
  const own = v => (shop.vendor_id && v.vendor_id === shop.vendor_id ? 0 : 1);
  const opts = list.filter(v => !have.has(v.id)).sort((a, b) => own(a) - own(b)).map(v => ({
    value: v.id,
    label: [v.name, v.unit, v.price !== null ? `${moneyFine(v.price)} บาท` : '', own(v) ? v.vendor_name : ''].filter(Boolean).join(' · ')
  }));
  if (!opts.length) { toast(T.pickNone); return false; }
  const vi = await pickerSheet({ title: `${T.pickTitle} · ${shop.label}`, options: opts, search: T.pickSearch });
  if (!vi) return false;
  const sort = Math.max(0, ...buy.items.filter(i => i.shop === shopId).map(i => i.sort || 0)) + 1;
  try { await addBuyItem(shopId, vi, sort); } catch { toast(T.saveError); return false; }
  toast(fillText(T.added, { n: (list.find(v => v.id === vi) || {}).name }));
  return true;
}

// เอารายการออกจากร้าน
export async function removeBuyShopItem(buy, id) {
  const it = buy.items.find(i => i.id === id);
  if (!it || !await confirmSheet({ title: T.removeAsk.title, text: `${it.name} — ${T.removeAsk.text}`, okLabel: T.removeAsk.ok, danger: true })) return false;
  try { await removeBuyItem(id); } catch { toast(T.saveError); return false; }
  toast(fillText(T.removed, { n: it.name }));
  return true;
}
