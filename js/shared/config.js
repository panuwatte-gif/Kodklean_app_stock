// ค่าที่แก้บ่อยของแอป — ชื่อเมนู ไอคอน สี รวมไว้ไฟล์นี้ไฟล์เดียว

// เมนูล่างของแอป 7 ปุ่ม (items = รายการย่อยที่เด้งขึ้นมาเมื่อกด)
export const APP_NAV = [
  { id: 'home', label: 'หน้าหลัก', navLabel: 'หน้าหลัก', icon: 'assets/icons/nav-home.webp', accent: '#1E7A3C' },
  { id: 'staff', label: 'พนักงาน', navLabel: 'พนักงาน', icon: 'assets/icons/nav-staff.webp', accent: '#347CD5' },
  { id: 'stock', label: 'สต๊อก', navLabel: 'สต๊อก', icon: 'assets/icons/nav-stock.webp', accent: '#1E7A3C' },
  {
    id: 'special', label: 'ปุ่มพิเศษ', navLabel: 'พิเศษ', icon: 'assets/icons/nav-special.webp',
    accent: '#C79A45', kind: 'special'
  },
  { id: 'prep', label: 'เตรียมวัตถุดิบ&เหลือ', navLabel: 'เตรียม·เหลือ', icon: 'assets/icons/nav-prep.webp', accent: '#125B2A' },
  { id: 'rama9', label: 'พระราม9', navLabel: 'พระราม9', icon: 'assets/icons/nav-rama9.webp', accent: '#1F4FB0' },
  // กด "อื่นๆ" แล้วเปิดเป็นหน้าเต็มจอ (ไม่ใช่แผงเด้งขึ้นมาแล้ว)
  { id: 'other', label: 'อื่นๆ', navLabel: 'อื่นๆ', icon: 'assets/icons/nav-other.webp', accent: '#B65B0C' }
];

// ---------- หน้าอื่นๆ (เมนูเสริม) ----------

// ข้อความบนหัวหน้าอื่นๆ
export const OTHER_UI = {
  title: 'อื่นๆ',
  sub: 'เมนูเสริมและเครื่องมือตรวจสอบของทีม',
  count: '{n} เมนู',
  soon: '{name} · กำลังพัฒนา'
};

// การ์ดเมนูของหน้าอื่นๆ (kind = รูปแบบการ์ด: hero ใบใหญ่ / half ครึ่งจอ / stack ซ้อนรายการ / capsule แคปซูล / data การ์ดวิเคราะห์)
export const OTHER_CARDS = [
  {
    id: 'recipe', kind: 'hero', title: 'สูตรอาหาร', sub: 'สูตรและอัตราส่วนวัตถุดิบของทุกเมนู',
    kicker: 'ใช้บ่อยที่สุด', meta: '48 เมนู · อัปเดต 12 ก.ย.', icon: 'assets/icons/ic09.webp',
    accent: '#2FA38F', accent2: '#9CE7DA'
  },
  {
    id: 'leave', kind: 'half', title: 'วันลาพนักงาน', sub: 'ปฏิทินวันลาและเช็คอิน',
    meta: 'ลารอบนี้ 3 คน', icon: 'assets/icons/ic14.webp', accent: '#8A6BD8', accent2: '#D9CBF7'
  },
  {
    id: 'docs', kind: 'half', title: 'เอกสารพนักงาน', sub: 'สัญญา ใบรับรอง สลิปเงินเดือน',
    meta: '6 คน · ครบ 5', icon: 'assets/icons/ic19.webp', accent: '#3B7FD4', accent2: '#C6DEF9'
  },
  {
    id: 'crosscheck', kind: 'stack', title: 'Cross-check', sub: 'ตรวจยอดข้ามระบบให้ตรงกันทุกวัน',
    icon: 'assets/icons/ic01.webp', accent: '#1E9BB5', accent2: '#B6ECF4',
    rows: [
      { label: 'POS · แอป', value: 'ตรงกัน', tone: 'ok' },
      { label: 'สต๊อก · เตรียมวัตถุดิบ', value: 'ต่าง 2 รายการ', tone: 'warn' },
      { label: 'ยอดขาย · Grab', value: 'รอตรวจ', tone: 'wait' }
    ]
  },
  {
    id: 'grab', kind: 'half', title: 'Grab', sub: 'ยอดขายและค่าคอมมิชชั่น',
    meta: 'รอบโอน 15 ก.ย.', icon: 'assets/icons/ic13.webp', accent: '#C98A2E', accent2: '#FBE2B4'
  },
  {
    id: 'bonus', kind: 'half', title: 'โบนัส', sub: 'เกณฑ์และยอดโบนัสรายเดือน',
    meta: 'คิดถึง 10 ก.ย.', icon: 'assets/icons/ic10.webp', accent: '#D9537F', accent2: '#FBD0DE'
  },
  {
    id: 'equation', kind: 'capsule', title: 'ตรวจสอบสมการ', sub: 'เช็กสูตรคำนวณทุกหน้าให้ถูกต้อง',
    meta: 'ผ่าน 9 / 10', glyph: 'check', accent: '#6E9B1F', accent2: '#DCEBAE'
  },
  {
    id: 'assumption', kind: 'data', title: 'Assumption', sub: 'สมมติฐานและตัวแปรที่ใช้ในทุกการคำนวณ',
    kicker: 'MODEL', glyph: 'layers', accent: '#8E7BF0', accent2: '#6FE3E1',
    stats: [
      { label: 'ตัวแปรที่ใช้', value: '24', unit: 'ตัว' },
      { label: 'ความแม่นยำ', value: '92.4', unit: '%' },
      { label: 'ทบทวนล่าสุด', value: '8', unit: 'วัน' }
    ],
    sparkLabel: 'ความแม่นยำย้อนหลัง 14 วัน',
    spark: [6, 7, 6, 9, 8, 10, 9, 11, 10, 12, 11, 13, 12, 14]
  }
];

// ---------- หน้าปุ่มพิเศษ ----------

// ข้อความบนหัวหน้าปุ่มพิเศษ
export const SPECIAL_UI = {
  title: 'ปุ่มพิเศษ',
  sub: 'เกม รางวัล ผู้ช่วย และเพลงของทีม',
  count: '{n} เมนู',
  soon: '{name} · กำลังพัฒนา'
};

