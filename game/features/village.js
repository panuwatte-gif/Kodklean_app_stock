// S2 แผนที่หมู่บ้าน: บ้านพนักงานเรียงตามลำดับเข้าร่วม + อาคารกลางแทรก แตะแล้วไปหน้านั้น
import { t } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { charSprite, petSprite } from '../core/sprites.js';
import { S, stageOf } from '../core/state.js';
import * as api from '../core/api.js';
import { ASSETS } from '../sprite_config.js';
import { PETS } from '../config.js';

const HOUSE = { baby:'house1', kid:'house1', student:'house2', teen:'house2', work:'house2', middle:'house3', elder:'house3' };
const PLACES = { board:{ img:'board', go:null }, tent:{ img:'tent', go:'tent' }, school:{ img:'school', go:'school' }, wheel:{ img:'wheel', go:'wheel' } };
const STEP = 250, PAD = 44;

export async function mountVillage(root, go) {
  const [chars, pets, notices] = await Promise.all([api.listCharacters(), api.allPets(), api.activeNotices()]);
  const byUser = id => chars.find(c => c.user_id === id) || { wp: 0, generation: 1 };
  const petOf = id => pets.find(p => p.user_id === id);

  // สลับบ้านคนกับอาคารกลาง ให้เดินผ่านเจอเรื่อยๆ — บ้านของคนที่ล็อกอินอยู่หน้าสุดเสมอ
  const order = [...S.users].sort((a, b) =>
    (a.id === S.user.id ? -1 : 0) - (b.id === S.user.id ? -1 : 0));
  const slots = [];
  order.forEach((u, i) => {
    slots.push({ kind: 'user', u });
    if (i === 0) slots.push({ kind: 'place', id: 'board' });
    if (i === 1) slots.push({ kind: 'place', id: 'tent' });
    if (i === 3) slots.push({ kind: 'place', id: 'school' });
    if (i === 4) slots.push({ kind: 'place', id: 'wheel' });
  });

  const spot = (s, i) => {
    const x = PAD + i * STEP;
    if (s.kind === 'place') {
      const p = PLACES[s.id];
      return `<button class="spot" style="left:${x}px" data-place="${s.id}">
        <img src="${ASSETS.village}${p.img}.webp" alt="" width="146" height="146" style="object-fit:contain">
        <span class="plate" style="margin-bottom:10px">${label(s.id)}</span></button>`;
    }
    const c = byUser(s.u.id), st = stageOf(c.wp), pet = petOf(s.u.id);
    return `<button class="spot" style="left:${x}px" data-user="${s.u.id}">
      <img src="${ASSETS.village}${HOUSE[st]}.webp" alt="" width="158" height="158" style="object-fit:contain">
      <span style="display:flex;align-items:flex-end;margin-top:-34px">
        <span class="sprite" style="${charSprite(s.u.asset_folder, st, 'idle', 118)}"></span>
        ${pet ? `<span class="sprite" style="${petSprite(pet.species_id, pet.stage, pet.mood, 96)};margin-left:-12px"></span>` : ''}
      </span>
      <span class="plate" style="margin-bottom:10px">${s.u.name_th} · ${t('gen')} ${c.generation}</span></button>`;
  };
  const label = id => ({ board: t('noticeNew'), tent: t('navTent'), school: t('navSchool'), wheel: t('navWheel') })[id];

  const width = PAD * 2 + slots.length * STEP;
  root.innerHTML = topBar() + `<div class="map" id="map"><div class="map__in" style="width:${width}px;background-image:url(${ASSETS.village}bg.webp)">
    ${slots.map(spot).join('')}</div></div>`;
  root.querySelector('.map').style.height = 'calc(100% - 58px)';
  wireLang(root, go, 'village');

  root.onclick = e => {
    const pl = e.target.closest('[data-place]');
    if (pl) { const g = PLACES[pl.dataset.place].go; return g ? go(g) : showNotices(notices); }
    const us = e.target.closest('[data-user]');
    if (!us) return;
    if (us.dataset.user === S.user.id) return go('myhome');
    const u = S.users.find(x => x.id === us.dataset.user), pet = petOf(u.id);
    toast(u.name_th + (pet ? ' · ' + PETS[pet.species_id] : ''));
  };

  // ประกาศใหม่เด้งทับตอนเข้า ถ้ายังไม่ได้กดรับทราบ
  const reads = await api.noticeReads().catch(() => []);
  const unread = notices.find(n => !reads.some(r => r.announcement_id === n.id && r.user_id === S.user.id));
  if (unread) showNotices([unread], true);

  function showNotices(list, needAck) {
    if (!list.length) return toast(t('soon'));
    const n = list[0];
    const who = S.users.find(u => u.id === n.announcer_user_id);
    const stw = who ? stageOf(byUser(who.id).wp) : 'work';
    const el = document.createElement('div');
    el.className = 'scrim';
    el.innerHTML = `<div class="modal" style="text-align:center">
      ${who ? `<span class="sprite" style="${charSprite(who.asset_folder, stw, 'shout', 140)};margin:0 auto"></span>` : ''}
      <p class="h">${t('noticeNew')}</p>
      <p style="font-size:16px;line-height:1.6;margin:6px 0 18px">${n.text_th}</p>
      <button class="btn" data-ack>${t('ack')}</button></div>`;
    el.onclick = async e2 => {
      if (!e2.target.closest('[data-ack]') && e2.target !== el) return;
      el.remove();
      if (needAck) api.markRead(n.id, S.user.id).catch(() => {});
    };
    document.getElementById('app').appendChild(el);
  }
}
