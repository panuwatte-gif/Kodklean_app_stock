// หน้านับกล่องและช้อนส้อม — ใช้รายการและผลนับชุดเดียวกับหน้านับสต๊อก (kk_count_item / kk_stock_count)
import { todayIso, getPackItems, getCountHistory, saveStockCounts, getMyTasks } from '../shared/data.js';
import { WORK_UI, PACK_UI as T } from '../shared/config.js';
import { workFrame, workDateHtml, workHistorySheet } from '../shared/work-ui.js';
import { itemPhoto, toast, handleDateClick, handleDatePick } from '../shared/ui.js';
import { staffCode, workStaff } from '../shared/auth.js';import { dayShort, count, qtyOrDash, fillText } from '../shared/format.js';
import { shiftIso } from '../shared/format.js';

// แถวกรอกจำนวน 1 รายการ (ช่องว่าง = ยังไม่ได้นับ ห้ามแปลงเป็น 0)
function rowHtml(item) {
  return `
    <section class="wcard wrow" data-id="${item.id}">
      <span class="wrow__thumb"><img src="${itemPhoto(item)}" alt="" width="46" height="46" loading="lazy" decoding="async"></span>
      <span class="wrow__name">${item.name}</span>
      <span class="wstep">
        <button class="wstep__btn" type="button" data-step="-1" aria-label="ลด">−</button>
        <input class="wstep__in" type="number" inputmode="numeric" min="0" step="1" placeholder="-" value="${item.kitchen ?? ''}">
        <button class="wstep__btn" type="button" data-step="1" aria-label="เพิ่ม">+</button>
      </span>
      <span class="wrow__unit">${item.unit}</span>
    </section>`;
}

// การ์ดสรุปยอดคอนโด (อ่านอย่างเดียว — ตัวเลขมาจากผลนับของวันเดียวกัน)
function condoHtml(rows) {
  const has = rows.some(r => r.condo !== null && r.condo !== undefined);
  const body = has
    ? rows.map(r => `<div class="whist__row"><span><b>${r.name}</b></span><b>${qtyOrDash(r.condo, r.unit)} ${r.unit}</b></div>`).join('')
    : `<p class="whist__none">${T.condoNone}</p>`;
  return `
    <section class="wcard">
      <div class="wsec">
        <img src="assets/fah/ic3d-clipboard.webp" alt="" width="34" height="34" loading="lazy" decoding="async">
        <span class="wsec__text"><b>${T.condoTitle}</b><em>${T.condoSub}</em></span>
      </div>
      <div class="whist">${body}</div>
    </section>`;
}

// เอาโครงหน้างานมาเติมรายการบรรจุภัณฑ์จากฐาน
export function mountPackPage(root, onGo) {
  workFrame(root, 'fah-pack');
  const state = { date: todayIso() };
  const el = id => root.querySelector(id);
  let rows = [], dirty = {};

  const draw = () => {
    el('#w-date').innerHTML = workDateHtml(state.date);
    el('#w-body').innerHTML = rows.length
      ? rows.map(rowHtml).join('') + condoHtml(rows)
      : `<p class="wempty">${WORK_UI.loading}</p>`;
  };

  // โหลดรายการ + ผลนับของวันที่เลือก (รายการที่ต้องนับมาจากงานที่กำหนดไว้ใน kk_my_task)
  const load = async () => {
    try {
      const task = (await getMyTasks(workStaff()).catch(() => [])).find(t => t.page === 'fah-pack');
      const items = await getPackItems(task && task.responsibility ? task.responsibility : undefined);
      const counts = items.length ? await getCountHistory(items.map(i => i.id), state.date, state.date) : [];
      rows = items.map(i => {
        const found = counts.find(c => c.count_item_id === i.id) || {};
        return { ...i, kitchen: found.kitchen_qty ?? null, condo: found.condo_qty ?? null };
      });
      dirty = {};
      draw();
    } catch {
      el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loadError}</p>`;
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
        return { id, kitchen: r.kitchen, condo: r.condo };
      }), state.date, staffCode());
      dirty = {};
      toast(fillText(T.saved, { n: ids.length }));
    } catch { toast(WORK_UI.saveError); }
    btn.disabled = false;
  };

  // ผลนับย้อนหลัง 7 วัน (รวมทุกรายการต่อวัน)
  const history = async () => {
    const from = shiftIso(state.date, -6);
    const list = rows.length ? await getCountHistory(rows.map(r => r.id), from, state.date) : [];
    const byDate = {};
    list.forEach(r => { (byDate[r.count_date] = byDate[r.count_date] || []).push(r); });
    const out = Object.keys(byDate).sort().reverse().map(d => ({
      label: dayShort(d),
      sub: `${byDate[d].length} รายการ`,
      value: count(byDate[d].reduce((s, r) => s + (Number(r.kitchen_qty) || 0), 0))
    }));
    workHistorySheet({ title: T.histTitle, rows: out });
  };

  draw();
  load();

  root.addEventListener('click', async event => {
    const step = event.target.closest('[data-step]');
    if (step) {
      const input = step.parentElement.querySelector('input');
      input.value = Math.max(0, (Number(input.value) || 0) + Number(step.dataset.step));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (event.target.closest('[data-save]')) return save();
    if (event.target.closest('[data-hist]')) return history();
    if (event.target.closest('[data-back]')) return onGo('mywork');
    if (await handleDateClick(event, state)) { draw(); load(); }
  });

  root.addEventListener('input', event => {
    const input = event.target.closest('.wstep__in');
    if (!input) return;
    const id = input.closest('[data-id]').dataset.id;
    const row = rows.find(r => r.id === id);
    row.kitchen = input.value === '' ? null : Math.max(0, Number(input.value));
    dirty[id] = true;
  });

  root.addEventListener('change', async event => {
    if (event.target.matches('#w-date-pick') && await handleDatePick(event.target.value, state)) { draw(); load(); }
  });
}
