// แท็บพนักงาน: รายชื่อ แต้มปัญญา วัย และสัตว์ที่มี
import { charSprite } from '../../core/sprites.js';
import { stageOf } from '../../core/state.js';
import { PETS } from '../../config.js';

export function render(ctx) {
  return '<div class="card">' + ctx.users.map(u => {
    const c = ctx.chr(u.id), p = (ctx.data.pets || []).find(x => x.user_id === u.id);
    return `<div class="row">
      <span class="sprite" style="${charSprite(u.asset_folder, stageOf(c.wp), 'idle', 44)}"></span>
      <span style="flex:1">${u.name_th}<br><small style="color:var(--muted)">${u.emp_code} · ${u.role}${p ? ' · ' + (PETS[p.species_id] || '') : ''}</small></span>
      <b>${c.wp}</b></div>`;
  }).join('') + '</div>';
}
export function wire() {}
