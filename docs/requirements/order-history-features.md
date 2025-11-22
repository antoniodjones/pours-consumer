# Order History - Product Requirements Documentation

## Document Information
- **Document Version**: 1.0
- **Last Updated**: 2025-11-22
- **Epic**: EPIC-PROFILE-003 - Order History
- **Related Components**: `OrderHistory`, `OrderDetail`, `OrderCard`, `OrderStatusTimeline`
- **Database Tables**: `orders`, `order_items`, `order_status_history`, `products`, `venues`

---

## Executive Summary

The Order History section enables Pours Consumer users to view, track, and manage their past and current orders. This feature provides transparency into order status, detailed purchase history, and the ability to quickly reorder favorite items. It serves as a crucial tool for customer satisfaction, order tracking, and repeat purchase facilitation.

---

## Epic Definition

### EPIC-PROFILE-003: Order History

**Epic Description**: As a Pours Consumer user, I need to access my complete order history so that I can track current orders, review past purchases, manage receipts, and easily reorder my favorite items.

**Business Value**:
- Increases customer confidence through order transparency
- Reduces customer support inquiries about order status
- Facilitates repeat purchases through reorder functionality
- Provides customers with purchase records for expense tracking
- Enables data-driven insights into customer ordering patterns

**Success Metrics**:
- Order history page views: > 40% of active users monthly
- Reorder conversion rate: > 25%
- Average time to find an order: < 30 seconds
- Order detail view rate: > 60% of orders viewed
- Customer satisfaction with order tracking: > 4.3/5

---

## User Stories

### US-ORDER.1: View Complete Order History

**Story**: As a Pours Consumer user, I want to view my complete order history with all orders displayed chronologically so that I can review my past purchases and track current orders.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: Supabase `orders`, `order_items`, `venues` tables

#### Acceptance Criteria

```gherkin
Feature: View Complete Order History
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Order History"

  Scenario: Display all orders in chronological order
    Given I have placed 10 orders over the past 3 months
    When I view the Order History page
    Then I should see all 10 orders listed
    And orders should be sorted by date (newest first)
    And each order card should display:
      | Order Number    |
      | Date            |
      | Venue Name      |
      | Total Amount    |
      | Order Status    |
      | Number of Items |

  Scenario: View orders with different statuses
    Given I have orders with the following statuses:
      | Status    | Count |
      | Pending   | 1     |
      | Preparing | 2     |
      | Ready     | 1     |
      | Completed | 15    |
      | Cancelled | 1     |
    When I view the Order History page
    Then each order should display its current status
    And active orders (Pending, Preparing, Ready) should appear at the top
    And status should be color-coded for easy identification

  Scenario: Empty order history
    Given I have never placed an order
    When I view the Order History page
    Then I should see an empty state message
    And I should see a "Browse Menu" call-to-action button
    And the button should link to the menu page

  Scenario: Order card displays venue information
    Given I have orders from multiple venues
    When I view the Order History page
    Then each order card should display the venue name
    And each order card should display the venue address
    And venue information should be clickable to view venue details

  Scenario: Order card displays order summary
    Given I view an order in my order history
    Then the order card should display:
      | Field          | Example                |
      | Order Number   | #ORD-2025-001234       |
      | Date/Time      | Nov 22, 2025, 2:30 PM  |
      | Venue          | The Beer Garden        |
      | Items Count    | 4 items                |
      | Total          | $48.50                 |
      | Status         | Completed              |

  Scenario: Navigate to order details
    Given I am viewing my order history
    When I click on any order card
    Then I should be navigated to the Order Detail page
    And I should see the complete order information

  Scenario: Pagination for large order history
    Given I have placed more than 20 orders
    When I view the Order History page
    Then I should see the first 20 orders
    And I should see pagination controls at the bottom
    And I should be able to navigate to older orders
    And the current page number should be highlighted
```

#### Technical Requirements

**Database Schema Integration**:
```sql
-- Query for fetching orders with venue information
SELECT 
  o.id,
  o.created_at,
  o.total_amount,
  o.status,
  o.table_number,
  v.name as venue_name,
  v.address as venue_address,
  COUNT(oi.id) as item_count
FROM orders o
JOIN venues v ON o.venue_id = v.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = $1
  OR (o.user_id IS NULL AND o.guest_email = $2)
GROUP BY o.id, v.name, v.address
ORDER BY o.created_at DESC
LIMIT 20 OFFSET $3;
```

