// All data lives in the browser (localStorage, Web Audio), so pages render on the client only.
// Prerendering still emits one HTML shell per route for static hosting.
export const ssr = false;
export const prerender = true;
export const trailingSlash = 'always';
