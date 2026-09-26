// ภาษาพม่าของแอป — ที่เดียว: รวมข้อความไทยทั้งแอปให้แปล + สวิตช์ใส่พม่ากำกับทั้งแอป (ปิดไว้เป็นค่าตั้งต้น)
// คำพม่ามาจากตาราง kk_word_my (รายการนับ) และ kk_app_word_my (ข้อความบนจอ) เท่านั้น ไม่แปลเอง
import * as CFG from './config.js';
import { MY_APP_CATS, MY_SKIP_KEYS, MY_SKIP_PAGES } from './config.js';
import { getAppWordMy, getWordMyAll } from './data.js';
import { MY_TOGGLE_UI } from './config.js';
import { toast } from './ui.js';

const TH = /[\u0E00-\u0E7F]/;
const ON_KEY = 'kodklean.my.annotate';
const MARK = 'i18n-my';

// ทำข้อความให้อยู่ในรูปเดียวกันก่อนเทียบ (ตัดแท็ก ขึ้นบรรทัด และช่องว่างซ้ำ)
export const normTh = s => String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ข้อความไทยทั้งแอป (จาก config.js ยกเว้นเกม) แยกหมวด ข้อความซ้ำเก็บครั้งเดียว
export function appThaiList() {
  const seen = new Set(), out = [];
  const walk = (v, cat, key) => {
    if (typeof v === 'string') {
      const th = v.trim();
      if (th && TH.test(th) && !MY_SKIP_KEYS.includes(key) && !seen.has(th)) { seen.add(th); out.push({ th, cat }); }
      return;
    }
    if (Array.isArray(v)) return v.forEach(x => walk(x, cat, key));
    if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, cat, k));
  };
  MY_APP_CATS.forEach(c => c.from.forEach(name => walk(CFG[name], c.id, name)));
  return out;
}

// สวิตช์พม่ากำกับทั้งแอป (จำแยกเครื่อง · ไม่เคยตั้ง = ปิด)
export const myOn = () => localStorage.getItem(ON_KEY) === '1';

// เปิด/ปิดสวิตช์ แล้วใส่หรือเอาพม่าออกจากหน้าจอทันที
export function setMyOn(on) {
  localStorage.setItem(ON_KEY, on ? '1' : '0');
  return on ? startMy() : stopMy();
}

let obs = null, dict = null, tpls = [], busy = false, host = null;

// แปลงข้อความแบบมีช่องเติม เช่น "บันทึก {n} รายการ" เป็นตัวจับคู่
function tplOf(th, my) {
  const parts = th.split(/\{(\w+)\}/);
  const names = parts.filter((_, i) => i % 2);
  const re = new RegExp('^' + parts.map((p, i) => i % 2 ? '(.+?)' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$');
  return { re, names, my };
}

// หาคำพม่าของข้อความไทย 1 ก้อน (ไม่เจอ = '')
function lookup(text) {
  const hit = dict.get(text);
  if (hit) return hit;
  for (const t of tpls) {
    const m = t.re.exec(text);
    if (m) return t.names.reduce((s, n, i) => s.split(`{${n}}`).join(m[i + 1]), t.my);
  }
  return '';
}

// ข้อความของกล่องนี้ (ไม่นับคำพม่าที่ใส่ไว้แล้ว) — คืน null ถ้ากล่องมีกล่องย่อยอื่นปน
function ownText(el) {
  let s = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) s += n.nodeValue;
    else if (n.nodeName === 'BR') s += ' ';
    else if (!(n.classList && n.classList.contains(MARK))) return null;
  }
  return normTh(s);
}

