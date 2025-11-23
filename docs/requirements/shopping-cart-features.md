# Shopping Cart Management - Product Requirements Document

**Document Version:** 1.0  
**Last Updated:** 2025-11-23  
**Epic ID:** CNS-0008  
**Epic Name:** Shopping Cart Management  
**Feature Area:** Product Discovery & Ordering  
**Status:** ✅ IMPLEMENTED  
**Priority:** P0 - Critical

---

## Table of Contents
1. [Epic Overview](#epic-overview)
2. [User Stories](#user-stories)
3. [Technical Requirements](#technical-requirements)
4. [Data Models](#data-models)
5. [Security Considerations](#security-considerations)
6. [Success Metrics](#success-metrics)

---

## Epic Overview

### Business Context
The Shopping Cart is a critical component of the e-commerce flow, allowing users to collect products before checkout. It must provide a seamless experience across sessions, support both guest and authenticated users, and implement cart recovery mechanisms to reduce abandonment.

### Goals
- Enable users to easily add, update, and remove products from their cart
- Persist cart data across sessions for both guest and authenticated users
- Implement abandoned cart recovery to increase conversion rates
- Provide clear visibility of cart contents and total cost
- Support venue-specific carts (cart clears when venue changes)

### Success Criteria
- Cart persistence rate > 95%
- Cart abandonment recovery email open rate > 25%
- Average items per cart > 2.5
- Cart-to-checkout conversion rate > 60%

### Dependencies
- **Frontend Components:** `CartSummary.tsx`, `CartIcon.tsx`
- **Hooks:** `useCart.ts`, `useEnhancedCart.ts`, `useAbandonedCart.ts`
- **Database Tables:** `abandoned_carts`
- **Edge Functions:** `send-abandoned-cart-email`, `send-abandoned-cart-reminders`

---

## User Stories

### US-CART.1: Add Products to Cart
**Status:** ✅ IMPLEMENTED  
**Story Points:** 5  
**Priority:** P0 - Critical

**As a** Pours Consumer user  
**I want to** add products to my shopping cart  
**So that** I can collect items before checkout

#### Acceptance Criteria

```gherkin
Feature: Add Products to Cart
  As a user browsing the menu
  I want to add products to my cart
  So that I can purchase multiple items in one order

  Background:
    Given I have selected a venue
    And I am viewing the product menu

  Scenario: Successfully add a product to empty cart
    Given my cart is empty
    When I click "Add to Cart" on a product
    Then the product should be added to my cart with quantity 1
    And the cart badge should display "1"
    And I should see a success toast notification
    And the product price should be added to the cart total

  Scenario: Add the same product multiple times
    Given I have "Classic Burger" in my cart with quantity 1
    When I click "Add to Cart" on "Classic Burger" again
    Then the quantity should increase to 2
    And the cart total should reflect 2x the product price
    And the cart badge should display "2"

  Scenario: Add different products to cart
    Given I have "Classic Burger" in my cart
    When I add "French Fries" to my cart
    Then my cart should contain both products
    And the cart badge should display "2"
    And the cart total should be the sum of both products

  Scenario: Add product to cart as guest user
    Given I am not logged in
    When I add a product to my cart
    Then the product should be added successfully
    And my cart should be associated with my session ID
    And the cart should persist across page refreshes

  Scenario: Add product to cart as authenticated user
    Given I am logged in
    When I add a product to my cart
    Then the product should be added successfully
    And my cart should be associated with my user ID
    And the cart should persist across devices
```

#### Technical Requirements

**Frontend:**
- Display "Add to Cart" button on product cards and detail pages
- Show loading state while adding product
- Display success/error toast notifications
- Update cart badge count in real-time
- Validate product availability before adding

**State Management:**
- Use `useCart` hook for cart operations
- Store cart items in local storage (guest) or Supabase (authenticated)
- Update cart state optimistically with rollback on error

**Validation:**
- Verify product exists and is available
- Verify product belongs to selected venue
- Enforce quantity limits if applicable

---

### US-CART.2: Update Cart Item Quantities
**Status:** ✅ IMPLEMENTED  
**Story Points:** 3  
**Priority:** P0 - Critical

**As a** Pours Consumer user  
**I want to** adjust the quantity of items in my cart  
**So that** I can order the exact amount I need

#### Acceptance Criteria

```gherkin
Feature: Update Cart Item Quantities
  As a user with items in my cart
  I want to change item quantities
  So that I can adjust my order before checkout

  Background:
    Given I have items in my cart
    And I am viewing my cart

  Scenario: Increase item quantity
    Given I have "Classic Burger" with quantity 1 in my cart
    When I click the increase quantity button
    Then the quantity should change to 2
    And the item subtotal should double
    And the cart total should update accordingly
    And the changes should persist

  Scenario: Decrease item quantity
    Given I have "Classic Burger" with quantity 3 in my cart
    When I click the decrease quantity button
    Then the quantity should change to 2
    And the item subtotal should update
    And the cart total should update accordingly
    And the changes should persist

  Scenario: Decrease quantity to zero
    Given I have "Classic Burger" with quantity 1 in my cart
    When I click the decrease quantity button
    Then the item should be removed from my cart
    And I should see a confirmation message
    And the cart total should update

  Scenario: Manually enter quantity
    Given I have "Classic Burger" with quantity 1 in my cart
    When I manually enter "5" in the quantity field
    Then the quantity should update to 5
    And the item subtotal should reflect 5x the price
    And the cart total should update accordingly

  Scenario: Enter invalid quantity
    Given I have "Classic Burger" in my cart
    When I enter "0" or a negative number in the quantity field
    Then I should see an error message
    And the quantity should not change
    And the previous valid quantity should be restored
```

#### Technical Requirements

**UI Components:**
- Quantity stepper (+ and - buttons)
- Direct quantity input field
- Real-time price updates
- Debounced updates to prevent excessive API calls

**Validation:**
- Minimum quantity: 1
- Maximum quantity: 99 (configurable)
- Only allow positive integers
- Validate on blur and on change

---

### US-CART.3: Remove Items from Cart
**Status:** ✅ IMPLEMENTED  
**Story Points:** 3  
**Priority:** P0 - Critical

**As a** Pours Consumer user  
**I want to** remove items from my cart  
**So that** I can remove products I no longer want

#### Acceptance Criteria

```gherkin
Feature: Remove Items from Cart
  As a user with items in my cart
  I want to remove specific items
  So that I only checkout with products I want

  Background:
    Given I have multiple items in my cart

  Scenario: Remove single item from cart
    Given I have 3 different items in my cart
    When I click the remove button on one item
    Then that item should be removed from my cart
    And the cart total should update
    And the cart badge count should decrease by 1
    And I should see a confirmation toast

  Scenario: Remove last item from cart
    Given I have only 1 item in my cart
    When I click the remove button
    Then my cart should be empty
    And the cart badge should not be visible
    And I should see "Your cart is empty" message
    And the cart total should show $0.00

  Scenario: Undo item removal
    Given I have removed an item from my cart
    When I click "Undo" in the notification toast
    Then the item should be restored to my cart
    And the cart total should be recalculated
    And the cart badge count should increase

  Scenario: Clear entire cart
    Given I have multiple items in my cart
    When I click "Clear Cart" button
    Then I should see a confirmation dialog
    When I confirm the action
    Then all items should be removed
    And my cart should be empty
    And I should see a success message
```

#### Technical Requirements

**UI/UX:**
- Remove/delete icon button on each cart item
- "Clear Cart" button in cart header
- Confirmation dialog for "Clear Cart"
- Undo functionality with 5-second window
- Success toast notifications

**State Management:**
- Optimistic UI updates
- Maintain removed items in memory for undo
- Sync with backend/storage after successful removal

---

### US-CART.4: View Cart Summary
**Status:** ✅ IMPLEMENTED  
**Story Points:** 5  
**Priority:** P0 - Critical

**As a** Pours Consumer user  
**I want to** view a summary of my cart contents  
**So that** I can review my order before checkout

#### Acceptance Criteria

```gherkin
Feature: View Cart Summary
  As a user with items in my cart
  I want to see a detailed summary
  So that I can review my order before proceeding to checkout

  Scenario: View cart summary with items
    Given I have 3 items in my cart
    When I open the cart summary
    Then I should see a list of all cart items
    And each item should display:
      | Field          | Example               |
      | Product name   | "Classic Burger"      |
      | Quantity       | 2                     |
      | Unit price     | $12.99                |
      | Subtotal       | $25.98                |
      | Product image  | [thumbnail]           |
    And I should see the cart subtotal
    And I should see the total number of items
    And I should see a "Checkout" button

  Scenario: View empty cart
    Given my cart is empty
    When I open the cart summary
    Then I should see "Your cart is empty" message
    And I should see a "Browse Menu" button
    And the checkout button should be disabled

  Scenario: View cart from different pages
    Given I have items in my cart
    When I navigate to different pages
    Then the cart icon badge should always show the correct count
    And clicking the cart icon should open the cart summary
    And the cart contents should remain consistent

  Scenario: Cart summary shows venue information
    Given I have selected a venue and added items
    When I view the cart summary
    Then I should see the selected venue name
    And I should see venue address
    And I should see estimated preparation time
```

#### Technical Requirements

**Components:**
- `CartSummary.tsx` - Main cart display component
- `CartIcon.tsx` - Header cart icon with badge
- Cart item component with thumbnail, details, quantity controls
- Cart footer with totals and checkout button

**Display Information:**
- Product thumbnail images
- Product names and descriptions
- Individual quantities and prices
- Subtotals per item
- Cart total
- Number of items
- Venue information
- Checkout button (enabled/disabled based on cart state)

**Interactions:**
- Slide-in/modal cart display
- Inline quantity editing
- Remove item buttons
- Continue shopping button
- Proceed to checkout button

---

### US-CART.5: Cart Persistence Across Sessions
**Status:** ✅ IMPLEMENTED  
**Story Points:** 5  
**Priority:** P1 - High

**As a** Pours Consumer user  
**I want to** have my cart saved across sessions  
**So that** I don't lose my selections when I leave and return

#### Acceptance Criteria

```gherkin
Feature: Cart Persistence Across Sessions
  As a user building my cart
  I want my cart to be saved automatically
  So that I can continue my order later

  Scenario: Guest user cart persists across page refreshes
    Given I am not logged in
    And I have added items to my cart
    When I refresh the page
    Then my cart items should still be present
    And the cart total should be correct
    And my session ID should be maintained

  Scenario: Guest user cart persists across browser tabs
    Given I am not logged in
    And I have items in my cart
    When I open the site in a new tab
    Then my cart should be the same in both tabs
    And changes in one tab should reflect in the other

  Scenario: Authenticated user cart persists across devices
    Given I am logged in on device A
    And I add items to my cart
    When I log in on device B
    Then I should see the same cart items
    And the cart total should match

  Scenario: Guest cart merges with user cart after login
    Given I am not logged in
    And I have added 2 items to my cart as guest
    When I log in
    And I had 1 item in my authenticated cart previously
    Then my cart should contain all 3 items
    And duplicate items should have combined quantities
    And I should see a notification about merged items

  Scenario: Cart persists across browser sessions
    Given I have items in my cart
    When I close my browser
    And I reopen the browser and visit the site
    Then my cart items should still be present
    And the cart should be associated with my session/user

  Scenario: Cart clears when venue changes
    Given I have items in my cart from "Venue A"
    When I change my selected venue to "Venue B"
    Then I should see a warning dialog
    When I confirm the venue change
    Then my cart should be cleared
    And I should see a notification about the cleared cart
```

#### Technical Requirements

**Storage Strategy:**
- **Guest Users:** localStorage + session ID
- **Authenticated Users:** Supabase database with user_id
- Store cart data structure with venue_id

**Data Synchronization:**
- Sync localStorage with session storage
- Debounce cart updates to reduce database writes
- Handle cart merge logic on login
- Clear cart on venue change (after confirmation)

**Database:**
- Use `abandoned_carts` table for persistence
- Store `session_id` for guest users
- Store `user_id` for authenticated users
- Store `venue_id` to enforce venue-specific carts
- Store `cart_data` as JSON
- Track `updated_at` timestamp

**Hooks:**
- `useCart` - Main cart state management
- `useEnhancedCart` - Extended cart functionality
- `useAbandonedCart` - Cart recovery logic

---

### US-CART.6: Abandoned Cart Recovery Email
**Status:** ✅ IMPLEMENTED  
**Story Points:** 8  
**Priority:** P1 - High

**As a** business owner  
**I want to** send reminder emails to users who abandon their carts  
**So that** we can recover lost sales

#### Acceptance Criteria

```gherkin
Feature: Abandoned Cart Recovery Email
  As the system
  I want to send reminder emails for abandoned carts
  So that we can encourage users to complete their purchases

  Scenario: First reminder email sent after 1 hour
    Given a user has items in their cart
    And the user has not checked out
    And 1 hour has passed since last cart update
    When the abandoned cart reminder job runs
    Then the user should receive a first reminder email
    And the email should contain:
      | Element                    |
      | User's cart items          |
      | Product images             |
      | Product names and prices   |
      | Cart total                 |
      | "Complete Order" CTA       |
      | Opt-out link               |
    And the `first_reminder_sent_at` timestamp should be recorded

  Scenario: Second reminder email sent after 24 hours
    Given a user received the first reminder email
    And the user still has not checked out
    And 24 hours have passed since the first reminder
    When the abandoned cart reminder job runs
    Then the user should receive a second reminder email
    And the email should include a discount code or incentive
    And the `second_reminder_sent_at` timestamp should be recorded

  Scenario: No reminder sent if user opted out
    Given a user has an abandoned cart
    And the user clicked the opt-out link
    When the abandoned cart reminder job runs
    Then no reminder email should be sent
    And the `opted_out` flag should be true

  Scenario: No reminder sent if cart was converted
    Given a user has an abandoned cart
    And the user completed their checkout
    When the abandoned cart reminder job runs
    Then no reminder email should be sent
    And the `converted_to_order` flag should be true

  Scenario: User clicks "Complete Order" link in email
    Given a user received an abandoned cart email
    When the user clicks the "Complete Order" link
    Then they should be redirected to the checkout page
    And their cart should be pre-populated with the abandoned items
    And they should be able to complete the order

  Scenario: Guest user cart recovery
    Given a guest user has an abandoned cart with email
    And 1 hour has passed
    When the reminder job runs
    Then an email should be sent to the guest email
    And the email should include a unique recovery link
    And clicking the link should restore the cart
```

#### Technical Requirements

**Edge Functions:**
- `send-abandoned-cart-email` - Sends individual reminder emails
- `send-abandoned-cart-reminders` - Scheduled job to find and process abandoned carts

**Email Template:**
- Responsive HTML email design
- Product images and details
- Cart total prominently displayed
- "Complete Your Order" CTA button
- Opt-out link
- Discount code (second reminder only)

**Database Fields:**
- `abandoned_carts.first_reminder_sent_at`
- `abandoned_carts.second_reminder_sent_at`
- `abandoned_carts.opted_out`
- `abandoned_carts.opt_out_token`
- `abandoned_carts.converted_to_order`
- `abandoned_carts.guest_email`

**Scheduling:**
- Run reminder job every 15 minutes
- Check for carts abandoned > 1 hour (first reminder)
- Check for carts abandoned > 24 hours (second reminder)
- Only send if not already sent and not opted out

**Opt-Out Mechanism:**
- Generate unique opt-out token
- Create opt-out endpoint
- Mark cart as opted_out when link clicked
- Respect opt-out across all cart instances

---

### US-CART.7: Cart Badge Notification Count
**Status:** ✅ IMPLEMENTED  
**Story Points:** 2  
**Priority:** P2 - Medium

**As a** Pours Consumer user  
**I want to** see the number of items in my cart at all times  
**So that** I'm aware of my cart status while browsing

#### Acceptance Criteria

```gherkin
Feature: Cart Badge Notification Count
  As a user browsing the site
  I want to see a badge showing my cart item count
  So that I always know how many items I have

  Scenario: Display cart badge with item count
    Given I have 3 items in my cart
    When I view any page on the site
    Then the cart icon should display a badge with "3"
    And the badge should be visible and prominent

  Scenario: Badge updates when adding items
    Given the cart badge shows "2"
    When I add a new item to my cart
    Then the badge should update to "3" immediately
    And the update should be animated

  Scenario: Badge updates when removing items
    Given the cart badge shows "5"
    When I remove 2 items from my cart
    Then the badge should update to "3" immediately

  Scenario: Badge updates when changing quantities
    Given I have 2 items in my cart (1 of each)
    And the cart badge shows "2"
    When I increase the quantity of one item to 3
    Then the badge should still show "2" (unique items)
    # OR if counting total quantity:
    # Then the badge should update to "4" (total quantity)

  Scenario: Hide badge when cart is empty
    Given the cart badge shows "1"
    When I remove the last item from my cart
    Then the badge should not be visible
    And only the cart icon should be shown

  Scenario: Badge visible across all pages
    Given I have items in my cart
    When I navigate between different pages
    Then the cart badge should remain visible on every page
    And the count should be accurate and consistent

  Scenario: Badge animation on update
    Given the cart badge shows "2"
    When the count updates to "3"
    Then the badge should animate (pulse or bounce)
    And the animation should draw user attention
```

#### Technical Requirements

**Component:**
- `CartIcon.tsx` with badge overlay

**Badge Behavior:**
- Display count of unique items (not total quantity)
- Position badge in top-right of cart icon
- Use semantic color (primary or accent)
- Hide when count is 0
- Animate on value change

**Styling:**
- Small circular badge
- White text on colored background
- Proper contrast for accessibility
- Responsive sizing
- Z-index to appear above icon

**State:**
- Subscribe to cart state changes
- Update badge in real-time
- Persist across navigation
- Sync across tabs (for authenticated users)

---

## Technical Requirements

### Frontend Components

```typescript
// Main Cart Components
src/components/CartSummary.tsx       // Cart display and management
src/components/CartIcon.tsx          // Header cart icon with badge
src/components/molecules/CartWithIcon.tsx  // Cart icon wrapper

// Supporting Components
src/components/ProductCard.tsx       // Add to cart button
src/pages/ProductDetail.tsx         // Product detail add to cart
```

### Hooks

```typescript
// src/hooks/useCart.ts
interface UseCartReturn {
  items: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  isLoading: boolean;
}

// src/hooks/useEnhancedCart.ts
interface UseEnhancedCartReturn extends UseCartReturn {
  abandonedCartId: string | null;
  saveAbandonedCart: () => Promise<void>;
  restoreAbandonedCart: (cartId: string) => Promise<void>;
}

// src/hooks/useAbandonedCart.ts
interface UseAbandonedCartReturn {
  trackAbandonedCart: (email?: string) => Promise<void>;
  optOutFromReminders: (token: string) => Promise<void>;
}
```

### Database Schema

```sql
-- abandoned_carts table (already exists)
CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  venue_id UUID REFERENCES venues,
  cart_data JSONB NOT NULL,
  total_amount NUMERIC,
  guest_email TEXT,
  guest_phone TEXT,
  first_reminder_sent_at TIMESTAMPTZ,
  second_reminder_sent_at TIMESTAMPTZ,
  opt_out_token TEXT,
  opted_out BOOLEAN DEFAULT false,
  converted_to_order BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cart Data JSON Structure
{
  "items": [
    {
      "productId": "uuid",
      "name": "Classic Burger",
      "price": 12.99,
      "quantity": 2,
      "image_url": "...",
      "venue_id": "uuid"
    }
  ],
  "venue": {
    "id": "uuid",
    "name": "Downtown Bar & Grill"
  },
  "subtotal": 25.98,
  "itemCount": 2
}
```

### Edge Functions

**send-abandoned-cart-email**
```typescript
// Input: { cartId: string, email: string, cartData: object }
// Output: { success: boolean, messageId: string }
// Sends a single abandoned cart reminder email
```

**send-abandoned-cart-reminders**
```typescript
// Scheduled function (runs every 15 minutes)
// Finds abandoned carts and sends appropriate reminders
// Checks: first_reminder (1hr), second_reminder (24hr)
```

---

## Data Models

### CartItem Interface
```typescript
interface CartItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
  venue_id: string;
  alcohol_content?: number;
  volume_ml?: number;
}
```

### Cart State
```typescript
interface CartState {
  items: CartItem[];
  venueId: string | null;
  venueName: string | null;
  subtotal: number;
  itemCount: number;
  lastUpdated: string;
  sessionId?: string;
  userId?: string;
}
```

---

## Security Considerations

### Data Privacy
- Cart data contains purchasing preferences
- Implement secure storage for cart data
- Email addresses must be validated before sending reminders
- Opt-out tokens must be cryptographically secure

### RLS Policies
```sql
-- Guest carts accessible by session
CREATE POLICY "Guest carts are accessible by session"
ON abandoned_carts
FOR ALL
USING (user_id IS NULL AND session_id IS NOT NULL);

-- Users can manage their own carts
CREATE POLICY "Users can manage their own abandoned carts"
ON abandoned_carts
FOR ALL
USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));
```

### Input Validation
- Validate product IDs exist and belong to selected venue
- Validate quantities (min: 1, max: 99)
- Sanitize email addresses for abandoned cart recovery
- Verify product availability before adding to cart

### Rate Limiting
- Limit cart updates to prevent spam (max 10/minute)
- Limit abandoned cart emails (max 2 per cart)
- Implement opt-out to respect user preferences

---

## Success Metrics

### Conversion Metrics
- **Cart abandonment rate:** < 40%
- **Cart recovery email open rate:** > 25%
- **Cart recovery conversion rate:** > 10%
- **Average items per cart:** > 2.5

### Technical Metrics
- **Cart load time:** < 500ms
- **Add to cart response time:** < 200ms
- **Cart persistence success rate:** > 99%
- **Abandoned cart email delivery rate:** > 95%

### User Experience
- **Cart interaction satisfaction:** > 4.2/5
- **Mobile cart usability score:** > 85%
- **Cart-to-checkout click-through rate:** > 60%

---

## Future Enhancements

### Phase 2
- Save for later functionality
- Product recommendations in cart
- Bundle discounts
- Gift wrapping options

### Phase 3
- Social sharing of carts
- Group/shared carts
- Subscription/recurring orders
- Advanced abandoned cart analytics

---

## Revision History

| Version | Date       | Author | Changes                          |
|---------|------------|--------|----------------------------------|
| 1.0     | 2025-11-23 | AI     | Initial documentation creation   |

---

## Approvals

| Role                | Name | Date | Signature |
|---------------------|------|------|-----------|
| Product Owner       |      |      |           |
| Technical Lead      |      |      |           |
| QA Lead             |      |      |           |
