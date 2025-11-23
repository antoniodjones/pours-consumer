# Social Drinking & Group Orders - Product Requirements

## Feature Overview

The Social Drinking & Group Orders feature enables users to manage a buddy list, assign drinks to friends during group orders, and track alcohol consumption across multiple people for responsible drinking monitoring. This feature integrates social connectivity with the sobriety monitoring system to provide comprehensive group drinking oversight.

---

## Epic CNS-0023: Social Drinking & Group Orders

**Description:**  
This epic encompasses the functionality required for users to manage drinking buddies, assign drinks to friends during checkout, handle drink assignment acceptance/decline workflows, and integrate these assignments with individual sobriety monitoring systems.

**Business Value:**  
- Enables responsible group drinking with distributed monitoring
- Enhances social experience within the app
- Provides accountability for group alcohol consumption
- Differentiates the platform with unique social safety features
- Increases user engagement through social connections

---

## User Stories

### US-BUDDY.1: Add Buddy to List

**As a** Pours Consumer user  
**I want to** add friends to my buddy list  
**So that** I can assign drinks to them during group orders and track our consumption together

**Background:**  
Users attending bars or events with friends need a way to connect their accounts for drink assignment and shared monitoring.

**Value:**  
- Enables social drinking features
- Facilitates responsible group consumption tracking
- Creates a network effect within the app

**Gherkin Scenarios:**

```gherkin
Feature: Add Buddy to List
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User sends buddy request via search
    Given I am logged in as a Pours Consumer user
    And I navigate to the "Buddy List" section
    When I click "Add Buddy"
    And I search for a user by name, email, or phone number
    And I select a user from the search results
    And I click "Send Buddy Request"
    Then the user should receive a buddy request notification
    And I should see the user in my "Pending Requests" list
    And I should see a confirmation message "Buddy request sent"

  Scenario: User sends buddy request via QR code
    Given I am logged in as a Pours Consumer user
    And I navigate to the "Buddy List" section
    When I click "Add Buddy"
    And I select "Scan QR Code"
    And I scan another user's buddy QR code
    Then the user should receive a buddy request notification
    And I should see the user in my "Pending Requests" list
    And I should see a confirmation message "Buddy request sent"

  Scenario: User cannot send duplicate buddy request
    Given I am logged in as a Pours Consumer user
    And I have already sent a buddy request to "Jane Doe"
    When I attempt to send another buddy request to "Jane Doe"
    Then I should see an error message "Buddy request already pending"
    And no duplicate request should be created

  Scenario: User displays own QR code for others to scan
    Given I am logged in as a Pours Consumer user
    And I navigate to the "Buddy List" section
    When I click "My Buddy QR Code"
    Then I should see a QR code containing my user ID
    And I should have an option to share the QR code
```

**Technical Requirements:**
- `buddy_connections` table with fields: `id`, `user_id`, `buddy_id`, `status` (pending, accepted, blocked), `requested_at`, `accepted_at`, `created_at`
- RLS policies for buddy connections
- QR code generation using user ID
- Real-time buddy request notifications
- Search functionality for users by name, email, or phone

**Acceptance Criteria:**
- Users can search for other users by name, email, or phone
- Users can send buddy requests via search or QR code scan
- Users can display their own QR code for others to scan
- Duplicate buddy requests are prevented
- Buddy requests appear in "Pending Requests" list
- Real-time notifications are sent when requests are received

---

### US-BUDDY.2: Accept or Decline Buddy Request

**As a** Pours Consumer user  
**I want to** accept or decline buddy requests  
**So that** I can control who can assign drinks to me and view my consumption data

**Background:**  
Users need control over their social connections and who can interact with their sobriety data.

**Value:**  
- Provides user privacy and consent control
- Ensures trusted connections for drink assignments
- Maintains data security for personal consumption information

**Gherkin Scenarios:**

```gherkin
Feature: Accept or Decline Buddy Request
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User accepts buddy request
    Given I am logged in as a Pours Consumer user
    And I have a pending buddy request from "John Smith"
    When I navigate to my "Buddy Requests" notifications
    And I click "Accept" on John Smith's request
    Then John Smith should be added to my buddy list
    And I should be added to John Smith's buddy list
    And the buddy connection status should be "accepted"
    And both users should receive a confirmation notification
    And I should see a success message "You and John Smith are now buddies"

  Scenario: User declines buddy request
    Given I am logged in as a Pours Consumer user
    And I have a pending buddy request from "Jane Doe"
    When I navigate to my "Buddy Requests" notifications
    And I click "Decline" on Jane Doe's request
    Then the buddy request should be removed
    And Jane Doe should receive a notification that the request was declined
    And I should see a message "Buddy request declined"
    And Jane Doe should not appear in my buddy list

  Scenario: User blocks requester
    Given I am logged in as a Pours Consumer user
    And I have a pending buddy request from "Spam User"
    When I navigate to my "Buddy Requests" notifications
    And I click "Block" on Spam User's request
    Then the buddy request should be removed
    And "Spam User" should be added to my blocked list
    And "Spam User" should not be able to send me future requests
    And I should see a message "User blocked successfully"
```

