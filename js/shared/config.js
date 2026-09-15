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

// ---------- หน้านับสต๊อก (รายการมาจากตาราง kk_count_item ในฐานข้อมูล) ----------

// หมวดของรายการนับ (ต้องตรงกับช่อง grp ในฐาน) — ไอคอนและสีประจำหมวด
export const STOCK_GROUPS = [
  { id: 'เนื้อสัตว์', label: 'เนื้อสัตว์', icon: 'assets/cats/beef.webp', color: '#C1443C', tint: '#FDECEA' },
  { id: 'ผัก', label: 'ผัก', icon: 'assets/cats/veg.webp', color: '#4E9A3E', tint: '#EEF7E9' },
  { id: 'ซอส/เครื่องปรุง', label: 'ซอส/เครื่องปรุง', icon: 'assets/cats/sauce.webp', color: '#C98A2E', tint: '#FDF3E2' },
  { id: 'ข้าว', label: 'ข้าว', icon: 'assets/prep/rice-homali.webp', color: '#B37A45', tint: '#FBF1E5' },
  { id: 'ไข่', label: 'ไข่', icon: 'assets/stock/eggs.webp', color: '#E08A2E', tint: '#FDF1DF' },
  { id: 'เครื่องดื่ม', label: 'เครื่องดื่ม', icon: 'assets/icons/ic07.webp', color: '#3B7FD4', tint: '#EAF2FD' },
  { id: 'บรรจุภัณฑ์', label: 'บรรจุภัณฑ์', icon: 'assets/cats/pack.webp', color: '#8B63C9', tint: '#F4EEFB' }
];

// รูปสำรองประจำหมวด (ใช้เมื่อรายการนั้นยังไม่ได้จับคู่รูปไว้)
export const STOCK_PHOTO_BY_GROUP = {
  'เนื้อสัตว์': 'assets/cats/beef.webp',
  'ผัก': 'assets/stock/veg-mix.webp',
  'ซอส/เครื่องปรุง': 'assets/stock/house-sauce.webp',
  'ข้าว': 'assets/prep/rice-homali.webp',
  'ไข่': 'assets/stock/eggs.webp',
  'เครื่องดื่ม': 'assets/stock/beverage.webp',
  'บรรจุภัณฑ์': 'assets/stock/packaging.webp'
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
  veg_basil: 'assets/food/basil.webp',
  veg_garlic: 'assets/food/garlic.webp',
  veg_birdchili: 'assets/food/chili.webp',
  veg_spurchili: 'assets/r9/chili-dry.webp',
  sauce_kaprao: 'assets/food/sauce-bowl.webp',
  sauce_kaprao_boran: 'assets/food/sauce-bowl.webp',
  sauce_glassnoodle: 'assets/prep/noodle-glass.webp',
  season_chilipaste: 'assets/stock/seasoning.webp',
  season_kikkoman: 'assets/stock/seasoning.webp',
  season_msg: 'assets/stock/powder.webp',
  season_ricebranoil: 'assets/food/oil-bottle.webp',
  season_chinesewine: 'assets/food/sauce-bottle.webp',
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

// ข้อความทั้งหมดของหน้าเตรียม-เหลือ (ส่วนที่เพิ่มรอบนี้)
export const PREP_UI = {
  loading: 'กำลังโหลดข้อมูลจากฐาน...',
  loadError: 'ต่อฐานข้อมูลไม่ได้ ลองใหม่อีกครั้ง',
  retry: 'ลองใหม่',
  saveError: 'บันทึกไม่สำเร็จ ตัวเลขเดิมยังอยู่ ลองใหม่อีกครั้ง',
  dateToday: 'วันนี้',
  datePast: 'ย้อนหลัง {n} วัน',
  dateFuture: 'ล่วงหน้า {n} วัน',
  dateBand: 'กำลังกรอกข้อมูลของวันที่ {d} ({s})',
  dateBack: 'กลับมาวันนี้',
  farTitle: 'วันที่ไกลจากวันนี้มาก',
  farText: 'แน่ใจนะว่าเป็นวันที่ {d}?',
  farOk: 'ยืนยันวันที่นี้',
  histRev: 'ครั้งที่ {n}',
  histCur: '← ใช้อยู่',
  histClose: 'ปิด',
  histBadge: 'แก้แล้ว {n} ครั้ง · กดดูประวัติ',
  rec: 'แนะนำ —',
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
  assumeStockNote: 'ใช้ไปเบื้องต้น (ยังไม่หักปรุงสุกเหลือ) = เตรียม + เบิกเพิ่ม − ทิ้ง/เสีย − คงเหลือสด และถูกนำไปหักจากสต๊อกครัวกลาง — ถ้ามีการนับสต๊อกหลังจากนั้น ระบบยึดยอดนับจริงแทน',
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

// ---------- พยากรณ์: สูตรที่ล็อกไว้ต่อรายการ (ห้ามเปลี่ยนเอง เปลี่ยนได้เฉพาะตอนจบรอบผ่านหน้าตรวจสอบสมการ) ----------
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
  cols: [['#', ''], ['รายการ', '(สูตรที่ล็อก)'], ['เฉลี่ย 6 วัน', '(กก.)'], ['พยากรณ์', '(กก.)'], ['ต่ำสุด', '(กก.)'], ['สูงสุด', '(กก.)'], ['แนวโน้ม', ''], ['WAPE', '(%)'], ['ย้อนหลัง 10 วัน', '']],
  status: {
    insufficient: 'ข้อมูลยังไม่พอ',
    no_band: 'รอ residual ครบ 8 ค่าเพื่อคำนวณกรอบ',
    no_theo: 'รอข้อมูลยอดขายแปลงสูตร (theo_kg)',
    no_model: 'ยังไม่กำหนดสูตร'
  },
  trends: {
    up: { label: 'ขึ้น', arrow: '↗', color: '#E0453C', tint: '#FDECEA' },
    down: { label: 'ลง', arrow: '↘', color: '#1E7A3C', tint: '#EAF6EC' },
    flat: { label: 'คงที่', arrow: '→', color: '#3B8BE0', tint: '#EAF3FD' }
  },
  rules: 'กติกา: วัดผลเฉพาะวันที่ทำนายล่วงหน้าจริง · กรอบ = ±{band}SD ของ residual {sd} ค่าล่าสุด (ต้อง ≥{min} ค่า) · ความแม่นยำ/WAPE ต้องมี ≥{days} วัน · ข้ามวันที่ไม่มีข้อมูล ห้ามเติมค่าแทน · ไม่นับวันอาทิตย์ · กฎทุกข้อแก้ได้ที่หน้า "ตั้งค่ากฎการทดสอบ"',
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
  statusDone: 'เปลี่ยนสถานะ {c} เป็นกำลังทดสอบแล้ว'
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

// ---------- หน้าบัญชีและรหัสผ่าน ----------

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
  sub: 'รหัสพนักงาน 4 หลัก + PIN 4 หลัก สำหรับเข้าแอป',
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
    missing: 'ไม่พบบัญชีนี้'
  }
};
