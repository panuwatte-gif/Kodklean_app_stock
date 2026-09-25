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
    id: 'assignwork', kind: 'hero', goto: 'assign', title: 'แบ่งงาน', sub: 'มอบหมายว่าใครนับอะไร ใครกรอกงานไหน',
    kicker: 'เห็นเพาะอาเฮีย กับ แม่พัน', meta: 'นับสต๊อก · เตรียมอาหาร · อาหารปรุงสำเร็จคงเหลือ',
    icon: 'assets/icons/ic19.webp', accent: '#1E7A6E', accent2: '#BEE9E1', only: ['1001', '1004']
  },
  {
    id: 'recipe', kind: 'hero', goto: 'recipe', title: 'สูตรอาหาร', sub: 'สูตรและอัตราส่วนวัตถุดิบของทุกเมนู',
    kicker: 'ใช้บ่อยที่สุด', meta: 'หุงข้าว · น้ำจิ้ม · ซอส · อาหาร · เครื่องดื่ม · Smoothie', icon: 'assets/icons/ic09.webp',
    accent: '#2FA38F', accent2: '#9CE7DA'
  },
  {
    id: 'leave', kind: 'half', goto: 'leave-sum', title: 'วันลาพนักงาน', sub: 'ปฏิทินวันลาและเช็คอิน',
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
    id: 'grab', kind: 'half', goto: 'grab', title: 'Grab', sub: 'ออเดอร์ · Import ข้อมูล · รายงานผู้บริหาร',
    meta: '3 เมนู', icon: 'assets/icons/ic13.webp', accent: '#C98A2E', accent2: '#FBE2B4'
  },
  {
    id: 'bonus', kind: 'half', goto: 'bonus', title: 'โบนัส', sub: 'เกณฑ์และยอดโบนัสรายเดือน',
    meta: 'คิดถึง 10 ก.ย.', icon: 'assets/icons/ic10.webp', accent: '#D9537F', accent2: '#FBD0DE'
  },
  {
    id: 'equation', kind: 'capsule', goto: 'equation', title: 'ตรวจสอบสมการ Forecast', sub: 'คลังสูตรพยากรณ์ เกณฑ์วัดผล คัดเข้า-คัดออก',
    meta: 'สูตรล็อกไว้ 11 รายการ', glyph: 'check', accent: '#6E9B1F', accent2: '#DCEBAE'
  },
  {
    id: 'accounts', kind: 'capsule', goto: 'accounts', title: 'บัญชีและรหัสผ่าน', sub: 'แก้ PIN เพิ่ม/ลบบัญชีพนักงาน',
    meta: 'อาเฮีย · แม่พัน แก้ได้ทุกคน', glyph: 'gear', accent: '#1E7A6E', accent2: '#BEE9E1'
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
    id: 'songs', kind: 'capsule', goto: 'music', title: 'เพลง', sub: 'เพลย์ลิสต์ประจำร้านและเพลงของทีม',
    meta: 'สร้างเพลย์ลิสต์ · นำเข้าเพลงเองได้', glyph: 'music', accent: '#8A6BD8', accent2: '#D9CBF7'
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
  { id: 'kitchen', label: 'ครัวกลาง' },
  { id: 'condo', label: 'คอนโด' },
  { id: 'all', label: 'สต๊อกรวม' }
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

// ---------- หน้านับสต๊อก (รายการมาจากตาราง kk_count_item ในฐานข้อมูล) ----------

// หมวดของรายการนับ (ต้องตรงกับช่อง grp ในฐาน) — ไอคอนและสีประจำหมวด
export const STOCK_GROUPS = [
  { id: 'เนื้อสัตว์', label: 'เนื้อสัตว์', icon: 'assets/cats/beef.webp', color: '#C1443C', tint: '#FDECEA' },
  { id: 'ผัก', label: 'ผัก', icon: 'assets/cats/veg.webp', color: '#4E9A3E', tint: '#EEF7E9' },
  { id: 'ซอส/เครื่องปรุง', label: 'ซอส/เครื่องปรุง', icon: 'assets/cats/sauce.webp', color: '#C98A2E', tint: '#FDF3E2' },
  { id: 'ข้าว', label: 'ข้าว', icon: 'assets/prep/rice-homali.webp', color: '#B37A45', tint: '#FBF1E5' },
  { id: 'ไข่', label: 'ไข่', icon: 'assets/stock/eggs.webp', color: '#E08A2E', tint: '#FDF1DF' },
  { id: 'เครื่องดื่ม', label: 'เครื่องดื่ม', icon: 'assets/icons/ic07.webp', color: '#3B7FD4', tint: '#EAF2FD' },
  { id: 'บรรจุภัณฑ์', label: 'บรรจุภัณฑ์', icon: 'assets/cats/pack.webp', color: '#8B63C9', tint: '#F4EEFB' },
  { id: 'น้ำเชื่อม', label: 'น้ำเชื่อม', icon: 'assets/som/sy-pandan.webp', color: '#3F7A4F', tint: '#EDF6EB' },
  { id: 'สติ๊กเกอร์', label: 'สติ๊กเกอร์', icon: 'assets/som/pk-sticker-roll.webp', color: '#C79A45', tint: '#FBF2E1' }
];

// รูปสำรองประจำหมวด (ใช้เมื่อรายการนั้นยังไม่ได้จับคู่รูปไว้)
export const STOCK_PHOTO_BY_GROUP = {
  'เนื้อสัตว์': 'assets/cats/beef.webp',
  'ผัก': 'assets/stock/veg-mix.webp',
  'ซอส/เครื่องปรุง': 'assets/stock/house-sauce.webp',
  'ข้าว': 'assets/prep/rice-homali.webp',
  'ข้าวหุง': 'assets/kitchen/rice-homali.webp',
  'ไข่': 'assets/stock/eggs.webp',
  'เครื่องดื่ม': 'assets/stock/beverage.webp',
  'บรรจุภัณฑ์': 'assets/stock/packaging.webp',
  'น้ำเชื่อม': 'assets/som/sy-pandan.webp',
  'สติ๊กเกอร์': 'assets/som/pk-sticker-roll.webp'
};

// รูปประจำรายการนับ (คีย์ = id ในตาราง kk_count_item) รายการที่ไม่ได้ใส่จะใช้รูปประจำหมวด
export const STOCK_PHOTOS = {
  meat_beef_mince: 'assets/prep/meat-beef-mince.webp',
  meat_chicken_mince: 'assets/prep/meat-chicken-mince.webp',
  meat_chicken_soft: 'assets/prep/meat-chicken-breast.webp',
  meat_chicken_tender: 'assets/prep/meat-chicken-tender.webp',
  meat_pork_soft: 'assets/prep/meat-pork-slice.webp',
  meat_pork_mince: 'assets/food/pork-mince.webp',
  meat_salmon: 'assets/prep/meat-salmon.webp',
  meat_hokke: 'assets/prep/meat-hokke.webp',
  meat_duck_mince: 'assets/prep/meat-duck-mince.webp',
  meat_shrimp_mid: 'assets/prep/meat-shrimp-mid.webp',
  meat_shrimp_big: 'assets/prep/meat-shrimp-big.webp',
  veg_basil: 'assets/kitchen/veg-basil.webp',
  veg_garlic: 'assets/kitchen/veg-garlic.webp',
  veg_birdchili: 'assets/kitchen/veg-birdchili.webp',
  veg_spurchili: 'assets/kitchen/veg-spurchili.webp',
  veg_scallion: 'assets/kitchen/veg-scallion.webp',
  veg_celery: 'assets/kitchen/veg-celery.webp',
  veg_carrot: 'assets/kitchen/veg-carrot.webp',
  sauce_kaprao: 'assets/kitchen/sauce-kaprao.webp',
  sauce_multi: 'assets/kitchen/sauce-multi.webp',
  sauce_chilisalt: 'assets/kitchen/sauce-chilisalt.webp',
  sauce_kaprao_boran: 'assets/kitchen/sauce-kaprao-boran.webp',
  sauce_osaka: 'assets/kitchen/sauce-osaka.webp',
  sauce_osaka_veg: 'assets/kitchen/sauce-osaka-veg.webp',
  sauce_osaka_mild: 'assets/kitchen/sauce-osaka-mild.webp',
  sauce_glassnoodle: 'assets/kitchen/sauce-glassnoodle.webp',
  season_chilipaste: 'assets/stock/seasoning.webp',
  season_kikkoman: 'assets/kitchen/season-kikkoman.webp',
  season_msg: 'assets/kitchen/season-msg.webp',
  season_ricebranoil: 'assets/food/oil-bottle.webp',
  season_chinesewine: 'assets/kitchen/season-chinesewine.webp',
  season_sake_cook: 'assets/food/sauce-bottle.webp',
  season_oyster_silver: 'assets/food/sauce-bottle.webp',
  season_oyster_maekrua: 'assets/r9/sauce-bottle.webp',
  rice_riceberry: 'assets/stock/rice-riceberry.webp',
  drink_pandan: 'assets/r9/drink-juice.webp',
  drink_longan: 'assets/r9/drink-longan.webp',
  drink_calamansi: 'assets/r9/drink-orange.webp',
  drink_calamansi_ginger: 'assets/r9/drink-ginger.webp',
  drink_grapetea: 'assets/r9/drink-tea.webp',
  drink_thaitea_pistachio: 'assets/food/tea-bottle.webp',
  drink_thaitea_coconut: 'assets/food/tea-bottle.webp',
  drink_greentea_pistachio: 'assets/r9/drink-tea.webp',
  drink_greentea_coconut: 'assets/r9/drink-tea.webp',
  drink_greentea_oat: 'assets/r9/drink-tea.webp',
  drink_hojicha: 'assets/r9/drink-honey-lemon.webp',
  pkg_box_1: 'assets/food/box-1.webp',
  pkg_box_2: 'assets/food/box-1.webp',
  pkg_box_3: 'assets/food/box-3.webp'
};

// ที่เก็บของที่เลือกได้ตอนเพิ่ม/แก้รายการที่ต้องนับ (ต้องตรงกับค่าในฐาน)
export const STOCK_LOCATIONS = ['ครัวกลาง', 'คอนโด', 'ทั้งสองที่'];

// หน่วยนับที่เลือกได้ตอนเพิ่ม/แก้รายการที่ต้องนับ
export const STOCK_COUNT_UNITS = ['กก.', 'กรัม', 'ฟอง', 'ฟอง/แผง', 'ขวด', 'ใบ', 'ถุง', 'กระสอบ', 'ชิ้น', 'ชุด', 'ม้วน', 'แพ็ค'];

// ปุ่มจัดการรายการที่ต้องนับ (กดแล้วค้างเป็นโหมด แล้วแตะรายการที่ต้องการ)
export const STOCK_ITEM_ACTIONS = [
  { id: 'add', label: 'เพิ่มรายการ', glyph: 'plus', color: '#2FA36B', tint: '#E7F6EE' },
  { id: 'edit', label: 'แก้ไขรายการ', glyph: 'pencil', color: '#E08A2E', tint: '#FDF1DF' },
  { id: 'delete', label: 'ลบรายการ', glyph: 'trash', color: '#E5433B', tint: '#FDEBEA' },
  { id: 'sort', label: 'สลับตำแหน่ง', glyph: 'sort', color: '#4C8FD8', tint: '#EAF3FC' }
];

// ข้อความทั้งหมดของหน้านับสต๊อก ({done} {all} {n} = ช่องเติมตัวเลข)
export const STOCK_COUNT_UI = {
  title: 'นับสต๊อก',
  sumHead: 'ผลนับสต๊อกวันนี้',
  cellAll: 'ต้องนับ',
  cellDone: 'นับแล้ว',
  cellLeft: 'ยังไม่นับ',
  progress: 'กรอกครบ {done} จาก {all} รายการ',
  mine: 'งานของฉัน',
  onlyLeft: 'เฉพาะที่ยังไม่นับ',
  clear: 'ดูทั้งหมด',
  noWork: 'ดูได้ทุกรายการ',
  kitchen: 'ครัวกลาง',
  condo: 'คอนโด',
  counted: 'นับแล้ว',
  notCounted: 'ยังไม่นับ',
  edited: 'รอบันทึก',
  save: 'บันทึกทั้งหมด',
  saving: 'กำลังบันทึก...',
  saved: 'บันทึกผลนับแล้ว {n} รายการ',
  nothing: 'ยังไม่ได้กรอกตัวเลขใหม่',
  loading: 'กำลังโหลดรายการจากฐานข้อมูล...',
  error: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  empty: 'ไม่พบรายการที่ค้นหา',
  search: 'ค้นหารายการที่ต้องนับ...',
  photoPick: 'เลือกรูปสินค้า',
  photoDone: 'เปลี่ยนรูปแล้ว',
  formulaK: 'ครัวกลาง',
  formulaC: 'คอนโด',
  formulaSum: 'สต๊อกรวม',
  condoAuto: 'คอนโด (คิดให้เอง)',
  badSplit: 'ครัวกลางมากกว่าสต๊อกรวม แก้ตัวเลขก่อนบันทึก',
  needTotal: 'ใส่สต๊อกรวมก่อน คอนโดจะคิดให้เอง',
  badSkip: 'ข้าม {n} รายการที่ตัวเลขยังไม่ครบ',
  pickRow: 'แตะรายการที่ต้องการ{label}',
  addTitle: 'เพิ่มรายการที่ต้องนับ',
  editTitle: 'แก้ไขรายการที่ต้องนับ',
  fName: 'ชื่อรายการ',
  fNameHint: 'เช่น อกไก่บด',
  fGrp: 'หมวด',
  fUnit: 'หน่วยนับ',
  fLoc: 'เก็บไว้ที่',
  fJob: 'อยู่ในงานไหน',
  needName: 'ยังไม่ได้ใส่ชื่อรายการ',
  added: 'เพิ่ม "{name}" แล้ว',
  edited2: 'แก้ไข "{name}" แล้ว',
  delAsk: 'ลบรายการนี้ทิ้ง?',
  delText: 'จะไม่แสดงในหน้านับอีก แต่ผลนับเก่ายังเก็บไว้',
  delOk: 'ลบทิ้ง',
  deleted: 'ลบ "{name}" แล้ว',
  moveEnd: 'อยู่สุดทางแล้ว',
  moved: 'สลับตำแหน่งแล้ว'
};

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
  noticeEdit: 'แก้ข้อความประกาศ',
  noticeLabel: 'ข้อความ',
  noticeEmpty: 'ข้อความประกาศว่างไม่ได้',
  noticeFail: 'บันทึกประกาศไม่สำเร็จ ลองใหม่อีกครั้ง',
  noticeSaved: 'บันทึกประกาศแล้ว',
  dateOnly: 'ข้อมูลตัวอย่างรอบนี้มีของวันที่ 10 ก.ย. 2569 เท่านั้น',
  noData: 'ยังไม่มีข้อมูล',
  prep: {
    title: 'แนะนำเตรียมของพรุ่งนี้', sub: 'จัดเตรียมวัตถุดิบล่วงหน้า เพื่อการทำงานที่ราบรื่น',
    rankLabel: 'อันดับ', rankHint: 'เลือกดูครั้งละ 3 อันดับ', cols: ['#', 'วัตถุดิบ', 'ปริมาณ', 'ผู้รับผิดชอบ'],
    of: 'จาก', items: 'รายการ', closed: 'พรุ่งนี้ร้านปิด', unranked: 'รายการแนะนำที่ยังไม่จัดอันดับ',
    basisNote: 'ปริมาณแนะนำจากระบบ • ยังไม่ระบุว่าเป็น "ต้องผลิตเพิ่ม" หรือ "เป้าสต๊อกรวม"',
    liveNote: 'พยากรณ์ด้วยสูตรที่ล็อกไว้ต่อรายการ • คำนวณจากบันทึกใช้จริงถึง {d}'
  },
  rice: {
    title: 'แนะนำปริมาณหุงข้าวพรุ่งนี้', sub: 'พยากรณ์จากที่ขายจริง (สูตรเดียวกับหน้าเตรียมข้าว) เปลี่ยนสูตรได้ที่หน้าสมการ Forecast',
    raw: 'ข้าวดิบ', water: 'น้ำ', kg: 'กก.', liter: 'ลิตร', pot: 'หม้อ', noRecipe: 'ยังไม่ได้ตั้งสูตร', noData: 'ยังไม่มีข้อมูลพอ',
    foot: 'ข้าวดิบ = เฉลี่ยที่ขายจริง 5 วันเปิด กลุ่มวันเดียวกัน (จ–พฤ / ศ–ส) • ต้องกรอกหุง + ข้าวสุกคงเหลือ และตั้งอัตราหุงในหน้าเตรียมข้าวก่อน ระบบถึงคำนวณได้ • น้ำ/หม้อ รอสูตรหุง'
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
    empty: 'ยังไม่มีบันทึกของเหลือ — กรอกได้ที่แท็บ "อาหารปรุงสำเร็จเหลือ" ของหน้าเตรียม-เหลือ',
    estNote: '≈ บาท/เดือน = ประมาณการมูลค่าของเหลือเกิดใหม่ตามต้นทุน ไม่ใช่ยอดที่ทิ้งจริงหรือยอดประหยัด • ตัวเลขจำลอง {d} วันทำการ'
  },
  save: {
    title: 'ลดของเหลือ = ลดต้นทุน', saved: 'เดือนนี้ประหยัดแล้ว', worse: 'เดือนนี้ต้นทุนของทิ้งเพิ่มขึ้น', equal: 'ต้นทุนของทิ้งเท่าช่วงเดือนก่อน',
    compare: 'เทียบช่วงวันที่ {a}–{b} ของเดือนก่อน', prior: 'เดือนก่อน', current: 'เดือนนี้', down: 'ลดลง', up: 'เพิ่มขึ้น',
    chartTitle: 'ต้นทุนของที่ทิ้งจริง (สะสม)', unit: 'บาท',
    note: 'ต้นทุน = ของทิ้งดิบ (หน้าเตรียม) + อาหารปรุงสำเร็จที่ทิ้ง (เทียบเป็นเนื้อ) × ราคาต่อกก. จาก App_money • ไม่นับของเหลือที่เก็บขายต่อ',
    noPrice: 'มี {n} รายการที่ยังไม่มีราคาในระบบ จึงยังไม่นับ'
  },
  sales: {
    title: 'ยอดขายเทียบเป้าหมาย', periodLabel: 'ช่วง',
    periods: [{ id: 'month', label: 'เดือนนี้' }, { id: 'today', label: 'วันนี้' }],
    subMonth: 'ยอดสะสมถึง {d} • เทียบเป้าทั้งเดือน', subToday: 'ยอดขายวันนี้ • เทียบเป้ารายวัน',
    target: 'เป้า', noTarget: 'ยังไม่ตั้งเป้า', updated: 'อัปเดต',
    totalToday: 'ยอดรวมวันนี้', totalMonth: 'ยอดรวมเดือนนี้', dailyTarget: 'เป้าวันละ {v}',
    monthTarget: 'เป้าถึงวันนี้ {v} ({n} วันเปิด) • ทั้งเดือน {m}', share: 'สัดส่วน {p}% ของยอดรวม',
    setBtn: 'ตั้งเป้า', setTitle: 'ตั้งเป้ายอดขายรวมต่อวัน', setLabel: 'เป้ารวมทุกร้าน (บาท/วัน)',
    setSaved: 'บันทึกเป้าแล้ว', setFail: 'บันทึกเป้าไม่สำเร็จ ลองใหม่อีกครั้ง'
  },
  r9: {
    title: 'ส่งพระราม 9', sub: 'จัดส่งวัตถุดิบและซอส สำหรับสาขาพระราม 9',
    month: 'มูลค่าส่งสะสมเดือนนี้', rounds: 'รอบ', roundsLabel: 'จำนวนรอบ', typesLabel: 'ประเภท',
    chartTitle: 'มูลค่าส่งสะสม', unit: 'บาท', detail: 'ดูรายละเอียด'
  }
};

// การ์ดหุงข้าวหน้าหลัก: 3 กลุ่ม × รายการข้าวใน kk_count_item (grp ข้าวหุง)
export const HOME_RICE_GROUPS = [
  { id: 'plain', label: 'ข้าว', photo: 'assets/home/rice-jasmine.webp', items: ['ricecook_homali', 'ricecook_riceberry'] },
  { id: 'chicken', label: 'ข้าวมัน', photo: 'assets/home/rice-chicken.webp', items: ['ricecook_chicken5', 'ricecook_chicken9', 'ricecook_chicken12'] },
  { id: 'fried', label: 'ข้าวผัด', photo: 'assets/home/rice-fried.webp', items: ['ricecook_fried'] }
];

