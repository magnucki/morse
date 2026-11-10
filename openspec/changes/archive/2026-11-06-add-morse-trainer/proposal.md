# Proposal

## Why

Learning Morse code by ear works best with the Koch method combined with Farnsworth spacing, but there is no simple, private, installable tool that structures this into repeatable lessons and shows exactly which characters are causing trouble. This project starts from an empty repository and builds that tool as a static web app that keeps all data on the learner's device.

## What Changes

- New static web app (no backend) for learning and translating Morse code, in German, usable on desktop and phone.
- Koch training: 40 lessons in LCWO order (lesson 1 = K, M; each further lesson adds one character), one-minute exercises of random 5-character groups. Scoring at least 90% unlocks the next lesson, and every unlocked lesson can be repeated at any time.
- Farnsworth timing: character speed (default 20 WpM) and a separately adjustable, lower effective speed. Tone pitch defaults to 600 Hz and can be changed.
- Exercise evaluation: the typed copy is aligned against the sent groups, and each character is classified as correct, confused (with which character), omitted or extra.
- Statistics: progress per lesson, hit rate per character over its last 50 attempts, most frequent confusions, and problem characters (shown only from 10 attempts on). A targeted practice mode drills the problem characters.
- Progress, statistics and settings are stored in the browser's localStorage, and can be exported to and imported from a JSON file.
- Translator, steps 1 and 2: text → Morse notation with audio playback, and Morse notation → text.
- Modern, minimalist design with a light/dark theme (follow the system or set manually), Morse dot/dash visuals during playback, and a responsive layout. Installable as a PWA and usable offline.
- Out of scope for now: keyed input by tap/click (translator step 3), decoding from the microphone (step 4), accounts and cross-device sync, German umlauts in the lessons.

## Capabilities

### New Capabilities
- `morse-audio`: Morse timing (character speed, Farnsworth effective speed), tone generation and synchronized dot/dash visualization.
- `koch-training`: Koch lesson structure, lesson unlocking and repetition, exercise generation and flow, targeted practice of problem characters.
- `exercise-evaluation`: Aligning typed copy against sent groups, classifying each character and computing the exercise score.
- `learning-statistics`: Lesson progress, per-character hit rates over the last 50 attempts, confusions and problem characters.
- `progress-storage`: Persisting progress, statistics and settings locally, plus JSON export and import.
- `morse-translator`: Translating text to Morse notation (with playback) and Morse notation to text.
- `color-theme`: Light/dark theme selection that follows the system or is set manually.
- `mobile-app`: Responsive layout, mobile-friendly input, installability and offline use.

### Modified Capabilities
<!-- None: this is the first change in the project. -->

## Impact

- New SvelteKit (Svelte 5, TypeScript) project in the repository root, built with `adapter-static` into a folder of static files that can be uploaded to any static host.
- Dev dependencies: SvelteKit, Vite, TypeScript, Vitest. No runtime dependencies beyond the framework. Audio uses the browser's Web Audio API.
- Requires a modern browser with Web Audio and localStorage. On iOS, sound plays only after a user tap and is silenced by the mute switch.
- All user data stays on the device. Laptop and phone have separate progress unless it is transferred by export/import.
