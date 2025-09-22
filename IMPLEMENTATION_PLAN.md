# MCT Digital Therapeutic Implementation Plan

## Overview
This plan maps the comprehensive product specification to concrete implementation steps in the mct-app, with visual verification checkpoints at each stage.

## Implementation Phases

### Phase 1: Foundation & Fidelity (Weeks 1-2)
- Core MCT compliance
- Measurement infrastructure
- Basic user flows

### Phase 2: Content & Exercises (Weeks 3-4)
- Weekly modules
- ATT/DM protocols
- Experiment system

### Phase 3: Engagement & Polish (Weeks 5-6)
- Progress visualization
- Personalization
- Notifications

---

## Detailed Implementation Steps

## PHASE 1: FOUNDATION & FIDELITY

### Step 1.1: Onboarding Optimization (Module 0 & 2 Requirements)

**Specification Requirements:**
- ≤7 minute completion
- Process-focused assessment
- No content collection
- Clear MCT positioning

**Implementation Tasks:**

```typescript
// 1. Update onboarding flow timer
// File: client/src/pages/Onboarding.tsx

- Add session timer
- Add step progress indicators
- Implement skip-to-essentials option
- Add MCT fidelity statements
```

**Code Changes:**
1. Add `OnboardingTimer` component
2. Implement `MCTFidelityGuard` for content blocking
3. Create `ProcessOnlyAssessment` component
4. Update belief rating scales to match spec

**Visual Verification:**
```javascript
// Verification script
await page.goto('http://localhost:3000/onboarding');
await page.screenshot({ path: 'verify/onboarding-start.png' });

// Time the full flow
const startTime = Date.now();
// Complete onboarding steps...
const duration = Date.now() - startTime;
assert(duration <= 7 * 60 * 1000, 'Onboarding exceeds 7 minutes');

// Verify no content fields
const contentInputs = await page.$$('[data-content-field]');
assert(contentInputs.length === 0, 'Content fields found in assessment');
```

---

### Step 1.2: CAS Measurement Implementation (Module 1 & 6)

**Specification Requirements:**
- Daily worry/rumination minutes (0-120 range)
- Monitoring frequency counts
- Behavior tracking (checking, reassurance, avoidance)
- Process-only metrics

**Implementation Tasks:**

```typescript
// 1. Update CAS log interface
// File: client/src/pages/Log.tsx

interface CASLogExtended {
  // Time-based (minutes)
  worry_minutes: number; // 0-120
  rumination_minutes: number; // 0-120

  // Frequency counts
  monitoring_count: number; // 0-20+
  body_scanning_count: number;
  news_checking_count: number;

  // Behaviors
  checking_count: number;
  reassurance_count: number;
  avoidance_count: number;
  suppression_count: number;
}
```

**Database Changes:**
```sql
-- Add new columns to cas_logs table
ALTER TABLE cas_logs ADD COLUMN body_scanning_count INTEGER DEFAULT 0;
ALTER TABLE cas_logs ADD COLUMN news_checking_count INTEGER DEFAULT 0;
ALTER TABLE cas_logs ADD COLUMN suppression_count INTEGER DEFAULT 0;
```

**Visual Verification:**
```javascript
await page.goto('http://localhost:3000/log');
await page.screenshot({ path: 'verify/cas-log-form.png' });

// Verify all required metrics present
const metrics = [
  'worry_minutes', 'rumination_minutes',
  'monitoring_count', 'checking_count'
];
for (const metric of metrics) {
  const element = await page.$(`[data-metric="${metric}"]`);
  assert(element, `Missing metric: ${metric}`);
}
```

---

### Step 1.3: Fidelity Enforcement System (Module 1)

**Specification Requirements:**
- Block all content analysis
- Prevent reassurance mechanisms
- Process-only responses
- Crisis routing visible

**Implementation Tasks:**

