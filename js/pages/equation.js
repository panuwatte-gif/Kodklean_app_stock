// หน้าตรวจสอบสมการ Forecast — ตัวคุมแท็บ 4 หน้า โหลดข้อมูลจริงจากฐานครั้งเดียว แล้วส่งให้แท็บที่เปิดอยู่
import { EQ_UI, EQ_TABS } from '../shared/config.js';
import { getFcBundle, todayIso } from '../shared/data.js';
import { topBarHtml, glyph } from '../shared/ui.js';
import { dayShort } from '../shared/format.js';
import { overviewHtml, loadOverview } from './eq-overview.js';
import { mountLab } from './eq-lab.js';
import { mountLibrary } from './eq-library.js';
import { mountConfig } from './eq-config.js';

// สถานะของหน้า: แท็บที่เปิด + ข้อมูลทั้งก้อนจากฐาน
const state = { tab: 'overview', data: null, error: false };

// แถบแท็บ 4 หน้า
const tabsHtml = on => `<div class="eq-tabs">${EQ_TABS.map(t => `
  <button class="eq-tab${t.id === on ? ' is-on' : ''}" type="button" data-eqtab="${t.id}">${glyph(t.glyph, 15)}<span>${t.label}</span></button>`).join('')}</div>`;

// ติดตั้งหน้า
export async function mountEquationPage(root) {
  root.querySelector('#eq-bar').innerHTML = topBarHtml({ title: EQ_UI.title, date: dayShort(todayIso()) });
  const body = root.querySelector('#eq-body');

  // โหลดข้อมูลใหม่ทั้งก้อน (หน้าลูกเรียกหลังเขียนลงฐาน เพื่อให้ทุกแท็บเห็นค่าใหม่)
  const reload = async () => {
    try { state.data = await getFcBundle(); state.error = false; }
    catch { state.error = true; }
    draw();
  };

  // วาดแท็บที่เปิดอยู่
  function draw() {
    body.innerHTML = tabsHtml(state.tab) + '<div id="eq-pane"></div>';
    body.querySelector('.eq-tabs').onclick = event => {
      const hit = event.target.closest('[data-eqtab]');
      if (!hit || hit.dataset.eqtab === state.tab) return;
      state.tab = hit.dataset.eqtab;
      const view = root.closest('.app-view');
      if (view) view.scrollTop = 0;
      draw();
    };
    const pane = body.querySelector('#eq-pane');
    if (state.error) return void (pane.innerHTML = '<p class="ptab__none">ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง</p>');
    if (!state.data) return void (pane.innerHTML = '<p class="ptab__none">กำลังโหลดข้อมูลจากฐาน...</p>');
    if (state.tab === 'overview') { pane.innerHTML = overviewHtml(state.data); loadOverview(pane, state.data); return; }
    if (state.tab === 'lab') return mountLab(pane, state.data, reload);
    if (state.tab === 'lib') return mountLibrary(pane, state.data, reload);
    mountConfig(pane, state.data, reload);
  }

  draw();
  reload();
}
