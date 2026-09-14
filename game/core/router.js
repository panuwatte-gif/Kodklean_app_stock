// สลับหน้าในเกม: หน้าไหนก็วาดลงกล่องเดียวกัน แล้วอัปเดตแถบล่าง
const screens = {};
let host = null, navHost = null, onPaintNav = null, current = '';

export function register(id, mount) { screens[id] = mount; }
export function init(el, nav, paintNav) { host = el; navHost = nav; onPaintNav = paintNav; }
export const currentScreen = () => current;

export async function go(id, arg) {
  if (!screens[id]) return;
  current = id;
  host.innerHTML = '';
  host.scrollTop = 0;
  await screens[id](host, go, arg);
  if (onPaintNav) onPaintNav(navHost, id, go);
}
