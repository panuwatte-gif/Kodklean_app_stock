// แท็บ "ประเมินผลการเตรียมวัตถุดิบของพนักงาน" — ใช้ร่วมหน้าเตรียม-เหลือ และหน้าครัวของพนักงาน (ข้อมูลชุดเดียวกัน ลำดับเดียวกัน)
// เอาออกมา = kk_view_prep_eval · ใช้จริง = ประวัติพยากรณ์ (getHistoryRange ผ่าน markExcluded แล้ว) จับคู่ด้วยวันที่+วัตถุดิบ
import { PREP_EVAL_UI as T } from './config.js';
import { getPrepEval, getHistoryRange, todayIso } from './data.js';
import { prepEvalMerge, prepEvalStats, prepEvalDaily } from './calc.js';
import { itemPhoto, niceTicks } from './ui.js';
import { shiftIso, signedKg, weightBig, dayOf, dayShort, fillText, escHtml } from './format.js';

const view = { item: null, day: null };
let cache = null;   // { key: วันนี้, rows } โหลดครั้งเดียวต่อวันต่อการเปิดแอป

// โครงแท็บระหว่างรอโหลด
export const evalBodyHtml = () => `<div data-eval-box="1"><p style="margin:20px;text-align:center;font-size:13px;color:#8A9199">${T.loading}</p></div>`;

const C = { taken: '#3B8BE0', used: '#1E7A3C', plus: '#B4541B', minus: '#2F63C9', grid: '#E6EAF0', txt: '#8A9199', excl: 'rgba(120,120,120,.16)' };

// สีของส่วนต่าง: เอาออกมาเกิน = ส้ม · น้อยกว่าใช้จริง = น้ำเงิน
const tone = v => (v > 0.005 ? C.plus : v < -0.005 ? C.minus : C.used);

