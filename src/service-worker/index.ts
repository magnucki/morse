import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';

// One cache per deployed version; older ones are removed on activate.
const CACHE = `morse-${version}`;

// Paths are relative to the base path, which is the service worker's own folder.
// Dotfiles are skipped: many servers refuse them, and one failed file fails the whole install.
const PRECACHE = [...immutable, ...assets, ...prerendered]
	.map(({ path }) => path)
	.filter((path) => !path.split('/').some((segment) => segment.startsWith('.')))
	.map((path) => new URL(path, self.registration.scope).href);

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			// Cache first: everything the app needs is precached and versioned.
			const cached = await cache.match(request, { ignoreSearch: true });
			if (cached) return cached;
			try {
				return await fetch(request);
			} catch (error) {
				// Offline navigation to a URL that is not cached: fall back to the start page.
				if (request.mode === 'navigate') {
					const start = await cache.match(new URL('./', self.registration.scope).href);
					if (start) return start;
				}
				throw error;
			}
		})()
	);
});
