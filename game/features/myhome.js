// S3 บ้านฉัน: ตัวละครใหญ่ + การ์ดสัตว์ + ให้อาหาร
import { t } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { charSprite, petSprite } from '../core/sprites.js';
import { S, stageOf, nextStageWp } from '../core/state.js';
import * as api from '../core/api.js';
import { PETS, RULES } from '../config.js';
import { ASSETS } from '../sprite_config.js';

const today = () => new Date().toISOString().slice(0, 10);

export function mountMyHome(root, go) {
  let mood = 'idle', tab = 0;

  const petCard = p => {
    if (!p) return `<div class="card" style="text-align:center"><p class="h">${t('noPet')}</p><p class="sub">${t('petFromTarot')}</p></div>`;
    const fed = p.last_fed_date === today() ? p.fullness_today : 0;
    const pct = Math.round(fed / RULES.dailyCap * 100);
    return `<div class="card">
      <div style="display:flex;align-items:center;gap:12px">
        <span class="sprite" style="${petSprite(p.species_id, p.stage, p.mood, 92)}"></span>
        <div style="flex:1">
          <p class="h" style="margin:0">${PETS[p.species_id] || p.species_id}</p>
          ${p.is_zodiac ? '<p class="sub" style="color:#B8860B;font-weight:500">' + t('petZodiac') + '</p>' : ''}
          <p class="sub">${t('fullness')} · ${t('fedToday', { a: fed, b: RULES.dailyCap })}</p>
          <div class="bar" style="margin-top:6px"><i style="width:${pct}%"></i></div>
        </div>
      </div>
      ${p.mood !== 'ok' ? `<p class="sub" style="color:#E0453C;margin-top:10px">${t(p.mood === 'sulk' ? 'petSulk' : 'petHungry')}</p>` : ''}
      <button class="btn btn--gold" style="margin-top:14px" data-feed="${p.id}">
        <img src="${ASSETS.icons}food.webp" alt="" width="24" height="24" style="vertical-align:-5px;margin-right:6px">${t('feed')}</button>
    </div>`;
  };

  const draw = () => {
    const wp = S.chr.wp, st = stageOf(wp), nx = nextStageWp(wp);
    const pets = S.pets, p = pets[tab];
    root.innerHTML = topBar() + `
      <div style="text-align:center;padding:16px 0 4px">
        <span class="sprite" data-me style="${charSprite(S.user.asset_folder, st, mood, 190)};margin:0 auto;cursor:pointer"></span>
      </div>
      <div class="card">
        <p class="h" style="margin:0">${t('stage_' + st)}</p>
        <p class="sub">${nx ? t('toNext', { n: nx - wp }) : t('maxStage')}</p>
        <div class="bar" style="margin-top:8px"><i style="width:${nx ? Math.round(wp / nx * 100) : 100}%"></i></div>
      </div>
      ${pets.length > 1 ? '<div class="tabs">' + pets.map((x, i) =>
        `<button data-tab="${i}" class="${i === tab ? 'on' : ''}">${PETS[x.species_id]}</button>`).join('') + '</div>' : ''}
      ${petCard(p)}`;
    wireLang(root, go, 'myhome');
  };
  draw();

  root.onclick = async e => {
    if (e.target.closest('[data-me]')) { mood = mood === 'idle' ? 'happy' : 'idle'; return draw(); }
    const tb = e.target.closest('[data-tab]'); if (tb) { tab = Number(tb.dataset.tab); return draw(); }
    const f = e.target.closest('[data-feed]'); if (!f) return;
    const p = S.pets.find(x => x.id === f.dataset.feed);
    const fed = p.last_fed_date === today() ? p.fullness_today : 0;
    if (fed >= RULES.dailyCap) return toast(t('capReached'));
    if (S.chr.food <= 0) return toast(t('noFood'));
    // เตรียม−เหลือ: หักอาหาร 1 หน่วย เพิ่มความอิ่ม 10 แล้วเช็กว่าโตระยะถัดไปหรือยัง
    const gain = RULES.feedPerUnit;
    p.fullness_today = fed + gain;
    p.fullness_total += gain;
    p.last_fed_date = today();
    p.mood = 'ok';
    p.stage = p.fullness_total >= RULES.stage3 ? 3 : p.fullness_total >= RULES.stage2 ? 2 : 1;
    S.chr.food -= 1;
    draw();
    toast(t('fedOk', { n: gain }));
    try {
      await api.savePet(p.id, { fullness_today: p.fullness_today, fullness_total: p.fullness_total,
        last_fed_date: p.last_fed_date, mood: 'ok', stage: p.stage });
      await api.saveCharacter(S.user.id, { food: S.chr.food });
    } catch (err) { toast(t('saveErr')); }
  };
}
