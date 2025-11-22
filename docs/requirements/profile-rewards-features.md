# Profile Rewards - Product Requirements Documentation

## Document Information
- **Document Version**: 1.0
- **Last Updated**: 2025-11-22
- **Epic**: EPIC-PROFILE-005 - Profile Rewards
- **Related Components**: `RewardsSection`, `RewardsBadge`, `RewardsCheckIn`, `ProfileSummary`
- **Database Tables**: `user_rewards`, `points_transactions`, `reward_redemptions`, `rewards`, `reward_tiers`, `referrals`

---

## Executive Summary

The Profile Rewards section enables Pours Consumer users to view and manage their loyalty program participation. Users can track points balance, monitor tier progression, redeem rewards, refer friends, and view complete rewards history. This gamified experience encourages repeat purchases, increases customer lifetime value, and builds brand loyalty through tangible benefits and social engagement.

---

## Epic Definition

### EPIC-PROFILE-005: Profile Rewards

**Epic Description**: As a Pours Consumer user, I need to access and manage my rewards program participation so that I can track my loyalty points, redeem rewards, progress through tiers, refer friends, and maximize the value I receive from being a loyal customer.

**Business Value**:
- Increases customer retention through loyalty incentives
- Drives repeat purchases with points-based rewards
- Encourages higher average order values for tier progression
- Generates new customer acquisition through referrals
- Provides data insights into customer engagement patterns
- Creates emotional connection through gamification
- Differentiates from competitors without loyalty programs

**Success Metrics**:
- Rewards program enrollment: > 90% of users
- Active engagement (check activity): > 60% monthly
- Points redemption rate: > 40% of earned points
- Average tier progression time: 3-6 months to next tier
- Referral conversion rate: > 15%
- Customer retention with rewards: > 75% vs 50% without
- Rewards program NPS: > 70

---

## User Stories

### US-REWARDS.1: View Points Balance and Overview

**Story**: As a Pours Consumer user, I want to view my current points balance, tier status, and rewards summary so that I understand my loyalty program standing and available benefits.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: `user_rewards`, `reward_tiers` tables

#### Acceptance Criteria

```gherkin
Feature: View Points Balance and Overview
  Epic: EPIC-PROFILE-005 - Profile Rewards

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Rewards"

  Scenario: Display current points balance
    Given I have earned 1,250 loyalty points
    When I view the Rewards section
    Then I should see my total points displayed as "1,250 Points"
    And I should see my available points displayed as "1,150 Points"
    And I should see redeemed points as "100 Points Redeemed"
    And the points should be prominently displayed at the top

  Scenario: Display tier status
    Given I am in the "Gold" tier
    When I view the Rewards section
    Then I should see my current tier badge "Gold"
    And the badge should use the gold tier color
    And I should see my tier level indicator

  Scenario: Display tier benefits
    Given I am in the "Gold" tier
    When I view my tier details
    Then I should see my tier benefits:
      | 10% discount on all orders          |
      | Priority order processing           |
      | Exclusive Gold member rewards       |
      | Birthday bonus: 2x points           |
    And benefits should be clearly listed

  Scenario: Progress to next tier
    Given I am in the "Gold" tier with 1,250 points
    And "Platinum" tier requires 2,000 points
    When I view tier progression
    Then I should see "750 points until Platinum"
    And I should see a progress bar at 62.5% filled
    And I should see "Keep earning to unlock Platinum benefits!"

  Scenario: Lifetime spending display
    Given I have spent $1,450 lifetime
    When I view the Rewards section
    Then I should see "Lifetime Spending: $1,450"
    And this should be displayed in the overview card

  Scenario: Anniversary date
    Given my account anniversary is March 15, 2024
    When I view my rewards
    Then I should see "Member Since: Mar 15, 2024"
    And I should see a celebration icon on my anniversary

  Scenario: Points expiration warning
    Given I have 200 points expiring in 30 days
    When I view my rewards
    Then I should see a warning banner
    And the banner should say "200 points expiring on [date]"
    And I should see a "Use Points Now" call-to-action

  Scenario: Empty rewards state
    Given I am a new user with 0 points
    When I view the Rewards section
    Then I should see "Start Earning Rewards!"
    And I should see how to earn points:
      | Make your first purchase    | 50 bonus points  |
      | Check in at venues          | 10 points each   |
      | Refer a friend              | 100 points       |
    And I should see a "Browse Menu" button
```

#### Technical Requirements

