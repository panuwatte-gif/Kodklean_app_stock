// หน้าคะแนนการมาทำงาน (การ์ด "โบนัส") — คะแนนหลักถ่วงน้ำหนักตามยอดขาย + แต้มช่วยเพื่อน รายเดือน
import { getAttendanceBundle, todayIso } from '../shared/data.js';
import { ATTEND_UI as A } from '../shared/config.js';
import { workTopHtml, workHeroHtml, workNoteHtml } from '../shared/work-ui.js';
import { glyph } from '../shared/ui.js';
import { currentUser } from '../shared/auth.js';
import { attendance } from '../shared/calc.js';
import { monthLongTh, monthEndIso, shiftIso, days1, escHtml } from '../shared/format.js';

const T = A.bonus;

// ตารางคะแนนของเดือนที่เลือก
function tableHtml(rows) {
  const head = T.cols.map((c, i) => `<span>${c}${T.units[i] ? `<em>${T.units[i]}</em>` : ''}</span>`).join('');
  const body = rows.map(r => r.open ? `
    <div class="atb__row">
      <span class="atb__name"><img src="assets/login/avatar-${r.avatar}.webp" alt="" width="30" height="30" decoding="async"><b>${escHtml(r.name)}</b></span>
      <span>${r.open}</span>
      <span>${days1(r.off)}</span>
      <span class="atb__score">${r.score.toFixed(1)}</span>
      <span class="atb__help">${r.helpPts.toFixed(1)}</span>
    </div>` : `
    <div class="atb__row is-off">
      <span class="atb__name"><img src="assets/login/avatar-${r.avatar}.webp" alt="" width="30" height="30" decoding="async"><b>${escHtml(r.name)}</b></span>
      <span class="atb__na">${T.notStarted}</span>
    </div>`).join('');
  return `<section class="wcard atb"><div class="atb__row atb__row--head">${head}</div>${body}</section>`;
}

// ติดตั้งหน้าคะแนนการมาทำงาน
export function mountBonusPage(root, onGo) {
  const el = s => root.querySelector(s);
  const st = { month: todayIso().slice(0, 7) };
  let b = null;
  root.querySelector('.work').style.setProperty('--a', T.accent);
  const me = currentUser() || {};
  el('#w-top').innerHTML = workTopHtml({ code: me.avatar || me.code || '', name: me.name || '', role: '' }, A.back);

  // วาดทั้งหน้าของเดือนที่เลือก
  const draw = () => {
    const today = todayIso(), end = monthEndIso(st.month);
    const rows = attendance({ days: b.days, leaves: b.leaves, people: b.people, from: st.month + '-01', to: end < today ? end : today })
      .sort((x, y) => (y.score ?? -1) - (x.score ?? -1) || (y.helpPts ?? -1) - (x.helpPts ?? -1));
    const any = rows.some(r => r.open);
    const canNext = st.month < today.slice(0, 7), canPrev = st.month > b.first.slice(0, 7);
    el('#w-body').innerHTML = workHeroHtml({ ...T, script: '' })
      + `<div class="atmon">
          <button class="atmon__nav" type="button" data-mon="-1" aria-label="เดือนก่อน"${canPrev ? '' : ' disabled'}>${glyph('back', 16)}</button>
          <b>${monthLongTh(st.month)}</b>
          <button class="atmon__nav atmon__nav--next" type="button" data-mon="1" aria-label="เดือนถัดไป"${canNext ? '' : ' disabled'}>${glyph('back', 16)}</button>
        </div>`
      + (any ? tableHtml(rows) : `<p class="wempty">${T.empty}</p>`)
      + T.rules.map(workNoteHtml).join('');
  };

  // โหลดข้อมูลจากฐาน (ล้มเหลว = บอกตรงๆ พร้อมปุ่มลองใหม่)
  const load = async () => {
    try { b = await getAttendanceBundle(); draw(); } catch {
      el('#w-body').innerHTML = `<p class="wempty">${A.loadError}<em><button class="atbtn" type="button" data-reload="1">${A.retry}</button></em></p>`;
    }
  };

  el('#w-body').innerHTML = `<p class="wempty">${A.loading}</p>`;
  load();

  root.addEventListener('click', event => {
    const hit = s => event.target.closest(s);
    if (hit('[data-back]')) return onGo('other');
    if (hit('[data-reload]')) return load();
    const mon = hit('[data-mon]');
    if (mon && b && !mon.disabled) { st.month = shiftIso(st.month + '-15', Number(mon.dataset.mon) * 30).slice(0, 7); draw(); }
  });
}
