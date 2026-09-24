// หน้าเตรียมอกไก่นุ่ม — ใช้ข้อมูลและสูตรชุดเดียวกับหน้าเตรียม-เหลือ (kk_prep_log ผ่าน calc.js)
import { todayIso, getPrepBundle, savePrep, getPrepHistory } from '../shared/data.js';
import { WORK_UI, CHICKEN_UI as T, PREP_ENTRY } from '../shared/config.js';
import { workFrame, workDateHtml, workStatsHtml, workNoteHtml, workHistorySheet } from '../shared/work-ui.js';
import { itemPhoto, toast, handleDateClick, handleDatePick, glyph, recHtml } from '../shared/ui.js';
import { buildPrepModel } from '../shared/calc.js';
import { buildForecast, applyRecs } from '../shared/forecast.js';
import { manageList, manageBtnHtml } from '../shared/list-edit.js';
import { staffCode } from '../shared/auth.js';
import { weightOrDash, dayShort } from '../shared/format.js';

// ช่องกรอก 1 ช่อง (ว่าง = ยังไม่กรอก ห้ามเป็น 0)
function fieldHtml(f, row) {
  const v = row[f.f];
  return `
    <section class="wcard wfield">
      <span class="wfield__lab">
        <img src="${f.icon}" alt="" width="26" height="26" loading="lazy" decoding="async">${f.label}
        <button class="wfield__hist" type="button" data-hist-f="${f.f}" aria-label="ประวัติ ${f.label}">${glyph('clock', 15)}</button>
      </span>
      <span class="wfield__box">
        <input class="wfield__in" type="number" inputmode="decimal" min="0" step="0.1" placeholder="ยังไม่กรอก" data-f="${f.f}" value="${v ?? ''}">
        <span class="wfield__unit">กก.</span>
      </span>
    </section>`;
}

// การ์ดรายการวัตถุดิบ (อกไก่นุ่มรายการเดียว)
function itemHtml(row) {
  return `
    <section class="wcard wrow">
      <span class="wrow__thumb"><img src="${itemPhoto(row)}" alt="" width="46" height="46" decoding="async"></span>
      <span class="wrow__name">${row.name}${recHtml(row.rec, T.recLabel)}</span>
      <span class="wrow__unit">${row.unit}</span>
    </section>`;
}

// การ์ดสรุปตัวเลขของวันนี้ (ยังไม่มีบันทึกของเหลือ = ขึ้นรอข้อมูล ห้ามแสดง 0)
function statHtml(row, hasLeft) {
  const val = { cooked: hasLeft ? row.cooked : null, useBase: row.useBase, use: row.use };
  const items = T.stats.map(s => ({
    label: s.label,
    value: val[s.k] === null || val[s.k] === undefined ? T.waitData : weightOrDash(val[s.k]),
    wait: val[s.k] === null || val[s.k] === undefined
  }));
  return `
    <section class="wcard">
      <div class="wsec">
        <img src="assets/fah/ic3d-bowl-check.webp" alt="" width="34" height="34" loading="lazy" decoding="async">
        <span class="wsec__text"><b>${T.statTitle}</b><em>${T.statSub}</em></span>
      </div>
      ${workStatsHtml(items)}
    </section>`;
}

// เอาโครงหน้างานมาเติมข้อมูลอกไก่นุ่มจากฐาน
export function mountChickenPage(root, onGo) {
  workFrame(root, 'fah-chicken');
  const state = { date: todayIso() };
  const el = id => root.querySelector(id);
  let row = null, draft = {}, hasLeft = false;

  const draw = () => {
    el('#w-date').innerHTML = workDateHtml(state.date);
    if (!row) { el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loading}</p>`; return; }
    el('#w-body').innerHTML = manageBtnHtml('item', 'เนื้อสัตว์') + itemHtml(row)
      + `<div class="wgrid2">${T.fields.map(f => fieldHtml(f, row)).join('')}</div>`
      + statHtml(row, hasLeft) + workNoteHtml(T.note);
  };

  const load = async () => {
    try {
      const b = await getPrepBundle(state.date);
      const model = applyRecs(buildPrepModel(b), buildForecast(b.items, b.logsFc, state.date, b.cfg), b.logsFc, state.date);
      row = model.meatRows.find(r => r.id === T.item) || null;
      hasLeft = model.conv.filled > 0;   // มีเมนูที่กรอกของเหลือแล้วอย่างน้อย 1 เมนู
      draft = {};
      if (!row) { el('#w-body').innerHTML = `<p class="wempty">${T.missing}</p>`; return; }
      draw();
    } catch {
      el('#w-body').innerHTML = `<p class="wempty">${WORK_UI.loadError}</p>`;
    }
  };

  // บันทึกทุกช่องที่กรอกใหม่ลงฐาน (แก้ = เพิ่มแถวใหม่ ของเก่าไม่หาย)
  const saveAll = async () => {
    const fields = Object.keys(draft);
    if (!fields.length) return toast(WORK_UI.nothing);
    const btn = el('[data-save]');
    btn.disabled = true;
    try {
      for (const f of fields) {
        await savePrep({ item: T.item, date: state.date, type: PREP_ENTRY.meat[f], seq: 1, qty: draft[f], by: staffCode() });
      }
      await load();
      toast(T.saved);
    } catch { toast(WORK_UI.saveError); }
    btn.disabled = false;
  };

  // ประวัติการแก้ของช่องนั้น (อ่านจากฐานทุกครั้ง)
  const history = async f => {
    const type = PREP_ENTRY.meat[f];
    const list = await getPrepHistory(T.item, state.date, type, 1);
    workHistorySheet({
      title: `${type} · ${dayShort(state.date)}`,
      rows: list.map(r => ({ label: `ครั้งที่ ${r.rev_no}`, sub: r.edited_by || r.logged_by || '', value: weightOrDash(r.qty) + ' กก.' }))
    });
  };

  draw();
  load();

  root.addEventListener('click', async event => {
    const hist = event.target.closest('[data-hist-f]');
    if (hist) return history(hist.dataset.histF);
    if (event.target.closest('[data-manage]')) return manageList({ kind: 'item', grp: 'เนื้อสัตว์', onDone: load });
    if (event.target.closest('[data-hist]')) return history('prep');
    if (event.target.closest('[data-save]')) return saveAll();
    if (event.target.closest('[data-back]')) return onGo('mywork');
    if (await handleDateClick(event, state)) { draft = {}; draw(); load(); }
  });

  // กรอกตัวเลข: เก็บไว้ในร่างก่อน รอกดบันทึก (ช่องว่าง = ยังไม่กรอก ห้ามเป็น 0)
  root.addEventListener('input', event => {
    const input = event.target.closest('input[data-f]');
    if (!input) return;
    draft[input.dataset.f] = input.value === '' ? null : Math.max(0, Number(input.value));
  });

  root.addEventListener('change', async event => {
    if (event.target.matches('#w-date-pick') && await handleDatePick(event.target.value, state)) { draft = {}; draw(); load(); }
  });
}
