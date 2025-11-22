# Manage Profile - Product Requirements Documentation

## Document Information
- **Document Version**: 1.0
- **Last Updated**: 2025-11-22
- **Epic**: EPIC-PROFILE-002 - Manage Profile
- **Related Components**: `ManageProfile`, `AvatarUpload`, `ProfileInfo`
- **Database Tables**: `profiles`, Supabase Storage (`avatars` bucket)

---

## Executive Summary

The Manage Profile section enables Pours Consumer users to view and update their personal information, contact details, physical address, and profile avatar. This feature ensures users maintain accurate, up-to-date information for personalized experiences, order delivery/pickup, and communications.

---

## Epic Definition

### EPIC-PROFILE-002: Manage Profile

**Epic Description**: As a Pours Consumer user, I need to manage my personal profile information so that my account details remain accurate and up-to-date for order fulfillment, communications, and personalized experiences.

**Business Value**:
- Ensures accurate user data for order processing and delivery
- Enables personalized user experiences based on preferences
- Maintains compliance with data privacy regulations (GDPR, CCPA)
- Reduces customer support inquiries related to incorrect information
- Improves order fulfillment accuracy

**Success Metrics**:
- Profile completion rate > 85%
- Profile update success rate > 98%
- Average time to complete profile < 3 minutes
- Avatar upload success rate > 95%
- User satisfaction with profile management > 4.2/5

---

## User Stories

### US-PROFILE.1: Edit Personal Information

**Story**: As a Pours Consumer user, I want to edit my personal information (name, birthday, gender) so that my profile reflects my current identity and preferences.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: Supabase `profiles` table

#### Acceptance Criteria

```gherkin
Feature: Edit Personal Information
  Epic: EPIC-PROFILE-002 - Manage Profile

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile"

  Scenario: Successfully update first and last name
    When I update my "First Name" to "Alexander"
    And I update my "Last Name" to "Rodriguez"
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And my profile should display "Alexander Rodriguez"
    And the changes should persist after page refresh

  Scenario: Update birthday
    When I update my "Birthday" to "1990-05-15"
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And my profile should display birthday as "May 15, 1990"
    And my age should be calculated correctly

  Scenario: Update gender
    When I select "Non-binary" from the "Gender" dropdown
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And my profile should display gender as "Non-binary"

  Scenario: Validation - Empty required fields
    When I clear the "First Name" field
    And I click "Save Changes"
    Then I should see an error message "First name is required"
    And the profile should not be updated

  Scenario: Validation - Invalid birthday format
    When I enter an invalid date "13/32/1990"
    And I click "Save Changes"
    Then I should see an error message "Please enter a valid date"
    And the profile should not be updated

  Scenario: Validation - Future birthday
    When I enter a future date for birthday
    And I click "Save Changes"
    Then I should see an error message "Birthday cannot be in the future"
    And the profile should not be updated

  Scenario: Validation - Underage user (< 21)
    When I enter a birthday indicating age less than 21
    And I click "Save Changes"
    Then I should see an error message "You must be 21 or older to use this service"
    And the profile should not be updated
```

#### Technical Requirements

**Database Schema** (`profiles` table):
- `first_name` (text, nullable)
- `last_name` (text, nullable)
- `birthday` (date, nullable)
- `gender` (text, nullable)
- `updated_at` (timestamp, auto-updated)

**Validation Rules**:
- First Name: 1-50 characters, letters and spaces only
- Last Name: 1-50 characters, letters and spaces only
- Birthday: Valid date, not in future, user must be 21+
- Gender: Predefined options (Male, Female, Non-binary, Prefer not to say, Other)

**API Integration**:
```typescript
// Update profile
await supabase
  .from('profiles')
  .update({
    first_name,
    last_name,
    birthday,
    gender,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', user.id);
```

---

### US-PROFILE.2: Manage Address Information

**Story**: As a Pours Consumer user, I want to manage my address information so that I can receive deliveries and locate nearby venues accurately.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: Supabase `profiles` table, address validation service (future)

#### Acceptance Criteria

