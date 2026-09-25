// อ่านไฟล์ CSV ที่โหลดจาก Grab → รู้เองว่าเป็นไฟล์ชุดไหน → แปลงเป็นแถวพร้อมบันทึกลงตาราง kk_grab_* (ใช้ที่หน้า import)

// แยกข้อความ CSV เป็นตาราง (รองรับเครื่องหมายคำพูดและจุลภาคในช่อง)
export function parseCsv(text) {
  const t = String(text).replace(/^\uFEFF/, ''), rows = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(v => v !== ''));
}

const pad = v => String(v).padStart(2, '0');
// ตัวเลขจากช่อง (ตัด THB, ลูกน้ำ, % ออก) ว่าง = null
const num = v => { const s = String(v ?? '').replace(/[^0-9.\-]/g, ''); return s === '' || s === '-' ? null : Number(s); };
// วันที่แบบ 23/09/2026 → 2026-09-23
const dmy = s => { const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s || ''); return m ? `${m[3]}-${pad(m[2])}-${pad(m[1])}` : null; };
const MON = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
// เวลาแบบ 24 Sep 2026 6:15 PM (เวลาไทย) → 2026-09-24T18:15:00+07:00
const grabTs = s => {
  const m = /^(\d{1,2}) (\w{3}) (\d{4}) (\d{1,2}):(\d{2}) (AM|PM)/.exec(s || '');
  if (!m) return null;
  const h = (Number(m[4]) % 12) + (m[6] === 'PM' ? 12 : 0);
  return `${m[3]}-${pad(MON[m[2]])}-${pad(m[1])}T${pad(h)}:${m[5]}:00+07:00`;
};
const neg = (...v) => v.reduce((s, x) => s + (num(x) || 0), 0);

