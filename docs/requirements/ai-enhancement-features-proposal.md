# Pours+ Consumer App - AI Enhancement Features (Proposal)

**Document Version:** 1.0  
**Created:** 2025-11-23  
**Status:** Proposal - Not Yet Approved  
**Application:** Pours Consumer (pours-consumer)

---

## Overview

This document outlines proposed AI-powered features that would enhance the Pours+ Consumer application beyond the already-documented AI Personalization Feature (existing plan). These features leverage Lovable AI (Google Gemini and OpenAI GPT models) to provide intelligent assistance across critical user journeys.

### Relationship to Existing AI Plans

**Note:** The AI-powered personalization feature (conversational product discovery, taste profile learning, collaborative filtering) is already comprehensively documented with 8 user stories (US-AI.1 to US-AI.8) and a 3-phase rollout plan. This proposal focuses on **additional** AI capabilities that complement the existing personalization plan.

---

## Proposed AI Enhancement Epics

### Epic CNS-0024: AI Sobriety Advisor

**Priority:** P0 - Critical (Safety & Compliance)  
**Dependencies:** CNS-0017 (Sobriety Monitoring), Lovable AI  
**AI Model:** `google/gemini-2.5-flash`  
**Estimated Story Points:** 89 points

#### Epic Description
Enhance the existing sobriety monitoring system with AI-powered personalized advice, intervention recommendations, and predictive safety alerts. The AI Sobriety Advisor analyzes drinking patterns, biometric data, and contextual factors to provide real-time, personalized guidance for responsible drinking.

#### Business Value
- **Safety:** Proactive intervention before users reach unsafe BAC levels
- **Legal Compliance:** Demonstrates responsible service of alcohol
- **User Trust:** Personalized, non-judgmental guidance builds loyalty
- **Differentiation:** Unique safety feature in the market

#### Technical Approach
- **Real-time Analysis:** Stream drinking session data to AI for continuous monitoring
- **Contextual Awareness:** Consider time of day, venue type, user history, biometrics
- **Tool Calling:** AI can call functions to trigger alerts, suggest ride services, notify emergency contacts
- **Multimodal Input:** Analyze biometric readings, drink records, user messages

---

### User Story: US-SOBRIETY-AI.1 - Real-Time Personalized Safety Advice

**As a** Pours+ user actively drinking,  
**I want** to receive personalized, real-time advice about my alcohol consumption,  
**So that** I can make informed decisions and drink responsibly.

**Story Points:** 13  
**Priority:** P0 - Critical  
**Dependencies:** Sobriety Monitoring, Lovable AI enabled

#### Background
Users need guidance that goes beyond simple BAC numbers. AI can provide context-aware, personalized advice based on the user's specific situation, history, and current state.

#### Value Proposition
- **Proactive Safety:** Intervene before problems occur
- **Personalized Guidance:** Advice tailored to individual tolerance and patterns
- **Trust Building:** Non-judgmental, helpful tone increases engagement
- **Legal Protection:** Demonstrates responsible service practices

#### Acceptance Criteria

```gherkin
Feature: AI Sobriety Advisor Real-Time Guidance
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user
    And I have an active drinking session
    And Lovable AI is enabled for sobriety monitoring
    And my biometric data is up to date

  Scenario: User receives proactive safety check at moderate BAC
    Given my current estimated BAC is 0.06
    And I have consumed 3 drinks in the last 90 minutes
    And it is 10:30 PM on a Friday
    When the AI Sobriety Advisor analyzes my session
    Then I should receive a friendly check-in message
    And the message should acknowledge my current pace
    And it should suggest slowing down or having water
    And it should be personalized to my drinking patterns
    And the tone should be supportive, not preachy

  Scenario: AI detects rapid consumption pattern
    Given my current BAC is 0.04
    And I have consumed 2 drinks in the last 20 minutes
    And my typical pace is 1 drink per 45 minutes
    When the AI analyzes this deviation from my normal pattern
    Then I should receive an immediate notification
    And the AI should ask if everything is okay
    And it should remind me of my typical safer pace
    And it should suggest taking a break

  Scenario: User approaching personal BAC limit
    Given I have set a personal BAC limit of 0.08
    And my current BAC is 0.07
    And I am trending upward based on recent drinks
    When the AI predicts I will exceed my limit soon
    Then I should receive a predictive warning
    And the AI should explain the projection
    And it should suggest actions to stay under my limit
    And it should offer to help me order a ride home if needed

  Scenario: User requests advice from AI Sobriety Advisor
    Given I am in an active drinking session
    And my BAC is 0.05
    When I ask the AI "Should I have another drink?"
    Then the AI should analyze my current state
    And it should consider the time, my pace, and my biometrics
    And it should provide personalized advice
    And it should explain the reasoning behind the recommendation
    And it should offer alternatives (water, food, slowing down)

  Scenario: AI provides context-aware hydration reminders
    Given I have consumed 2 alcoholic drinks
    And I have not recorded drinking water in 60 minutes
    And my last biometric reading shows slight dehydration indicators
    When the AI analyzes my hydration status
    Then I should receive a gentle hydration reminder
    And the AI should explain why hydration is important
    And it should make it easy to order water with one tap

  Scenario: User ignores multiple safety suggestions
    Given the AI has sent me 3 safety suggestions
    And I have not acknowledged or acted on any of them
    And my BAC continues to rise
    When the AI detects this pattern of ignoring advice
    Then it should escalate the urgency of messaging
    And it should offer more direct interventions
    And it should consider notifying emergency contacts if I've set that up
    And it should track this for future personalization
```