```gherkin
Feature: Manage Address Information
  Epic: EPIC-PROFILE-002 - Manage Profile

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile"

  Scenario: Successfully update complete address
    When I update "Address Line 1" to "123 Main Street"
    And I update "Address Line 2" to "Apt 4B"
    And I update "City" to "San Francisco"
    And I update "State" to "California"
    And I update "Postal Code" to "94102"
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And my profile should display the complete address
    And the address should persist after page refresh

  Scenario: Update address without optional line 2
    When I update "Address Line 1" to "456 Oak Avenue"
    And I leave "Address Line 2" empty
    And I update "City" to "Los Angeles"
    And I update "State" to "California"
    And I update "Postal Code" to "90001"
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And my profile should display the address without line 2

  Scenario: Validation - Incomplete address
    When I update "Address Line 1" to "789 Pine Road"
    And I leave "City" empty
    And I click "Save Changes"
    Then I should see an error message "City is required"
    And the profile should not be updated

  Scenario: Validation - Invalid postal code
    When I enter "ABCDE" in the "Postal Code" field
    And I click "Save Changes"
    Then I should see an error message "Please enter a valid postal code"
    And the profile should not be updated

  Scenario: Validation - Postal code format
    When I enter "941" in the "Postal Code" field
    And I click "Save Changes"
    Then I should see an error message "Postal code must be 5 digits"
    And the profile should not be updated

  Scenario: State selection from dropdown
    When I click on the "State" dropdown
    Then I should see all US states listed
    And I should be able to search for a state
    When I select "New York"
    Then the "State" field should display "New York"
```

#### Technical Requirements

**Database Schema** (`profiles` table):
- `address_line_1` (text, nullable)
- `address_line_2` (text, nullable)
- `city` (text, nullable)
- `state` (text, nullable)
- `postal_code` (text, nullable)
- `country_code` (text, default: 'US')

**Validation Rules**:
- Address Line 1: 1-100 characters (required if any address field filled)
- Address Line 2: 0-100 characters (optional)
- City: 1-50 characters, letters and spaces
- State: Must be valid US state from predefined list
- Postal Code: 5 digits (US ZIP code format)

**UI Components**:
- Text inputs for address lines and city
- Dropdown/select for state (all 50 US states)
- Formatted input for postal code (auto-format to 12345)

**API Integration**:
```typescript
// Update address
await supabase
  .from('profiles')
  .update({
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    country_code: 'US',
    updated_at: new Date().toISOString()
  })
  .eq('user_id', user.id);
```

---

### US-PROFILE.3: Manage Contact Details

**Story**: As a Pours Consumer user, I want to manage my contact information (email, mobile, phone numbers) so that I can receive order notifications and important communications.

**Priority**: High  
**Story Points**: 8  
**Dependencies**: Supabase `profiles` table, Email validation service, Phone number formatting library

#### Acceptance Criteria

```gherkin
Feature: Manage Contact Details
  Epic: EPIC-PROFILE-002 - Manage Profile

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile"

  Scenario: Successfully update email address
    When I update "Email" to "newemail@example.com"
    And I click "Save Changes"
    Then I should see a verification message "Please verify your new email address"
    And a verification email should be sent to "newemail@example.com"
    And my current email should remain active until verified

  Scenario: Successfully update mobile number
    When I update "Mobile Number" to "(555) 123-4567"
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And the mobile number should be formatted as "(555) 123-4567"
    And the mobile number should persist after page refresh

  Scenario: Update home phone number
    When I update "Home Phone" to "(555) 987-6543"
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And the home phone should be formatted as "(555) 987-6543"

  Scenario: Update work phone number
    When I update "Work Phone" to "(555) 246-8135"
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And the work phone should be formatted as "(555) 246-8135"

  Scenario: Validation - Invalid email format
    When I enter "invalid-email" in the "Email" field
    And I click "Save Changes"
    Then I should see an error message "Please enter a valid email address"
    And the profile should not be updated

  Scenario: Validation - Duplicate email
    When I enter an email already used by another user
    And I click "Save Changes"
    Then I should see an error message "This email is already in use"
    And the profile should not be updated

  Scenario: Validation - Invalid phone number format
    When I enter "123" in the "Mobile Number" field
    And I click "Save Changes"
    Then I should see an error message "Please enter a valid phone number"
    And the profile should not be updated

  Scenario: Auto-format phone numbers
    When I type "5551234567" in the "Mobile Number" field
    Then the field should automatically format to "(555) 123-4567"

  Scenario: Clear optional phone numbers
    Given I have home and work phone numbers saved
    When I clear the "Home Phone" field
    And I clear the "Work Phone" field
    And I click "Save Changes"
    Then I should see a success message "Profile updated successfully"
    And the home and work phone numbers should be removed from my profile
```

