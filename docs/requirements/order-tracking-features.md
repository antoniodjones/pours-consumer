# Real-Time Order Tracking - Product Requirements

## Feature Overview

The Real-Time Order Tracking feature enables users to monitor their order status from placement through completion with live updates, status timeline visualization, and estimated completion times. This feature provides transparency and reduces anxiety by keeping customers informed about their order progress in real-time.

---

## Epic CNS-0018: Real-Time Order Tracking

**Description:**  
This epic encompasses the functionality required for users to track their orders in real-time, view detailed status information, receive notifications about status changes, and understand when their order will be ready for pickup or delivery.

**Business Value:**  
- Reduces customer anxiety about order status
- Minimizes customer inquiries about order progress
- Improves customer satisfaction through transparency
- Sets accurate pickup/delivery expectations
- Enhances operational efficiency through clear status communication

---

## User Stories

### US-TRACK.1: View Order Status in Real-Time

**As a** Pours Consumer user  
**I want to** view my order status in real-time  
**So that** I know exactly where my order is in the preparation process

**Background:**  
After placing an order, users need visibility into the current status to plan their pickup timing and understand when their drinks will be ready. Real-time updates prevent confusion and reduce the need to contact venue staff.

**Value:**  
- Provides transparency in order fulfillment
- Reduces customer anxiety about order progress
- Enables better timing for order pickup
- Minimizes venue staff interruptions

**Acceptance Criteria:**

```gherkin
Feature: View Order Status in Real-Time
  Epic: Real-Time Order Tracking (CNS-0018)

  Scenario: User views order immediately after placement
    Given I have just placed an order
    When I navigate to the order tracking page
    Then I should see my order with status "Received"
    And I should see the order number
    And I should see the venue name
    And I should see the order timestamp
    And I should see all ordered items with quantities

  Scenario: Order status updates in real-time
    Given I am viewing my order tracking page
    And my order status is "Received"
    When a bartender starts preparing my order
    Then the status should automatically update to "Preparing"
    And I should see the updated status without refreshing
    And I should see the time when preparation started
    And I should receive a notification "Your order is being prepared"

  Scenario: Order progresses through all statuses
    Given I am tracking my order
    When my order progresses through statuses:
      | Received |
      | Preparing |
      | Ready |
      | Completed |
    Then I should see each status update in real-time
    And each status change should be timestamped
    And I should receive a notification for each status change
    And the status timeline should reflect all transitions

  Scenario: Multiple orders tracked simultaneously
    Given I have 2 active orders at different venues
    When I view my order tracking
    Then I should see both orders listed
    And each order should display its current status independently
    And I should be able to expand each order for details
    And status updates should apply to the correct order
```

**Technical Requirements:**  
- Real-time Supabase subscription to `orders` table
- Status enum: `pending`, `received`, `preparing`, `ready`, `completed`
- WebSocket connection for live status updates
- Client-side state management for active orders
- Timestamp tracking for each status transition

**Acceptance Criteria:**  
- Order status updates display in real-time without page refresh
- All order statuses are clearly labeled and timestamped
- Users receive notifications for each status change
- Multiple orders can be tracked simultaneously
- Real-time connection is maintained while page is active

---

### US-TRACK.2: View Order Status Timeline

**As a** Pours Consumer user  
**I want to** view a visual timeline of my order status  
**So that** I can see the progression and understand what comes next

**Background:**  
A visual timeline helps users understand where their order is in the fulfillment process and what steps remain before completion. This reduces uncertainty and provides clear expectations.

**Value:**  
- Visual representation improves user experience
- Shows both completed and pending steps
- Sets clear expectations for order completion
- Reduces customer support inquiries

**Acceptance Criteria:**

```gherkin
Feature: View Order Status Timeline
  Epic: Real-Time Order Tracking (CNS-0018)

  Scenario: View timeline for order in progress
    Given I am viewing my order details
    And my order status is "Preparing"
    When I view the status timeline
    Then I should see a visual progress indicator showing:
      | Received: Completed with timestamp |
      | Preparing: In Progress (highlighted) |
      | Ready: Pending (grayed out) |
      | Completed: Pending (grayed out) |
    And the current status should be visually distinct
    And completed statuses should show completion timestamps

  Scenario: Timeline shows status duration
    Given my order has moved through multiple statuses
    When I view the timeline
    Then I should see the duration for each completed status:
      | Received: 2 minutes |
      | Preparing: 8 minutes (in progress) |
    And the total elapsed time should be displayed
    And I should see "Estimated time remaining: 5 minutes"

  Scenario: Timeline updates in real-time
    Given I am viewing the order timeline
    And my order status is "Preparing"
    When the status changes to "Ready"
    Then the timeline should automatically update
    And "Preparing" should move to completed
    And "Ready" should become the active status
    And the completion timestamp should appear
    And the animation should be smooth and clear

  Scenario: View completed order timeline
    Given my order status is "Completed"
    When I view the timeline
    Then all statuses should show as completed
    And each status should display its completion timestamp
    And I should see total order fulfillment time
    And I should see pickup/delivery confirmation time
```

