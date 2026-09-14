// แท็บสถิติ: ความคืบหน้าแต้มปัญญาของทุกคน
import { t } from '../../core/i18n.js';
import { stageOf } from '../../core/state.js';

export function render(ctx) {
  return '<div class="card">' + ctx.users.map(u => {
    const c = ctx.chr(u.id), pct = Math.min(100, Math.round(c.wp / 5000 * 100));
    return `<div style="padding:8px 0"><div style="display:flex;font-size:14px"><span style="flex:1">${u.name_th}</span>
      <span class="sub">${t('stage_' + stageOf(c.wp))} · ${c.wp}</span></div>
      <div class="bar" style="margin-top:5px"><i style="width:${pct}%"></i></div></div>`;
  }).join('') + '</div>';
}
export function wire() {}
