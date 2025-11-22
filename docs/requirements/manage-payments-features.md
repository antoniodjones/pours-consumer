# Manage Payments - Product Requirements Documentation

## Document Information
- **Document Version**: 1.0
- **Last Updated**: 2025-11-22
- **Epic**: EPIC-PROFILE-004 - Manage Payments
- **Related Components**: `ManagePayments`, Payment method cards, Stripe integration
- **Database Tables**: TBD based on Stripe integration (Stripe manages payment methods)
- **Payment Provider**: Stripe

---

## Executive Summary

The Manage Payments section enables Pours Consumer users to securely store, manage, and select payment methods for quick checkout. This feature integrates with Stripe to provide PCI-compliant payment processing, reduce checkout friction, and enable one-click ordering experiences. Users can add multiple payment methods, set default preferences, and maintain payment history for expense tracking.

---

## Epic Definition

### EPIC-PROFILE-004: Manage Payments

**Epic Description**: As a Pours Consumer user, I need to securely manage my payment methods so that I can complete purchases quickly and safely without re-entering card details for each transaction.

**Business Value**:
- Reduces checkout abandonment by streamlining payment process
- Increases repeat purchase rate through saved payment methods
- Ensures PCI DSS compliance through Stripe integration
- Provides customers with payment flexibility and control
- Reduces customer support inquiries about payment issues
- Enables future features like subscriptions and recurring payments

**Success Metrics**:
- Saved payment method adoption: > 70% of users
- Checkout time reduction: > 40% with saved payments
- Payment method success rate: > 98%
- Average payment methods per user: 1.8
- Checkout abandonment rate: < 15%
- User satisfaction with payment experience: > 4.4/5

---

## Technical Prerequisites

### Stripe Integration Requirements

**IMPORTANT**: Before implementing the Manage Payments feature, the Stripe integration must be enabled:

1. **Enable Stripe Integration**:
   - Use Lovable's Stripe integration tool
   - Provide Stripe Secret Key when prompted
   - Stripe will handle PCI compliance, card tokenization, and secure storage

2. **Stripe Components Needed**:
   - Stripe Customer objects (one per user)
   - Stripe PaymentMethod objects (cards, digital wallets)
   - Stripe SetupIntent for adding new payment methods
   - Stripe Elements for secure card input

3. **Database Considerations**:
   - No credit card data stored in Supabase
   - Only store Stripe Customer ID in `profiles` table
   - All payment method data managed by Stripe

4. **Security Requirements**:
   - PCI DSS Level 1 compliance through Stripe
   - Tokenized payment methods only
   - No raw card data in application
   - TLS/SSL for all payment communications

---

## User Stories

### US-PAYMENT.1: Add New Payment Method

**Story**: As a Pours Consumer user, I want to add a new payment method (credit/debit card) so that I can use it for future purchases without re-entering my card details.

**Priority**: High  
**Story Points**: 8  
**Dependencies**: Stripe integration enabled, Stripe Elements library

#### Acceptance Criteria

```gherkin
Feature: Add New Payment Method
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Payments"
    And Stripe integration is configured

  Scenario: Successfully add credit card
    When I click "Add Payment Method"
    Then I should see a secure card input form
    And the form should include fields for:
      | Card Number           |
      | Expiration Date       |
      | CVC                   |
      | Cardholder Name       |
      | Billing ZIP Code      |
    When I enter valid card details:
      | Card Number     | 4242 4242 4242 4242 |
      | Expiration      | 12/25               |
      | CVC             | 123                 |
      | Cardholder Name | John Doe            |
      | ZIP Code        | 94102               |
    And I click "Save Card"
    Then the card should be securely tokenized
    And I should see a success message "Payment method added successfully"
    And the new card should appear in my payment methods list
    And the card should display as "•••• 4242"

  Scenario: Add debit card
    When I add a debit card
    Then the system should accept debit cards
    And the card type should be detected automatically
    And the card should be labeled as "Debit" in the list

  Scenario: Set new card as default
    Given I already have 1 saved payment method
    When I add a new card
    And I check "Set as default payment method"
    And I click "Save Card"
    Then the new card should become my default
    And the previous default should be unmarked

  Scenario: Real-time card validation
    When I enter a card number
    Then the card brand should be detected automatically (Visa, Mastercard, Amex)
    And the card brand icon should display
    When I enter an invalid card number
    Then I should see an inline error "Invalid card number"
    And the "Save Card" button should be disabled

  Scenario: Validation - Invalid expiration date
    When I enter an expired date (e.g., 01/20)
    Then I should see an error "Card has expired"
    And the card should not be saved

  Scenario: Validation - Invalid CVC
    When I enter an invalid CVC (e.g., 12)
    Then I should see an error "Invalid security code"
    And the card should not be saved

  Scenario: Validation - Missing required fields
    When I attempt to save without filling all fields
    Then I should see errors for each missing field
    And the "Save Card" button should remain disabled

  Scenario: Duplicate card detection
    Given I already have a card ending in 4242
    When I attempt to add the same card again
    Then I should see a warning "This card is already saved"
    And I should be asked "Do you want to add it anyway?"

  Scenario: Test mode indication (Development)
    Given the app is in test mode
    When I view the add payment form
    Then I should see a "Test Mode" indicator
    And I should see test card numbers for reference

  Scenario: Save card for future use during checkout
    Given I am on the checkout page
    And I have no saved payment methods
    When I enter card details
    Then I should see a checkbox "Save card for future purchases"
    When I check the box and complete payment
    Then the card should be saved to my payment methods
```

