// แท็บรายได้ประจำวันของแม่พัน — โหลด/บันทึกยอดขายลง kk_daily_income (ชุดข้อมูลเดียวกับหน้าของฟ้า)
import { getIncomeDay, saveIncomeDay, getIncomeHistory, getIncomeChannelsAll, setIncomeChannelActive, addIncomeChannel } from '../shared/data.js';
import { MAEPAN_UI as T, INCOME_UI as I, WORK_UI } from '../shared/config.js';
import { workHistorySheet } from '../shared/work-ui.js';
import { toast, formSheet } from '../shared/ui.js';
import { staffCode } from '../shared/auth.js';
import { incomeBrandTotal } from '../shared/calc.js';
import { money, dayShort, shiftIso, fillText, channelShort } from '../shared/format.js';

// โหลดยอดขายของวันที่เลือกจากฐาน (ช่องทางทั้งหมดโหลดมาด้วย เพื่อเปิด-ปิดได้)
export async function loadIncome(inc, date) {
  inc.error = false;
  try {
    const [day, all] = await Promise.all([getIncomeDay(date), getIncomeChannelsAll()]);
    inc.brands = day.brands; inc.channels = day.channels; inc.all = all;
    inc.data = {};
    day.brands.forEach(b => {
      const head = day.heads.find(h => h.brand_id === b.id);
      const amounts = {};
      if (head) day.lines.filter(l => l.income_id === head.id).forEach(l => { amounts[l.channel_id] = l.amount === null ? null : Number(l.amount); });
      inc.data[b.id] = { note: head ? head.note || '' : '', amounts };
    });
    inc.brand = inc.brand && inc.brands.some(b => b.id === inc.brand) ? inc.brand : (inc.brands[0] || {}).id;
    inc.dirty = {};
    inc.ready = true;
  } catch { inc.error = true; inc.ready = true; }
}

// บันทึกทุกร้านที่มีการกรอกใหม่
export async function saveIncome(inc, date) {
  const ids = Object.keys(inc.dirty);
  if (!ids.length) { toast(WORK_UI.nothing); return false; }
  try {
    for (const id of ids) {
      await saveIncomeDay({ date, brand: id, note: inc.data[id].note, by: staffCode(), amounts: inc.data[id].amounts });
    }
    toast(fillText(I.saved, { name: (inc.brands.find(b => b.id === ids[0]) || {}).name || '' }));
    return true;
  } catch { toast(WORK_UI.saveError); return false; }
}

// แผงยอดขายย้อนหลัง 14 วัน
export async function incomeHistory(inc, date) {
  const rows = await getIncomeHistory(shiftIso(date, -13), date);
  workHistorySheet({
    title: I.histTitle,
    rows: rows.map(r => ({
      label: dayShort(r.date),
      sub: (inc.brands.find(b => b.id === r.brand) || {}).name || r.brand,
      value: money(r.total) + ' ' + I.unit
    }))
  });
}

// กดปุ่มในแท็บนี้ (คืน true = จัดการแล้ว)
export async function incomeClick(event, ctx) {
  const { inc, draw, reload } = ctx;
  const pick = event.target.closest('[data-brand]');
  if (pick) { inc.brand = pick.dataset.brand; draw(); return true; }
  const sw = event.target.closest('[data-ch-sw]');
  if (sw) {
    const ch = inc.all.find(c => c.id === sw.dataset.chSw);
    try {
      await setIncomeChannelActive(ch.id, !ch.active);
      toast(fillText(ch.active ? T.chOff : T.chOn, { name: channelShort(ch.name) }));
      reload();
    } catch { toast(WORK_UI.saveError); }
    return true;
  }
  if (event.target.closest('[data-ch-add]')) {
    const got = await formSheet({ title: T.chAddTitle, fields: [{ key: 'name', label: T.chAddName, value: '' }] });
    if (got && got.name) {
      try {
        await addIncomeChannel({ id: 'ch-' + Date.now(), name: got.name, sort_order: inc.all.length + 1 });
        toast(fillText(T.chAdded, { name: got.name }));
        reload();
      } catch { toast(WORK_UI.saveError); }
    }
    return true;
  }
  return false;
}

// กรอกยอด/หมายเหตุ (เก็บไว้ในหน้าจนกดบันทึก)
export function incomeInput(event, ctx) {
  const { inc, root } = ctx;
  const cur = inc.data[inc.brand];
  if (!cur) return false;
  const field = event.target.closest('input[data-ch]');
  if (field) {
    cur.amounts[field.dataset.ch] = field.value === '' ? null : Math.max(0, Number(field.value));
    inc.dirty[inc.brand] = true;
    const box = root.querySelector('.mp-total b');
    const total = incomeBrandTotal(cur.amounts);
    if (box) box.textContent = total === null ? '–' : money(total);
    return true;
  }
  if (event.target.matches('#mp-inote')) { cur.note = event.target.value; inc.dirty[inc.brand] = true; return true; }
  return false;
}
