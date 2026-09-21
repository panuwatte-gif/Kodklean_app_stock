// หน้าหลัก: ส่วนหัว + ประกาศ 2 ใบ + การ์ดแนะนำเตรียมของพรุ่งนี้ + การ์ดแนะนำปริมาณหุงข้าว
import { HOME_UI, HOME_CHARS } from '../shared/config.js';
import { glyph, dropdownHtml } from '../shared/ui.js';
import { pageOf, ricePotCount } from '../shared/calc.js';
import { dayLongTh, weight, fillText } from '../shared/format.js';

// หัวการ์ดที่ทุกการ์ดใช้ร่วมกัน: แถบสีอ่อนประจำส่วน + ตัวละคร (ซ้าย/ขวา) + ชื่อ/ตัวเลขเด่น/คำอธิบาย + เครื่องมือด้านขวา
export function cardHead({ tone, title, big = '', sub = '', char = '', side = 'left', tools = '' }) {
  const img = char ? `<img class="hc__char hc__char--${side}" src="${HOME_CHARS[char]}" alt="" loading="lazy" decoding="async">` : '';
  return `
    <div class="hc__head hc__head--${tone}${char ? ` hc__head--${side}` : ''}">${img}
      <div class="hc__text">
        <b class="hc__title">${title}</b>
        ${big ? `<span class="hc__big">${big}</span>` : ''}
        ${sub ? `<small class="hc__sub">${sub}</small>` : ''}
      </div>
      ${tools ? `<div class="hc__tools">${tools}</div>` : ''}
    </div>`;
}

// ส่วนหัว (ตามแบบอ้างอิง): โลโก้กลุ่ม + ชื่อหน้า + วันของระบบ + กระดิ่ง + ตั้งค่า / แถวสอง: dropdown สาขา + ป้ายข้อมูลตัวอย่าง
export function heroHtml(meta, ui) {
  const branch = dropdownHtml({ name: 'branch', label: HOME_UI.branchLabel, value: ui.branch, options: meta.branches.map(b => ({ value: b.id, label: b.label })) });
  return `
    <div class="hhero__row hhero__row--top">
      <img class="hhero__logo" src="assets/home/logo-group.webp" alt="KodKlean Group" decoding="async">
      <span class="hhero__name"><b>${HOME_UI.title}</b><small>${HOME_UI.sub}</small><em>${HOME_UI.tagline}</em></span>
      <button class="hhero__date" type="button" data-home-date="1">${glyph('calendar', 16)}<span id="home-date">${dayLongTh(meta.asOf)}</span>${glyph('chevron', 14)}</button>
      <button class="icon-btn" type="button" aria-label="แจ้งเตือน"><img src="assets/icons/ic17.webp" alt="" width="26" height="26" decoding="async"><span class="icon-btn__dot">3</span></button>
      <button class="icon-btn" type="button" aria-label="ตั้งค่า"><img src="assets/icons/ic20.webp" alt="" width="26" height="26" decoding="async"></button>
    </div>
    <div class="hhero__row">${branch}<span class="hhero__sample">${HOME_UI.sample} • ${HOME_UI.closedTo} ${dayLongTh(meta.analysisEnd)}</span></div>`;
}

// ประกาศ: แสดงเฉพาะที่เปิดใช้ เรียงตามลำดับ — ข้อความคงตามที่กำหนด
export function noticesHtml(rows) {
  return rows.filter(n => n.active !== false).sort((a, b) => (a.sort || 0) - (b.sort || 0)).map(n => `
    <article class="hnote hnote--${n.tone}">
      <img class="hnote__char" src="${HOME_CHARS[n.character]}" alt="" loading="lazy" decoding="async">
      <span class="hnote__ic">${glyph(n.icon, 22)}</span>
      <b class="hnote__text">${n.text}</b>
    </article>`).join('');
}

