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

**As a** Pours+ user showing risky drinking patterns,  
**I want** the AI to suggest personalized intervention strategies based on my behavior and preferences,  
**So that** I can receive help that actually works for me.

**Story Points:** 8  
**Priority:** P0 - Critical

#### Acceptance Criteria

```gherkin
Feature: Personalized Intervention Strategies
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user with drinking history
    And the AI has learned my patterns and preferences
    And I am in an active drinking session

  Scenario: AI suggests personalized intervention for stress drinking
    Given my historical data shows I drink faster when stressed
    And my current pace is 50% faster than my typical rate
    And it is a weekday evening
    When the AI analyzes my current session context
    Then it should recognize this as a stress-drinking pattern
    And it should ask if I'm having a stressful day
    And it should suggest specific coping strategies I've used before
    And it should recommend activities I enjoy (e.g., "Want to play a game of pool instead?")
    And the tone should be empathetic and supportive

  Scenario: AI adapts intervention style based on user response history
    Given I have previously responded well to direct, factual advice
    And I have dismissed gentle suggestions 80% of the time
    When the AI needs to intervene about my rising BAC
    Then it should use a direct, data-driven approach
    And it should show me charts or numbers
    And it should avoid overly emotional language
    And it should provide clear action steps

  Scenario: AI suggests social intervention for group drinking
    Given I am drinking with friends (based on group order data)
    And my pace is matching the fastest drinker in the group
    And my typical solo pace is much slower
    When the AI detects peer influence
    Then it should suggest ordering food for the table
    Or suggest a group activity that doesn't involve drinking
    And it should frame suggestions as fun social activities
    And it should avoid making me feel singled out

  Scenario: AI offers distraction-based interventions
    Given my intervention preference is set to "distraction"
    And my BAC is approaching 0.08
    When the AI needs to slow my consumption
    Then it should suggest venue activities (live music, games, etc.)
    And it should recommend food items I've ordered before
    And it should make positive suggestions rather than warnings
    And it should track which distractions work best for me
```

---

### User Story: US-SOBRIETY-AI.4 - AI-Powered Ride Home Coordination

**As a** Pours+ user who has exceeded safe drinking limits,  
**I want** the AI to help me coordinate a safe ride home,  
**So that** I don't have to worry about getting home safely when impaired.

**Story Points:** 8  
**Priority:** P0 - Critical

#### Acceptance Criteria

```gherkin
Feature: AI Ride Home Coordination
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user
    And I am in an active drinking session at a venue
    And my BAC is above safe driving limits

  Scenario: AI proactively suggests ride when BAC exceeds safe driving limit
    Given my current BAC is 0.09
    And I drove to the venue (based on profile or check-in data)
    When the AI detects I am above the legal driving limit
    Then I should receive a notification about ride options
    And the AI should explain why driving is unsafe at my BAC level
    And it should offer to help arrange a ride
    And it should remember my preferred ride service

  Scenario: User requests help getting home
    Given I am at a venue with BAC of 0.10
    When I ask the AI "How should I get home?"
    Then the AI should confirm I should not drive
    And it should ask for my preferred ride service (Uber, Lyft, taxi, friend)
    And it should offer to contact a friend if I prefer
    And it should provide estimated wait time and cost
    And it should offer to set a reminder to retrieve my car tomorrow

  Scenario: AI coordinates friend pickup with estimated timing
    Given I prefer rides from friends over ride services
    And my emergency contacts include "Pick me up" preferences
    When I accept the AI's suggestion to call a friend
    Then the AI should provide my current location to share
    And it should estimate my readiness time (e.g., "ready in 15 minutes")
    And it should draft a message I can send
    And it should set a reminder to check if my friend confirmed

  Scenario: AI handles ride service integration
    Given ride service integration is enabled
    And my BAC is 0.11
    When I accept the AI's ride suggestion
    Then the AI should initiate the ride request
    And it should pre-fill pickup location (venue address)
    And it should suggest home address from my profile
    And it should notify me of estimated arrival time
    And it should send a copy of ride details to emergency contact

  Scenario: AI tracks safe arrival home
    Given I have accepted a ride home
    And the ride was arranged through the AI
    When the ride is completed
    Then the AI should send a check-in message
    And it should ask if I arrived safely
    And it should close my drinking session automatically
    And it should log this for future pattern analysis
```

---

### User Story: US-SOBRIETY-AI.5 - Emergency Contact Smart Notifications

**As a** concerned friend or family member listed as an emergency contact,  
**I want** to be notified if the user reaches dangerous consumption levels,  
**So that** I can check on them or help if needed.

**Story Points:** 5  
**Priority:** P0 - Critical

#### Acceptance Criteria

```gherkin
Feature: Emergency Contact Smart Notifications
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given a Pours+ user has configured emergency contacts
    And emergency contact notification settings are enabled
    And the AI is monitoring their drinking session

  Scenario: AI notifies emergency contact at critical BAC level
    Given the user's BAC reaches 0.15
    And they have ignored 3 previous safety interventions
    And their emergency contact has opted in to critical alerts
    When the AI determines the situation is critical
    Then it should send a notification to the emergency contact
    And the notification should include the user's name, location, and BAC level
    And it should request the contact to check in on the user
    And it should include the venue's contact information
    And it should respect the user's privacy settings

  Scenario: User manually requests emergency contact notification
    Given the user feels unsafe or unwell
    And their BAC is 0.12
    When the user asks the AI to "notify my emergency contact"
    Then the AI should immediately alert the designated contact
    And it should explain that the user requested help
    And it should share the user's exact location
    And it should offer to call emergency services if needed
    And it should keep the contact updated on the situation

  Scenario: AI escalates to multiple contacts if unresponsive
    Given the user's BAC is 0.16
    And the primary emergency contact was notified 30 minutes ago
    And the user has not responded to AI check-ins
    When the primary contact hasn't acknowledged or responded
    Then the AI should escalate to the secondary contact
    And it should explain the urgency and timeline
    And it should provide the primary contact's response status
    And it should consider suggesting emergency services

  Scenario: Emergency contact acknowledges and takes action
    Given an emergency contact received a critical alert
    When they acknowledge the notification
    Then the AI should ask how they plan to help
    And it should offer to provide additional information
    And it should update the user that their contact is aware
    And it should log the intervention outcome for learning
```

---

### User Story: US-SOBRIETY-AI.6 - Post-Session Insights & Learning

**As a** Pours+ user after a drinking session,  
**I want** to receive insights about my drinking patterns and behavior,  
**So that** I can learn from my experiences and make better choices.

**Story Points:** 5  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Post-Session Insights and Learning
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user
    And I have completed a drinking session
    And the session has been closed for at least 2 hours

  Scenario: User receives morning-after session summary
    Given my drinking session ended at 11:30 PM last night
    And it is now 9:00 AM the next day
    When I open the Pours+ app
    Then I should see a session summary notification
    And it should show my total drinks, peak BAC, and session duration
    And it should highlight positive choices I made
    And it should note any safety interventions that helped
    And it should be presented in a non-judgmental, educational tone

  Scenario: AI identifies pattern of Thursday night heavy drinking
    Given I have completed 4 Thursday evening sessions in the last month
    And my average Thursday BAC is 30% higher than other weekdays
    When the AI analyzes my session history
    Then it should identify this Thursday pattern
    And it should ask if there's a specific reason (stress, social tradition)
    And it should suggest strategies for healthier Thursday habits
    And it should track if patterns change after awareness

  Scenario: User compares session to personal averages
    Given I want to understand if my last session was typical
    When I view my session insights
    Then I should see how this session compares to my averages
    And it should show metrics like pace, total consumption, and duration
    And it should highlight what was different (faster/slower, more/less)
    And it should explain contextual factors (e.g., venue type, day of week)

  Scenario: AI celebrates improved responsible drinking behaviors
    Given my last 3 sessions showed lower peak BAC than my 3-month average
    And I responded positively to 90% of AI interventions
    When I view my insights dashboard
    Then the AI should recognize and celebrate this improvement
    And it should specifically mention what strategies worked
    And it should encourage continued progress
    And it should offer to set new personal goals
