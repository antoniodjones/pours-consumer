# Venue Partnership Features - Product Requirements

**Epic:** CNS-0021 - Venue Partnership  
**Feature Area:** Business Operations  
**Status:** ✅ Implemented  
**Priority:** P1 - High

---

## Table of Contents
- [Epic Overview](#epic-overview)
- [User Stories](#user-stories)
  - [US-VENUE.1: View Partnership Landing Page](#us-venue1-view-partnership-landing-page)
  - [US-VENUE.2: View Partnership Benefits](#us-venue2-view-partnership-benefits)
  - [US-VENUE.3: Submit Partnership Inquiry](#us-venue3-submit-partnership-inquiry)
  - [US-VENUE.4: View Partnership Program Details](#us-venue4-view-partnership-program-details)
  - [US-VENUE.5: Track Partnership Leads (Admin)](#us-venue5-track-partnership-leads-admin)
- [Technical Requirements](#technical-requirements)
- [Database Schema](#database-schema)
- [API & Edge Functions](#api--edge-functions)
- [Security & Compliance](#security--compliance)

---

## Epic Overview

### Description
The Venue Partnership epic enables bars, restaurants, and other hospitality venues to learn about and apply for partnership with the Pours+ platform. This feature serves as the primary business development and lead generation channel for acquiring new venue partners to expand the Pours+ network.

### Business Value
- **Lead Generation**: Capture and qualify potential venue partners
- **Brand Growth**: Expand Pours+ venue network systematically
- **Sales Enablement**: Provide sales team with qualified leads and context
- **Market Awareness**: Educate venues about platform benefits and value proposition
- **Scalability**: Automate initial partner outreach and qualification process

### Success Metrics
- Number of partnership inquiries submitted per month
- Lead-to-partnership conversion rate
- Time from inquiry to first contact
- Venue partner satisfaction with onboarding process
- Geographic distribution of partnership inquiries

### Acceptance Criteria
- Professional, SEO-optimized partnership landing page
- Clear articulation of partnership benefits and value proposition
- Functional contact form with validation and submission
- Lead data captured in database for sales team follow-up
- Email notifications to sales team for new inquiries
- Mobile-responsive design across all devices
- Performance optimized (<3 second page load)

---

## User Stories

### US-VENUE.1: View Partnership Landing Page

**As a** bar or restaurant owner  
**I want to** access a dedicated partnership page  
**So that** I can learn about becoming a Pours+ venue partner

#### Background
The partnership landing page is the first touchpoint for potential venue partners. It must be discoverable, professional, and clearly communicate the value proposition of partnering with Pours+.

#### Value Proposition
- Creates first impression for potential partners
- Provides centralized information about partnership program
- Enables self-service discovery and education
- Reduces sales team effort on unqualified leads

#### Gherkin Scenarios

```gherkin
Feature: Partnership Landing Page Access
  As a potential venue partner
  I need to access information about partnering with Pours+
  So that I can evaluate the opportunity

  Scenario: Access partnership page from homepage
    Given I am on the Pours+ homepage
    When I click the "Partner With Us" button in the hero section
    Then I should be navigated to the "/venue-partnership" page
    And I should see the partnership landing page header
    And I should see the Pours+ branding and navigation

  Scenario: Access partnership page from footer
    Given I am on any page of the Pours+ consumer app
    When I scroll to the footer
    And I click the "Become a Partner" link
    Then I should be navigated to the "/venue-partnership" page
    And I should see the partnership landing page content

  Scenario: Direct navigation to partnership page
    Given I have the URL "https://app.pours.plus/venue-partnership"
    When I navigate directly to that URL
    Then I should see the partnership landing page
    And the page should load within 3 seconds
    And all content should be visible and properly formatted

  Scenario: Partnership page is mobile responsive
    Given I am viewing the partnership page on a mobile device
    When the page loads
    Then all content should be readable without horizontal scrolling
    And the contact form should be usable on a mobile screen
    And images and layouts should adapt to the smaller screen size

  Scenario: Partnership page SEO optimization
    Given I am a search engine crawler
    When I access the partnership page
    Then I should find proper meta tags (title, description)
    And I should find structured data about the business partnership
    And I should find semantic HTML with proper heading hierarchy
    And I should find alt text on all images
```

#### Acceptance Criteria
- [ ] Partnership page accessible at `/venue-partnership` route
- [ ] Page linked from homepage "Partner With Us" CTA
- [ ] Page linked from footer "Become a Partner" link
- [ ] Page load time <3 seconds
- [ ] Mobile responsive design
- [ ] SEO meta tags properly configured
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Professional hero section with compelling imagery
- [ ] Clear call-to-action to contact sales

#### Technical Notes
- Component: `src/pages/VenuePartnership.tsx`
- Route configured in router
- Uses MainLayout template
- SEO title: "Partner With Pours+ | Grow Your Bar or Restaurant"
- SEO description: "Join the Pours+ network and modernize your bar or restaurant with mobile ordering, loyalty programs, and real-time analytics."

---

### US-VENUE.2: View Partnership Benefits

**As a** bar or restaurant owner  
**I want to** understand the specific benefits of partnering with Pours+  
**So that** I can evaluate if the partnership aligns with my business goals

#### Background
Clear articulation of partnership benefits is critical for converting interested venues into qualified leads. Benefits must address key pain points and showcase tangible value.

#### Value Proposition
- Educates potential partners on platform capabilities
- Addresses common venue pain points
- Differentiates Pours+ from competitors
- Provides concrete examples of value delivery

#### Gherkin Scenarios

```gherkin
Feature: Partnership Benefits Display
  As a potential venue partner
  I need to see clear benefits of partnering with Pours+
  So that I can make an informed decision

  Scenario: View key partnership benefits
    Given I am on the venue partnership page
    When I scroll to the "Benefits for Venues" section
    Then I should see a list of key benefits including:
      | Benefit Category | Description |
      | Increase Revenue | Mobile ordering increases average order value |
      | Customer Loyalty | Built-in rewards program drives repeat visits |
      | Operational Efficiency | Streamlined ordering reduces staff workload |
      | Real-Time Analytics | Data insights to optimize menu and pricing |
      | Marketing Support | Access to Pours+ customer base |
    And each benefit should have a descriptive title
    And each benefit should have supporting details
    And benefits should be displayed with icons or imagery

  Scenario: Benefits presented with visual hierarchy
    Given I am viewing the benefits section
    Then each benefit should be clearly separated
    And benefits should use consistent formatting
    And important benefits should be visually emphasized
    And the section should be scannable at a glance

  Scenario: Benefits address venue pain points
    Given I am a venue owner concerned about staffing
    When I read the benefits section
    Then I should see how Pours+ reduces staff workload
    And I should see how mobile ordering improves efficiency
    
  Scenario: Benefits include social proof
    Given I am evaluating the partnership
    When I review the benefits section
    Then I should see testimonials from existing partners (if available)
    Or I should see case study statistics
    Or I should see number of existing venue partners

  Scenario: Mobile view of benefits
    Given I am viewing the partnership page on mobile
    When I scroll to the benefits section
    Then benefits should be displayed in a single column
    And each benefit should be fully readable
    And icons/images should scale appropriately
```

#### Acceptance Criteria
- [ ] Benefits section clearly labeled and easy to find
- [ ] Minimum 5 key benefits articulated
- [ ] Each benefit has title and supporting description
- [ ] Benefits use visual elements (icons, images)
- [ ] Benefits address common venue pain points:
  - Revenue growth
  - Customer retention
  - Operational efficiency
  - Data insights
  - Marketing reach
- [ ] Benefits are concrete and specific (not vague)
- [ ] Mobile-responsive layout
- [ ] Consistent visual design

#### Technical Notes
- Benefits displayed in Card or Grid layout
- Use icons from lucide-react library
- Each benefit card should be visually distinct
- Consider using shadcn/ui Card component

---

### US-VENUE.3: Submit Partnership Inquiry

**As a** bar or restaurant owner interested in partnering  
**I want to** submit my contact information and business details  
**So that** the Pours+ sales team can contact me about partnership opportunities

#### Background
The partnership inquiry form is the primary lead capture mechanism. It must collect sufficient information for sales qualification while maintaining low friction to maximize conversions.

#### Value Proposition
- Enables self-service lead submission
- Captures structured data for sales follow-up
- Qualifies leads based on business information
- Creates audit trail of partnership interest

#### Gherkin Scenarios

```gherkin
Feature: Partnership Inquiry Submission
  As a venue owner
  I need to submit my contact and business information
  So that Pours+ can contact me about partnership

  Background:
    Given I am on the venue partnership page
    And I have scrolled to the contact form section

  Scenario: Successfully submit partnership inquiry
    When I enter valid information:
      | Field | Value |
      | Venue Name | The Rusty Tap |
      | Contact Name | John Smith |
      | Email | john@rustytap.com |
      | Phone | (555) 123-4567 |
      | City | Austin |
      | State | TX |
      | Venue Type | Bar & Grill |
      | Message | Interested in mobile ordering for our venue |
    And I click "Submit Inquiry"
    Then I should see a success message "Thank you! We'll be in touch soon."
    And the form should be cleared
    And my inquiry should be saved to the database
    And the sales team should receive an email notification

  Scenario: Required field validation
    When I attempt to submit the form without filling required fields
    Then I should see validation errors for:
      | Field | Error Message |
      | Venue Name | Venue name is required |
      | Contact Name | Contact name is required |
      | Email | Email is required |
      | Phone | Phone number is required |
    And the form should not be submitted
    And no data should be saved to the database

  Scenario: Email format validation
    When I enter an invalid email "not-an-email"
    And I click "Submit Inquiry"
    Then I should see an error "Please enter a valid email address"
    And the form should not be submitted

  Scenario: Phone number validation
    When I enter an invalid phone number "123"
    And I click "Submit Inquiry"
    Then I should see an error "Please enter a valid phone number"
    And the form should not be submitted

  Scenario: Optional message field
    When I submit the form with all required fields
    But leave the message field empty
    Then the form should submit successfully
    And the inquiry should be saved without a message

  Scenario: Form submission error handling
    Given the database connection is unavailable
    When I submit a valid partnership inquiry
    Then I should see an error message "Unable to submit inquiry. Please try again."
    And I should be able to retry submission
    And my form data should not be lost

  Scenario: Duplicate submission prevention
    Given I have successfully submitted an inquiry
    When I immediately submit another inquiry with the same email
    Then the system should accept the submission (no duplicate check)
    Or I should see a message "You've already submitted an inquiry. We'll be in touch soon."

  Scenario: Mobile form usability
    Given I am on a mobile device
    When I interact with the contact form
    Then the keyboard should appear appropriately for each field type
    And the phone field should show a numeric keyboard
    And the email field should show an email keyboard
    And the form should be scrollable and usable without zooming
```

#### Acceptance Criteria
- [ ] Form includes all required fields:
  - Venue Name (required)
  - Contact Name (required)
  - Email (required)
  - Phone (required)
  - City (optional)
  - State (optional)
  - Venue Type (optional dropdown)
  - Message (optional textarea)
- [ ] Client-side validation with clear error messages
- [ ] Email format validation
- [ ] Phone number format validation
- [ ] Success message on successful submission
- [ ] Error handling for submission failures
- [ ] Form clears after successful submission
- [ ] Loading state during submission
- [ ] Accessible form labels and ARIA attributes
- [ ] Mobile-responsive form layout
- [ ] Input length limits to prevent abuse

#### Technical Notes
- Use React Hook Form for form management
- Use Zod for validation schema
- Store inquiries in `venue_partnership_inquiries` table
- Send notification via Edge Function
- Consider rate limiting (max 3 submissions per IP per hour)

---

### US-VENUE.4: View Partnership Program Details

**As a** potential venue partner  
**I want to** understand the specific terms and structure of the partnership program  
**So that** I can assess financial and operational requirements

#### Background
Transparency about partnership terms, costs, and commitments builds trust and ensures qualified leads understand what they're signing up for.

#### Value Proposition
- Sets clear expectations about partnership
- Reduces sales team time on unqualified leads
- Builds trust through transparency
- Answers common questions proactively

#### Gherkin Scenarios

```gherkin
Feature: Partnership Program Details
  As a venue owner evaluating partnership
  I need detailed information about the program
  So that I can make an informed decision

  Scenario: View partnership program structure
    Given I am on the venue partnership page
    When I scroll to the "How It Works" section
    Then I should see a step-by-step explanation of:
      | Step | Description |
      | 1. Initial Contact | Sales team reaches out within 24 hours |
      | 2. Discovery Call | Discuss your venue's needs and goals |
      | 3. Custom Proposal | Receive tailored partnership proposal |
      | 4. Onboarding | Setup takes 2-4 weeks with full support |
      | 5. Go Live | Start accepting mobile orders |
    And each step should be clearly numbered
    And each step should have a brief description

  Scenario: View pricing and fee structure
    Given I am evaluating partnership costs
    When I look for pricing information
    Then I should see transparent information about:
      | Fee Type | Details |
      | Setup Fee | One-time setup and onboarding |
      | Monthly Fee | Platform access and support |
      | Transaction Fee | Percentage per order |
      | Hardware | Any required hardware costs |
    Or I should see "Contact sales for custom pricing"
    And I should understand there are no hidden fees

  Scenario: View technology requirements
    Given I am assessing technical requirements
    When I review the partnership details
    Then I should see information about:
      | Requirement | Description |
      | Internet | Stable WiFi connection required |
      | Devices | Tablet or smartphone for order management |
      | POS Integration | Compatible with major POS systems |
      | Training | Staff training provided |

  Scenario: View partnership commitments
    Given I am evaluating the partnership agreement
    When I review program details
    Then I should understand:
      | Commitment | Details |
      | Contract Length | Minimum term (if any) |
      | Exclusivity | Any exclusivity requirements |
      | Cancellation | Cancellation policy and notice period |
      | Support | Level of ongoing support provided |

  Scenario: FAQ section availability
    Given I have questions about the partnership
    When I scroll to the FAQ section
    Then I should see answers to common questions like:
      | Question | Answer Category |
      | How long does setup take? | Timeline |
      | What are the costs? | Pricing |
      | Do I need special equipment? | Technology |
      | Can I cancel anytime? | Commitments |
      | How do customers place orders? | Process |
```

#### Acceptance Criteria
- [ ] "How It Works" section with partnership process steps
- [ ] Clear timeline expectations (setup, go-live)
- [ ] Pricing information (even if "contact sales")
- [ ] Technology requirements clearly stated
- [ ] Partnership commitments explained
- [ ] FAQ section addresses common questions
- [ ] Contact information for additional questions
- [ ] Professional, trustworthy tone
- [ ] No false or misleading claims

#### Technical Notes
- Use timeline or stepper component for "How It Works"
- Use Accordion for FAQ section
- Consider adding testimonials from existing partners
- Link to separate detailed terms page if needed

---

### US-VENUE.5: Track Partnership Leads (Admin)

**As a** Pours+ sales team member  
**I want to** view and manage partnership inquiries  
**So that** I can follow up with potential venue partners efficiently

#### Background
Lead management is critical for converting inquiries into partnerships. The system must provide sales team with visibility into all inquiries and their status.

#### Value Proposition
- Centralizes lead information for sales team
- Prevents leads from falling through cracks
- Enables efficient follow-up and outreach
- Provides analytics on lead sources and quality

#### Gherkin Scenarios

```gherkin
Feature: Partnership Lead Management (Admin)
  As a sales team member
  I need to track and manage partnership inquiries
  So that I can convert leads to partners

  Scenario: View all partnership inquiries
    Given I am logged in as a sales team member
    When I navigate to the partnership leads dashboard
    Then I should see a list of all partnership inquiries
    And each inquiry should show:
      | Field | Description |
      | Submission Date | When inquiry was submitted |
      | Venue Name | Name of the venue |
      | Contact Name | Primary contact person |
      | Location | City and state |
      | Status | New, Contacted, Qualified, etc. |
      | Assigned To | Sales rep assigned |
    And inquiries should be sortable by date, status
    And I should be able to filter by status and location

  Scenario: View inquiry details
    Given I am viewing the partnership leads list
    When I click on a specific inquiry
    Then I should see the full inquiry details including:
      | Detail | Information |
      | All form fields | Venue name, contact, phone, email, etc. |
      | Message | Full message content |
      | Submission timestamp | Exact date and time |
      | Source | How they found us (if tracked) |
      | Contact history | Previous outreach attempts |
      | Notes | Internal sales notes |

  Scenario: Update inquiry status
    Given I am viewing an inquiry detail page
    When I update the status to "Contacted"
    And I add a note "Initial call scheduled for 11/25"
    And I click "Save"
    Then the inquiry status should be updated
    And my note should be saved
    And a timestamp should be recorded
    And other team members should see the updated status

  Scenario: Assign inquiry to sales rep
    Given I am a sales manager
    When I assign an inquiry to a specific sales rep
    Then that sales rep should receive a notification
    And the inquiry should show in their assigned leads
    And the assignment should be logged

  Scenario: Receive email notification for new inquiry
    Given a new partnership inquiry is submitted
    When the submission is saved to the database
    Then the sales team email should receive a notification
    And the notification should include:
      | Information | Details |
      | Venue Name | Name from inquiry |
      | Contact Info | Email and phone |
      | Location | City and state |
      | Message | Full message content |
      | Link | Direct link to inquiry details |

  Scenario: Export inquiries for reporting
    Given I am a sales manager
    When I click "Export to CSV"
    Then I should download a CSV file with all inquiries
    And the CSV should include all inquiry fields
    And the CSV should include status and assignment information
```

#### Acceptance Criteria
- [ ] Admin dashboard for viewing all inquiries
- [ ] Inquiry list with sortable columns
- [ ] Filtering by status, date, location
- [ ] Detailed view for each inquiry
- [ ] Status update capability (New, Contacted, Qualified, Partner, Declined)
- [ ] Internal notes field for sales team
- [ ] Assignment to sales reps
- [ ] Email notification on new inquiry
- [ ] Export to CSV functionality
- [ ] Search functionality by venue name, contact name, email
- [ ] Access restricted to sales team members only

#### Technical Notes
- Requires authentication and role-based access control
- May use separate admin portal or admin routes
- Dashboard could use data tables with pagination
- Consider using Supabase RLS for admin-only access
- Email notifications via Edge Function
- Export using CSV generation library

---

## Technical Requirements

### Components

#### VenuePartnership Page Component
- **Location**: `src/pages/VenuePartnership.tsx`
- **Purpose**: Main landing page for venue partnership
- **Key Features**:
  - Hero section with compelling value proposition
  - Benefits section with visual cards
  - "How It Works" timeline
  - Contact form section
  - FAQ accordion
  - SEO-optimized content

#### Partnership Inquiry Form Component
- **Location**: Could be extracted to `src/components/partnership/InquiryForm.tsx`
- **Purpose**: Capture partnership inquiry data
- **Key Features**:
  - Form validation with Zod schema
  - Loading states during submission
  - Success/error messaging
  - Accessible form inputs
  - Mobile-responsive layout

#### Partnership Admin Dashboard (Future)
- **Location**: `src/pages/admin/PartnershipLeads.tsx`
- **Purpose**: Sales team lead management interface
- **Key Features**:
  - Data table with sorting/filtering
  - Inquiry detail modal
  - Status update interface
  - Notes and assignment management
  - Export functionality

### User Flow

```
Venue Owner Journey:
1. Discovers Pours+ (homepage or search)
2. Clicks "Partner With Us" CTA
3. Views partnership landing page
4. Reads benefits and program details
5. Fills out inquiry form
6. Submits inquiry
7. Receives confirmation
8. Sales team follows up

Sales Team Journey:
1. Receives email notification of new inquiry
2. Logs into admin dashboard
3. Reviews inquiry details
4. Updates status to "Contacted"
5. Assigns to sales rep
6. Sales rep follows up
7. Updates status through sales cycle
8. Converts to partner or declines
```

### Data Flow

```
User submits form
    ↓
Client-side validation (Zod)
    ↓
Form submission (POST request)
    ↓
Edge Function processes submission
    ↓
Insert into database (venue_partnership_inquiries)
    ↓
Send email notification to sales team
    ↓
Return success response to client
    ↓
Display success message to user
```

### Performance Requirements
- Page load time: <3 seconds
- Form submission response: <2 seconds
- Email notification delivery: <30 seconds
- Admin dashboard load: <2 seconds with pagination

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Proper form labels and ARIA attributes
- Sufficient color contrast
- Focus indicators on all interactive elements

### SEO Requirements
- Title tag: "Partner With Pours+ | Grow Your Bar or Restaurant"
- Meta description: <160 characters, includes key benefits
- H1 tag: Single, descriptive heading
- Semantic HTML structure (header, main, section, article)
- Alt text on all images
- Schema.org markup for Organization and Service
- Canonical URL
- Open Graph tags for social sharing

---

## Database Schema

### Table: venue_partnership_inquiries

```sql
CREATE TABLE IF NOT EXISTS public.venue_partnership_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Venue Information
  venue_name TEXT NOT NULL,
  venue_type TEXT, -- 'bar', 'restaurant', 'nightclub', 'brewery', etc.
  
  -- Contact Information
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Location
  city TEXT,
  state TEXT,
  address TEXT,
  postal_code TEXT,
  
  -- Inquiry Details
  message TEXT,
  estimated_monthly_orders INTEGER, -- Optional: How many orders do they estimate?
  current_pos_system TEXT, -- Optional: What POS do they use?
  
  -- Metadata
  source TEXT DEFAULT 'website', -- Track where inquiry came from
  utm_source TEXT, -- Marketing attribution
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Lead Management
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'partner', 'declined')),
  assigned_to UUID REFERENCES auth.users(id), -- Sales rep assigned
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Notes and Follow-up
  internal_notes TEXT, -- Sales team notes
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_partnership_inquiries_status ON public.venue_partnership_inquiries(status);
CREATE INDEX idx_partnership_inquiries_created_at ON public.venue_partnership_inquiries(created_at DESC);
CREATE INDEX idx_partnership_inquiries_assigned_to ON public.venue_partnership_inquiries(assigned_to);
CREATE INDEX idx_partnership_inquiries_email ON public.venue_partnership_inquiries(email);

-- Enable RLS
ALTER TABLE public.venue_partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit inquiry)
CREATE POLICY "Anyone can submit partnership inquiry"
  ON public.venue_partnership_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only sales team can view inquiries
CREATE POLICY "Sales team can view all inquiries"
  ON public.venue_partnership_inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'sales' OR role = 'admin'
    )
  );

-- Policy: Only sales team can update inquiries
CREATE POLICY "Sales team can update inquiries"
  ON public.venue_partnership_inquiries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'sales' OR role = 'admin'
    )
  );

-- Trigger: Update updated_at timestamp
CREATE TRIGGER update_partnership_inquiries_updated_at
  BEFORE UPDATE ON public.venue_partnership_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### Table: partnership_inquiry_notes (Optional)

```sql
-- Track all communications and notes for an inquiry
CREATE TABLE IF NOT EXISTS public.partnership_inquiry_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES public.venue_partnership_inquiries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Who added the note
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'call', 'email', 'meeting', 'status_change')),
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_partnership_notes_inquiry ON public.partnership_inquiry_notes(inquiry_id);

ALTER TABLE public.partnership_inquiry_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales team can manage notes"
  ON public.partnership_inquiry_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'sales' OR role = 'admin'
    )
  );
```

---

## API & Edge Functions

### Edge Function: submit-partnership-inquiry

**Purpose**: Handle partnership inquiry form submissions

**Endpoint**: `POST /functions/v1/submit-partnership-inquiry`

**Request Body**:
```json
{
  "venueName": "The Rusty Tap",
  "contactName": "John Smith",
  "email": "john@rustytap.com",
  "phone": "(555) 123-4567",
  "city": "Austin",
  "state": "TX",
  "venueType": "bar_grill",
  "message": "Interested in mobile ordering"
}
```

**Response**:
```json
{
  "success": true,
  "inquiryId": "uuid",
  "message": "Thank you for your inquiry! We'll be in touch soon."
}
```

**Logic**:
1. Validate request payload (Zod schema)
2. Sanitize input data
3. Check for rate limiting (IP-based)
4. Insert inquiry into database
5. Send email notification to sales team
6. Return success response

**Rate Limiting**: 3 submissions per IP per hour

### Edge Function: send-partnership-notification

**Purpose**: Send email to sales team when new inquiry is submitted

**Triggered By**: Database trigger or called by submit-partnership-inquiry

**Email Template**:
```
Subject: New Partnership Inquiry - [Venue Name]

A new venue partnership inquiry has been submitted:

Venue: [Venue Name]
Type: [Venue Type]
Contact: [Contact Name]
Email: [Email]
Phone: [Phone]
Location: [City, State]

Message:
[Message]

View Details: [Link to Admin Dashboard]

Submitted: [Timestamp]
```

**Recipients**: Partnership email alias (e.g., partnerships@pours.plus)

---

## Security & Compliance

### Data Protection
- **PII Handling**: Contact information is PII, must be protected
- **Encryption**: Data encrypted at rest in Supabase
- **Access Control**: Only authenticated sales team can view inquiries
- **Data Retention**: Define policy for how long to retain declined inquiries

### Input Validation
- **Client-Side**: Zod schema validation before submission
- **Server-Side**: Re-validate all inputs in Edge Function
- **Sanitization**: Sanitize all text inputs to prevent XSS
- **Length Limits**: Enforce reasonable length limits on all fields
  - Venue Name: 100 characters
  - Contact Name: 100 characters
  - Email: 255 characters
  - Phone: 20 characters
  - Message: 2000 characters

### Rate Limiting
- **Submission Limits**: 3 inquiries per IP per hour
- **Abuse Prevention**: Block submissions with suspicious patterns
- **CAPTCHA**: Consider adding reCAPTCHA for additional protection

### Privacy Compliance
- **GDPR**: Provide data deletion upon request
- **Privacy Policy**: Link to privacy policy in form
- **Consent**: Inform users how data will be used
- **Opt-Out**: Provide way to request removal from contact list

### Email Security
- **SPF/DKIM**: Ensure proper email authentication
- **Unsubscribe**: Include unsubscribe mechanism (if ongoing communications)
- **CAN-SPAM**: Comply with email marketing regulations

---

## Testing Requirements

### Unit Tests
- [ ] Form validation logic (all validation rules)
- [ ] Input sanitization functions
- [ ] Email formatting functions
- [ ] Date/time formatting utilities

### Integration Tests
- [ ] Form submission flow end-to-end
- [ ] Database insertion and retrieval
- [ ] Email notification delivery
- [ ] Error handling for failed submissions
- [ ] Rate limiting enforcement

### E2E Tests
- [ ] User can access partnership page from homepage
- [ ] User can submit valid inquiry and see success message
- [ ] User sees validation errors for invalid inputs
- [ ] Form clears after successful submission
- [ ] Mobile form usability
- [ ] Sales team receives email notification

### Accessibility Tests
- [ ] Keyboard navigation works for all form fields
- [ ] Screen reader announces form labels and errors
- [ ] Focus indicators visible on all elements
- [ ] Color contrast meets WCAG AA standards
- [ ] ARIA labels present and accurate

---

## Documentation Updates Required

- [x] Product requirements documented (this file)
- [ ] User guide: "Becoming a Pours+ Partner"
- [ ] Sales team guide: "Managing Partnership Inquiries"
- [ ] Admin documentation: "Partnership Lead Dashboard"
- [ ] Privacy policy update: Partnership inquiry data handling

---

## Future Enhancements

### Phase 2: Enhanced Lead Management
- **Lead Scoring**: Automatically score leads based on venue size, location, type
- **CRM Integration**: Sync inquiries to Salesforce, HubSpot, or other CRM
- **Automated Follow-up**: Trigger automated email sequences for nurturing
- **Calendar Integration**: Enable scheduling of discovery calls directly from form

### Phase 3: Self-Service Onboarding
- **Partner Portal**: Allow approved partners to complete onboarding online
- **Document Upload**: Digital collection of contracts, licenses, insurance
- **Training Modules**: Self-service video training for venue staff
- **Setup Wizard**: Guided setup for menu, pricing, integrations

### Phase 4: Analytics & Optimization
- **Conversion Tracking**: Track inquiry-to-partner conversion rates
- **A/B Testing**: Test different page layouts, copy, CTAs
- **Attribution**: Track which marketing channels drive best leads
- **ROI Analysis**: Analyze partner performance and lifetime value

---

## Appendix

### Venue Types
- Bar
- Restaurant
- Bar & Grill
- Nightclub
- Brewery
- Winery
- Sports Bar
- Rooftop Bar
- Hotel Bar
- Other

### Lead Status Definitions
- **New**: Just submitted, not yet contacted
- **Contacted**: Initial outreach made
- **Qualified**: Meets partnership criteria
- **Proposal Sent**: Custom proposal delivered
- **Negotiating**: In contract negotiations
- **Partner**: Successfully onboarded
- **Declined**: Not a fit or declined partnership

### Success Metrics Definitions
- **Inquiry Volume**: Number of inquiries per month
- **Response Time**: Time from inquiry to first contact (target: <24 hours)
- **Qualification Rate**: % of inquiries that are qualified leads
- **Conversion Rate**: % of qualified leads that become partners
- **Time to Partner**: Average days from inquiry to go-live

---

## Change Log
- **2025-11-23**: Initial documentation created (CNS-0021)