#### Technical Requirements

**Stripe Integration**:
```typescript
// Create Stripe Customer (one-time on first payment method)
const customer = await stripe.customers.create({
  email: user.email,
  name: `${user.first_name} ${user.last_name}`,
  metadata: {
    user_id: user.id
  }
});

// Save Stripe Customer ID to profile
await supabase
  .from('profiles')
  .update({ stripe_customer_id: customer.id })
  .eq('user_id', user.id);

// Setup Intent for adding payment method
const setupIntent = await stripe.setupIntents.create({
  customer: customer.id,
  payment_method_types: ['card']
});

// Client-side: Confirm setup with Stripe Elements
const { error, setupIntent: confirmedIntent } = await stripe.confirmCardSetup(
  setupIntent.client_secret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: cardholderName,
        address: {
          postal_code: zipCode
        }
      }
    }
  }
);

// Set as default if requested
if (setAsDefault) {
  await stripe.customers.update(customer.id, {
    invoice_settings: {
      default_payment_method: setupIntent.payment_method
    }
  });
}
```

**Stripe Elements Configuration**:
```typescript
const elements = stripe.elements({
  appearance: {
    theme: 'night', // Match app theme
    variables: {
      colorPrimary: 'hsl(var(--primary))',
      colorBackground: 'hsl(var(--background))',
      colorText: 'hsl(var(--foreground))',
      borderRadius: '8px'
    }
  }
});

const cardElement = elements.create('card', {
  hidePostalCode: false,
  style: {
    base: {
      fontSize: '16px',
      color: 'hsl(var(--foreground))',
      '::placeholder': {
        color: 'hsl(var(--muted-foreground))'
      }
    }
  }
});
```

**Card Brand Detection**:
- Automatically detect: Visa, Mastercard, Amex, Discover
- Display appropriate brand logo
- Validate CVC length based on brand (3 or 4 digits)

**Security Measures**:
- Never store raw card data
- Use Stripe Elements (PCI DSS compliant)
- Tokenize cards immediately
- TLS 1.2+ for all communications
- No card data in console logs or error messages

---

### US-PAYMENT.2: View Saved Payment Methods

**Story**: As a Pours Consumer user, I want to view all my saved payment methods so that I can manage my cards and select which one to use for purchases.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: Stripe PaymentMethod API

#### Acceptance Criteria

```gherkin
Feature: View Saved Payment Methods
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Payments"

  Scenario: Display all saved payment methods
    Given I have 3 saved payment methods
    When I view the Manage Payments page
    Then I should see all 3 payment methods listed
    And each card should display:
      | Card Brand Icon    | (Visa, Mastercard, etc.) |
      | Last 4 Digits      | •••• 4242               |
      | Expiration Date    | Expires 12/25           |
      | Cardholder Name    | John Doe                |
      | Default Badge      | (if default)            |
      | Actions Menu       | (Edit, Remove)          |

  Scenario: Display default payment method
    Given I have set a card as default
    When I view my payment methods
    Then the default card should have a "Default" badge
    And the default card should appear first in the list

  Scenario: Display card expiration warnings
    Given I have a card expiring within 30 days
    When I view my payment methods
    Then I should see a warning badge "Expiring Soon"
    And the card should be highlighted in yellow

  Scenario: Display expired cards
    Given I have an expired card
    When I view my payment methods
    Then the card should have a red "Expired" badge
    And I should see a prompt to "Update Card"

  Scenario: Empty state
    Given I have no saved payment methods
    When I view the Manage Payments page
    Then I should see an empty state message
    And I should see "Add Payment Method" call-to-action
    And the message should explain the benefits of saving a card

  Scenario: Card type icons
    Given I have Visa, Mastercard, and Amex cards saved
    When I view my payment methods
    Then each card should display the correct brand icon
    And the icons should be visually distinct and recognizable

  Scenario: Recently added indicator
    Given I just added a new payment method
    When I view the payment methods list
    Then the new card should have a "New" badge for 24 hours
```

