# Design

## Context

See proposal.md for motivation. Relevant current state:

- `MorsePlayer.play()` schedules all tones on the audio clock with a fixed lead of 0.1 s (`LEAD_S`). `Playback.position()` is negative until the first tone.
- `Exercise.svelte` (used by lesson and practice pages) has the phases `idle → playing → done → result`. Cancelling and hiding the page stop the player.
- The lesson page shows the lesson's characters as static tiles. `MorseVisual` (bars with synchronized highlight) is used by the translator and the evaluation replay.
- Settings are parsed field by field with defaults for missing fields (`parseSettings`), so a new optional field needs no format version bump.

## Goals / Non-Goals

**Goals:**
- A countdown whose end coincides exactly with the first tone.
- Keyboard start without interfering with typing or dialogs.
- Reuse `MorseVisual` and the player for the introduction and the tiles.

**Non-Goals:**
- Automatically playing the introduction on page load: browsers block audio without a user action.
- A configurable countdown length (fixed at 3 s until there is a reason to change it).

## Decisions

### 1. Countdown via the player's lead time

`play()` gets an optional `leadMs` (default 100 ms as today). The exercise starts playback immediately on the click or Enter with `leadMs = 3000 + 100`, and the countdown is derived from `position()`: it shows `ceil(-position / 1000)` while `position < 0`. This keeps one source of truth on the audio clock, so the countdown cannot drift from the first tone, and the AudioContext is unlocked inside the user action as iOS requires.

*Alternative: `setTimeout` for 3 s, then `play()`.* Simple, but then the audio would start outside the user action (a problem on iOS), and timer and audio clock could drift apart.

The phase `playing` covers the countdown too; the status line shows "Gleich geht's los … 3" while `position < 0`, then the running progress. Cancel and page hiding already stop the player, so they work during the countdown without changes.

### 2. Enter key handling

`Exercise.svelte` registers a `keydown` listener on `window` while it is mounted. It starts an exercise on Enter only when the phase is `idle` or `result`, the event target is not an `input`, `textarea`, `select` or `button`, no `dialog[open]` exists, and no modifier key is pressed. Buttons are excluded because Enter already activates a focused button. Locked lessons do not render `Exercise`, so they need no extra check. The start button shows a small "Enter" hint on devices with a fine pointer.

### 3. Introduction and character tiles

The lesson page gets an introduction card above the start button: the new character(s) in large type, the pattern via `MorseVisual` (if enabled) and a "Anhören" button. Listening builds a schedule for `"R R R"` (lesson 1: `"K K K M M M"`), so repetitions are separated by word gaps at the current Farnsworth setting.

The existing character tiles become buttons. Tapping plays the character and shows its pattern in the introduction card's visual area. One shared "currently shown" state keeps only one visual active at a time.

### 4. Pattern display setting

New field `settings.showPatterns: boolean`, default `true`, parsed like the other settings (missing → default, wrong type → invalid). The settings page gets a toggle in the "Darstellung" section. Only the lesson page reads it. The translator and `ResultView` keep showing patterns unconditionally.

## Risks / Trade-offs

- [Enter is also the natural key to submit a copy] → submitting stays on the button. Enter in the textarea inserts a line break as today and never starts a new exercise.
- [Countdown adds 3 s to every exercise] → accepted; it is short compared to 60 s and was asked for.
- [Showing patterns can encourage counting dots instead of hearing the rhythm, against Koch] → the toggle lets learners turn it off; the default follows the owner's wish.

## Migration Plan

No data migration: `showPatterns` is optional with default `true`. Deploys as usual via push to `main`.