**Technical Requirements:**
- Update `buddy_connections.status` based on action (accepted, blocked)
- Delete record on decline
- Real-time notification system for acceptance/decline
- Blocked users list management
- Mutual buddy relationship creation on acceptance

**Acceptance Criteria:**
- Users can accept, decline, or block buddy requests
- Accepting creates mutual buddy relationship
- Declining removes the request
- Blocking prevents future requests from that user
- Both parties receive appropriate notifications
- Status updates happen in real-time

---

### US-BUDDY.3: View and Manage Buddy List

**As a** Pours Consumer user  
**I want to** view my buddy list and manage connections  
**So that** I can see who I'm connected with and remove buddies if needed

**Background:**  
Users need visibility into their social connections and the ability to manage these relationships over time.

**Value:**  
- Provides transparency in social connections
- Enables relationship management and privacy control
- Shows active buddies available for group orders

**Gherkin Scenarios:**

```gherkin
Feature: View and Manage Buddy List
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User views buddy list
    Given I am logged in as a Pours Consumer user
    And I have 5 accepted buddies
    When I navigate to the "Buddy List" section
    Then I should see a list of all 5 buddies
    And each buddy should display their name, avatar, and connection date
    And I should see their current online/offline status
    And I should have options to "Remove" or "View Profile" for each buddy

  Scenario: User removes buddy from list
    Given I am logged in as a Pours Consumer user
    And I am viewing my buddy list
    When I click "Remove" next to "John Smith"
    And I confirm the removal action
    Then "John Smith" should be removed from my buddy list
    And I should be removed from John Smith's buddy list
    And I should see a confirmation message "Buddy removed"
    And I should no longer be able to assign drinks to John Smith

  Scenario: User views buddy profile
    Given I am logged in as a Pours Consumer user
    And I am viewing my buddy list
    When I click "View Profile" for "Jane Doe"
    Then I should see Jane's public profile information
    And I should see Jane's reward tier and loyalty status
    And I should see a summary of our shared drinking sessions (if any)
    And I should have an option to "Remove Buddy"

  Scenario: Empty buddy list state
    Given I am logged in as a Pours Consumer user
    And I have no buddies in my list
    When I navigate to the "Buddy List" section
    Then I should see an empty state message "No buddies yet"
    And I should see a prominent "Add Your First Buddy" call-to-action button
    And I should see suggestions on how to add buddies (QR code, search)
```

**Technical Requirements:**
- Query `buddy_connections` table for accepted connections
- Display buddy profiles with real-time online status
- Mutual removal functionality (deletes both connection records)
- Integration with user profiles for avatar and name display
- Shared session history tracking

**Acceptance Criteria:**
- Buddy list displays all accepted connections
- Each buddy shows name, avatar, and connection date
- Users can remove buddies (mutual removal)
- Users can view buddy public profiles
- Empty state is displayed when no buddies exist
- Removal requires confirmation to prevent accidental deletions

---

### US-SOCIAL.1: Assign Drinks to Buddies During Checkout

**As a** Pours Consumer user  
**I want to** assign specific drinks in my cart to buddies during checkout  
**So that** I can order for a group and properly track who consumed which drinks

**Background:**  
When ordering drinks for a group (parties, events, gatherings), users need to designate which drinks are for which people to ensure accurate sobriety monitoring across all participants.

**Value:**  
- Enables accurate group order management
- Facilitates proper alcohol consumption tracking for each individual
- Supports responsible drinking for groups
- Maintains sobriety monitoring integrity across multiple users

**Gherkin Scenarios:**

```gherkin
Feature: Assign Drinks to Buddies During Checkout
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User assigns drinks to buddies in cart review
    Given I am logged in as a Pours Consumer user
    And I have 6 beers in my cart
    And I have 3 buddies: "John", "Jane", and "Mike"
    When I proceed to checkout
    And I view the "Assign Drinks" section
    And I assign 2 beers to "John"
    And I assign 2 beers to "Jane"
    And I assign 1 beer to "Mike"
    And I keep 1 beer for myself
    And I complete the checkout
    Then the order should be created with drink assignments
    And "John", "Jane", and "Mike" should receive assignment notifications
    And the assignments should show as "pending" until accepted
    And I should see a summary of all drink assignments

  Scenario: User assigns multiple different drinks to one buddy
    Given I am logged in as a Pours Consumer user
    And I have 2 beers, 1 cocktail, and 1 wine in my cart
    And I have a buddy "Sarah"
    When I proceed to checkout
    And I assign 1 beer and 1 cocktail to "Sarah"
    And I keep 1 beer and 1 wine for myself
    And I complete the checkout
    Then "Sarah" should receive one notification for 2 assigned drinks
    And the assignment should list both the beer and cocktail
    And "Sarah" can accept or decline all assigned drinks at once

  Scenario: User completes order without assigning all drinks
    Given I am logged in as a Pours Consumer user
    And I have 5 drinks in my cart
    And I have assigned 3 drinks to buddies
    When I attempt to complete checkout
    Then I should see a warning "2 drinks are unassigned"
    And I should have options to:
      | Assign them to myself |
      | Assign them to a buddy |
      | Mark as unassigned (shared drinks) |
    And I should be able to proceed with any option

  Scenario: User cannot assign drinks to non-buddy users
    Given I am logged in as a Pours Consumer user
    And I have drinks in my cart
    When I view the "Assign Drinks" section during checkout
    Then I should only see my accepted buddies in the assignment dropdown
    And I should not be able to assign drinks to users who are not my buddies
    And I should see a message "Add buddies to assign drinks to them"

  Scenario: User changes drink assignments before completing order
    Given I am logged in as a Pours Consumer user
    And I have assigned 2 beers to "John"
    And I am still in the checkout process (order not completed)
    When I reassign those 2 beers to "Jane" instead
    Then the assignment to "John" should be removed
    And the 2 beers should now be assigned to "Jane"
    And no notifications should be sent until checkout is complete
```

