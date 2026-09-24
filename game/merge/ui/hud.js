// ส่วนควบคุมบนจอ: คะแนน, ชิ้นถัดไป, ปุ่มเสียง, ปุ่มเพลง, ปุ่มอันดับ, ปุ่มกลับหมู่บ้าน, หน้าต่างต่างๆ
import { ITEMS, GAME } from '../config.js';
import { P, tx } from '../core/player.js';

const I = {
  sfxOn: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  sfxOff: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  all: '<svg viewBox="0 0 24 24"><path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6" cy="18" r="2.6"/><circle cx="17" cy="16" r="2.6"/></svg>',
  vocal: '<svg viewBox="0 0 24 24"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  inst: '<svg viewBox="0 0 24 24"><path d="M4 16V9M8 19V6M12 17V4M16 19V8M20 15v-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path d="M3 7h3.6a4 4 0 0 1 3.3 1.8l4.2 6.4a4 4 0 0 0 3.3 1.8H21M3 17h3.6a4 4 0 0 0 3.3-1.8l.8-1.2M14.3 8.9l.3-.5A4 4 0 0 1 17.9 7H21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.4 4.4L21 7l-2.6 2.6M18.4 14.4L21 17l-2.6 2.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M4 7h11M4 12h11M4 17h7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18 8v9M15.4 14.4L18 17l2.6-2.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  repeat: '<svg viewBox="0 0 24 24"><path d="M7 5h9a4 4 0 0 1 4 4v1M17 19H8a4 4 0 0 1-4-4v-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9.6 2.6L7 5l2.6 2.4M14.4 16.6L17 19l-2.6 2.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.2"/></svg>',
  musicOn: '<svg viewBox="0 0 24 24"><path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="6" cy="18" r="2.6"/><circle cx="17" cy="16" r="2.6"/></svg>',
  musicOff: '<svg viewBox="0 0 24 24"><path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity=".4"/><circle cx="6" cy="18" r="2.6" opacity=".4"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
export const TYPE_LABEL = { all: 'tAll', vocal: 'tVocal', inst: 'tInst' };
export const ORDER_LABEL = { shuffle: 'oShuffle', list: 'oList', repeat: 'oRepeat' };
const itemSrc = tier => 'assets/items/' + ITEMS[tier - 1].img + '.webp';

let root, el = {};

export function mount(host, h) {
  root = host;
  root.insertAdjacentHTML('beforeend', `
    <div class="hud">
      <div class="hud__left">
        ${P.fromVillage ? `<button class="pill" data-act="back">${I.back}<span>${tx('back')}</span></button>` : ''}
        <div class="scorecard">
          <span class="scorecard__lbl">${tx('score')}</span>
          <b class="scorecard__num" id="h-score">0</b>
          <span class="scorecard__best">${tx('best')} <b id="h-best">0</b></span>
        </div>
        ${P.guest ? `<span class="guest">${tx('guest')}</span>` : ''}
      </div>
      <div class="hud__right">
        <div class="nextbox"><span>${tx('next')}</span><img id="h-next" alt=""></div>
        <div class="btns">
          <button class="ib" data-act="sfx" id="h-sfx"></button>
          <button class="ib" data-act="order" id="h-order"></button>
          <button class="ib" data-act="type" id="h-type"></button>
          <button class="ib" data-act="mute" id="h-mute"></button>
          <button class="ib" data-act="board" aria-label="${tx('board')}">${I.trophy}</button>
        </div>
      </div>
    </div>
    <div class="combo" id="h-combo"></div>
    <div class="toast" id="h-toast"></div>
    <div class="layer" id="h-layer"></div>`);
  el = {
    score: root.querySelector('#h-score'), best: root.querySelector('#h-best'), next: root.querySelector('#h-next'),
    sfx: root.querySelector('#h-sfx'), order: root.querySelector('#h-order'),
    type: root.querySelector('#h-type'), mute: root.querySelector('#h-mute'),
    combo: root.querySelector('#h-combo'), toast: root.querySelector('#h-toast'), layer: root.querySelector('#h-layer')
  };
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    e.stopPropagation();
    const fn = h[b.dataset.act];
    if (fn) fn(b);
  });
}

export function setScore(s, best) { el.score.textContent = s.toLocaleString(); el.best.textContent = best.toLocaleString(); }
export function setNext(tier) { const src = itemSrc(tier); if (el.next.getAttribute('src') !== src) el.next.src = src; }