```typescript
// 1. Create FidelityGuard middleware
// File: server/src/middleware/fidelityGuard.ts

export class FidelityGuard {
  static checkContent(input: string): FidelityResult {
    const contentIndicators = [
      /what if/i,
      /worried about/i,
      /scared that/i,
      /thinking about/i
    ];

    if (contentIndicators.some(pattern => pattern.test(input))) {
      return {
        pass: false,
        redirect: "Let's focus on HOW LONG you worried, not WHAT you worried about"
      };
    }

    return { pass: true };
  }
}
```

**Visual Verification:**
```javascript
// Test content blocking
await page.goto('http://localhost:3000/log');
await page.type('[data-notes]', 'I am worried about my health');
await page.click('[data-submit]');

// Should see fidelity warning
await page.waitForSelector('[data-fidelity-warning]');
await page.screenshot({ path: 'verify/fidelity-block.png' });
```

---

## PHASE 2: CONTENT & EXERCISES

### Step 2.1: Weekly Module Delivery (Module 3)

**Specification Requirements:**
- 8 core weeks + 2 optional
- 500-800 words per module
- Process-focused content only
- Progressive skill building

**Implementation Tasks:**

```typescript
// 1. Create module content components
// File: client/src/components/modules/WeeklyContent.tsx

const moduleContent = {
  week0: {
    title: "Introduction to MCT",
    readingTime: 5,
    content: `...`, // From Module 3 spec
    tryNow: {
      instruction: "Notice any thought. Say 'A thought is here'",
      duration: 30
    },
    exercises: ['observation'],
    experiments: []
  },
  // ... weeks 1-8
};
```

**Content Delivery System:**
```typescript
// File: client/src/pages/Program.tsx

const UnlockLogic = {
  canUnlock: (week: number, userProgress: Progress) => {
    if (week === 0) return true;
    if (week === 1) return userProgress.onboardingComplete;

    // Week N requires Week N-1 complete OR 7 days + minimum practice
    const prevComplete = userProgress.weeks[week-1]?.completed;
    const daysSinceUnlock = /* calculate */;
    const minimumPractice =
      userProgress.attMinutes >= 50 &&
      userProgress.dmCount >= 6;

    return prevComplete || (daysSinceUnlock >= 7 && minimumPractice);
  }
};
```

**Visual Verification:**
```javascript
await page.goto('http://localhost:3000/program');
await page.screenshot({ path: 'verify/program-week-list.png' });

// Verify progressive unlock
const week0 = await page.$('[data-week="0"]');
assert(await week0.evaluate(el => !el.classList.contains('locked')));

const week2 = await page.$('[data-week="2"]');
assert(await week2.evaluate(el => el.classList.contains('locked')));
```

---

### Step 2.2: ATT Implementation (Module 4)

**Specification Requirements:**
- 12-15 minute standard track
- 4 distinct phases
- Post-session ratings
- Audio delivery

**Implementation Tasks:**

```typescript
// 1. Create ATT audio player
// File: client/src/pages/exercises/ATTSession.tsx

interface ATTPhase {
  name: string;
  duration: number;
  instructions: string;
  audioGuide: string;
}

const ATTProtocol: ATTPhase[] = [
  {
    name: "Selective Attention",
    duration: 180, // 3 minutes
    instructions: "Focus on distant sound... now switch...",
    audioGuide: "/audio/att-phase1.mp3"
  },
  // Phases 2-4...
];

// 2. Create ATT progress tracker
const ATTTracker = {
  phaseStartTime: Date.now(),
  intrusions: 0,

  markIntrusion: () => {
    this.intrusions++;
  },

  completePhase: (phase: number, rating: number) => {
    // Store phase completion
  }
};
```

**Audio Recording Requirements:**
```markdown
## ATT Audio Scripts (for recording)

### File: att-phase1.mp3 (3:00)
"Focus your attention on the most distant sound you can hear...
[30 second pause]
Now switch your attention to a closer sound..."

### File: att-phase2.mp3 (4:00)
"Now rapidly switch attention between different sounds..."
```