// ---------- หน้าเตรียม-เหลือ ----------

// แท็บหลัก 4 อันของหน้าเตรียม-เหลือ
export const PREP_TABS = [
  { id: 'meat', label: 'เตรียมอาหาร<br>(เนื้อสัตว์)', icon: 'assets/prep/tab-meat.webp' },
  { id: 'rice', label: 'เตรียมข้าว', icon: 'assets/prep/tab-rice.webp' },
  { id: 'forecast', label: 'พยากรณ์', icon: 'assets/prep/tab-forecast.webp' },
  { id: 'fahAll', label: 'อาหารปรุงสำเร็จเหลือ', icon: 'assets/prep/tab-all.webp' }
];

// การ์ดหัวเรื่องของแต่ละแท็บ (มาสคอต + หัวข้อ + คนรับผิดชอบ)
export const PREP_HERO = {
  meat: { title: 'งานเตรียมอาหาร<br>(เนื้อสัตว์)', sub: 'บันทึก เตรียม + เบิกใช้เพิ่ม + ทิ้ง/เสีย + คงเหลือ = ใช้วัตถุดิบ/วัน', people: ['fah', 'emmy', 'ad'] },
  rice: { title: 'งานเตรียมข้าวประจำวัน', sub: 'หุงข้าวดิบ + บันทึกข้าวสุกคงเหลือ + แปลงค่าดิบ/สุก + ดูสถิติย้อนหลัง', people: ['fah', 'emmy', 'ad'] },
  forecast: { title: 'พยากรณ์วัตถุดิบ<br>รายรายการ', sub: 'ช่วยให้คุณเตรียมวัตถุดิบได้พอดี ลดการสูญเสีย และบริหารต้นทุนได้ดีขึ้น', people: ['fah', 'emmy', 'ad'] },
  fahAll: { title: 'อาหารปรุงสำเร็จเหลือ', sub: 'จัดการของเหลือวันนี้ เพื่อพรุ่งนี้ที่ดีกว่า', people: ['fah'] }
};

