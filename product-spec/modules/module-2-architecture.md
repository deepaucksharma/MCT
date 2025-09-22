# Module 2: Program Architecture and User Journeys

## Purpose
Define the week-by-week arc, daily cadence, and user flows that minimize cognitive load while maximizing practice adherence and skill acquisition. This module specifies the structural framework that delivers MCT interventions efficiently.

## Program Architecture Overview

### Temporal Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    8-10 WEEK PROGRAM ARC                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Week 0: Orientation & Assessment (Optional)                 │
│    ↓                                                          │
│  Weeks 1-2: Foundation                                       │
│    • CAS mapping    • ATT establishment                      │
│    • Postponement   • Basic DM                               │
│    ↓                                                          │
│  Weeks 3-5: Belief Modification                              │
│    • Positive beliefs  • Uncontrollability                   │
│    • Danger beliefs    • Safety behavior reduction           │
│    ↓                                                          │
│  Weeks 6-7: Advanced Skills                                  │
│    • Flexible attention  • Trigger management                │
│    • Consolidation      • Stress testing                     │
│    ↓                                                          │
│  Week 8+: Maintenance                                        │
│    • Relapse prevention  • Blueprint creation                │
│    • Habit establishment • Booster sessions                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Daily Cadence

```
Morning (2-3 min)          Midday (2-3 min)         Evening (15-20 min)
    │                          │                          │
    ├─ DM Practice #1          ├─ DM Practice #2         ├─ ATT Session (12-15m)
    └─ Quick Check-in          └─ SAR if needed          ├─ DM Practice #3
                                                          └─ Daily Log (60s)

Throughout Day (As Needed):
    • Worry/Rumination Postponement
    • SAR Implementation
    • Experiment Tasks
```

### Weekly Rhythm

| Day | Primary Focus | Tasks |
|-----|--------------|--------|
| Monday | New Module Unlock | Read psychoeducation, set weekly intention |
| Tuesday | Skill Practice | Focus on new technique variant |
| Wednesday | Experiment Setup | Design and begin weekly experiment |
| Thursday | Mid-week Check | Progress review, adjust if needed |
| Friday | Experiment Data | Collect experiment outcomes |
| Saturday | Integration | Apply skills in challenging contexts |
| Sunday | Weekly Review | Re-rate beliefs, plan next week |

## User Journey Maps

### A. Onboarding Journey (≤7 minutes)

#### Step 1: Welcome & Orientation (90 seconds)
```
Screen 1: Welcome
├─ "Change how you relate to thoughts"
├─ "8-10 week evidence-based program"
└─ [Continue]

Screen 2: What MCT Is/Isn't
├─ IS: Process-focused, skill-building
├─ ISN'T: Therapy, diagnosis, content-analysis
└─ [I Understand]

Screen 3: Privacy & Consent
├─ "All data stored locally"
├─ "You own your data"
├─ Age confirmation (18+)
└─ [Accept & Continue]
```

#### Step 2: Lite Case Formulation (3 minutes)
```
Screen 4: Current Experience
├─ Worry amount: [Slider 0-100]
├─ Rumination amount: [Slider 0-100]
├─ Monitoring frequency: [Slider 0-100]
└─ [Next]

Screen 5: Belief Ratings
├─ "My worry is uncontrollable": [0-100]
├─ "Worry is dangerous": [0-100]
├─ "Worry helps me": [0-100]
└─ [Next]

Screen 6: Trigger Categories (No Details)
├─ □ Work/Career
├─ □ Health
├─ □ Relationships
├─ □ Finances
├─ □ Future
└─ [Next]
```

#### Step 3: Goal Setting (90 seconds)
```
Screen 7: Process Goals
├─ □ Reduce worry to <30 min/day
├─ □ Stop checking behaviors
├─ □ Master attention control
├─ □ Complete weekly experiments
└─ [Select 2-3 & Continue]
```

