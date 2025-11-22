# Account Dashboard - Product Requirements Document

## Epic: Customer Financial & Biometric Analytics Dashboard

**Epic ID:** EPIC-PROFILE-001  
**Epic Name:** Customer Financial & Biometric Analytics Dashboard  
**Epic Owner:** Product Management  
**Target Release:** Sprint 5  
**Status:** Implemented

### Epic Description
As a Pours+ customer, I need a comprehensive analytics dashboard within my profile that provides insights into my spending patterns, order history, and biometric activity over time, so that I can make informed decisions about my consumption habits, budget management, and health monitoring.

### Business Value
- **Customer Engagement:** Increases user engagement through data transparency and self-service insights
- **Health & Safety:** Supports responsible drinking through biometric tracking and BAC monitoring
- **Retention:** Enhances customer loyalty by providing valuable personal analytics
- **Upsell Opportunities:** Identifies high-value customers and spending patterns for targeted marketing

### Success Metrics
- 60% of active users view their dashboard at least once per month
- Average session time on dashboard: 2-3 minutes
- 40% of users who view spending trends adjust their future orders
- 25% increase in biometric monitoring engagement

---

## User Stories

### US-DASH.1: View Monthly Spending Trends

**Story ID:** US-DASH.1  
**Story Points:** 8  
**Priority:** High  
**Status:** Implemented

#### User Story
```
As a Pours+ customer
I want to view my spending trends over the past 24 months in a line chart
So that I can understand my spending patterns and manage my budget effectively
```

#### Acceptance Criteria

```gherkin
Feature: Monthly Spending Trends Visualization

  Background:
    Given I am a logged-in Pours+ customer
    And I have placed orders over the past 24 months
    And I am on the Account Dashboard page

  Scenario: View spending trends for customer with 24 months of history
    Given I have orders dating back 24 months
    When the dashboard loads
    Then I should see a line chart displaying my monthly spending
    And the chart should show data points for each of the last 24 months
    And each data point should represent the total amount spent in that month
    And the x-axis should display month labels (e.g., "Jan 2024", "Feb 2024")
    And the y-axis should display dollar amounts with currency formatting
    
  Scenario: View spending trends for new customer with limited history
    Given I have only 3 months of order history
    When the dashboard loads
    Then I should see a line chart displaying my available data
    And the chart should show data points only for the 3 months I have history
    And empty months should display as zero or null values
    
  Scenario: Hover over data points for detailed information
    Given the spending trends chart is displayed
    When I hover over any data point on the line chart
    Then I should see a tooltip displaying:
      | Field           | Format          |
      | Month           | MMM YYYY        |
      | Total Spending  | $X,XXX.XX       |
      | Number of Orders| X orders        |
    
  Scenario: View spending trends with no order history
    Given I am a new customer with no orders
    When the dashboard loads
    Then I should see a message "No spending data available yet"
    And I should see a call-to-action to "Browse Menu" or "Place Your First Order"
```

#### Technical Requirements
- **Data Source:** Aggregate data from `orders` table, grouped by month
- **Time Range:** Last 24 months from current date
- **Chart Library:** Recharts (already in dependencies)
- **Data Calculation:** 
  - Sum of `total_amount` per month
  - Count of orders per month
  - Month range: `created_at` field with date truncation to month
- **Performance:** Query optimization for 24-month aggregation
- **Currency Formatting:** Use locale-aware formatting (USD)

#### Database Query Pattern
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total_amount) as total_spending,
  COUNT(*) as order_count
FROM orders
WHERE user_id = :user_id
  AND created_at >= NOW() - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month ASC
```

#### Dependencies
- Recharts library (installed)
- Supabase `orders` table
- User authentication context

---

### US-DASH.2: View Order Volume Trends

**Story ID:** US-DASH.2  
**Story Points:** 5  
**Priority:** High  
**Status:** Implemented

#### User Story
```
As a Pours+ customer
I want to view the number of orders I've placed each month in a bar chart
So that I can track my ordering frequency and identify patterns in my behavior
```

#### Acceptance Criteria

```gherkin
Feature: Order Volume Visualization

  Background:
    Given I am a logged-in Pours+ customer
    And I have placed orders over time
    And I am on the Account Dashboard page
    And I have navigated to the "Order Volume" tab

  Scenario: View monthly order count in bar chart
    Given I have order history spanning 12 months
    When I select the "Order Volume" tab
    Then I should see a bar chart displaying monthly order counts
    And each bar should represent the number of orders placed that month
    And the x-axis should display month labels
    And the y-axis should display order counts as integers
    And bars should use primary brand color
    
  Scenario: Identify peak ordering months
    Given I have varying order volumes across months
    When the order volume chart is displayed
    Then months with higher order counts should have taller bars
    And I should be able to visually compare month-to-month volume
    
  Scenario: Hover over bars for exact counts
    Given the order volume chart is displayed
    When I hover over any bar
    Then I should see a tooltip showing:
      | Field       | Format     |
      | Month       | MMM YYYY   |
      | Order Count | X orders   |
