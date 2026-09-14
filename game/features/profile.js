// S8 โปรไฟล์: ข้อมูลตัวเอง สลับภาษา สถิติ ออกจากระบบ
import { t, getLang } from '../core/i18n.js';
import { topBar, wireLang } from '../core/ui.js';
import { charSprite } from '../core/sprites.js';
import { S, stageOf } from '../core/state.js';
import { setLang } from '../core/i18n.js';
import * as api from '../core/api.js';
import { PETS } from '../config.js';

export function mountProfile(root, go) {
  const st = stageOf(S.chr.wp);
  const isAdmin = S.user.role === 'admin';
  root.innerHTML = topBar() + `
    <div class="card" style="text-align:center">
      <span class="sprite" style="${charSprite(S.user.asset_folder, st, 'happy', 150)};margin:0 auto"></span>
      <p class="h" style="margin-top:6px">${S.user.name_th}</p>
      <p class="sub">${t('stage_' + st)} · ${t('gen')} ${S.chr.generation} · ${S.user.emp_code}</p>
    </div>
    <div class="card">
      <p class="h">${t('language')}</p>
      <div class="who" style="grid-template-columns:1fr 1fr;margin-bottom:0">
        ${[['th','ไทย'], ['my','မြန်မာ']].map(([v, l]) =>
          `<button type="button" data-lg="${v}" class="${getLang() === v ? 'on' : ''}" style="font-size:17px">${l}</button>`).join('')}
      </div>
    </div>
    <div class="card">
      <p class="h">${t('stats')}</p>
      <div class="row"><span style="flex:1">${t('wp')}</span><b>${S.chr.wp}</b></div>
      <div class="row"><span style="flex:1">${t('food')}</span><b>${S.chr.food}</b></div>
      ${S.pets.map(p => `<div class="row"><span style="flex:1">${PETS[p.species_id] || p.species_id}</span><b>${p.fullness_total}</b></div>`).join('')}
    </div>
    ${isAdmin ? '<div style="padding:0 14px 24px"><button class="btn btn--gold" data-admin>' + t('admin') + '</button></div>' : '<div style="height:18px"></div>'}`;
  wireLang(root, go, 'profile');

  root.onclick = async e => {
    const lg = e.target.closest('[data-lg]');
    if (lg) { setLang(lg.dataset.lg); S.user.language = lg.dataset.lg;
      api.saveUser(S.user.id, { language: lg.dataset.lg }).catch(() => {}); return go('profile'); }
    if (e.target.closest('[data-admin]')) return go('admin');
  };
}
