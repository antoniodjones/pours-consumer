# Pours+ Consumer App - Comprehensive Features & Epics Map

**Document Version:** 1.0  
**Last Updated:** 2025-11-22  
**Application:** Pours Consumer (pours-consumer)

---

## Table of Contents
1. [Feature Area: Authentication & User Management](#1-feature-area-authentication--user-management)
2. [Feature Area: Venue Discovery & Selection](#2-feature-area-venue-discovery--selection)
3. [Feature Area: Product Discovery & Ordering](#3-feature-area-product-discovery--ordering)
4. [Feature Area: Customer Profile Management](#4-feature-area-customer-profile-management)
5. [Feature Area: Loyalty & Rewards Program](#5-feature-area-loyalty--rewards-program)
6. [Feature Area: Health & Safety](#6-feature-area-health--safety)
7. [Feature Area: Order Management](#7-feature-area-order-management)
8. [Feature Area: Payment Processing](#8-feature-area-payment-processing)
9. [Feature Area: Security & Compliance](#9-feature-area-security--compliance)

---

## 1. Feature Area: Authentication & User Management

### Feature 1.1: Core Authentication
**Description:** User registration, sign-in, and session management

#### Epic 1.1.1: Core Authentication & User Management
- **Epic ID:** EPIC-1 (formerly EPIC-AUTH-001)
- **Status:** Implemented (Baseline)
- **Priority:** P0 - Critical

**User Stories:**
- US-1.1: User Registration with OTP ✅
- US-1.2: User Sign-In with OTP ✅
- US-1.3: Profile Creation on Registration ✅
- US-1.4: Demo Session Support ✅
- US-1.5: Email Validation ✅
- US-1.6: Password Reset via OTP ✅

**Planned Enhancements:**
- US-1.11: Passkey Authentication (Future)
- US-1.12: SMS/Phone OTP Authentication (Future)
- US-1.13: Social OAuth (Google, Apple, Facebook) (Future)

---

## 2. Feature Area: Venue Discovery & Selection

### Feature 2.1: Venue Search & Discovery
**Description:** Finding and exploring nearby venues

#### Epic 2.1.1: Venue Search & Discovery
- **Epic ID:** EPIC-2 (formerly EPIC-VENUE-001)
- **Status:** Implemented
- **Priority:** P1 - High

**User Stories:**
- US-VS.1: Text-Based Venue Search ✅
- US-VS.2: Near Me Location-Based Search ✅
- US-VS.3: Display Venue Information ✅
- US-VS.4: Venue List with Ratings ✅

#### Epic 2.1.2: Selected Venue Management
- **Epic ID:** EPIC-3 (formerly EPIC-VENUE-002)
- **Status:** Implemented
- **Priority:** P1 - High

**User Stories:**
- US-VS.5: Explicit Venue Selection ✅
- US-VS.6: Venue Change with Cart Warning ✅
- US-VS.7: Venue Persistence Across Sessions ✅
- US-VS.8: Change Venue Toggle Button ✅
- US-VS.9: Smooth Venue Search Collapse Animation ✅

---

## 3. Feature Area: Product Discovery & Ordering

### Feature 3.1: Product Browsing
**Description:** Category-based product navigation

#### Epic 3.1.1: Category-Based Product Browsing
- **Epic ID:** EPIC-4
- **Status:** Implemented
- **Priority:** P1 - High

**User Stories:**
- US-BROWSE.1: View Products by Category ✅
- US-BROWSE.2: Featured Products Display ✅
- US-BROWSE.3: Product Card Information ✅
- US-BROWSE.4: Product Detail View ✅

### Feature 3.2: Product Search & Filtering
**Description:** Advanced product discovery through search and filters

#### Epic 3.2.1: Text-Based Product Search
- **Epic ID:** EPIC-5 (formerly EPIC-001 in product-search-features.md)
- **Status:** Planned
- **Priority:** P1 - Must Have
- **Target Release:** v1.2

**User Stories:**
- US-001: Search Products by Name (5 points)
- US-002: Search Products by Description (3 points)

#### Epic 3.2.2: Advanced Filtering
- **Epic ID:** EPIC-6 (formerly EPIC-002 in product-search-features.md)
- **Status:** Planned
- **Priority:** P2 - Should Have
- **Target Release:** v1.2

**User Stories:**
- US-003: Filter Products by Tags (5 points)
- US-004: Filter Products by Price Range (5 points)
- US-005: Filter Products by ABV (3 points)

#### Epic 3.2.3: Sort Options
- **Epic ID:** EPIC-7 (formerly EPIC-003 in product-search-features.md)
- **Status:** Planned
- **Priority:** P2 - Should Have
- **Target Release:** v1.2

**User Stories:**
- US-006: Sort Products (Price, Name, ABV) (3 points)

### Feature 3.3: Shopping Cart & Checkout
**Description:** Cart management and order placement

#### Epic 3.3.1: Shopping Cart Management
- **Epic ID:** EPIC-8
- **Status:** Implemented
- **Priority:** P1 - High

**User Stories:**
- US-CART.1: Add Products to Cart ✅
- US-CART.2: Update Cart Item Quantities ✅
- US-CART.3: Remove Items from Cart ✅
- US-CART.4: View Cart Summary ✅
- US-CART.5: Cart Persistence ✅
- US-CART.6: Abandoned Cart Recovery ✅

#### Epic 3.3.2: Checkout Process
- **Epic ID:** EPIC-9
- **Status:** Implemented
- **Priority:** P1 - High

**User Stories:**
- US-CHECKOUT.1: Guest Checkout ✅
- US-CHECKOUT.2: Authenticated User Checkout ✅
- US-CHECKOUT.3: Order Special Instructions ✅
- US-CHECKOUT.4: Payment Processing ✅
- US-CHECKOUT.5: Order Confirmation ✅

---

## 4. Feature Area: Customer Profile Management

### Feature 4.1: Account Dashboard
**Description:** Analytics and insights dashboard

#### Epic 4.1.1: Customer Financial & Biometric Analytics Dashboard
- **Epic ID:** EPIC-PROFILE-001
- **Status:** Implemented
- **Priority:** High
- **Target Release:** Sprint 5

**User Stories:**
- US-DASH.1: View Monthly Spending Trends (8 points) ✅
- US-DASH.2: View Order Volume Trends (5 points) ✅
- US-DASH.3: View Biometric Activity & BAC Trends (13 points) ✅
- US-DASH.4: View Summary Statistics Cards (5 points) ✅
- US-DASH.5: Tab Navigation Between Chart Views (3 points) ✅
- US-DASH.6: Responsive Dashboard Layout (5 points) ✅
- US-DASH.7: Loading and Error States (5 points) ✅

### Feature 4.2: Profile Management
**Description:** Personal information and contact details management

#### Epic 4.2.1: Manage Profile
- **Epic ID:** EPIC-PROFILE-002
- **Status:** Implemented
- **Priority:** High

**User Stories:**
- US-PROFILE.1: Edit Personal Information (5 points) ✅
- US-PROFILE.2: Manage Address Information (5 points) ✅
- US-PROFILE.3: Manage Contact Details (8 points) ✅
- US-PROFILE.4: Upload and Manage Avatar (5 points) ✅
- US-PROFILE.5: View Profile Summary (3 points) ✅

### Feature 4.3: Order History
**Description:** View and manage past orders

#### Epic 4.3.1: Order History Management
- **Epic ID:** EPIC-PROFILE-003
- **Status:** Implemented
- **Priority:** High

**User Stories:**
- US-ORDER.1: View Complete Order History (5 points) ✅
- US-ORDER.2: Filter Orders by Status (3 points) ✅
- US-ORDER.3: Search Orders (5 points) ✅
- US-ORDER.4: Sort Orders (3 points) ✅
- US-ORDER.5: View Detailed Order Information (8 points) ✅
- US-ORDER.6: Track Order Status in Real-Time (8 points) ✅
- US-ORDER.7: Reorder Previous Orders (5 points) ✅
- US-ORDER.8: Download Order Receipt (3 points) ✅

### Feature 4.4: Payment Methods
**Description:** Secure payment method management

#### Epic 4.4.1: Manage Payments
- **Epic ID:** EPIC-PROFILE-004
- **Status:** Planned
- **Priority:** High
- **Dependencies:** Stripe Integration

**User Stories:**
- US-PAYMENT.1: Add New Payment Method (8 points)
- US-PAYMENT.2: View Saved Payment Methods (5 points)
- US-PAYMENT.3: Remove Payment Method (3 points)
- US-PAYMENT.4: Set Default Payment Method (3 points)
- US-PAYMENT.5: Update Card Expiration (3 points)
- US-PAYMENT.6: View Payment History (5 points)
- US-PAYMENT.7: Handle Expired Cards (3 points)

### Feature 4.5: Security Settings
**Description:** Password and account security management

#### Epic 4.5.1: Password & Security Management
- **Epic ID:** EPIC-PROFILE-007
- **Status:** Planned
- **Priority:** High

**User Stories:**
- US-PASSWORD.1: Update Password (5 points)
- US-PASSWORD.2: Password Strength Validation (3 points)
- US-PASSWORD.3: Security Checks & Verification (5 points)
- US-PASSWORD.4: Password History (5 points)
- US-PASSWORD.5: Two-Factor Authentication Setup (8 points)
- US-PASSWORD.6: Manage Trusted Devices (5 points)
- US-PASSWORD.7: Security Alerts & Notifications (3 points)

---

## 5. Feature Area: Loyalty & Rewards Program

### Feature 5.1: Rewards Management
**Description:** Loyalty points, tiers, and reward redemption

#### Epic 5.1.1: Profile Rewards
- **Epic ID:** EPIC-PROFILE-005
- **Status:** Implemented
- **Priority:** High

**User Stories:**
- US-REWARDS.1: View Points Balance and Overview (5 points) ✅
- US-REWARDS.2: Earn Points Through Activities (8 points) ✅
- US-REWARDS.3: Redeem Rewards (8 points) ✅
- US-REWARDS.4: View Tier Progression (5 points) ✅
- US-REWARDS.5: Check-In at Venues (3 points) ✅
- US-REWARDS.6: Refer Friends (8 points) ✅
- US-REWARDS.7: View Points Transaction History (5 points) ✅
- US-REWARDS.8: Manage Referral Code (3 points) ✅

---

## 6. Feature Area: Health & Safety

### Feature 6.1: Biometric Monitoring
**Description:** Biometric authentication and health monitoring

#### Epic 6.1.1: Biometric Settings
- **Epic ID:** EPIC-PROFILE-006
- **Status:** Planned (Requires React Native)
- **Priority:** Medium
- **Dependencies:** React Native, Native Mobile APIs

**User Stories:**
- US-BIOMETRIC.1: Enable Biometric Authentication (8 points)
- US-BIOMETRIC.2: Manage Biometric Devices (5 points)
- US-BIOMETRIC.3: Configure Biometric Security Preferences (5 points)
- US-BIOMETRIC.4: Setup Biometric Health Monitoring (8 points)
- US-BIOMETRIC.5: Track Biometric Readings (5 points)
- US-BIOMETRIC.6: View Biometric Dashboard (8 points)
- US-BIOMETRIC.7: Integrate Health Kit / Google Fit (13 points)

#### Epic 6.1.2: Sobriety Monitoring
- **Epic ID:** EPIC-10
- **Status:** Implemented
- **Priority:** High

**User Stories:**
- US-SOBRIETY.1: Start Drinking Session ✅
- US-SOBRIETY.2: Track BAC in Real-Time ✅
- US-SOBRIETY.3: Receive Sobriety Alerts ✅
- US-SOBRIETY.4: View Sobriety Dashboard ✅
- US-SOBRIETY.5: End Drinking Session ✅

---

## 7. Feature Area: Order Management

### Feature 7.1: Order Tracking
**Description:** Real-time order status and tracking

#### Epic 7.1.1: Real-Time Order Tracking
- **Epic ID:** EPIC-11
- **Status:** Implemented
- **Priority:** High

**User Stories:**
- US-TRACK.1: View Order Status Timeline ✅
- US-TRACK.2: Real-Time Status Updates ✅
- US-TRACK.3: Estimated Preparation Time ✅
- US-TRACK.4: Order Ready Notifications ✅

---

## 8. Feature Area: Payment Processing

### Feature 8.1: Payment Integration
**Description:** Stripe payment processing

#### Epic 8.1.1: Stripe Payment Integration
- **Epic ID:** EPIC-12
- **Status:** Planned
- **Priority:** High
- **Dependencies:** Stripe Secret Key

**User Stories:**
- US-STRIPE.1: Configure Stripe Integration
- US-STRIPE.2: Process One-Time Payments
- US-STRIPE.3: Handle Payment Success
- US-STRIPE.4: Handle Payment Failure
- US-STRIPE.5: Refund Processing

---

## 9. Feature Area: Security & Compliance

### Feature 9.1: Data Privacy & Compliance
**Description:** GDPR, CCPA, PCI compliance

#### Epic 9.1.1: Privacy & Compliance
- **Epic ID:** EPIC-13
- **Status:** Implemented
- **Priority:** High

**User Stories:**
- US-PRIVACY.1: Cookie Consent Management ✅
- US-PRIVACY.2: Data Export ✅
- US-PRIVACY.3: Data Deletion Request ✅
- US-PRIVACY.4: Security Audit Log ✅
- US-PRIVACY.5: Privacy Policy Display ✅
- US-PRIVACY.6: Compliance Dashboard ✅

---

## Summary Statistics

### By Feature Area
| Feature Area | Total Epics | Implemented | Planned |
|-------------|-------------|-------------|---------|
| Authentication & User Management | 1 | 1 | 0 |
| Venue Discovery & Selection | 2 | 2 | 0 |
| Product Discovery & Ordering | 5 | 2 | 3 |
| Customer Profile Management | 5 | 3 | 2 |
| Loyalty & Rewards Program | 1 | 1 | 0 |
| Health & Safety | 2 | 1 | 1 |
| Order Management | 1 | 1 | 0 |
| Payment Processing | 1 | 0 | 1 |
| Security & Compliance | 1 | 1 | 0 |
| **TOTAL** | **19** | **12** | **7** |

### By Priority
- **P0 - Critical:** 1 epic
- **P1 - High:** 13 epics
- **P2 - Should Have:** 3 epics
- **P3 - Nice to Have:** 2 epics

### By Status
- **✅ Implemented:** 12 epics (63%)
- **🔄 In Progress:** 0 epics
- **📋 Planned:** 7 epics (37%)

### Story Points Summary
- **Completed:** ~200 story points
- **Planned:** ~150 story points
- **Total:** ~350 story points

---

## Next Steps

1. **Review Product Search Implementation** (US-001 to US-006)
   - Implement text-based search component
   - Add tag filtering functionality
   - Implement price and ABV filters
   - Add sort options

2. **Complete Payment Management** (EPIC-PROFILE-004)
   - Enable Stripe integration
   - Implement payment method management
   - Add payment history

3. **Implement Security Features** (EPIC-PROFILE-007)
   - Password management enhancements
   - Two-factor authentication
   - Security alerts

4. **Native Mobile Features** (EPIC-PROFILE-006)
   - Biometric authentication (requires React Native)
   - Health monitoring integration

---

## Document Maintenance

This document should be updated when:
- New epics are created
- User stories are added or modified
- Implementation status changes
- Priorities are adjusted
- New feature areas are identified

**Last Review Date:** 2025-11-22  
**Next Review Date:** 2025-12-06  
**Document Owner:** Product Management
