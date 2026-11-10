# Tasks

## 1. Project setup

- [x] 1.1 Scaffold a SvelteKit project (Svelte 5, TypeScript, Vitest) in the repository root without touching `openspec/` and `.claude/`, and verify `npm run dev` serves the start page
- [x] 1.2 Configure `@sveltejs/adapter-static` and set `ssr = false`, `prerender = true` and `trailingSlash = 'always'` in the root `+layout.ts`, and verify `npm run build` writes a static `build/` folder that `npm run preview` serves
- [x] 1.3 Add a `.gitignore` and `npm` scripts `test`, `check` and `build`, and verify `npm test` and `npm run check` run without errors on the empty project
- [x] 1.4 Create the folder structure from design.md (`src/lib/morse`, `koch`, `timing`, `align`, `stats`, `translate`, `storage`, `audio`, `state`, `components`) and verify it with `ls src/lib`

## 2. Morse code table and timing

- [x] 2.1 Implement the character ↔ code table in `src/lib/morse/code.ts` for all characters in the translator spec (which include the 41 Koch characters), and verify with unit tests for several letters, digits and punctuation marks
- [x] 2.2 Implement the timing schedule in `src/lib/timing/` (PARIS units, Farnsworth gaps by the ARRL formula, effective speed capped at the character speed), and verify with unit tests: 60/180 ms at 20 WpM, 48 ms dot at 25 WpM, 3/7-unit gaps at equal speeds, about 30 s for five "PARIS " at 20/10 WpM

## 3. Audio playback

- [x] 3.1 Implement the Web Audio player in `src/lib/audio/` (shared AudioContext resumed on user action, sine oscillator with 5 ms gain ramps, configurable pitch, stop, new playback stops the old one), and verify by ear in the browser that a test sequence sounds clean at 20 and 40 WpM and stops immediately
- [x] 3.2 Build the dot/dash visualization component that highlights the current element from `ctx.currentTime` and stays static under `prefers-reduced-motion`, and verify both behaviors in the browser with reduced motion on and off
- [x] 3.3 Add the iOS detection and mute hint component, and verify with unit tests for the detection on iPhone, iPad (desktop user agent with touch) and desktop user agents

## 4. Storage and app state

- [x] 4.1 Define the versioned state type `{ version: 1, settings, progress, stats }` with defaults (20 WpM, effective 20 WpM, 600 Hz, 1 min, theme System, lesson 1 unlocked) and a validator, and verify with unit tests for valid, invalid and partial data
- [x] 4.2 Implement the localStorage adapter with memory-only fallback, the corrupt-data backup key and the migration chain, and verify with unit tests using a mocked storage that throws or returns corrupt data
- [x] 4.3 Implement export (dated JSON file download) and import (validate, then replace), and verify with unit tests for the file name, a round trip and the rejection of an invalid file
- [x] 4.4 Implement the rune-based app state in `src/lib/state/` that loads on start and saves after each change, and verify in the browser that a changed setting survives a reload

## 5. Koch lessons and exercise generation

- [x] 5.1 Implement the Koch order and lesson definitions (40 lessons, lesson n has the first n+1 characters, newest character marked), and verify with unit tests for lessons 1, 3 and 40
- [x] 5.2 Implement group generation with an injectable RNG (5-character groups, new-character weight `max(2, round(n/3))`, number of groups from the timing schedule to reach the target duration), and verify with seeded unit tests for group composition, emphasis of the new character and a duration of about one minute
- [x] 5.3 Implement targeted-practice generation (about 60% problem characters, only unlocked characters), and verify with seeded unit tests

## 6. Evaluation and statistics logic

- [x] 6.1 Implement normalization and the Levenshtein alignment with deterministic tie-breaking and sent-index tracking in `src/lib/align/`, and verify with unit tests for all exercise-evaluation spec scenarios (confusion, omission, extra, empty copy, case and spacing)
- [x] 6.2 Implement the exercise score and the unlock rule (at least 90% in the highest unlocked lesson, never from practice or older lessons), and verify with unit tests for 45/51 → 88% and each unlocking scenario
- [x] 6.3 Implement attempt recording with the 50-entry window and total count, hit rate, confusions, the 10-attempt minimum and problem characters sorted worst first in `src/lib/stats/`, and verify with unit tests for all learning-statistics spec scenarios
- [x] 6.4 Implement lesson progress (best score, exercise count) and reset, and verify with unit tests

