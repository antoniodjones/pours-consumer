# Authentication Features - Product Requirements

**Document Version:** 1.0  
**Last Updated:** 2025-11-22  
**Epic:** EPIC-1: Core Authentication & User Management  
**Status:** ✅ Implemented  
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

## Open Issues & Future Enhancements

### Planned Enhancements
1. **US-AUTH.8**: Passkey Authentication (WebAuthn)
2. **US-AUTH.9**: SMS/Phone Number OTP Authentication
3. **US-AUTH.10**: Social OAuth (Google, Apple, Facebook)
4. **US-AUTH.11**: Multi-Factor Authentication (2FA)
5. **US-AUTH.12**: Biometric Authentication (Touch ID, Face ID)
6. **US-AUTH.13**: Account Linking (merge demo and real accounts)
7. **US-AUTH.14**: Authentication Analytics Dashboard
8. **US-AUTH.15**: Suspicious Login Detection

### Known Limitations
- Demo sessions don't sync with database
- Email validation service not yet integrated
- No SMS-based authentication yet
- Limited account recovery options
- No OAuth provider integration yet

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial documentation based on implemented authentication system |

---

## References
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [WebAuthn Guide](https://webauthn.guide/)
- Codebase: `src/pages/Auth.tsx`, `src/hooks/useAuth*.ts`
- Edge Functions: `supabase/functions/send-otp/`, `supabase/functions/verify-otp/`