**Order Status Colors**:
- Pending: Yellow (`bg-yellow-500/20 text-yellow-400`)
- Preparing: Blue (`bg-blue-500/20 text-blue-400`)
- Ready: Purple (`bg-purple-500/20 text-purple-400`)
- Completed: Green (`bg-green-500/20 text-green-400`)
- Cancelled: Red (`bg-red-500/20 text-red-400`)

**API Integration**:
```typescript
// Fetch orders with pagination
const { data: orders, error } = await supabase
  .from('orders')
  .select(`
    *,
    venues (name, address),
    order_items (id)
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(offset, offset + 19);
```

**Component Props**:
```typescript
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  venue: string;
  venueAddress: string;
  amount: number;
  status: OrderStatus;
  itemCount: number;
}
```

---

### US-ORDER.2: Filter Orders by Status

**Story**: As a Pours Consumer user, I want to filter my orders by status so that I can quickly find active orders or review completed purchases.

**Priority**: High  
**Story Points**: 3  
**Dependencies**: Order data, filter UI components

#### Acceptance Criteria

```gherkin
Feature: Filter Orders by Status
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Order History"

  Scenario: Display filter options
    When I view the Order History page
    Then I should see filter tabs for:
      | All Orders  |
      | Active      |
      | Completed   |
      | Cancelled   |
    And "All Orders" should be selected by default
    And each tab should show a count badge

  Scenario: Filter by active orders
    Given I have 2 pending orders, 1 preparing order, and 10 completed orders
    When I click the "Active" filter tab
    Then I should see only the 3 active orders
    And the orders should include statuses: Pending, Preparing, Ready
    And the tab badge should show "(3)"

  Scenario: Filter by completed orders
    Given I have 15 completed orders and 3 active orders
    When I click the "Completed" filter tab
    Then I should see only the 15 completed orders
    And all orders should have "Completed" status
    And the tab badge should show "(15)"

  Scenario: Filter by cancelled orders
    Given I have 2 cancelled orders and 18 other orders
    When I click the "Cancelled" filter tab
    Then I should see only the 2 cancelled orders
    And all orders should have "Cancelled" status
    And the tab badge should show "(2)"

  Scenario: View all orders
    Given I have applied a filter
    When I click the "All Orders" tab
    Then I should see all orders regardless of status
    And the tab badge should show the total count

  Scenario: Filter persists after viewing order detail
    Given I have filtered to show only "Active" orders
    When I click on an order to view details
    And I navigate back to Order History
    Then the "Active" filter should still be applied
    And I should see the filtered results

  Scenario: Empty filter results
    Given I have no cancelled orders
    When I click the "Cancelled" filter tab
    Then I should see an empty state message
    And the message should say "No cancelled orders"
```

#### Technical Requirements

**Filter Logic**:
```typescript
const filterOrders = (orders: Order[], filter: OrderFilter): Order[] => {
  switch (filter) {
    case 'active':
      return orders.filter(o => 
        ['pending', 'preparing', 'ready'].includes(o.status)
      );
    case 'completed':
      return orders.filter(o => o.status === 'completed');
    case 'cancelled':
      return orders.filter(o => o.status === 'cancelled');
    default:
      return orders;
  }
};
```

**Filter State Management**:
- Store filter in URL query parameter (`?filter=active`)
- Persist filter selection in session storage
- Update count badges dynamically

**UI Components**:
- Tabs component for filter selection
- Badge component for counts
- Empty state component for no results

---

### US-ORDER.3: Search Orders

**Story**: As a Pours Consumer user, I want to search my orders by order number, venue name, or item name so that I can quickly find a specific order.

**Priority**: Medium  
**Story Points**: 5  
**Dependencies**: Search functionality, full-text search

#### Acceptance Criteria

```gherkin
Feature: Search Orders
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Order History"

  Scenario: Search by order number
    Given I have order #ORD-2025-001234
    When I type "001234" in the search box
    Then I should see only order #ORD-2025-001234
    And the search should be case-insensitive
    And partial matches should be supported

  Scenario: Search by venue name
    Given I have orders from "The Beer Garden" and "Craft House"
    When I type "Beer" in the search box
    Then I should see only orders from "The Beer Garden"
    And the venue name should be highlighted in results

  Scenario: Search by item name
    Given I have ordered "IPA" and "Stout" beers
    When I type "IPA" in the search box
    Then I should see all orders containing IPA items
    And the matching items should be highlighted

  Scenario: Real-time search results
    When I start typing in the search box
    Then results should update after 300ms debounce
    And I should see a loading indicator while searching
    And results should filter without page reload

  Scenario: Clear search
    Given I have entered a search query
    When I click the clear button in the search box
    Then the search box should be empty
    And all orders should be displayed again

  Scenario: No search results
    Given I search for "NonexistentItem"
    When no orders match the search criteria
    Then I should see "No orders found for 'NonexistentItem'"
    And I should see a button to "Clear Search"

  Scenario: Search combined with filters
    Given I have filtered to show "Active" orders
    When I search for a venue name
    Then results should match both the filter AND search criteria
