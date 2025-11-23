# Privacy & Compliance - Product Requirements

## Feature Overview

The Privacy & Compliance feature ensures the Pours Consumer app adheres to GDPR, CCPA, PII protection, PCI compliance, and SOX-2 standards. This feature provides users with control over their personal data, transparent privacy policies, cookie consent management, data export/deletion capabilities, and comprehensive security audit logging.

---

## Epic CNS-0020: Privacy & Compliance

**Description:**  
This epic encompasses all functionality required to meet international privacy regulations (GDPR, CCPA), protect personally identifiable information (PII), ensure payment card industry (PCI) compliance, and maintain SOX-2 audit standards. It includes user-facing privacy controls and administrative compliance monitoring tools.

**Business Value:**  
- Ensures legal compliance across jurisdictions (EU, California, etc.)
- Builds user trust through transparent data practices
- Reduces legal risk and potential fines
- Demonstrates commitment to data protection
- Enables secure handling of sensitive information
- Provides audit trail for compliance verification

**Regulatory Requirements:**
- **GDPR (EU):** Right to access, right to erasure, data portability, consent management
- **CCPA (California):** Right to know, right to delete, right to opt-out of data sale
- **PII Protection:** Secure storage and handling of personal information
- **PCI DSS:** Secure payment card data handling (via Stripe)
- **SOX-2:** Audit logging and access controls

---

## User Stories

### US-PRIVACY.1: Cookie Consent Management

**As a** Pours Consumer user  
**I want to** manage my cookie consent preferences  
**So that** I can control which cookies are stored on my device and how my data is used

**Background:**  
Under GDPR and CCPA, users must provide informed consent before non-essential cookies are stored. Users should be able to review, accept, reject, and modify their cookie preferences at any time.

**Value:**  
- Ensures legal compliance with cookie laws
- Provides transparency about data collection
- Gives users control over their privacy
- Reduces liability for non-compliant tracking

**Acceptance Criteria:**

```gherkin
Feature: Cookie Consent Management
  Epic: Privacy & Compliance (CNS-0020)

  Scenario: First-time visitor sees cookie consent banner
    Given I am a first-time visitor to the Pours Consumer app
    And I have not previously accepted or rejected cookies
    When the app loads
    Then I should see a cookie consent banner at the bottom of the screen
    And the banner should explain what cookies are used for
    And I should see options to:
      | Accept All Cookies |
      | Reject Non-Essential Cookies |
      | Customize Cookie Preferences |
    And the banner should not block critical app functionality

  Scenario: User accepts all cookies
    Given I see the cookie consent banner
    When I click "Accept All Cookies"
    Then all cookie categories should be enabled:
      | Essential (always enabled) |
      | Analytics |
      | Marketing |
      | Functional |
    And my consent should be stored in the database
    And the banner should be dismissed
    And analytics tracking should begin

  Scenario: User rejects non-essential cookies
    Given I see the cookie consent banner
    When I click "Reject Non-Essential Cookies"
    Then only essential cookies should be enabled
    And analytics and marketing cookies should be disabled
    And my rejection should be stored in the database
    And the banner should be dismissed
    And no tracking scripts should load

  Scenario: User customizes cookie preferences
    Given I see the cookie consent banner
    When I click "Customize Cookie Preferences"
    Then I should see a detailed cookie settings modal
    And I should see toggle switches for each cookie category:
      | Essential: Always On (disabled toggle) |
      | Analytics: Toggle |
      | Marketing: Toggle |
      | Functional: Toggle |
    And each category should have a description of its purpose
    And I should be able to save my custom preferences

  Scenario: User changes cookie preferences later
    Given I have previously set cookie preferences
    When I navigate to "Settings" > "Privacy" > "Cookie Preferences"
    Then I should see my current cookie settings
    And I should be able to modify any non-essential cookie category
    When I change a setting and save
    Then my new preferences should be stored
    And the appropriate cookies should be enabled/disabled immediately

  Scenario: Cookie consent expires after 12 months
    Given I accepted cookies 12 months ago
    When I visit the app
    Then I should see the cookie consent banner again
    And I should be prompted to renew my consent
    And my previous preferences should be pre-selected
```

**Technical Requirements:**  
- `user_consents` table with fields: `user_id`, `consent_type`, `granted`, `timestamp`, `ip_address`, `user_agent`
- Cookie categories: essential, analytics, marketing, functional
- Consent expiration: 12 months
- Client-side cookie management library
- Conditional loading of third-party scripts based on consent

**Acceptance Criteria:**  
- Cookie banner appears on first visit
- Users can accept, reject, or customize cookie preferences
- Consent choices are stored and enforced
- Non-essential cookies only load with explicit consent
- Consent expires after 12 months
- Users can modify preferences at any time

---

### US-PRIVACY.2: GDPR/CCPA Data Export