```

#### Technical Requirements
- **Chart Type:** Bar chart using Recharts
- **Data Source:** Same aggregation as spending trends, using `COUNT(*)`
- **Color Scheme:** Use semantic token `--primary` for bars
- **Interaction:** Hover state with tooltip
- **Responsive:** Chart should adapt to mobile and desktop viewports

---

### US-DASH.3: View Biometric Activity & BAC Trends

**Story ID:** US-DASH.3  
**Story Points:** 13  
**Priority:** High  
**Status:** Implemented

#### User Story
```
As a Pours+ customer who participates in sobriety monitoring
I want to view my biometric reading frequency and average BAC levels over time
So that I can monitor my health metrics and ensure responsible drinking habits
```

#### Acceptance Criteria

```gherkin
Feature: Biometric Activity and BAC Monitoring

  Background:
    Given I am a logged-in Pours+ customer
    And I have biometric monitoring enabled
    And I am on the Account Dashboard page
    And I have navigated to the "Biometric Activity" tab

  Scenario: View biometric reading frequency
    Given I have submitted biometric readings over the past 24 months
    When I select the "Biometric Activity" tab
    Then I should see a dual-axis line chart
    And the left y-axis should display "Biometric Readings" count
    And the right y-axis should display "Average BAC (%)"
    And the blue line should represent monthly biometric reading counts
    And the red line should represent average BAC per month
    
  Scenario: Track BAC trends over time
    Given I have drinking sessions with recorded BAC levels
    When the biometric chart is displayed
    Then I should see my average BAC for each month
    And BAC values should be displayed as percentages (e.g., 0.05%)
    And months with higher BAC should be visually distinguishable
    
  Scenario: Hover over data points for detailed metrics
    Given the biometric activity chart is displayed
    When I hover over any month on the chart
    Then I should see a tooltip displaying:
      | Field               | Format          |
      | Month               | MMM YYYY        |
      | Biometric Readings  | X readings      |
      | Average BAC         | 0.XX%           |
    
  Scenario: View biometric data with no activity
    Given I have not submitted any biometric readings
    When I navigate to the "Biometric Activity" tab
    Then I should see a message "No biometric data available"
    And I should see a call-to-action to "Enable Biometric Monitoring"
    
  Scenario: Identify concerning BAC patterns
    Given I have months where average BAC exceeds 0.08%
    When the chart is displayed
    Then months with BAC >= 0.08% should be highlighted or annotated
    And I should see a warning indicator for health concern
```

#### Technical Requirements
- **Data Sources:**
  - `biometric_readings` table for reading counts
  - `drinking_sessions` table for BAC data (`estimated_bac` field)
- **Chart Configuration:**
  - Dual y-axis line chart
  - Left axis: Biometric reading count (0 to max)
  - Right axis: BAC percentage (0 to 0.15%)
- **Data Aggregation:**
  - Group by month for last 24 months
  - Calculate `COUNT(*)` for biometric readings
  - Calculate `AVG(estimated_bac)` for BAC
- **Health Indicators:**
  - Visual warning for BAC >= 0.08% (legal limit)
  - Optional threshold lines

#### Database Query Pattern
```sql
-- Biometric readings count
SELECT 
  DATE_TRUNC('month', recorded_at) as month,
  COUNT(*) as reading_count
FROM biometric_readings
WHERE user_id = :user_id
  AND recorded_at >= NOW() - INTERVAL '24 months'
GROUP BY month
ORDER BY month ASC

-- Average BAC per month
SELECT 
  DATE_TRUNC('month', started_at) as month,
  AVG(estimated_bac) as avg_bac
FROM drinking_sessions
WHERE user_id = :user_id
  AND started_at >= NOW() - INTERVAL '24 months'
  AND estimated_bac IS NOT NULL
