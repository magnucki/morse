# exercise-evaluation Specification

## Purpose
Compares what the learner copied with what was sent, robust to missing or extra characters, so each sent character gets a fair verdict and the exercise gets a score.

## Requirements

### Requirement: Input normalization
Before comparing, the system SHALL ignore letter case and all whitespace in both the sent text and the learner's copy, so that misplaced group spaces are not counted as errors.

#### Scenario: Lowercase and spacing
- **WHEN** "KMUKM MMKUK" was sent and the learner typed "kmukmmm kuk"
- **THEN** every character is counted as correct

### Requirement: Alignment-based comparison
The system SHALL align the copy with the sent characters so that the total number of differences is minimal, and SHALL classify every sent character as correct, confused (with the character typed instead) or omitted, and every additional typed character as extra. A single missing or extra character SHALL NOT cause the following characters to be counted as wrong.

#### Scenario: Confusion
- **WHEN** "KMSUR" was sent and the learner typed "KMHUR"
- **THEN** S is classified as confused with H and all other characters as correct

#### Scenario: Omission
- **WHEN** "KMSUR" was sent and the learner typed "KMUR"
- **THEN** S is classified as omitted and K, M, U, R as correct

#### Scenario: Extra character
- **WHEN** "KMSUR" was sent and the learner typed "KMSSUR"
- **THEN** one S is classified as extra and all sent characters as correct

#### Scenario: Empty copy
- **WHEN** the learner submits an empty copy
- **THEN** every sent character is classified as omitted and the score is 0%

### Requirement: Exercise score
The system SHALL compute the exercise score as the number of correct characters divided by the number of sent characters plus the number of extra characters, shown as a whole-number percentage.

#### Scenario: Score with errors
- **WHEN** 50 characters were sent, 45 are correct, 3 confused, 2 omitted and 1 extra was typed
- **THEN** the score is 45 / 51, shown as 88%

### Requirement: Result display
After an exercise, the system SHALL show the sent groups and the learner's copy aligned, with confused, omitted and extra characters marked, together with the score. The learner SHALL be able to replay any sent character from this view.

#### Scenario: Marked result
- **WHEN** the learner submits a copy with one confusion
- **THEN** the result shows both texts aligned, the confused character marked, and the score

#### Scenario: Replay a character
- **WHEN** the learner clicks a marked character in the result
- **THEN** the sent character is played and its dots and dashes are shown

### Requirement: Error markers not by color alone
The result display SHALL mark each kind of error with a visible sign or label in addition to color.

#### Scenario: Color-blind learner
- **WHEN** a learner who cannot tell red from green views a result
- **THEN** they can still tell correct, confused, omitted and extra characters apart
