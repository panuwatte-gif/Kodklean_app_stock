// หน้าเพลง — เพลย์ลิสต์และรายการเพลง (เครื่องเล่นอยู่ที่ music-player.js · นำเข้าเพลงอยู่ที่ music-import.js)
import { MUSIC_UI } from '../shared/config.js';
import { glyph, toast, confirmSheet, formSheet } from '../shared/ui.js';
import { fillText, mmss } from '../shared/format.js';
import { currentUser } from '../shared/auth.js';
import * as data from '../shared/data.js';
import { playerHtml, play, step, bindAudio, readPos } from './music-player.js';
import { importFiles, addFromLibrary } from './music-import.js';

const T = MUSIC_UI;
const ALL = 'all';
let state = null;
let audio = null;

// เพลงที่อยู่ในเพลย์ลิสต์ที่เลือกอยู่ (ALL = ทุกเพลงในคลัง)
function viewTracks() {
  if (state.listId === ALL) return state.tracks;
  const ids = state.links.filter(l => l.playlist_id === state.listId).map(l => l.track_id);
  return ids.map(id => state.tracks.find(t => t.id === id)).filter(Boolean);
}

// แถบเพลย์ลิสต์ด้านบน
function railHtml() {
  const chip = (id, name, n) => `
    <button class="mus__chip${state.listId === id ? ' is-on' : ''}" type="button" data-list="${id}">
      <span class="mus__chipName">${name}</span>
      <span class="mus__chipN">${n} เพลง</span>
      ${state.manage && id !== ALL ? `<i class="mus__chipX" data-act="dellist" data-list="${id}">${glyph('x', 13)}</i>` : ''}
    </button>`;
  const lists = state.lists.map(l => chip(l.id, l.name, state.links.filter(k => k.playlist_id === l.id).length));
  return chip(ALL, T.allTracks, state.tracks.length) + lists.join('') +
    `<button class="mus__chip mus__chip--new" type="button" data-act="newlist">${glyph('plus', 16)}<span>${T.newList}</span></button>`;
}

// รายการเพลงของเพลย์ลิสต์ที่เลือก
function listHtml() {
  if (!state.view.length) return `<p class="mus__empty">${T.empty}</p>`;
  return state.view.map((t, i) => `
    <div class="mus__row${state.curId === t.id ? ' is-on' : ''}">
      <button class="mus__rowMain" type="button" data-act="pick" data-track="${t.id}">
        <span class="mus__no">${state.curId === t.id && state.playing ? glyph('pause', 14) : String(i + 1).padStart(2, '0')}</span>
        <span class="mus__meta"><b>${t.title}</b><em>${t.artist || T.unknownArtist}</em></span>
        <span class="mus__dur">${mmss(t.duration_seconds)}</span>
      </button>
      ${state.manage ? `<span class="mus__rowTools">
        ${state.listId !== ALL ? `<button class="mus__tool" type="button" data-act="unlink" data-track="${t.id}" aria-label="${T.removeFrom}">${glyph('x', 15)}</button>` : ''}
        <button class="mus__tool mus__tool--del" type="button" data-act="deltrack" data-track="${t.id}" aria-label="${T.deleteTrack}">${glyph('trash', 15)}</button>
      </span>` : ''}
    </div>`).join('');
}

// วาดทั้งหน้าใหม่
function draw(root) {
  state.view = viewTracks();
  root.querySelector('#mus-rail').innerHTML = railHtml();
  root.querySelector('#mus-playerhost').innerHTML = playerHtml(state);
  root.querySelector('#mus-list').innerHTML = listHtml();
  root.querySelector('#mus-manage').textContent = state.manage ? T.manageOff : T.manage;
  root.querySelector('#mus-addfrom').hidden = state.listId === ALL;
}

// อัปเดตเฉพาะแถบเวลาระหว่างเพลงเดิน (ไม่วาดทั้งหน้า จอจะไม่กระตุก)
function tick(root) {
  const range = root.querySelector('.mus__range');
  if (!range) return;
  const dur = state.dur || 1;
  range.max = Math.max(1, Math.floor(dur));
  range.value = Math.floor(state.cur);
  root.querySelector('.mus__fill').style.width = `${Math.min(100, (state.cur / dur) * 100)}%`;
  root.querySelector('.mus__times').firstElementChild.textContent = mmss(state.cur);
}