**Technical Requirements:**
- `drink_assignments` table with fields: `id`, `order_id`, `order_item_id`, `assignor_id`, `assignee_id`, `status` (pending, accepted, declined), `assigned_at`, `responded_at`, `created_at`
- Integration with checkout flow to show buddy selection UI
- Assignment validation (must be accepted buddies)
- Real-time assignment tracking during checkout
- Notification system for drink assignments

**Acceptance Criteria:**
- Users can assign individual drinks to specific buddies during checkout
- Multiple drinks can be assigned to one buddy
- Users can only assign to accepted buddies
- Unassigned drinks trigger a warning with assignment options
- Assignments can be changed before order completion
- Notifications are sent only after order is placed
- Assignment summary is displayed before final order confirmation

---

### US-SOCIAL.2: Receive and Review Drink Assignment Notification

**As a** Pours Consumer user  
**I want to** receive notifications when someone assigns drinks to me  
**So that** I can review and decide whether to accept the assignment for my sobriety tracking

**Background:**  
When a buddy assigns drinks to a user, the assignee needs to be informed and given control over whether to accept the drink for their personal consumption tracking.

**Value:**  
- Provides user consent for consumption tracking
- Maintains accuracy of personal sobriety data
- Gives users control over their monitoring records
- Prevents unauthorized tracking of consumption

**Gherkin Scenarios:**

```gherkin
Feature: Receive and Review Drink Assignment Notification
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User receives drink assignment notification
    Given I am logged in as a Pours Consumer user
    And my buddy "John" places an order
    And "John" assigns 2 beers to me
    When the order is completed
    Then I should receive a push notification "John assigned 2 drinks to you"
    And I should receive an in-app notification with assignment details
    And I should see a "Pending Assignments" badge on my profile icon
    And the notification should include:
      | Order details |
      | Drink names and quantities |
      | Venue name |
      | Date and time |
      | Accept/Decline buttons |

  Scenario: User views pending drink assignments
    Given I am logged in as a Pours Consumer user
    And I have 3 pending drink assignments from different buddies
    When I navigate to "Pending Drink Assignments"
    Then I should see a list of all pending assignments
    And each assignment should display:
      | Buddy name and avatar |
      | Drink details (name, quantity, ABV) |
      | Venue and date |
      | Time since assignment |
      | Accept and Decline buttons |
    And assignments should be sorted by most recent first

  Scenario: Assignment notification includes order context
    Given I am logged in as a Pours Consumer user
    And my buddy "Sarah" assigns 1 cocktail to me
    When I view the assignment notification
    Then I should see the full order number
    And I should see Sarah's name and avatar
    And I should see the venue name and location
    And I should see the drink details:
      | Drink name: "Espresso Martini" |
      | Alcohol By Volume: 15% |
      | Volume: 120ml |
      | Estimated alcohol content: 18ml |
    And I should see when the assignment was created
```

**Technical Requirements:**
- Push notification integration for drink assignments
- In-app notification center with assignment details
- Badge counter for pending assignments
- Query `drink_assignments` table for pending status
- Display product details from `products` and `order_items` tables

**Acceptance Criteria:**
- Push notifications are sent when drinks are assigned
- In-app notifications display comprehensive assignment details
- Users can view all pending assignments in one location
- Notifications include drink details, venue, assignor info, and timestamp
- Badge counter reflects number of pending assignments
- Notifications are removed when assignments are accepted/declined

---

### US-SOCIAL.3: Accept Drink Assignment

**As a** Pours Consumer user  
**I want to** accept drink assignments from buddies  
**So that** the drinks are added to my sobriety monitoring and consumption tracking

**Background:**  
When users accept assigned drinks, these should be recorded in their personal drinking session and sobriety tracking system as if they had ordered the drinks themselves.

**Value:**  
- Maintains accurate personal consumption records
- Enables proper Blood Alcohol Content (BAC) calculation for assignees
- Supports responsible drinking through honest tracking
- Integrates group orders with individual monitoring

**Gherkin Scenarios:**

