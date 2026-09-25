// หน้ารวม Grab (การ์ด "Grab" ในอื่นๆ) — 3 การ์ด: ออเดอร์ · Import ข้อมูล · รายงานผู้บริหาร
import { GRAB_UI as G } from '../shared/config.js';
import { workTopHtml, workHeroHtml } from '../shared/work-ui.js';
import { currentUser } from '../shared/auth.js';

// หัวหน้าจอที่ใช้ร่วมทุกหน้าของ Grab (ปุ่มกลับ + การ์ดหัวเรื่อง)
export function grabFrame(root, page, back) {
  const me = currentUser() || {};
  root.querySelector('.work').style.setProperty('--a', G.accent);
  root.querySelector('#w-top').innerHTML = workTopHtml({ code: me.avatar || me.code || '', name: me.name || '', role: '' }, back);
  return workHeroHtml({ ...page, script: '' });
}

// แท็บเลือกร้าน (ใช้ร่วมหน้า Import · ออเดอร์ · รายงาน) · shops มาจาก kk_income_brand · withAll = มีแท็บรวมทุกร้าน
export function shopTabsHtml(shops, cur, withAll = false) {
  const list = (withAll ? [{ id: 'all', name: G.shopAll, color: G.accent }] : []).concat(shops);
  return `<div class="grshops" role="tablist" aria-label="${G.shopPick}">${list.map(s => `<button type="button" role="tab" data-shop="${s.id}" aria-selected="${s.id === cur}" class="${s.id === cur ? 'is-on' : ''}" style="--c:${s.color || G.accent}">
    ${s.logo ? `<img src="${s.logo}" alt="" width="22" height="22" decoding="async">` : `<i aria-hidden="true"></i>`}<span>${s.name}</span></button>`).join('')}</div>`;
}

// ติดตั้งหน้ารวม Grab
export function mountGrabPage(root, onGo) {
  const hero = grabFrame(root, G.hub, G.back);
  root.querySelector('#w-body').innerHTML = hero + G.hub.cards.map(c => `
    <button class="wcard grhub" type="button" data-go="${c.id}">
      <img src="${c.icon}" alt="" width="54" height="54" decoding="async">
      <span class="grhub__text"><b>${c.title}</b><em>${c.sub}</em></span>
      <span class="grhub__go" aria-hidden="true">›</span>
    </button>`).join('');
  root.addEventListener('click', event => {
    const hit = event.target.closest('[data-go]');
    if (hit) return onGo(hit.dataset.go);
    if (event.target.closest('[data-back]')) onGo('other');
  });
}
