# Morse Trainer

Web app for learning Morse code by ear with the Koch method and Farnsworth spacing, plus a text ↔ Morse translator. All progress stays in the browser (localStorage) and can be exported to and imported from a JSON file. Installable as a PWA and usable offline.

Planning documents live in `openspec/changes/add-morse-trainer/`.

## Commands

```bash
npm install        # install dependencies
npm run dev        # development server
npm test           # unit tests (Vitest)
npm run check      # type and Svelte checks
npm run build      # static build into build/
npm run preview    # serve the build locally
```

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`: tests, checks, builds with `BASE_PATH=/<repo name>` and publishes to GitHub Pages at `https://magnucki.github.io/morse/`.

To host elsewhere, `npm run build` prerenders every page (including all 40 lessons) into `build/`. Upload the contents of that folder to any static host with HTTPS (needed for offline use and installing). No server configuration or rewrite rules are needed. The build expects the domain root; for a sub-path such as `https://example.com/morse/`, build with `BASE_PATH=/morse npm run build`.

The service worker caches the app for offline use. After a new deploy, the new version takes over the next time the app is opened. Progress is stored in the browser and is not affected.

## Structure

```
src/lib/
  morse/       character ↔ code table
  koch/        Koch order, lessons, group generation
  timing/      WpM + Farnsworth → tone schedule
  align/       comparing the copy with the sent groups, score
  stats/       per-character statistics, lesson progress
  translate/   text ↔ Morse notation
  storage/     versioned data format, localStorage, export/import
  audio/       Web Audio player, iOS detection
  state/       app state (Svelte 5 runes), theme
  components/  UI components
src/routes/    pages: Lernen, Training, Praxis, Statistik, Übersetzer, Einstellungen
src/service-worker/  offline cache
```
