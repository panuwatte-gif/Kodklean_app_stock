// S5 เต็นท์แม่หมอ: ไพ่รายวัน (วันละ 1 ใบ) + พิธีเลือกสัตว์ปกติ (เปิดใหม่ได้เรื่อยๆ ถ้าไม่ถูกใจ)
import { t } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { petSprite } from '../core/sprites.js';
import { S, stageOf } from '../core/state.js';
import * as api from '../core/api.js';
import { TAROT, cardById } from '../tarot_data.js';
import { PETS, RULES } from '../config.js';
import { ASSETS } from '../sprite_config.js';

const today = () => new Date().toISOString().slice(0, 10);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const NORMAL = Object.keys(PETS).filter(k => k <= 'B14');

export function mountTent(root, go) {
  let fan = null;        // ไพ่ 5 ใบที่แผ่อยู่ตอนนี้ (null = ยังไม่สับ)
  let flipped = null;    // ใบที่พลิกแล้ววันนี้
  let rite = null;       // สถานะพิธีเลือกสัตว์: {cards, picked, pet}

  const drawnToday = () => S.chr.last_card_date === today();
  const canRite = () => stageOf(S.chr.wp) !== 'baby';
  const myPet = () => S.pets.find(p => !p.is_zodiac);

  // ---------- ไพ่รายวัน ----------
  const dailyCard = () => {
    const done = drawnToday();
    const card = flipped || (done && S.chr.last_card_id ? cardById(S.chr.last_card_id) : null);
    if (card) return `<div class="card" style="text-align:center">
        <img src="${ASSETS.tarot}${card[0]}.webp" alt="" style="width:150px;border-radius:14px;box-shadow:var(--shadow)">
        <p class="h" style="margin-top:10px">${card[1]}</p>
        <p style="font-size:15px;line-height:1.6;margin:4px 0 10px">${card[2]}</p>
        <p class="sub" style="background:var(--cream);border-radius:14px;padding:10px;line-height:1.6;color:var(--ink)">${card[3]}</p>
        ${flipped ? '' : '<p class="sub" style="margin-top:10px">' + t('cardDoneToday') + '</p>'}
      </div>`;
    if (!fan) return `<div class="card" style="text-align:center">
        <p class="h">${t('dailyCard')}</p><p class="sub">${t('dailyCardHint')}</p>
        <button class="btn btn--gold" style="margin-top:14px" data-shuffle>${t('shuffle')}</button></div>`;
    return `<div class="card" style="text-align:center">
        <p class="sub">${t('tapOne')}</p>
        <div style="display:flex;justify-content:center;gap:6px;margin-top:12px">${fan.map((c, i) =>
          `<button data-flip="${c}" style="border:0;background:none;padding:0;cursor:pointer;transform:rotate(${(i - 2) * 7}deg) translateY(${Math.abs(i - 2) * 7}px)">
            <img src="${ASSETS.tarot}back.webp" alt="" style="width:60px;border-radius:8px;box-shadow:var(--shadow)"></button>`).join('')}</div>
      </div>`;
  };

  // ---------- พิธีเลือกสัตว์ ----------
  const riteCard = () => {
    const pet = myPet();
    if (!canRite()) return `<div class="card" style="text-align:center">
        <p class="h">${t('petRite')}</p><p class="sub">${t('riteLocked')}</p></div>`;
    if (rite && rite.pet) {
      const p = rite.pet;
      return `<div class="card" style="text-align:center">
        <span class="sprite" style="${petSprite(p.species_id, p.stage, 'ok', 130)};margin:0 auto"></span>
        <p class="h" style="margin-top:8px">${PETS[p.species_id]}</p>
        <p class="sub">${t('riteGot')}</p>
        <div style="display:flex;gap:10px;margin-top:14px">
          <button class="btn" data-again style="background:#fff;color:var(--green);box-shadow:var(--shadow)">${t('riteAgain')}</button>
          <button class="btn" data-keep>${t('riteKeep')}</button></div></div>`;
    }
    if (rite) return `<div class="card" style="text-align:center">
        <p class="sub">${t('ritePick')}</p>
        <div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:12px">${rite.cards.map((c, i) =>
          `<button data-rite="${i}" style="border:0;background:none;padding:0;cursor:pointer;opacity:${rite.picked.includes(i) ? .35 : 1}">
            <img src="${ASSETS.tarot}back.webp" alt="" style="width:100%;border-radius:10px;box-shadow:var(--shadow)"></button>`).join('')}</div>
        <p class="sub" style="margin-top:10px">${t('riteCount', { n: rite.picked.length })}</p></div>`;
    return `<div class="card" style="text-align:center">
        <p class="h">${t('petRite')}</p>
        <p class="sub">${pet ? t('riteHasPet', { name: PETS[pet.species_id] }) : t('riteHint')}</p>
        <button class="btn btn--gold" style="margin-top:14px" data-rite-start>${pet ? t('riteAgain') : t('riteStart')}</button></div>`;
  };

  const draw = () => {
    root.innerHTML = topBar() + `
      <div style="text-align:center;padding:14px 0 0;background:linear-gradient(180deg,#F3ECFA,transparent)">
        <img src="${ASSETS.village}bird-card.webp" alt="" width="150" height="150" style="object-fit:contain">
      </div>` + dailyCard() + riteCard() + '<div style="height:14px"></div>';
    wireLang(root, go, 'tent');
  };
  draw();

  root.onclick = async e => {
    if (e.target.closest('[data-shuffle]')) {
      const pool = TAROT.map(c => c[0]).sort(() => Math.random() - .5);
      fan = pool.slice(0, 5);
      return draw();
    }
    const f = e.target.closest('[data-flip]');
    if (f) {
      flipped = cardById(f.dataset.flip);
      const gold = Math.random() < .1;
      const food = RULES.cardFood * (gold ? 2 : 1), wp = RULES.cardWp * (gold ? 2 : 1);
      S.chr.food += food; S.chr.wp += wp;
      S.chr.last_card_date = today(); S.chr.last_card_id = flipped[0];
      fan = null;
      draw();
      toast(t(gold ? 'cardGold' : 'cardReward', { f: food, w: wp }));
      api.saveCharacter(S.user.id, { food: S.chr.food, wp: S.chr.wp, stage: stageOf(S.chr.wp),
        last_card_date: S.chr.last_card_date, last_card_id: S.chr.last_card_id }).catch(() => toast(t('saveErr')));
      return;
    }
    if (e.target.closest('[data-rite-start]')) {
      rite = { cards: TAROT.map(c => c[0]).sort(() => Math.random() - .5).slice(0, 6), picked: [], pet: null };
      return draw();
    }
    const r = e.target.closest('[data-rite]');
    if (r) {
      const i = Number(r.dataset.rite);
      if (rite.picked.includes(i)) return;
      rite.picked.push(i);
      if (rite.picked.length < 3) return draw();
      // ครบ 3 ใบแล้วประกาศสัตว์ — สุ่มเท่ากัน 1/14 เลี่ยงตัวเดิมเวลาเปิดใหม่
      const cur = myPet(), shown = rite.last && rite.last.species_id;
      const choices = NORMAL.filter(id => id !== shown && (!cur || id !== cur.species_id));
      rite.pet = { species_id: pick(choices), stage: 1 };
      return draw();
    }
    if (e.target.closest('[data-again]')) {
      const last = rite.pet;
      rite = { last, cards: TAROT.map(c => c[0]).sort(() => Math.random() - .5).slice(0, 6), picked: [], pet: null };
      return draw();
    }
    if (!e.target.closest('[data-keep]')) return;
    const chosen = rite.pet.species_id, cur = myPet();
    rite = null;
    try {
      if (cur) { await api.savePet(cur.id, { species_id: chosen, stage: 1, fullness_today: 0, fullness_total: 0, mood: 'ok' });
        Object.assign(cur, { species_id: chosen, stage: 1, fullness_today: 0, fullness_total: 0, mood: 'ok' }); }
      else { const [p] = await api.addPet({ user_id: S.user.id, species_id: chosen, is_zodiac: false }); S.pets.push(p); }
      toast(t('riteSaved', { name: PETS[chosen] }));
      go('myhome');
    } catch (err) { draw(); toast(t('saveErr')); }
  };
}