```

---

### User Story: US-SOBRIETY-AI.7 - AI Sobriety Coach Chat Interface

**As a** Pours+ user,  
**I want** to chat with the AI about my drinking in real-time,  
**So that** I can get immediate answers and support whenever I need it.

**Story Points:** 13  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: AI Sobriety Coach Chat Interface
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user
    And I have access to the AI Sobriety Coach
    And the chat interface is available in the app

  Scenario: User starts conversation with AI during drinking session
    Given I am in an active drinking session
    And my current BAC is 0.05
    When I open the AI Sobriety Coach chat
    And I ask "Am I good to have another drink?"
    Then the AI should acknowledge my question
    And it should analyze my current state and pace
    And it should provide a personalized recommendation
    And it should explain the reasoning (e.g., pace, trajectory, time)
    And it should offer alternatives if suggesting I slow down

  Scenario: AI provides contextual BAC education
    Given I am chatting with the AI coach
    When I ask "What does 0.08 BAC actually mean?"
    Then the AI should explain BAC in simple terms
    And it should relate it to my specific body metrics
    And it should describe typical effects at different levels
    And it should clarify legal limits for driving
    And it should emphasize individual variation

  Scenario: User seeks advice on handling peer pressure
    Given I am with friends who are drinking heavily
    And I want to slow down but feel social pressure
    When I tell the AI "My friends keep ordering shots for me"
    Then the AI should validate my desire to slow down
    And it should suggest tactful ways to decline
    And it should offer conversation strategies
    And it should remind me it's okay to set boundaries
    And the tone should be supportive and empowering

  Scenario: AI chat history persists and learns
    Given I have had multiple conversations with the AI coach
    When I start a new chat session
    Then the AI should remember previous conversations
    And it should reference past concerns or goals I mentioned
    And it should track topics I ask about frequently
    And it should adapt its teaching style based on what worked before

  Scenario: User asks planning questions before going out
    Given I am planning to go out drinking tonight
    And I am not yet at a venue
    When I ask the AI "How can I drink responsibly tonight?"
    Then the AI should ask about my plans (duration, venue, social context)
    And it should suggest strategies like eating first, pacing, setting limits
    And it should offer to send me reminders during the session
    And it should help me set a personal BAC limit for the night
```

---

### User Story: US-SOBRIETY-AI.8 - Behavioral Pattern Recognition

**As a** Pours+ power user,  
**I want** the AI to detect long-term behavioral patterns in my drinking,  
**So that** I can understand deeper trends and make meaningful changes.

**Story Points:** 13  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: AI Behavioral Pattern Recognition
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user with at least 3 months of history
    And the AI has access to my drinking sessions, venues, and contexts
    And behavioral pattern analysis is enabled

  Scenario: AI detects escalating consumption trend
    Given my average drinks per session has increased by 40% over 2 months
    And my session frequency has also increased
    When the AI analyzes my 90-day trend
    Then it should flag this escalation pattern
    And it should present the data visually
    And it should ask if I'm aware of this trend
    And it should explore possible causes (stress, life changes)
    And it should offer resources or suggest speaking to someone

  Scenario: AI recognizes seasonal drinking patterns
    Given my data shows higher consumption during summer months
    And this pattern has repeated over 2 years
    When summer approaches again
    Then the AI should proactively mention this seasonal pattern
    And it should ask if I want to set different goals for summer
    And it should suggest strategies that worked in previous summers
    And it should offer to send more frequent check-ins

  Scenario: AI identifies trigger venues or social contexts
    Given I consistently drink more heavily at a specific venue
    And my BAC averages 0.09 at "Bar A" vs. 0.05 at other venues
    When the AI detects I've checked in to "Bar A"
    Then it should acknowledge this pattern
    And it should ask if I'm aware I tend to drink more here
    And it should suggest setting a specific limit for today
    And it should offer closer monitoring for this session

  Scenario: AI detects correlation between emotions and drinking
    Given I tend to drink faster when my biometrics show stress indicators
    And I've logged feeling stressed on heavy drinking days
    When the AI identifies this emotion-drinking correlation
    Then it should gently point out this connection
    And it should suggest healthier stress-management alternatives
    And it should ask if I'd like reminders when stress is detected
    And it should track if awareness reduces stress-drinking

  Scenario: AI recognizes positive behavioral changes
    Given I used to drink 4+ drinks per session regularly
    And over the last 2 months I've averaged 2-3 drinks
    And I've been using AI suggestions consistently
    When the AI analyzes this positive trend
    Then it should celebrate this improvement
    And it should identify which strategies were most effective
    And it should ask what motivated the change
    And it should offer to help maintain these new habits
```

---

### User Story: US-SOBRIETY-AI.9 - Venue-Specific Safety Recommendations

**As a** Pours+ user at different types of venues,  
**I want** safety advice tailored to the specific venue environment,  
**So that** I receive relevant guidance for my current situation.

**Story Points:** 5  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Venue-Specific Safety Recommendations
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user
    And I have checked in to a specific venue
    And the AI has data about venue characteristics

  Scenario: AI provides advice for high-volume nightclub environment
    Given I am at a loud, crowded nightclub venue
    And the venue is known for strong cocktails
    When the AI provides safety guidance
    Then it should warn about drinks potentially being stronger than expected
    And it should remind me to keep my drink in sight
    And it should suggest hydrating more due to dancing/heat
    And it should note that loud environments make BAC harder to self-assess

  Scenario: AI adjusts advice for outdoor beer garden setting
    Given I am at an outdoor venue on a hot day
    And the temperature is above 85°F
    When the AI monitors my session
    Then it should remind me that heat increases alcohol effects
    And it should suggest alternating with water more frequently
    And it should warn about sun exposure and dehydration
    And it should recommend food to slow absorption

  Scenario: AI recognizes sports bar game-day patterns
    Given I am at a sports bar during a major game
    And the venue has a history of heavy drinking during games
    When the AI provides recommendations
    Then it should acknowledge the exciting social context
    And it should suggest pacing strategies for multi-hour games
    And it should recommend food timing (halftime, between periods)
    And it should help me set a reasonable limit for the event
```

---

### User Story: US-SOBRIETY-AI.10 - Integration with Wearable Biometrics

**As a** Pours+ user with a fitness tracker or smartwatch,  
**I want** the AI to use my real-time biometric data for more accurate advice,  
**So that** I receive hyper-personalized safety recommendations.

**Story Points:** 8  
**Priority:** P2 - Medium  
**Dependencies:** CNS-0016 (Biometric Settings)

#### Acceptance Criteria

```gherkin
Feature: Wearable Biometric Integration
  Epic: AI Sobriety Advisor (CNS-0024)

  Background:
    Given I am a registered Pours+ user
    And I have connected my wearable device (Apple Watch, Fitbit, etc.)
    And biometric data sharing is enabled
    And I am in an active drinking session

  Scenario: AI detects elevated heart rate during drinking
    Given my wearable shows my heart rate is 15% above my baseline
    And I have consumed 2 drinks in the last hour
    When the AI analyzes my biometric data
    Then it should note the elevated heart rate
    And it should ask if I'm feeling okay or experiencing anxiety
    And it should suggest slowing down or taking a break
    And it should recommend hydration and deep breathing

  Scenario: AI uses hydration indicators for personalized reminders
    Given my wearable tracks hydration levels
    And my hydration is below optimal range
    And I am drinking alcohol
    When the AI reviews my biometric status
    Then it should send more frequent water reminders
    And it should explain the compounding dehydration risk
    And it should suggest specific water intake amounts
    And it should track my water consumption for the session

  Scenario: AI correlates sleep quality with alcohol tolerance
    Given my wearable tracked poor sleep last night (4 hours)
    And I am drinking this evening
    When the AI considers my current state
    Then it should warn that alcohol tolerance is lower when sleep-deprived
    And it should suggest drinking slower than usual
    And it should lower my recommended BAC limit for the session
    And it should be extra vigilant with safety check-ins

  Scenario: AI uses blood oxygen levels for safety monitoring
    Given my wearable provides SpO2 (blood oxygen) readings
    And my oxygen saturation drops below 95% during drinking
    When the AI detects this anomaly
    Then it should immediately alert me
    And it should ask if I'm feeling short of breath or dizzy
    And it should strongly recommend stopping alcohol consumption
    And it should suggest seeking medical attention if symptoms persist
    And it should notify emergency contact if I don't respond
```

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

**As a** Pours+ user,  
**I want** to manage my cart using voice commands,  
**So that** I can add, remove, or modify items hands-free.

