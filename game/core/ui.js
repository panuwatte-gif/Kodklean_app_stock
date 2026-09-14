// ชิ้นส่วนหน้าจอที่ใช้ซ้ำทุกหน้าในเกม
import { t, getLang, setLang } from './i18n.js';
import { S, stageOf } from './state.js';
import * as api from './api.js';
import { ASSETS } from '../sprite_config.js';

const NAV = [
  { id:'village', key:'navVillage', icon: ASSETS.icons + 'nav-village.webp' },
  { id:'myhome',  key:'navHome',    icon: ASSETS.village + 'house2.webp' },
  { id:'school',  key:'navSchool',  icon: ASSETS.icons + 'cap.webp' },
  { id:'tent',    key:'navTent',    icon: ASSETS.village + 'tent.webp' },
  { id:'profile', key:'navProfile', icon: ASSETS.icons + 'nav-profile.webp' }
];

// อยู่ในกรอบของ app_stock หรือเปล่า (ถ้าใช่ ต้องมีปุ่มกลับออกไปแอปหลัก)
export const inHost = () => window.parent !== window;

// ปุ่มกลับไป app_stock — ใช้ได้ทุกหน้าในเกม
export const exitBtn = () => inHost() ? '<button class="lang" data-exit aria-label="กลับแอปหลัก">‹ แอป</button>' : '';

// ผูกปุ่มกลับ: บอกแอปแม่ให้พาออกไปหน้าหลักของ app_stock
export function wireExit(root) {
  const b = root.querySelector('[data-exit]');
  if (b) b.onclick = () => window.parent.postMessage({ type: 'imjai:exit' }, '*');
}

// แถบบน: ปุ่มกลับ+ชื่อ+วัย ซ้าย, อาหาร+แต้มปัญญา ขวา, ปุ่มสลับภาษา
export function topBar(opts = {}) {
  const wp = S.chr ? S.chr.wp : 0;
  return `<div class="top">
    ${exitBtn()}
    <div><div class="top__name">${S.user ? S.user.name_th : ''}</div>
      <div class="top__stage">${t('stage_' + stageOf(wp))} · ${t('gen')} ${S.chr ? S.chr.generation : 1}</div></div>
    <div class="top__sp"></div>
    <span class="chip"><img src="${ASSETS.icons}food.webp" alt="">${S.chr ? S.chr.food : 0}</span>
    <span class="chip"><img src="${ASSETS.icons}wp.webp" alt="">${wp}</span>
    ${opts.noLang ? '' : '<button class="lang" data-lang>' + (getLang() === 'th' ? 'ไทย' : 'မြန်မာ') + '</button>'}
  </div>`;
}

// ปุ่มสลับภาษาใช้ได้ทุกหน้า — กดแล้วบันทึกลงฐานและวาดหน้าเดิมใหม่
export function wireLang(root, go, screen) {
  wireExit(root);
  const b = root.querySelector('[data-lang]');
  if (!b) return;
  b.onclick = async () => {
    const v = getLang() === 'th' ? 'my' : 'th';
    setLang(v);
    if (S.user) { S.user.language = v; api.saveUser(S.user.id, { language: v }).catch(() => {}); }
    go(screen);
  };
}

export function bottomNav(host, active, go) {
  const hungry = S.pets.some(p => p.mood !== 'ok');
  host.innerHTML = '<div class="nav">' + NAV.map(n =>
    `<button type="button" data-go="${n.id}" class="${n.id === active ? 'on' : ''}">
       <img src="${n.icon}" alt="" width="26" height="26">${t(n.key)}${n.id === 'myhome' && hungry ? '<span class="dot"></span>' : ''}</button>`).join('') + '</div>';
  host.onclick = e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); };
}

export function toast(msg) {
  const app = document.getElementById('app');
  app.querySelectorAll('.toast').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  app.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

// ป๊อปอัปจากขอบล่าง
export function modal(html) {
  const app = document.getElementById('app');
  const el = document.createElement('div');
  el.className = 'scrim';
  el.innerHTML = '<div class="modal">' + html + '</div>';
  el.onclick = e => { if (e.target === el || e.target.closest('[data-close]')) el.remove(); };
  app.appendChild(el);
  return el;
}