#### Technical Requirements

**Database Schema** (`profiles` table):
- `email` (text, unique, nullable)
- `mobile_number` (text, nullable)
- `country_code` (text, default: '+1')
- `home_phone` (text, nullable)
- `work_phone` (text, nullable)

**Validation Rules**:
- Email: Valid email format, unique across users, max 255 characters
- Mobile Number: Valid US phone format (10 digits)
- Home Phone: Valid US phone format (10 digits), optional
- Work Phone: Valid US phone format (10 digits), optional
- Country Code: Default to '+1' (US), future: support international

**Phone Number Formatting**:
- Input: Accept various formats (5551234567, 555-123-4567, (555) 123-4567)
- Storage: Store as E.164 format (+15551234567)
- Display: Show as formatted (555) 123-4567

**Email Verification Flow**:
1. User enters new email
2. System sends verification email via Edge Function
3. Old email remains active until verified
4. User clicks verification link
5. System updates email and confirms

**API Integration**:
```typescript
// Update contact details
await supabase
  .from('profiles')
  .update({
    email, // Requires verification
    mobile_number,
    country_code,
    home_phone,
    work_phone,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', user.id);

// Trigger email verification
await supabase.functions.invoke('validate-email', {
  body: { email, userId: user.id }
});
```

---

### US-PROFILE.4: Upload and Manage Avatar

**Story**: As a Pours Consumer user, I want to upload and manage my profile avatar so that I can personalize my account and be easily identified.

**Priority**: Medium  
**Story Points**: 5  
**Dependencies**: Supabase Storage (`avatars` bucket), Image processing library

#### Acceptance Criteria

```gherkin
Feature: Upload and Manage Avatar
  Epic: EPIC-PROFILE-002 - Manage Profile

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile"

  Scenario: Successfully upload new avatar
    When I click "Upload New" avatar button
    And I select a valid image file (JPG, PNG, or WebP)
    And the file size is less than 5MB
    Then the avatar should upload successfully
    And I should see a success message "Avatar updated successfully"
    And my new avatar should display in the profile section
    And my new avatar should appear in the navigation bar

  Scenario: Upload avatar with automatic optimization
    When I upload a large image (4MB, 4000x4000px)
    Then the system should optimize the image
    And the stored avatar should be less than 500KB
    And the avatar should be resized to 400x400px
    And the image quality should remain high

  Scenario: Remove existing avatar
    Given I have an avatar uploaded
    When I click "Remove Avatar"
    And I confirm the removal
    Then I should see a success message "Avatar removed successfully"
    And my profile should display a default avatar (initials)
    And the avatar file should be deleted from storage

  Scenario: View avatar fallback
    Given I have not uploaded an avatar
    Then I should see my initials as the avatar
    And the initials should be derived from my first and last name

  Scenario: Validation - Invalid file type
    When I attempt to upload a PDF file
    Then I should see an error message "Please upload a valid image file (JPG, PNG, or WebP)"
    And the avatar should not be updated

  Scenario: Validation - File size exceeds limit
    When I attempt to upload an image larger than 5MB
    Then I should see an error message "File size must be less than 5MB"
    And the avatar should not be updated

  Scenario: Handle upload failure
    Given the network connection is interrupted
    When I upload an avatar
    Then I should see an error message "Failed to upload avatar. Please try again."
    And my previous avatar should remain unchanged

  Scenario: Avatar persists across sessions
    Given I have uploaded an avatar
    When I log out and log back in
    Then my avatar should still be displayed
    And the avatar should appear in the navigation bar
```