**Visual Verification:**
```javascript
await page.goto('http://localhost:3000/exercises/att');
await page.screenshot({ path: 'verify/att-start.png' });

// Start session
await page.click('[data-start-att]');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'verify/att-playing.png' });

// Verify phase indicators
const phases = await page.$$('[data-phase]');
assert(phases.length === 4, 'Should have 4 ATT phases');

// Complete and rate
await page.waitForTimeout(15 * 60 * 1000); // Wait for completion
await page.screenshot({ path: 'verify/att-rating.png' });
```

---

### Step 2.3: DM Practice System (Module 4)

**Specification Requirements:**
- 60-180 second practices
- LAPR method
- 3x daily minimum
- Confidence ratings

**Implementation Tasks:**

```typescript
// 1. Create DM practice component
// File: client/src/components/exercises/DMPractice.tsx

const DMPracticeFlow = {
  phases: [
    { name: 'Label', duration: 15, prompt: 'Notice and label: "A thought is here"' },
    { name: 'Allow', duration: 15, prompt: "Don't push it away" },
    { name: 'Position', duration: 20, prompt: 'Watch like TV in another room' },
    { name: 'Refocus', duration: 10, prompt: 'Return attention to breath' }
  ],

  metaphors: [
    { id: 'clouds', visual: '☁️', description: 'Thoughts drift by like clouds' },
    { id: 'radio', visual: '📻', description: 'Background radio playing' },
    { id: 'train', visual: '🚂', description: 'Train passing without boarding' }
  ]
};
```

**Visual Verification:**
```javascript
await page.goto('http://localhost:3000/exercises/dm');
await page.screenshot({ path: 'verify/dm-start.png' });

// Select metaphor
await page.click('[data-metaphor="clouds"]');
await page.screenshot({ path: 'verify/dm-metaphor-selected.png' });

// Complete practice
await page.click('[data-start-dm]');
for (let phase of ['label', 'allow', 'position', 'refocus']) {
  await page.waitForSelector(`[data-phase="${phase}"]`);
  await page.screenshot({ path: `verify/dm-${phase}.png` });
  await page.waitForTimeout(15000);
}

// Rate confidence
await page.screenshot({ path: 'verify/dm-rating.png' });
```

---

### Step 2.4: Behavioral Experiments (Module 5)

**Specification Requirements:**
- 12 core experiment templates
- Prediction → Outcome → Learning
- Belief re-rating
- Measurable outcomes

**Implementation Tasks:**

```typescript
// 1. Create experiment system
// File: client/src/pages/Experiments.tsx

interface ExperimentTemplate {
  id: string;
  name: string;
  targetBelief: string;
  protocol: ExperimentStep[];
  metrics: MetricDefinition[];
  duration: string;
}

const experiments: ExperimentTemplate[] = [
  {
    id: 'postponement-control',
    name: 'Postponement Control Test',
    targetBelief: 'My worry is uncontrollable',
    protocol: [
      { day: 1, task: 'Detect 3 worry episodes', metric: 'count' },
      { day: 1, task: 'Rate urge and postpone', metric: 'urge_rating' },
      // ...
    ],
    metrics: [
      { name: 'success_rate', type: 'percentage' },
      { name: 'urge_reduction', type: 'delta' }
    ],
    duration: '3 days'
  },
  // ... 11 more experiments
];
```

**Visual Verification:**
```javascript
await page.goto('http://localhost:3000/experiments');
await page.screenshot({ path: 'verify/experiments-list.png' });

// Start experiment
await page.click('[data-experiment="postponement-control"]');
await page.screenshot({ path: 'verify/experiment-setup.png' });

// Make prediction
await page.type('[data-prediction]', 'I will be able to postpone 50% of episodes');
await page.screenshot({ path: 'verify/experiment-prediction.png' });

// Complete protocol (simulated)
// ...

// Record outcome
await page.screenshot({ path: 'verify/experiment-outcome.png' });

// Re-rate belief
await page.screenshot({ path: 'verify/experiment-belief-change.png' });
```

---

## PHASE 3: ENGAGEMENT & POLISH

### Step 3.1: Progress Visualization (Module 7)

