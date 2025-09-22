# MCT Digital Therapeutic - Comprehensive E2E Test Scenarios

## Overview
This document defines comprehensive end-to-end test scenarios for the MCT Digital Therapeutic application, including database verification and visual regression testing.

## Test Categories

### 1. ONBOARDING & INITIAL ASSESSMENT
#### Test ID: ON-001 - Complete Onboarding Flow
**Objective**: Verify complete onboarding process within 7 minutes
**Database Checks**:
- user_settings.onboarding_completed = 1
- assessments table has initial assessment record
- belief_ratings has baseline entries
**Visual Verification**:
- Screenshot each onboarding step
- Verify no content input fields present
- Check MCT fidelity statements displayed
**Timing**: Must complete in ≤7 minutes

#### Test ID: ON-002 - Fidelity Guard During Onboarding
**Objective**: Verify content blocking in assessment
**Steps**:
1. Attempt to enter content-focused text
2. Verify fidelity warning appears
3. Check blocked content not stored
**Database Checks**:
- fidelity_violations table has entry
- No content stored in assessments

### 2. DAILY CAS LOGGING
#### Test ID: CAS-001 - Complete Daily CAS Log
**Objective**: Verify CAS metrics capture
**Input Data**:
- worry_minutes: 45
- rumination_minutes: 30
- monitoring_count: 8
- checking_count: 5
**Database Checks**:
- cas_logs entry created with correct values
- updated_at timestamp current
**Visual Verification**:
- All metric inputs visible
- No content fields present
- Process-only labels

#### Test ID: CAS-002 - CAS Trend Analysis
**Objective**: Verify 7-day and 30-day trends
**Setup**: Create 30 days of CAS data
**Database Checks**:
- Query aggregated metrics
- Verify trend calculations
**Visual Verification**:
- Line chart displays correctly
- Trend indicators accurate

### 3. ATT (ATTENTION TRAINING TECHNIQUE)
#### Test ID: ATT-001 - Complete Standard ATT Session
**Objective**: Full 12-minute ATT completion
**Steps**:
1. Start ATT session
2. Complete all 4 phases
3. Rate each phase
**Database Checks**:
- att_sessions record created
- duration_minutes = 12
- All ratings stored
**Visual Verification**:
- Phase progress indicators
- Audio player controls
- Rating interface
**Performance**: Audio loads <2s

#### Test ID: ATT-002 - Short ATT Variant
**Objective**: Complete 7-minute variant
**Database Checks**:
- script_type = 'short'
- duration_minutes = 7

#### Test ID: ATT-003 - ATT Streak Tracking
**Objective**: Verify consecutive day tracking
**Database Checks**:
- streaks table att type updated
- current_streak incremented
- longest_streak updated if exceeded

### 4. DETACHED MINDFULNESS (DM)
#### Test ID: DM-001 - Complete DM Practice
**Objective**: Full LAPR cycle completion
**Steps**:
1. Select metaphor (clouds/radio/train)
2. Complete Label phase (15s)
3. Complete Allow phase (15s)
4. Complete Position phase (20s)
5. Complete Refocus phase (10s)
6. Rate confidence
**Database Checks**:
- dm_practices entry created
- metaphor_used stored
- confidence_rating recorded
**Visual Verification**:
- Metaphor selection UI
- Phase transitions smooth
- Timer displays

#### Test ID: DM-002 - Multiple Daily DM
**Objective**: Complete 3 DM practices in one day
**Database Checks**:
- 3 dm_practices entries for date
- Different time_of_day values
**Engagement Check**:
- dm streak maintained

### 5. POSTPONEMENT
#### Test ID: POST-001 - Worry Postponement
**Objective**: Postpone and process worry episode
**Steps**:
1. Log worry trigger at 14:00
2. Schedule for 18:30 slot
3. Rate urge before (80)
4. Process at scheduled time
5. Rate urge after (30)
**Database Checks**:
- postponement_logs entry created
- urge_before = 80
- urge_after = 30
- processed = 1
**Visual Verification**:
- Postponement scheduler UI
- Reminder notification
- Processing interface

#### Test ID: POST-002 - Postponement Success Rate
**Objective**: Track postponement effectiveness
**Setup**: Create 10 postponement episodes
**Database Checks**:
- Calculate success_rate
- Verify urge reduction metrics

### 6. BEHAVIORAL EXPERIMENTS
#### Test ID: EXP-001 - Postponement Control Experiment
**Objective**: Complete 3-day postponement experiment
**Steps**:
1. Start experiment
2. Make prediction (50% success)
3. Complete 3 days of protocol
4. Record outcomes
5. Re-rate belief
**Database Checks**:
- experiments table entry
- experiment_sessions for each day
- belief_rating_before/after changed
- status = 'completed'
**Visual Verification**:
- Experiment setup wizard
- Daily protocol checklist
- Outcome recording form
- Belief change graph