**As a** Pours Consumer user  
**I want to** export all my personal data in a machine-readable format  
**So that** I can exercise my right to data portability under GDPR/CCPA

**Background:**  
GDPR Article 20 and CCPA Section 1798.100 grant users the right to receive their personal data in a structured, commonly used, and machine-readable format. This enables data portability and transparency.

**Value:**  
- Ensures compliance with data portability regulations
- Builds user trust through transparency
- Enables users to move data to other services
- Demonstrates respect for user data ownership

**Acceptance Criteria:**

```gherkin
Feature: GDPR/CCPA Data Export
  Epic: Privacy & Compliance (CNS-0020)

  Scenario: User requests data export
    Given I am logged in as a Pours Consumer user
    When I navigate to "Settings" > "Privacy & Data" > "Export My Data"
    Then I should see an explanation of what data will be exported:
      | Profile information |
      | Order history |
      | Payment methods (last 4 digits only) |
      | Rewards and points |
      | Sobriety session data |
      | Cookie consents |
      | Buddy connections |
    And I should see a button "Request Data Export"

  Scenario: User initiates data export
    Given I am on the data export page
    When I click "Request Data Export"
    Then I should see a confirmation "Your data export request has been received"
    And I should see "We'll prepare your data and send you a download link via email"
    And a data export request should be created in the database
    And I should see the request status as "Processing"

  Scenario: Data export is prepared
    Given I have requested a data export
    When the system processes my request (within 30 days per GDPR)
    Then an export file should be generated in JSON format
    And the export should include all personal data:
      | profiles table data |
      | orders and order_items |
      | user_rewards data |
      | drinking_sessions and drink_records |
      | biometric_readings |
      | buddy_connections |
      | user_consents |
      | audit_logs for my user_id |
    And sensitive data should be included (emails, phone numbers)
    And payment card data should be masked (PCI compliance)

  Scenario: User receives data export email
    Given my data export has been prepared
    When the export is ready
    Then I should receive an email with subject "Your Pours+ Data Export is Ready"
    And the email should contain a secure download link
    And the download link should expire after 7 days
    And the email should explain the file format (JSON)

  Scenario: User downloads exported data
    Given I received the data export email
    When I click the download link
    Then I should be able to download a ZIP file
    And the ZIP should contain:
      | data.json (all personal data) |
      | README.txt (explanation of data structure) |
      | data_schema.json (JSON schema documentation) |
    And the JSON should be well-formatted and readable
    And all data should be complete and accurate

  Scenario: Multiple export requests within 30 days
    Given I requested a data export 10 days ago
    When I try to request another export
    Then I should see a message "You have a pending export request"
    And I should see the status of my existing request
    And I should not be able to submit a duplicate request
```

**Technical Requirements:**  
- `data_retention_requests` table: `id`, `user_id`, `request_type` (export/delete), `status`, `requested_at`, `completed_at`, `file_url`, `expires_at`
- Edge function to aggregate user data from all tables
- JSON export format with schema documentation
- Secure file storage in Supabase Storage bucket
- Signed URL generation for secure downloads (7-day expiration)
- Email notification system for export completion

**Acceptance Criteria:**  
- Users can request data export from settings
- Export includes all personal data in JSON format
- Export prepared within 30 days (GDPR requirement)
- Secure download link sent via email
- Download link expires after 7 days
- One export request per 30-day period

---

### US-PRIVACY.3: Right to be Forgotten - Data Deletion Request

**As a** Pours Consumer user  
**I want to** request permanent deletion of all my personal data  
**So that** I can exercise my right to erasure under GDPR/CCPA

**Background:**  
GDPR Article 17 and CCPA Section 1798.105 grant users the right to request deletion of their personal data. This must be completed within specific timeframes and requires careful handling of interconnected data.

**Value:**  
- Ensures compliance with right-to-erasure regulations
- Demonstrates respect for user privacy rights
- Reduces data storage and associated risks
- Builds user trust in data handling practices

**Acceptance Criteria:**