// สร้างเพลย์ลิสต์ใหม่
async function askNewList(root) {
  const out = await formSheet({ title: T.newListAsk.title, fields: [{ key: 'name', label: T.newListAsk.name, value: '' }], okLabel: T.newListAsk.ok });
  if (!out) return;
  const name = String(out.name || '').trim();
  if (!name) return toast(T.err.name);
  const me = currentUser();
  const rows = await data.addPlaylist(name, me && me.name).catch(() => null);
  if (!rows) return toast(T.err.save);
  state.listId = (rows[0] && rows[0].id) || state.listId;
  await load(root);
  toast(fillText(T.done.newList, { name }));
}

// ปุ่มทั้งหมดบนหน้า
async function onClick(root, event) {
  const hit = event.target.closest('[data-act], [data-list]');
  if (!hit) return;
  const act = hit.dataset.act;
  const id = hit.dataset.track;
  const redraw = () => draw(root);

  if (act === 'toggle') return play(state, audio, state.curId, redraw);
  if (act === 'pick') return play(state, audio, id, redraw);
  if (act === 'prev') return step(state, audio, -1, redraw);
  if (act === 'next') return step(state, audio, 1, redraw);
  if (act === 'newlist') return askNewList(root);

  if (act === 'dellist') {
    const list = state.lists.find(l => l.id === hit.dataset.list);
    if (!list || !await confirmSheet({ title: fillText(T.delListAsk.title, { name: list.name }), text: T.delListAsk.text, okLabel: T.delListAsk.ok, danger: true })) return;
    await data.removePlaylist(list.id);
    if (state.listId === list.id) state.listId = ALL;
    await load(root);
    return toast(fillText(T.done.delList, { name: list.name }));
  }
  if (act === 'unlink') {
    const track = state.tracks.find(t => t.id === id);
    await data.removeTrackFromPlaylist(state.listId, id);
    await load(root);
    return toast(fillText(T.done.removeFrom, { name: track ? track.title : '' }));
  }
  if (act === 'deltrack') {
    const track = state.tracks.find(t => t.id === id);
    if (!track || !await confirmSheet({ title: fillText(T.delTrackAsk.title, { name: track.title }), text: T.delTrackAsk.text, okLabel: T.delTrackAsk.ok, danger: true })) return;
    await data.removeTrack(track);
    if (state.curId === track.id) { audio.pause(); state.curId = null; }
    await load(root);
    return toast(fillText(T.done.delTrack, { name: track.title }));
  }
  if (hit.dataset.list) { state.listId = hit.dataset.list; return draw(root); }
}

// โหลดเพลย์ลิสต์ เพลง และความเชื่อมโยงจากฐานทั้งชุด
async function load(root) {
  try {
    const [lists, tracks, links] = await Promise.all([data.getPlaylists(), data.getTracks(), data.getPlaylistTracks()]);
    state.lists = lists || [];
    state.tracks = tracks || [];
    state.links = links || [];
    if (state.listId !== ALL && !state.lists.some(l => l.id === state.listId)) state.listId = ALL;
    draw(root);
  } catch (err) {
    root.querySelector('#mus-list').innerHTML = `<p class="mus__empty">${T.error}</p>`;
  }
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมเพลย์ลิสต์ เครื่องเล่น และรายการเพลง
export function mountMusicPage(root) {
  const pos = readPos();
  state = { lists: [], tracks: [], links: [], view: [], listId: ALL, manage: false, curId: pos.id || null, playing: false, cur: pos.t || 0, dur: 0 };
  audio = root.querySelector('#mus-audio');

  root.querySelector('#mus-title').textContent = T.title;
  root.querySelector('#mus-sub').textContent = T.sub;
  root.querySelector('#mus-import').innerHTML = `${glyph('upload', 18)}<span>${T.importBtn}</span>`;
  root.querySelector('#mus-addfrom').innerHTML = `${glyph('plus', 18)}<span>${T.addFrom}</span>`;
  root.querySelector('#mus-hint').textContent = T.importHint;
  root.querySelector('#mus-list').innerHTML = `<p class="mus__empty">${T.loading}</p>`;

  bindAudio(audio, state, () => draw(root), () => tick(root));
  root.querySelector('#mus-manage').onclick = () => { state.manage = !state.manage; draw(root); };
  root.querySelector('#mus-import').onclick = () => importFiles(state, () => load(root));
  root.querySelector('#mus-addfrom').onclick = () => addFromLibrary(state, () => load(root));
  root.addEventListener('input', event => {
    if (event.target.dataset.act === 'seek') audio.currentTime = Number(event.target.value) || 0;
  });
  root.addEventListener('click', event => onClick(root, event));
  load(root);
}
