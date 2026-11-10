# Spec Delta

## ADDED Requirements

### Requirement: Start countdown
After the learner starts an exercise, the system SHALL show a visible countdown of 3 seconds before the first tone. The input field SHALL have focus during the countdown, and the learner SHALL be able to cancel the exercise during it.

#### Scenario: Countdown before the first tone
- **WHEN** the learner starts an exercise
- **THEN** a countdown 3, 2, 1 is shown, the input field has focus, and the first tone sounds when the countdown ends

#### Scenario: Cancel during countdown
- **WHEN** the learner cancels during the countdown
- **THEN** no tone is played and progress and statistics stay unchanged

#### Scenario: Repeat after a result
- **WHEN** the learner presses "again" after a result
- **THEN** the new exercise also starts with the 3-second countdown

### Requirement: Start with the keyboard
When no exercise is running, pressing Enter SHALL start an exercise (or the next one after a result), unless the focus is in a text field, a dialog is open or the lesson is locked.

#### Scenario: Enter on the lesson page
- **WHEN** the learner is on the page of an unlocked lesson with no exercise running and presses Enter
- **THEN** the exercise starts with the countdown

#### Scenario: Enter after a result
- **WHEN** a result is shown and the learner presses Enter
- **THEN** a new exercise of the same lesson starts with the countdown

#### Scenario: Enter while an exercise runs
- **WHEN** an exercise is running and the learner presses Enter in the input field
- **THEN** no new exercise starts

### Requirement: Introduction of the new character
The lesson page SHALL introduce the lesson's new character (in lesson 1 both K and M) with a button that plays it three times at the current speed and tone settings.

#### Scenario: Listen to the new character
- **WHEN** the learner opens lesson 3 and presses the listen button of the introduction
- **THEN** R is played three times with a word gap between repetitions

#### Scenario: First lesson
- **WHEN** the learner opens lesson 1
- **THEN** the introduction presents K and M, and listening plays each of them three times

### Requirement: Listen to lesson characters
On the lesson page, every character of the lesson SHALL be playable by tapping it.

#### Scenario: Tap a character
- **WHEN** the learner taps U on the page of lesson 3
- **THEN** U is played with the current speed and tone settings

### Requirement: Pattern display setting
The system SHALL offer a setting to show or hide the dot/dash pattern of characters on the lesson page, turned on by default. When on, the introduction and tapped characters SHALL show their pattern and highlight each element while it sounds. When off, the lesson page SHALL play the sound without showing patterns. The setting SHALL NOT affect the translator or the evaluation view.

#### Scenario: Default
- **WHEN** the learner opens a lesson for the first time
- **THEN** the introduction shows the new character's dots and dashes

#### Scenario: Patterns turned off
- **WHEN** the learner has turned the pattern display off and taps a character on the lesson page
- **THEN** the character is played but no dots or dashes are shown

#### Scenario: Translator unaffected
- **WHEN** the pattern display is off and the learner plays a translation
- **THEN** the translator still shows the dots and dashes

#### Scenario: Setting is kept
- **WHEN** the learner turns the pattern display off and reloads the app
- **THEN** the pattern display is still off
