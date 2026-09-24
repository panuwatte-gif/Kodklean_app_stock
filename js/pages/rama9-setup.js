// แท็บตั้งค่ารายการของหน้าพระราม 9 — เปิด/ปิด เพิ่ม แก้ ย้ายหมวด และลบ (เขียนฐานผ่าน data.js เท่านั้น)
import { R9_SETUP_UI as T, R9_UNITS, R9_PHOTOS, R9_CAT_ICONS, CAT_COLOR_PRESETS } from '../shared/config.js';
import { glyph, toast, formSheet, pickerSheet, confirmSheet, pickPhotoWebp, r9Photo } from '../shared/ui.js';
import { money, fillText } from '../shared/format.js';
import { uploadWebp, addR9Item, saveR9Item, removeR9Item, setR9CatActive, setR9ItemsActive, moveR9Items, addR9Cat } from '../shared/data.js';

// แถวรายการ 1 แถว: สวิตช์เปิด/ปิด + ราคาตั้งต้น + จำนวนรอบที่เคยส่ง + ปุ่มแก้/ลบ
function rowHtml(it, pick, sel) {
  const price = it.price === null ? '—' : money(it.price) + ' บาท';
  return `
    <div class="r9-setrow${it.active ? '' : ' is-off'}" data-id="${it.id}">
      ${pick ? `<button class="r9-check__box r9-setpick${sel[it.id] ? ' is-on' : ''}" type="button" data-setpick="${it.id}">${sel[it.id] ? glyph('check', 12) : ''}</button>` : ''}
      <button class="r9-setphoto" type="button" data-setphoto="${it.id}" aria-label="เปลี่ยนรูป">
        <img src="${r9Photo(it)}" alt="" width="30" height="30" loading="lazy" decoding="async">
        <i>${glyph('image', 10)}</i>
      </button>
      <span class="r9-setrow__t">
        <b>${it.name}</b>
        <i>${it.unit} · ${price} · ${it.used ? fillText(T.usedNote, { n: it.used }) : T.neverUsed}</i>
      </span>
      <button class="r9-sw${it.active ? ' is-on' : ''}" type="button" data-setsw="${it.id}" aria-label="เปิดหรือปิดรายการ"><i></i></button>
      <button class="r9-tool" type="button" data-setedit="${it.id}" aria-label="แก้ไข" style="--c:#2F63C9;--tint:#EAF1FD">${glyph('pencil', 13)}</button>
      <button class="r9-tool" type="button" data-setdel="${it.id}" aria-label="ลบ" style="--c:#E5433B;--tint:#FDEBEA">${glyph('trash', 13)}</button>
    </div>`;
}

// การ์ดตั้งค่าทั้งแท็บ
export function setupHtml(items, cats, sel, pick) {
  const on = items.filter(i => i.active).length;
  const picked = Object.keys(sel).filter(k => sel[k]).length;
  const groups = cats.map(cat => {
    const rows = items.filter(i => i.cat === cat.id);
    return `
      <div class="r9-card">
        <div class="r9-setcat" style="--c:${cat.color};--tint:${cat.tint}">
          <img src="${cat.icon}" alt="" width="24" height="24" loading="lazy" decoding="async">
          <b>${cat.label}</b>
          <i>${rows.length} รายการ</i>
          <button type="button" data-setcat="${cat.id}">${rows.some(r => r.active) ? T.catOff : T.catOn}</button>
        </div>
        ${rows.map(it => rowHtml(it, pick, sel)).join('')}
      </div>`;
  }).join('');
  return `
    <div class="r9-card">
      <div class="r9-card__head">
        <img class="r9-card__ic" src="assets/r9/boxes.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <div class="r9-card__t">
          <div class="r9-card__title">${T.title}</div>
          <div class="r9-card__sub">${T.sub}</div>
        </div>
      </div>
      <div class="r9-card__sub" style="padding:0 12px 6px">${fillText(T.count, { on, off: items.length - on, all: items.length })}</div>
      <div class="r9-filters">
        <button class="r9-btn r9-btn--green" type="button" data-act="add">${glyph('plus', 15)}<span>เพิ่มรายการ</span></button>
        <button class="r9-btn" type="button" data-act="addCat">${glyph('plus', 15)}<span>เพิ่มหมวด</span></button>
        <button class="r9-btn r9-btn--soft" type="button" data-act="pick">${glyph('layers', 15)}<span>${pick ? T.pickDone : T.pickMode}</span></button>
        ${pick ? `<button class="r9-btn r9-btn--soft" type="button" data-act="move">${glyph('grip', 15)}<span>${fillText(T.moveTo, { n: picked })}</span></button>` : ''}
      </div>
    </div>
    ${groups}`;
}

