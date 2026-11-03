# Spec Delta

## Purpose

Translates between plain text and Morse notation in both directions and plays the result, as a quick reference tool next to the training.

## ADDED Requirements

### Requirement: Supported characters
The translator SHALL support the letters A–Z, the digits 0–9 and the punctuation . , ? / = ' ! ( ) & : ; + - _ " $ @ with their international Morse codes. Letters SHALL be treated case-insensitively.

#### Scenario: Lowercase letters
- **WHEN** the learner enters "sos"
- **THEN** it is translated like "SOS"

### Requirement: Text to Morse
The system SHALL translate text into Morse notation as it is typed, using "." for dots and "-" for dashes, one space between characters and " / " between words. Unsupported characters SHALL be skipped and pointed out to the learner.

#### Scenario: Words
- **WHEN** the learner enters "SOS HI"
- **THEN** the output is "... --- ... / .... .."

#### Scenario: Unsupported character
- **WHEN** the learner enters "ÄB"
- **THEN** the output is "-..." and a notice says that "Ä" is not supported

### Requirement: Play translation
The learner SHALL be able to play the Morse translation as audio with the current speed and tone settings, with the dots and dashes visualized as they sound.

#### Scenario: Play
- **WHEN** the learner has entered "PARIS" and presses play
- **THEN** the Morse for PARIS is heard with the current settings and visualized in sync

### Requirement: Morse to text
The system SHALL translate Morse notation into text as it is typed. Characters SHALL be separated by one or more spaces and words by "/". Besides "." and "-", the system SHALL accept "·" and "_" / "–" as dot and dash. Unknown code sequences SHALL be shown as "?" in a marked style and pointed out to the learner.

#### Scenario: Words
- **WHEN** the learner enters ".... .. / -.-"
- **THEN** the output is "HI K"

#### Scenario: Unknown sequence
- **WHEN** the learner enters "...... ."
- **THEN** the output shows a marked unknown character followed by "E", and a notice names the unknown sequence "......"

### Requirement: Copy result
The learner SHALL be able to copy the translator output to the clipboard with one button.

#### Scenario: Copy
- **WHEN** the learner presses the copy button next to the output
- **THEN** the output text is in the clipboard and a short confirmation is shown