**Story Points:** 8  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Voice Cart Management
  Epic: Voice-Activated Ordering (CNS-0025)

  Background:
    Given I am a registered Pours+ user
    And voice ordering is enabled
    And I have products in my cart

  Scenario: User adds item to cart by voice
    Given I am viewing the menu
    When I say "Add two Guinness to my cart"
    Then the AI should confirm understanding
    And it should add 2 Guinness to my cart
    And it should confirm the addition verbally
    And it should show updated cart total
    And I should see a visual confirmation

  Scenario: User removes item from cart by voice
    Given my cart contains "Margarita" and "Nachos"
    When I say "Remove the nachos from my cart"
    Then the AI should locate "Nachos" in my cart
    And it should remove the item
    And it should confirm "I've removed Nachos from your cart"
    And it should show the updated cart total

  Scenario: User modifies quantity by voice
    Given my cart contains 2 IPAs
    When I say "Actually make that 3 IPAs"
    Then the AI should understand I want to update quantity
    And it should change the quantity to 3
    And it should confirm "Updated to 3 IPAs"
    And it should update the cart total

  Scenario: User reviews entire cart by voice
    Given my cart has multiple items
    When I ask "What's in my cart?"
    Then the AI should read each item and quantity
    And it should state the subtotal
    And it should ask if I want to make changes
    And it should offer to proceed to checkout
```

---

### User Story: US-VOICE.3 - Voice Checkout

**As a** Pours+ user ready to complete my order,  
**I want** to complete checkout using voice commands,  
**So that** I can place my order entirely hands-free.

**Story Points:** 13  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Voice Checkout
  Epic: Voice-Activated Ordering (CNS-0025)

  Background:
    Given I am a registered Pours+ user
    And I have items in my cart
    And voice ordering is enabled
    And I have saved payment methods

  Scenario: User initiates checkout by voice
    Given my cart has items totaling $45.50
    When I say "Check out" or "Place my order"
    Then the AI should confirm my cart contents
    And it should ask me to confirm the order
    And it should verify my payment method
    And it should ask for table number or pickup preference

  Scenario: Voice verification of order details
    Given I am in voice checkout
    When the AI asks me to confirm my order
    Then it should read back all items and quantities
    And it should state the total amount clearly
    And it should ask "Would you like to proceed?"
    And I can say "Yes" or "No, go back"

  Scenario: User provides table number by voice
    Given the AI asks for my table number
    When I say "Table twelve"
    Then the AI should understand "12"
    And it should confirm "Table 12, is that correct?"
    And upon my confirmation, it should complete the order
    And it should provide an order confirmation number

  Scenario: User adds special instructions by voice
    Given I am in voice checkout
    When I say "Add a note: no ice in my drink"
    Then the AI should capture "no ice in my drink" as special instructions
    And it should confirm the instruction was added
    And it should include this in the final order

  Scenario: Voice order confirmation
    Given my order has been placed successfully
    Then the AI should confirm "Your order has been placed"
    And it should state the order number
    And it should give an estimated preparation time
    And it should offer to track the order status
```

---

### User Story: US-VOICE.4 - Conversational Clarification

**As a** Pours+ user using voice,  
**I want** the AI to ask clarifying questions when my request is ambiguous,  
**So that** I get exactly what I intended to order.

**Story Points:** 8  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Conversational Clarification
  Epic: Voice-Activated Ordering (CNS-0025)

  Background:
    Given I am using voice ordering
    And the AI is actively listening

  Scenario: AI clarifies ambiguous product request
    Given the menu has 5 different IPA beers
    When I say "I want an IPA"
    Then the AI should respond "We have 5 IPAs available. Which would you like?"
    And it should list the options with brief descriptions
    And it should wait for my selection
    And I can say the name or number

  Scenario: AI handles partial or unclear requests
    Given I am speaking in a noisy environment
    When I say "Add... [inaudible]... to my cart"
    Then the AI should recognize the request was incomplete
    And it should ask "I didn't catch that. What would you like to add?"
    And it should be patient and supportive
    And it should not make assumptions

  Scenario: AI confirms understanding for important actions
    Given I have items in my cart worth $80
    When I say "Clear my cart"
    Then the AI should ask "Are you sure you want to remove all items from your cart?"
    And it should wait for explicit confirmation
    And it should only proceed if I say "Yes" or "Confirm"

  Scenario: AI offers suggestions when request can't be fulfilled
    Given the menu doesn't have "Mojito"
    When I ask for "A Mojito please"
    Then the AI should say "We don't have Mojito right now"
    And it should suggest similar alternatives
    And it should say "Would you like a Virgin Mojito or a different cocktail?"
    And it should help me find a suitable option
```

---

### User Story: US-VOICE.5 - Voice Accessibility Mode

**As a** user with visual impairment,  
**I want** a complete voice-driven experience with rich audio feedback,  
**So that** I can use Pours+ independently without needing to see the screen.

**Story Points:** 8  
**Priority:** P1 - High (ADA Compliance)

#### Acceptance Criteria

```gherkin
Feature: Voice Accessibility Mode
  Epic: Voice-Activated Ordering (CNS-0025)

  Background:
    Given I am a user with visual impairment
    And I have enabled voice accessibility mode
    And screen reader compatibility is active

  Scenario: Full menu navigation by voice
    Given I am on the menu page
    When I say "Read the menu"
    Then the AI should begin reading categories
    And it should pause between items for me to interrupt
    And I can say "Tell me more about that one"
    And the AI should read full descriptions including price and allergens

  Scenario: Voice-only cart management
    Given I have added items by voice
    When I want to review my cart
    Then the AI should read each item name, quantity, and price
    And it should announce the subtotal and total
    And I can interrupt at any time with commands
    And all visual confirmations have audio equivalents

  Scenario: Accessible checkout flow
    Given I am ready to check out
    When I say "Checkout"
    Then the AI should guide me through each step verbally
    And it should confirm every detail aloud
    And it should not rely on visual-only confirmation
    And it should announce success clearly

  Scenario: Audio descriptions of promotions and specials
    Given there are featured items or promotions
    When I navigate the menu
    Then the AI should announce specials clearly
    And it should describe visual elements (e.g., "Featured: Happy Hour cocktails, 20% off")
    And it should integrate promotions naturally into menu reading
```

---

### User Story: US-VOICE.6 - Noise Handling & Error Recovery

**As a** Pours+ user in a loud bar environment,  
**I want** the voice recognition to work reliably despite background noise,  
**So that** I can still use voice ordering in realistic venue settings.

**Story Points:** 5  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Noise Handling and Error Recovery
  Epic: Voice-Activated Ordering (CNS-0025)

  Background:
    Given I am in a noisy venue environment
    And background noise level is significant
    And voice ordering is active

  Scenario: AI adapts to noisy environment
    Given ambient noise is detected as high
    When I activate voice ordering
    Then the AI should use enhanced noise cancellation
    And it should ask me to speak closer to the microphone
    And it should provide visual feedback that it's listening
    And it should confirm understanding more frequently

  Scenario: AI requests repetition when unclear
    Given I spoke but the AI didn't understand clearly
    When the AI processes my speech
    Then it should honestly say "I didn't catch that. Could you repeat?"
    And it should not guess what I said
    And it should remain patient and supportive
    And it should offer text-based fallback option

  Scenario: Voice command timeout handling
    Given I activated voice input
    And I haven't spoken for 10 seconds
    When the timeout period expires
    Then the AI should say "I'm still listening. What would you like?"
    And it should allow additional time
    And after 30 seconds total, it should say "Say 'Hey Pours' when you're ready"

  Scenario: Fallback to text when voice fails repeatedly
    Given voice recognition has failed 3 times in a row
    When the AI detects this pattern
    Then it should suggest "Would you like to type instead?"
    And it should seamlessly switch to text input
    And it should remember context from failed voice attempts
    And the user can switch back to voice anytime
```

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

**As a** Pours+ user with allergies or dietary restrictions,  
**I want** the AI to help me set up a comprehensive allergy profile,  
**So that** I'm protected from allergens in all my orders.

**Story Points:** 8  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: AI-Assisted Allergy Profile Setup
  Epic: AI Allergen Guardian (CNS-0026)

  Background:
    Given I am a new or existing Pours+ user
    And I want to set up allergen protection

  Scenario: AI guides user through allergy profile setup
    Given I am creating my allergy profile
    When I select "Set up allergen protection"
    Then the AI should ask "Do you have any food or drink allergies?"
    And it should provide common allergy categories
    And it should allow free-text input for uncommon allergies
    And it should ask about severity (life-threatening, moderate, mild)
    And it should confirm understanding of each allergy

  Scenario: AI asks clarifying questions about specific allergens
    Given I indicate I have a nut allergy
    When the AI processes this information
    Then it should ask "Which nuts? Tree nuts, peanuts, or all nuts?"
    And it should ask about cross-contamination sensitivity
    And it should explain which products contain these allergens
    And it should save detailed allergy specifications

  Scenario: AI helps identify hidden allergens
    Given I say "I'm allergic to sulfites"
    When the AI analyzes this allergy
    Then it should explain that sulfites are common in wine
    And it should mention other beverages that may contain sulfites
    And it should ask if I want to exclude all sulfite-containing items
    And it should offer to scan all products for this allergen

  Scenario: User updates allergy profile later
    Given I have an existing allergy profile
    When I say "I need to add a new allergy"
    Then the AI should add to my existing profile
    And it should re-scan my order history for the new allergen
    And it should notify me if any past orders contained this allergen
    And it should update my protection settings
