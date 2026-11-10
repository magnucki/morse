# Spec Delta

## Purpose

Turns characters into correctly timed Morse audio, with Farnsworth spacing, and shows the dots and dashes in sync with the sound so learners can hear and see what is sent.

## ADDED Requirements

### Requirement: Character speed timing
The system SHALL time dots, dashes and the gaps inside a character from the character speed in WpM using the PARIS standard: one dot unit lasts 1200 / WpM milliseconds, a dash lasts 3 units and the gap between elements of one character lasts 1 unit. The default character speed SHALL be 20 WpM.

#### Scenario: Default speed
- **WHEN** a character is played with default settings
- **THEN** a dot lasts 60 ms, a dash 180 ms and each gap inside the character 60 ms

#### Scenario: Changed speed
- **WHEN** the learner sets the character speed to 25 WpM
- **THEN** a dot lasts 48 ms

### Requirement: Farnsworth spacing
The system SHALL let the learner set an effective speed that is lower than or equal to the character speed. When it is lower, the gaps between characters and between groups SHALL be stretched so that the overall rate matches the effective speed, while the characters themselves keep the character speed. By default, the effective speed SHALL equal the character speed.

#### Scenario: Equal speeds
- **WHEN** character speed and effective speed are both 20 WpM
- **THEN** the gap between characters lasts 3 units and the gap between groups 7 units

#### Scenario: Lower effective speed
- **WHEN** character speed is 20 WpM and effective speed is 10 WpM
- **THEN** each character still sounds at 20 WpM, the gaps between characters and groups are longer than 3 and 7 units, and a sequence of five "PARIS " words lasts about 30 seconds

#### Scenario: Effective speed above character speed
- **WHEN** the learner tries to set an effective speed above the character speed
- **THEN** the effective speed is limited to the character speed

### Requirement: Tone generation
The system SHALL play Morse as a sine tone with a configurable pitch, defaulting to 600 Hz. Tones SHALL start and end without audible clicks.

#### Scenario: Default pitch
- **WHEN** the learner plays Morse with default settings
- **THEN** the tone sounds at 600 Hz

#### Scenario: Changed pitch
- **WHEN** the learner sets the pitch to 700 Hz and plays Morse
- **THEN** the tone sounds at 700 Hz

### Requirement: Playback control
The system SHALL let the learner stop a running playback at any time. Starting a new playback SHALL stop any playback that is still running.

#### Scenario: Stop playback
- **WHEN** the learner presses stop during playback
- **THEN** the sound stops immediately

#### Scenario: Overlapping playback
- **WHEN** a playback is running and the learner starts another one
- **THEN** only the new playback is heard

### Requirement: Synchronized visualization
While a character is played on its own (for example a single character replayed from an evaluation, or translator output), the system SHALL show its dots and dashes as bars and highlight each element while it sounds. When the learner prefers reduced motion, the system SHALL show the elements without the highlighting animation.

#### Scenario: Highlight during playback
- **WHEN** the translator plays "K"
- **THEN** the bars for dash, dot, dash are shown and each one is highlighted while its tone sounds

#### Scenario: Reduced motion
- **WHEN** the operating system requests reduced motion and a character is played
- **THEN** the bars are shown without the animated highlight

### Requirement: Audio start on user action
The system SHALL start audio only in response to a user action such as pressing a start or play button, so that browsers that block automatic audio, including iOS Safari, still play sound.

#### Scenario: First playback on iOS
- **WHEN** the learner opens the app on an iPhone and taps the start button of an exercise
- **THEN** the exercise audio is heard (unless the device is muted)

### Requirement: Mute hint on iOS
On iOS devices, the system SHALL show a hint near the controls that start audio, saying that the mute switch silences the app.

#### Scenario: Hint on iPhone
- **WHEN** the learner opens an exercise on an iPhone
- **THEN** a hint says that no sound is heard while the mute switch is on

#### Scenario: No hint on desktop
- **WHEN** the learner opens an exercise in a desktop browser
- **THEN** no mute hint is shown