```gherkin
Feature: Right to be Forgotten - Data Deletion
  Epic: Privacy & Compliance (CNS-0020)

  Scenario: User initiates data deletion request
    Given I am logged in as a Pours Consumer user
    When I navigate to "Settings" > "Privacy & Data" > "Delete My Account & Data"
    Then I should see a serious warning message
    And the warning should explain:
      | This action is permanent and cannot be undone |
      | All personal data will be deleted within 30 days |
      | Order history, rewards points, and buddy connections will be lost |
      | Active subscriptions will be cancelled |
    And I should see a button "I Understand, Delete My Data"

  Scenario: User confirms data deletion request
    Given I am viewing the data deletion warning
    When I click "I Understand, Delete My Data"
    Then I should see a confirmation modal
    And I should be required to type "DELETE" to confirm
    When I type "DELETE" and click "Confirm Deletion"
    Then a data deletion request should be created
    And I should see "Your deletion request has been received"
    And I should receive a confirmation email

  Scenario: User receives deletion confirmation email
    Given I have submitted a data deletion request
    When the request is created
    Then I should receive an email with subject "Pours+ Account Deletion Request Received"
    And the email should explain:
      | Request will be processed within 30 days |
      | I can cancel the request within 7 days |
      | After 7 days, deletion cannot be cancelled |
    And the email should include a cancellation link

  Scenario: User cancels deletion request within grace period
    Given I submitted a deletion request 5 days ago
    And I received the confirmation email
    When I click the "Cancel Deletion Request" link in the email
    Then my deletion request should be cancelled
    And my account should remain active
    And I should see "Your deletion request has been cancelled"

  Scenario: Grace period expires, deletion proceeds
    Given I submitted a deletion request 8 days ago
    And I did not cancel it
    When the grace period expires (7 days)
    Then my deletion request status should change to "Processing"
    And I should receive an email "Your data will be deleted within 23 days"
    And I should no longer be able to cancel the request

  Scenario: Data deletion is executed
    Given my deletion request is 30 days old
    When the system processes the deletion
    Then the following data should be permanently deleted:
      | profiles table entry |
      | user_rewards data |
      | buddy_connections (both directions) |
      | drinking_sessions and drink_records |
      | biometric_readings |
      | user_biometrics |
      | user_consents |
      | abandoned_carts |
      | check_ins |
    And orders should be anonymized (user_id set to null, keep guest_email for legal records)
    And audit_logs should retain user_id for compliance (encrypted/hashed)
    And my auth.users entry should be deleted
    And I should receive a final confirmation email

  Scenario: Deleted user cannot log in
    Given my data has been deleted
    When I try to log in with my previous email
    Then I should see an error "This account does not exist"
    And I should be able to create a new account with the same email
```

**Technical Requirements:**  
- `data_retention_requests` table with `request_type = 'delete'`
- Grace period: 7 days for cancellation
- Total deletion timeframe: 30 days (GDPR compliance)
- Cascade deletion strategy for related data
- Order anonymization (not full deletion for legal/accounting records)
- Audit log retention with encrypted user_id (compliance requirement)
- Email notification at multiple stages

**Acceptance Criteria:**  
- Users can request account and data deletion
- 7-day grace period allows cancellation
- Deletion executed within 30 days of request
- All personal data permanently deleted
- Orders anonymized but retained for legal compliance
- Audit logs retained with encrypted identifiers
- Email confirmations sent at each stage

---

### US-PRIVACY.4: Security Audit Log Viewing

**As a** Pours Consumer user  
**I want to** view a log of all security-related events on my account  
**So that** I can monitor for unauthorized access and suspicious activity

**Background:**  
Transparency in account security activities builds user trust and enables users to detect unauthorized access. Audit logs should track login attempts, password changes, data exports, and other sensitive operations.

**Value:**  
- Enables users to detect unauthorized access
- Provides transparency in account security
- Supports incident investigation
- Demonstrates commitment to security

**Acceptance Criteria:**

```gherkin
Feature: Security Audit Log Viewing
  Epic: Privacy & Compliance (CNS-0020)

  Scenario: User views their security audit log
    Given I am logged in as a Pours Consumer user
    When I navigate to "Settings" > "Security" > "Activity Log"
    Then I should see a chronological list of security events
    And each event should display:
      | Event type (e.g., "Login", "Password Change") |
      | Timestamp |
      | IP address |
      | Device/browser information |
      | Location (city/country based on IP) |
      | Status (success/failed) |
    And the most recent events should appear first

  Scenario: Audit log shows various event types
    Given I am viewing my security audit log
    Then I should see events for:
      | Successful logins |
      | Failed login attempts |
      | Password changes |
      | Email changes |
      | Payment method additions/removals |
      | Data export requests |
      | Data deletion requests |
      | Privacy settings changes |
      | API key generations (if applicable) |

  Scenario: User identifies suspicious activity
    Given I see a login from an unfamiliar location
    When I click on the event
    Then I should see detailed information:
      | Full IP address |
      | Browser and OS |
      | Exact timestamp |
      | Location (city, region, country) |
    And I should have an option to "Report as Suspicious"
    And I should see a "Secure My Account" button

  Scenario: User reports suspicious activity
    Given I identified a suspicious login event
    When I click "Report as Suspicious"
    And I confirm my action
    Then the event should be flagged in the database
    And I should receive an email with security recommendations
    And I should be prompted to change my password
    And I should be offered to enable 2FA (if not already enabled)

  Scenario: User filters audit log by event type
    Given I am viewing my security audit log
    When I select filter "Login Events Only"
    Then I should see only login-related events
    And I should be able to filter by:
      | Event type |
      | Date range |
      | Success/failure status |
      | Device type |

  Scenario: User exports audit log for their records
    Given I am viewing my security audit log
    When I click "Export Log"
    Then I should be able to download the log as CSV
    And the export should include all filtered events
    And the export should include all event details
```