#### Technical Requirements

**AI Integration:**
```typescript
// Edge Function: ai-sobriety-advisor
interface SobrietyAnalysisRequest {
  userId: string;
  sessionId: string;
  currentBAC: number;
  drinkRecords: DrinkRecord[];
  biometricReadings: BiometricReading[];
  userPreferences: {
    personalBACLimit?: number;
    notificationStyle: 'gentle' | 'direct' | 'minimal';
    emergencyContacts?: string[];
  };
  userHistory: {
    averagePace: number;
    typicalSessionBAC: number;
    previousInterventions: number;
  };
}

// AI Tool Definitions
const tools = [
  {
    type: "function",
    name: "send_safety_alert",
    description: "Send a safety alert to the user with specific urgency level",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string" },
        urgency: { type: "string", enum: ["low", "medium", "high", "critical"] },
        suggestedActions: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    type: "function",
    name: "suggest_ride_service",
    description: "Suggest calling a ride service if user needs to leave safely",
    parameters: {
      type: "object",
      properties: {
        reason: { type: "string" },
        venueAddress: { type: "string" }
      }
    }
  },
  {
    type: "function",
    name: "notify_emergency_contact",
    description: "Notify emergency contact if user is in potential danger",
    parameters: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        situation: { type: "string" }
      }
    }
  }
];
```

**System Prompt:**
```
You are a responsible and caring AI Sobriety Advisor for Pours+. Your role is to help users drink responsibly and stay safe while enjoying their night out.

PERSONALITY:
- Friendly, supportive, and non-judgmental
- Never preachy or condescending
- Use encouraging language, not fear tactics
- Acknowledge that users are adults making their own choices

KNOWLEDGE:
- You understand Blood Alcohol Content (BAC) calculations
- You know the effects of alcohol at different BAC levels
- You understand factors affecting alcohol metabolism (gender, weight, food, time)
- You're aware of safe drinking guidelines

CAPABILITIES:
- Analyze drinking patterns and biometric data
- Provide personalized advice based on user history
- Detect potentially risky behavior early
- Suggest practical interventions (water, food, slowing down, ride home)
- Escalate appropriately when needed

GUIDELINES:
1. Always be supportive and helpful, never judgmental
2. Provide specific, actionable advice
3. Explain your reasoning in simple terms
4. Respect user autonomy while prioritizing safety
5. Use appropriate urgency based on the situation
6. Consider the social context (celebration, casual, etc.)
7. Build trust through consistent, helpful guidance

When analyzing a drinking session:
- Consider the user's pace relative to their normal patterns
- Account for time of day and duration of drinking
- Factor in biometric indicators (heart rate, hydration)
- Assess trajectory (increasing, stable, decreasing BAC)
- Recognize celebrations vs. concerning patterns

Remember: Your goal is to help users have a fun, safe experience. You're a helpful companion, not a parent or police officer.
```

