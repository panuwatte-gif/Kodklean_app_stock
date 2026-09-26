// ข้อมูลตั้งต้นของแอป (ยังไม่ต่อฐานจริง) — ห้ามให้หน้าจอ import ไฟล์นี้ตรง ต้องผ่าน data.js
export const MOCK_DATA = {
  // รายชื่อพนักงาน: อาเฮีย(owner) แม่พัน(owner) ฟ้า(หัวหน้า) เอมมี่ ส้ม อัด
  staff: [
    {
      id: 'ahhia', name: 'อาเฮีย', role: 'owner', roleLabel: '',
      accent: '#1F4FB0', tint: '#E9EFFC', photo: 'assets/chars/ahhia-port.webp',
      duties: ['รายได้ / ส่งของพระราม 9', 'ขายซอส']
    },
    {
      id: 'maepan', name: 'แม่พัน', role: 'owner', roleLabel: '',
      accent: '#EE5C93', tint: '#FDEDF2', photo: 'assets/chars/maepan-port.webp',
      duties: ['รายได้ / ส่งของพระราม 9', 'ขายซอส']
    },
    {
      id: 'fah', name: 'ฟ้า', role: 'lead', roleLabel: 'หัวหน้า',
      accent: '#347CD5', tint: '#EAF4FD', photo: 'assets/chars/fah-port.webp',
      duties: ['packaging / อกไก่นุ่ม', 'อาหารเหลือ / รายได้', 'ส่งของ / ขายซอส / วันลา']
    },
    {
      id: 'emmy', name: 'เอมมี่', role: 'staff', roleLabel: 'พนักงาน',
      accent: '#A87A08', tint: '#FEF6E2', photo: 'assets/chars/emmy-port.webp',
      duties: ['สต๊อกผัก / ซอส', 'เครื่องปรุง']
    },
    {
      id: 'som', name: 'ส้ม', role: 'staff', roleLabel: 'พนักงาน',
      accent: '#B65B0C', tint: '#FFF3E4', photo: 'assets/chars/som-port.webp',
      duties: ['สต๊อกเครื่องดื่ม / ขวด', 'สติ๊กเกอร์ / เครื่องดื่มพร้อมขาย', 'แปลภาษาพม่า']
    },
    {
      id: 'ad', name: 'อัด', role: 'staff', roleLabel: 'พนักงาน',
      accent: '#1E7A3C', tint: '#E8F4EA', photo: 'assets/chars/ad-port.webp',
      duties: ['สต๊อกเนื้อสัตว์', 'เตรียมวัตถุดิบเนื้อสัตว์']
    }
  ],

  // หมวดหลักของสต๊อก (เจ้าของเพิ่ม/แก้เองได้ผ่านปุ่ม "เพิ่มหมวด")
  stockCats: [
    { id: 'meat', label: 'เนื้อสัตว์', icon: 'assets/cats/pork.webp', color: '#E1567F', tint: '#FDECF1' },
    { id: 'sea', label: 'อาหารทะเล', icon: 'assets/cats/fish.webp', color: '#3B7FD4', tint: '#EAF2FD' },
    { id: 'veg', label: 'ผัก', icon: 'assets/cats/veg.webp', color: '#4E9A3E', tint: '#EEF7E9' },
    { id: 'season', label: 'เครื่องปรุง', icon: 'assets/cats/season.webp', color: '#C98A2E', tint: '#FDF3E2' },
    { id: 'sauce', label: 'ซอส', icon: 'assets/cats/sauce.webp', color: '#8B63C9', tint: '#F4EEFB' },
    { id: 'pack', label: 'แพ็คเกจจิ้ง', icon: 'assets/cats/pack.webp', color: '#B37A45', tint: '#FBF1E5' }
  ],

  // หมวดย่อยของแต่ละหมวดหลัก (cat = id ของหมวดหลัก)
  stockSubs: [
    { id: 'beef', label: 'เนื้อ', cat: 'meat', icon: 'assets/cats/beef.webp' },
    { id: 'pork', label: 'หมู', cat: 'meat', icon: 'assets/cats/pork.webp' },
    { id: 'chicken', label: 'ไก่', cat: 'meat', icon: 'assets/cats/chicken.webp' },
    { id: 'duck', label: 'เป็ด', cat: 'meat', icon: 'assets/cats/duck.webp' },
    { id: 'shrimp', label: 'กุ้ง', cat: 'sea', icon: 'assets/cats/shrimp.webp' },
    { id: 'salmon', label: 'แซลมอน', cat: 'sea', icon: 'assets/cats/salmon.webp' },
    { id: 'fish', label: 'ปลาอื่นๆ', cat: 'sea', icon: 'assets/cats/fish.webp' }
  ],

  // ยอดสต๊อกของวันที่นับ (ตัวเลขสรุปบนการ์ดหัวหน้า)
  stockSummary: { date: '2 ก.ย.', all: 68, low: 7, out: 2 },

  // รายการในสต๊อก: cat = หมวดหลัก, sub = หมวดย่อย, kitchen/condo = คงเหลือแต่ละที่, min = จุดเตือนใกล้หมด
  stock: [
    { id: 'chicken-mince', name: 'อกไก่บด', cat: 'meat', sub: 'chicken', unit: 'กก.', kitchen: 4.5, condo: 8, min: 15, photo: 'assets/food/chicken-mince.webp' },
    { id: 'chicken-breast', name: 'อกไก่นุ่ม', cat: 'meat', sub: 'chicken', unit: 'กก.', kitchen: 2, condo: 4, min: 3, photo: 'assets/food/chicken-breast.webp' },
    { id: 'chicken-tender', name: 'สันในไก่', cat: 'meat', sub: 'chicken', unit: 'กก.', kitchen: 1.5, condo: 3.5, min: 2.5, photo: 'assets/food/chicken-tender.webp' },
    { id: 'pork-soft', name: 'หมูนุ่ม', cat: 'meat', sub: 'pork', unit: 'กก.', kitchen: 1.5, condo: 2.5, min: 2, photo: 'assets/food/pork-chop.webp' },
    { id: 'shrimp-mid', name: 'กุ้งกลาง', cat: 'sea', sub: 'shrimp', unit: 'กก.', kitchen: 0.5, condo: 1, min: 2, photo: 'assets/food/shrimp-peeled.webp' },
    { id: 'salmon', name: 'แซลมอน', cat: 'sea', sub: 'salmon', unit: 'กก.', kitchen: 1.2, condo: 2, min: 1.5, photo: 'assets/food/salmon.webp' },
    { id: 'basil', name: 'ใบกะเพรา', cat: 'veg', sub: null, unit: 'กก.', kitchen: 0.3, condo: 0, min: 0.5, photo: 'assets/food/basil.webp' },
    { id: 'kaprao-sauce', name: 'ซอสกะเพรา', cat: 'sauce', sub: null, unit: 'กก.', kitchen: 1.5, condo: 2.5, min: 2, photo: 'assets/food/sauce-bowl.webp' },
    { id: 'box-750', name: 'กล่องอาหาร 750 มล.', cat: 'pack', sub: null, unit: 'ใบ', kitchen: 80, condo: 160, min: 100, photo: 'assets/food/box-1.webp' },
    { id: 'thai-tea', name: 'ขวดชาไทยพร้อมขาย', cat: 'pack', sub: null, unit: 'ขวด', kitchen: 24, condo: 0, min: 12, photo: 'assets/food/tea-bottle.webp' }
  ],

// ---------- หน้าพระราม 9 (ตารางแม่ชุดเดียว ทุกแท็บ/ทุกหน้าใช้ร่วมกัน ห้ามสลับลำดับ) ----------

  // หมวดของรายการส่งของ — ลำดับตามตารางที่เจ้าของให้มา
  rama9Cats: [
    { id: 'meat', label: 'เนื้อสัตว์', icon: 'assets/r9/meat-mix.webp', color: '#1F6FA8', tint: '#D7EBF8' },
    { id: 'veg', label: 'ผัก', icon: 'assets/r9/veg-mix.webp', color: '#25794A', tint: '#DDF2E2' },
    { id: 'sauce', label: 'ซอส', icon: 'assets/r9/sauce-bottle.webp', color: '#9A6410', tint: '#FCE9C4' },
    { id: 'cooked', label: 'อาหารปรุงสำเร็จ', icon: 'assets/r9/dish-kaprao.webp', color: '#8E3E96', tint: '#F5DDF3' },
    { id: 'drink', label: 'เครื่องดื่ม', icon: 'assets/r9/drink-orange.webp', color: '#B9436F', tint: '#FCE1EA' }
  ],

  // รายการส่งของ — ชื่อ ลำดับ ราคา และปริมาณ ตรงตามตาราง "รอบส่ง: 5 Sep26" ที่เจ้าของให้มา
  rama9Items: [
    { id: 'r9-chicken-mince', name: 'อกไก่บด', cat: 'meat', unit: 'กก.', qty: 14, price: 84, photo: 'assets/r9/chicken-mince.webp' },
    { id: 'r9-chicken-soft', name: 'อกไก่นุ่ม', cat: 'meat', unit: 'กก.', qty: 3, price: 96, photo: 'assets/r9/chicken-breast.webp' },
    { id: 'r9-chicken-tender', name: 'สันในไก่', cat: 'meat', unit: 'กก.', qty: 0, price: 92, photo: 'assets/r9/chicken-tender.webp' },
    { id: 'r9-beef-mince', name: 'เนื้อสับ', cat: 'meat', unit: 'กก.', qty: 9, price: 203.5, photo: 'assets/prep/meat-beef-mince.webp' },
    { id: 'r9-beef-cheek', name: 'แก้มวัวตุ่น', cat: 'meat', unit: 'กก.', qty: 0, price: 300, photo: 'assets/food/beef-steak.webp' },
    { id: 'r9-beef-stew', name: 'เนื้อตุ๋น', cat: 'meat', unit: 'กก.', qty: 0, price: 300, photo: 'assets/r9/meat-mix.webp' },
    { id: 'r9-pork-slice', name: 'หมูสไลด์', cat: 'meat', unit: 'กก.', qty: 0, price: 207, photo: 'assets/prep/meat-pork-slice.webp' },
    { id: 'r9-salmon', name: 'แซลมอน', cat: 'meat', unit: 'กก.', qty: 5, price: 176, photo: 'assets/prep/meat-salmon.webp' },
    { id: 'r9-duck-mince', name: 'เป็ดสับ', cat: 'meat', unit: 'กก.', qty: 0, price: 90, photo: 'assets/prep/meat-duck-mince.webp' },
    { id: 'r9-shrimp-mid', name: 'กุ้งกลาง', cat: 'meat', unit: 'กก.', qty: 0, price: 323, photo: 'assets/prep/meat-shrimp-mid.webp' },
    { id: 'r9-shrimp-big', name: 'กุ้งใหญ่', cat: 'meat', unit: 'กก.', qty: 0, price: 341, photo: 'assets/prep/meat-shrimp-big.webp' },
    { id: 'r9-basil', name: 'ใบกะเพรา', cat: 'veg', unit: 'กก.', qty: 1.5, price: 240, photo: 'assets/r9/basil.webp' },
    { id: 'r9-garlic', name: 'กระเทียม', cat: 'veg', unit: 'กก.', qty: 0, price: 0, photo: 'assets/r9/garlic.webp' },
    { id: 'r9-chili-dry', name: 'พริกแห้ง', cat: 'veg', unit: 'กก.', qty: 0, price: 0, photo: 'assets/r9/chili-dry.webp' },
    { id: 'r9-sauce-kaprao', name: 'ซอสกะเพรา', cat: 'sauce', unit: 'กก.', qty: 0, price: 4, photo: 'assets/r9/sauce-bottle.webp' },
    { id: 'r9-sauce-all', name: 'ซอสอเนกประสงค์', cat: 'sauce', unit: 'กก.', qty: 0, price: 4, photo: 'assets/food/sauce-bottle.webp' },
    { id: 'r9-sauce-kaprao-old', name: 'ซอสกะเพราโบราณ', cat: 'sauce', unit: 'กก.', qty: 0, price: 4, photo: 'assets/r9/sauce-set.webp' },
    { id: 'r9-sauce-chili-salt', name: 'ซอสคั่วพริกเกลือ', cat: 'sauce', unit: 'กก.', qty: 0, price: 9, photo: 'assets/food/sauce-bowl.webp' },
    { id: 'r9-sauce-salted-egg', name: 'ซอสไข่เค็ม', cat: 'sauce', unit: 'กก.', qty: 0, price: 9, photo: 'assets/food/sauce-bowl.webp' },
    { id: 'r9-sauce-teriyaki', name: 'ซอสเทอริยากิ', cat: 'sauce', unit: 'กก.', qty: 0, price: 9, photo: 'assets/food/sauce-bottle.webp' },
    { id: 'r9-jaew', name: 'น้ำจิ้มแจ่ว', cat: 'sauce', unit: 'กก.', qty: 0, price: 1.5, photo: 'assets/food/sauce-bowl.webp' },
    { id: 'r9-prik-nampla', name: 'พริกน้ำปลา', cat: 'sauce', unit: 'กก.', qty: 0, price: 1.5, photo: 'assets/food/chili.webp' },
    { id: 'r9-kaprao-chicken', name: 'กะเพราอกไก่', cat: 'cooked', unit: 'กล่อง', qty: 0, price: 143.8, photo: 'assets/r9/dish-kaprao.webp' },
    { id: 'r9-kaprao-chicken-soft', name: 'กะเพราไก่นุ่ม', cat: 'cooked', unit: 'กล่อง', qty: 0, price: 139.2, photo: 'assets/dishes/dish-kaprao-chicken-soft.webp' },
    { id: 'r9-kaprao-beef', name: 'กะเพราเนื้อสับ', cat: 'cooked', unit: 'กล่อง', qty: 0, price: 281.8, photo: 'assets/dishes/dish-kaprao-beef.webp' },
    { id: 'r9-kaprao-salmon', name: 'กะเพราแซลมอน', cat: 'cooked', unit: 'กล่อง', qty: 0, price: 215.6, photo: 'assets/dishes/dish-kaprao-salmon.webp' },
    { id: 'r9-nam-som-jeed', name: 'น้ำส้มจี๊ด', cat: 'drink', unit: 'ขวด', qty: 3, price: 13, photo: 'assets/r9/drink-orange.webp' },
    { id: 'r9-nam-som-khing', name: 'น้ำส้มขิง', cat: 'drink', unit: 'ขวด', qty: 0, price: 18, photo: 'assets/r9/drink-ginger.webp' },
    { id: 'r9-cha-angun', name: 'ชาองุ่น', cat: 'drink', unit: 'ขวด', qty: 0, price: 14, photo: 'assets/r9/drink-tea.webp' },
    { id: 'r9-honey-lemon', name: 'น้ำผึ้งเลมอน', cat: 'drink', unit: 'ขวด', qty: 3, price: 10, photo: 'assets/r9/drink-honey-lemon.webp' },
    { id: 'r9-lamyai', name: 'น้ำลำไย', cat: 'drink', unit: 'ขวด', qty: 0, price: 14, photo: 'assets/r9/drink-longan.webp' },
    { id: 'r9-coconut-sugar', name: 'น้ำตาลสดมะพร้าว', cat: 'drink', unit: 'ขวด', qty: 3, price: 14, photo: 'assets/r9/drink-juice.webp' },
    { id: 'r9-baitoey', name: 'น้ำใบเตย', cat: 'drink', unit: 'ขวด', qty: 3, price: 16, photo: 'assets/r9/drink-juice.webp' },
    { id: 'r9-thai-tea-coconut', name: 'ชาไทยมะพร้าว', cat: 'drink', unit: 'ขวด', qty: 0, price: 24, photo: 'assets/food/tea-bottle.webp' },
    { id: 'r9-matcha-pistachio', name: 'มัทฉะพิสทาชิโอ', cat: 'drink', unit: 'ขวด', qty: 0, price: 36, photo: 'assets/r9/drink-juice.webp' }
  ],

  // ค่าที่กำลังกรอกของรอบส่งวันนี้ (ยังไม่กดบันทึกและส่ง)
  rama9Draft: { date: '2026-09-05', fee: 0, note: '' },

  // ประวัติรอบส่งของ — ปริมาณตามตาราง "รอบที่1/2/3" ที่เจ้าของให้มา
  rama9Rounds: [
    { id: 'r9r-1', no: 1, date: '2026-09-01', time: '09:15', status: 'done', fee: 0,
      lines: [{ id: 'r9-chicken-mince', qty: 14, price: 84 }, { id: 'r9-chicken-soft', qty: 3, price: 96 }, { id: 'r9-beef-mince', qty: 9, price: 203.5 }, { id: 'r9-salmon', qty: 5, price: 176 }, { id: 'r9-basil', qty: 1.5, price: 240 }, { id: 'r9-nam-som-jeed', qty: 3, price: 13 }, { id: 'r9-honey-lemon', qty: 3, price: 10 }, { id: 'r9-coconut-sugar', qty: 3, price: 14 }, { id: 'r9-baitoey', qty: 3, price: 16 }] },
    { id: 'r9r-2', no: 2, date: '2026-09-03', time: '14:20', status: 'done', fee: 0,
      lines: [{ id: 'r9-chicken-mince', qty: 14, price: 84 }, { id: 'r9-chicken-soft', qty: 3, price: 96 }, { id: 'r9-beef-mince', qty: 9, price: 203.5 }, { id: 'r9-salmon', qty: 5, price: 176 }, { id: 'r9-basil', qty: 1.5, price: 240 }, { id: 'r9-nam-som-jeed', qty: 13, price: 13 }, { id: 'r9-nam-som-khing', qty: 18, price: 18 }, { id: 'r9-cha-angun', qty: 14, price: 14 }, { id: 'r9-honey-lemon', qty: 10, price: 10 }, { id: 'r9-lamyai', qty: 14, price: 14 }, { id: 'r9-coconut-sugar', qty: 14, price: 14 }, { id: 'r9-baitoey', qty: 16, price: 16 }, { id: 'r9-thai-tea-coconut', qty: 24, price: 24 }, { id: 'r9-matcha-pistachio', qty: 36, price: 36 }] },
    { id: 'r9r-3', no: 3, date: '2026-09-05', time: '10:30', status: 'done', fee: 0,
      lines: [{ id: 'r9-chicken-mince', qty: 4.5, price: 84 }, { id: 'r9-chicken-tender', qty: 5, price: 92 }] }
  ],

  // ---------- หน้าเตรียม-เหลือ ----------

  // วันที่ของข้อมูลเตรียม-เหลือที่กำลังบันทึก
  prepDate: '2 ก.ย.',

  // คนที่รับผิดชอบงานเตรียม (รูปครึ่งตัวใช้บนการ์ดหัวเรื่อง รูปกลมใช้ในชิป/ตาราง)
  prepPeople: [
    { id: 'fah', name: 'ฟ้า', color: '#3B8BE0', tint: '#EAF3FD', half: 'assets/prep/fah-half.webp', round: 'assets/prep/fah-round.webp' },
    { id: 'emmy', name: 'เอมมี่', color: '#E0A020', tint: '#FEF4DE', half: 'assets/prep/emmy-chef.webp', round: 'assets/prep/emmy-face.webp' },
    { id: 'ad', name: 'อัด', color: '#2E8B4F', tint: '#E9F6EC', half: 'assets/prep/ad-half.webp', round: 'assets/prep/ad-round.webp' }
  ],

  // กลุ่มของวัตถุดิบเนื้อสัตว์ในตารางเตรียมอาหาร
  prepMeatGroups: [
    { id: 'chicken', label: 'ไก่', icon: 'assets/cats/chicken.webp' },
    { id: 'meat', label: 'เนื้อ / หมู / เป็ด', icon: 'assets/cats/pork.webp' },
    { id: 'sea', label: 'ปลาและอาหารทะเล', icon: 'assets/cats/fish.webp' }
  ],

  // รายการเตรียมเนื้อสัตว์ของวัน: rec = แนะนำ (กก.) ช่วง recMin–recMax, prep = เตรียม, extras = เบิกเพิ่มแต่ละรอบ, waste = ทิ้ง/เสีย, left = คงเหลือ
  prepMeat: [
    { id: 'chicken-mince', name: 'อกไก่สับ', note: '', group: 'chicken', owner: 'ad', rec: 2.0, recMin: 1.6, recMax: 2.4, prep: 2.0, extras: [0.6], waste: 0.1, left: 0.3, photo: 'assets/prep/meat-chicken-mince.webp' },
    { id: 'chicken-tender', name: 'สันในไก่', note: '', group: 'chicken', owner: 'ad', rec: 1.8, recMin: 1.4, recMax: 2.2, prep: 1.8, extras: [0.4], waste: 0.1, left: 0.2, photo: 'assets/prep/meat-chicken-tender.webp' },
    { id: 'chicken-soft', name: 'อกไก่นุ่ม', note: '', group: 'chicken', owner: 'fah', rec: 4.5, recMin: 3.8, recMax: 5.2, prep: 4.5, extras: [0.8], waste: 0.2, left: 0.6, photo: 'assets/prep/meat-chicken-breast.webp' },
    { id: 'pork-slice', name: 'หมูสไลด์', note: '', group: 'meat', owner: 'ad', rec: 2.6, recMin: 2.2, recMax: 3.2, prep: 2.6, extras: [0.3], waste: 0.1, left: 0.6, photo: 'assets/prep/meat-pork-slice.webp' },
    { id: 'duck-mince', name: 'เป็ดบด', note: '', group: 'meat', owner: 'ad', rec: 1.2, recMin: 0.9, recMax: 1.6, prep: 1.2, extras: [0.2], waste: 0.0, left: 0.2, photo: 'assets/prep/meat-duck-mince.webp' },
    { id: 'beef-mince', name: 'เนื้อสับ', note: '', group: 'meat', owner: 'ad', rec: 1.6, recMin: 1.2, recMax: 2.0, prep: 1.6, extras: [0.3], waste: 0.1, left: 0.2, photo: 'assets/prep/meat-beef-mince.webp' },
    { id: 'salmon', name: 'แซลมอน', note: '', group: 'sea', owner: 'ad', rec: 2.2, recMin: 1.7, recMax: 2.7, prep: 2.2, extras: [0.5], waste: 0.1, left: 0.3, photo: 'assets/prep/meat-salmon.webp' },
    { id: 'hokke', name: 'ฮอกเกะ', note: '', group: 'sea', owner: 'ad', rec: 1.0, recMin: 0.7, recMax: 1.3, prep: 1.0, extras: [0.1], waste: 0.0, left: 0.1, photo: 'assets/prep/meat-hokke.webp' },
    { id: 'shrimp-mid', name: 'กุ้งกลาง', note: '(กุ้งกะเพรา)', group: 'sea', owner: 'ad', rec: 1.5, recMin: 1.1, recMax: 1.9, prep: 1.5, extras: [0.2], waste: 0.1, left: 0.2, photo: 'assets/prep/meat-shrimp-mid.webp' },
    { id: 'shrimp-big', name: 'กุ้งใหญ่', note: '(กุ้งอบ)', group: 'sea', owner: 'ad', rec: 1.2, recMin: 0.9, recMax: 1.5, prep: 1.2, extras: [0.1], waste: 0.0, left: 0.2, photo: 'assets/prep/meat-shrimp-big.webp' }
  ],

  // รายการข้าวของวัน: cook = หุงรอบแรก (กก. ดิบ), rounds = หุงเพิ่มรอบ 1-3 (null = ไม่มี), ratio = ดิบ 1 กก. ได้สุกกี่กก.
  // left/waste/home/give = ข้าวสุกเหลือ / ทิ้ง-เสีย / ห่อกลับบ้าน / แจก (กก. สุก)
  prepRice: [
    { id: 'homali', name: 'ข้าวหอมมะลิ', owners: ['fah', 'emmy'], tip: 'หุงร้อนนุ่ม อิ่มตัวดี', cook: 5.0, rounds: [2.0, 1.0, null], ratio: 1.35, formula: 'ข้าวหอมมะลิกลางปี 100%', left: 1.0, waste: 0.2, home: 0.3, give: 0.3, photo: 'assets/prep/rice-homali.webp' },
    { id: 'riceberry', name: 'ข้าวไรซ์เบอรี่', owners: ['fah', 'emmy'], tip: 'แช่ 30 นาที ก่อนหุง', cook: 2.5, rounds: [1.0, 0.5, null], ratio: 1.5, formula: 'ข้าวหอมมะลิเก่า 55% + ข้าวไรซ์เบอรี่ 45%', left: 0.6, waste: 0.1, home: 0.2, give: 0.1, photo: 'assets/prep/rice-riceberry.webp' },
    { id: 'fried', name: 'ข้าวผัด', owners: ['fah', 'emmy'], tip: 'หุงค่อนข้างแห้ง ร่วน ไม่แฉะ', cook: 3.0, rounds: [1.0, null, null], ratio: 1.35, formula: 'ข้าวเก่า 100%', left: 1.2, waste: 0.0, home: 0.2, give: 0.1, photo: 'assets/prep/rice-fried.webp' },
    { id: 'fat5', name: 'ข้าวมัน 5%', owners: ['ad'], tip: 'หุงนุ่มมัน หอมมัน 5%', cook: 2.0, rounds: [0.5, 0.5, null], ratio: 1.3, formula: 'ข้าวหอมมะลิกลางปี 50% + ข้าวต้นกูดู 50%', left: 0.8, waste: 0.1, home: 0.1, give: 0.0, photo: 'assets/prep/rice-fat5.webp' },
    { id: 'fat12', name: 'ข้าวมัน 12%', owners: ['ad'], tip: 'หุงนุ่มมัน หอมมัน 12%', cook: 2.5, rounds: [0.5, 0.5, null], ratio: 1.3, formula: 'ข้าวหอมมะลิกลางปี 50% + ข้าวต้นกูดู 50% (เป้าหมายไขมัน 12%)', left: 0.9, waste: 0.1, home: 0.2, give: 0.0, photo: 'assets/prep/rice-fat12.webp' },
    { id: 'fat-riceberry', name: 'ข้าวมันไรซ์เบอรี่', owners: ['ad'], tip: 'ผสมมันหอม หุงนุ่มหอม', cook: 1.5, rounds: [0.5, null, null], ratio: 1.65, formula: 'ข้าวหอมมะลิกลางปี 60% + ข้าวไรซ์เบอรี่ 40%', left: 0.7, waste: 0.1, home: 0.1, give: 0.0, photo: 'assets/prep/rice-fat-riceberry.webp' }
  ],

  // สถิติข้าวย้อนหลัง 7 วัน (กก.): sold = ขายจริงข้าวสุก, soldRaw = เทียบข้าวดิบ, left = ข้าวเหลือ
  prepRiceHistory: [
    { date: '27 ส.ค.', sold: 22.3, soldRaw: 15.8, left: 0.2 },
    { date: '28 ส.ค.', sold: 45.8, soldRaw: 32.5, left: 0.9 },
    { date: '29 ส.ค.', sold: 42.0, soldRaw: 29.6, left: 0.6 },
    { date: '30 ส.ค.', sold: 41.2, soldRaw: 28.7, left: 0.7 },
    { date: '31 ส.ค.', sold: 40.1, soldRaw: 27.4, left: 0.6 },
    { date: '1 ก.ย.', sold: 43.6, soldRaw: 30.1, left: 0.8 },
    { date: '2 ก.ย.', sold: 45.8, soldRaw: 32.9, left: 1.1 }
  ],

  // (แท็บพยากรณ์ยังไม่เปิดใช้งาน — ลบข้อมูลพยากรณ์จำลองออกแล้ว ห้ามใส่ตัวเลขแต่งขึ้น)

  // 7 วันของสัปดาห์ที่ใช้เป็นหัวคอลัมน์ในแท็บของฟ้าทั้งหมด
  fahDays: [
    { label: 'จันทร์', date: '25/8' }, { label: 'อังคาร', date: '26/8' }, { label: 'พุธ', date: '27/8' },
    { label: 'พฤหัส', date: '28/8' }, { label: 'ศุกร์', date: '29/8' }, { label: 'เสาร์', date: '30/8' }, { label: 'อาทิตย์', date: '31/8' }
  ],

  // เมนูที่ทำเสร็จแล้ว 12 เมนู + ปริมาณของเหลือย้อนหลัง 7 วัน (หน่วย: กรัม)
  fahMenus: [
    { id: 'kaprao-chicken-mince', name: 'กะเพราอกไก่สับ', photo: 'assets/dishes/dish-kaprao-chicken-mince.webp', week: [350, 280, 420, 310, 260, 180, 90] },
    { id: 'kaprao-chicken-soft', name: 'กะเพราอกไก่นุ่ม', photo: 'assets/dishes/dish-kaprao-chicken-soft.webp', week: [240, 190, 310, 260, 220, 140, 80] },
    { id: 'kaprao-pork-slice', name: 'กะเพราหมูสไลด์', photo: 'assets/dishes/dish-kaprao-pork-slice.webp', week: [200, 180, 280, 240, 190, 120, 70] },
    { id: 'kaprao-beef', name: 'กะเพราเนื้อสับ', photo: 'assets/dishes/dish-kaprao-beef.webp', week: [150, 120, 200, 180, 160, 100, 60] },
    { id: 'kaprao-duck', name: 'กะเพราเป็ด', photo: 'assets/dishes/dish-kaprao-duck.webp', week: [90, 120, 140, 110, 80, 60, 40] },
    { id: 'kaprao-salmon', name: 'กะเพราแซลมอน', photo: 'assets/dishes/dish-kaprao-salmon.webp', week: [130, 100, 160, 140, 120, 70, 50] },
    { id: 'larb-salmon', name: 'ลาบแซลมอน', photo: 'assets/dishes/dish-larb-salmon.webp', week: [80, 60, 120, 100, 80, 50, 30] },
    { id: 'kaprao-shrimp', name: 'กะเพรากุ้ง', photo: 'assets/dishes/dish-kaprao-shrimp.webp', week: [180, 140, 220, 200, 160, 100, 70] },
    { id: 'shrimp-garlic', name: 'กุ้งกระเทียม', photo: 'assets/dishes/dish-shrimp-garlic.webp', week: [120, 100, 160, 140, 110, 80, 50] },
    { id: 'chicken-jimjaew', name: 'ไก่ย่างจิ้มแจ่ว', photo: 'assets/dishes/dish-chicken-jimjaew.webp', week: [120, 120, 200, 180, 140, 90, 60] },
    { id: 'chicken-teriyaki', name: 'ไก่เทอริยากิ', photo: 'assets/dishes/dish-chicken-teriyaki.webp', week: [110, 90, 150, 130, 100, 70, 40] },
    { id: 'pork-osaka', name: 'หมูกระเทียมโอชาก้า', photo: 'assets/dishes/dish-pork-osaka.webp', week: [140, 110, 180, 160, 130, 80, 50] }
  ],

  // บันทึกของเหลือวันนี้ (หน่วย: กรัม) — left = เหลือ, waste = ทิ้ง/เสีย, self = กินเอง, home = ห่อกลับบ้าน
  // คงเหลือใช้ต่อ ระบบคำนวณให้เอง (calc.js: fahKeep)
  fahToday: [
    { id: 'kaprao-chicken-mince', left: 280, waste: 20, self: 30, home: 50 },
    { id: 'kaprao-chicken-soft', left: 150, waste: 10, self: 20, home: 40 },
    { id: 'kaprao-pork-slice', left: 220, waste: 30, self: 20, home: 30 },
    { id: 'kaprao-beef', left: 160, waste: 15, self: 10, home: 20 },
    { id: 'kaprao-duck', left: null, waste: null, self: null, home: null },
    { id: 'kaprao-salmon', left: null, waste: null, self: null, home: null },
    { id: 'larb-salmon', left: null, waste: null, self: null, home: null },
    { id: 'kaprao-shrimp', left: 90, waste: 10, self: 10, home: 20 },
    { id: 'shrimp-garlic', left: null, waste: null, self: null, home: null },
    { id: 'chicken-jimjaew', left: 120, waste: 20, self: 10, home: 30 },
    { id: 'chicken-teriyaki', left: null, waste: null, self: null, home: null },
    { id: 'pork-osaka', left: null, waste: null, self: null, home: null }
  ],

  // ตารางแปลงของเหลือเป็นวัตถุดิบ (หน่วย: กรัม) ย้อนหลัง 7 วัน
  fahIngredients: [
    { id: 'chicken-mince', name: 'อกไก่สับ', photo: 'assets/prep/meat-chicken-mince.webp', week: [420, 380, 510, 400, 330, 260, 180] },
    { id: 'chicken-soft', name: 'อกไก่นุ่ม', photo: 'assets/prep/meat-chicken-breast.webp', week: [280, 240, 320, 300, 260, 180, 120] },
    { id: 'pork-slice', name: 'หมูสไลด์', photo: 'assets/prep/meat-pork-slice.webp', week: [360, 280, 420, 380, 320, 220, 160] },
    { id: 'duck-mince', name: 'เป็ดบด', photo: 'assets/prep/meat-duck-mince.webp', week: [120, 100, 160, 140, 120, 80, 60] },
    { id: 'beef-mince', name: 'เนื้อสับ', photo: 'assets/prep/meat-beef-mince.webp', week: [220, 180, 300, 260, 220, 160, 100] },
    { id: 'salmon', name: 'แซลมอน', photo: 'assets/prep/meat-salmon.webp', week: [180, 140, 260, 220, 180, 120, 80] },
    { id: 'hokke', name: 'ฮอกเกะ', photo: 'assets/prep/meat-hokke.webp', week: [100, 80, 140, 120, 100, 70, 50] },
    { id: 'shrimp-mid', name: 'กุ้งกลาง', photo: 'assets/prep/meat-shrimp-mid.webp', week: [200, 160, 300, 260, 220, 160, 100] },
    { id: 'shrimp-big', name: 'กุ้งใหญ่', photo: 'assets/prep/meat-shrimp-big.webp', week: [160, 120, 240, 200, 160, 120, 70] }
  ],

  // ---------- หน้าหลัก (Dashboard) — ข้อมูลตัวอย่างจำลอง (fixture) ไม่ใช่ตัวเลขร้านจริง ----------

  // วันของระบบ / วันปิดข้อมูลล่าสุด / วันแนะนำเตรียม / สาขา (มีเฉพาะที่ระบบส่งมา ไม่เดาชื่อสาขาเพิ่ม)
  homeMeta: { asOf: '2026-09-10', analysisEnd: '2026-09-09', prepDate: '2026-09-11', prepClosed: false, openDaysFixture: 26, branches: [{ id: 'all', label: 'ทุกสาขา' }] },

  // ค่าที่ผู้ใช้เลือกไว้บนหน้าหลัก (คงอยู่หลัง refresh — บันทึกทับผ่าน data.js)
  homeUi: { branch: 'all', prepPage: 0, rice: { plain: 'jasmine', chicken: 'chicken5', fried: 'salmon-fried' }, usageItem: 'chicken', leftMenu: 'all', leftMetric: 'usable', salesPeriod: 'month' },

  // ประกาศ (แสดงเฉพาะ active เรียงตาม sort) — ข้อความคงตามที่กำหนด ไม่แปลความเพิ่ม
  homeNotices: [
    { id: 'match-before-finish', text: 'ห้ามกดเสร็จก่อนระบบจับคู่ได้', tone: 'coral', character: 'kid-02', icon: 'bell', active: true, sort: 1 },
    { id: 'minimum-prep-buffer', text: 'ให้บวกเวลาขั้นต่ำ 5 นาที', tone: 'amber', character: 'kid-06', icon: 'clock', active: true, sort: 2 }
  ],

  // แนะนำเตรียมของพรุ่งนี้ (rank = อันดับจากระบบแนะนำ, staff = ผู้รับผิดชอบเฉพาะที่มีข้อมูลจริง, basis = null ยังไม่ระบุว่าเป็น "ผลิตเพิ่ม" หรือ "เป้าสต๊อกรวม")
  homePrep: { pageSize: 3, basis: null, items: [
    { id: 'chicken', name: 'อกไก่นุ่ม', qty: 4.5, unit: 'กก.', rank: 1, staff: [], photo: 'assets/home/food-chicken.webp' },
    { id: 'pork', name: 'หมูสไลด์', qty: 2.6, unit: 'กก.', rank: 2, staff: [], photo: 'assets/home/food-pork.webp' },
    { id: 'salmon', name: 'แซลมอน', qty: 2.2, unit: 'กก.', rank: 3, staff: [], photo: 'assets/home/food-salmon.webp' },
    { id: 'shrimp', name: 'กุ้ง', qty: 1.8, unit: 'กก.', rank: 4, staff: [], photo: 'assets/home/food-shrimp.webp' },
    { id: 'beef', name: 'เนื้อสับ', qty: 1.5, unit: 'กก.', rank: 5, staff: [], photo: 'assets/home/food-beef.webp' },
    { id: 'chicken-mince', name: 'อกไก่สับ', qty: 1.4, unit: 'กก.', rank: 6, staff: [], photo: 'assets/prep/meat-chicken-mince.webp' },
    { id: 'tenderloin', name: 'สันในไก่', qty: 1.2, unit: 'กก.', rank: 7, staff: [], photo: 'assets/prep/meat-chicken-tender.webp' },
    { id: 'duck', name: 'เป็ดบด', qty: 1.0, unit: 'กก.', rank: 8, staff: [], photo: 'assets/prep/meat-duck-mince.webp' },
    { id: 'sauce-basil', name: 'ซอสกะเพรา', qty: 0.9, unit: 'กก.', rank: 9, staff: [], photo: 'assets/food/sauce-bowl.webp' },
    { id: 'sauce-garlic', name: 'ซอสกระเทียม', qty: 0.8, unit: 'กก.', rank: 10, staff: [], photo: 'assets/food/sauce-bottle.webp' },
    { id: 'sauce-ginger', name: 'ซอสขิง', qty: 0.6, unit: 'กก.', rank: 11, staff: [], photo: 'assets/r9/sauce-bottle.webp' },
    { id: 'sauce-salted-egg', name: 'ซอสไข่เค็ม', qty: 0.5, unit: 'กก.', rank: 12, staff: [], photo: 'assets/r9/sauce-set.webp' }
  ] },

  // แนะนำปริมาณหุงข้าว 3 กลุ่ม (raw = ข้าวดิบ กก., water = น้ำ ลิตร, pots = รายการแบ่งหม้อจากระบบ) — ตัวเลขจำลอง ไม่ใช่สูตรหุงจริง
  homeRice: [
    { id: 'plain', label: 'ข้าว', photo: 'assets/home/rice-jasmine.webp', options: [
      { id: 'jasmine', label: 'ข้าวหอมมะลิ', raw: 4.5, water: 5.4, pots: [3, 1.5] },
      { id: 'riceberry', label: 'ข้าวไรซ์เบอรี่', raw: 2, water: 2.6, pots: [2] }
    ] },
    { id: 'chicken', label: 'ข้าวมัน', photo: 'assets/home/rice-chicken.webp', options: [
      { id: 'chicken5', label: 'ข้าวมัน 5%', raw: 3, water: 3.6, pots: [3] },
      { id: 'chicken9', label: 'ข้าวมัน 9%', raw: 2.4, water: 2.9, pots: [2.4] },
      { id: 'chicken12', label: 'ข้าวมัน 12%', raw: 1.8, water: 2.2, pots: [1.8] },
      { id: 'chicken-riceberry', label: 'ข้าวมันไรซ์เบอรี่', raw: 1.5, water: 2, pots: [1.5] }
    ] },
    { id: 'fried', label: 'ข้าวผัด', photo: 'assets/home/rice-fried.webp', options: [
      { id: 'salmon-fried', label: 'ข้าวผัดแซลมอน', raw: 1.5, water: 1.8, pots: [1.5] }
    ] }
  ],

  // ใช้ไปเท่าไหร่: วันที่ปิดข้อมูลแล้ว 3–9 ก.ย. (null = ยังไม่ส่งข้อมูล ไม่ใช่ 0) หน่วย กก. ทุกรายการ
  homeUsage: { unit: 'กก.', dates: ['2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09'], series: [
    { id: 'chicken', name: 'อกไก่นุ่ม', photo: 'assets/home/food-chicken.webp', daily: [4.8, 5.6, 5, 5.8, 4.7, 5.3, 5.2] },
    { id: 'pork', name: 'หมูสไลด์', photo: 'assets/home/food-pork.webp', daily: [2.6, 3.0, 2.8, 3.2, 2.7, 3.0, 3.0] },
    { id: 'salmon', name: 'แซลมอน', photo: 'assets/home/food-salmon.webp', daily: [2.2, 2.5, 2.3, 2.6, 2.2, 2.5, 2.5] },
    { id: 'shrimp', name: 'กุ้ง', photo: 'assets/home/food-shrimp.webp', daily: [1.6, 1.9, 1.7, 2.0, 1.6, 1.9, 1.9] },
    { id: 'beef', name: 'เนื้อสับ', photo: 'assets/home/food-beef.webp', daily: [1.3, 1.6, 1.4, 1.7, 1.3, 1.6, 1.6] }
  ] },

  // ยอดคงเหลือภาพรวม (หน่วย เสิร์ฟ): usable = เหลือเก็บต่อ ณ ปิดวัน (snapshot), disposed = ทิ้งจริง (flow), prior* = ช่วง 7 วันก่อนหน้า
  // avgNew30 = ของเหลือเกิดใหม่เฉลี่ย/วัน ใน 30 วัน (fixture ให้เท่ากับ avg30 — เงื่อนไขจำลองเท่านั้น), unitCost = ต้นทุน/เสิร์ฟ
  homeLeftovers: {
    unit: 'เสิร์ฟ',
    dates: ['2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09'],
    usableTotal: [41, 36, 31, 26, 21, 16, 11], priorUsableTotal: [45, 40, 35, 30, 25, 20, 15],
    disposedTotal: [9, 8, 7, 8, 6, 5, 4], priorDisposedTotal: [12, 11, 10, 10, 9, 8, 7],
    ranking: [
      { id: 'salmon-basil', name: 'กะเพราแซลมอน', photo: 'assets/home/meal-salmon-basil.webp', avg7: 8, avg30: 10, avgNew30: 10, unitCost: 30,
        usable: [11, 10, 9, 8, 7, 6, 5], priorUsable: [11.8, 10.8, 9.8, 8.8, 7.8, 6.8, 5.8], disposed: [2.7, 2.4, 2.1, 2.4, 1.8, 1.5, 1.2], priorDisposed: [3.6, 3.3, 3.0, 3.0, 2.7, 2.4, 2.1] },
      { id: 'beef-basil', name: 'กะเพราเนื้อ', photo: 'assets/home/meal-beef-basil.webp', avg7: 6, avg30: 8, avgNew30: 8, unitCost: 35,
        usable: [9, 8, 7, 6, 5, 4, 3], priorUsable: [9.8, 8.8, 7.8, 6.8, 5.8, 4.8, 3.8], disposed: [2.16, 1.92, 1.68, 1.92, 1.44, 1.2, 0.96], priorDisposed: [2.88, 2.64, 2.4, 2.4, 2.16, 1.92, 1.68] },
      { id: 'tender-chicken', name: 'อกไก่นุ่ม', photo: 'assets/home/meal-chicken.webp', avg7: 5, avg30: 6, avgNew30: 6, unitCost: 20,
        usable: [8, 7, 6, 5, 4, 3, 2], priorUsable: [8.8, 7.8, 6.8, 5.8, 4.8, 3.8, 2.8], disposed: [1.62, 1.44, 1.26, 1.44, 1.08, 0.9, 0.72], priorDisposed: [2.16, 1.98, 1.8, 1.8, 1.62, 1.44, 1.26] },
      { id: 'garlic-shrimp', name: 'กุ้งกระเทียม', photo: 'assets/home/meal-garlic-shrimp.webp', avg7: 4, avg30: 5, avgNew30: 5, unitCost: 40,
        usable: [7, 6, 5, 4, 3, 2, 1], priorUsable: [7.8, 6.8, 5.8, 4.8, 3.8, 2.8, 1.8], disposed: [1.44, 1.28, 1.12, 1.28, 0.96, 0.8, 0.64], priorDisposed: [1.92, 1.76, 1.6, 1.6, 1.44, 1.28, 1.12] },
      { id: 'garlic-pork', name: 'หมูกระเทียม', photo: 'assets/home/meal-garlic-pork.webp', avg7: 3, avg30: 4, avgNew30: 4, unitCost: 25,
        usable: [6, 5, 4, 3, 2, 1, 0], priorUsable: [6.8, 5.8, 4.8, 3.8, 2.8, 1.8, 0.8], disposed: [1.08, 0.96, 0.84, 0.96, 0.72, 0.6, 0.48], priorDisposed: [1.44, 1.32, 1.2, 1.2, 1.08, 0.96, 0.84] }
    ]
  },

  // ลดของเหลือ = ลดต้นทุน: ต้นทุนของทิ้งจริงสะสม (บาท) เทียบวันที่ 1–9 ของสองเดือน (จุดข้อมูลที่วัน 1/3/6/9)
  homeSavings: { currentPeriod: ['2026-09-01', '2026-09-09'], priorPeriod: ['2026-08-01', '2026-08-09'], days: [1, 3, 6, 9], priorCum: [900, 2800, 5600, 8400], currentCum: [700, 1900, 3980, 6020], ticks: [0, 5000, 10000] },

  // ยอดขายเทียบเป้า: month = ยอดสะสมเดือนนี้ถึงวัน through เทียบเป้าทั้งเดือน, today = null ยังไม่มีข้อมูลรายวัน
  homeSales: { through: '2026-09-09', updatedAt: '10 ก.ย. 2569 06:00', stores: [
    { id: 'basil', name: 'กะเพราโคตรคลีน', logo: 'assets/home/logo-kaprao.webp', color: '#16A469', month: 56210, target: 70000, today: null },
    { id: 'daughter', name: 'ลูกสาวทำเอง', logo: 'assets/home/logo-luksao.webp', color: '#F5637E', month: 38920, target: 50000, today: null },
    { id: 'chicken5', name: '5% ข้าวมันไก่', logo: 'assets/home/logo-five.webp', color: '#D69B26', month: 30300, target: 40000, today: null },
    { id: 'redrink', name: 'RE:DRINK', logo: 'assets/home/logo-redrink.webp', color: '#287DEB', month: 8400, target: 12000, today: null }
  ] },

  // ส่งพระราม 9: รอบส่งที่ยืนยันแล้ว (id ซ้ำนับครั้งเดียว) มูลค่าเป็น "มูลค่าโอน" ตัวอย่าง หน่วยบาท
  homeR9: { basis: 'มูลค่าโอน (ตัวอย่าง)', types: 'วัตถุดิบ + ซอส', shipments: [
    { id: 'demo-1', date: '2026-09-01', value: 6000 },
    { id: 'demo-2', date: '2026-09-03', value: 6200 },
    { id: 'demo-3', date: '2026-09-06', value: 6200 },
    { id: 'demo-4', date: '2026-09-09', value: 6200 }
  ] }
};
