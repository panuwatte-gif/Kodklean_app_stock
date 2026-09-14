// แท็บประกาศ: ส่งประกาศใหม่ + ดูว่าใครอ่านแล้วกี่คน
import * as api from '../../core/api.js';
import { t } from '../../core/i18n.js';

export function render(ctx) {
  const notices = ctx.data.notices || [], reads = ctx.data.reads || [];
  return `<div class="card">
    <label>${t('noticeText')}</label><textarea id="n-th" rows="3"></textarea>
    <label>ข้อความพม่า (ไม่บังคับ)</label><textarea id="n-my" rows="2"></textarea>
    <label>${t('announcer')}</label>
    <select id="n-who">${ctx.users.map(u => '<option value="' + u.id + '">' + u.name_th + '</option>').join('')}</select>
    <button class="btn" style="margin-top:12px" data-n-send>${t('send')}</button>
  </div>
  <div class="card">${notices.length ? notices.map(n => `<div class="row">
      <span style="flex:1">${n.text_th}<br><small style="color:var(--muted)">${t('readBy', { n: reads.filter(r => r.announcement_id === n.id).length })}</small></span></div>`).join('')
    : '<p class="sub">—</p>'}</div>`;
}

export function wire(root, ctx) {
  const b = root.querySelector('[data-n-send]');
  if (b) b.onclick = async () => {
    const txt = root.querySelector('#n-th').value.trim();
    if (!txt) return ctx.toast('ใส่ข้อความก่อนนะ');
    try {
      const [n] = await api.addNotice({ text_th: txt, text_my: root.querySelector('#n-my').value.trim() || null,
        announcer_user_id: root.querySelector('#n-who').value });
      ctx.data.notices.unshift(n); ctx.draw(); ctx.toast('ส่งประกาศแล้ว');
    } catch (err) { ctx.toast('ส่งไม่สำเร็จ'); }
  };
}