**Technical Requirements:**  
- Timeline visualization component
- Status progression calculation from `order_status_history`
- Duration calculation between status transitions
- Real-time timeline updates via Supabase subscriptions
- Smooth CSS animations for status transitions

**Acceptance Criteria:**  
- Timeline shows all order statuses in progression
- Current status is visually highlighted
- Completed statuses show timestamps and durations
- Timeline updates automatically when status changes
- Visual design is clear and easy to understand

---

### US-TRACK.3: Receive Order Status Notifications

**As a** Pours Consumer user  
**I want to** receive notifications when my order status changes  
**So that** I can be informed without constantly checking the tracking page

**Background:**  
Users shouldn't need to continuously monitor the tracking page. Proactive notifications keep them informed while they browse other parts of the app or use other applications.

**Value:**  
- Reduces user effort in tracking orders
- Improves user experience through proactive updates
- Enables users to multitask while waiting
- Ensures users know when to pick up their order

**Acceptance Criteria:**

```gherkin
Feature: Receive Order Status Notifications
  Epic: Real-Time Order Tracking (CNS-0018)

  Scenario: User receives notification when order is being prepared
    Given I have an order with status "Received"
    And I have notifications enabled
    When the bartender starts preparing my order
    Then I should receive an in-app notification "Your order is being prepared"
    And the notification should include the order number
    And the notification should include the estimated ready time
    And clicking the notification should take me to order tracking

  Scenario: User receives notification when order is ready
    Given my order status is "Preparing"
    And I have notifications enabled
    When my order status changes to "Ready"
    Then I should receive a high-priority notification "Your order is ready for pickup!"
    And the notification should include the venue name
    And the notification should include the table/pickup location
    And the notification should be persistent until acknowledged

  Scenario: User receives notification when order is completed
    Given my order status is "Ready"
    When I pick up my order and it's marked as "Completed"
    Then I should receive a notification "Thank you! Enjoy your drinks"
    And the notification should include a link to rate the experience
    And the notification should include loyalty points earned

  Scenario: User disables order notifications
    Given I am in notification settings
    When I disable "Order Status Notifications"
    And my order status changes
    Then I should NOT receive push notifications
    But I should still see in-app status updates
    And the order tracking page should still update in real-time

  Scenario: Notification includes helpful details
    Given my order status changes to "Ready"
    When I receive the notification
    Then the notification should include:
      | Order number: "#12345" |
      | Venue: "Downtown Bar" |
      | Pickup location: "Bar Counter" |
      | Action button: "View Order" |
    And tapping the action should navigate to order details
```

**Technical Requirements:**  
- Push notification system integration
- In-app notification center
- Notification preferences in user settings
- Deep linking to order details from notifications
- Notification templates for each status change

**Acceptance Criteria:**  
- Notifications sent for all status changes
- Notifications include relevant order details
- Users can control notification preferences
- Notifications link to order tracking page
- Critical notifications (Ready) are high-priority

---

### US-TRACK.4: View Bartender Assignment and Notes

**As a** Pours Consumer user  
**I want to** see which bartender is preparing my order and any notes they add  
**So that** I have a personalized experience and can identify who to approach for pickup

**Background:**  
Knowing which bartender is handling the order provides accountability and personalization. Bartender notes can provide important information about substitutions, preparation details, or special accommodations.

**Value:**  
- Personalizes the order experience
- Provides accountability and transparency
- Communicates important preparation details
- Helps users identify correct pickup person

**Acceptance Criteria:**

