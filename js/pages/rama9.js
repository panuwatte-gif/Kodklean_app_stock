// หน้าพระราม 9 — คุมสถานะหน้า โหลดข้อมูลจริงจากฐาน และต่อทุกปุ่มเข้ากับประตูข้อมูล (การวาดอยู่ที่ rama9-view / -send / -history / -report / -setup)
import { getR9Bundle, getR9Revisions, getR9Draft, saveR9Draft, voidR9Round, todayIso } from '../shared/data.js';
import { staffCode } from '../shared/auth.js';
import { R9_UI, R9_PLACE } from '../shared/config.js';
import { fillGlyphs, toast, openSheet, confirmSheet, pickerSheet, printArea, glyph, handleDateClick, handleDatePick, r9Photo } from '../shared/ui.js';
import { r9Row, r9RoundTotals, r9DraftItems } from '../shared/calc.js';
import { r9SendProblem, r9SendRound, r9EmptyDraft } from '../shared/r9-send.js';
import { money, moneyFine, weight, dayLongTh, fillText } from '../shared/format.js';
import { heroHtml, kpisHtml, tabsHtml } from './rama9-view.js';
import { dateHtml, tableHtml, sumHtml, footHtml, sendInput } from './rama9-send.js';
import { filterHtml, roundsHtml, briefHtml } from './rama9-history.js';
import { pickHtml, reportHtml } from './rama9-report.js';
import { setupHtml, handleSetupClick, editR9Item, deleteR9Item, changeR9Photo, moveR9Item, addR9ItemTo } from './rama9-setup.js';

// สิ่งที่ผู้ใช้เลือกอยู่บนหน้านี้ (ไม่แชร์ข้ามหน้า)
const view = {
  tab: 'send', date: todayIso(), closed: {}, rClosed: {}, range: 'all', q: '', picked: {}, from: '', to: '', rPage: 0,
  cats: [], items: [], rounds: [], draft: null, saving: false, loading: true, error: false, sel: {}, pick: false
};

// รอบส่งที่อยู่ในช่วงเวลาที่เลือก + ตรงกับคำค้น
function pickRounds(rounds, today) {
  const ym = today.slice(0, 7), yr = today.slice(0, 4);
  const last = rounds[rounds.length - 1];
  return rounds.filter(rd => {
    if (view.range === 'month' && rd.date.slice(0, 7) !== ym) return false;
    if ((view.range === 'ytd' || view.range === 'year') && rd.date.slice(0, 4) !== yr) return false;
    if (view.range === 'last' && (!last || rd.id !== last.id)) return false;
    if (view.q && !(`#${rd.no} ${dayLongTh(rd.date)}`).includes(view.q)) return false;
    return true;
  });
}