```

---

### User Story: US-ALLERGEN.3 - AI-Powered Safe Alternatives

**As a** Pours+ user viewing a product I can't have due to allergies,  
**I want** the AI to suggest safe alternatives I'll enjoy,  
**So that** I can still find great options without risking my health.

**Story Points:** 8  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: AI-Powered Safe Alternatives
  Epic: AI Allergen Guardian (CNS-0026)

  Background:
    Given I have allergen restrictions in my profile
    And I am browsing products

  Scenario: AI suggests alternatives when I view unsafe product
    Given I have a documented gluten allergy
    When I view a beer containing gluten
    Then the AI should immediately show "This contains gluten"
    And it should say "Would you like to see gluten-free alternatives?"
    And it should list gluten-free beers with similar flavor profiles
    And each suggestion should explain why it's a good match

  Scenario: AI finds alternatives with similar characteristics
    Given I wanted an "Old Fashioned" but I'm allergic to the bitters used
    When the AI searches for alternatives
    Then it should find cocktails with similar flavor profiles
    And it should suggest modified Old Fashioned recipes without allergens
    And it should explain ingredient substitutions
    And it should note "Made without bitters, uses X instead"

  Scenario: AI learns my preferences for better suggestions
    Given I've previously chosen vodka alternatives over gin
    When I try to order a gin-based drink with allergens
    Then the AI should prioritize vodka-based alternatives
    And it should say "Based on your preferences, you might like..."
    And it should rank suggestions by likelihood I'll enjoy them

  Scenario: No safe alternatives available
    Given I'm allergic to an ingredient in multiple products
    When there are no safe alternatives in that category
    Then the AI should honestly say "Unfortunately, we don't have allergen-free options in this category"
    And it should suggest completely different categories
    And it should explain what specifically prevents safe options
    And it should offer to notify me if safe options are added
```

---

### User Story: US-ALLERGEN.4 - Cross-Contamination Warnings

**As a** user with severe allergies,  
**I want** to be warned about potential cross-contamination risks,  
**So that** I can make fully informed decisions about my safety.

**Story Points:** 5  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Cross-Contamination Warnings
  Epic: AI Allergen Guardian (CNS-0026)

  Background:
    Given I have severe allergies documented in my profile
    And cross-contamination sensitivity is marked as high

  Scenario: AI warns about shared equipment
    Given a cocktail is made with equipment also used for nut-based drinks
    And I have a severe nut allergy
    When I view this cocktail
    Then the AI should show a cross-contamination warning
    And it should explain the specific risk
    And it should recommend discussing with bartender
    And it should mark this as "Moderate Risk" or "High Risk"

  Scenario: AI identifies kitchen-level contamination risks
    Given I'm ordering food alongside drinks
    And I have a shellfish allergy
    When the venue's kitchen prepares shellfish dishes
    Then the AI should note "This kitchen handles shellfish"
    And it should suggest asking about preparation practices
    And it should recommend allergy-safe food items

  Scenario: User acknowledges contamination risk
    Given a product has cross-contamination warnings
    When I decide to order it anyway
    Then the AI should require explicit acknowledgment
    And it should ask "Are you sure? This has cross-contamination risk."
    And it should log my decision
    And it should not prevent the order but ensure informed consent
```

---

### User Story: US-ALLERGEN.5 - Dietary Restriction Assistant

**As a** user with dietary restrictions (vegan, kosher, halal, etc.),  
**I want** AI assistance filtering products by my dietary needs,  
**So that** I can easily find options that meet my requirements.

**Story Points:** 8  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Dietary Restriction Assistant
  Epic: AI Allergen Guardian (CNS-0026)

  Background:
    Given I have dietary restrictions configured
    And I am browsing the menu

  Scenario: AI filters menu for vegan options
    Given my dietary preference is vegan
    When I view the menu
    Then the AI should automatically highlight vegan options
    And it should explain "Contains no animal products"
    And it should hide or gray out non-vegan items
    And I can toggle to see all items if desired

  Scenario: AI explains why product doesn't meet dietary needs
    Given I'm vegan
    When I click on a non-vegan cocktail
    Then the AI should say "This contains honey" (specific ingredient)
    And it should suggest vegan alternatives
    And it should explain the substitution (e.g., "Try this with agave instead")

  Scenario: AI handles multiple simultaneous restrictions
    Given I am both kosher and lactose-intolerant
    When I browse products
    Then the AI should filter by both restrictions
    And it should clearly mark items meeting all criteria
    And it should explain which restriction an item violates
    And it should find options satisfying both requirements

  Scenario: AI assists with religious dietary laws
    Given I follow halal dietary laws
    When I view alcoholic products
    Then the AI should note my profile includes halal preference
    And it should offer to show only non-alcoholic options
    Or it should respect that I may choose to view all options
    And it should not make judgments about my choices
```

---

### User Story: US-ALLERGEN.6 - Allergen Confidence Scoring

**As a** user relying on allergen information,  
**I want** to know how confident the AI is about allergen data,  
**So that** I can assess the reliability of safety information.

**Story Points:** 5  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Allergen Confidence Scoring
  Epic: AI Allergen Guardian (CNS-0026)

  Background:
    Given allergen information is displayed for products
    And AI confidence scoring is enabled

  Scenario: High confidence allergen data
    Given a product has complete, verified allergen information
    When I view this product
    Then the AI should show "Allergen information verified ✓"
    And the confidence indicator should be green
    And it should note the data source (e.g., "From manufacturer")

  Scenario: Medium confidence allergen data
    Given a product's allergen info is inferred from ingredients
    When I view this product
    Then the AI should show "Allergen information estimated"
    And the confidence indicator should be yellow
    And it should say "We recommend confirming with venue staff"

  Scenario: Low confidence or missing data
    Given a product has incomplete allergen information
    When I view this product
    Then the AI should prominently warn "Limited allergen information available"
    And the confidence indicator should be red
    And it should strongly recommend speaking with bartender/kitchen
    And it should not allow adding to cart without acknowledgment

  Scenario: AI requests verification from venue
    Given allergen data confidence is low for a product I want
    When I express interest in ordering
    Then the AI should offer to "Ask the venue for detailed allergen info"
    And it should facilitate communication with venue staff
    And it should update confidence once verified
```

---

### User Story: US-ALLERGEN.7 - Emergency Contact Integration

**As a** user with life-threatening allergies,  
**I want** my emergency contact information linked to my allergen profile,  
**So that** help can be reached quickly if I have a reaction.

**Story Points:** 8  
**Priority:** P1 - High

#### Acceptance Criteria

```gherkin
Feature: Emergency Contact Integration for Allergies
  Epic: AI Allergen Guardian (CNS-0026)

  Background:
    Given I have severe, life-threatening allergies
    And I have designated emergency contacts

  Scenario: User sets up emergency contacts during allergy profile
    Given I am configuring my allergen profile
    When I indicate a life-threatening allergy
    Then the AI should ask "Would you like to add emergency contacts?"
    And it should collect emergency contact name and phone
    And it should ask about EpiPen or medication needs
    And it should confirm this information is stored securely

  Scenario: AI reminds user of emergency preparedness
    Given I have severe peanut allergy
    And I'm at a venue for the first time
    When I check in
    Then the AI should ask "Do you have your EpiPen with you?"
    And it should confirm emergency contacts are up to date
    And it should identify nearest hospital on venue map

  Scenario: User reports allergic reaction
    Given I'm having symptoms of allergic reaction
    When I tell the AI "I think I'm having a reaction"
    Then the AI should immediately ask if I need emergency services
    And it should offer to call my emergency contact
    And it should offer to notify venue staff
    And it should display my allergen profile for medical personnel
    And it should log the incident with timestamp and location

  Scenario: Automatic notification on high-risk order attempt
    Given I have severe shellfish allergy
    When I accidentally try to add a shellfish item to cart
    Then the AI should block the order
    And it should send an alert to my designated safety contact
    And it should log this incident for review
    And it should ask if my allergen profile needs updating
