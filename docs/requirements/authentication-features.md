# Authentication Features - Product Requirements

**Document Version:** 3.0  
**Last Updated:** 2025-11-23  
**Epic:** CNS-0001: Core Authentication & User Management  
**Status:** 🟡 Partially Implemented (Core features complete, enhancements planned)  
**Priority:** P0 - Critical

---

## Epic Overview

### Epic Statement
As a Pours Consumer application, we need a secure, passwordless authentication system that enables users to register and sign in using email-based OTP (One-Time Password) verification, with support for demo sessions during development and testing.

### Business Value
- **Improved Security**: Passwordless authentication reduces password-related security vulnerabilities
- **Better User Experience**: Simplified login flow without password management
- **Reduced Friction**: Quick email + OTP verification without complex password requirements
- **Demo Support**: Enables rapid testing and demonstrations without production email dependencies
- **Profile Integration**: Automatic profile creation ensures data consistency across the platform

### Success Metrics
- User registration completion rate > 85%
- Sign-in success rate > 95%
- Average OTP verification time < 2 minutes
- Session persistence rate > 90%
- Password reset request completion rate > 75%

### Dependencies
- **Database Tables**: `otp_codes`, `profiles`, `user_rewards`
- **Edge Functions**: `send-otp`, `verify-otp`
- **External Services**: Resend.com for email delivery
- **Auth Provider**: Supabase Auth

---

## User Stories

### US-AUTH.1: User Registration with Email and OTP

**As a** new user  
**I want to** register for a Pours Consumer account using my email and a verification code  
**So that** I can access personalized features, loyalty rewards, and order history

#### Story Points: 8
#### Priority: P0 - Critical

#### Background
The registration process is the first touchpoint for new users. It must be secure, fast, and user-friendly while collecting essential information for profile creation and loyalty program enrollment. The OTP-based approach eliminates password management friction and improves security.

#### Value Proposition
- Passwordless authentication reduces user friction and security risks
- Email verification ensures valid contact information
- Optional demographic data enables personalization
- Automatic loyalty program enrollment drives engagement
- Referral code support facilitates viral growth

#### Acceptance Criteria

**Scenario 1: Successful New User Registration**
```gherkin
Given I am a new user on the registration page
When I enter a valid email address "user@example.com"
And I enter my first name "John"
And I enter my last name "Doe"
And I enter my date of birth "01/15/1995"
And I enter my mobile number "(555) 123-4567"
And I select my country "United States"
And I select my city "San Francisco"
And I select my preferred venue "The Tipsy Tavern"
And I opt in to join the rewards program
And I click "Send Verification Code"
Then I should receive a 6-digit OTP code via email within 30 seconds
And I should see the OTP input form
And I should see "Check your email for the verification code"
When I enter the correct 6-digit OTP code
And I click "Verify & Sign Up"
Then my account should be created successfully
And a profile record should be created with my information
And a user_rewards record should be created with 0 initial points
And I should be automatically signed in
And I should be redirected to the home page
And I should see a welcome message "Welcome!"
```

**Scenario 2: Registration with Referral Code**
```gherkin
Given I am a new user accessing the registration page with a referral code "ABC12345"
When I complete the registration form
And I opt in to join the rewards program
And I verify my email with the OTP code
Then my account should be created with the referral code stored
And I should be eligible for referral bonus points
And I should see a message indicating bonus points eligibility
```

**Scenario 3: Registration with Invalid Email**
```gherkin
Given I am on the registration page
When I enter an invalid email "not-an-email"
And I attempt to send the verification code
Then I should see an error message "Please enter a valid email address"
And no OTP code should be sent
```

**Scenario 4: Registration with Email Already Registered**
```gherkin
Given I am on the registration page
And an account already exists for "existing@example.com"
When I enter "existing@example.com" as my email
And I complete the registration form
And I click "Send Verification Code"
And I enter a valid OTP code
And I click "Verify & Sign Up"
Then I should see an error message "This email is already registered. Please try signing in instead."
And I should be automatically switched to the Sign In tab
And my OTP input should be cleared
```

**Scenario 5: OTP Code Expiration**
```gherkin
Given I have requested an OTP code for registration
And 10 minutes have passed
When I attempt to verify the OTP code
Then I should see an error message "Verification code has expired"
And I should see a "Send New Code" button
When I click "Send New Code"
Then a new OTP code should be sent to my email
And the expiration timer should reset to 5 minutes
```

**Scenario 6: Missing Required Fields**
```gherkin
Given I am on the registration page
When I enter only my email "user@example.com"
And I leave first name and last name empty
And I click "Send Verification Code"
Then I should see an error message "Please fill in all required fields"
And no OTP code should be sent
```

**Scenario 7: Minimum Age Requirement**
```gherkin
Given I am on the registration page
When I enter a date of birth that indicates I am under 21 years old
And I attempt to register
Then I should see an error message indicating minimum age requirement
And registration should not proceed
```

#### Technical Requirements

**Frontend Components:**
- `src/pages/Auth.tsx` - Main authentication page with tab navigation
- `src/components/auth/SignUpForm.tsx` - Registration form with all fields
- `src/components/auth/OTPForm.tsx` - OTP input and verification
- `src/hooks/useAuth.ts` - Authentication state management
- `src/hooks/useAuthActions.ts` - Authentication actions (sendOTP, verifyOTP)

**Backend Services:**
- `supabase/functions/send-otp/index.ts` - Generates and sends OTP codes via email
- `supabase/functions/verify-otp/index.ts` - Verifies OTP and creates user account

**Database Schema:**
```sql
-- OTP codes table for verification
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL, -- 'signup' or 'signin'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profiles automatically created via trigger on auth.users insert
-- See trigger: handle_new_user()
```

**API Integration:**
- **Resend Email API**: Sends OTP codes via email
- **Supabase Auth Admin API**: Creates user accounts with email confirmation

**Security Considerations:**
- OTP codes expire after 10 minutes
- Codes are single-use (marked as used after verification)
- Rate limiting on OTP generation (prevent spam)
- Email validation before sending OTP
- Secure random password generation for user accounts
- HTTPS required for all authentication requests