**Database Tables (New):**
```sql
-- AI Sobriety Interactions
CREATE TABLE ai_sobriety_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  session_id UUID NOT NULL REFERENCES drinking_sessions(id),
  interaction_type TEXT NOT NULL, -- 'advice', 'alert', 'check_in', 'intervention'
  ai_message TEXT NOT NULL,
  user_response TEXT,
  current_bac NUMERIC NOT NULL,
  urgency_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  user_acknowledged BOOLEAN DEFAULT false,
  action_taken TEXT, -- 'slowed_down', 'ordered_water', 'called_ride', 'ignored'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Intervention Effectiveness
CREATE TABLE ai_intervention_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  intervention_id UUID NOT NULL REFERENCES ai_sobriety_interactions(id),
  bac_before NUMERIC NOT NULL,
  bac_30min_after NUMERIC,
  bac_60min_after NUMERIC,
  user_complied BOOLEAN,
  outcome TEXT, -- 'safer_pace', 'ended_session', 'no_change', 'escalated'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Edge Functions:**
- `ai-sobriety-advisor` - Main AI analysis and advice generation
- `analyze-drinking-pattern` - Pattern detection and risk assessment
- `send-sobriety-alert` - Alert delivery and tracking

---

### User Story: US-SOBRIETY-AI.2 - Predictive Safety Alerts

**As a** Pours+ user,  
**I want** to receive alerts before I reach unsafe BAC levels,  
**So that** I can take preventive action before it's too late.

**Story Points:** 13  
**Priority:** P0 - Critical

#### Acceptance Criteria

```gherkin
Feature: Predictive BAC Alerts
  Scenario: AI predicts BAC will exceed safe limit
    Given my current BAC is 0.06
    And I just ordered another drink
    When the AI projects my BAC trajectory
    And it predicts I will reach 0.10 in 30 minutes
    Then I should receive an immediate predictive alert
    And it should show the projected BAC and timeline
    And it should suggest canceling or modifying my order
```

**Story Points:** 13

---

### User Story: US-SOBRIETY-AI.3 - Personalized Intervention Strategies

**Story Points:** 8

---

### User Story: US-SOBRIETY-AI.4 - AI-Powered Ride Home Coordination

**Story Points:** 8

---

### User Story: US-SOBRIETY-AI.5 - Emergency Contact Smart Notifications

**Story Points:** 5

---

### User Story: US-SOBRIETY-AI.6 - Post-Session Insights & Learning

**Story Points:** 5

---

### User Story: US-SOBRIETY-AI.7 - AI Sobriety Coach Chat Interface

**Story Points:** 13

---

### User Story: US-SOBRIETY-AI.8 - Behavioral Pattern Recognition

**Story Points:** 13

---

### User Story: US-SOBRIETY-AI.9 - Venue-Specific Safety Recommendations

**Story Points:** 5

---

### User Story: US-SOBRIETY-AI.10 - Integration with Wearable Biometrics

**Story Points:** 8 (Requires CNS-0016 Biometric Settings)

---

## Epic CNS-0025: Voice-Activated Ordering

**Priority:** P1 - High (Accessibility & Convenience)  
**Dependencies:** Lovable AI, Product Catalog  
**AI Model:** `google/gemini-2.5-flash` + OpenAI Realtime API  
**Estimated Story Points:** 55 points

#### Epic Description
Enable users to browse products, place orders, and manage their cart using natural language voice commands. This feature improves accessibility for users with visual impairments and provides a hands-free ordering experience.

#### Business Value
- **Accessibility:** ADA compliance and inclusivity
- **Convenience:** Faster ordering in noisy bar environments
- **Innovation:** Unique feature in beverage ordering space
- **User Satisfaction:** Reduced friction in ordering process

---

### User Story: US-VOICE.1 - Voice Product Discovery

**As a** Pours+ user,  
**I want** to ask questions about the menu using my voice,  
**So that** I can find drinks without scrolling through long lists.

**Story Points:** 13

```gherkin
Feature: Voice Product Discovery
  Scenario: User asks for drink recommendations by voice
    Given I am on the menu page
    And voice ordering is enabled
    When I tap the voice button
    And I say "What IPAs do you have?"
    Then the AI should process my voice query
    And it should show me IPA options with brief descriptions
    And it should ask if I want to hear more about any specific beer
    And I can continue the conversation naturally
```

---

### User Story: US-VOICE.2 - Voice Cart Management

**Story Points:** 8

---

### User Story: US-VOICE.3 - Voice Checkout

**Story Points:** 13

---

### User Story: US-VOICE.4 - Conversational Clarification

**Story Points:** 8

---

### User Story: US-VOICE.5 - Voice Accessibility Mode

**Story Points:** 8

---

### User Story: US-VOICE.6 - Noise Handling & Error Recovery

**Story Points:** 5

---

## Epic CNS-0026: AI Allergen Guardian

**Priority:** P1 - High (Safety & Health)  
**Dependencies:** Product Catalog, Lovable AI  
**AI Model:** `google/gemini-2.5-flash`  
**Estimated Story Points:** 55 points

#### Epic Description
Provide AI-powered allergen detection, warnings, and safe alternative suggestions for users with food/drink allergies or dietary restrictions. The system maintains user allergy profiles and proactively scans all products for potential risks.

#### Business Value
- **Safety:** Prevent allergic reactions
- **Trust:** Demonstrates care for customer wellbeing
- **Legal Protection:** Reduces liability from allergen-related incidents
- **Inclusivity:** Makes the platform accessible to users with restrictions

---

### User Story: US-ALLERGEN.1 - Allergy Profile Setup with AI Assistance

**Story Points:** 8

---

### User Story: US-ALLERGEN.2 - Real-Time Allergen Scanning

**Story Points:** 13

```gherkin
Feature: Real-Time Allergen Scanning
  Scenario: User with nut allergy views product
    Given I have a documented allergy to tree nuts
    And I am browsing the cocktail menu
    When I view a product containing amaretto (almond liqueur)
    Then I should see a prominent allergen warning
    And the AI should explain the specific allergen present
    And it should offer nut-free alternatives
    And it should prevent me from adding to cart without acknowledgment