**Database Queries**:
```typescript
// Fetch user rewards data
const { data: rewards, error } = await supabase
  .from('user_rewards')
  .select(`
    *,
    reward_tiers (
      name,
      color,
      minimum_points,
      benefits
    )
  `)
  .eq('user_id', user.id)
  .single();

// Calculate points breakdown
const pointsBreakdown = {
  totalPoints: rewards.total_points,
  availablePoints: rewards.available_points,
  redeemedPoints: rewards.total_points - rewards.available_points,
  lifetimeSpent: rewards.lifetime_spent
};

// Get next tier information
const { data: nextTier } = await supabase
  .from('reward_tiers')
  .select('*')
  .gt('minimum_points', rewards.total_points)
  .order('minimum_points', { ascending: true })
  .limit(1)
  .single();

// Calculate progress to next tier
const pointsToNext = nextTier.minimum_points - rewards.total_points;
const progressPercentage = (rewards.total_points / nextTier.minimum_points) * 100;
```

**Tier Color Mapping**:
```typescript
const tierColors = {
  bronze: 'hsl(var(--bronze))',   // Brown/copper
  silver: 'hsl(var(--silver))',   // Silver/gray
  gold: 'hsl(var(--gold))',       // Gold/yellow
  platinum: 'hsl(var(--platinum))' // Platinum/white
};
```

**Points Expiration Logic**:
```typescript
const checkExpiringPoints = async (userId: string) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const { data: expiringPoints } = await supabase
    .from('points_transactions')
    .select('points, created_at')
    .eq('user_id', userId)
    .eq('transaction_type', 'earned')
    .lt('created_at', thirtyDaysFromNow)
    .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)); // 1 year old
  
  return expiringPoints;
};
```

---

### US-REWARDS.2: Earn Points Through Activities

**Story**: As a Pours Consumer user, I want to earn points through various activities (purchases, check-ins, referrals) so that I can accumulate rewards and progress through tiers.

**Priority**: High  
**Story Points**: 8  
**Dependencies**: `points_transactions`, `orders`, `check_ins` tables, Edge Function for point calculation

#### Acceptance Criteria

```gherkin
Feature: Earn Points Through Activities
  Epic: EPIC-PROFILE-005 - Profile Rewards

  Background:
    Given I am logged in as a Pours Consumer user

  Scenario: Earn points from purchase
    Given I complete a $50 order
    And the points rate is 10 points per dollar
    When the order is marked as completed
    Then I should earn 500 points
    And I should see a notification "You earned 500 points!"
    And my points balance should increase by 500
    And a transaction should be recorded with reason "Purchase"

  Scenario: Earn bonus points for first order
    Given I am a new user
    When I complete my first order
    Then I should earn standard purchase points
    And I should earn 50 bonus points for first order
    And I should see "Welcome bonus: 50 points!"

  Scenario: Earn points from venue check-in
    Given I check in at a venue
    When the check-in is confirmed
    Then I should earn 10 points
    And I should see "Check-in reward: 10 points"
    And a transaction should be recorded with reason "Venue check-in"

  Scenario: Earn bonus points on birthday
    Given today is my birthday
    When I make a purchase
    Then I should earn 2x points on the order
    And I should see "Birthday bonus: 2x points!"
    And the transaction should note "Birthday bonus"

  Scenario: Earn bonus points on anniversary
    Given today is my account anniversary
    When I make a purchase
    Then I should earn 1.5x points on the order
    And I should see "Anniversary bonus: 1.5x points!"

  Scenario: Earn points from referral completion
    Given I referred a friend
    When my friend completes their first order
    Then I should earn 100 referral points
    And I should see "Your friend made their first purchase! You earned 100 points"
    And my friend should earn 50 welcome points

  Scenario: Tier multiplier on points
    Given I am in the "Gold" tier
    And Gold tier has a 1.2x points multiplier
    When I earn points from any activity
    Then my points should be multiplied by 1.2
    And the transaction should show the tier bonus

  Scenario: Points notification display
    When I earn points from any activity
    Then I should see an animated notification
    And the notification should show points amount
    And the notification should include a celebration icon
    And my points balance should update in real-time

  Scenario: Maximum points per transaction
    Given there is a maximum of 1,000 points per transaction
    When I complete a $200 order (would earn 2,000 points)
    Then I should earn only 1,000 points
    And I should see "Points earned (max reached): 1,000"
```

#### Technical Requirements