**Specification Requirements:**
- Worry/rumination trend lines
- Belief rating spider charts
- Practice consistency heatmaps
- Process-only insights

**Implementation Tasks:**

```typescript
// 1. Create progress dashboard
// File: client/src/pages/Progress.tsx

import { LineChart, RadarChart, HeatMap } from 'recharts';

const ProgressDashboard = () => {
  return (
    <>
      <CASTimeChart /> {/* Worry/rumination minutes over time */}
      <BeliefSpider /> {/* 3-axis belief ratings */}
      <PracticeHeatmap /> {/* Daily ATT/DM completion */}
      <InsightCards /> {/* Process-focused insights */}
    </>
  );
};

const generateInsights = (data: ProgressData): Insight[] => {
  const insights = [];

  // Process-only insights
  if (data.worryReduction > 20) {
    insights.push({
      type: 'positive',
      text: `Your worry time decreased ${data.worryReduction}% this week`
    });
  }

  // Never mention content
  // ❌ "You worried less about work"
  // ✅ "You postponed 8 of 10 episodes successfully"

  return insights;
};
```

**Visual Verification:**
```javascript
await page.goto('http://localhost:3000/progress');
await page.screenshot({ path: 'verify/progress-dashboard.png', fullPage: true });

// Verify all charts present
const charts = ['cas-trend', 'belief-spider', 'practice-heatmap'];
for (const chart of charts) {
  const element = await page.$(`[data-chart="${chart}"]`);
  assert(element, `Missing chart: ${chart}`);
}

// Verify process-only insights
const insights = await page.$$('[data-insight]');
for (const insight of insights) {
  const text = await insight.evaluate(el => el.textContent);
  assert(!text.includes('about'), 'Content-focused insight found');
}
```

---

### Step 3.2: Personalization System (Module 8)

**Specification Requirements:**
- Adaptation based on practice patterns
- Style preferences (metaphors, tone)
- Pacing adjustments
- No ML/AI required

**Implementation Tasks:**

```typescript
// 1. Create personalization engine
// File: server/src/services/personalization.ts

class PersonalizationEngine {
  static analyzePattern(user: UserData): UserPattern {
    const weeklyATT = /* calculate */;
    const weeklyDM = /* calculate */;

    if (weeklyATT < 30 && weeklyDM < 5) {
      return 'low-practice';
    } else if (weeklyATT > 100 && weeklyDM > 14) {
      return 'high-practice';
    } else {
      return 'standard';
    }
  }

  static getRecommendations(pattern: UserPattern) {
    switch(pattern) {
      case 'low-practice':
        return {
          suggestions: ['Try 7-minute ATT', 'Set 3 DM alarms'],
          unlock: 'restricted',
          emphasis: 'postponement'
        };
      case 'high-practice':
        return {
          suggestions: ['Ready for advanced experiments'],
          unlock: 'early-available',
          emphasis: 'experiments'
        };
    }
  }
}
```

**Visual Verification:**
```javascript
// Simulate low practice pattern
await createUserWithPattern('low-practice');
await page.goto('http://localhost:3000/today');
await page.screenshot({ path: 'verify/personalized-low-practice.png' });

// Should see simplified options
const shortATT = await page.$('[data-att-variant="short"]');
assert(shortATT, 'Short ATT option not shown for low practice user');
```

---

### Step 3.3: Engagement Mechanics (Module 9)

**Specification Requirements:**
- Process-only rewards
- Gentle streaks
- Commitment prompts
- MCT-safe mechanics

**Implementation Tasks:**

```typescript
// 1. Create engagement system
// File: client/src/components/engagement/Streaks.tsx

const MCTSafeStreaks = {
  // ✅ Process streaks
  attStreak: { current: 5, longest: 12, emoji: '🎧' },
  dmStreak: { current: 3, longest: 8, emoji: '🧘' },
  loggingStreak: { current: 7, longest: 7, emoji: '📊' },

  // ❌ Never track:
  // - "Worry-free days"
  // - "No anxiety streaks"
  // - Content-based achievements
};

const CommitmentDevice = () => {
  return (
    <WeeklyCommitment
      options={[
        'Daily ATT no matter what',
        '3 DM practices minimum',
        'Postpone all postponable worries',
        'One experiment this week'
      ]}
      onCommit={(choice) => {
        // Store and remind
      }}
    />
  );
};
```

