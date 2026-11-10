# Tasks

## 1. Player and setting

- [x] 1.1 Add an optional `leadMs` to `MorsePlayer.play()` (default 100 ms) and verify with a unit test in `player.spec.ts` that the oscillator starts `leadMs` after `currentTime` and `position()` is negative before it
- [x] 1.2 Add `showPatterns: boolean` (default `true`) to the settings schema and validator, and verify with unit tests in `storage.spec.ts` that a missing value becomes `true`, `false` is kept and a non-boolean is rejected

## 2. Countdown and keyboard start

- [x] 2.1 Start exercises with a 3.1 s lead and show the countdown (3, 2, 1) from `position()` in the status line, with the input focused and cancel available, and verify in the browser that the first tone coincides with the end of the countdown and that cancelling during the countdown plays nothing and stores nothing
- [x] 2.2 Add the Enter shortcut in `Exercise.svelte` (only in phases `idle`/`result`, not in text fields, buttons or open dialogs, no modifier keys) plus a small "Enter" hint on the start button for fine pointers, and verify in the browser that Enter starts the exercise and "again", and that Enter in the copy field does not
- [x] 2.3 Check that targeted practice uses the same countdown and Enter behavior, and verify in the browser on `/praxis/` with a seeded problem character

## 3. Lesson introduction

- [x] 3.1 Add the introduction card to the lesson page (new character, lesson 1 K and M, listen button playing it three times with word gaps), and verify in the browser that the button plays the expected schedule and the bars light up in sync
- [x] 3.2 Turn the character tiles into buttons that play the character and show its pattern in the introduction area, and verify in the browser on lesson 3 that tapping U plays U and shows `..-`
- [x] 3.3 Respect `showPatterns` on the lesson page and add the toggle to the "Darstellung" section of the settings, and verify in the browser that turning it off hides patterns on the lesson page but not in the translator or the evaluation, and that it survives a reload

## 4. Integration

- [x] 4.1 Run `npm test`, `npm run check` and `npm run build`, and verify all pass without errors
- [x] 4.2 Take screenshots of the lesson page (light/dark, 360 px and desktop) with patterns on and off, and verify the layout has no horizontal overflow