**Technical Requirements:**  
- `audit_logs` table: `id`, `user_id`, `event_type`, `event_data` (JSONB), `ip_address`, `user_agent`, `status`, `created_at`
- Automatic logging of security events
- IP geolocation for location identification
- RLS policies: users can only view their own logs
- Retention period: 90 days minimum (configurable)
- Export functionality (CSV format)

**Acceptance Criteria:**  
- All security events are automatically logged
- Users can view their complete audit log
- Events include timestamp, IP, device, location, status
- Users can filter and search audit logs
- Suspicious activity can be reported
- Audit log can be exported as CSV

---

### US-PRIVACY.5: Privacy Policy Page Display

**As a** Pours Consumer user  
**I want to** read the complete privacy policy  
**So that** I understand how my data is collected, used, and protected

**Background:**  
Legal requirement under GDPR, CCPA, and general privacy best practices. Privacy policy must be easily accessible, written in clear language, and updated regularly.

**Value:**  
- Ensures legal compliance with disclosure requirements
- Builds user trust through transparency
- Provides clear information about data practices
- Reduces support inquiries about privacy

**Acceptance Criteria:**

```gherkin
Feature: Privacy Policy Page Display
  Epic: Privacy & Compliance (CNS-0020)

  Scenario: User accesses privacy policy
    Given I am on the Pours Consumer app
    When I click "Privacy Policy" in the footer
    Then I should be taken to the privacy policy page
    And the policy should be clearly readable
    And the page should be accessible without login (public)

  Scenario: Privacy policy contains required sections
    Given I am viewing the privacy policy
    Then I should see the following sections:
      | Introduction |
      | Information We Collect |
      | How We Use Your Information |
      | Data Sharing and Disclosure |
      | Your Privacy Rights (GDPR/CCPA) |
      | Cookies and Tracking Technologies |
      | Data Security and Retention |
      | Children's Privacy (COPPA compliance) |
      | International Data Transfers |
      | Changes to This Policy |
      | Contact Information |
    And each section should be clearly labeled and organized

  Scenario: Privacy policy explains user rights
    Given I am viewing the privacy policy
    When I scroll to "Your Privacy Rights"
    Then I should see clear explanations of:
      | Right to access data (data export) |
      | Right to erasure (account deletion) |
      | Right to rectification (update profile) |
      | Right to restrict processing |
      | Right to data portability |
      | Right to object to processing |
      | Right to withdraw consent (cookie settings) |
    And each right should include a link to the relevant feature

  Scenario: Privacy policy is version-controlled
    Given the privacy policy is updated
    When I view the policy
    Then I should see the "Last Updated" date at the top
    And I should be able to view the previous version
    And significant changes should be highlighted

  Scenario: Privacy policy is mobile-friendly
    Given I am viewing the privacy policy on mobile
    Then the text should be easily readable
    And sections should be collapsible for easier navigation
    And I should be able to scroll smoothly
    And links should be easily tappable

  Scenario: User finds contact information for privacy inquiries
    Given I am viewing the privacy policy
    When I scroll to "Contact Information"
    Then I should see:
      | Data Protection Officer contact email |
      | Physical mailing address |
      | Privacy inquiry form link |
      | Expected response time (30 days) |
```

**Technical Requirements:**  
- Static page at `/privacy-policy` route
- Markdown or structured content for easy updates
- Version control for policy changes
- Public accessibility (no authentication required)
- Mobile-responsive design
- Internal links to relevant app features

**Acceptance Criteria:**  
- Privacy policy page is publicly accessible
- Contains all legally required sections
- Clearly explains user rights with links to features
- Shows last updated date
- Mobile-friendly and easy to navigate
- Includes contact information for privacy inquiries

---

### US-PRIVACY.6: Compliance Dashboard for Administrators

**As a** system administrator  
**I want to** view compliance metrics and data requests  
**So that** I can monitor regulatory compliance and respond to user requests

**Background:**  
Administrators need visibility into compliance status, pending data requests, audit logs, and consent statistics to ensure the platform meets regulatory requirements and responds to user requests in a timely manner.

**Value:**  
- Enables proactive compliance monitoring
- Ensures timely response to user data requests
- Provides audit trail for regulatory inspections
- Identifies compliance risks early

**Acceptance Criteria:**

