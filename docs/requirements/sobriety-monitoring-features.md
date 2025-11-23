# Sobriety Monitoring Features - Product Requirements Document

**Epic ID:** CNS-0017  
**Epic Name:** Sobriety Monitoring  
**Feature Area:** Health & Safety  
**Version:** 1.0  
**Last Updated:** 2025-11-23  
**Status:** ✅ Implemented & Documented

---

## Table of Contents
1. [Epic Overview](#epic-overview)
2. [User Stories](#user-stories)
   - [US-SOBRIETY.1: Start Drinking Session](#us-sobriety1-start-drinking-session)
   - [US-SOBRIETY.2: Track Blood Alcohol Content (BAC) in Real-Time](#us-sobriety2-track-blood-alcohol-content-bac-in-real-time)
   - [US-SOBRIETY.3: Receive Sobriety Alerts](#us-sobriety3-receive-sobriety-alerts)
   - [US-SOBRIETY.4: View Sobriety Dashboard](#us-sobriety4-view-sobriety-dashboard)
   - [US-SOBRIETY.5: End Drinking Session](#us-sobriety5-end-drinking-session)
   - [US-SOBRIETY.6: Record Biometric Data](#us-sobriety6-record-biometric-data)
   - [US-SOBRIETY.7: Blood Alcohol Content (BAC) Calculation and Display](#us-sobriety7-blood-alcohol-content-bac-calculation-and-display)

---

## Epic Overview

### Description
The Sobriety Monitoring epic provides users with comprehensive tools to track their alcohol consumption and monitor their estimated Blood Alcohol Content (BAC) in real-time. This safety-focused feature helps users make informed decisions about their drinking, prevents over-consumption through automated alerts and order blocking, and promotes responsible drinking behaviors. The system uses the Widmark formula combined with user biometric data to calculate accurate BAC estimates and provides actionable safety recommendations.

### Business Value
- **Enhanced User Safety**: Real-time BAC monitoring helps prevent alcohol overconsumption
- **Legal Compliance**: Demonstrates responsible alcohol service practices
- **Risk Mitigation**: Reduces liability for venues by actively preventing unsafe alcohol service
- **Health Awareness**: Educates users about their consumption patterns and BAC levels
- **Trust Building**: Shows commitment to customer wellbeing and responsible service
- **Competitive Advantage**: Differentiates from competitors through advanced safety features

### Success Metrics
- Percentage of users with active sobriety monitoring sessions
- Number of orders blocked due to high BAC levels
- Average BAC levels maintained by users during sessions
- Number of sobriety alerts issued and acknowledged
- User biometric profile completion rate
- Session duration and total drinks tracked per session
- User feedback on safety features
- Reduction in over-serving incidents

### Components
- `src/components/sobriety/SobrietyDashboard.tsx`
- `src/components/sobriety/BiometricSetup.tsx`
- `src/components/sobriety/BiometricInput.tsx`
- `src/components/sobriety/SobrietyCheckoutWrapper.tsx`
- `src/hooks/useSobrietyMonitoring.ts`
- `src/pages/SobrietyMonitoring.tsx`

### Database Tables
- `drinking_sessions`
- `drink_records`
- `biometric_readings`
- `sobriety_alerts`
- `user_biometrics`

### Database Functions
- `calculate_bac()` - Widmark formula implementation for BAC calculation
- `update_session_bac()` - Updates session BAC based on drink records
- `trigger_update_session_bac()` - Trigger function for automatic BAC updates

---

## User Stories

### US-SOBRIETY.1: Start Drinking Session

**Story Points:** 5  
**Priority:** P0 - Critical  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user,  
I want to start a sobriety monitoring session when I begin drinking,  
So that the system can track my alcohol consumption and calculate my Blood Alcohol Content (BAC) throughout my visit.

#### Background
Starting a monitoring session is the foundational step for all sobriety tracking features. The session acts as a container for all drink records and biometric readings during a user's visit to a venue. Without an active session, BAC calculations cannot be performed and safety features cannot be enforced. The session must be linked to both the user and the specific venue they're visiting.

#### Value Proposition
- Enables automatic BAC tracking throughout the drinking period
- Provides baseline for safety alerts and order blocking
- Creates accountability and awareness of consumption
- Links consumption to specific venue and time period
- Enables historical analysis of drinking patterns

#### Acceptance Criteria

```gherkin
Feature: Start Drinking Session
  Epic: CNS-0017 - Sobriety Monitoring

  Background:
    Given I am a logged-in Pours Consumer user
    And I have completed my biometric profile setup
    And I am at a venue or have selected a venue

  Scenario: Successfully start a monitoring session
    Given I do not have an active drinking session
    When I navigate to the Sobriety Monitoring page
    And I click "Start Monitoring" button
    Then a new drinking session should be created in the database
    And the session should be linked to my user ID
    And the session should be linked to the current venue ID
    And the session status should be set to "active"
    And the session start time should be recorded as the current timestamp
    And I should see a success toast notification "Session Started - Sobriety monitoring is now active"
    And the dashboard should display "Active" session status

  Scenario: Cannot start session without biometric profile
    Given I have not completed my biometric profile setup
    When I attempt to start a monitoring session
    Then I should see an error toast "Setup Required - Please complete your biometric profile first"
    And no session should be created
    And I should be prompted to complete biometric setup

  Scenario: Cannot start session without venue selection
    Given I have not selected a venue
    When I attempt to start a monitoring session
    Then the "Start Monitoring" button should be disabled
    And I should see helper text "Select a venue to start monitoring"
    And no session should be created

  Scenario: Existing active session is resumed
    Given I already have an active drinking session at the current venue
    When I navigate to the Sobriety Monitoring page
    Then I should see my existing active session displayed
    And the session duration should be calculated from the original start time
    And all session statistics should reflect current state
    And I should not see a "Start Monitoring" button

  Scenario: Session data initialization
    Given I am starting a new monitoring session
    When the session is created
    Then the session should initialize with:
      | Field | Value |
      | estimated_bac | 0.0 |
      | total_drinks | 0 |
      | total_alcohol_ml | 0.0 |
      | status | active |
      | started_at | current timestamp |
      | ended_at | null |

  Scenario: Real-time session tracking begins
    Given I have successfully started a monitoring session
    When the session becomes active
    Then the system should begin polling for session updates every 30 seconds
    And the system should check for new sobriety alerts every 30 seconds
    And the dashboard should display live session information
```

#### Definition of Done
- [x] Start monitoring button creates new drinking session
- [x] Session is properly linked to user and venue
- [x] Session status is set to "active" by default
- [x] Start timestamp is automatically recorded
- [x] Session initializes with zero BAC and drink counts
- [x] Biometric profile validation prevents session creation if incomplete
- [x] Venue selection required before starting session
- [x] Existing active sessions are properly resumed
- [x] Success toast notification displayed on session start
- [x] Real-time polling begins when session becomes active
- [x] Dashboard updates to show active session state

---

### US-SOBRIETY.2: Track Blood Alcohol Content (BAC) in Real-Time

**Story Points:** 8  
**Priority:** P0 - Critical  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user with an active monitoring session,  
I want my Blood Alcohol Content (BAC) to be calculated and updated in real-time as I consume drinks,  
So that I can see my current intoxication level and make informed decisions about continued drinking.

#### Background
Blood Alcohol Content (BAC) tracking is the core functionality of the sobriety monitoring system. The system uses the Widmark formula, which considers alcohol consumed (in grams), user weight, gender, and time elapsed to calculate an estimated BAC percentage. This calculation updates automatically as drinks are recorded and as time passes (BAC naturally decreases over time through metabolism). Real-time tracking provides users with immediate feedback about their intoxication level.

#### Value Proposition
- Provides objective measurement of intoxication level
- Enables informed decision-making about continued drinking
- Prevents dangerous levels of alcohol consumption
- Creates awareness of how alcohol affects the body over time
- Supports responsible drinking behaviors
- Provides data for safety interventions

#### Acceptance Criteria

```gherkin
Feature: Track Blood Alcohol Content (BAC) in Real-Time
  Epic: CNS-0017 - Sobriety Monitoring

  Background:
    Given I am a logged-in Pours Consumer user
    And I have an active drinking session
    And my biometric profile is complete

  Scenario: BAC automatically updates when drink is recorded
    Given my current estimated BAC is 0.000%
    When I complete an order containing alcohol
    And the drink is recorded in the system
    Then the system should call the update_session_bac() database function
    And the function should calculate total alcohol consumed in grams
    And the function should apply the Widmark formula using my biometric data
    And my session's estimated_bac field should be updated with the new value
    And the updated BAC should be displayed on the dashboard within 30 seconds

  Scenario: BAC calculation uses Widmark formula correctly
    Given I am a male user weighing 70kg
    And I consume a drink with:
      | Property | Value |
      | Alcohol Content | 5% |
      | Volume | 330ml |
      | Alcohol in grams | 13.05g (330ml * 0.05 * 0.789g/ml) |
    When the BAC is calculated
    Then the formula used should be: (13.05 / (70 * 0.58 * 1000)) - (0.015 * hours_elapsed)
    And the calculated BAC should be approximately 0.032% (assuming 0 hours elapsed)

  Scenario: BAC calculation accounts for gender differences
    Given two users each weigh 70kg and consume the same 13.05g of alcohol
    When BAC is calculated for a male user
    Then body water ratio should be 0.58 (58%)
    When BAC is calculated for a female user
    Then body water ratio should be 0.49 (49%)
    And the female user's BAC should be higher than the male user's

  Scenario: BAC decreases over time through metabolism
    Given my current estimated BAC is 0.080%
    And 2 hours have elapsed since I started drinking
    And I have not consumed any additional alcohol
    When the system recalculates my BAC
    Then 0.030% should be subtracted (0.015 * 2 hours)
    And my new estimated BAC should be 0.050%

  Scenario: BAC cannot go below zero
    Given my current estimated BAC is 0.010%
    And 2 hours have elapsed since my last drink
    When the system recalculates my BAC
    Then my estimated BAC should be 0.000%
    And not a negative value

  Scenario: Multiple drinks accumulate alcohol correctly
    Given I consume 3 beers, each containing:
      | Property | Value |
      | Alcohol Content | 5% |
      | Volume | 330ml |
    When all drinks are recorded
    Then total alcohol consumed should be 39.15g (3 * 13.05g)
    And the BAC calculation should use the total accumulated alcohol
    And estimated BAC should reflect all drinks consumed

  Scenario: Session statistics update with BAC
    Given I complete an order with 2 alcoholic drinks
    When the drinks are recorded and BAC is calculated
    Then my session should update:
      | Field | Expected Update |
      | total_drinks | Increment by 2 |
      | total_alcohol_ml | Add alcohol volume from both drinks |
      | estimated_bac | Recalculate based on total consumption |
      | updated_at | Set to current timestamp |

  Scenario: Real-time BAC polling on dashboard
    Given I am viewing the Sobriety Dashboard
    And I have an active session
    When 30 seconds elapse
    Then the system should fetch the latest session data from the database
    And the displayed BAC should update if changed
    And the update should occur without requiring page refresh

  Scenario: BAC display formatting
    Given my calculated BAC is 0.03589
    When the BAC is displayed on the dashboard
    Then it should be formatted as "0.036%" (3 decimal places)
    And multiplied by 100 for percentage display
```

#### Technical Implementation Notes
**Widmark Formula:**
```
BAC = (Alcohol_grams / (Weight_kg * Body_Water_Ratio * 1000)) - (0.015 * Hours_Elapsed)

Where:
- Alcohol_grams = Volume_ml * (Alcohol_% / 100) * 0.789 (density of ethanol)
- Body_Water_Ratio = 0.58 (male), 0.49 (female), 0.53 (other/average)
- 0.015 = Standard alcohol metabolism rate per hour
- Hours_Elapsed = Time since session start in hours
```

#### Definition of Done
- [x] Widmark formula correctly implemented in calculate_bac() function
- [x] BAC automatically updates when drinks are recorded
- [x] Gender-specific body water ratios applied correctly
- [x] Time-based metabolism reduction works properly
- [x] BAC cannot go negative (minimum 0.0)
- [x] Multiple drinks accumulate correctly
- [x] Session statistics update alongside BAC
- [x] Dashboard polls for updates every 30 seconds
- [x] BAC displayed with proper formatting (3 decimal places, as percentage)
- [x] Database trigger automatically calls update_session_bac()

---

### US-SOBRIETY.3: Receive Sobriety Alerts

**Story Points:** 8  
**Priority:** P0 - Critical  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user with an active monitoring session,  
I want to receive alerts when my Blood Alcohol Content (BAC) reaches certain thresholds,  
So that I am warned about potentially dangerous levels of intoxication and can make safer choices.

#### Background
Sobriety alerts are proactive safety notifications that warn users when their BAC reaches concerning levels. Alerts are categorized by severity (warning, limit_reached, danger, emergency) and trigger at specific BAC thresholds. Users must acknowledge alerts to dismiss them, ensuring they've seen the safety message. Alerts create intervention points where the system can provide safety recommendations and, in severe cases, block additional alcohol orders.

#### Value Proposition
- Prevents dangerous levels of alcohol consumption through early warnings
- Provides clear safety guidance at critical intervention points
- Creates accountability through mandatory alert acknowledgment
- Reduces risk of alcohol-related harm
- Demonstrates venue commitment to patron safety
- Creates legal documentation of safety interventions

#### Acceptance Criteria

```gherkin
Feature: Receive Sobriety Alerts
  Epic: CNS-0017 - Sobriety Monitoring

  Background:
    Given I am a logged-in Pours Consumer user
    And I have an active drinking session

  Scenario: Warning alert at moderate BAC level
    Given my current BAC reaches 0.030%
    When the system checks my BAC level
    Then a "warning" alert should be created
    And the alert should display with yellow styling
    And the alert title should be "WARNING"
    And the alert message should inform me about my current BAC level
    And I should see the alert both on the dashboard and as a toast notification

  Scenario: Limit reached alert at legal threshold
    Given my current BAC reaches 0.080%
    When the system checks my BAC level
    Then a "limit_reached" alert should be created
    And the alert should display with orange/yellow styling
    And the alert title should be "LIMIT REACHED"
    And the alert message should state "You have reached the legal BAC limit"
    And I should receive recommendations to stop consuming alcohol

  Scenario: Danger alert at high BAC level
    Given my current BAC reaches 0.150%
    When the system checks my BAC level
    Then a "danger" alert should be created
    And the alert should display with red styling
    And the alert title should be "DANGER ALERT"
    And the alert message should warn about dangerous intoxication level
    And additional safety recommendations should be provided

  Scenario: Emergency alert at critical BAC level
    Given my current BAC reaches 0.250% or higher
    When the system checks my BAC level
    Then an "emergency" alert should be created
    And the alert should display with bright red styling and high prominence
    And the alert title should be "EMERGENCY ALERT"
    And the alert message should indicate life-threatening BAC level
    And I should be advised to seek medical attention immediately

  Scenario: Alert appears on dashboard
    Given I have one or more unacknowledged alerts
    When I view the Sobriety Dashboard
    Then alerts should be displayed at the top of the page
    And each alert should show:
      | Element | Details |
      | Warning Icon | Alert triangle icon |
      | Alert Title | Severity-based title |
      | Alert Message | Detailed safety message |
      | Estimated BAC | Current BAC level that triggered alert |
      | Acknowledge Button | Button to dismiss alert |
    And alerts should be ordered by creation time (newest first)

  Scenario: Alert appears as toast notification
    Given a new alert is created for my active session
    When the system detects the new alert
    Then I should see a toast notification immediately
    And the toast should display the alert title and message
    And the toast variant should match alert severity:
      | Alert Type | Toast Variant |
      | warning | default |
      | limit_reached | default |
      | danger | destructive |
      | emergency | destructive |

  Scenario: Acknowledge alert to dismiss
    Given I have an unacknowledged alert displayed on the dashboard
    When I click the "Acknowledge" button on the alert
    Then the alert should be updated with acknowledged_at timestamp
    And the alert should be removed from the dashboard display
    And the alert should be removed from the alerts list

  Scenario: Only show unacknowledged alerts
    Given I have previously acknowledged some alerts
    When I view the Sobriety Dashboard
    Then only alerts where acknowledged_at is null should be displayed
    And previously acknowledged alerts should not appear

  Scenario: Multiple alerts can be active simultaneously
    Given my BAC has increased through multiple drinking episodes
    When I have triggered both a "warning" and "limit_reached" alert
    Then both alerts should be displayed on the dashboard
    And each alert should be independently acknowledgeable
    And I must acknowledge each alert separately

  Scenario: Real-time alert checking
    Given I have an active drinking session
    When the system performs its 30-second polling cycle
    Then it should query the sobriety_alerts table for my user ID
    And it should filter for unacknowledged alerts (acknowledged_at IS NULL)
    And any new alerts should trigger toast notifications
    And the alerts state should update on the dashboard

  Scenario: Alert styling by severity
    When I view alerts on the dashboard
    Then the border and background styling should indicate severity:
      | Alert Type | Border Color | Background |
      | warning | Yellow (border-yellow-500) | Yellow with transparency |
      | limit_reached | Yellow (border-yellow-500) | Yellow with transparency |
      | danger | Red (border-red-500) | Red with transparency |
      | emergency | Red (border-red-500) | Red with transparency |
```

#### Alert Threshold Matrix
| BAC Level | Alert Type | Action Taken |
|-----------|------------|--------------|
| 0.030% | warning | Display warning, no order blocking |
| 0.050% | warning | Display stronger warning |
| 0.080% | limit_reached | Display limit notice, block new orders |
| 0.150% | danger | Display danger alert, recommend stopping |
| 0.250%+ | emergency | Display emergency alert, suggest medical help |

#### Definition of Done
- [x] Alerts created in database when BAC thresholds are crossed
- [x] Alert severity levels properly categorized
- [x] Alerts displayed on dashboard with appropriate styling
- [x] Toast notifications shown for new alerts
- [x] Alert triangle icon displayed on all alerts
- [x] Acknowledge button updates alert and dismisses from view
- [x] Only unacknowledged alerts shown to user
- [x] Multiple alerts can be active and displayed simultaneously
- [x] Alert styling reflects severity (yellow for warning, red for danger/emergency)
- [x] Real-time polling checks for new alerts every 30 seconds
- [x] Alert messages provide clear safety guidance

---

### US-SOBRIETY.4: View Sobriety Dashboard

**Story Points:** 8  
**Priority:** P1 - High  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user,  
I want to view a comprehensive dashboard showing my sobriety monitoring status,  
So that I can see my current BAC, session details, alerts, and safety information all in one place.

#### Background
The Sobriety Dashboard is the central interface for all sobriety monitoring features. It provides a real-time overview of the user's current BAC level, session statistics, active alerts, and safety status. The dashboard updates automatically through polling and presents complex health data in an easily understandable format with visual indicators (colors, progress bars, badges) to communicate safety levels at a glance.

#### Value Proposition
- Centralizes all sobriety information in one accessible location
- Provides immediate visibility into current safety status
- Uses visual indicators for quick comprehension
- Empowers users with real-time health data
- Supports informed decision-making about drinking
- Creates transparency and trust in the monitoring system

#### Acceptance Criteria

```gherkin
Feature: View Sobriety Dashboard
  Epic: CNS-0017 - Sobriety Monitoring

  Background:
    Given I am a logged-in Pours Consumer user
    And I have completed my biometric profile setup

  Scenario: View dashboard with active session
    Given I have an active drinking session
    When I navigate to the Sobriety Monitoring page
    Then I should see the Sobriety Dashboard
    And the dashboard should display in a responsive grid layout
    And the dashboard should show:
      | Card | Content |
      | Blood Alcohol Content | Current BAC, status badge, progress bar |
      | Session Information | Status, duration, total drinks, alcohol consumed |
      | Order Safety | Safe/blocked indicator, safety message |
      | Controls | Record Biometrics button, Update Profile button |

  Scenario: BAC Monitor Card displays current level
    Given my current BAC is 0.045%
    When I view the BAC Monitor card
    Then I should see "0.045%" displayed in large, bold text
    And the text color should be yellow (yellow-400) indicating "caution"
    And I should see a status badge showing "Light"
    And I should see a progress bar filled to approximately 56% (0.045/0.08 * 100)
    And I should see "Legal limit: 0.080%" displayed below the progress bar

  Scenario: BAC status color coding
    When my BAC is at different levels
    Then the BAC display color and status should update:
      | BAC Level | Color | Status Text | Safety Level |
      | 0.000% | Green (green-400) | Sober | safe |
      | 0.020% | Yellow (yellow-400) | Light | caution |
      | 0.060% | Orange (orange-400) | Moderate | warning |
      | 0.100% | Red (red-400) | High | danger |

  Scenario: Session Information Card shows active session
    Given I have been monitoring for 1 hour and 23 minutes
    And I have consumed 3 drinks totaling 39.15ml of alcohol
    When I view the Session Information card
    Then I should see:
      | Field | Display |
      | Status | "Active" badge with default variant |
      | Duration | "1h 23m" |
      | Total Drinks | "3" |
      | Alcohol Consumed | "39.2ml" (rounded to 1 decimal) |
      | End Session Button | Red destructive variant button |

  Scenario: Session Information Card shows no active session
    Given I do not have an active drinking session
    When I view the Session Information card
    Then I should see "No active monitoring session" message
    And I should see a "Start Monitoring" button
    And the button should be purple (bg-purple-600)
    And if no venue is selected, the button should be disabled
    And helper text should explain "Select a venue to start monitoring"

  Scenario: Order Safety Card indicates safe to order
    Given my current BAC is 0.055%
    When I view the Order Safety card
    Then I should see a large green checkmark "✓"
    And the text "Safe to Order" should be displayed in green
    And the message should read "Your current BAC level allows new orders"

  Scenario: Order Safety Card indicates order blocked
    Given my current BAC is 0.090%
    When I view the Order Safety card
    Then I should see a large red "✗" symbol
    And the text "Order Blocked" should be displayed in red
    And the message should read "Please wait for your BAC to decrease before ordering more alcohol"

  Scenario: Controls Card provides action buttons
    When I view the Controls card
    Then I should see two outline variant buttons:
      | Button | Icon | Action |
      | Record Biometrics | Heart icon | Opens BiometricInput modal |
      | Update Profile | Settings icon | Opens BiometricSetup modal |
    And both buttons should span full width
    And buttons should be stacked vertically with spacing

  Scenario: Active alerts displayed above dashboard
    Given I have 2 unacknowledged sobriety alerts
    When I view the Sobriety Dashboard
    Then alerts should be displayed above the main dashboard grid
    And each alert should show in its own Alert component
    And alerts should be ordered by creation time (newest first)
    And I should be able to acknowledge each alert independently

  Scenario: Dashboard updates in real-time
    Given I am viewing the Sobriety Dashboard
    And I have an active session
    When 30 seconds elapse
    Then the system should fetch the latest session data
    And the BAC display should update if changed
    And the session statistics should update if changed
    And new alerts should appear automatically
    And the update should occur without page refresh

  Scenario: Responsive layout on mobile devices
    Given I am viewing the dashboard on a mobile device
    When the screen width is less than 640px
    Then the grid should display as a single column
    And cards should stack vertically
    And all content should remain readable and accessible
    And buttons and interactive elements should be easily tappable

  Scenario: Responsive layout on desktop
    Given I am viewing the dashboard on a desktop device
    When the screen width is greater than 640px
    Then the grid should display as 2 columns
    And cards should be evenly distributed
    And the dashboard should be centered with max-width constraint
    And spacing between cards should be consistent

  Scenario: Biometric setup prompt when profile incomplete
    Given I have not completed my biometric profile
    When I navigate to the Sobriety Monitoring page
    Then I should see a setup prompt card instead of the full dashboard
    And the card should explain why biometrics are needed
    And I should see a "Setup Biometrics" button
    And the button should open the BiometricSetup component

  Scenario: Biometric setup success flow
    Given I am viewing the biometric setup prompt
    When I click "Setup Biometrics"
    And I complete the biometric setup form with valid data
    And I click "Save"
    Then my biometric data should be saved to the database
    And I should see the full Sobriety Dashboard
    And I should be able to start a monitoring session

  Scenario: Record biometrics during session
    Given I am viewing the dashboard with an active session
    When I click "Record Biometrics"
    Then the BiometricInput component should be displayed
    And I should be able to enter heart rate, blood pressure, temperature, and oxygen saturation
    When I submit valid biometric readings
    Then the readings should be saved to biometric_readings table
    And I should return to the main dashboard view

  Scenario: Session duration calculation
    Given my session started at 14:30:00
    And the current time is 16:17:00
    When I view the Session Information card
    Then the duration should display as "1h 47m"
    And the calculation should be based on (current time - started_at)
    And the duration should update every 30 seconds during polling

  Scenario: End session flow
    Given I have an active drinking session
    When I click the "End Session" button on the Session Information card
    Then the session status should be updated to "ended"
    And the ended_at timestamp should be set to current time
    And the session should no longer appear as active
    And real-time polling should stop
    And the dashboard should show "No active monitoring session"
    And I should see a toast notification "Session Ended - Sobriety monitoring stopped"
```

#### Dashboard Layout Structure
```
┌─────────────────────────────────────────┐
│           Alerts Section                │
│  (Displayed only if unacknowledged)     │
└─────────────────────────────────────────┘

┌──────────────────┬──────────────────────┐
│                  │                      │
│ Blood Alcohol    │  Session             │
│ Content Card     │  Information Card    │
│                  │                      │
├──────────────────┼──────────────────────┤
│                  │                      │
│ Order Safety     │  Controls Card       │
│ Card             │                      │
│                  │                      │
└──────────────────┴──────────────────────┘
```

#### Definition of Done
- [x] Dashboard displays all four main cards in responsive grid
- [x] BAC Monitor card shows current BAC with color-coded status
- [x] Progress bar visualizes BAC relative to legal limit (0.08)
- [x] Session Information card shows duration, drinks, alcohol volume
- [x] Session duration calculated and formatted correctly
- [x] Order Safety card indicates safe/blocked status with visual feedback
- [x] Controls card provides access to biometric input and profile update
- [x] Alerts displayed above dashboard when present
- [x] Real-time polling updates dashboard every 30 seconds
- [x] Biometric setup prompt shown when profile incomplete
- [x] End Session button updates session status correctly
- [x] Start Session button creates new session with proper validation
- [x] Responsive layout works on mobile (1 column) and desktop (2 columns)
- [x] All interactive elements accessible and functional
- [x] Toast notifications shown for session start/end

---

### US-SOBRIETY.5: End Drinking Session

**Story Points:** 3  
**Priority:** P0 - Critical  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user with an active monitoring session,  
I want to end my drinking session when I'm finished consuming alcohol,  
So that I can stop monitoring and the system will no longer track my consumption.

#### Background
Ending a drinking session is the clean closure of a monitoring period. When a user ends a session, the system stops calculating BAC updates, ceases polling for alerts, and marks the session as completed with an end timestamp. This is important for accurate historical record-keeping and ensures that future drink consumption doesn't get attributed to an old session. Users should be able to explicitly end sessions rather than leaving them open indefinitely.

#### Value Proposition
- Provides clean closure to drinking episodes
- Creates accurate historical records with start and end times
- Prevents future consumption from being misattributed
- Stops unnecessary system monitoring and polling
- Allows user to signal end of drinking period
- Enables session-based analytics and reporting

#### Acceptance Criteria

```gherkin
Feature: End Drinking Session
  Epic: CNS-0017 - Sobriety Monitoring

  Background:
    Given I am a logged-in Pours Consumer user
    And I have an active drinking session

  Scenario: Successfully end active session
    Given I am viewing the Sobriety Dashboard
    And my session has been active for 2 hours
    When I click the "End Session" button
    Then the session status should be updated from "active" to "ended"
    And the ended_at timestamp should be set to the current time
    And the session should be updated in the database
    And I should see a toast notification "Session Ended - Sobriety monitoring stopped"

  Scenario: Dashboard updates after ending session
    Given I have just ended my drinking session
    When the session update completes
    Then the Session Information card should no longer show session details
    And I should see the message "No active monitoring session"
    And I should see the "Start Monitoring" button
    And the BAC Monitor card should display 0.000% BAC
    And the status should show "Sober"
    And real-time polling should stop

  Scenario: Session end button styling and placement
    Given I have an active drinking session
    When I view the Session Information card
    Then I should see an "End Session" button
    And the button should have a destructive (red) variant
    And the button should span full width
    And the button should display a Square icon
    And the button should be positioned at the bottom of the session details

  Scenario: Cannot end session that's already ended
    Given I have ended my drinking session
    When the dashboard reloads
    Then the "End Session" button should not be displayed
    And I should only see the "Start Monitoring" button

  Scenario: Session statistics preserved after ending
    Given my session has the following statistics:
      | Field | Value |
      | total_drinks | 4 |
      | total_alcohol_ml | 52.2ml |
      | estimated_bac | 0.067% |
      | started_at | 2 hours ago |
    When I end the session
    Then all session statistics should be preserved in the database
    And the session record should remain queryable for historical analysis
    And only the status and ended_at fields should be updated

  Scenario: Real-time monitoring stops after session ends
    Given I have an active session with real-time polling enabled
    When I end the session
    Then the isMonitoring state should be set to false
    And the 30-second polling interval should be cleared
    And no more automatic data fetches should occur
    And the currentSession state should be set to null

  Scenario: Can start new session after ending previous one
    Given I have ended a drinking session
    When I click "Start Monitoring" to begin a new session
    Then a new, separate session record should be created
    And the new session should have its own started_at timestamp
    And the new session should initialize with zero statistics
    And the old session should remain in ended status

  Scenario: Error handling when ending session fails
    Given I attempt to end my session
    But the database update fails
    When the error occurs
    Then I should see an error logged to the console
    And the session state should not change in the UI
    And the monitoring should continue
    And no success toast should be displayed

  Scenario: Session end visible in session history
    Given I have ended a drinking session
    When I view my session history (if implemented)
    Then the ended session should appear with:
      | Field | Display |
      | Status | "ended" |
      | Duration | Calculated from started_at to ended_at |
      | Total Drinks | Final count at session end |
      | Peak BAC | Highest BAC reached during session |
```

#### Session Lifecycle States
```
pending → active → ended
         ↑         
         └─ (can restart new session)
```

#### Definition of Done
- [x] End Session button visible on Session Information card
- [x] Button has destructive styling (red) to indicate finality
- [x] Clicking button updates session status to "ended"
- [x] ended_at timestamp set to current time
- [x] Database update persists session end
- [x] Toast notification confirms session ended
- [x] Dashboard UI updates to reflect ended state
- [x] Real-time polling stops when session ends
- [x] currentSession state set to null
- [x] isMonitoring state set to false
- [x] Session statistics preserved after ending
- [x] User can start new session after ending previous one
- [x] Error handling prevents data corruption if update fails

---

### US-SOBRIETY.6: Record Biometric Data

**Story Points:** 5  
**Priority:** P1 - High  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user with an active monitoring session,  
I want to manually record my biometric readings (heart rate, blood pressure, temperature, oxygen saturation),  
So that the system can track my health status during drinking and detect potential health risks.

#### Background
While BAC calculation is the primary focus of sobriety monitoring, additional biometric data provides supplementary health information that can detect concerning trends or acute health issues. Users can manually enter biometric readings taken from personal devices (fitness trackers, blood pressure monitors, thermometers, pulse oximeters). This data is stored with timestamps and linked to the active session, allowing for temporal analysis and correlation with BAC levels.

#### Value Proposition
- Enables holistic health monitoring beyond just BAC
- Can detect health issues that correlate with alcohol consumption
- Provides data for identifying dangerous health trends
- Supports future integration with wearable devices
- Creates comprehensive health record during drinking episodes
- Enables more sophisticated safety alerts based on multiple factors

#### Acceptance Criteria

```gherkin
Feature: Record Biometric Data
  Epic: CNS-0017 - Sobriety Monitoring

  Background:
    Given I am a logged-in Pours Consumer user
    And I have an active drinking session

  Scenario: Open biometric input form
    Given I am viewing the Sobriety Dashboard
    When I click the "Record Biometrics" button on the Controls card
    Then the BiometricInput component should be displayed
    And the dashboard should be hidden
    And I should see a form with fields for all biometric measurements

  Scenario: Biometric input form fields
    Given I am viewing the BiometricInput form
    Then I should see the following input fields:
      | Field | Type | Placeholder | Range |
      | Heart Rate (BPM) | number | 72 | 40-200 |
      | Systolic BP | number | 120 | 70-250 |
      | Diastolic BP | number | 80 | 40-150 |
      | Temperature (°C) | number (0.1 step) | 36.5 | 35-42 |
      | Oxygen Saturation (%) | number (0.1 step) | 98.0 | 70-100 |
    And each field should be optional
    And each field should have appropriate icons (Heart, Thermometer)

  Scenario: Record heart rate only
    Given I am viewing the BiometricInput form
    When I enter "78" in the Heart Rate field
    And I leave all other fields empty
    And I click "Record"
    Then a biometric reading should be created with:
      | Field | Value |
      | heart_rate | 78 |
      | blood_pressure_systolic | null |
      | blood_pressure_diastolic | null |
      | temperature_celsius | null |
      | oxygen_saturation | null |
      | source | "manual" |
    And the reading should be linked to my active session
    And the reading should be linked to my user ID

  Scenario: Record blood pressure (requires both systolic and diastolic)
    Given I am viewing the BiometricInput form
    When I enter "125" in Systolic BP field
    And I enter "82" in Diastolic BP field
    And I click "Record"
    Then a biometric reading should be created with both values
    And blood_pressure_systolic should be 125
    And blood_pressure_diastolic should be 82

  Scenario: Blood pressure requires both values
    Given I am viewing the BiometricInput form
    When I enter "125" in Systolic BP field
    But I leave Diastolic BP empty
    And I click "Record"
    Then the blood pressure values should not be recorded
    And only other filled fields should be saved

  Scenario: Record all biometric fields
    Given I am viewing the BiometricInput form
    When I enter:
      | Field | Value |
      | Heart Rate | 82 |
      | Systolic BP | 128 |
      | Diastolic BP | 84 |
      | Temperature | 36.8 |
      | Oxygen Saturation | 97.5 |
    And I click "Record"
    Then all five measurements should be saved to the database
    And the recorded_at timestamp should be set to current time
    And the source should be marked as "manual"

  Scenario: Validation - at least one field required
    Given I am viewing the BiometricInput form
    When all fields are empty
    And I click "Record"
    Then I should see an error toast "No Data - Please enter at least one biometric measurement"
    And no biometric reading should be created

  Scenario: Input validation - heart rate range
    Given I am viewing the BiometricInput form
    When I attempt to enter "35" (below minimum of 40)
    Then the input should not accept the value
    When I attempt to enter "205" (above maximum of 200)
    Then the input should not accept the value
    When I enter "72" (within valid range)
    Then the input should accept the value

  Scenario: Input validation - blood pressure ranges
    Given I am viewing the BiometricInput form
    Then the Systolic BP field should accept values between 70-250
    And the Diastolic BP field should accept values between 40-150
    And values outside these ranges should not be accepted

  Scenario: Input validation - temperature range
    Given I am viewing the BiometricInput form
    Then the Temperature field should accept values between 35-42 °C
    And the field should allow decimal values (e.g., 36.7)
    And values outside this range should not be accepted

  Scenario: Input validation - oxygen saturation range
    Given I am viewing the BiometricInput form
    Then the Oxygen Saturation field should accept values between 70-100%
    And the field should allow decimal values (e.g., 97.5)
    And values outside this range should not be accepted

  Scenario: Successful recording confirmation
    Given I have entered valid biometric data
    When I click "Record"
    And the data is successfully saved
    Then I should see a success toast "Success - Biometric data recorded successfully"
    And the BiometricInput form should close
    And I should return to the Sobriety Dashboard

  Scenario: Cancel biometric recording
    Given I am viewing the BiometricInput form
    When I click the "Cancel" button
    Then no biometric data should be saved
    And I should return to the Sobriety Dashboard
    And no toast notification should be shown

  Scenario: Biometric reading includes session and user context
    Given I am recording biometric data
    When the reading is saved
    Then the database record should include:
      | Field | Value |
      | user_id | Current user's ID |
      | session_id | Active session ID |
      | recorded_at | Current timestamp |
      | created_at | Current timestamp |
      | source | "manual" |
    And the reading should be queryable by session for temporal analysis

  Scenario: Multiple readings can be recorded per session
    Given I have already recorded biometric data once
    When I record new biometric data later in the session
    Then both readings should be stored separately
    And each should have its own timestamp
    And each should be linked to the same session ID
    And readings should be queryable chronologically

  Scenario: Information note displayed on form
    Given I am viewing the BiometricInput form
    Then I should see an informational note at the bottom
    And the note should explain that biometric readings improve BAC accuracy
    And the note should state that all fields are optional
    And the note should be styled with yellow warning colors for visibility
```

#### Biometric Data Schema
```typescript
interface BiometricReading {
  id: uuid;
  user_id: uuid;
  session_id: uuid;
  heart_rate: number | null;  // BPM: 40-200
  blood_pressure_systolic: number | null;  // mmHg: 70-250
  blood_pressure_diastolic: number | null;  // mmHg: 40-150
  temperature_celsius: number | null;  // °C: 35-42
  oxygen_saturation: number | null;  // %: 70-100
  recorded_at: timestamp;
  created_at: timestamp;
  source: string;  // "manual", "device", "wearable"
}
```

#### Definition of Done
- [x] BiometricInput component accessible from Controls card
- [x] Form displays all five biometric input fields
- [x] Each field has appropriate input type, placeholder, and range limits
- [x] Icons displayed for heart rate and temperature fields
- [x] At least one field must be filled for submission
- [x] Blood pressure requires both systolic and diastolic values
- [x] Input validation enforces min/max ranges on all fields
- [x] Decimal values supported for temperature and oxygen saturation
- [x] Record button creates biometric_readings record in database
- [x] Reading includes user_id, session_id, and timestamp
- [x] Source field set to "manual" for user-entered data
- [x] Success toast displayed after successful recording
- [x] Form closes and returns to dashboard after recording
- [x] Cancel button returns to dashboard without saving
- [x] Multiple readings can be recorded per session
- [x] Informational note explains purpose and optional nature of fields

---

### US-SOBRIETY.7: Blood Alcohol Content (BAC) Calculation and Display

**Story Points:** 8  
**Priority:** P0 - Critical  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user,  
I want the system to accurately calculate and display my Blood Alcohol Content (BAC) based on my drink consumption and biometric profile,  
So that I can see a scientifically-grounded estimate of my intoxication level.

#### Background
This user story encompasses the complete BAC calculation and display system, including the mathematical formula implementation, database function integration, automatic triggers, and visual presentation. The Widmark formula is the industry-standard method for estimating BAC and considers alcohol consumed (in grams), body weight, biological sex, and time elapsed. The system must handle edge cases like zero BAC, metabolism over time, and ensure calculations update automatically as drinks are added.

#### Value Proposition
- Provides scientifically accurate BAC estimates using accepted formula
- Enables objective assessment of intoxication level
- Creates foundation for all safety features (alerts, order blocking)
- Increases user trust through transparent calculations
- Supports responsible drinking decisions
- Demonstrates commitment to accuracy and safety

#### Acceptance Criteria

```gherkin
Feature: Blood Alcohol Content (BAC) Calculation and Display
  Epic: CNS-0017 - Sobriety Monitoring

  Background:
    Given I am a logged-in Pours Consumer user
    And I have completed my biometric profile

  Scenario: BAC calculation uses correct Widmark formula
    Given the database function calculate_bac() is called
    When calculating BAC for:
      | Parameter | Value |
      | alcohol_grams | 26.1 (two standard beers) |
      | weight_kg | 75 |
      | gender | male |
      | hours_elapsed | 1 |
    Then the calculation should be: (26.1 / (75 * 0.58 * 1000)) - (0.015 * 1)
    And the result should be approximately 0.585 - 0.015 = 0.570% (0.00570)

  Scenario: Body water ratios applied by gender
    Given the calculate_bac() function is calculating BAC
    When gender is "male"
    Then body_water_ratio should be 0.58
    When gender is "female"
    Then body_water_ratio should be 0.49
    When gender is "other"
    Then body_water_ratio should be 0.53 (average)

  Scenario: Alcohol grams calculated from drink properties
    Given a drink with:
      | Property | Value |
      | volume_ml | 330 |
      | alcohol_content | 5% |
    When calculating alcohol in grams
    Then the calculation should be: 330 * (5/100) * 0.789
    And the result should be 13.0185 grams
    And 0.789 is the density of ethanol in g/ml

  Scenario: Metabolism reduces BAC over time
    Given my initial BAC is 0.080%
    When 2 hours have elapsed
    Then 0.030% should be subtracted (0.015 per hour * 2)
    And my current BAC should be 0.050%
    When 6 hours have elapsed
    Then 0.090% would be subtracted (0.015 * 6)
    But my BAC should be 0.000% (cannot go negative)

  Scenario: BAC cannot be negative
    Given any BAC calculation result
    When the calculated value would be negative
    Then the function should return 0.0 instead
    And this is enforced by GREATEST(bac, 0) in the function

  Scenario: Multiple drinks accumulate correctly
    Given I consume three drinks:
      | Drink | Alcohol Content | Volume | Alcohol (grams) |
      | Beer 1 | 5% | 330ml | 13.02g |
      | Beer 2 | 5% | 330ml | 13.02g |
      | Beer 3 | 5% | 330ml | 13.02g |
    When BAC is calculated
    Then total alcohol should be 39.06 grams
    And all drinks should be summed before applying Widmark formula

  Scenario: Automatic BAC update when drink is recorded
    Given I have an active drinking session
    When a new drink_record is inserted into the database
    Then the trigger_update_session_bac() trigger should fire
    And it should call the update_session_bac() function
    And the function should recalculate total alcohol consumed
    And the function should update the drinking_sessions table
    And the estimated_bac field should reflect the new value

  Scenario: Session statistics update with BAC calculation
    Given I record a drink during my session
    When the update_session_bac() function runs
    Then the drinking_sessions record should update:
      | Field | Update |
      | estimated_bac | New calculated value |
      | total_alcohol_ml | Sum of all drink alcohol_ml values |
      | total_drinks | Count of all drink_records |
      | updated_at | Current timestamp |

  Scenario: BAC display formatting on dashboard
    Given my calculated BAC is 0.03589 (decimal)
    When displayed on the BAC Monitor card
    Then it should be multiplied by 100 to get 3.589
    And it should be formatted to 3 decimal places: "3.589"
    And it should include the percentage symbol: "3.589%"
    And the display should use formatBAC() function

  Scenario: BAC status color and text mapping
    When my BAC is displayed on the dashboard
    Then the color and status should map as:
      | BAC Level | Color | Status Text | Level |
      | 0.000 | green-400 | Sober | safe |
      | 0.025 | yellow-400 | Light | caution |
      | 0.065 | orange-400 | Moderate | warning |
      | 0.120 | red-400 | High | danger |

  Scenario: Progress bar visualization
    Given my current BAC is 0.045%
    When the progress bar is rendered
    Then the value should be calculated as: (0.045 / 0.08) * 100
    And the progress bar should show 56.25% filled
    And the maximum is set to 0.08% (legal limit in most jurisdictions)
    When my BAC is 0.090%
    Then the progress bar should show 100% filled (capped at 100)

  Scenario: Real-time BAC updates on dashboard
    Given I am viewing the Sobriety Dashboard
    And I have an active session
    When the 30-second polling cycle occurs
    Then the system should fetch the latest session data
    And if estimated_bac has changed, the display should update
    And the color, status text, and progress bar should all update accordingly

  Scenario: BAC calculation with no drinks
    Given I have started a new session
    And I have not yet consumed any drinks
    When BAC is calculated
    Then total alcohol should be 0 grams
    And BAC should be 0.000%
    And the display should show "Sober" status with green color

  Scenario: Hours elapsed calculation
    Given my session started_at is 2024-11-23 14:00:00
    And the current time is 2024-11-23 16:30:00
    When calculating hours_elapsed
    Then it should be: (16:30:00 - 14:00:00) / 3600 seconds
    And the result should be 2.5 hours
    And this should reduce BAC by 0.0375% (0.015 * 2.5)

  Scenario: Database function error handling
    Given the update_session_bac() function is called
    When the user_biometrics record is missing for the user
    Then the function should handle the null user_bio record
    And it should not crash or throw an unhandled error
    And the session should remain in a valid state

  Scenario: BAC persists across page reloads
    Given my current BAC is 0.067%
    When I refresh the page
    Then the system should fetch the session from the database
    And the displayed BAC should still be 0.067%
    And all calculations should be based on stored values
```

#### Widmark Formula Details
```sql
-- Implemented in calculate_bac() database function
BAC = (alcohol_grams / (weight_kg * body_water_ratio * 1000)) - (0.015 * hours_elapsed)

Where:
- alcohol_grams = SUM(volume_ml * alcohol_% * 0.789) across all drinks
- weight_kg = From user_biometrics table
- body_water_ratio = 0.58 (male), 0.49 (female), 0.53 (other)
- 0.015 = Standard alcohol metabolism rate (% per hour)
- hours_elapsed = (current_time - session.started_at) in hours
- Result constrained to >= 0.0 (cannot be negative)
```

#### Database Integration
```sql
-- Trigger that fires on drink_records INSERT
CREATE TRIGGER after_drink_record_insert
  AFTER INSERT ON drink_records
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_session_bac();

-- Function called by trigger
CREATE FUNCTION update_session_bac(session_id_param UUID)
  - Fetches session and user biometrics
  - Sums all drink alcohol in grams
  - Calculates hours elapsed
  - Calls calculate_bac() with parameters
  - Updates drinking_sessions table
```

#### Definition of Done
- [x] calculate_bac() database function implements Widmark formula
- [x] Gender-specific body water ratios applied correctly
- [x] Alcohol grams calculated from volume and ABV percentage
- [x] Metabolism reduction applied based on time elapsed
- [x] BAC constrained to non-negative values
- [x] update_session_bac() function sums all drinks and recalculates
- [x] Trigger automatically calls update function on drink insert
- [x] Session statistics (total_drinks, total_alcohol_ml) update with BAC
- [x] BAC formatted for display (3 decimals, percentage symbol)
- [x] Color coding reflects BAC level (green/yellow/orange/red)
- [x] Status text matches BAC level (Sober/Light/Moderate/High)
- [x] Progress bar visualizes BAC relative to 0.08% limit
- [x] Dashboard displays real-time BAC updates via polling
- [x] BAC persists correctly across page reloads
- [x] Zero BAC handled correctly for new sessions

---

## Technical Implementation Notes

### Architecture Overview
```
┌─────────────────────────────────────────────┐
│           User Interface Layer              │
│  - SobrietyDashboard (main view)           │
│  - BiometricSetup (profile creation)       │
│  - BiometricInput (readings entry)         │
│  - SobrietyCheckoutWrapper (order safety)  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Business Logic Layer              │
│  - useSobrietyMonitoring (hook)            │
│  - Session management                       │
│  - Alert checking                           │
│  - Safety validations                       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Data Layer                        │
│  - drinking_sessions table                  │
│  - drink_records table                      │
│  - biometric_readings table                 │
│  - sobriety_alerts table                    │
│  - user_biometrics table                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Calculation Layer                   │
│  - calculate_bac() function                 │
│  - update_session_bac() function            │
│  - trigger_update_session_bac() trigger     │
└─────────────────────────────────────────────┘
```

### Data Flow for Drink Recording
1. User places order with alcoholic drinks
2. Order completed → SobrietyCheckoutWrapper.handleOrderComplete()
3. For each alcoholic item, recordDrink() called
4. drink_records INSERT with product details
5. Database trigger fires → trigger_update_session_bac()
6. update_session_bac() calculates total alcohol
7. calculate_bac() applies Widmark formula
8. drinking_sessions.estimated_bac updated
9. Frontend polling detects change within 30 seconds
10. Dashboard UI updates with new BAC

### Real-Time Polling Strategy
```typescript
useEffect(() => {
  if (user && isMonitoring) {
    const interval = setInterval(() => {
      checkCurrentSession();  // Fetch latest session data
      checkForAlerts();       // Check for new alerts
    }, 30000); // 30-second interval

    return () => clearInterval(interval);
  }
}, [user, isMonitoring]);
```

### Safety Order Blocking Logic
```typescript
const isSafeToOrder = () => {
  if (!currentSession) return true;  // No session = no restrictions
  return currentSession.estimated_bac < 0.08;  // Block at legal limit
};

// Used in SobrietyCheckoutWrapper to prevent checkout
if (!safeToOrder && hasAlcoholicItems) {
  // Display blocking message
  // Redirect to safety recommendations
}
```

### Biometric Profile Requirements
- **weight_kg**: Required for Widmark formula denominator
- **height_cm**: Stored but not currently used in calculations
- **gender**: Required for body water ratio selection
- **body_fat_percentage**: Optional, for future enhanced calculations

---

## Dependencies

### Technical Dependencies
- Supabase for database and real-time capabilities
- React hooks for state management
- Tailwind CSS for styling
- Shadcn UI components (Card, Alert, Badge, Progress, Button)
- Lucide React for icons
- useToast hook for notifications

### Feature Dependencies
- **User Authentication**: Required to identify users and link sessions
- **Venue Selection**: Required to start monitoring sessions
- **Product Data**: Alcohol content and volume data from products table
- **Order System**: Integration for recording drinks from completed orders

### Database Dependencies
- RLS policies allow users to manage their own data
- Trigger functions must execute with proper permissions
- Database functions use SECURITY DEFINER where needed

---

## Future Enhancements

1. **Wearable Device Integration**: Automatic biometric data from smartwatches, fitness trackers
2. **Predictive BAC**: Forecast BAC levels based on current consumption rate
3. **Personalized Metabolism Rates**: Learn user-specific metabolism instead of standard 0.015
4. **Social Features**: Share sobriety status with designated friends/family
5. **Breathalyzer Integration**: Calibrate estimates with actual breathalyzer readings
6. **ML-Based Alerts**: Machine learning to predict risky drinking patterns
7. **Emergency Contact Notifications**: Auto-notify contacts at dangerous BAC levels
8. **Ride Service Integration**: Offer Uber/Lyft when BAC exceeds safe driving limit
9. **Historical Analytics**: Trends, patterns, and insights from past sessions
10. **Gamification**: Rewards for responsible drinking behaviors

---

## Compliance and Legal Considerations

### Disclaimers Required
- BAC estimates are approximations, not medical measurements
- Users should not rely solely on estimates for safety decisions
- System cannot replace professional medical advice
- Actual BAC can vary based on many factors not captured

### Liability Protection
- Clear documentation that system is a safety tool, not a guarantee
- Terms of service should address limitation of liability
- Recommend professional breathalyzer or medical testing for accuracy
- Encourage users to err on the side of caution

### Privacy Considerations
- Biometric and consumption data is highly personal
- Clear privacy policy about data usage
- Option to delete historical session data
- No sharing of consumption data without explicit consent

---

## Testing Strategy

### Unit Testing
- BAC calculation accuracy across various inputs
- Gender ratio application
- Time-based metabolism reduction
- Edge cases (zero BAC, negative prevention)

### Integration Testing
- Trigger firing on drink record insertion
- Session statistics updating correctly
- Alert creation at proper thresholds
- Order blocking when BAC exceeds limit

### User Acceptance Testing
- Complete session lifecycle (start, monitor, end)
- Biometric setup and recording workflows
- Alert acknowledgment and display
- Dashboard real-time updates
- Responsive layout on various devices

### Performance Testing
- Polling efficiency with many concurrent users
- Database function execution time
- Alert query performance
- Dashboard render performance

---

## Appendix

### Related Documentation
- `docs/requirements/biometric-settings-features.md`
- `docs/requirements/checkout-features.md`
- `docs/master-consumer-features-epics-requirements-list.md`

### Medical References
- Widmark, E. M. P. (1932). "Die theoretischen Grundlagen und die praktische Verwendbarkeit der gerichtlich-medizinischen Alkoholbestimmung"
- National Highway Traffic Safety Administration (NHTSA) BAC guidelines
- World Health Organization alcohol consumption standards

### Testing Notes
- Test with various user weights (50kg - 120kg)
- Test with all gender options
- Test time-based metabolism at various intervals
- Test multiple drinks in quick succession
- Test session resumption after page reload
- Test alert triggering at all threshold levels
- Test order blocking with high BAC
- Test biometric data recording with partial data
