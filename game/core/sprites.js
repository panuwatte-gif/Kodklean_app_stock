// ฟังก์ชันกลางตัวเดียวที่ตัดรูปจากแผ่นรวม ใช้ได้ทั้งสัตว์และคน (ตัวเลขอยู่ sprite_config.js)
import { ASSETS, PET_SHEET, PET_STAGE_ROW, PET_MOOD_COL, CHAR_POSES, STAGE_POSE } from '../sprite_config.js';

let charMap = null;

// โหลดพิกัดท่าของตัวละครครั้งเดียว (แผ่นคนวางไม่เป็นตาราง จึงต้องอ่านจากไฟล์)
export async function loadSpriteMap() {
  if (!charMap) charMap = await (await fetch('sprite_map.json')).json();
  return charMap;
}

// คำนวณ CSS ให้ช่องที่ต้องการพอดีกรอบ ไม่ขาดไม่เกิน (กรอบย่อตามสัดส่วนท่าจริง ไม่บังคับสี่เหลี่ยมจัตุรัส
// ไม่งั้นท่าที่สูงแคบจะเหลือที่ว่างสองข้าง แล้วเห็นท่าข้างเคียงโผล่มา)
function crop(url, sheetW, sheetH, box, size) {
  const k = Math.min(size / box.w, size / box.h);
  return `width:${Math.round(box.w * k)}px;height:${Math.round(box.h * k)}px;`
    + `background-repeat:no-repeat;background-image:url(${url});`
    + `background-size:${sheetW * k}px ${sheetH * k}px;`
    + `background-position:${-box.x * k}px ${-box.y * k}px;`;
}

// ฟังก์ชันกลาง: kind='pet' ใช้ตาราง 3x3, kind='char' อ่านพิกัดจาก sprite_map.json
export function sprite(kind, id, pose, size) {
  if (kind === 'pet') {
    const { cell, cols, rows, rowOrder, colOrder } = PET_SHEET;
    const r = Math.max(0, rowOrder.indexOf(PET_STAGE_ROW[pose.stage] || 'baby'));
    const c = Math.max(0, colOrder.indexOf(PET_MOOD_COL[pose.mood] || 'idle'));
    return crop(ASSETS.pets + id + '.webp', cell * cols, cell * rows,
      { x: c * cell, y: r * cell, w: cell, h: cell }, size);
  }
  const plan = STAGE_POSE[pose.stage] || STAGE_POSE.baby;
  const key = id + '_' + plan.sheet;
  const sheet = charMap && charMap[key];
  if (!sheet) return `width:${size}px;height:${size}px;`;
  const i = CHAR_POSES[plan.sheet].indexOf(plan[pose.mood] || plan.idle);
  const box = sheet.poses[i] || sheet.poses[0];
  return crop(ASSETS.chars + key + '.webp', sheet.sheet[0], sheet.sheet[1], box, size);
}

export const petSprite  = (species, stage, mood, size) => sprite('pet',  species, { stage, mood }, size);
export const charSprite = (folder,  stage, mood, size) => sprite('char', folder,  { stage, mood }, size);

// ใช้ในหน้าพรีวิวแอดมิน: คืนทุกท่าของแผ่นหนึ่ง พร้อมชื่อท่า
export function sheetPoses(folder, sheetNo, size) {
  const key = folder + '_' + sheetNo, sh = charMap && charMap[key];
  if (!sh) return [];
  return sh.poses.map((b, i) => ({
    name: CHAR_POSES[sheetNo][i] || ('? ' + i), row: b.row, col: b.col, box: b,
    css: crop(ASSETS.chars + key + '.webp', sh.sheet[0], sh.sheet[1], b, size)
  }));
}