// การ์ดของหน้าปุ่มพิเศษ (goto = หน้าปลายทาง ถ้ามี)
export const SPECIAL_CARDS = [
  {
    id: 'village', kind: 'hero', goto: 'village', title: 'หมู่บ้านอิ่มใจ', sub: 'เกมฝึกจำเมนูและส่วนผสมของทีม',
    kicker: 'เกมสะสมดาว', meta: 'เล่นได้ทุกวัน · มีอันดับรายสัปดาห์', icon: 'assets/icons/special-village.webp',
    accent: '#C98A2E', accent2: '#FBE2B4'
  },
  {
    id: 'wheel', kind: 'half', title: 'กงล้อโบนัส', sub: 'หมุนสุ่มรางวัลประจำเดือน',
    meta: 'หมุนได้ 1 ครั้ง/เดือน', icon: 'assets/icons/ic10.webp', accent: '#D9537F', accent2: '#FBD0DE'
  },
  {
    id: 'jarvis', kind: 'half', title: 'อาเฮีย (Jarvis)', sub: 'ผู้ช่วยตอบคำถามเรื่องร้าน',
    meta: 'ถามได้ทั้งวัน', icon: 'assets/chars/ahhia-port.webp', accent: '#3B7FD4', accent2: '#C6DEF9'
  },
  {
    id: 'songs', kind: 'capsule', title: 'เพลง', sub: 'เพลงประจำร้านและเพลงของทีม',
    meta: '6 เพลง', glyph: 'music', accent: '#8A6BD8', accent2: '#D9CBF7'
  }
];

// ข้อความของแถบบนสุดของแอป (รวมปุ่มออกจากระบบ)
export const APP_UI = {
  logout: 'ออกจากระบบ',
  logoutAsk: { title: 'ออกจากระบบ?', text: 'ต้องใส่รหัสพนักงานและ PIN อีกครั้งเมื่อเข้าใช้งาน', ok: 'ออกจากระบบ' },
  loggedOut: 'ออกจากระบบแล้ว'
};

// คนที่ล็อกอินเข้าแอปได้ (code = รหัสพนักงาน, avatar = ชื่อไฟล์รูปในของ assets/login/)
export const LOGIN_USERS = [
  { code: '1001', pin: '1111', name: 'อาเฮีย', role: 'admin', avatar: 'ahhia',  gameFolder: 'person_01' },
  { code: '1004', pin: '4444', name: 'แม่พัน', role: 'admin', avatar: 'maepan', gameFolder: 'person_04' },
  { code: '1003', pin: '3333', name: 'อัด',    role: 'staff', avatar: 'ad',     gameFolder: 'person_03' },
  { code: '1005', pin: '5555', name: 'ฟ้า',    role: 'lead',  avatar: 'fah',    gameFolder: 'person_05' },
  { code: '1006', pin: '6666', name: 'เอมมี่', role: 'staff', avatar: 'emmy',   gameFolder: 'person_06' },
  { code: '1002', pin: '2222', name: 'ส้ม',    role: 'staff', avatar: 'som',    gameFolder: 'person_02' }
];

// สีจุดนำหน้ารายการย่อย (วนใช้ตามลำดับ)
export const PASTEL_DOTS = ['#A6BE40', '#F7C346', '#FE9B96', '#9BBFE8', '#A3E4F6', '#A27ED7', '#FEE7BA'];

// ---------- หน้าสต๊อก ----------

// แถบสลับมุมมองด้านบนของหน้าสต๊อก
export const STOCK_TABS = [
  { id: 'all', label: 'สต๊อกรวม' },
  { id: 'kitchen', label: 'ครัวกลาง' },
  { id: 'condo', label: 'คอนโด' }
];

// แถวปุ่มจัดการรายการ (ไอคอน + สีพื้นอ่อน)
export const STOCK_ACTIONS = [
  { id: 'add', label: 'เพิ่มรายการ', glyph: 'plus', color: '#2FA36B', tint: '#E7F6EE' },
  { id: 'addCat', label: 'เพิ่มหมวด', glyph: 'folder', color: '#2FA36B', tint: '#E7F6EE' },
  { id: 'edit', label: 'แก้ไขชื่อ/จำนวน', glyph: 'pencil', color: '#E08A2E', tint: '#FDF1DF' },
  { id: 'photo', label: 'เปลี่ยนรูป', glyph: 'image', color: '#3B7FD4', tint: '#E9F2FD' },
  { id: 'delete', label: 'ลบ', glyph: 'trash', color: '#E5433B', tint: '#FDEBEA' },
  { id: 'sort', label: 'จัดลำดับ', glyph: 'sort', color: '#4C8FD8', tint: '#EAF3FC' }
];

// ชิปหมวด "ทั้งหมด" ที่อยู่หน้าสุดของแถวหมวดหลัก (ไม่ใช่หมวดจริง)
export const CAT_ALL = { id: 'all', label: 'ทั้งหมด', icon: 'assets/icons/ic21.webp', color: '#2E8B4F', tint: '#E9F6EC' };

// ชุดสีให้เลือกตอนเพิ่มหมวดใหม่
export const CAT_COLOR_PRESETS = [
  { color: '#E1567F', tint: '#FDECF1' },
  { color: '#3B7FD4', tint: '#EAF2FD' },
  { color: '#4E9A3E', tint: '#EEF7E9' },
  { color: '#C98A2E', tint: '#FDF3E2' },
  { color: '#8B63C9', tint: '#F4EEFB' },
  { color: '#B37A45', tint: '#FBF1E5' },
  { color: '#2E8B4F', tint: '#E9F6EC' },
  { color: '#D4322A', tint: '#FDE7E5' }
];

// ไอคอนให้เลือกตอนเพิ่มหมวดใหม่
export const CAT_ICON_CHOICES = [
  { value: 'assets/cats/beef.webp', label: 'เนื้อ' },
  { value: 'assets/cats/pork.webp', label: 'หมู' },
  { value: 'assets/cats/chicken.webp', label: 'ไก่' },
  { value: 'assets/cats/duck.webp', label: 'เป็ด' },
  { value: 'assets/cats/shrimp.webp', label: 'กุ้ง' },
  { value: 'assets/cats/salmon.webp', label: 'แซลมอน' },
  { value: 'assets/cats/fish.webp', label: 'ปลา' },
  { value: 'assets/cats/veg.webp', label: 'ผัก' },
  { value: 'assets/cats/season.webp', label: 'เครื่องปรุง' },
  { value: 'assets/cats/sauce.webp', label: 'ซอส' },
  { value: 'assets/cats/pack.webp', label: 'แพ็คเกจจิ้ง' },
  { value: 'assets/icons/ic02.webp', label: 'ตะกร้าผัก' },
  { value: 'assets/icons/ic07.webp', label: 'เครื่องดื่ม' },
  { value: 'assets/icons/ic12.webp', label: 'อาหารกล่อง' }
].map(o => ({ ...o, image: o.value }));

// ป้ายสถานะคงเหลือ
export const STOCK_STATUS = {
  low: { label: 'ใกล้หมด', color: '#B4741B', tint: '#FDF0D8' },
  out: { label: 'หมด', color: '#D4322A', tint: '#FDE7E5' }
};

// ปุ่มไอคอนท้ายแถวรายการ
export const STOCK_ROW_TOOLS = [
  { id: 'edit', glyph: 'pencil', color: '#2FA36B', tint: '#EAF7F0', label: 'แก้ไข' },
  { id: 'photo', glyph: 'image', color: '#3B7FD4', tint: '#EAF2FD', label: 'เปลี่ยนรูป' },
  { id: 'delete', glyph: 'trash', color: '#E5433B', tint: '#FDEBEA', label: 'ลบ' },
  { id: 'more', glyph: 'more', color: '#8C8172', tint: '#F4F0E8', label: 'เพิ่มเติม' }
];

