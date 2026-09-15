// แท็บเตรียมข้าว (แท็บที่ 2) — หุง (ดิบ) / ข้าวสุกคงเหลือ / สมการสองหน่วย / อัตราหุง (แก้ได้) / สถิติ 7 วันจริง
import { PREP_RICE_COLS, PREP_UI, STOCK_PHOTOS, STOCK_PHOTO_BY_GROUP } from '../shared/config.js';
import { riceRaw, riceCooked, riceResale, riceToRaw } from '../shared/calc.js';
import { weightBig, dayShort } from '../shared/format.js';
import { personPill } from './prep-view.js';
import { cellInput, histDot } from './prep-meat.js';

// หัวตาราง (คอลัมน์ตาม config)
function headHtml(cols) {
  return `<div class="ptab__head">${cols.map(([a, b]) => `<div class="ptab__th">${a}${b ? `<em>${b}</em>` : ''}</div>`).join('')}</div>`;
}

// หัวข้อการ์ดตาราง
function cardTitle(icon, text, tone) {
  return `<div class="ptab__title ptab__title--${tone}"><img src="${icon}" alt="" width="20" height="20" loading="lazy" decoding="async">${text}</div>`;
}

// ชื่อข้าวพร้อมรูปเล็ก
function riceName(r, no, small) {
  const photo = STOCK_PHOTOS[r.id] || STOCK_PHOTO_BY_GROUP['ข้าว'];
  return `
    <span class="ptab__no${small ? ' ptab__no--sm' : ''}">${no}</span>
    <div class="ptab__item"><span class="ptab__thumb${small ? ' ptab__thumb--sm' : ''}"><img src="${photo}" alt="" width="${small ? 22 : 28}" height="${small ? 22 : 28}" loading="lazy" decoding="async"></span><span class="ptab__name"><span>${r.name}</span></span></div>`;
}

// ช่องกรอกของแท็บข้าว (บันทึกเข้า kk_prep_log ผ่าน prep.js)
const rc = (id, f, v, revs) => `<div class="ptab__c">${cellInput(id, f, v, '', 'rice')}${histDot('rice', id, f, '', revs[f])}</div>`;

// ตาราง 2.1 เตรียมหุงข้าว (ข้าวดิบ) — draft = ค่าร่างจากปุ่มคัดลอก กดยืนยันทีละแถว
function cookTable(list, t, draft) {
  const rows = list.map((r, i) => {
    const raw = riceRaw(r), cooked = riceCooked(r);
    const result = raw === null ? '—'
      : `${weightBig(raw)}<small>${cooked === null ? PREP_UI.noRatio : `≈สุก ${weightBig(cooked)} กก.`}</small>`;
    const dv = draft && (r.cook === null || r.cook === undefined) ? draft.values[r.id] : undefined;
    return `
    <div class="ptab__row" data-id="${r.id}">
      ${riceName(r, i + 1)}
      <div class="ptab__owners">${r.owners.map(personPill).join('<i>+</i>')}</div>
      ${rc(r.id, 'cook', r.cook, r.revs)}
      ${[0, 1, 2].map(k => rc(r.id, 'r' + k, r.rounds[k], r.revs)).join('')}
      <div class="ptab__use">${result}</div>
    </div>
    ${dv !== undefined ? `<div class="ptab__draftrow"><button class="ptab__draftbtn" type="button" data-apply-draft="1" data-id="${r.id}" data-v="${dv}">ใช้ ${dv} ✓</button></div>` : ''}`;
  }).join('');
  const sum = `
    <div class="ptab__sum">
      <span>รวมทั้งหมด (กก. ดิบ)</span>
      <b>${weightBig(t.cook)}</b><b>${weightBig(t.r1)}</b><b>${weightBig(t.r2)}</b><b>${weightBig(t.r3)}</b><b>${weightBig(t.raw)}</b>
    </div>`;
  return `<section class="ptab ptab--cook">${cardTitle('assets/prep/ic3d-prep.webp', 'ตาราง 2.1 เตรียมหุงข้าว (ข้าวดิบ)', 'green')}${headHtml(PREP_RICE_COLS.cook)}${rows}${sum}</section>`;
}

// ตาราง 2.2 ข้าวสุกคงเหลือและการแปลงค่า (แสดงสองหน่วยคู่กันเสมอ)
function leftTable(list) {
  const rows = list.map((r, i) => {
    const resale = riceResale(r), resaleRaw = riceToRaw(resale, r.ratio);
    return `
    <div class="ptab__row ptab__row--sm" data-id="${r.id}">
      ${riceName(r, i + 1, true)}
      ${['left', 'waste', 'home', 'give'].map(f => rc(r.id, f, r[f], r.revs)).join('')}
      <div class="ptab__c ptab__val">${resale === null ? '—' : weightBig(resale)}</div>
      <div class="ptab__c ptab__val ptab__val--green">${r.ratio === null ? `<small>${PREP_UI.noRatio}</small>` : resaleRaw === null ? '—' : weightBig(resaleRaw) + ' กก.'}</div>
    </div>`;
  }).join('');
  return `<section class="ptab ptab--left">${cardTitle('assets/prep/ic3d-left.webp', 'ตาราง 2.2 ข้าวสุกคงเหลือและการแปลงค่า', 'blue')}${headHtml(PREP_RICE_COLS.left)}${rows}</section>`;
}