---

### US-AUTH.2: User Sign-In with Email and OTP

**As a** returning user  
**I want to** sign in to my account using my email and a verification code  
**So that** I can access my profile, orders, and loyalty rewards securely without remembering a password

#### Story Points: 5
#### Priority: P0 - Critical

#### Background
Sign-in is a frequent user action that must be fast, secure, and frictionless. OTP-based authentication provides security equivalent to or better than traditional passwords while eliminating password management friction.

#### Value Proposition
- No password to remember or manage
- Quick verification via email
- Secure authentication without password vulnerabilities
- Session persistence for seamless experience
- "Continue as Guest" option for low-commitment users

#### Acceptance Criteria

**Scenario 1: Successful Sign-In**
```gherkin
Given I am a registered user with email "user@example.com"
And I am on the sign-in page
When I enter my email "user@example.com"
And I click "Send Verification Code"
Then I should receive a 6-digit OTP code via email within 30 seconds
And I should see the OTP input form
When I enter the correct 6-digit OTP code
And I click "Verify & Sign In"
Then I should be successfully authenticated
And I should be redirected to the home page
And I should see "Welcome back!"
And my session should persist across browser tabs
```

**Scenario 2: Sign-In with Invalid OTP**
```gherkin
Given I have requested a sign-in OTP code
And I am on the OTP verification screen
When I enter an incorrect 6-digit code
And I click "Verify & Sign In"
Then I should see an error message "Verification Error"
And I should remain on the OTP verification screen
And I should be able to request a new code
```

**Scenario 3: Sign-In with Non-Existent Email (Demo Mode)**
```gherkin
Given I am on the sign-in page
When I enter an email "demo@example.com" that doesn't exist in the database
And I click "Send Verification Code"
And I enter any valid 6-digit code
And I click "Verify & Sign In"
Then a demo session should be created
And I should be signed in with limited demo privileges
And demo session data should be stored in localStorage
```

**Scenario 4: Continue as Guest**
```gherkin
Given I am on the sign-in page
When I click "Continue as Guest"
Then I should be redirected to the home page
And I should be able to browse products
And I should be able to add items to cart
But I should not have access to profile or order history
And I should see prompts to sign in for full features
```

**Scenario 5: Auto-Redirect for Authenticated Users**
```gherkin
Given I am already signed in
When I navigate to the sign-in page
Then I should be automatically redirected to the home page
And I should not see the sign-in form
```

**Scenario 6: OTP Resend**
```gherkin
Given I have requested an OTP code for sign-in
And I am on the OTP verification screen
When I click "Resend Code"
Then a new OTP code should be sent to my email
And I should see a confirmation "A new verification code has been sent to your email"
And the previous OTP code should be invalidated
And the expiration timer should reset
```

#### Technical Requirements

**Frontend Components:**
- `src/components/auth/SignInForm.tsx` - Email input and "Continue as Guest" option
- `src/components/auth/OTPForm.tsx` - Shared OTP verification component
- `src/hooks/useAuthState.ts` - Session and user state management

**Session Management:**
- Supabase Auth session stored in localStorage
- Demo sessions stored separately in localStorage with prefix "demo-session"
- Session auto-refresh handled by Supabase client
- Cross-tab session synchronization via localStorage events

**Security Considerations:**
- Session tokens expire after inactivity
- Refresh tokens used for silent re-authentication
- Demo sessions clearly marked to prevent production data access
- Session invalidation on sign-out

---

### US-AUTH.3: Password Reset via OTP

**As a** user who needs to reset their password  
**I want to** receive a password reset link via email  
**So that** I can regain access to my account if needed

#### Story Points: 3
#### Priority: P1 - High

#### Background
While the primary authentication method is OTP-based (passwordless), the system still supports traditional password authentication for users who prefer it or for administrative purposes.

#### Value Proposition
- Recovery mechanism for accounts with passwords
- Secure token-based reset process
- Email verification before password change
- Prevents unauthorized password changes

#### Acceptance Criteria

**Scenario 1: Request Password Reset**
```gherkin
Given I am on the sign-in page
And I have forgotten my password
When I click "Forgot Password?"
And I enter my email "user@example.com"
Then I should see a confirmation "Password Reset Email Sent!"
And I should receive an email with a password reset link
And the link should expire after 1 hour
```

**Scenario 2: Complete Password Reset**
```gherkin
Given I have received a password reset email
When I click the reset link in the email
Then I should be redirected to a password reset page
When I enter a new strong password
And I confirm the new password
And I click "Reset Password"
Then my password should be updated
And I should see a success message
And I should be able to sign in with the new password
```

**Scenario 3: Invalid or Expired Reset Link**
```gherkin
Given I have a password reset link that has expired
When I click the expired link
Then I should see an error message "This reset link has expired"
And I should be prompted to request a new reset email
```

#### Technical Requirements

**Frontend:**
- Password reset request in SignInForm component
- Password reset completion page (handled by Supabase Auth)

**Backend:**
- Supabase Auth `resetPasswordForEmail()` method
- `updatePassword()` method for completing reset

**Security:**
- Reset tokens expire after 1 hour
- One-time use tokens
- HTTPS required for reset pages

---

### US-AUTH.4: Demo Session Support

**As a** developer or tester  
**I want to** use demo sessions without requiring email verification  
**So that** I can quickly test the application without production email dependencies

#### Story Points: 3
#### Priority: P2 - Medium

#### Background
Demo sessions are essential for development, testing, and demonstrations. They provide a way to simulate authenticated users without requiring email verification or database records.

#### Value Proposition
- Rapid testing without email dependencies
- Safe demonstration environment
- No database pollution during testing
- Supports sales demos and user training

#### Acceptance Criteria

**Scenario 1: Create Demo Session**
```gherkin
Given I am on the sign-in or sign-up page
When I enter any email address
And I enter any valid 6-digit code (000000 to 999999)
And I verify the code
Then a demo session should be created
And demo session data should include:
  | Field | Value |
  | access_token | demo-token-{timestamp} |
  | refresh_token | demo-refresh-{timestamp} |
  | user.id | demo-user-{email-hash} |
  | user.email | {entered email} |
And the session should be stored in localStorage
And I should be marked as authenticated
```