```

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

**As a** Pours+ user celebrating a special occasion,  
**I want** venue recommendations suited to my specific event,  
**So that** I can find the perfect venue for my celebration.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Occasion-Aware Venue Suggestions
  Epic: Smart Venue Discovery (CNS-0027)

  Background:
    Given I am searching for a venue
    And the AI is analyzing my request

  Scenario: User specifies birthday celebration
    Given I am planning a birthday celebration
    When I tell the AI "I need a place for my birthday"
    Then it should ask about party size and preferences
    And it should recommend venues with private areas or party packages
    And it should prioritize places known for celebrations
    And it should mention special birthday perks (free drinks, dessert)

  Scenario: User needs venue for business meeting
    Given I specify "quiet place for a business meeting"
    When the AI searches for venues
    Then it should recommend upscale, quieter establishments
    And it should filter out loud sports bars or clubs
    And it should mention amenities like Wi-Fi or private seating
    And it should note venues with professional atmosphere

  Scenario: User planning first date
    Given I ask for "a good spot for a first date"
    When the AI processes this occasion
    Then it should suggest romantic or intimate venues
    And it should avoid overly loud or crowded places
    And it should consider venues with good ambiance
    And it should mention conversation-friendly environments

  Scenario: User celebrating with large group
    Given I need "a place for 15 people"
    When the AI searches
    Then it should filter by capacity
    And it should prioritize venues with group seating
    And it should mention group packages or deals
    And it should note reservation requirements
```

---

### User Story: US-VENUE-AI.3 - Social Context Recommendations

**As a** Pours+ user going out with different friend groups,  
**I want** venue suggestions based on who I'm with,  
**So that** I can find places my entire group will enjoy.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Social Context Venue Recommendations
  Epic: Smart Venue Discovery (CNS-0027)

  Background:
    Given I am searching for venues
    And the AI has access to my social patterns

  Scenario: AI detects group order participants
    Given I've created a group order with 5 friends
    When the AI analyzes the group composition
    Then it should check these friends' past venue preferences
    And it should recommend venues popular with this specific group
    And it should note "You and Sarah both loved this place"

  Scenario: User indicates going out with coworkers
    Given I specify "out with coworkers"
    When the AI searches for venues
    Then it should recommend professional-casual atmospheres
    And it should avoid overly loud or informal settings
    And it should suggest venues near business districts
    And it should consider happy hour timing and deals

  Scenario: AI recognizes regular social patterns
    Given I always go to sports bars with my friend Mike
    And I typically go to cocktail lounges with my friend Lisa
    When I indicate "going out with Mike and Lisa"
    Then the AI should find a venue that bridges both preferences
    And it should suggest sports bars with good cocktails
    Or venues with both sports viewing and upscale drinks
    And it should explain why this choice works for both

  Scenario: Solo user seeking social venues
    Given I indicate I'm going out alone
    When the AI provides recommendations
    Then it should suggest social, welcoming venues
    And it should note places "known for friendly atmosphere"
    And it should avoid overly couple-focused or group-oriented venues
    And it should mention bar seating or communal tables
```

---

### User Story: US-VENUE-AI.4 - Weather-Adaptive Suggestions

**As a** Pours+ user,  
**I want** venue recommendations that consider current weather conditions,  
**So that** I can find comfortable options for the conditions.

**Story Points:** 5  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Weather-Adaptive Venue Suggestions
  Epic: Smart Venue Discovery (CNS-0027)

  Background:
    Given I am searching for venues
    And the AI has access to current weather data

  Scenario: Hot summer day venue recommendations
    Given it is 95°F outside
    When I search for venues
    Then the AI should prioritize air-conditioned venues
    And it should highlight outdoor patios with shade
    And it should suggest rooftop bars with misters or cover
    And it should note "Perfect AC" or "Cool patio"

  Scenario: Rainy day venue adjustments
    Given it is currently raining
    When the AI provides venue suggestions
    Then it should deprioritize outdoor seating venues
    And it should highlight cozy indoor atmospheres
    And it should note "Indoor seating only" or "Covered patio"
    And it should consider proximity to parking or transit

  Scenario: Beautiful weather outdoor recommendations
    Given it is 72°F, sunny, with low humidity
    When I search for venues
    Then the AI should promote outdoor spaces
    And it should say "Perfect weather for their patio!"
    And it should prioritize beer gardens, rooftops, outdoor bars
    And it should show photos of outdoor seating areas

  Scenario: AI proactively warns about weather changes
    Given I have a venue selected with outdoor seating
    And rain is forecast in 2 hours
    When I'm about to make a reservation
    Then the AI should warn about upcoming weather
    And it should ask if I want weather-protected alternatives
    And it should show venues with indoor/outdoor flexibility
```

---

### User Story: US-VENUE-AI.5 - Time-Optimized Recommendations

**As a** Pours+ user,  
**I want** venue suggestions optimized for the current time and day,  
**So that** I can find venues that will have the right atmosphere now.

**Story Points:** 5  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Time-Optimized Venue Recommendations
  Epic: Smart Venue Discovery (CNS-0027)

  Background:
    Given I am searching for venues
    And the AI considers current time and day

  Scenario: Late night venue search
    Given it is 11:30 PM on a Saturday
    When I search for venues
    Then the AI should filter for late-night options
    And it should show venues open past midnight
    And it should note closing times prominently
    And it should prioritize nightlife-focused venues

  Scenario: Happy hour timing
    Given it is 5:30 PM on a Wednesday
    When I search for venues
    Then the AI should highlight "Happy Hour Now!"
    And it should show happy hour specials and timing
    And it should prioritize venues with active happy hours
    And it should note when happy hour ends

  Scenario: Sunday afternoon recommendations
    Given it is 2:00 PM on Sunday
    When the AI suggests venues
    Then it should recommend brunch or relaxed day-drinking spots
    And it should note "Great for Sunday funday"
    And it should filter out venues that don't open until evening
    And it should consider lower-key atmosphere preferences

  Scenario: Venue crowd prediction
    Given historical data on venue busy times
    When I'm searching at peak hours (Friday 9 PM)
    Then the AI should note "Likely crowded now"
    And it should estimate wait times if available
    And it should suggest less crowded alternatives
    And it should offer to show quieter time options
```

---

### User Story: US-VENUE-AI.6 - Venue Personality Matching

**As a** Pours+ user with specific preferences,  
**I want** the AI to understand and match my preferred venue personality,  
**So that** I consistently find places I'll enjoy.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Venue Personality Matching
  Epic: Smart Venue Discovery (CNS-0027)

  Background:
    Given the AI has learned my venue preferences
    And venues have personality profiles

  Scenario: AI learns user prefers dive bars over upscale lounges
    Given I have visited 8 dive bars and 1 upscale lounge
    And I gave high ratings to dive bars
    When I search for venues without specific criteria
    Then the AI should prioritize dive bar recommendations
    And it should note "Based on your style, you'll love..."
    And it should still show some upscale options but lower-ranked

  Scenario: User explicitly describes desired vibe
    Given I search for "laid-back, no pretense, good beer selection"
    When the AI processes this request
    Then it should match venues to personality descriptors
    And it should find neighborhood pubs and casual bars
    And it should filter out dress-code or bottle-service venues
    And it should explain matches: "Neighborhood favorite, great craft beer"

  Scenario: AI detects personality preference shift
    Given I historically preferred quiet cocktail bars
    But my last 4 visits were to lively sports bars
    When the AI updates my preference profile
    Then it should recognize this shift in taste
    And it should ask "Noticed you're exploring sports bars more. Want recommendations?"
    And it should balance old and new preferences

  Scenario: Venue personality tags are explained
    Given a venue is tagged as "Hipster, craft-focused, industrial"
    When I view this venue
    Then the AI should explain what these tags mean
    And it should say "Think exposed brick, local beers, vinyl records"
    And it should compare to venues I know
    And it should help me understand if it matches my vibe
```

---

### User Story: US-VENUE-AI.7 - Exploratory vs. Familiar Balance

