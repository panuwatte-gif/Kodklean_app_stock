// หน้างานของแม่พัน — คุม 2 แท็บ (รายได้ประจำวัน / บันทึกส่งพระราม 9) วันที่ทำงาน และปุ่มบันทึกของแต่ละแท็บ
import { todayIso, getStaff } from '../shared/data.js';
import { MAEPAN_UI as T } from '../shared/config.js';
import { workTopHtml, workFootHtml } from '../shared/work-ui.js';
import { dateBarHtml, dateBandHtml, handleDateClick, handleDatePick } from '../shared/ui.js';
import { workStaff } from '../shared/auth.js';
import { heroHtml, tabsHtml } from './maepan-view.js';
import { incomeBody } from './maepan-income-view.js';
import { loadIncome, saveIncome, incomeHistory, incomeClick, incomeInput } from './maepan-income.js';
import { r9Body, loadR9, sendR9, r9History, r9Click, r9Input } from './maepan-r9.js';

const ROLE_TEXT = { owner: 'เจ้าของร้าน', lead: 'หัวหน้า', staff: 'พนักงาน' };

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมงานของแม่พัน (startTab = แท็บที่เปิดก่อน)
export function mountMaepanPage(root, onGo, startTab = 'income') {
  const state = { tab: startTab, date: todayIso(), closed: {}, from: '', to: '', built: false };
  const inc = { brands: [], channels: [], all: [], data: {}, dirty: {}, brand: null, ready: false, error: false };
  const r9 = { cats: [], items: [], rounds: [], draft: null, ready: false, error: false };
  const el = sel => root.querySelector(sel);

  const draw = () => {
    const page = T.pages[state.tab];
    el('#mp-hero').innerHTML = heroHtml(state.tab);
    el('#mp-date').innerHTML = dateBarHtml(state.date, 'mp-date-pick') + dateBandHtml(state.date);
    el('#mp-tabs').innerHTML = tabsHtml(state.tab);
    el('#mp-body').innerHTML = state.tab === 'income' ? incomeBody(inc) : r9Body(r9, state);
    el('#mp-foot').innerHTML = workFootHtml(page.save, page.hist);
  };

  const ctx = { state, inc, r9, root, draw, reload: () => reload() };

  // โหลดข้อมูลของแท็บที่เปิดอยู่ (โหลดครั้งเดียว แล้วเก็บไว้)
  const load = async () => {
    if (state.tab === 'income' && !inc.ready) { await loadIncome(inc, state.date); draw(); }
    if (state.tab === 'r9' && !r9.ready) { await loadR9(r9, state); draw(); }
  };

  const reload = async () => {
    if (state.tab === 'income') inc.ready = false; else r9.ready = false;
    draw();
    await load();
  };

  // ชื่อคนบนแถบบนสุดมาจากฐาน (kk_staff)
  const code = workStaff();
  el('#mp-top').innerHTML = workTopHtml({ code, name: '', role: '' }, T.back);
  getStaff().then(staff => {
    const me = staff.find(s => s.code === code);
    if (me) el('#mp-top').innerHTML = workTopHtml({ code, name: me.name, role: ROLE_TEXT[me.role] || 'พนักงาน' }, T.back);
  }).catch(() => {});

  draw();
  load();

  root.addEventListener('click', async event => {
    const tab = event.target.closest('[data-tab]');
    if (tab) { state.tab = tab.dataset.tab; draw(); return load(); }
    if (event.target.closest('[data-back]')) return onGo('mywork');
    if (event.target.closest('[data-save]')) {
      const ok = state.tab === 'income' ? await saveIncome(inc, state.date) : await sendR9(r9, state);
      if (ok) return reload();
      return;
    }
    if (event.target.closest('[data-hist]')) {
      return state.tab === 'income' ? incomeHistory(inc, state.date) : r9History(r9);
    }
    if (state.tab === 'income' ? await incomeClick(event, ctx) : r9Click(event, ctx)) return;
    if (await handleDateClick(event, state)) { inc.ready = false; draw(); load(); }
  });

  root.addEventListener('input', event => {
    if (state.tab === 'income') incomeInput(event, ctx); else r9Input(event, ctx);
  });

  root.addEventListener('change', async event => {
    const elm = event.target;
    if (elm.matches('#mp-date-pick') && await handleDatePick(elm.value, state)) { inc.ready = false; draw(); load(); }
    else if (elm.matches('[data-from]')) { state.from = elm.value; state.built = false; draw(); }
    else if (elm.matches('[data-to]')) { state.to = elm.value; state.built = false; draw(); }
  });
}

// เข้าหน้านี้ที่แท็บบันทึกส่งพระราม 9 โดยตรง (การ์ดงานในหน้า "งานของฉัน")
export const mountMaepanR9Page = (root, onGo) => mountMaepanPage(root, onGo, 'r9');
