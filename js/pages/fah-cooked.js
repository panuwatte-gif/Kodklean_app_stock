// หน้าอาหารปรุงสำเร็จเหลือ — บันทึกของเหลือรายเมนู (kk_cooked_leftover) และแปลงกลับเป็นวัตถุดิบด้วย calc.js
import { todayIso, getPrepBundle, saveLeft, getLeftHistory } from '../shared/data.js';
import { WORK_UI, COOKED_UI as T, PREP_ENTRY, MENU_PHOTOS } from '../shared/config.js';
import { workFrame, workDateHtml, workNoteHtml, workHistorySheet } from '../shared/work-ui.js';
import { toast, confirmSheet, glyph, handleDateClick, handleDatePick } from '../shared/ui.js';
import { buildPrepModel, fahKeepOrNull } from '../shared/calc.js';
import { staffCode } from '../shared/auth.js';
import { gram, dayShort, fillText } from '../shared/format.js';

// ตารางกรอกของเหลือ (หน่วยกรัม · ช่องว่าง = ยังไม่กรอก)
function tableHtml(rows, draft) {
  const head = `<tr><th>${T.menuCol}</th>${T.cols.map(c => `<th>${c.label}<br>${T.unit}</th>`).join('')}<th>${T.keep}<br>${T.unit}</th></tr>`;
  const body = rows.map(r => {
    const cells = T.cols.map(c => {
      const v = draft[r.id] && c.f in draft[r.id] ? draft[r.id][c.f] : r[c.f];
      return `<td><input class="ctab__in" type="number" inputmode="numeric" min="0" step="10" placeholder="-" data-id="${r.id}" data-f="${c.f}" value="${v ?? ''}"></td>`;
    }).join('');
    const keep = fahKeepOrNull({ ...r, ...(draft[r.id] || {}) });
    return `<tr data-menu="${r.id}">
      <td><span class="ctab__menu"><img src="${MENU_PHOTOS[r.id] || 'assets/fah/ic-cooked.webp'}" alt="" width="32" height="32" loading="lazy" decoding="async"><b>${r.name}</b></span></td>
      ${cells}<td><b class="ctab__keep">${gram(keep)}</b></td></tr>`;
  }).join('');
  return `<section class="wcard"><div class="ctab__wrap"><table class="ctab"><thead>${head}</thead><tbody>${body}</tbody></table></div></section>`;
}

// การ์ดแปลงของเหลือเป็นน้ำหนักวัตถุดิบ (1:1 ตามอัตราส่วนของแต่ละเมนู)
function convHtml(model) {
  const names = {};
  (model.meatItems || []).forEach(i => { names[i.id] = i.name; });
  const keys = Object.keys(model.conv.kg);
  const chips = keys.length
    ? `<div class="cconv">${keys.map(k => `<span class="cconv__chip">${names[k] || k}<b>${model.conv.kg[k]}</b>กก.</span>`).join('')}</div>`
    : `<p class="whist__none">${T.convNone}</p>`;
  const unbound = model.conv.unboundFilled.length
    ? workNoteHtml(fillText(T.convUnbound, { names: model.conv.unboundFilled.join(', ') })) : '';
  return `
    <section class="wcard">
      <div class="wsec">
        <img src="assets/fah/ic3d-bento.webp" alt="" width="34" height="34" loading="lazy" decoding="async">
        <span class="wsec__text"><b>${T.convTitle}</b><em>${T.convSub}</em></span>
      </div>${chips}
    </section>${unbound}`;
}

// ช่องติ๊ก "วันนี้ไม่มีอาหารเหลือ" (ติ๊กแล้ว = ทุกเมนูของวันนั้นถูกบันทึกเป็น 0 แล้ว)
const noneHtml = on => `
  <section class="wcard cnone" data-none="1">
    <span class="cnone__box${on ? ' is-on' : ''}">${on ? glyph('check', 16) : ''}</span>
    <span class="cnone__text"><b>${T.noneTitle}</b><em>${T.noneSub}</em></span>
  </section>`;