```gherkin
Feature: View Bartender Assignment and Notes
  Epic: Real-Time Order Tracking (CNS-0018)

  Scenario: Bartender is assigned to order
    Given my order status is "Received"
    When a bartender accepts my order
    Then I should see "Your order is assigned to: [Bartender Name]"
    And I should see the bartender's avatar (if available)
    And the assignment timestamp should be displayed
    And I should receive a notification "Your order has been assigned"

  Scenario: Bartender adds preparation notes
    Given my order is being prepared
    And the bartender is "Mike"
    When the bartender adds a note "Substituted whiskey brand per customer preference"
    Then I should see the note in my order details
    And the note should show the bartender's name
    And the note timestamp should be displayed
    And I should receive a notification about the note

  Scenario: Multiple notes during preparation
    Given my order has multiple items
    When the bartender adds multiple notes:
      | "Out of limes, used lemon instead" |
      | "Extra ice added as requested" |
    Then I should see all notes in chronological order
    And each note should have a timestamp
    And I should be able to expand/collapse the notes section

  Scenario: Bartender indicates delay
    Given my order is being prepared
    When the bartender adds a note "Slight delay, bar is busy"
    And updates the estimated ready time
    Then I should see the updated estimated time
    And I should see the delay note prominently
    And I should receive a notification about the delay

  Scenario: No bartender assigned yet
    Given my order status is "Received"
    And no bartender has accepted it
    When I view my order details
    Then I should see "Waiting for bartender assignment"
    And I should see the order received timestamp
    And I should NOT see any bartender information
```

**Technical Requirements:**  
- `orders.assigned_bartender` field (nullable text)
- `orders.bartender_notes` field (nullable text)
- Real-time updates when bartender or notes change
- Bartender profile integration (if available)
- Notes timestamp tracking

**Acceptance Criteria:**  
- Bartender assignment is displayed when set
- Bartender notes appear in real-time
- Multiple notes are supported and timestamped
- Users are notified of important bartender notes
- Empty states shown when no assignment/notes exist

---

### US-TRACK.5: View Estimated Completion Time

**As a** Pours Consumer user  
**I want to** see an estimated time when my order will be ready  
**So that** I can plan my pickup timing appropriately

**Background:**  
Estimated completion times help users plan their activities and reduce waiting time at the venue. Dynamic estimates that adjust based on actual preparation progress provide more accurate expectations.

**Value:**  
- Reduces unnecessary waiting at venue
- Improves customer planning and timing
- Sets realistic expectations
- Decreases perceived wait time

**Acceptance Criteria:**

```gherkin
Feature: View Estimated Completion Time
  Epic: Real-Time Order Tracking (CNS-0018)

  Scenario: View initial estimated completion time
    Given I have just placed an order
    When I view the order tracking page
    Then I should see "Estimated ready time: [time]"
    And the estimate should be based on average preparation time
    And the estimate should account for current venue queue
    And I should see "Ready in approximately X minutes"

  Scenario: Estimated time updates as order progresses
    Given my order initial estimate was "15 minutes"
    And 10 minutes have elapsed
    When my order moves to "Preparing" status
    Then the estimate should update to reflect actual progress
    And I should see "Ready in approximately 5 minutes"
    And the countdown should update in real-time

  Scenario: Estimated time adjusts for delays
    Given my estimated ready time is "7:30 PM"
    When the bartender indicates a delay
    Then the estimated time should update to "7:40 PM"
    And I should see a notification "Estimated time updated"
    And the reason for delay should be shown (if provided)

  Scenario: Order ready earlier than estimated
    Given my estimated ready time is "7:30 PM"
    When my order is marked as "Ready" at "7:25 PM"
    Then I should see "Your order is ready! (5 minutes early)"
    And I should receive an immediate notification
    And the early completion should be highlighted positively

  Scenario: Order ready later than estimated
    Given my estimated ready time is "7:30 PM"
    When my order is marked as "Ready" at "7:35 PM"
    Then I should see "Your order is ready"
    And the notification should apologize for the delay
    And I should not see negative messaging

  Scenario: No estimate available
    Given the venue has no historical data
    Or the order is complex/custom
    When I view my order tracking
    Then I should see "Preparing your order"
    And I should NOT see a specific time estimate
    And I should see "We'll notify you when ready"
```

**Technical Requirements:**  
- Calculate average preparation time per venue/product
- Factor in current order queue at venue
- Real-time estimate updates based on progress
- Store estimate in `orders` table (computed field)
- Algorithm to adjust estimates dynamically

**Acceptance Criteria:**  
- Initial estimate shown at order placement
- Estimate updates as order progresses
- Delays adjust the estimate appropriately
- Early completions are highlighted positively
- Graceful handling when no estimate available

---

### US-TRACK.6: Access Order History with Status Details