```

#### Technical Requirements

**Search Implementation**:
```typescript
const searchOrders = (orders: Order[], searchTerm: string): Order[] => {
  const lowerSearch = searchTerm.toLowerCase();
  
  return orders.filter(order => {
    // Search order number
    if (order.orderNumber.toLowerCase().includes(lowerSearch)) {
      return true;
    }
    
    // Search venue name
    if (order.venue.toLowerCase().includes(lowerSearch)) {
      return true;
    }
    
    // Search items (requires joining order_items)
    if (order.items?.some(item => 
      item.name.toLowerCase().includes(lowerSearch)
    )) {
      return true;
    }
    
    return false;
  });
};
```

**Debounce Configuration**:
- Debounce delay: 300ms
- Min search length: 2 characters
- Clear on empty string

**Search UI**:
- Search icon at left of input
- Clear button (X) on right when text entered
- Loading spinner during search
- Search history dropdown (future enhancement)

---

### US-ORDER.4: Sort Orders

**Story**: As a Pours Consumer user, I want to sort my orders by date, amount, or venue so that I can organize my order history according to my preferences.

**Priority**: Low  
**Story Points**: 3  
**Dependencies**: Sorting logic

#### Acceptance Criteria

```gherkin
Feature: Sort Orders
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Order History"

  Scenario: Default sort by date (newest first)
    When I view the Order History page
    Then orders should be sorted by date
    And the newest orders should appear first
    And the sort dropdown should show "Date (Newest)"

  Scenario: Sort by date (oldest first)
    When I select "Date (Oldest)" from the sort dropdown
    Then orders should be re-sorted
    And the oldest orders should appear first
    And the selection should persist during the session

  Scenario: Sort by amount (highest first)
    When I select "Amount (High to Low)" from the sort dropdown
    Then orders should be sorted by total amount
    And orders with higher amounts should appear first

  Scenario: Sort by amount (lowest first)
    When I select "Amount (Low to High)" from the sort dropdown
    Then orders should be sorted by total amount
    And orders with lower amounts should appear first

  Scenario: Sort by venue name (A-Z)
    When I select "Venue (A-Z)" from the sort dropdown
    Then orders should be sorted alphabetically by venue name
    And venues starting with 'A' should appear first

  Scenario: Sort persists with filters
    Given I have sorted by "Amount (High to Low)"
    When I apply a status filter
    Then the filtered results should maintain the sort order
```

#### Technical Requirements

**Sort Options**:
```typescript
type SortOption = 
  | 'date-desc'      // Date (Newest)
  | 'date-asc'       // Date (Oldest)
  | 'amount-desc'    // Amount (High to Low)
  | 'amount-asc'     // Amount (Low to High)
  | 'venue-asc'      // Venue (A-Z)
  | 'venue-desc';    // Venue (Z-A)

