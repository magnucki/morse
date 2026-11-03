# Spec Delta

## Purpose

Lets the learner use the app in a light or dark look, either following the operating system or chosen manually, without a flash of the wrong theme.

## ADDED Requirements

### Requirement: Theme choice
The system SHALL offer three theme settings: System, Light and Dark. The default SHALL be System. The choice SHALL be saved with the other settings.

#### Scenario: Choose dark
- **WHEN** the learner selects Dark
- **THEN** the app switches to the dark theme immediately and stays dark after a reload

#### Scenario: Default
- **WHEN** the learner opens the app for the first time
- **THEN** the theme setting is System

### Requirement: Follow the system
With the System setting, the app SHALL use the operating system's light or dark preference and SHALL switch when that preference changes while the app is open.

#### Scenario: OS switches to dark
- **WHEN** the setting is System and the operating system switches from light to dark mode
- **THEN** the app switches to the dark theme without a reload

#### Scenario: Manual setting overrides
- **WHEN** the setting is Light and the operating system is in dark mode
- **THEN** the app stays light

### Requirement: No theme flash
On page load, the app SHALL render in the selected theme from the first frame, without briefly showing the other theme.

#### Scenario: Reload in dark mode
- **WHEN** the setting is Dark and the learner reloads the page
- **THEN** no light background is visible at any point during loading

### Requirement: Readable contrast
Text and essential controls SHALL meet a contrast ratio of at least 4.5:1 for body text in both themes.

#### Scenario: Contrast check
- **WHEN** body text is measured against its background in the light and in the dark theme
- **THEN** the contrast ratio is at least 4.5:1 in both
