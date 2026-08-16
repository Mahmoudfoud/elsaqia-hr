// Service Worker بسيط لنظام "الشؤون الإدارية" — شركة الساقية
// هدفه بس تفعيل تثبيت PWA على الموبايل + تخزين مبدئي بسيط. مفيش أي كاش عدواني قد يعرض بيانات قديمة.
const CACHE_NAME = 'elsaqia-hr-shell-v1';
const SHELL_FILES = ['./', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  );
  self.clients.claim();
});

// استراتيجية "الشبكة الأول، الكاش لو مفيش نت" — عشان بيانات الحضور والمرتبات تفضل دايمًا محدّثة،
// ومفيش خطر إن حد يشتغل على بيانات قديمة مخزّنة بالغلط
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