**Visual Verification:**
```javascript
await page.goto('http://localhost:3000/today');
await page.screenshot({ path: 'verify/streaks-display.png' });

// Verify process-only streaks
const streaks = await page.$$('[data-streak]');
for (const streak of streaks) {
  const type = await streak.getAttribute('data-streak-type');
  assert(['att', 'dm', 'logging'].includes(type), 'Invalid streak type');
}

// Test commitment prompt
if (await page.$('[data-weekly-commitment]')) {
  await page.screenshot({ path: 'verify/commitment-prompt.png' });
}
```

---

## Visual Verification Suite

### Automated Test Script

```javascript
// File: verify/visual-tests.js

const puppeteer = require('puppeteer');
const assert = require('assert');

async function runVisualTests() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const tests = [
    {
      name: 'Onboarding Flow',
      steps: [
        { action: 'navigate', url: '/onboarding' },
        { action: 'screenshot', name: 'onboarding-1-welcome' },
        { action: 'click', selector: '[data-next]' },
        { action: 'screenshot', name: 'onboarding-2-assessment' },
        { action: 'verify', check: 'no-content-fields' },
        // ... complete flow
        { action: 'measure', metric: 'completion-time', max: 420 } // 7 minutes
      ]
    },
    {
      name: 'Daily Flow',
      steps: [
        { action: 'navigate', url: '/today' },
        { action: 'screenshot', name: 'today-tasks' },
        { action: 'click', selector: '[data-task="att"]' },
        { action: 'screenshot', name: 'att-session' },
        // ... complete daily routine
        { action: 'measure', metric: 'daily-burden', max: 1200 } // 20 minutes
      ]
    },
    {
      name: 'Fidelity Checks',
      steps: [
        { action: 'navigate', url: '/log' },
        { action: 'type', selector: '[data-notes]', text: 'worried about work' },
        { action: 'submit' },
        { action: 'verify', check: 'fidelity-warning-shown' },
        { action: 'screenshot', name: 'fidelity-block' }
      ]
    }
  ];

  for (const test of tests) {
    console.log(`Running: ${test.name}`);
    await runTest(page, test);
  }

  await browser.close();
}

runVisualTests();
```

---

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Onboarding optimization
- [ ] CAS measurement system
- [ ] Fidelity enforcement
- [ ] Visual verification: Phase 1

### Week 3-4: Content & Exercises
- [ ] Weekly module delivery
- [ ] ATT implementation
- [ ] DM practice system
- [ ] Behavioral experiments
- [ ] Visual verification: Phase 2

### Week 5-6: Engagement & Polish
- [ ] Progress visualization
- [ ] Personalization engine
- [ ] Engagement mechanics
- [ ] Visual verification: Phase 3

### Week 7: Integration Testing
- [ ] End-to-end user journey
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Final visual verification

### Week 8: Launch Preparation
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation
- [ ] Launch checklist

---

## Success Criteria

### Technical Metrics
- [ ] Onboarding: ≤7 minutes
- [ ] Daily burden: ≤20 minutes
- [ ] Load times: <2 seconds
- [ ] Offline capability: 100%

### Clinical Fidelity
- [ ] Zero content analysis
- [ ] All metrics process-focused
- [ ] MCT protocols exact
- [ ] Crisis routing functional

### User Experience
- [ ] 3-tap maximum for actions
- [ ] Visual feedback immediate
- [ ] Progress clearly shown
- [ ] Personalization working

### Visual Verification
- [ ] All screenshots captured
- [ ] No regressions detected
- [ ] Accessibility passing
- [ ] Mobile responsive

---

*This implementation plan provides a systematic approach to building the MCT Digital Therapeutic with continuous visual verification at every step.*