```gherkin
Feature: Compliance Dashboard for Administrators
  Epic: Privacy & Compliance (CNS-0020)

  Scenario: Admin views compliance dashboard
    Given I am logged in as an administrator
    When I navigate to the compliance dashboard
    Then I should see the following metrics:
      | Total active users |
      | Total cookie consent rate |
      | Pending data export requests |
      | Pending data deletion requests |
      | Total audit log entries (last 30 days) |
      | Failed login attempts (last 24 hours) |

  Scenario: Admin reviews pending data export requests
    Given I am on the compliance dashboard
    When I click on "Pending Data Export Requests"
    Then I should see a list of all pending requests
    And each request should show:
      | User email |
      | Request date |
      | Days remaining to fulfill (30-day countdown) |
      | Current status |
    And I should be able to sort by request date
    And I should be able to filter by status

  Scenario: Admin processes data export request
    Given I see a pending data export request
    When I click "Process Request"
    Then the system should generate the export automatically
    And I should see the export file URL
    And I should be able to send the download link to the user
    And the request status should update to "Completed"

  Scenario: Admin reviews pending deletion requests
    Given I am on the compliance dashboard
    When I click on "Pending Deletion Requests"
    Then I should see all deletion requests by status:
      | Grace Period (cancellable) |
      | Pending Deletion (7+ days old) |
      | Completed |
    And each request should show days until deletion
    And I should see if user has cancelled any requests

  Scenario: Admin views consent statistics
    Given I am on the compliance dashboard
    When I view the "Cookie Consent Statistics" section
    Then I should see:
      | Total consents granted: X% |
      | Analytics cookies: X% acceptance |
      | Marketing cookies: X% acceptance |
      | Functional cookies: X% acceptance |
      | Consent trend graph (last 90 days) |

  Scenario: Admin reviews security audit logs
    Given I am on the compliance dashboard
    When I click "Security Audit Logs"
    Then I should see aggregated security events:
      | Failed login attempts (last 24 hours) |
      | Successful logins from new IPs |
      | Password change events |
      | Suspicious activity reports |
    And I should be able to drill down into specific users
    And I should be able to export logs for compliance reporting

  Scenario: Admin generates compliance report
    Given I am on the compliance dashboard
    When I click "Generate Compliance Report"
    And I select a date range
    Then I should receive a PDF report containing:
      | Summary of all data requests |
      | Consent statistics |
      | Security incident summary |
      | Response time metrics |
      | Regulatory compliance status |
    And the report should be suitable for regulatory audits
```

**Technical Requirements:**  
- Admin role verification (role-based access control)
- Aggregated queries for dashboard metrics
- Real-time status updates for data requests
- Automated export generation workflow
- PDF report generation
- Filtering and sorting capabilities
- RLS policies for admin-only access

**Acceptance Criteria:**  
- Only administrators can access compliance dashboard
- Dashboard shows real-time compliance metrics
- All pending data requests are visible with deadlines
- Admins can process requests and update statuses
- Consent statistics are accurate and up-to-date
- Security audit logs are accessible and exportable
- Compliance reports can be generated for audits

---

### US-PRIVACY.7: Data Retention Policies

**As a** Pours Consumer user  
**I want to** understand how long my data is retained  
**So that** I know when my information will be automatically deleted

**Background:**  
GDPR and CCPA require that personal data is not kept longer than necessary. Users should be informed about retention periods and have the option to request earlier deletion.

**Value:**  
- Ensures compliance with data minimization principles
- Reduces storage costs and security risks
- Provides transparency about data lifecycle
- Builds user trust in data handling

**Acceptance Criteria:**

```gherkin
Feature: Data Retention Policies
  Epic: Privacy & Compliance (CNS-0020)

  Scenario: User views data retention information
    Given I am logged in as a Pours Consumer user
    When I navigate to "Settings" > "Privacy & Data" > "Data Retention"
    Then I should see a table explaining retention periods:
      | Data Type | Retention Period | Reason |
      | Profile information | Until account deletion | Active user account |
      | Order history | 7 years | Legal/tax requirements |
      | Payment data | Per PCI DSS (via Stripe) | Compliance |
      | Sobriety session data | 2 years or until deletion | Health records |
      | Audit logs | 90 days | Security monitoring |
      | Cookie consents | 12 months | GDPR requirement |
      | Deleted account data | 30 days backup retention | Recovery period |

  Scenario: Inactive account data retention
    Given my account has been inactive for 3 years
    When the system runs data retention checks
    Then I should receive an email warning:
      | "Your account has been inactive for 3 years" |
      | "We'll delete your data in 30 days unless you log in" |
    And if I don't log in within 30 days
    Then my account and data should be automatically deleted
    And I should receive a final deletion confirmation email

  Scenario: Order data retention for legal compliance
    Given I deleted my account
    When the deletion is processed
    Then my order records should be anonymized but retained
    And my user_id should be removed from orders
    And guest_email should be retained for tax/legal purposes
    And order data should be retained for 7 years
    And after 7 years, order data should be permanently deleted

  Scenario: Backup data retention after deletion
    Given I requested account deletion
    And my data was deleted 15 days ago
    When I contact support requesting data recovery
    Then my data should still exist in backups (30-day retention)
    And I should be able to recover my account within 30 days
    And after 30 days, backup data should be permanently deleted

  Scenario: User requests early deletion before retention period ends
    Given I have order history from 3 years ago
    And the retention policy is 7 years
    When I submit a data deletion request
    Then I should see a warning:
      | "Some data must be retained for legal compliance" |
      | "Order data will be anonymized but kept for tax records" |
    And I should be able to proceed with deletion
    And personal identifiers should be removed while retaining legal records
```