```gherkin
Feature: Accept Drink Assignment
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User accepts single drink assignment
    Given I am logged in as a Pours Consumer user
    And I have a pending drink assignment for 1 beer from "John"
    And I have an active drinking session at "Downtown Bar"
    When I click "Accept" on the drink assignment
    Then the assignment status should change to "accepted"
    And the drink should be added to my current drinking session
    And a `drink_records` entry should be created with:
      | user_id: my user ID |
      | session_id: my current session ID |
      | product_id: the assigned product ID |
      | alcohol_content: from product data |
      | volume_ml: from product data |
      | order_id: the original order ID |
    And my estimated BAC should be recalculated
    And "John" should receive a notification "User accepted your drink assignment"
    And I should see a success message "Drink added to your session"

  Scenario: User accepts drink assignment and starts new session
    Given I am logged in as a Pours Consumer user
    And I have a pending drink assignment for 1 cocktail from "Sarah"
    And I do NOT have an active drinking session
    When I click "Accept" on the drink assignment
    Then I should be prompted to "Start Drinking Session" first
    And I should see a message "You need an active session to accept this drink"
    When I start a new drinking session at the assignment's venue
    And I accept the drink assignment again
    Then a new drinking session should be created
    And the drink should be added to the new session
    And my sobriety monitoring should begin tracking

  Scenario: User accepts multiple drink assignments at once
    Given I am logged in as a Pours Consumer user
    And I have 3 pending drink assignments:
      | 2 beers from "Mike" |
      | 1 wine from "Jane" |
    And I have an active drinking session
    When I select all 3 assignments
    And I click "Accept All"
    Then all 3 assignments should be marked as "accepted"
    And 3 separate `drink_records` entries should be created
    And my total drinks count should increase by 3
    And my total alcohol content should be recalculated with all 3 drinks
    And my estimated BAC should reflect all accepted drinks
    And "Mike" and "Jane" should receive acceptance notifications

  Scenario: User accepts drink assignment with biometric data entry
    Given I am logged in as a Pours Consumer user
    And I have biometric monitoring enabled
    And I accept a drink assignment
    When the drink is added to my session
    Then I should be prompted to record my current biometrics (optional)
    And if I enter heart rate, blood pressure, etc.
    Then a biometric reading should be linked to this drink record
    And the biometric data should be stored for monitoring trends

  Scenario: Acceptance triggers sobriety alert
    Given I am logged in as a Pours Consumer user
    And my current estimated BAC is 0.07%
    And I accept a drink assignment for a strong cocktail
    When the drink is added to my session
    And my recalculated BAC exceeds 0.08% (warning threshold)
    Then I should receive a sobriety alert notification
    And the alert should warn me about my elevated BAC
    And I should see recommendations (e.g., "Wait before driving", "Drink water")
    And the alert should be logged in my `sobriety_alerts` table
```

**Technical Requirements:**
- Update `drink_assignments.status` to "accepted"
- Create `drink_records` entry linked to assignee's user ID and session
- Call `update_session_bac()` database function to recalculate BAC
- Check if user has active `drinking_sessions`, create if needed
- Trigger sobriety alerts based on new BAC calculation
- Send notification to assignor about acceptance
- Optional biometric data capture integration

**Acceptance Criteria:**
- Accepting adds drink to user's drinking session
- Drink records are created with correct user ID and session ID
- BAC is recalculated automatically
- Users must have active session to accept (or create one)
- Multiple assignments can be accepted at once
- Assignor receives acceptance notification
- Sobriety alerts are triggered if thresholds are exceeded
- Biometric data can optionally be recorded

---

### US-SOCIAL.4: Decline Drink Assignment

**As a** Pours Consumer user  
**I want to** decline drink assignments from buddies  
**So that** I can reject drinks I didn't consume and maintain accurate tracking

**Background:**  
Users need the ability to decline assigned drinks if they didn't actually consume them, were assigned incorrectly, or choose not to have them tracked.

**Value:**  
- Maintains data accuracy and user consent
- Prevents false consumption records
- Provides control over personal tracking data
- Handles assignment errors gracefully

**Gherkin Scenarios:**

```gherkin
Feature: Decline Drink Assignment
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User declines drink assignment with reason
    Given I am logged in as a Pours Consumer user
    And I have a pending drink assignment for 2 beers from "John"
    When I click "Decline" on the drink assignment
    And I select a reason:
      | "I didn't consume this drink" |
      | "Assigned to wrong person" |
      | "Other" |
    And I optionally add a note "I'm the designated driver"
    And I confirm the decline
    Then the assignment status should change to "declined"
    And the drink should NOT be added to my drinking session
    And "John" should receive a notification "User declined your drink assignment"
    And the notification should include my reason (if I chose to share it)
    And I should see a confirmation message "Assignment declined"

  Scenario: User declines all assignments from one order
    Given I am logged in as a Pours Consumer user
    And I have 3 pending drink assignments from "Sarah" in one order
    When I select all 3 assignments
    And I click "Decline All"
    And I provide a reason "I wasn't at this event"
    Then all 3 assignments should be marked as "declined"
    And none of the drinks should be added to my session
    And "Sarah" should receive one notification about all declines
    And I should see "3 assignments declined"

  Scenario: User partially accepts and partially declines group assignment
    Given I am logged in as a Pours Consumer user
    And I have 4 pending drink assignments from "Mike":
      | 2 beers |
      | 2 shots |
    When I accept the 2 beers
    And I decline the 2 shots with reason "I didn't have shots"
    Then only the 2 beers should be added to my drinking session
    And the 2 shots should remain untracked
    And "Mike" should receive notifications for both actions
    And my BAC should only reflect the accepted beers

  Scenario: Declined assignment allows reassignment
    Given I am logged in as a Pours Consumer user
    And I decline a drink assignment from "John"
    When "John" views his order details
    Then he should see that I declined the assignment
    And he should have the option to reassign the drink to another buddy
    And the original assignment should remain in declined status
```

