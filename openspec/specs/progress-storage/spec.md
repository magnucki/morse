# progress-storage Specification

## Purpose
Keeps the learner's progress, statistics and settings on their own device without any server, and lets them back it up or move it to another device as a file.

## Requirements

### Requirement: Local persistence
The system SHALL save lesson progress, character statistics and settings in the browser's local storage after every change, and SHALL restore them when the app is opened again. No data SHALL be sent to a server.

#### Scenario: Reopen the app
- **WHEN** the learner unlocks lesson 4, closes the browser and opens the app again
- **THEN** lessons 1 to 4 are unlocked and the statistics are unchanged

#### Scenario: Settings kept
- **WHEN** the learner sets the effective speed to 10 WpM and reloads the page
- **THEN** the effective speed is still 10 WpM

### Requirement: Storage unavailable
If local storage cannot be used (for example in some private browsing modes), the app SHALL keep working for the current visit and SHALL show a notice that progress will not be saved.

#### Scenario: Private mode without storage
- **WHEN** the app runs in a browser where local storage throws errors
- **THEN** exercises still work and a notice says progress is not saved

### Requirement: Export
The learner SHALL be able to export all progress, statistics and settings as a JSON file named with the current date, for example `morse-trainer-2026-11-02.json`.

#### Scenario: Export file
- **WHEN** the learner presses export on 2 November 2026
- **THEN** the browser downloads `morse-trainer-2026-11-02.json` containing their progress, statistics and settings

### Requirement: Import
The learner SHALL be able to import a previously exported file. Before importing, the system SHALL ask for confirmation that the current data will be replaced. A file that is not a valid export SHALL be rejected with an error message and SHALL leave the current data unchanged.

#### Scenario: Import on another device
- **WHEN** the learner imports an export file on their phone and confirms
- **THEN** the phone shows the same progress, statistics and settings as the device that exported it

#### Scenario: Invalid file
- **WHEN** the learner tries to import a file that is not a valid export
- **THEN** an error message is shown and the current data stays unchanged

#### Scenario: Import cancelled
- **WHEN** the learner selects a valid file but cancels the confirmation
- **THEN** the current data stays unchanged

### Requirement: Data format versioning
Stored and exported data SHALL carry a format version. When the app finds data in an older format version, it SHALL convert it to the current version instead of discarding it.

#### Scenario: Older export
- **WHEN** a future version of the app imports a file exported by this version
- **THEN** the data is converted and imported
