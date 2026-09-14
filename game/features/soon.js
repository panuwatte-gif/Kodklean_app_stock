// หน้าที่ยังไม่ถึงคิวสร้าง (โรงเรียน / เต็นท์แม่หมอ) — รอบถัดไป
import { t } from '../core/i18n.js';
import { topBar, wireLang } from '../core/ui.js';
import { currentScreen } from '../core/router.js';
import { ASSETS } from '../sprite_config.js';

export function mountSoon(root, go) {
  const id = currentScreen();
  root.innerHTML = topBar() + `<div class="card" style="text-align:center">
    <img src="${ASSETS.village}${id === 'tent' ? 'tent' : 'school'}.webp" alt="" width="160" height="160" style="object-fit:contain">
    <p class="h">${t(id === 'tent' ? 'navTent' : 'navSchool')}</p>
    <p class="sub">${t('soon')}</p></div>`;
  wireLang(root, go, id);
}

// เปิดเกมตรงๆ ไม่ได้มาจากแอป — บอกให้เข้าทางแอป (เกมไม่มีหน้าล็อกอินของตัวเองแล้ว)
export function mountNoUser(root) {
  root.innerHTML = `<div class="card" style="text-align:center;margin-top:40px">
    <img src="${ASSETS.village}bird-cheer.webp" alt="" width="150" height="150" style="object-fit:contain">
    <p class="h">${t('gameName')}</p>
    <p class="sub">${t('openFromApp')}</p></div>`;
}
