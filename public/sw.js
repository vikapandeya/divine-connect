const CACHE_VERSION = '2026-03-23-v2';
const CACHE_NAME = `punyaseva-runtime-${CACHE_VERSION}`;
const CACHE_PREFIX = 'punyaseva-runtime-';
const APP_SCOPE_URL = new URL(self.registration.scope);
const APP_ORIGIN = APP_SCOPE_URL.origin;
const APP_BASE_PATH = APP_SCOPE_URL.pathname.endsWith('/')
  ? APP_SCOPE_URL.pathname
  : `${APP_SCOPE_URL.pathname}/`;
const SHELL_FILES = [
  APP_BASE_PATH,
  `${APP_BASE_PATH}index.html`,
  `${APP_BASE_PATH}manifest.webmanifest`,
];

function isSameOrigin(url) {
  return url.origin === APP_ORIGIN;
}

function isAppRequest(url) {
  return url.pathname.startsWith(APP_BASE_PATH);
}

async function putInCache(request, response) {
  if (!response || !response.ok) {
    return response;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return await putInCache(request, response);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  return await putInCache(request, response);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  if (!isSameOrigin(url) || !isAppRequest(url)) {
    return;
  }

  const isNavigationRequest = event.request.mode === 'navigate';
  const isCodeRequest = ['document', 'script', 'style', 'worker'].includes(event.request.destination);
  const isStaticAssetRequest = ['image', 'font', 'manifest'].includes(event.request.destination);

  if (isNavigationRequest || isCodeRequest) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isStaticAssetRequest) {
    event.respondWith(cacheFirst(event.request));
  }
});