GROUP BY month
ORDER BY month ASC
```

---

### US-DASH.4: View Summary Statistics Cards

**Story ID:** US-DASH.4  
**Story Points:** 5  
**Priority:** Medium  
**Status:** Implemented

#### User Story
```
As a Pours+ customer
I want to see key summary statistics at the top of my dashboard
So that I can quickly understand my overall activity without analyzing charts
```

#### Acceptance Criteria

```gherkin
Feature: Dashboard Summary Statistics

  Background:
    Given I am a logged-in Pours+ customer
    And I am on the Account Dashboard page

  Scenario: View financial summary cards
    Given I have order history
    When the dashboard loads
    Then I should see the following summary cards:
      | Card Title             | Value Format    | Icon        |
      | Total Spending         | $X,XXX.XX       | DollarSign  |
      | Total Orders           | X orders        | ShoppingBag |
      | Avg Monthly Spending   | $X,XXX.XX       | TrendingUp  |
      | Biometric Sessions     | X sessions      | Activity    |
    And each card should display the calculated value prominently
    And cards should be arranged in a responsive grid (2x2 on desktop, 1 column on mobile)
    
  Scenario: View average monthly spending calculation
    Given I have spent $2,400 over 12 months
    When the dashboard calculates averages
    Then the "Avg Monthly Spending" card should display "$200.00"
    And the calculation should be: total_spending / number_of_months_with_orders
    
  Scenario: View dashboard with no data
    Given I am a new customer with no orders
    When the dashboard loads
    Then all summary cards should display "$0.00" or "0 orders"
    And I should see an onboarding message encouraging first order
    
  Scenario: View loading state for summary cards
    Given the dashboard is fetching data
    When the page initially loads
    Then I should see skeleton loading placeholders for each card
    And placeholders should match the card dimensions
```

#### Technical Requirements
- **Card Component:** Use shadcn/ui `Card` component
- **Icons:** Lucide React icons (DollarSign, ShoppingBag, TrendingUp, Activity)
- **Calculations:**
  - **Total Spending:** `SUM(total_amount)` from orders
  - **Total Orders:** `COUNT(*)` from orders
  - **Avg Monthly Spending:** `total_spending / COUNT(DISTINCT DATE_TRUNC('month', created_at))`
  - **Biometric Sessions:** `COUNT(*)` from drinking_sessions
- **Responsive Grid:** Tailwind CSS grid classes
- **Loading State:** Skeleton components from shadcn/ui

---

### US-DASH.5: Tab Navigation Between Chart Views

**Story ID:** US-DASH.5  
**Story Points:** 3  
**Priority:** Medium  
**Status:** Implemented

#### User Story
```
As a Pours+ customer
I want to switch between different chart views using tabs
So that I can focus on specific aspects of my data (spending, orders, or biometrics)
```

#### Acceptance Criteria

```gherkin
Feature: Dashboard Tab Navigation

  Background:
    Given I am a logged-in Pours+ customer
    And I am on the Account Dashboard page

  Scenario: View available tabs
    When the dashboard loads
    Then I should see three tabs:
      | Tab Name              | Default |
      | Spending Trends       | Yes     |
      | Order Volume          | No      |
      | Biometric Activity    | No      |
    And the "Spending Trends" tab should be active by default
    
  Scenario: Switch to Order Volume tab
    Given I am viewing the "Spending Trends" tab
    When I click on the "Order Volume" tab
    Then the order volume bar chart should be displayed
    And the "Order Volume" tab should be visually marked as active
    And the "Spending Trends" tab should be visually inactive
    
  Scenario: Switch to Biometric Activity tab
    Given I am viewing any tab
    When I click on the "Biometric Activity" tab
    Then the biometric dual-axis chart should be displayed
    And the "Biometric Activity" tab should be visually marked as active
    
  Scenario: Tab state persistence
    Given I switch to the "Order Volume" tab
    When I navigate away from the dashboard and return
    Then the "Order Volume" tab should still be active
    And the order volume chart should be displayed