**As a** Pours Consumer user  
**I want to** view the complete status history of any past order  
**So that** I can reference timing and understand the fulfillment process

**Background:**  
Users may want to review past order timing for planning future visits, resolving issues, or understanding typical preparation times at a venue. Complete status history provides this transparency.

**Value:**  
- Provides historical order data for planning
- Supports issue resolution and inquiries
- Builds trust through transparency
- Enables performance comparison across venues

**Acceptance Criteria:**

```gherkin
Feature: Access Order History with Status Details
  Epic: Real-Time Order Tracking (CNS-0018)

  Scenario: View status history for completed order
    Given I have a completed order from last week
    When I navigate to the order details in my order history
    Then I should see the complete status timeline:
      | Received: 7:15 PM |
      | Preparing: 7:18 PM (3 min) |
      | Ready: 7:26 PM (8 min) |
      | Completed: 7:30 PM (4 min) |
    And I should see the total order duration: "15 minutes"
    And I should see all bartender notes (if any)

  Scenario: View order with delays in history
    Given I have a past order that experienced delays
    When I view the order status history
    Then I should see all status transitions with timestamps
    And I should see any delay notes from the bartender
    And I should see the adjusted completion times
    And I should see the final actual completion time

  Scenario: Compare order timing across venues
    Given I have orders from multiple venues
    When I view my order history
    Then I should be able to see average preparation time per venue
    And I should see fastest and slowest fulfillment times
    And I should be able to filter by venue
    And I should be able to sort by preparation duration

  Scenario: Export order status history
    Given I am viewing a past order's details
    When I click "Download Receipt"
    Then the receipt should include the complete status timeline
    And it should show bartender assignment
    And it should include all preparation notes
    And it should show order and completion timestamps

  Scenario: Status history shows all transitions
    Given I am viewing an order's status history
    When the order had multiple status transitions
    Then I should see each transition in the `order_status_history` table
    And I should see who initiated each transition (if tracked)
    And I should see the duration of each status
    And I should see any notes associated with transitions
```

**Technical Requirements:**  
- Query `order_status_history` table for historical data
- Join with `orders` and `order_items` for complete details
- Calculate durations between status transitions
- Support filtering and sorting by various criteria
- Include status history in receipt/export

**Acceptance Criteria:**  
- Complete status history available for all orders
- All transitions timestamped and logged
- Durations calculated between statuses
- Historical data persists indefinitely
- Status history included in order exports

---

### US-TRACK.7: Track Order from Order Confirmation Email

**As a** Pours Consumer user  
**I want to** click a tracking link in my order confirmation email  
**So that** I can quickly access my order status without logging into the app

**Background:**  
Many users check their email for order confirmations. Providing a direct tracking link in the confirmation email reduces friction and makes status checking more convenient.

**Value:**  
- Reduces friction in accessing order status
- Improves user experience for email users
- Provides multiple access points to tracking
- Enables tracking without app login (for guests)

**Acceptance Criteria:**

```gherkin
Feature: Track Order from Order Confirmation Email
  Epic: Real-Time Order Tracking (CNS-0018)

  Scenario: Authenticated user tracks via email link
    Given I placed an order as a logged-in user
    And I received an order confirmation email
    When I click the "Track Your Order" link in the email
    Then I should be taken directly to the order tracking page
    And my order should be displayed with current status
    And I should be logged in automatically (if session valid)

  Scenario: Guest user tracks via email link
    Given I placed an order as a guest
    And I provided my email during checkout
    When I click the "Track Your Order" link in the email
    Then I should be taken to a guest order tracking page
    And my order should be displayed without requiring login
    And I should see the current order status
    And I should receive real-time updates

  Scenario: Email contains order tracking details
    Given I receive an order confirmation email
    When I open the email
    Then I should see:
      | Order number |
      | Order items and quantities |
      | Venue name and address |
      | Initial status: "Received" |
      | Estimated ready time |
      | "Track Your Order" button/link |
    And the tracking link should be prominent and clickable

  Scenario: Tracking link expires for security (guest orders only)
    Given I placed a guest order 30 days ago
    When I click the tracking link from the old email
    Then I should see a message "This tracking link has expired"
    And I should be prompted to enter my order number and email
    And after verification, I should see the order details

  Scenario: Share tracking link with others
    Given I have an active order
    When I copy the tracking URL from my email
    And I share it with a friend
    Then my friend should be able to view the order status (guest mode)
    But they should NOT be able to modify or cancel the order
    And personal information should be limited/masked
```