**Scenario 2: Demo Session Persistence**
```gherkin
Given I have an active demo session
When I refresh the page
Then my demo session should be restored from localStorage
And I should remain authenticated
```

**Scenario 3: Demo Session Limitations**
```gherkin
Given I am authenticated with a demo session
Then I should be able to browse products
And I should be able to add items to cart
But database operations should fail gracefully
And I should see demo indicators where appropriate
```

#### Technical Requirements

**Implementation:**
- `useAuthActions.ts` - `createDemoSession()` method
- `useAuthState.ts` - `checkDemoSession()` method
- localStorage key: "demo-session"

**Demo Session Structure:**
```typescript
interface DemoSession {
  access_token: string; // "demo-token-{timestamp}"
  refresh_token: string; // "demo-refresh-{timestamp}"
  expires_in: number; // 3600 (1 hour)
  user: {
    id: string; // "demo-user-{email-hash}"
    email: string;
    user_metadata: {
      first_name: string;
      last_name: string;
      // ... additional data
    };
    created_at: string;
  };
}
```

---

### US-AUTH.5: Automatic Profile Creation

**As the** system  
**I want to** automatically create a profile and rewards record when a new user registers  
**So that** users have immediate access to all profile features and loyalty benefits

#### Story Points: 5
#### Priority: P0 - Critical

#### Background
Profile and loyalty data must be created atomically with user registration to ensure data consistency and prevent null reference errors throughout the application.

#### Value Proposition
- Guaranteed data consistency
- No orphaned user accounts
- Immediate access to all features
- Simplified user onboarding

#### Acceptance Criteria

**Scenario 1: Profile Creation on Registration**
```gherkin
Given a new user completes registration with email "newuser@example.com"
When the user's auth account is created
Then a profile record should be automatically inserted into the profiles table
And the profile should include:
  | Field | Source |
  | user_id | auth.users.id |
  | email | auth.users.email |
  | first_name | user_metadata.first_name |
  | last_name | user_metadata.last_name |
  | birthday | user_metadata.birthdate |
  | mobile_number | user_metadata.mobile_number |
  | country_code | user_metadata.country_code |
And a user_rewards record should be created with:
  | Field | Value |
  | user_id | auth.users.id |
  | total_points | 0 |
  | available_points | 0 |
  | referral_code | {generated 8-char code} |
And if a referral code was used, it should be stored in referred_by
```

**Scenario 2: Profile Creation Failure Rollback**
```gherkin
Given a new user attempts to register
When the auth user creation succeeds
But the profile creation fails
Then the auth user should be rolled back (if possible)
Or the user should be flagged for manual profile creation
And an error should be logged for admin review
```

#### Technical Requirements

**Database Trigger:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, first_name, last_name, email, ...)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    ...
  );
  
  -- Insert into user_rewards table
  INSERT INTO public.user_rewards (user_id, total_points, available_points)
  VALUES (NEW.id, 0, 0);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

### US-AUTH.6: Email Validation Service Integration

**As the** system  
**I want to** validate email addresses before sending OTP codes  
**So that** I can prevent typos, reduce bounce rates, and improve deliverability

#### Story Points: 3
#### Priority: P2 - Medium

#### Background
Email validation before OTP generation reduces wasted resources, improves deliverability metrics, and provides better user experience by catching typos early.

#### Value Proposition
- Reduced email bounce rates
- Better sender reputation
- Immediate feedback on typos
- Cost savings on email sending

#### Acceptance Criteria

**Scenario 1: Valid Email Validation**
```gherkin
Given I am registering or signing in
When I enter a valid email "user@example.com"
And the system validates the email before sending OTP
Then the email validation should pass
And the OTP code should be sent
```

**Scenario 2: Invalid Email Format**
```gherkin
Given I enter an email with invalid format "user@"
When the system validates the email
Then validation should fail immediately (client-side)
And I should see an error "Please enter a valid email address"
And no API call should be made
```

**Scenario 3: Disposable Email Detection**
```gherkin
Given I enter a disposable email address "user@tempmail.com"
When the system validates the email
Then validation should warn or reject the email
And I should see a message suggesting a permanent email address
```

#### Technical Requirements

**Validation Layers:**
1. Client-side: HTML5 email input validation
2. Client-side: Regex validation for format
3. Server-side: Email validation service (optional)
4. Server-side: Disposable email blacklist (optional)

**Edge Function:**
- `supabase/functions/validate-email/index.ts` - Email validation endpoint

---

### US-AUTH.7: Session Persistence and Management

**As a** user  
**I want my** session to persist across browser tabs and page refreshes  
**So that** I don't have to sign in repeatedly during normal usage

#### Story Points: 5
#### Priority: P0 - Critical

#### Background
Proper session management is critical for user experience. Users expect to remain signed in unless they explicitly sign out or their session expires.

#### Value Proposition
- Seamless multi-tab experience
- Reduced authentication friction
- Improved user satisfaction
- Secure session handling

#### Acceptance Criteria

**Scenario 1: Session Persistence Across Tabs**
```gherkin
Given I am signed in on Tab 1
When I open the application in Tab 2
Then I should be automatically authenticated in Tab 2
And my user information should be available
And both tabs should share the same session
```

**Scenario 2: Session Persistence After Refresh**
```gherkin
Given I am signed in
When I refresh the page
Then I should remain signed in
And my session should be restored
And I should not see the sign-in page
```

**Scenario 3: Session Expiration**
```gherkin
Given I am signed in
And I have been inactive for the session timeout period
When I attempt to perform an authenticated action
Then my session should be expired
And I should be redirected to the sign-in page
And I should see a message "Your session has expired. Please sign in again."
```

**Scenario 4: Cross-Tab Sign-Out**
```gherkin
Given I am signed in on multiple tabs
When I sign out from one tab
Then all other tabs should detect the sign-out
And all tabs should redirect to the sign-in page
And all session data should be cleared
```