// ช่องผล 1 ช่วง
function cellHtml(s) {
  if (!s) return `<div style="text-align:center;font-size:11px;color:#A9AFB8">${T.noData}</div>`;
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:1px;line-height:1.2;text-align:center">
    <b style="font:600 15px Mitr,sans-serif;color:${tone(s.avg)}">${signedKg(s.avg)}</b>
    <small style="font-size:10.5px;color:#5E6E7D">${s.pct === null ? '' : (s.pct > 0 ? '+' : '') + s.pct + '%'} · ${fillText(T.cellDays, { n: s.n })}</small>
    <small style="font-size:10.5px;color:#7C8493">${fillText(T.maxLabel, { v: signedKg(s.max) })}</small>
  </div>`;
}

// ตารางสรุปต่อวัตถุดิบ × 3 ช่วง
function tableHtml(items, stats) {
  const cols = 'grid-template-columns:minmax(0,1fr) repeat(3, 76px);column-gap:4px';
  const head = `<div style="display:grid;${cols};align-items:center;padding:8px 10px;background:rgba(234,241,253,.8);font:500 12px Mitr,sans-serif;color:#1F5390">
    <span>${T.colItem}</span>${T.windows.map(w => `<span style="text-align:center">${fillText(T.winHead, { n: w })}</span>`).join('')}</div>`;
  const rows = items.map(it => `<div style="display:grid;${cols};align-items:center;padding:8px 10px;border-top:1px solid #EEF1F5">
    <span style="display:flex;align-items:center;gap:6px;min-width:0"><img src="${itemPhoto(it)}" alt="" width="28" height="28" loading="lazy" decoding="async" style="flex:none;width:28px;height:28px;object-fit:contain">
      <span style="font:500 13px/1.25 Mitr,sans-serif;color:#23303F;overflow-wrap:anywhere">${escHtml(it.name)}</span></span>
    ${T.windows.map(w => cellHtml(stats[it.id][w])).join('')}</div>`).join('');
  return `<section style="margin:0 0 12px;border-radius:18px;background:rgba(255,255,255,.9);border:1px solid #E3E8EF;overflow:hidden">
    <div style="padding:10px 12px;font:500 14px Mitr,sans-serif;color:#1F5390">${T.tableTitle}</div>${head}${rows}
    <p style="margin:0;padding:8px 12px 10px;font-size:11.5px;line-height:1.5;color:#6B7280">${T.tableNote}</p></section>`;
}

// เรขาคณิตร่วมของสองกราฟ: ช่องวันกว้าง step · จุด/แท่งอยู่กลางช่อง · แท่งกว้าง 70% ของช่อง
const geo = (n, W, L, R) => { const step = (W - L - R) / n; return { step, cx: i => L + (i + 0.5) * step, bw: step * 0.7 }; };

// พื้นหลังช่องวัน: วันที่ตัดออก = แถบเทาจาง · วันที่เลือกอยู่ = ขอบฟ้าอ่อน · ทุกช่องกดได้ (data-eval-day)
function slotsHtml(days, g, top, bottom) {
  return days.map((d, i) => `<rect data-eval-day="${i}" x="${(g.cx(i) - g.step / 2).toFixed(1)}" y="${top}" width="${g.step.toFixed(1)}" height="${bottom - top}" fill="${d.excluded ? C.excl : i === view.day ? 'rgba(59,139,224,.10)' : 'transparent'}" style="cursor:pointer"></rect>`).join('');
}

// ป้ายวันที่ใต้แกน (ทุก 5 วัน + วันสุดท้าย · วันที่ตัดออกเขียน "ตัด")
const xLabels = (days, g, y) => days.map((d, i) => (d.excluded ? `<text x="${g.cx(i).toFixed(1)}" y="${y}" font-size="8" text-anchor="middle" fill="#6B7280">${T.excludedMark}</text>`
  : i % 5 === 0 || i === days.length - 1 ? `<text x="${g.cx(i).toFixed(1)}" y="${y}" font-size="9" text-anchor="middle" fill="${C.txt}">${dayOf(d.date)}</text>` : '')).join('');

// เส้นต่อจุดเฉพาะวันที่มีค่า (วันไม่มีค่า = เส้นขาด ห้ามแปลงเป็น 0)
function lineOf(days, key, g, y, color) {
  let path = '', pen = false, dots = '';
  days.forEach((d, i) => {
    const v = d[key];
    if (v === null || v === undefined) { pen = false; return; }
    const px = g.cx(i).toFixed(1), py = y(v).toFixed(1);
    path += (pen ? 'L' : 'M') + px + ' ' + py + ' '; pen = true;
    dots += `<circle cx="${px}" cy="${py}" r="2.2" fill="#fff" stroke="${color}" stroke-width="1.6"></circle>`;
  });
  return path ? `<path d="${path}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"></path>${dots}` : '';
}

// กราฟบน: เส้นเอาออกมาเตรียม (ฟ้า) + เส้นใช้ไปจริง (เขียว) · แกนบนสุดสูงกว่าค่ามากสุดเสมอ
function lineSvg(days) {
  const W = 360, H = 160, L = 30, R = 8, B = 20, top = 8;
  const max = Math.max(0.1, ...days.flatMap(d => [d.taken, d.used]).filter(v => v !== null));
  const ticks = niceTicks(max * 1.15, 4), tmax = ticks[ticks.length - 1];
  const g = geo(days.length, W, L, R);
  const y = v => top + (H - top - B) * (1 - v / tmax);
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke="${C.grid}"></line><text x="${L - 3}" y="${(y(t) + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="${C.txt}">${weightBig(t)}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${T.legTaken} / ${T.legUsed}" style="display:block">${slotsHtml(days, g, top, H - B)}${grid}${lineOf(days, 'taken', g, y, C.taken)}${lineOf(days, 'used', g, y, C.used)}${xLabels(days, g, H - 7)}</svg>`;
}

// กราฟล่าง: แท่งส่วนต่าง (เอาออก − ใช้จริง) ฐาน 0 ขึ้นบวก/ลงลบ · แกนสองข้างสมมาตรและสูงกว่าค่ามากสุดเสมอ
function diffSvg(days) {
  const W = 360, H = 120, L = 30, R = 8, B = 18, top = 8;
  const dmax = Math.max(0.1, ...days.map(d => (d.diff === null ? 0 : Math.abs(d.diff))));
  const half = niceTicks(dmax * 1.15, 2), s = half[half.length - 1];
  const ticks = [-s, -s / 2, 0, s / 2, s];
  const g = geo(days.length, W, L, R);
  const y = v => top + (H - top - B) * (1 - (v + s) / (2 * s));
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke="${t === 0 ? '#9AA3AE' : C.grid}" stroke-width="${t === 0 ? 1 : 0.8}"></line><text x="${L - 3}" y="${(y(t) + 3).toFixed(1)}" font-size="9" text-anchor="end" fill="${C.txt}">${signedKg(t)}</text>`).join('');
  const bars = days.map((d, i) => {
    if (d.diff === null) return '';
    const y0 = y(0), y1 = y(d.diff);
    return `<rect x="${(g.cx(i) - g.bw / 2).toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${g.bw.toFixed(1)}" height="${Math.max(1, Math.abs(y0 - y1)).toFixed(1)}" rx="1" fill="${d.diff >= 0 ? C.plus : C.minus}" style="pointer-events:none"></rect>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${T.legDiff}" style="display:block;margin-top:2px">${slotsHtml(days, g, top, H - B)}${grid}${bars}${xLabels(days, g, H - 6)}</svg>`;
}

