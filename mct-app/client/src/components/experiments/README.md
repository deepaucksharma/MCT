# Module 5: Behavioral Experiments System

## Overview

This implementation provides a complete behavioral experiment system for MCT (Metacognitive Therapy) based on the Module 5 specification. The system includes all 12 core experiments designed to test metacognitive beliefs through direct behavioral experience.

## Key Features

### 🎯 Complete Experiment Library
- **12 Core Experiments**: All experiments from the Module 5 specification
- **Difficulty Levels**: Easy, Moderate, Challenging
- **Week Recommendations**: Suggested timing for each experiment
- **Target Beliefs**: Specific metacognitive beliefs each experiment tests

### 🔄 Full Workflow Support
- **Prediction Entry**: Capture specific, measurable predictions
- **Protocol Execution**: Step-by-step guidance through experiment protocols
- **Outcome Recording**: Structured data collection with metrics
- **Belief Re-rating**: Before/after belief strength measurement
- **Learning Capture**: Key insights and learning statements

### 📊 Advanced Data Management
- **Enhanced Data Models**: Support for complex experiment workflows
- **Session Management**: Multi-day experiment tracking
- **Metrics System**: Quantitative and qualitative measurements
- **Progress Tracking**: Protocol step completion monitoring

### 🎨 User Interface Components
- **Experiment Dashboard**: Overview of all experiments and progress
- **Experiment Selector**: Choose experiments by week or difficulty
- **Experiment Workflow**: Guided step-by-step execution
- **Responsive Design**: Works on desktop and mobile devices

## The 12 Core Experiments

### Week 1-2 (Foundation)
1. **Postponement Control Test** - "My worry is uncontrollable"
2. **Time-to-Refocus Drill** - "Once I start worrying, I can't stop"

### Week 2-3 (Belief Testing)
3. **No-Monitoring Window** - "If I don't monitor, I'll miss something dangerous"
4. **Checking Reduction Challenge** - "I must check or something bad will happen"
5. **Reassurance Seeking Fade** - "I need reassurance to cope"

### Week 4-5 (Belief Comparison)
6. **Plan-Then-Act vs Worry-First** - "Worry helps me prepare better"
7. **DM Micro-Intervals** - "I can't detach from important thoughts"

### Week 5-6 (Advanced Testing)
8. **ATT-Lite in Trigger** - "I lose all control when triggered"
9. **Allow-the-Thought Windows** - "Having worry thoughts is dangerous"

### Week 6-7 (Challenging Tests)
10. **Drop One Safety Net** - "I need [specific safety behavior] to cope"
11. **Content Timer Experiment** - "I must think things through completely"
12. **Stress Test Composite** - "I can't use MCT skills in real situations"

## Technical Architecture

### Frontend Components
```
/components/experiments/
├── ExperimentDashboard.tsx    # Main experiment overview
├── ExperimentSelector.tsx     # Template selection interface
├── ExperimentWorkflow.tsx     # Step-by-step experiment execution
├── experimentTemplates.ts     # All 12 experiment definitions
├── experiments.css            # Styling for all components
├── index.ts                   # Component exports
├── ExperimentTest.tsx         # Testing component
└── README.md                  # This documentation
```

### Backend API Endpoints
```
GET    /api/experiments/templates        # Get all experiment templates
GET    /api/experiments/templates/:id    # Get specific template
GET    /api/experiments                  # Get user's experiments
POST   /api/experiments                  # Create new experiment
PUT    /api/experiments/:id              # Update experiment
POST   /api/experiments/:id/complete     # Complete experiment
GET    /api/experiments/:id/sessions     # Get experiment sessions
POST   /api/experiments/:id/sessions     # Create session
PUT    /api/experiments/:id/sessions/:sessionId  # Update session
```

