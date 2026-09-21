/* service worker: ทำให้แอปเปิดจากไอคอนหน้าจอโทรศัพท์ได้ และเปิดได้ตอนเน็ตหลุด */
const CACHE = 'kk-app-v1';

// ติดตั้ง: เก็บหน้าหลักกับไอคอนไว้ใช้ตอนออฟไลน์
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(['./', './index.html', './manifest.webmanifest', './assets/app/icon-192.png'])
    ).catch(() => {})
  );
  self.skipWaiting();
});

// เปิดใช้งาน: ลบแคชเวอร์ชันเก่า
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// โหลดไฟล์: เอาของใหม่จากเน็ตก่อนเสมอ ถ้าเน็ตไม่ได้ค่อยใช้ของในแคช
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
