# Design

## Context

The repository is empty apart from `openspec/`, so this change sets up the project as well as the features (see proposal.md - Why). Constraints from the planning discussion:

- Static hosting only: no backend and no accounts. Data lives in the browser.
- Svelte is the framework the owner knows and prefers.
- It must work on desktop and phone, including iOS Safari, whose Web Audio has restrictions.
- Node.js 22 is available locally.

## Goals / Non-Goals

**Goals:**
- Keep all Morse logic (order, timing, group generation, alignment, statistics, translation) in plain TypeScript modules with no DOM or Svelte dependency, so that it can be unit tested and reused by later features (send training, microphone decoding).
- Make audio timing exact enough for 40+ WpM, independent of UI frame rate.
- Ship a single folder of static files that works under any URL path.

**Non-Goals:**
- Server-side rendering or SEO.
- Internationalization: the UI is German only, and texts are written inline rather than in a translation layer.
- Cross-device sync beyond file export/import.

## Decisions

### 1. SvelteKit with `adapter-static`, SSR off

The app uses SvelteKit (Svelte 5 with runes, TypeScript) and `@sveltejs/adapter-static`. The root `+layout.ts` sets `ssr = false`, `prerender = true` and `trailingSlash = 'always'`. Every route, including all 40 lesson pages (via `entries()`), is prerendered into its own `…/index.html`, so deep links work on any static host without a fallback page or server rewrite rules. (A `fallback: 'index.html'` was considered first, but the adapter docs advise against it because it collides with the prerendered start page.) Asset paths are relative (`paths.relative`, the default). Hosting under a sub-path additionally needs `paths.base` set at build time (documented in the README).

Routes: `/` (lesson overview and start), `/training/[lesson]` (exercise), `/praxis` (targeted practice), `/statistik`, `/uebersetzer`, `/einstellungen`.

- *Alternative: Svelte + Vite without Kit.* Fewer concepts, but routing, the service worker setup and the static build would have to be added by hand.
- *Why SSR off:* everything depends on localStorage and Web Audio, which exist only in the browser. Prerendering an empty shell keeps the build static without guarding every access.

### 2. Layered module structure

```
src/lib/
  morse/code.ts        character <-> code table (shared by training and translator)
  koch/                order, lessons, group generation (seeded RNG for tests)
  timing/              WpM + Farnsworth -> element schedule in ms
  align/               copy vs. sent alignment and scoring
  stats/               attempt recording, rolling window, confusions, problem chars
  translate/           text <-> Morse notation
  storage/             versioned state, localStorage adapter, export/import, migrations
  audio/               Web Audio player that plays a schedule (browser only)
  state/               Svelte 5 rune-based app state (*.svelte.ts) wiring the above
  components/          UI components
```

Everything above `audio/` is pure TypeScript and covered by Vitest. `audio/` and `state/` are thin.

### 3. Timing as a schedule of tone segments

`timing` turns text into a list of `{ start, duration }` tone segments plus the total length, in milliseconds. Unit = 1200 / characterWpm. With Farnsworth (effective speed `s` < character speed `c`), the ARRL formula sets the total extra delay per standard word `ta = (60c - 37.2s) / (s·c)` seconds; the gap between characters becomes `3·ta/19` and the gap between words `7·ta/19`. With `s = c` the gaps are 3 and 7 units.

The same schedule drives audio, the visualization and the exercise duration estimate (groups are added until the schedule reaches the target duration).

### 4. Audio with Web Audio scheduling

One `AudioContext` per app, created or resumed inside the click handler that starts playback (needed by iOS). For each segment, the player plans the tone on the audio clock (`ctx.currentTime + start`) with a single `OscillatorNode` (sine) and a `GainNode` that ramps 5 ms up and down at each edge to avoid clicks. Stopping disconnects the nodes and cancels scheduled values.

The visualization reads `ctx.currentTime` in a `requestAnimationFrame` loop and highlights the segment whose time window contains it. Because the sound is scheduled ahead on the audio clock, a slow UI never changes the timing.

- *Alternative: `setTimeout` per element.* Simple, but its jitter is audible at 20+ WpM.
- *Alternative: pre-render to an AudioBuffer.* Exact, but a one-minute exercise takes noticeable memory and time to start. Scheduling is just as exact here.

iOS detection for the mute hint uses the user agent plus `navigator.maxTouchPoints > 1` on "Macintosh" (iPadOS). Muting cannot be detected, so the hint is always shown on iOS.

### 5. Group generation

Groups are 5 random characters from the lesson. To emphasize the new character, in every lesson above lesson 1 it is drawn with weight `max(2, round(n/3))` where `n` is the number of characters in the lesson, against weight 1 for every other character. For example, in lesson 5 (6 characters) S has weight 2, so its share is 2/7 ≈ 29% against 14% for each of the others. In lesson 40 (41 characters) X has weight 14, about 26%. Targeted practice draws problem characters with a combined share of about 60% and other unlocked characters for the rest. The generator takes an RNG function so that tests can seed it.

