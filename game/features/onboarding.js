// แม่หมอนกน้อยถาม 5 ข้อ แล้วคำนวณราศีเงียบๆ เก็บไว้ใช้ทีหลัง
import { t, setLang } from '../core/i18n.js';
import { toast } from '../core/ui.js';
import * as api from '../core/api.js';
import { S } from '../core/state.js';
import { ASSETS } from '../sprite_config.js';
import { ZODIAC } from '../config.js';

const COLORS = ['#FE9B96','#F7C346','#A6BE40','#125B2A','#A3E4F6','#347CD5','#A27ED7','#FEE7BA'];
const FOODS  = ['rice','noodle','chicken','pork','beef','shrimp','salmon'];

const zodiacOf = d => (ZODIAC.find(([,,, m1, d1, m2, d2]) => {
  const m = d.getMonth() + 1, day = d.getDate();
  return (m === m1 && day >= d1) || (m === m2 && day <= d2);
}) || ZODIAC[0]);

export function mountOnboarding(root, go) {
  const a = { birth:'', color:'', food:'', pair1:'', pair2:'', lang:'th' };
  let step = 0;
  const steps = [
    () => `<label>${t('ob1')}</label><input type="date" id="q" value="${a.birth}">`,
    () => `<label>${t('ob2')}</label><div class="who">${COLORS.map(c =>
        `<button type="button" data-v="${c}" class="${a.color === c ? 'on' : ''}"><span style="width:36px;height:36px;border-radius:50%;background:${c};display:block"></span></button>`).join('')}</div>`,
    () => `<label>${t('ob3')}</label><div class="who">${FOODS.map(f =>
        `<button type="button" data-v="${f}" class="${a.food === f ? 'on' : ''}"><img src="${ASSETS.food}${f}.webp" alt="" width="46" height="46" style="object-fit:contain"></button>`).join('')}</div>`,
    () => `<label>${t('ob4a')}</label><div class="who" style="grid-template-columns:1fr 1fr">
        ${[['sea', t('sea')], ['mountain', t('mountain')]].map(([v, l]) =>
          `<button type="button" data-v="${v}" class="${a.pair1 === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      <label>${t('ob4b')}</label><div class="who" style="grid-template-columns:1fr 1fr">
        ${[['morning', t('morning')], ['night', t('night')]].map(([v, l]) =>
          `<button type="button" data-v2="${v}" class="${a.pair2 === v ? 'on' : ''}">${l}</button>`).join('')}</div>`,
    () => `<label>${t('ob5')}</label><div class="who" style="grid-template-columns:1fr 1fr">
        ${[['th','ไทย'], ['my','မြန်မာ']].map(([v, l]) =>
          `<button type="button" data-v="${v}" class="${a.lang === v ? 'on' : ''}" style="font-size:17px">${l}</button>`).join('')}</div>`
  ];

  const draw = () => {
    root.innerHTML = `<div style="padding:18px 16px;text-align:center">
        <img src="${ASSETS.village}bird-ball.webp" alt="" width="140" height="140" style="object-fit:contain">
        <p class="sub">${step + 1} / 5</p></div>
      <div class="card">${steps[step]()}</div>
      <div style="padding:0 14px 22px;display:flex;gap:10px">
        ${step ? '<button class="btn" data-nav="-1" style="background:#fff;color:var(--green);box-shadow:var(--shadow)">' + t('back') + '</button>' : ''}
        <button class="btn" data-nav="1">${step === 4 ? t('obStart') : t('next')}</button>
      </div>`;
    const q = root.querySelector('#q');
    if (q) q.oninput = () => { a.birth = q.value; };
  };
  draw();

  root.onclick = async e => {
    const v = e.target.closest('[data-v]'), v2 = e.target.closest('[data-v2]');
    if (v)  { const k = ['', 'color', 'food', 'pair1', 'lang'][step]; a[k] = v.dataset.v; return draw(); }
    if (v2) { a.pair2 = v2.dataset.v2; return draw(); }
    const n = e.target.closest('[data-nav]');
    if (!n) return;
    const d = Number(n.dataset.nav);
    if (d < 0) { step--; return draw(); }
    if (step < 4) { step++; return draw(); }
    setLang(a.lang);
    const zod = a.birth ? zodiacOf(new Date(a.birth)) : null;
    try {
      await api.saveUser(S.user.id, { birthdate: a.birth || null, zodiac_auto: zod ? zod[0] : null, language: a.lang,
        favorites_json: { color: a.color, food: a.food, pair1: a.pair1, pair2: a.pair2 } });
      await api.saveCharacter(S.user.id, { onboarded: true });
      S.chr.onboarded = true;
      S.user.language = a.lang;
      // สัตว์ตำนานประจำราศีได้ทันทีจากวันเกิด ส่วนสัตว์ที่เหลือรอเปิดไพ่ที่เต็นท์แม่หมอ
      if (zod && !S.pets.some(p => p.is_zodiac)) {
        const [pet] = await api.addPet({ user_id: S.user.id, species_id: zod[2], is_zodiac: true });
        S.pets.push(pet);
      }
      toast(t('obSaved'));
      go('village');
    } catch (err) { toast(t('saveErr')); }
  };
}
