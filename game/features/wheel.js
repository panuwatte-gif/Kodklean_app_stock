// S7 กงล้อนำโชค: วงล้อ 8 ช่องจากรางวัลที่แอดมินตั้ง + ใช้ตั๋ว + บันทึกทุกการหมุน
import { t } from '../core/i18n.js';
import { topBar, wireLang, toast } from '../core/ui.js';
import { P, loadProgress, useTicket } from '../core/progress.js';
import * as api from '../core/api.js';
import { S } from '../core/state.js';
import { ASSETS } from '../sprite_config.js';

const COLORS = ['#FE9B96', '#F7C346', '#A6BE40', '#A3E4F6', '#347CD5', '#9BBFE8', '#A27ED7', '#FEE7BA'];

export async function mountWheel(root, go) {
  root.innerHTML = topBar() + '<p class="sub" style="padding:16px 14px">' + t('loading') + '</p>';
  await loadProgress();
  const prizes = await api.listPrizes().catch(() => []);
  // เปิดมาที่กงล้อที่มีตั๋วอยู่ก่อน
  let which = P.tickets.big > 0 ? 'big' : 'small', spinning = false, result = null, angle = 0;

  const slots = () => {
    const rows = prizes.filter(p => p.wheel === which && p.label);
    return rows.length ? rows : null;
  };

  // หน้าวงล้อ: ช่องสีตามจำนวนรางวัลจริงที่แอดมินตั้งไว้
  function face(rows) {
    if (!rows) return `<p class="sub" style="text-align:center">${t('wheelEmpty')}</p>`;
    const seg = 360 / rows.length;
    const stops = rows.map((p, i) => `${COLORS[i % 8]} ${i * seg}deg ${(i + 1) * seg}deg`).join(',');
    // ชื่อรางวัลวางขนานกันขอบวง ข้อความยาวตัดสองบรรทัดได้ จะอ่านครบไม่โดนขอบวงตัด
    const labels = rows.map((p, i) => `<span style="position:absolute;left:50%;top:50%;width:66px;
      transform:translate(-50%,-50%) rotate(${i * seg + seg / 2}deg) translateY(-82px);
      font-size:9px;line-height:1.25;font-weight:600;color:#3B3226;text-align:center;
      text-wrap:pretty">${p.label}</span>`).join('');
    return `<div style="position:relative;height:268px">
      <div style="position:absolute;left:50%;top:8px;transform:translateX(-50%);font-size:24px;color:var(--green);z-index:2">▼</div>
      <div style="position:absolute;left:50%;top:18px;transform:translateX(-50%) rotate(${angle}deg);
        width:250px;height:250px;border-radius:50%;overflow:hidden;
        box-shadow:0 0 0 6px var(--gold),0 8px 20px rgba(0,0,0,.2);
        transition:transform 3.2s cubic-bezier(.17,.67,.12,1);background:conic-gradient(${stops})">${labels}</div>
    </div>`;
  }

  function draw() {
    const rows = slots();
    root.innerHTML = topBar() + `
      <div style="text-align:center;padding:10px 0 0">
        <img src="${ASSETS.village}wheel.webp" alt="" width="104" height="104" style="object-fit:contain">
      </div>
      <div class="card">
        <div class="who" style="grid-template-columns:1fr 1fr">
          <button type="button" data-w="big" class="${which === 'big' ? 'on' : ''}">${t('wheelBig')} · ${P.tickets.big}</button>
          <button type="button" data-w="small" class="${which === 'small' ? 'on' : ''}">${t('wheelSmall')} · ${P.tickets.small}</button>
        </div>
        ${face(rows)}
        ${result ? `<p class="h" style="text-align:center;color:var(--green)">${t('wheelGot', { p: result })}</p>` : ''}
        <button class="btn btn--gold" style="margin-top:8px" data-spin
          ${!rows || spinning || P.tickets[which] <= 0 ? 'disabled' : ''}>
          ${P.tickets[which] > 0 ? t('wheelSpin') : t('wheelNoTicket')}</button>
        <p class="sub" style="margin-top:8px">${t('wheelHow')}</p>
      </div>
      <div style="padding:0 14px 22px"><button class="btn" data-back style="background:#fff;color:var(--green);box-shadow:var(--shadow)">${t('back')}</button></div>`;
    wireLang(root, go, 'wheel');
    root.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { which = b.dataset.w; result = null; draw(); });
    root.querySelector('[data-back]').onclick = () => go('village');

    const sp = root.querySelector('[data-spin]');
    if (sp) sp.onclick = async () => {
      const rows2 = slots();
      if (!rows2 || spinning) return;
      if (!await useTicket(which)) return toast(t('wheelNoTicket'));
      spinning = true; result = null;
      // สุ่มตามน้ำหนักที่แอดมินตั้ง แล้วหมุนให้หยุดตรงช่องที่ออก
      const pool = rows2.flatMap(p => Array(Math.max(1, p.weight)).fill(p));
      const win = pool[Math.floor(Math.random() * pool.length)];
      const at = rows2.indexOf(win), seg = 360 / rows2.length;
      angle += 360 * 4 + (360 - (at * seg + seg / 2));
      draw();
      setTimeout(async () => {
        spinning = false; result = win.label;
        await api.addSpin({ user_id: S.user.id, wheel: which, prize_label: win.label }).catch(() => {});
        draw();
        toast(t('wheelGot', { p: win.label }));
      }, 3300);
    };
  }
  draw();
}