**Technical Requirements:**
- Update `drink_assignments.status` to "declined"
- Optional decline reason field in `drink_assignments` table
- Do NOT create `drink_records` entry for declined drinks
- Do NOT update BAC or session totals
- Send notification to assignor with decline reason
- Allow assignor to view declined assignments and reassign

**Acceptance Criteria:**
- Users can decline drink assignments with optional reason
- Declined drinks are not added to drinking sessions
- BAC is not affected by declined drinks
- Assignor receives notification with decline reason
- Multiple assignments can be declined at once
- Users can partially accept/decline from same order
- Declined assignments show in order history for assignor

---

### US-SOCIAL.5: View Drink Assignment History

**As a** Pours Consumer user  
**I want to** view a history of drinks I've assigned to buddies and drinks assigned to me  
**So that** I can track group orders and verify consumption records

**Background:**  
Users need visibility into all drink assignments (both sent and received) to verify group order history and ensure accurate tracking over time.

**Value:**  
- Provides transparency in group order management
- Enables verification of consumption records
- Supports dispute resolution for assignments
- Creates accountability for group drinking sessions

**Gherkin Scenarios:**

```gherkin
Feature: View Drink Assignment History
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User views drinks assigned TO buddies
    Given I am logged in as a Pours Consumer user
    And I have assigned drinks to buddies in 3 different orders
    When I navigate to "Drink Assignment History"
    And I select the "Assigned by Me" tab
    Then I should see a list of all drinks I've assigned
    And each assignment should display:
      | Buddy name |
      | Drink details |
      | Assignment date |
      | Status (pending, accepted, declined) |
      | Order number |
      | Venue |
    And I should be able to filter by:
      | Status (all, pending, accepted, declined) |
      | Buddy |
      | Date range |
      | Venue |

  Scenario: User views drinks assigned BY buddies to me
    Given I am logged in as a Pours Consumer user
    And buddies have assigned drinks to me in 5 different orders
    When I navigate to "Drink Assignment History"
    And I select the "Assigned to Me" tab
    Then I should see a list of all drinks assigned to me
    And each assignment should display:
      | Assignor name |
      | Drink details |
      | Assignment date |
      | My response (pending, accepted, declined) |
      | Order number |
      | Venue |
    And I should see which drinks were added to my sobriety tracking

  Scenario: User views pending assignments separately
    Given I am logged in as a Pours Consumer user
    And I have 2 pending drink assignments
    When I navigate to "Drink Assignment History"
    Then I should see a "Pending" section at the top
    And the 2 pending assignments should be highlighted
    And I should have quick access to "Accept" or "Decline" actions
    And pending assignments should show time since assignment

  Scenario: User views assignment details
    Given I am logged in as a Pours Consumer user
    And I am viewing my drink assignment history
    When I click on a specific assignment
    Then I should see detailed information:
      | Complete order details |
      | All items in the order (not just my assignment) |
      | Venue details and location |
      | Assignor/assignee profile |
      | Timestamp of assignment |
      | Timestamp of response (if responded) |
      | Whether it was added to drinking session (if accepted) |
      | Session ID and BAC impact (if accepted) |
      | Decline reason (if declined) |

  Scenario: User filters assignment history
    Given I am logged in as a Pours Consumer user
    And I have 20 drink assignments over the past 6 months
    When I apply filters:
      | Status: "Accepted" |
      | Date range: "Last 30 days" |
      | Buddy: "John Smith" |
    Then I should see only assignments matching all filter criteria
    And the count should show "Showing X of 20 assignments"
    And I should be able to clear filters to see all assignments again
```

**Technical Requirements:**
- Query `drink_assignments` table with joins to `orders`, `order_items`, `products`, `profiles`
- Filter and sort capabilities by status, date, buddy, venue
- Pagination for large assignment lists
- Display linked `drink_records` and `drinking_sessions` data for accepted assignments
- Show BAC impact for accepted drinks

**Acceptance Criteria:**
- Users can view all assignments sent by them
- Users can view all assignments received by them
- Pending assignments are highlighted and easily accessible
- Assignment details include comprehensive order and drink info
- Filtering and sorting options are available
- Assignment history shows impact on sobriety tracking for accepted drinks
- History includes all statuses (pending, accepted, declined)

