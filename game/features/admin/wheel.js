// แท็บกงล้อ: ตั้งรางวัลกงล้อใหญ่/เล็ก 8 ช่อง + ประวัติการหมุนและติ๊กจ่ายรางวัล
import * as api from '../../core/api.js';

let which = 'big';
const SLOTS = [0,1,2,3,4,5,6,7];

export function render(ctx) {
  const prizes = ctx.data.prizes || [], spins = ctx.data.spins || [];
  const val = s => (prizes.find(p => p.wheel === which && p.slot === s) || {});
  const name = id => (ctx.users.find(u => u.id === id) || {}).name_th || '—';
  return `<div class="card">
    <p class="h">ตั้งรางวัล</p>
    <div class="who" style="grid-template-columns:1fr 1fr">
      <button type="button" data-w="big" class="${which === 'big' ? 'on' : ''}">กงล้อใหญ่</button>
      <button type="button" data-w="small" class="${which === 'small' ? 'on' : ''}">กงล้อเล็ก</button>
    </div>
    ${SLOTS.map(s => `<label>ช่อง ${s + 1}</label>
      <div style="display:flex;gap:8px">
        <input class="w-lb" data-s="${s}" value="${val(s).label || ''}" placeholder="ชื่อรางวัล">
        <input class="w-wt" data-s="${s}" type="number" min="0" value="${val(s).weight ?? 1}" style="width:74px" title="น้ำหนักโอกาสออก">
      </div>`).join('')}
    <button class="btn" style="margin-top:12px" data-w-save>บันทึกรางวัล</button>
    <p class="sub" style="margin-top:6px">ช่องขวาคือน้ำหนักโอกาสออก ยิ่งมากยิ่งออกบ่อย</p>
  </div>
  <div class="card">
    <p class="h">ประวัติการหมุน</p>
    ${spins.length ? spins.map(s => `<div class="row">
      <span style="flex:1">${name(s.user_id)}<br><small style="color:var(--muted)">${s.prize_label} · ${s.wheel === 'big' ? 'ใหญ่' : 'เล็ก'} · ${s.spun_at.slice(0, 16).replace('T', ' ')}</small></span>
      <button class="lang" data-w-pay="${s.id}" style="background:${s.paid ? 'var(--lime)' : 'var(--cream)'};color:${s.paid ? '#fff' : 'var(--ink)'}">${s.paid ? 'จ่ายแล้ว' : 'จ่ายรางวัล'}</button></div>`).join('')
      : '<p class="sub">ยังไม่มีใครหมุน</p>'}
  </div>`;
}

export function wire(root, ctx) {
  root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { which = b.dataset.w; ctx.draw(); });
  root.querySelectorAll('[data-w-pay]').forEach(b => b.onclick = async () => {
    const s = ctx.data.spins.find(x => String(x.id) === b.dataset.wPay);
    await api.paySpin(s.id, !s.paid); s.paid = !s.paid; ctx.draw();
  });
  const save = root.querySelector('[data-w-save]');
  if (save) save.onclick = async () => {
    const rows = [...root.querySelectorAll('.w-lb')].map(i => ({
      wheel: which, slot: Number(i.dataset.s), label: i.value.trim(),
      weight: Number(root.querySelector(`.w-wt[data-s="${i.dataset.s}"]`).value) || 0
    })).filter(r => r.label);
    if (!rows.length) return ctx.toast('ใส่ชื่อรางวัลก่อนนะ');
    try {
      const saved = await api.savePrizes(rows);
      ctx.data.prizes = (ctx.data.prizes || []).filter(p => p.wheel !== which).concat(saved || rows);
      ctx.draw(); ctx.toast('บันทึกรางวัลแล้ว');
    } catch (err) { ctx.toast('บันทึกไม่สำเร็จ'); }
  };
}
