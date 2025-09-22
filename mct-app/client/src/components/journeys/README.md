# MCT App Module 2 User Journeys

This directory contains the implementation of Module 2 user journeys for the MCT app, providing guided, process-focused experiences that ensure users stay within time limits while building metacognitive skills.

## Overview

Three main journey types have been implemented:

1. **Onboarding Journey** (`/onboarding-journey`) - ≤7 minutes
2. **Daily Engagement Journey** (`/daily-journey`) - ≤20 minutes total
3. **Weekly Progression Journey** (`/weekly-journey`) - Variable duration

## Key Features

### Onboarding Journey (≤7 minutes)
- **Time-limited setup** with countdown timer
- **Quick overview** of MCT concepts
- **Initial assessment** of baseline patterns
- **Goal setting** focused on process, not content
- **First ATT introduction** with mini demo
- **Daily reminder setup** for all practice types

Components:
- `WelcomeScreen.tsx` - Welcoming introduction
- `QuickOverview.tsx` - 60-second MCT concepts
- `InitialAssessment.tsx` - Baseline CAS and belief ratings
- `GoalSetting.tsx` - Process-focused goal selection
- `FirstATTIntro.tsx` - Mini ATT demonstration
- `DailyReminderSetup.tsx` - Schedule configuration
- `OnboardingComplete.tsx` - Journey completion

### Daily Engagement Journey (≤20 minutes)
- **Time tracking** across all activities
- **Phase-based flow** (morning → midday → evening)
- **Process-focused activities** with no content analysis
- **Quick access** to CAS logging and postponement

Components:
- `MorningDMPrompt.tsx` - 3-minute morning mindfulness
- `MiddayDMCheckin.tsx` - 3-minute CAS pattern awareness
- `EveningATTSession.tsx` - 12-15 minute attention training
- `QuickCASLog.tsx` - Fast pattern logging (2 minutes)
- `PostponementSlotManager.tsx` - Worry scheduling tool
- `DailyProgress.tsx` - Completion summary

### Weekly Progression Journey
- **Module unlock notifications** for new content
- **Week recap screens** with progress insights
- **Progress reviews** showing metric changes
- **Experiment selection** for behavioral testing
- **Weekly planning** with goal setting

Components:
- `ModuleUnlockNotification.tsx` - New module celebration
- `WeekRecapScreen.tsx` - Previous week summary
- `ProgressReview.tsx` - Metrics and trends analysis
- `ExperimentSelection.tsx` - Behavioral experiment chooser
- `WeeklyPlanning.tsx` - Week intention setting

## Design Principles

### Process Focus
- All activities focus on **HOW** users relate to thoughts
- No analysis of thought **content**
- Emphasis on developing metacognitive awareness

### Time Management
- **Onboarding**: Hard 7-minute limit with countdown
- **Daily**: 20-minute daily total with tracking
- **Weekly**: Flexible duration based on user needs

### User Experience
- **Guided flows** with clear progress indication
- **Gentle encouragement** without pressure
- **Flexible pacing** with skip options
- **Visual feedback** for progress and achievements

## Integration

### Routing
Journeys are integrated into the main app routing system:
- `/onboarding-journey` - Enhanced onboarding (replaces basic onboarding)
- `/daily-journey` - Daily practice flow
- `/weekly-journey` - Weekly review and planning

### Navigation
- Journey access points added to Today page
- Journeys can be accessed independently or as part of guided flows
- Seamless integration with existing app components

## Technical Implementation

### State Management
- Uses existing Zustand store for user settings and data
- Local state management for journey-specific data
- Integration with existing API services

### Animation & Transitions
- Framer Motion for smooth transitions
- Progress indicators and visual feedback
- Responsive design for different screen sizes

### Accessibility
- Clear navigation and progress indication
- Keyboard navigation support
- Screen reader friendly content structure

## Usage

Users can access journeys through:
1. **Automatic routing** - New users go to onboarding journey
2. **Today page links** - Access daily and weekly journeys
3. **Direct navigation** - URL-based access to any journey

All journeys maintain the core MCT principle of process focus while providing structured, time-efficient paths through the program content.