// ชนิดไฟล์ทั้งหมด: test = ดูหัวตาราง, key = กุญแจกันซ้ำ, row = แปลง 1 บรรทัด, day = วันที่ของแถว (ใช้หาช่วงข้อมูล), sum = ช่องที่รวมกันถ้าแถวซ้ำ
const KINDS = [
  { id: 'sales', table: 'kk_grab_daily_sales', key: ['date', 'store_id', 'service'], test: h => h.includes('เรตติ้งเฉลี่ย'),
    row: g => ({ date: dmy(g('วันที่')), store_id: g('ร้าน'), service: g('บริการ Grab') || 'GrabFood', gross_sales: num(g('ยอดขายรวม (฿)')), net_sales: num(g('ยอดขายสุทธิ (฿)')), orders: num(g('จำนวนรายการชำระเงิน')), avg_ticket: num(g('ยอดชำระเงินเฉลี่ย (฿)')), rating: num(g('เรตติ้งเฉลี่ย')) }) },
  { id: 'menu', table: 'kk_grab_menu_sales', key: ['date', 'item', 'store_id', 'platform'], sum: ['units', 'gross_sales'], test: h => h.includes('จำนวนที่ขายได้'),
    row: g => ({ date: dmy(g('วันที่')), item: g('รายการ'), store_id: g('ร้าน'), platform: g('บริการ Grab') || 'GrabFood', units: num(g('จำนวนที่ขายได้')), gross_sales: num(g('ยอดขายที่ทำได้ (฿)')) }) },
  { id: 'peak', table: 'kk_grab_peak_hours', key: ['date', 'hour', 'store_id'], sum: ['orders'], test: h => h.includes('บริการ Grab') && h.includes('00') && h.includes('12'),
    rows: g => Array.from({ length: 24 }, (_, hr) => ({ date: dmy(g('วันที่')), hour: hr, store_id: g('ร้าน'), orders: num(g(pad(hr))) || 0 })) },
  { id: 'offers', key: ['date', 'promo', 'store_id'], sum: ['gross_sales', 'net_sales', 'orders', 'spent'], test: h => h.includes('โปรโมชัน') && h.includes('เงินที่ใช้ (฿)'),
    row: g => ({ date: dmy(g('วันที่')), promo: g('โปรโมชัน'), store_id: g('ร้าน'), gross_sales: num(g('ยอดขายรวม (฿)')), net_sales: num(g('ยอดขายสุทธิ (฿)')), orders: num(g('จำนวนรายการชำระเงิน')), spent: num(g('เงินที่ใช้ (฿)')) }) },
  { id: 'miwi_item', table: 'kk_grab_issue', key: ['line_key'], test: h => h.includes('Missing Reported'),
    row: g => ({ date: g('วันที่'), store_id: g('ร้าน'), order_id: g('Order ID'), short_no: g('Short Order Number'), item_name: g('Item Name'), modifiers: g('Modifiers / Components'), missing: num(g('Missing Reported')), wrong: num(g('Wrong Reported')), total: num(g('Total Reported')) }) },
  { id: 'miwi_order', table: 'kk_grab_issue_order', key: ['order_id'], test: h => h.includes('Disposition'),
    row: g => ({ order_id: g('Order ID'), date: g('วันที่'), store_id: g('ร้าน'), short_no: g('Short Order Number'), disposition: g('Disposition'), hour: num(g('Hour')), order_time: g('Order Time (Local)') || null }) },
  { id: 'transactions', table: 'kk_grab_transactions', key: ['txn_id'], test: h => h.includes('Transaction ID') && h.includes('ยอดขายสุทธิ'),
    row: g => ({ txn_id: g('Transaction ID') || 'cancel:' + (g('รหัสคำสั่งซื้อยาว') || g('รหัสการจอง')), store_id: g('ชื่อร้าน#2'), platform: g('ประเภท'), created_at: grabTs(g('วันที่สร้าง')), updated_on: grabTs(g('Updated On')), category: g('หมวดหมู่') || null, subcategory: g('รายการย่อย') || null, status: g('สถานะ'),
      order_long: g('รหัสคำสั่งซื้อยาว') || null, order_short: g('รหัสคำสั่งซื้อสั้น') || null, booking_code: g('รหัสการจอง') || null, order_type: g('ประเภทคำสั่งซื้อ') || null, payment_method: g('วิธีการชำระเงิน') || null,
      amount: num(g('ยอด')), store_discount: num(g('ส่วนลด (ออกโดยร้าน)')), delivery_discount: num(g('ส่วนลดค่าจัดส่ง (ออกโดยร้าน)')), net_sales: num(g('ยอดขายสุทธิ')),
      commission: neg(g('ค่าคอมมิชชันการจัดส่ง'), g('ค่าคอมมิชชันแพลตฟอร์ม'), g('ค่าคอมมิชชันคำสั่งซื้อ'), g('ค่าคอมมิชชันอื่นของ GrabFood / GrabMart'), g('GrabKitchen Commission'), g('ค่าคอมมิชชันอื่นของ GrabKitchen')),
      fees: neg(g('MDR สุทธิ'), g('ภาษี MDR'), g('ค่าธรรมเนียม Grab'), g('ค่าธรรมเนียมการตลาด')), comm_tax: num(g('ภาษีค่าคอมมิชชัน, การปรับรายได้, โฆษณา GrabFood / GrabMart')), withholding: num(g('ภาษีหัก ณ ที่จ่าย')),
      total_payout: num(g('ทั้งหมด')), payout_id: g('รหัสการทำรายการ') || null, transfer_at: grabTs(g('วันที่โอน')), cancel_by: g('ยกเลิกโดย') || null, cancel_reason: g('สาเหตุที่ยกเลิก') || null, description: g('คำอธิบาย') || null }),
    day: r => (r.created_at || '').slice(0, 10) },
  { id: 'transfers', table: 'kk_grab_transfers', key: ['payout_id'], test: h => h.includes('รหัสการจ่ายรายได้'),
    row: g => ({ payout_id: g('รหัสการจ่ายรายได้'), store_id: g('ชื่อร้าน'), created_at: grabTs(g('วันที่')), transfer_at: grabTs(g('วันที่โอน')), transfer_date: (grabTs(g('วันที่โอน')) || grabTs(g('วันที่')) || '').slice(0, 10) || null, amount: num(g('ยอดสุทธิ')), status: g('สถานะ'), bank_ref: g('รหัสใบแจ้งยอดธนาคาร') || null }),
    day: r => r.transfer_date },
  { id: 'ads_keyword', table: 'kk_grab_ad_keyword', key: ['date', 'keyword', 'advertiser'], sum: ['impressions', 'clicks', 'ad_orders', 'ad_sales', 'spend', 'menu_visits', 'add_to_cart'], test: h => h.includes('Matched Keywords'),
    row: g => ({ date: adsDay(g), keyword: g('Matched Keywords'), advertiser: g('Advertiser Name'), ...adsNums(g) }) },
  { id: 'ads_campaign', table: 'kk_grab_ads', key: ['date', 'campaign', 'store_id'], sum: ['spend', 'gross_spend', 'ad_orders', 'ad_sales', 'impressions', 'clicks', 'menu_visits', 'add_to_cart'], test: h => h.includes('Campaigns Name'),
    row: g => ({ date: adsDay(g), campaign: `${g('Campaigns Name')} · เริ่ม ${g('Campaigns Start Date')}`, store_id: g('Advertiser Name'), level: 'campaign', gross_spend: num(g('Local Ad Spend')), budget: num(g('Advertiser Budget')), ...adsNums(g) }) },
  { id: 'ads_daily', table: 'kk_grab_ads', key: ['date', 'campaign', 'store_id'], test: h => h.includes('Advertiser Budget') && h.includes('Daily'),
    row: g => ({ date: adsDay(g), campaign: '(ทั้งบัญชี)', store_id: g('Advertiser Name'), level: 'total', gross_spend: num(g('Local Ad Spend')), budget: num(g('Advertiser Budget')), ...adsNums(g) }) }
];

