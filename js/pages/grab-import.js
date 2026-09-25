// หน้า Import ข้อมูลจาก Grab — เลือกร้าน → เลือกไฟล์ CSV หลายไฟล์ → รู้ชนิดเอง → บันทึกลงฐาน + ตารางว่าได้ข้อมูลช่วงไหนแล้ว/ยังขาดช่วงไหน
import { GRAB_UI, GRAB_SETS } from '../shared/config.js';
import { getGrabCoverage, saveGrabImport, getIncomeBrands, todayIso } from '../shared/data.js';
import { parseGrabFile } from '../shared/grab-parse.js';
import { grabFrame, shopTabsHtml } from './grab.js';
import { workNoteHtml } from '../shared/work-ui.js';
import { toast, glyph } from '../shared/ui.js';
import { currentUser } from '../shared/auth.js';
import { fillText, dayShort, dayLongTh, shiftIso, money, escHtml } from '../shared/format.js';

const T = GRAB_UI.imp;
const label = id => (GRAB_SETS.find(s => s.id === id) || {}).label || id;

// รวมวันที่ติดกันเป็นช่วง เช่น [1,2,3,7] → [[1,3],[7,7]]
function toRanges(days) {
  const out = [];
  days.forEach(d => { const last = out[out.length - 1]; if (last && shiftIso(last[1], 1) === d) last[1] = d; else out.push([d, d]); });
  return out;
}
const rangeTh = ([a, b]) => (a === b ? dayShort(a) : `${dayShort(a)} – ${dayShort(b)}`);

// คิดความครบของทุกชุด: วันที่ที่มี = ช่วงของไฟล์ที่อัป ∪ วันที่มีแถวจริง · นับตั้งแต่วันแรกของไฟล์ใดๆ ถึงเมื่อวาน
function coverage({ files, days }) {
  const end = shiftIso(todayIso(), -1), start = files.map(f => f.period_start).filter(Boolean).sort()[0] || null;
  const rows = GRAB_SETS.map(set => {
    const fs = files.filter(f => f.file_type === set.id);
    const have = new Set(days.filter(d => d.ds === set.id).map(d => d.d));
    fs.forEach(f => { for (let d = f.period_start; d && d <= f.period_end; d = shiftIso(d, 1)) have.add(d); });
    if (!have.size || !start) return { set, none: true };
    const miss = [];
    for (let d = start; d <= end; d = shiftIso(d, 1)) if (!have.has(d)) miss.push(d);
    const all = [...have].filter(d => d <= end).sort();
    return { set, first: all[0], last: all[all.length - 1], miss: miss.length, gaps: toRanges(miss), file: fs[0], capped: fs.some(f => f.note === 'capped') };
  });
  return { start, end, rows };
}

// แถวชุดข้อมูล 1 ชุดในตารางความครบ
function covRowHtml(r) {
  const chip = r.none ? `<i class="grchip grchip--none">${T.none}</i>` : r.miss ? `<i class="grchip grchip--lack">${fillText(T.lack, { n: r.miss })}</i>` : `<i class="grchip grchip--ok">${T.full}</i>`;
  const gaps = r.gaps && r.gaps.length ? `<em class="grcov__gap">${fillText(T.lackAt, { r: r.gaps.slice(0, 3).map(rangeTh).join(', ') })}${r.gaps.length > 3 ? ' ' + fillText(T.more, { n: r.gaps.length - 3 }) : ''}</em>` : '';
  const last = r.file ? `<em>${fillText(T.last, { d: dayShort(r.file.uploaded_at.slice(0, 10)), by: escHtml(r.file.uploaded_by || '-') })}</em>` : '';
  return `<div class="grcov__row">
    <div class="grcov__top"><b>${r.set.label}</b>${chip}</div>
    <span class="grcov__range">${r.none ? escHtml(r.set.file) : rangeTh([r.first, r.last])}</span>
    ${gaps}${last}${r.capped ? `<em class="grcov__gap">${fillText(T.capped, { d: dayShort(r.last) })}</em>` : ''}
  </div>`;
}