**Technical Requirements:**  
- Automated data retention checks (scheduled job)
- Inactive account detection (3 years threshold)
- Automated deletion warnings (30-day notice)
- Backup retention policy (30 days)
- Order anonymization logic
- Legal retention periods per data type
- Data lifecycle documentation

**Acceptance Criteria:**  
- Retention periods clearly documented and communicated
- Inactive accounts automatically flagged and deleted
- Users warned 30 days before automatic deletion
- Order data anonymized but retained for legal compliance
- Backup data deleted after 30 days
- Users can view retention policies in settings

---

## Data Models

### New Database Tables

#### user_consents Table

```sql
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'cookies_essential', 'cookies_analytics', 'cookies_marketing', 'cookies_functional', 'terms_of_service', 'privacy_policy'
  granted BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- For cookie consents (12 months)
  
  UNIQUE(user_id, consent_type)
);

-- Indexes
CREATE INDEX idx_user_consents_user ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX idx_user_consents_expires ON public.user_consents(expires_at);

-- RLS Policies
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
ON public.user_consents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consents"
ON public.user_consents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
ON public.user_consents FOR UPDATE
USING (auth.uid() = user_id);
```

#### data_retention_requests Table

```sql
CREATE TABLE public.data_retention_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  grace_period_ends_at TIMESTAMP WITH TIME ZONE, -- For delete requests (7 days)
  completed_at TIMESTAMP WITH TIME ZONE,
  file_url TEXT, -- For export requests (Supabase Storage URL)
  file_expires_at TIMESTAMP WITH TIME ZONE, -- Export downloads expire after 7 days
  cancellation_token TEXT UNIQUE, -- For email-based cancellation links
  notes TEXT
);

-- Indexes
CREATE INDEX idx_data_retention_user ON public.data_retention_requests(user_id);
CREATE INDEX idx_data_retention_type_status ON public.data_retention_requests(request_type, status);
CREATE INDEX idx_data_retention_requested ON public.data_retention_requests(requested_at DESC);

-- RLS Policies
ALTER TABLE public.data_retention_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
ON public.data_retention_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
ON public.data_retention_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own delete requests within grace period"
ON public.data_retention_requests FOR UPDATE
USING (
  auth.uid() = user_id 
  AND request_type = 'delete' 
  AND status = 'pending'
  AND grace_period_ends_at > NOW()
);
```

#### audit_logs Table

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Keep logs after user deletion
  event_type TEXT NOT NULL, -- 'login_success', 'login_failed', 'password_change', 'data_export', etc.
  event_data JSONB, -- Additional event-specific data
  ip_address INET,
  user_agent TEXT,
  location_city TEXT,
  location_country TEXT,
  status TEXT CHECK (status IN ('success', 'failed', 'suspicious')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON public.audit_logs(status);

-- RLS Policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true); -- Server-side only via service role
```

---

## Technical Architecture

### Database Functions

#### log_security_event Function

```sql
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent,
    status
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    p_ip_address,
    p_user_agent,
    p_status
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
```

#### process_data_export Function

```sql
CREATE OR REPLACE FUNCTION public.process_data_export(request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  export_data JSONB;
  request_record RECORD;
BEGIN
  -- Get request details
  SELECT * INTO request_record
  FROM public.data_retention_requests
  WHERE id = request_id AND request_type = 'export';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Export request not found';
  END IF;
  
  -- Aggregate all user data
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.user_id = request_record.user_id),
    'rewards', (SELECT row_to_json(r) FROM public.user_rewards r WHERE r.user_id = request_record.user_id),
    'orders', (SELECT jsonb_agg(row_to_json(o)) FROM public.orders o WHERE o.user_id = request_record.user_id),
    'drinking_sessions', (SELECT jsonb_agg(row_to_json(d)) FROM public.drinking_sessions d WHERE d.user_id = request_record.user_id),
    'biometrics', (SELECT row_to_json(b) FROM public.user_biometrics b WHERE b.user_id = request_record.user_id),
    'buddy_connections', (SELECT jsonb_agg(row_to_json(bc)) FROM public.buddy_connections bc WHERE bc.user_id = request_record.user_id OR bc.buddy_id = request_record.user_id),
    'consents', (SELECT jsonb_agg(row_to_json(c)) FROM public.user_consents c WHERE c.user_id = request_record.user_id),
    'export_timestamp', NOW()
  ) INTO export_data;
  
  RETURN export_data;