// ฟอร์มแก้ไขรายการ (ชื่อ หมวด หน่วย ราคาตั้งต้น รูป) — ว่างช่องราคา = ยังไม่ตั้งราคา ไม่ใช่ 0
export async function editR9Item(it, cats) {
  const res = await formSheet({
    title: T.editTitle,
    fields: [
      { key: 'name', label: T.fName, kind: 'text', value: it.name },
      { key: 'cat', label: T.fCat, kind: 'select', value: it.cat, options: cats.map(c => ({ value: c.id, label: c.label })) },
      { key: 'unit', label: T.fUnit, kind: 'select', value: it.unit, options: R9_UNITS.map(u => ({ value: u, label: u })) },
      { key: 'price', label: T.fPrice, kind: 'number', step: 0.5, value: it.price ?? '' },
      { key: 'photo', label: T.fPhoto, kind: 'image', options: [{ value: it.photo, label: it.name, image: it.photo }].concat(R9_PHOTOS.filter(o => o.value !== it.photo)) }
    ]
  });
  if (!res) return null;
  if (!res.name) return toast(T.fName) && null;
  await saveR9Item(it.id, {
    name: res.name, cat_id: res.cat, unit: res.unit, photo: res.photo || it.photo,
    price: res.price === '' || res.price === undefined ? null : Number(res.price)
  });
  toast(fillText(T.savedItem, { name: res.name }));
  return true;
}

// ฟอร์มเพิ่มรายการใหม่เข้าหมวดที่เลือก (ใช้ทั้งแท็บส่งของและแท็บตั้งค่า)
export async function addR9ItemTo(items, cats, catId) {
  const res = await formSheet({
    title: 'เพิ่มรายการ',
    fields: [
      { key: 'name', label: T.fName, kind: 'text', placeholder: 'เช่น น้ำมะนาว' },
      { key: 'cat', label: T.fCat, kind: 'select', value: catId || cats[0].id, options: cats.map(c => ({ value: c.id, label: c.label })) },
      { key: 'unit', label: T.fUnit, kind: 'select', options: R9_UNITS.map(u => ({ value: u, label: u })) },
      { key: 'price', label: T.fPrice, kind: 'number', step: 0.5 },
      { key: 'photo', label: T.fPhoto, kind: 'image', options: R9_PHOTOS }
    ]
  });
  if (!res) return null;
  if (!res.name) return toast(T.fName) && null;
  const cat = res.cat || cats[0].id;
  const last = items.filter(i => i.cat === cat).reduce((n, i) => Math.max(n, i.sortOrder || 0), 0);
  await addR9Item({
    id: 'r9-new-' + Date.now(), name: res.name, cat_id: cat, unit: res.unit || R9_UNITS[0],
    price: res.price === '' || res.price === undefined ? null : Number(res.price),
    photo: res.photo || R9_PHOTOS[0].value, kind: cat === 'cooked' ? 'อาหารปรุงสำเร็จ' : 'วัตถุดิบ', sort_order: last + 1
  });
  toast(`เพิ่ม "${res.name}" แล้ว`);
  return true;
}

// ฟอร์มเพิ่มหมวดใหม่ต่อท้าย
async function addCat(cats) {
  const res = await formSheet({
    title: 'เพิ่มหมวด',
    fields: [
      { key: 'name', label: 'ชื่อหมวด', kind: 'text', placeholder: 'เช่น ของแช่แข็ง' },
      { key: 'color', label: 'สีประจำหมวด', kind: 'swatch', options: CAT_COLOR_PRESETS.map(p => ({ value: p.color })) },
      { key: 'icon', label: 'ไอคอน', kind: 'image', options: R9_CAT_ICONS }
    ]
  });
  if (!res) return null;
  if (!res.name) return toast('ยังไม่ได้ใส่ชื่อหมวด') && null;
  const preset = CAT_COLOR_PRESETS.find(p => p.color === res.color) || CAT_COLOR_PRESETS[0];
  const last = cats.reduce((n, c) => Math.max(n, c.sort_order || 0), 0);
  await addR9Cat({ id: 'r9c-' + Date.now(), label: res.name, icon: res.icon || R9_CAT_ICONS[0].value, color: preset.color, tint: preset.tint, sort_order: last + 1 });
  toast(`เพิ่มหมวด "${res.name}" แล้ว`);
  return true;
}