```

#### Technical Requirements
- **Component:** shadcn/ui `Tabs` component
- **State Management:** React `useState` for active tab
- **Persistence:** Optional - localStorage to remember last viewed tab
- **Accessibility:** Proper ARIA labels and keyboard navigation

---

### US-DASH.6: Responsive Dashboard Layout

**Story ID:** US-DASH.6  
**Story Points:** 5  
**Priority:** High  
**Status:** Implemented

#### User Story
```
As a Pours+ customer accessing the app on mobile or tablet
I want the Account Dashboard to adapt to my screen size
So that I can comfortably view my analytics on any device
```

#### Acceptance Criteria

```gherkin
Feature: Responsive Dashboard Design

  Scenario: View dashboard on desktop (>1024px)
    Given I am viewing the dashboard on a desktop browser
    Then summary cards should display in a 2x2 grid
    And charts should utilize full available width (minus padding)
    And chart height should be 400px
    And all text should be easily readable
    
  Scenario: View dashboard on tablet (768px - 1024px)
    Given I am viewing the dashboard on a tablet
    Then summary cards should display in a 2x2 grid
    And charts should adapt to narrower width
    And chart height should remain 400px
    And touch targets should be appropriately sized
    
  Scenario: View dashboard on mobile (<768px)
    Given I am viewing the dashboard on a mobile device
    Then summary cards should stack in a single column
    And charts should use full mobile width
    And chart height should be 300px for better viewing
    And tab labels may abbreviate if needed
    And tooltips should be touch-friendly
    
  Scenario: Chart responsiveness during window resize
    Given I am viewing the dashboard
    When I resize the browser window
    Then charts should smoothly adapt to the new width
    And data should remain accurate and readable
    And no horizontal scrolling should occur
```

#### Technical Requirements
- **Recharts Responsive:** Use `ResponsiveContainer` component
- **Tailwind Breakpoints:** 
  - Mobile: `<md` (< 768px)
  - Tablet: `md` to `lg` (768px - 1024px)
  - Desktop: `lg+` (> 1024px)
- **Grid System:** Tailwind grid with responsive columns
- **Chart Heights:** Dynamic based on viewport
- **Touch Optimization:** Larger touch targets on mobile

---

### US-DASH.7: Loading and Error States

**Story ID:** US-DASH.7  
**Story Points:** 5  
**Priority:** High  
**Status:** Implemented

#### User Story
```
As a Pours+ customer
I want to see appropriate loading states while my dashboard data is being fetched
So that I understand the app is working and don't experience a blank screen
```

#### Acceptance Criteria

```gherkin
Feature: Dashboard Loading and Error Handling

  Scenario: Dashboard initial load
    Given I navigate to the Account Dashboard
    When the dashboard begins fetching data
    Then I should see skeleton loading placeholders for:
      | Component        | Placeholder Type       |
      | Summary Cards    | Card skeleton (4x)     |
      | Chart Area       | Rectangle skeleton     |
    And skeletons should pulse or animate to indicate loading
    
  Scenario: Successful data load
    Given the dashboard is in loading state
    When all data fetching completes successfully
    Then skeletons should be replaced with actual data
    And the transition should be smooth (fade-in)
    And all charts and cards should display accurate information
    
  Scenario: Handle data fetch error
    Given the dashboard attempts to fetch data
    When a network or database error occurs
    Then I should see an error message: "Unable to load dashboard data"
    And I should see a "Retry" button
    And the error state should replace the loading skeletons
    
  Scenario: Retry after error
    Given I am viewing an error state
    When I click the "Retry" button
    Then the loading state should reappear
    And the dashboard should attempt to fetch data again
    
  Scenario: Partial data load
    Given the dashboard fetches multiple data sources
    When some data loads successfully but others fail
    Then successfully loaded sections should display data
    And failed sections should show localized error messages
    And I should be able to retry failed sections independently
