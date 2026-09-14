// แท็บพรีวิว sprite: ไล่ดูทุกท่าของแต่ละแผ่น เจอท่าเพี้ยนแจ้งชื่อท่าได้เลย
import { sheetPoses } from '../../core/sprites.js';
import { t } from '../../core/i18n.js';

const SHEETS = [['01','ทารก–นักเรียน'], ['02','วัยรุ่น–วัยทำงาน'], ['04','กลางคน–ผู้เฒ่า']];
let who = null, sheetNo = '01';

export function render(ctx) {
  if (!who) who = ctx.users[0];
  const list = sheetPoses(who.asset_folder, sheetNo, 88);
  return `<div class="card">
    <label>คน</label><select id="p-who">${ctx.users.map(u =>
      `<option value="${u.id}" ${u.id === who.id ? 'selected' : ''}>${u.name_th} · ${u.asset_folder}</option>`).join('')}</select>
    <label>แผ่น</label><select id="p-sheet">${SHEETS.map(([v, l]) =>
      `<option value="${v}" ${v === sheetNo ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <p class="sub" style="margin-top:10px">พบ ${list.length} ${t('pose')}</p>
  </div>
  <div class="card"><div class="grid">${list.map(p => `<div class="pcell">
    <span class="sprite" style="${p.css};margin:0 auto"></span>
    <small>${p.name}</small><small>${p.box.x},${p.box.y} ${p.box.w}×${p.box.h}</small></div>`).join('')}</div></div>`;
}

export function wire(root, ctx) {
  const pw = root.querySelector('#p-who'), ps = root.querySelector('#p-sheet');
  if (pw) pw.onchange = () => { who = ctx.users.find(u => u.id === pw.value); ctx.draw(); };
  if (ps) ps.onchange = () => { sheetNo = ps.value; ctx.draw(); };
}