#### Technical Requirements

**Fetch Payment Methods**:
```typescript
// Retrieve all payment methods for customer
const paymentMethods = await stripe.paymentMethods.list({
  customer: stripeCustomerId,
  type: 'card'
});

// Fetch default payment method
const customer = await stripe.customers.retrieve(stripeCustomerId);
const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;

// Format for display
const formattedMethods = paymentMethods.data.map(pm => ({
  id: pm.id,
  brand: pm.card.brand,      // 'visa', 'mastercard', 'amex'
  last4: pm.card.last4,      // '4242'
  expMonth: pm.card.exp_month,
  expYear: pm.card.exp_year,
  cardholderName: pm.billing_details.name,
  isDefault: pm.id === defaultPaymentMethodId,
  isExpiringSoon: isExpiringSoon(pm.card.exp_month, pm.card.exp_year),
  isExpired: isExpired(pm.card.exp_month, pm.card.exp_year)
}));
```

**Expiration Logic**:
```typescript
const isExpiringSoon = (month: number, year: number): boolean => {
  const expiration = new Date(year, month - 1);
  const now = new Date();
  const daysUntilExpiration = Math.floor(
    (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
};

const isExpired = (month: number, year: number): boolean => {
  const expiration = new Date(year, month - 1);
  const now = new Date();
  return expiration < now;
};
```

**Card Brand Icons**:
- Use Stripe's brand icons or custom SVG icons
- Support: Visa, Mastercard, Amex, Discover, JCB, Diners Club, UnionPay
- Fallback: Generic card icon

---

### US-PAYMENT.3: Remove Payment Method

**Story**: As a Pours Consumer user, I want to remove a saved payment method so that I can stop using cards I no longer want associated with my account.

**Priority**: High  
**Story Points**: 3  
**Dependencies**: Stripe PaymentMethod API

#### Acceptance Criteria

```gherkin
Feature: Remove Payment Method
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Payments"

  Scenario: Successfully remove non-default card
    Given I have 2 saved payment methods
    And neither is set as default
    When I click the menu on a card
    And I select "Remove"
    Then I should see a confirmation dialog
    And the dialog should display the card details (last 4 digits)
    And the dialog should say "Are you sure you want to remove this card?"
    When I click "Remove Card"
    Then the card should be removed from my account
    And I should see a success message "Payment method removed"
    And the card should disappear from the list

  Scenario: Attempt to remove default card
    Given I have 2 saved payment methods
    And one is set as default
    When I attempt to remove the default card
    Then I should see a warning dialog
    And the dialog should say "This is your default payment method"
    And I should see options:
      | Set another card as default and remove |
      | Cancel                                  |
    When I select another card as default
    And I confirm removal
    Then the new default should be set
    And the old default should be removed

  Scenario: Remove last payment method
    Given I have only 1 saved payment method
    When I remove it
    Then I should see a confirmation
    And the dialog should warn "You'll need to enter payment details for future purchases"
    When I confirm
    Then the card should be removed
    And I should see the empty state

  Scenario: Cancel removal
    Given I attempt to remove a card
    When I click "Cancel" in the confirmation dialog
    Then the dialog should close
    And the card should remain in my list
    And no changes should be made

  Scenario: Remove expired card
    Given I have an expired card
    When I remove it
    Then the removal should not require additional confirmation
    And a simplified message should appear: "Remove expired card?"
```

#### Technical Requirements

**Remove Payment Method**:
```typescript
// Detach payment method from customer
const detachedPaymentMethod = await stripe.paymentMethods.detach(
  paymentMethodId
);

// If it was the default, update customer
if (wasDefault && otherPaymentMethodId) {
  await stripe.customers.update(stripeCustomerId, {
    invoice_settings: {
      default_payment_method: otherPaymentMethodId
    }
  });
}
```

**Confirmation Dialog**:
- Display card brand icon and last 4 digits
- Show warning if default card
- Provide option to set new default before removal
- Use AlertDialog component for confirmation

---

### US-PAYMENT.4: Set Default Payment Method

