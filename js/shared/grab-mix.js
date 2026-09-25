// วิเคราะห์ลูกค้า Grab: ยอดบิลกระจายตัวยังไง · บิลแต่ละขนาดสั่งอะไร · เมนูไหนมาคู่กัน · ขั้นราคาเมนูที่ขายดี (ใช้เฉพาะหน้ารายงาน)
const N = v => Number(v) || 0;
const div = (a, b) => (b ? a / b : null);

// หาขั้นที่ค่าตกอยู่ (bands = ขอบล่างเรียงน้อย→มาก เช่น [0, 100, 150])
const bandOf = (v, bands) => { let i = 0; while (i + 1 < bands.length && v >= bands[i + 1]) i++; return i; };
// ป้ายชื่อขั้น เช่น 100–149 · 500+
export const bandLabel = (bands, i) => (i === bands.length - 1 ? `${bands[i]}+` : i === 0 ? `<${bands[1]}` : `${bands[i]}–${bands[i + 1] - 1}`);

// ค่าเปอร์เซ็นไทล์ของชุดที่เรียงแล้ว
const pctl = (s, q) => (s.length ? s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))] : null);

// การกระจายยอดบิล (ยอดขายสุทธิต่อบิล) → จำนวนบิล/ยอดต่อขั้น · ลูกค้าหลัก (บิลเยอะสุด) · กลุ่มทำเงินหลัก (ยอดเยอะสุด)
export function billDist(nets, bands) {
  const v = nets.filter(x => x > 0).sort((a, b) => a - b), total = v.reduce((s, x) => s + x, 0);
  if (v.length < 20) return null;
  const rows = bands.map((lo, i) => ({ i, label: bandLabel(bands, i), n: 0, sum: 0 }));
  v.forEach(x => { const r = rows[bandOf(x, bands)]; r.n++; r.sum += x; });
  rows.forEach(r => { r.pn = r.n / v.length; r.ps = r.sum / total; r.avg = div(r.sum, r.n); });
  const top20 = v.slice(Math.floor(v.length * 0.8)).reduce((s, x) => s + x, 0) / total;
  const byN = [...rows].sort((a, b) => b.n - a.n)[0], byS = [...rows].sort((a, b) => b.sum - a.sum)[0];
  return { n: v.length, avg: total / v.length, p25: pctl(v, 0.25), p50: pctl(v, 0.5), p75: pctl(v, 0.75), p90: pctl(v, 0.9), rows, top20, main: byN, money: byS };
}

// ขั้นราคาเมนู: ราคาต่อชิ้น = ยอด ÷ จำนวน → จำนวนชิ้น/ยอดต่อขั้นราคา
export function priceTiers(menus, bands) {
  const list = menus.filter(m => m.units > 0), units = list.reduce((s, m) => s + m.units, 0), sales = list.reduce((s, m) => s + m.sales, 0);
  if (!units) return null;
  const rows = bands.map((lo, i) => ({ label: bandLabel(bands, i), units: 0, sales: 0, items: 0 }));
  list.forEach(m => { const r = rows[bandOf(m.sales / m.units, bands)]; r.units += m.units; r.sales += m.sales; r.items++; });
  rows.forEach(r => { r.pu = r.units / units; r.ps = r.sales / sales; });
  return { rows, best: [...rows].sort((a, b) => b.units - a.units)[0] };
}

// แยกรายการในบิล (ข้อความคั่นด้วย ,) → หมวดเนื้อ/แนวเมนู ตามคำใน config · รายการขึ้นต้นด้วยของเสริม (ไข่ ข้าว) ไม่นับเป็นจานหลัก
function parseBill(o, C) {
  const names = String(o.main_menu || '').split(',').map(x => x.trim()).filter(x => x && !C.sideRe.test(x));
  const mains = names.map(n => ({ protein: (C.protein.find(c => c.re.test(n)) || {}).id || null, style: (C.style.find(c => c.re.test(n)) || {}).id || null })).filter(m => m.protein || m.style);
  const extra = `${o.add_on || ''},${o.drinks || ''}`;
  return { total: N(o.net_sales), mains, addon: C.addonRe.test(extra), berry: /ไรซ์เบอร์รี่/.test(`${o.main_menu},${extra}`) };
}