const sortOrders = (orders: Order[], sortBy: SortOption): Order[] => {
  const sorted = [...orders];
  
  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case 'date-asc':
      return sorted.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return sorted.sort((a, b) => a.amount - b.amount);
    case 'venue-asc':
      return sorted.sort((a, b) => a.venue.localeCompare(b.venue));
    case 'venue-desc':
      return sorted.sort((a, b) => b.venue.localeCompare(a.venue));
  }
};
```

**Sort State Management**:
- Store in URL query parameter
- Persist in session storage
- Default to 'date-desc'

---

### US-ORDER.5: View Detailed Order Information

**Story**: As a Pours Consumer user, I want to view detailed information about a specific order including all items, prices, status history, and venue details so that I have complete transparency about my purchase.

**Priority**: High  
**Story Points**: 8  
**Dependencies**: `OrderDetail` component, `order_items`, `order_status_history` tables

#### Acceptance Criteria

```gherkin
Feature: View Detailed Order Information
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I have placed an order #ORD-2025-001234

  Scenario: Display complete order header
    When I view the order detail page
    Then I should see the following header information:
      | Order Number      | #ORD-2025-001234         |
      | Order Date        | Nov 22, 2025, 2:30 PM    |
      | Status            | Completed                |
      | Venue Name        | The Beer Garden          |
      | Venue Address     | 123 Main St, SF, CA      |
      | Table Number      | T-12                     |

  Scenario: Display all order items with details
    Given my order contains 3 items
    When I view the order detail page
    Then I should see a list of all 3 items
    And each item should display:
      | Product Image       |
      | Product Name        |
      | Product Category    |
      | Quantity            |
      | Unit Price          |
      | Item Total          |

  Scenario: Display order pricing breakdown
    Given my order total is $48.50
    When I view the order detail page
    Then I should see the pricing breakdown:
      | Subtotal          | $45.00  |
      | Tax               | $3.50   |
      | Total             | $48.50  |

  Scenario: Display order status timeline
    Given my order has progressed through multiple statuses
    When I view the order detail page
    Then I should see a visual timeline showing:
      | Status      | Timestamp            | Duration    |
      | Pending     | 2:30 PM             | 2 min       |
      | Received    | 2:32 PM             | 5 min       |
      | Preparing   | 2:37 PM             | 8 min       |
      | Ready       | 2:45 PM             | 3 min       |
      | Completed   | 2:48 PM             | -           |
    And completed statuses should be highlighted
    And the current status should be emphasized

  Scenario: Display special instructions
    Given I added special instructions "Extra ice, please"
    When I view the order detail page
    Then I should see a section for "Special Instructions"
    And it should display "Extra ice, please"

  Scenario: Display bartender notes
    Given the bartender added a note "Substituted IPA as requested"
    When I view the order detail page
    Then I should see a section for "Bartender Notes"
    And it should display the bartender's note

  Scenario: View order receipt
    When I am on the order detail page
    Then I should see a "View Receipt" button
    When I click "View Receipt"
    Then a printable receipt should be generated
    And the receipt should include all order information

  Scenario: Navigate back to order history
    When I am on the order detail page
    Then I should see a "Back to Orders" button
    When I click the button
    Then I should be navigated back to Order History
    And I should maintain my previous filter/sort settings
```

#### Technical Requirements

**Database Queries**:
```typescript
// Fetch complete order details
const { data: order, error } = await supabase
  .from('orders')
  .select(`
    *,
    venues (
      name,
      address,
      phone
    ),
    order_items (
      id,
      quantity,
      unit_price,
      total_price,
      products (
        name,
        category_id,
        image_url,
        product_categories (name)
      )
    ),
    order_status_history (
      status,
      changed_at,
      duration_seconds,
      notes
    )
  `)
  .eq('id', orderId)
  .single();