**Scenario 5: Automatic Session Refresh**
```gherkin
Given I am signed in with a valid refresh token
When my access token expires
Then the system should automatically refresh the access token
And I should remain authenticated without interruption
And I should not be prompted to sign in again
```

#### Technical Requirements

**Session Storage:**
- Supabase Auth stores session in localStorage
- Key: `supabase.auth.token`
- Demo sessions in separate key: `demo-session`

**Session Monitoring:**
```typescript
// From useAuthState.ts
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    setSession(session);
    setUser(session?.user ?? null);
  }
  if (event === 'SIGNED_OUT') {
    clearAuthState();
  }
  if (event === 'TOKEN_REFRESHED') {
    setSession(session);
  }
});
```

**Security:**
- Access tokens expire after 1 hour (default)
- Refresh tokens used for silent renewal
- Sign-out clears all tokens and localStorage
- HTTPS required for all session management

---

## Non-Functional Requirements

### Performance
- OTP email delivery within 30 seconds (95th percentile)
- OTP verification response time < 500ms
- Session restoration time < 200ms
- Page load time with authentication check < 1 second

### Security
- OTP codes cryptographically random (6 digits)
- HTTPS required for all authentication endpoints
- Rate limiting: Max 5 OTP requests per email per hour
- Session tokens securely stored in httpOnly cookies (when possible)
- No sensitive data logged to console in production
- Password complexity requirements enforced
- Account lockout after 5 failed verification attempts

### Usability
- Clear error messages for all failure scenarios
- OTP input with auto-focus and auto-advance between digits
- Visual countdown timer for OTP expiration
- "Resend code" available after initial send
- Mobile-responsive authentication forms
- Accessible form labels and error announcements

### Reliability
- OTP delivery retry mechanism (up to 3 attempts)
- Graceful degradation to demo mode if email service fails
- Session recovery after temporary network issues
- Database trigger ensures profile creation consistency

### Compliance
- GDPR: User consent for data collection during registration
- CCPA: Privacy policy link on registration page
- CAN-SPAM: Transactional emails comply with regulations
- Age verification: Birthdate required, minimum age 21

---

## API Specifications

### Send OTP Endpoint

**Endpoint:** `POST /functions/v1/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "signup" | "signin"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Response (400/500):**
```json
{
  "error": "Email and type are required"
}
```

---

### Verify OTP Endpoint

**Endpoint:** `POST /functions/v1/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "type": "signup" | "signin",
  "additionalData": {
    "firstName": "John",
    "lastName": "Doe",
    "birthdate": "1995-01-15",
    "mobileNumber": "+15551234567",
    "countryCode": "US",
    "cityId": "uuid",
    "venueId": "uuid",
    "joinRewards": true,
    "referralCode": "ABC12345"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": { /* user object */ },
  "authUrl": "https://..."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "This email is already registered. Please try signing in instead.",
  "errorCode": "EMAIL_EXISTS"
}
```

---

## Testing Requirements

### Unit Tests
- OTP code generation produces 6-digit numbers
- Email format validation logic
- Demo session creation and restoration
- Profile creation trigger execution

### Integration Tests
- Complete registration flow (email → OTP → account creation)
- Complete sign-in flow (email → OTP → session)
- Password reset flow
- Session persistence across page loads
- Cross-tab session synchronization

### End-to-End Tests
- User can register with all optional fields
- User can register with minimal fields
- User receives OTP email within 30 seconds
- User can sign in after registration
- User session persists after refresh
- User can sign out and sign back in

### Security Tests
- OTP codes expire after 10 minutes
- Used OTP codes cannot be reused
- Rate limiting prevents OTP spam
- Demo sessions don't have production database access
- Session tokens properly invalidated on sign-out

---

## Planned Enhancements (Not Yet Implemented)

---

### US-AUTH.11: Passkey Authentication

**Implementation Status:** ❌ NOT IMPLEMENTED  
**As a** user  
**I want to** use passkey (WebAuthn) authentication for sign-in  
**So that** I can securely authenticate using biometric sensors or security keys without passwords

#### Story Points: 13
#### Priority: P2 - Medium

#### Background
Passkeys leverage WebAuthn standard for secure, phishing-resistant authentication using device biometrics (fingerprint, Face ID) or hardware security keys. This provides the highest level of security while maintaining excellent user experience.

#### Value Proposition
- Phishing-resistant authentication
- No passwords to remember or manage
- Fast biometric authentication
- Cross-device passkey syncing (via platform providers)
- Industry-standard security (FIDO2/WebAuthn)

#### Acceptance Criteria

**Scenario 1: Register Passkey During Sign-Up**
```gherkin
Given I am completing user registration
And my device supports WebAuthn
When I reach the "Setup Security" step
And I click "Register Passkey"
Then my browser should prompt for biometric authentication
When I authenticate with my fingerprint or Face ID
Then a passkey should be registered to my account
And I should see a confirmation "Passkey registered successfully"
And I should be able to use this passkey for future sign-ins
```

**Scenario 2: Sign In with Passkey**
```gherkin
Given I have a passkey registered for my account
And I am on the sign-in page
When I enter my email "user@example.com"
And I click "Sign In with Passkey"
Then my browser should prompt for biometric authentication
When I authenticate with my fingerprint or Face ID
Then I should be signed in immediately
And I should be redirected to the home page
And no OTP code should be required
```

**Scenario 3: Fallback to OTP When Passkey Unavailable**
```gherkin
Given I have a passkey registered
And I am on a device without my passkey
When I attempt to sign in with my email
Then I should see an option to "Use Email Code Instead"
When I click "Use Email Code Instead"
Then the standard OTP flow should be available
And I should be able to sign in with an email verification code
```

**Scenario 4: Manage Multiple Passkeys**
```gherkin
Given I am signed in to my account
And I navigate to "Security Settings"
When I view my registered passkeys
Then I should see a list of all registered passkeys with:
  | Field | Example |
  | Device Name | "iPhone 15 Pro" |
  | Registration Date | "Nov 15, 2024" |
  | Last Used | "2 hours ago" |