// เปลี่ยนรูปสินค้า: อัพรูปจากเครื่อง (แปลงเป็น WebP ให้) · ลบรูป · หรือเลือกจากคลังรูป
export async function changeR9Photo(it) {
  const picked = await pickerSheet({
    title: `${T.photoTitle} · ${it.name}`,
    options: [
      { value: '__upload', label: T.photoUpload, image: 'assets/r9/boxes.webp' },
      { value: '__clear', label: T.photoClear, image: r9Photo(it) },
      { value: '', label: T.photoLib }
    ].concat(R9_PHOTOS.map(o => ({ value: o.value, label: o.label, image: o.value })))
  });
  if (!picked) return null;
  if (picked === '__clear') {
    await saveR9Item(it.id, { photo: null });
    toast(T.photoCleared);
    return true;
  }
  if (picked === '__upload') {
    const url = await pickPhotoWebp(192);
    if (!url) return null;
    await saveR9Item(it.id, { photo: await uploadWebp('rama9', it.id, url) });
    toast(T.photoUploaded);
    return true;
  }
  await saveR9Item(it.id, { photo: picked });
  toast(T.photoChanged);
  return true;
}

// สลับลำดับรายการขึ้น/ลง ภายในหมวดเดียวกัน (สลับเลขลำดับกัน)
export async function moveR9Item(items, id, step) {
  const mine = items.find(i => i.id === id);
  const mates = items.filter(i => i.cat === mine.cat);
  const mate = mates[mates.findIndex(i => i.id === id) + step];
  if (!mate) return toast('อยู่สุดทางแล้ว') && null;
  await saveR9Item(mine.id, { sort_order: mate.sortOrder });
  await saveR9Item(mate.id, { sort_order: mine.sortOrder });
  return true;
}

// ลบรายการ — เคยส่งมาแล้วห้ามลบ บังคับให้ปิดสวิตช์แทน พร้อมบอกว่าเคยส่งกี่รอบ
export async function deleteR9Item(it) {
  if (it.used) return toast(fillText(T.delBlocked, { n: it.used })) && null;
  if (!await confirmSheet({ title: T.delAsk.title, text: it.name, okLabel: T.delAsk.ok, danger: true })) return null;
  await removeR9Item(it.id);
  toast(fillText(T.deleted, { name: it.name }));
  return true;
}

// รับการกดปุ่มทุกปุ่มของแท็บตั้งค่า — คืน true เมื่อต้องโหลดข้อมูลใหม่, 'draw' เมื่อวาดใหม่พอ
export async function handleSetupClick(event, ctx) {
  const hit = sel => event.target.closest(sel);
  const { items, cats, sel } = ctx;
  const at = id => items.find(i => i.id === id);
  const sw = hit('[data-setsw]'), ed = hit('[data-setedit]'), del = hit('[data-setdel]');
  const cat = hit('[data-setcat]'), pk = hit('[data-setpick]'), act = hit('[data-act]'), ph = hit('[data-setphoto]');

  if (ph) return changeR9Photo(at(ph.dataset.setphoto));
  if (pk) { sel[pk.dataset.setpick] = !sel[pk.dataset.setpick]; return 'draw'; }
  if (sw) {
    const it = at(sw.dataset.setsw);
    await saveR9Item(it.id, { active: !it.active });
    toast(fillText(it.active ? T.turnedOff : T.turnedOn, { name: it.name }));
    return true;
  }
  if (ed) return editR9Item(at(ed.dataset.setedit), cats);
  if (del) {
    const it = at(del.dataset.setdel);
    return it.used ? (toast(fillText(T.delBlocked, { n: it.used })), 'draw') : deleteR9Item(it);
  }
  if (cat) {
    const id = cat.dataset.setcat;
    const anyOn = items.some(i => i.cat === id && i.active);
    await setR9ItemsActive(id, !anyOn);
    await setR9CatActive(id, !anyOn);
    return true;
  }
  if (act && act.dataset.act === 'pick') { ctx.setPick(!ctx.pick); return 'draw'; }
  if (act && act.dataset.act === 'move') {
    const ids = Object.keys(sel).filter(k => sel[k]);
    if (!ids.length) return toast(T.pickNone) && 'draw';
    const to = await pickerSheet({ title: T.moveTitle, options: cats.map(c => ({ value: c.id, label: c.label, image: c.icon })) });
    if (!to) return null;
    await moveR9Items(ids, to);
    ids.forEach(id => delete sel[id]);
    toast(fillText(T.moved, { n: ids.length, cat: (cats.find(c => c.id === to) || {}).label }));
    return true;
  }
  if (act && act.dataset.act === 'add') return addR9ItemTo(items, cats, null);
  if (act && act.dataset.act === 'addCat') return addCat(cats);
  return null;
}