**Story**: As a Pours Consumer user, I want to set a default payment method so that it's automatically selected during checkout for faster purchases.

**Priority**: High  
**Story Points**: 3  
**Dependencies**: Stripe Customer API

#### Acceptance Criteria

```gherkin
Feature: Set Default Payment Method
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Payments"
    And I have multiple payment methods saved

  Scenario: Set different card as default
    Given Card A is currently my default
    When I click "Set as Default" on Card B
    Then Card B should become the default
    And Card B should display a "Default" badge
    And Card A should no longer show the badge
    And I should see a success message "Default payment method updated"

  Scenario: Default card selected at checkout
    Given I have set Card B as default
    When I proceed to checkout
    Then Card B should be pre-selected
    And I should be able to change to another card if desired

  Scenario: Visual indication of default
    Given I have a default payment method
    When I view my payment methods
    Then the default card should have a prominent "Default" badge
    And the default card should appear first in the list
    And the badge should use primary color for visibility

  Scenario: Only one default at a time
    Given Card A is default
    When I set Card B as default
    Then only Card B should have the default badge
    And Card A should automatically lose the default status
```

#### Technical Requirements

**Update Default Payment Method**:
```typescript
// Set new default payment method
await stripe.customers.update(stripeCustomerId, {
  invoice_settings: {
    default_payment_method: newPaymentMethodId
  }
});

// Alternative: Set on specific payment method
await stripe.paymentMethods.attach(paymentMethodId, {
  customer: stripeCustomerId
});
```

**UI Implementation**:
- "Set as Default" button on non-default cards
- "Default" badge on current default
- Optimistic UI updates
- Sort default card to top of list

---

### US-PAYMENT.5: Update Payment Method Details

**Story**: As a Pours Consumer user, I want to update my payment method details (expiration date, billing address) so that I can keep my card information current without re-adding the card.

**Priority**: Medium  
**Story Points**: 5  
**Dependencies**: Stripe PaymentMethod API

#### Acceptance Criteria

```gherkin
Feature: Update Payment Method Details
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Payments"

  Scenario: Update expiration date
    Given I have a card expiring soon
    When I click "Update" on the card
    Then I should see an update form
    And the form should show current expiration date
    When I update the expiration to "12/26"
    And I click "Save Changes"
    Then the expiration should be updated
    And I should see "Card updated successfully"
    And the "Expiring Soon" warning should disappear

  Scenario: Update cardholder name
    Given I need to correct the cardholder name
    When I click "Update" and modify the name
    And I save the changes
    Then the cardholder name should be updated
    And the change should reflect immediately

  Scenario: Update billing ZIP code
    Given I have moved to a new address
    When I update the billing ZIP code
    And I save the changes
    Then the new ZIP code should be saved
    And future charges should use the new billing address

  Scenario: Validation - Invalid expiration
    When I attempt to set an expired date
    Then I should see an error "Card expiration cannot be in the past"
    And the changes should not be saved

  Scenario: Cannot update card number
    When I view the update form
    Then I should not see an option to change the card number
    And I should see a note "To use a different card, please add a new payment method"
```

#### Technical Requirements

**Update Payment Method**:
```typescript
// Update payment method metadata
const updatedPaymentMethod = await stripe.paymentMethods.update(
  paymentMethodId,
  {
    billing_details: {
      name: cardholderName,
      address: {
        postal_code: zipCode
      }
    },
    card: {
      exp_month: expirationMonth,
      exp_year: expirationYear
    }
  }
);
```

**Update Limitations**:
- Can update: Expiration date, billing details, metadata
- Cannot update: Card number, CVC (security reasons)
- To change card number, user must add new card

---

### US-PAYMENT.6: View Payment History

**Story**: As a Pours Consumer user, I want to view my payment history and transaction details so that I can track my spending and verify charges.

**Priority**: Medium  
**Story Points**: 5  
**Dependencies**: Stripe Charges/PaymentIntents API, orders table

#### Acceptance Criteria