**Points Calculation Edge Function**:
```typescript
// Edge Function: award-loyalty-points
export async function awardLoyaltyPoints(
  userId: string,
  orderId: string,
  orderAmount: number
) {
  const POINTS_PER_DOLLAR = 10;
  const MAX_POINTS_PER_TRANSACTION = 1000;
  
  // Get user rewards info
  const { data: userRewards } = await supabase
    .from('user_rewards')
    .select('*, reward_tiers(name, point_multiplier)')
    .eq('user_id', userId)
    .single();
  
  // Calculate base points
  let points = Math.floor(orderAmount * POINTS_PER_DOLLAR);
  
  // Apply tier multiplier
  const tierMultiplier = userRewards.reward_tiers?.point_multiplier || 1;
  points = Math.floor(points * tierMultiplier);
  
  // Check for birthday bonus
  const today = new Date();
  const birthday = new Date(userRewards.birthday);
  if (today.getMonth() === birthday.getMonth() && 
      today.getDate() === birthday.getDate()) {
    points *= 2;
    metadata.bonus = 'birthday';
  }
  
  // Check for anniversary bonus
  const anniversary = new Date(userRewards.anniversary_date);
  if (today.getMonth() === anniversary.getMonth() && 
      today.getDate() === anniversary.getDate()) {
    points = Math.floor(points * 1.5);
    metadata.bonus = 'anniversary';
  }
  
  // Apply maximum cap
  points = Math.min(points, MAX_POINTS_PER_TRANSACTION);
  
  // Record transaction
  await supabase
    .from('points_transactions')
    .insert({
      user_id: userId,
      points: points,
      transaction_type: 'earned',
      reason: 'Purchase',
      order_id: orderId,
      metadata: { 
        order_amount: orderAmount,
        tier_multiplier: tierMultiplier,
        ...metadata
      }
    });
  
  // Update user rewards
  await supabase
    .from('user_rewards')
    .update({
      total_points: userRewards.total_points + points,
      available_points: userRewards.available_points + points,
      lifetime_spent: userRewards.lifetime_spent + orderAmount
    })
    .eq('user_id', userId);
  
  return { points, metadata };
}
```

**Points Transaction Types**:
```typescript
type TransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted';
type EarnReason = 
  | 'Purchase'
  | 'Venue check-in'
  | 'Referral completed'
  | 'Referral reward'
  | 'First order bonus'
  | 'Birthday bonus'
  | 'Anniversary bonus'
  | 'Admin adjustment';
```

---

### US-REWARDS.3: Redeem Rewards

**Story**: As a Pours Consumer user, I want to redeem my accumulated points for rewards (discounts, free items, exclusive offers) so that I receive tangible value from my loyalty.

**Priority**: High  
**Story Points**: 8  
**Dependencies**: `rewards`, `reward_redemptions` tables

#### Acceptance Criteria

```gherkin
Feature: Redeem Rewards
  Epic: EPIC-PROFILE-005 - Profile Rewards

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Rewards"

  Scenario: View available rewards
    Given I have 1,000 available points
    When I view the rewards catalog
    Then I should see all rewards I can afford
    And each reward should display:
      | Reward Name             |
      | Points Cost             |
      | Reward Type             |
      | Description             |
      | Expiration (if limited) |
      | "Redeem" button         |
    And rewards I cannot afford should be grayed out

  Scenario: Rewards organized by type
    When I view the rewards catalog
    Then rewards should be categorized:
      | Discounts        | $5 off, 10% off, etc.       |
      | Free Items       | Free appetizer, drink       |
      | Exclusive Access | VIP events, early menu      |
      | Venue Specific   | Rewards for specific venues |

  Scenario: Successfully redeem discount reward
    Given I have 500 points
    And there is a "$5 off next order" reward for 500 points
    When I click "Redeem" on the reward
    Then I should see a confirmation dialog
    And the dialog should show the reward details
    And the dialog should show my new points balance
    When I confirm the redemption
    Then 500 points should be deducted
    And I should receive a reward code or coupon
    And I should see "Reward redeemed successfully!"
    And the reward should appear in "My Active Rewards"

  Scenario: Successfully redeem free item reward
    Given I have 800 points
    And there is a "Free IPA" reward for 800 points
    When I redeem the reward
    Then I should receive a voucher code
    And the voucher should have an expiration date (30 days)
    And I should see instructions on how to use it
    And the voucher should appear in my active rewards list

  Scenario: View active (redeemed but unused) rewards
    Given I have redeemed 2 rewards
    And I have not used them yet
    When I view "My Active Rewards"
    Then I should see both rewards listed
    And each should display:
      | Reward Name          |
      | Voucher Code         |
      | Expiration Date      |
      | Usage Instructions   |
      | "Use Now" button     |

  Scenario: Use reward during checkout
    Given I have an active "$5 off" reward
    When I proceed to checkout
    Then I should see my active rewards
    And I should be able to select which reward to apply
    When I select the reward
    Then the discount should be applied to my order
    And the reward should be marked as "used"

  Scenario: Reward expiration
    Given I have a reward that expires tomorrow
    When I view my active rewards
    Then I should see "Expires in 1 day" in red
    And I should receive a notification to use it

  Scenario: Insufficient points
    Given I have 300 points
    And a reward costs 500 points
    When I attempt to redeem it
    Then the "Redeem" button should be disabled
    And I should see "Need 200 more points"

  Scenario: Tier-exclusive rewards
    Given I am in the "Gold" tier
    And there are "Platinum-only" rewards
    When I view the rewards catalog
    Then Platinum rewards should show "Unlock at Platinum tier"
    And they should not be redeemable

  Scenario: Limited availability rewards
    Given there is a reward with only 5 remaining
    When I view the reward
    Then I should see "Only 5 available!"
    And there should be urgency messaging

  Scenario: Venue-specific rewards
    Given there is a reward valid only at "The Beer Garden"
    When I redeem the reward
    Then the voucher should note the venue restriction
    And I should only be able to use it at that venue
```