**Technical Requirements:**  
- Generate unique tracking URL for each order
- Include order ID and secure token in URL
- Support both authenticated and guest tracking
- Implement token expiration for guest orders (30 days)
- Mask sensitive info for shared/guest tracking links

**Acceptance Criteria:**  
- Email includes direct tracking link
- Link works for both authenticated and guest users
- Real-time updates work on tracking page accessed via email
- Tracking links expire after 30 days for security
- Shared links show limited information

---

## Data Models

### Existing Database Tables (Used by Feature)

#### orders Table

```sql
-- Existing structure (relevant fields)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  venue_id UUID NOT NULL REFERENCES public.venues(id),
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'received', 'preparing', 'ready', 'completed'
  
  -- Timing fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  received_at TIMESTAMP WITH TIME ZONE,
  preparing_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Bartender fields
  assigned_bartender TEXT,
  bartender_notes TEXT,
  
  -- Guest fields
  guest_email TEXT,
  guest_name TEXT,
  guest_phone TEXT,
  
  -- Other fields
  table_number TEXT,
  special_instructions TEXT
);

-- Indexes for tracking queries
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
```

#### order_status_history Table

```sql
-- Existing structure
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  duration_seconds INTEGER, -- Time in previous status
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  changed_by_user_id UUID, -- Bartender/staff who made the change
  notes TEXT -- Optional notes about the status change
);

-- Indexes
CREATE INDEX idx_order_status_history_order ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON public.order_status_history(changed_at DESC);
```

---

## Technical Architecture

### Database Functions (Existing)

#### update_order_status Function

```sql
CREATE OR REPLACE FUNCTION public.update_order_status(
  order_id_param UUID,
  new_status TEXT,
  notes_param TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_order RECORD;
  duration_calc INTEGER;
  previous_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current order details
  SELECT * INTO current_order FROM public.orders WHERE id = order_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Calculate duration based on status transition
  CASE new_status
    WHEN 'preparing' THEN
      previous_timestamp := current_order.received_at;
      UPDATE public.orders SET preparing_at = NOW() WHERE id = order_id_param;
    WHEN 'ready' THEN
      previous_timestamp := current_order.preparing_at;
      UPDATE public.orders SET ready_at = NOW() WHERE id = order_id_param;
    WHEN 'completed' THEN
      previous_timestamp := current_order.ready_at;
      UPDATE public.orders SET completed_at = NOW() WHERE id = order_id_param;
  END CASE;
  
  -- Calculate duration if we have a previous timestamp
  IF previous_timestamp IS NOT NULL THEN
    duration_calc := EXTRACT(EPOCH FROM (NOW() - previous_timestamp))::INTEGER;
  END IF;
  
  -- Update the order status
  UPDATE public.orders SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = order_id_param;
  
  -- Insert into status history
  INSERT INTO public.order_status_history (
    order_id, 
    status, 
    previous_status, 
    duration_seconds, 
    notes
  ) VALUES (
    order_id_param, 
    new_status, 
    current_order.status, 
    duration_calc, 
    notes_param
  );
END;
$$;
```

---

### React Hooks

#### useRealtimeOrderStatus Hook

```typescript
// src/hooks/useRealtimeOrderStatus.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderStatus {
  id: string;
  status: string;
  received_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  assigned_bartender: string | null;
  bartender_notes: string | null;
  updated_at: string;
}

export const useRealtimeOrderStatus = (orderId: string) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch initial order status
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, received_at, preparing_at, ready_at, completed_at, assigned_bartender, bartender_notes, updated_at')
        .eq('id', orderId)
        .single();

      if (error) {
        setError(error);
      } else {
        setOrderStatus(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrderStatus(payload.new as OrderStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { orderStatus, loading, error };
};
```

#### useOrderStatusHistory Hook

```typescript
// src/hooks/useOrderStatusHistory.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatusHistoryEntry {
  id: string;
  status: string;
  previous_status: string | null;
  duration_seconds: number | null;
  changed_at: string;
  notes: string | null;
}

export const useOrderStatusHistory = (orderId: string) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: true });

      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [orderId]);

  return { history, loading };
};
```

---

### React Components

#### OrderStatusTimeline Component

```typescript
// src/components/OrderStatusTimeline.tsx
// - Visual timeline showing order progression
// - Highlights current status
// - Shows timestamps for completed statuses
// - Displays duration for each status
// - Real-time updates via useRealtimeOrderStatus hook
// - Smooth animations for status transitions
```