```gherkin
Feature: View Payment History
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Manage Payments"
    And I click on "Payment History"

  Scenario: Display all transactions
    Given I have made 10 purchases
    When I view the payment history
    Then I should see all 10 transactions listed
    And transactions should be sorted by date (newest first)
    And each transaction should display:
      | Date                  |
      | Venue Name            |
      | Amount                |
      | Payment Method Used   | (last 4 digits)
      | Transaction Status    |

  Scenario: View transaction details
    When I click on a transaction
    Then I should see complete transaction details:
      | Transaction ID        |
      | Date and Time         |
      | Venue                 |
      | Order Number          |
      | Items Purchased       |
      | Subtotal              |
      | Tax                   |
      | Total Amount          |
      | Payment Method        |
      | Transaction Status    |

  Scenario: Filter by payment method
    Given I have used multiple payment methods
    When I filter by a specific card
    Then I should see only transactions using that card

  Scenario: Filter by date range
    When I select a date range (e.g., "Last 30 days")
    Then I should see only transactions within that range

  Scenario: Transaction statuses
    Given I have transactions with different statuses
    Then successful payments should show "Completed"
    And failed payments should show "Failed" with reason
    And pending payments should show "Processing"
    And refunded payments should show "Refunded"

  Scenario: Download transaction history
    When I click "Download History"
    Then I should receive a CSV file
    And the file should include all transaction data

  Scenario: Link to order details
    When I click on a transaction
    Then I should see a "View Order" link
    When I click "View Order"
    Then I should be navigated to the order detail page

  Scenario: Empty payment history
    Given I have never made a purchase
    When I view payment history
    Then I should see an empty state
    And I should see a "Browse Menu" call-to-action
```

#### Technical Requirements

**Fetch Payment History**:
```typescript
// Get charges for customer
const charges = await stripe.charges.list({
  customer: stripeCustomerId,
  limit: 100
});

// Or get payment intents (recommended)
const paymentIntents = await stripe.paymentIntents.list({
  customer: stripeCustomerId,
  limit: 100
});

// Join with orders table for complete details
const transactions = await Promise.all(
  paymentIntents.data.map(async (pi) => {
    const order = await supabase
      .from('orders')
      .select('*, venues(name)')
      .eq('payment_intent_id', pi.id)
      .single();
    
    return {
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: pi.status,
      paymentMethod: pi.payment_method_details?.card?.last4,
      date: new Date(pi.created * 1000),
      order: order.data
    };
  })
);
```

**Payment Intent Storage**:
- Store `payment_intent_id` in orders table
- Link payments to orders for complete history
- Query orders for venue and item details

---

### US-PAYMENT.7: Handle Payment Failures and Retries

**Story**: As a Pours Consumer user, I want clear feedback when a payment fails and easy options to retry so that I can successfully complete my purchase.

**Priority**: Medium  
**Story Points**: 5  
**Dependencies**: Stripe error handling, order management

#### Acceptance Criteria

```gherkin
Feature: Handle Payment Failures and Retries
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given I am logged in as a Pours Consumer user
    And I am completing a purchase

  Scenario: Insufficient funds
    Given my card has insufficient funds
    When I attempt to complete payment
    Then I should see an error "Your card was declined due to insufficient funds"
    And I should see options to:
      | Try a different payment method |
      | Update payment details         |
      | Cancel order                   |

  Scenario: Expired card
    Given my saved card has expired
    When I attempt to use it for payment
    Then I should see an error "This card has expired"
    And I should be prompted to "Update expiration date"
    And I should see an option to "Use different card"

  Scenario: Card declined
    Given my card is declined by the bank
    When payment fails
    Then I should see "Your card was declined. Please contact your bank."
    And I should see an option to try another card
    And the order should remain pending

  Scenario: Network error during payment
    Given there is a network interruption
    When payment processing is interrupted
    Then I should see "Connection lost. Please check your internet."
    And I should see a "Retry Payment" button
    When I retry after connectivity is restored
    Then the payment should process successfully

  Scenario: 3D Secure authentication required
    Given my card requires 3D Secure authentication
    When I initiate payment
    Then I should be redirected to my bank's authentication page
    When I complete authentication
    Then I should be returned to the app
    And the payment should complete

  Scenario: Retry with different card
    Given a payment failed
    When I select "Try different card"
    Then I should see my saved payment methods
    When I select another card
    And I retry payment
    Then the order should process with the new card

  Scenario: Update card and retry
    Given my card expired
    When I update the expiration date
    And I retry payment
    Then the payment should succeed with updated details
```

#### Technical Requirements

**Error Handling**:
```typescript
try {
  const paymentIntent = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: paymentMethodId
    }
  );
  
  if (paymentIntent.error) {
    handlePaymentError(paymentIntent.error);
  } else if (paymentIntent.paymentIntent.status === 'succeeded') {
    handlePaymentSuccess(paymentIntent.paymentIntent);
  }
} catch (error) {
  handlePaymentError(error);
}

const handlePaymentError = (error: StripeError) => {
  switch (error.code) {
    case 'card_declined':
      showError('Your card was declined. Please try a different card.');
      break;
    case 'insufficient_funds':
      showError('Your card has insufficient funds.');
      break;
    case 'expired_card':
      showError('This card has expired. Please update your card details.');
      break;
    case 'incorrect_cvc':
      showError('The security code is incorrect.');
      break;
    case 'processing_error':
      showError('An error occurred. Please try again.');
      break;
    default:
      showError('Payment failed. Please try again or contact support.');
  }
};
```