// ชิปกรองตามผู้รับผิดชอบ (people = รหัสพนักงานใน kk_staff, ว่าง = ทั้งหมด) — เป็นการช่วยหา ไม่ใช่การจำกัดสิทธิ์
export const PREP_FILTERS = {
  meat: [{ id: 'all', label: 'ทั้งหมด', people: [] }, { id: 'fah', label: 'ของฟ้า', people: ['fah'] }, { id: 'ad', label: 'ของอัด+เอมมี่', people: ['ad', 'emmy'] }],
  rice: [{ id: 'all', label: 'ทั้งหมด', people: [] }]
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
    { key: 'extra', label: 'เบิกเพิ่มรวม', unit: 'กก.', icon: 'assets/prep/ic3d-extra.webp', color: '#2F63C9', tint: '#EAF1FD', border: '#CFDDF5', digits: 1 },
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

// หัวตารางเนื้อสัตว์ (3 ช่องกรอกหลัก + ปรุงสุกเหลืออ่านอย่างเดียวจากแท็บอาหารเหลือ)
export const PREP_MEAT_COLS = [
  ['#', ''], ['วัตถุดิบ', '(ผู้รับผิดชอบ)'], ['เตรียม', '(กก.)'], ['เบิกเพิ่ม', '(กก.)'],
  ['ทิ้ง/เสีย', '(กก.)'], ['คงเหลือสด', '(กก.)'], ['ปรุงสุกเหลือ', '(กก.)'], ['ใช้ไปจริง', '(กก.)']
];

// หัวตารางข้าว 3 ตาราง
export const PREP_RICE_COLS = {
  cook: [['#', ''], ['ชนิดข้าว', ''], ['ผู้รับผิดชอบ', ''], ['หุงข้าว', '(กก. ดิบ)'], ['หุงเพิ่ม', 'รอบ 1'], ['หุงเพิ่ม', 'รอบ 2'], ['หุงเพิ่ม', 'รอบ 3'], ['ปริมาณหุงรวม', '(กก. ดิบ)']],
  left: [['#', ''], ['ชนิดข้าว', ''], ['ข้าวเหลือ', '(กก.)'], ['ทิ้ง-เสีย', '(กก.)'], ['ห่อกลับบ้าน', '(กก.)'], ['แจก', '(กก.)'], ['ข้าวเหลือเพื่อเก็บขายต่อ', '(กก.)'], ['เทียบข้าวดิบ', '(กก.)']],
  ratio: [['#', ''], ['ชนิดข้าว', ''], ['อัตราหุง', 'ดิบ 1 กก. ได้สุกกี่ กก.'], ['สถานะ', '']]
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
};

// ---------- หน้าเตรียม-เหลือ: ค่าคงที่ของการบันทึกลงฐาน ----------

// ช่องบนจอ → ประเภทแถวในตาราง kk_prep_log / kk_cooked_leftover
export const PREP_ENTRY = {
  meat: { prep: 'เตรียม', extra: 'เบิกเพิ่ม', waste: 'ทิ้ง', left: 'คงเหลือ' },
  rice: { cook: 'หุง', r: 'หุงเพิ่ม', left: 'คงเหลือสุก', waste: 'ทิ้ง', home: 'ห่อกลับบ้าน', give: 'แจก' },
  fah: { left: 'เหลือ', waste: 'ทิ้ง', self: 'กินเอง', home: 'ห่อกลับบ้าน' }
};

// หมวดแสดงผลของเนื้อสัตว์แต่ละรายการ (id ใน kk_count_item → กลุ่มบนจอ)
export const PREP_GROUP_OF = {
  meat_chicken_mince: 'chicken', meat_chicken_soft: 'chicken', meat_chicken_tender: 'chicken',
  meat_pork_soft: 'meat', meat_pork_mince: 'meat', meat_beef_mince: 'meat', meat_duck_mince: 'meat',
  meat_salmon: 'sea', meat_hokke: 'sea', meat_shrimp_mid: 'sea', meat_shrimp_big: 'sea'
};

// รูปประจำเมนู (id ใน kk_menu)
export const MENU_PHOTOS = {
  'kaprao-chicken-mince': 'assets/dishes/dish-kaprao-chicken-mince.webp',
  'kaprao-chicken-soft': 'assets/dishes/dish-kaprao-chicken-soft.webp',
  'kaprao-pork-slice': 'assets/dishes/dish-kaprao-pork-slice.webp',
  'kaprao-beef': 'assets/dishes/dish-kaprao-beef.webp',
  'kaprao-duck': 'assets/dishes/dish-kaprao-duck.webp',
  'kaprao-salmon': 'assets/dishes/dish-kaprao-salmon.webp',
  'larb-salmon': 'assets/dishes/dish-larb-salmon.webp',
  'kaprao-shrimp': 'assets/dishes/dish-kaprao-shrimp.webp',
  'shrimp-garlic': 'assets/dishes/dish-shrimp-garlic.webp',
  'chicken-jimjaew': 'assets/dishes/dish-chicken-jimjaew.webp',
  'chicken-teriyaki': 'assets/dishes/dish-chicken-teriyaki.webp',
  'pork-osaka': 'assets/dishes/dish-pork-osaka.webp'
};

// ข้อความของแถบวันที่ทำงาน (ใช้ร่วมทุกหน้าที่มีแถบวันที่ — แก้ที่นี่ที่เดียว)
export const DATE_UI = {
  today: 'วันนี้',
  past: 'ย้อนหลัง {n} วัน',
  future: 'ล่วงหน้า {n} วัน',
  band: 'กำลังกรอกข้อมูลของวันที่ {d} ({s})',
  back: 'กลับมาวันนี้',
  farTitle: 'วันที่ไกลจากวันนี้มาก',
  farText: 'แน่ใจนะว่าเป็นวันที่ {d}?',
  farOk: 'ยืนยันวันที่นี้'
};

// ข้อความทั้งหมดของหน้าเตรียม-เหลือ (ส่วนที่เพิ่มรอบนี้)
export const PREP_UI = {
  loading: 'กำลังโหลดข้อมูลจากฐาน...',
  loadError: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  retry: 'ลองใหม่',
  saveError: 'บันทึกไม่สำเร็จ ตัวเลขเดิมยังอยู่ ลองใหม่อีกครั้ง',
  histRev: 'ครั้งที่ {n}',
  histCur: '← ใช้อยู่',
  histClose: 'ปิด',
  histBadge: 'แก้แล้ว {n} ครั้ง · กดดูประวัติ',
  rec: 'แนะนำ —',
  recLabel: 'ควรเตรียม',
  recRiceLabel: 'ควรหุง (ดิบ)',
  recNone: 'ยังไม่มีข้อมูลพอพยากรณ์',
  recSat: 'เสาร์ห้ามเผื่อ',
  recOff: 'ยังไม่เปิดใช้การแนะนำปริมาณ',
  cookedNote: 'คงเหลืออาหารปรุงสำเร็จ (เทียบเป็นวัตถุดิบสด) มาจากแท็บบันทึกอาหารเหลือของวันเดียวกัน',
  stockCounted: 'สต๊อกครัวกลาง: มีนับจริง {d} = {q} กก. (ยึดยอดนับ)',
  stockEst: 'สต๊อกครัวกลาง ≈ {r} กก. (นับล่าสุด {d} = {q} − ใช้ไปเบื้องต้น)',
  stockWarn: 'ตัวเลขไม่ตรงกัน: คงเหลือสดมากกว่ายอดนับสต๊อกวันเดียวกัน',
  noRatio: 'ยังไม่ได้ตั้งอัตราหุง',
  ratioOk: 'ใช้คำนวณได้',
  riceCheck: 'ผลรวมเทียบดิบไม่เท่าข้าวดิบที่ใช้ (คลาดเกิน 0.02 กก.) ตรวจตัวเลขอีกครั้ง',
  noData: 'ยังไม่มีข้อมูล',
  fcOffTitle: 'พยากรณ์ยังไม่เปิดใช้งาน',
  fcOffText: 'รอข้อมูลใช้จริงสะสมจากหน้านี้ก่อน แล้วจึงเปิดการพยากรณ์ในรอบถัดไป ระหว่างนี้ไม่แสดงตัวเลขคาดการณ์ใดๆ',
  noMenu: 'ยังไม่ได้ใส่รายการเมนู',
  boundNote: 'แปลงเป็นเนื้อสัตว์ได้ {x} รายการ จาก {y} เมนูที่กรอกแล้ว',
  unboundHead: 'เมนูที่ยังไม่ผูกเนื้อสัตว์/อัตราส่วน (ไม่ถูกนำมารวม):',
  assumeTitle: 'Assumption · สูตรคำนวณใช้ไปจริง',
  assumeCookedLabel: 'อาหารปรุงสุก 1 กรัม เทียบเท่าวัตถุดิบสด (กรัม)',
  assumeStockNote: 'ยอดตัดสต๊อก = เตรียม + เบิกเพิ่ม − คงเหลือสด (ของทิ้งถือว่าออกจากสต๊อกแล้ว · ไม่หักอาหารปรุงสุกเหลือ) และถูกนำไปหักจากสต๊อกครัวกลาง — ถ้ามีการนับสต๊อกหลังจากนั้น ระบบยึดยอดนับจริงแทน',
  assumeMenuTitle: 'Assumption · แปลงเมนู → เนื้อสัตว์',
  assumeMenuEq: 'คงเหลือใช้ต่อ = เหลือ − ทิ้ง/เสีย − กินเอง − ห่อกลับบ้าน · น้ำหนักเนื้อ (ก.) = คงเหลือใช้ต่อ × อัตราส่วน',
  assumeNoProtein: '— ยังไม่เลือก —',
  assumeRiceTitle: 'Assumption · อัตราหุงข้าวแต่ละชนิด (แก้ได้)',
  convTitle: 'แปลงเป็นวัตถุดิบ (หักในแท็บเตรียมอาหารวันเดียวกัน)',
  convEmpty: 'ยังไม่มีเมนูที่กรอกของเหลือและผูกเนื้อสัตว์ครบ',
  weekTitle: 'สถิติของเหลือ 7 วันย้อนหลัง (เฉพาะช่อง "เหลือ")',
  statsTitle: 'สถิติข้าว 7 วันย้อนหลัง (คิดเฉพาะชนิดที่ตั้งอัตราหุงแล้ว)',
  copyPrev: 'คัดลอกจากวันก่อนหน้า',
  copyNone: 'ยังไม่มีวันที่เคยกรอกไว้ให้คัดลอก',
  copyDrafted: 'ดึงค่าของ {d} มาเป็นร่างแล้ว กดยืนยันทีละแถว',
  draftUse: 'ใช้ {v} ✓',
  satNote: 'วันเสาร์ห้ามเผื่อ — อาทิตย์ร้านปิด อาหารสุกยกข้ามวันไม่ได้ (แนะเป้าใช้ค่าพยากรณ์ตรงๆ ไม่ใช่ขอบบน)'
};

// ---------- พยากรณ์: สูตรที่เคยล็อกไว้ต่อรายการ ----------
// เลิกใช้ในการคำนวณแล้ว — ทุกหน้าคำนวณจาก kk_forecast_model_map เก็บบล็อกนี้ไว้เทียบเท่านั้น (หน้าพยากรณ์เตือนถ้าสูตรต่างจากที่เคยใช้)
export const FORECAST_MODELS = {
  meat_chicken_mince: { kind: 'weekday_mean', label: 'weekday_mean — เฉลี่ยวันเดียวกันในสัปดาห์' },
  meat_salmon: { kind: 'ema', alpha: 0.2, label: 'EMA α 0.2' },
  meat_chicken_soft: { kind: 'ma', n: 6, label: 'MA6 — เฉลี่ย 6 วันเปิดล่าสุด' },
  meat_beef_mince: { kind: 'ma', n: 3, label: 'MA3 — เฉลี่ย 3 วันเปิดล่าสุด' },
  meat_shrimp_mid: { kind: 'ma', n: 6, label: 'MA6 — เฉลี่ย 6 วันเปิดล่าสุด' },
  meat_chicken_tender: { kind: 'ratio_theo', n: 6, label: 'ratio_theo6 — รอข้อมูลยอดขายแปลงสูตร' },
  meat_pork_soft: { kind: 'blend', alpha: 0.3, label: 'blend 0.5×EMA0.3 + 0.5×ratio_theo — รอข้อมูลยอดขาย' },
  meat_duck_mince: { kind: 'ema', alpha: 0.5, label: 'EMA α 0.5' },
  meat_shrimp_big: { kind: 'mean_last', n: 2, label: 'เฉลี่ย 2 วันเปิดล่าสุด' },
  meat_hokke: { kind: 'const', v: 0.7, label: 'ค่าคงที่ 0.7 กก.' },
  meat_pork_mince: { kind: 'none', label: 'ยังไม่กำหนดสูตร' }
};

// ข้อความแท็บพยากรณ์ (หน้าแสดงผล ไม่มีการกรอก)
export const PREP_FC_UI = {
  kpi: { count: 'จำนวนวัตถุดิบ<br>ที่ติดตาม', accuracy: 'ความแม่นยำ<br>(อยู่ในกรอบ)', days: 'ช่วงกราฟย้อนหลัง', date: 'วันที่พยากรณ์' },
  insufficient: 'ข้อมูลยังไม่พอ',
  tableTitle: 'พยากรณ์การใช้วัตถุดิบ (รายรายการ)',
  cols: [['#', ''], ['รายการ', '(สูตรจาก kk_forecast_model_map)'], ['เฉลี่ย 6 วัน', '(กก.)'], ['พยากรณ์', '(กก.)'], ['ต่ำสุด', '(กก.)'], ['สูงสุด', '(กก.)'], ['แนวโน้ม', ''], ['WAPE', '(%)'], ['ย้อนหลัง 10 วัน', '']],
  status: {
    insufficient: 'ข้อมูลยังไม่พอ',
    no_band: 'รอ residual ครบ 8 ค่าเพื่อคำนวณกรอบ',
    no_theo: 'ยังไม่มียอดขายของวันเปิดก่อนหน้า (theo_kg) ให้สูตรยอดขายใช้',
    no_model: 'ยังไม่กำหนดสูตร',
    no_formula: 'ไม่พบสูตรที่ผูกไว้ในคลังสูตร',
    no_fixed: 'ตั้งเป็นเตรียมคงที่ แต่ยังไม่ได้ใส่ปริมาณ',
    map_later: 'สูตรของรายการนี้ถูกตั้งหลังวันที่เลือก จึงไม่รู้สูตร ณ วันนั้น',
    rice_unsupported: 'ยังไม่รองรับการพยากรณ์ข้าว (ยังไม่มีข้อมูลข้าวและวิธีแปลงข้าวสาร-ข้าวสุก)',
    no_ctx: 'โหลดข้อมูลพยากรณ์ไม่ครบ',
    no_fallback: 'ยังพยากรณ์ไม่ได้ (สูตรที่ตั้งไว้คำนวณไม่ได้ และไม่มีสูตรสำรองที่ผ่านการทดสอบ)',
    cfg_bad: 'ค่ากฎในฐานหาย/ผิดชนิด คำนวณไม่ได้',
    error: 'คำนวณรายการนี้ผิดพลาด'
  },
  fixedTag: 'เตรียมคงที่',
  accBand: 'กรอบ {b}',
  salesWarn: 'หลักฐานเดิมของสูตรนี้มาจากการรู้ยอดขายวันเดียวกัน ต้องทดสอบใหม่ก่อนเชื่อ (ตอนนี้คำนวณแบบล่วงหน้าด้วยยอดขายวันเปิดก่อนหน้า)',
  salesHead: 'สูตรยอดขายต้องทดสอบใหม่:',
  carryStale: 'คงเหลือที่ใช้หักเป็นของวันที่ {d} อาจเก่าเกินไป',
  carryNoCooked: 'ยังไม่รวมอาหารสุกที่ยกมา (วันเปิดก่อนหน้ายังไม่บันทึกคงเหลือใช้ต่อ)',
  modelDiff: 'สูตรต่างจากที่เคยใช้: เดิม {old} → ตอนนี้ (kk_forecast_model_map) {now}',
  fallback: 'สูตรที่ตั้งไว้ {set} คำนวณไม่ได้ ({why}) จึงใช้สูตรสำรอง {used} (ผ่านการทดสอบ {from}–{to} win rate {win}% กรอบ {band})',
  noFallback: 'สูตรที่ตั้งไว้ {set} คำนวณไม่ได้ ({why}) และไม่มีสูตรสำรองที่ผ่านการทดสอบกับวัตถุดิบนี้ในกรอบเดียวกัน — ยังพยากรณ์ไม่ได้',
  needDaysOf: 'มีข้อมูล {n} วัน ต้องการอย่างน้อย {need} วัน',
  cfgBad: 'ค่ากฎในตาราง kk_forecast_config หายหรือผิดชนิด จึงคำนวณส่วนนี้ไม่ได้: {keys}',
  liveHead: 'ความแม่นยำใช้จริง (จาก kk_forecast_daily)',
  liveLoading: 'กำลังเติมผลจริงและคำนวณความแม่นยำใช้จริง...',
  liveNone: 'ยังไม่มีผลใช้จริง (kk_forecast_daily ยังไม่มีแถวที่มีผลจริง)',
  liveNotEnough: 'นับคะแนนได้ {n} วัน ข้อมูลยังไม่พอ (ต้องมี ≥{d} วัน)',
  liveWin: 'win rate {w}% จาก {n} วันที่นับคะแนนได้ · กรอบ = ช่วงล่าง–บนที่ออกผลไว้ของแต่ละวัน',
  liveErr: 'คลาดเคลื่อนเฉลี่ย {avg} กก. · สูงสุด {max} กก.',
  liveWape: 'WAPE',
  liveFail: 'บันทึก/เติมผลใช้จริงไม่สำเร็จ ตัวเลขด้านล่างอาจยังไม่รวมวันล่าสุด',
  liveLoadFail: 'โหลดผลใช้จริงไม่สำเร็จ',
  liveNoBand: 'ยังไม่มีกรอบ จึงบันทึกผลพยากรณ์ใช้จริงไม่ได้: {names}',
  liveSaved: 'บันทึกผลพยากรณ์ของ {d} ใหม่ {n} รายการ (รายการที่เคยบันทึกไว้แล้วไม่ถูกแก้)',
  liveTrace: 'ตาราง kk_forecast_daily ไม่มีช่องเก็บรหัสสูตร พารามิเตอร์ และวันตัดข้อมูล การตรวจย้อนกลับว่าวันนั้นใช้สูตรอะไรจึงทำได้เท่าที่โครงตารางรองรับ',
  backHead: 'ผลทดสอบย้อนหลัง (walk-forward จาก evalFormula · ไม่ใช่ความแม่นยำใช้จริง)',
  backCols: ['รายการ', 'วันนับคะแนน', 'win rate', 'WAPE'],
  itemCols: ['รายการ', 'วันนับคะแนน', 'win rate', 'WAPE', 'คลาดเฉลี่ย', 'คลาดสูงสุด'],
  trends: {
    up: { label: 'ขึ้น', arrow: '↗', color: '#E0453C', tint: '#FDECEA' },
    down: { label: 'ลง', arrow: '↘', color: '#1E7A3C', tint: '#EAF6EC' },
    flat: { label: 'คงที่', arrow: '→', color: '#3B8BE0', tint: '#EAF3FD' }
  },
  rules: 'กติกา: วัดผลเฉพาะวันที่ทำนายล่วงหน้าจริง · กรอบตามที่ตั้งรายวัตถุดิบใน kk_forecast_model_map (ไม่ได้ตั้ง = ค่ากลาง ±{band}SD หรือ ±{pct}%) · กรอบ SD คิดจาก residual {sd} ค่าล่าสุด (ต้อง ≥{min} ค่า) · สูตรยอดขายใช้ยอดขายวันเปิดก่อนหน้าเท่านั้น · ความแม่นยำ/WAPE ต้องมี ≥{days} วัน · ข้ามวันที่ไม่มีข้อมูล ห้ามเติมค่าแทน · ไม่นับวันอาทิตย์ · กฎทุกข้อแก้ได้ที่หน้า "ตั้งค่ากฎการทดสอบ"',
  needDays: 'ต้องมีวันวัดผล ≥{days} วัน'
};

// หน้าตรวจสอบสมการ Forecast (เกณฑ์จากสเปกคลังสูตร)
export const EQ_UI = {
  title: 'สมการ Forecast',
  sub: 'คลังสูตรพยากรณ์ · ผลวัดจากข้อมูลจริง · เกณฑ์คัดเข้า-คัดออก',
  regTitle: 'สูตรที่ล็อกไว้ (ใช้งานจริง)',
  measureTitle: 'ผลวัดความแม่นยำปัจจุบัน (walk-forward จากบันทึกจริง)',
  measureCols: ['รายการ', 'วันวัดผล', 'อัตราถูก', 'WAPE'],
  sections: [
    { head: 'การวัดผลทุกสูตร (ต่อสูตร ต่อวัตถุดิบ)', items: [
      'ถูก = ใช้จริงอยู่ในกรอบล่าง–สูง (รวมค่าเท่าขอบพอดี) · ผิด = นอกกรอบ',
      'ขนาดความเสียหาย = |ใช้จริง − พยากรณ์| เต็มจำนวน ไม่ใช่แค่ระยะที่เลยขอบ',
      'ต้องมีอย่างน้อย 20 วันต่อวัตถุดิบจึงตัดสิน · ห้ามรายงาน MAPE รวมทุกวัตถุดิบ',
      'ต้องแยกช่วงเลือกสูตรกับช่วงวัดผลเสมอ ห้ามเลือกและวัดจากข้อมูลชุดเดียวกัน'
    ] },
    { head: 'เกณฑ์คัดออก (เข้าข้อใดข้อหนึ่ง · ห้ามคัดสูตรใช้งานจริง/ตัวเทียบ)', items: [
      'อัตราถูกต่ำกว่าตัวเทียบ "เตรียมคงที่" → คัดออกทันที',
      'อัตราถูก < 85% ที่กรอบ 2SD ติดกัน 2 รอบ',
      'มูลค่าความเสียหายสูงกว่าสูตรใช้งานจริงเกิน 50% ติดกัน 2 รอบ'
    ] },
    { head: 'เกณฑ์ขึ้นเป็นสูตรใช้งานจริง (ต้องครบ 3 ข้อ · เปลี่ยนได้เฉพาะตอนจบรอบ)', items: [
      'อัตราถูกสูงกว่าสูตรปัจจุบัน', 'มูลค่าความเสียหายต่ำกว่า', 'ชนะติดกัน 2 รอบขึ้นไป'
    ] },
    { head: 'วิธีสร้างสูตรใหม่ (ใช้ได้ 4 วิธีเท่านั้น)', items: [
      'ขยับพารามิเตอร์: top-3 ปรับ α ±0.05/0.1 หรือวันย้อนหลัง ±1–3 วัน',
      'ผสมสูตร: 2 สูตรที่ดีสุด ถ่วงน้ำหนัก 0.3 / 0.5 / 0.7',
      'ชั้นแก้อคติ: residual เฉลี่ยตามวัน (28 วัน) เกิน 0.3 กก. และทางเดียวกัน >70% → สูตรเดิม + ค่าแก้',
      'บีบกรอบ: อัตราถูก >97% ติดกัน 2 รอบ → บีบกรอบลง 0.25SD'
    ] },
    { head: 'ข้อห้าม', items: [
      'ห้ามใช้ข้อมูลอนาคต · พารามิเตอร์ไม่เกิน 3 ตัว · ย้อนหลังไม่เกิน 60 วันเปิด',
      'สูตรใหม่ต้องชนะตัวเทียบในช่วงทดสอบก่อนเข้าคลัง',
      'ทดสอบพร้อมกันไม่เกิน 8 สูตร · ต้องมีอย่างน้อย 3 สายจาก 4 สาย (เฉลี่ย / EMA / ยอดขาย / วันในสัปดาห์)'
    ] },
    { head: 'ป้ายสถานการณ์ (ประเมินใหม่ทุกรอบจากผลจริง)', items: [
      'ยอดนิ่ง · ยอดผันผวนแรง · มีแนวโน้มชัด · ยกข้ามวันได้/ไม่ได้ · ของแพงพลาดแล้วเสียหายมาก'
    ] }
  ],
  noteNow: 'ตอนนี้คลังมีเฉพาะสูตรใช้งานจริงที่ล็อกไว้ การคัดเข้า-คัดออกจะเริ่มเมื่อข้อมูลใช้จริงสะสมครบ 20 วันต่อวัตถุดิบ'
};

// ---------- หน้าสมการ Forecast แบบอ่านง่าย (เปิดมาเจอหน้านี้ก่อน) ----------
export const EQ_SIMPLE = {
  good: 70, ok: 50,   // % แม่น: ตั้งแต่ good = ดี · ตั้งแต่ ok = พอใช้ · ต่ำกว่า = ควรเปลี่ยน
  betterBy: 5,        // สูตรอื่นต้องแม่นกว่าสูตรที่ใช้อยู่อย่างน้อยกี่ % ถึงจะแนะนำให้เปลี่ยน
  modes: [{ id: 'simple', label: 'แบบง่าย' }, { id: 'detail', label: 'แบบละเอียด' }],
  groups: [{ grp: 'เนื้อสัตว์', label: 'เนื้อสัตว์' }, { grp: 'ข้าวหุง', label: 'ข้าว' }],
  introHead: 'แต่ละวัตถุดิบใช้สูตรอะไร แม่นแค่ไหน',
  intro: 'ระบบใช้สูตรคำนวณ 1 สูตรต่อวัตถุดิบ เพื่อแนะนำว่าควรเตรียมเท่าไหร่ "แม่น" คือวันที่ใช้จริงตกอยู่ในช่วงที่ระบบแนะนำ',
  introEg: 'ตัวอย่าง: แนะนำ 5–7 กก. แล้ววันนั้นใช้จริง 6 กก. = แม่น',
  pill: { good: 'แม่นดี', ok: 'พอใช้', bad: 'ควรเปลี่ยนสูตร', wait: 'กำลังเก็บข้อมูล' },
  nowLabel: 'สูตรที่ใช้อยู่',
  noFormula: 'ยังไม่ได้ตั้งสูตร',
  backSub: 'แม่น (ทดสอบย้อนหลัง {n} วัน)',
  noBack: 'ยังไม่มีข้อมูลย้อนหลัง',
  liveSub: 'แม่นจริง (ใช้งานจริง {n} วัน)',
  noLive: 'เริ่มเก็บผลใช้จริงแล้ว',
  checking: 'กำลังเทียบกับสูตรอื่น...',
  betterHead: 'มีสูตรที่แม่นกว่า',
  betterLine: 'แม่น {w}% จาก {n} วัน (ดีกว่าเดิม +{d}%)',
  bestNow: 'สูตรนี้แม่นที่สุดแล้วในตอนนี้',
  notEnough: 'ข้อมูลยังน้อย ยังตัดสินไม่ได้ว่าสูตรไหนดีกว่า',
  useBtn: 'ใช้สูตรนี้แทน',
  pickBtn: 'เปลี่ยนสูตรเอง',
  pickTitle: 'เลือกสูตรให้ {item}',
  pickScore: 'แม่น {w}% ({n} วัน)',
  noScore: 'ยังวัดผลไม่ได้',
  daysTitle: 'ย้อนหลังกี่วันเปิด',
  daysLabel: 'จำนวนวันเปิดที่เอามาเฉลี่ย (กลุ่มวันเดียวกัน)',
  daysName: 'เฉลี่ย {n} วันเปิด กลุ่มวันเดียวกัน (จ–พฤ / ศ–ส)',
  daysEq: 'จ–พฤ: เฉลี่ยใช้จริง {n} วันเปิดล่าสุดที่เป็น จ–พฤ · ศ–ส: เฉลี่ย {n} วันเปิดล่าสุดที่เป็น ศ–ส',
  askTitle: 'เปลี่ยนสูตรของ {item}?',
  askText: 'จาก "{from}" เป็น "{to}" · มีผลกับค่าแนะนำตั้งแต่วันนี้',
  saved: 'เปลี่ยนสูตรแล้ว',
  saveErr: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง',
  conflict: 'มีคนเปลี่ยนสูตรนี้จากเครื่องอื่นก่อน โหลดใหม่แล้วลองอีกครั้ง',
  empty: 'ยังไม่มีวัตถุดิบที่ตั้งสูตรในกลุ่มนี้',
  foot: 'ตัวเลขทดสอบย้อนหลัง = ลองเอาสูตรไปทายวันในอดีตทีละวัน · ตัวเลขใช้จริง = ค่าที่ระบบแนะนำจริงแล้วเทียบกับที่ใช้จริง (เชื่อได้มากกว่า)'
};

// ---------- หน้าสมการ Forecast: แท็บย่อย 4 หน้า ----------
export const EQ_TABS = [
  { id: 'overview', label: 'ภาพรวม', glyph: 'check' },
  { id: 'lab', label: 'ห้องทดสอบ', glyph: 'chart' },
  { id: 'lib', label: 'คลังสูตร', glyph: 'layers' },
  { id: 'cfg', label: 'ตั้งค่ากฎ', glyph: 'gear' }
];

// คำแปลที่ใช้ร่วมกันทุกหน้าของสมการ Forecast
export const FC_FAMILY_TH = { mean: 'เฉลี่ย', ema: 'EMA', weekday: 'วันในสัปดาห์', sales: 'ยอดขาย', trend: 'แนวโน้ม', control: 'ตัวเทียบ' };
export const FC_STATUS_TH = { live: 'ใช้งานจริง', testing: 'กำลังทดสอบ', bench: 'สำรอง', dropped: 'ถูกคัดออก', control: 'ตัวเทียบ' };
export const FC_VERDICT_TH = { pass: 'ผ่าน', fail: 'ไม่ผ่าน', inconclusive: 'ข้อมูลยังไม่พอ' };
export const FC_SOURCE_TH = { seed: 'ตั้งต้น', mutate: 'ขยับพารามิเตอร์', combine: 'ผสมสูตร', bias_correct: 'แก้อคติ', band_adjust: 'บีบกรอบ', manual: 'เพิ่มเอง' };
export const FC_REGIME_TH = {
  growth: { label: 'ขาขึ้น', arrow: '↗', color: '#D4322A', tint: '#FDECEA' },
  stable: { label: 'ทรงตัว', arrow: '→', color: '#2F63C9', tint: '#EAF1FD' },
  decline: { label: 'ขาลง', arrow: '↘', color: '#1E7A3C', tint: '#EAF6EC' }
};

// หน้าห้องทดสอบสูตร รายวัตถุดิบ
export const EQ_LAB_UI = {
  sub: 'เอาทุกสูตรมาแข่งกันบนวัตถุดิบตัวเดียวกัน วัดผลเดินวันต่อวันจากข้อมูลจริง',
  pickItem: 'เลือกวัตถุดิบ',
  stateHead: 'สภาพปัจจุบันของวัตถุดิบ',
  stats: [['เฉลี่ยใช้จริง 6 วัน', 'กก.'], ['ความแกว่ง (SD)', 'กก.'], ['วันที่มีข้อมูล', 'วัน'], ['สถานการณ์ตอนนี้', '']],
  liveHead: 'สูตรที่ใช้จริงกับวัตถุดิบนี้',
  fixedModel: 'เตรียมคงที่ (ไม่พยากรณ์)',
  noLive: 'ยังไม่ได้ตั้งสูตรใช้จริง',
  subtabs: [['kg', 'ตารางปริมาณ'], ['baht', 'ตารางมูลค่า'], ['chart', 'กราฟเทียบสูตร']],
  cols: ['รหัสสูตร', 'ชื่อสูตร', 'กลุ่ม', 'วันทดสอบ', 'win rate', 'ครั้งที่แพ้', 'แพ้เยอะสุด', 'แพ้เฉลี่ย', 'แพ้น้อยสุด', 'แพ้รวม', 'กรอบเฉลี่ย', 'สถานะ'],
  colUnits: ['', '', '', 'วัน', '%', 'ครั้ง', 'กก.', 'กก.', 'กก.', 'กก.', 'กก.', ''],
  bahtCols: ['รหัสสูตร', 'ชื่อสูตร', 'แพ้เฉลี่ย/ครั้ง', 'แพ้รวมทั้งช่วง', 'แพ้รวมต่อเดือน'],
  noPrice: 'ไม่มีราคาต่อกิโลของวัตถุดิบนี้ในฐาน จึงคิดเป็นเงินไม่ได้',
  priceHead: 'ราคาต่อกิโล',
  chartHint: 'เลือกสูตรจากตารางปริมาณได้สูงสุด 3 สูตร แล้วกลับมาดูกราฟ',
  chartEmpty: 'ยังไม่ได้เลือกสูตร — ติ๊กช่องหน้าแถวในตารางปริมาณก่อน',
  chartLegend: 'ใช้จริง',
  btnLive: 'ตั้งเป็นสูตรใช้จริงของวัตถุดิบนี้',
  btnSave: 'บันทึกผลการทดสอบ',
  liveAsk: { title: 'ตั้งเป็นสูตรใช้จริง?', ok: 'ตั้งสูตรนี้' },
  liveNeedOne: 'ติ๊กเลือกสูตรที่จะตั้งเป็นสูตรใช้จริง 1 สูตร',
  liveDone: 'ตั้ง {c} เป็นสูตรใช้จริงของ {n} แล้ว',
  savedTrials: 'บันทึกผลทดสอบ {n} แถวลงฐานแล้ว',
  saveErr: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง',
  max3: 'เลือกเทียบกราฟได้สูงสุด 3 สูตร',
  srcHead: 'ข้อมูลที่ใช้ทดสอบ',
  runHead: 'ตั้งค่าการทดสอบรอบนี้ (เลือกเองทุกค่า)',
  fromLabel: 'นับคะแนนตั้งแต่',
  toLabel: 'ถึง',
  bandTypeLabel: 'ชนิดกรอบ',
  bandValueLabel: 'ขนาดกรอบ',
  runBtn: 'เริ่มทดสอบ',
  runNeed: 'กดปุ่ม "เริ่มทดสอบ" เพื่อรันทุกสูตรด้วยค่าที่เลือก',
  runBadRange: 'เลือกช่วงวันที่ให้ถูกต้อง (วันเริ่มต้องไม่หลังวันสิ้นสุด)',
  runBadBand: 'ใส่ขนาดกรอบเป็นตัวเลขมากกว่า 0',
  commonDays: 'นับคะแนนบนชุดวันเดียวกันทุกสูตร {n} วัน ({from} – {to})',
  noneFormulas: 'สูตรที่คำนวณไม่ได้ในช่วงนี้ (ไม่นำมาหาชุดวันร่วม): {codes}',
  prevTrial: 'เคยทดสอบ {d}: {v}',
  reuseNote: 'kk_forecast_trial ไม่มีช่องเก็บพารามิเตอร์และค่ากฎ จึงตรวจไม่ได้ว่าผลเก่าตรงกับรอบนี้ทุกข้อ — ทุกสูตรถูกทดสอบใหม่เสมอ ผลเก่าแสดงไว้ดูเท่านั้น',
  priceNote: 'ราคาต่อกิโลอ่านจาก kk_count_item ผ่าน ingredient_id (kk_count_item ไม่มีช่องราคาเอง)',
  mapChanged: 'สูตรของวัตถุดิบนี้ถูกแก้ไปแล้วจากที่อื่น ยกเลิกการบันทึก กรุณาโหลดใหม่',
  srcOpts: [['all', 'รวมกัน'], ['cleaned_v2', 'ข้อมูลเดิม'], ['app_live', 'ข้อมูลใหม่จากแอป']],
  srcMixNote: 'ข้อมูลเดิม (cleaned_v2) กับข้อมูลใหม่ (app_live) คิดยอดใช้จริงต่างกัน: ข้อมูลเดิมไม่ได้หักอาหารปรุงสำเร็จเหลือและไม่ได้บวกคงเหลือใช้ต่อ',
  srcAdvise: 'ข้อมูลใหม่ของวัตถุดิบนี้มีครบ {n} วันแล้ว (ขั้นต่ำ {d} วัน) ควรทดสอบสูตรใหม่บนข้อมูลใหม่อย่างเดียว',
  bandHead: 'กรอบที่ใช้วัดผล',
  bandSrc: { formula: 'ของสูตรเอง', item: 'ตั้งรายวัตถุดิบ', config: 'ค่ากลาง', lab: 'เลือกเองในรอบนี้' },
  regBefore: 'สถานการณ์ก่อนช่วงทดสอบ (ใช้บันทึกในผลทดสอบ): {r}',
  nowcastTag: 'รู้ยอดขายแล้ว (nowcast)',
  nowcastNote: 'แถวที่ติดป้าย "รู้ยอดขายแล้ว" ใช้ยอดขายของวันที่ทำนายเอง เป็นการประมาณหลังรู้ยอดขาย ไม่นับเป็นความแม่นยำล่วงหน้า ตั้งเป็นสูตรใช้จริงและบันทึกผลไม่ได้',
  nowcastLive: 'สูตรแบบรู้ยอดขายแล้วตั้งเป็นสูตรใช้จริงไม่ได้ เลือกสูตรโหมดล่วงหน้าแทน',
  nowcastSkip: 'ข้ามสูตรแบบรู้ยอดขายแล้ว {n} แถว ไม่บันทึกเป็นผลทดสอบ',
  foot: 'ทุกคอลัมน์เป็นปริมาณหน่วยกิโลกรัม · แพ้รวมต่อเดือนคิดจาก {r} วันเปิดต่อรอบ · แถวที่วันทดสอบไม่ถึง {d} วัน = ข้อมูลยังไม่พอ ไม่ตัดสิน'
};

// หน้าคลังสูตร และประวัติการทดสอบ
export const EQ_LIB_UI = {
  sub: 'ทุกสูตรที่มี · เคยทดสอบแล้วผลเป็นยังไง · สูตรไหนเหมาะกับสถานการณ์ไหน',
  sums: [['ทั้งหมด', 'all'], ['ใช้งานจริง', 'live'], ['กำลังทดสอบ', 'testing'], ['สำรอง', 'bench'], ['ถูกคัดออก', 'dropped'], ['ตัวเทียบ', 'control']],
  filterHeads: ['กลุ่มสูตร', 'สถานะ', 'สถานการณ์ที่เหมาะ', 'ผลล่าสุด'],
  all: 'ทั้งหมด',
  tableHead: 'คลังสูตรทั้งหมด',
  cols: ['รหัส', 'ชื่อสูตร', 'กลุ่ม', 'สถานะ', 'ทดสอบ', 'ผลล่าสุด', 'เก่งตอน'],
  eqHead: 'สมการ',
  paramHead: 'พารามิเตอร์',
  tagHead: 'แท็กเหมาะกับ',
  trialHead: 'ประวัติการทดสอบ',
  trialCols: ['วันที่ทดสอบ', 'ช่วงข้อมูล', 'วัตถุดิบ', 'สถานการณ์', 'วัน', 'win rate', 'แพ้เฉลี่ย', 'แพ้เยอะสุด', 'ผล'],
  noTrial: 'ยังไม่เคยทดสอบสูตรนี้',
  droppedHead: 'สูตรที่ไม่ผ่านแล้ว',
  droppedEmpty: 'ยังไม่มีสูตรที่ถูกคัดออก',
  retestBtn: 'เอากลับมาทดสอบใหม่',
  retestAsk: { title: 'เอากลับมาทดสอบใหม่?', ok: 'ส่งเข้าทดสอบ' },
  retestWarn: 'สูตรนี้ตกไปเมื่อ {d} ({n} วันก่อน) เพราะ: {why}',
  retestNoDate: 'สูตรนี้ถูกคัดออก เพราะ: {why}',
  untestedHead: 'สูตรที่ยังไม่เคยทดสอบ',
  untestedEmpty: 'ทุกสูตรเคยถูกทดสอบแล้ว',
  sendBtn: 'ส่งเข้าทดสอบ',
  addBtn: 'เพิ่มสูตรเอง',
  evolveBtn: 'ให้ระบบสร้างสูตรใหม่',
  addForm: { title: 'เพิ่มสูตรเอง', code: 'รหัสสูตร (อังกฤษ)', name: 'ชื่อสูตร', family: 'กลุ่มสูตร', eq: 'สมการ (อธิบายเป็นคำ)', params: 'พารามิเตอร์ เช่น {"window":7}', ok: 'บันทึกลงคลัง' },
  addBad: 'ต้องกรอกรหัสสูตรและชื่อสูตร',
  addDup: 'มีรหัสสูตรนี้ในคลังแล้ว',
  addBadParams: 'พารามิเตอร์ต้องเป็น JSON เช่น {"window":7}',
  addDone: 'เพิ่มสูตร {c} ลงคลังแล้ว',
  evolveNoTrial: 'ยังไม่มีผลทดสอบในฐาน — ไปหน้าห้องทดสอบ กดบันทึกผลการทดสอบก่อน',
  evolveNone: 'ไม่มีสูตรใหม่ที่สร้างได้ตามกฎในรอบนี้',
  evolveAsk: { title: 'สร้างสูตรใหม่ {n} สูตร?', ok: 'สร้างและบันทึก' },
  evolveDone: 'สร้างสูตรใหม่ {n} สูตร (เข้าทดสอบ {p} · ตกด่านแรก {d})',
  matrixHead: 'สูตรไหนเก่งตอนไหน (win rate ตามสถานการณ์)',
  matrixEmpty: 'ต้องมีผลทดสอบที่ติดป้ายสถานการณ์ก่อน จึงจะเทียบได้',
  matrixNote: 'ช่องว่าง = ยังไม่มีผลทดสอบในสถานการณ์นั้น · คอลัมน์ "เก่งตอน" ในตารางคลังสูตรอัปเดตจากตารางนี้',
  bestDone: 'อัปเดตสถานการณ์ที่ทำได้ดีที่สุดของ {n} สูตรแล้ว',
  statusDone: 'เปลี่ยนสถานะ {c} เป็นกำลังทดสอบแล้ว',
  retestTag: 'ต้องทดสอบใหม่',
  passHead: 'สูตรที่ผ่านการคัดเลือก',
  passEmpty: 'ยังไม่มีสูตรที่ผ่านการคัดเลือก',
  passCols: ['สูตร', 'วัตถุดิบ', 'สถานการณ์', 'กรอบ', 'วันนับคะแนน', 'win rate', 'แพ้เฉลี่ย', 'แพ้เยอะสุด', 'ช่วงวัดผล', 'วันที่ทดสอบ'],
  passOlder: 'ครั้งก่อน {n} ครั้ง (เท่าที่ยังมีแถวในฐาน การทดสอบซ้ำช่วงเดียวกันเขียนทับแถวเดิม)',
  passUse: 'ใช้สูตรนี้กับวัตถุดิบนี้',
  passFilterItem: 'วัตถุดิบ',
  passFilterRegime: 'สถานการณ์',
  passBadEvidence: 'หลักฐานใช้ไม่ได้ ต้องทดสอบใหม่ (สูตรรู้ยอดขายวันเดียวกัน)',
  useAsk: { title: 'เปลี่ยนสูตรใช้จริงของ {n}?', ok: 'ยืนยันเปลี่ยนสูตร' },
  useCur: 'สูตรปัจจุบัน',
  useNew: 'สูตรใหม่',
  useNoCurTrial: 'ยังไม่มีผลทดสอบของสูตรปัจจุบันกับวัตถุดิบนี้',
  useNotComparable: '⚠ สองสูตรวัดผลคนละช่วงหรือคนละกรอบ เทียบกันตรงๆ ไม่ได้',
  useRegimeWarn: '⚠ สูตรใหม่ผ่านในสถานการณ์ {a} แต่ตอนนี้วัตถุดิบอยู่ในสถานการณ์ {b}',
  useWorseWarn: '⚠ สูตรใหม่ win rate ต่ำกว่า หรือแพ้เฉลี่ยสูงกว่าสูตรปัจจุบัน',
  useNoteLimit: 'บันทึกการเปลี่ยนสูตรเก็บได้เท่าที่ช่อง note ของ kk_forecast_model_map รองรับ (kk_forecast_result ไม่มีช่องรหัสสูตร)',
  useDone: 'เปลี่ยนสูตรของ {n} เป็น {c} แล้ว',
  useChanged: 'สูตรของวัตถุดิบนี้ถูกแก้ไปแล้วจากที่อื่น ยกเลิกการบันทึก กรุณาโหลดใหม่',
  bestFrom: 'จาก {item} · กรอบ {band} · {from}–{to}',
  importBtn: 'นำเข้าประวัติย้อนหลัง',
  importTitle: 'นำเข้าประวัติย้อนหลัง (จากแอปเก่า)',
  importHelp: 'วางบรรทัดละแถว: วันที่ (YYYY-MM-DD), รหัสวัตถุดิบ, ใช้จริง กก., ยอดขาย กก. (เว้นว่างได้) คั่นด้วยจุลภาคหรือแท็บ',
  importPreview: 'ตรวจข้อมูล',
  importOk: 'นำเข้าได้ {n} แถว',
  importBad: 'ผิด {n} แถว (ข้ามเฉพาะแถวนั้น)',
  importClash: 'ชนของเดิมในฐาน {n} แถว (ไม่เขียนทับ)',
  importConfirm: 'ยืนยันนำเข้า {n} แถว',
  importDone: 'เขียนสำเร็จจริง {n} แถว',
  importNone: 'ไม่มีแถวที่นำเข้าได้',
  importFail: 'นำเข้าไม่สำเร็จ',
  retestWhy: 'ผลนี้มาจากสูตรที่รู้ยอดขายของวันเดียวกัน ใช้ไม่ได้กับการพยากรณ์ล่วงหน้า',
  nowcastTag: 'รู้ยอดขายแล้ว (nowcast)',
  advanceTag: 'ล่วงหน้า'
};

// หน้าตั้งค่ากฎการทดสอบ
export const EQ_CFG_UI = {
  sub: 'กฎทุกข้ออ่านจากตาราง kk_forecast_config · แก้แล้วทุกหน้าที่คำนวณใช้ค่าใหม่ทันที',
  groups: ['นิยามชนะ-แพ้', 'การคำนวณ', 'เกณฑ์คัดออก', 'เกณฑ์เลื่อนขั้น', 'การสร้างสูตรใหม่', 'สถานการณ์'],
  picks: {
    band_type: [['SD', 'SD — ตามความแกว่ง'], ['PCT', 'PCT — เป็นเปอร์เซ็นต์']],
    loss_mode: [['full', 'full — ส่วนต่างเต็มก้อน'], ['outside', 'outside — เฉพาะระยะที่เลยขอบ']]
  },
  impactHead: 'ผลกระทบถ้าบันทึกค่านี้',
  impactCalc: 'กำลังคำนวณผลกระทบ...',
  impactWin: 'win rate รวมทุกวัตถุดิบ',
  impactKg: 'ของที่ต้องเตรียมต่อเดือน',
  impactNone: 'ยังวัดผลกระทบไม่ได้ (ข้อมูลไม่พอในกฎชุดใหม่)',
  impactSame: 'ค่านี้ไม่กระทบผลการวัดในข้อมูลที่มี',
  dirty: 'แก้ไว้ {n} ค่า ยังไม่บันทึก',
  save: 'บันทึกกฎทั้งหมด',
  reset: 'คืนค่าเริ่มต้น',
  resetAsk: { title: 'คืนค่าเริ่มต้นทั้ง 27 ค่า?', text: 'ค่าที่แก้ไว้เองจะกลับเป็นค่าตั้งต้นของระบบ', ok: 'คืนค่าเริ่มต้น' },
  saveNone: 'ยังไม่มีค่าที่แก้',
  saveDone: 'บันทึกกฎใหม่ {n} ค่าแล้ว ทุกหน้าที่คำนวณใช้ค่าใหม่ทันที',
  resetDone: 'คืนค่าเริ่มต้นแล้ว',
  saveErr: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง',
  outRange: 'ค่าต้องอยู่ระหว่าง {a} ถึง {b}'
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

// 4 แท็บของหน้าพระราม 9
export const R9_TABS = [
  { id: 'send', label: 'ส่งของ', glyph: 'truck' },
  { id: 'history', label: 'ประวัติ', glyph: 'clock' },
  { id: 'report', label: 'Report', glyph: 'chart' },
  { id: 'setup', label: 'ตั้งค่ารายการ', glyph: 'gear' }
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
  clearAsk: { title: 'ล้างทั้งหมด?', text: 'ปริมาณ ราคา ค่าส่ง และหมายเหตุของรอบนี้จะถูกล้าง', ok: 'ล้างทั้งหมด' },
  loading: 'กำลังโหลดข้อมูลจากฐาน...',
  loadError: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  retry: 'ลองใหม่',
  dateBand: 'กำลังบันทึกรอบส่งของวันที่ {d} ({s})',
  saving: 'กำลังบันทึก...',
  saveError: 'บันทึกไม่สำเร็จ ยังไม่มีรอบใหม่เกิดขึ้น กดบันทึกอีกครั้งได้',
  noLines: 'ยังไม่ได้กรอกปริมาณรายการใด',
  noPrice: 'ยังไม่ได้ใส่ราคา: {names} — ใส่ราคาก่อนจึงบันทึกได้',
  saved: 'บันทึกและส่งเรียบร้อย (รอบ #{no})',
  savedEdit: 'แก้รอบ #{no} แล้ว รอบเก่าเก็บไว้เป็นประวัติแล้ว',
  edit: 'แก้ไขรอบนี้',
  editing: 'กำลังแก้รอบส่งของ #{no} — กดบันทึกแล้วจะเกิดรอบใหม่ ของเก่ายังเก็บไว้ครบทุกตัว',
  editCancel: 'เลิกแก้',
  editSave: 'บันทึกการแก้',
  revised: 'แก้ไขแล้ว ครั้งที่ {n}',
  revHistory: 'ดูของเดิม',
  revRow: 'ครั้งที่ {n} · {items} รายการ · {net} บาท · {by} · {at}',
  revNow: '← ใช้อยู่',
  del: 'ลบรอบนี้',
  delAsk: { title: 'ลบรอบส่งนี้?', text: 'รอบนี้จะไม่ถูกนับในรายงานอีก แต่ข้อมูลเก่ายังอยู่ในฐาน', ok: 'ลบรอบนี้' },
  deleted: 'ลบรอบ #{no} ออกจากรายงานแล้ว',
  itemSum: 'สรุปรายสินค้า',
  itemSumSub: 'ส่งสินค้าตัวไหนไปกี่หน่วย กี่บาท (มาก→น้อย)',
  exportOff: 'รอบนี้เปิดใช้เพียงพิมพ์รายงาน · PDF/Excel/แชร์ ยังไม่เปิดใช้งาน',
  noPriceTag: 'ยังไม่ตั้งราคา'
};

// หน้าตั้งค่ารายการของหน้าพระราม 9
export const R9_SETUP_UI = {
  title: 'ตั้งค่ารายการส่งของ',
  sub: 'เปิด/ปิด แก้ชื่อ หน่วย ราคาตั้งต้น รูป และย้ายหมวดได้จากหน้านี้',
  count: '{on} เปิดใช้ · {off} ปิดไว้ · {all} รายการทั้งหมด',
  catOn: 'เปิดทั้งหมวด',
  catOff: 'ปิดทั้งหมวด',
  pickMode: 'เลือกหลายรายการ',
  pickDone: 'เลิกเลือก',
  moveTo: 'ย้าย {n} รายการไปหมวด...',
  moveTitle: 'ย้ายไปหมวดไหน',
  moved: 'ย้าย {n} รายการเข้าหมวด {cat} แล้ว',
  editTitle: 'แก้รายการ',
  fName: 'ชื่อรายการ',
  fCat: 'หมวด',
  fUnit: 'หน่วยนับ',
  fPrice: 'ราคาตั้งต้น (บาท · เว้นว่างไว้ = ยังไม่ตั้งราคา)',
  fPhoto: 'รูปสินค้า',
  usedNote: 'เคยส่งมาแล้ว {n} รอบ',
  neverUsed: 'ยังไม่เคยส่ง',
  delBlocked: 'ลบไม่ได้ — รายการนี้เคยส่งมาแล้ว {n} รอบ ให้ปิดสวิตช์แทน',
  delAsk: { title: 'ลบรายการนี้?', ok: 'ลบรายการ' },
  deleted: 'ลบ "{name}" แล้ว',
  turnedOn: 'เปิดใช้ "{name}" แล้ว',
  turnedOff: 'ปิด "{name}" แล้ว (ประวัติเก่ายังอยู่)',
  savedItem: 'บันทึก "{name}" แล้ว',
  pickNone: 'ยังไม่ได้เลือกรายการ',
  photoTitle: 'รูปสินค้า',
  photoUpload: 'อัพโหลดรูปจากเครื่อง (แปลงเป็น WebP ให้อัตโนมัติ)',
  photoClear: 'ลบรูปนี้ (กลับไปใช้รูปกล่องแทน)',
  photoLib: '— หรือเลือกจากคลังรูป —',
  photoBtn: 'เปลี่ยนรูป',
  photoUploaded: 'อัพรูปใหม่แล้ว (แปลงเป็น WebP เรียบร้อย)',
  photoCleared: 'ลบรูปแล้ว',
  photoChanged: 'เปลี่ยนรูปแล้ว',
  photoBig: 'รูปใหม่ใหนก็ได้ แอปจะย่อให้เอง'
};

// ---------- หน้าบัญชีและรหัสผ่าน ----------

// ---------- หน้าแบ่งงาน (เห็นเฉพาะอาเฮียกับแม่พัน) ----------

// การ์ดงาน 3 ใบที่มอบหมายได้ (source: count = รายการนับสต๊อก / prep = เนื้อสัตว์+ข้าว / menu = เมนูอาหารปรุงสุก)
export const ASSIGN_TASKS = [
  {
    id: 'count', source: 'count', canEditItems: true, title: 'นับสต๊อก', sub: 'ใครนับวัตถุดิบรายการไหน',
    icon: 'assets/icons/nav-stock.webp', accent: '#1E7A3C', accent2: '#CFE8D3'
  },
  {
    id: 'prep', source: 'prep', canEditItems: false, title: 'บันทึกเตรียมอาหาร', sub: 'ใครกรอก เตรียม · เบิกเพิ่ม · ทิ้ง · คงเหลือ',
    icon: 'assets/prep/ic3d-prep.webp', accent: '#2F63C9', accent2: '#CFDDF5'
  },
  {
    id: 'cooked', source: 'menu', canEditItems: false, title: 'อาหารปรุงสำเร็จคงเหลือ', sub: 'ใครกรอกของเหลือรายเมนู',
    icon: 'assets/prep/ic3d-left.webp', accent: '#C0651B', accent2: '#F3DCC0'
  }
];

// หมวดที่นับเป็นงานเตรียมอาหาร (รายการมาจาก kk_count_item ชุดเดียวกับหน้าสต๊อก)
export const ASSIGN_PREP_GROUPS = ['เนื้อสัตว์', 'ข้าวหุง'];
// ป้ายหมวดข้าวหุงในหน้าแบ่งงาน (รายการชุดเดียวกับแท็บข้าวของหน้าเตรียม-เหลือ)
export const ASSIGN_PREP_META = { 'ข้าวหุง': { id: 'ข้าวหุง', label: 'ข้าว', icon: 'assets/kitchen/rice-homali.webp', color: '#B37A45', tint: '#FBF1E5' } };

// หมวดเมนูของการ์ดอาหารปรุงสำเร็จคงเหลือ
export const ASSIGN_MENU_GROUP = { id: 'เมนูอาหาร', label: 'เมนูอาหาร', icon: 'assets/r9/dish-kaprao.webp', color: '#C0651B', tint: '#FDF3E6' };

// ข้อความทั้งหมดของหน้าแบ่งงาน ({n} {name} {done} {all} = ช่องเติม)
export const ASSIGN_UI = {
  title: 'แบ่งงาน',
  sub: 'มอบหมาย ปรับเปลี่ยน เพิ่ม-ลดงานของทุกคน',
  count: '{n} กลุ่มงาน',
  deny: 'หน้านี้เห็นเฉพาะอาเฮียกับแม่พัน',
  loading: 'กำลังโหลดรายการจากฐาน...',
  error: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  retry: 'ลองใหม่',
  back: 'กลับการ์ดงาน',
  taskMeta: 'มีคนรับผิดชอบ {done} จาก {all} รายการ',
  none: 'ยังไม่มีคนรับ',
  pickTitle: 'ใครรับผิดชอบ “{name}”',
  pickGroupTitle: 'ใครรับผิดชอบทั้งหมวด “{name}”',
  pickHint: 'แตะชื่อเพื่อเลือก/เอาออก เลือกหลายคนก็ได้',
  pickDone: 'เสร็จ',
  groupAll: 'มอบทั้งหมวด',
  groupNote: 'เลือกทั้งหมวด = ทุกรายการในหมวดนี้เป็นงานของคนนั้นทั้งหมด',
  frozenTag: 'พักงาน',
  saved: 'บันทึกคนรับผิดชอบของ “{name}” แล้ว',
  saveErr: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง',
  search: 'ค้นหารายการ...',
  empty: 'ไม่พบรายการที่ค้นหา',
  onlyFree: 'เฉพาะที่ยังไม่มีคนรับ',
  showAll: 'ดูทั้งหมด',
  tools: 'จัดการรายการ',
  toolsOff: 'เลิกจัดการ',
  photoUpload: 'อัพโหลดรูปจากเครื่อง (แปลงเป็น WebP ย่อขนาดให้อัตโนมัติ)',
  photoClear: 'ลบรูปนี้ (กลับไปใช้รูปประจำหมวด)',
  photoTitle: 'รูป “{name}”',
  photoSaved: 'เปลี่ยนรูปแล้ว ทุกหน้าเห็นรูปใหม่เหมือนกัน',
  photoCleared: 'ลบรูปแล้ว',
  moveUp: 'ขึ้น',
  moveDown: 'ลง'
};

// ---------- หน้าตั้งค่า (ปุ่มฟันเฟืองมุมขวาบน) ----------

export const SETTINGS_UI = {
  title: 'ตั้งค่า',
  sub: 'ของที่แก้ได้ทั้งร้าน รวมไว้ที่นี่',
  count: '{n} คนทำงาน',
  staffTitle: 'พนักงาน',
  staffSub: 'เพิ่ม แก้ชื่อ พักงานชั่วคราว หรือลบออก — ส่งผลกับหน้าแบ่งงานทันที',
  loading: 'กำลังโหลดรายชื่อจากฐาน...',
  error: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  add: 'เพิ่มพนักงาน',
  edit: 'แก้ชื่อ',
  freeze: 'พักงาน',
  unfreeze: 'เรียกกลับ',
  remove: 'ลบ',
  frozenTag: 'พักงานชั่วคราว',
  roleName: { owner: 'เจ้าของร้าน', admin: 'แอดมิน', lead: 'หัวหน้า', staff: 'พนักงาน' },
  roles: [{ value: 'staff', label: 'พนักงาน' }, { value: 'lead', label: 'หัวหน้า' }, { value: 'owner', label: 'เจ้าของร้าน' }],
  addAsk: { title: 'เพิ่มพนักงานใหม่', name: 'ชื่อที่แสดง', code: 'รหัสพนักงาน (อังกฤษตัวเล็ก เช่น nong)', role: 'ตำแหน่ง', avatar: 'รูปตัวละคร', ok: 'เพิ่มพนักงาน' },
  editAsk: { title: 'แก้ข้อมูล {name}', name: 'ชื่อที่แสดง', role: 'ตำแหน่ง', ok: 'บันทึก' },
  freezeAsk: { title: 'พักงาน {name} ชั่วคราว?', text: 'งานที่เค้ารับผิดชอบอยู่จะถูกล้างทั้งหมด กลายเป็นงานที่ยังไม่มีคนรับ รอเค้ากลับมาค่อยกดเรียกกลับ', ok: 'พักงาน' },
  delAsk: { title: 'ลบ {name} ออกจากระบบ?', text: 'งานที่เค้ารับผิดชอบจะถูกล้าง ต้อง assign ใหม่ — ประวัติงานเก่ายังเก็บไว้', ok: 'ลบพนักงาน' },
  done: {
    add: 'เพิ่ม {name} เข้าระบบแล้ว เลือกงานให้เค้าได้ทันที',
    edit: 'แก้ข้อมูล {name} แล้ว',
    freeze: 'พักงาน {name} แล้ว งานของเค้าถูกล้างเรียบร้อย',
    unfreeze: 'เรียก {name} กลับมาทำงานแล้ว',
    del: 'ลบ {name} ออกจากระบบแล้ว'
  },
  err: {
    name: 'ใส่ชื่อที่แสดงด้วยนะ',
    code: 'รหัสพนักงานต้องเป็นอังกฤษตัวเล็ก 2-16 ตัว',
    dup: 'รหัสนี้มีอยู่แล้ว',
    save: 'บันทึกลงฐานไม่สำเร็จ เช็กอินเทอร์เน็ตแล้วลองใหม่'
  }
};

// ---------- หน้าเพลง (เพลย์ลิสต์) ----------

export const MUSIC_UI = {
  title: 'เพลง',
  sub: 'เพลย์ลิสต์ของทีม',
  loading: 'กำลังโหลดเพลง...',
  error: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  retry: 'ลองใหม่',
  allTracks: 'เพลงทั้งหมด',
  newList: 'สร้างเพลย์ลิสต์',
  manage: 'จัดการ',
  manageOff: 'เลิกจัดการ',
  importBtn: 'นำเข้าเพลง',
  importHint: 'ไฟล์ที่ไม่ใช่ MP3 ระบบแปลงเป็น MP3 ให้เอง',
  addFrom: 'เพิ่มเพลงจากคลัง',
  addFromTitle: 'เพิ่มเพลงเข้า “{name}”',
  addFromEmpty: 'เพลงทุกเพลงในคลังอยู่ในเพลย์ลิสต์นี้หมดแล้ว',
  removeFrom: 'เอาออกจากเพลย์ลิสต์',
  deleteTrack: 'ลบเพลงทิ้ง',
  empty: 'เพลย์ลิสต์นี้ยังไม่มีเพลง — กดนำเข้าเพลง หรือเพิ่มจากคลัง',
  nowPlaying: 'กำลังเล่น',
  noTrack: 'เลือกเพลงเพื่อเริ่มเล่น',
  unknownArtist: 'ไม่ระบุคนร้อง',
  newListAsk: { title: 'สร้างเพลย์ลิสต์ใหม่', name: 'ชื่อเพลย์ลิสต์', ok: 'สร้าง' },
  renameAsk: { title: 'เปลี่ยนชื่อเพลย์ลิสต์', name: 'ชื่อใหม่', ok: 'บันทึก' },
  delListAsk: { title: 'ลบเพลย์ลิสต์ {name}?', text: 'เพลงทั้งหมดยังอยู่ในคลัง ลบเพียงรายการชุดนี้', ok: 'ลบเพลย์ลิสต์' },
  delTrackAsk: { title: 'ลบ {name} ออกจากคลัง?', text: 'ไฟล์เพลงจะถูกลบจริง และหายจากทุกเพลย์ลิสต์', ok: 'ลบเพลง' },
  done: {
    newList: 'สร้างเพลย์ลิสต์ {name} แล้ว',
    rename: 'เปลี่ยนชื่อเป็น {name} แล้ว',
    delList: 'ลบเพลย์ลิสต์ {name} แล้ว',
    add: 'เพิ่ม {n} เพลงเข้าเพลย์ลิสต์แล้ว',
    removeFrom: 'เอา {name} ออกจากเพลย์ลิสต์แล้ว',
    delTrack: 'ลบ {name} ออกจากคลังแล้ว',
    imported: 'นำเข้า {n} เพลงเรียบร้อย'
  },
  err: {
    name: 'ใส่ชื่อเพลย์ลิสต์ด้วยนะ',
    needList: 'สร้างเพลย์ลิสต์ก่อน แล้วค่อยนำเข้าเพลง',
    save: 'บันทึกลงฐานไม่สำเร็จ ลองใหม่อีกครั้ง',
    convert: 'แปลงไฟล์ {name} ไม่สำเร็จ ข้ามไปก่อน',
    audio: '{name} ไม่ใช่ไฟล์เสียง'
  },
  converting: 'แปลงเป็น MP3: {name}',
  uploading: 'กำลังอัพโหลด: {name}'
};

// คนที่รับผิดชอบงานเตรียม (สี/รูปประจำตัวในหน้าเตรียม-เหลือ · ชื่อมาจาก kk_staff)
export const PREP_PEOPLE_LOOK = {
  fah:  { color: '#3B8BE0', tint: '#EAF3FD', half: 'assets/prep/fah-half.webp', round: 'assets/prep/fah-round.webp' },
  emmy: { color: '#E0A020', tint: '#FEF4DE', half: 'assets/prep/emmy-chef.webp', round: 'assets/prep/emmy-face.webp' },
  ad:   { color: '#2E8B4F', tint: '#E9F6EC', half: 'assets/prep/ad-half.webp', round: 'assets/prep/ad-round.webp' }
};

// ข้อความบนกราฟที่ใช้ร่วมทุกหน้า
export const CHART_UI = { noData: 'ยังไม่มีข้อมูล' };

// ตำแหน่งสิทธิ์ที่เลือกได้ตอนเพิ่ม/แก้บัญชี
export const ACCOUNT_ROLES = [
  { value: 'admin', label: 'แอดมิน (แก้ได้ทุกคน)' },
  { value: 'lead', label: 'หัวหน้า' },
  { value: 'staff', label: 'พนักงาน' }
];

// รูปตัวละครที่เลือกได้ตอนเพิ่มบัญชี (ไฟล์อยู่ที่ assets/login/avatar-*.webp)
export const ACCOUNT_AVATARS = ['ahhia', 'maepan', 'fah', 'emmy', 'ad', 'som']
  .map(id => ({ value: id, label: id, image: `assets/login/avatar-${id}.webp` }));

// ข้อความทั้งหมดของหน้าบัญชีและรหัสผ่าน
export const ACCOUNT_UI = {
  title: 'บัญชีและรหัสผ่าน',
  sub: 'รหัสพนักงาน 4 หลัก + PIN 4 หลัก สำหรับเข้าแอป (PIN เก็บที่ฐาน ทุกเครื่องเห็นตรงกัน)',
  count: '{n} บัญชี',
  adminNote: 'คุณเป็นแอดมิน แก้รหัสของทุกคนได้',
  staffNote: 'แก้ได้เฉพาะ PIN ของบัญชีคุณเอง',
  codeLabel: 'รหัส',
  pinLabel: 'PIN',
  meTag: 'บัญชีของคุณ',
  add: 'เพิ่มบัญชี',
  editPin: 'แก้ PIN',
  remove: 'ลบบัญชี',
  show: 'ดู PIN',
  hide: 'ซ่อน PIN',
  roleName: { admin: 'แอดมิน', lead: 'หัวหน้า', staff: 'พนักงาน' },
  pinAsk: { title: 'แก้ PIN ของ {name}', field: 'PIN ใหม่ (4 หลัก)', ok: 'บันทึก PIN' },
  addAsk: { title: 'เพิ่มบัญชีใหม่', name: 'ชื่อที่แสดง', code: 'รหัสพนักงาน (4 หลัก)', pin: 'PIN (4 หลัก)', role: 'สิทธิ์', avatar: 'รูปตัวละคร', ok: 'เพิ่มบัญชี' },
  delAsk: { title: 'ลบบัญชี {name}?', text: 'บัญชีนี้จะเข้าแอปไม่ได้อีก', ok: 'ลบบัญชี' },
  done: { pin: 'เปลี่ยน PIN ของ {name} แล้ว', add: 'เพิ่มบัญชี {name} แล้ว', del: 'ลบบัญชี {name} แล้ว' },
  err: {
    deny: 'คุณไม่มีสิทธิ์แก้บัญชีนี้',
    pin: 'PIN ต้องเป็นตัวเลข 4 หลัก',
    code: 'รหัสพนักงานต้องเป็นตัวเลข 4 หลัก',
    name: 'ใส่ชื่อที่แสดงด้วยนะ',
    dup: 'รหัสพนักงานนี้มีอยู่แล้ว',
    self: 'ลบบัญชีของตัวเองไม่ได้',
    lastAdmin: 'ต้องเหลือแอดมินอย่างน้อย 1 คน',
    missing: 'ไม่พบบัญชีนี้',
    save: 'บันทึกลงฐานไม่สำเร็จ เช็กอินเทอร์เน็ตแล้วลองใหม่'
  }
};

// ---------- หน้า "งานของฉัน" และหน้างานรายวันของพนักงาน ----------

// ข้อความกลางที่ทุกหน้างานใช้ร่วมกัน
export const WORK_UI = {
  back: 'งานของฉัน',
  backStaff: 'พนักงาน',
  loading: 'กำลังโหลดข้อมูลจากฐาน...',
  loadError: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  retry: 'ลองใหม่',
  saveError: 'บันทึกไม่สำเร็จ ข้อมูลเดิมยังอยู่ ลองใหม่อีกครั้ง',
  saving: 'กำลังบันทึก...',
  nothing: 'ยังไม่ได้กรอกอะไรเลย',
  history: 'ดูประวัติ',
  historyNone: 'ยังไม่มีรายการย้อนหลัง',
  close: 'ปิด',
  none: '-',
  dateLabel: 'วันที่ทำงาน'
};

// หน้างานของฟ้า: ชื่อหน้า ไอคอน ตัวการ์ตูน (ใช้คนละท่าไม่ซ้ำกัน) และสีประจำหน้า
export const WORK_PAGES = {
  'fah-pack': {
    title: 'นับกล่องและช้อนส้อม', sub: 'นับจำนวนอุปกรณ์ในครัวกลาง ให้ถูกต้อง ครบถ้วน',
    icon: 'assets/fah/ic-packaging.webp', char: 'assets/fah/fah-scan.webp',
    script: 'ใส่ใจ\nในทุกความสะอาด', accent: '#2E86D8', save: 'บันทึกผลนับ',
    tip: 'นับให้ครบทุกใบนะคะ กล่องขาดกลางวันลำบากเลย'
  },
  'fah-chicken': {
    title: 'เตรียมอกไก่นุ่ม', sub: 'บันทึกปริมาณการเตรียมวัตถุดิบ ให้ถูกต้อง ครบถ้วน',
    icon: 'assets/fah/ic-chicken.webp', char: 'assets/fah/fah-apron.webp',
    script: 'ใส่ใจ\nในทุกความสะอาด', accent: '#1F8FBF', save: 'บันทึกข้อมูล',
    tip: 'ชั่งตอนเตรียมเสร็จทันที ตัวเลขจะตรงที่สุดค่ะ'
  },
  'fah-cooked': {
    title: 'อาหารปรุงสำเร็จเหลือ', sub: 'บันทึกอาหารปรุงสำเร็จที่เหลือจากการจำหน่าย',
    icon: 'assets/fah/ic-cooked.webp', char: 'assets/fah/fah-chibi-adult.webp',
    script: 'ใส่ใจ ไม่ทิ้งอาหาร\nเพื่อโลกที่ดีกว่า', accent: '#2E86D8', save: 'บันทึกของเหลือ',
    tip: 'ของเหลือทุกกรัม ระบบแปลงกลับเป็นวัตถุดิบให้อัตโนมัติ'
  },
  'fah-income': {
    title: 'รายได้ประจำวัน', sub: 'บันทึกยอดขายของแต่ละร้านให้ถูกต้อง ครบถ้วน',
    icon: 'assets/fah/ic-income.webp', char: 'assets/fah/fah-office.webp',
    script: 'ใส่ใจ\nในทุกตัวเลข', accent: '#1F6FC4', save: 'บันทึกรายได้',
    tip: 'กรอกให้ครบทั้ง 3 ร้าน ก่อนปิดร้านนะคะ'
  },
  'fah-leave': {
    title: 'บันทึกวันลาทีม', sub: 'บันทึกวันลาของพนักงานในทีม ให้ถูกต้อง ครบถ้วน',
    icon: 'assets/fah/ic-leave.webp', char: 'assets/fah/fah-chibi-senior.webp',
    script: 'ดูแลกัน\nให้ทุกวันดีขึ้น', accent: '#2E86D8', save: 'บันทึกวันลา', hist: 'ดูรายการลา',
    tip: 'บันทึกวันลาให้ครบ ทีมจะจัดคนได้ง่ายขึ้น'
  }
};

// พนักงานที่กดการ์ดแล้วเข้าหน้างานจริงตรงๆ (คนที่ไม่ได้อยู่ในนี้จะเข้าหน้า "งานของฉัน" ตามปกติ)
export const STAFF_DIRECT_PAGE = { som: 'som-drink', emmy: 'emmy-count', ad: 'ad-count', maepan: 'maepan' };

// หน้านับของครัว (เอมมี่ + อัด) — ข้อความและรูปทั้งหมดของทุกแท็บอยู่ที่นี่ที่เดียว
export const KITCHEN_UI = {
  back: 'งานของฉัน',
  dateLabel: 'วันที่ทำงาน',
  colItem: 'รายการ',
  colQty: 'นับได้ในครัวกลาง',
  colUnit: 'หน่วย',
  add: 'เพิ่มรายการ',
  manage: 'จัดการรายการ',
  save: 'บันทึกผลนับ',
  savePrep: 'บันทึกข้อมูล',
  waiting: 'ยังไม่กรอก',
  notSaved: 'ยังไม่บันทึก',
  notSavedHint: 'กรุณาตรวจสอบข้อมูลก่อนบันทึก',
  dirty: 'มี {n} รายการรอบันทึก',
  progress: 'กรอกครบ {a} จาก {b} รายการ',
  saved: 'บันทึกผลนับ {n} รายการแล้ว',
  savedOne: 'บันทึกแล้ว',
  nothing: 'ยังไม่มีรายการที่กรอกใหม่',
  loading: 'กำลังโหลดข้อมูล...',
  loadError: 'โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง',
  saveError: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง',
  empty: 'ยังไม่มีรายการในหมวดนี้',
  emptyFind: 'ไม่พบรายการที่ค้นหา',
  moreTitle: 'จัดการรายการนี้',
  moreActions: [
    { value: 'edit', label: 'แก้ไขรายการ' },
    { value: 'up', label: 'เลื่อนขึ้น' },
    { value: 'down', label: 'เลื่อนลง' },
    { value: 'remove', label: 'ลบรายการ' }
  ],
  // ตารางแท็บเตรียมอาหาร (ใช้ข้อมูลชุดเดียวกับหน้าเตรียม-เหลือ)
  prep: {
    meatTitle: 'ตารางเตรียมวัตถุดิบวันนี้',
    riceTitle: 'ตารางบันทึกการหุงข้าว',
    meatCols: ['รายการ', 'พยากรณ์', 'เตรียม', 'เบิกเพิ่ม', 'ทิ้ง/เสีย', 'คงเหลือสด', 'ใช้ไป'],
    riceCols: ['หุงข้าว', 'พยากรณ์', 'รอบที่ 1', 'รอบที่ 2', 'รอบที่ 3', 'หุงรวม'],
    unit: 'กก.',
    none: '—',
    useNote: 'ใช้ไป = เตรียม + เบิกเพิ่ม + คงเหลือใช้ต่อของวันเปิดก่อนหน้า − ทิ้ง/เสีย − (คงเหลือสด + พระราม 9 ที่บวกกลับ) − อาหารปรุงสำเร็จเหลือวันนี้',
    why: { no_prep: 'ยังไม่เตรียม', open: 'ยังไม่ปิดยอด', cooked_open: 'รอยอดอาหารสุก', no_carry: 'ไม่มีข้อมูลของยกมา', conflict: 'ข้อมูลขัดกัน' },
    carryStale: 'คงเหลือที่ใช้หักพยากรณ์เก่าเกิน 2 วันเปิด',
    carryNoCooked: 'แนะเป้ายังไม่รวมอาหารสุกที่ยกมา (วันเปิดก่อนหน้ายังไม่บันทึกคงเหลือใช้ต่อ)',
    warnUnbound: 'เมนูที่ยังไม่ผูกวัตถุดิบ (ไม่นำมาคิด): {names}',
    warnConflict: 'ทิ้ง + กินเอง + ห่อกลับบ้าน มากกว่าเหลือ (ข้อมูลขัดกัน): {names}',
    warnR9Unit: 'ส่งพระราม 9 ที่ต้องบวกกลับแต่ไม่มีน้ำหนักต่อหน่วย จับคู่หน่วยไม่ได้: {names}',
    riceQuote: 'ข้าวดี อาหารอร่อย\nพลังดีทั้งวัน',
    noRows: 'ยังไม่มีรายการในตารางนี้',
    editTitle: 'แก้ไขรายการนี้',
    fName: 'ชื่อรายการ',
    fPhoto: 'รูปภาพประจำรายการ',
    edited: 'แก้ไข {name} แล้ว (เปลี่ยนทุกหน้าที่ใช้รายการนี้)',
    // รูปที่เลือกได้ตอนแก้รายการ (บันทึกลงช่อง photo ของ kk_count_item ทุกหน้าจึงเปลี่ยนตาม)
    photos: [
      { value: 'assets/kitchen/rice-homali.webp', label: 'ข้าวหอมมะลิ' },
      { value: 'assets/kitchen/rice-riceberry.webp', label: 'ข้าวไรซ์เบอรี่' },
      { value: 'assets/kitchen/rice-fried.webp', label: 'ข้าวผัด' },
      { value: 'assets/kitchen/rice-chicken5.webp', label: 'ข้าวมันไก่ 5%' },
      { value: 'assets/kitchen/rice-chicken9.webp', label: 'ข้าวมันไก่ 9%' },
      { value: 'assets/kitchen/rice-chicken12.webp', label: 'ข้าวมันไก่ 12%' },
      { value: 'assets/prep/meat-beef-mince.webp', label: 'เนื้อวัวบด' },
      { value: 'assets/prep/meat-chicken-mince.webp', label: 'อกไก่บด' },
      { value: 'assets/prep/meat-chicken-breast.webp', label: 'อกไก่' },
      { value: 'assets/prep/meat-chicken-tender.webp', label: 'สันในไก่' },
      { value: 'assets/prep/meat-pork-slice.webp', label: 'หมูสไลซ์' },
      { value: 'assets/food/pork-mince.webp', label: 'หมูบด' },
      { value: 'assets/prep/meat-duck-mince.webp', label: 'เป็ดบด' },
      { value: 'assets/prep/meat-salmon.webp', label: 'แซลมอน' },
      { value: 'assets/prep/meat-hokke.webp', label: 'ฮอกเกะ' },
      { value: 'assets/prep/meat-shrimp-mid.webp', label: 'กุ้งกลาง' },
      { value: 'assets/prep/meat-shrimp-big.webp', label: 'กุ้งใหญ่' }
    ]
  },
  // แท็บทั้งหมด (id ต้องไม่ซ้ำ) — grp/pick = ตัวกรองรายการจากตาราง kk_count_item ชุดเดียวกับหน้าสต๊อก
  tabs: {
    veg: {
      id: 'veg', kind: 'count', grp: 'ผัก', tab: 'นับผัก', icon: 'assets/kitchen/veg-basil.webp',
      accent: '#1B7A3E', tint: 'rgba(120, 205, 140, .40)',
      title: 'นับผัก', sub: 'นับอย่างใส่ใจ เพื่อครัวที่สดใหม่และอร่อยเสมอ',
      bubble: 'นับผัก\nกันเลยค่ะ', hero: 'assets/kitchen/hero-emmy-veg.webp',
      chibi: 'assets/kitchen/chibi-emmy-basket.webp',
      quote: 'ทุกผักมีคุณค่า\nที่เราดูแล', script: 'ผักสด\nสร้างรอยยิ้ม\nให้ทุกมื้อ',
      search: 'ค้นหาชื่อผัก...', col: 'รายการผัก', addRow: 'เพิ่มรายการผัก'
    },
    season: {
      id: 'season', kind: 'count', grp: 'ซอส/เครื่องปรุง', pick: 'season_', tab: 'นับเครื่องปรุง',
      icon: 'assets/kitchen/season-msg.webp', accent: '#A8761A', tint: 'rgba(247, 195, 70, .40)',
      title: 'นับเครื่องปรุง', sub: 'เช็กเครื่องปรุง ให้ครบ ถูกต้อง พร้อมใช้งานในทุกเมนู',
      bubble: 'เครื่องปรุงครบครัว\nอร่อยทุกเมนู', hero: 'assets/kitchen/hero-emmy-season.webp',
      chibi: 'assets/kitchen/chibi-emmy-jar.webp',
      quote: 'เครื่องปรุงครบ\nครัวก็พร้อม เมนูก็อร่อย', script: 'ของดี\nต้องนับให้ครบ\nนะคะ',
      search: 'ค้นหาชื่อตัวปรุง...', col: 'รายการเครื่องปรุง', addRow: 'เพิ่มรายการเครื่องปรุง'
    },
    sauce: {
      id: 'sauce', kind: 'count', grp: 'ซอส/เครื่องปรุง', pick: 'sauce_', tab: 'นับซอส',
      icon: 'assets/kitchen/sauce-kaprao.webp', accent: '#B0452F', tint: 'rgba(254, 155, 150, .38)',
      title: 'นับซอส', sub: 'นับอย่างใส่ใจ เพื่อครัวที่ดีที่สุดและรสชาติที่อร่อยเสมอ',
      bubble: 'เช็กซอสให้ครบ\nอร่อยทุกเมนูแน่นอน', hero: 'assets/kitchen/hero-emmy-sauce.webp',
      chibi: 'assets/kitchen/chibi-emmy-sauce.webp',
      quote: 'ซอสครบ รสชาติดี\nครัวเรามีเสน่ห์แน่นอน', script: 'เล็กน้อย\nแต่มีความอร่อย\nที่ยิ่งใหญ่',
      search: 'ค้นหาชื่อซอส...', col: 'รายการซอส', addRow: 'เพิ่มรายการซอส'
    },
    meat: {
      id: 'meat', kind: 'count', grp: 'เนื้อสัตว์', tab: 'นับเนื้อสัตว์',
      icon: 'assets/prep/meat-beef-mince.webp', accent: '#14532B', tint: 'rgba(30, 122, 60, .38)',
      title: 'นับเนื้อสัตว์', sub: 'นับอย่างใส่ใจ เพื่อครัวที่สดใหม่และอร่อยเสมอ',
      bubble: 'นับให้ครบ\nของสดต้องเป๊ะ!', hero: 'assets/kitchen/hero-ad-meat.webp',
      chibi: 'assets/kitchen/chibi-ad-tray.webp',
      quote: 'ของสดคุณภาพดี\nเริ่มจากการนับที่ถูกต้อง', script: 'เล็กน้อย\nแต่สำคัญ\nต่อความอร่อย',
      search: 'ค้นหาชื่อสินค้า...', col: 'รายการเนื้อสัตว์', addRow: 'เพิ่มรายการเนื้อสัตว์'
    },
    prep: {
      id: 'prep', kind: 'prep', tab: 'เตรียมอาหาร', icon: 'assets/prep/ic3d-prep.webp',
      accent: '#4E7C1C', tint: 'rgba(245, 226, 130, .55)',
      title: 'เตรียมอาหาร', sub: 'งานร่วมกันของเอมมี่ + อัด',
      bubble: 'อร่อยทุกมื้อ\nเริ่มจากวัตถุดิบที่ดี\nไปด้วยกันนะ!', hero: 'assets/kitchen/hero-pair-prep.webp',
      chibi: 'assets/kitchen/chibi-pair.webp',
      quote: 'ทีมเวิร์กดี\nอร่อยได้ทุกวัน', script: 'เตรียมพร้อม\nทุกวัน',
      search: 'ค้นหาวัตถุดิบ...', col: 'รายการ', addRow: ''
    }
  },
  // หน้าจอของแต่ละคน: ใครเป็นเจ้าของ · มีแท็บอะไรบ้าง (แท็บเตรียมอาหารใช้ร่วมกัน)
  pages: {
    'emmy-count': { owner: 'emmy', name: 'เอมมี่', avatar: 'assets/kitchen/av-emmy.webp', tabs: ['veg', 'season', 'sauce', 'prep'] },
    'ad-count': { owner: 'ad', name: 'อัด', avatar: 'assets/kitchen/av-ad.webp', tabs: ['meat', 'prep'] }
  },
  pairName: 'เอมมี่ + อัด',
  pairAvatar: 'assets/kitchen/av-pair.webp'
};

// หน้านับสต๊อกเครื่องดื่มของส้ม — 4 แท็บใช้โครงเดียวกัน เปลี่ยนแค่หมวดและข้อความ
export const SOM_UI = {
  job: 'นับเครื่องดื่มและบรรจุภัณฑ์น้ำ',
  dateLabel: 'วันที่นับสต๊อก',
  colNo: '#',
  colQty: 'จำนวน',
  colUnit: 'หน่วย',
  colStatus: 'สถานะ',
  add: 'เพิ่มรายการ',
  manage: 'จัดการรายการ',
  save: 'บันทึกสต๊อก',
  waiting: 'ยังไม่นับ',
  empty: 'ยังไม่มีรายการในหมวดนี้',
  emptyFind: 'ไม่พบรายการที่ค้นหา',
  saved: 'บันทึกสต๊อก {n} รายการแล้ว',
  moreTitle: 'จัดการรายการนี้',
  moreActions: [
    { value: 'edit', label: 'แก้ไขรายการ' },
    { value: 'up', label: 'เลื่อนขึ้น' },
    { value: 'down', label: 'เลื่อนลง' },
    { value: 'remove', label: 'ลบรายการ' }
  ],
  tabs: [
    {
      id: 'drink', grp: 'เครื่องดื่ม', tab: 'เครื่องดื่ม\nพร้อมขาย', icon: 'assets/som/dr-matcha-ococo.webp',
      title: 'นับสต๊อก\nเครื่องดื่มพร้อมขาย',
      sub: 'ตรวจนับจำนวนเครื่องดื่มบรรจุขวดที่พร้อมขาย เพื่อให้สต๊อกของร้านเป็นปัจจุบัน',
      char: 'assets/som/som-barista.webp', bubble: 'นับให้ครบ\nขายได้ต่อเนื่อง\nกันนะคะ! ♡',
      script: 'Good Drinks · Brighter Days ♡', search: 'ค้นหาเครื่องดื่ม...',
      col: 'รายการเครื่องดื่ม', ok: 'พร้อมขาย', out: 'สินค้าหมด',
      totalLabel: 'รวมรายการที่ใช้งาน', qtyLabel: 'จำนวนรวม'
    },
    {
      id: 'syrup', grp: 'น้ำเชื่อม', tab: 'น้ำเชื่อม\nและอื่นๆ', icon: 'assets/som/sy-pandan.webp',
      title: 'นับสต๊อก\n(น้ำเชื่อมและอื่นๆ)',
      sub: 'ตรวจนับวัตถุดิบสำหรับเครื่องดื่ม น้ำเชื่อม ผงต่างๆ ใบชา และวัตถุดิบเข้มข้น',
      char: 'assets/som/som-kimono.webp', bubble: 'วัตถุดิบดี\nคือจุดเริ่มต้นของ\nเครื่องดื่มอร่อย ♡',
      script: 'Good Ingredients · Brighter Drinks ♡', search: 'ค้นหาวัตถุดิบ...',
      col: 'รายการวัตถุดิบ', ok: 'พร้อมขาย', out: 'สินค้าหมด',
      totalLabel: 'รวมรายการวัตถุดิบ', qtyLabel: 'จำนวนรวม'
    },
    {
      id: 'sticker', grp: 'สติ๊กเกอร์', tab: 'สติ๊กเกอร์\nเครื่องดื่ม', icon: 'assets/som/pk-sticker-roll.webp',
      title: 'นับสต๊อก\nสติ๊กเกอร์เครื่องดื่ม',
      sub: 'ตรวจนับจำนวนสติ๊กเกอร์ฉลากที่ใช้ติดขวดเครื่องดื่ม เพื่อให้เพียงพอต่อการผลิตและจำหน่าย',
      char: 'assets/som/som-child.webp', bubble: 'สติ๊กเกอร์เล็ก ๆ\nเติมความสดใส\nให้ทุกขวด ♡',
      script: 'Good Stickers · Brighter Bottles ♡', search: 'ค้นหาสติ๊กเกอร์...',
      col: 'สติ๊กเกอร์ฉลาก', ok: 'พร้อมใช้', out: 'สินค้าหมด',
      totalLabel: 'รายการสติ๊กเกอร์ทั้งหมด', qtyLabel: 'จำนวนรวม'
    },
    {
      id: 'pack', grp: 'บรรจุภัณฑ์', tab: 'บรรจุภัณฑ์\nเครื่องดื่ม', icon: 'assets/som/pk-cup12.webp',
      title: 'นับสต๊อก\nบรรจุภัณฑ์เครื่องดื่ม',
      sub: 'ตรวจนับจำนวนบรรจุภัณฑ์และอุปกรณ์เสิร์ฟ เพื่อให้พร้อมใช้งานเสมอ',
      char: 'assets/som/som-elderly.webp', bubble: 'นับให้ครบ ของพร้อม\nร้านพร้อมเสิร์ฟ\nนะจ๊ะ! ♡',
      script: 'Good Supplies · Brighter Days ♡', search: 'ค้นหาบรรจุภัณฑ์...',
      col: 'รายการบรรจุภัณฑ์', ok: 'พร้อมใช้', out: 'สินค้าหมด',
      totalLabel: 'รายการทั้งหมด', qtyLabel: 'จำนวนรวม'
    }
  ]
};

// หน้ารวมงานของฉัน
export const MYWORK_UI = {
  title: 'งานของฉัน',
  sub: 'ศูนย์รวมงานประจำวันของ{name}\nเลือกเมนูเพื่อเริ่มทำงานได้เลย',
  hero: 'assets/fah/fah-point.webp',
  script: 'สู้ๆ\nไปด้วยกันนะ\n– {name}',
  bubble: 'เก่งมาก\nที่มาทำงานวันนี้ ♡',
  done: 'บันทึกแล้ววันนี้',
  todo: 'รอทำวันนี้',
  ready: 'พร้อมใช้งาน',
  noteTitle: 'หน้านี้เชื่อมโยงไปยังหน้าการทำงานจริงของ{name}',
  noteText: 'ไม่ใช่รายการเช็กลิสต์ แต่เป็นระบบบันทึกข้อมูลจริงในการทำงาน',
  noteScript: 'งานเล็ก ๆ\nสร้างผลลัพธ์ใหญ่ได้ ♡',
  noteChar: 'assets/fah/fah-chibi-kid.webp',
  empty: 'ยังไม่มีงานในระบบของคนนี้',
  emptyHint: 'เพิ่มการ์ดงานได้ที่ตาราง kk_my_task'
};

// หน้านับกล่องและช้อนส้อม
export const PACK_UI = {
  condoTitle: 'สรุปสต็อกคอนโด',
  condoSub: 'ดูจำนวนคงเหลือล่าสุด (อ่านอย่างเดียว)',
  condoNone: 'ยังไม่มีผลนับคอนโดของวันนี้',
  saved: 'บันทึกผลนับ {n} รายการแล้ว',
  histTitle: 'ผลนับย้อนหลัง 7 วัน'
};

// หน้าเตรียมอกไก่นุ่ม
export const CHICKEN_UI = {
  recLabel: 'ควรเตรียม',
  item: 'meat_chicken_soft',
  fields: [
    { f: 'prep', label: 'เตรียม', icon: 'assets/prep/ic3d-prep.webp' },
    { f: 'extra', label: 'เบิกเพิ่ม', icon: 'assets/prep/ic3d-extra.webp' },
    { f: 'waste', label: 'ทิ้ง/เสีย', icon: 'assets/prep/ic3d-waste.webp' },
    { f: 'left', label: 'คงเหลือสด', icon: 'assets/prep/ic3d-left.webp' }
  ],
  statTitle: 'สรุปสถิติการใช้งาน',
  statSub: 'ดูข้อมูลภาพรวมของวันนี้',
  stats: [
    { k: 'cooked', label: 'อาหารสุกเหลือเทียบเนื้อ' },
    { k: 'useBase', label: 'ใช้ไปเบื้องต้น' },
    { k: 'use', label: 'ใช้จริงหลังหักของเหลือ' }
  ],
  waitData: 'รอข้อมูลครบ',
  saved: 'บันทึกข้อมูลอกไก่นุ่มแล้ว',
  note: 'เบิกเพิ่ม = ยอดสะสมของวันนี้ · ใช้จริง = เตรียม + เบิกเพิ่ม − ทิ้ง/เสีย − คงเหลือสด − อาหารสุกเหลือ',
  missing: 'ยังไม่มีรายการอกไก่นุ่มในตารางนับสต๊อก'
};

// หน้าอาหารปรุงสำเร็จเหลือ
export const COOKED_UI = {
  search: 'ค้นหาเมนูอาหาร...',
  cols: [
    { f: 'left', label: 'เหลือ' },
    { f: 'waste', label: 'ทิ้ง / เสีย' },
    { f: 'self', label: 'กินเอง' },
    { f: 'home', label: 'ห่อกลับบ้าน' }
  ],
  keep: 'คงเหลือใช้ต่อ',
  unit: '(ก.)',
  menuCol: 'เมนู',
  noneTitle: 'วันนี้ไม่มีอาหารเหลือ',
  noneSub: 'หากไม่มีอาหารปรุงสำเร็จเหลือในวันนี้ กรุณาเลือก',
  noneAsk: { title: 'บันทึกว่าวันนี้ไม่มีอาหารเหลือ?', text: 'ระบบจะบันทึกช่อง “เหลือ” ของทุกเมนูเป็น 0', ok: 'บันทึก 0 ทุกเมนู' },
  convTitle: 'แปลงเป็นวัตถุดิบ (1:1)',
  convSub: 'คงเหลือใช้ต่อของทุกเมนู แปลงเป็นน้ำหนักวัตถุดิบ แล้วหักออกจากยอดใช้ไปเบื้องต้นของวันนั้น',
  convNone: 'ยังไม่ได้กรอกของเหลือของวันนี้',
  convUnbound: 'เมนูที่ยังไม่ผูกวัตถุดิบ: {names}',
  saved: 'บันทึกของเหลือแล้ว'
};

// หน้ารายได้ประจำวัน
export const INCOME_UI = {
  fill: 'กรอกยอดขายประจำวันนี้',
  placeholder: 'ยังไม่กรอก',
  unit: 'บาท',
  noteLabel: 'หมายเหตุ',
  notePlaceholder: 'เพิ่มหมายเหตุ (ถ้ามี)',
  total: 'รวมยอดขายร้านนี้',
  empty: 'ยังไม่กรอก',
  info: 'ฟ้าและแม่พันใช้ข้อมูลชุดเดียวกัน',
  saved: 'บันทึกรายได้ของ{name}แล้ว',
  histTitle: 'ยอดขายย้อนหลัง 14 วัน'
};

// หน้าบันทึกวันลาทีม
export const LEAVE_UI = {
  who: 'ผู้บันทึก : {name}',
  script: 'บันทึกด้วยความใส่ใจ\nเพื่อทีมที่แข็งแกร่ง ♡',
  staffLabel: 'พนักงานที่ลา',
  staffPick: 'เลือกพนักงานที่ลา',
  fromLabel: 'วันที่เริ่มลา',
  toLabel: 'วันที่สิ้นสุดลา',
  typeLabel: 'ประเภทการลา',
  typePick: 'เลือกประเภทการลา',
  noteLabel: 'หมายเหตุ',
  notePlaceholder: 'ระบุหมายเหตุ (ถ้ามี)...',
  sumTitle: 'สรุปรายละเอียดวันลา',
  sumSub: 'ตรวจสอบข้อมูลก่อนบันทึก',
  sumNone: 'ยังไม่ได้ระบุข้อมูลการลา\nกรุณากรอกข้อมูลด้านบน',
  sumText: '{names} ลา {type} {range} รวม {n} วัน',
  list: 'ดูรายการลา',
  listTitle: 'รายการลาเดือนนี้',
  save: 'บันทึกวันลา',
  saved: 'บันทึกวันลา {n} รายการแล้ว',
  needStaff: 'เลือกพนักงานที่ลาก่อนนะ',
  needType: 'เลือกประเภทการลาก่อนนะ',
  needDate: 'เลือกวันที่เริ่มลาก่อนนะ',
  weekDays: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
  months: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
};

// หน้างานของแม่พัน (2 แท็บ: รายได้ประจำวัน / ส่งพระราม 9) — ข้อความและรูปทั้งหมดอยู่ที่นี่ที่เดียว
export const MAEPAN_UI = {
  back: 'งานของฉัน',
  char: 'assets/chars/maepan-full.webp',
  tabs: [
    { id: 'income', label: 'รายได้ประจำวัน', glyph: 'chart' },
    { id: 'r9', label: 'ส่งพระราม 9', glyph: 'truck' }
  ],
  pages: {
    income: {
      title: 'รายได้ประจำวัน',
      sub: 'บันทึกรายได้จากทุกช่องทางการขาย เพื่อธุรกิจที่เติบโตไปด้วยกัน',
      icon: 'assets/fah/ic-income.webp',
      script: 'ของร่อย สร้างรายได้ดี\nชีวิตดีขึ้นได้ ค่ะ ♥\nแม่พัน',
      save: 'บันทึกรายได้', hist: 'ดูประวัติ'
    },
    r9: {
      title: 'บันทึกส่งพระราม 9',
      sub: 'วัตถุดิบคุณภาพ ส่งต่อความอร่อย ในทุกมื้อ',
      icon: 'assets/r9/truck.webp',
      script: 'อร่อยไปด้วยกัน\nที่พระราม 9 นะคะ ♥\nแม่พัน',
      save: 'ยืนยันส่งแล้ว', hist: 'ประวัติการส่ง'
    }
  },
  storeTitle: 'เลือกและจัดการร้านค้า',
  storeSub: 'สลับร้านเพื่อบันทึกรายได้ของแต่ละร้าน',
  chTitle: 'จัดการช่องทางการขาย',
  chSub: 'เปิด - ปิด ช่องทางที่ใช้งาน และเพิ่มช่องทางใหม่ได้',
  chAdd: 'เพิ่มช่องทาง',
  chAddHint: 'เช่น ShopeeFood',
  chAddTitle: 'เพิ่มช่องทางการขาย',
  chAddName: 'ชื่อช่องทาง',
  chAdded: 'เพิ่มช่องทาง {name} แล้ว',
  chOn: 'เปิดช่องทาง {name} แล้ว',
  chOff: 'ปิดช่องทาง {name} แล้ว',
  chNone: 'ยังไม่มีช่องทางที่เปิดใช้งาน กดเปิดช่องทางด้านบนก่อน',
  tagline: {
    kaprao: 'อร่อย สะอาด ได้สุขภาพ',
    luksao: 'เมนูจากใจ ทำสดใหม่ทุกวัน',
    five: 'อร่อยคุ้ม ทุกมื้อ มีคุณภาพ',
    redrink: 'เครื่องดื่มสดชื่น ดีต่อสุขภาพ'
  },
  r9Note: 'รายการและราคาชุดเดียวกับหน้าพระราม 9 แก้ที่ไหนก็เห็นตรงกันทุกหน้า',
  report: {
    title: 'สร้างรายงาน',
    sub: 'เลือกวันเดียว = รายงานของวันนั้น · เลือกเป็นช่วง = รายงานรวมทั้งช่วง',
    from: 'ตั้งแต่วันที่',
    to: 'ถึงวันที่',
    build: 'สร้าง report รวมยอดค่าวัตถุดิบ',
    print: 'สั่งพิมพ์',
    csv: 'ดาวน์โหลดไฟล์',
    built: 'สร้างรายงานตามช่วงที่เลือกแล้ว',
    empty: 'ไม่มีรอบส่งของในช่วงที่เลือก',
    dayTitle: 'รายงานส่งของวันที่ {d}',
    daySub: 'ส่งอะไรไปบ้าง ราคาต่อหน่วย และยอดรวมของวันนั้น',
    sumTitle: '1. ยอดรวมแต่ละรายการในช่วงที่เลือก',
    sumSub: 'รวมทุกรอบส่งในช่วง {from} – {to}',
    dayListTitle: '2. รายงานแยกตามวันที่ส่ง',
    dayListSub: 'ทุกวันที่มีการส่งภายในช่วงที่เลือก',
    colItem: 'รายการ',
    colQty: 'จำนวน',
    colPrice: 'ราคา/หน่วย',
    colSum: 'รวม (บาท)',
    colDate: 'วันที่',
    colLines: 'จำนวนรายการ',
    colFee: 'ค่าส่ง',
    fee: 'ค่าส่ง',
    feeAll: 'ค่าส่งรวมทุกครั้ง',
    grand: 'ยอดรวมทั้งหมด',
    rounds: '{n} รอบ',
    fileDay: 'รายงานส่งพระราม9-{d}.csv',
    fileRange: 'รายงานส่งพระราม9-{from}-ถึง-{to}.csv'
  },
  noHistory: 'ยังไม่มีรายการย้อนหลัง',
  histSend: 'ประวัติการส่งของ 10 รอบล่าสุด'
};

// แผงจัดการรายการ (วัตถุดิบ/เมนู) ที่ใช้ร่วมกันหลายหน้า ({name} = ชื่อรายการ)
export const LIST_EDIT_UI = {
  btn: 'จัดการรายการ',
  titleItem: 'จัดการรายการวัตถุดิบ',
  titleMenu: 'จัดการรายการเมนู',
  hint: 'แก้ชื่อ · เปลี่ยน/ลบรูป · สลับลำดับ · ลบ — บันทึกลงฐานทันที ทุกหน้าที่ใช้รายการนี้เห็นพร้อมกัน',
  addItem: 'เพิ่มวัตถุดิบ',
  addMenu: 'เพิ่มเมนู',
  close: 'เสร็จ',
  fName: 'ชื่อ',
  fNameHint: 'เช่น อกไก่นุ่ม(ปรุงสำเร็จ)',
  fUnit: 'หน่วย',
  fProtein: 'วัตถุดิบหลักของเมนู',
  noProtein: '— ไม่ผูกวัตถุดิบ —',
  editTitle: 'แก้ไขรายการ',
  needName: 'ยังไม่ได้ใส่ชื่อ',
  photoTitle: 'รูปของ {name}',
  photoUpload: 'เลือกรูปใหม่ (แปลงเป็น WebP ให้เอง)',
  photoClear: 'ลบรูป (กลับไปใช้รูปตั้งต้น)',
  delAsk: 'ลบ "{name}" ?',
  delText: 'รายการจะหายจากทุกหน้า บันทึกเก่ายังอยู่ในฐาน',
  delOk: 'ลบรายการ',
  moveEnd: 'อยู่สุดทางแล้ว',
  saved: 'บันทึกแล้ว',
  saveErr: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'
};

// รอบส่งพระราม 9 ที่ถือว่ายกเลิก (ปกติการลบรอบ = is_current เป็นเท็จ · สถานะในฐานมีแต่ done)
export const R9_VOID_STATUS = ['void', 'cancel', 'cancelled', 'canceled'];

// แถบแจ้งผลการอัปเดตประวัติพยากรณ์ (kk_forecast_history) หลังบันทึก
export const FC_SYNC_UI = {
  fail: 'บันทึกสำเร็จ แต่อัปเดตประวัติพยากรณ์ไม่สำเร็จ',
  partial: 'ข้อมูลจาก {t} อ่านไม่ครบ ได้ {got} จาก {total} แถว จึงหยุดคำนวณส่วนนั้น',
  backfillBtn: 'เติมประวัติจากบันทึกเตรียม',
  backfillAsk: 'เติมประวัติพยากรณ์ตั้งแต่ {from} ถึง {to} ({n} วันเปิด)?',
  backfillNone: 'ประวัติเป็นปัจจุบันแล้ว (ล่าสุด {d}) ไม่มีวันที่ต้องเติม',
  backfillDay: '{d}: เขียน {w} รายการ · ไม่ครบ {i} รายการ{why}',
  backfillSkip: '{d}: ไม่มีบันทึกเตรียม ข้าม',
  backfillErr: '{d}: ล้มเหลว',
  backfillDone: 'เติมประวัติเสร็จ',
  retry: 'ลองใหม่',
  close: 'ปิด',
  skipOld: 'ไม่ทับข้อมูลเดิม (cleaned_v2) ของ {d}: {names}',
  anomaly: 'ตัดออกเพราะสงสัยพิมพ์ผิด (เกิน 5 เท่าของค่ากลาง) {d}: {names}',
  negative: 'ใช้จริงติดลบ ไม่บันทึกเข้าประวัติ {d}: {names}'
};

// ---------- หน้าสูตรอาหาร (การ์ด "สูตรอาหาร" ในหน้าอื่นๆ) ----------

// หมวดสูตร 6 หมวด (type = recipe_type ที่ใช้ตอนเพิ่มสูตรใหม่ ให้ App สูตรจัดแท็บได้ถูก)
export const RECIPE_SECTIONS = [
  { id: 'rice', title: 'หุงข้าว', sub: 'ข้าว น้ำ และเครื่องปรุงต่อหม้อ', icon: 'assets/prep/rice-homali.webp', type: 'food' },
  { id: 'dip', title: 'สูตรน้ำจิ้ม', sub: 'น้ำจิ้มข้าวมันไก่และน้ำจิ้มหน้าร้าน', icon: 'assets/r9/sauce-set.webp', type: 'sauce' },
  { id: 'sauce', title: 'สูตรซอส', sub: 'ซอสผลิตเป็น batch ส่วนเปียก-ส่วนแห้ง', icon: 'assets/r9/sauce-bottle.webp', type: 'sauce' },
  { id: 'food', title: 'สูตรอาหาร', sub: 'เมนูอาหารและของปรุงสำเร็จ', icon: 'assets/r9/dish-kaprao.webp', type: 'food' },
  { id: 'drink', title: 'สูตรเครื่องดื่ม', sub: 'ชา กาแฟ น้ำผลไม้', icon: 'assets/r9/drink-tea.webp', type: 'drink' },
  { id: 'smoothie', title: 'สูตร Smoothie', sub: 'สมูทตี้ต่อแก้วและ batch', icon: 'assets/som/dr-mixed-berry.webp', type: 'drink' }
];

// ข้อความทั้งหมดของหน้าสูตรอาหาร
export const RECIPE_UI = {
  accent: '#2FA38F',
  back: 'อื่นๆ', backList: 'หมวดสูตร', backCalc: 'รายการสูตร',
  hero: { title: 'สูตรอาหาร', sub: 'เลือกหมวด ใส่ปริมาณที่อยากทำ หรือของที่มีอยู่ ระบบคิดส่วนที่เหลือให้', script: 'ชั่งให้ตรง\nรสก็ตรง ♡', icon: 'assets/icons/ic09.webp' },
  count: '{n} สูตร', none: 'ยังไม่มีสูตรในหมวดนี้', noneAdmin: 'กด "เพิ่มสูตร" แล้วกรอกวัตถุดิบได้เลย',
  loading: 'กำลังโหลดสูตร…', loadError: 'โหลดสูตรไม่สำเร็จ', retry: 'ลองใหม่',
  draft: 'ฉบับร่าง', archived: 'ปิดใช้แล้ว',
  want: 'ต้องการทำ', gram: 'กรัม', kg: 'กก.', unitWord: 'หรือจำนวน{unit}',
  colName: 'วัตถุดิบ', colNeed: 'ต้องใช้', colHave: 'มีอยู่',
  left: 'เหลือ {g}', base: 'สูตร ×1 ได้ {g} กรัม', out: 'ได้ทั้งหมด', factor: '× {f} ของสูตร',
  limit: 'ของที่หมดก่อน: {name}', byTarget: 'คิดจากปริมาณที่ต้องการ', idle: 'แสดงสูตร ×1',
  howto: 'กรอก "มีอยู่" ของวัตถุดิบตัวไหนก็ได้ กี่ตัวก็ได้ ระบบคิดว่าทำได้มากสุดเท่าไหร่ ตัวที่เกินแสดงเป็น "เหลือ" · กรอก "ต้องการทำ" ด้วย = ไม่ทำเกินจำนวนนั้น',
  reset: 'ล้างค่า', excluded: 'ไม่รวมในน้ำหนัก', yieldNote: 'หลังปรุงน้ำหนักเหลือ {p}% ของก่อนปรุง',
  subUse: 'ใช้ {g} กรัม', openSub: 'เปิดสูตรนี้',
  steps: 'วิธีทำ', stepsOf: 'วิธีทำ — {name}', stepsNone: 'ยังไม่มีวิธีทำ',
  cycle: 'สูตรย่อยวนกลับมาที่ตัวเอง แก้สูตรก่อนใช้คำนวณ', noSub: 'สูตรย่อยยังไม่มีวัตถุดิบ', empty: 'สูตรนี้ยังไม่มีวัตถุดิบ',
  editBtn: 'แก้สูตร', infoBtn: 'ชื่อ/ค่าตั้ง', stepsBtn: 'แก้วิธีทำ', saveEdit: 'บันทึกสูตร', cancel: 'ยกเลิก', addLine: 'เพิ่มวัตถุดิบ',
  editHint: 'แก้ชื่อหรือปริมาณ (กรัมต่อสูตร ×1) ได้ในช่อง แล้วกด "บันทึกสูตร" · สูตรนี้ใช้ร่วมกับ App สูตร',
  fName: 'ชื่อ', fQty: 'ปริมาณ (กรัม)', fGroup: 'กลุ่ม', fSub: 'ใช้สูตรย่อย', noSubPick: '— วัตถุดิบธรรมดา —',
  fDesc: 'รายละเอียด / โภชนาการ', fNote: 'อัตราผสม / หมายเหตุ', fYield: 'น้ำหนักหลังปรุง (% ของก่อนปรุง)',
  fUnitSize: 'น้ำหนักต่อหน่วย (กรัม) เช่น 1 แก้ว', fUnitLabel: 'ชื่อหน่วย เช่น แก้ว', fPresets: 'ปุ่มขนาด batch (กรัม คั่นด้วย ,)', fExclude: 'กลุ่มที่ไม่รวมน้ำหนัก (คั่นด้วย ,)',
  stepsHint: '1 บรรทัด = 1 ขั้นตอน',
  addRecipe: 'เพิ่มสูตร', newName: 'ชื่อสูตรใหม่', archive: 'ปิดใช้', restore: 'คืนกลับ', up: 'เลื่อนขึ้น', down: 'เลื่อนลง',
  showArchived: 'ดูสูตรที่ปิดใช้', hideArchived: 'ซ่อนสูตรที่ปิดใช้',
  archiveAsk: 'ปิดใช้ "{name}"?', archiveText: 'สูตรยังอยู่ในฐานครบ กด "คืนกลับ" ได้ภายหลัง', archiveOk: 'ปิดใช้',
  saved: 'บันทึกแล้ว', saveErr: 'บันทึกไม่สำเร็จ ข้อมูลในฐานยังไม่ถูกเปลี่ยน',
  conflict: 'มีคนแก้สูตรนี้จากเครื่องอื่นก่อน โหลดฉบับล่าสุดแล้ว กรุณาแก้อีกครั้ง',
  needName: 'ใส่ชื่อก่อน', badQty: 'ปริมาณต้องเป็นตัวเลข 0 ขึ้นไป', moveEnd: 'อยู่สุดแล้ว',
  cycleErr: 'เลือกสูตรย่อยนี้ไม่ได้ เพราะจะวนกลับมาที่สูตรเดิม', onlyAdmin: 'แก้สูตรได้เฉพาะเจ้าของร้าน'
};

// ---------- หน้าสรุปการมาทำงาน (การ์ด "วันลาพนักงาน") และหน้าคะแนนการมาทำงาน (การ์ด "โบนัส") ----------
export const ATTEND_UI = {
  back: 'อื่นๆ',
  loading: 'กำลังโหลดข้อมูลการมาทำงาน…',
  loadError: 'โหลดข้อมูลไม่สำเร็จ',
  retry: 'ลองใหม่',
  none: 'ยังไม่มีพนักงานในระบบ',
  leave: {
    accent: '#8A6BD8', icon: 'assets/icons/ic14.webp',
    title: 'สรุปการมาทำงาน', sub: 'วันที่มาทำงานเทียบวันที่ร้านเปิด นับตั้งแต่วันเริ่มงานของแต่ละคน',
    range: 'ข้อมูลร้านเปิด {a} – {b}',
    worked: 'มา {a} จาก {b} วันที่ร้านเปิด',
    off: 'หยุด {n} วัน',
    start: 'เริ่มนับ {d}',
    startAuto: 'เริ่มนับ {d} (วันแรกที่มีข้อมูลร้าน)',
    startBtn: 'แก้วันเริ่มงาน',
    startTitle: 'วันเริ่มงานของ {name}',
    startField: 'วันที่เริ่มงานวันแรก (เว้นว่าง = นับตั้งแต่วันแรกที่มีข้อมูล)',
    startSaved: 'บันทึกวันเริ่มงานของ {name} แล้ว',
    note: 'วันร้านเปิด = จันทร์–เสาร์ ที่มียอดขายหรือมีบันทึกเตรียมวัตถุดิบ · วันลามาจากหน้าบันทึกวันลาของฟ้า รวมกับแอปเก่า · ลาครึ่งวันนับ 0.5'
  },
  bonus: {
    accent: '#D9537F', icon: 'assets/icons/ic10.webp',
    title: 'คะแนนการมาทำงาน', sub: 'หยุดวันที่ขายดีโดนหักมากกว่าหยุดวันที่ขายน้อย',
    cols: ['พนักงาน', 'ต้องมา', 'หยุด', 'คะแนน', 'ช่วยเพื่อน'],
    units: ['', 'วัน', 'วัน', 'เต็ม 100', 'แต้ม'],
    empty: 'เดือนนี้ยังไม่มีวันที่ร้านเปิด',
    notStarted: 'ยังไม่เริ่มงาน',
    rules: [
      'น้ำหนักวัน = ยอดขายเฉลี่ยวันเดียวกันในสัปดาห์ ÷ ยอดขายเฉลี่ยรวม (14 วันก่อนหน้า นับเฉพาะวันที่มียอดขาย) · ไม่มีข้อมูล = 1',
      'คะแนน = 100 × (1 − น้ำหนักวันหยุด ÷ น้ำหนักวันที่ต้องมา) · ไม่นับวันอาทิตย์และวันที่ร้านปิด · หยุดครึ่งวันนับ 0.5',
      'ช่วยเพื่อน = วันที่ตัวเองมาและมีคนหยุด รับภาระ (น้ำหนักของคนที่หยุด ÷ จำนวนคนที่มา) รวมกัน × 100 ÷ น้ำหนักวันที่ต้องมา · แยกจากคะแนนหลัก'
    ]
  }
};

// ---------- หน้า Grab (การ์ด "Grab" ในอื่นๆ): ออเดอร์ · Import ข้อมูล · รายงานผู้บริหาร ----------

// ชุดข้อมูลที่ import ได้ (id ตรงกับชนิดไฟล์ใน js/shared/grab-parse.js · event = วันที่ไม่มีแถวถือว่าปกติ เช่น วันที่ไม่มีคนแจ้งของขาด)
export const GRAB_SETS = [
  { id: 'sales', label: 'ยอดขายรายวัน', file: 'Sales - วว_ดด_ปป - วว_ดด_ปป.csv', use: 'ยอดขาย ออเดอร์ บิลเฉลี่ย เรตติ้ง' },
  { id: 'transactions', label: 'รายการเงินรายออเดอร์', file: 'Transaction_Store_….csv', use: 'ค่าคอม ส่วนลดร้าน เงินเข้า ยกเลิก' },
  { id: 'transfers', label: 'เงินโอนเข้าบัญชี', file: 'Transfers_Store_….csv', use: 'ยอดโอนแต่ละรอบ', event: true },
  { id: 'menu', label: 'ยอดขายรายเมนู', file: 'Menu Sales - ….csv', use: 'เมนูขายดี สัดส่วนเมนู' },
  { id: 'peak', label: 'ออเดอร์รายชั่วโมง', file: 'Peak Hour Data - ….csv', use: 'ช่วงเวลาขายดี' },
  { id: 'ads_daily', label: 'โฆษณา · รายวันทั้งบัญชี', file: 'ไฟล์โฆษณาที่ไม่มีชื่อแคมเปญ', use: 'ค่าโฆษณา ROAS' },
  { id: 'ads_campaign', label: 'โฆษณา · รายแคมเปญ', file: 'ไฟล์โฆษณามีคอลัมน์ Campaigns Name', use: 'แคมเปญไหนคุ้ม' },
  { id: 'ads_keyword', label: 'โฆษณา · รายคีย์เวิร์ด', file: 'ไฟล์โฆษณามีคอลัมน์ Matched Keywords', use: 'คำค้นที่ได้ออเดอร์', event: true },
  { id: 'offers', label: 'โปรโมชันรายวัน', file: 'Offers - ….csv', use: 'โปรไหนได้ออเดอร์ เงินที่ร้านจ่าย', event: true },
  { id: 'miwi_item', label: 'ของขาด/ผิด · รายเมนู', file: 'MIWI Item Breakdown - ….csv', use: 'เมนูที่โดนแจ้งบ่อย', event: true },
  { id: 'miwi_order', label: 'ของขาด/ผิด · รายออเดอร์', file: 'MIWI Heatmap - ….csv', use: 'ช่วงเวลาที่พลาดบ่อย', event: true }
];

// ภาษีเงินได้บุคคลธรรมดา (ใช้คำนวณในหน้ารายงาน Grab · แก้อัตราที่นี่ที่เดียว)
export const TAX_TH = {
  brackets: [[150000, 0], [300000, 0.05], [500000, 0.10], [750000, 0.15], [1000000, 0.20], [2000000, 0.25], [5000000, 0.30], [Infinity, 0.35]],
  minRate: 0.005, minIncome: 120000, minFloor: 5000, vatLimit: 1800000,
  defaults: { expense_mode: 'flat', flat_rate: 0.6, actual_expense: null, allowance: 60000 }
};

export const GRAB_UI = {
  accent: '#1F9D55', back: 'อื่นๆ', backHub: 'Grab',
  loading: 'กำลังโหลดข้อมูล Grab…', loadError: 'โหลดข้อมูลไม่สำเร็จ', retry: 'ลองใหม่',
  shopAll: 'รวมทุกร้าน', shopPick: 'เลือกร้าน',
  hub: {
    icon: 'assets/icons/ic13.webp', title: 'Grab', sub: 'ออเดอร์ นำเข้าข้อมูล และรายงานผู้บริหารของร้านบน GrabFood',
    cards: [
      { id: 'grab-orders', icon: 'assets/icons/ic13.webp', title: 'ออเดอร์ Grab', sub: 'ออเดอร์รายวัน ยอด ค่าคอม เงินเข้า และเมนูในบิล' },
      { id: 'grab-import', icon: 'assets/icons/ic01.webp', title: 'Import ข้อมูลจาก Grab', sub: 'อัปไฟล์ CSV จาก Grab Merchant และดูว่าข้อมูลช่วงไหนยังขาด' },
      { id: 'grab-report', icon: 'assets/icons/ic15.webp', title: 'รายงานผู้บริหาร', sub: 'ผลงานตรงตัว อัตราส่วน และความสัมพันธ์ที่เจ้าของควรดู' }
    ]
  },
  imp: {
    icon: 'assets/icons/ic01.webp', title: 'Import ข้อมูลจาก Grab', sub: 'เลือกไฟล์ CSV ที่โหลดจาก Grab Merchant ได้ทีละหลายไฟล์ ระบบรู้เองว่าเป็นไฟล์ชุดไหน',
    step1: '1. เลือกร้าน', step2: '2. เลือกไฟล์ CSV', shopHint: 'เลือกร้านก่อน ข้อมูลที่อัปจะบันทึกเป็นของร้านนั้น', shopNow: 'ไฟล์ที่อัปจะบันทึกเป็นของร้าน {s}',
    needShop: 'เลือกร้านด้านบนก่อน จึงบันทึกได้', inFile: 'ชื่อร้านในไฟล์: {s}',
    pick: 'เลือกไฟล์ CSV', pickHint: 'เลือกได้หลายไฟล์พร้อมกัน · ไฟล์ช่วงเดียวกันอัปซ้ำได้ ข้อมูลเดิมถูกทับ ไม่ซ้ำ',
    reading: 'กำลังอ่านไฟล์…', unknown: 'ไม่รู้จักไฟล์นี้', rows: '{n} แถว', saveAll: 'บันทึกเป็นของ {s} ({n} ไฟล์)',
    saving: 'กำลังบันทึก {a}/{b}', done: 'บันทึกแล้ว', fail: 'บันทึกไม่สำเร็จ', savedAll: 'บันทึกข้อมูล Grab แล้ว {n} ไฟล์',
    capped: 'ไฟล์นี้ครบ 10,000 แถวพอดี Grab อาจตัดข้อมูลท้ายไฟล์ ข้อมูลถึง {d} · ให้โหลดทีละช่วงสั้นลง',
    covTitle: 'ข้อมูลที่ได้รับแล้ว', covSub: 'นับตั้งแต่ {a} ถึง {b} (เมื่อวาน)',
    cols: ['ชุดข้อมูล', 'ช่วงที่มี', 'สถานะ'],
    full: 'ครบ', none: 'ยังไม่มี', lack: 'ขาด {n} วัน', lackAt: 'ขาด {r}', more: 'และอีก {n} ช่วง', last: 'อัปล่าสุด {d} · {by}',
    histTitle: 'ไฟล์ที่ import ล่าสุด', histNone: 'ยังไม่เคย import',
    note: 'ช่วงที่มี = ช่วงวันที่ของไฟล์ที่อัปแล้ว (ชื่อไฟล์บอกช่วง หรือวันแรก–วันสุดท้ายในไฟล์) · ชุดที่เป็นเหตุการณ์ (ของขาด/ผิด เงินโอน คีย์เวิร์ด) วันที่ไม่มีแถวถือว่าปกติ'
  },
  ord: {
    icon: 'assets/icons/ic13.webp', title: 'ออเดอร์ Grab', sub: 'ออเดอร์รายวันจากไฟล์ Transaction · แตะออเดอร์เพื่อดูรายละเอียดเงินและเมนู',
    stats: ['ออเดอร์', 'ยอดขายสุทธิ', 'เงินเข้า'], none: 'วันนี้ไม่มีออเดอร์ในระบบ', noneHint: 'import ไฟล์ Transaction ของวันนี้ก่อน',
    cash: 'เงินสด', cancel: 'ยกเลิก', other: 'รายการอื่นของวันนี้', adjust: 'ปรับรายได้', ads: 'ค่าโฆษณา',
    sheet: { gross: 'ยอดตามเมนู', discount: 'ส่วนลดที่ร้านออก', net: 'ยอดขายสุทธิ', comm: 'ค่าคอมมิชชัน + ค่าธรรมเนียม', payout: 'เงินเข้าร้าน', transfer: 'โอนเมื่อ', menu: 'เมนูในบิล (จากรูปบิลที่ถ่ายไว้)', noMenu: 'ไม่มีรูปบิลของออเดอร์นี้', note: 'หมายเหตุลูกค้า', cancelBy: 'ยกเลิกโดย' },
    close: 'ปิด'
  },
  rep: {
    icon: 'assets/icons/ic15.webp', title: 'รายงานผู้บริหาร Grab', sub: 'เทียบกับช่วงก่อนหน้าที่ยาวเท่ากัน · ข้อมูลถึงวันล่าสุดที่ import',
    periods: [{ n: 7, label: '7 วัน' }, { n: 30, label: '30 วัน' }, { n: 90, label: '90 วัน' }, { n: 180, label: '180 วัน' }],
    range: '{a} – {b} · เทียบ {c} – {d}', empty: 'ยังไม่มีข้อมูล Grab ในช่วงนี้', emptyHint: 'ไปที่ Import ข้อมูลจาก Grab ก่อน', noData: 'ไม่มีข้อมูลชุดนี้ในช่วงนี้',
    kpi: { title: 'ผลงานตรงตัว', gross: 'ยอดตามเมนู (ก่อนหักส่วนลด)', net: 'ยอดขายสุทธิ', payout: 'เงินเข้าร้านจริง', orders: 'ออเดอร์', ticket: 'บิลเฉลี่ย', perDay: 'ยอดขายต่อวันเปิด', rating: 'เรตติ้ง', share: 'Grab ต่อยอดทั้งร้าน', vs: 'ช่วงก่อน {v}' },
    money: { title: 'เงินไปไหนบ้าง', sub: 'จากยอดขายสุทธิ 100 บาท ร้านได้เข้าบัญชีจริงเท่าไร', net: 'ยอดขายสุทธิ', comm: 'ค่าคอมมิชชัน + ค่าธรรมเนียม', ads: 'ค่าโฆษณา (รวม VAT)', other: 'ภาษีหัก ณ ที่จ่าย / ปรับอื่นๆ', payout: 'เงินเข้าร้านจริง', keep: 'ร้านเก็บได้ {p} ของยอดขายสุทธิ', claim: 'รวมเงินคืน/หักจากเคลมในยอดขายสุทธิแล้ว {v} บาท', transfer: 'Grab โอนเข้าบัญชีในช่วงนี้ {v} ({n} รอบ)' },
    charts: {
      day: 'รายวัน', avg: 'ค่าเฉลี่ย', avgIs: 'เฉลี่ย', cum: 'ยอดสะสม (แกนขวา)', dailySub: 'แท่ง = รายวัน (เฉพาะวันที่ขาย ข้ามวันหยุด) · เส้นทึบ = ยอดสะสม ยิ่งชันยิ่งขายดี · เส้นประ = ค่าเฉลี่ย', up: 'แนวโน้มขาขึ้น +{p}% ต่อสัปดาห์', down: 'แนวโน้มขาลง −{p}% ต่อสัปดาห์', flat: 'แนวโน้มทรงตัว',
      sales: 'ยอดขายสุทธิรายวัน', salesSub: 'เส้นเข้ม = เฉลี่ย 7 วัน ใช้ดูทิศทาง · เส้นจาง = ยอดจริงแต่ละวัน',
      shops: 'ยอดขายสุทธิสะสมแต่ละร้าน', shopsSub: 'เส้นชันกว่า = ร้านทำยอดเร็วกว่า · ตัวเลข = สัดส่วนยอด และแนวโน้มต่อสัปดาห์',
      weeks: 'ยอดขายสุทธิเฉลี่ยต่อวัน รายสัปดาห์', weeksSub: 'สัปดาห์ จ–อา · ป้ายบนแท่ง = เทียบสัปดาห์ก่อน · สัปดาห์ไม่เต็มก็เทียบได้เพราะเฉลี่ยต่อวัน',
      orders: 'ออเดอร์ต่อวัน', ticket: 'บิลเฉลี่ยรายวัน (ยอดขายสุทธิ ÷ ออเดอร์)', ticketSub: 'แท่ง = รายวัน · เส้นประ = ค่าเฉลี่ยทั้งช่วง',
      money: 'สัดส่วนเงิน รายสัปดาห์', moneySub: 'ต่อยอดขายสุทธิ · ดูว่าเงินเข้าจริงและค่าคอมเปลี่ยนไปทางไหน', keep: 'เงินเข้าร้านจริง', comm: 'ค่าคอม+ค่าธรรมเนียม',
      ads: 'ค่าโฆษณาสะสม vs ยอดจากโฆษณาสะสม', adsSub: 'เส้นเขียวชันกว่าเส้นส้มมาก = โฆษณาคุ้ม · ถ้าสองเส้นเริ่มขนานกัน = เริ่มไม่คุ้ม', spend: 'ค่าโฆษณา', adSales: 'ยอดจากโฆษณา',
      roas: 'ROAS รายสัปดาห์', roasSub: 'จ่ายโฆษณา 1 บาท ได้ยอดกลับกี่บาท',
      menu: 'เมนูขายดี 5 อันดับ รายสัปดาห์', menuSub: 'ขายได้กี่ชิ้นต่อวัน', rating: 'เรตติ้งรายวัน'
    },
    week: { title: 'วันไหนขายดี', sub: 'ยอดขายเฉลี่ยต่อวันเปิด แยกตามวันในสัปดาห์', days: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] },
    heat: { title: 'ชั่วโมงไหนออเดอร์เข้า', sub: 'ออเดอร์เฉลี่ยต่อวัน แยกวัน × ชั่วโมง (เข้ม= มาก)', peak: 'ช่วงพีค {h} · เฉลี่ย {n} ออเดอร์/วัน' },
    ratio: { title: 'อัตราส่วนที่ควรดู', sub: 'ค่าช่วงนี้ · ลูกศร = เทียบช่วงก่อน',
      rows: {
        keep: ['เงินเข้าจริง ÷ ยอดขายสุทธิ', 'ขายสุทธิ 100 บาท เข้าบัญชีจริงกี่บาท'],
        comm: ['ค่าคอม+ค่าธรรมเนียม ÷ ยอดขายสุทธิ', 'Grab หักไปกี่ %'],
        acos: ['ค่าโฆษณา ÷ ยอดขายสุทธิ', 'ต้นทุนการตลาดต่อยอดขายทั้งหมด'],
        roas: ['ยอดจากโฆษณา ÷ ค่าโฆษณา (ROAS)', 'จ่ายโฆษณา 1 บาท ได้ยอดกลับกี่บาท'],
        cpo: ['ค่าโฆษณาต่อ 1 ออเดอร์จากโฆษณา', 'ต้นทุนหาลูกค้า 1 ออเดอร์'],
        adShare: ['ออเดอร์จากโฆษณา ÷ ออเดอร์ทั้งหมด', 'พึ่งโฆษณามากแค่ไหน'],
        ctr: ['คลิก ÷ การแสดงโฆษณา (CTR)', 'รูป/ชื่อร้านดึงดูดแค่ไหน'],
        cvr: ['ออเดอร์ ÷ คลิก (Conversion)', 'เข้าร้านแล้วสั่งจริงกี่ %'],
        cancel: ['ออเดอร์ยกเลิก', 'ต่อออเดอร์ทั้งหมด'],
        cash: ['ออเดอร์เงินสด', 'ต่อออเดอร์ทั้งหมด'],
        issue: ['ออเดอร์ที่ลูกค้าแจ้งของขาด/ผิด', 'ต่อ 1,000 ออเดอร์']
      } },
    menu: { title: 'เมนู', sub: 'ยอด = ยอดขายสุทธิโดยประมาณ (ยอดตามเมนู × สัดส่วนสุทธิของช่วง)', cols: ['เมนู', 'ขาย', 'ยอด', 'สัดส่วน'], pareto: '{n} เมนูแรก ({p} ของเมนูทั้งหมด) ทำยอด 80%', up: 'โตขึ้นมากสุด', down: 'ลดลงมากสุด', count: '{n} เมนูที่ขายได้' },
    ads: { title: 'โฆษณา', sub: 'แคมเปญเรียงตามค่าโฆษณา', cols: ['แคมเปญ', 'ค่าโฆษณา', 'ออเดอร์', 'ROAS'], kwBest: 'คีย์เวิร์ดที่ได้ออเดอร์มากสุด', kwWaste: 'คีย์เวิร์ดที่เสียเงินแต่ไม่มีออเดอร์', kwCols: ['คีย์เวิร์ด', 'คลิก', 'ออเดอร์', 'ค่าโฆษณา'], kwNote: 'ข้อมูลคีย์เวิร์ดมีถึง {d}' },
    pick: {
      custom: 'เลือกเอง', title: 'เลือกช่วงวันที่', own: 'ช่วงของการ์ดนี้', same: 'ช่วงเดียวกับทั้งหน้า', allBills: 'ทุกบิลที่มี',
      from: 'ตั้งแต่', to: 'ถึง', apply: 'ใช้ช่วงนี้', reset: 'ใช้ช่วงของทั้งหน้า', cancel: 'ยกเลิก',
      presets: [['p:7', '7 วัน'], ['p:14', '14 วัน'], ['p:30', '30 วัน'], ['p:60', '60 วัน'], ['p:90', '90 วัน'], ['p:180', '180 วัน'], ['m:0', 'เดือนนี้'], ['m:1', 'เดือนก่อน']]
    },
    mix: {
      billBands: [0, 100, 150, 200, 250, 300, 400, 500], priceBands: [0, 60, 100, 130, 160, 200, 250],
      cats: {
        protein: [{ id: 'salmon', label: 'แซลมอน', re: 'แซลมอน' }, { id: 'shrimp', label: 'กุ้ง', re: 'กุ้ง' }, { id: 'duck', label: 'เป็ด', re: 'เป็ด' }, { id: 'pork', label: 'หมู', re: 'หมู' }, { id: 'chicken', label: 'ไก่', re: 'ไก่' }, { id: 'beef', label: 'เนื้อวัว', re: 'เนื้อ' }, { id: 'fish', label: 'ปลาอื่นๆ', re: 'ปลา' }],
        style: [{ id: 'xl', label: 'จานใหญ่ XL', re: 'XL' }, { id: 'kaprao', label: 'กะเพรา', re: 'กะเพรา|กระเพรา' }, { id: 'fried', label: 'ข้าวผัด', re: 'ข้าวผัด' }, { id: 'larb', label: 'ลาบ', re: 'ลาบ' }, { id: 'noodle', label: 'วุ้นเส้น/Low carb', re: 'วุ้นเส้น|เส้นแก้ว|Low Carb' }, { id: 'garlic', label: 'ผัด/คั่วกระเทียม', re: 'กระเทียม' }, { id: 'grill', label: 'ย่าง', re: 'ย่าง' }],
        side: '^(ไข่|ข้าว\\d|ข้าวไรซ์|ข้าวหอม|ปลา\\d|เนื้อ\\s?\\d|เพิ่ม)', addon: 'เพิ่ม|ไข่'
      },
      distTitle: 'ยอดต่อบิลกระจายตัวยังไง', distSub: '{n} บิลในช่วงนี้ · บิลเฉลี่ย ฿{a} (ค่าเฉลี่ยตัวเดียวไม่บอกว่าลูกค้าส่วนใหญ่จ่ายเท่าไร)',
      median: 'ครึ่งหนึ่งจ่ายไม่เกิน', pctHint: 'บิล 25% / 50% / 75% / 90% จ่ายไม่เกินเท่านี้ · ห่างกันมาก = ลูกค้าหลายกลุ่ม',
      shareBills: '% ของจำนวนบิล', shareSales: '% ของยอดขาย', shareUnits: '% ของจำนวนที่ขาย',
      main: 'ลูกค้าหลัก:', mainIs: 'บิล ฿{b} มีมากสุด {p} ของบิล (ทำยอด {s})', money: 'กลุ่มทำเงินหลัก:', moneyIs: 'บิล ฿{b} ทำยอดมากสุด {p} ของยอด (จากบิลแค่ {n})', top20: 'บิลที่แพงสุด 20% ทำยอด {p} ของทั้งหมด',
      basketTitle: 'บิลแต่ละขนาดสั่งอะไร', basketSub: 'จากบิลที่ถ่ายรูปไว้และจับคู่กับออเดอร์ได้ {n} บิล ({a} – {b}) · ไม่ขึ้นกับช่วงที่เลือก',
      segTitle: 'สั่งกี่จานต่อบิล', segCols: ['กลุ่ม', '% บิล', '% ยอด', 'บิลเฉลี่ย'], seg: ['1 จาน (กินคนเดียว)', '2 จาน', '3 จานขึ้นไป (สั่งกลุ่ม)'],
      proteinTitle: 'ชอบเนื้อสัตว์อะไร', styleTitle: 'ชอบเมนูแนวไหน', catCols: ['หมวด', '% จาน', 'บิลเฉลี่ย', 'ดัชนี'], idxHint: 'ดัชนี = บิลเฉลี่ยของบิลที่มีหมวดนี้ ÷ บิลเฉลี่ยทั้งหมด · มากกว่า 1 = ลูกค้ากลุ่มนี้จ่ายมากกว่าปกติ',
      bandTitle: 'ขนาดบิล × พฤติกรรม', bandCols: ['บิล', 'จาน/บิล', 'สั่งของเพิ่ม', 'เนื้อยอดนิยม'],
      pairs: 'เนื้อที่มักสั่งมาด้วยกัน', pairsHint: 'lift มากกว่า 1 = มาคู่กันบ่อยกว่าบังเอิญ เหมาะทำเซ็ตคู่', pairIs: '{n} บิล · lift {l}', berry: 'บิลที่เลือกข้าวไรซ์เบอร์รี่ {p}',
      priceTitle: 'ขั้นราคาเมนูที่ขายดี', priceSub: 'ราคาต่อชิ้น = ยอดตามเมนู ÷ จำนวน · ดูว่าลูกค้ายอมจ่ายต่อจานช่วงไหน', priceBest: 'ราคา ฿{b} ขายได้มากสุด {p} ของจำนวนชิ้น ({n} รายการ)'
    },
    tax: {
      title: 'ภาษีเงินได้บุคคลธรรมดา ปี {y} (ประมาณ)', sub: 'คิดจากยอดขายสุทธิ Grab ทั้งปี · เงินได้ประเภทที่ 40(8)',
      flat: 'หักเหมา {p}%', actual: 'หักตามจริง', actualIn: 'ค่าใช้จ่ายจริงทั้งปี (บาท)',
      basis: 'ยอดขายสุทธิที่มีในระบบ {a} – {b} = {v} บาท → คาดทั้งปีจากเฉลี่ยต่อวัน', partial: 'ข้อมูลไม่ครบตั้งแต่ต้นปี',
      income: 'เงินได้ทั้งปี (คาด)', expFlat: 'หักค่าใช้จ่ายเหมา {p}%', expActual: 'หักค่าใช้จ่ายตามจริง', allowance: 'ลดหย่อนส่วนตัว', net: 'เงินได้สุทธิ',
      step: 'ขั้น {r}% ({v} บาท)', progressive: 'ภาษีตามขั้นบันได', minTax: 'ภาษีขั้นต่ำ {r} ของเงินได้', pay: 'ภาษีที่ต้องจ่ายทั้งปี', useMin: '(ใช้แบบขั้นต่ำเพราะมากกว่า)',
      eff: 'คิดเป็น {p} ของยอดขายสุทธิ · เก็บไว้เดือนละ ~฿{m}', vat: 'ยอดขายทั้งปีเกิน {v} บาท ต้องจดทะเบียน VAT',
      allHint: 'แต่ละร้านบัญชีคนละเจ้าของ จึงคิดภาษีแยกร้าน · แตะแท็บร้านเพื่อดูรายละเอียดและเปลี่ยนวิธีหักค่าใช้จ่าย', annualShort: 'คาดทั้งปี {v}',
      noData: 'ยังไม่มียอดขายของปีนี้', saved: 'บันทึกวิธีคิดภาษีแล้ว', saveFail: 'บันทึกไม่สำเร็จ',
      note: 'เป็นตัวเลขประมาณ คิดเฉพาะรายได้ Grab ยังไม่รวมรายได้ช่องทางอื่นและลดหย่อนอื่น · ภาษีขั้นต่ำ 0.5% ใช้เมื่อเงินได้ ≥ 120,000 บาท และมากกว่าภาษีขั้นบันได'
    },
    quality: { title: 'คุณภาพออเดอร์', sub: 'ลูกค้าแจ้งของขาดหรือของผิด', orders: 'ออเดอร์มีปัญหา', missing: 'ของขาด', wrong: 'ของผิด', rating: 'เรตติ้งเฉลี่ย', items: 'เมนูที่โดนแจ้งบ่อย', hours: 'ชั่วโมงที่พลาดบ่อย', none: 'ไม่มีการแจ้งของขาด/ผิดในช่วงนี้' },
    note: 'ทุกตัวเลขที่ใช้ยอดขาย ใช้ยอดขายสุทธิ = ยอดตามเมนู − ส่วนลดที่ร้านออก − ส่วนลดค่าส่งที่ร้านออก ± เงินคืน/หักจากเคลม (ไฟล์ Transaction · วันที่ไม่มีใช้ยอดสุทธิจากไฟล์ Sales) · เรตติ้งจากไฟล์ Sales · เงินเข้า ค่าคอม ส่วนลด มาจากไฟล์ Transaction · ค่าโฆษณาใช้ยอดที่ถูกเรียกเก็บจริง (Billable) · Grab ต่อยอดทั้งร้าน เทียบกับยอดขายรายวันที่ฟ้ากรอก เฉพาะวันที่มีทั้งสองอย่าง'
  }
};