When I click "Add New Passkey"
Then I should be able to register a passkey for another device
When I click "Remove" on a passkey
Then that passkey should be revoked
And I should no longer be able to use it for authentication
```

**Scenario 5: Device Does Not Support Passkeys**
```gherkin
Given I am on a device that does not support WebAuthn
When I view authentication options
Then the passkey option should not be displayed
And I should only see email/OTP authentication options
```

#### Technical Requirements

**Frontend:**
- WebAuthn API integration (`navigator.credentials.create()`, `navigator.credentials.get()`)
- Passkey registration flow in Security Settings
- Passkey management UI
- Browser compatibility detection

**Backend:**
- Database table for storing passkey credentials (challenge, public key, counter)
- Edge Function: `register-passkey` - Handles credential registration
- Edge Function: `authenticate-passkey` - Verifies passkey authentication
- Supabase Auth integration for session creation after passkey verification

**Security:**
- Attestation verification for passkey registration
- Challenge-response protocol for authentication
- Counter verification to prevent replay attacks
- Credential public key storage (never store private keys)

---

### US-AUTH.12: SMS/Phone OTP Authentication

**Implementation Status:** ❌ NOT IMPLEMENTED  
**As a** user  
**I want to** sign in using my phone number and receive OTP codes via SMS  
**So that** I can authenticate quickly using my mobile device

#### Story Points: 8
#### Priority: P2 - Medium

#### Background
SMS-based OTP authentication provides an alternative to email, particularly useful for users who prefer mobile-first experiences or may not have reliable email access.

#### Value Proposition
- Mobile-first authentication option
- Faster delivery than email (typically 5-10 seconds)
- Familiar authentication method
- International phone number support
- Reduces email dependency

#### Acceptance Criteria

**Scenario 1: Register with Phone Number**
```gherkin
Given I am on the registration page
When I select "Sign Up with Phone"
And I enter my phone number "+1 (555) 123-4567"
And I complete the registration form
And I click "Send Verification Code"
Then I should receive a 6-digit OTP code via SMS within 10 seconds
And I should see the OTP input form
When I enter the correct SMS code
Then my account should be created
And my phone number should be verified
```

**Scenario 2: Sign In with Phone Number**
```gherkin
Given I have an account registered with phone number "+1 (555) 123-4567"
And I am on the sign-in page
When I select "Sign In with Phone"
And I enter my phone number
And I click "Send Code"
Then I should receive a 6-digit SMS code within 10 seconds
When I enter the correct code
Then I should be signed in to my account
```

**Scenario 3: International Phone Number Support**
```gherkin
Given I am registering with an international phone number
When I select my country code from the dropdown
And I enter my phone number "20 1234567890" (Egypt)
Then the phone number should be formatted according to country rules
And the SMS should be sent to the correct international number
And I should receive the SMS code successfully
```

**Scenario 4: Phone Number Already Registered**
```gherkin
Given an account exists with phone number "+1 (555) 123-4567"
When I attempt to register with the same phone number
And I verify the SMS code
Then I should see an error "This phone number is already registered"
And I should be prompted to sign in instead
```

**Scenario 5: SMS Delivery Failure**
```gherkin
Given I request an SMS code
And the SMS delivery fails
Then I should see an error message "Unable to send SMS. Please try again or use email instead."
And I should have the option to switch to email authentication
```

#### Technical Requirements

**Frontend:**
- Phone number input component with country code selector
- Phone number formatting and validation
- SMS code input (6-digit)
- Switch between email and phone authentication

**Backend:**
- Twilio SMS API integration
- Edge Function: `send-sms-otp` - Sends SMS codes
- Edge Function: `verify-sms-otp` - Verifies SMS codes
- Database: Add `phone_number` field to profiles table
- Database: Add SMS codes to `otp_codes` table with type 'sms'

**Security:**
- Rate limiting: Max 3 SMS per phone number per hour
- Phone number verification before account linking
- Prevent SMS pumping attacks
- Store phone numbers in E.164 format

**Cost Considerations:**
- SMS delivery costs per message
- International SMS pricing varies by country
- Implement SMS delivery monitoring and alerts

---

### US-AUTH.13: Social OAuth Authentication

**Implementation Status:** ❌ NOT IMPLEMENTED  
**As a** user  
**I want to** sign in using my social media accounts (Google, Apple, Facebook)  
**So that** I can quickly register and sign in without creating a new password

#### Story Points: 13
#### Priority: P2 - Medium

#### Background
Social OAuth authentication reduces friction by allowing users to leverage existing trusted accounts. This is particularly effective for increasing conversion rates during onboarding.

#### Value Proposition
- Frictionless registration (no form filling)
- Trusted authentication providers
- Auto-populated profile data
- Single sign-on experience
- Higher conversion rates

#### Acceptance Criteria

**Scenario 1: Sign Up with Google**
```gherkin
Given I am on the registration page
When I click "Continue with Google"
Then I should be redirected to Google's OAuth consent page
When I select my Google account and grant permissions
Then I should be redirected back to the application
And my account should be created automatically
And my profile should be populated with Google account data:
  | Field | Source |
  | email | Google account email |
  | first_name | Google first name |
  | last_name | Google last name |
  | avatar_url | Google profile picture |