#### Step 4: Scheduling (90 seconds)
```
Screen 8: Daily Practice Times
├─ ATT Session: [Time Picker - Default 8:00 PM]
├─ Morning DM: [Time Picker - Default 8:00 AM]
├─ Midday DM: [Time Picker - Default 1:00 PM]
├─ Evening DM: [Time Picker - Default 6:00 PM]
└─ [Next]

Screen 9: Postponement Slot
├─ Daily Worry Time: [Time Picker - Default 6:30 PM]
├─ Duration: [15 min / 30 min]
├─ □ Enable reminders
└─ [Complete Setup]
```

#### Landing: Today Screen
```
Today's Tasks:
1. ✓ Welcome to MCT (Completed)
2. ○ Evening ATT Session (8:00 PM)
3. ○ Complete Daily Log (Before bed)

[Start First ATT Session]
```

### B. Daily Engagement Flow

#### Morning Flow (6:00 AM - 12:00 PM)
```
Push Notification (8:00 AM)
    ↓
"Morning DM Practice"
    ↓
60-Second DM Exercise
    ↓
Confidence Rating (0-100)
    ↓
Return to Day
```

#### Postponement Flow (Triggered)
```
User Notices Worry
    ↓
Opens App/Widget
    ↓
"Label & Postpone"
    ↓
Urge Rating (0-100)
    ↓
"Postponed to 6:30 PM"
    ↓
SAR Suggestion
    ↓
Return to Activity
```

#### Evening Flow (6:00 PM - 10:00 PM)
```
Postponement Reminder (6:30 PM)
    ↓
"Review Postponed Worries"
    ↓
Current Urge (0-100)
    ↓
[Process 10 min] or [Close Without Processing]
    ↓
ATT Reminder (8:00 PM)
    ↓
12-15 min ATT Session
    ↓
Control Rating (0-100)
    ↓
Daily Log Prompt
    ↓
60-Second Quick Log
    ↓
"See you tomorrow!"
```

### C. Weekly Module Flow

#### Module Unlock (Monday)
```
New Week Available!
    ↓
Week X: [Title]
    ↓
5-Minute Read
    ↓
"Try This Now" (30s task)
    ↓
This Week's Focus:
├─ New Skill: [Name]
├─ Experiment: [Title]
└─ Belief Target: [Type]
    ↓
Updated Today Screen
```

#### Experiment Flow (Wednesday-Friday)
```
"Set Up Your Experiment"
    ↓
Select Template or Custom
    ↓
Make Prediction (0-100)
    ↓
Identify Safety Behaviors to Drop
    ↓
Set Reminders for Steps
    ↓
[Run Experiment]
    ↓
Daily Check-ins
    ↓
Final Outcome Entry
    ↓
Belief Re-rating
    ↓
"What did you learn?"
    ↓
Save Learning Statement
```

#### Weekly Review (Sunday)
```
"Week X Review"
    ↓
CAS Metrics Summary
├─ Worry: X min/day (↓20%)
├─ Postponement: X% success
└─ Practices: X ATT, X DM
    ↓
Re-rate Beliefs (0-100)
    ↓
Experiment Outcomes
    ↓
"Ready for Week X+1?"
    ↓
[Unlock Next] or [Review Again]
```

## User State Management

### Progress States

1. **Onboarding State**
   - Not started
   - In progress (track step)
   - Completed

2. **Daily State**
   - Fresh (no activities today)
   - Partial (some tasks complete)
   - Complete (all core tasks done)

3. **Weekly State**
   - Locked (previous week incomplete)
   - Available (ready to start)
   - In progress (module read, experiment active)
   - Complete (all components done)

4. **Program State**
   - Active (Weeks 1-8)
   - Extended (Weeks 9-10)
   - Maintenance (Post-program)
   - Paused (Inactive >7 days)

### Unlock Criteria

#### Automatic Unlocks
- Week 0: Always available
- Week 1: After onboarding complete

#### Conditional Unlocks (Week N+1)
Requires ONE of:
- Week N marked complete
- 7 days elapsed + minimum practice:
  - ≥3 ATT sessions in past week
  - ≥6 DM practices in past week
  - ≥3 daily logs in past week

