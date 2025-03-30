// Ім'я кешу, який використовуватиметься для збереження ресурсів
const CACHE_NAME = "pwa-cache-v1";

// Масив ресурсів, які будуть кешовані при встановленні Service Worker 
// ви кешуєте всі свої файли
const ASSETS = [
  "/",  
  "/students.html", 
  "/messenges.html", 
  "/dashboard.html", 
  "/tasks.html", 

  "/css/index.css",            
  "/scripts.js",   
          
  "/img/add.png",
  "/img/ava.jpg",
  "/img/bell.png",
  "/img/cancel.png",
  "/img/circle.png",
  "/img/flower.png",
  "/img/pencil.png",
  "/img/close.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Кешування ресурсів...");
        // Додаємо файли до кешу, якщо якийсь файл не вдасться завантажити, обробляємо помилку
        return cache.addAll(ASSETS.filter((url) => !url.startsWith("chrome-extension://"))).catch(console.error);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    // Пропускаємо запити з протоколом chrome-extension://
    if (event.request.url.startsWith("chrome-extension://")) {
      return;
    }
  
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const networkFetch = fetch(event.request).then((networkResponse) => {
            // Перевіряємо, чи мережевий запит не має протоколу chrome-extension://
            if (networkResponse && networkResponse.url && !networkResponse.url.startsWith("chrome-extension://")) {
              // Зберігаємо отриманий файл у кеш
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
  
          return cachedResponse || networkFetch;
        });
      })
    );
  });

// Подія активації Service Worker
// Видаляє старі кеші, які більше не використовуються
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // Знаходимо старі кеші
          .map((key) => caches.delete(key))   // Видаляємо їх
      );
    }).then(() => {
      console.log("Новий Service Worker активовано.");
      return self.clients.claim(); // Переключаємо новий SW для всіх вкладок
    })
  );
});