// ตัวคุมแอปทั้งหมด: สลับหน้าตามปุ่มเมนูล่าง แล้วสั่งให้หน้านั้นวาดตัวเอง
import { mountStaffPage } from './pages/staff.js';
import { mountStockPage } from './pages/stock.js';
import { mountPrepPage } from './pages/prep.js';
import { mountRama9Page } from './pages/rama9.js';
import { mountHomePage } from './pages/home.js';
import { mountVillagePage } from './pages/village.js';
import { mountLoginPage } from './pages/login.js';
import { mountOtherPage } from './pages/other.js';
import { mountSpecialPage } from './pages/special.js';
import { mountAccountsPage } from './pages/accounts.js';
import { mountEquationPage } from './pages/equation.js';
import { mountNav, fillGlyphs, confirmSheet, toast } from './shared/ui.js';
import { currentUser, signOut, loadAccounts } from './shared/auth.js';
import { APP_UI } from './shared/config.js';

const PAGES = {
  home: { file: 'pages/home.html', mount: mountHomePage },
  staff: { file: 'pages/staff.html', mount: mountStaffPage },
  stock: { file: 'pages/stock.html', mount: mountStockPage },
  prep: { file: 'pages/prep.html', mount: mountPrepPage },
  rama9: { file: 'pages/rama9.html', mount: mountRama9Page },
  village: { file: 'pages/village.html', mount: mountVillagePage },
  other: { file: 'pages/other.html', mount: mountOtherPage },
  special: { file: 'pages/special.html', mount: mountSpecialPage },
  accounts: { file: 'pages/accounts.html', mount: mountAccountsPage },
  equation: { file: 'pages/equation.html', mount: mountEquationPage }
};

const app = document.querySelector('.app');
const navHost = document.getElementById('nav-host');
let ticket = 0;   // กันกดรัวๆ: เอาผลของการกดครั้งล่าสุดเท่านั้น

// โหลดไฟล์โครงหน้า แล้วแปลงเป็นชิ้นส่วนหน้าจอ (ไม่ยัดข้อความดิบเข้าหน้า)
async function loadView(file) {
  const res = await fetch(file);
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  const view = document.createElement('main');
  view.className = 'app-view';
  view.id = 'app-view';
  view.append(...doc.body.childNodes);
  return view;
}

// เปลี่ยนหน้า: สร้างกล่องเนื้อหาใหม่ทุกครั้ง เพื่อทิ้งตัวจับคลิกของหน้าเก่าไปให้หมด
async function showPage(id) {
  const page = PAGES[id];
  if (!page) return;
  const mine = ++ticket;
  const view = await loadView(page.file);
  if (mine !== ticket) return;

  document.getElementById('app-view').replaceWith(view);
  app.dataset.page = id;
  page.mount(view, showPage);
  view.scrollTop = 0;   // เลื่อนขึ้นบนสุดหลังวาดหน้าเสร็จ กันจอกระตุกตอนรูปโหลด
  mountNav(navHost, id, showPage);
}

// ยังไม่ล็อกอิน = แสดงหน้าเข้าสู่ระบบเต็มจอก่อน (ไม่มีแถบบน/เมนูล่าง)
async function showLogin() {
  app.dataset.page = 'login';
  app.classList.add('app--login');
  const view = await loadView('pages/login.html');
  document.getElementById('app-view').replaceWith(view);
  navHost.replaceChildren();
  mountLoginPage(view, () => { app.classList.remove('app--login'); showPage('home'); });
}

// ดึง PIN ล่าสุดจากฐานก่อนเปิดหน้าแรก (แก้รหัสจากเครื่องไหนก็ใช้ได้ทุกเครื่อง)
loadAccounts().then(() => { if (currentUser()) showPage('home'); else showLogin(); });

// ปุ่มออกจากระบบบนแถบบนสุด: ถามยืนยันก่อน แล้วกลับไปหน้าเข้าสู่ระบบ
const logoutBtn = document.getElementById('btn-logout');
logoutBtn.setAttribute('aria-label', APP_UI.logout);
logoutBtn.title = APP_UI.logout;
fillGlyphs(document.querySelector('.app-bar'), 23);
logoutBtn.onclick = async () => {
  if (!await confirmSheet({ ...APP_UI.logoutAsk, okLabel: APP_UI.logoutAsk.ok, danger: true })) return;
  signOut();
  await showLogin();
  toast(APP_UI.loggedOut);
};