**As a** Pours+ user,  
**I want** the AI to balance showing me new venues with my known favorites,  
**So that** I can discover new places without feeling overwhelmed.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Exploration vs. Familiarity Balance
  Epic: Smart Venue Discovery (CNS-0027)

  Background:
    Given I have a history of venue visits
    And the AI tracks my exploration preferences

  Scenario: User in exploratory mode
    Given I say "Show me somewhere new"
    When the AI generates recommendations
    Then it should exclude venues I've visited before
    And it should prioritize highly-rated venues similar to my favorites
    And it should explain why each new venue matches my taste
    And it should note "You haven't been here yet, but it's like [favorite venue]"

  Scenario: User wants comfort and familiarity
    Given I ask for "my usual spots"
    When the AI responds
    Then it should show my top 5 most-visited venues
    And it should note any specials or changes at these venues
    And it should show my typical orders at each
    And it should offer quick re-order options

  Scenario: AI detects user is in a venue rut
    Given I've visited the same 2 venues exclusively for 6 weeks
    When I search for venues
    Then the AI should gently suggest "Want to try somewhere new?"
    And it should show highly-compatible new options
    And it should ease exploration with low-risk suggestions
    And I can dismiss and return to familiar venues

  Scenario: Balanced recommendation mix (default)
    Given I haven't specified exploration preference
    When the AI shows venue recommendations
    Then it should include 60% familiar/visited venues
    And 40% new venues with strong compatibility scores
    And it should label each: "You've been here 4 times" or "New match for you"
    And it should let me filter to "Only new" or "Only favorites"

  Scenario: AI celebrates venue exploration milestones
    Given I've now visited 20 different venues
    When I check in to my 20th unique venue
    Then the AI should celebrate "20 venues explored!"
    And it should offer a summary of my exploration patterns
    And it should encourage continued discovery
    And it might offer rewards or recognition
```

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

**As a** user organizing a group order,  
**I want** AI assistance managing the entire order process,  
**So that** coordinating drinks for multiple people is easier and more efficient.

**Story Points:** 13  
**Priority:** P2 - Medium  
**Dependencies:** CNS-0023 (Social Drinking & Group Orders)

#### Background
Group orders can be chaotic with multiple people making selections, changing minds, and managing preferences. AI coordination can streamline this process and reduce errors.

#### Acceptance Criteria

```gherkin
Feature: AI Group Order Coordination
  Epic: AI Order Assistant for Group Orders (CNS-0028)

  Background:
    Given I am a registered Pours+ user
    And I have created a group order
    And multiple friends are invited to participate

  Scenario: AI helps organize initial group order setup
    Given I'm creating a group order for 6 people
    When I activate AI group order assistance
    Then the AI should greet the group
    And it should explain how group ordering works
    And it should ask "Who's ordering? I can help collect everyone's choices"
    And it should offer to set a deadline for selections
    And it should suggest a budget per person if desired

  Scenario: AI tracks individual selections in real-time
    Given 4 people have joined my group order
    When each person adds items to the shared order
    Then the AI should announce each addition
    And it should maintain a running list of who ordered what
    And it should update the total automatically
    And it should notify me when someone changes their selection
    And it should highlight when someone hasn't ordered yet

  Scenario: AI suggests popular group-friendly items
    Given my group order has 8 participants
    When the AI analyzes the order composition
    Then it should notice if everyone's ordering similar items
    And it should suggest "Want to get a pitcher instead? It's cheaper"
    And it should recommend shareable appetizers
    And it should identify bulk or group discount opportunities

  Scenario: AI manages order modifications and late additions
    Given the group order is open for 30 minutes
    And some people have already ordered
    When someone wants to change their selection
    Then the AI should update the order smoothly
    And it should notify the group organizer of the change
    And it should recalculate totals and splits
    And it should handle late joiners by extending the deadline

  Scenario: AI coordinates order finalization
    Given all group members have made their selections
    When it's time to finalize the order
    Then the AI should summarize the full order
    And it should confirm each person's items
    And it should show the total cost and split
    And it should ask "Everyone ready? I'll submit this order now."
    And it should give 60 seconds for final objections

  Scenario: AI handles dropouts and cancellations
    Given a group member drops out after ordering
    When they remove themselves from the group order
    Then the AI should update the total
    And it should recalculate cost splits for remaining members
    And it should notify the organizer
    And it should ask if the order should still proceed
```

---

### User Story: US-GROUP-AI.2 - Smart Cost Splitting Suggestions

**As a** group order participant,  
**I want** the AI to calculate fair cost splits in multiple ways,  
**So that** everyone pays their fair share without awkward conversations.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Smart Cost Splitting Suggestions
  Epic: AI Order Assistant for Group Orders (CNS-0028)

  Background:
    Given I am part of a group order with multiple participants
    And the order total is calculated
    And checkout is about to begin

  Scenario: AI offers multiple splitting methods
    Given a group order total of $127.50 for 5 people
    When the AI presents payment options
    Then it should offer "Split evenly: $25.50 per person"
    And it should offer "Split by items: Pay only for what you ordered"
    And it should offer "One person pays, others Venmo them"
    And it should show the math for each option clearly

  Scenario: AI calculates itemized split with tax and tip
    Given each person ordered different priced items
    And the subtotal is $100, tax is $8, tip is $15
    When I choose "Split by items"
    Then the AI should allocate tax and tip proportionally
    And it should show "Sarah: $22 (your items) + $1.76 tax + $3.30 tip = $27.06"
    And it should ensure all splits add up exactly to the total
    And it should round fairly so no one is overcharged

  Scenario: AI handles shared items in the split
    Given the group ordered 2 appetizers to share
    And the appetizers cost $18 total
    When calculating the split
    Then the AI should ask "How should we split the shared appetizers?"
    And it should offer to divide evenly among all participants
    Or allow custom allocation (e.g., 3 people split one, 4 split the other)
    And it should add each person's share to their individual bill

  Scenario: AI simplifies complex splits
    Given a messy order with different quantities and prices
    When the AI calculates the split
    Then it should present results in the simplest terms
    And it should highlight "Easiest option: Split evenly at $23 each"
    And it should note discrepancies: "Range is $19-$28 if itemized"
    And it should recommend the fairest approach based on variance

  Scenario: AI assists with one-person-pays scenario
    Given the group decides one person will pay upfront
    When this payment method is selected
    Then the AI should calculate what each person owes that person
    And it should generate Venmo/payment app links if possible
    And it should create a shareable summary for the payer
    And it should track who has paid back
```

---

### User Story: US-GROUP-AI.3 - Preference Conflict Resolution

**As a** group order organizer,  
**I want** AI help resolving conflicts when people want different things,  
**So that** the group can reach consensus quickly.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Preference Conflict Resolution
  Epic: AI Order Assistant for Group Orders (CNS-0028)

  Background:
    Given I am organizing a group order
    And multiple participants have different preferences
    And conflicts arise during ordering

  Scenario: AI detects timing conflicts
    Given 3 people want appetizers now
    And 4 people want to wait for entrees
    When the AI detects this split
    Then it should suggest "Should I split this into two orders?"
    And it should offer to place appetizers immediately
    And it should hold main orders for later timing
    And it should coordinate both orders seamlessly

  Scenario: AI mediates budget disagreements
    Given some group members want expensive cocktails
    And others want to keep costs low
    When the AI notices the cost disparity
    Then it should calculate the average per-person cost
    And it should highlight "Heads up: cost range is $15-$45 per person"
    And it should suggest "Want to set a per-person budget?"
    And it should help the group agree on a fair limit

  Scenario: AI finds compromise options for divided preferences
    Given 4 people want beer and 3 people want wine
    When the AI analyzes these preferences
    Then it should look for overlap opportunities
    And it should suggest "How about a beer and wine flight to share?"
    Or recommend venues with both beer and wine specialties
    And it should find items that bridge both preferences

  Scenario: AI resolves venue selection conflicts
    Given half the group prefers Venue A
    And half prefers Venue B
    When the AI detects this deadlock
    Then it should compare both venues objectively
    And it should note pros/cons: "Venue A has your beer, Venue B is closer"
    And it should suggest "Vote or I can pick based on majority preferences"
    And it should facilitate democratic decision-making

  Scenario: AI handles dietary restriction conflicts
    Given one person is vegan
    And the suggested venue has limited vegan options
    When the AI recognizes this issue
    Then it should alert the group early
    And it should suggest alternative venues with better options
    Or help find suitable items at the current venue
    And it should ensure everyone can order comfortably