---

### US-SOCIAL.6: View Buddy Drinking Session Summary

**As a** Pours Consumer user  
**I want to** view a summary of my buddy's current drinking session (with their permission)  
**So that** I can monitor group consumption and encourage responsible drinking

**Background:**  
When drinking in groups, users should be able to view summarized consumption data of their buddies (who have granted permission) to promote collective responsibility and safety.

**Value:**  
- Promotes group accountability for responsible drinking
- Enables friends to look out for each other
- Provides social pressure for moderation
- Enhances safety features through peer awareness

**Gherkin Scenarios:**

```gherkin
Feature: View Buddy Drinking Session Summary
  Epic: Social Drinking & Group Orders (CNS-0023)

  Scenario: User grants permission for buddies to view session summary
    Given I am logged in as a Pours Consumer user
    And I have an active drinking session
    When I navigate to "Privacy Settings"
    And I enable "Allow buddies to view my session summary"
    Then my buddies should be able to see:
      | Number of drinks I've consumed |
      | Time since session started |
      | My estimated BAC range (low/medium/high, not exact value) |
      | Current venue |
    And my buddies should NOT be able to see:
      | Exact BAC value |
      | Specific drink names |
      | Biometric readings |
      | Sobriety alerts |

  Scenario: User views buddy's session summary (with permission)
    Given I am logged in as a Pours Consumer user
    And my buddy "Sarah" has granted permission to view her session
    And "Sarah" has an active drinking session
    When I view my buddy list
    And I click on "Sarah"
    Then I should see her session summary:
      | Session duration: "2 hours 15 minutes" |
      | Drinks consumed: "3 drinks" |
      | BAC status indicator: "Moderate" (shown as colored badge) |
      | Current venue: "Downtown Bar" |
      | Last drink consumed: "15 minutes ago" |
    And I should have an option to "Send Check-in Message"

  Scenario: User cannot view buddy's session without permission
    Given I am logged in as a Pours Consumer user
    And my buddy "John" has NOT granted permission to view his session
    When I view my buddy list
    And I click on "John"
    Then I should NOT see his session summary
    And I should see a message "John hasn't shared his session information"
    And I should see his normal profile information only

  Scenario: User sends check-in message to buddy
    Given I am logged in as a Pours Consumer user
    And I can view my buddy "Mike's" session summary
    And "Mike" has consumed 5 drinks with a "High" BAC status
    When I click "Send Check-in Message"
    And I select a pre-written message:
      | "Hey, let's grab some water!" |
      | "Want to take a break?" |
      | "Need a ride home?" |
    Or I write a custom message
    And I send the message
    Then "Mike" should receive the check-in notification
    And he should see my concern message
    And I should see a confirmation "Check-in message sent"

  Scenario: BAC status indicators are color-coded
    Given I am logged in as a Pours Consumer user
    And I am viewing buddy session summaries
    When a buddy's estimated BAC is:
      | Below 0.04%: Display "Low" in green badge |
      | 0.04% - 0.08%: Display "Moderate" in yellow/orange badge |
      | Above 0.08%: Display "High" in red badge |
    Then the color coding should be clear and accessible
    And hovering should show helpful text like "Consider slowing down"
```

**Technical Requirements:**
- Privacy setting in user preferences: `allow_buddy_session_view` boolean
- Query current `drinking_sessions` for buddies with permission granted
- BAC range calculation (low/moderate/high thresholds: <0.04, 0.04-0.08, >0.08)
- Real-time session data updates
- In-app messaging system for check-in messages
- Privacy controls to limit data exposure

**Acceptance Criteria:**
- Users can grant/revoke permission for buddies to view session summaries
- Only summary data is visible (not detailed consumption or biometrics)
- BAC is shown as range category, not exact value
- Users can send check-in messages to buddies showing concerning consumption
- Session summaries update in real-time
- Privacy settings are respected at all times
- Non-permitted buddies see profile only, not session data

---

## Data Models

### buddy_connections Table

```sql
CREATE TABLE public.buddy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, buddy_id),
  CHECK (user_id != buddy_id)
);

-- Indexes
CREATE INDEX idx_buddy_connections_user_id ON public.buddy_connections(user_id);
CREATE INDEX idx_buddy_connections_buddy_id ON public.buddy_connections(buddy_id);
CREATE INDEX idx_buddy_connections_status ON public.buddy_connections(status);

-- RLS Policies
ALTER TABLE public.buddy_connections ENABLE ROW LEVEL SECURITY;

-- Users can view connections they're part of
CREATE POLICY "Users can view their buddy connections"
ON public.buddy_connections FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Users can create buddy requests
CREATE POLICY "Users can create buddy requests"
ON public.buddy_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update connections they're part of (accept/block)
CREATE POLICY "Users can update their buddy connections"
ON public.buddy_connections FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Users can delete connections they're part of (unfriend)
CREATE POLICY "Users can delete their buddy connections"
ON public.buddy_connections FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = buddy_id);
```

### drink_assignments Table

