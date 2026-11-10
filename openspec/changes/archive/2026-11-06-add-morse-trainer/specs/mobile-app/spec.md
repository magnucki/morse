# Spec Delta

## Purpose

Makes the app fully usable on phones as well as desktops, installable to the home screen, and available offline once loaded.

## ADDED Requirements

### Requirement: Responsive layout
All screens (training, evaluation, statistics, translator, settings) SHALL be fully usable from a viewport width of 360 px up to desktop widths, without horizontal scrolling of the page.

#### Scenario: Phone width
- **WHEN** the app is opened at a width of 360 px
- **THEN** every screen fits the width and all controls can be reached and used

#### Scenario: Desktop width
- **WHEN** the app is opened at a width of 1440 px
- **THEN** the content uses a comfortable reading width instead of stretching across the whole screen

### Requirement: Copy input without corrections
The exercise input field SHALL turn off autocorrect, autocomplete, automatic capitalization and spell checking, so that typed groups are not changed by the device.

#### Scenario: Typing groups on a phone
- **WHEN** the learner types "kmsur" into the exercise input on a phone
- **THEN** the field contains exactly "kmsur" and no correction is suggested or applied

### Requirement: Compact exercise view
During an exercise, the essential parts (status, input and controls) SHALL stay visible above the on-screen keyboard on phones.

#### Scenario: Keyboard open
- **WHEN** the learner copies an exercise on a phone with the on-screen keyboard open
- **THEN** the input field, the playback status and the stop button remain visible

### Requirement: Installable app
The app SHALL provide a web app manifest with name, icons and theme colors, so that it can be added to the home screen and opens in its own window without browser controls.

#### Scenario: Add to home screen
- **WHEN** the learner adds the app to the home screen of their phone and opens it from there
- **THEN** it opens full screen with its own name and icon

### Requirement: Offline use
After the app has been loaded once, all features SHALL work without a network connection.

#### Scenario: Train offline
- **WHEN** the learner has opened the app before and now opens it without network access
- **THEN** the app loads and exercises, statistics and translator work

### Requirement: App updates
When a new version of the app has been deployed, the installed app SHALL pick it up on a later visit without the learner losing their stored data.

#### Scenario: New version
- **WHEN** a new version is deployed and the learner opens the app online
- **THEN** the new version is used no later than the next start, and progress and statistics are unchanged