#### Technical Requirements

**Fetch Available Rewards**:
```typescript
// Get rewards user can redeem
const { data: rewards } = await supabase
  .from('rewards')
  .select(`
    *,
    venues (name),
    reward_tiers (name)
  `)
  .eq('is_active', true)
  .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
  .order('points_cost', { ascending: true });

// Filter by user's tier and points
const userRewards = await supabase
  .from('user_rewards')
  .select('*, reward_tiers(display_order)')
  .eq('user_id', user.id)
  .single();

const affordableRewards = rewards.filter(reward => {
  // Check if user has enough points
  if (reward.points_cost > userRewards.data.available_points) {
    return false;
  }
  
  // Check tier requirement
  if (reward.minimum_tier_id) {
    const rewardTierOrder = reward.reward_tiers.display_order;
    const userTierOrder = userRewards.data.reward_tiers.display_order;
    if (userTierOrder < rewardTierOrder) {
      return false;
    }
  }
  
  // Check availability
  if (reward.max_redemptions && 
      reward.current_redemptions >= reward.max_redemptions) {
    return false;
  }
  
  return true;
});
```

**Redeem Reward**:
```typescript
// Create redemption record
const { data: redemption, error } = await supabase
  .from('reward_redemptions')
  .insert({
    user_id: user.id,
    reward_id: reward.id,
    points_spent: reward.points_cost,
    status: 'pending',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  })
  .select()
  .single();

// Deduct points
await supabase
  .from('user_rewards')
  .update({
    available_points: userRewards.available_points - reward.points_cost
  })
  .eq('user_id', user.id);

// Record transaction
await supabase
  .from('points_transactions')
  .insert({
    user_id: user.id,
    points: -reward.points_cost,
    transaction_type: 'redeemed',
    reason: `Redeemed: ${reward.name}`,
    reward_id: reward.id
  });

// Update reward redemption count
await supabase
  .from('rewards')
  .update({
    current_redemptions: reward.current_redemptions + 1
  })
  .eq('id', reward.id);

// Generate voucher code
const voucherCode = generateVoucherCode(redemption.id);
```

---

### US-REWARDS.4: Track Tier Progression

**Story**: As a Pours Consumer user, I want to see my progress through loyalty tiers and understand tier benefits so that I am motivated to reach the next level.

**Priority**: High  
**Story Points**: 5  
**Dependencies**: `reward_tiers`, `user_rewards` tables

#### Acceptance Criteria

```gherkin
Feature: Track Tier Progression
  Epic: EPIC-PROFILE-005 - Profile Rewards

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Rewards" > "My Tier"

  Scenario: Display all tier levels
    When I view the tier progression page
    Then I should see all tiers displayed:
      | Bronze   | 0 points       |
      | Silver   | 500 points     |
      | Gold     | 1,000 points   |
      | Platinum | 2,000 points   |
    And each tier should show its benefits
    And my current tier should be highlighted

  Scenario: Current tier status
    Given I am in the "Silver" tier with 750 points
    When I view my tier
    Then I should see "Silver Member" prominently
    And I should see a silver tier badge
    And I should see "You've reached Silver!"

  Scenario: Progress to next tier visualization
    Given I am in "Silver" tier with 750 points
    And "Gold" tier requires 1,000 points
    When I view tier progression
    Then I should see a progress bar
    And the bar should be 75% filled
    And I should see "250 points to Gold"
    And I should see an estimated timeline based on spending

  Scenario: Benefits comparison
    Given I am viewing tier progression
    When I expand tier benefits
    Then I should see a comparison table:
      | Benefit                  | Bronze | Silver | Gold | Platinum |
      | Points per $1            | 10     | 12     | 15   | 20       |
      | Birthday bonus           | 1x     | 1.5x   | 2x   | 3x       |
      | Exclusive rewards        | No     | Yes    | Yes  | Yes      |
      | Priority support         | No     | No     | Yes  | Yes      |
      | Free delivery            | No     | No     | No   | Yes      |
    And my current tier should be highlighted

  Scenario: Tier up notification
    Given I just earned enough points to reach "Gold"
    When my points are updated
    Then I should see an animated tier-up celebration
    And I should see "Congratulations! You've reached Gold tier!"
    And I should see the new benefits unlocked
    And I should earn a tier-up bonus (50 points)

  Scenario: Tier maintenance requirements
    Given I am in "Platinum" tier
    When I view tier details
    Then I should see tier maintenance information
    And I should see "Spend $500 per year to maintain Platinum"
    And I should see my progress toward maintenance

  Scenario: Projected next tier date
    Given I spend an average of $100 per month
    And I have 750 points (need 250 more for Gold)
    When I view tier progression
    Then I should see "At your current pace, reach Gold in ~3 months"

  Scenario: Tier downgrade warning
    Given I am at risk of tier downgrade
    And I haven't met maintenance requirements
    When I view my tier
    Then I should see a warning banner
    And the banner should explain downgrade conditions
    And I should see days remaining to meet requirements
```