// บิลแต่ละขนาดสั่งอะไร: จำนวนจานต่อบิล · หมวดเนื้อ/แนวเมนูกับยอดบิล (ดัชนี = บิลเฉลี่ยที่มีหมวดนี้ ÷ บิลเฉลี่ยทั้งหมด) · หมวดที่มาคู่กัน (lift)
export function basketOf(orders, cfg, bands) {
  const C = compileCats(cfg);
  const bills = orders.map(o => parseBill(o, C)).filter(b => b.total > 0 && b.mains.length);
  if (bills.length < 30) return null;
  const avg = bills.reduce((s, b) => s + b.total, 0) / bills.length, total = avg * bills.length, dishes = bills.reduce((s, b) => s + b.mains.length, 0);
  const seg = [1, 2, 3].map(k => { const xs = bills.filter(b => (k < 3 ? b.mains.length === k : b.mains.length >= 3)); const sum = xs.reduce((s, b) => s + b.total, 0); return { k, pn: xs.length / bills.length, ps: sum / total, avg: div(sum, xs.length) }; });
  const catRows = (key, cats) => cats.map(c => {
    const has = bills.filter(b => b.mains.some(m => m[key] === c.id)), dish = bills.reduce((s, b) => s + b.mains.filter(m => m[key] === c.id).length, 0);
    const a = div(has.reduce((s, b) => s + b.total, 0), has.length);
    return { id: c.id, label: c.label, dish: dish / dishes, bills: has.length, avg: a, idx: a ? a / avg : null };
  }).filter(r => r.bills >= 10).sort((x, y) => y.dish - x.dish);
  const pc = {}, pairs = {};
  bills.forEach(b => { const set = [...new Set(b.mains.map(m => m.protein).filter(Boolean))]; set.forEach(a => { pc[a] = N(pc[a]) + 1; }); for (let i = 0; i < set.length; i++) for (let j = i + 1; j < set.length; j++) { const k = [set[i], set[j]].sort().join('|'); pairs[k] = N(pairs[k]) + 1; } });
  const lab = id => (C.protein.find(c => c.id === id) || {}).label || id;
  const pairRows = Object.entries(pairs).filter(([, n]) => n >= 5).map(([k, n]) => { const [a, c] = k.split('|'); return { a: lab(a), b: lab(c), n, lift: (n / bills.length) / ((pc[a] / bills.length) * (pc[c] / bills.length)) }; }).sort((x, y) => y.n - x.n).slice(0, 5);
  const byBand = bands.map((lo, i) => { const xs = bills.filter(b => bandOf(b.total, bands) === i); return { label: bandLabel(bands, i), n: xs.length, dish: div(xs.reduce((s, b) => s + b.mains.length, 0), xs.length), addon: div(xs.filter(b => b.addon).length, xs.length), top: topCat(xs, C.protein) }; }).filter(r => r.n >= 5);
  const days = orders.map(o => o.order_date).filter(Boolean).sort();
  return { n: bills.length, from: days[0], to: days[days.length - 1], avg, seg, protein: catRows('protein', C.protein), style: catRows('style', C.style), pairs: pairRows, byBand, berry: bills.filter(b => b.berry).length / bills.length };
}

// แปลงคำค้นใน config (ข้อความ) เป็น RegExp
function compileCats(cfg) {
  const cat = list => list.map(c => ({ ...c, re: new RegExp(c.re) }));
  return { protein: cat(cfg.protein), style: cat(cfg.style), sideRe: new RegExp(cfg.side), addonRe: new RegExp(cfg.addon) };
}

// หมวดเนื้อที่พบบ่อยสุดในกลุ่มบิล
function topCat(bills, cats) {
  const c = {};
  bills.forEach(b => b.mains.forEach(m => { if (m.protein) c[m.protein] = N(c[m.protein]) + 1; }));
  const best = Object.entries(c).sort((x, y) => y[1] - x[1])[0];
  return best ? (cats.find(x => x.id === best[0]) || {}).label : null;
}
