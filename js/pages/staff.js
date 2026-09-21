// หน้ารายชื่อพนักงาน — เฉพาะสิ่งที่หน้านี้มีคนเดียว (กดการ์ด = เข้าหน้างานของคนนั้น)
import { get } from '../shared/data.js';
import { setWorkStaff } from '../shared/auth.js';
import { STAFF_DIRECT_PAGE } from '../shared/config.js';

// เรียงลำดับให้เจ้าของขึ้นก่อน แล้วหัวหน้า แล้วพนักงาน
const ROLE_ORDER = { owner: 0, lead: 1, staff: 2 };

// วาดการ์ดพนักงาน 1 คน
function staffCard(person) {
  const duties = person.duties.map(duty => `<span class="staff-card__duty">${duty}</span>`).join('');
  // ถ้าไม่มีคำเรียกตำแหน่ง ก็ไม่ต้องแสดงป้ายอะไรเลย
  const role = person.roleLabel ? `<div class="staff-card__role">${person.roleLabel}</div>` : '';
  return `
    <li>
      <button class="staff-card" type="button" data-staff="${person.id}" style="--accent:${person.accent};--tint:${person.tint}">
        <span class="staff-card__photo">
          <img src="${person.photo}" alt="${person.name}" width="76" height="76" decoding="async">
        </span>
        <span class="staff-card__body">
          <span class="staff-card__name">${person.name}</span>
          ${role}
          <span class="staff-card__duties">${duties}</span>
        </span>
        <span class="staff-card__go">›</span>
      </button>
    </li>`;
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมรายชื่อพนักงานจากประตูข้อมูล
export function mountStaffPage(root, onGo) {
  const people = get('staff').sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  root.querySelector('#staff-count').textContent = `ทั้งหมด ${people.length} คน`;
  root.querySelector('#staff-list').innerHTML = people.map(staffCard).join('');

  // กดการ์ดใคร = เปิดหน้างานของคนนั้น (บางคนเข้าหน้างานจริงตรงๆ ตามที่ตั้งไว้ใน config)
  root.addEventListener('click', event => {
    const card = event.target.closest('[data-staff]');
    if (!card || !onGo) return;
    setWorkStaff(card.dataset.staff);
    onGo(STAFF_DIRECT_PAGE[card.dataset.staff] || 'mywork');
  });
}