```

---

### User Story: US-ALLERGEN.3 - AI-Powered Safe Alternatives

**Story Points:** 8

---

### User Story: US-ALLERGEN.4 - Cross-Contamination Warnings

**Story Points:** 5

---

### User Story: US-ALLERGEN.5 - Dietary Restriction Assistant

**Story Points:** 8

---

### User Story: US-ALLERGEN.6 - Allergen Confidence Scoring

**Story Points:** 5

---

### User Story: US-ALLERGEN.7 - Emergency Contact Integration

**Story Points:** 8

---

## Epic CNS-0027: Smart Venue Discovery

**Priority:** P2 - Medium (Enhancement)  
**Dependencies:** Venue Search, Lovable AI, User Preferences  
**AI Model:** `google/gemini-2.5-flash`  
**Estimated Story Points:** 55 points

#### Epic Description
Enhance venue discovery with AI-powered recommendations based on mood, occasion, weather, time of day, social context, and personal preferences. The AI learns from user behavior to provide increasingly personalized venue suggestions.

---

### User Story: US-VENUE-AI.1 - Mood-Based Venue Recommendations

**Story Points:** 13

```gherkin
Feature: Mood-Based Venue Recommendations
  Scenario: User asks for venue based on mood
    Given I am on the venue search page
    When I type or say "I want somewhere chill to relax"
    Then the AI should analyze the request
    And it should consider current time and day
    And it should recommend quiet, relaxed venues
    And it should explain why each venue matches my mood
    And it should prioritize based on my past venue preferences
