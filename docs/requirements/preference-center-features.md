# Preference Center Features - Product Requirements

**Epic Extension:** CNS-0011 - Manage Profile (Preference Center Module)  
**Feature Area:** Customer Profile Management  
**Status:** 📋 Planned  
**Priority:** P1 - High

---

## Table of Contents
- [Module Overview](#module-overview)
- [User Stories](#user-stories)
  - [US-PREF.1: Manage Notification Preferences](#us-pref1-manage-notification-preferences)
  - [US-PREF.2: Manage Marketing Communications](#us-pref2-manage-marketing-communications)
  - [US-PREF.3: Manage Privacy Settings](#us-pref3-manage-privacy-settings)
  - [US-PREF.4: Manage Data Sharing Controls](#us-pref4-manage-data-sharing-controls)
  - [US-PREF.5: View and Manage Consent History](#us-pref5-view-and-manage-consent-history)
- [Technical Requirements](#technical-requirements)
- [Database Schema](#database-schema)
- [API & Edge Functions](#api--edge-functions)
- [Security & Compliance](#security--compliance)

---

## Module Overview

### Description
The Preference Center is a centralized hub within the Manage Profile section where users can control all aspects of their communication preferences, privacy settings, data sharing permissions, and consent management. This module empowers users with granular control over how Pours+ interacts with them and uses their data.

### Business Value
- **User Empowerment**: Gives users control over their data and communications
- **Compliance**: Meets GDPR, CCPA, and CAN-SPAM requirements
- **Trust Building**: Demonstrates commitment to privacy and user choice
- **Reduced Unsubscribes**: Allows granular preferences instead of all-or-nothing opt-outs
- **Better Engagement**: Users receive only relevant communications they've opted into

### Success Metrics
- Preference center access rate: >30% of active users
- Preference update completion rate: >85%
- Reduction in unsubscribe requests: >40%
- User satisfaction with preference controls: >4.5/5
- Compliance audit pass rate: 100%

### Acceptance Criteria
- Single centralized location for all preferences
- Granular control over communication types
- Clear explanations of what each preference controls
- Immediate application of preference changes
- Compliance with data privacy regulations
- Mobile-responsive interface
- Accessibility compliant (WCAG 2.1 AA)

---

## User Stories

### US-PREF.1: Manage Notification Preferences

**As a** Pours Consumer user  
**I want to** manage my notification preferences across different channels  
**So that** I only receive notifications through my preferred methods and for topics I care about

#### Background
Users receive various types of notifications from the Pours+ platform (order updates, rewards, promotions). Providing granular control over notification channels and types improves user experience and reduces notification fatigue.

#### Value Proposition
- Reduces notification fatigue through user choice
- Improves engagement with relevant notifications
- Respects user communication preferences
- Decreases app uninstalls due to notification overload

#### Gherkin Scenarios

```gherkin
Feature: Manage Notification Preferences
  As a user
  I need to control my notification preferences
  So that I receive only relevant notifications through my preferred channels

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Preferences" > "Notifications"

  Scenario: View current notification preferences
    When the preferences page loads
    Then I should see notification preferences organized by category:
      | Category | Description |
      | Order Updates | Notifications about order status changes |
      | Rewards & Points | Notifications about points earned, rewards available |
      | Promotional Offers | Special deals, discounts, and promotions |
      | Venue Updates | News from favorite venues |
      | Account Activity | Login alerts, password changes, security |
    And each category should show available channels:
      | Channel | Description |
      | Email | Receive via email |
      | Push Notification | Receive via mobile app (future) |
      | SMS | Receive via text message (future) |
      | In-App | Show in app notification center |
    And my current preferences should be pre-selected

  Scenario: Enable email notifications for order updates
    Given email notifications for order updates are currently disabled
    When I toggle "Email" ON for "Order Updates"
    And I click "Save Preferences"
    Then I should see a success message "Preferences updated successfully"
    And I should receive email notifications for future order updates
    And my preference should persist after page refresh

  Scenario: Disable all promotional notifications
    Given I am receiving promotional notifications via email and push
    When I toggle OFF all channels for "Promotional Offers"
    And I click "Save Preferences"
    Then I should see a success message "Preferences updated successfully"
    And I should not receive any promotional notifications
    And my preference should be recorded with timestamp

  Scenario: Configure granular notification preferences
    When I enable the following preferences:
      | Category | Channel | Enabled |
      | Order Updates | Email | Yes |
      | Order Updates | In-App | Yes |
      | Order Updates | SMS | No |
      | Rewards & Points | Email | Yes |
      | Rewards & Points | In-App | Yes |
      | Promotional Offers | Email | No |
      | Promotional Offers | In-App | Yes |
    And I click "Save Preferences"
    Then each preference should be saved individually
    And I should receive notifications according to my exact preferences

  Scenario: Notification frequency control
    Given I am viewing "Promotional Offers" preferences
    When I see a "Frequency" dropdown
    Then I should be able to select:
      | Frequency | Description |
      | Real-time | As they happen |
      | Daily Digest | Once per day summary |
      | Weekly Digest | Once per week summary |
      | Never | No notifications |
    When I select "Weekly Digest"
    And I click "Save Preferences"
    Then I should receive promotional offers in a weekly summary

  Scenario: Critical notifications cannot be fully disabled
    Given I am viewing "Account Activity" preferences
    When I attempt to disable all notification channels
    Then I should see a message "Security notifications cannot be fully disabled"
    And at least one channel should remain enabled
    And I should be able to choose which channel remains active

  Scenario: Test notification feature
    Given I have configured my notification preferences
    When I click "Send Test Notification" for "Order Updates"
    Then I should receive a test notification via my enabled channels
    And I can verify my preferences are working correctly

  Scenario: Quiet hours configuration
    Given I am viewing notification preferences
    When I expand "Quiet Hours" settings
    And I set quiet hours from "10:00 PM" to "8:00 AM"
    And I click "Save Preferences"
    Then non-critical notifications should not be sent during quiet hours
    And critical notifications (order ready, security alerts) should still be delivered
```

#### Acceptance Criteria
- [ ] Notification preferences organized by category
- [ ] Multi-channel control (Email, Push, SMS, In-App)
- [ ] Granular enable/disable for each category-channel combination
- [ ] Frequency control for promotional notifications
- [ ] Quiet hours configuration
- [ ] Test notification feature
- [ ] Critical notifications cannot be fully disabled
- [ ] Immediate preference application
- [ ] Clear descriptions for each notification type
- [ ] Success feedback on save
- [ ] Mobile-responsive interface

#### Technical Notes
- Store preferences in `user_notification_preferences` table
- Use bitwise flags for efficient channel storage
- Default all order updates to enabled
- Respect quiet hours in notification sending logic
- Track preference change history for compliance

---

### US-PREF.2: Manage Marketing Communications

**As a** Pours Consumer user  
**I want to** control what types of marketing communications I receive  
**So that** I only get offers and promotions relevant to my interests

#### Background
Marketing communications include promotional emails, SMS campaigns, venue partnership offers, and loyalty program promotions. Compliance with CAN-SPAM, GDPR, and CCPA requires clear opt-in/opt-out mechanisms.

#### Value Proposition
- Ensures compliance with marketing regulations
- Improves marketing engagement rates
- Reduces unsubscribe and spam complaints
- Builds user trust through transparency

#### Gherkin Scenarios

```gherkin
Feature: Manage Marketing Communications
  As a user
  I need to control my marketing communication preferences
  So that I receive only relevant marketing content

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Preferences" > "Marketing"

  Scenario: View marketing communication options
    When the marketing preferences page loads
    Then I should see marketing categories:
      | Category | Description |
      | Email Marketing | Promotional emails and newsletters |
      | SMS Marketing | Text message promotions and offers |
      | Personalized Offers | AI-powered product recommendations |
      | Partner Promotions | Offers from venue partners |
      | Event Invitations | Special events and venue openings |
      | Birthday Rewards | Special birthday month offers |
    And each category should have a toggle switch
    And my current preferences should be displayed

  Scenario: Opt into email marketing
    Given I am currently opted out of email marketing
    When I toggle "Email Marketing" ON
    And I click "Save Preferences"
    Then I should see a success message "Marketing preferences updated"
    And I should see a timestamp "Opted in on [current date]"
    And I should start receiving marketing emails
    And my consent should be recorded in the database

  Scenario: Opt out of all marketing communications
    Given I am currently receiving all marketing communications
    When I click "Unsubscribe from All Marketing"
    And I confirm my choice in the dialog
    Then all marketing toggles should be turned OFF
    And I should see a success message "You've been unsubscribed from all marketing"
    And I should not receive any marketing communications
    And my opt-out should be recorded with timestamp
    And I should still receive transactional communications (order updates, etc.)

  Scenario: Selective marketing opt-in
    When I enable the following marketing preferences:
      | Category | Enabled |
      | Email Marketing | Yes |
      | SMS Marketing | No |
      | Personalized Offers | Yes |
      | Partner Promotions | No |
      | Event Invitations | Yes |
      | Birthday Rewards | Yes |
    And I click "Save Preferences"
    Then my preferences should be saved individually
    And I should only receive marketing for enabled categories
    And each preference change should be timestamped

  Scenario: Interest-based marketing preferences
    Given I am viewing "Email Marketing" settings
    When I expand "Interests" section
    Then I should see interest categories:
      | Interest | Description |
      | Craft Beer | Promotions on craft beer products |
      | Cocktails | Special cocktail offers and recipes |
      | Wine | Wine recommendations and deals |
      | Food Pairings | Food and drink pairing suggestions |
      | New Venues | Notifications when new venues join |
    When I select "Craft Beer" and "Cocktails" only
    And I click "Save Preferences"
    Then I should only receive marketing relevant to those interests

  Scenario: Marketing frequency control
    Given I am opted into email marketing
    When I see "Email Frequency" options:
      | Frequency | Description |
      | Multiple per week | Up to 3 emails per week |
      | Weekly | Once per week |
      | Bi-weekly | Every two weeks |
      | Monthly | Once per month |
    When I select "Monthly"
    And I click "Save Preferences"
    Then I should receive at most one marketing email per month

  Scenario: View opt-out confirmation
    Given I have opted out of a marketing channel
    Then I should see a confirmation message
    And I should see when the opt-out was recorded
    And I should see information about when the change takes effect
    And I should be informed that I may still receive in-flight communications

  Scenario: Re-opt-in after opt-out
    Given I previously opted out of SMS marketing
    And it's been 60 days since my opt-out
    When I toggle "SMS Marketing" back ON
    Then I should see a reconfirmation dialog "Are you sure you want to receive SMS marketing again?"
    When I confirm
    Then my opt-in should be recorded with a new timestamp
    And I should start receiving SMS marketing again

  Scenario: Global marketing unsubscribe link compliance
    Given I receive a marketing email
    When I click the "Unsubscribe" link in the email footer
    Then I should be taken to the marketing preferences page
    And the relevant marketing category should be pre-toggled OFF
    And I should be able to confirm or adjust my preferences
    And my unsubscribe should be processed immediately
```

#### Acceptance Criteria
- [ ] Clear categorization of marketing types
- [ ] Toggle switches for each marketing category
- [ ] "Unsubscribe from All" option
- [ ] Interest-based preference selection
- [ ] Marketing frequency control
- [ ] Opt-in/opt-out timestamp recording
- [ ] Compliance with CAN-SPAM, GDPR, CCPA
- [ ] Unsubscribe link support
- [ ] Reconfirmation for re-opt-in after 60 days
- [ ] Clear messaging about effective dates
- [ ] Transactional emails unaffected by marketing opt-outs

#### Technical Notes
- Store in `user_marketing_preferences` table
- Track opt-in/opt-out history in `marketing_consent_history`
- Honor unsubscribe within 10 business days (CAN-SPAM)
- Email templates must include unsubscribe link
- Suppression list for opted-out users
- Double opt-in for SMS marketing (TCPA compliance)

---

### US-PREF.3: Manage Privacy Settings

**As a** Pours Consumer user  
**I want to** control my privacy settings  
**So that** I can manage who sees my activity and how my data is used

#### Background
Privacy settings control visibility of user activity, profile information, and data usage within the Pours+ platform and with third parties.

#### Value Proposition
- Empowers users with privacy control
- Builds trust through transparency
- Complies with privacy regulations
- Differentiates from competitors on privacy

#### Gherkin Scenarios

```gherkin
Feature: Manage Privacy Settings
  As a user
  I need to control my privacy settings
  So that I can protect my personal information and activity

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Preferences" > "Privacy"

  Scenario: View privacy settings dashboard
    When the privacy settings page loads
    Then I should see privacy categories:
      | Category | Description |
      | Profile Visibility | Control who can see your profile |
      | Activity Visibility | Control who can see your orders and check-ins |
      | Search Visibility | Allow/prevent being found in search |
      | Analytics | Allow anonymous usage data collection |
      | Personalization | Allow data use for personalized experiences |
      | Third-Party Sharing | Control data sharing with partners |
    And each category should have clear controls
    And current settings should be displayed

  Scenario: Set profile visibility to private
    Given my profile is currently "Public"
    When I change "Profile Visibility" to "Private"
    And I click "Save Privacy Settings"
    Then I should see a success message "Privacy settings updated"
    And other users should not be able to view my profile
    And only I should see my profile information

  Scenario: Control activity visibility
    When I see "Activity Visibility" options:
      | Option | Description |
      | Public | Anyone can see your check-ins and reviews |
      | Friends Only | Only users in your buddy list can see activity |
      | Private | Only you can see your activity |
    And I select "Friends Only"
    And I click "Save Privacy Settings"
    Then only my buddy list members should see my activity

  Scenario: Disable analytics data collection
    Given analytics collection is currently enabled
    When I toggle "Analytics" OFF
    Then I should see an explanation "Disabling analytics means we can't improve your experience based on usage patterns"
    When I confirm the change
    And I click "Save Privacy Settings"
    Then my usage data should not be collected for analytics
    And essential functional data should still be collected

  Scenario: Manage personalization settings
    When I view "Personalization" settings
    Then I should see options:
      | Setting | Description |
      | AI Recommendations | Use my data for AI-powered product suggestions |
      | Location-Based | Use my location for nearby venue suggestions |
      | Purchase History | Use past orders for recommendations |
      | Browse History | Use browsing behavior for suggestions |
    When I disable "Purchase History" and "Browse History"
    But keep "AI Recommendations" and "Location-Based" enabled
    And I click "Save Privacy Settings"
    Then recommendations should only use allowed data sources

  Scenario: Control third-party data sharing
    When I view "Third-Party Sharing" settings
    Then I should see a list of partner categories:
      | Partner Type | Purpose |
      | Venue Partners | Share order history with venues you visit |
      | Analytics Providers | Anonymous usage data for service improvement |
      | Marketing Partners | Promotional offers from selected partners |
    And each should have detailed information about what's shared
    When I disable "Marketing Partners"
    And I click "Save Privacy Settings"
    Then my data should not be shared with marketing partners
    And I should see a confirmation with effective date

  Scenario: Export privacy settings
    Given I am viewing my privacy settings
    When I click "Download Privacy Settings"
    Then I should receive a PDF or JSON file
    And the file should contain all my current privacy preferences
    And the file should include the date of export

  Scenario: Restore default privacy settings
    Given I have customized my privacy settings
    When I click "Restore Default Settings"
    Then I should see a warning "This will reset all privacy settings to defaults"
    When I confirm
    Then all settings should revert to default values
    And I should see which defaults are more/less private
    And I should be able to review before saving

  Scenario: Privacy impact preview
    Given I am about to change a privacy setting
    When I hover over or click an info icon
    Then I should see a clear explanation of:
      | Information | Description |
      | What this controls | Specific features affected |
      | Impact on experience | How this affects my app usage |
      | Who can see what | Specific visibility changes |
      | Recommended setting | Best practice suggestion |
```

#### Acceptance Criteria
- [ ] Clear categorization of privacy settings
- [ ] Profile visibility controls (Public, Friends, Private)
- [ ] Activity visibility controls
- [ ] Search visibility toggle
- [ ] Analytics opt-out
- [ ] Personalization controls with granular options
- [ ] Third-party data sharing controls with transparency
- [ ] Export privacy settings feature
- [ ] Default settings restoration
- [ ] Privacy impact explanations for each setting
- [ ] Immediate application of changes
- [ ] Compliance with privacy regulations

#### Technical Notes
- Store in `user_privacy_settings` table
- Default to most private settings
- Track setting changes in audit log
- Apply visibility rules in all queries
- Privacy settings override marketing preferences
- Cache privacy settings for performance
- Validate privacy rules at API layer

---

### US-PREF.4: Manage Data Sharing Controls

**As a** Pours Consumer user  
**I want to** control how my data is shared with third parties and partners  
**So that** I maintain control over my personal information

#### Background
Data sharing controls provide transparency and choice about how user data flows to external parties including venue partners, analytics providers, and marketing platforms.

#### Value Proposition
- Transparency builds user trust
- Compliance with GDPR Article 6 (consent) and CCPA
- Reduces privacy concerns and complaints
- Demonstrates commitment to data protection

#### Gherkin Scenarios

```gherkin
Feature: Manage Data Sharing Controls
  As a user
  I need granular control over my data sharing
  So that I know exactly who has access to my information

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Preferences" > "Data Sharing"

  Scenario: View data sharing dashboard
    When the data sharing page loads
    Then I should see categories of data sharing:
      | Category | Description | Current Status |
      | Venue Partners | Share order data with venues you visit | Enabled |
      | Payment Processors | Required for transaction processing | Always Enabled |
      | Analytics Services | Anonymous usage for service improvement | Enabled |
      | Marketing Platforms | Customer data for targeted advertising | Disabled |
      | Social Media | Integration with social platforms | Disabled |
    And "Always Enabled" items should be clearly marked as required
    And I should see links to learn more about each partner

  Scenario: View detailed data sharing information
    When I click "View Details" for "Venue Partners"
    Then I should see comprehensive information:
      | Information | Details |
      | Who receives data | List of specific partners |
      | What data is shared | Order history, preferences, visit frequency |
      | Purpose of sharing | Improve service, personalized offers |
      | Retention period | How long partners keep the data |
      | Your rights | How to request data deletion |
      | Privacy policy | Link to partner privacy policies |
    And I should see the last date this information was updated

  Scenario: Disable data sharing with venue partners
    Given data sharing with venue partners is enabled
    When I toggle "Venue Partners" OFF
    Then I should see a warning "This may limit personalized experiences at venues"
    When I click "Continue"
    And I click "Save Changes"
    Then my order data should not be shared with venues
    And venues should only see anonymized aggregate data
    And my preference should be recorded with timestamp

  Scenario: Granular venue partner control
    Given data sharing with venue partners is enabled
    When I click "Manage Venue Partners"
    Then I should see a list of venues I've visited
    And each venue should have individual sharing controls
    When I disable sharing with "The Rusty Tap" only
    And I click "Save Changes"
    Then my data should not be shared with that specific venue
    But should continue sharing with other venues

  Scenario: Control analytics data sharing
    When I view "Analytics Services" settings
    Then I should see specific analytics providers:
      | Provider | Purpose |
      | Google Analytics | Website and app usage analytics |
      | Mixpanel | User behavior and conversion tracking |
      | Segment | Data routing and integration |
    And I should be able to opt out of each individually
    When I disable "Google Analytics" only
    And I click "Save Changes"
    Then data should not flow to Google Analytics
    But should continue to other enabled providers

  Scenario: View active data sharing agreements
    When I navigate to "Active Sharing Agreements"
    Then I should see a list of all parties receiving my data
    And each should show:
      | Field | Description |
      | Partner Name | Who receives the data |
      | Date Activated | When sharing started |
      | Data Types | Categories of data shared |
      | Purpose | Why data is shared |
      | Actions | Revoke access button |
    When I click "Revoke Access" for a partner
    Then data sharing should stop immediately
    And I should receive confirmation

  Scenario: Request data access report from partners
    Given I have enabled data sharing with partners
    When I click "Request Data Access Report"
    Then I should see a list of partners I can request from
    When I select "All Partners"
    And I click "Send Requests"
    Then each partner should be notified of my request
    And I should see estimated response times
    And I should receive reports via email within 30 days

  Scenario: Set data sharing expiration
    Given I am enabling sharing with a marketing platform
    When I see "Duration" options:
      | Duration | Description |
      | Until revoked | No automatic expiration |
      | 30 days | Expires after 30 days |
      | 90 days | Expires after 90 days |
      | 1 year | Expires after 1 year |
    When I select "90 days"
    And I click "Enable Sharing"
    Then sharing should automatically stop after 90 days
    And I should receive a reminder 7 days before expiration
    And I should be able to extend or revoke early

  Scenario: Data sharing compliance warnings
    Given I am about to disable a required data sharing
    When I attempt to disable "Payment Processors"
    Then I should see a modal "This data sharing is required for service"
    And I should see specific reasons why it's required
    And I should not be able to disable it
    But I should be able to see what data is shared
```

#### Acceptance Criteria
- [ ] Clear dashboard of all data sharing relationships
- [ ] Required vs. optional sharing clearly marked
- [ ] Detailed information for each sharing relationship
- [ ] Granular control (by partner and data type)
- [ ] Venue-specific sharing controls
- [ ] Individual analytics provider opt-outs
- [ ] Active sharing agreements view
- [ ] Revoke access functionality
- [ ] Data access request feature
- [ ] Sharing expiration dates
- [ ] Compliance warnings for required sharing
- [ ] Links to partner privacy policies
- [ ] Timestamp recording for all changes

#### Technical Notes
- Store in `user_data_sharing_consents` table
- Track detailed consent in `data_sharing_audit_log`
- API to notify partners of consent revocation
- Required sharing cannot be disabled (payment, fraud prevention)
- 30-day GDPR response requirement for data requests
- Auto-revocation on expiration date
- Partner list maintained in `data_sharing_partners` table

---

### US-PREF.5: View and Manage Consent History

**As a** Pours Consumer user  
**I want to** view my complete consent and preference history  
**So that** I can track what I've agreed to and when

#### Background
Consent history provides transparency and audit trail for all user choices regarding data usage, marketing communications, and privacy settings. This is a compliance requirement under GDPR Article 7.

#### Value Proposition
- Transparency builds user trust
- Compliance with GDPR consent documentation requirements
- Enables users to track their choices over time
- Provides proof of consent for regulatory audits

#### Gherkin Scenarios

```gherkin
Feature: View and Manage Consent History
  As a user
  I need to see my complete consent history
  So that I can understand and verify my past choices

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Preferences" > "Consent History"

  Scenario: View consent history timeline
    When the consent history page loads
    Then I should see a chronological list of all consent events
    And each event should display:
      | Field | Description |
      | Date & Time | When the consent was recorded |
      | Consent Type | Marketing, Privacy, Data Sharing, etc. |
      | Action | Granted, Revoked, Updated |
      | Details | Specific settings changed |
      | Method | How consent was given (web, app, email link) |
      | IP Address | For audit purposes |
    And the most recent events should appear first

  Scenario: Filter consent history
    Given I have extensive consent history
    When I see filter options:
      | Filter | Options |
      | Type | Marketing, Privacy, Data Sharing, Notifications |
      | Action | Granted, Revoked, Updated |
      | Date Range | Last 30 days, Last 6 months, Last year, All time |
    When I select "Marketing" and "Last 6 months"
    And I click "Apply Filters"
    Then I should only see marketing consent events from the last 6 months

  Scenario: View detailed consent record
    Given I am viewing my consent history
    When I click on a specific consent event
    Then I should see a detailed modal with:
      | Field | Information |
      | Full Timestamp | Exact date and time (with timezone) |
      | Consent ID | Unique identifier for this consent |
      | User Agent | Browser/device information |
      | IP Address | IP address at time of consent |
      | Previous State | What the setting was before |
      | New State | What the setting changed to |
      | Consent Text | Exact text of consent shown to user |
      | Legal Basis | GDPR legal basis (consent, legitimate interest, etc.) |
    And I should see a "Download Record" button

  Scenario: Download consent history
    Given I am viewing my consent history
    When I click "Download Consent History"
    Then I should see format options:
      | Format | Description |
      | PDF | Human-readable formatted document |
      | JSON | Machine-readable structured data |
      | CSV | Spreadsheet-compatible format |
    When I select "PDF"
    And I click "Download"
    Then I should receive a PDF with all my consent records
    And the PDF should be formatted for easy reading
    And the PDF should include download timestamp

  Scenario: Withdraw consent from history
    Given I am viewing a specific consent I previously granted
    When I click "Withdraw This Consent"
    Then I should see a confirmation dialog
    And the dialog should explain the implications
    When I confirm withdrawal
    Then the consent should be revoked immediately
    And a new "Revoked" entry should appear in history
    And the associated functionality should stop

  Scenario: View consent validity status
    Given I am viewing my consent history
    Then each consent record should show its current status:
      | Status | Description |
      | Active | Currently in effect |
      | Revoked | Withdrawn by user |
      | Expired | Passed expiration date |
      | Superseded | Replaced by newer consent |
    And I should be able to filter by status

  Scenario: Regulatory compliance view
    Given I am viewing my consent history
    When I click "Compliance View"
    Then I should see a summary showing:
      | Compliance Requirement | Status |
      | GDPR Consent Requirements | Met / Not Met |
      | CCPA Opt-Out Rights | Met / Not Met |
      | CAN-SPAM Compliance | Met / Not Met |
      | Data Retention Limits | Days until review required |
    And I should see recommendations for any gaps

  Scenario: Export for legal purposes
    Given I need my consent history for legal reasons
    When I click "Export for Legal Request"
    Then I should see a form to specify:
      | Field | Purpose |
      | Request Type | GDPR, CCPA, Other |
      | Date Range | Specific period requested |
      | Include IP Addresses | Yes/No |
      | Include User Agents | Yes/No |
      | Certification | Digitally signed export |
    When I complete the form
    And I click "Generate Legal Export"
    Then I should receive a certified export package
    And the export should include a verification signature
    And the export should meet regulatory standards

  Scenario: Consent renewal reminders
    Given I have old consents that need renewal
    When I view my consent history
    Then I should see a banner "Some consents need renewal"
    And I should see which consents require action
    When I click "Renew Consents"
    Then I should go through a renewal flow
    And new consent records should be created

  Scenario: Audit log for consent access
    Given I am a privacy-conscious user
    When I click "View Access Log"
    Then I should see a record of all access to my consent data:
      | Field | Details |
      | Date & Time | When consent data was accessed |
      | Accessed By | System, User, Admin, Partner |
      | Purpose | Reason for access |
      | Data Viewed | Which consents were viewed |
    And I should be notified of any unusual access patterns
```

#### Acceptance Criteria
- [ ] Chronological timeline of all consent events
- [ ] Detailed information for each consent record
- [ ] Filtering by type, action, and date range
- [ ] Download consent history (PDF, JSON, CSV)
- [ ] Withdraw consent directly from history
- [ ] Current validity status for each consent
- [ ] Compliance summary view
- [ ] Legal export functionality with certification
- [ ] Consent renewal reminders
- [ ] Audit log of consent data access
- [ ] Search functionality within history
- [ ] Pagination for large histories
- [ ] Mobile-responsive table/list view

#### Technical Notes
- Store in `consent_history` table (immutable audit trail)
- Index by user_id, timestamp, consent_type
- Cryptographically sign legal exports
- Retention: Keep consent records for 7 years post-revocation
- Include IP address and user agent for audit
- Store exact consent text shown to user
- Track consent version numbers
- GDPR Article 7(1) - proof of consent requirement

---

## Technical Requirements

### Components Architecture

```
src/components/profile/preferences/
├── PreferenceCenter.tsx (Main container)
├── NotificationPreferences.tsx
├── MarketingPreferences.tsx
├── PrivacySettings.tsx
├── DataSharingControls.tsx
├── ConsentHistory.tsx
├── PreferenceSection.tsx (Reusable section component)
├── PreferenceToggle.tsx (Reusable toggle with description)
└── ConsentTimeline.tsx (Timeline visualization)
```

### User Flow

```
User navigates to Manage Profile
    ↓
Clicks "Preferences" tab
    ↓
Preference Center Dashboard loads
    ↓
User selects preference category
    ↓
Modifies settings
    ↓
Clicks "Save Preferences"
    ↓
Validation
    ↓
Database update
    ↓
Success confirmation
    ↓
Settings applied immediately
```

### Data Flow

```
User updates preference
    ↓
Client-side validation
    ↓
API call to update-preferences endpoint
    ↓
Server-side validation
    ↓
Update preference table
    ↓
Record change in audit log/consent history
    ↓
Trigger relevant system updates (suppression lists, etc.)
    ↓
Return success response
    ↓
Update UI with confirmation
    ↓
Broadcast preference change to relevant services
```

### Performance Requirements
- Preference dashboard load: <1 second
- Preference save operation: <500ms
- Consent history load (100 records): <2 seconds
- Export generation: <10 seconds
- Real-time preference application
- Cached preference checks for high-frequency operations

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation for all controls
- Screen reader announcements for toggle changes
- Clear focus indicators
- Sufficient color contrast
- ARIA labels for all switches and buttons
- Descriptive error messages

### Security Requirements
- Validate user authentication before showing preferences
- Validate user authorization for all preference updates
- Log all preference changes for audit
- Encrypt sensitive consent data at rest
- Rate limit preference update API
- Prevent CSRF attacks on preference updates

---

## Database Schema

### Table: user_notification_preferences

```sql
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Categories (each has email, push, sms, in_app flags)
  order_updates_email BOOLEAN DEFAULT true,
  order_updates_push BOOLEAN DEFAULT true,
  order_updates_sms BOOLEAN DEFAULT false,
  order_updates_in_app BOOLEAN DEFAULT true,
  
  rewards_email BOOLEAN DEFAULT true,
  rewards_push BOOLEAN DEFAULT true,
  rewards_sms BOOLEAN DEFAULT false,
  rewards_in_app BOOLEAN DEFAULT true,
  
  promotional_email BOOLEAN DEFAULT true,
  promotional_push BOOLEAN DEFAULT false,
  promotional_sms BOOLEAN DEFAULT false,
  promotional_in_app BOOLEAN DEFAULT true,
  promotional_frequency TEXT DEFAULT 'real-time' CHECK (promotional_frequency IN ('real-time', 'daily', 'weekly', 'never')),
  
  venue_updates_email BOOLEAN DEFAULT false,
  venue_updates_push BOOLEAN DEFAULT false,
  venue_updates_sms BOOLEAN DEFAULT false,
  venue_updates_in_app BOOLEAN DEFAULT true,
  
  account_activity_email BOOLEAN DEFAULT true, -- Cannot be fully disabled
  account_activity_push BOOLEAN DEFAULT true,
  account_activity_sms BOOLEAN DEFAULT false,
  account_activity_in_app BOOLEAN DEFAULT true,
  
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'America/New_York',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_notification_prefs_user ON public.user_notification_preferences(user_id);

ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences"
  ON public.user_notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);
```

### Table: user_marketing_preferences

```sql
CREATE TABLE IF NOT EXISTS public.user_marketing_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Marketing Channels
  email_marketing BOOLEAN DEFAULT false,
  sms_marketing BOOLEAN DEFAULT false,
  
  -- Marketing Categories
  personalized_offers BOOLEAN DEFAULT false,
  partner_promotions BOOLEAN DEFAULT false,
  event_invitations BOOLEAN DEFAULT false,
  birthday_rewards BOOLEAN DEFAULT true,
  
  -- Interests
  interests_craft_beer BOOLEAN DEFAULT false,
  interests_cocktails BOOLEAN DEFAULT false,
  interests_wine BOOLEAN DEFAULT false,
  interests_food BOOLEAN DEFAULT false,
  interests_new_venues BOOLEAN DEFAULT false,
  
  -- Frequency
  email_frequency TEXT DEFAULT 'weekly' CHECK (email_frequency IN ('multiple', 'weekly', 'biweekly', 'monthly')),
  
  -- Opt-out tracking
  global_marketing_opt_out BOOLEAN DEFAULT false,
  opted_out_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_marketing_prefs_user ON public.user_marketing_preferences(user_id);
CREATE INDEX idx_marketing_prefs_opt_out ON public.user_marketing_preferences(global_marketing_opt_out);

ALTER TABLE public.user_marketing_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own marketing preferences"
  ON public.user_marketing_preferences
  FOR ALL
  USING (auth.uid() = user_id);
```

### Table: user_privacy_settings

```sql
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Visibility Settings
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  activity_visibility TEXT DEFAULT 'friends' CHECK (activity_visibility IN ('public', 'friends', 'private')),
  search_visible BOOLEAN DEFAULT false,
  
  -- Data Usage
  analytics_enabled BOOLEAN DEFAULT true,
  
  -- Personalization
  ai_recommendations BOOLEAN DEFAULT true,
  location_based BOOLEAN DEFAULT true,
  purchase_history_personalization BOOLEAN DEFAULT true,
  browse_history_personalization BOOLEAN DEFAULT true,
  
  -- Third-Party
  third_party_analytics BOOLEAN DEFAULT true,
  third_party_marketing BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_privacy_settings_user ON public.user_privacy_settings(user_id);

ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own privacy settings"
  ON public.user_privacy_settings
  FOR ALL
  USING (auth.uid() = user_id);
```

### Table: user_data_sharing_consents

```sql
CREATE TABLE IF NOT EXISTS public.user_data_sharing_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.data_sharing_partners(id),
  partner_type TEXT NOT NULL CHECK (partner_type IN ('venue', 'analytics', 'marketing', 'social', 'payment')),
  
  -- Consent Details
  consent_granted BOOLEAN DEFAULT false,
  data_types TEXT[], -- Array of data types: ['orders', 'profile', 'location', 'preferences']
  purpose TEXT NOT NULL,
  
  -- Duration
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  consent_text TEXT, -- Exact consent language shown to user
  consent_method TEXT, -- 'web', 'app', 'email_link'
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_data_sharing_user ON public.user_data_sharing_consents(user_id);
CREATE INDEX idx_data_sharing_partner ON public.user_data_sharing_consents(partner_id);
CREATE INDEX idx_data_sharing_status ON public.user_data_sharing_consents(status);
CREATE INDEX idx_data_sharing_expires ON public.user_data_sharing_consents(expires_at);

ALTER TABLE public.user_data_sharing_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data sharing consents"
  ON public.user_data_sharing_consents
  FOR ALL
  USING (auth.uid() = user_id);
```

### Table: consent_history

```sql
CREATE TABLE IF NOT EXISTS public.consent_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Consent Details
  consent_type TEXT NOT NULL CHECK (consent_type IN ('notification', 'marketing', 'privacy', 'data_sharing')),
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'updated')),
  
  -- What Changed
  preference_key TEXT NOT NULL, -- e.g., 'email_marketing', 'analytics_enabled'
  old_value TEXT,
  new_value TEXT NOT NULL,
  
  -- Legal Compliance
  legal_basis TEXT, -- GDPR: 'consent', 'legitimate_interest', 'contract', etc.
  consent_text TEXT, -- Exact text shown to user
  consent_version TEXT, -- Version of consent text
  
  -- Audit Information
  ip_address INET,
  user_agent TEXT,
  method TEXT, -- 'web', 'app', 'email_link', 'api'
  
  -- Read-only audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_consent_history_user ON public.consent_history(user_id);
CREATE INDEX idx_consent_history_type ON public.consent_history(consent_type);
CREATE INDEX idx_consent_history_created ON public.consent_history(created_at DESC);

ALTER TABLE public.consent_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent history"
  ON public.consent_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert consent history (no user updates/deletes)
CREATE POLICY "System can insert consent history"
  ON public.consent_history
  FOR INSERT
  WITH CHECK (true);
```

### Table: data_sharing_partners

```sql
CREATE TABLE IF NOT EXISTS public.data_sharing_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Partner Information
  name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('venue', 'analytics', 'marketing', 'social', 'payment')),
  description TEXT,
  privacy_policy_url TEXT,
  
  -- Data Details
  data_types_shared TEXT[], -- What data this partner receives
  purpose TEXT NOT NULL,
  retention_period TEXT, -- How long partner keeps data
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false, -- Can't be disabled by users
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_partners_type ON public.data_sharing_partners(partner_type);
CREATE INDEX idx_partners_active ON public.data_sharing_partners(is_active);

-- Public read access to see partner information
ALTER TABLE public.data_sharing_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners are publicly viewable"
  ON public.data_sharing_partners
  FOR SELECT
  USING (is_active = true);
```

---

## API & Edge Functions

### Edge Function: update-user-preferences

**Purpose**: Update user preferences across all categories

**Endpoint**: `POST /functions/v1/update-user-preferences`

**Request Body**:
```json
{
  "category": "notifications" | "marketing" | "privacy" | "data_sharing",
  "preferences": {
    "email_marketing": true,
    "sms_marketing": false,
    ...
  },
  "metadata": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "updated_preferences": {...},
  "consent_id": "uuid"
}
```

**Logic**:
1. Authenticate user
2. Validate request payload
3. Update appropriate preference table
4. Record change in consent_history
5. Trigger downstream updates (suppression lists, etc.)
6. Return success with updated preferences

### Edge Function: export-consent-history

**Purpose**: Generate exportable consent history for user

**Endpoint**: `POST /functions/v1/export-consent-history`

**Request Body**:
```json
{
  "format": "pdf" | "json" | "csv",
  "date_range": {
    "start": "2024-01-01",
    "end": "2025-01-01"
  },
  "include_ip": true,
  "certification": false
}
```

**Response**:
```json
{
  "success": true,
  "download_url": "https://...",
  "expires_at": "ISO8601 timestamp"
}
```

---

## Security & Compliance

### GDPR Compliance
- **Article 7**: Proof of consent with audit trail
- **Article 13**: Clear information about data processing
- **Article 15**: User access to consent records
- **Article 17**: Right to withdraw consent
- **Article 21**: Right to object to data processing

### CCPA Compliance
- Clear "Do Not Sell My Personal Information" option
- Opt-out mechanism for data sharing
- No discrimination for exercising privacy rights
- Transparency about data sharing practices

### CAN-SPAM Compliance
- Clear unsubscribe mechanism
- Honor opt-outs within 10 business days
- Clear identification of marketing emails
- Accurate sender information

### Data Retention
- Consent records: 7 years after revocation
- Preference history: Duration of account + 2 years
- Audit logs: 7 years minimum
- Deleted upon account deletion (with legal exceptions)

---

## Testing Requirements

### Unit Tests
- [ ] Preference validation logic
- [ ] Consent recording logic
- [ ] Privacy setting application logic
- [ ] Data sharing consent management

### Integration Tests
- [ ] Preference updates across all categories
- [ ] Consent history recording
- [ ] Export generation (all formats)
- [ ] Downstream system updates

### E2E Tests
- [ ] User can update notification preferences
- [ ] User can opt out of marketing
- [ ] User can control privacy settings
- [ ] User can revoke data sharing consent
- [ ] User can view complete consent history
- [ ] User can export consent history

---

## Change Log
- **2025-11-23**: Initial documentation created (Preference Center extension to CNS-0011)
