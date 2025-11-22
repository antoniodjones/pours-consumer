# Venue Discovery & Selection Features - Product Requirements

**Epic IDs:** CNS-0002 (Venue Search & Discovery), CNS-0003 (Selected Venue Management)  
**Feature Area:** Venue Discovery & Selection  
**Priority:** P1 - High  
**Status:** Implemented

---

## Table of Contents
1. [CNS-0002: Venue Search & Discovery](#cns-0002-venue-search--discovery)
   - [US-VS.1: Text-Based Venue Search](#us-vs1-text-based-venue-search)
   - [US-VS.2: Near Me Location-Based Search](#us-vs2-near-me-location-based-search)
   - [US-VS.3: Display Venue Information](#us-vs3-display-venue-information)
   - [US-VS.4: Venue List with Ratings](#us-vs4-venue-list-with-ratings)
2. [CNS-0003: Selected Venue Management](#cns-0003-selected-venue-management)
   - [US-VS.5: Explicit Venue Selection](#us-vs5-explicit-venue-selection)
   - [US-VS.6: Venue Change with Cart Warning](#us-vs6-venue-change-with-cart-warning)
   - [US-VS.7: Venue Persistence Across Sessions](#us-vs7-venue-persistence-across-sessions)
   - [US-VS.8: Change Venue Toggle Button](#us-vs8-change-venue-toggle-button)
   - [US-VS.9: Smooth Venue Search Collapse Animation](#us-vs9-smooth-venue-search-collapse-animation)

---

# CNS-0002: Venue Search & Discovery

## Epic Overview

**Epic:** Venue Search & Discovery  
**Epic ID:** CNS-0002  
**Description:** Enables users to discover and find venues through text-based search and location-based "Near Me" functionality, displaying relevant venue information to help users make informed selection decisions.

**Business Value:**
- Reduces friction in the ordering process by helping users quickly find venues
- Increases user engagement through location-aware features
- Provides transparency about venue details before selection
- Supports expansion to multiple venues and cities

**Components:** `src/components/menu/VenueSearch.tsx`  
**Database Tables:** `venues`, `cities`, `venue_categories`

---

## US-VS.1: Text-Based Venue Search

**As a** user looking for a specific venue  
**I want** to search for venues by name, address, or description  
**So that** I can quickly find and select a venue I'm interested in

### Background
Users may know the name of a venue they want to order from or may want to search by location/neighborhood. Text-based search provides a familiar and efficient way to filter venues.

### Business Value
- Improves user experience by reducing time to find desired venue
- Supports users who know specific venue names
- Enables discovery of venues in specific neighborhoods or areas

### Acceptance Criteria

```gherkin
Feature: Text-Based Venue Search

  Background:
    Given the following venues exist in the database:
      | Name                  | Address                | Description          | City         |
      | Bar & Grill Downtown  | 123 Main St           | Sports bar with food | San Francisco |
      | Uptown Lounge         | 456 Market St         | Cocktail lounge      | San Francisco |
      | Mission Brewery       | 789 Valencia St       | Craft beer brewery   | San Francisco |
      | Downtown Wine Bar     | 321 Pine St           | Fine wines           | San Francisco |
    And I am on the Menu page
    And the VenueSearch component is visible

  Scenario: User searches for venue by full name
    When I type "Bar & Grill Downtown" into the venue search field
    Then I should see "Bar & Grill Downtown" in the results
    And I should not see "Uptown Lounge" in the results
    And I should not see "Mission Brewery" in the results

  Scenario: User searches for venue by partial name
    When I type "downtown" into the venue search field
    Then I should see "Bar & Grill Downtown" in the results
    And I should see "Downtown Wine Bar" in the results
    And the results should be filtered in real-time as I type

  Scenario: User searches for venue by address
    When I type "Market St" into the venue search field
    Then I should see "Uptown Lounge" in the results
    And I should see venues located on Market Street

  Scenario: User searches for venue by description keyword
    When I type "brewery" into the venue search field
    Then I should see "Mission Brewery" in the results

  Scenario: Search is case-insensitive
    When I type "UPTOWN" into the venue search field
    Then I should see "Uptown Lounge" in the results
    When I type "uptown" into the venue search field
    Then I should see "Uptown Lounge" in the results

  Scenario: Search returns no results
    When I type "nonexistent venue xyz" into the venue search field
    Then I should see a message "No venues found"
    And I should see a suggestion to "Try a different search term or use 'Near Me'"

  Scenario: Empty search shows all venues
    Given I have typed "downtown" into the search field
    And I see filtered results
    When I clear the search field
    Then I should see all available venues
    And venues should be displayed in default order

  Scenario: Search debounces user input
    When I rapidly type "downtown" character by character
    Then the search should not execute on every keystroke
    And the search should execute after I stop typing for 300ms
    And this reduces unnecessary database queries
```

### Technical Requirements

**Frontend:**
- Search input field with debouncing (300ms delay)
- Real-time filtering as user types
- Case-insensitive search matching
- Clear button to reset search
- Loading indicator during search

**Backend/Database:**
- Query `venues` table with `ilike` for partial matching
- Search across `name`, `address`, and `description` fields
- Filter for `is_active = true` venues only
- Return venue with related `city` data

**Performance:**
- Debounce search to prevent excessive queries
- Index on `name`, `address` columns for fast search
- Limit initial results to 50 venues

**Example Supabase Query:**
```typescript
const { data, error } = await supabase
  .from('venues')
  .select('*, cities(*)')
  .or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  .eq('is_active', true)
  .limit(50);
```

### Dependencies
- Supabase client
- useState for search query state
- useEffect with debouncing logic
- Search input UI component

### Story Points: 5
**Estimation Rationale:** Straightforward search implementation with debouncing and real-time filtering. Requires database query optimization and UI state management.

---

## US-VS.2: Near Me Location-Based Search

**As a** user looking for nearby venues  
**I want** to find venues based on my current location  
**So that** I can discover convenient options close to where I am

### Background
Location-based search is a key feature for mobile and on-the-go users. By using the device's geolocation, users can quickly find venues nearby without knowing specific names or addresses.

### Business Value
- Increases venue discovery and spontaneous orders
- Improves mobile user experience
- Supports walk-in and impulse orders
- Encourages location-based engagement

### Acceptance Criteria

```gherkin
Feature: Near Me Location-Based Search

  Background:
    Given the following venues exist with coordinates:
      | Name                  | Latitude  | Longitude   | City         |
      | Bar & Grill Downtown  | 37.7749   | -122.4194   | San Francisco |
      | Uptown Lounge         | 37.7849   | -122.4094   | San Francisco |
      | Mission Brewery       | 37.7649   | -122.4294   | San Francisco |
      | Far Away Bar          | 37.8749   | -122.3194   | San Francisco |
    And I am on the Menu page
    And the VenueSearch component is visible

  Scenario: User clicks "Near Me" button successfully
    Given I have granted location permissions to the browser
    When I click the "Near Me" button
    Then I should see a loading indicator
    And the browser should request my current location
    When my location is determined as (37.7749, -122.4194)
    Then I should see venues sorted by distance from my location
    And "Bar & Grill Downtown" should appear first (closest)
    And each venue card should display the distance in miles or km

  Scenario: User denies location permission
    Given I have not granted location permissions
    When I click the "Near Me" button
    Then I should see a permission request dialog from the browser
    When I deny the permission
    Then I should see an error message "Location access denied"
    And I should see a suggestion "Please enable location services to use 'Near Me'"

  Scenario: Location permission is already denied
    Given location permissions are blocked in my browser settings
    When I click the "Near Me" button
    Then I should see an error message "Location access denied"
    And I should see instructions on how to enable location in browser settings

  Scenario: Geolocation service is unavailable
    Given my device does not support geolocation
    When I click the "Near Me" button
    Then I should see an error message "Location services unavailable"
    And I should see a fallback message to use text search instead

  Scenario: Geolocation times out
    Given the geolocation request takes longer than 10 seconds
    When I click the "Near Me" button
    Then I should see an error message "Unable to determine location"
    And I should be able to try again
    And the search should fall back to showing all venues

  Scenario: Distance calculation and sorting
    Given my current location is (37.7749, -122.4194)
    When I use the "Near Me" feature
    Then venues should be sorted by proximity
    And each venue should display distance with unit (e.g., "0.5 mi" or "1.2 km")
    And distance should be calculated using the Haversine formula
    And "Far Away Bar" should appear last in the list

  Scenario: Near Me search combines with active filters
    Given I have searched for "bar" in the text search
    When I click "Near Me"
    Then I should see only bars near my location
    And results should match both text search and location criteria

  Scenario: User re-runs Near Me search from different location
    Given I previously used "Near Me" at location A
    When I move to a new location B
    And I click "Near Me" again
    Then the venue list should update based on location B
    And distances should be recalculated
```

### Technical Requirements

**Frontend:**
- "Near Me" button with location pin icon
- Request browser geolocation permission
- Handle permission states (granted, denied, prompt)
- Display loading state during location fetch
- Show distance for each venue in results
- Error handling and user-friendly messages

**Geolocation API:**
```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    searchNearbyVenues(latitude, longitude);
  },
  (error) => {
    handleLocationError(error);
  },
  { timeout: 10000, enableHighAccuracy: true }
);
```

**Distance Calculation:**
- Use Haversine formula to calculate distance between two coordinates
- Display distance in miles (US) or kilometers (international)
- Sort venues by ascending distance

**Example Haversine Implementation:**
```typescript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

**Backend/Database:**
- Fetch all active venues with coordinates from `venues` table
- Return venue data with city information
- Filter for `is_active = true` and non-null coordinates

### Dependencies
- Browser Geolocation API
- Haversine formula for distance calculation
- MapPin icon from lucide-react
- Venue coordinates stored in database

### Story Points: 8
**Estimation Rationale:** Requires integration with browser geolocation API, permission handling, distance calculations, error states, and sorting logic. More complex than simple text search.

---

## US-VS.3: Display Venue Information

**As a** user browsing venues  
**I want** to see key information about each venue in search results  
**So that** I can make an informed decision about which venue to select

### Background
Before selecting a venue, users need to see essential details such as address, hours of operation, rating, and price range. This information helps users assess whether a venue meets their needs.

### Business Value
- Improves decision-making and user confidence
- Reduces cart abandonment from incorrect venue selection
- Increases transparency and trust
- Supports informed venue selection

### Acceptance Criteria

```gherkin
Feature: Display Venue Information

  Background:
    Given the following venue exists:
      | Field         | Value                              |
      | Name          | Bar & Grill Downtown               |
      | Address       | 123 Main St, San Francisco, CA     |
      | Rating        | 4.5                                |
      | Review Count  | 250                                |
      | Price Range   | 2                                  |
      | Hours Monday  | 11:00 AM - 10:00 PM                |
      | Hours Tuesday | 11:00 AM - 10:00 PM                |
      | Phone         | (415) 555-0123                     |
      | Description   | Sports bar with great food         |
    And I am viewing the venue search results

  Scenario: Venue card displays essential information
    When I see the venue card for "Bar & Grill Downtown"
    Then I should see the venue name "Bar & Grill Downtown"
    And I should see the address "123 Main St, San Francisco, CA"
    And I should see the rating "4.5" with star icons
    And I should see "(250 reviews)"
    And I should see the price range as "$$" (2 dollar signs)
    And I should see today's hours of operation
    And I should see a "Select Venue" button

  Scenario: Price range is displayed correctly
    When I see venues with different price ranges:
      | Price Range | Display |
      | 1           | $       |
      | 2           | $$      |
      | 3           | $$$     |
      | 4           | $$$$    |
    Then each venue should show the appropriate number of dollar signs

  Scenario: Rating displays with visual stars
    Given a venue has a rating of 4.5
    When I view the venue card
    Then I should see 4 full stars and 1 half star
    And the stars should be gold/yellow colored
    And the numeric rating "4.5" should be displayed next to the stars

  Scenario: Venue with no reviews displays appropriately
    Given a venue has 0 reviews
    When I view the venue card
    Then I should see "No reviews yet" instead of a rating
    Or I should see a placeholder message encouraging first review

  Scenario: Hours display shows today's schedule
    Given today is Monday
    And the venue has Monday hours "11:00 AM - 10:00 PM"
    When I view the venue card
    Then I should see "Open today: 11:00 AM - 10:00 PM"

  Scenario: Venue currently open or closed indicator
    Given today is Monday at 3:00 PM
    And the venue hours are "11:00 AM - 10:00 PM"
    When I view the venue card
    Then I should see an "Open now" badge or indicator in green

    Given today is Monday at 11:00 PM
    And the venue hours are "11:00 AM - 10:00 PM"
    When I view the venue card
    Then I should see a "Closed" badge or indicator in red

  Scenario: Venue with missing hours shows appropriate message
    Given a venue has no hours information
    When I view the venue card
    Then I should see "Hours not available" or similar placeholder

  Scenario: Venue description is displayed
    Given a venue has a description "Sports bar with great food"
    When I view the venue card
    Then I should see the description text
    And the description should be truncated if longer than 100 characters
    And there should be a "Read more" option if truncated

  Scenario: Distance is shown for Near Me results
    Given I used the "Near Me" feature
    And a venue is 0.5 miles away
    When I view the venue card
    Then I should see "0.5 mi" displayed prominently
    And the distance should be near the venue name or address
```

### Technical Requirements

**Venue Card Components:**
- Venue name (headline)
- Full address with city and state
- Star rating (visual stars + numeric value)
- Review count
- Price range ($ symbols)
- Today's hours of operation
- Open/Closed status badge
- Distance (if from Near Me search)
- Description (truncated)
- "Select Venue" button

**Data Display Logic:**
- Calculate current day of week
- Display appropriate hours (e.g., `hours_monday`, `hours_tuesday`)
- Format price range: 1-4 dollar signs
- Render star rating as visual stars (full, half, empty)
- Calculate if venue is currently open based on time
- Truncate description to 100 characters with ellipsis

**Formatting Functions:**
```typescript
const getPriceRange = (priceRange: number) => {
  return '$'.repeat(priceRange || 1);
};

const getTodayHours = (venue: Venue) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return venue[`hours_${today}`] || 'Hours not available';
};
```

**UI Components:**
- Card container with hover effect
- Star icon component (lucide-react)
- Badge component for open/closed status
- Typography with semantic styling
- Responsive layout for mobile and desktop

### Dependencies
- Venue data from Supabase `venues` and `cities` tables
- Star icon component (lucide-react)
- Badge UI component
- Card UI component
- Date/time utilities for hours display

### Story Points: 3
**Estimation Rationale:** Mostly UI display logic with some date/time calculations. Straightforward data formatting and rendering.

---

## US-VS.4: Venue List with Ratings

**As a** user browsing venues  
**I want** to see venues displayed in an organized, scannable list  
**So that** I can easily compare options and select the best venue for my needs

### Background
The venue list should present multiple venues in a clean, organized grid or list format that makes it easy to compare key attributes like rating, distance, and price. Proper layout and visual hierarchy help users make quick decisions.

### Business Value
- Enhances user experience through clear visual organization
- Facilitates quick comparison between venues
- Reduces cognitive load and decision fatigue
- Increases conversion by presenting options effectively

### Acceptance Criteria

```gherkin
Feature: Venue List with Ratings

  Background:
    Given multiple venues exist in the system
    And I am on the Menu page with VenueSearch visible

  Scenario: Venue list displays in grid layout on desktop
    Given I am viewing the page on a desktop browser
    When I see the venue search results
    Then venues should be displayed in a grid layout
    And there should be 2-3 venue cards per row
    And each card should have equal width and height
    And cards should have consistent spacing

  Scenario: Venue list displays in single column on mobile
    Given I am viewing the page on a mobile device
    When I see the venue search results
    Then venues should be displayed in a single column
    And each card should span the full width of the screen
    And cards should be stacked vertically

  Scenario: Venues are sorted by rating by default
    Given no search filters are applied
    When I view the venue list
    Then venues should be sorted by rating (highest first)
    And a 4.8-rated venue should appear before a 4.2-rated venue

  Scenario: Venues are sorted by distance when using Near Me
    Given I used the "Near Me" feature
    When I view the venue list
    Then venues should be sorted by distance (closest first)
    And distance should override rating as the primary sort

  Scenario: Venue cards have hover effects
    Given I am on a desktop browser
    When I hover over a venue card
    Then the card should have a subtle elevation or shadow effect
    And the cursor should change to a pointer
    And this provides visual feedback that the card is interactive

  Scenario: Ratings are displayed consistently across all cards
    When I view multiple venue cards
    Then each card should display rating in the same position
    And ratings should use the same star icon style
    And numeric rating should always accompany visual stars

  Scenario: Empty state when no venues match search
    Given I have searched for a term with no results
    When the venue list is empty
    Then I should see an empty state message
    And the message should say "No venues found matching your search"
    And I should see a suggestion to try different search terms

  Scenario: Loading state while fetching venues
    Given I have just opened the venue search
    When venues are being loaded from the database
    Then I should see loading skeletons or spinners
    And the skeletons should match the layout of venue cards
    And this prevents layout shift when data loads

  Scenario: Venue list updates in real-time as I search
    Given I am typing in the search field
    When I type "down"
    Then the venue list should update to show matching venues
    When I continue typing "downtown"
    Then the list should further refine the results
    And the transition should be smooth without jarring jumps

  Scenario: Venue cards are clickable
    When I click anywhere on a venue card
    Then it should behave the same as clicking the "Select Venue" button
    And this provides a larger click target for better UX

  Scenario: Pagination or infinite scroll for large result sets
    Given there are more than 50 venues in the results
    When I scroll to the bottom of the venue list
    Then additional venues should load automatically
    Or I should see a "Load More" button to fetch next page
    And this prevents overwhelming the UI with too many cards at once
```

### Technical Requirements

**Layout:**
- Responsive grid: 3 columns desktop, 2 columns tablet, 1 column mobile
- CSS Grid or Flexbox with gap spacing
- Equal card heights for visual consistency
- Smooth hover transitions

**Sorting Logic:**
- Default sort: Rating descending
- Near Me sort: Distance ascending
- Maintain sort preference during search filtering

**Loading States:**
- Skeleton loaders matching card structure
- Loading spinner for Near Me geolocation
- Smooth transitions when data loads

**Empty States:**
- "No results" message with helpful suggestions
- Clear action to reset search or try Near Me

**Performance:**
- Virtualized list for large result sets (50+ venues)
- Lazy loading of venue images
- Debounced search to reduce re-renders

**CSS Classes (Design System):**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
    {/* Venue card content */}
  </Card>
</div>
```

### Dependencies
- Grid layout with Tailwind CSS
- Card UI component with hover effects
- Loading skeleton component
- Empty state component
- Venue data from Supabase

### Story Points: 5
**Estimation Rationale:** Requires responsive grid layout, sorting logic, loading/empty states, and smooth UX transitions. Moderate complexity with multiple UI states.

---

# CNS-0003: Selected Venue Management

## Epic Overview

**Epic:** Selected Venue Management  
**Epic ID:** CNS-0003  
**Description:** Enables users to explicitly select a venue, persist their selection across sessions, and easily change venues with appropriate warnings and confirmations to prevent data loss.

**Business Value:**
- Prevents confusion about which venue orders are placed with
- Reduces cart abandonment from accidental venue changes
- Improves user experience through session persistence
- Provides clear visual confirmation of venue selection

**Components:** `src/components/menu/VenueSearch.tsx`, `src/pages/Menu.tsx`, `src/hooks/useCart.ts`  
**Database Tables:** `venues`, `cities`

---

## US-VS.5: Explicit Venue Selection

**As a** user browsing venues  
**I want** to explicitly select a venue with clear confirmation  
**So that** I know which venue I'm ordering from and can proceed to view the menu

### Background
After searching for venues, users need a clear and explicit way to select their chosen venue. This selection should trigger a confirmation and transition to show the menu for that specific venue.

### Business Value
- Prevents ambiguity about which venue is selected
- Reduces order errors from incorrect venue selection
- Provides clear user feedback and confirmation
- Improves overall ordering experience

### Acceptance Criteria

```gherkin
Feature: Explicit Venue Selection

  Background:
    Given I am on the Menu page
    And the VenueSearch component is visible
    And I can see multiple venue cards in the search results

  Scenario: User selects a venue via Select Venue button
    Given I see the venue card for "Bar & Grill Downtown"
    When I click the "Select Venue" button
    Then the VenueSearch component should hide with animation
    And I should see a success toast notification
    And the toast should say "Thank you for choosing Bar & Grill Downtown"
    And the page should display "Menu of Bar & Grill Downtown" as a header
    And I should see only products from "Bar & Grill Downtown"
    And the products should be filtered by the selected venue ID

  Scenario: Select Venue button is clearly visible on each card
    When I view a venue card
    Then the "Select Venue" button should be positioned below the rating
    And the button should use primary or accent styling
    And the button should have clear labeling "Select Venue"
    And the button should be large enough for easy clicking

  Scenario: Venue name is displayed prominently after selection
    Given I have selected "Uptown Lounge"
    When the VenueSearch component hides
    Then I should see "Menu of Uptown Lounge" as a prominent header
    And the header should use large, bold typography
    And the header should include the venue name exactly as stored

  Scenario: Products are immediately filtered after selection
    Given "Bar & Grill Downtown" has 15 products
    And "Uptown Lounge" has 20 products
    When I select "Bar & Grill Downtown"
    Then I should see exactly 15 products displayed
    And all products should belong to "Bar & Grill Downtown"
    And products from other venues should not be visible

  Scenario: User sees confirmation toast notification
    When I click "Select Venue" for any venue
    Then a toast notification should appear at the top or bottom of screen
    And the toast should display for 3-5 seconds
    And the toast should include the venue name
    And the toast message should be positive and welcoming

  Scenario: Selecting same venue again has no side effects
    Given I have already selected "Bar & Grill Downtown"
    And I click "Change Venue" to reopen the search
    When I click "Select Venue" for "Bar & Grill Downtown" again
    Then the venue should remain selected
    And no cart items should be cleared
    And I should see the same confirmation toast
    And the menu should reload for the same venue

  Scenario: Venue selection triggers menu data fetch
    Given I have not yet selected a venue
    When I select "Mission Brewery"
    Then the application should fetch products for "Mission Brewery"
    And the fetch should filter products by venue_id
    And featured products should be loaded first
    And the products should display with correct pricing
```

### Technical Requirements

**UI Components:**
- "Select Venue" button on each venue card
- Toast notification system
- Menu header with venue name
- Products grid filtered by venue

**State Management:**
```typescript
const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

const handleVenueSelection = (venue: Venue) => {
  setSelectedVenue(venue);
  setShowVenueSearch(false);
  toast.success(`Thank you for choosing ${venue.name}`);
};
```

**Product Filtering:**
```typescript
const { data: products } = await supabase
  .from('products')
  .select('*, product_categories(*)')
  .eq('venue_id', selectedVenue.id)
  .eq('is_available', true);
```

**Toast Notification:**
- Use toast library (sonner)
- Success variant styling
- Auto-dismiss after 3-5 seconds
- Message format: "Thank you for choosing {venueName}"

**Menu Header:**
```tsx
<h1 className="text-3xl font-bold text-foreground">
  Menu of {selectedVenue.name}
</h1>
```

### Dependencies
- Toast notification system (sonner)
- Button component with primary variant
- Venue state management
- Product data fetching from Supabase

### Story Points: 5
**Estimation Rationale:** Requires button UI, state management, toast integration, and product filtering logic. Standard feature implementation.

---

## US-VS.6: Venue Change with Cart Warning

**As a** user ordering from a venue  
**I want** to be warned when changing venues with items in my cart  
**So that** I don't accidentally lose my current order

### Background
Users may want to switch venues after adding items to their cart. However, cart items are venue-specific and must be cleared when changing venues. A confirmation dialog prevents accidental data loss.

### Business Value
- Prevents accidental cart clearing and user frustration
- Improves trust and transparency
- Reduces cart abandonment from unexpected behavior
- Provides user control over important decisions

### Acceptance Criteria

```gherkin
Feature: Venue Change with Cart Warning

  Background:
    Given I am on the Menu page
    And I have selected "Bar & Grill Downtown"
    And I have 3 items in my cart

  Scenario: User changes venue with items in cart
    When I click "Change Venue"
    And the VenueSearch component appears
    And I click on a different venue "Uptown Lounge"
    And I click the "Select Venue" button
    Then I should see a confirmation dialog
    And the dialog should display "Change Venue?"
    And the dialog should show "You have 3 items in your cart"
    And the dialog should warn "Changing venues will clear your current cart"
    And I should see "Cancel" and "Change Venue" buttons

  Scenario: User confirms venue change and cart is cleared
    Given I see the venue change confirmation dialog
    When I click "Change Venue"
    Then my cart should be cleared
    And the cart item count should show 0
    And the selected venue should change to "Uptown Lounge"
    And I should see "Menu of Uptown Lounge"
    And I should see a success toast "Thank you for choosing Uptown Lounge"
    And the products displayed should be filtered to "Uptown Lounge" only

  Scenario: User cancels venue change
    Given I see the venue change confirmation dialog
    When I click "Cancel"
    Then the dialog should close
    And my current venue should remain "Bar & Grill Downtown"
    And my cart should still contain 3 items
    And no venue change should occur
    And the VenueSearch component should remain visible

  Scenario: User selects same venue with items in cart
    When I click "Change Venue"
    And I click on "Bar & Grill Downtown"
    And I click the "Select Venue" button
    Then no confirmation dialog should appear
    And my cart should remain unchanged with 3 items
    And I should see the success toast
    And the VenueSearch should hide

  Scenario: User selects venue with empty cart
    Given my cart is empty (0 items)
    When I click "Change Venue"
    And I click on a different venue "Uptown Lounge"
    And I click the "Select Venue" button
    Then no confirmation dialog should appear
    And the venue should change immediately
    And I should see "Menu of Uptown Lounge"
    And the VenueSearch should hide with animation

  Scenario: Cart item count displays correctly in warning
    Given I have 1 item in my cart
    When I attempt to change venues
    Then the warning should show "You have 1 item in your cart"

    Given I have 5 items in my cart
    When I attempt to change venues
    Then the warning should show "You have 5 items in your cart"

  Scenario: Dialog is keyboard accessible
    Given I see the venue change confirmation dialog
    When I press "Tab"
    Then focus should move between "Cancel" and "Change Venue" buttons
    When I press "Escape"
    Then the dialog should close (same as clicking Cancel)
    When I press "Enter" on "Change Venue"
    Then the venue change should be confirmed
```

### Technical Requirements

**Dialog Component:**
- Use AlertDialog from UI library
- Clear title: "Change Venue?"
- Warning message with cart item count
- Two action buttons: "Cancel" (secondary), "Change Venue" (destructive)
- Keyboard navigation support (Tab, Enter, Escape)
- Focus trap while dialog is open

**Confirmation Logic:**
```typescript
const handleVenueSelection = (venue: Venue) => {
  if (cartItemCount > 0 && selectedVenue?.id !== venue.id) {
    setConfirmationDialog({
      isOpen: true,
      newVenue: venue
    });
  } else {
    selectVenueAndUpdateUI(venue);
  }
};

const handleConfirmVenueChange = () => {
  onClearCart(); // Clear all cart items
  selectVenueAndUpdateUI(confirmationDialog.newVenue);
  setConfirmationDialog({ isOpen: false, newVenue: null });
};
```

**Cart Clearing:**
```typescript
const onClearCart = () => {
  setCartItems([]);
  localStorage.removeItem('cart_items');
};
```

**Dialog UI:**
```tsx
<AlertDialog open={confirmationDialog.isOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Change Venue?</AlertDialogTitle>
      <AlertDialogDescription>
        You have {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in your cart.
        Changing venues will clear your current cart.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive" onClick={handleConfirmVenueChange}>
        Change Venue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Dependencies
- AlertDialog UI component
- useEnhancedCart hook for cart state
- Toast notification system
- localStorage for cart persistence

### Story Points: 5
**Estimation Rationale:** Requires dialog integration, cart state checking, confirmation logic, and cart clearing. Standard complexity for dialog-based confirmation flows.

---

## US-VS.7: Venue Persistence Across Sessions

**As a** user who has selected a venue  
**I want** my venue selection to be remembered  
**So that** I don't have to select it again when I return to the app

### Background
Users expect their venue selection to persist when they navigate between pages or close and reopen the app. This provides continuity and reduces friction in the ordering experience.

### Business Value
- Improves returning user experience
- Reduces steps in ordering flow
- Increases user satisfaction and retention
- Supports seamless multi-session ordering

### Acceptance Criteria

```gherkin
Feature: Venue Persistence Across Sessions

  Scenario: Venue selection is saved to localStorage
    Given I am on the Menu page
    When I select "Bar & Grill Downtown"
    Then the venue ID and name should be saved to localStorage
    And the localStorage key should be "selected_venue"
    And the stored value should be valid JSON
    And the JSON should contain both venue ID and name

  Scenario: Venue selection is restored on page load
    Given I previously selected "Bar & Grill Downtown"
    And the venue is stored in localStorage
    When I reload the page or return later
    Then "Bar & Grill Downtown" should be automatically selected
    And I should see "Menu of Bar & Grill Downtown" immediately
    And the products should be filtered to that venue
    And the VenueSearch component should be hidden

  Scenario: First-time user sees venue search
    Given I have never visited the app before
    And there is no venue in localStorage
    When I visit the Menu page
    Then the VenueSearch component should be visible
    And no venue should be selected
    And I should see the search input and "Near Me" button
    And I should see venue search results or prompts to search

  Scenario: Venue persists across page navigation
    Given I have selected "Uptown Lounge"
    When I navigate to the Checkout page
    And I return to the Menu page
    Then "Uptown Lounge" should still be selected
    And I should not need to reselect my venue
    And the menu should immediately display Uptown Lounge products

  Scenario: Venue persists across browser sessions
    Given I selected "Mission Brewery"
    And I close the browser tab
    When I reopen the app in a new browser session
    Then "Mission Brewery" should still be selected
    And the localStorage data should be intact

  Scenario: Venue is cleared when explicitly deselected
    Given I have a venue selected
    When I clear my venue selection (e.g., via a "Clear Selection" action)
    Then the venue data should be removed from localStorage
    And I should see the VenueSearch component
    And no venue should be selected

  Scenario: Invalid venue data in localStorage is handled gracefully
    Given localStorage contains corrupted or invalid venue data
    When I load the Menu page
    Then the app should not crash
    And the invalid data should be cleared from localStorage
    And no venue should be selected
    And the VenueSearch component should be visible
    And I should see a message to select a venue

  Scenario: Venue ID is validated against database
    Given localStorage contains a venue ID that no longer exists in the database
    When I load the Menu page
    Then the app should detect the invalid venue
    And the localStorage should be cleared
    And the VenueSearch component should be shown
    And I should be prompted to select a new venue
```

### Technical Requirements

**localStorage Structure:**
```typescript
interface StoredVenue {
  id: string;
  name: string;
}

// Save venue
const saveVenueToStorage = (venue: Venue) => {
  const storedData = { id: venue.id, name: venue.name };
  localStorage.setItem('selected_venue', JSON.stringify(storedData));
};

// Retrieve venue
const getStoredVenue = (): StoredVenue | null => {
  try {
    const data = localStorage.getItem('selected_venue');
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing stored venue:', error);
    localStorage.removeItem('selected_venue');
    return null;
  }
};
```

**Component Mount Logic:**
```typescript
useEffect(() => {
  const storedVenue = getStoredVenue();
  if (storedVenue) {
    // Optionally validate venue still exists in database
    fetchVenueById(storedVenue.id).then(venue => {
      if (venue) {
        setSelectedVenue(venue);
        setShowVenueSearch(false);
      } else {
        localStorage.removeItem('selected_venue');
      }
    });
  }
}, []);
```

**Error Handling:**
- Try-catch for JSON.parse errors
- Validation that venue ID exists in database
- Clear localStorage on invalid data
- Graceful fallback to venue search

**State Initialization:**
```typescript
const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
const [showVenueSearch, setShowVenueSearch] = useState(false);

// Initialize from localStorage
useEffect(() => {
  const stored = getStoredVenue();
  setShowVenueSearch(!stored);
}, []);
```

### Dependencies
- Browser localStorage API
- JSON serialization/deserialization
- Error handling utilities
- Supabase for venue validation (optional)

### Story Points: 3
**Estimation Rationale:** Straightforward localStorage implementation with error handling. Low-to-moderate complexity.

---

## US-VS.8: Change Venue Toggle Button

**As a** user who has selected a venue  
**I want** to easily change my venue without scrolling  
**So that** I can quickly switch to a different location

### Background
After selecting a venue, the venue search component is hidden. Users need an intuitive way to change their venue selection without confusion. A "Change Venue" button provides a clear toggle.

### Business Value
- Improves flexibility and user control
- Reduces frustration when users want to switch venues
- Provides clear visual affordance
- Maintains clean UI by hiding search when not needed

### Acceptance Criteria

```gherkin
Feature: Change Venue Toggle Button

  Background:
    Given I am on the Menu page

  Scenario: VenueSearch is visible on first visit
    Given I have not selected a venue
    When I load the page
    Then the VenueSearch component should be visible
    And I should see the search input
    And I should see the "Near Me" button
    And the "Change Venue" button should not be visible

  Scenario: VenueSearch is hidden after venue selection
    Given the VenueSearch component is visible
    When I select a venue "Bar & Grill Downtown"
    Then the VenueSearch component should be hidden with animation
    And I should see "Menu of Bar & Grill Downtown"
    And I should see a "Change Venue" button near the menu header

  Scenario: Change Venue button shows VenueSearch
    Given I have selected "Bar & Grill Downtown"
    And the VenueSearch component is hidden
    When I click the "Change Venue" button
    Then the VenueSearch component should be visible with animation
    And I should see the search input
    And the "Near Me" button should be visible
    And my current venue "Bar & Grill Downtown" should remain selected
    And I can search for a new venue

  Scenario: Selecting new venue hides VenueSearch again
    Given I have clicked "Change Venue"
    And the VenueSearch component is visible
    When I select a different venue "Uptown Lounge"
    Then the VenueSearch component should be hidden
    And I should see "Menu of Uptown Lounge"
    And the "Change Venue" button should be visible again

  Scenario: Change Venue button styling and placement
    Given I have selected a venue
    When I see the "Change Venue" button
    Then the button should display a map pin or location icon
    And the button should use outline or secondary variant styling
    And the button should be positioned below the "Menu of [Venue Name]" header
    And the button should be easy to click with clear hover effects

  Scenario: Keyboard accessibility for Change Venue button
    Given the "Change Venue" button is visible
    When I tab to the button using keyboard navigation
    Then the button should receive focus with visible focus ring
    When I press "Enter" or "Space"
    Then the VenueSearch component should toggle visibility

  Scenario: Venue search visibility persists during cart warning
    Given I click "Change Venue"
    And the VenueSearch component is visible
    When I attempt to select a new venue with items in cart
    And I see the confirmation dialog
    And I click "Cancel"
    Then the VenueSearch component should remain visible
    And I can continue searching for venues

  Scenario: VenueSearch hidden state is restored on page reload
    Given I have selected a venue
    And the VenueSearch is hidden
    When I reload the page
    Then the VenueSearch should remain hidden
    And the "Change Venue" button should be visible
    And my venue selection should be maintained
```

### Technical Requirements

**State Management:**
```typescript
const [showVenueSearch, setShowVenueSearch] = useState(false);

// Initialize based on stored venue
useEffect(() => {
  const storedVenue = getStoredVenue();
  setShowVenueSearch(!storedVenue);
}, []);

// Toggle function
const toggleVenueSearch = () => {
  setShowVenueSearch(!showVenueSearch);
};
```

**Button Component:**
```tsx
{selectedVenue && !showVenueSearch && (
  <Button 
    variant="outline" 
    onClick={toggleVenueSearch}
    className="flex items-center gap-2"
  >
    <MapPin className="h-4 w-4" />
    Change Venue
  </Button>
)}
```

**Conditional Rendering:**
```tsx
{showVenueSearch && (
  <VenueSearch 
    selectedVenue={selectedVenue}
    onVenueSelect={handleVenueSelection}
    cartItemCount={cartItemCount}
    onClearCart={onClearCart}
  />
)}
```

**Button Styling:**
- Outline variant with theme colors
- MapPin icon from lucide-react
- Positioned below menu header
- Hover effect with transition
- Semantic coloring (e.g., primary or accent)

**Animation:**
- VenueSearch should animate in/out when toggled
- See US-VS.9 for animation details

### Dependencies
- useState hook
- MapPin icon (lucide-react)
- Button UI component
- VenueSearch component

### Story Points: 3
**Estimation Rationale:** Simple toggle button with state management. Low complexity.

---

## US-VS.9: Smooth Venue Search Collapse Animation

**As a** user interacting with the venue search  
**I want** smooth visual transitions when the search appears/disappears  
**So that** the interface feels polished and professional

### Background
Abrupt show/hide of the venue search component can feel jarring. Smooth animations provide visual continuity and improve the perceived quality of the user experience.

### Business Value
- Enhances perceived quality and professionalism
- Provides visual feedback during state changes
- Improves overall user experience
- Reduces cognitive load with smooth transitions

### Acceptance Criteria

```gherkin
Feature: Smooth Venue Search Collapse Animation

  Scenario: VenueSearch animates in when shown
    Given the VenueSearch component is hidden
    When I click the "Change Venue" button
    Then the VenueSearch should fade in smoothly
    And the content should animate from 0 to full height
    And the animation should take approximately 300ms
    And the opacity should transition from 0 to 100%

  Scenario: VenueSearch animates out when hidden
    Given the VenueSearch component is visible
    When I select a venue
    Then the VenueSearch should fade out smoothly
    And the content should animate from full height to 0
    And the animation should take approximately 300ms
    And the opacity should transition from 100% to 0%

  Scenario: Animation uses proper easing
    When the VenueSearch animates
    Then it should use ease-out or ease-in-out timing function
    And the transition should feel natural and smooth
    And there should be no visual jumps or stuttering

  Scenario: Content doesn't overflow during animation
    When the VenueSearch is animating
    Then the content should not overflow its container
    And scrollbars should not appear during transition
    And venue cards should remain properly positioned
    And no content should be cut off mid-animation

  Scenario: Animation works on initial page load
    Given I have a stored venue
    When I load the page
    Then the VenueSearch should be hidden without animation
    And the menu should display immediately
    And there should be no flash of the search component (FOUC)

  Scenario: Multiple rapid toggles are handled smoothly
    Given the VenueSearch is hidden
    When I click "Change Venue" rapidly
    And immediately select a venue
    Then the animations should not conflict
    And the final state should be correct (hidden)
    And there should be no visual glitches

  Scenario: Animation is accessible and performant
    When the VenueSearch animates
    Then the animation should not cause layout shift in other content
    And the animation should be GPU accelerated for performance
    And users with reduced motion preferences should see instant toggle
    And the animation should work smoothly on mobile devices
```

### Technical Requirements

**CSS Animation Classes:**
```css
/* Tailwind configuration or custom CSS */
.venue-search-enter {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 300ms ease-out;
}

.venue-search-enter-active {
  max-height: 2000px; /* Large enough for content */
  opacity: 1;
}

.venue-search-exit {
  max-height: 2000px;
  opacity: 1;
  overflow: hidden;
  transition: all 300ms ease-in;
}

.venue-search-exit-active {
  max-height: 0;
  opacity: 0;
}
```

**Tailwind Implementation:**
```tsx
<div 
  className={`
    transition-all duration-300 overflow-hidden
    ${showVenueSearch 
      ? 'max-h-[2000px] opacity-100 animate-fade-in' 
      : 'max-h-0 opacity-0'
    }
  `}
>
  <VenueSearch {...props} />
</div>
```

**Respect Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .venue-search-enter,
  .venue-search-exit {
    transition: none;
  }
}
```

**Performance Optimization:**
- Use `transform` and `opacity` for GPU acceleration
- Avoid animating `height` directly (use `max-height`)
- Use `overflow: hidden` to prevent visual overflow
- Keep animation duration short (300ms)

**Animation Library (Optional):**
```typescript
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {showVenueSearch && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <VenueSearch {...props} />
    </motion.div>
  )}
</AnimatePresence>
```

### Dependencies
- Tailwind CSS transition utilities
- CSS custom animations
- Framer Motion (optional for advanced animations)
- prefers-reduced-motion media query support

### Story Points: 2
**Estimation Rationale:** Simple CSS animations with Tailwind classes. Low complexity.

---

## Integration Testing Scenarios

```gherkin
Feature: End-to-End Venue Discovery and Selection Flow

  Scenario: Complete first-time user venue selection flow
    Given I am a new user visiting the app for the first time
    When I navigate to the Menu page
    Then I should see the VenueSearch component with animation
    When I type "downtown" into the search field
    Then I should see venues matching "downtown"
    When I click the "Select Venue" button for "Bar & Grill Downtown"
    Then the VenueSearch should collapse with animation
    And I should see "Menu of Bar & Grill Downtown"
    And the venue should be saved to localStorage
    When I reload the page
    Then "Bar & Grill Downtown" should still be selected
    And the VenueSearch should be hidden

  Scenario: Change venue with cart items
    Given I have selected "Bar & Grill Downtown"
    And I have added 3 items to my cart
    When I click "Change Venue"
    Then the VenueSearch should expand with animation
    When I select "Uptown Lounge"
    Then I should see a confirmation dialog warning about cart clearing
    When I confirm the change
    Then my cart should be cleared
    And the venue should change to "Uptown Lounge"
    And the VenueSearch should collapse
    And the venue should be updated in localStorage

  Scenario: Near Me search and selection
    Given I am on the Menu page
    And I have granted location permissions
    When I click the "Near Me" button
    Then I should see venues sorted by distance from my location
    And each venue should display distance
    When I select the closest venue
    Then the venue should be selected
    And I should see the menu for that venue
    And the VenueSearch should be hidden
```

---

## Non-Functional Requirements

### Performance
- Venue search should return results in < 500ms
- Near Me geolocation should complete in < 3 seconds
- Animations should run at 60fps
- localStorage operations should be non-blocking
- No layout shifts during animations

### Accessibility
- Dialog should trap focus when open
- Keyboard navigation should work for all interactions (Tab, Enter, Escape)
- Screen readers should announce venue changes
- Animation should respect `prefers-reduced-motion`
- Color contrast should meet WCAG AA standards
- Focus indicators should be clearly visible

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)
- localStorage must be available (fallback if not)
- Geolocation API required for Near Me feature

### Security
- Validate venue data from localStorage before use
- Sanitize venue names before display to prevent XSS
- Validate venue ID exists in database before selection
- Use parameterized queries for search to prevent SQL injection

### Data Integrity
- Ensure selected venue persists across page reloads
- Cart items are correctly cleared when venue changes
- Venue ID validation prevents orphaned references
- Handle edge cases like venue deactivation

---

## Traceability Matrix

| Epic ID | User Story | Test Case IDs | Components | Priority | Status |
|---------|-----------|---------------|------------|----------|--------|
| CNS-0002 | US-VS.1: Text-Based Venue Search | TC-VS-1.1 to TC-VS-1.8 | VenueSearch | P1 | ✅ Implemented |
| CNS-0002 | US-VS.2: Near Me Location-Based Search | TC-VS-2.1 to TC-VS-2.9 | VenueSearch | P1 | ✅ Implemented |
| CNS-0002 | US-VS.3: Display Venue Information | TC-VS-3.1 to TC-VS-3.9 | VenueSearch | P1 | ✅ Implemented |
| CNS-0002 | US-VS.4: Venue List with Ratings | TC-VS-4.1 to TC-VS-4.11 | VenueSearch | P1 | ✅ Implemented |
| CNS-0003 | US-VS.5: Explicit Venue Selection | TC-VS-5.1 to TC-VS-5.7 | VenueSearch, Menu | P0 | ✅ Implemented |
| CNS-0003 | US-VS.6: Venue Change with Cart Warning | TC-VS-6.1 to TC-VS-6.7 | VenueSearch, Menu | P0 | ✅ Implemented |
| CNS-0003 | US-VS.7: Venue Persistence Across Sessions | TC-VS-7.1 to TC-VS-7.8 | Menu | P1 | ✅ Implemented |
| CNS-0003 | US-VS.8: Change Venue Toggle Button | TC-VS-8.1 to TC-VS-8.7 | Menu | P1 | ✅ Implemented |
| CNS-0003 | US-VS.9: Smooth Venue Search Collapse Animation | TC-VS-9.1 to TC-VS-9.6 | Menu | P2 | ✅ Implemented |

---

## Definition of Done

**For Each User Story:**
- [ ] All Gherkin scenarios pass manual testing
- [ ] Unit tests written and passing (where applicable)
- [ ] Integration tests cover happy path and error scenarios
- [ ] Code reviewed and approved by tech lead
- [ ] Accessibility tested with keyboard navigation
- [ ] Tested on Chrome, Firefox, Safari (desktop and mobile)
- [ ] Error handling covers edge cases
- [ ] Documentation updated (README, inline comments)
- [ ] Product owner accepts implementation
- [ ] No critical bugs or regressions

**For Epic Completion (CNS-0002 & CNS-0003):**
- [ ] All 9 user stories meet Definition of Done
- [ ] End-to-end testing completed successfully
- [ ] Performance benchmarks met
- [ ] Accessibility audit completed (WCAG AA)
- [ ] Security review completed
- [ ] User acceptance testing (UAT) passed
- [ ] Deployed to staging environment
- [ ] Final product owner sign-off received