**3D Secure / SCA Handling**:
```typescript
// Handle authentication required
if (paymentIntent.status === 'requires_action') {
  const { error, paymentIntent: confirmedIntent } = 
    await stripe.handleCardAction(clientSecret);
  
  if (error) {
    handlePaymentError(error);
  } else if (confirmedIntent.status === 'succeeded') {
    handlePaymentSuccess(confirmedIntent);
  }
}
```

**Retry Logic**:
- Allow up to 3 retry attempts
- Track failed payment attempts
- Suggest alternative payment methods
- Preserve order data during retries

---

### US-PAYMENT.8: Secure Payment Processing

**Story**: As a Pours Consumer user, I want my payment information to be processed securely so that I can trust the app with my financial data.

**Priority**: Critical  
**Story Points**: 8  
**Dependencies**: Stripe integration, PCI DSS compliance

#### Acceptance Criteria

```gherkin
Feature: Secure Payment Processing
  Epic: EPIC-PROFILE-004 - Manage Payments

  Background:
    Given the application uses Stripe for payment processing

  Scenario: PCI DSS compliance
    When a user enters card details
    Then card data should never touch our servers
    And Stripe Elements should handle all sensitive data
    And only tokenized references should be stored

  Scenario: Encrypted transmission
    Given a user is entering payment information
    Then all data should be transmitted over TLS 1.2+
    And the connection should show a secure lock icon
    And certificate validation should be enforced

  Scenario: No card data in logs
    When any error occurs during payment
    Then error logs should not contain card numbers
    And error logs should not contain CVC codes
    And logs should only contain tokenized references

  Scenario: Secure storage
    Given a user saves a payment method
    Then only the Stripe payment method ID should be stored
    And no raw card data should exist in our database
    And the Stripe customer ID should be encrypted at rest

  Scenario: Session security
    Given a user is logged in
    When they access payment settings
    Then the session should be validated
    And authentication should be required
    And CSRF protection should be enabled

  Scenario: Fraud detection
    Given a suspicious payment is detected
    Then Stripe Radar should flag the transaction
    And additional verification should be required
    And the user should be notified of the security check
```

#### Technical Requirements

**Security Checklist**:

1. **PCI DSS Compliance** ✓
   - Use Stripe Elements for card input
   - Never store raw card data
   - Use Stripe-hosted payment forms
   - Tokenize all payment methods

2. **Data Encryption** ✓
   - TLS 1.2+ for all connections
   - Encrypt Stripe customer IDs in database
   - Use parameterized queries to prevent SQL injection
   - Sanitize all user inputs

3. **Authentication & Authorization** ✓
   - Require authentication for payment operations
   - Validate user ownership of payment methods
   - Use RLS policies on any payment-related tables
   - Implement CSRF protection

4. **Secure API Calls** ✓
   ```typescript
   // All Stripe calls should be server-side (Edge Functions)
   // Never expose Stripe secret key in client code
   
   // Edge Function example
   export async function POST(request: Request) {
     // Verify authentication
     const user = await getAuthenticatedUser(request);
     if (!user) {
       return new Response('Unauthorized', { status: 401 });
     }
     
     // Validate input
     const { paymentMethodId } = await request.json();
     if (!paymentMethodId || typeof paymentMethodId !== 'string') {
       return new Response('Invalid input', { status: 400 });
     }
     
     // Process with Stripe
     const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
     // ... payment logic
   }
   ```

5. **Logging & Monitoring** ✓
   - Log payment events (without sensitive data)
   - Monitor for suspicious patterns
   - Alert on failed authentication attempts
   - Track payment method additions/removals

6. **Fraud Prevention** ✓
   - Enable Stripe Radar
   - Require 3D Secure for high-risk transactions
   - Implement rate limiting on payment operations
   - Monitor for unusual patterns

---

## Non-Functional Requirements

### Performance
- Payment method list load time: < 1 second
- Card tokenization time: < 2 seconds
- Payment processing time: < 3 seconds
- 3D Secure authentication time: < 30 seconds

### Scalability
- Support unlimited payment methods per user
- Handle concurrent payment requests
- Stripe API rate limits respected
- Caching for payment method lists