#### OrderTrackingPage Component

```typescript
// src/pages/TrackOrder.tsx
// - Main order tracking interface
// - Displays order details and items
// - Shows real-time status using OrderStatusTimeline
// - Displays bartender assignment and notes
// - Shows estimated completion time
// - Provides notification preferences
// - Supports both authenticated and guest tracking
```

#### OrderStatusNotification Component

```typescript
// src/components/OrderStatusNotification.tsx
// - In-app notification component
// - Displays status change notifications
// - Provides action buttons (View Order)
// - Shows notification history
// - Supports notification preferences
```

---

## Integration Points

### With Existing Features

1. **CNS-0009 Checkout Process:**
   - Order created with initial "pending" or "received" status
   - Email confirmation includes tracking link
   - Redirect to tracking page after successful checkout

2. **CNS-0012 Order History Management:**
   - Order history includes status timeline for past orders
   - Users can re-access tracking for recent orders
   - Status history preserved for all orders

3. **CNS-0015 Profile Rewards:**
   - Loyalty points awarded when order status reaches "Completed"
   - Status updates trigger points calculation
   - Notification includes points earned

4. **CNS-0020 Privacy & Compliance:**
   - Guest order tracking links expire after 30 days
   - Personal information masked in shared tracking links
   - Order data retention follows privacy policies

5. **CNS-0023 Social Drinking & Group Orders:**
   - Group orders show assignment status for each drink
   - Assignees notified when order is ready
   - Status updates sent to all order participants

---

## Supabase Real-Time Configuration

### Enable Real-Time for Orders

```sql
-- Ensure orders table has replica identity
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Add to realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
```

---

## Notification System

### Notification Templates

#### Order Preparing Notification
```json
{
  "title": "Order Being Prepared",
  "body": "Your order #{{order_number}} is being prepared by {{bartender_name}}",
  "data": {
    "order_id": "{{order_id}}",
    "status": "preparing",
    "action": "view_order"
  }
}
```

#### Order Ready Notification
```json
{
  "title": "Order Ready! 🎉",
  "body": "Your order #{{order_number}} is ready for pickup at {{venue_name}}",
  "data": {
    "order_id": "{{order_id}}",
    "status": "ready",
    "action": "view_order",
    "priority": "high"
  }
}
```

#### Order Completed Notification
```json
{
  "title": "Thanks for Your Order!",
  "body": "Enjoy your drinks! You earned {{points}} loyalty points",
  "data": {
    "order_id": "{{order_id}}",
    "status": "completed",
    "action": "rate_order"
  }
}
```

---

## Success Metrics

### Engagement Metrics
- Percentage of users who view order tracking (target: 80%+)
- Average time spent on tracking page per order
- Notification open rate by status type
- Email tracking link click-through rate (target: 60%+)

### Operational Metrics
- Average time in each status by venue
- Order status update latency (target: <2 seconds)
- Percentage of orders with bartender notes
- Estimation accuracy (actual vs estimated ready time)

### User Satisfaction Metrics
- Reduction in "where is my order" support inquiries
- User satisfaction ratings for tracking experience
- Percentage of users who return after first tracked order

---

## Future Enhancements

### Phase 2 Considerations
- **GPS-Based Pickup Alerts:** Notify bartender when user arrives at venue
- **Queue Position Visibility:** Show user's position in order queue
- **Preparation Video/Photos:** Bartender can share drink preparation photos
- **Smart Notifications:** ML-based optimal notification timing
- **Bartender Performance Metrics:** Average preparation times per bartender
- **Predictive Completion Times:** AI-powered estimation based on historical data
- **Integration with Smart Watches:** Order status on wearable devices

---

## Appendix

### Glossary

- **Order Status:** The current state of an order in the fulfillment process
- **Status Timeline:** Visual representation of order progression through statuses
- **Bartender Assignment:** The staff member responsible for preparing the order
- **Estimated Completion Time:** Predicted time when order will be ready
- **Status History:** Complete record of all status changes for an order
- **Real-Time Updates:** Live status changes without requiring page refresh

### Related Documentation

- [Checkout Process Features](./checkout-features.md) - CNS-0009
- [Order History Features](./order-history-features.md) - CNS-0012
- [Profile Rewards Features](./profile-rewards-features.md) - CNS-0015
- [Social Drinking & Group Orders](./social-drinking-group-orders-features.md) - CNS-0023
