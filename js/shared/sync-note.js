// แถบแจ้งผลการอัปเดตประวัติพยากรณ์ — ลอยล่างจอ ไม่หายเองถ้าเป็นข้อผิดพลาด (มีปุ่มลองใหม่)
import { FC_SYNC_UI as T } from './config.js';

// หาที่วางแถบ (กรอบแอป ถ้าไม่มีใช้ทั้งหน้า)
const hostOf = () => document.querySelector('.app') || document.body;

// แสดงแถบ 1 ข้อความ (tone = warn/info · retry = ฟังก์ชันลองใหม่ ถ้ามี)
export function showSyncNote({ text, tone = 'warn', retry = null }) {
  const host = hostOf();
  const id = 'kk-sync-note-' + tone;
  host.querySelectorAll('#' + id).forEach(el => el.remove());
  const bar = document.createElement('div');
  bar.id = id;
  bar.setAttribute('role', 'status');
  bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:' + (tone === 'warn' ? 84 : 140) + 'px;z-index:9999;width:calc(100% - 24px);max-width:406px;box-sizing:border-box;display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:12px;font-size:13px;line-height:1.4;box-shadow:0 6px 18px rgba(0,0,0,.18);'
    + (tone === 'warn' ? 'background:#FDECEA;color:#8A1F17;border:1px solid #F5CFCB;' : 'background:#FDF3E2;color:#6B4510;border:1px solid #F3E0BD;');
  const msg = document.createElement('span');
  msg.style.cssText = 'flex:1;min-width:0;';
  msg.textContent = text;
  bar.appendChild(msg);
  const btn = (label, fn, main) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = 'flex:none;min-height:36px;padding:0 12px;border-radius:9px;border:0;font:inherit;font-weight:700;cursor:pointer;background:' + (main ? '#D4322A;color:#fff' : 'transparent;color:inherit');
    b.onclick = fn;
    bar.appendChild(b);
  };
  if (retry) btn(T.retry, () => { bar.remove(); retry(); }, true);
  btn(T.close, () => bar.remove(), false);
  host.appendChild(bar);
  if (!retry) setTimeout(() => bar.remove(), 9000);
}