// ใส่คำพม่าใต้ข้อความไทยทุกจุดในกล่องที่ส่งมา (ทำซ้ำได้ ไม่ใส่ซ้ำ)
function annotate(root) {
  if (!dict || MY_SKIP_PAGES.includes((host && host.dataset.page) || '')) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: el => (el.closest(`[data-no-my], .${MARK}, script, style, svg, textarea, select, option`) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  for (let el = walker.currentNode; el; el = walker.nextNode()) {
    if (el.nodeType !== 1) continue;
    if (el.matches('input[placeholder]')) {
      const ph = el.dataset.myPh || el.placeholder;
      const my = TH.test(ph) ? lookup(normTh(ph)) : '';
      if (my && !el.dataset.myPh) { el.dataset.myPh = ph; el.placeholder = `${ph} · ${my}`; }
      continue;
    }
    const text = ownText(el);
    if (text !== null) {
      if (!text || !TH.test(text)) continue;
      const my = lookup(text);
      const last = el.lastChild;
      const has = last && last.classList && last.classList.contains(MARK);
      if (my && !(has && last.textContent === my)) { if (has) last.remove(); el.insertAdjacentHTML('beforeend', `<span class="${MARK}" lang="my"></span>`); el.lastChild.textContent = my; }
      continue;
    }
    // กล่องที่มีข้อความปนกับกล่องย่อย: ใส่พม่าต่อท้ายข้อความไทยแต่ละท่อน
    [...el.childNodes].forEach(n => {
      if (n.nodeType !== 3 || !TH.test(n.nodeValue)) return;
      const nx = n.nextSibling;
      if (nx && nx.classList && nx.classList.contains(MARK)) return;
      const my = lookup(normTh(n.nodeValue));
      if (!my) return;
      const span = document.createElement('span');
      span.className = MARK; span.lang = 'my'; span.textContent = my;
      n.after(span);
    });
  }
}

// รอให้หน้าจอวาดเสร็จก่อนค่อยใส่พม่า (รวมการเปลี่ยนหลายครั้งเป็นรอบเดียว)
function schedule() {
  if (busy) return;
  busy = true;
  requestAnimationFrame(() => { busy = false; if (obs) annotate(host); });
}

// เริ่มใส่พม่ากำกับทั้งแอป (สวิตช์ปิด = ไม่ทำอะไร และไม่เรียกฐาน)
export async function startMy(root = document.querySelector('.app')) {
  if (!myOn() || obs || !root) return;
  host = root;
  const [app, stock] = await Promise.all([getAppWordMy().catch(() => []), getWordMyAll().catch(() => [])]);
  if (!myOn() || obs) return;
  dict = new Map(); tpls = [];
  (stock || []).forEach(w => {
    if (w.name_my) dict.set(normTh(w.th_name), w.name_my);
    if (w.unit_th && w.unit_my) dict.set(normTh(w.unit_th), w.unit_my);
    if (w.cat_th && w.cat_my) dict.set(normTh(w.cat_th), w.cat_my);
  });
  (app || []).forEach(w => {
    const my = normTh(w.my), th = normTh(w.th);
    if (!my || !th) return;
    if (/\{\w+\}/.test(th)) tpls.push(tplOf(th, my)); else dict.set(th, my);
  });
  obs = new MutationObserver(schedule);
  obs.observe(root, { childList: true, subtree: true, characterData: true });
  annotate(root);
}

// ปิดพม่ากำกับ: เอาคำพม่าออกจากหน้าจอทั้งหมด กลับเป็นไทยล้วน
export function stopMy() {
  if (obs) obs.disconnect();
  obs = null; dict = null; tpls = [];
  const root = host || document;
  root.querySelectorAll(`.${MARK}`).forEach(el => el.remove());
  root.querySelectorAll('[data-my-ph]').forEach(el => { el.placeholder = el.dataset.myPh; delete el.dataset.myPh; });
}

// โหลดคำพม่าใหม่หลังมีคนแก้คำแปล (สวิตช์เปิดอยู่เท่านั้น)
export async function reloadMy() {
  if (!myOn()) return;
  stopMy();
  await startMy();
}

// ปุ่มสวิตช์พม่ากำกับบนแถบบนสุด (ข้างระฆังแจ้งเตือน) — ใช้ทั้งแถบบนของแอปและหัวหน้าหลัก
export const myToggleHtml = () => `
  <button class="my-tog${myOn() ? ' is-on' : ''}" type="button" data-my-toggle="1" data-no-my="1" role="switch" aria-checked="${myOn()}" aria-label="${MY_TOGGLE_UI.label}" title="${MY_TOGGLE_UI.label}">
    <span class="my-tog__text">${MY_TOGGLE_UI.text}</span><i class="my-tog__knob"></i>
  </button>`;

// ทำให้ปุ่มสวิตช์ทุกปุ่มในแอปกดได้ (ติดตั้งครั้งเดียว) และให้ทุกปุ่มแสดงสถานะตรงกัน
export function bindMyToggle(root = document) {
  root.addEventListener('click', async event => {
    const btn = event.target.closest('[data-my-toggle]');
    if (!btn) return;
    const on = !myOn();
    document.querySelectorAll('[data-my-toggle]').forEach(b => { b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
    await setMyOn(on);
    toast(on ? MY_TOGGLE_UI.on : MY_TOGGLE_UI.off);
  });
}