```sql
CREATE TABLE public.drink_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  assignor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  decline_reason TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_drink_assignments_order_id ON public.drink_assignments(order_id);
CREATE INDEX idx_drink_assignments_assignor_id ON public.drink_assignments(assignor_id);
CREATE INDEX idx_drink_assignments_assignee_id ON public.drink_assignments(assignee_id);
CREATE INDEX idx_drink_assignments_status ON public.drink_assignments(status);

-- RLS Policies
ALTER TABLE public.drink_assignments ENABLE ROW LEVEL SECURITY;

-- Assignors can view their own assignments
CREATE POLICY "Assignors can view their assignments"
ON public.drink_assignments FOR SELECT
USING (auth.uid() = assignor_id);

-- Assignees can view assignments to them
CREATE POLICY "Assignees can view their assignments"
ON public.drink_assignments FOR SELECT
USING (auth.uid() = assignee_id);

-- Assignors can create assignments (during checkout)
CREATE POLICY "Assignors can create assignments"
ON public.drink_assignments FOR INSERT
WITH CHECK (auth.uid() = assignor_id);

-- Assignees can update assignments (accept/decline)
CREATE POLICY "Assignees can update assignments"
ON public.drink_assignments FOR UPDATE
USING (auth.uid() = assignee_id);

-- Only assignors can delete assignments (before order completion)
CREATE POLICY "Assignors can delete assignments"
ON public.drink_assignments FOR DELETE
USING (auth.uid() = assignor_id);
```

### user_preferences Table (Extension)

```sql
-- Add new column to existing user preferences or create if doesn't exist
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS allow_buddy_session_view BOOLEAN NOT NULL DEFAULT false;
```

---

## Technical Architecture

### Database Functions

#### Function: create_mutual_buddy_connection

```sql
CREATE OR REPLACE FUNCTION public.create_mutual_buddy_connection(
  connection_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  original_user UUID;
  original_buddy UUID;
BEGIN
  -- Get the original connection details
  SELECT user_id, buddy_id INTO original_user, original_buddy
  FROM public.buddy_connections
  WHERE id = connection_id AND status = 'accepted';
  
  -- Create reverse connection if it doesn't exist
  INSERT INTO public.buddy_connections (user_id, buddy_id, status, accepted_at)
  VALUES (original_buddy, original_user, 'accepted', NOW())
  ON CONFLICT (user_id, buddy_id) DO NOTHING;
END;
$$;
```

#### Function: process_drink_assignment_acceptance

```sql
CREATE OR REPLACE FUNCTION public.process_drink_assignment_acceptance(
  assignment_id UUID,
  assignee_session_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assignment_record RECORD;
  product_record RECORD;
BEGIN
  -- Get assignment and product details
  SELECT da.*, oi.product_id, oi.quantity
  INTO assignment_record
  FROM public.drink_assignments da
  JOIN public.order_items oi ON da.order_item_id = oi.id
  WHERE da.id = assignment_id;
  
  -- Get product alcohol details
  SELECT alcohol_content, volume_ml
  INTO product_record
  FROM public.products
  WHERE id = assignment_record.product_id;
  
  -- Create drink record for assignee
  INSERT INTO public.drink_records (
    user_id,
    session_id,
    order_id,
    product_id,
    alcohol_content,
    volume_ml,
    alcohol_ml,
    consumed_at
  )
  VALUES (
    assignment_record.assignee_id,
    assignee_session_id,
    assignment_record.order_id,
    assignment_record.product_id,
    product_record.alcohol_content,
    product_record.volume_ml,
    (product_record.volume_ml * product_record.alcohol_content / 100),
    NOW()
  );
  
  -- Update assignment status
  UPDATE public.drink_assignments
  SET status = 'accepted', responded_at = NOW(), updated_at = NOW()
  WHERE id = assignment_id;
  
  -- Recalculate BAC for assignee's session
  PERFORM update_session_bac(assignee_session_id);
END;
$$;
```

### React Hooks

#### useBuddyList Hook

```typescript
// src/hooks/useBuddyList.ts
export const useBuddyList = () => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BuddyRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  
  // Functions:
  // - fetchBuddies()
  // - sendBuddyRequest(buddyId: string)
  // - acceptBuddyRequest(requestId: string)
  // - declineBuddyRequest(requestId: string)
  // - blockUser(userId: string)
  // - removeBuddy(buddyId: string)
  // - searchUsers(query: string)
  
  return { buddies, pendingRequests, blockedUsers, ... };
};
```

#### useDrinkAssignments Hook

```typescript
// src/hooks/useDrinkAssignments.ts
export const useDrinkAssignments = () => {
  const [pendingAssignments, setPendingAssignments] = useState<DrinkAssignment[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<DrinkAssignment[]>([]);
  
  // Functions:
  // - fetchPendingAssignments()
  // - fetchAssignmentHistory(filters: AssignmentFilters)
  // - acceptAssignment(assignmentId: string, sessionId: string)
  // - declineAssignment(assignmentId: string, reason?: string)
  // - createAssignments(orderItems: AssignmentInput[])
  
  return { pendingAssignments, assignmentHistory, ... };
};
```

