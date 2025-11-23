# Stripe Payment Integration - Product Requirements

**Epic:** CNS-0019 - Stripe Payment Integration  
**Feature Area:** Payment Processing  
**Status:** 📋 Planned  
**Priority:** P0 - Critical

---

## Table of Contents
- [Epic Overview](#epic-overview)
- [User Stories](#user-stories)
  - [US-STRIPE.1: Add Payment Method](#us-stripe1-add-payment-method)
  - [US-STRIPE.2: Process One-Time Payment](#us-stripe2-process-one-time-payment)
  - [US-STRIPE.3: Manage Saved Payment Methods](#us-stripe3-manage-saved-payment-methods)
  - [US-STRIPE.4: Handle Payment Failures](#us-stripe4-handle-payment-failures)
  - [US-STRIPE.5: Process Refunds](#us-stripe5-process-refunds)
  - [US-STRIPE.6: Subscription Payment Management (Future)](#us-stripe6-subscription-payment-management-future)
  - [US-STRIPE.7: Payment Security & PCI Compliance](#us-stripe7-payment-security--pci-compliance)
  - [US-STRIPE.8: Payment History & Receipts](#us-stripe8-payment-history--receipts)
- [Technical Requirements](#technical-requirements)
- [Stripe Integration](#stripe-integration)
- [Database Schema](#database-schema)
- [API & Edge Functions](#api--edge-functions)
- [Security & Compliance](#security--compliance)

---

## Epic Overview

### Description
The Stripe Payment Integration epic enables secure, PCI-compliant payment processing for the Pours Consumer application. This integration handles one-time payments for orders, manages saved payment methods, processes refunds, and provides payment analytics. The integration leverages Lovable's custom Stripe integration for seamless payment processing.

### Business Value
- **Revenue Enablement**: Core functionality to accept payments and generate revenue
- **Security**: PCI-compliant payment processing protects customer data
- **User Experience**: Seamless checkout reduces cart abandonment
- **Trust**: Industry-standard payment processing builds customer confidence
- **Scalability**: Stripe infrastructure handles growth from launch to millions of users

### Success Metrics
- Payment success rate: >98%
- Checkout completion rate: >75%
- Average payment processing time: <3 seconds
- Payment failure recovery rate: >40%
- Saved payment method adoption: >60%
- Customer satisfaction with payment process: >4.5/5
- Zero payment data breaches
- PCI compliance audit: 100% pass

### Acceptance Criteria
- Secure payment method collection via Stripe Elements
- One-time payment processing for orders
- Saved payment method management (add, remove, set default)
- Failed payment handling and retry mechanisms
- Refund processing for cancelled/returned orders
- Payment history and receipt access
- PCI DSS compliance
- 3D Secure (SCA) support for European payments
- Mobile-responsive payment forms
- Accessibility compliant payment interface

---

## User Stories

### US-STRIPE.1: Add Payment Method

**As a** Pours Consumer user  
**I want to** securely add a payment method to my account  
**So that** I can quickly checkout without re-entering card details

#### Background
Collecting and securely storing payment methods is fundamental to a frictionless checkout experience. Stripe Elements provides PCI-compliant card input that never exposes sensitive data to the application.

#### Value Proposition
- Reduces checkout friction for repeat customers
- Improves conversion rates through faster checkout
- Secure tokenization protects customer data
- Enables subscription payments (future)

#### Gherkin Scenarios

```gherkin
Feature: Add Payment Method
  As a user
  I need to add a payment method securely
  So that I can make purchases quickly

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Payment Methods"

  Scenario: Successfully add a credit card
    When I click "Add Payment Method"
    Then I should see a Stripe Elements card input form
    And the form should include fields for:
      | Field | Description |
      | Card Number | With card type detection and formatting |
      | Expiration Date | MM/YY format |
      | CVC | Security code |
      | Cardholder Name | Name on card |
      | Billing ZIP Code | For AVS verification |
    When I enter valid card details:
      | Field | Value |
      | Card Number | 4242 4242 4242 4242 |
      | Expiration | 12/25 |
      | CVC | 123 |
      | Cardholder Name | John Smith |
      | ZIP Code | 94102 |
    And I click "Add Card"
    Then I should see a loading indicator
    And Stripe should tokenize the card securely
    And the card should be saved to my account
    And I should see a success message "Payment method added successfully"
    And I should see the card in my payment methods list showing "•••• 4242"

  Scenario: Add card and set as default
    When I am adding a new payment method
    And I check "Set as default payment method"
    And I complete the card entry with valid details
    And I click "Add Card"
    Then the card should be saved
    And the card should be marked as my default payment method
    And any previous default should be unmarked
    And I should see a "Default" badge on this card

  Scenario: Card validation - Invalid card number
    When I enter an invalid card number "1234 5678 9012 3456"
    And I attempt to proceed
    Then I should see an error "Your card number is invalid"
    And the form should not submit
    And the card should not be saved

  Scenario: Card validation - Expired card
    When I enter an expiration date in the past "01/20"
    And I attempt to proceed
    Then I should see an error "Your card's expiration date is in the past"
    And the form should not submit

  Scenario: Card validation - Invalid CVC
    When I enter a CVC with insufficient digits "12"
    And I attempt to proceed
    Then I should see an error "Your card's security code is incomplete"
    And the form should not submit

  Scenario: Network error during card save
    Given the network connection is unstable
    When I submit valid card details
    And the Stripe API call fails
    Then I should see an error "Unable to add payment method. Please try again."
    And the card should not be saved
    And I should be able to retry without re-entering details

  Scenario: Duplicate card detection
    Given I already have a card ending in 4242
    When I attempt to add the same card again
    Then I should see a message "This card is already saved to your account"
    And I should be asked if I want to continue anyway
    When I confirm
    Then the card should be added (Stripe allows duplicate cards)

  Scenario: Real-time card validation feedback
    When I start typing a card number
    Then I should see the card type detected (Visa, Mastercard, etc.)
    And the card icon should update
    When I enter the expiration date
    Then it should auto-format to MM/YY
    When I enter the CVC
    Then the input should limit to 3-4 digits based on card type

  Scenario: Mobile card input experience
    Given I am using a mobile device
    When I tap on the card number field
    Then a numeric keyboard should appear
    And the input should be optimized for mobile entry
    When I tap on expiration field
    Then it should show date-appropriate keyboard
```

#### Acceptance Criteria
- [ ] Stripe Elements integration for secure card input
- [ ] Card type detection and validation
- [ ] Real-time validation feedback
- [ ] Expiration date auto-formatting
- [ ] CVC length validation by card type
- [ ] Cardholder name and billing ZIP collection
- [ ] Set as default option
- [ ] Duplicate card detection and warning
- [ ] Loading states during tokenization
- [ ] Error handling with clear messages
- [ ] Mobile-optimized keyboard types
- [ ] Accessibility compliant form inputs
- [ ] No raw card data stored in database

#### Technical Notes
- Use Stripe Elements for all card inputs (never raw HTML inputs)
- Card data never touches application servers (PCI compliance)
- Store Stripe payment method ID, not card details
- Use `stripe.createPaymentMethod()` for tokenization
- Validate card via Stripe's validation methods
- Support all major card types: Visa, Mastercard, Amex, Discover
- AVS (Address Verification System) via ZIP code

---

### US-STRIPE.2: Process One-Time Payment

**As a** Pours Consumer user  
**I want to** complete a payment for my order  
**So that** I can receive my products

#### Background
One-time payments are the core transaction type for the Pours Consumer app, enabling users to pay for food and drink orders at venues.

#### Value Proposition
- Enables revenue generation
- Seamless checkout experience
- Secure payment processing
- Immediate order confirmation

#### Gherkin Scenarios

```gherkin
Feature: Process One-Time Payment
  As a user
  I need to pay for my order
  So that my order can be fulfilled

  Background:
    Given I am logged in as a Pours Consumer user
    And I have items in my cart totaling $45.50
    And I am on the checkout page

  Scenario: Pay with saved payment method
    Given I have a saved payment method ending in 4242
    When I select the saved payment method
    And I review my order:
      | Item | Quantity | Price |
      | Craft IPA | 2 | $8.00 each |
      | Margherita Pizza | 1 | $18.00 |
      | House Wine | 1 | $11.50 |
      | Subtotal | | $45.50 |
      | Tax (8.5%) | | $3.87 |
      | Total | | $49.37 |
    And I click "Place Order & Pay"
    Then I should see a payment processing indicator
    And Stripe should process the payment for $49.37
    And the payment should succeed
    And I should see an order confirmation "Order placed successfully!"
    And I should receive an email receipt
    And an order record should be created in the database
    And the payment should be recorded

  Scenario: Pay with new card (guest or user)
    Given I choose to pay with a new card
    When I see the Stripe Elements payment form
    And I enter valid card details
    And I optionally check "Save this card for future use"
    And I click "Place Order & Pay"
    Then Stripe should process the payment
    And the order should be confirmed
    And if I checked save, the payment method should be saved
    And I should receive an order confirmation

  Scenario: Payment requires 3D Secure authentication (SCA)
    Given I am using a card that requires 3D Secure
    When I submit payment
    Then Stripe should trigger 3D Secure authentication
    And I should see the bank's authentication modal
    When I complete authentication successfully
    Then the payment should be processed
    And the order should be confirmed

  Scenario: 3D Secure authentication fails
    Given I am using a card that requires 3D Secure
    When I submit payment
    And the authentication modal appears
    And I fail authentication or close the modal
    Then the payment should be declined
    And I should see an error "Payment authentication failed"
    And the order should not be placed
    And I should be able to try again with a different payment method

  Scenario: Insufficient funds on card
    Given I submit payment with a card that has insufficient funds
    When Stripe attempts to process the payment
    Then the payment should be declined
    And I should see an error "Your card has insufficient funds"
    And the order should not be placed
    And I should be prompted to try a different payment method

  Scenario: Card declined by issuer
    Given I submit payment with a valid card
    When the card issuer declines the transaction
    Then I should see an error "Your card was declined"
    And the order should not be placed
    And I should be able to try again
    And I should see a suggestion to contact my bank

  Scenario: Network error during payment
    Given I submit payment
    And the network connection is interrupted
    When the payment request times out
    Then I should see an error "Payment failed due to network error. Checking order status..."
    And the system should verify if the payment actually processed
    And if payment succeeded, the order should be created
    And if payment failed, I should be able to retry
    And I should not be double-charged

  Scenario: Apply discount code during payment
    Given I have a valid discount code "SAVE10"
    When I enter the code at checkout
    And I click "Apply"
    Then the discount should be applied:
      | Subtotal | $45.50 |
      | Discount | -$4.55 |
      | Tax | $3.48 |
      | Total | $44.43 |
    When I complete payment
    Then the discounted amount should be charged
    And the discount should be recorded with the order

  Scenario: Pay with guest checkout (no account)
    Given I am not logged in
    And I have items in my cart
    When I proceed to checkout
    And I enter my email and contact information
    And I enter payment details
    And I click "Place Order & Pay"
    Then the payment should be processed
    And a guest order should be created
    And I should receive a confirmation email
    And I should not have a saved payment method (no account)

  Scenario: Split payment (future enhancement)
    Given my order total is $50.00
    When I choose to split payment
    And I pay $25.00 with card ending in 4242
    And I pay $25.00 with card ending in 5555
    Then both payment methods should be charged
    And the order should be confirmed
    And I should see both charges on my receipt
```

#### Acceptance Criteria
- [ ] Payment processing with saved payment methods
- [ ] Payment processing with new cards
- [ ] Save new card option during checkout
- [ ] 3D Secure (SCA) authentication support
- [ ] Clear payment status indicators
- [ ] Error handling for all decline reasons
- [ ] Network failure recovery without double-charging
- [ ] Discount/promo code application
- [ ] Guest checkout payment support
- [ ] Payment amount breakdown (subtotal, tax, total)
- [ ] Order creation on successful payment
- [ ] Payment confirmation display
- [ ] Email receipt generation
- [ ] Idempotency to prevent duplicate charges

#### Technical Notes
- Use Stripe PaymentIntents API for robust payment processing
- Implement idempotency keys to prevent duplicate charges
- Handle all payment states: requires_payment_method, requires_confirmation, requires_action, processing, succeeded, canceled
- Support SCA via `stripe.confirmCardPayment()`
- Webhook handling for async payment updates
- Link payment to order via metadata
- Calculate tax based on venue location
- Store payment_intent_id with order

---

### US-STRIPE.3: Manage Saved Payment Methods

**As a** Pours Consumer user  
**I want to** manage my saved payment methods  
**So that** I can keep my payment information current and remove old cards

#### Background
Users need to view, update, and remove saved payment methods to maintain accurate payment information and manage their account security.

#### Value Proposition
- Empowers users to maintain their payment information
- Improves security by removing old/invalid cards
- Enhances user control and trust
- Reduces failed payments from expired cards

#### Gherkin Scenarios

```gherkin
Feature: Manage Saved Payment Methods
  As a user
  I need to manage my payment methods
  So that I can maintain accurate payment information

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Payment Methods"

  Scenario: View all saved payment methods
    Given I have 3 saved payment methods
    When the payment methods page loads
    Then I should see a list of my payment methods showing:
      | Field | Description |
      | Card Brand | Visa, Mastercard, Amex, etc. |
      | Last 4 Digits | •••• 4242 |
      | Expiration Date | MM/YY |
      | Cardholder Name | Name on card |
      | Default Badge | If it's the default method |
      | Actions | Edit, Remove buttons |
    And the default payment method should be displayed first
    And expired cards should be highlighted with a warning

  Scenario: Set a payment method as default
    Given I have multiple saved payment methods
    And card ending in 5555 is currently default
    When I click "Set as Default" on card ending in 4242
    Then I should see a confirmation "Default payment method updated"
    And card 4242 should now show a "Default" badge
    And card 5555 should no longer show the default badge
    And the change should persist after page refresh

  Scenario: Remove a non-default payment method
    Given I have a saved card ending in 4242
    And it is not my default payment method
    When I click "Remove" for this card
    Then I should see a confirmation dialog "Are you sure you want to remove this card?"
    When I confirm
    Then the card should be removed from my account
    And the card should be removed from Stripe
    And I should see a success message "Payment method removed"
    And the card should no longer appear in my list

  Scenario: Remove default payment method
    Given I have multiple saved payment methods
    And card ending in 4242 is my default
    When I click "Remove" for the default card
    Then I should see a warning "This is your default payment method"
    And I should be prompted to select a new default
    When I select card ending in 5555 as the new default
    And I confirm removal
    Then card 4242 should be removed
    And card 5555 should become the default
    And I should see a success message

  Scenario: Cannot remove only payment method
    Given I have only one saved payment method
    When I click "Remove" for this card
    Then I should see a message "You cannot remove your only payment method"
    Or I should see a warning "Removing your only payment method means you'll need to enter card details at checkout"
    When I confirm understanding
    Then the card should be removed
    And I should have no saved payment methods

  Scenario: Update expired card
    Given I have a card that expired last month
    When I see an "Expired" warning on the card
    And I click "Update Card"
    Then I should see a form to update the expiration date
    When I enter a new expiration date
    And I click "Update"
    Then Stripe should update the card
    And the expiration warning should disappear
    And I should see the new expiration date

  Scenario: View payment method details
    Given I have a saved payment method
    When I click on the payment method
    Then I should see detailed information:
      | Detail | Information |
      | Full Card Brand | Visa Credit |
      | Last 4 Digits | 4242 |
      | Expiration | 12/2025 |
      | Cardholder Name | John Smith |
      | Billing ZIP | 94102 |
      | Date Added | Nov 15, 2024 |
      | Last Used | Nov 20, 2024 |
    And I should see options to edit or remove

  Scenario: Expired card notification
    Given I have a card expiring this month
    When I visit the payment methods page
    Then I should see a notification "You have a card expiring soon"
    And the expiring card should be highlighted
    And I should see a prompt to update the card
```

#### Acceptance Criteria
- [ ] Display all saved payment methods
- [ ] Show card brand, last 4, expiration, cardholder name
- [ ] Highlight default payment method
- [ ] Set any card as default
- [ ] Remove non-default payment methods
- [ ] Remove default with new default selection
- [ ] Warning for expired/expiring cards
- [ ] Update card expiration date
- [ ] View detailed payment method information
- [ ] Display when card was added and last used
- [ ] Prevent removing last payment method (or warn)
- [ ] Mobile-responsive card list
- [ ] Loading states for all operations

#### Technical Notes
- Retrieve payment methods via Stripe API
- Display using `stripe.paymentMethods.list()`
- Default payment method stored in customer.invoice_settings.default_payment_method
- Detach payment method via `stripe.paymentMethods.detach()`
- Update payment method via `stripe.paymentMethods.update()`
- Cache payment methods for performance
- Real-time sync with Stripe

---

### US-STRIPE.4: Handle Payment Failures

**As a** Pours Consumer user  
**I want to** understand why my payment failed and how to resolve it  
**So that** I can successfully complete my purchase

#### Background
Payment failures occur for various reasons (insufficient funds, card declined, authentication failure). Clear error messaging and recovery options are essential for conversion.

#### Value Proposition
- Reduces cart abandonment through clear guidance
- Improves conversion by enabling easy retry
- Builds trust through transparent communication
- Minimizes support inquiries

#### Gherkin Scenarios

```gherkin
Feature: Handle Payment Failures
  As a user
  I need clear guidance when payments fail
  So that I can resolve issues and complete my purchase

  Scenario: Insufficient funds error
    Given I submit payment with a card
    When Stripe returns an "insufficient_funds" error
    Then I should see a clear error message:
      """
      Your card has insufficient funds.
      Please try a different payment method or contact your bank.
      """
    And I should see a "Try Another Card" button
    And my cart should remain intact
    And I should be able to select a different payment method

  Scenario: Card declined by issuer
    Given I submit payment
    When the card issuer declines with "card_declined"
    Then I should see the error:
      """
      Your card was declined.
      Please try a different card or contact your bank for more information.
      """
    And I should see options to:
      | Option | Description |
      | Try Another Card | Use different payment method |
      | Edit Billing Info | Update ZIP/address for AVS |
      | Contact Support | Get help with payment issue |

  Scenario: Expired card error
    Given I select an expired payment method
    When I attempt payment
    Then I should see the error:
      """
      Your card has expired.
      Please update your card's expiration date or use a different payment method.
      """
    And I should see an "Update Card" button
    And I should be able to update the expiration inline

  Scenario: Invalid CVC error
    Given I enter payment details with wrong CVC
    When Stripe validates the payment
    Then I should see the error:
      """
      Your card's security code is incorrect.
      Please check the 3-4 digit code on the back of your card.
      """
    And the CVC field should be highlighted
    And I should be able to correct and retry

  Scenario: 3D Secure authentication failure
    Given my payment requires 3D Secure
    When I fail the authentication challenge
    Then I should see the error:
      """
      Payment authentication failed.
      Please try again or use a different payment method.
      """
    And I should see a "Retry Authentication" button
    And I should see a "Use Different Card" button

  Scenario: Processing error (temporary)
    Given I submit payment
    When Stripe returns a "processing_error"
    Then I should see the error:
      """
      There was a temporary error processing your payment.
      Please try again in a moment.
      """
    And I should see a "Try Again" button with countdown
    And the system should automatically retry after 5 seconds
    And I should be able to manually retry immediately

  Scenario: Network timeout
    Given I submit payment
    When the network request times out
    Then I should see the error:
      """
      Connection timeout. Verifying payment status...
      """
    And the system should check if payment actually processed
    If payment succeeded:
      Then the order should be created
      And I should see confirmation
    If payment failed:
      Then I should be prompted to retry
      And I should not be double-charged

  Scenario: Rate limit exceeded
    Given I have attempted payment multiple times
    When Stripe rate limits are exceeded
    Then I should see the error:
      """
      Too many payment attempts.
      Please wait a moment before trying again.
      """
    And I should see a countdown timer
    And the retry button should be disabled until timer expires

  Scenario: Payment method validation before submission
    Given I am about to submit payment
    When my selected payment method is expired
    Then I should see a warning before clicking pay:
      """
      Your selected card has expired.
      Please update it or choose a different payment method.
      """
    And the pay button should be disabled
    And I should be required to select a valid payment method

  Scenario: Smart payment retry suggestions
    Given my payment failed due to "card_declined"
    When I click "Why did this happen?"
    Then I should see contextual help:
      """
      Common reasons for card declines:
      • Insufficient funds
      • Card expired or invalid
      • Security hold by your bank
      • Incorrect billing information
      
      Suggestions:
      • Try a different card
      • Check your billing address matches bank records
      • Contact your bank to authorize the transaction
      • Ensure you have sufficient available credit
      """
```

#### Acceptance Criteria
- [ ] Clear, user-friendly error messages for all Stripe error types
- [ ] Specific guidance for each error type
- [ ] "Try Again" or "Use Different Card" options
- [ ] Inline error correction when possible
- [ ] Automatic retry for temporary errors
- [ ] Prevent double-charging on retry
- [ ] Rate limiting with clear countdown
- [ ] Pre-submission validation
- [ ] Contextual help for common failures
- [ ] Support contact option for unresolvable errors
- [ ] Cart preservation through failures
- [ ] Error tracking and analytics

#### Technical Notes
- Map all Stripe error codes to user-friendly messages
- Common error codes: insufficient_funds, card_declined, expired_card, incorrect_cvc, processing_error, etc.
- Implement exponential backoff for retries
- Use idempotency keys to prevent duplicate charges
- Log all payment failures for analysis
- Provide support team with detailed error context
- Track failure rates by error type

---

### US-STRIPE.5: Process Refunds

**As a** venue manager or customer support representative  
**I want to** process refunds for cancelled or problematic orders  
**So that** customers can be reimbursed appropriately

#### Background
Refunds may be necessary for cancelled orders, customer complaints, or order errors. The system must support full and partial refunds through the Stripe API.

#### Value Proposition
- Builds customer trust through fair refund policy
- Enables customer service to resolve issues
- Maintains financial accuracy
- Complies with consumer protection regulations

#### Gherkin Scenarios

```gherkin
Feature: Process Refunds
  As an admin or support representative
  I need to process refunds for orders
  So that customers can be reimbursed when appropriate

  Background:
    Given I am logged in as an admin user
    And I navigate to the orders management dashboard

  Scenario: Process full refund for cancelled order
    Given a customer has a completed order for $49.37
    And the order was cancelled before fulfillment
    When I open the order details
    And I click "Refund Order"
    Then I should see the refund modal with:
      | Field | Value |
      | Original Amount | $49.37 |
      | Refund Amount | $49.37 (editable) |
      | Refund Reason | Dropdown selection |
    When I select reason "Customer cancelled order"
    And I click "Process Full Refund"
    Then Stripe should process the refund
    And the customer should receive $49.37 back
    And the order status should update to "Refunded"
    And the customer should receive a refund confirmation email
    And a refund record should be created

  Scenario: Process partial refund
    Given an order total is $49.37
    And one item was unavailable
    When I initiate a refund
    And I change the refund amount to $15.00
    And I select reason "Item unavailable"
    And I add note "Refunded for missing appetizer"
    And I click "Process Partial Refund"
    Then $15.00 should be refunded to the customer
    And the order should show "Partially Refunded"
    And the refund reason and note should be recorded

  Scenario: Refund validation - Amount exceeds original charge
    Given an order was charged $49.37
    When I attempt to refund $60.00
    Then I should see an error "Refund amount cannot exceed original charge of $49.37"
    And the refund should not be processed

  Scenario: Refund validation - Negative amount
    When I attempt to enter a negative refund amount
    Then the input should prevent negative values
    And I should see an error "Refund amount must be positive"

  Scenario: Multiple partial refunds
    Given an order total is $49.37
    And I have already refunded $15.00
    When I process another partial refund for $10.00
    Then the refund should succeed
    And the order should show total refunded: $25.00
    And the remaining refundable amount should be $24.37

  Scenario: Cannot exceed refundable amount
    Given an order total is $49.37
    And I have already refunded $40.00
    When I attempt to refund $15.00
    Then I should see an error "Refund amount exceeds remaining refundable amount of $9.37"
    And the maximum refundable amount should be displayed

  Scenario: Refund fails - Stripe error
    Given I initiate a refund
    When Stripe returns an error (e.g., charge already refunded)
    Then I should see a clear error message
    And the order status should not change
    And I should be able to retry or contact support
    And the error should be logged for investigation

  Scenario: View refund history
    Given an order has multiple refunds
    When I view the order details
    Then I should see a refund history table:
      | Date | Amount | Reason | Processed By | Status |
      | Nov 20 | $15.00 | Item unavailable | admin@pours.com | Completed |
      | Nov 21 | $10.00 | Quality issue | admin@pours.com | Completed |
    And I should see total refunded: $25.00
    And I should see remaining refundable: $24.37

  Scenario: Customer-initiated refund request (future)
    Given I am a customer with a completed order
    When I navigate to my order history
    And I click "Request Refund" on an eligible order
    Then I should see a refund request form
    When I select a reason and provide details
    And I submit the request
    Then a refund request should be created
    And support should be notified
    And I should see "Refund request submitted, awaiting review"

  Scenario: Automatic refund for failed orders
    Given an order payment succeeded
    But the order could not be fulfilled (venue closed, etc.)
    When the system marks the order as failed
    Then an automatic refund should be initiated
    And the customer should be notified
    And the refund should process within 5-10 business days
```

#### Acceptance Criteria
- [ ] Full refund processing
- [ ] Partial refund processing
- [ ] Refund amount validation
- [ ] Refund reason selection (required)
- [ ] Optional refund notes
- [ ] Multiple partial refunds supported
- [ ] Cannot exceed original charge amount
- [ ] Cannot exceed remaining refundable amount
- [ ] Refund confirmation to customer
- [ ] Order status update on refund
- [ ] Refund history display
- [ ] Admin/support only access
- [ ] Audit trail for all refunds
- [ ] Error handling for failed refunds

#### Technical Notes
- Use Stripe Refunds API: `stripe.refunds.create()`
- Refund references original payment_intent_id
- Support both full and partial refunds
- Track cumulative refunded amount
- Refunds appear in customer's account 5-10 business days
- Cannot refund more than original charge
- Store refund records in database
- Include refund_id from Stripe
- Email customer on refund confirmation
- Webhook handling for async refund updates

---

### US-STRIPE.6: Subscription Payment Management (Future)

**As a** Pours Consumer user  
**I want to** subscribe to premium features with recurring billing  
**So that** I can access exclusive benefits automatically

#### Background
Future enhancement for subscription-based features like Pours+ Premium membership, unlimited delivery, or exclusive venue access.

#### Value Proposition
- Recurring revenue stream
- Premium feature monetization
- Automatic billing reduces churn
- Enhanced user benefits

#### Gherkin Scenarios

```gherkin
Feature: Subscription Payment Management (Future)
  As a user
  I want to subscribe to premium features
  So that I receive ongoing benefits

  Scenario: Subscribe to monthly plan
    Given I am viewing the Pours+ Premium page
    When I click "Subscribe - $9.99/month"
    Then I should see subscription details:
      | Feature | Included |
      | Unlimited free delivery | Yes |
      | Exclusive venue access | Yes |
      | Double rewards points | Yes |
      | Priority support | Yes |
    When I select my payment method
    And I click "Start Subscription"
    Then Stripe should create a subscription
    And I should be charged $9.99 immediately
    And I should see confirmation "Welcome to Pours+ Premium!"
    And my account should show premium status

  Scenario: Automatic subscription renewal
    Given I have an active monthly subscription
    When the billing date arrives
    Then Stripe should automatically charge my default payment method
    And I should receive a receipt email
    And my subscription should renew for another month
    And I should maintain premium access

  Scenario: Failed subscription payment
    Given my subscription payment method is declined
    When the automatic renewal attempts to charge
    Then I should receive an email about the failed payment
    And I should see a banner in the app to update payment
    And my premium access should continue for a grace period (3 days)
    When I update my payment method
    And the payment retries successfully
    Then my subscription should continue normally

  Scenario: Cancel subscription
    Given I have an active subscription
    When I navigate to "Manage Subscription"
    And I click "Cancel Subscription"
    Then I should see options:
      | Option | Description |
      | Cancel at period end | Keep benefits until Nov 30 |
      | Cancel immediately | Lose benefits now, no refund |
    When I select "Cancel at period end"
    And I confirm cancellation
    Then my subscription should be marked for cancellation
    But I should retain benefits until the period ends
    And I should not be charged again

  Scenario: Reactivate cancelled subscription
    Given I cancelled my subscription
    But it hasn't ended yet
    When I click "Reactivate Subscription"
    Then the cancellation should be reversed
    And automatic billing should resume
    And I should see confirmation

  Scenario: Upgrade/downgrade plan
    Given I have a monthly subscription at $9.99/month
    When I choose to upgrade to annual at $99/year
    Then I should see prorated credit applied
    And the new plan should start immediately
    And I should be charged the prorated amount
```

#### Acceptance Criteria (Future)
- [ ] Subscription plan creation and selection
- [ ] Initial subscription payment
- [ ] Automatic recurring billing
- [ ] Failed payment handling with retry logic
- [ ] Grace period for failed payments
- [ ] Subscription cancellation (immediate or at period end)
- [ ] Reactivation of cancelled subscriptions
- [ ] Plan upgrade/downgrade with proration
- [ ] Subscription status display
- [ ] Billing history for subscriptions
- [ ] Payment method update for subscriptions
- [ ] Email notifications for billing events

#### Technical Notes (Future)
- Use Stripe Subscriptions API
- Create products and prices in Stripe Dashboard
- Use `stripe.subscriptions.create()`
- Handle webhooks: subscription.created, subscription.updated, subscription.deleted, invoice.payment_succeeded, invoice.payment_failed
- Implement smart retries for failed payments
- Support proration for plan changes
- Store subscription_id with user account
- Sync subscription status with Stripe

---

### US-STRIPE.7: Payment Security & PCI Compliance

**As a** platform operator  
**I want to** ensure PCI compliance and payment security  
**So that** customer payment data is protected and regulations are met

#### Background
PCI DSS (Payment Card Industry Data Security Standard) compliance is mandatory for handling payment card data. Stripe provides tools to maintain compliance.

#### Value Proposition
- Legal compliance with payment regulations
- Protects customer sensitive data
- Builds customer trust
- Avoids penalties and liabilities
- Reduces fraud risk

#### Gherkin Scenarios

```gherkin
Feature: Payment Security & PCI Compliance
  As a platform
  I need to maintain PCI compliance
  So that payment data is secure

  Scenario: No raw card data in application
    Given the application handles payment cards
    Then no raw card numbers should ever be stored in the database
    And no raw CVCs should be stored
    And only Stripe tokens/IDs should be stored
    And Stripe Elements should handle all card input
    And card data should never touch application servers

  Scenario: Secure payment form
    Given a user is entering payment details
    Then all card inputs should be Stripe Elements (iframe)
    And the form should be served over HTTPS
    And the Elements should be properly configured
    And card data should go directly to Stripe
    And the application should only receive a token

  Scenario: PCI SAQ-A compliance
    Given we use Stripe Elements and never handle raw card data
    Then we should qualify for SAQ-A (simplest PCI questionnaire)
    And we should complete the SAQ-A annually
    And we should document our PCI compliance

  Scenario: 3D Secure authentication
    Given we process payments from EEA customers (SCA requirement)
    Then we must implement 3D Secure authentication
    And we should use Stripe's built-in 3DS support
    When a payment requires authentication
    Then the user should complete the bank's authentication
    And only authenticated payments should succeed

  Scenario: Fraud detection
    Given Stripe Radar is enabled
    When suspicious payment patterns are detected
    Then high-risk payments should be blocked automatically
    And merchants should be notified
    And legitimate customers should experience minimal friction

  Scenario: Secure webhook handling
    Given we receive webhooks from Stripe
    Then all webhooks should be verified using Stripe signatures
    And webhook endpoints should be HTTPS only
    And webhook secrets should be stored securely
    And unverified webhooks should be rejected

  Scenario: Payment data access controls
    Given only authorized personnel need payment data
    Then access to payment information should be restricted
    And all access should be logged
    And payment method details should be masked
    And full card numbers should never be displayed

  Scenario: Audit logging
    Given payment operations occur
    Then all payment attempts should be logged
    And all refunds should be logged
    And all payment method changes should be logged
    And logs should include timestamps and user IDs
    And logs should be retained per compliance requirements
```

#### Acceptance Criteria
- [ ] SAQ-A PCI compliance maintained
- [ ] No raw card data stored anywhere
- [ ] Stripe Elements used for all card inputs
- [ ] All payment pages served over HTTPS
- [ ] 3D Secure authentication implemented
- [ ] Webhook signature verification
- [ ] Payment data access controls
- [ ] Comprehensive audit logging
- [ ] Fraud detection via Stripe Radar
- [ ] Secure credential storage
- [ ] Regular PCI compliance reviews
- [ ] Security incident response plan

#### Technical Notes
- Never store: Full card numbers, CVV/CVC, magnetic stripe data
- Can store: Last 4 digits, expiration date (for display only)
- Use Stripe's PCI-validated payment infrastructure
- Implement Content Security Policy (CSP)
- Use Stripe Radar for fraud prevention
- Verify webhook signatures: `stripe.webhooks.constructEvent()`
- Store Stripe API keys as secrets (never in code)
- Use environment-specific API keys
- Implement role-based access control for payment data

---

### US-STRIPE.8: Payment History & Receipts

**As a** Pours Consumer user  
**I want to** view my payment history and download receipts  
**So that** I can track my expenses and have records for accounting

#### Background
Users need access to payment history for personal record-keeping, expense tracking, and tax purposes.

#### Value Proposition
- Transparency builds trust
- Enables expense tracking
- Provides tax documentation
- Reduces support inquiries about past payments

#### Gherkin Scenarios

```gherkin
Feature: Payment History & Receipts
  As a user
  I need to view my payment history
  So that I can track expenses and access receipts

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Profile" > "Payment History"

  Scenario: View payment history
    When the payment history page loads
    Then I should see a chronological list of all my payments
    And each payment should display:
      | Field | Description |
      | Date | When payment was made |
      | Order Number | Link to order details |
      | Venue | Where the order was placed |
      | Amount | Total paid |
      | Payment Method | Card ending in #### |
      | Status | Succeeded, Refunded, Failed |
      | Receipt | Download link |
    And payments should be sorted by date (newest first)

  Scenario: Filter payment history
    Given I have extensive payment history
    When I see filter options:
      | Filter | Options |
      | Date Range | Last 30 days, Last 3 months, Last year, Custom |
      | Status | All, Successful, Refunded, Failed |
      | Venue | All venues, Specific venue |
      | Amount | Min/Max range |
    When I select "Last 3 months" and "Successful"
    And I click "Apply Filters"
    Then I should only see successful payments from the last 3 months

  Scenario: Search payment history
    Given I have many payments
    When I enter "Rusty Tap" in the search box
    Then I should see only payments for The Rusty Tap venue
    When I enter an order number
    Then I should see only that specific payment

  Scenario: Download individual receipt
    Given I am viewing a payment in my history
    When I click "Download Receipt" for a specific payment
    Then a PDF receipt should be generated
    And the PDF should include:
      | Information | Details |
      | Order Number | #12345 |
      | Date & Time | Nov 20, 2024 3:45 PM |
      | Venue Name | The Rusty Tap |
      | Venue Address | 123 Main St, San Francisco, CA |
      | Itemized Order | All items with prices |
      | Subtotal | $45.50 |
      | Tax | $3.87 |
      | Total Paid | $49.37 |
      | Payment Method | Visa •••• 4242 |
      | Customer Info | Name and email |
      | Business Tax ID | Venue's tax ID if applicable |
    And the PDF should be professionally formatted

  Scenario: Email receipt
    Given I am viewing a payment
    When I click "Email Receipt"
    Then I should see a dialog "Send receipt to [email]"
    When I confirm
    Then the receipt should be emailed to my registered email
    And I should see confirmation "Receipt sent to [email]"

  Scenario: Download multiple receipts
    Given I have selected multiple payments
    When I click "Download Selected Receipts"
    Then all receipts should be generated
    And they should be downloaded as a ZIP file
    And each receipt should be named with order number and date

  Scenario: Export payment history to CSV
    Given I am viewing my payment history
    When I click "Export to CSV"
    Then I should download a CSV file with:
      | Column | Data |
      | Date | ISO format timestamp |
      | Order Number | Order ID |
      | Venue | Venue name |
      | Amount | Numeric value |
      | Tax | Tax amount |
      | Payment Method | Last 4 digits |
      | Status | Status string |
    And the CSV should be compatible with Excel and accounting software

  Scenario: View refunded payment
    Given a payment was refunded
    When I view it in payment history
    Then I should see:
      | Field | Value |
      | Original Amount | $49.37 |
      | Refunded Amount | $49.37 |
      | Net Amount | $0.00 |
      | Refund Date | Nov 21, 2024 |
      | Refund Reason | Customer cancelled order |
    And the status should show "Refunded"
    And I should be able to download the original receipt
    And I should be able to download a refund receipt

  Scenario: View partially refunded payment
    Given a payment was partially refunded
    Then I should see:
      | Original Amount | $49.37 |
      | Refunded Amount | $15.00 |
      | Net Amount | $34.37 |
    And I should see all refund transactions listed

  Scenario: Year-end tax summary
    Given it's tax season
    When I navigate to "Tax Summary"
    Then I should see a yearly summary:
      | Year | Total Spent | Total Tax Paid |
      | 2024 | $1,250.00 | $106.25 |
    When I click "Download Tax Summary"
    Then I should receive a formatted PDF
    And the PDF should be suitable for tax filing
```

#### Acceptance Criteria
- [ ] Chronological payment history display
- [ ] Payment details for each transaction
- [ ] Filter by date range, status, venue, amount
- [ ] Search by order number or venue name
- [ ] Download individual receipts as PDF
- [ ] Email receipts to registered address
- [ ] Bulk receipt download (ZIP)
- [ ] Export payment history to CSV
- [ ] Refund information clearly displayed
- [ ] Professional receipt formatting
- [ ] Year-end tax summary
- [ ] Mobile-responsive table/list
- [ ] Pagination for large histories

#### Technical Notes
- Fetch payment history from Stripe API
- Use `stripe.charges.list()` or `stripe.paymentIntents.list()`
- Generate PDF receipts server-side
- Use PDF library (e.g., PDFKit, jsPDF)
- Store receipt generation template
- Include all tax-relevant information
- Cache recent payment history
- Implement pagination (50 per page)
- Link payments to orders via metadata

---

## Technical Requirements

### Stripe Integration Setup

#### Lovable Stripe Integration
- Use Lovable's built-in Stripe integration tool
- Enable Stripe via Lovable dashboard
- Provide Stripe Secret Key (collected securely)
- No manual Supabase tables needed
- Integration creates necessary infrastructure

#### Stripe Account Requirements
- Stripe account in test mode for development
- Live mode for production
- Business verification for live payments
- Bank account for payouts
- Tax information completed

#### Stripe Products & Prices
- Create products in Stripe Dashboard
- Define pricing (one-time, recurring)
- Set currency (USD)
- Configure tax behavior

### Frontend Integration

#### Stripe.js Library
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(publishableKey);
```

#### Stripe Elements
```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Use Elements provider
<Elements stripe={stripePromise}>
  <CheckoutForm />
</Elements>
```

#### Payment Intent Flow
```typescript
// 1. Create payment intent on server
const paymentIntent = await createPaymentIntent(amount);

// 2. Confirm payment on client
const { error } = await stripe.confirmCardPayment(
  paymentIntent.client_secret,
  {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: { name, email }
    }
  }
);
```

### Backend Integration (Edge Functions)

#### Edge Function: create-payment-intent
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: 'usd',
  metadata: {
    order_id: orderId,
    user_id: userId
  }
});
```

#### Edge Function: create-refund
```typescript
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: refundAmountInCents,
  reason: 'requested_by_customer',
  metadata: {
    order_id: orderId,
    refund_reason: reason
  }
});
```

#### Webhook Handler
```typescript
// Verify webhook signature
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  payload,
  sig,
  webhookSecret
);

// Handle events
switch (event.type) {
  case 'payment_intent.succeeded':
    // Update order status
    break;
  case 'payment_intent.payment_failed':
    // Handle failure
    break;
  case 'charge.refunded':
    // Update refund status
    break;
}
```

### Performance Requirements
- Payment intent creation: <1 second
- Payment confirmation: <3 seconds
- Refund processing: <2 seconds
- Payment method save: <1 second
- Payment history load: <2 seconds
- Receipt generation: <5 seconds

### Accessibility Requirements
- WCAG 2.1 AA compliant payment forms
- Keyboard navigation for all payment controls
- Screen reader support for Stripe Elements
- Clear error announcements
- Sufficient color contrast
- Focus management during payment flow

---

## Database Schema

### Lovable Stripe Integration
The Lovable Stripe integration handles most database requirements automatically. No manual table creation needed for basic payment processing.

### Optional: Extended Payment Tracking

If additional payment tracking is needed beyond Stripe's data:

```sql
-- Track payment-to-order relationship
CREATE TABLE IF NOT EXISTS public.order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  
  -- Stripe References
  payment_intent_id TEXT NOT NULL UNIQUE,
  charge_id TEXT,
  
  -- Payment Details
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, failed, refunded, etc.
  
  -- Payment Method
  payment_method_id TEXT,
  payment_method_type TEXT, -- card, etc.
  card_last4 TEXT,
  card_brand TEXT,
  
  -- Refund Tracking
  amount_refunded INTEGER DEFAULT 0,
  refund_reason TEXT,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_order_payments_order ON public.order_payments(order_id);
CREATE INDEX idx_order_payments_intent ON public.order_payments(payment_intent_id);

ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.order_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_payments.order_id
      AND (orders.user_id = auth.uid() OR orders.guest_email IS NOT NULL)
    )
  );
```

---

## API & Edge Functions

### Edge Function: create-payment-intent

**Purpose**: Create a Stripe payment intent for checkout

**Endpoint**: `POST /functions/v1/create-payment-intent`

**Request**:
```json
{
  "amount": 4937, // cents
  "currency": "usd",
  "order_id": "uuid",
  "payment_method_id": "pm_xxx" // optional, for saved cards
}
```

**Response**:
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

### Edge Function: process-refund

**Purpose**: Process full or partial refund

**Endpoint**: `POST /functions/v1/process-refund`

**Request**:
```json
{
  "payment_intent_id": "pi_xxx",
  "amount": 1500, // cents, optional for partial
  "reason": "requested_by_customer",
  "notes": "Item was damaged"
}
```

**Response**:
```json
{
  "refund_id": "re_xxx",
  "amount": 1500,
  "status": "succeeded"
}
```

### Edge Function: stripe-webhook

**Purpose**: Handle Stripe webhook events

**Endpoint**: `POST /functions/v1/stripe-webhook`

**Events Handled**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_method.attached`
- `payment_method.detached`
- `charge.refunded`
- `charge.dispute.created`

---

## Security & Compliance

### PCI DSS Compliance
- **SAQ-A Compliance**: Using Stripe Elements qualifies for simplest PCI questionnaire
- **No Card Data Storage**: Never store full card numbers or CVV
- **Stripe Elements**: All card input through Stripe's PCI-validated forms
- **HTTPS Only**: All payment pages served over HTTPS
- **Annual Review**: Complete SAQ-A questionnaire annually

### Secure Credential Management
- Store Stripe keys as Supabase secrets
- Never commit keys to version control
- Use environment-specific keys (test vs. live)
- Rotate keys periodically
- Restrict API key permissions

### 3D Secure (SCA)
- Required for EEA customers (Strong Customer Authentication)
- Implement via Stripe's built-in 3DS
- Handle `requires_action` payment intent status
- Use `stripe.confirmCardPayment()` for authentication flow

### Fraud Prevention
- Enable Stripe Radar for fraud detection
- Implement address verification (AVS)
- CVC verification required
- Monitor unusual payment patterns
- Block high-risk payments automatically

### Data Privacy
- Comply with GDPR for European customers
- Comply with CCPA for California customers
- Provide payment data export on request
- Support right to deletion
- Clear privacy policy about payment data

---

## Testing Requirements

### Test Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Requires 3DS: 4000 0027 6000 3184
Insufficient Funds: 4000 0000 0000 9995
```

### Unit Tests
- [ ] Payment intent creation
- [ ] Payment method attachment
- [ ] Refund calculation logic
- [ ] Error message mapping
- [ ] Idempotency key generation

### Integration Tests
- [ ] End-to-end payment flow
- [ ] 3D Secure authentication
- [ ] Webhook event handling
- [ ] Refund processing
- [ ] Failed payment scenarios

### E2E Tests
- [ ] Add payment method and set as default
- [ ] Complete checkout with saved card
- [ ] Complete checkout with new card
- [ ] Handle payment failure gracefully
- [ ] Process refund
- [ ] View payment history and download receipt

---

## Change Log
- **2025-11-23**: Initial documentation created (CNS-0019)
