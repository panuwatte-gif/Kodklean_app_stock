// แท็บบันทึกส่งพระราม 9 ของแม่พัน — ใช้รายการ ราคา รอบส่ง และร่างชุดเดียวกับหน้าพระราม 9 (ตาราง kk_r9_item / kk_r9_round)
import { getR9Bundle, getR9Draft, saveR9Draft } from '../shared/data.js';
import { MAEPAN_UI as T, R9_UI } from '../shared/config.js';
import { workNoteHtml, workHistorySheet } from '../shared/work-ui.js';
import { toast, printArea, downloadText } from '../shared/ui.js';
import { r9DraftItems, r9RoundTotals } from '../shared/calc.js';
import { r9SendProblem, r9SendRound, r9EmptyDraft } from '../shared/r9-send.js';
import { tableHtml, sumHtml, sendInput } from './rama9-send.js';
import { reportCardHtml, reportHtml, reportFile } from './maepan-report.js';
import { money, dayLongTh } from '../shared/format.js';

// เนื้อหาทั้งแท็บ: ตารางกรอกรายการ → ยอดรอบนี้ → หมายเหตุ → การ์ดสร้างรายงาน → รายงานที่สร้างไว้
export function r9Body(r9, state) {
  if (r9.error) return `<p class="mp-empty">${R9_UI.loadError}</p>`;
  if (!r9.ready) return `<p class="mp-empty">${R9_UI.loading}</p>`;
  const items = r9DraftItems(r9.items, r9.draft);
  return tableHtml(items, r9.cats.filter(c => c.active), state.closed, { tools: false })
    + sumHtml(items, r9.draft.fee)
    + `<textarea class="r9-note" id="mp-r9note" placeholder="${R9_UI.notePlaceholder}">${r9.draft.note || ''}</textarea>`
    + reportCardHtml(state)
    + `<div id="mp-print">${state.built ? reportHtml(state, r9) : ''}</div>`
    + workNoteHtml(T.r9Note);
}

// โหลดรายการและรอบส่งทั้งหมดจากฐาน
export async function loadR9(r9, state) {
  r9.error = false;
  try {
    const b = await getR9Bundle();
    r9.cats = b.cats; r9.items = b.items; r9.rounds = b.rounds;
    r9.draft = getR9Draft();
    if (!r9.draft.date) r9.draft = saveR9Draft(r9EmptyDraft(state.date));
    if (!state.from) state.from = b.rounds.length ? b.rounds[0].date : state.date;
    if (!state.to) state.to = state.date;
    r9.ready = true;
  } catch { r9.error = true; r9.ready = true; }
}

// ยืนยันส่งแล้ว = บันทึกรอบส่งขึ้นฐาน (กุญแจกันกดเบิ้ลอยู่ในร่าง)
export async function sendR9(r9, state) {
  const items = r9DraftItems(r9.items, r9.draft);
  const problem = r9SendProblem(items);
  if (problem) { toast(problem); return false; }
  try {
    await r9SendRound({ date: state.date, items, draft: r9.draft });
    r9.draft = saveR9Draft(r9EmptyDraft(state.date));
    toast(R9_UI.sent);
    return true;
  } catch { toast(R9_UI.saveError); return false; }
}

// แผงประวัติการส่ง 10 รอบล่าสุด
export function r9History(r9) {
  const rows = [...r9.rounds].reverse().slice(0, 10).map(rd => {
    const t = r9RoundTotals(rd);
    return { label: dayLongTh(rd.date), sub: `รอบ #${rd.no} · ${t.items} รายการ`, value: money(t.net) + ' บาท' };
  });
  workHistorySheet({ title: T.histSend, rows });
}

// กดปุ่มในแท็บนี้ (คืน true = จัดการแล้ว)
export function r9Click(event, ctx) {
  const { r9, state, draw } = ctx;
  const grp = event.target.closest('[data-group]');
  if (grp) { const k = grp.dataset.group; state.closed[k] = !state.closed[k]; draw(); return true; }
  const act = event.target.closest('[data-act]');
  if (!act) return false;
  const kind = act.dataset.act;
  if (kind === 'build') { state.built = true; draw(); toast(T.report.built); }
  else if (kind === 'print') printArea('#mp-print');
  else if (kind === 'csv') { const f = reportFile(state, r9); downloadText(f.name, f.text); }
  return true;
}

// กรอกปริมาณ/ราคา/ค่าส่ง/หมายเหตุลงร่าง (ยังไม่ขึ้นฐานจนกดยืนยัน)
export function r9Input(event, ctx) {
  const { r9, root } = ctx;
  const save = () => { r9.draft = saveR9Draft(r9.draft); };
  if (sendInput(event, { draft: r9.draft, items: r9.items, root, save })) return true;
  if (event.target.matches('#mp-r9note')) { r9.draft.note = event.target.value; save(); return true; }
  return false;
}