### Database Schema
```sql
-- Main experiments table
CREATE TABLE experiments (
  id INTEGER PRIMARY KEY,
  template_id TEXT,
  week_number INTEGER,
  belief_tested TEXT NOT NULL,
  prediction TEXT NOT NULL,
  safety_behaviors_dropped TEXT,
  protocol_steps TEXT NOT NULL,
  metrics TEXT,
  status TEXT CHECK(status IN ('planned', 'in_progress', 'completed')),
  outcome TEXT,
  learning TEXT,
  belief_rating_before INTEGER CHECK(belief_rating_before >= 0 AND belief_rating_before <= 100),
  belief_rating_after INTEGER CHECK(belief_rating_after >= 0 AND belief_rating_after <= 100),
  started_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

-- Sessions for multi-day experiments
CREATE TABLE experiment_sessions (
  id INTEGER PRIMARY KEY,
  experiment_id INTEGER NOT NULL,
  session_date TEXT NOT NULL,
  session_number INTEGER NOT NULL,
  data TEXT,
  completed BOOLEAN DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (experiment_id) REFERENCES experiments(id)
);
```

## Usage Examples

### Basic Integration
```typescript
import { ExperimentDashboard } from './components/experiments';

// In your main app component
<ExperimentDashboard currentWeek={userSettings.current_week} />
```

### Using Templates
```typescript
import { EXPERIMENT_TEMPLATES, getExperimentsByWeek } from './components/experiments';

// Get experiments for current week
const weekExperiments = getExperimentsByWeek(3);

// Get specific template
const postponementTest = EXPERIMENT_TEMPLATES.find(t => t.id === 'postponement-control');
```

### API Integration
```typescript
// Create new experiment from template
const response = await fetch('/api/experiments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template_id: 'postponement-control',
    belief_tested: 'My worry is uncontrollable',
    prediction: 'I predict I will not be able to postpone more than 2 worry episodes',
    week_number: 2,
    protocol_steps: [...],
    status: 'planned'
  })
});
```

## Key Design Principles

### 1. Evidence-Based Structure
- Each experiment follows the Module 5 framework exactly
- Specific belief targets with measurable outcomes
- Clear success criteria and interpretation guidelines

### 2. Process Focus (MCT Fidelity)
- No content analysis or discussion of worry topics
- Focus on HOW thoughts are related to, not WHAT they contain
- Belief testing through experience, not logical debate

### 3. Systematic Progression
- Experiments build from easy to challenging
- Foundation skills (postponement, refocusing) first
- Advanced applications (trigger management) later

### 4. Quantified Measurement
- Before/after belief ratings (0-100 scale)
- Objective metrics where possible
- Clear success thresholds for interpretation

### 5. User Experience
- Intuitive step-by-step workflow
- Progress tracking and motivation
- Flexible scheduling and pacing

## Compliance with Module 5 Specification

✅ **All 12 Core Experiments**: Complete implementation of every experiment from the specification

✅ **Required Components**: Each experiment includes all required elements:
- Belief Under Test (specific statement)
- Prediction (quantifiable when possible)
- Safety Behaviors to Drop (explicit list)
- Protocol Steps (time, place, duration)
- Metrics (objective measurements)
- Outcome Recording (actual vs predicted)
- Belief Re-rating (0-100 before and after)
- Learning Statement (one sentence summary)

✅ **Evidence Quality Standards**: All experiments are:
- Behavioral (not just thought-based)
- Measurable (numbers, not impressions)
- Repeated (multiple trials when possible)
- Specific (targeted to one belief)
- Fair (genuine test, not rigged)

✅ **Proper Sequencing**: Follows recommended order and difficulty progression

✅ **Acceptance Criteria**: Meets all individual and program-level success criteria

## Future Enhancements

- **Analytics Dashboard**: Aggregate data across all experiments
- **Personalization**: Custom experiment creation tools
- **Reminders**: Automated notifications for experiment steps
- **Progress Visualization**: Charts and graphs for belief changes
- **Export Features**: Generate experiment reports and summaries