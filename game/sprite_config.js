// พิกัดรูปทั้งหมดอยู่ไฟล์นี้ไฟล์เดียว — แก้ตัวเลขที่นี่ ไม่ต้องแตะโค้ด
export const ASSETS = { pets:'assets/pets/', chars:'assets/chars/', village:'assets/village/', icons:'assets/icons/', tarot:'assets/tarot/', food:'assets/food/' };

// แผ่นสัตว์ B01-B26 : 1254x1254 = ตาราง 3x3 ช่องละ 418
export const PET_SHEET = {
  cell: 418, cols: 3, rows: 3,
  rowOrder: ['baby', 'child', 'adult'],   // แถว 1 / 2 / 3
  colOrder: ['idle', 'eat', 'sad']        // ช่อง 1 / 2 / 3
};
export const PET_STAGE_ROW = { 1:'baby', 2:'child', 3:'adult' };
export const PET_MOOD_COL  = { ok:'idle', eat:'eat', sulk:'sad', hungry:'sad' };

// ลำดับท่าในแผ่นตัวละคร (เรียงบนลงล่าง ซ้ายไปขวา ตรงกับ sprite_map.json)
export const CHAR_POSES = {
  '01': ['baby_sleep','baby_sit','baby_cry','kid_stand','kid_walk','kid_happy',
         'student_stand','student_walk','student_jump','student_sad'],
  '02': ['teen_stand','teen_walk','teen_cheer','work_stand','work_walk','work_jump',
         'work_sad','work_feed','work_sit','work_shout','work_sleep'],
  '04': ['mid_stand','mid_walk','mid_wave','mid_arms','mid_sit','mid_laugh',
         'eld_stand','eld_walk','eld_sit','eld_wave','eld_read','eld_laugh']
};

// วัยไหนใช้แผ่นไหน + ท่าปกติ/ดีใจ/เศร้า/ประกาศ
export const STAGE_POSE = {
  baby:    { sheet:'01', idle:'baby_sit',      happy:'baby_sit',     sad:'baby_cry',     shout:'baby_sit' },
  kid:     { sheet:'01', idle:'kid_stand',     happy:'kid_happy',    sad:'baby_cry',     shout:'kid_happy' },
  student: { sheet:'01', idle:'student_stand', happy:'student_jump', sad:'student_sad',  shout:'student_jump' },
  teen:    { sheet:'02', idle:'teen_stand',    happy:'teen_cheer',   sad:'teen_stand',   shout:'teen_cheer' },
  work:    { sheet:'02', idle:'work_stand',    happy:'work_jump',    sad:'work_sad',     shout:'work_shout' },
  middle:  { sheet:'04', idle:'mid_stand',     happy:'mid_laugh',    sad:'mid_arms',     shout:'mid_wave' },
  elder:   { sheet:'04', idle:'eld_stand',     happy:'eld_laugh',    sad:'eld_sit',      shout:'eld_wave' }
};

// ขั้นวัย + แต้มปัญญาที่ต้องใช้ (สเปกข้อ 5.1)
export const STAGES = [
  { id:'baby', wp:0 }, { id:'kid', wp:100 }, { id:'student', wp:300 }, { id:'teen', wp:700 },
  { id:'work', wp:1500 }, { id:'middle', wp:3000 }, { id:'elder', wp:5000 }
];