// การ์ดสมการ 3 ใบ: ใช้ขายจริง = ของเสีย + ข้าวเหลือขายต่อ (สองหน่วย) + เตือนเมื่อผลรวมเทียบดิบไม่เท่าดิบที่ใช้
function eqHtml(t) {
  const cards = [
    { key: 'sold', rawKey: 'soldRaw', label: 'ใช้ขายจริง (วันนี้)', icon: 'assets/prep/ic3d-use.webp', c: '#1E7A3C', tn: '#EAF6EC', b: '#8FC79A' },
    { key: 'loss', rawKey: 'lossRaw', label: 'ของเสีย/ห่อกลับบ้าน/แจก', icon: 'assets/prep/ic3d-waste.webp', c: '#D4322A', tn: '#FDECEA', b: '#F0B4AE' },
    { key: 'resale', rawKey: 'resaleRaw', label: 'ข้าวเหลือขายต่อวันถัดไป', icon: 'assets/prep/ic3d-left.webp', c: '#2F63C9', tn: '#EAF1FD', b: '#A9C3F0' }
  ].map((e, i) => `
    ${i ? `<span class="prep-eq__op">${i === 1 ? '=' : '+'}</span>` : ''}
    <div class="prep-eq__card" style="--c:${e.c};--t:${e.tn};--b:${e.b}">
      <img src="${e.icon}" alt="" width="24" height="24" loading="lazy" decoding="async">
      <div class="prep-eq__label">${e.label}</div>
      <div class="prep-eq__big">${weightBig(t[e.key])} <small>กก. สุก</small></div>
      <div class="prep-eq__raw">= ${weightBig(t[e.rawKey])} <small>กก. ดิบ</small></div>
    </div>`).join('');
  const warn = t.checkFail ? `<div class="prep-eq__warn">${PREP_UI.riceCheck}</div>` : '';
  return `<div class="prep-eq">${cards}</div>${warn}`;
}

// ตาราง 2.3 อัตราหุงของข้าวแต่ละชนิด — ค่าตั้งจากฐาน แก้ได้ตรงนี้ (การ์ด Assumption ของแท็บข้าว)
function ratioTable(list) {
  const rows = list.map((r, i) => `
    <div class="ptab__row ptab__row--sm" data-id="${r.id}">
      ${riceName(r, i + 1, true)}
      <div class="ptab__c"><input class="asm__in asm__in--sm" type="number" inputmode="decimal" step="0.01" min="0" placeholder="-" data-save="ratio" data-f="cook_ratio" data-id="${r.id}" value="${r.ratio ?? ''}"></div>
      <div class="ptab__c ptab__val">${r.ratio === null ? `<small class="ptab__miss">${PREP_UI.noRatio}</small>` : PREP_UI.ratioOk}</div>
    </div>`).join('');
  return `<section class="ptab ptab--ratio">${cardTitle('assets/prep/ic3d-history.webp', PREP_UI.assumeRiceTitle, 'amber')}${headHtml(PREP_RICE_COLS.ratio)}${rows}</section>`;
}

// สถิติ 7 วันย้อนหลังจากบันทึกจริง (วันไม่มีข้อมูล = ขีด ไม่เดา)
function statsHtml(days) {
  const rows = days.map(d => d.has
    ? `<div class="prep-stat__row"><span>${dayShort(d.date)}</span><span>${weightBig(d.sold)}</span><span>${weightBig(d.soldRaw)}</span><span>${weightBig(d.left)}</span></div>`
    : `<div class="prep-stat__row prep-stat__row--none"><span>${dayShort(d.date)}</span><span>–</span><span>–</span><span>–</span></div>`).join('');
  return `<section class="ptab ptab--stats">${cardTitle('assets/prep/ic3d-forecast.webp', PREP_UI.statsTitle, 'green')}
    <div class="prep-stat">
      <div class="prep-stat__head"><span>วันที่</span><span>ขายจริง<em>(กก. สุก)</em></span><span>ขายจริง<em>(เทียบข้าวดิบ)</em></span><span>ข้าวเหลือ<em>(กก. สุก)</em></span></div>
      ${rows}
    </div></section>`;
}

// ทั้งแท็บข้าว
export function riceBodyHtml(list, totals, model, draft) {
  if (!list.length) return '<p class="ptab__none">ไม่มีรายการของคนนี้</p>';
  return cookTable(list, totals, draft) + leftTable(list) + eqHtml(totals) + ratioTable(list) + statsHtml(model.riceStats);
}