#### Test ID: EXP-002 - Ban/Binge Experiment
**Objective**: Complete worry ban/binge protocol
**Database Checks**:
- Verify protocol_steps JSON
- Track metrics for each phase

### 7. SAR PLANS
#### Test ID: SAR-001 - Create SAR Plan
**Objective**: Create if-then implementation intention
**Input**:
- Trigger: "Phone notification"
- If: "I see a news alert"
- Then: "Focus on 3 objects around me"
**Database Checks**:
- sar_plans entry created
- active = 1
**Visual Verification**:
- SAR builder interface
- Plan display card

#### Test ID: SAR-002 - SAR Usage Tracking
**Objective**: Track SAR plan effectiveness
**Database Checks**:
- usage_count incremented
- success_rate calculated

### 8. WEEKLY MODULES
#### Test ID: MOD-001 - Module Unlock Progression
**Objective**: Verify weekly unlock logic
**Steps**:
1. Complete Week 0
2. Wait 7 days OR meet practice criteria
3. Verify Week 1 unlocks
**Database Checks**:
- program_modules.unlocked = 1 for appropriate weeks
- unlocked_date set
**Visual Verification**:
- Locked/unlocked module states
- Progress indicators

#### Test ID: MOD-002 - Module Content Delivery
**Objective**: Complete weekly module
**Database Checks**:
- completed = 1
- completed_date set
**Visual Verification**:
- Content renders correctly
- Try-now exercises functional
- Key points displayed

### 9. BELIEF RATINGS
#### Test ID: BEL-001 - Weekly Belief Re-rating
**Objective**: Track belief changes over time
**Input**:
- Uncontrollability: 75 → 60 → 45
- Danger: 80 → 70 → 55
- Positive: 65 → 50 → 35
**Database Checks**:
- belief_ratings entries for each week
- Verify trend calculations
**Visual Verification**:
- Spider chart updates
- Trend lines accurate

### 10. PROGRESS VISUALIZATION
#### Test ID: PROG-001 - Dashboard Metrics
**Objective**: Verify all progress visualizations
**Setup**: 4 weeks of complete data
**Visual Verification**:
- CAS trend chart (worry/rumination minutes)
- Belief spider chart (3 axes)
- Practice heatmap (ATT/DM daily)
- Insight cards (process-only)
**Database Queries**:
- Aggregate CAS metrics by week
- Calculate practice consistency
- Generate process insights

#### Test ID: PROG-002 - Export Progress Report
**Objective**: Generate PDF progress summary
**Verification**:
- PDF contains all charts
- Data matches database
- Formatting correct

### 11. ENGAGEMENT MECHANICS
#### Test ID: ENG-001 - Streak Tracking
**Objective**: Verify all streak types
**Database Checks**:
- att streak increments daily
- dm streak requires 3+ daily
- logging streak for CAS logs
- overall streak combines all
**Visual Verification**:
- Streak displays with emojis
- Longest streak shown

#### Test ID: ENG-002 - Commitment Device
**Objective**: Weekly commitment and reminders
**Steps**:
1. Select weekly commitment
2. Receive daily reminders
3. Track completion
**Database Checks**:
- Commitment stored
- Reminder notifications created

### 12. PERSONALIZATION
#### Test ID: PERS-001 - Low Practice Adaptation
**Objective**: Adapt for low-engaging user
**Setup**: Create user with <30min ATT, <5 DM weekly
**Verification**:
- Simplified options offered
- Restricted module unlocks
- Emphasis on basic practices

#### Test ID: PERS-002 - High Practice Recognition
**Objective**: Adapt for high-engaging user
**Setup**: Create user with >100min ATT, >14 DM weekly
**Verification**:
- Advanced experiments available
- Early module unlocks
- Additional challenges offered

### 13. NOTIFICATIONS
#### Test ID: NOT-001 - Daily Reminder Schedule
**Objective**: Verify notification timing
**Database Checks**:
- notifications table entries
- scheduled_time matches settings
- sent flag updates
**System Verification**:
- Notifications appear at correct times

### 14. FIDELITY COMPLIANCE
#### Test ID: FID-001 - Content Blocking
**Objective**: Block all content analysis
**Test Cases**:
- "I'm worried about my health"
- "What if something bad happens"
- "I keep thinking about work"
**Database Checks**:
- fidelity_violations logged
- blocked = 1
- No content stored

#### Test ID: FID-002 - Process-Only Insights
**Objective**: Verify no content in insights
**Verification**:
- All insights mention time/frequency only
- No "about" statements
- No content references

### 15. CRISIS ROUTING
#### Test ID: CRISIS-001 - Crisis Detection
**Objective**: Detect and route crisis indicators
**Input**: Crisis-indicating responses
**Verification**:
- Crisis resources displayed
- Session data not stored
- Appropriate routing message

### 16. PERFORMANCE METRICS
#### Test ID: PERF-001 - Page Load Times
**Objective**: All pages load <2 seconds
**Pages to Test**:
- /today
- /program
- /progress
- /exercises/att
- /experiments
**Measurement**: Time to interactive