#### Technical Requirements

**Tier Progression Calculation**:
```typescript
// Get all tiers
const { data: tiers } = await supabase
  .from('reward_tiers')
  .select('*')
  .eq('is_active', true)
  .order('display_order', { ascending: true });

// Get user current tier
const { data: userRewards } = await supabase
  .from('user_rewards')
  .select('*, reward_tiers(*)')
  .eq('user_id', user.id)
  .single();

// Calculate next tier
const currentTierIndex = tiers.findIndex(
  t => t.id === userRewards.reward_tier_id
);
const nextTier = tiers[currentTierIndex + 1];

if (nextTier) {
  const pointsToNext = nextTier.minimum_points - userRewards.total_points;
  const progressPercentage = 
    (userRewards.total_points / nextTier.minimum_points) * 100;
  
  // Estimate time to next tier
  const recentTransactions = await getRecentTransactions(user.id, 90); // 90 days
  const avgPointsPerMonth = calculateAvgPointsPerMonth(recentTransactions);
  const monthsToNextTier = pointsToNext / avgPointsPerMonth;
}
```

**Tier Benefits Structure**:
```typescript
interface TierBenefits {
  pointsMultiplier: number;
  birthdayBonus: number;
  anniversaryBonus: number;
  exclusiveRewards: boolean;
  prioritySupport: boolean;
  freeDelivery: boolean;
  earlyAccess: boolean;
  specialEvents: boolean;
}
```

**Tier Up Logic**:
```typescript
// Check for tier upgrade after points awarded
const checkTierUpgrade = async (userId: string, newPoints: number) => {
  const { data: userRewards } = await supabase
    .from('user_rewards')
    .select('*, reward_tiers(*)')
    .eq('user_id', userId)
    .single();
  
  const { data: higherTiers } = await supabase
    .from('reward_tiers')
    .select('*')
    .gt('minimum_points', userRewards.reward_tiers.minimum_points)
    .lte('minimum_points', newPoints)
    .order('minimum_points', { ascending: false })
    .limit(1);
  
  if (higherTiers && higherTiers.length > 0) {
    const newTier = higherTiers[0];
    
    // Update user tier
    await supabase
      .from('user_rewards')
      .update({ reward_tier_id: newTier.id })
      .eq('user_id', userId);
    
    // Award tier-up bonus
    await awardTierUpBonus(userId, newTier.name);
    
    return { tierUp: true, newTier };
  }
  
  return { tierUp: false };
};
```

---

### US-REWARDS.5: Refer Friends

**Story**: As a Pours Consumer user, I want to refer friends and earn rewards when they sign up and make purchases so that I can share the app with my network and receive benefits.

**Priority**: Medium  
**Story Points**: 8  
**Dependencies**: `referrals`, `user_rewards` tables, unique referral codes

#### Acceptance Criteria