```

#### Technical Requirements
- **Loading Component:** shadcn/ui `Skeleton` component
- **Error Handling:** Try-catch blocks with user-friendly messages
- **Retry Logic:** Re-invoke fetch functions on button click
- **State Management:** Separate loading/error states for each data source
- **User Feedback:** Toast notifications for transient errors

---

## Non-Functional Requirements

### Performance
- **Dashboard Load Time:** < 2 seconds for initial render
- **Chart Rendering:** < 500ms for chart paint after data load
- **Data Query Time:** < 1 second for 24-month aggregation queries
- **Smooth Interactions:** 60fps for chart hover and tab switching

### Accessibility
- **WCAG 2.1 AA Compliance:** All charts and cards must meet contrast requirements
- **Screen Reader Support:** Proper ARIA labels for charts and data points
- **Keyboard Navigation:** Full keyboard support for tabs and interactive elements
- **Alt Text:** Descriptive labels for chart data when screen reader is active

### Browser Support
- **Desktop:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile:** iOS Safari, Chrome Mobile (latest 2 versions)
- **Tablet:** iPad Safari, Android Chrome

### Security
- **Data Privacy:** Only show data for authenticated user (enforced by RLS)
- **No PII Exposure:** Charts should not expose sensitive personal information
- **Secure Queries:** All database queries use parameterized statements

### Data Retention
- **Historical Data:** Maintain 24 months of order and biometric data for dashboard
- **Aggregation:** Pre-aggregate monthly data for performance optimization (optional)

---

## Technical Architecture

### Component Structure
```
AccountDashboard
├── DashboardHeader
├── SummaryCards (4 cards)
│   ├── TotalSpendingCard
│   ├── TotalOrdersCard
│   ├── AvgSpendingCard
│   └── BiometricSessionsCard
├── DashboardTabs
│   ├── SpendingTrendsTab (LineChart)
│   ├── OrderVolumeTab (BarChart)
│   └── BiometricActivityTab (Dual-axis LineChart)
└── ErrorBoundary
```

### Data Flow
1. **Component Mount:** `useEffect` triggers `fetchDashboardData()`
2. **Parallel Queries:** 
   - Fetch orders data (spending + order count)
   - Fetch drinking sessions data (BAC averages)
   - Fetch biometric readings data (reading counts)
3. **Data Aggregation:** Process raw data into monthly aggregates
4. **State Update:** Set `monthlyData` and `totals` state
5. **Chart Render:** Recharts renders visualizations

### Database Schema Dependencies
- **orders:** `user_id`, `total_amount`, `created_at`
- **drinking_sessions:** `user_id`, `estimated_bac`, `started_at`
- **biometric_readings:** `user_id`, `recorded_at`

### RLS Policies
All queries filtered by `auth.uid() = user_id` at database level.

---

## Integration Testing Scenarios

### Test Scenario 1: Complete Dashboard Flow
1. User logs in to Pours+ account
2. Navigates to Profile → Account Dashboard
3. Sees loading skeletons
4. Dashboard loads with all summary cards populated
5. Views spending trends chart (default tab)
6. Switches to order volume chart
7. Switches to biometric activity chart
8. Hovers over data points to view tooltips
9. Returns to profile

**Expected Result:** All data displays correctly, charts are interactive, no errors.

### Test Scenario 2: New Customer Dashboard
1. New user creates account
2. Navigates to Account Dashboard
3. Sees "No data available" messages
4. Clicks "Place Your First Order" CTA
5. Places order
6. Returns to dashboard
7. Sees first order reflected in summary cards

**Expected Result:** Empty state handled gracefully, CTAs functional.

### Test Scenario 3: Mobile Responsive Dashboard
1. User accesses dashboard on mobile device (375px width)
2. Summary cards stack vertically
3. Charts adapt to narrow viewport
4. Tabs remain accessible
5. Touch interactions work smoothly

**Expected Result:** Fully functional mobile experience with no layout breaks.

---

## Traceability Matrix

| Epic | User Story | Component | Database Table | Test Case |
|------|------------|-----------|----------------|-----------|
| EPIC-PROFILE-001 | US-DASH.1 | AccountDashboard | orders | TC-DASH-001 |
| EPIC-PROFILE-001 | US-DASH.2 | AccountDashboard | orders | TC-DASH-002 |
| EPIC-PROFILE-001 | US-DASH.3 | AccountDashboard | drinking_sessions, biometric_readings | TC-DASH-003 |
| EPIC-PROFILE-001 | US-DASH.4 | SummaryCards | orders, drinking_sessions | TC-DASH-004 |
| EPIC-PROFILE-001 | US-DASH.5 | DashboardTabs | N/A | TC-DASH-005 |
| EPIC-PROFILE-001 | US-DASH.6 | AccountDashboard | N/A | TC-DASH-006 |
| EPIC-PROFILE-001 | US-DASH.7 | AccountDashboard | N/A | TC-DASH-007 |

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow query performance with large datasets | High | Medium | Implement data aggregation, add database indexes |
| Chart rendering issues on older browsers | Medium | Low | Polyfills, feature detection, graceful degradation |
| User confusion with BAC data interpretation | High | Medium | Add educational tooltips, link to sobriety resources |
| Privacy concerns with detailed spending visibility | Medium | Low | Ensure strong RLS policies, add data export/deletion |

---

## Future Enhancements

### Phase 2 (Future Sprints)
- **US-DASH.8:** Export dashboard data as PDF or CSV
- **US-DASH.9:** Compare spending trends year-over-year
- **US-DASH.10:** Set spending budget alerts and notifications
- **US-DASH.11:** View favorite products and reorder from dashboard
- **US-DASH.12:** Social comparison (anonymous) - "You spend X% more than average user"
- **US-DASH.13:** Predictive analytics - "You're trending toward $X this month"

---

## Approval and Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | TBD | TBD | |
| Tech Lead | TBD | TBD | |
| QA Lead | TBD | TBD | |
| UX Designer | TBD | TBD | |

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-22  
**Next Review Date:** 2025-02-22