```

---

### User Story: US-GROUP-AI.4 - Bulk Order Optimization

**As a** organizer of a large group order,  
**I want** AI to optimize for bulk deals and cost savings,  
**So that** the group gets the best value.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Bulk Order Optimization
  Epic: AI Order Assistant for Group Orders (CNS-0028)

  Background:
    Given I am organizing a group order for 10+ people
    And the AI is analyzing order patterns

  Scenario: AI identifies pitcher vs individual drink savings
    Given 6 people all ordered the same draft beer
    And individual beers are $7 each ($42 total)
    When the AI analyzes this pattern
    Then it should notice the duplication
    And it should suggest "Get a pitcher for $32 instead? Saves $10"
    And it should calculate exact savings
    And it should require group agreement before switching

  Scenario: AI recommends bundle deals for large groups
    Given a group of 12 ordering various cocktails
    And the venue offers a "Party Package: 12 cocktails for $90"
    When the AI detects eligibility for this deal
    Then it should alert the organizer
    And it should compare: "Regular price: $108, Package: $90, Save $18"
    And it should explain any restrictions or limitations
    And it should facilitate switching to the package

  Scenario: AI optimizes appetizer sharing for groups
    Given 8 people are ordering
    And 5 people added individual sides
    When the AI analyzes the order
    Then it should suggest "Get 2 large shareable platters instead?"
    And it should show the cost comparison
    And it should note "More food for less money, plus easier sharing"

  Scenario: AI detects happy hour or group discount eligibility
    Given the group is ordering during happy hour
    But some items selected are not happy hour eligible
    When the AI reviews the order
    Then it should highlight happy hour options
    And it should suggest "Switch to happy hour cocktails and save $24"
    And it should show which substitutions would maximize savings

  Scenario: AI recommends optimal group order timing
    Given the group is planning to order at 6:45 PM
    And happy hour ends at 7:00 PM
    When the AI knows about the timing
    Then it should suggest "Order now to catch happy hour prices?"
    And it should calculate potential savings
    And it should help the group finalize faster to capture deals
```

---

### User Story: US-GROUP-AI.5 - Group Budget Management

**As a** group order participant,  
**I want** the AI to track our spending against a group budget,  
**So that** we don't overspend unintentionally.

**Story Points:** 5  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Group Budget Management
  Epic: AI Order Assistant for Group Orders (CNS-0028)

  Background:
    Given I am part of a group order
    And a group budget has been set

  Scenario: Group sets a total budget upfront
    Given we're starting a group order for 8 people
    When the organizer says "We have a $200 budget"
    Then the AI should confirm "Got it, $200 total ($25 per person)"
    And it should display the budget prominently
    And it should track spending in real-time
    And it should show "Spent: $87 / $200 remaining: $113"

  Scenario: AI warns when approaching budget limit
    Given the group budget is $150
    And current order total is $135
    When someone tries to add a $20 item
    Then the AI should warn "This would exceed budget by $5"
    And it should suggest "Remove something or adjust budget?"
    And it should show what needs to change to stay in budget

  Scenario: AI prevents exceeding hard budget limits
    Given the group has set a hard limit of $100
    And current total is $98
    When someone tries to add a $5 item
    Then the AI should block the addition
    And it should say "Budget limit reached. Remove an item first?"
    And it should show options to stay within budget

  Scenario: AI provides budget recommendations
    Given 6 people with a $180 budget ($30/person)
    When the AI analyzes available options
    Then it should suggest items that fit the budget
    And it should note "You can each get 2 drinks and an appetizer"
    And it should warn about expensive items that break the budget

  Scenario: AI tracks per-person budget allocation
    Given each person has a $25 individual budget
    And the order is using itemized split
    When someone exceeds their personal allocation
    Then the AI should notify them privately
    And it should say "You're at $32, group limit is $25 per person"
    And it should suggest alternatives to get back under budget
```

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

**As a** Pours+ user with order history,  
**I want** the AI to analyze my spending patterns and trends,  
**So that** I can understand where my money goes and make informed budgeting decisions.

**Story Points:** 13  
**Priority:** P2 - Medium

#### Background
Users often don't realize how much they spend on drinks over time. AI-powered spending analysis can provide valuable insights into consumption patterns, helping users make more conscious decisions.

#### Acceptance Criteria

```gherkin
Feature: AI Spending Analysis
  Epic: AI Receipt Analytics & Insights (CNS-0029)

  Background:
    Given I am a registered Pours+ user
    And I have at least 3 months of order history
    And I navigate to the Insights section

  Scenario: AI provides monthly spending overview
    Given I have spent $450 in the past month
    When I view my spending insights
    Then the AI should show "You spent $450 this month"
    And it should compare to previous months: "Up 15% from last month ($390)"
    And it should break down by category: "$200 cocktails, $150 beer, $100 food"
    And it should show a visual chart of spending over time

  Scenario: AI identifies spending trends and patterns
    Given my spending has increased 20% each month for 3 months
    When the AI analyzes this trend
    Then it should alert me: "Your spending is trending up"
    And it should project: "At this rate, you'll spend $650 next month"
    And it should ask "Want to set a budget to manage this?"
    And it should suggest specific actions to reverse the trend

  Scenario: AI detects spending anomalies
    Given my typical monthly spending is $300
    But last month I spent $580
    When the AI reviews the anomaly
    Then it should highlight "Last month was unusual - 93% above average"
    And it should identify the cause: "Special events: 2 birthday celebrations"
    And it should note "Your typical spending is $300/month"
    And it should confirm if this was expected or concerning

  Scenario: AI breaks down spending by venue
    Given I frequent 5 different venues
    When I ask "Where do I spend the most?"
    Then the AI should rank venues by total spending
    And it should show: "Venue A: $180 (40%), Venue B: $120 (27%)..."
    And it should note frequency: "You visit Venue A 2x/week"
    And it should calculate average spend per visit for each venue

  Scenario: AI provides day-of-week and time spending insights
    Given my order history spans multiple months
    When the AI analyzes temporal patterns
    Then it should show "You spend most on Fridays ($80/week average)"
    And it should note "Saturday afternoons: $45/week"
    And it should highlight expensive times: "Friday 9-11 PM is your peak spending"
    And it should help me understand my spending rhythms

  Scenario: User asks AI for specific spending insights
    Given I want to know about a specific category
    When I ask "How much do I spend on cocktails?"
    Then the AI should calculate total cocktail spending
    And it should show trends: "Cocktails: $150/month, down 10% from last month"
    And it should compare to other categories
    And it should offer suggestions: "Switch to happy hour cocktails to save $40/month"
```

---

### User Story: US-INSIGHTS.2 - Habit Pattern Recognition

**As a** Pours+ user,  
**I want** the AI to identify my drinking and ordering habits,  
**So that** I can understand my behaviors and make changes if desired.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Habit Pattern Recognition
  Epic: AI Receipt Analytics & Insights (CNS-0029)

  Background:
    Given I have sufficient order history for pattern analysis
    And the AI is analyzing my behavioral data

  Scenario: AI identifies regular happy hour attendance
    Given I order during happy hour 80% of Fridays
    When the AI analyzes my habits
    Then it should recognize "You're a regular Friday happy hour attendee"
    And it should calculate savings: "You've saved $240 with happy hour pricing"
    And it should note favorite happy hour venues
    And it should suggest similar deals I might have missed

  Scenario: AI detects consistent drink preferences
    Given 70% of my orders include IPAs
    When the AI reviews my preferences
    Then it should identify "You're an IPA enthusiast"
    And it should show my top 5 IPAs ordered
    And it should suggest new IPAs I haven't tried
    And it should note venues with best IPA selections for me

  Scenario: AI recognizes social drinking patterns
    Given I always order more when with certain friends
    And my solo orders average 1-2 drinks
    But group orders average 4-5 drinks
    When the AI analyzes social context
    Then it should note "You drink more in group settings"
    And it should identify which friends correlate with higher consumption
    And it should present this non-judgmentally as awareness
    And it should offer to help set social drinking goals if I want

  Scenario: AI identifies venue loyalty patterns
    Given I visit the same venue 60% of the time
    When the AI recognizes this loyalty
    Then it should note "You're a regular at Venue X"
    And it should check if there's a loyalty program I'm missing
    And it should calculate lifetime value: "You've spent $1,200 here"
    And it should suggest asking about VIP perks

  Scenario: AI detects comfort zone vs. exploration patterns
    Given I order the same 3 drinks 90% of the time
    When the AI reviews my variety score
    Then it should gently note "You tend to stick with favorites"
    And it should show "You order Old Fashioned 45% of the time"
    And it should ask "Curious about trying something new?"
    And it should suggest similar items I might enjoy
```

---

### User Story: US-INSIGHTS.3 - Budget Optimization Suggestions

**As a** budget-conscious Pours+ user,  
**I want** AI recommendations on how to save money,  
**So that** I can enjoy drinks while spending less.