```

**Order Status Timeline Component**:
```typescript
interface StatusTimelineItem {
  status: OrderStatus;
  timestamp: string;
  duration?: number; // in seconds
  notes?: string;
  isComplete: boolean;
}
```

**Receipt Generation**:
- Use window.print() for browser printing
- Format for standard receipt printer (80mm)
- Include QR code for digital receipt
- Option to email receipt

---

### US-ORDER.6: Reorder Previous Orders

**Story**: As a Pours Consumer user, I want to quickly reorder items from a previous order so that I can easily purchase my favorite items again without searching through the menu.

**Priority**: High  
**Story Points**: 8  
**Dependencies**: Cart functionality, product availability checking

#### Acceptance Criteria

```gherkin
Feature: Reorder Previous Orders
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I have a completed order with 4 items

  Scenario: Reorder button on order card
    When I view my Order History
    Then each completed order should have a "Reorder" button
    And active orders should not have a "Reorder" button
    And cancelled orders should have a "Reorder" button

  Scenario: Successfully reorder entire order
    Given all items in my previous order are still available
    When I click the "Reorder" button
    Then all items should be added to my cart
    And I should see a success toast "4 items added to cart"
    And I should be navigated to the cart page
    And the cart should show all items with current prices

  Scenario: Reorder with unavailable items
    Given 1 item from my previous order is no longer available
    When I click the "Reorder" button
    Then available items should be added to my cart
    And I should see a warning message
    And the message should list unavailable items:
      "3 items added to cart. 1 item no longer available: [Item Name]"

  Scenario: Reorder with price changes
    Given item prices have changed since my original order
    When I click the "Reorder" button
    Then items should be added with current prices
    And I should see a notification
    And the notification should say "Prices may have changed since your last order"

  Scenario: Reorder from different venue
    Given my previous order was from "The Beer Garden"
    And my current selected venue is "Craft House"
    When I click the "Reorder" button
    Then I should see a confirmation dialog
    And the dialog should say "Switch venue to 'The Beer Garden' to reorder?"
    And I should see "Switch & Reorder" and "Cancel" options
    When I click "Switch & Reorder"
    Then my venue should change to "The Beer Garden"
    And items should be added to my cart

  Scenario: Reorder with existing cart items
    Given I have 2 items in my cart from another venue
    When I attempt to reorder from a different venue
    Then I should see a warning dialog
    And the dialog should say "Switching venues will clear your cart"
    And I should see "Continue" and "Cancel" options
    When I click "Continue"
    Then my cart should be cleared
    And reordered items should be added

  Scenario: Reorder individual items
    When I view an order detail page
    Then each item should have an "Add to Cart" button
    When I click "Add to Cart" on a specific item
    Then only that item should be added to my cart
    And I should see "1 item added to cart"
    And I should remain on the order detail page

  Scenario: Track reorder analytics
    Given I reorder a previous order
    Then the system should track:
      | Metric                  | Value                    |
      | Original Order ID       | [UUID]                   |
      | Reorder Date            | [Timestamp]              |
      | Items Reordered         | 4                        |
      | Items Unavailable       | 0                        |
      | Conversion to Purchase  | [True/False]             |
