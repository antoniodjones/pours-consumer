# Age Verification Features - Product Requirements

**Epic:** CNS-0022 - Age Verification  
**Feature Area:** Compliance & User Management  
**Status:** ✅ Implemented  
**Priority:** P0 - Critical (Legal Requirement)

---

## Table of Contents
- [Epic Overview](#epic-overview)
- [User Stories](#user-stories)
  - [US-AGE.1: Display Age Gate Modal](#us-age1-display-age-gate-modal)
  - [US-AGE.2: Validate Legal Drinking Age](#us-age2-validate-legal-drinking-age)
  - [US-AGE.3: Persist Verification Status](#us-age3-persist-verification-status)
  - [US-AGE.4: Handle Underage Users](#us-age4-handle-underage-users)
  - [US-AGE.5: Re-verification Requirements](#us-age5-re-verification-requirements)
- [Technical Requirements](#technical-requirements)
- [Database Schema](#database-schema)
- [API & Edge Functions](#api--edge-functions)
- [Security & Compliance](#security--compliance)

---

## Epic Overview

### Description
Age Verification ensures that only users who meet the legal drinking age (21+ in the United States) can access alcoholic beverage products and complete purchases within the Pours Consumer app. This is a critical legal and compliance requirement for operating an alcohol e-commerce platform.

### Business Value
- **Legal Compliance**: Meets federal and state regulations for selling alcoholic beverages
- **Risk Mitigation**: Protects the business from legal liability and fines
- **Brand Protection**: Demonstrates responsible alcohol sales practices
- **User Trust**: Shows commitment to legal and ethical business operations

### Success Metrics
- 100% of users verified before accessing alcoholic product catalog
- Zero underage users able to complete purchases
- <2% bounce rate on age verification modal
- Average verification time <30 seconds

### Acceptance Criteria
- Age gate appears immediately on first visit to the application
- Users cannot access product catalog without age verification
- Date of birth validation confirms user is 21+ years old
- Verification status persists across browser sessions
- Clear messaging for users who do not meet age requirements
- Compliance with accessibility standards (WCAG 2.1 AA)

---

## User Stories

### US-AGE.1: Display Age Gate Modal

**As a** first-time visitor to the Pours Consumer app  
**I want to** be presented with an age verification modal immediately upon landing  
**So that** the app ensures compliance with legal requirements before I access alcohol products

#### Background
Age verification is a legal requirement for alcohol sales. The age gate must be the first interaction for any user visiting the application to prevent minors from accessing alcoholic beverage content.

#### Value Proposition
- Ensures immediate legal compliance
- Creates a responsible first impression
- Prevents unauthorized access to restricted content
- Protects the business from legal liability

#### Gherkin Scenarios

```gherkin
Feature: Age Verification Modal Display
  As a first-time visitor
  I need to verify my age before accessing the application
  So that the platform complies with alcohol sales regulations

  Background:
    Given I have not previously verified my age
    And I am visiting the Pours Consumer app for the first time

  Scenario: Age gate modal appears on first visit
    Given I navigate to the Pours Consumer homepage
    When the page loads
    Then I should see an age verification modal
    And the modal should block access to the underlying content
    And the modal should display the question "Are you 21 years of age or older?"
    And I should see "Yes" and "No" action buttons
    And the modal should not be dismissible by clicking outside or pressing ESC

  Scenario: Modal prevents interaction with page content
    Given the age verification modal is displayed
    When I attempt to click on elements behind the modal
    Then the click should not trigger any action on the underlying page
    And the modal should remain in focus

  Scenario: Modal displays branding and legal messaging
    Given the age verification modal is displayed
    Then I should see the Pours+ logo or branding
    And I should see legal disclaimer text about age requirements
    And I should see a message indicating this is a legal requirement
```

#### Acceptance Criteria
- [ ] Modal appears immediately on page load for unverified users
- [ ] Modal is visually prominent and centered on screen
- [ ] Modal prevents interaction with page content (blocking overlay)
- [ ] Modal cannot be dismissed without providing verification
- [ ] Modal displays clear "Yes" (21+) and "No" (<21) options
- [ ] Modal includes legal disclaimer text
- [ ] Modal meets WCAG 2.1 AA accessibility standards
- [ ] Modal is responsive across all device sizes

#### Technical Notes
- Component: `src/components/AgeVerificationModal.tsx`
- Hook: `src/hooks/useAgeVerification.ts`
- Storage: localStorage key `age_verified`
- Modal should be rendered in `src/pages/Index.tsx` or app root

---

### US-AGE.2: Validate Legal Drinking Age

**As a** user attempting to access the Pours Consumer app  
**I want to** confirm my date of birth or age status  
**So that** I can prove I meet the legal drinking age requirement

#### Background
The legal drinking age in the United States is 21 years old. The system must validate that users meet this requirement before granting access to alcoholic beverage products.

#### Value Proposition
- Ensures only legal-age users access the platform
- Provides proof of due diligence for regulatory compliance
- Creates a seamless verification experience for legitimate users
- Maintains audit trail for compliance reporting

#### Gherkin Scenarios

```gherkin
Feature: Legal Drinking Age Validation
  As a user verifying my age
  I need to confirm I am 21 years or older
  So that I can access alcoholic beverage products legally

  Scenario: User confirms they are of legal age (simple verification)
    Given the age verification modal is displayed
    When I click the "Yes, I am 21 or older" button
    Then the modal should close
    And I should be granted access to the application
    And my verification status should be stored
    And I should see the main application content

  Scenario: User enters date of birth (enhanced verification)
    Given the age verification modal is displayed
    And the modal requires date of birth entry
    When I enter a valid date of birth showing I am 21 or older
    And I click "Verify"
    Then the system should calculate my current age
    And if I am 21 or older, the modal should close
    And I should be granted access to the application
    And my verification should be stored with the provided date

  Scenario: User enters date of birth showing they are under 21
    Given the age verification modal is displayed
    And the modal requires date of birth entry
    When I enter a date of birth showing I am under 21 years old
    And I click "Verify"
    Then I should see an error message "You must be 21 or older to access this site"
    And the modal should remain open
    And I should not be granted access to the application

  Scenario: User enters invalid date of birth
    Given the age verification modal is displayed
    And the modal requires date of birth entry
    When I enter an invalid date (e.g., "13/32/2000")
    And I click "Verify"
    Then I should see an error message "Please enter a valid date of birth"
    And the modal should remain open
    And I should be able to correct my entry

  Scenario: User enters a future date
    Given the age verification modal is displayed
    And the modal requires date of birth entry
    When I enter a date in the future
    And I click "Verify"
    Then I should see an error message "Please enter a valid date of birth"
    And the modal should remain open
```

#### Acceptance Criteria
- [ ] System validates user is at least 21 years old
- [ ] Date calculation accounts for current date accurately
- [ ] Clear error messages for underage users
- [ ] Clear error messages for invalid date inputs
- [ ] Validation occurs on form submission
- [ ] Client-side validation provides immediate feedback
- [ ] Future dates are rejected as invalid
- [ ] Invalid date formats are rejected
- [ ] System handles leap years correctly
- [ ] Timezone considerations handled appropriately

#### Technical Notes
- Age calculation must use current date vs. birth date
- Consider using `date-fns` library for reliable date calculations
- Store verification timestamp for audit purposes
- May optionally store birth date (encrypted) for future age-gated features

---

### US-AGE.3: Persist Verification Status

**As a** verified user of the Pours Consumer app  
**I want** my age verification to be remembered across sessions  
**So that** I don't have to re-verify my age every time I visit the app

#### Background
Re-verifying age on every visit creates friction and poor user experience. The system should remember verified users while balancing security and compliance requirements.

#### Value Proposition
- Improves user experience through session persistence
- Reduces verification friction for returning users
- Maintains compliance through secure storage
- Balances security with convenience

#### Gherkin Scenarios

```gherkin
Feature: Age Verification Persistence
  As a verified user
  I want my verification status to be remembered
  So that I can access the app without repeated verification

  Scenario: Returning verified user is not prompted again
    Given I have previously verified my age
    And my verification is stored in localStorage
    When I close the browser and return to the site
    Then I should not see the age verification modal
    And I should have immediate access to the application

  Scenario: Verification persists across browser tabs
    Given I have verified my age in one browser tab
    When I open the Pours Consumer app in a new tab
    Then I should not see the age verification modal in the new tab
    And I should have immediate access to the application

  Scenario: Verification persists after browser restart
    Given I have verified my age
    And I close my browser completely
    When I reopen my browser and navigate to the app
    Then I should not see the age verification modal
    And I should have immediate access to the application

  Scenario: Cleared browser data resets verification
    Given I have previously verified my age
    When I clear my browser's localStorage/cookies
    And I navigate to the app
    Then I should see the age verification modal again
    And I should need to re-verify my age

  Scenario: Verification in private/incognito mode
    Given I open the app in a private/incognito browser window
    When I verify my age
    And I close the private window
    And I open a new private window
    Then I should see the age verification modal again
    And my previous verification should not persist
```

#### Acceptance Criteria
- [ ] Verification status stored in browser localStorage
- [ ] Verification persists across browser sessions
- [ ] Verification persists across multiple tabs
- [ ] Verification survives page refreshes
- [ ] Clearing browser data resets verification status
- [ ] Private/incognito browsing requires re-verification each session
- [ ] Verification includes timestamp of when it occurred
- [ ] Storage mechanism is secure and tamper-resistant

#### Technical Notes
- Storage key: `age_verified` in localStorage
- Consider storing additional metadata: `{ verified: true, timestamp: ISO8601, method: 'simple'|'dob' }`
- Hook: `useAgeVerification()` manages state and persistence
- Consider cryptographic signing of stored value to prevent tampering

---

### US-AGE.4: Handle Underage Users

**As an** underage visitor to the Pours Consumer app  
**I want to** receive clear guidance when I cannot access the site  
**So that** I understand the legal requirements and am not confused or frustrated

#### Background
Users under the legal drinking age (21) must be prevented from accessing the application. The messaging and handling must be clear, respectful, and legally compliant.

#### Value Proposition
- Ensures legal compliance by blocking underage access
- Provides clear, respectful communication
- Prevents confusion and frustration
- Protects brand reputation through responsible practices

#### Gherkin Scenarios

```gherkin
Feature: Underage User Handling
  As an underage user
  I need to understand why I cannot access the site
  So that I am informed about legal requirements

  Scenario: User indicates they are under 21 (simple verification)
    Given the age verification modal is displayed
    When I click the "No, I am under 21" button
    Then I should see a message "You must be 21 or older to access this site"
    And I should see information about legal drinking age requirements
    And I should not be able to access the application
    And I should see a message thanking me for my honesty
    And I should see an option to exit or be redirected

  Scenario: User provides birth date showing they are under 21
    Given the age verification modal is displayed with date of birth entry
    When I enter a date of birth showing I am under 21
    And I submit the form
    Then I should see a message "You must be 21 or older to access this site"
    And I should see the current legal drinking age requirement
    And I should not be granted access to the application
    And the application content should remain blocked

  Scenario: Underage user attempts to bypass verification
    Given I am identified as underage
    When I refresh the page or attempt to navigate to internal URLs
    Then I should still see the age verification modal
    And I should still be blocked from accessing content
    And my underage status should be remembered for the session

  Scenario: Underage user sees alternative options
    Given I have been identified as underage
    When I see the denial message
    Then I should see information about when I can return
    And I should optionally see information about non-alcoholic alternatives
    And I should see respectful messaging about responsible practices
```

#### Acceptance Criteria
- [ ] Clear denial message when user indicates they are under 21
- [ ] Messaging is respectful and not condescending
- [ ] Legal drinking age requirement is clearly stated
- [ ] User cannot access application content
- [ ] Underage status prevents repeated access attempts
- [ ] Optional redirect to external site or exit guidance
- [ ] No alcoholic product information is visible to underage users
- [ ] Messaging complies with legal requirements

#### Technical Notes
- Consider temporary localStorage flag to prevent repeated prompts in same session
- May redirect to external page or show static informational content
- Ensure no product data or images are visible in denied state
- Consider analytics tracking (anonymously) for compliance reporting

---

### US-AGE.5: Re-verification Requirements

**As a** platform administrator  
**I want to** define when users must re-verify their age  
**So that** we maintain ongoing compliance and security

#### Background
While verification should persist for user convenience, certain scenarios may require re-verification for security or compliance reasons.

#### Value Proposition
- Maintains long-term compliance
- Addresses security concerns (e.g., shared devices)
- Balances convenience with responsible practices
- Provides flexibility for compliance policy changes

#### Gherkin Scenarios

```gherkin
Feature: Age Re-verification Requirements
  As a platform
  I need to determine when users should re-verify their age
  So that compliance and security are maintained over time

  Scenario: Verification expires after defined period (optional)
    Given I verified my age 1 year ago
    And the platform policy requires annual re-verification
    When I visit the app after the verification has expired
    Then I should see the age verification modal again
    And I should need to re-verify my age

  Scenario: Verification remains valid indefinitely (current implementation)
    Given I verified my age at any point in the past
    And the platform does not enforce expiration
    When I return to the app
    Then I should not see the age verification modal
    And I should have immediate access

  Scenario: User can manually reset verification
    Given I am logged in as a user
    And I navigate to privacy or account settings
    When I select "Reset age verification"
    Then my verification status should be cleared
    And I should see the age verification modal on next visit

  Scenario: Platform administrator triggers re-verification
    Given I am a verified user
    When the platform administrator triggers a global re-verification event
    Then my stored verification should be invalidated
    And I should see the age verification modal on my next visit
```

#### Acceptance Criteria
- [ ] Platform defines re-verification policy (never, annual, etc.)
- [ ] Expiration logic implemented if required by policy
- [ ] Users can manually reset their verification status
- [ ] Administrators can trigger re-verification events
- [ ] Re-verification maintains same validation standards
- [ ] Users are notified if re-verification is required
- [ ] Policy changes can be implemented without code changes

#### Technical Notes
- Current implementation: verification does not expire
- Future enhancement: add `expiration_date` to stored verification
- Consider admin dashboard toggle for re-verification policies
- May add `profiles` table column for verified_at timestamp

---

## Technical Requirements

### Components

#### AgeVerificationModal Component
- **Location**: `src/components/AgeVerificationModal.tsx`
- **Purpose**: Display age gate modal and handle user verification
- **Key Features**:
  - Modal overlay with blocking behavior
  - "Yes/No" buttons or date of birth input
  - Validation logic
  - Accessibility compliant (ARIA labels, keyboard navigation)
  - Mobile responsive design
  
#### useAgeVerification Hook
- **Location**: `src/hooks/useAgeVerification.ts`
- **Purpose**: Manage age verification state and persistence
- **Key Features**:
  - Check localStorage for existing verification
  - Store verification status
  - Provide verification state to components
  - Handle verification events

### User Flow

```
User visits site
    ↓
Check localStorage for age_verified
    ↓
Not verified → Show Modal → User confirms age
    ↓                              ↓
Verified → Allow access        Store in localStorage
    ↓                              ↓
Access application          Allow access
```

### Data Storage

#### LocalStorage Schema
```javascript
{
  "age_verified": "true",
  "verified_at": "2025-11-23T08:24:00.000Z",
  "verification_method": "simple" // or "dob"
}
```

### Performance Requirements
- Modal render time: <100ms
- Validation response time: <50ms
- Zero impact on page load for verified users
- Minimal JavaScript bundle size impact

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels and roles
- Sufficient color contrast
- Focus management

### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Database Schema

### Current Implementation
Age verification is currently client-side only, using browser localStorage. No database tables are required.

### Future Enhancement: Server-Side Verification Tracking (Optional)

If compliance requires server-side audit trails:

```sql
-- Optional: Track age verification events for compliance auditing
CREATE TABLE IF NOT EXISTS public.age_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest/anonymous users
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_method TEXT CHECK (verification_method IN ('simple', 'dob')),
  ip_address INET,
  user_agent TEXT,
  date_of_birth DATE, -- Encrypted if stored
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for compliance queries
CREATE INDEX idx_age_verifications_user_id ON public.age_verifications(user_id);
CREATE INDEX idx_age_verifications_session_id ON public.age_verifications(session_id);
CREATE INDEX idx_age_verifications_verified_at ON public.age_verifications(verified_at);

-- Enable RLS
ALTER TABLE public.age_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own verification records
CREATE POLICY "Users can view own verification records"
  ON public.age_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert verification records
CREATE POLICY "System can insert verification records"
  ON public.age_verifications
  FOR INSERT
  WITH CHECK (true);
```

---

## API & Edge Functions

### Current Implementation
No Edge Functions required for current localStorage-based implementation.

### Future Enhancement: Server-Side Verification (Optional)

#### Edge Function: verify-age

**Purpose**: Record and validate age verification server-side

**Endpoint**: `POST /functions/v1/verify-age`

**Request Body**:
```json
{
  "method": "simple" | "dob",
  "dateOfBirth": "YYYY-MM-DD" // optional, only for 'dob' method
}
```

**Response**:
```json
{
  "verified": true,
  "verificationId": "uuid",
  "verifiedAt": "ISO8601 timestamp"
}
```

**Logic**:
1. Validate request payload
2. If method is 'dob', calculate age from date of birth
3. Verify user is 21+ years old
4. Record verification in `age_verifications` table
5. Return verification status

---

## Security & Compliance

### Legal Compliance
- **21+ Requirement**: Federal law (21st Amendment, state laws)
- **Due Diligence**: Demonstrable age verification process
- **Audit Trail**: Ability to prove verification attempts (if required)
- **Privacy**: DOB data (if collected) must be encrypted and protected

### Security Measures
- **Client-Side**: 
  - Verification required before any API calls
  - No product data loaded until verified
  - Modal cannot be bypassed via DOM manipulation
  
- **Server-Side** (if implemented):
  - Verification logged with timestamp
  - IP address and user agent recorded for fraud detection
  - Rate limiting on verification attempts
  - Encrypted storage of DOB if collected

### Privacy Considerations
- **Minimal Data**: Only collect what's legally required
- **DOB Storage**: If collecting DOB, encrypt at rest
- **Retention**: Define data retention policy for verification records
- **User Control**: Allow users to request deletion of verification data

### Compliance Documentation
- Document verification process for regulatory review
- Maintain records of verification policy updates
- Ensure GDPR/CCPA compliance for any collected data
- Regular compliance audits

---

## Testing Requirements

### Unit Tests
- [ ] Modal renders correctly
- [ ] Yes/No button handlers work correctly  
- [ ] Date validation logic works for all edge cases
- [ ] Age calculation handles leap years
- [ ] LocalStorage read/write operations
- [ ] Hook returns correct verification status

### Integration Tests
- [ ] Modal blocks application access when not verified
- [ ] Verification persists across page navigation
- [ ] Verification persists across browser sessions
- [ ] Clearing localStorage resets verification
- [ ] Modal accessibility compliance

### E2E Tests
- [ ] First-time user sees modal on homepage
- [ ] Verified user does not see modal on return visit
- [ ] Underage user cannot access application
- [ ] Invalid date entries show appropriate errors
- [ ] Verification works on mobile devices

---

## Documentation Updates Required

- [x] Product requirements documented (this file)
- [ ] User guide: "Age Verification Process"
- [ ] Developer guide: "Implementing Age Gates"
- [ ] Compliance documentation: "Age Verification Audit Trail"
- [ ] Privacy policy update: Age verification data handling

---

## Appendix

### Relevant Laws & Regulations
- 21st Amendment to the U.S. Constitution
- State-specific alcohol laws
- Federal Trade Commission (FTC) guidelines
- Children's Online Privacy Protection Act (COPPA)

### Industry Best Practices
- Alcohol and Tobacco Tax and Trade Bureau (TTB) guidance
- Responsible alcohol marketing practices
- Digital age verification standards

### Change Log
- **2025-11-23**: Initial documentation created (CNS-0022)
