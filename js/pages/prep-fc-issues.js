// คำเตือนของพยากรณ์ (ใช้ร่วม 2 ตาราง: ตารางพยากรณ์ในหน้าเตรียม-เหลือ + ตารางเตรียมวัตถุดิบในหน้าครัว)
// แยก 2 ระดับ: เรื่องที่เกิดกับตั้งแต่ครึ่งหนึ่งของรายการ = แถบบนตารางครั้งเดียว · นอกนั้น = ป้ายสั้นใต้ชื่อรายการ
import { PREP_FC_UI } from '../shared/config.js';
import { dayShort, fillText } from '../shared/format.js';

const I = PREP_FC_UI.issue;

// สถานะที่คำนวณไม่ได้ → ชนิดคำเตือน
const STATUS_KEY = {
  insufficient: 'insufficient', no_theo: 'noSales', no_model: 'noModel', no_formula: 'noModel', no_fixed: 'noFixed',
  map_later: 'modelNew', rice_unsupported: 'noRice', no_ctx: 'noCtx', no_fallback: 'noFallback', cfg_bad: 'cfgBad', error: 'error'
};

// เปลี่ยนวันที่แบบ 2026-09-22 ในข้อความเป็น 22 ก.ย.
const thDates = s => String(s || '').replace(/\d{4}-\d{2}-\d{2}/g, d => dayShort(d));

// คำเตือนทั้งหมดของรายการพยากรณ์ 1 รายการ (แยกเรื่องละ 1 ข้อ ไม่ซ้ำชนิด)
export function fcIssues(row) {
  const out = [];
  if (!row) return out;
  const add = (k, v = {}) => { if (!out.some(x => x.k === k)) out.push({ k, t: I[k].t, d: fillText(I[k].d, v), day: fillText(I[k].day || I[k].d, v) }); };
  if (row.fc === null || row.fc === undefined) add(STATUS_KEY[row.status] || 'insufficient');
  if (row.status === 'no_band') { const m = /(\d+)\D+(\d+)/.exec(row.statusText || ''); add('noBand', { n: m ? m[1] : '?', need: m ? m[2] : '?' }); }
  if (row.diff) add('modelNew');
  if (row.fallbackTrial) add('fallback');
  if (row.salesWarn) add('sales');
  if (row.carry && row.carry.stale) add('carryOld', { d: thDates(row.carry.date) });
  if (row.carry && row.carry.cookedMissing && row.grp === 'เนื้อสัตว์') add('noCooked');
  return out;
}

// แบ่งคำเตือนของทั้งตาราง: ระดับวัน (≥ ครึ่งหนึ่งของรายการ) กับระดับรายการ — extra = เรื่องระดับวันที่ส่งมาเพิ่ม
export function splitIssues(rows, extra = []) {
  const per = {}, count = {};
  rows.forEach(r => { per[r.id] = fcIssues(r); per[r.id].forEach(x => { count[x.k] = (count[x.k] || 0) + 1; }); });
  // ตัวหาร = รายการที่เรื่องนั้นเกิดได้ (อาหารสุกยกมาเกิดได้เฉพาะเนื้อสัตว์)
  const base = k => (k === 'noCooked' ? rows.filter(r => r.grp === 'เนื้อสัตว์').length : rows.length);
  const dayKeys = Object.keys(count).filter(k => base(k) > 1 && count[k] >= base(k) / 2);
  const day = [...extra];
  dayKeys.forEach(k => { const hit = rows.map(r => per[r.id].find(x => x.k === k)).find(Boolean); day.push(hit.day); });
  const item = {};
  rows.forEach(r => { item[r.id] = per[r.id].filter(x => !dayKeys.includes(x.k)); });
  return { day, item, all: per };
}

// ข้อความคำเตือนระดับวันที่ส่งมาจากหน้า (เช่น ค่ากฎหาย)
export const dayIssue = k => fillText(I[k].day || I[k].d, {});

// แถบเตือนบนสุดของตาราง: เรื่องแรก (ไม่เกิน 2 บรรทัด) + "และอีก n เรื่อง" กดแล้วขยายดูทั้งหมด
export function dayBarHtml(texts) {
  if (!texts.length) return '';
  const more = texts.length > 1 ? ` <b style="color:#8A4B0F;white-space:nowrap">${fillText(I.more, { n: texts.length - 1 })}</b>` : '';
  const list = texts.length > 1 ? `<ul style="margin:6px 0 0;padding-left:18px">${texts.map(t => `<li style="margin:2px 0">${t}</li>`).join('')}</ul>` : '';
  return `<details style="margin:6px 0;border-radius:10px;padding:7px 10px;background:#FDF3E2;color:#6B3F0A;font-size:11px;line-height:1.45">
    <summary style="list-style:none;cursor:${texts.length > 1 ? 'pointer' : 'default'};display:flex;gap:6px;align-items:flex-start">
      <span aria-hidden="true">⚠</span><span style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${texts[0]}${more}</span>
    </summary>${list}</details>`;
}

// ป้ายสั้นใต้ชื่อรายการ (หลายเรื่อง = "มี n เรื่อง") กดแล้วเปิดกล่องรายละเอียด
export function itemTagHtml(issues) {
  if (!issues || !issues.length) return '';
  const label = issues.length === 1 ? issues[0].t : fillText(I.many, { n: issues.length });
  return `<details style="position:relative;display:block;margin-top:2px;white-space:normal" onclick="event.stopPropagation()">
    <summary style="list-style:none;display:inline-flex;align-items:center;gap:3px;max-width:100%;padding:1px 6px;border-radius:999px;background:#FDEBD3;color:#9A4A0B;font-size:9px;line-height:1.5;font-weight:600;cursor:pointer;white-space:nowrap">⚠ ${label}</summary>
    <div style="position:absolute;left:0;top:calc(100% + 3px);z-index:5;width:220px;max-width:70vw;padding:8px 10px;border-radius:10px;background:#fff;border:1px solid #F3D9B5;box-shadow:0 6px 16px rgba(0,0,0,.14);font-size:10.5px;line-height:1.45;color:#4A3520;font-weight:400">
      ${issues.map(x => `<p style="margin:0 0 5px"><b style="color:#9A4A0B">${x.t}</b> — ${x.d}</p>`).join('')}
    </div></details>`;
}