// ติดตั้งหน้า Import
export function mountGrabImportPage(root, onGo) {
  const el = s => root.querySelector(s);
  const hero = grabFrame(root, T, GRAB_UI.backHub);
  let picked = [], busy = false, shops = [], shop = null;
  el('#w-body').innerHTML = hero + `
    <section class="wcard grpick"><h2 class="grh">${T.step1}</h2><div id="gr-shops"><p class="wempty">${GRAB_UI.loading}</p></div></section>
    <section class="wcard grpick"><h2 class="grh">${T.step2}</h2>
      <label class="grpick__btn">${glyph('file', 20)}<span>${T.pick}</span><input type="file" accept=".csv,text/csv" multiple hidden data-pick="1"></label>
      <p class="grpick__hint">${T.pickHint}</p>
      <div id="gr-picked" class="grpick__list"></div>
    </section>
    <section class="wcard grcov"><h2 class="grh" id="gr-cov-h">${T.covTitle}</h2><div id="gr-cov"><p class="wempty">${GRAB_UI.loading}</p></div></section>
    <section class="wcard grcov"><h2 class="grh">${T.histTitle}</h2><div id="gr-hist"></div></section>
    ${workNoteHtml(T.note)}`;

  // วาดรายการไฟล์ที่เลือก + ปุ่มบันทึก
  const drawPicked = () => {
    const ok = picked.filter(p => p.kind && p.state !== 'done');
    el('#gr-picked').innerHTML = picked.map((p, i) => `<div class="grfile${p.kind ? '' : ' is-bad'}">
      <span class="grfile__main"><b>${p.kind ? label(p.kind) : T.unknown}</b><em>${escHtml(p.name)}</em>
      ${p.kind ? `<em>${p.from ? rangeTh([p.from, p.to]) : ''} · ${fillText(T.rows, { n: money(p.rows.length) })}</em>${p.store ? `<em>${fillText(T.inFile, { s: escHtml(p.store) })}</em>` : ''}` : ''}</span>
      <span class="grfile__st" id="gr-st-${i}">${p.state === 'done' ? T.done : p.state === 'fail' ? T.fail : ''}</span></div>`).join('')
      + (ok.length ? (shop ? `<button class="wbtn wbtn--go grpick__save" type="button" data-save="1"${busy ? ' disabled' : ''}>${glyph('check', 18)}<span>${fillText(T.saveAll, { n: ok.length, s: shopName() })}</span></button>` : `<p class="grpick__warn">${T.needShop}</p>`) : '');
  };

  const shopName = () => (shops.find(x => x.id === shop) || {}).name || '';
  // วาดแท็บร้าน
  const drawShops = () => { el('#gr-shops').innerHTML = shopTabsHtml(shops, shop) + `<p class="grpick__hint">${shop ? fillText(T.shopNow, { s: shopName() }) : T.shopHint}</p>`; };

  // โหลดตารางความครบ + ประวัติไฟล์ ของร้านที่เลือก
  const loadCov = async () => {
    el('#gr-cov-h').textContent = shop ? `${T.covTitle} · ${shopName()}` : T.covTitle;
    if (!shop) { el('#gr-cov').innerHTML = `<p class="wempty">${T.shopHint}</p>`; el('#gr-hist').innerHTML = ''; return; }
    const want = shop;
    try {
      const b = await getGrabCoverage(shop), c = coverage(b);
      if (want !== shop) return;
      el('#gr-cov').innerHTML = (c.start ? `<p class="grsub">${fillText(T.covSub, { a: dayLongTh(c.start), b: dayLongTh(c.end) })}</p>` : '') + c.rows.map(covRowHtml).join('');
      el('#gr-hist').innerHTML = b.files.length ? b.files.slice(0, 12).map(f => `<div class="whist__row"><span><b>${label(f.file_type)}</b><em>${f.period_start ? rangeTh([f.period_start, f.period_end]) : ''} · ${fillText(T.rows, { n: money(f.row_count) })}</em></span><em>${dayShort(f.uploaded_at.slice(0, 10))} · ${escHtml(f.uploaded_by || '-')}</em></div>`).join('') : `<p class="wempty">${T.histNone}</p>`;
    } catch { el('#gr-cov').innerHTML = `<p class="wempty">${GRAB_UI.loadError}<em><button class="atbtn" type="button" data-reload="1">${GRAB_UI.retry}</button></em></p>`; }
  };

  // อ่านไฟล์ที่เลือกทั้งหมด
  const readFiles = async files => {
    el('#gr-picked').innerHTML = `<p class="wempty">${T.reading}</p>`;
    picked = [];
    for (const f of files) picked.push({ ...parseGrabFile(f.name, await f.text()), state: '' });
    drawPicked();
  };

  // บันทึกทุกไฟล์ที่รู้จักทีละไฟล์ (ไฟล์ไหนพังไม่กระทบไฟล์อื่น)
  const saveAll = async () => {
    busy = true; drawPicked();
    const by = (currentUser() || {}).code || null;
    let n = 0;
    for (const [i, p] of picked.entries()) {
      if (!p.kind || p.state === 'done') continue;
      const st = () => el(`#gr-st-${i}`);
      try {
        await saveGrabImport(p, shop, by, k => { if (st()) st().textContent = fillText(T.saving, { a: money(k), b: money(p.rows.length) }); });
        p.state = 'done'; n++;
      } catch { p.state = 'fail'; }
      if (st()) st().textContent = p.state === 'done' ? T.done : T.fail;
    }
    busy = false; drawPicked();
    if (n) toast(fillText(T.savedAll, { n }));
    loadCov();
  };

  getIncomeBrands().then(b => { shops = b; drawShops(); loadCov(); }).catch(() => { el('#gr-shops').innerHTML = `<p class="wempty">${GRAB_UI.loadError}</p>`; });
  root.addEventListener('change', event => { if (event.target.matches('[data-pick]') && event.target.files.length) readFiles([...event.target.files]); });
  root.addEventListener('click', event => {
    const hit = s => event.target.closest(s);
    if (hit('[data-back]')) return onGo('grab');
    if (hit('[data-reload]')) return loadCov();
    if (hit('[data-shop]') && !busy) { shop = hit('[data-shop]').dataset.shop; drawShops(); drawPicked(); return loadCov(); }
    if (hit('[data-save]') && !busy) saveAll();
  });
}