```gherkin
Feature: Refer Friends
  Epic: EPIC-PROFILE-005 - Profile Rewards

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Rewards" > "Refer Friends"

  Scenario: View my referral code
    When I view the referral section
    Then I should see my unique referral code
    And the code should be prominently displayed
    And the code format should be user-friendly (e.g., "JOHN2025")
    And I should see a "Copy Code" button

  Scenario: Share referral via multiple channels
    When I view the referral section
    Then I should see sharing options for:
      | SMS           |
      | Email         |
      | WhatsApp      |
      | Facebook      |
      | Twitter       |
      | Copy Link     |
    And each option should pre-populate a message

  Scenario: Referral message template
    When I click "Share via SMS"
    Then the message should be pre-filled:
      "Hey! Try Pours+ for ordering drinks at your favorite venues. 
       Use my code JOHN2025 for 50 points bonus on your first order! 
       [Download Link]"
    And I should be able to edit the message

  Scenario: Track pending referrals
    Given I have referred 3 friends
    And 1 has signed up but not ordered
    And 2 have not signed up yet
    When I view "My Referrals"
    Then I should see "3 friends invited"
    And I should see "1 signed up (pending first order)"
    And I should see "2 invitations sent"

  Scenario: Friend signs up with my code
    Given my friend uses my referral code
    When they complete signup
    Then they should receive 50 welcome points
    And I should see the referral move to "Pending" status
    And I should receive a notification "Your friend signed up!"

  Scenario: Earn referral reward
    Given my friend signed up with my code
    When they complete their first order
    Then I should earn 100 referral points
    And they should earn an additional 25 bonus points
    And I should see "Your friend made their first purchase! You earned 100 points"
    And the referral status should change to "Completed"

  Scenario: Referral history
    Given I have successfully referred 5 friends
    When I view referral history
    Then I should see each referral listed:
      | Friend Name (optional)  |
      | Sign-up Date           |
      | Status                 |
      | Points Earned          |
    And I should see total referral points earned

  Scenario: Referral leaderboard
    When I view the referral section
    Then I should see a leaderboard
    And the leaderboard should show top referrers (anonymized)
    And I should see my ranking
    And I should see "You've referred more than 60% of users!"

  Scenario: Referral bonus campaigns
    Given there is a 2x referral bonus campaign
    When I refer a friend during the campaign
    And they complete their first order
    Then I should earn 200 points (instead of 100)
    And I should see "Campaign Bonus: 2x Points!"

  Scenario: Referral code entry for new user
    Given I am a new user signing up
    When I reach the referral code field
    Then I should see "Have a referral code?"
    And the field should be optional
    When I enter a valid code
    Then I should see "You'll earn 50 bonus points!"
    When I enter an invalid code
    Then I should see "Invalid referral code"

  Scenario: Cannot refer self
    Given I try to use my own referral code
    When I enter it during signup or purchase
    Then I should see an error "You cannot use your own referral code"
```

#### Technical Requirements

**Referral Code Generation**:
```typescript
// Generate unique referral code
const generateReferralCode = (userId: string, userName: string): string => {
  // Use first name + random numbers
  const firstName = userName.split(' ')[0].toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}${random}`;
};

// Store in user_rewards
await supabase
  .from('user_rewards')
  .update({ referral_code: generateReferralCode(user.id, user.name) })
  .eq('user_id', user.id);
```

**Track Referral**:
```typescript
// When new user signs up with code
const processReferralSignup = async (
  newUserId: string,
  referralCode: string
) => {
  // Find referrer
  const { data: referrer } = await supabase
    .from('user_rewards')
    .select('user_id')
    .eq('referral_code', referralCode)
    .single();
  
  if (!referrer) {
    throw new Error('Invalid referral code');
  }
  
  // Create referral record
  await supabase
    .from('referrals')
    .insert({
      referrer_id: referrer.user_id,
      referred_id: newUserId,
      referral_code: referralCode,
      status: 'pending',
      referrer_points: 100,
      referred_points: 50
    });
  
  // Award welcome bonus to new user
  await awardPoints(newUserId, 50, 'Referral welcome bonus');
};