// คลังรูปสินค้าที่เลือกได้เมื่อกดปุ่ม "เปลี่ยนรูป"
export const FOOD_PHOTOS = [
  { value: 'assets/food/chicken-mince.webp', label: 'ไก่บด' },
  { value: 'assets/food/chicken-breast.webp', label: 'อกไก่' },
  { value: 'assets/food/chicken-tender.webp', label: 'สันในไก่' },
  { value: 'assets/food/pork-chop.webp', label: 'หมูสไลซ์' },
  { value: 'assets/food/beef-steak.webp', label: 'เนื้อสเต๊ก' },
  { value: 'assets/food/pork-mince.webp', label: 'หมูบด' },
  { value: 'assets/food/shrimp-peeled.webp', label: 'กุ้งปอกเปลือก' },
  { value: 'assets/food/shrimp-whole.webp', label: 'กุ้งสด' },
  { value: 'assets/food/salmon.webp', label: 'แซลมอน' },
  { value: 'assets/food/dried-fish.webp', label: 'ปลาแห้ง' },
  { value: 'assets/food/basil.webp', label: 'ใบกะเพรา' },
  { value: 'assets/food/garlic.webp', label: 'กระเทียม' },
  { value: 'assets/food/chili.webp', label: 'พริก' },
  { value: 'assets/food/oil-bottle.webp', label: 'น้ำมัน' },
  { value: 'assets/food/sauce-bowl.webp', label: 'ซอสถ้วย' },
  { value: 'assets/food/sauce-bottle.webp', label: 'ซอสขวด' },
  { value: 'assets/food/box-1.webp', label: 'กล่องอาหาร' },
  { value: 'assets/food/box-3.webp', label: 'กล่อง 3 ช่อง' },
  { value: 'assets/food/tea-bottle.webp', label: 'ขวดชาไทย' }
].map(o => ({ ...o, image: o.value }));

// หน่วยนับที่เลือกได้ในฟอร์มแก้ไขรายการสต๊อก
export const STOCK_UNITS = ['กก.', 'กรัม', 'ใบ', 'ขวด', 'ถุง', 'แพ็ค', 'ชิ้น'];

// ---------- หน้าหลัก (Dashboard) ----------

// ตัวละครวัยเรียน 6 คน + มาสคอต (รหัสตามชีต ไม่ผูกกับชื่อคนจริง) และตำแหน่งที่ใช้บนหน้าหลัก
export const HOME_CHARS = {
  'kid-01': 'assets/home/kid-01-glasses.webp',   // เตรียมพรุ่งนี้
  'kid-02': 'assets/home/kid-02-redhair.webp',   // ประกาศข้อ 1
  'kid-03': 'assets/home/kid-03-scarf.webp',     // หุงข้าว
  'kid-04': 'assets/home/kid-04-bob.webp',       // ของเหลือ
  'kid-05': 'assets/home/kid-05-ponytail.webp',  // ใช้ไปเท่าไหร่ / พระราม 9
  'kid-06': 'assets/home/kid-06-bun.webp',       // ประกาศข้อ 2
  mascot: 'assets/home/mascot-celebrate.webp'    // การ์ดประหยัด
};

// สีประจำส่วนของหน้าหลัก (ใช้กับกราฟ/แท่ง — สีพื้นการ์ดอยู่ใน css/pages/home.css)
export const HOME_COLORS = { blue: '#287DEB', lavender: '#8B6DD7', teal: '#10A589', rose: '#F5637E', green: '#16A469', gold: '#D69B26', prior: '#C9D3D9' };