#### Manual Override
- User can request early unlock with warning:
  "Skipping ahead may reduce effectiveness. Continue anyway?"

## Navigation Architecture

### Primary Navigation (Tab Bar)

```
┌────────┬────────┬────────┬────────┬────────┐
│ Today  │Program │  Log   │Progress│  More  │
└────────┴────────┴────────┴────────┴────────┘
    ↓         ↓        ↓        ↓        ↓
  Tasks   Modules   Quick   Charts  Settings
          Content    Log    Insights Profile
                  History           Help
```

### Screen Hierarchy

```
Root
├── Today
│   ├── Task List
│   ├── Quick Actions
│   └── Daily Summary
│
├── Program
│   ├── Week List
│   ├── Week Detail
│   │   ├── Psychoeducation
│   │   ├── Exercises
│   │   └── Experiments
│   └── Resources
│
├── Log
│   ├── Quick Log
│   ├── Postponement Tool
│   ├── History
│   └── Patterns
│
├── Progress
│   ├── Dashboard
│   ├── Trends
│   ├── Achievements
│   └── Insights
│
└── More
    ├── Profile
    ├── Settings
    │   ├── Reminders
    │   ├── Privacy
    │   └── Data Export
    ├── Help
    │   ├── FAQs
    │   ├── MCT Guide
    │   └── Crisis Resources
    └── About
```

## Interaction Patterns

### Quick Actions
- **3-Tap Rule**: Any core action accessible within 3 taps
- **One-Thumb Design**: All primary actions reachable with thumb
- **Persistent Actions**: Postponement and crisis help always visible

### Data Entry Optimization
- **Sliders over typing**: For all 0-100 ratings
- **Smart defaults**: Pre-populated based on patterns
- **Batch entry**: Group similar metrics together

### Feedback Patterns
- **Immediate confirmation**: Every action acknowledged
- **Progress indicators**: Show completion status
- **Gentle nudges**: Non-intrusive practice reminders

## Accessibility Requirements

### Visual
- **Contrast**: WCAG AA minimum (4.5:1)
- **Font scaling**: Support 200% zoom
- **Color independence**: Not solely color-coded

### Motor
- **Touch targets**: Minimum 44x44 points
- **Gesture alternatives**: All gestures have button alternatives
- **Time limits**: No time pressure except experiments

### Cognitive
- **Simple language**: 8th-grade reading level
- **Clear instructions**: Step-by-step guidance
- **Error recovery**: Undo/edit for all entries

## Performance Targets

### Load Times
- **App launch**: <2 seconds
- **Screen transitions**: <300ms
- **Data saves**: <500ms
- **Audio start**: <1 second

### Offline Capability
- **Core features**: 100% offline after initial download
- **Audio files**: Cached after first play
- **Data sync**: When connection restored

### Battery Efficiency
- **Background activity**: Minimal (notifications only)
- **Audio playback**: Optimized codecs
- **Screen time**: Auto-dim during ATT

## Acceptance Criteria

### Onboarding Success
- [ ] ≥85% complete within 7 minutes
- [ ] ≥90% reach Today screen
- [ ] ≥70% complete first ATT same day
- [ ] 0% critical errors

### Daily Engagement
- [ ] Average session: <3 minutes (except ATT)
- [ ] Daily burden: ≤20 minutes total
- [ ] Task completion: ≥60% of scheduled items
- [ ] Postponement success: ≥50% of episodes

### Weekly Progress
- [ ] Module completion: ≥40% by day 7
- [ ] Experiment start: ≥30% by day 3
- [ ] Belief re-rating: 100% of completers
- [ ] Unlock rate: ≥60% automatic (vs manual)

### Retention Metrics
- [ ] Day 1: ≥70% return
- [ ] Week 1: ≥40% active 4+ days
- [ ] Week 4: ≥25% reach milestone
- [ ] Week 8: ≥15% complete program

---

*Module 2 defines the structural framework that ensures MCT interventions are delivered efficiently with minimal friction and maximum engagement.*