```

#### Technical Requirements

**Reorder Logic**:
```typescript
const reorderOrder = async (orderId: string): Promise<ReorderResult> => {
  // 1. Fetch original order items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      quantity,
      products (
        id,
        name,
        price,
        is_available,
        venue_id
      )
    `)
    .eq('order_id', orderId);
  
  // 2. Check product availability
  const availableItems = orderItems.filter(
    item => item.products.is_available
  );
  const unavailableItems = orderItems.filter(
    item => !item.products.is_available
  );
  
  // 3. Check venue matching
  const orderVenueId = orderItems[0]?.products.venue_id;
  const currentVenueId = getCurrentVenueId();
  
  if (orderVenueId !== currentVenueId) {
    return {
      requiresVenueSwitch: true,
      targetVenue: orderVenueId
    };
  }
  
  // 4. Add items to cart
  availableItems.forEach(item => {
    addToCart({
      productId: item.products.id,
      quantity: item.quantity,
      price: item.products.price // Current price
    });
  });
  
  return {
    success: true,
    itemsAdded: availableItems.length,
    itemsUnavailable: unavailableItems.length,
    unavailableItemNames: unavailableItems.map(i => i.products.name)
  };
};
```

**Venue Switching**:
- Check if order venue matches current venue
- Show confirmation dialog if different
- Clear cart if switching venues (with warning)
- Update selected venue
- Reload menu for new venue

**Cart Integration**:
- Use existing cart hooks (`useCart`, `useEnhancedCart`)
- Merge with existing cart items (if same venue)
- Update cart badge count
- Show toast notifications

**Price Change Handling**:
- Always use current product prices
- Show notification if prices differ
- Display old vs new price in cart (optional)

---

### US-ORDER.7: Track Real-time Order Status

**Story**: As a Pours Consumer user, I want to see real-time updates of my active order status so that I know when my order is being prepared and when it's ready for pickup.

**Priority**: Medium  
**Story Points**: 8  
**Dependencies**: Supabase real-time subscriptions, `order_status_history` table

#### Acceptance Criteria

```gherkin
Feature: Track Real-time Order Status
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I have an active order

  Scenario: Real-time status updates on order history page
    Given I am viewing my Order History
    And my order status is "Preparing"
    When the bartender updates my order to "Ready"
    Then the order card should update automatically
    And the status badge should change to "Ready"
    And I should see a toast notification "Your order #001234 is ready!"
    And no page reload should occur

  Scenario: Real-time status updates on order detail page
    Given I am viewing my order detail page
    And my order status is "Pending"
    When the bartender accepts the order
    Then the status should update to "Received"
    And the status timeline should update
    And the new status timestamp should appear
    And I should see a visual indicator of the update

  Scenario: Push notifications for status changes
    Given I have enabled push notifications
    And my order status changes
    Then I should receive a browser push notification
    And the notification should contain:
      | Order Number  |
      | New Status    |
      | Venue Name    |

  Scenario: Status update sound alert
    Given I am on the order detail page
    And I have sound enabled
    When my order becomes "Ready"
    Then I should hear a pleasant alert sound
    And the sound should play once

  Scenario: Estimated time remaining
    Given my order is "Preparing"
    When I view the order detail
    Then I should see "Estimated time: 8 minutes"
    And the time should update every minute
    And the time should be based on average preparation time

  Scenario: Multiple active orders
    Given I have 2 active orders
    When either order status updates
    Then only the relevant order should update
    And both orders should maintain independent status
```

#### Technical Requirements

**Supabase Real-time Subscription**:
```typescript
// Subscribe to order updates
const subscription = supabase
  .channel('order-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      handleOrderUpdate(payload.new);
    }
  )
  .subscribe();

// Cleanup on unmount
return () => {
  subscription.unsubscribe();
};
```

**Status Change Notifications**:
```typescript
const handleOrderUpdate = (updatedOrder: Order) => {
  // Update local state
  updateOrderInState(updatedOrder);
  
  // Show toast notification
  if (updatedOrder.status === 'ready') {
    toast.success(`Your order #${updatedOrder.orderNumber} is ready!`, {
      action: {
        label: 'View',
        onClick: () => navigate(`/orders/${updatedOrder.id}`)
      }
    });
    
    // Play sound
    if (soundEnabled) {
      playNotificationSound();
    }
  }
  
  // Send push notification
  if (pushEnabled && Notification.permission === 'granted') {
    new Notification('Order Update', {
      body: `Your order #${updatedOrder.orderNumber} is ${updatedOrder.status}`,
      icon: '/icon-192x192.png'
    });
  }
};
```

**Estimated Time Calculation**:
```typescript
const calculateEstimatedTime = (order: Order): number => {
  // Based on historical data and current status
  const averageTimes = {
    pending: 2,    // minutes
    received: 5,
    preparing: 8,
    ready: 0
  };
  
  return averageTimes[order.status] || 0;
};
```

---

### US-ORDER.8: Download Order Receipt

**Story**: As a Pours Consumer user, I want to download or email my order receipt so that I can keep records for expense tracking or reimbursement.

**Priority**: Low  
**Story Points**: 5  
**Dependencies**: Receipt generation, email service

#### Acceptance Criteria

```gherkin
Feature: Download Order Receipt
  Epic: EPIC-PROFILE-003 - Order History

  Background:
    Given I am logged in as a Pours Consumer user
    And I have a completed order

  Scenario: Print receipt from order detail
    When I am viewing an order detail page
    Then I should see a "Print Receipt" button
    When I click "Print Receipt"
    Then the browser print dialog should open
    And the receipt should be formatted for printing
    And the receipt should include:
      | Company Logo          |
      | Venue Information     |
      | Order Number          |
      | Date and Time         |
      | Table Number          |
      | All Items with Prices |
      | Subtotal, Tax, Total  |
      | Payment Method        |
      | QR Code for Digital   |

  Scenario: Download PDF receipt
    When I click the dropdown next to "Print Receipt"
    And I select "Download PDF"
    Then a PDF file should be generated
    And the PDF should download automatically
    And the filename should be "Receipt-ORD-2025-001234.pdf"

  Scenario: Email receipt
    When I click "Email Receipt"
    Then I should see an email input dialog
    And my profile email should be pre-filled
    When I confirm the email address
    Then a receipt should be sent to my email
    And I should see a confirmation "Receipt sent to [email]"

  Scenario: Receipt content completeness
    When I view a generated receipt
    Then it should include all order information
    And calculations should be accurate
    And branding should match the venue
    And the receipt should have a unique receipt number

  Scenario: Receipt for tax purposes
    When I download a receipt
    Then it should include tax identification information
    And it should show itemized tax breakdown
    And it should be compliant with tax regulations