// การ์ดเตรียมของพรุ่งนี้: ครั้งละ 3 อันดับ เลือกช่วงอันดับด้วย dropdown หรือปุ่ม ‹ › (แทนที่ 3 รายการเดิม ไม่ต่อรายการยาว)
export function prepCard(prep, meta, ui) {
  const t = HOME_UI.prep;
  const ranked = prep.items.some(i => i.rank != null);
  const items = [...prep.items].sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9));
  const pg = pageOf(items, ui.prepPage, prep.pageSize);
  const dd = dropdownHtml({ name: 'prepPage', label: t.rankLabel, value: pg.index, options: pg.pages.map(p => ({ value: p.index, label: `${t.rankLabel} ${p.from}–${p.to}` })) });
  const who = pg.rows.some(r => r.staff && r.staff.length);   // คอลัมน์ผู้รับผิดชอบโชว์เฉพาะมีข้อมูลจริง
  const head = `<div class="hprep__row hprep__row--head${who ? ' has-who' : ''}"><span>${t.cols[0]}</span><span>${t.cols[1]}</span><span>${t.cols[2]}</span>${who ? `<span>${t.cols[3]}</span>` : ''}</div>`;
  const rows = meta.prepClosed ? `<p class="hc__empty">${t.closed}</p>` : pg.rows.map((r, i) => `
    <div class="hprep__row${who ? ' has-who' : ''}">
      <span class="hprep__rank">${r.rank ?? pg.from + i}</span>
      <span class="hprep__name"><img src="${r.photo}" alt="" loading="lazy" decoding="async">${r.name}</span>
      <span class="hprep__qty"><b>${weight(r.qty)}</b><em>${r.unit}</em></span>
      ${who ? `<span class="hprep__who">${(r.staff || []).join(', ') || '–'}</span>` : ''}
    </div>`).join('');
  const last = pg.pages.length - 1;
  return `<section class="hc hc--blue">
    ${cardHead({ tone: 'blue', title: t.title, big: dayLongTh(meta.prepDate), sub: t.sub, char: 'kid-01', tools: dd + `<small class="hc__hint">${t.rankHint}</small>` })}
    <div class="hprep">
      ${head}${rows}
      <div class="hprep__foot">
        <span>${pg.from}–${pg.to} ${t.of} ${pg.total} ${t.items}${ranked ? '' : ` • ${t.unranked}`}</span>
        <span class="hprep__pager">
          <button type="button" data-prep-page="${pg.index - 1}" aria-label="อันดับก่อนหน้า"${pg.index === 0 ? ' disabled' : ''}>‹</button>
          <button type="button" data-prep-page="${pg.index + 1}" aria-label="อันดับถัดไป"${pg.index >= last ? ' disabled' : ''}>›</button>
        </span>
      </div>
      <p class="hc__note">${prep.lastDay ? fillText(t.liveNote, { d: dayLongTh(prep.lastDay) }) : prep.basis || t.basisNote}</p>
    </div></section>`;
}

// การ์ดหุงข้าว: 3 กลุ่ม แต่ละกลุ่มมี dropdown ของตัวเอง (เปลี่ยนกลุ่มหนึ่งไม่กระทบอีกสองกลุ่ม)
export function riceCard(groups, ui) {
  const t = HOME_UI.rice;
  const val = (v, unit) => v === null || v === undefined ? `<i class="hrice__none">${t.noRecipe}</i>` : `<b>${weight(v)}</b> ${unit}`;
  const cols = groups.map(g => {
    const cur = g.options.find(o => o.id === ui.rice[g.id]) || g.options[0];
    const pots = ricePotCount(cur);
    return `
      <div class="hrice__col">
        <span class="hrice__group">${g.label}</span>
        <img src="${g.photo}" alt="" loading="lazy" decoding="async">
        ${dropdownHtml({ name: `rice:${g.id}`, label: g.label, hideLabel: true, block: true, value: cur.id, options: g.options.map(o => ({ value: o.id, label: o.label })) })}
        <span class="hrice__val">${t.raw} ${val(cur.raw, t.kg)}</span>
        <span class="hrice__val">${t.water} ${val(cur.water, t.liter)}</span>
        <span class="hrice__pot">${pots === null ? `<i class="hrice__none">${t.noRecipe}</i>` : `${pots} ${t.pot}`}</span>
        ${pots > 1 ? `<em class="hrice__split">${cur.pots.map(weight).join(' + ')} ${t.kg}</em>` : ''}
      </div>`;
  }).join('');
  return `<section class="hc hc--lavender">
    ${cardHead({ tone: 'lavender', title: t.title, sub: t.sub, char: 'kid-03', side: 'right' })}
    <div class="hrice">${cols}</div>
    <p class="hc__note hc__note--pad">${t.foot}</p></section>`;
}