// วันที่ของไฟล์โฆษณา (แยกเป็นช่อง วัน/เดือน/ปี)
function adsDay(g) { return g('Yearly') ? `${g('Yearly')}-${pad(g('Monthly'))}-${pad(g('Daily'))}` : null; }
// ตัวเลขโฆษณาชุดเดียวกันทุกไฟล์ (ค่าโฆษณา = ยอดที่ถูกเรียกเก็บจริงเป็นบาท)
function adsNums(g) {
  return { spend: num(g('Billable Local Ad Spend')), ad_orders: num(g('Ad Generated Orders')), ad_sales: num(g('Ad Generated Sales')), impressions: num(g('Impressions')), clicks: num(g('Clicks')), menu_visits: num(g('MenuVisit_')), add_to_cart: num(g('AddToCart_')) };
}

// ช่วงวันที่จากชื่อไฟล์ (26_06_26 - 23_09_26 หรือ 2026-03-28_to_2026-09-24) ไม่มี = null
function periodFromName(name) {
  let m = /(\d{2})_(\d{2})_(\d{2}) - (\d{2})_(\d{2})_(\d{2})/.exec(name);
  if (m) return [`20${m[3]}-${m[2]}-${m[1]}`, `20${m[6]}-${m[5]}-${m[4]}`];
  m = /(\d{4}-\d{2}-\d{2})_to_(\d{4}-\d{2}-\d{2})/.exec(name);
  return m ? [m[1], m[2]] : null;
}

// รวมแถวที่กุญแจซ้ำในไฟล์เดียวกัน (ช่อง sum บวกกัน · ช่องอื่นเอาแถวล่าสุด) กันฐานปฏิเสธทั้งชุด
function mergeDup(rows, kind) {
  const map = new Map();
  rows.forEach(r => {
    const k = kind.key.map(c => r[c]).join('|'), old = map.get(k);
    if (!old) return map.set(k, r);
    if (kind.sum) kind.sum.forEach(c => { r[c] = (Number(old[c]) || 0) + (Number(r[c]) || 0); });
    if (kind.id === 'miwi_order' && old.disposition !== r.disposition) r.disposition = `${old.disposition}+${r.disposition}`;
    map.set(k, r);
  });
  return [...map.values()];
}

// อ่านไฟล์ 1 ไฟล์ → { kind, rows: [{ row_key, day, data }], from, to, lines, capped, store } (ไม่รู้จักชนิด = kind null) · บันทึกลง kk_grab_report
export function parseGrabFile(name, text) {
  const all = parseCsv(text), head = all[0] || [], kind = KINDS.find(k => k.test(head));
  if (!kind) return { kind: null, name };
  const dupName = head.indexOf('ชื่อร้าน') !== head.lastIndexOf('ชื่อร้าน');
  const body = all.slice(1).filter(r => r.length >= head.length - 2);
  const seen = {};
  let rows = body.flatMap(r => {
    const g = h => (h === 'ชื่อร้าน#2' ? r[dupName ? head.lastIndexOf('ชื่อร้าน') : head.indexOf('ชื่อร้าน')] : r[head.indexOf(h)]) ?? '';
    if (kind.rows) return kind.rows(g);
    const row = kind.row(g);
    if (kind.id === 'miwi_item') { const b = [row.order_id, row.item_name, row.modifiers].join('|'); seen[b] = (seen[b] || 0) + 1; row.line_key = `${b}|${seen[b]}`; }
    return [row];
  });
  const dayOf = kind.day || (r => r.date);
  rows = mergeDup(rows.filter(r => dayOf(r)), kind);
  const days = rows.map(dayOf).sort();
  const p = (body.length !== 10000 && periodFromName(name)) || [days[0], days[days.length - 1]];
  const store = (rows[0] || {}).store_id || (rows[0] || {}).advertiser || '';
  rows = rows.map(r => ({ row_key: kind.key.map(c => r[c]).join('|'), day: dayOf(r), data: r }));
  return { kind: kind.id, name, rows, from: p[0], to: p[1], lines: body.length, capped: body.length === 10000, store };
}