### 6. Alignment with Levenshtein backtrace

After normalization (uppercase, whitespace removed), a standard Levenshtein dynamic program (substitution, insertion, deletion all cost 1) is computed between sent and copy. The backtrace produces a list of operations: `match`, `substitute(sent, typed)`, `omit(sent)`, `extra(typed)`. When several paths are equally short, the backtrace prefers match, then substitution, then omission, then extra, which gives the most natural reading of errors. At ~200 characters per one-minute exercise, the O(n·m) table (~40,000 cells) costs nothing.

To show the result in groups, each operation keeps the index of its sent character, so the aligned view can re-insert the group spaces of the sent text.

### 7. Statistics data model

Per character, the state keeps a ring of its last 50 outcomes plus a total count:

```ts
type Outcome = { ok: true } | { ok: false; typed: string | null }; // null = omitted
interface CharStats { recent: Outcome[]; total: number }           // recent.length <= 50
```

Hit rate, confusions and problem characters are computed from `recent` when needed. This keeps the stored data small (41 × 50 entries at most) and makes the rolling window exact. Per lesson, the state keeps `{ best: number; count: number }`.

### 8. Versioned storage

The whole persisted state is a single JSON object `{ version: 1, settings, progress, stats }` under one localStorage key (`morse-trainer`). It is written after every change (changes are infrequent: after exercises and settings changes). On load and on import, `migrate()` runs the chain of converters from the data's version up to the current one, and the result is checked by a hand-written validator (no schema library). Invalid data on import is rejected. Invalid data on load is moved to a backup key `morse-trainer-corrupt` and the app starts fresh, so nothing is lost silently.

Export creates a `Blob` and downloads it through a temporary `<a download>` link. Import reads the chosen file with `File.text()`.

If any localStorage call throws, the storage adapter switches to memory-only mode and the app shows the "progress is not saved" notice.

### 9. Theme with CSS custom properties

Colors are defined as CSS custom properties on `:root` for light and in `[data-theme="dark"]` for dark. An inline script in `src/app.html` reads the saved setting from localStorage before the first paint and sets `data-theme` on `<html>` (resolving System through `matchMedia('(prefers-color-scheme: dark)')`), which avoids the flash. While the app runs, a `matchMedia` listener updates the attribute when the setting is System. The inline script uses a try/catch, so blocked storage falls back to System.

Visual direction: neutral background and text, one accent color, generous spacing, system sans-serif font for text and a monospace font for codes and groups. The hit-rate scale uses a perceptually ordered color ramp checked for contrast in both themes, always with the number next to it.

### 10. PWA with SvelteKit's built-in service worker

`src/service-worker/index.ts` (with its own `tsconfig.json` extending `$app/tsconfig/service-worker`, as SvelteKit 3 expects) uses `$app/manifest` (`immutable`, `assets`, `prerendered`) and `version` from `$app/env` to precache all assets in a cache named after the version, serves them cache-first, and deletes old caches on `activate`. A static `manifest.webmanifest` plus icons lives in `static/`. A new version is installed in the background and takes over on the next start. Stored data is not affected, since it lives in localStorage rather than in the cache.

- *Alternative: `@vite-pwa/sveltekit`.* More features (update prompts, Workbox), but an extra dependency that this small, fully static app does not need.

### 11. Tests

Vitest for all pure modules, with the spec scenarios as test cases (timing values, unlocking, alignment examples, rolling window, translation). Svelte components are checked manually in the browser on desktop and phone width. No end-to-end test framework for now.

## Risks / Trade-offs

- [iOS audio is silent when the mute switch is on, and the app cannot detect it] → show a permanent hint on iOS (spec: morse-audio).
- [iOS may suspend the AudioContext when the app goes to the background] → call `ctx.resume()` on every start, and cancel a running exercise when the page becomes hidden.
- [Browsers may delete localStorage, for example Safari after 7 days without a visit for sites not added to the home screen] → offer export prominently in the settings and recommend installing the app to the home screen on iOS.
- [Different progress on laptop and phone] → accepted. Export/import transfers it by hand.
- [Alignment can read some error patterns differently than a human would] → deterministic tie-breaking and tests with typical copying errors.
- [A cached old app version after deploy] → versioned caches and a takeover on the next start.

## Migration Plan

Not applicable: first version, nothing to migrate. Deployment is uploading the contents of `build/` to any static host. Rollback is uploading the previous build. Stored data format starts at version 1.

## Open Questions

- Hosting target (GitHub Pages, Netlify, Cloudflare Pages or own web space). The build works on all of them, so this can be decided at deployment.
- Exact accent color and icon design. These can be chosen during implementation without changing behavior.