#### Technical Requirements

**Supabase Storage Setup**:
- Bucket name: `avatars`
- Public access: `true`
- File size limit: 5MB per file
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

**Storage Policies**:
```sql
-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Image Processing**:
- Resize to 400x400px (square)
- Maintain aspect ratio with center crop
- Optimize quality (80% JPEG quality)
- Convert to WebP for smaller file size
- Generate thumbnail (100x100px) for navigation

**File Naming Convention**:
```
{user_id}/avatar.webp
{user_id}/avatar-thumb.webp
```

**API Integration**:
```typescript
// Upload avatar
const file = event.target.files[0];
const filePath = `${user.id}/avatar.webp`;

const { error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(filePath, file, { upsert: true });

// Update user metadata
const avatarUrl = supabase.storage
  .from('avatars')
  .getPublicUrl(filePath).data.publicUrl;

await supabase.auth.updateUser({
  data: { avatar_url: avatarUrl }
});

// Remove avatar
await supabase.storage
  .from('avatars')
  .remove([`${user.id}/avatar.webp`]);

await supabase.auth.updateUser({
  data: { avatar_url: null }
});
```

**Fallback Avatar**:
- Display user initials (first letter of first name + first letter of last name)
- Use consistent background color based on user ID hash
- Font: 24px, bold, white text

---

### US-PROFILE.5: Real-time Profile Validation

**Story**: As a Pours Consumer user, I want real-time validation feedback when editing my profile so that I can correct errors before submitting the form.

**Priority**: Medium  
**Story Points**: 3  
**Dependencies**: Zod validation library, React Hook Form

#### Acceptance Criteria

```gherkin
Feature: Real-time Profile Validation
  Epic: EPIC-PROFILE-002 - Manage Profile

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile"

  Scenario: Real-time email validation
    When I type an email address in the "Email" field
    And I pause typing for 500ms
    Then the field should validate in real-time
    And if invalid, I should see an inline error message
    And the "Save Changes" button should be disabled

  Scenario: Real-time phone number validation
    When I type a phone number in the "Mobile Number" field
    And the number is incomplete
    Then I should see an inline hint "Format: (555) 123-4567"
    And the "Save Changes" button should be disabled

  Scenario: Real-time birthday validation
    When I enter a date in the "Birthday" field
    And the date indicates age less than 21
    Then I should immediately see an error "You must be 21 or older"
    And the "Save Changes" button should be disabled

  Scenario: Clear error on valid input
    Given I have an error message displayed
    When I correct the input to be valid
    Then the error message should disappear
    And the field should show a success indicator
    And the "Save Changes" button should be enabled

  Scenario: Field-level error indicators
    When I blur from a required field that is empty
    Then the field should display a red border
    And an error message should appear below the field
    And an error icon should appear next to the field label

  Scenario: Success indicators
    When I enter valid data in a field
    And I blur from the field
    Then the field should display a green border
    And a success checkmark should appear
```

#### Technical Requirements

**Validation Library**: Zod with React Hook Form

**Validation Schema**:
```typescript
const profileSchema = z.object({
  first_name: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  
  last_name: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  
  mobile_number: z.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number")
    .optional(),
  
  birthday: z.string()
    .refine((date) => {
      const age = calculateAge(date);
      return age >= 21;
    }, "You must be 21 or older to use this service"),
  
  postal_code: z.string()
    .regex(/^\d{5}$/, "Postal code must be 5 digits")
    .optional()
});
```

**Validation Timing**:
- onChange: Format phone numbers, postal codes
- onBlur: Validate individual fields
- onSubmit: Validate entire form
- Debounce: 500ms for async validations (email uniqueness)

**Visual Feedback**:
- Error state: Red border (#ef4444), error icon, error message
- Success state: Green border (#10b981), checkmark icon
- Focus state: Blue border (primary color)
- Disabled state: Gray background, cursor not-allowed

---

### US-PROFILE.6: Profile Completion Indicator

**Story**: As a Pours Consumer user, I want to see my profile completion status so that I am motivated to provide complete information and unlock additional features.

**Priority**: Low  
**Story Points**: 3  
**Dependencies**: Profile calculation logic

#### Acceptance Criteria

```gherkin
Feature: Profile Completion Indicator
  Epic: EPIC-PROFILE-002 - Manage Profile

  Background:
    Given I am logged in as a Pours Consumer user

  Scenario: Display profile completion percentage
    Given I navigate to "Manage Profile"
    Then I should see a progress bar showing my profile completion percentage
    And I should see text "Profile 60% Complete"

  Scenario: Calculate completion based on fields
    Given the following fields are considered for completion:
      | Field          | Weight |
      | First Name     | 15%    |
      | Last Name      | 15%    |
      | Email          | 20%    |
      | Mobile Number  | 15%    |
      | Birthday       | 10%    |
      | Address        | 15%    |
      | Avatar         | 10%    |
    When I have filled First Name, Last Name, and Email
    Then my profile completion should be 50%

  Scenario: Show missing fields prompt
    Given my profile is less than 100% complete
    When I view "Manage Profile"
    Then I should see a section "Complete Your Profile"
    And I should see a list of missing fields
    And each missing field should have a "Fill in" link

  Scenario: Complete profile achievement
    Given my profile is less than 100% complete
    When I fill in all required fields
    Then I should see a success message "Profile Complete! 🎉"
    And the completion indicator should show 100%
    And I should earn bonus loyalty points

  Scenario: Completion indicator in navigation
    Given my profile is less than 75% complete
    When I view any page with the navigation bar
    Then I should see a small indicator badge on my avatar
    And the badge should show the completion percentage
```

#### Technical Requirements

**Profile Completion Calculation**:
```typescript
const calculateProfileCompletion = (profile: Profile): number => {
  const weights = {
    first_name: 15,
    last_name: 15,
    email: 20,
    mobile_number: 15,
    birthday: 10,
    address: 15, // Complete if address_line_1, city, state, postal_code filled
    avatar: 10
  };
  
  let totalWeight = 0;
  
  if (profile.first_name) totalWeight += weights.first_name;
  if (profile.last_name) totalWeight += weights.last_name;
  if (profile.email) totalWeight += weights.email;
  if (profile.mobile_number) totalWeight += weights.mobile_number;
  if (profile.birthday) totalWeight += weights.birthday;
  if (profile.address_line_1 && profile.city && profile.state && profile.postal_code) {
    totalWeight += weights.address;
  }
  if (profile.avatar_url) totalWeight += weights.avatar;
  
  return totalWeight;
};
```

**UI Components**:
- Progress bar (visual percentage)
- Percentage text
- Missing fields list with quick-fill links
- Completion badge in navigation

**Gamification**:
- Award 50 bonus points on 100% profile completion
- Show achievement notification
- Track completion date in user_rewards table

---

### US-PROFILE.7: Mobile-Responsive Profile Management

**Story**: As a Pours Consumer user accessing the app on mobile, I want a responsive profile management interface so that I can easily edit my information on any device.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: Responsive design patterns, Touch-optimized inputs

#### Acceptance Criteria

```gherkin
Feature: Mobile-Responsive Profile Management
  Epic: EPIC-PROFILE-002 - Manage Profile

  Scenario: Mobile layout adaptation
    Given I access "Manage Profile" on a mobile device (< 768px width)
    Then the form should stack vertically
    And form fields should be full width
    And the avatar upload should be centered
    And touch targets should be at least 44x44px

  Scenario: Touch-optimized inputs
    Given I am on a mobile device
    When I tap on any input field
    Then the appropriate mobile keyboard should appear
    And the field should zoom without zooming the entire page
    And the field should have sufficient padding for touch

  Scenario: Simplified mobile navigation
    Given I am on a mobile device
    When I view "Manage Profile"
    Then I should see collapsible sections for:
      | Personal Information |
      | Contact Details      |
      | Address              |
      | Avatar               |
    And I can expand/collapse each section independently

  Scenario: Mobile avatar upload
    Given I am on a mobile device
    When I tap "Upload New" avatar
    Then I should see mobile-native options:
      | Take Photo       |
      | Choose from Library |
      | Remove Avatar    |
    And the camera should open for "Take Photo"
    And the photo library should open for "Choose from Library"

  Scenario: Mobile form submission
    Given I have edited my profile on mobile
    When I tap "Save Changes"
    Then the button should show a loading spinner
    And the button should be disabled during save
    And I should see a toast notification on success
    And the notification should not block the screen

  Scenario: Horizontal scroll prevention
    Given I am on any mobile device
    When I view "Manage Profile"
    Then no content should cause horizontal scrolling
    And all text should wrap appropriately
    And all images should scale to fit the viewport
```

#### Technical Requirements

**Responsive Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile-Specific Styling**:
```css
@media (max-width: 768px) {
  .profile-form {
    padding: 1rem;
  }
  
  .form-field {
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .collapsible-section {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}
```

**Input Optimizations**:
- Email: `type="email"` (triggers email keyboard)
- Phone: `type="tel"` (triggers number keyboard)
- Birthday: Native date picker on mobile
- Postal Code: `inputmode="numeric"` (triggers number keyboard)

**Avatar Upload on Mobile**:
- Use HTML5 `<input type="file" accept="image/*" capture="environment">`
- `capture="environment"` for camera access
- Native mobile UI for photo selection
- Compress images before upload on mobile to save bandwidth

---

## Non-Functional Requirements

### Performance
- Profile page load time: < 2 seconds
- Profile update response time: < 1 second
- Avatar upload time: < 5 seconds (for files up to 5MB)
- Real-time validation response: < 100ms

### Security
- All profile updates require authentication
- RLS policies enforce user-specific data access
- Email changes require verification
- Avatar uploads are scanned for malicious content
- Sensitive data (email, phone) logged in audit trail

### Usability
- Form inputs have clear labels and placeholders
- Error messages are specific and actionable
- Success feedback is immediate and clear
- Navigation between sections is intuitive
- Profile auto-saves drafts (future enhancement)

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader announcements for validation errors
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators on all interactive elements
- ARIA labels for all form inputs

### Data Privacy
- Users can view all data stored about them
- Users can export their profile data (GDPR)
- Users can request deletion of their profile (CCPA)
- Profile changes logged in audit trail
- Sensitive data encrypted at rest

---

## Technical Architecture

### Component Structure
```
ManageProfile (Container)
├── PageHeader
├── AvatarUpload
│   ├── Avatar
│   ├── AvatarImage
│   └── AvatarFallback
├── PersonalInfoSection
│   ├── Input (First Name)
│   ├── Input (Last Name)
│   ├── DatePicker (Birthday)
│   └── Select (Gender)
├── ContactDetailsSection
│   ├── Input (Email)
│   ├── Input (Mobile Number)
│   ├── Input (Home Phone)
│   └── Input (Work Phone)
├── AddressSection
│   ├── Input (Address Line 1)
│   ├── Input (Address Line 2)
│   ├── Input (City)
│   ├── Select (State)
│   └── Input (Postal Code)
└── ProfileCompletion
    ├── Progress
    └── MissingFieldsList
```

### State Management
- **useUserProfile**: Hook for fetching/updating profile data
- **useForm**: React Hook Form for form state management
- **useAvatarUpload**: Hook for avatar upload/removal logic
- **useProfileCompletion**: Hook for calculating completion percentage

### API Endpoints
- `GET /profiles?user_id=eq.{user_id}`: Fetch user profile
- `PATCH /profiles?user_id=eq.{user_id}`: Update profile fields
- `POST /storage/v1/object/avatars/{user_id}/avatar.webp`: Upload avatar
- `DELETE /storage/v1/object/avatars/{user_id}/avatar.webp`: Remove avatar

---

## Integration Requirements

### Supabase Integration
- **Auth**: User must be authenticated
- **Database**: Read/write access to `profiles` table
- **Storage**: Read/write access to `avatars` bucket
- **Edge Functions**: Email validation, avatar optimization

### Third-Party Services (Future)
- **Address Validation**: Google Maps API, USPS API
- **Email Verification**: SendGrid, AWS SES
- **Image Processing**: Sharp, Cloudinary

---

## Testing Strategy

### Unit Tests
- Profile validation logic
- Phone number formatting
- Email format validation
- Birthday age calculation
- Profile completion calculation

### Integration Tests
- Profile update flow (happy path)
- Profile update with validation errors
- Avatar upload and removal
- Email verification flow
- Mobile responsive behavior

### E2E Tests
```gherkin
Feature: End-to-End Profile Management
  Scenario: Complete profile setup journey
    Given a new user has just signed up
    When they navigate to "Manage Profile"
    And they fill in all personal information
    And they add their contact details
    And they enter their address
    And they upload an avatar
    And they click "Save Changes"
    Then their profile should be 100% complete
    And they should earn 50 bonus points
    And they should see a success message
```

---

## Success Metrics & KPIs

### Engagement Metrics
- Profile completion rate: Target > 85%
- Average fields filled per user: Target > 6/7
- Avatar upload rate: Target > 60%
- Profile update frequency: Target 1-2 updates/month

### Performance Metrics
- Profile page load time: Target < 2s
- Form validation response time: Target < 100ms
- Avatar upload success rate: Target > 95%

### User Satisfaction
- Profile management NPS: Target > 50
- User satisfaction rating: Target > 4.2/5
- Support tickets related to profile: Target < 2% of total

---

## Traceability Matrix

| User Story | Epic | Acceptance Criteria | Test Cases | Components |
|-----------|------|---------------------|------------|------------|
| US-PROFILE.1 | EPIC-PROFILE-002 | 7 Scenarios | TC-PROF-001 to TC-PROF-007 | ManageProfile, PersonalInfoSection |
| US-PROFILE.2 | EPIC-PROFILE-002 | 6 Scenarios | TC-PROF-008 to TC-PROF-013 | ManageProfile, AddressSection |
| US-PROFILE.3 | EPIC-PROFILE-002 | 9 Scenarios | TC-PROF-014 to TC-PROF-022 | ManageProfile, ContactDetailsSection |
| US-PROFILE.4 | EPIC-PROFILE-002 | 8 Scenarios | TC-PROF-023 to TC-PROF-030 | AvatarUpload |
| US-PROFILE.5 | EPIC-PROFILE-002 | 6 Scenarios | TC-PROF-031 to TC-PROF-036 | Form validation logic |
| US-PROFILE.6 | EPIC-PROFILE-002 | 5 Scenarios | TC-PROF-037 to TC-PROF-041 | ProfileCompletion |
| US-PROFILE.7 | EPIC-PROFILE-002 | 6 Scenarios | TC-PROF-042 to TC-PROF-047 | Responsive components |

---

## Future Enhancements

### Phase 2 Enhancements
- **Social Media Integration**: Link Instagram, Facebook profiles
- **Profile Themes**: Customizable profile card themes
- **Profile Sharing**: Share profile with friends (QR code)
- **Advanced Address Validation**: Real-time address verification
- **International Support**: Support for international addresses and phone numbers

### Phase 3 Enhancements
- **Profile Analytics**: View profile views, interactions
- **Profile Verification**: Verified badge for ID-verified users
- **Profile Import**: Import data from other platforms
- **Bulk Edit**: Edit multiple fields in a single modal

---

## Compliance & Privacy

### GDPR Compliance
- Users can view all profile data
- Users can export profile data (JSON format)
- Users can request profile deletion
- All profile changes logged in audit trail

### CCPA Compliance
- Clear notice of data collection
- Opt-out options for data sharing
- Data deletion requests honored within 45 days

### Age Verification
- Birthday required for alcoholic beverage orders
- Users must be 21+ to create account
- Age validation on profile update

---

## Appendix

### Related Documentation
- [Account Dashboard Features](./account-dashboard-features.md)
- [User Authentication & Management](./epic-1-core-auth.md)
- [Data Privacy & Compliance](./compliance-standards.md)

### Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial documentation created |

---

**Document Status**: Approved  
**Last Review Date**: 2025-11-22  
**Next Review Date**: 2026-02-22
