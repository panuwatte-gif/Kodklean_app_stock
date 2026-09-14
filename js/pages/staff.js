// หน้ารายชื่อพนักงาน — เฉพาะสิ่งที่หน้านี้มีคนเดียว
import { get } from '../shared/data.js';

// เรียงลำดับให้เจ้าของขึ้นก่อน แล้วหัวหน้า แล้วพนักงาน
const ROLE_ORDER = { owner: 0, lead: 1, staff: 2 };

// วาดการ์ดพนักงาน 1 คน
function staffCard(person) {
  const duties = person.duties.map(duty => `<li>${duty}</li>`).join('');
  // ถ้าไม่มีคำเรียกตำแหน่ง ก็ไม่ต้องแสดงป้ายอะไรเลย
  const role = person.roleLabel ? `<div class="staff-card__role">${person.roleLabel}</div>` : '';
  return `
    <li class="staff-card" style="--accent:${person.accent};--tint:${person.tint}">
      <div class="staff-card__photo">
        <img src="${person.photo}" alt="${person.name}" width="76" height="76" decoding="async">
      </div>
      <div class="staff-card__body">
        <div class="staff-card__name">${person.name}</div>
        ${role}
        <ul class="staff-card__duties">${duties}</ul>
      </div>
    </li>`;
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมรายชื่อพนักงานจากประตูข้อมูล
export function mountStaffPage(root) {
  const people = get('staff').sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
  root.querySelector('#staff-count').textContent = `ทั้งหมด ${people.length} คน`;
  root.querySelector('#staff-list').innerHTML = people.map(staffCard).join('');
}