END;
$$;
```

#### process_data_deletion Function

```sql
CREATE OR REPLACE FUNCTION public.process_data_deletion(request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get request details
  SELECT * INTO request_record
  FROM public.data_retention_requests
  WHERE id = request_id 
  AND request_type = 'delete'
  AND status = 'processing';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Delete request not found or not ready for processing';
  END IF;
  
  -- Delete user data (cascades will handle related records)
  DELETE FROM public.profiles WHERE user_id = request_record.user_id;
  DELETE FROM public.user_rewards WHERE user_id = request_record.user_id;
  DELETE FROM public.user_biometrics WHERE user_id = request_record.user_id;
  DELETE FROM public.buddy_connections WHERE user_id = request_record.user_id OR buddy_id = request_record.user_id;
  DELETE FROM public.drinking_sessions WHERE user_id = request_record.user_id;
  DELETE FROM public.user_consents WHERE user_id = request_record.user_id;
  DELETE FROM public.abandoned_carts WHERE user_id = request_record.user_id;
  DELETE FROM public.check_ins WHERE user_id = request_record.user_id;
  
  -- Anonymize orders (keep for legal/tax compliance)
  UPDATE public.orders SET user_id = NULL WHERE user_id = request_record.user_id;
  
  -- Delete auth user (final step)
  DELETE FROM auth.users WHERE id = request_record.user_id;
  
  -- Update request status
  UPDATE public.data_retention_requests
  SET status = 'completed', completed_at = NOW()
  WHERE id = request_id;
  
  -- Log the deletion
  INSERT INTO public.audit_logs (user_id, event_type, event_data)
  VALUES (request_record.user_id, 'account_deleted', jsonb_build_object('request_id', request_id));
END;
$$;
```

---

### Edge Functions

#### send-data-export-email

```typescript
// supabase/functions/send-data-export-email/index.ts
// Sends email with secure download link when data export is ready
// Triggered when data_retention_requests.status changes to 'completed'
```

#### send-deletion-confirmation-email

```typescript
// supabase/functions/send-deletion-confirmation-email/index.ts
// Sends confirmation email when deletion request is created
// Includes cancellation link valid for 7 days
```

#### process-scheduled-deletions

```typescript
// supabase/functions/process-scheduled-deletions/index.ts
// Scheduled function (runs daily) to:
// 1. Process deletion requests past grace period
// 2. Delete inactive accounts (3+ years)
// 3. Clean up expired data exports
// 4. Purge old audit logs (90+ days)
```

---

### React Hooks

#### useCookieConsent Hook

```typescript
// src/hooks/useCookieConsent.ts
export const useCookieConsent = () => {
  const [consents, setConsents] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });
  
  // Functions:
  // - loadConsents()
  // - updateConsent(type, granted)
  // - acceptAll()
  // - rejectNonEssential()
  // - checkConsentExpiry()
  
  return { consents, updateConsent, acceptAll, rejectNonEssential };
};
```

#### useDataRetention Hook

```typescript
// src/hooks/useDataRetention.ts
export const useDataRetention = () => {
  const [exportRequests, setExportRequests] = useState([]);
  const [deleteRequests, setDeleteRequests] = useState([]);
  
  // Functions:
  // - requestDataExport()
  // - requestDataDeletion()
  // - cancelDeletionRequest(requestId)
  // - getRequestStatus(requestId)
  
  return { exportRequests, deleteRequests, requestDataExport, requestDataDeletion };
};
```

#### useAuditLog Hook

```typescript
// src/hooks/useAuditLog.ts
export const useAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Functions:
  // - fetchAuditLogs(filters)
  // - reportSuspiciousActivity(logId)
  // - exportAuditLog(format)
  
  return { auditLogs, loading, fetchAuditLogs, reportSuspiciousActivity };
};
```

---

### React Components

#### CookieConsent Component

```typescript
// src/components/compliance/CookieConsent.tsx
// - Banner displayed on first visit
// - Accept All / Reject Non-Essential / Customize buttons
// - Modal for detailed cookie preferences
// - Persists consent choices to database
```

#### DataPrivacyControls Component

```typescript
// src/components/compliance/DataPrivacyControls.tsx
// - Data export request interface
// - Data deletion request interface
// - Display pending requests and status
// - Cancellation interface for delete requests
```

#### SecurityAuditLog Component

```typescript
// src/components/compliance/SecurityAuditLog.tsx
// - Display user's security audit events
// - Filtering and search functionality
// - Suspicious activity reporting
// - Export audit log as CSV
```

#### ComplianceDashboard Component

```typescript
// src/pages/ComplianceDashboard.tsx
// - Admin-only compliance metrics dashboard
// - Pending data request management
// - Consent statistics and trends
// - Compliance report generation
```

---

## Integration Points

### With Existing Features

1. **CNS-0001 Core Authentication:**
   - Audit logging for all auth events
   - Cookie consent integration with auth flow
   - Data export includes auth history

2. **CNS-0009 Checkout Process:**
   - Cookie consent required for analytics tracking
   - Order data retention policies
   - PCI compliance via Stripe integration

3. **CNS-0011 Manage Profile:**
   - Data export includes profile information
   - Profile deletion as part of account deletion
   - Privacy settings integrated in profile

4. **CNS-0012 Order History:**
   - Order data retention (7 years)
   - Order anonymization after account deletion
   - Export includes complete order history

5. **CNS-0015 Profile Rewards:**
   - Rewards data included in export
   - Rewards deleted with account deletion
   - Consent required for rewards communications

---

## Privacy & Security Considerations

### Data Encryption
- Personal data encrypted at rest (Supabase)
- Secure transmission (HTTPS/TLS)
- Encrypted backups
- Payment data handled by Stripe (PCI DSS compliant)

### Access Controls
- RLS policies enforce user data isolation
- Admin role-based access for compliance dashboard
- Audit logging for all data access
- Two-factor authentication for sensitive operations

### Data Minimization
- Only collect necessary data
- Regular data cleanup processes
- Automated deletion of expired data
- Anonymization where full deletion not required

### Consent Management
- Explicit opt-in for non-essential cookies
- Granular consent controls
- Easy consent withdrawal
- 12-month consent expiration

---

## Regulatory Compliance Mapping

### GDPR Compliance

| GDPR Requirement | Implementation |
|------------------|----------------|
| Right to Access (Art. 15) | Data export feature (US-PRIVACY.2) |
| Right to Erasure (Art. 17) | Account deletion (US-PRIVACY.3) |
| Right to Rectification (Art. 16) | Profile management (CNS-0011) |
| Right to Data Portability (Art. 20) | JSON export format (US-PRIVACY.2) |
| Consent Requirements (Art. 7) | Cookie consent (US-PRIVACY.1) |
| Privacy by Design (Art. 25) | RLS policies, encryption |
| Data Protection Officer | Contact info in privacy policy |
| 30-Day Response Time | Automated within 30 days |

### CCPA Compliance

| CCPA Requirement | Implementation |
|------------------|----------------|
| Right to Know (§1798.100) | Data export (US-PRIVACY.2) |
| Right to Delete (§1798.105) | Account deletion (US-PRIVACY.3) |
| Right to Opt-Out | Cookie rejection (US-PRIVACY.1) |
| Non-Discrimination | Equal service regardless of consent |
| Privacy Policy | Public privacy policy page |
| 45-Day Response Time | Automated within 30 days (exceeds requirement) |

---

## Success Metrics

### Compliance Metrics
- Data export requests fulfilled within 30 days: 100%
- Data deletion requests processed within timeframe: 100%
- Cookie consent rate: >60%
- Privacy policy page views: Track monthly
- Audit log retention: 90+ days maintained

### Security Metrics
- Failed login attempts detected and logged: 100%
- Suspicious activity reports responded to within 24 hours
- Zero data breaches
- Zero GDPR/CCPA violation complaints

### User Trust Metrics
- User satisfaction with privacy controls: >4.0/5.0
- Privacy-related support tickets: <5% of total tickets
- Data export/deletion request volume: Track trends

---

## Future Enhancements

### Phase 2 Considerations
- **Automated Compliance Scanning:** Continuous monitoring for policy violations
- **Privacy Impact Assessments:** Automated PIA generation for new features
- **Enhanced Consent Management:** Preference centers for marketing communications
- **Blockchain Audit Trail:** Immutable record of data processing activities
- **AI-Powered Anomaly Detection:** Machine learning for suspicious activity detection
- **Multi-Language Privacy Policies:** Localized policies for international users
- **Vendor Risk Management:** Third-party data processor compliance tracking

---

## Appendix

### Glossary

- **GDPR:** General Data Protection Regulation (EU privacy law)
- **CCPA:** California Consumer Privacy Act (California privacy law)
- **PII:** Personally Identifiable Information
- **RLS:** Row-Level Security (database access control)
- **PCI DSS:** Payment Card Industry Data Security Standard
- **SOX-2:** System and Organization Controls 2 (audit standard)
- **Right to Erasure:** GDPR right to have personal data deleted
- **Data Portability:** GDPR right to receive personal data in machine-readable format

### Related Documentation

- [Authentication Features](./authentication-features.md) - CNS-0001
- [Manage Profile Features](./manage-profile-features.md) - CNS-0011
- [Order History Features](./order-history-features.md) - CNS-0012
- [Checkout Process Features](./checkout-features.md) - CNS-0009

### Regulatory References

- [GDPR Full Text](https://gdpr-info.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [PCI DSS Standards](https://www.pcisecuritystandards.org/)
- [SOX-2 Overview](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)
