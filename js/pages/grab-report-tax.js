// ชิ้นส่วนหน้ารายงานผู้บริหาร Grab ชุดที่ 5: ภาษีเงินได้บุคคลธรรมดา (ประมาณ) จากยอดขายสุทธิ Grab ทั้งปี · ตั้งค่าหักค่าใช้จ่ายต่อร้าน (บันทึกลง kk_tax_setting)
import { GRAB_UI, TAX_TH } from '../shared/config.js';
import { saveTaxSetting } from '../shared/data.js';
import { personalTax } from '../shared/calc.js';
import { currentUser } from '../shared/auth.js';
import { toast } from '../shared/ui.js';
import { secHtml } from './grab-report-view.js';
import { fillText, money, pct1, dayShort, escHtml } from '../shared/format.js';

const X = GRAB_UI.rep.tax;
const dayNo = iso => Math.round((new Date(iso + 'T00:00:00') - new Date(iso.slice(0, 4) + '-01-01T00:00:00')) / 864e5);

// ยอดทั้งปีของร้านหนึ่ง: ถึงตอนนี้ + คาดทั้งปี (เฉลี่ยต่อวันตั้งแต่วันแรกที่มีข้อมูล × จำนวนวันทั้งปี)
function yearOf(rows, shop, end) {
  const mine = rows.filter(r => r.shop === shop && Number(r.sales));
  if (!mine.length) return null;
  const ytd = mine.reduce((s, r) => s + Number(r.sales), 0), first = mine[0].day, span = dayNo(end) - dayNo(first) + 1;
  const yearDays = dayNo(end.slice(0, 4) + '-12-31') + 1;
  return { ytd, first, end, annual: ytd / span * yearDays, part: first > end.slice(0, 4) + '-01-15' };
}

const setOf = (st, shop) => ({ ...TAX_TH.defaults, ...(st.settings.find(s => s.shop === shop) || {}) });

// การ์ดภาษีของร้านเดียว (มีปุ่มเลือกวิธีหักค่าใช้จ่าย)
function shopCard(st, shop) {
  const y = yearOf(st.year, shop.id, st.end);
  if (!y) return `<p class="wempty">${X.noData}</p>`;
  const set = setOf(st, shop.id), t = personalTax(y.annual, set, TAX_TH), row = (k, v, cls = '') => `<div class="grline ${cls}"><span>${k}</span><b>${v}</b></div>`;
  const mode = `<div class="grtabs grtabs--tax" role="tablist" style="--n:2">${['flat', 'actual'].map(m => `<button type="button" data-taxmode="${m}" data-taxshop="${shop.id}" class="${set.expense_mode === m ? 'is-on' : ''}" aria-selected="${set.expense_mode === m}">${m === 'flat' ? fillText(X.flat, { p: Math.round(set.flat_rate * 100) }) : X.actual}</button>`).join('')}</div>`;
  const exp = set.expense_mode === 'actual' ? `<label class="grtaxin"><span>${X.actualIn}</span><input type="number" inputmode="decimal" min="0" step="1000" value="${set.actual_expense ?? ''}" data-taxexp="${shop.id}" placeholder="0"></label>` : '';
  return `${mode}${exp}
    <p class="grsub">${fillText(X.basis, { a: dayShort(y.first), b: dayShort(y.end), v: money(y.ytd) })}${y.part ? ' · ' + X.partial : ''}</p>
    ${row(X.income, money(t.income))}${row(set.expense_mode === 'actual' ? X.expActual : fillText(X.expFlat, { p: Math.round(set.flat_rate * 100) }), '−' + money(t.expense))}
    ${row(X.allowance, '−' + money(set.allowance))}${row(X.net, money(t.net), 'is-sum')}
    ${t.steps.map(s => row(fillText(X.step, { r: Math.round(s.rate * 100), v: money(s.part) }), money(s.tax))).join('')}
    ${row(X.progressive, money(t.progressive))}${t.minTax ? row(fillText(X.minTax, { r: pct1(TAX_TH.minRate * 100) }), money(t.minTax)) : ''}
    <div class="grtaxpay"><span>${X.pay}${t.useMin ? ` <em>${X.useMin}</em>` : ''}</span><b>฿${money(t.pay)}</b><em>${fillText(X.eff, { p: pct1(t.eff * 100), m: money(t.pay / 12) })}</em></div>
    ${y.annual > TAX_TH.vatLimit ? `<p class="grpick__warn">${fillText(X.vat, { v: money(TAX_TH.vatLimit) })}</p>` : ''}`;
}

// ส่วนภาษีของแท็บ (รายร้าน = การ์ดละเอียด · รวมทุกร้าน = ตารางรายร้าน เพราะเจ้าของบัญชีแต่ละร้านคนละคน)
export function taxHtml(st) {
  if (!st.end) return '';
  const body = st.shops.length === 1 ? shopCard(st, st.shops[0])
    : `<p class="grsub">${X.allHint}</p>` + st.shops.map(s => { const y = yearOf(st.year, s.id, st.end); if (!y) return ''; const t = personalTax(y.annual, setOf(st, s.id), TAX_TH); return `<div class="grline"><span>${escHtml(s.name)} · ${fillText(X.annualShort, { v: money(y.annual) })}</span><b>฿${money(t.pay)}</b></div>`; }).join('');
  return `<div id="gr-tax">${secHtml(fillText(X.title, { y: Number(st.end.slice(0, 4)) + 543 }), X.sub, body + `<p class="grsub">${X.note}</p>`)}</div>`;
}

// ผูกปุ่ม/ช่องของส่วนภาษี (เรียกครั้งเดียวตอนติดตั้งหน้า · st = สถานะที่หน้ารายงานอัปเดตทุกครั้งที่โหลด)
export function bindTax(root, st) {
  const redraw = () => { const box = root.querySelector('#gr-tax'); if (box) box.outerHTML = taxHtml(st); };
  const save = async (shop, changes) => {
    const old = setOf(st, shop), next = { ...old, ...changes, shop };
    st.settings = st.settings.filter(s => s.shop !== shop).concat([next]); redraw();
    try { await saveTaxSetting(shop, { expense_mode: next.expense_mode, flat_rate: next.flat_rate, actual_expense: next.actual_expense, allowance: next.allowance }, (currentUser() || {}).code); toast(X.saved); }
    catch { toast(X.saveFail); }
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-taxmode]'); if (b) save(b.dataset.taxshop, { expense_mode: b.dataset.taxmode }); });
  root.addEventListener('change', e => { const i = e.target.closest('[data-taxexp]'); if (i) save(i.dataset.taxexp, { actual_expense: i.value === '' ? null : Math.max(0, Number(i.value)) }); });
}
