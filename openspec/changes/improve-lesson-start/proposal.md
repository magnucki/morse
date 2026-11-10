# Proposal

## Why

The first test runs showed two hurdles at the start of a lesson. The learner has no way to hear or see the new character before the exercise, so they copy characters they have never consciously heard. And the first tone plays 0.1 s after clicking start, which leaves no time to move the hand from the mouse to the keyboard.

## What Changes

- Lesson page gets an introduction of the new character: a card with the character, its dot/dash pattern and a "listen" button that plays it three times. Lesson 1 introduces both K and M.
- Every character of the lesson on the lesson page can be tapped to hear it, with its pattern lighting up in sync.
- New setting "show dot/dash pattern", on by default. When off, the lesson page shows characters and plays sound but hides the patterns (pure Koch: learn by sound). The translator and the evaluation view keep showing patterns regardless.
- Exercises (lessons and targeted practice) start with a visible 3-second countdown. The input field has focus from the start, and the exercise can be cancelled during the countdown.
- Enter starts an exercise (and "again" after a result) when no exercise is running and the focus is not in a text field.
- Unchanged by decision: default speeds stay at 20/20 WpM and exercises stay at 1 minute, following Koch/LCWO.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `koch-training`: new requirements for the start countdown, starting with Enter, introducing the new character, listening to lesson characters and the pattern display setting. Existing requirements stay unchanged.

## Impact

- Code: `src/lib/components/Exercise.svelte` (countdown, Enter), `src/lib/audio/player.ts` (configurable lead time), `src/routes/training/[lesson]/+page.svelte` (introduction and character tiles), `src/routes/einstellungen/+page.svelte` and `src/lib/storage/schema.ts` (new boolean setting).
- Stored data: one new optional setting with a default, so existing data and exports stay valid without a format version bump.
- No new dependencies.