And I should be signed in
And I should be redirected to the home page
```

**Scenario 2: Sign In with Apple**
```gherkin
Given I have an existing account linked to my Apple ID
And I am on the sign-in page
When I click "Sign in with Apple"
Then I should see Apple's authentication prompt
When I authenticate with Face ID or Touch ID
Then I should be signed in to my account
And I should be redirected to the home page
And no OTP or password should be required
```

**Scenario 3: Sign Up with Facebook**
```gherkin
Given I am on the registration page
When I click "Continue with Facebook"
Then I should be redirected to Facebook's OAuth page
When I log in to Facebook and approve the permissions
Then I should be redirected back to the application
And my account should be created
And my profile should include my Facebook display name and email
```

**Scenario 4: Account Already Exists with OAuth Email**
```gherkin
Given I have an existing account with email "user@gmail.com"
And my account was created via email/OTP
When I attempt to sign in using "Continue with Google" with the same email
Then the system should recognize the existing account
And I should be signed in to my existing account
And my Google account should be linked to my profile
And I should see a message "Google account linked successfully"
```

**Scenario 5: OAuth Provider Denies Access**
```gherkin
Given I am attempting to sign in with Google
When I click "Continue with Google"
And I deny the permission request on Google's consent page
Then I should be redirected back to the sign-in page
And I should see a message "Google sign-in was cancelled"
And I should still have the option to sign in with email/OTP
```

**Scenario 6: Profile Data Sync from OAuth Provider**
```gherkin
Given I have signed in with Google
And my Google account has a profile picture and name
When my account is created
Then my profile picture should be downloaded and stored
And my first name and last name should be populated from Google
And my email should be marked as verified
```

#### Technical Requirements

**Frontend:**
- OAuth button components for Google, Apple, Facebook
- OAuth redirect handling
- Account linking UI in profile settings
- Error handling for OAuth failures

**Backend:**
- Supabase Auth OAuth provider configuration
- Edge Function: `link-oauth-account` - Links OAuth provider to existing account
- Database: `auth.identities` table (managed by Supabase)
- Profile data sync from OAuth providers

**OAuth Providers:**
- **Google OAuth 2.0**: Client ID, Client Secret, Redirect URI
- **Apple Sign In**: Service ID, Team ID, Key ID, Private Key
- **Facebook Login**: App ID, App Secret, Redirect URI

**Security:**
- OAuth state parameter to prevent CSRF attacks
- Nonce verification for OpenID Connect
- Token validation before account creation
- Secure redirect URI validation

**Data Mapping:**
```typescript
// Google OAuth data mapping
{
  email: google.email,
  first_name: google.given_name,
  last_name: google.family_name,
  avatar_url: google.picture,
  email_verified: google.email_verified
}

// Apple OAuth data mapping
{
  email: apple.email,
  first_name: apple.name?.firstName,
  last_name: apple.name?.lastName,
  email_verified: true // Apple always verifies
}

// Facebook OAuth data mapping
{
  email: facebook.email,
  first_name: facebook.first_name,
  last_name: facebook.last_name,
  avatar_url: facebook.picture?.data?.url
}
```

#### Acceptance Criteria

**Scenario 1: Sign Up with Google**
```gherkin
Given I am on the registration page
When I click "Continue with Google"
Then I should be redirected to Google's OAuth consent screen
When I select my Google account and grant permissions
Then I should be redirected back to the Pours Consumer app
And a new account should be created with my Google email
And my profile should be populated with:
  | Field | Source |
  | Email | Google account email |
  | First Name | Google account first name |
  | Last Name | Google account last name |
  | Avatar | Google profile picture |
And I should be automatically signed in
And I should be redirected to the home page
```

**Scenario 2: Sign In with Existing Apple Account**
```gherkin
Given I have previously registered using "Sign in with Apple"
And I am on the sign-in page
When I click "Continue with Apple"
Then I should be redirected to Apple's authentication page
When I authenticate with Face ID or Apple ID password
Then I should be signed in to my existing account
And I should be redirected to the home page
```

**Scenario 3: Sign Up with Facebook**
```gherkin
Given I am on the registration page
When I click "Continue with Facebook"
Then I should be redirected to Facebook's OAuth consent page
When I log in to Facebook and approve the requested permissions
Then I should be redirected back to the application
And a new account should be created
And my profile should be populated with Facebook data:
  | Field | Source |
  | Email | Facebook email |
  | First Name | Facebook first name |
  | Last Name | Facebook last name |
  | Avatar | Facebook profile picture |
And I should be automatically signed in
```

**Scenario 4: Link Social Account to Existing Email Account**
```gherkin
Given I have an existing account with email "user@example.com"
And I am signed in
When I navigate to "Account Settings" > "Connected Accounts"
And I click "Connect Google Account"
Then I should authenticate with Google
And my Google account should be linked to my Pours Consumer account
And I should see "Google account connected successfully"
And I should be able to sign in using Google in the future
```

**Scenario 5: OAuth Provider Email Already Registered**
```gherkin
Given an account exists with email "user@example.com"
And this account was created with email/OTP authentication
When I attempt to sign up with Google using the same email
Then the system should recognize the existing account
And I should be prompted: "An account with this email already exists. Would you like to link your Google account?"
When I confirm linking
Then my Google account should be linked to the existing account
And I should be signed in
```

**Scenario 6: Handle OAuth Cancellation**
```gherkin
Given I am on the sign-in page
When I click "Continue with Facebook"
And I am redirected to Facebook
And I click "Cancel" on Facebook's consent screen
Then I should be redirected back to the sign-in page
And I should see a message "Sign-in cancelled"
And I should be able to try again or use a different method
```

**Scenario 7: Sign In with Apple "Hide My Email"**
```gherkin
Given I am signing up with Apple
When I choose "Hide My Email" on Apple's consent screen
Then Apple should generate a proxy email (e.g., "abc123@privaterelay.appleid.com")
And my account should be created with the proxy email
And emails sent to the proxy should be forwarded to my real email
And I should be able to sign in normally
```

**Scenario 8: OAuth Permission Scope Changes**
```gherkin
Given I previously granted limited permissions to Google OAuth
When I sign in again using Google
And Google requests additional permissions
Then I should see the updated permission request
When I grant the new permissions
Then the additional profile data should be synced to my account
```

#### Technical Requirements

**Frontend:**
- OAuth provider buttons (Google, Apple, Facebook)
- Redirect handling after OAuth flow
- Account linking UI in settings
- Error handling for OAuth failures

**Backend:**
- Supabase Auth OAuth configuration for each provider
- OAuth app registration with Google, Apple, Facebook
- Callback URL handling
- Account linking logic
- Edge Function: `link-oauth-account` - Links social accounts

**OAuth Provider Setup:**
- **Google**: Google Cloud Console OAuth 2.0 Client
- **Apple**: Apple Developer Sign in with Apple configuration
- **Facebook**: Facebook App OAuth settings

**Database:**
- Store OAuth provider and provider user ID in auth.identities
- Supabase Auth handles multiple identities per user

**Security:**
- PKCE flow for OAuth 2.0
- Verify OAuth state parameter
- Validate OAuth tokens server-side
- Secure storage of OAuth tokens

---

### US-AUTH.14: Unified Authentication UI

**Implementation Status:** ❌ NOT IMPLEMENTED  
**As a** user  
**I want to** see all authentication options in a single, intuitive interface  
**So that** I can easily choose my preferred sign-in method

#### Story Points: 5
#### Priority: P3 - Low

#### Background
With multiple authentication methods (email OTP, passkeys, SMS, OAuth), a unified UI is essential to prevent user confusion and provide a cohesive experience.

#### Value Proposition
- Reduced cognitive load
- Clear authentication method selection
- Consistent user experience
- Easy method switching
- Professional appearance

#### Acceptance Criteria

**Scenario 1: View All Authentication Options**
```gherkin
Given I am on the sign-in page
Then I should see the following authentication options clearly displayed:
  | Option | Visual |
  | Email OTP | Email icon + "Continue with Email" |
  | Phone SMS | Phone icon + "Continue with Phone" |
  | Passkey | Key icon + "Sign in with Passkey" |
  | Google OAuth | Google logo + "Continue with Google" |
  | Apple OAuth | Apple logo + "Continue with Apple" |
  | Facebook OAuth | Facebook logo + "Continue with Facebook" |