## 7. Theme and base layout

- [x] 7.1 Define light and dark color tokens, typography (system sans, monospace for codes) and spacing as CSS custom properties, and verify with a contrast checker that body text reaches at least 4.5:1 in both themes
- [x] 7.2 Add the inline theme script to `src/app.html` and the System/Light/Dark switch with a live `matchMedia` listener, and verify in the browser that a reload in Dark shows no light flash and that switching the OS theme updates the app under System
- [x] 7.3 Build the app shell with navigation (Lernen, Statistik, Übersetzer, Einstellungen) that works from 360 px to desktop width with a limited content width, and verify at 360 px and 1440 px in the browser dev tools

## 8. Training screens

- [x] 8.1 Build the lesson overview (all 40 lessons, locked/unlocked, characters and new character, best score) and verify in the browser that only unlocked lessons can be started
- [x] 8.2 Build the exercise screen (start button, focused input with autocorrect/autocapitalize/autocomplete/spellcheck off, playback status, stop/cancel, submit after playback, cancel on page hide), and verify on desktop and in a phone-sized viewport that copying works and that cancelling changes nothing
- [x] 8.3 Build the evaluation view (aligned groups, error markers with signs as well as color, score, unlock message, replay of a character with visualization), and verify in the browser with a copy containing a confusion, an omission and an extra character
- [x] 8.4 Build the targeted-practice screen, including the "nothing to practice yet" state, and verify in the browser that practice updates the statistics without unlocking lessons

## 9. Statistics screen

- [x] 9.1 Build the statistics screen (lesson progress "Lektion n von 40", per-lesson best score and count, character grid in Koch order with number and color, dimmed "zu wenig Daten" cells, problem character list with top confusions, button to targeted practice), and verify in the browser with seeded sample data at 360 px and desktop width
- [x] 9.2 Add reset with a confirmation dialog, and verify in the browser that cancelling keeps the data and confirming resets it

## 10. Translator

- [x] 10.1 Implement text → Morse and Morse → text in `src/lib/translate/` (word separator " / ", alternative dot/dash characters, unsupported and unknown input reported), and verify with unit tests for all morse-translator spec scenarios
- [x] 10.2 Build the translator screen (both directions, live output, notices, play with visualization, copy button), and verify in the browser that "SOS HI" and ".... .. / -.-" translate correctly and that play and copy work

## 11. Settings

- [x] 11.1 Build the settings screen (character speed, effective speed capped at the character speed, pitch, exercise duration, theme, export, import with confirmation, storage-unavailable notice), and verify in the browser that each setting takes effect immediately and survives a reload

## 12. PWA and offline

- [x] 12.1 Add `static/manifest.webmanifest`, app icons and theme-color meta tags, and verify in Chrome dev tools (Application → Manifest) that the app is installable
- [x] 12.2 Implement `src/service-worker/index.ts` (versioned precache of the `$app/manifest` files, cache-first, old caches removed on activate), and verify with `npm run preview` that the app reloads and works with the network set to offline in dev tools

## 13. Integration checks

- [x] 13.1 Run `npm test`, `npm run check` and `npm run build`, and verify all pass without errors or warnings
- [x] 13.2 Walk through the full flow in a phone-sized viewport: complete lesson 1 with at least 90%, see lesson 2 unlocked, check the statistics, export, reset, import, and verify progress is restored
- [x] 13.3 Test the built app on a real phone (via the preview server on the local network or a test deployment): sound after tapping start, mute hint on iOS, add to home screen, offline start
- [x] 13.4 Write a short `README.md` (purpose, `npm` commands, how to deploy the `build/` folder), and verify the documented commands run as written