// เอาโครงหน้างานมาเติมตารางเมนูจากฐาน (ลำดับเมนูเดียวกับหน้าเตรียม-เหลือ)
export function mountCookedPage(root, onGo) {
  workFrame(root, 'fah-cooked');
  const state = { date: todayIso(), q: '' };
  const el = id => root.querySelector(id);
  let model = null, draft = {};

  const visible = () => model.fahRows.filter(r => !state.q || r.name.toLowerCase().includes(state.q));

  // วันนี้บันทึกไว้แล้วว่าทุกเมนูเหลือ 0 หรือยัง (ใช้ติดสถานะช่องติ๊ก)
  const allZero = () => model.fahRows.length > 0 && model.fahRows.every(r => r.left === 0);

  const draw = () => {
    el('#w-date').innerHTML = workDateHtml(state.date);
    if (!model) { el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loading}</p>`; return; }
    el('#w-body').innerHTML = `
      <label class="wcard wfield" style="padding:8px 10px">
        <input class="wfield__in" id="w-q" type="search" placeholder="${T.search}" value="${state.q}">
      </label>
      ${tableHtml(visible(), draft)}${noneHtml(allZero())}${convHtml(model)}`;
  };

  const load = async () => {
    try {
      model = buildPrepModel(await getPrepBundle(state.date));
      draft = {};
      draw();
    } catch { el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loadError}</p>`; }
  };

  // บันทึกทุกช่องที่กรอกใหม่ (append-only ผ่าน data.js — แก้แล้วของเก่ายังอยู่)
  const saveAll = async () => {
    const jobs = [];
    Object.keys(draft).forEach(id => Object.keys(draft[id]).forEach(f => jobs.push({ id, f, qty: draft[id][f] })));
    if (!jobs.length) return toast(WORK_UI.nothing);
    const btn = el('[data-save]');
    btn.disabled = true;
    try {
      for (const j of jobs) await saveLeft({ menu: j.id, date: state.date, type: PREP_ENTRY.fah[j.f], qty: j.qty, by: staffCode() });
      await load();
      toast(T.saved);
    } catch { toast(WORK_UI.saveError); }
    btn.disabled = false;
  };

  // ไม่มีอาหารเหลือวันนี้ = บันทึกช่อง "เหลือ" ของทุกเมนูเป็น 0
  const saveNone = async () => {
    if (!await confirmSheet({ title: T.noneAsk.title, text: T.noneAsk.text, okLabel: T.noneAsk.ok })) return;
    try {
      for (const r of model.fahRows) await saveLeft({ menu: r.id, date: state.date, type: PREP_ENTRY.fah.left, qty: 0, by: staffCode() });
      await load();
      toast(T.saved);
    } catch { toast(WORK_UI.saveError); }
  };

  // ประวัติการแก้ช่อง "เหลือ" ของเมนูที่กด
  const history = async id => {
    const row = model.fahRows.find(r => r.id === id) || model.fahRows[0];
    const list = await getLeftHistory(row.id, state.date, PREP_ENTRY.fah.left);
    workHistorySheet({
      title: `${row.name} · ${PREP_ENTRY.fah.left} · ${dayShort(state.date)}`,
      rows: list.map(r => ({ label: `ครั้งที่ ${r.rev_no}`, sub: r.edited_by || r.logged_by || '', value: gram(r.qty_box) + ' ก.' }))
    });
  };

  draw();
  load();

  root.addEventListener('click', async event => {
    if (event.target.closest('[data-none]')) return saveNone();
    if (event.target.closest('[data-save]')) return saveAll();
    if (event.target.closest('[data-hist]')) return history((event.target.closest('[data-menu]') || {}).dataset?.menu);
    if (event.target.closest('[data-back]')) return onGo('mywork');
    if (await handleDateClick(event, state)) { draft = {}; draw(); load(); }
  });

  root.addEventListener('input', event => {
    const cell = event.target.closest('input[data-f]');
    if (cell) {
      const { id, f } = cell.dataset;
      (draft[id] = draft[id] || {})[f] = cell.value === '' ? null : Math.max(0, Number(cell.value));
      const row = { ...model.fahRows.find(r => r.id === id), ...draft[id] };
      const keep = cell.closest('tr').querySelector('.ctab__keep');
      if (keep) keep.textContent = gram(fahKeepOrNull(row));
      return;
    }
    if (event.target.matches('#w-q')) { state.q = event.target.value.trim().toLowerCase(); draw(); root.querySelector('#w-q').focus(); }
  });

  root.addEventListener('change', async event => {
    if (event.target.matches('#w-date-pick') && await handleDatePick(event.target.value, state)) { draft = {}; draw(); load(); }
  });
}