// ตัวเลขบนการ์ดสรุปหัวหน้า ของแท็บที่กำลังเปิด
function kpiVals(tab, rounds, today, picked) {
  const sum = list => list.reduce((a, rd) => {
    const t = r9RoundTotals(rd);
    return { items: a.items + t.items, net: a.net + t.net, fee: a.fee + t.fee };
  }, { items: 0, net: 0, fee: 0 });
  const all = sum(rounds);
  const month = sum(rounds.filter(rd => rd.date.slice(0, 7) === today.slice(0, 7)));
  const ytd = sum(rounds.filter(rd => rd.date.slice(0, 4) === today.slice(0, 4)));
  const last = rounds[rounds.length - 1];
  if (tab === 'report') {
    const p = sum(picked);
    return { rounds: picked.length, items: p.items, fee: p.fee, goods: p.net - p.fee, pickFoot: 'ในช่วงที่เลือก' };
  }
  return {
    rounds: rounds.length, roundFoot: 'ทั้งหมดในช่วงนี้',
    lastItems: last ? r9RoundTotals(last).items : 0, lastDate: last ? dayLongTh(last.date) : '',
    monthItems: month.items, monthFoot: 'ในเดือนนี้',
    ytdItems: ytd.items, ytdFoot: 'ตั้งแต่ต้นปี',
    netAll: all.net, netFoot: 'ทุกรอบรวมกัน',
    feeAll: all.fee, feeFoot: 'ค่าส่งทุกรอบ'
  };
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมข้อมูลพระราม 9 จากประตูข้อมูล
export function mountRama9Page(root) {
  view.date = todayIso();
  view.draft = getR9Draft();
  fillGlyphs(root, 17);
  const el = id => root.querySelector(id);
  const body = el('#r9-body');
  const inRange = rd => rd.date >= view.from && rd.date <= view.to;

  // รายการที่เปิดใช้ + ค่าที่กำลังกรอกของรอบนี้ (สูตรรวมอยู่ที่ calc.js)
  const sendItems = () => r9DraftItems(view.items, view.draft);

  // โหลดข้อมูลทั้งหน้าจากฐานในครั้งเดียว
  const load = async () => {
    view.loading = true; view.error = false;
    try {
      const b = await getR9Bundle();
      view.cats = b.cats; view.items = b.items; view.rounds = b.rounds;
      const first = b.rounds.length ? b.rounds[0].date : view.date;
      if (!view.from || view.from > first) view.from = first;
      if (!view.to) view.to = view.date;
      b.rounds.forEach(rd => { if (view.picked[rd.id] === undefined) view.picked[rd.id] = true; });
    } catch { view.error = true; }
    view.loading = false;
    draw();
  };

  const draw = () => {
    const listed = pickRounds(view.rounds, view.date);
    const picked = view.rounds.filter(rd => view.picked[rd.id] && inRange(rd));
    el('#r9-hero').innerHTML = heroHtml(view.tab === 'setup' ? 'send' : view.tab);
    el('#r9-kpis').innerHTML = kpisHtml(view.tab, kpiVals(view.tab, view.tab === 'history' ? listed : view.rounds, view.date, picked));
    el('#r9-tabs').innerHTML = tabsHtml(view.tab);
    el('#r9-sub').textContent = view.tab === 'history' ? R9_PLACE.subHistory : view.tab === 'report' ? R9_PLACE.subReport : R9_PLACE.sub;
    el('#r9-date').textContent = view.tab === 'report' ? `${dayLongTh(view.from)} - ${dayLongTh(view.to)}` : dayLongTh(view.date);
    if (view.error) { body.innerHTML = `<div class="r9-card"><p class="r9-empty">${R9_UI.loadError} <button class="r9-btn r9-btn--soft" type="button" data-act="retry">${R9_UI.retry}</button></p></div>`; return; }
    if (view.loading) { body.innerHTML = `<div class="r9-card"><p class="r9-empty">${R9_UI.loading}</p></div>`; return; }
    if (view.tab === 'send') {
      const items = sendItems();
      body.innerHTML = dateHtml(view.date) + tableHtml(items, view.cats.filter(c => c.active), view.closed)
        + sumHtml(items, view.draft.fee) + footHtml({ note: view.draft.note, saving: view.saving, editing: view.draft.editing });
    }
    else if (view.tab === 'history') body.innerHTML = filterHtml(view) + roundsHtml(listed, view.items, view.cats, view.rounds.length ? view.rounds[view.rounds.length - 1].id : null) + briefHtml(view.rounds);
    else if (view.tab === 'setup') body.innerHTML = setupHtml(view.items, view.cats, view.sel, view.pick);
    else {
      const maxPage = Math.max(0, Math.ceil(picked.length / 3) - 1);
      if (view.rPage > maxPage) view.rPage = maxPage;
      body.innerHTML = pickHtml(view, view.rounds) + `<div id="r9-print">${reportHtml(picked, view.items, view.cats, view, view.rClosed)}</div>`;
    }
  };

  const keepDraft = () => { view.draft = saveR9Draft(view.draft); };

  // ล้างปริมาณ ราคา ค่าส่ง หมายเหตุ และสถานะกำลังแก้ของรอบนี้
  const clearDraft = () => {
    view.draft = r9EmptyDraft(view.date);
    keepDraft();
  };

  // บันทึกและส่ง: สร้างกุญแจครั้งเดียว ปุ่มกดไม่ได้ระหว่างรอ ส่งไม่สำเร็จใช้กุญแจเดิมซ้ำได้ (ไม่มีรอบซ้ำ)
  const send = async () => {
    if (view.saving) return;
    const items = sendItems();
    const problem = r9SendProblem(items);
    if (problem) return toast(problem);
    const editing = view.draft.editing;
    view.saving = true; draw();
    try {
      await r9SendRound({ date: view.date, items, draft: view.draft });
      clearDraft();
      view.saving = false;
      view.tab = 'history';
      await load();
      const fresh = view.rounds.reduce((a, b) => (!a || b.id > a.id ? b : a), null);
      toast(editing ? fillText(R9_UI.savedEdit, { no: editing.no }) : fillText(R9_UI.saved, { no: fresh ? fresh.no : '' }));
    } catch {
      view.saving = false;
      draw();
      toast(R9_UI.saveError);
    }
  };

  // ทำซ้ำ / แก้รอบเดิม: ดึงปริมาณและราคาของรอบนั้นมาเป็นร่างของวันที่เลือก (ต้องกดบันทึกเองอีกที)
  const toDraft = (id, editing) => {
    const rd = view.rounds.find(r => r.id === id);
    view.draft = { date: view.date, qty: {}, price: {}, fee: rd.fee || '', note: rd.note || '', editing: editing ? { id: rd.id, no: rd.no } : null, key: null };
    (rd.lines || []).forEach(l => { view.draft.qty[l.id] = l.qty; view.draft.price[l.id] = l.price; });
    keepDraft();
    view.tab = 'send';
    draw();
    toast(editing ? fillText(R9_UI.editing, { no: rd.no }) : `ทำซ้ำรอบ #${rd.no} แล้ว`);
  };

  // ดูรายละเอียดรอบส่ง (อ่านอย่างเดียว)
  const detail = id => {
    const rd = view.rounds.find(r => r.id === id);
    const t = r9RoundTotals(rd);
    const options = (rd.lines || []).map(l => {
      const it = view.items.find(i => i.id === l.id) || { name: l.id, unit: '', photo: '' };
      return { value: '', label: `${it.name} · ${weight(l.qty)} ${it.unit} × ${moneyFine(l.price)} = ${moneyFine(r9Row(l))} บาท`, image: r9Photo(it) };
    }).concat([{ value: '', label: `ค่าส่ง ${money(rd.fee)} บาท · ยอดสุทธิ ${money(t.net)} บาท`, image: 'assets/r9/truck.webp' }]);
    pickerSheet({ title: `รอบส่งของ #${rd.no} · ${dayLongTh(rd.date)}`, options });
  };

  // ของเดิมของรอบที่เคยแก้: เดิมเท่าไหร่ ใครแก้ เมื่อไหร่ (อ่านจากฐานทุกครั้ง)
  const revisions = async id => {
    const rd = view.rounds.find(r => r.id === id);
    const rows = await getR9Revisions(rd.rootId);
    const list = rows.map(r => {
      const t = r9RoundTotals({ fee: Number(r.fee) || 0, lines: (r.lines || []).map(l => ({ qty: Number(l.qty), price: Number(l.price) })) });
      const at = new Date(r.created_at);
      return `<div class="hist__row${r.is_current ? ' is-cur' : ''}"><span>${fillText(R9_UI.revRow, {
        n: r.rev_no, items: t.items, net: money(t.net), by: r.edited_by || r.sent_by || '', at: `${dayLongTh(r.date)} ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
      })}</span><i>${r.is_current ? R9_UI.revNow : ''}</i></div>`;
    }).join('');
    openSheet(`<div class="ask__title">รอบส่งของ #${rd.no} · ${R9_UI.revHistory}</div><div class="hist">${list}</div>
      <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">ปิด</button></div>`);
  };

  // ลบรอบ = ปิดไม่ให้นับในรายงาน (ของเก่ายังอยู่ในฐาน)
  const voidRound = async id => {
    const rd = view.rounds.find(r => r.id === id);
    if (!await confirmSheet({ title: R9_UI.delAsk.title, text: `รอบ #${rd.no} · ${dayLongTh(rd.date)} — ${R9_UI.delAsk.text}`, okLabel: R9_UI.delAsk.ok, danger: true })) return;
    try { await voidR9Round(rd.id, staffCode()); delete view.picked[rd.id]; await load(); toast(fillText(R9_UI.deleted, { no: rd.no })); }
    catch { toast(R9_UI.saveError); }
  };

  // ชิปช่วงเวลาในแท็บ Report ปรับช่วงวันที่ให้ตรงกัน
  const applyRange = () => {
    const last = view.rounds[view.rounds.length - 1];
    if (view.range === 'month') { view.from = view.date.slice(0, 7) + '-01'; view.to = view.date; }
    else if (view.range === 'ytd' || view.range === 'year') { view.from = view.date.slice(0, 4) + '-01-01'; view.to = view.date; }
    else if (view.range === 'last' && last) { view.from = last.date; view.to = last.date; }
    else { view.from = view.rounds.length ? view.rounds[0].date : view.date; view.to = view.date; }
  };

  draw();
  load();

  root.addEventListener('click', async event => {
    const hit = sel => event.target.closest(sel);
    const tab = hit('[data-tab]'), grp = hit('[data-group]'), tool = hit('[data-tool]'), act = hit('[data-act]');
    const range = hit('[data-range]'), pick = hit('[data-pickround]'), ex = hit('[data-export]');
    const rep = hit('[data-repeat]'), det = hit('[data-detail]'), addin = hit('[data-addin]'), rgrp = hit('[data-rgroup]');
    const rpg = hit('[data-rpage]'), ed = hit('[data-edit]'), revs = hit('[data-revs]'), vd = hit('[data-void]');

    if (view.tab === 'setup' && (hit('[data-setsw]') || hit('[data-setedit]') || hit('[data-setdel]') || hit('[data-setcat]') || hit('[data-setpick]') || hit('[data-setphoto]') || act)) {
      const res = await handleSetupClick(event, { items: view.items, cats: view.cats, sel: view.sel, pick: view.pick, setPick: v => { view.pick = v; } });
      if (res === true) return load();
      if (res === 'draw') return draw();
      if (res !== null) return;
    }
    if (rpg) { view.rPage = Number(rpg.dataset.rpage); draw(); }
    else if (tab) { view.tab = tab.dataset.tab; draw(); }
    else if (rgrp) { const k = rgrp.dataset.rgroup; view.rClosed[k] = !view.rClosed[k]; draw(); }
    else if (grp) { const k = grp.dataset.group; view.closed[k] = !view.closed[k]; draw(); }
    else if (tool) {
      const it = view.items.find(i => i.id === hit('.r9-item[data-id]').dataset.id), kind = tool.dataset.tool;
      let res = null;
      if (kind === 'photo') res = await changeR9Photo(it);
      else if (kind === 'edit') res = await editR9Item(it, view.cats);
      else if (kind === 'delete') res = await deleteR9Item(it);
      else if (kind === 'move') {
        const dir = await pickerSheet({ title: 'จัดลำดับรายการ', options: [{ value: 'up', label: 'ย้ายขึ้น' }, { value: 'down', label: 'ย้ายลง' }] });
        if (dir) res = await moveR9Item(view.items, it.id, dir === 'up' ? -1 : 1);
      }
      if (res) load();
    }
    else if (addin) { if (await addR9ItemTo(view.items, view.cats, addin.dataset.addin)) load(); }
    else if (act) {
      const kind = act.dataset.act;
      if (kind === 'send') send();
      else if (kind === 'retry') load();
      else if (kind === 'editCancel') { clearDraft(); draw(); }
      else if (kind === 'clear') { if (await confirmSheet({ ...R9_UI.clearAsk, okLabel: R9_UI.clearAsk.ok, danger: true })) { clearDraft(); draw(); toast(R9_UI.cleared); } }
      else if (kind === 'build') { draw(); toast('สร้างรายงานตามช่วงที่เลือกแล้ว'); }
    }
    else if (range) { view.range = range.dataset.range; if (view.tab === 'report') applyRange(); draw(); }
    else if (pick) { const k = pick.dataset.pickround; view.picked[k] = !view.picked[k]; view.rPage = 0; draw(); }
    else if (rep) toDraft(Number(rep.dataset.repeat), false);
    else if (ed) toDraft(Number(ed.dataset.edit), true);
    else if (revs) revisions(Number(revs.dataset.revs));
    else if (vd) voidRound(Number(vd.dataset.void));
    else if (det) detail(Number(det.dataset.detail));
    else if (ex) { if (ex.dataset.export === 'print') printArea('.r9'); else toast(R9_UI.exportOff); }
    else if (await handleDateClick(event, view)) draw();
  });

  // กรอกปริมาณ/ราคา/ค่าส่ง/หมายเหตุ → เก็บเป็นร่างของรอบนี้ (ยังไม่ขึ้นฐานจนกดบันทึก)
  root.addEventListener('input', event => {
    if (sendInput(event, { draft: view.draft, items: view.items, root, save: keepDraft })) return;
    const elm = event.target;
    if (elm.matches('#r9-note')) { view.draft.note = elm.value; keepDraft(); }
    else if (elm.matches('#r9-q')) { view.q = elm.value.trim(); draw(); }
  });

  root.addEventListener('change', async event => {
    const elm = event.target;
    if (elm.matches('[data-from]')) { view.from = elm.value; draw(); }
    else if (elm.matches('[data-to]')) { view.to = elm.value; draw(); }
    else if (elm.matches('#r9-date-pick') && await handleDatePick(elm.value, view)) draw();
  });
}