**Story Points:** 8  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Budget Optimization Suggestions
  Epic: AI Receipt Analytics & Insights (CNS-0029)

  Background:
    Given I have spending history
    And I'm interested in saving money

  Scenario: AI identifies cheaper alternatives I'd enjoy
    Given I frequently order premium cocktails at $15 each
    And similar cocktails are $10 during happy hour
    When the AI analyzes my spending
    Then it should suggest "Order your favorites during happy hour and save $20/week"
    And it should show exactly which drinks and times
    And it should calculate annual savings: "$1,040/year"
    And it should make it easy to shift timing

  Scenario: AI recommends cost-effective venues for my preferences
    Given I order IPAs at Venue A for $8 each
    And Venue B offers similar IPAs for $6 each
    When the AI compares venues
    Then it should suggest "Get your favorite IPAs at Venue B for 25% less"
    And it should show side-by-side comparison
    And it should note "Same beer, $2 cheaper, 0.3 miles away"
    And it should track if I try the suggestion

  Scenario: AI finds bulk or pitcher savings opportunities
    Given I typically order 3 individual beers per visit
    And pitchers would save $5 per visit
    When the AI reviews my ordering patterns
    Then it should suggest "Get a pitcher instead and save $5"
    And it should calculate "That's $260/year based on your frequency"
    And it should note "Plus, you can share with friends"

  Scenario: AI highlights missed happy hour opportunities
    Given I often arrive at venues at 6:30 PM
    And happy hour ends at 6:00 PM
    When the AI detects this pattern
    Then it should note "You just miss happy hour 60% of the time"
    And it should suggest "Arrive 45 minutes earlier to save $12/visit"
    And it should calculate potential annual savings
    And it should offer calendar reminders for happy hour times

  Scenario: AI suggests strategic substitutions
    Given I order expensive imported beers
    When local craft beers are $3 cheaper with similar ratings
    Then the AI should recommend "Try local craft beers, save $15/week"
    And it should match by style and flavor profile
    And it should explain "Similar taste, local, and cheaper"
    And it should track if I like the alternatives
```

---

### User Story: US-INSIGHTS.4 - Comparative Insights

**As a** Pours+ user,  
**I want** to compare my spending and habits to my own averages and benchmarks,  
**So that** I can understand if my current behavior is typical or unusual.

**Story Points:** 5  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Comparative Insights
  Epic: AI Receipt Analytics & Insights (CNS-0029)

  Background:
    Given I have historical spending and consumption data
    And I want to contextualize my current behavior

  Scenario: Compare current month to personal averages
    Given my average monthly spending is $350
    And this month I've spent $480
    When I view comparative insights
    Then the AI should show "This month: $480 vs. your average: $350 (+37%)"
    And it should highlight "Above your typical spending"
    And it should show a visual indicator (red/yellow/green)
    And it should ask "Is this expected or concerning?"

  Scenario: Compare this week to last week
    Given last week I spent $80
    And this week I've spent $120 so far
    When I check my weekly comparison
    Then the AI should note "Up 50% from last week"
    And it should ask "Any special occasion this week?"
    And it should project end-of-week total: "On track for $140"

  Scenario: Compare venue spending to my typical pattern
    Given I typically spend $40 per visit at Venue A
    But today's order is $75
    When the AI detects the variance
    Then it should note during checkout "This is higher than your usual $40 at this venue"
    And it should be presented as awareness, not judgment
    And it should ask "Celebrating something special?"

  Scenario: Compare drinking frequency to my baseline
    Given I typically go out 2 times per week
    But this week I've been out 5 times
    When the AI analyzes frequency
    Then it should note "You're out more than usual this week"
    And it should compare to my patterns
    And it should be supportive: "Hope you're having a great week!"
    And it should offer budget tracking if spending is also elevated

  Scenario: Year-over-year comparison
    Given I have data from last year
    When I view annual insights
    Then the AI should compare "This year: $4,200 vs. last year: $3,800 (+11%)"
    And it should show monthly trends year-over-year
    And it should identify what changed (new venues, price increases, etc.)
```

---

### User Story: US-INSIGHTS.5 - Health Impact Insights

**As a** health-conscious Pours+ user,  
**I want** insights about my alcohol consumption relative to health guidelines,  
**So that** I can make informed decisions about my drinking.

**Story Points:** 5  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Health Impact Insights
  Epic: AI Receipt Analytics & Insights (CNS-0029)

  Background:
    Given I am a registered Pours+ user
    And I have consumption history tracked
    And health insights are enabled

  Scenario: AI shows weekly alcohol consumption vs. health guidelines
    Given I consumed 15 standard drinks this week
    And health guidelines recommend max 14 drinks/week
    When I view health insights
    Then the AI should show "This week: 15 drinks"
    And it should note "Health guidelines suggest max 14/week"
    And it should be educational, not preachy: "Slightly above recommended"
    And it should explain what constitutes a standard drink

  Scenario: AI tracks drink-free days
    Given health guidelines recommend 2 alcohol-free days per week
    And I had only 1 drink-free day this week
    When the AI analyzes my patterns
    Then it should note "You had 1 alcohol-free day this week"
    And it should suggest "Try for 2 alcohol-free days for better health"
    And it should celebrate when I achieve this goal
    And it should track my streak of meeting the guideline

  Scenario: AI provides calorie awareness from alcohol
    Given I consumed 10 drinks this week
    And each averaged 200 calories
    When I ask about caloric impact
    Then the AI should calculate "~2,000 calories from alcohol this week"
    And it should contextualize: "That's like 3 Big Macs"
    And it should be factual, not judgmental
    And it should suggest lower-calorie alternatives if I'm interested

  Scenario: AI detects binge drinking patterns
    Given I consumed 6+ drinks in one session
    When the AI reviews this session
    Then it should gently note "This session was above binge drinking threshold"
    And it should explain health risks in simple terms
    And it should suggest strategies for moderation
    And it should offer to activate more proactive sobriety monitoring

  Scenario: AI celebrates healthy drinking habits
    Given I stayed within health guidelines for 4 weeks
    And I had 2+ alcohol-free days each week
    When the AI reviews my progress
    Then it should celebrate "Great job staying within guidelines!"
    And it should show my consistent pattern
    And it should encourage continuation
    And it might offer rewards or recognition
```

---

### User Story: US-INSIGHTS.6 - Predictive Budget Alerts

**As a** Pours+ user with a monthly budget,  
**I want** AI to predict when I might exceed my budget,  
**So that** I can adjust my spending before it's too late.

**Story Points:** 5  
**Priority:** P2 - Medium

#### Acceptance Criteria

```gherkin
Feature: Predictive Budget Alerts
  Epic: AI Receipt Analytics & Insights (CNS-0029)

  Background:
    Given I have set a monthly spending budget
    And the AI tracks my spending patterns
    And it's currently mid-month

  Scenario: AI predicts budget overrun based on current pace
    Given my monthly budget is $400
    And I've spent $280 in 15 days
    When the AI analyzes my trajectory
    Then it should project "At this pace, you'll spend ~$560 this month"
    And it should alert me "You're on track to exceed budget by $160"
    And it should suggest "Slow down to $8/day to stay on budget"
    And it should offer strategies to cut back

  Scenario: AI provides early warning before budget risk
    Given my budget is $300/month
    And I typically spend $75/week
    But this week I've already spent $120
    When the AI detects the acceleration
    Then it should warn "Spending faster than usual this week"
    And it should project impact on monthly budget
    And it should suggest "Consider skipping next outing to stay on track"

  Scenario: AI celebrates staying on budget
    Given my budget is $350/month
    And it's day 25 of the month
    And I've spent $290
    When the AI projects my end-of-month spending
    Then it should project "You're on track to stay within budget!"
    And it should show "$60 remaining for 5 days"
    And it should encourage continued discipline
    And it might suggest a treat within remaining budget

  Scenario: AI adjusts predictions based on upcoming events
    Given I have a birthday event scheduled this weekend
    And I've spent $200 of my $400 budget
    When the AI considers the event
    Then it should ask "Big weekend coming up. Want to save budget for it?"
    And it should suggest "Skip tonight's outing to have $150 for the weekend"
    And it should help me strategically allocate remaining budget

  Scenario: AI provides weekly budget check-ins
    Given my monthly budget is $400 ($100/week)
    When it's the start of a new week
    Then the AI should send a check-in: "Week 2: You have $280 left ($70/week)"
    And it should note if I'm ahead or behind pace
    And it should adjust weekly recommendations based on remaining budget
    And it should offer to increase notification frequency if I'm struggling
```

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