// ข้อความทั้งหมดของหน้าหลัก ({n} {d} {a} {b} = ช่องเติมตัวเลข/วันที่)
export const HOME_UI = {
  designWidth: 794,   // ความกว้างที่ใช้วางเลย์เอาต์หน้าหลัก แล้วย่อลงจอมือถือ (ห้ามขยายกรอบแอปตาม)
  title: 'หน้าหลัก',
  sub: 'Dashboard',
  tagline: 'ดูแลทุกมื้อ เพื่อทุกคนที่คุณรัก',
  sample: 'ข้อมูลตัวอย่าง',
  closedTo: 'ปิดข้อมูลถึง',
  branchLabel: 'สาขา',
  dateAsk: 'เลือกวันที่',
  dateOnly: 'ข้อมูลตัวอย่างรอบนี้มีของวันที่ 10 ก.ย. 2569 เท่านั้น',
  noData: 'ยังไม่มีข้อมูล',
  prep: {
    title: 'แนะนำเตรียมของพรุ่งนี้', sub: 'จัดเตรียมวัตถุดิบล่วงหน้า เพื่อการทำงานที่ราบรื่น',
    rankLabel: 'อันดับ', rankHint: 'เลือกดูครั้งละ 3 อันดับ', cols: ['#', 'วัตถุดิบ', 'ปริมาณ', 'ผู้รับผิดชอบ'],
    of: 'จาก', items: 'รายการ', closed: 'พรุ่งนี้ร้านปิด', unranked: 'รายการแนะนำที่ยังไม่จัดอันดับ',
    basisNote: 'ปริมาณแนะนำจากระบบ • ยังไม่ระบุว่าเป็น "ต้องผลิตเพิ่ม" หรือ "เป้าสต๊อกรวม"'
  },
  rice: {
    title: 'แนะนำปริมาณหุงข้าว', sub: 'คำนวณจากยอดขายและเมนูในแต่ละสาขา ปรับตามปริมาณจริงได้',
    raw: 'ข้าวดิบ', water: 'น้ำ', kg: 'กก.', liter: 'ลิตร', pot: 'หม้อ', noRecipe: 'ยังไม่ได้ตั้งสูตร',
    foot: 'ปริมาณตัวอย่าง • ใช้สูตรน้ำและความจุหม้อที่ร้านตั้งไว้ ไม่ใช่สูตรหุงจริง'
  },
  usage: {
    title: 'ใช้ไปเท่าไหร่', sub: 'ปริมาณการใช้วัตถุดิบย้อนหลัง 7 วัน', itemLabel: 'วัตถุดิบ', avg7: 'เฉลี่ย 7 วัน',
    coverage: 'เฉลี่ยจาก {n} วันทำการในช่วง 7 วัน', missing: 'ขาดข้อมูล {n} วัน',
    legendDay: 'ใช้รายวัน', legendMean: 'ค่าเฉลี่ย 7 วัน',
    topTitle: 'Top 5 วัตถุดิบที่ใช้มากสุด', topSub: 'เฉลี่ย 7 วัน • ภาพรวมสาขาที่เลือก'
  },
  left: {
    title: 'ยอดคงเหลือภาพรวม', sub: 'จำนวนเมนูที่เหลือจากการผลิต ย้อนหลัง 7 วัน', menuLabel: 'เมนู', allMenus: 'ทุกเมนู',
    metrics: [
      { id: 'usable', label: 'เหลือเก็บต่อ', desc: 'ยอดอาหารปรุงสำเร็จที่เหลือและใช้ต่อได้ ณ ปิดวัน' },
      { id: 'disposed', label: 'ทิ้งจริง', desc: 'ปริมาณที่ทิ้งจริงในแต่ละวัน' }
    ],
    legendCur: 'รอบนี้', legendPrev: 'ช่วงก่อนหน้า',
    topTitle: '5 เมนูที่เหลือมากสุด', topSub: 'เรียงตามค่าเฉลี่ยเหลือเก็บต่อ 7 วัน • ภาพรวมสาขา',
    cols: ['เฉลี่ย 7 วัน', 'เฉลี่ย 30 วัน', '≈ บาท/เดือน'], noEst: 'คำนวณไม่ได้',
    estNote: '≈ บาท/เดือน = ประมาณการมูลค่าของเหลือเกิดใหม่ตามต้นทุน ไม่ใช่ยอดที่ทิ้งจริงหรือยอดประหยัด • ตัวเลขจำลอง {d} วันทำการ'
  },
  save: {
    title: 'ลดของเหลือ = ลดต้นทุน', saved: 'เดือนนี้ประหยัดแล้ว', worse: 'เดือนนี้ต้นทุนของทิ้งเพิ่มขึ้น', equal: 'ต้นทุนของทิ้งเท่าช่วงเดือนก่อน',
    compare: 'เทียบช่วงวันที่ {a}–{b} ของเดือนก่อน', prior: 'เดือนก่อน', current: 'เดือนนี้', down: 'ลดลง', up: 'เพิ่มขึ้น',
    chartTitle: 'ต้นทุนของที่ทิ้งจริง (สะสม)', unit: 'บาท',
    note: 'วัดจากต้นทุนของที่ทิ้งจริงที่บันทึกไว้ ไม่นับของเหลือที่เก็บต่อเป็นต้นทุนที่สูญเสีย'
  },
  sales: {
    title: 'ยอดขายเทียบเป้าหมาย', periodLabel: 'ช่วง',
    periods: [{ id: 'month', label: 'เดือนนี้' }, { id: 'today', label: 'วันนี้' }],
    subMonth: 'ยอดสะสมถึง {d} • เทียบเป้าทั้งเดือน', subToday: 'ยอดขายวันนี้ • เทียบเป้ารายวัน',
    target: 'เป้า', noTarget: 'ยังไม่ตั้งเป้า', updated: 'อัปเดต'
  },
  r9: {
    title: 'ส่งพระราม 9', sub: 'จัดส่งวัตถุดิบและซอส สำหรับสาขาพระราม 9',
    month: 'มูลค่าส่งสะสมเดือนนี้', rounds: 'รอบ', roundsLabel: 'จำนวนรอบ', typesLabel: 'ประเภท',
    chartTitle: 'มูลค่าส่งสะสม', unit: 'บาท', detail: 'ดูรายละเอียด'
  }
};

// ---------- หน้าเตรียม-เหลือ ----------

// แท็บหลัก 4 อันของหน้าเตรียม-เหลือ
export const PREP_TABS = [
  { id: 'meat', label: 'เตรียมอาหาร<br>(เนื้อสัตว์)', icon: 'assets/prep/tab-meat.webp' },
  { id: 'rice', label: 'เตรียมข้าว', icon: 'assets/prep/tab-rice.webp' },
  { id: 'forecast', label: 'พยากรณ์', icon: 'assets/prep/tab-forecast.webp' },
  { id: 'fahAll', label: 'บันทึกอาหารเหลือ', icon: 'assets/prep/tab-all.webp' }
];

// การ์ดหัวเรื่องของแต่ละแท็บ (มาสคอต + หัวข้อ + คนรับผิดชอบ)
export const PREP_HERO = {
  meat: { title: 'งานเตรียมอาหาร<br>(เนื้อสัตว์)', sub: 'บันทึก เตรียม + เบิกใช้เพิ่ม + ทิ้ง/เสีย + คงเหลือ = ใช้วัตถุดิบ/วัน', people: ['fah', 'emmy', 'ad'] },
  rice: { title: 'งานเตรียมข้าวประจำวัน', sub: 'หุงข้าวดิบ + บันทึกข้าวสุกคงเหลือ + แปลงค่าดิบ/สุก + ดูสถิติย้อนหลัง', people: ['fah', 'emmy', 'ad'] },
  forecast: { title: 'พยากรณ์วัตถุดิบ<br>รายรายการ', sub: 'ช่วยให้คุณเตรียมวัตถุดิบได้พอดี ลดการสูญเสีย และบริหารต้นทุนได้ดีขึ้น', people: ['fah', 'emmy', 'ad'] },
  fahAll: { title: 'บันทึกอาหารเหลือ', sub: 'จัดการของเหลือวันนี้ เพื่อพรุ่งนี้ที่ดีกว่า', people: ['fah'] }
};

// ชิปกรองตามผู้รับผิดชอบ (people = ใครบ้าง, ว่าง = ทั้งหมด)
export const PREP_FILTERS = {
  meat: [{ id: 'all', label: 'ทั้งหมด', people: [] }, { id: 'fah', label: 'ของฟ้า', people: ['fah'] }, { id: 'ad', label: 'ของอัด', people: ['ad'] }],
  rice: [{ id: 'all', label: 'ทั้งหมด', people: [] }, { id: 'fahemmy', label: 'ของฟ้า+เอมมี่', people: ['fah', 'emmy'] }, { id: 'ad', label: 'ของอัด', people: ['ad'] }],
  forecast: [
    { id: 'all', label: 'ทั้งหมด', people: [] },
    { id: 'meat', label: 'เนื้อสัตว์', people: [], groups: ['chicken', 'meat'], icon: 'assets/cats/pork.webp' },
    { id: 'sea', label: 'อาหารทะเล', people: [], groups: ['sea'], icon: 'assets/cats/fish.webp' },
    { id: 'rice', label: 'ข้าว', people: [], groups: ['rice'], icon: 'assets/prep/rice-homali.webp' },
    { id: 'fah', label: 'ฟ้า', people: ['fah'] },
    { id: 'emmy', label: 'เอมมี่', people: ['emmy'] },
    { id: 'ad', label: 'อัด', people: ['ad'] }
  ]
};

// ข้อความกำกับข้างชิปกรอง
export const PREP_NOTES = {
  meat: { text: 'หน้านี้แสดงเฉพาะเนื้อสัตว์และอาหารทะเล ไม่รวมข้าว', image: 'assets/prep/meat-shrimp-big.webp' },
  rice: { text: 'ตาราง 2.1 = ข้าวดิบ / ตาราง 2.2 = ข้าวสุก', image: '' }
};

