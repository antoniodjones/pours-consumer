# Product Browsing Features - Product Requirements Document

**Epic ID:** CNS-0004  
**Epic Name:** Category-Based Product Browsing  
**Feature Area:** Product Discovery & Ordering  
**Version:** 1.0  
**Last Updated:** 2025-11-23  
**Status:** ✅ Implemented & Documented

---

## Table of Contents
1. [Epic Overview](#epic-overview)
2. [User Stories](#user-stories)
   - [US-BROWSE.1: View Products by Category](#us-browse1-view-products-by-category)
   - [US-BROWSE.2: Featured Products Display](#us-browse2-featured-products-display)
   - [US-BROWSE.3: Product Card Information Display](#us-browse3-product-card-information-display)
   - [US-BROWSE.4: Product Detail View](#us-browse4-product-detail-view)

---

## Epic Overview

### Description
The Category-Based Product Browsing epic provides users with an intuitive and organized way to discover and explore products available at their selected venue. Users can browse products organized by categories (e.g., Cocktails, Beer, Wine, Spirits, Cannabis, Food), view featured items, see detailed product information on cards, and access comprehensive product detail pages.

### Business Value
- **Improved Product Discovery**: Organized categories make it easy for users to find what they're looking for
- **Enhanced User Experience**: Featured products and detailed information help users make informed decisions
- **Increased Conversion**: Clear presentation of products with pricing, images, and descriptions drives purchases
- **Reduced Confusion**: Category-based organization reduces cognitive load and improves navigation

### Success Metrics
- Category selection rate
- Featured product click-through rate
- Product detail page views
- Add-to-cart conversion rate from browsing
- Average time spent browsing
- Product search success rate

### Components
- `src/components/menu/CategorySelector.tsx`
- `src/components/menu/ProductsGrid.tsx`
- `src/components/menu/FeaturedProductsSection.tsx`
- `src/components/ProductCard.tsx`
- `src/pages/ProductDetail.tsx`
- `src/hooks/useMenuData.ts`
- `src/hooks/useCategoryFilter.ts`
- `src/utils/categoryHelpers.ts`

### Database Tables
- `products`
- `product_categories`

---

## User Stories

### US-BROWSE.1: View Products by Category

**Story Points:** 5  
**Priority:** P1 - High  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user,  
I want to view products organized by category,  
So that I can easily browse and find the type of product I'm interested in.

#### Background
Users need an organized way to explore the menu without being overwhelmed by all available products at once. Category-based browsing allows users to focus on specific types of products (e.g., only viewing cocktails or beer) which improves the shopping experience and reduces decision fatigue.

#### Value Proposition
- Reduces cognitive load by showing only relevant products
- Improves navigation efficiency
- Enhances user satisfaction through organized presentation
- Increases likelihood of purchase by making discovery easier

#### Acceptance Criteria

```gherkin
Feature: View Products by Category
  Epic: CNS-0004 - Category-Based Product Browsing

  Background:
    Given I am a Pours Consumer user
    And I have selected a venue
    And I am on the menu page

  Scenario: Display available product categories
    When the menu page loads
    Then I should see a "Browse Categories" section
    And I should see category buttons for all available categories
    And each category button should display:
      | Element | Details |
      | Icon | Category-specific icon (e.g., Wine glass for Cocktails, Beer mug for Beer) |
      | Name | Category name (e.g., "Cocktails", "Beer", "Wine") |
    And categories should be displayed in a responsive grid layout

  Scenario: Select a category to view products
    Given the menu page has loaded
    When I click on a category button (e.g., "Cocktails")
    Then the category button should be highlighted with a distinct selected state
    And the button should display a yellow background with black text
    And I should see a heading showing the selected category name
    And I should see all products belonging to that category displayed in a grid
    And unselected category buttons should have an outline style

  Scenario: Switch between categories
    Given I have selected the "Beer" category
    When I click on a different category button (e.g., "Wine")
    Then the previously selected category button should return to unselected state
    And the newly selected category button should be highlighted
    And the product grid should update to show only products from the new category
    And the category heading should update to the new category name

  Scenario: Category icons match product types
    When I view the category buttons
    Then each category should display an appropriate icon:
      | Category | Icon |
      | Cocktails | Wine glass icon |
      | Beer | Beer mug icon |
      | Wine | Wine bottle icon |
      | Spirits | Wine glass icon |
      | Cannabis | Leaf icon |
      | Food categories | Utensils icon |
      | Non-Alcoholic | Coffee cup icon |

  Scenario: Default category selection
    When the menu page loads
    Then the first alcohol category (if available) should be automatically selected
    And products from that category should be displayed

  Scenario: Responsive category grid
    When I view the category selector on different screen sizes
    Then the grid layout should adjust:
      | Screen Size | Columns |
      | Mobile | 2 columns |
      | Tablet | 3 columns |
      | Desktop | 4 columns |
      | Large Desktop | 5 columns |
```

#### Definition of Done
- [x] CategorySelector component displays all available product categories
- [x] Each category button shows appropriate icon and name
- [x] Category selection highlights the selected button
- [x] Switching categories updates the product display
- [x] Grid layout is responsive across all device sizes
- [x] Default category is automatically selected on load
- [x] Category-specific icons are correctly mapped
- [x] Selected state styling is visually distinct

---

### US-BROWSE.2: Featured Products Display

**Story Points:** 5  
**Priority:** P1 - High  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user,  
I want to see featured products highlighted at the top of the menu,  
So that I can discover recommended items and special offers.

#### Background
Featured products allow venues to promote specific items, seasonal specials, or new additions. Displaying these prominently helps drive sales and introduces users to products they might not otherwise discover through category browsing.

#### Value Proposition
- Increases visibility of promoted products
- Drives sales of featured items
- Helps users discover new products
- Provides venue partners with promotional tools

#### Acceptance Criteria

```gherkin
Feature: Featured Products Display
  Epic: CNS-0004 - Category-Based Product Browsing

  Background:
    Given I am a Pours Consumer user
    And I have selected a venue
    And I am on the menu page

  Scenario: Display featured products section
    Given there are products marked as featured in the venue
    When the menu page loads
    Then I should see a "Featured Today" section above the category selector
    And the section should have a distinct visual style with:
      | Element | Style |
      | Background | Gradient from yellow to purple with transparency |
      | Border | Yellow border with transparency |
      | Padding | Generous padding around content |
    And the heading should read "Featured Today"
    And the heading should be centered and prominently styled

  Scenario: View featured product cards
    Given the "Featured Today" section is displayed
    When I view the featured products
    Then I should see up to 4 featured products displayed
    And products should be shown in a responsive grid layout
    And each featured product card should display the same information as regular product cards

  Scenario: No featured products available
    Given there are no products marked as featured
    When the menu page loads
    Then the "Featured Today" section should not be displayed
    And I should only see the category selector and regular product grid

  Scenario: Interact with featured products
    Given featured products are displayed
    When I click "Add to Cart" on a featured product
    Then the product should be added to my cart
    And the cart count should update
    When I click on a featured product card (not the button)
    Then I should be navigated to the product detail page

  Scenario: Featured products responsive layout
    When I view the featured products section on different screen sizes
    Then the grid layout should adjust:
      | Screen Size | Columns |
      | Mobile | 1 column |
      | Tablet | 2 columns |
      | Desktop | 4 columns |

  Scenario: Featured products limit
    Given there are more than 4 products marked as featured
    When the menu page loads
    Then only the first 4 featured products should be displayed
    And they should be shown in the order specified by the database
```

#### Definition of Done
- [x] FeaturedProductsSection component displays featured products
- [x] Section has distinct visual styling with gradient background
- [x] Up to 4 featured products are displayed
- [x] Section is hidden when no featured products exist
- [x] Featured products can be added to cart
- [x] Featured products are clickable and navigate to detail page
- [x] Layout is responsive across all device sizes
- [x] Featured section appears above category selector

---

### US-BROWSE.3: Product Card Information Display

**Story Points:** 3  
**Priority:** P1 - High  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user,  
I want to view key product information on each product card,  
So that I can make informed decisions without navigating to the detail page.

#### Background
Product cards serve as the primary browsing interface, allowing users to quickly scan available products. Each card needs to present essential information (name, price, description, alcohol content) in a clear, visually appealing format that facilitates quick decision-making.

#### Value Proposition
- Enables quick comparison between products
- Reduces friction in the browsing experience
- Provides essential information at a glance
- Improves conversion by showing key details upfront

#### Acceptance Criteria

```gherkin
Feature: Product Card Information Display
  Epic: CNS-0004 - Category-Based Product Browsing

  Background:
    Given I am a Pours Consumer user
    And I have selected a venue and category
    And I am viewing products in a grid

  Scenario: View product card layout
    When I view a product card
    Then I should see the following elements in order:
      | Element | Position |
      | Product Image | Top section, aspect ratio preserved |
      | Product Name | Below image, left-aligned |
      | Price | Below image, right-aligned, large and bold |
      | Alcohol By Volume (ABV) Badge | Below name, if alcoholic product |
      | Description | Middle section |
      | Add to Cart Controls | Bottom section |

  Scenario: Display product image
    When I view a product card
    Then I should see:
      | Condition | Display |
      | Product has local image mapping | Mapped local image displayed |
      | Product has image_url | Database image displayed |
      | No image available | Wine glass icon on gradient background |
    And the image should fill the aspect-ratio container
    And the image should have rounded corners
    And the image section should have a gradient background (purple to yellow)

  Scenario: Display product name and price
    When I view a product card
    Then the product name should be displayed in:
      | Property | Value |
      | Font Size | Extra large (text-xl) |
      | Color | White |
      | Font Weight | Bold |
    And the price should be displayed as "$X.XX" format
    And the price should be:
      | Property | Value |
      | Font Size | 2xl |
      | Color | Yellow (#yellow-400) |
      | Font Weight | Bold |

  Scenario: Display alcohol content badge
    Given the product contains alcohol
    When I view a product card
    Then I should see an Alcohol By Volume (ABV) badge displaying "X.X% ABV"
    And the badge should have:
      | Property | Value |
      | Background | Secondary variant |
      | Position | Below product name |
      | Margin | Small margin above (mt-2) |

  Scenario: Display product description
    When I view a product card
    Then I should see the product description
    And the description should be:
      | Property | Value |
      | Color | Gray-300 |
      | Margin Bottom | 4 units |
      | Max Lines | No limit (full description shown) |

  Scenario: Add to cart controls - no items in cart
    Given the product is not in my cart
    When I view the product card
    Then I should see an "Add to Cart" button
    And the button should display:
      | Element | Details |
      | Icon | Plus icon |
      | Text | "Add to Cart" |
      | Background | Yellow (#yellow-400) |
      | Text Color | Black |

  Scenario: Add to cart controls - item in cart
    Given the product is already in my cart
    When I view the product card
    Then I should see quantity controls with:
      | Element | Details |
      | Minus Button | Outline style with yellow border |
      | Quantity Display | White text, bold, large (text-lg) |
      | Plus Button | Yellow background, black text |
    And the current quantity should be displayed between the buttons

  Scenario: Card hover state
    When I hover over a product card
    Then the card border should transition to a yellow glow
    And the card should maintain its dark background with backdrop blur
    And the transition should be smooth (duration-300)

  Scenario: Card click behavior
    When I click on a product card (excluding buttons)
    Then I should be navigated to the product detail page
    And the product ID should be included in the URL
```

#### Definition of Done
- [x] ProductCard component displays all required information
- [x] Image handling works for local images, URLs, and fallback icons
- [x] Name and price are prominently displayed
- [x] Alcohol By Volume (ABV) badge shown only for alcoholic products
- [x] Description is clearly readable
- [x] Add to cart button shown when quantity is 0
- [x] Quantity controls shown when item is in cart
- [x] Card is clickable and navigates to detail page
- [x] Hover effects are smooth and visually appealing
- [x] Card layout is consistent across all instances

---

### US-BROWSE.4: Product Detail View

**Story Points:** 5  
**Priority:** P1 - High  
**Status:** ✅ Implemented

#### Story
As a Pours Consumer user,  
I want to view comprehensive product details on a dedicated page,  
So that I can learn everything about a product before adding it to my cart.

#### Background
While product cards provide essential information, some users need more detailed information before making a purchase decision. The product detail page provides comprehensive information including fine print, allergy information, and larger product images, allowing users to make fully informed choices.

#### Value Proposition
- Reduces purchase uncertainty through complete information
- Builds trust by being transparent about product details
- Addresses allergy and dietary concerns
- Provides legal compliance for fine print disclosure

#### Acceptance Criteria

```gherkin
Feature: Product Detail View
  Epic: CNS-0004 - Category-Based Product Browsing

  Background:
    Given I am a Pours Consumer user
    And I have selected a venue

  Scenario: Navigate to product detail page
    Given I am viewing products in a category
    When I click on a product card
    Then I should be navigated to the product detail page
    And the Uniform Resource Locator (URL) should include the product ID as "/menu/product/:id"
    And the page should load the product details from the database

  Scenario: Display product detail layout
    When I view a product detail page
    Then I should see the following elements:
      | Element | Position |
      | Back to Menu Button | Top left of page |
      | Product Image | Top section, full width |
      | Product Name | Below image, large heading |
      | Price | Next to name, right-aligned |
      | Alcohol By Volume (ABV) Badge | Next to price, if applicable |
      | Description | Below heading |
      | Volume | Below description, if applicable |
      | Start an Order Button | Below product info, full width |
      | Fine Print Collapsible | Below button, if available |
      | Allergy Info Collapsible | Bottom, if available |

  Scenario: Display product header information
    When I view a product detail page
    Then the product name should be displayed as:
      | Property | Value |
      | Font Size | 3xl |
      | Color | White |
      | Font Weight | Bold |
    And the price should be displayed as:
      | Property | Value |
      | Font Size | 3xl |
      | Color | Yellow (#yellow-400) |
      | Font Weight | Bold |
      | Format | "$X.XX" |

  Scenario: Display alcohol content
    Given the product contains alcohol
    When I view the product detail page
    Then I should see an Alcohol By Volume (ABV) badge showing "X.X% ABV"
    And the badge should have:
      | Property | Value |
      | Background | Purple with transparency |
      | Text Color | Purple-200 |
      | Shape | Rounded pill |
      | Position | Next to price |

  Scenario: Display product description and volume
    When I view a product detail page
    Then I should see the full product description in:
      | Property | Value |
      | Font Size | Large (text-lg) |
      | Color | Gray-300 |
      | Line Height | Relaxed |
    And if volume is available, it should display as "XXXml"
    And volume should be shown in gray-400 color

  Scenario: Add product to cart from detail page
    When I click the "START AN ORDER" button
    Then the product should be added to my cart
    And the cart count in the header should update
    And I should receive a toast notification confirming the addition

  Scenario: Navigate back to menu
    When I click the "Back to Menu" button
    Then I should be navigated to the menu page "/menu"
    And my previously selected category should be maintained
    And my cart contents should be preserved

  Scenario: View fine print section
    Given the product has fine print information
    When I view the product detail page
    Then I should see a collapsible section labeled "OUR FINE PRINT"
    And the section should be collapsed by default
    When I click on the fine print header
    Then the section should expand smoothly
    And I should see the fine print text displayed
    And the chevron icon should rotate 180 degrees
    When I click the header again
    Then the section should collapse
    And the chevron should return to original position

  Scenario: View allergy information section
    Given the product has allergy information
    When I view the product detail page
    Then I should see a collapsible section labeled "ALLERGY INFORMATION"
    And the section should be collapsed by default
    When I click on the allergy information header
    Then the section should expand smoothly
    And I should see the allergy information text displayed
    And the chevron icon should rotate 180 degrees

  Scenario: Product not found
    Given I navigate to a product detail page with an invalid product Identifier (ID)
    When the page attempts to load
    Then I should see a "Product not found" message
    And the page should display the error on the gradient background

  Scenario: Product loading state
    Given I navigate to a product detail page
    When the product data is being fetched
    Then I should see a loading indicator displaying "Loading..."
    And the loading indicator should be centered on the page

  Scenario: Product image handling
    When I view a product detail page
    Then the image should be displayed as:
      | Condition | Display |
      | Local image mapping exists | Display mapped local image |
      | Database image_url exists | Display Uniform Resource Locator (URL) image |
      | No image available | Display wine glass icon |
    And the image should fill the aspect-ratio container
    And the image should be full width

  Scenario: Responsive layout on mobile
    When I view the product detail page on mobile
    Then the card should be constrained to max-width 2xl
    And the card should be centered on the page
    And all elements should be full width within the card
    And the back button should remain accessible at the top
```

#### Definition of Done
- [x] ProductDetail page loads product data from database
- [x] All product information is displayed correctly
- [x] Product image handles local images, URLs, and fallback
- [x] Price and name are prominently displayed
- [x] Alcohol By Volume (ABV) badge shown only for alcoholic products
- [x] Volume displayed when available
- [x] "START AN ORDER" button adds product to cart
- [x] Fine print and allergy sections are collapsible
- [x] Back button navigates to menu page
- [x] Loading state shown while fetching data
- [x] Error handling for invalid product IDs
- [x] Responsive layout works on all device sizes
- [x] Smooth animations for collapsible sections

---

## Technical Implementation Notes

### Data Flow
1. **useMenuData Hook**: Fetches categories and products from Supabase
2. **useCategoryFilter Hook**: Manages category selection and product filtering
3. **CategorySelector**: Renders category buttons and handles selection
4. **ProductsGrid**: Displays filtered products for selected category
5. **FeaturedProductsSection**: Shows featured products independently
6. **ProductCard**: Displays individual product information
7. **ProductDetail**: Fetches and displays comprehensive product details

### Database Schema
- **products table**: Stores all product information including images, pricing, descriptions
- **product_categories table**: Stores category definitions and display order
- Products are linked to categories via `category_id` (category identifier) foreign key

### State Management
- Category selection managed by `useCategoryFilter` hook
- Cart state managed by `useCart` hook
- Product data fetched via `useMenuData` hook with automatic refetching

### Styling
- Uses design system tokens for colors (Hue, Saturation, Lightness (HSL) values)
- Gradient backgrounds: purple to yellow theme
- Responsive grid layouts using Tailwind Cascading Style Sheets (CSS)
- Consistent card styling with backdrop blur effects

---

## Dependencies

### Technical Dependencies
- React Router for navigation
- Supabase for data fetching
- Tailwind Cascading Style Sheets (CSS) for styling
- Lucide React for icons
- Shadcn User Interface (UI) components (Card, Button, Badge, Collapsible)

### Feature Dependencies
- **Venue Selection**: Users must select a venue before browsing products
- **Cart Management**: Add to cart functionality depends on cart system
- **Authentication**: Some features may require user authentication

---

## Future Enhancements

1. **Product Filtering**: Add filters for price range, Alcohol By Volume (ABV), dietary restrictions
2. **Product Search**: Text-based search within categories
3. **Product Sorting**: Sort by price, name, popularity, Alcohol By Volume (ABV)
4. **Product Reviews**: Display user ratings and reviews
5. **Product Recommendations**: "Customers also bought" suggestions
6. **Product Variants**: Support for size options or customizations
7. **Stock Availability**: Real-time stock indicators
8. **Product Tags**: Additional tag-based filtering
9. **Product Favorites**: Allow users to save favorite products
10. **Product Sharing**: Share products on social media

---

## Appendix

### Related Documentation
- `docs/requirements/venue-discovery-selection-features.md`
- `docs/requirements/shopping-cart-features.md`
- `docs/requirements/checkout-features.md`

### Component Hierarchy
```
Menu Page
├── VenueSearch (if no venue selected)
├── FeaturedProductsSection
├── CategorySelector
└── ProductsGrid
    └── ProductCard[] (navigates to ProductDetail)
```

### Testing Notes
- Test with various numbers of products (0, 1, 4, 20+)
- Test with products missing images, descriptions, or Alcohol By Volume (ABV)
- Test category selection transitions
- Test responsive layouts on all screen sizes
- Test navigation between menu and product detail pages
- Test collapsible sections on product detail page
- Test add to cart from both card and detail page