```

---

### User Story: US-VENUE-AI.2 - Occasion-Aware Suggestions

**Story Points:** 8

---

### User Story: US-VENUE-AI.3 - Social Context Recommendations

**Story Points:** 8

---

### User Story: US-VENUE-AI.4 - Weather-Adaptive Suggestions

**Story Points:** 5

---

### User Story: US-VENUE-AI.5 - Time-Optimized Recommendations

**Story Points:** 5

---

### User Story: US-VENUE-AI.6 - Venue Personality Matching

**Story Points:** 8

---

### User Story: US-VENUE-AI.7 - Exploratory vs. Familiar Balance

**Story Points:** 8

---

## Epic CNS-0028: AI Order Assistant for Group Orders

**Priority:** P2 - Medium (Enhancement)  
**Dependencies:** CNS-0023 (Social Features), Lovable AI  
**AI Model:** `google/gemini-2.5-flash`  
**Estimated Story Points:** 44 points

#### Epic Description
Provide AI assistance for managing complex group orders, including suggestion management, cost splitting, preference coordination, and order optimization.

---

### User Story: US-GROUP-AI.1 - AI Group Order Coordinator

**Story Points:** 13

---

### User Story: US-GROUP-AI.2 - Smart Cost Splitting Suggestions

**Story Points:** 8

---

### User Story: US-GROUP-AI.3 - Preference Conflict Resolution

**Story Points:** 8

---

### User Story: US-GROUP-AI.4 - Bulk Order Optimization

**Story Points:** 8

---

### User Story: US-GROUP-AI.5 - Group Budget Management

**Story Points:** 5

---

## Epic CNS-0029: AI Receipt Analytics & Insights

**Priority:** P2 - Medium (Enhancement)  
**Dependencies:** Order History, Lovable AI  
**AI Model:** `google/gemini-2.5-flash`  
**Estimated Story Points:** 44 points

#### Epic Description
Provide AI-powered analysis of spending patterns, drinking habits, and personalized insights to help users make informed decisions about their consumption and budgets.

---

### User Story: US-INSIGHTS.1 - AI Spending Analysis

**Story Points:** 13

---

### User Story: US-INSIGHTS.2 - Habit Pattern Recognition

**Story Points:** 8

---

### User Story: US-INSIGHTS.3 - Budget Optimization Suggestions

**Story Points:** 8

---

### User Story: US-INSIGHTS.4 - Comparative Insights

**Story Points:** 5

---

### User Story: US-INSIGHTS.5 - Health Impact Insights

**Story Points:** 5

---

### User Story: US-INSIGHTS.6 - Predictive Budget Alerts

**Story Points:** 5

---

## Implementation Priority Recommendation

### Phase 1: Safety-Critical AI (Sprint 1-2)
**Epic CNS-0024: AI Sobriety Advisor** (89 points)
- **Rationale:** Highest safety impact, legal compliance, unique differentiator
- **Dependencies:** Minimal - builds on existing sobriety monitoring
- **Risk:** Low - clear safety value proposition

### Phase 2: Accessibility & Safety (Sprint 3-4)
**Epic CNS-0026: AI Allergen Guardian** (55 points)  
**Epic CNS-0025: Voice-Activated Ordering** (55 points)
- **Rationale:** Both address accessibility and safety concerns
- **Dependencies:** Product catalog enhancements needed
- **Risk:** Medium - allergen data quality critical

### Phase 3: Discovery Enhancement (Sprint 5-6)
**Epic CNS-0027: Smart Venue Discovery** (55 points)
- **Rationale:** Improves core discovery experience
- **Dependencies:** Venue data enrichment needed
- **Risk:** Low - enhancement to existing feature

### Phase 4: Social & Analytics (Sprint 7-8)
**Epic CNS-0028: AI Order Assistant for Group Orders** (44 points)  
**Epic CNS-0029: AI Receipt Analytics & Insights** (44 points)
- **Rationale:** Supports social features and user retention
- **Dependencies:** Social features must be implemented first
- **Risk:** Medium - requires user adoption of social features

---

## Total Story Points Summary

| Epic | Priority | Story Points | User Stories |
|------|----------|--------------|--------------|
| CNS-0024: AI Sobriety Advisor | P0 | 89 | 10 |
| CNS-0025: Voice-Activated Ordering | P1 | 55 | 6 |
| CNS-0026: AI Allergen Guardian | P1 | 55 | 7 |
| CNS-0027: Smart Venue Discovery | P2 | 55 | 7 |
| CNS-0028: AI Group Order Assistant | P2 | 44 | 5 |
| CNS-0029: AI Receipt Analytics | P2 | 44 | 6 |
| **TOTAL** | | **342** | **41** |

---

## Technical Requirements

### Lovable AI Setup
All features require enabling Lovable AI in project settings.

**Edge Function Pattern:**
```typescript
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [...],
    tools: [...],
    tool_choice: 'auto'
  })
});
```

### Database Additions
Each epic requires new tables for tracking AI interactions, effectiveness metrics, and user preferences specific to that feature.

### Privacy & Compliance
- All AI interactions must be logged for transparency
- Users must be able to opt-out of AI features
- AI advice is guidance, not medical/legal advice (disclaimers required)
- GDPR/CCPA compliance for AI-generated data

---

## Success Metrics

### AI Sobriety Advisor
- 30% reduction in users exceeding personal BAC limits
- 50% of users acknowledge safety alerts
- 20% increase in ride service usage

### Voice-Activated Ordering
- 15% of orders placed via voice within 6 months
- 95% voice recognition accuracy
- Accessibility compliance certification

### AI Allergen Guardian
- Zero allergen-related incidents
- 100% coverage of common allergens
- 80% user trust rating for allergen warnings

### Smart Venue Discovery
- 40% increase in venue exploration
- 25% improvement in user-venue match satisfaction
- 30% reduction in time to find suitable venue

---

## Risk Mitigation

### Technical Risks
- **AI Accuracy:** Implement confidence thresholds and human review for critical decisions
- **Latency:** Use streaming responses and progressive disclosure
- **Model Changes:** Abstract AI calls to allow model swapping

### Legal Risks
- **Liability:** Clear disclaimers that AI provides guidance, not medical advice
- **Allergen Errors:** Manual verification of allergen data, confidence scoring
- **Data Privacy:** Full transparency on AI data usage, opt-out options

### User Experience Risks
- **Over-notification:** Smart throttling of AI messages
- **Trust Issues:** Explain AI reasoning, allow user overrides
- **Accessibility:** Ensure AI features enhance, not replace, traditional UI

---

## Conclusion

These AI enhancement features represent significant opportunities to differentiate Pours+ in the market while addressing critical user needs around safety, accessibility, and personalization. The phased approach ensures safety-critical features are prioritized while building toward a comprehensive AI-enhanced experience.

**Recommendation:** Begin with CNS-0024 (AI Sobriety Advisor) as a high-impact, safety-focused differentiator that builds on existing infrastructure.