```

#### Technical Requirements

**Receipt Generation**:
```typescript
interface ReceiptData {
  orderNumber: string;
  date: string;
  venueName: string;
  venueAddress: string;
  tableName: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  receiptNumber: string;
}

const generateReceipt = (order: Order): ReceiptData => {
  // Format order data for receipt
  // Calculate totals
  // Generate unique receipt number
};
```

**PDF Generation**:
- Use library like jsPDF or react-pdf
- Format as standard 80mm receipt
- Include QR code linking to digital receipt
- Compress for email-friendly size

**Email Integration**:
```typescript
// Edge function to send receipt email
await supabase.functions.invoke('send-receipt-email', {
  body: {
    orderId: order.id,
    recipientEmail: email,
    receiptData: generateReceipt(order)
  }
});
```

---

## Non-Functional Requirements

### Performance
- Order history page load time: < 2 seconds
- Order detail page load time: < 1 second
- Real-time update latency: < 500ms
- Search response time: < 300ms
- Pagination load time: < 1 second

### Scalability
- Support up to 1000 orders per user
- Pagination prevents loading all orders at once
- Efficient database indexing on user_id and created_at
- Real-time subscriptions scale with connection pooling

### Security
- RLS policies enforce user-specific order access
- Guest orders accessible via email verification
- Receipt downloads include secure tokens
- No sensitive payment information exposed

### Usability
- Mobile-responsive design
- Intuitive status color coding
- Clear call-to-action buttons
- Accessible to screen readers
- Keyboard navigation support

### Reliability
- Graceful handling of network failures
- Retry logic for failed real-time connections
- Cached order data for offline viewing
- Error messages are user-friendly

---

## Technical Architecture

### Component Structure
```
OrderHistory (Container)
├── PageHeader
├── FilterTabs
│   ├── TabButton (All)
│   ├── TabButton (Active)
│   ├── TabButton (Completed)
│   └── TabButton (Cancelled)
├── SearchBar
├── SortDropdown
├── OrdersList
│   └── OrderCard[]
│       ├── OrderNumber
│       ├── VenueInfo
│       ├── StatusBadge
│       ├── ItemCount
│       ├── TotalAmount
│       └── ReorderButton
└── Pagination

OrderDetail (Container)
├── PageHeader
│   ├── BackButton
│   └── ActionButtons
│       ├── PrintReceipt
│       ├── EmailReceipt
│       └── ReorderButton
├── OrderStatusTimeline
├── VenueInformation
├── OrderItems[]
│   ├── ProductImage
│   ├── ProductName
│   ├── Quantity
│   ├── UnitPrice
│   ├── ItemTotal
│   └── AddToCartButton
├── SpecialInstructions
├── BartenderNotes
└── PricingBreakdown
    ├── Subtotal
    ├── Tax
    └── Total