// การ์ดตัวเลขสรุป (key = ชื่อค่าจาก calc)
export const PREP_KPI = {
  meat: [
    { key: 'count', label: 'รายการทั้งหมด', unit: 'รายการ', icon: 'assets/prep/ic3d-use.webp', color: '#1E7A3C', tint: '#EAF6EC', border: '#CFE8D3', digits: 0 },
    { key: 'rounds', label: 'เบิกเพิ่มทั้งหมด', unit: 'รอบ', icon: 'assets/prep/ic3d-extra.webp', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5', digits: 0 },
    { key: 'left', label: 'คงเหลือรวม', unit: 'กก.', icon: 'assets/prep/ic3d-left.webp', color: '#1E7A3C', tint: '#EAF6EC', border: '#CFE8D3', digits: 1 },
    { key: 'waste', label: 'ทิ้ง/เสียรวม', unit: 'กก.', icon: 'assets/prep/ic3d-waste.webp', color: '#C0651B', tint: '#FDF3E6', border: '#F3DCC0', digits: 1 },
    { key: 'use', label: 'ใช้วัตถุดิบ/วัน รวม', unit: 'กก.', icon: 'assets/prep/ic3d-prep.webp', color: '#1E7A3C', tint: '#E4F3E4', border: '#BFE0C4', digits: 1 }
  ],
  rice: [
    { key: 'count', label: 'รายการข้าว', unit: 'รายการ', icon: 'assets/prep/ic3d-history.webp', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5', digits: 0 },
    { key: 'raw', label: 'หุงรวมวันนี้', unit: 'กก. ดิบ', icon: 'assets/prep/ic3d-prep.webp', color: '#1E7A3C', tint: '#EAF6EC', border: '#CFE8D3', digits: 1 },
    { key: 'left', label: 'ข้าวสุกคงเหลือ', unit: 'กก.', icon: 'assets/prep/ic3d-left.webp', color: '#C0651B', tint: '#FDF3E6', border: '#F3DCC0', digits: 1 },
    { key: 'loss', label: 'สูญเสีย/กลับบ้าน/แจก', unit: 'กก.', icon: 'assets/prep/ic3d-waste.webp', color: '#D4322A', tint: '#FDECEA', border: '#F5CFCB', digits: 1 },
    { key: 'sold', label: 'ใช้ขายจริง', unit: 'กก. สุก', icon: 'assets/prep/ic3d-use.webp', color: '#1E7A3C', tint: '#E4F3E4', border: '#BFE0C4', digits: 1 }
  ]
};

// หัวตารางเนื้อสัตว์ (ชื่อ + หน่วยบรรทัดล่าง + ผู้รับผิดชอบคอลัมน์นั้น ถ้ามี)
export const PREP_MEAT_COLS = [
  ['#', ''], ['วัตถุดิบ', ''], ['ผู้รับผิดชอบ', ''], ['แนะนำ', '(กก.)'], ['เตรียม', '(กก.)'],
  ['เบิกเพิ่ม', '(กก.)'], ['ทิ้ง/เสีย', '(กก.)'], ['คงเหลือ', '(กก.)', 'emmy'], ['ใช้/วัน', '(กก.)'], ['', '']
];

// แถวที่ต้องทำสีพิเศษให้รู้ว่าเป็นของใคร (id รายการ → id คน)
export const PREP_ROW_HILITE = { 'chicken-soft': 'fah' };

// หัวตารางข้าว 3 ตาราง
export const PREP_RICE_COLS = {
  cook: [['#', ''], ['ชนิดข้าว', ''], ['ผู้รับผิดชอบ', ''], ['หุงข้าว', '(กก. ดิบ)'], ['หุงเพิ่ม', 'รอบ 1'], ['หุงเพิ่ม', 'รอบ 2'], ['หุงเพิ่ม', 'รอบ 3'], ['ปริมาณหุงรวม', '(กก. ดิบ)']],
  left: [['#', ''], ['ชนิดข้าว', ''], ['ข้าวเหลือ', '(กก.)'], ['ทิ้ง-เสีย', '(กก.)'], ['ห่อกลับบ้าน', '(กก.)'], ['แจก', '(กก.)'], ['ข้าวเหลือเพื่อเก็บขายต่อ', '(กก.)'], ['เทียบข้าวดิบ', '(กก.)']],
  ratio: [['#', ''], ['ชนิดข้าว', ''], ['สูตร/ส่วนผสมในการหุง', ''], ['อัตราแปลง ดิบ : สุก', '']]
};

// การ์ดสรุปสมการข้าว 3 ใบ (ใช้ขายจริง = ของเสีย + ข้าวเหลือขายต่อ)
export const PREP_RICE_EQ = [
  { key: 'sold', rawKey: 'soldRaw', label: 'ใช้ขายจริง (วันนี้)', icon: 'assets/prep/ic3d-use.webp', color: '#1E7A3C', tint: '#EAF6EC', border: '#8FC79A' },
  { key: 'loss', rawKey: 'lossRaw', label: 'ของเสีย/ห่อกลับบ้าน/แจก (วันนี้)', note: '(ระบบแปลงค่าสุกกลับเป็นดิบ)', icon: 'assets/prep/ic3d-waste.webp', color: '#D4322A', tint: '#FDECEA', border: '#F0B4AE' },
  { key: 'resale', rawKey: 'resaleRaw', label: 'ข้าวเหลือขายต่อวันถัดไป', icon: 'assets/prep/ic3d-left.webp', color: '#2F63C9', tint: '#EAF1FD', border: '#A9C3F0' }
];

// ชุดสีเส้นกราฟสถิติข้าว
export const PREP_CHART_SERIES = [
  { key: 'sold', label: 'ขายจริง (ข้าวสุก)', color: '#2FA34B', kind: 'line' },
  { key: 'soldRaw', label: 'ขายจริง (เทียบข้าวดิบ)', color: '#3B8BE0', kind: 'line' },
  { key: 'left', label: 'ข้าวเหลือ', color: '#F0A020', kind: 'bar' }
];

// การ์ดคำแนะนำท้ายหน้า
export const PREP_TIPS = {
  meat: {
    steps: [
      { text: 'กรอกปริมาณที่เตรียม', icon: 'assets/prep/ic3d-prep.webp', color: '#1E7A3C' },
      { text: 'ถ้ามีให้กดเบิกเพิ่ม', icon: 'assets/prep/ic3d-extra.webp', color: '#E0A020' },
      { text: 'ระบบหักทิ้ง/เสียและคงเหลือเพื่อคำนวณใช้จริง', icon: 'assets/prep/ic3d-history.webp', color: '#3B8BE0' }
    ],
    foot: 'ใช้ข้อมูลเพื่อประวัติและพยากรณ์ได้'
  },
  rice: {
    checks: ['ข้าวเหลือเพื่อเก็บขายต่อ = ข้าวเหลือ - ทิ้ง/เสีย - ห่อกลับบ้าน - แจก', 'ระบบแปลงค่าสุกกลับเป็นดิบเพื่อคำนวณใช้จริง', 'ใช้ข้อมูลนี้ช่วยตัดสินใจหุงรอบถัดไป'],
    image: 'assets/prep/rice-homali.webp'
  },
  forecast: {
    title: 'เตรียมพอดี ขายดี ไม่มีของเสีย',
    checks: ['ใช้ข้อมูลพยากรณ์ ช่วยลดการสตอกเกิน', 'วางแผนจัดซื้อได้อย่างมั่นใจ', 'สร้างกำไรอย่างยั่งยืนไปด้วยกันนะคะ'],
    bubble: 'ข้อมูลวันนี้ คือกำไรในวันพรุ่งนี้ สู้ไปด้วยกันนะคะ!'
  }
};

// ---------- แท็บพยากรณ์ (แท็บที่ 3) ----------

// ข้อความบนหน้าพยากรณ์
export const PREP_FC_UI = {
  dateLabel: 'วันที่พยากรณ์',
  modeLabel: 'รูปแบบการแสดงผล',
  tableTitle: 'พยากรณ์การใช้วัตถุดิบ (รายรายการ)',
  addLabel: 'เพิ่มรายการ',
  adviceTitle: 'ข้อเสนอแนะจากพยากรณ์',
  adviceAll: 'ดูทั้งหมด',
  rangeHead: 'ช่วงคาดการณ์'
};

// ปุ่มสลับรูปแบบการแสดงผลของตารางพยากรณ์
export const PREP_FC_MODES = [{ id: 'num', label: 'ค่าตัวเลข' }, { id: 'chart', label: 'กราฟแนวโน้ม' }];

// ป้ายแนวโน้ม (ขึ้น = ใช้มากขึ้น ใช้สีแดง / ลง = สีเขียว / คงที่ = สีฟ้า)
export const PREP_TRENDS = {
  up: { label: 'ขึ้น', arrow: '↗', color: '#E0453C', tint: '#FDECEA' },
  down: { label: 'ลง', arrow: '↘', color: '#1E7A3C', tint: '#EAF6EC' },
  flat: { label: 'คงที่', arrow: '→', color: '#3B8BE0', tint: '#EAF3FD' }
};

// หัวตารางพยากรณ์ 2 รูปแบบ (ค่าตัวเลข / กราฟแนวโน้ม)
export const PREP_FC_COLS = {
  num: [['#', ''], ['รายการวัตถุดิบ', ''], ['ผู้รับผิดชอบ', ''], ['ใช้จริงเฉลี่ย', '(กก./วัน)'], ['พยากรณ์', '(กก.)'], ['ต่ำสุด', '(กก.)'], ['สูงสุด', '(กก.)'], ['แนวโน้ม', ''], ['กราฟย้อนหลัง 10 วัน', '']],
  chart: [['#', ''], ['รายการวัตถุดิบ', ''], ['ผู้รับผิดชอบ', ''], ['พยากรณ์', '(กก.)'], ['แนวโน้ม', ''], ['กราฟย้อนหลัง 10 วัน', '']]
};

// การ์ดตัวชี้วัด 4 ใบบนหน้าพยากรณ์ (ค่าจริงเติมโดย prep-forecast.js)
export const PREP_FC_KPI = [
  { key: 'count', label: 'จำนวนวัตถุดิบ<br>ที่ติดตาม', icon: 'assets/prep/ic3d-use.webp', color: '#1E7A3C', tint: '#EAF6EC', border: '#CFE8D3' },
  { key: 'accuracy', label: 'ความแม่นยำ<br>ของโมเดล', icon: 'assets/prep/ic3d-forecast.webp', color: '#D4322A', tint: '#FDECEA', border: '#F5CFCB' },
  { key: 'days', label: 'ช่วงพยากรณ์', icon: 'assets/prep/ic3d-date.webp', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5' },
  { key: 'date', label: 'วันที่พยากรณ์', icon: 'assets/prep/ic3d-history.webp', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5' }
];

// สีป้ายของการ์ดข้อเสนอแนะ
export const PREP_FC_TONES = {
  pink: { color: '#D93A6B', tint: '#FDEAF0' },
  amber: { color: '#B4741B', tint: '#FDF3E2' },
  green: { color: '#1E7A3C', tint: '#EAF6EC' }
};

// ---------- แท็บของฟ้าทั้งหมด (แท็บที่ 4) ----------

// ข้อความและหัวตารางของหน้าของฟ้าทั้งหมด
export const FAH_UI = {
  tables: [
    { no: 2, title: 'สถิติของเหลือ 7 วัน (ทุกเมนู)', sub: 'ปริมาณของเหลือจากเมนูที่จำหน่าย (หน่วย : กรัม)' },
    { no: 1, title: 'บันทึกของเหลือวันนี้', sub: 'กรอกปริมาณของเหลือในแต่ละเมนู (หน่วย : กรัม)' },
    { no: 3, title: 'แปลงเป็นวัตถุดิบ (เหลือไว้ใช้วันพรุ่งนี้)', sub: 'ปริมาณวัตถุดิบจากของเหลือเมนู (หน่วย : กรัม)' }
  ],
  allMenus: 'ทุกเมนู',
  copy: 'คัดลอกจากเมื่อวาน',
  reset: 'รีเซ็ต',
  menuHead: 'เมนู',
  ingHead: 'วัตถุดิบ',
  graphHead: 'กราฟ',
  todayCols: [['เหลือ', '(ก.)'], ['ทิ้ง / เสีย', '(ก.)'], ['กินเอง', '(ก.)'], ['ห่อกลับบ้าน', '(ก.)'], ['คงเหลือใช้ต่อ', '(ก.)']],
  notes: [
    { tone: 'amber', head: 'เสาร์ - อาทิตย์', text: 'ของเหลือที่คงเหลือใช้ต่อ จะถูกนำไปรวมเป็นวัตถุดิบสำหรับวันถัดไป' },
    { tone: 'blue', head: 'ตรวจสอบให้ถูกต้อง', text: 'โดยเฉพาะก่อนปิดร้านวันอาทิตย์นะคะ' }
  ],
  foot: { text: 'ของเหลือจากเมนู จะถูกแปลงเป็นวัตถุดิบเพื่อใช้ในวันพรุ่งนี้', sub: 'คุณสามารถปรับแก้ / ควบคุม / รีเซ็ตข้อมูลได้ โดยเฉพาะก่อนปิดร้านวันอาทิตย์' },
  thanks: { title: 'ขอบคุณที่ช่วยกันดูแลของเหลือนะคะ', bubble: 'พักก่อนนะ พรุ่งนี้สู้ต่อ' },
  resetAsk: { title: 'ล้างของเหลือทั้งหมด?', text: 'ค่าที่กรอกไว้ของวันนี้จะถูกตั้งเป็น 0 ทั้งหมด', ok: 'รีเซ็ตทั้งหมด' },
  copyDone: 'คัดลอกของเหลือจากเมื่อวานแล้ว',
  resetDone: 'ล้างของเหลือของวันนี้แล้ว'
};

// กฎรวมกลุ่มของเหลือจากเมนู → วัตถุดิบ (ใช้ตอนแปลงของเหลือวันนี้เป็นวัตถุดิบวันพรุ่งนี้)
export const FAH_GROUPS = {
  'chicken-mince': ['kaprao-chicken-mince'],
  'chicken-soft': ['kaprao-chicken-soft', 'chicken-jimjaew', 'chicken-teriyaki'],
  'pork-slice': ['kaprao-pork-slice', 'pork-osaka'],
  'beef-mince': ['kaprao-beef'],
  'duck-mince': ['kaprao-duck'],
  salmon: ['kaprao-salmon', 'larb-salmon'],
  'shrimp-mid': ['kaprao-shrimp', 'shrimp-garlic']
};

// ---------- หน้าพระราม 9 ----------

// ชื่อสาขาและข้อความบนหน้า (แก้ที่นี่ที่เดียว)
export const R9_PLACE = {
  title: 'พระราม 9',
  sub: 'ส่งของไปสาขาพระราม 9',
  subHistory: 'ประวัติการส่งของไปสาขาพระราม 9',
  subReport: 'รายงานการส่งของไปสาขาพระราม 9',
  quoteSend: '"ส่งของดี ส่งความอร่อย ไปพระราม 9 กันเลย!"',
  quoteHistory: '"ทุกการส่ง คือความใส่ใจ เพื่อพระราม 9 ที่ดีกว่าเดิม"',
  quoteReport: '"ข้อมูลชัดเจน ช่วยให้บริหารง่ายขึ้น ธุรกิจเติบโตค่ะ!"',
  bubbleSend: 'เช็กให้ครบ ส่งให้ปัง นะครับ!',
  bubbleHistory: 'เช็กย้อนหลังได้ง่าย ส่งต่อความดี ไม่มีสะดุด',
  bubbleReport: 'ดูรายงานเข้าใจง่าย พร้อมต่อยอดได้เลย!'
};

// 3 แท็บของหน้าพระราม 9
export const R9_TABS = [
  { id: 'send', label: 'ส่งของ', glyph: 'truck' },
  { id: 'history', label: 'ประวัติ', glyph: 'clock' },
  { id: 'report', label: 'Report', glyph: 'chart' }
];

// การ์ดตัวเลขบนหัวหน้า แยกตามแท็บ (ค่าจริงเติมโดย rama9.js)
export const R9_KPI = {
  send: [
    { key: 'lastItems', label: 'รอบล่าสุด', unit: 'รายการ', foot: 'lastDate', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5' },
    { key: 'monthItems', label: 'เดือนนี้', unit: 'รายการ', foot: 'monthFoot', color: '#1E7A3C', tint: '#EAF6EC', border: '#CFE8D3' },
    { key: 'ytdItems', label: 'YTD', unit: 'รายการ', foot: 'ytdFoot', color: '#8E3E96', tint: '#F5E7F6', border: '#E5CDE7' },
    { key: 'netAll', label: 'มูลค่ารวม', unit: 'บาท', foot: 'netFoot', color: '#B4741B', tint: '#FDF3E2', border: '#F3E0BD' }
  ],
  history: [
    { key: 'rounds', label: 'จำนวนรอบ', unit: 'รอบ', foot: 'roundFoot', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5' },
    { key: 'netAll', label: 'มูลค่ารวม', unit: 'บาท', foot: 'netFoot', color: '#B4741B', tint: '#FDF3E2', border: '#F3E0BD' },
    { key: 'feeAll', label: 'ค่าส่งรวม', unit: 'บาท', foot: 'feeFoot', color: '#1E7A3C', tint: '#EAF6EC', border: '#CFE8D3' },
    { key: 'ytdItems', label: 'YTD', unit: 'รายการ', foot: 'ytdFoot', color: '#8E3E96', tint: '#F5E7F6', border: '#E5CDE7' }
  ],
  report: [
    { key: 'rounds', label: 'จำนวนรอบ', unit: 'รอบ', foot: 'pickFoot', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5' },
    { key: 'items', label: 'ยอดรวมสินค้า', unit: 'รายการ', foot: 'pickFoot', color: '#1E7A3C', tint: '#EAF6EC', border: '#CFE8D3' },
    { key: 'fee', label: 'ค่าส่งรวม', unit: 'บาท', foot: 'pickFoot', color: '#B9436F', tint: '#FCE1EA', border: '#F3C4D3' },
    { key: 'goods', label: 'มูลค่าสุทธิ', unit: 'บาท', foot: 'pickFoot', color: '#B4741B', tint: '#FDF3E2', border: '#F3E0BD' }
  ]
};

// หัวตารางรายการส่งของ
export const R9_SEND_COLS = ['รายการส่งของ', 'ปริมาณ', 'ราคา', 'รวม', ''];

// ปุ่มไอคอนท้ายแถวของตารางส่งของ
export const R9_ROW_TOOLS = [
  { id: 'photo', glyph: 'image', color: '#3B7FD4', tint: '#EAF2FD', label: 'เปลี่ยนรูป' },
  { id: 'move', glyph: 'grip', color: '#7C8A9B', tint: '#EEF3F8', label: 'จัดลำดับ' },
  { id: 'edit', glyph: 'pencil', color: '#2F63C9', tint: '#EAF1FD', label: 'แก้ไข' },
  { id: 'delete', glyph: 'trash', color: '#E5433B', tint: '#FDEBEA', label: 'ลบรายการ' }
];

// ตัวกรองช่วงเวลาในแท็บประวัติและ Report
export const R9_RANGES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'month', label: 'เดือนนี้' },
  { id: 'ytd', label: 'YTD' },
  { id: 'year', label: 'รายปี' },
  { id: 'last', label: 'รอบล่าสุด' }
];

// สถานะของรอบส่ง
export const R9_STATUS = {
  done: { label: 'ส่งสำเร็จ', note: 'ถึงสาขาแล้ว', color: '#1E7A3C', tint: '#EAF6EC' },
  moving: { label: 'อยู่ระหว่างจัดส่ง', note: 'กำลังนำส่ง', color: '#B4741B', tint: '#FDF3E2' },
  draft: { label: 'ยังไม่ส่ง', note: 'กำลังกรอกข้อมูล', color: '#7C8A9B', tint: '#EEF3F8' }
};

// ปุ่มส่งออกรายงาน (รอบนี้เปิดใช้เฉพาะพิมพ์รายงาน)
export const R9_EXPORTS = [
  { id: 'print', label: 'พิมพ์รายงาน', glyph: 'print', color: '#8E3E96', tint: '#F5E7F6' },
  { id: 'pdf', label: 'ดาวน์โหลด PDF', glyph: 'file', color: '#D4322A', tint: '#FDEBEA' },
  { id: 'excel', label: 'ดาวน์โหลด Excel', glyph: 'grid', color: '#1E7A3C', tint: '#EAF6EC' },
  { id: 'share', label: 'แชร์รายงาน', glyph: 'share', color: '#2F63C9', tint: '#EAF1FD' }
];

// หน่วยนับที่เลือกได้ในฟอร์มแก้ไขรายการส่งของ
export const R9_UNITS = ['กก.', 'กรัม', 'กล่อง', 'ขวด', 'ถุง', 'แพ็ค', 'ชิ้น', 'ใบ'];

// คลังรูปสำหรับปุ่ม "เปลี่ยนรูป" ของหน้าพระราม 9
export const R9_PHOTOS = [
  { value: 'assets/r9/chicken-mince.webp', label: 'อกไก่บด' },
  { value: 'assets/r9/chicken-breast.webp', label: 'อกไก่นุ่ม' },
  { value: 'assets/r9/chicken-tender.webp', label: 'สันในไก่' },
  { value: 'assets/prep/meat-pork-slice.webp', label: 'หมูสไลด์' },
  { value: 'assets/prep/meat-salmon.webp', label: 'แซลมอน' },
  { value: 'assets/prep/meat-beef-mince.webp', label: 'เนื้อสับ' },
  { value: 'assets/food/beef-steak.webp', label: 'เนื้อตุ๋น' },
  { value: 'assets/food/shrimp-whole.webp', label: 'กุ้ง' },
  { value: 'assets/r9/meat-mix.webp', label: 'เนื้อสัตว์รวม' },
  { value: 'assets/r9/basil.webp', label: 'ใบกะเพรา' },
  { value: 'assets/r9/garlic.webp', label: 'กระเทียม' },
  { value: 'assets/r9/chili-dry.webp', label: 'พริกแห้ง' },
  { value: 'assets/r9/veg-mix.webp', label: 'ผักรวม' },
  { value: 'assets/r9/sauce-bottle.webp', label: 'ซอสขวดเล็ก' },
  { value: 'assets/r9/sauce-set.webp', label: 'ซอสขวด+ถ้วย' },
  { value: 'assets/food/sauce-bottle.webp', label: 'ซอสขวดใหญ่' },
  { value: 'assets/food/sauce-bowl.webp', label: 'ซอสถ้วย' },
  { value: 'assets/food/chili.webp', label: 'พริกสด' },
  { value: 'assets/r9/dish-kaprao.webp', label: 'กะเพรา' },
  { value: 'assets/r9/dish-kaprao-egg.webp', label: 'กะเพราไข่ดาว' },
  { value: 'assets/dishes/dish-kaprao-chicken-soft.webp', label: 'กะเพราไก่นุ่ม' },
  { value: 'assets/dishes/dish-kaprao-beef.webp', label: 'กะเพราเนื้อ' },
  { value: 'assets/dishes/dish-kaprao-salmon.webp', label: 'กะเพราแซลมอน' },
  { value: 'assets/r9/drink-orange.webp', label: 'น้ำส้ม' },
  { value: 'assets/r9/drink-ginger.webp', label: 'น้ำขิง' },
  { value: 'assets/r9/drink-tea.webp', label: 'ชา' },
  { value: 'assets/r9/drink-honey-lemon.webp', label: 'น้ำผึ้งเลมอน' },
  { value: 'assets/r9/drink-longan.webp', label: 'น้ำลำไย' },
  { value: 'assets/r9/drink-juice.webp', label: 'น้ำผลไม้' },
  { value: 'assets/food/tea-bottle.webp', label: 'ขวดชาไทย' }
].map(o => ({ ...o, image: o.value }));

// ชุดสี/ไอคอนสำหรับปุ่ม "เพิ่มหมวด" ของหน้าพระราม 9
export const R9_CAT_ICONS = [
  { value: 'assets/r9/meat-mix.webp', label: 'เนื้อสัตว์' },
  { value: 'assets/r9/veg-mix.webp', label: 'ผัก' },
  { value: 'assets/r9/sauce-bottle.webp', label: 'ซอส' },
  { value: 'assets/r9/dish-kaprao.webp', label: 'อาหารปรุงสำเร็จ' },
  { value: 'assets/r9/drink-orange.webp', label: 'เครื่องดื่ม' },
  { value: 'assets/r9/boxes.webp', label: 'กล่อง/แพ็ค' },
  { value: 'assets/r9/drink-juice.webp', label: 'น้ำผลไม้' },
  { value: 'assets/food/box-1.webp', label: 'บรรจุภัณฑ์' }
].map(o => ({ ...o, image: o.value }));

// ข้อความปุ่มและหัวข้อของหน้าพระราม 9
export const R9_UI = {
  tableTitle: 'รายการส่งของ',
  tableSub: 'ระบุจำนวนและราคา เพื่อส่งไปสาขาพระราม 9',
  addItem: 'เพิ่มรายการ',
  addCat: 'เพิ่มหมวด',
  addInCat: 'เพิ่มรายการในหมวดนี้',
  notePlaceholder: 'หมายเหตุ (ถ้ามี)...',
  clear: 'ล้างทั้งหมด',
  send: 'บันทึกและส่ง',
  goods: 'รวมค่าสินค้า',
  fee: 'ค่าส่ง',
  net: 'ยอดสุทธิ',
  searchHistory: 'ค้นหารอบส่งของ...',
  detail: 'ดูรายละเอียด',
  repeat: 'ทำซ้ำ',
  historySummary: 'ข้อมูลสรุปประวัติการส่งของ',
  historyChart: 'กราฟประวัติการส่งของ (6 เดือนล่าสุด)',
  reportPick: 'เลือกรอบ',
  reportRange: 'ช่วงวันที่',
  reportBuild: 'สร้าง Report',
  reportSum: '1. สรุปยอด',
  reportSumSub: 'สรุปรายการสินค้าและปริมาณตามรอบที่เลือก',
  reportAnalyze: '2. วิเคราะห์ข้อมูล',
  reportAnalyzeSub: 'สรุปและวิเคราะห์จากข้อมูลที่เลือก',
  reportExport: '3. เลือกรูปแบบรายงาน',
  reportExportSub: 'สั่งพิมพ์รายงานตามช่วงที่เลือก',
  emptySend: 'ยังไม่มีรายการในหมวดนี้',
  emptyHistory: 'ยังไม่มีรอบส่งของในช่วงนี้',
  emptyReport: 'เลือกอย่างน้อย 1 รอบ เพื่อสร้างรายงาน',
  sent: 'บันทึกและส่งเรียบร้อย',
  cleared: 'ล้างปริมาณและราคาทั้งหมดแล้ว',
  clearAsk: { title: 'ล้างทั้งหมด?', text: 'ปริมาณ ราคา ค่าส่ง และหมายเหตุของรอบนี้จะถูกล้าง', ok: 'ล้างทั้งหมด' }
};
