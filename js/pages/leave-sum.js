// หน้าสรุปการมาทำงาน (การ์ด "วันลาพนักงาน") — วันมาทำงานเทียบวันร้านเปิด นับตั้งแต่วันเริ่มงานของแต่ละคน
import { getAttendanceBundle, saveStaff, todayIso } from '../shared/data.js';
import { ATTEND_UI as A } from '../shared/config.js';
import { workTopHtml, workHeroHtml, workNoteHtml } from '../shared/work-ui.js';
import { toast, glyph, formSheet } from '../shared/ui.js';
import { isAdmin, currentUser } from '../shared/auth.js';
import { attendance } from '../shared/calc.js';
import { fillText, dayLongTh, days1, escHtml } from '../shared/format.js';

const T = A.leave;

// แถวกราฟแท่งของพนักงาน 1 คน
function rowHtml(r, admin, first) {
  const pct = r.pct === null ? 0 : r.pct;
  const start = r.startSet ? fillText(T.start, { d: dayLongTh(r.start) }) : fillText(T.startAuto, { d: dayLongTh(first) });
  return `
    <section class="wcard atrow">
      <img class="atrow__av" src="assets/login/avatar-${r.avatar}.webp" alt="" width="44" height="44" decoding="async">
      <div class="atrow__main">
        <div class="atrow__top"><b>${escHtml(r.name)}</b><span class="atrow__pct">${r.pct === null ? '-' : Math.round(pct) + '%'}</span></div>
        <div class="atbar" role="img" aria-label="${Math.round(pct)}%"><i style="width:${pct}%"></i></div>
        <div class="atrow__meta">
          <span>${fillText(T.worked, { a: days1(r.worked), b: r.open })} · ${fillText(T.off, { n: days1(r.off) })}</span>
          <em>${start}</em>
        </div>
      </div>
      ${admin ? `<button class="attool" type="button" data-start="${r.code}" aria-label="${T.startBtn}" title="${T.startBtn}">${glyph('calendar', 18)}</button>` : ''}
    </section>`;
}

// ติดตั้งหน้าสรุปการมาทำงาน
export function mountLeaveSumPage(root, onGo) {
  const el = s => root.querySelector(s);
  const admin = isAdmin();
  let b = null;
  root.querySelector('.work').style.setProperty('--a', T.accent);
  const me = currentUser() || {};
  el('#w-top').innerHTML = workTopHtml({ code: me.avatar || me.code || '', name: me.name || '', role: '' }, A.back);

  // วาดทั้งหน้าจากข้อมูลที่โหลดแล้ว
  const draw = () => {
    const today = todayIso();
    const rows = attendance({ days: b.days, leaves: b.leaves, people: b.people, from: b.first, to: today })
      .sort((x, y) => (y.pct ?? -1) - (x.pct ?? -1));
    el('#w-body').innerHTML = workHeroHtml({ ...T, script: '' })
      + `<p class="atrange">${fillText(T.range, { a: dayLongTh(b.first), b: dayLongTh(today) })}</p>`
      + (rows.length ? rows.map(r => rowHtml(r, admin, b.first)).join('') : `<p class="wempty">${A.none}</p>`)
      + workNoteHtml(T.note);
  };

  // โหลดข้อมูลจากฐาน (ล้มเหลว = บอกตรงๆ พร้อมปุ่มลองใหม่)
  const load = async () => {
    try { b = await getAttendanceBundle(); draw(); } catch {
      el('#w-body').innerHTML = `<p class="wempty">${A.loadError}<em><button class="atbtn" type="button" data-reload="1">${A.retry}</button></em></p>`;
    }
  };

  // แก้วันเริ่มงานของพนักงาน 1 คน (เฉพาะแอดมิน)
  const editStart = async code => {
    const p = b.people.find(x => x.code === code);
    const v = await formSheet({ title: fillText(T.startTitle, { name: p.name }), fields: [{ key: 'd', kind: 'date', label: T.startField, value: p.startSet || '' }] });
    if (!v) return;
    try { await saveStaff(code, { start_date: v.d || null }); toast(fillText(T.startSaved, { name: p.name })); await load(); } catch { toast(A.loadError); }
  };

  el('#w-body').innerHTML = `<p class="wempty">${A.loading}</p>`;
  load();

  root.addEventListener('click', event => {
    const hit = s => event.target.closest(s);
    if (hit('[data-back]')) return onGo('other');
    if (hit('[data-reload]')) return load();
    if (hit('[data-start]') && admin && b) return editStart(hit('[data-start]').dataset.start);
  });
}