### Security (Critical)
- PCI DSS Level 1 compliant via Stripe
- TLS 1.2+ for all communications
- No raw card data stored or logged
- Payment methods encrypted at rest
- CSRF protection enabled
- Authentication required for all operations

### Usability
- Mobile-responsive payment forms
- Auto-detection of card brands
- Real-time validation feedback
- Clear error messages
- Accessible to screen readers
- Support for keyboard navigation

### Reliability
- 99.9% payment processing uptime (Stripe SLA)
- Graceful handling of network failures
- Automatic retry for transient errors
- Fallback to alternative payment methods

---

## Technical Architecture

### Component Structure
```
ManagePayments (Container)
├── PageHeader
├── Tabs
│   ├── PaymentMethods (Active)
│   └── PaymentHistory
├── PaymentMethodsList
│   └── PaymentMethodCard[]
│       ├── CardBrandIcon
│       ├── CardDetails
│       │   ├── Last4Digits
│       │   ├── ExpirationDate
│       │   └── CardholderName
│       ├── DefaultBadge (conditional)
│       ├── ExpiringBadge (conditional)
│       └── ActionMenu
│           ├── SetAsDefault
│           ├── UpdateDetails
│           └── RemoveCard
├── AddPaymentMethodButton
└── AddPaymentMethodDialog
    └── StripeElements
        ├── CardNumberElement
        ├── CardExpiryElement
        ├── CardCvcElement
        └── PostalCodeElement

PaymentHistory (Component)
├── FilterBar
│   ├── DateRangePicker
│   └── PaymentMethodFilter
├── TransactionsList
│   └── TransactionCard[]
│       ├── TransactionDate
│       ├── VenueName
│       ├── Amount
│       ├── PaymentMethod
│       └── Status
└── ExportButton
```

### State Management
- **usePaymentMethods**: Hook for fetching/managing payment methods
- **useStripe**: Stripe.js hook for payment operations
- **usePaymentHistory**: Hook for transaction history
- **useAddPaymentMethod**: Hook for adding new cards

### Stripe Integration Architecture
```
Client (React)
    ↓
  Stripe.js + Elements
    ↓
  [Card Tokenization]
    ↓
Edge Function (Supabase)
    ↓
  Stripe API
    ↓
  Payment Method Created
    ↓
  Customer Updated
    ↓
Response to Client
```

### Database Schema (Minimal)
```sql
-- Only store Stripe references, never card data
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Optional: Store payment intent IDs with orders
ALTER TABLE orders ADD COLUMN payment_intent_id TEXT;
```

---

## Integration Requirements

### Stripe Integration
1. **Enable Stripe in Lovable**
   - Use Lovable's Stripe integration tool
   - Provide Stripe Secret Key
   - Configure webhook endpoints

2. **Stripe Components Needed**
   - Customer (one per user)
   - PaymentMethod (cards)
   - SetupIntent (for saving cards)
   - PaymentIntent (for charges)

3. **Stripe Configuration**
   ```typescript
   // .env.local (development only)
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   // Supabase Secrets (production)
   STRIPE_SECRET_KEY=sk_live_...
   ```

### Edge Functions Required
1. **create-stripe-customer**
   - Creates Stripe customer on first payment
   - Stores customer ID in profile
   
2. **attach-payment-method**
   - Attaches payment method to customer
   - Sets as default if requested

3. **detach-payment-method**
   - Removes payment method from customer
   - Updates default if necessary

4. **process-payment**
   - Creates payment intent
   - Handles payment confirmation
   - Updates order status

---

## Testing Strategy

### Unit Tests
- Card validation logic
- Expiration date calculations
- Default selection logic
- Error message formatting

### Integration Tests
- Add payment method flow
- Remove payment method flow
- Set default payment method
- Payment processing end-to-end

### Security Tests
- Verify no card data in logs
- Test CSRF protection
- Validate authentication requirements
- Test input sanitization

### Stripe Test Cards
```
Successful payment:    4242 4242 4242 4242
Declined card:         4000 0000 0000 0002
Insufficient funds:    4000 0000 0000 9995
Expired card:          4000 0000 0000 0069
3D Secure required:    4000 0025 0000 3155
```

### E2E Tests
```gherkin
Feature: Complete Payment Management Journey
  Scenario: User adds and uses payment method
    Given a new user signs up
    When they add a payment method
    And they complete their first order
    And they view payment history
    And they add a second payment method
    And they set it as default
    And they complete another order
    Then both payments should succeed
    And payment history should show both transactions
```

---