```

### State Management
- **useOrders**: Hook for fetching and managing orders
- **useOrderDetail**: Hook for single order details
- **useReorder**: Hook for reorder functionality
- **useRealtimeOrderStatus**: Hook for real-time updates
- **useOrderFilters**: Hook for filter/sort/search state

### API Integration
- Supabase queries with RLS policies
- Real-time subscriptions for status updates
- Edge functions for receipt generation and email
- Storage for receipt PDFs

---

## Integration Requirements

### Database Integration
- **orders**: Main order table
- **order_items**: Order line items
- **order_status_history**: Status tracking
- **products**: Product details for reordering
- **venues**: Venue information

### Supabase Real-time
- Subscribe to order table updates
- Filter by user_id for security
- Handle connection drops gracefully

### Cart Integration
- Seamless reorder to cart flow
- Venue switching logic
- Price validation

---

## Testing Strategy

### Unit Tests
- Filter logic
- Sort logic
- Search functionality
- Reorder validation
- Receipt generation

### Integration Tests
- Order history fetch with pagination
- Order detail with all relations
- Real-time subscription setup
- Reorder flow end-to-end

### E2E Tests
```gherkin
Feature: Complete Order History Journey
  Scenario: User tracks and reorders
    Given a user has placed multiple orders
    When they navigate to Order History
    And they filter to "Active" orders
    And they view an order detail
    And they track the status in real-time
    And they reorder when completed
    Then the reorder should succeed
    And the user should be able to complete a new order
```

---

## Success Metrics & KPIs

### Engagement Metrics
- Order history views: > 40% of users weekly
- Order detail views: > 60% of orders
- Reorder rate: > 25% of completed orders
- Filter usage: > 50% of sessions
- Search usage: > 30% of sessions

### Performance Metrics
- Page load time: < 2s average
- Real-time update latency: < 500ms
- Search response time: < 300ms

### User Satisfaction
- Feature satisfaction rating: > 4.3/5
- Reorder ease rating: > 4.5/5
- Support tickets for orders: < 3% of total

---

## Traceability Matrix

| User Story | Epic | Scenarios | Test Cases | Components |
|-----------|------|-----------|------------|------------|
| US-ORDER.1 | EPIC-PROFILE-003 | 7 | TC-ORD-001 to TC-ORD-007 | OrderHistory, OrderCard |
| US-ORDER.2 | EPIC-PROFILE-003 | 7 | TC-ORD-008 to TC-ORD-014 | FilterTabs |
| US-ORDER.3 | EPIC-PROFILE-003 | 7 | TC-ORD-015 to TC-ORD-021 | SearchBar |
| US-ORDER.4 | EPIC-PROFILE-003 | 6 | TC-ORD-022 to TC-ORD-027 | SortDropdown |
| US-ORDER.5 | EPIC-PROFILE-003 | 8 | TC-ORD-028 to TC-ORD-035 | OrderDetail, OrderStatusTimeline |
| US-ORDER.6 | EPIC-PROFILE-003 | 9 | TC-ORD-036 to TC-ORD-044 | ReorderButton, Cart integration |
| US-ORDER.7 | EPIC-PROFILE-003 | 6 | TC-ORD-045 to TC-ORD-050 | Real-time subscription |
| US-ORDER.8 | EPIC-PROFILE-003 | 5 | TC-ORD-051 to TC-ORD-055 | Receipt generation |

---

## Future Enhancements

### Phase 2 Enhancements
- **Favorite Orders**: Save specific orders as favorites for quick reordering
- **Order Sharing**: Share order with friends via link
- **Order Ratings**: Rate and review completed orders
- **Dietary Preferences**: Flag orders that match dietary restrictions
- **Order Recommendations**: "You might also like" based on order history

### Phase 3 Enhancements
- **Order Analytics Dashboard**: Personal insights into ordering patterns
- **Subscription Orders**: Recurring orders for regular items
- **Group Orders**: Split bills with friends
- **Order Gifting**: Send orders as gifts to others
- **Voice Ordering**: "Reorder my usual"

---

## Compliance & Privacy

### Data Retention
- Order data retained for 7 years (tax compliance)
- Receipts available for download anytime
- Users can request order data export (GDPR)

### Data Privacy
- Orders visible only to order owner
- Guest orders accessible via email verification
- No sharing of order data with third parties
- Anonymized order data for analytics

---

## Appendix

### Related Documentation
- [Account Dashboard Features](./account-dashboard-features.md)
- [Manage Profile Features](./manage-profile-features.md)
- [Venue Selection Features](./venue-selection-features.md)

### Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial documentation created |

---

**Document Status**: Approved  
**Last Review Date**: 2025-11-22  
**Next Review Date**: 2026-02-22
