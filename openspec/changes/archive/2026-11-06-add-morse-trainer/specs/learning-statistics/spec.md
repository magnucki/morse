# Spec Delta

## Purpose

Shows learners how far they have come and which characters cause trouble, by lesson and by character, based on their recent performance rather than their whole history.

## ADDED Requirements

### Requirement: Per-character attempts
Every sent character in a submitted exercise (lesson or targeted practice) SHALL count as one attempt for that character: a success if classified correct, otherwise a failure. Extra characters SHALL NOT count as attempts for any character.

#### Scenario: Attempts from an exercise
- **WHEN** an exercise sent S four times and the learner copied three of them correctly and confused one with H
- **THEN** S gets three successful and one failed attempt

### Requirement: Hit rate over the last 50 attempts
The hit rate of a character SHALL be the share of successful attempts among its most recent 50 attempts, or among all its attempts if it has fewer than 50. The statistics SHALL also show each character's total number of attempts.

#### Scenario: Old errors drop out
- **WHEN** a character failed its first 20 attempts and succeeded in the next 50
- **THEN** its hit rate is 100% and its total shows 70 attempts

#### Scenario: Fewer than 50 attempts
- **WHEN** a character has 20 attempts, 15 of them successful
- **THEN** its hit rate is 75%

### Requirement: Minimum data
A character with fewer than 10 attempts SHALL be shown as having too little data instead of a hit rate, and SHALL NOT count as a problem character.

#### Scenario: Too little data
- **WHEN** a character has 4 attempts
- **THEN** the statistics show "too little data" (in German) instead of a percentage

### Requirement: Confusions
For each character, the system SHALL show which characters it was most often confused with, with counts, based on the same last 50 attempts.

#### Scenario: Frequent confusion
- **WHEN** S was confused with H 6 times and with I 2 times in its last 50 attempts
- **THEN** the statistics for S show H (6) first and I (2) second

### Requirement: Problem characters
A character SHALL be a problem character when it has at least 10 attempts and a hit rate below 90%. The statistics SHALL list the problem characters, worst hit rate first.

#### Scenario: Problem character listed
- **WHEN** U has 40 attempts at 71% and S has 30 attempts at 58%
- **THEN** both are listed as problem characters, S before U

#### Scenario: Good character not listed
- **WHEN** K has 100 attempts at 95%
- **THEN** K is not a problem character

### Requirement: Character overview
The statistics SHALL show all characters of the unlocked lessons in Koch order as a grid, each with its hit rate as a number and a color on a scale from weak to good. Characters with too little data SHALL appear dimmed.

#### Scenario: Grid
- **WHEN** the learner opens the statistics with lessons 1 to 6 unlocked
- **THEN** the grid shows K M U R E S N in Koch order, each with its hit rate number and color

### Requirement: Lesson progress
The statistics SHALL show the highest unlocked lesson out of 40, and for each unlocked lesson its best score and the number of exercises done.

#### Scenario: Progress overview
- **WHEN** the learner has unlocked lesson 7 and done lesson 7 three times with a best score of 84%
- **THEN** the statistics show "lesson 7 of 40" (in German) and, for lesson 7, best 84% and 3 exercises

### Requirement: Reset statistics
The learner SHALL be able to reset all progress and statistics after an explicit confirmation.

#### Scenario: Reset
- **WHEN** the learner chooses reset and confirms
- **THEN** only lesson 1 is unlocked and all character statistics are empty

#### Scenario: Reset cancelled
- **WHEN** the learner chooses reset and cancels the confirmation
- **THEN** nothing changes