And each option should be equally prominent
And the most popular method should be suggested but not forced
```

**Scenario 2: Switch Authentication Methods**
```gherkin
Given I have started sign-in with "Email OTP"
And I am on the OTP verification screen
When I click "Use a different method"
Then I should return to the authentication method selection screen
And I should be able to choose any other method
And my previous OTP request should be cancelled
```

**Scenario 3: Remember Last Used Method**
```gherkin
Given I last signed in using "Google OAuth"
When I return to the sign-in page
Then "Google OAuth" should be visually highlighted as "Last used"
But I should still have easy access to all other methods
```

**Scenario 4: Responsive Layout**
```gherkin
Given I am viewing the authentication page on mobile
Then all authentication options should be displayed vertically
And each button should be easily tappable (min 44px height)
And the layout should adapt to small screens gracefully
```

**Scenario 5: Accessibility**
```gherkin
Given I am using a screen reader
When I navigate the authentication page
Then each authentication option should be announced clearly
And I should be able to navigate using keyboard only
And focus states should be clearly visible
And all buttons should have descriptive aria-labels
```

#### Technical Requirements

**Frontend:**
- Unified authentication page component
- Authentication method selector
- Responsive design for all screen sizes
- Accessibility features (WCAG 2.1 AA)
- Loading states for each method
- Error message handling

**Design System:**
- Consistent button styles for all OAuth providers
- Clear visual hierarchy
- Brand color integration
- Icon set for all authentication methods

**User Experience:**
- Progressive disclosure (show method details on hover/focus)
- Clear call-to-action
- "Continue as Guest" option remains visible
- Help text for each method

---

### US-AUTH.15: Account Linking and Management

**Implementation Status:** ❌ NOT IMPLEMENTED  
**As a** user  
**I want to** link multiple authentication methods to my account  
**So that** I can sign in using whichever method is most convenient

#### Story Points: 8
#### Priority: P3 - Low

#### Background
Users often have multiple preferred authentication methods depending on context (e.g., passkey on personal device, SMS when traveling, OAuth at work). Account linking enables flexibility while maintaining single user identity.

#### Value Proposition
- Authentication flexibility
- Seamless multi-device experience
- Account recovery options
- Reduced account duplication
- Enhanced security (multiple factors)

#### Acceptance Criteria

**Scenario 1: Link Additional Authentication Methods**
```gherkin
Given I am signed in with email "user@example.com"
And I navigate to "Security Settings" > "Sign-In Methods"
Then I should see my current authentication methods:
  | Method | Status |
  | Email OTP | Active (Primary) |
When I click "Add Sign-In Method"
Then I should see available methods to add:
  - Phone Number
  - Passkey
  - Google Account
  - Apple Account
  - Facebook Account
When I select "Phone Number" and complete verification
Then my phone should be added as an alternative sign-in method
And I should be able to use either email or phone to sign in
```

**Scenario 2: Set Primary Authentication Method**
```gherkin
Given I have multiple sign-in methods linked:
  - Email (Primary)
  - Phone
  - Google
When I click "Set as Primary" next to "Phone"
Then phone should become my primary authentication method
And I should see a confirmation "Primary sign-in method updated"
And the sign-in page should remember this preference
```

**Scenario 3: Remove Linked Authentication Method**
```gherkin
Given I have 3 sign-in methods linked
When I click "Remove" next to one of my secondary methods
Then I should see a confirmation dialog "Are you sure? You'll no longer be able to sign in using this method."
When I confirm removal
Then that method should be unlinked from my account
But I should not be able to remove my last remaining method
And I should see an error if I try: "You must have at least one sign-in method"
```

**Scenario 4: Merge Duplicate Accounts**
```gherkin
Given I have two accounts:
  - Account A: registered with "user@example.com" (email)
  - Account B: registered with Google OAuth using "user@example.com"