// When referred user completes first order
const completeReferral = async (referredUserId: string) => {
  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_id', referredUserId)
    .eq('status', 'pending')
    .single();
  
  if (referral) {
    // Award points to referrer
    await awardPoints(
      referral.referrer_id,
      referral.referrer_points,
      'Referral completed'
    );
    
    // Award bonus to referred user
    await awardPoints(
      referredUserId,
      referral.referred_points,
      'Referral reward'
    );
    
    // Update referral status
    await supabase
      .from('referrals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', referral.id);
  }
};
```

**Sharing Integration**:
```typescript
const shareOptions = {
  sms: `sms:?body=${encodeURIComponent(message)}`,
  email: `mailto:?subject=Join Pours+&body=${encodeURIComponent(message)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
  copyLink: () => navigator.clipboard.writeText(url)
};
```

---

### US-REWARDS.6: View Rewards History

**Story**: As a Pours Consumer user, I want to view my complete rewards history including points earned, redeemed, and expired so that I can track my loyalty program activity.

**Priority**: Medium  
**Story Points**: 5  
**Dependencies**: `points_transactions`, `reward_redemptions` tables

#### Acceptance Criteria

```gherkin
Feature: View Rewards History
  Epic: EPIC-PROFILE-005 - Profile Rewards

  Background:
    Given I am logged in as a Pours Consumer user
    And I navigate to "Rewards" > "History"

  Scenario: Display complete transaction history
    Given I have 50 points transactions
    When I view rewards history
    Then I should see all transactions listed chronologically
    And the most recent transactions should appear first
    And each transaction should display:
      | Date                    |
      | Transaction Type        | (Earned/Redeemed/Expired)
      | Points Amount           |
      | Description/Reason      |
      | Running Balance         |

  Scenario: Filter by transaction type
    Given I have earned, redeemed, and expired transactions
    When I filter by "Earned"
    Then I should see only point-earning transactions
    When I filter by "Redeemed"
    Then I should see only point-redemption transactions
    When I filter by "Expired"
    Then I should see only point-expiration transactions

  Scenario: Filter by date range
    When I select "Last 30 days"
    Then I should see only transactions from the past 30 days
    When I select "This Year"
    Then I should see only transactions from the current year
    When I select a custom date range
    Then I should see transactions within that range

  Scenario: View transaction details
    Given I click on a transaction
    Then I should see detailed information:
      | Full Date and Time      |
      | Transaction ID          |
      | Points Amount           |
      | Transaction Type        |
      | Description             |
      | Order Number (if any)   |
      | Reward Name (if any)    |
      | Metadata                |

  Scenario: Points earned breakdown
    When I view "Points Earned" summary
    Then I should see breakdown by source:
      | Purchases       | 5,200 points |
      | Check-ins       | 150 points   |
      | Referrals       | 300 points   |
      | Bonuses         | 150 points   |
      | Total Earned    | 5,800 points |

  Scenario: Points redeemed breakdown
    When I view "Points Redeemed" summary
    Then I should see breakdown by reward type:
      | Discounts       | 1,500 points |
      | Free Items      | 800 points   |
      | Total Redeemed  | 2,300 points |

  Scenario: Monthly points chart
    When I view the rewards history dashboard
    Then I should see a chart showing points earned per month
    And the chart should show the last 12 months
    And I should see trend lines for earning patterns

  Scenario: Export rewards history
    When I click "Export History"
    Then I should receive a CSV file
    And the file should include:
      | Date, Type, Amount, Description, Balance |
    And the filename should be "rewards-history-[date].csv"

  Scenario: Empty history state
    Given I have never earned or redeemed points
    When I view rewards history
    Then I should see "No rewards activity yet"
    And I should see suggestions to earn points
```

#### Technical Requirements

**Fetch Rewards History**:
```typescript
// Get all points transactions
const { data: transactions } = await supabase
  .from('points_transactions')
  .select(`
    *,
    orders (id, total_amount, created_at),
    rewards (name, reward_type)
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(offset, offset + 49); // Pagination

// Calculate running balance
let runningBalance = 0;
const transactionsWithBalance = transactions.map(t => {
  runningBalance += t.points;
  return {
    ...t,
    runningBalance
  };
}).reverse(); // Reverse to show oldest first for balance calc, then flip again
```

**Points Breakdown**:
```typescript
const calculatePointsBreakdown = async (userId: string) => {
  const { data: transactions } = await supabase
    .from('points_transactions')
    .select('points, reason, transaction_type')
    .eq('user_id', userId);
  
  const breakdown = {
    earned: {
      purchases: 0,
      checkIns: 0,
      referrals: 0,
      bonuses: 0
    },
    redeemed: {
      discounts: 0,
      freeItems: 0,
      exclusive: 0
    },
    expired: 0
  };
  
  transactions.forEach(t => {
    if (t.transaction_type === 'earned') {
      if (t.reason.includes('Purchase')) breakdown.earned.purchases += t.points;
      else if (t.reason.includes('check-in')) breakdown.earned.checkIns += t.points;
      else if (t.reason.includes('Referral')) breakdown.earned.referrals += t.points;
      else breakdown.earned.bonuses += t.points;
    } else if (t.transaction_type === 'redeemed') {
      // Categorize by reward type
      // Would need to join with rewards table
    } else if (t.transaction_type === 'expired') {
      breakdown.expired += Math.abs(t.points);
    }
  });
  
  return breakdown;
};
```

---

## Non-Functional Requirements

### Performance
- Rewards page load time: < 2 seconds
- Points update latency: < 1 second after transaction
- Redemption processing time: < 2 seconds
- Referral code generation: < 500ms

### Scalability
- Support unlimited transactions per user
- Handle concurrent redemptions
- Efficient indexing on user_id and timestamps
- Pagination for large transaction histories

### Gamification
- Animated points notifications
- Celebration animations for tier-ups
- Visual progress indicators
- Achievement badges
- Sound effects for rewards (optional)

### Usability
- Mobile-responsive design
- Clear tier benefits comparison
- Intuitive redemption flow
- Easy social sharing for referrals
- Accessible to screen readers

### Data Integrity
- Points balance must always be accurate
- Transaction history immutable
- Redemption codes unique and secure
- Referral tracking accurate

---

## Technical Architecture

### Component Structure
```
RewardsSection (Container)
├── PageHeader
├── Tabs
│   ├── Overview
│   ├── Rewards Catalog
│   ├── My Tier
│   ├── Refer Friends
│   └── History
├── OverviewTab
│   ├── PointsBalanceCard
│   │   ├── TotalPoints
│   │   ├── AvailablePoints
│   │   └── ExpiringPointsAlert
│   ├── TierStatusCard
│   │   ├── CurrentTierBadge
│   │   ├── TierBenefitsList
│   │   └── ProgressToNextTier
│   └── QuickActionsCard
│       ├── RedeemButton
│       ├── ReferButton
│       └── CheckInButton
├── RewardsCatalogTab
│   ├── FilterBar
│   │   ├── TypeFilter
│   │   └── VenueFilter
│   └── RewardsGrid
│       └── RewardCard[]
│           ├── RewardImage
│           ├── RewardName
│           ├── PointsCost
│           ├── Description
│           └── RedeemButton
├── MyTierTab
│   ├── CurrentTierDisplay
│   ├── TierProgressBar
│   ├── NextTierPreview
│   └── TierComparisonTable
├── ReferFriendsTab
│   ├── ReferralCodeDisplay
│   ├── ShareButtons
│   ├── ReferralStats
│   └── ReferralHistory
└── HistoryTab
    ├── FilterBar
    ├── TransactionsList
    └── PointsBreakdownChart
```

### State Management
- **useRewards**: Hook for user rewards data
- **usePoints**: Hook for points balance and transactions
- **useTiers**: Hook for tier information and progression
- **useReferrals**: Hook for referral tracking
- **useRewardsCatalog**: Hook for available rewards

### Real-time Updates
```typescript
// Subscribe to points updates
const subscription = supabase
  .channel('rewards-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_rewards',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      handleRewardsUpdate(payload.new);
    }
  )
  .subscribe();
