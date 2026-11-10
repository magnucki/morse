# koch-training Specification

## Purpose
Structures Morse learning by the Koch method into lessons that each add one character, lets learners unlock and freely repeat lessons, and offers targeted practice of characters they struggle with.

## Requirements

### Requirement: Koch character order
The system SHALL teach the 41 characters in this fixed order (LCWO): K M U R E S N A P T L W I . J Z = F O Y , V G 5 / Q 9 2 H 3 8 B ? 4 7 C 1 D 6 0 X.

#### Scenario: Order is fixed
- **WHEN** the learner views the lesson list
- **THEN** the characters appear in the order above

### Requirement: Lesson structure
The system SHALL offer 40 lessons. Lesson 1 SHALL contain the first two characters of the Koch order, and each further lesson SHALL contain all characters of the previous lesson plus the next character in the order.

#### Scenario: First lesson
- **WHEN** the learner opens lesson 1
- **THEN** it uses the characters K and M

#### Scenario: Later lesson
- **WHEN** the learner opens lesson 3
- **THEN** it uses the characters K, M, U and R, and R is marked as the new character

#### Scenario: Last lesson
- **WHEN** the learner opens lesson 40
- **THEN** it uses all 41 characters

### Requirement: Lesson unlocking
At the start only lesson 1 SHALL be unlocked. When the learner scores at least 90% in an exercise of their highest unlocked lesson, the next lesson SHALL be unlocked.

#### Scenario: Unlock with 90%
- **WHEN** lessons 1 to 3 are unlocked and the learner scores 92% in lesson 3
- **THEN** lesson 4 becomes unlocked and the result tells the learner so

#### Scenario: Below threshold
- **WHEN** the learner scores 85% in their highest unlocked lesson
- **THEN** no new lesson is unlocked and the result says that 90% is needed

#### Scenario: Good score in an older lesson
- **WHEN** lessons 1 to 5 are unlocked and the learner scores 100% in lesson 2
- **THEN** no new lesson is unlocked

#### Scenario: Locked lesson
- **WHEN** the learner tries to start a lesson that is not unlocked
- **THEN** the exercise does not start

### Requirement: Lesson repetition
The system SHALL let the learner start an exercise in any unlocked lesson at any time, as often as they like.

#### Scenario: Repeat an earlier lesson
- **WHEN** lessons 1 to 6 are unlocked and the learner chooses lesson 2
- **THEN** an exercise with the characters of lesson 2 starts

### Requirement: Exercise content
An exercise SHALL consist of groups of 5 characters drawn at random from the lesson's characters, separated by group gaps. The number of groups SHALL be chosen so that playback lasts about the configured exercise duration, which defaults to 1 minute.

#### Scenario: Group composition
- **WHEN** an exercise of lesson 2 is generated
- **THEN** every group has exactly 5 characters, each one of K, M or U

#### Scenario: Duration
- **WHEN** an exercise runs with default settings
- **THEN** its playback lasts about one minute

#### Scenario: Shortest duration
- **WHEN** the learner sets the exercise duration to 30 seconds
- **THEN** exercises last about 30 seconds

#### Scenario: Changed duration
- **WHEN** the learner sets the exercise duration to 3 minutes
- **THEN** exercises last about three minutes

### Requirement: New character emphasis
In a lesson above lesson 1, the system SHALL draw the lesson's newest character more often than the other characters, so that it gets enough practice.

#### Scenario: New character appears often
- **WHEN** many exercises of lesson 5 are generated
- **THEN** its new character S makes up a clearly larger share of characters than any other single character

### Requirement: Exercise flow
The learner SHALL start an exercise with a button, then type what they hear into an input field while the groups play. After playback ends, the learner SHALL submit their copy for evaluation. The learner SHALL be able to cancel an exercise, and a cancelled exercise SHALL NOT change progress or statistics.

#### Scenario: Copy during playback
- **WHEN** the learner starts an exercise
- **THEN** the input field receives focus and accepts typing while the groups play

#### Scenario: Submit
- **WHEN** playback has ended and the learner submits the copy
- **THEN** the evaluation is shown and progress and statistics are updated

#### Scenario: Cancel
- **WHEN** the learner cancels a running exercise
- **THEN** playback stops and progress and statistics stay unchanged

### Requirement: Targeted practice
The system SHALL offer a practice exercise that draws mainly the learner's current problem characters (as defined in the learning statistics), mixed with other unlocked characters. Its results SHALL update the statistics but SHALL NOT unlock lessons. If there are no problem characters, the system SHALL say so instead of starting the exercise.

#### Scenario: Practice problem characters
- **WHEN** S and U are problem characters and the learner starts targeted practice
- **THEN** the groups contain S and U much more often than other characters, and only unlocked characters appear

#### Scenario: No unlock from practice
- **WHEN** the learner scores 100% in targeted practice
- **THEN** no new lesson is unlocked

#### Scenario: No problem characters
- **WHEN** the learner has no problem characters and opens targeted practice
- **THEN** the app says there is nothing to practice yet