export function setSfx(on) {
  el.sfx.innerHTML = on ? I.sfxOn : I.sfxOff;
  el.sfx.classList.toggle('is-off', !on);
  el.sfx.setAttribute('aria-label', tx(on ? 'sfxOn' : 'sfxOff'));
}
export function setOrder(order) {
  el.order.innerHTML = I[order];
  el.order.setAttribute('aria-label', tx(ORDER_LABEL[order]));
}
export function setType(type) {
  el.type.innerHTML = I[type];
  el.type.setAttribute('aria-label', tx(TYPE_LABEL[type]));
}
export function setMusicOn(on) {
  el.mute.innerHTML = on ? I.musicOn : I.musicOff;
  el.mute.classList.toggle('is-off', !on);
  el.mute.setAttribute('aria-label', tx(on ? 'mOn' : 'mOff'));
}

let comboT = 0;
export function combo(n) {
  if (n < 2) return;
  el.combo.textContent = `${tx('combo')} ×${n}`;
  el.combo.classList.remove('is-on'); void el.combo.offsetWidth; el.combo.classList.add('is-on');
  clearTimeout(comboT);
  comboT = setTimeout(() => el.combo.classList.remove('is-on'), 900);
}

let toastT = 0;
export function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.toast.classList.remove('is-on'), 1800);
}

function open(html, onAct) {
  el.layer.innerHTML = `<div class="scrim"><div class="card">${html}</div></div>`;
  el.layer.classList.add('is-on');
  el.layer.onclick = e => {
    const b = e.target.closest('[data-do]');
    if (b) { e.stopPropagation(); onAct(b.dataset.do); return; }
    if (e.target.classList.contains('scrim')) { e.stopPropagation(); onAct('close'); }
  };
}
export function close() { el.layer.classList.remove('is-on'); el.layer.innerHTML = ''; el.layer.onclick = null; }
export const isOpen = () => el.layer.classList.contains('is-on');

export function startScreen(onGo) {
  open(`<img class="card__hero" src="${itemSrc(ITEMS.length)}" alt="">
    <p class="card__h">${tx('tapStart')}</p>
    <p class="card__p">${tx('howTo')}</p>
    <div class="ladder">${ITEMS.map((_, i) => `<img src="${itemSrc(i + 1)}" alt="">`).join('')}</div>
    <button class="btn" data-do="go">${tx('tapStart')}</button>`, () => { close(); onGo(); });
}

export function overScreen({ score, best, isBest, topTier }, onAct) {
  open(`<p class="card__h">${tx('over')}</p>
    ${isBest ? `<p class="card__badge">${tx('newBest')}</p>` : ''}
    <b class="card__score">${score.toLocaleString()}</b>
    <p class="card__p">${tx('best')} ${best.toLocaleString()}</p>
    <div class="reach"><img src="${itemSrc(topTier)}" alt=""><span>${tx('reached')} ${topTier}</span></div>
    <button class="btn" data-do="again">${tx('again')}</button>
    <div class="row2">
      <button class="btn btn--ghost" data-do="board">${tx('board')}</button>
      ${P.fromVillage ? `<button class="btn btn--ghost" data-do="back">${tx('back')}</button>` : ''}
    </div>`, onAct);
}

export function boardScreen(rows, onAct) {
  const me = P.emp;
  const list = rows ? rows.slice(0, GAME.leaderboardSize) : [];
  const mine = rows && me ? rows.findIndex(r => r.emp_code === me) : -1;
  const line = (r, i) => `<li class="${r.emp_code === me ? 'is-me' : ''}">
    <span class="rank">${i + 1}</span>
    <img src="${itemSrc(Math.max(1, Math.min(ITEMS.length, r.top_tier || 1)))}" alt="">
    <span class="who">${r.name || r.emp_code}${r.emp_code === me ? ` · ${tx('you')}` : ''}</span>
    <b>${Number(r.score).toLocaleString()}</b></li>`;
  const body = rows === null ? `<p class="card__p">${tx('loading')}</p>`
    : !list.length ? `<p class="card__p">${tx('empty')}</p>`
    : `<ol class="lb">${list.map(line).join('')}${mine >= GAME.leaderboardSize ? '<li class="gap">…</li>' + line(rows[mine], mine) : ''}</ol>`;
  open(`<p class="card__h">${I.trophy} ${tx('board')}</p>${body}
    <button class="btn btn--ghost" data-do="close">${tx('close')}</button>`, onAct);
}
