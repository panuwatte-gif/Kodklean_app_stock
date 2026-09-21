// หน้ารายได้ประจำวัน — บันทึกยอดขายรายร้านรายช่องทาง (kk_daily_income / kk_daily_income_line)
import { todayIso, getIncomeDay, saveIncomeDay, getIncomeHistory } from '../shared/data.js';
import { WORK_UI, INCOME_UI as T } from '../shared/config.js';
import { workFrame, workDateHtml, workNoteHtml, workHistorySheet } from '../shared/work-ui.js';
import { toast, handleDateClick, handleDatePick } from '../shared/ui.js';
import { staffCode } from '../shared/auth.js';
import { money, dayShort, shiftIso, fillText } from '../shared/format.js';

// ยอดรวมของร้านหนึ่ง (ยังไม่กรอกสักช่อง = null ห้ามแสดง 0)
function brandTotal(values) {
  const nums = Object.values(values || {}).filter(v => v !== null && v !== undefined && v !== '');
  return nums.length ? nums.reduce((s, v) => s + Number(v), 0) : null;
}

// แท็บเลือกร้าน
const tabsHtml = (brands, on) => `<div class="itabs">${brands.map(b => `
  <button class="itab${b.id === on ? ' is-on' : ''}" type="button" data-brand="${b.id}">
    ${b.logo ? `<img src="${b.logo}" alt="" width="24" height="24" loading="lazy" decoding="async">` : ''}<span>${b.name}</span>
  </button>`).join('')}</div>`;

// การ์ดกรอกของร้านที่เลือกอยู่
function formHtml(brand, channels, data) {
  const fields = channels.map(c => `
    <div class="lfield">
      <span class="lfield__lab" style="width:118px">${c.name}</span>
      <input class="wfield__in" type="number" inputmode="numeric" min="0" step="1" placeholder="${T.placeholder}" data-ch="${c.id}" value="${data.amounts[c.id] ?? ''}">
      <span class="wfield__unit">${T.unit}</span>
    </div>`).join('');
  const total = brandTotal(data.amounts);
  return `
    <section class="wcard">
      <div class="wsec">
        <img src="${brand.logo || 'assets/fah/ic-income.webp'}" alt="" width="34" height="34" loading="lazy" decoding="async">
        <span class="wsec__text"><b>${brand.name}</b><em>${T.fill}</em></span>
      </div>
      ${fields}
      <div class="lfield" style="align-items:flex-start">
        <span class="lfield__lab" style="width:118px;padding-top:8px">${T.noteLabel}</span>
        <textarea class="iarea" id="w-note" placeholder="${T.notePlaceholder}">${data.note || ''}</textarea>
      </div>
      <div class="itotal">
        <img src="assets/fah/ic-income.webp" alt="" width="26" height="26" loading="lazy" decoding="async">
        <span>${T.total}</span>
        <b>${total === null ? '-' : money(total)}</b><em>${T.unit}</em>
      </div>
    </section>`;
}

// แถวร้านอื่นที่ยังไม่ได้เปิดอยู่
const rowHtml = (brand, data) => {
  const total = brandTotal(data.amounts);
  return `
    <section class="wcard irow" data-brand="${brand.id}">
      <img src="${brand.logo || 'assets/fah/ic-income.webp'}" alt="" width="28" height="28" loading="lazy" decoding="async">
      <span class="irow__name">${brand.name}</span>
      <span class="irow__val${total === null ? '' : ' is-filled'}">${total === null ? T.empty : money(total) + ' ' + T.unit}</span>
      <span class="mytask__go">›</span>
    </section>`;
};

// เอาโครงหน้างานมาเติมยอดขายจากฐาน
export function mountIncomePage(root, onGo) {
  workFrame(root, 'fah-income');
  const state = { date: todayIso(), brand: null };
  const el = id => root.querySelector(id);
  let brands = [], channels = [], data = {}, dirty = {};

  const draw = () => {
    el('#w-date').innerHTML = workDateHtml(state.date);
    if (!brands.length) { el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loading}</p>`; return; }
    const cur = brands.find(b => b.id === state.brand) || brands[0];
    el('#w-body').innerHTML = tabsHtml(brands, cur.id)
      + formHtml(cur, channels, data[cur.id])
      + brands.filter(b => b.id !== cur.id).map(b => rowHtml(b, data[b.id])).join('')
      + workNoteHtml(T.info);
  };

  const load = async () => {
    try {
      const day = await getIncomeDay(state.date);
      brands = day.brands;
      channels = day.channels;
      data = {};
      brands.forEach(b => {
        const head = day.heads.find(h => h.brand_id === b.id);
        const amounts = {};
        if (head) day.lines.filter(l => l.income_id === head.id).forEach(l => { amounts[l.channel_id] = l.amount === null ? null : Number(l.amount); });
        data[b.id] = { note: head ? head.note || '' : '', amounts };
      });
      state.brand = state.brand && brands.some(b => b.id === state.brand) ? state.brand : (brands[0] || {}).id;
      dirty = {};
      draw();
    } catch { el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loadError}</p>`; }
  };

  // บันทึกทุกร้านที่มีการกรอกใหม่
  const saveAll = async () => {
    const ids = Object.keys(dirty);
    if (!ids.length) return toast(WORK_UI.nothing);
    const btn = el('[data-save]');
    btn.disabled = true;
    try {
      for (const id of ids) {
        await saveIncomeDay({ date: state.date, brand: id, note: data[id].note, by: staffCode(), amounts: data[id].amounts });
      }
      await load();
      toast(fillText(T.saved, { name: (brands.find(b => b.id === ids[0]) || {}).name || '' }));
    } catch { toast(WORK_UI.saveError); }
    btn.disabled = false;
  };

  const history = async () => {
    const rows = await getIncomeHistory(shiftIso(state.date, -13), state.date);
    workHistorySheet({
      title: T.histTitle,
      rows: rows.map(r => ({
        label: dayShort(r.date),
        sub: (brands.find(b => b.id === r.brand) || {}).name || r.brand,
        value: money(r.total) + ' ' + T.unit
      }))
    });
  };

  draw();
  load();

  root.addEventListener('click', async event => {
    const tab = event.target.closest('[data-brand]');
    if (tab) { state.brand = tab.dataset.brand; draw(); return; }
    if (event.target.closest('[data-save]')) return saveAll();
    if (event.target.closest('[data-hist]')) return history();
    if (event.target.closest('[data-back]')) return onGo('mywork');
    if (await handleDateClick(event, state)) { draw(); load(); }
  });

  root.addEventListener('input', event => {
    const cur = data[state.brand];
    const ch = event.target.closest('input[data-ch]');
    if (ch) {
      cur.amounts[ch.dataset.ch] = ch.value === '' ? null : Math.max(0, Number(ch.value));
      dirty[state.brand] = true;
      const total = brandTotal(cur.amounts);
      const box = el('.itotal b');
      if (box) box.textContent = total === null ? '-' : money(total);
      return;
    }
    if (event.target.matches('#w-note')) { cur.note = event.target.value; dirty[state.brand] = true; }
  });

  root.addEventListener('change', async event => {
    if (event.target.matches('#w-date-pick') && await handleDatePick(event.target.value, state)) { draw(); load(); }
  });
}
