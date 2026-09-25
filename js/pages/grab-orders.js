// หน้าออเดอร์ Grab — ออเดอร์รายวันจากไฟล์ Transaction · แตะออเดอร์ดูเงินแต่ละขั้น + เมนูจากรูปบิลที่ถ่ายไว้
import { GRAB_UI } from '../shared/config.js';
import { getGrabOrdersDay, getGrabLastDay, getIncomeBrands, todayIso } from '../shared/data.js';
import { grabFrame, shopTabsHtml } from './grab.js';
import { workStatsHtml } from '../shared/work-ui.js';
import { glyph, openSheet } from '../shared/ui.js';
import { dayLongTh, shiftIso, money, moneyFine, escHtml } from '../shared/format.js';

const T = GRAB_UI.ord, S = T.sheet;
const hhmm = ts => (ts ? ts.slice(11, 16) : '');
const sum = (a, f) => a.reduce((s, x) => s + (Number(f(x)) || 0), 0);

// แถวออเดอร์ 1 ใบ
function orderRow(t, i) {
  const off = t.status === 'ยกเลิก';
  const tag = off ? `<i class="grchip grchip--lack">${T.cancel}</i>` : t.payment_method === 'เงินสด' ? `<i class="grchip grchip--none">${T.cash}</i>` : '';
  return `<button class="grord${off ? ' is-off' : ''}" type="button" data-ord="${i}">
    <span class="grord__time">${hhmm(t.created_at)}</span>
    <span class="grord__main"><b>${escHtml(t.order_short || '-')}</b>${tag}</span>
    <span class="grord__amt"><b>${off ? '-' : money(t.amount)}</b><em>${off ? '' : '→ ' + moneyFine(t.total_payout)}</em></span>
  </button>`;
}

// รายการเมนูในบิลที่ถ่ายรูปไว้ (menu_details ถ้ามี ไม่งั้นใช้ข้อความ)
function billHtml(b) {
  if (!b) return `<p class="grsub">${S.noMenu}</p>`;
  const d = b.menu_details || {};
  const lines = ['main_menu', 'add_on', 'drinks'].flatMap(k => (Array.isArray(d[k]) ? d[k] : []));
  const body = lines.length
    ? lines.map(l => `<div class="grline"><span>${l.qty || 1}× ${escHtml(l.name)}</span><b>${l.price ? money(l.price) : ''}</b></div>`).join('')
    : [b.main_menu, b.add_on, b.drinks].filter(Boolean).map(x => `<div class="grline"><span>${escHtml(x)}</span></div>`).join('');
  return body + (b.customer_note ? `<p class="grsub">${S.note}: ${escHtml(b.customer_note)}</p>` : '');
}

// แผงรายละเอียดออเดอร์ 1 ใบ
function orderSheet(t, bill) {
  const row = (k, v, strong) => `<div class="grline${strong ? ' is-sum' : ''}"><span>${k}</span><b>${v}</b></div>`;
  const money2 = v => (v === null || v === undefined ? '-' : moneyFine(v));
  const disc = (Number(t.store_discount) || 0) + (Number(t.delivery_discount) || 0);
  const comm = (Number(t.commission) || 0) + (Number(t.fees) || 0);
  const body = t.status === 'ยกเลิก'
    ? row(S.cancelBy, escHtml(t.cancel_by || '-')) + (t.cancel_reason ? row('', escHtml(t.cancel_reason)) : '')
    : row(S.gross, money2(t.amount)) + row(S.discount, money2(disc)) + row(S.net, money2(t.net_sales), 1) + row(S.comm, money2(comm)) + row(S.payout, money2(t.total_payout), 1)
      + (t.transfer_at ? row(S.transfer, `${dayLongTh(t.transfer_at.slice(0, 10))} ${hhmm(t.transfer_at)}`) : '');
  return openSheet(`
    <div class="ask__title">${escHtml(t.order_short || '')} · ${hhmm(t.created_at)}</div>
    <div class="grsheet">${body}<h3 class="grh grh--sm">${S.menu}</h3>${billHtml(bill)}</div>
    <div class="ask__go"><button class="ask__btn ask__btn--off" type="button" data-pick="">${T.close}</button></div>`);
}