## Success Metrics & KPIs

### Adoption Metrics
- Users with saved payment methods: Target > 70%
- Average payment methods per user: Target 1.8
- Default payment method set: Target > 85%

### Performance Metrics
- Payment success rate: Target > 98%
- Checkout time with saved card: Target < 10 seconds
- Payment method save time: Target < 3 seconds

### Business Metrics
- Checkout abandonment rate: Target < 15%
- Repeat purchase rate: Target > 40%
- Failed payment rate: Target < 2%

### User Satisfaction
- Payment experience NPS: Target > 60
- Feature satisfaction rating: Target > 4.4/5
- Support tickets for payments: Target < 1% of total

---

## Traceability Matrix

| User Story | Epic | Scenarios | Test Cases | Components |
|-----------|------|-----------|------------|------------|
| US-PAYMENT.1 | EPIC-PROFILE-004 | 10 | TC-PAY-001 to TC-PAY-010 | AddPaymentMethod, StripeElements |
| US-PAYMENT.2 | EPIC-PROFILE-004 | 7 | TC-PAY-011 to TC-PAY-017 | PaymentMethodsList |
| US-PAYMENT.3 | EPIC-PROFILE-004 | 5 | TC-PAY-018 to TC-PAY-022 | RemovePaymentMethod |
| US-PAYMENT.4 | EPIC-PROFILE-004 | 4 | TC-PAY-023 to TC-PAY-026 | SetDefaultButton |
| US-PAYMENT.5 | EPIC-PROFILE-004 | 5 | TC-PAY-027 to TC-PAY-031 | UpdatePaymentMethod |
| US-PAYMENT.6 | EPIC-PROFILE-004 | 8 | TC-PAY-032 to TC-PAY-039 | PaymentHistory |
| US-PAYMENT.7 | EPIC-PROFILE-004 | 7 | TC-PAY-040 to TC-PAY-046 | ErrorHandling |
| US-PAYMENT.8 | EPIC-PROFILE-004 | 6 | TC-PAY-047 to TC-PAY-052 | Security testing |

---

## Future Enhancements

### Phase 2 Enhancements
- **Digital Wallets**: Apple Pay, Google Pay support
- **Buy Now Pay Later**: Afterpay, Klarna integration
- **Bank Accounts**: ACH/Direct debit for lower fees
- **Payment Plans**: Split payments over time
- **Gift Cards**: Store and use gift card balance

### Phase 3 Enhancements
- **Subscription Payments**: Recurring payments for memberships
- **Multi-currency**: Support for international cards
- **Payment Analytics**: Personal spending insights
- **Budget Limits**: Set spending limits on cards
- **Shared Payment Methods**: Family/group payment sharing

---

## Compliance & Regulations

### PCI DSS Compliance
- Level 1 compliance through Stripe
- SAQ A compliance (merchant responsibility)
- No card data stored on our servers
- Annual compliance validation required

### Data Privacy
- GDPR: Users can export payment history
- CCPA: Users can delete payment methods
- Payment data retained for 7 years (tax compliance)
- Anonymized analytics only

### Financial Regulations
- Comply with local payment regulations
- Support for Strong Customer Authentication (SCA)
- 3D Secure for European cards
- Transaction monitoring for fraud

---

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Stripe API downtime | Cache payment methods, queue failed requests |
| Payment failures | Clear error messages, alternative payment options |
| Security breach | PCI compliance, no card storage, regular audits |
| Fraud | Stripe Radar, 3D Secure, transaction monitoring |

### Business Risks
| Risk | Mitigation |
|------|------------|
| High processing fees | Volume discounts with Stripe, optimize payment flow |
| Chargebacks | Clear receipts, order tracking, customer support |
| Compliance violations | Regular audits, legal review, staff training |

---

## Appendix

### Related Documentation
- [Stripe Documentation](https://stripe.com/docs)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
- [Checkout Flow](./checkout-features.md)
- [Order History](./order-history-features.md)

### Stripe Resources
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Payment Methods API](https://stripe.com/docs/api/payment_methods)
- [Strong Customer Authentication](https://stripe.com/docs/strong-customer-authentication)
- [Testing Cards](https://stripe.com/docs/testing)

### Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial documentation created |

---

**Document Status**: Approved  
**Last Review Date**: 2025-11-22  
**Next Review Date**: 2026-02-22  

**IMPORTANT NOTE**: Before implementing this feature, Stripe integration must be enabled using Lovable's Stripe integration tool. No payment processing should be implemented without proper Stripe setup and PCI compliance measures in place.