// บรรทัดใต้กราฟของวันที่แตะ: วันที่ · เอาออก a · ใช้ b · ต่าง c (วันที่ตัดออกบอกว่าตัด)
function dayLineHtml(d) {
  if (!d) return T.dayNone;
  const v = x => (x === null || x === undefined ? T.dayNone : weightBig(x));
  if (d.excluded) return fillText(T.dayLineExcluded, { d: dayShort(d.date), a: v(d.taken), b: v(d.used) });
  return fillText(T.dayLine, { d: dayShort(d.date), a: v(d.taken), b: v(d.used), c: d.diff === null ? T.dayNone : signedKg(d.diff) });
}

// การ์ดกราฟ 30 วันย้อนหลัง + ดรอปดาวน์เปลี่ยนวัตถุดิบ
function chartHtml(items, rows, today) {
  const it = items.find(i => i.id === view.item) || items[0];
  const days = prepEvalDaily(rows, it.id, shiftIso(today, -30), shiftIso(today, -1));
  if (view.day === null || view.day >= days.length) view.day = days.length - 1;
  const counted = days.filter(d => d.diff !== null);
  const a = counted.reduce((s, d) => s + d.taken, 0), b = counted.reduce((s, d) => s + d.used, 0);
  const legend = (c, t, line) => `<span style="display:inline-flex;align-items:center;gap:4px"><i style="width:${line ? 16 : 10}px;height:${line ? 0 : 10}px;border-radius:3px;background:${c};${line ? `border-top:2.5px solid ${c}` : ''}"></i>${t}</span>`;
  return `<section style="margin:0 0 12px;padding:10px 12px;border-radius:18px;background:rgba(255,255,255,.9);border:1px solid #E3E8EF">
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;justify-content:space-between">
      <b style="font:500 14px Mitr,sans-serif;color:#1F5390">${T.chartTitle}</b>
      <select data-eval-item="1" aria-label="${T.pick}" style="min-height:44px;max-width:100%;padding:0 10px;border:1.5px solid #CFDDF5;border-radius:12px;background:#fff;font:500 13px Mitr,sans-serif;color:#23303F">
        ${items.map(i => `<option value="${i.id}"${i.id === it.id ? ' selected' : ''}>${escHtml(i.name)}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px 12px;margin:8px 0 4px;font-size:11.5px;color:#4B5563">${legend(C.taken, T.legTaken, true)}${legend(C.used, T.legUsed, true)}${legend(C.plus, T.legDiff)}${legend('#C9CDD3', T.legExcluded)}</div>
    ${days.length ? lineSvg(days) + diffSvg(days)
      + `<p data-eval-dayline="1" style="margin:6px 0 0;padding:6px 10px;border-radius:10px;background:#F4F6F9;font:500 12px Mitr,sans-serif;color:#23303F">${dayLineHtml(days[view.day])}</p>`
      + `<p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:#4B5563">${fillText(T.sumLine, { n: counted.length, a: weightBig(a), b: weightBig(b), d: signedKg(a - b) })}</p>`
      : `<p style="margin:14px 0;text-align:center;font-size:12px;color:#8A9199">${T.chartNone}</p>`}
  </section>`;
}

// โหลดข้อมูล (≈130 วันปฏิทิน) แล้ววาดทั้งแท็บลงกล่อง · items = แถวเนื้อสัตว์+ข้าวตามลำดับของหน้าเตรียม
export async function mountEval(root, items) {
  const box = root.querySelector('[data-eval-box]');
  if (!box || !items || !items.length) return;
  const today = todayIso();
  try {
    if (!cache || cache.key !== today) {
      const [ev, hist] = await Promise.all([getPrepEval(shiftIso(today, -130), shiftIso(today, -1)), getHistoryRange(shiftIso(today, -130), shiftIso(today, -1))]);
      cache = { key: today, rows: prepEvalMerge(ev, hist) };
    }
  } catch { box.innerHTML = `<p style="margin:20px;text-align:center;font-size:13px;color:#B4741B">${T.loadError}</p>`; return; }
  const stats = prepEvalStats(cache.rows, items.map(i => i.id), T.windows, today);
  const paint = () => {
    box.innerHTML = `<p style="margin:0 0 10px;padding:10px 12px;border-radius:14px;background:#EAF1FD;color:#1F3F6E;font-size:12px;line-height:1.55">${T.how}</p>`
      + tableHtml(items, stats) + chartHtml(items, cache.rows, today);
    const sel = box.querySelector('[data-eval-item]');
    if (sel) sel.onchange = () => { view.item = sel.value; view.day = null; paint(); };
    box.onclick = e => { const s = e.target.closest('[data-eval-day]'); if (s) { view.day = Number(s.dataset.evalDay); paint(); } };
  };
  paint();
}