```

---

## Success Metrics & KPIs

### Engagement Metrics
- Active rewards users: > 60% monthly
- Points redemption rate: > 40%
- Referral participation: > 25% of users
- Tier progression rate: > 30% advance annually

### Business Metrics
- Customer lifetime value increase: > 35%
- Repeat purchase rate: > 75% with rewards vs 50% without
- Average order value increase: > 20% for tier members
- Referral conversion rate: > 15%

### User Satisfaction
- Rewards program NPS: > 70
- Feature satisfaction: > 4.5/5
- Tier benefits clarity: > 4.3/5

---

## Traceability Matrix

| User Story | Epic | Scenarios | Test Cases | Components |
|-----------|------|-----------|------------|------------|
| US-REWARDS.1 | EPIC-PROFILE-005 | 8 | TC-REW-001 to TC-REW-008 | RewardsOverview |
| US-REWARDS.2 | EPIC-PROFILE-005 | 9 | TC-REW-009 to TC-REW-017 | Points earning logic |
| US-REWARDS.3 | EPIC-PROFILE-005 | 11 | TC-REW-018 to TC-REW-028 | RewardsCatalog, Redemption |
| US-REWARDS.4 | EPIC-PROFILE-005 | 8 | TC-REW-029 to TC-REW-036 | TierProgression |
| US-REWARDS.5 | EPIC-PROFILE-005 | 10 | TC-REW-037 to TC-REW-046 | ReferralSystem |
| US-REWARDS.6 | EPIC-PROFILE-005 | 9 | TC-REW-047 to TC-REW-055 | RewardsHistory |

---

## Future Enhancements

### Phase 2 Enhancements
- **Challenges**: Complete specific challenges for bonus points
- **Badges**: Collectible achievement badges
- **Streaks**: Daily visit streaks for bonus points
- **Social Features**: Share achievements with friends
- **Partner Rewards**: Rewards from partner brands

### Phase 3 Enhancements
- **Gamification**: Mini-games for points
- **NFT Rewards**: Digital collectibles as rewards
- **Cryptocurrency**: Redeem points for crypto
- **Charity Donations**: Donate points to charity
- **Marketplace**: Trade rewards with other users

---

## Compliance & Privacy

### Data Privacy
- Points balance viewable only by owner
- Transaction history private
- Referral data anonymized in leaderboards
- Export capability for GDPR compliance

### Financial Compliance
- Points have no cash value (terms of service)
- Clear expiration policies
- Non-transferable between accounts
- Fraud detection and prevention

---

## Appendix

### Related Documentation
- [Account Dashboard Features](./account-dashboard-features.md)
- [Order History Features](./order-history-features.md)
- [Manage Profile Features](./manage-profile-features.md)

### Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial documentation created |

---

**Document Status**: Approved  
**Last Review Date**: 2025-11-22  
**Next Review Date**: 2026-02-22
