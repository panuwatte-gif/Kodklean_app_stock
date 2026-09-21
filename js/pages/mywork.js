// หน้า "งานของฉัน" — รวมการ์ดงานประจำวันของพนักงานคนนั้น (ข้อมูลจากตาราง kk_my_task)
import { getMyTasks, getMyWorkDone, getStaff, todayIso } from '../shared/data.js';
import { MYWORK_UI as T, WORK_UI } from '../shared/config.js';
import { workTopHtml } from '../shared/work-ui.js';
import { workStaff } from '../shared/auth.js';
import { fillText } from '../shared/format.js';

// ป้ายสถานะการ์ด: งานที่บันทึกวันนี้แล้ว / ยังรอทำ / งานที่ไม่ผูกกับรายวัน
function tagHtml(page, done) {
  if (!(page in done)) return `<span class="mytask__tag mytask__tag--done">${T.ready}</span>`;
  return done[page]
    ? `<span class="mytask__tag mytask__tag--done">${T.done}</span>`
    : `<span class="mytask__tag mytask__tag--todo">${T.todo}</span>`;
}

// การ์ดงาน 1 ใบ
function taskHtml(task, done) {
  return `
    <button class="mytask" type="button" data-go="${task.page || ''}">
      <span class="mytask__ic"><img src="${task.icon}" alt="" width="54" height="54" loading="lazy" decoding="async"></span>
      <span class="mytask__body">
        <span class="mytask__title">${task.title}</span>
        <span class="mytask__sub">${task.subtitle || ''}</span>
        <span class="mytask__detail">${task.detail || ''}</span>
        ${tagHtml(task.page, done)}
      </span>
      <span class="mytask__go">›</span>
    </button>`;
}

// หัวหน้าจอ: ชื่อคน ตัวการ์ตูนใหญ่ และคำทักทาย
function heroHtml(person) {
  return `
    <div class="mywork__hero">
      <span class="mywork__bubble">${T.bubble}</span>
      <div class="mywork__heroText">
        <span class="mywork__script">${fillText(T.script, { name: person.name })}</span>
        <h1 class="mywork__title">${T.title}</h1>
        <span class="mywork__rule"></span>
        <p class="mywork__sub">${fillText(T.sub, { name: person.name })}</p>
      </div>
      <img class="mywork__char" src="${T.hero}" alt="${person.name}" height="236" decoding="async">
    </div>`;
}

// การ์ดอธิบายท้ายหน้า
function noteHtml(person) {
  return `
    <section class="wcard mynote">
      <img src="${T.noteChar}" alt="" width="74" height="74" loading="lazy" decoding="async">
      <span class="mynote__text">
        <b>${fillText(T.noteTitle, { name: person.name })}</b>
        <em>${T.noteText}</em>
      </span>
      <span class="mynote__script">${T.noteScript}</span>
    </section>`;
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมการ์ดงานจากฐาน
export async function mountMyWorkPage(root, onGo) {
  const code = workStaff();
  const box = id => root.querySelector(id);
  box('#my-list').innerHTML = `<p class="wempty">${WORK_UI.loading}</p>`;

  let person = { code, name: '', role: '' };
  try {
    const [staff, tasks, done] = await Promise.all([getStaff(), getMyTasks(code), getMyWorkDone(todayIso())]);
    const me = staff.find(s => s.code === code);
    if (me) person = { code, name: me.name, role: me.role === 'owner' ? 'เจ้าของร้าน' : me.role === 'lead' ? 'หัวหน้า' : 'พนักงาน' };
    box('#my-top').innerHTML = workTopHtml(person, WORK_UI.backStaff);
    box('#my-hero').innerHTML = heroHtml(person);
    box('#my-list').innerHTML = tasks.length
      ? tasks.map(t => taskHtml(t, done)).join('')
      : `<p class="wempty">${T.empty}<em>${T.emptyHint}</em></p>`;
    box('#my-note').innerHTML = noteHtml(person);
  } catch {
    box('#my-top').innerHTML = workTopHtml(person, WORK_UI.backStaff);
    box('#my-list').innerHTML = `<p class="wempty">${WORK_UI.loadError}</p>`;
  }

  root.addEventListener('click', event => {
    const go = event.target.closest('[data-go]');
    if (go && go.dataset.go) return onGo(go.dataset.go);
    if (event.target.closest('[data-back]')) onGo('staff');
  });
}