#### Test ID: PERF-002 - Daily Burden
**Objective**: Total daily tasks ≤20 minutes
**Timing**:
- CAS log: 2 minutes
- ATT session: 12 minutes
- DM practices (3x): 6 minutes
**Verification**: Sum ≤20 minutes

### 17. DATA INTEGRITY
#### Test ID: DATA-001 - Concurrent Updates
**Objective**: Handle simultaneous data updates
**Test**: Multiple tabs updating same data
**Verification**:
- No data loss
- Consistent state
- Proper conflict resolution

#### Test ID: DATA-002 - Data Export
**Objective**: Export all user data
**Verification**:
- Complete data export
- JSON format valid
- All tables included

### 18. ACCESSIBILITY
#### Test ID: ACC-001 - Screen Reader
**Objective**: Full app navigable via screen reader
**Verification**:
- All interactive elements labeled
- Focus management correct
- ARIA attributes present

#### Test ID: ACC-002 - Keyboard Navigation
**Objective**: Complete tasks keyboard-only
**Verification**:
- Tab order logical
- All functions accessible
- No keyboard traps

### 19. OFFLINE FUNCTIONALITY
#### Test ID: OFF-001 - Offline Practice
**Objective**: Core functions work offline
**Test**:
- Complete ATT offline
- Complete DM offline
- Log CAS offline
**Verification**:
- Data syncs when online
- No data loss

### 20. END-TO-END USER JOURNEYS
#### Test ID: E2E-001 - Week 1 Complete Journey
**Objective**: Complete first week of program
**Steps**:
1. Complete onboarding (7 min)
2. Daily: CAS log (2 min)
3. Daily: ATT session (12 min)
4. Daily: 3x DM practice (6 min)
5. Set up postponement
6. Complete Week 0 module
7. Start first experiment
**Database Verification**:
- 7 days of complete data
- All tables have appropriate entries
- Streaks maintained
**Visual Verification**:
- Screenshot each major step
- Progress visible throughout

#### Test ID: E2E-002 - 4-Week Program Journey
**Objective**: Complete 4 weeks with realistic usage
**Simulation**:
- Variable daily compliance (60-90%)
- Some missed days
- Gradual improvement in metrics
**Verification**:
- Belief ratings decrease ≥15 points
- CAS minutes decrease ≥20%
- Module progression appropriate
- Personalization activated

## Test Data Requirements

### Baseline Test User Profiles
1. **New User**: Fresh install, no data
2. **Week 1 User**: 7 days data, high compliance
3. **Week 4 User**: 28 days data, moderate compliance
4. **Low Engagement User**: Sporadic usage pattern
5. **High Engagement User**: Perfect compliance
6. **Recovered User**: Showing improvement trends

### Test Data Generators
- CAS log generator (realistic patterns)
- ATT session generator (varying compliance)
- DM practice generator (multiple daily)
- Belief rating progression generator

## Visual Regression Test Points

### Critical Screenshots
1. Onboarding - each step
2. Today page - morning/evening states
3. CAS log form - empty/filled
4. ATT player - all phases
5. DM practice - all phases
6. Progress dashboard - with data
7. Experiment setup/outcome
8. Module content pages
9. Belief rating interfaces
10. Error states

## Database Verification Queries

### Daily Metrics Verification
```sql
-- Verify daily completion
SELECT
  date,
  (SELECT COUNT(*) FROM cas_logs WHERE date = d.date) as cas_logged,
  (SELECT COUNT(*) FROM att_sessions WHERE date = d.date) as att_completed,
  (SELECT COUNT(*) FROM dm_practices WHERE date = d.date) as dm_count
FROM (SELECT DISTINCT date FROM cas_logs) d
ORDER BY date DESC;
```

### Belief Change Tracking
```sql
-- Track belief changes over time
SELECT
  belief_type,
  MIN(rating) as lowest,
  MAX(rating) as highest,
  AVG(rating) as average,
  (MAX(rating) - MIN(rating)) as change
FROM belief_ratings
GROUP BY belief_type;
```

### Fidelity Compliance Check
```sql
-- Monitor fidelity violations
SELECT
  violation_type,
  COUNT(*) as count,
  MAX(timestamp) as last_violation
FROM fidelity_violations
WHERE blocked = 1
GROUP BY violation_type;
```

## Automation Framework

### Test Execution Order
1. Database setup/teardown
2. User profile creation
3. Component tests
4. Integration tests
5. User journey tests
6. Performance tests
7. Visual regression
8. Report generation

### Reporting Requirements
- Test execution summary
- Failed test details with screenshots
- Database state snapshots
- Performance metrics
- Visual regression diffs
- Fidelity violation log

## Success Criteria
- 100% core feature coverage
- All fidelity checks passing
- Performance targets met
- No critical bugs
- Visual regression <5% diff
- Database integrity maintained