### React Components

#### BuddyListManager Component

```typescript
// src/components/social/BuddyListManager.tsx
// - Display accepted buddies with avatars and status
// - Show pending requests with accept/decline actions
// - Provide "Add Buddy" functionality (search or QR code)
// - Allow buddy removal with confirmation
// - Display blocked users list
```

#### DrinkAssignmentFlow Component

```typescript
// src/components/checkout/DrinkAssignmentFlow.tsx
// - Integrated into checkout process
// - Display cart items with assignment dropdowns
// - Show buddy list for each drink
// - Allow multiple drinks per buddy
// - Validate all drinks are assigned or marked as self/shared
// - Display assignment summary before order completion
```

#### DrinkAssignmentNotifications Component

```typescript
// src/components/social/DrinkAssignmentNotifications.tsx
// - Display pending drink assignments
// - Show assignment details (drink, assignor, venue, time)
// - Provide Accept/Decline actions
// - Show assignment history
// - Filter and search functionality
```

#### BuddySessionMonitor Component

```typescript
// src/components/social/BuddySessionMonitor.tsx
// - Display buddy session summaries (with permission)
// - Show BAC status indicators (color-coded)
// - Provide check-in messaging
// - Privacy controls and settings
// - Real-time session updates
```

---

## Integration Points

### With Existing Features

1. **CNS-0009 Checkout Process:**
   - Add drink assignment step after cart review
   - Integrate buddy selection UI
   - Validate assignments before order completion

2. **CNS-0017 Sobriety Monitoring:**
   - Link accepted drink assignments to `drink_records`
   - Update `drinking_sessions` with assigned drinks
   - Trigger BAC recalculation and sobriety alerts
   - Enable buddy session summary viewing

3. **CNS-0002 User Profile Management:**
   - Add buddy list to user profile
   - Display buddy count and connections
   - Privacy settings for session visibility

4. **CNS-0018 Real-Time Order Tracking:**
   - Show drink assignments in order details
   - Display assignment statuses in order history
   - Notify assignors of assignment responses

5. **CNS-0020 Privacy & Compliance:**
   - Data consent for buddy connections
   - Privacy controls for session data sharing
   - Data deletion for buddy connections and assignments

---

## Privacy & Security Considerations

### Data Privacy

- **Consent Required:** All drink assignments require explicit acceptance
- **Limited Data Sharing:** Buddy session summaries show only aggregated/anonymized data
- **Opt-in Visibility:** Users must explicitly grant permission for buddies to view session data
- **Data Retention:** Assignment history retained per GDPR/CCPA requirements
- **Right to Deletion:** Users can delete buddy connections and assignment history

### Security

- **RLS Policies:** Strict row-level security on all buddy and assignment tables
- **Buddy Verification:** Only accepted buddies can be assigned drinks
- **Mutual Relationships:** Buddy connections are bidirectional and require acceptance
- **Blocking:** Users can block unwanted buddy requests
- **Audit Trail:** All assignments logged with timestamps and user IDs

---

## Success Metrics

### Engagement Metrics

- Number of buddy connections per user (target: 3-5 active buddies)
- Percentage of orders with drink assignments (target: 40%+)
- Assignment acceptance rate (target: 85%+)
- Buddy session summary views per session (target: 2+ per group outing)

### Safety Metrics

- Reduction in high BAC sessions when buddies are monitoring
- Check-in message frequency during high BAC sessions
- Correlation between buddy monitoring and responsible drinking behavior

### Technical Metrics

- Assignment notification delivery time (<5 seconds)
- Assignment acceptance/decline processing time (<2 seconds)
- BAC recalculation latency after acceptance (<3 seconds)

---

## Future Enhancements

### Phase 2 Considerations

- **Group Challenges:** Buddy groups competing for responsible drinking badges
- **Designated Driver Role:** Special buddy role with enhanced monitoring permissions
- **Shared Tab Management:** Split bills with automatic drink assignment
- **Buddy Recommendations:** AI-suggested buddies based on venue visits and preferences
- **Emergency Contact Integration:** Notify emergency contacts if buddy reaches critical BAC
- **Social Sharing:** Share group achievements and responsible drinking streaks

---

## Appendix

### Glossary

- **Buddy:** An accepted connection between two Pours Consumer users enabling drink assignment
- **Drink Assignment:** The act of designating a drink to a specific buddy during order placement
- **Assignor:** The user who places an order and assigns drinks to buddies
- **Assignee:** The user who receives a drink assignment and must accept/decline
- **Session Summary:** Aggregated drinking data visible to buddies with permission
- **Check-in Message:** A concern message sent to a buddy about their consumption level

### Related Documentation

- [Sobriety Monitoring Features](./sobriety-monitoring-features.md) - CNS-0017
- [Checkout Process Features](./checkout-features.md) - CNS-0009
- [User Profile Management](./manage-profile-features.md) - CNS-0002
- [Privacy & Compliance Features](./privacy-compliance-features.md) - CNS-0020