// ติดตั้งหน้าออเดอร์
export function mountGrabOrdersPage(root, onGo) {
  const el = s => root.querySelector(s);
  const hero = grabFrame(root, T, GRAB_UI.backHub);
  let day = null, orders = [], bills = [], mine = 0, shops = [], shop = null;
  el('#w-body').innerHTML = hero + `<div id="gr-shops"></div><div class="atmon wcard">
      <button class="atmon__nav" type="button" data-step="-1" aria-label="วันก่อน">${glyph('back', 18)}</button>
      <b id="gr-day"></b>
      <button class="atmon__nav atmon__nav--next" type="button" data-step="1" aria-label="วันถัดไป">${glyph('back', 18)}</button>
    </div><div id="gr-ord"><p class="wempty">${GRAB_UI.loading}</p></div>`;

  // โหลดออเดอร์ของวันที่เลือก (กดรัวๆ เอาผลครั้งล่าสุด)
  const load = async () => {
    const t = ++mine;
    el('#gr-day').textContent = dayLongTh(day);
    el('.atmon__nav--next').disabled = day >= todayIso();
    try {
      const b = await getGrabOrdersDay(shop, day);
      if (t !== mine) return;
      orders = b.txns.filter(x => x.category === 'ชำระเงิน' || x.status === 'ยกเลิก');
      bills = b.bills;
      const other = b.txns.filter(x => !orders.includes(x));
      const paid = orders.filter(x => x.category === 'ชำระเงิน');
      el('#gr-ord').innerHTML = !b.txns.length ? `<p class="wempty">${T.none}<em>${T.noneHint}</em></p>`
        : workStatsHtml([{ label: T.stats[0], value: paid.length }, { label: T.stats[1], value: money(sum(paid, x => x.net_sales) + sum(b.txns.filter(x => x.category === 'การปรับรายได้' && !/ค่าคอมมิชชัน/.test(x.subcategory || '')), x => x.amount)) }, { label: T.stats[2], value: money(sum(b.txns, x => x.total_payout)) }])
          + `<section class="wcard grlist">${orders.map(orderRow).join('')}</section>`
          + (other.length ? `<section class="wcard grlist"><h2 class="grh grh--sm">${T.other}</h2>${other.map(x => `<div class="grline"><span>${x.category === 'โฆษณา' ? T.ads : T.adjust} · ${escHtml(x.description || x.subcategory || '')}</span><b>${moneyFine(x.total_payout)}</b></div>`).join('')}</section>` : '');
    } catch { if (t === mine) el('#gr-ord').innerHTML = `<p class="wempty">${GRAB_UI.loadError}<em><button class="atbtn" type="button" data-reload="1">${GRAB_UI.retry}</button></em></p>`; }
  };

  // เลือกร้านแล้วไปวันล่าสุดที่ร้านนั้นมีข้อมูล
  const pickShop = id => {
    shop = id; el('#gr-shops').innerHTML = shopTabsHtml(shops, shop);
    getGrabLastDay(shop).then(d => { day = d || shiftIso(todayIso(), -1); load(); }).catch(() => { day = shiftIso(todayIso(), -1); load(); });
  };
  getIncomeBrands().then(b => { shops = b; pickShop((b[0] || {}).id); }).catch(() => { el('#gr-ord').innerHTML = `<p class="wempty">${GRAB_UI.loadError}</p>`; });

  root.addEventListener('click', event => {
    const hit = s => event.target.closest(s);
    if (hit('[data-back]')) return onGo('grab');
    if (hit('[data-reload]')) return load();
    if (hit('[data-shop]')) return pickShop(hit('[data-shop]').dataset.shop);
    if (hit('[data-step]') && day) { day = shiftIso(day, Number(hit('[data-step]').dataset.step)); return load(); }
    if (hit('[data-ord]')) { const t = orders[Number(hit('[data-ord]').dataset.ord)]; orderSheet(t, bills.find(b => b.order_number === t.order_short)); }
  });
}