And I sign in to Account A
When I attempt to link my Google account
Then the system should detect Account B with the same email
And I should see: "We found another account with this Google email. Would you like to merge the accounts?"
When I confirm the merge
Then all data from Account B should be migrated to Account A
And Account B should be deactivated
And I should be able to sign in with either email or Google
```

**Scenario 5: Account Linking Email Verification**
```gherkin
Given I am signed in with a phone number
When I attempt to link an email address
Then I should receive a verification email
And I should need to verify the email before it's linked
And unverified emails should be marked as "Pending Verification"
When I verify the email
Then it should become an active sign-in method
```

#### Technical Requirements

**Frontend:**
- Account linking UI in Security Settings
- Method management interface (add, remove, set primary)
- Verification flows for each method type
- Confirmation dialogs for critical actions

**Backend:**
- Database table: `user_auth_methods` - Tracks all linked authentication methods
- Edge Function: `link-auth-method` - Links new methods
- Edge Function: `unlink-auth-method` - Removes linked methods
- Edge Function: `merge-accounts` - Handles account merging
- Account merge logic (data migration, rewards consolidation)

**Database Schema:**
```sql
CREATE TABLE user_auth_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  method_type TEXT NOT NULL, -- 'email', 'phone', 'passkey', 'oauth_google', etc.
  identifier TEXT NOT NULL, -- email, phone number, oauth provider ID
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);
```

---

### US-AUTH.16: Authentication Analytics and Monitoring

**Implementation Status:** ❌ NOT IMPLEMENTED  
**As an** administrator  
**I want to** monitor authentication metrics and user behavior  
**So that** I can optimize authentication flows and detect security issues

#### Story Points: 5
#### Priority: P3 - Low

#### Background
Authentication analytics provide insights into user behavior, conversion rates, security threats, and system performance. This data is critical for optimization and security monitoring.

#### Value Proposition
- Data-driven authentication improvements
- Security threat detection
- Conversion funnel optimization
- Performance monitoring
- User behavior insights

#### Acceptance Criteria

**Scenario 1: View Authentication Dashboard**
```gherkin
Given I am an administrator
When I navigate to the Authentication Analytics dashboard
Then I should see the following metrics for the selected time period:
  | Metric | Description |
  | Total Sign-Ins | Number of successful authentications |
  | New Registrations | Number of new accounts created |
  | Authentication Method Breakdown | % using email, phone, passkey, OAuth |
  | Success Rate | % of authentication attempts that succeed |
  | Average Time to Complete | Time from start to successful auth |
  | Failed Attempts | Number and reasons for failures |
  | OTP Delivery Time | Average email/SMS delivery time |
And I should be able to filter by date range, authentication method, and user segment
```

**Scenario 2: Monitor Failed Authentication Attempts**
```gherkin
Given I am viewing the analytics dashboard
When I navigate to "Failed Attempts"
Then I should see a breakdown of failure reasons:
  - Invalid OTP code (%)
  - Expired OTP code (%)
  - Rate limit exceeded (%)
  - Invalid email format (%)
  - Cancelled OAuth flow (%)
And I should see trends over time
And I should receive alerts for unusual spikes in failures
```

**Scenario 3: Track Authentication Method Adoption**
```gherkin
Given I am viewing authentication analytics
When I view "Method Adoption Trends"
Then I should see a timeline showing:
  - New users by authentication method
  - Existing users adopting new methods (e.g., passkeys)
  - Method switching patterns
And I should be able to compare adoption rates before and after UI changes
```

**Scenario 4: Security Monitoring**
```gherkin
Given I am viewing security analytics
Then I should see:
  - Suspicious sign-in attempts (unusual locations, devices)
  - Accounts with multiple failed authentications
  - Rate limiting triggers
  - OTP code reuse attempts
  - Account takeover attempts
And I should be able to export security logs for investigation
And I should receive real-time alerts for critical security events
```

**Scenario 5: Conversion Funnel Analysis**
```gherkin
Given I am viewing registration funnel analytics
Then I should see conversion rates for each step:
  1. Started registration (100%)
  2. Completed form (%)
  3. Received OTP (%)
  4. Verified OTP (%)
  5. Account created (%)
And I should see drop-off points
And I should be able to A/B test authentication flows
And I should see recommendations for improvement
```

#### Technical Requirements

**Frontend:**
- Analytics dashboard (admin-only)
- Charts and visualizations
- Date range filtering
- Export functionality

**Backend:**
- Database table: `auth_events` - Logs all authentication events
- Database table: `auth_analytics` - Aggregated metrics
- Edge Function: `log-auth-event` - Records auth events
- Edge Function: `generate-auth-report` - Creates analytics reports
- Scheduled job: Aggregate daily auth metrics

**Database Schema:**
```sql
CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  event_type TEXT NOT NULL, -- 'registration_started', 'otp_sent', 'otp_verified', 'sign_in_success', 'sign_in_failed'
  auth_method TEXT NOT NULL, -- 'email_otp', 'sms_otp', 'passkey', 'oauth_google', etc.
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  location_country TEXT,
  location_city TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE auth_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  segment TEXT, -- 'all', 'email_otp', 'mobile', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Analytics Metrics to Track:**
- Registration started count
- Registration completed count
- Registration abandonment rate
- OTP delivery time (p50, p95, p99)
- OTP verification success rate
- Sign-in success rate by method
- Average authentication time
- Failed attempt rate
- Account linking rate
- Method switching frequency

---

## Known Limitations of Current Implementation

- Demo sessions don't sync with database
- No SMS-based authentication yet
- Limited account recovery options
- No OAuth provider integration yet
- No passkey/WebAuthn support yet
- No unified authentication UI
- No account linking or merging capability
- Limited authentication analytics

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial documentation based on implemented authentication system |
| 2.0 | 2025-11-22 | Product Team | Added planned enhancement user stories: US-AUTH.11 (Passkey), US-AUTH.12 (SMS OTP), US-AUTH.13 (Social OAuth), US-AUTH.14 (Unified UI), US-AUTH.15 (Account Linking), US-AUTH.16 (Analytics) with full Gherkin scenarios and implementation status |
| 3.0 | 2025-11-23 | Product Team | Completed comprehensive Gherkin scenarios for all planned enhancements (US-AUTH.11 through US-AUTH.16), added detailed acceptance criteria, technical requirements, and security considerations for each feature |

---

## References
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [WebAuthn Guide](https://webauthn.guide/)
- Codebase: `src/pages/Auth.tsx`, `src/hooks/useAuth*.ts`
- Edge Functions: `supabase/functions/send-otp/`, `supabase/functions/verify-otp/`
