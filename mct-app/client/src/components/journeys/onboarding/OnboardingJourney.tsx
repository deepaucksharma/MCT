import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../../../store';
import { assessmentApi } from '../../../services/api';
import { Assessment, UserSettings } from '../../../types';
import WelcomeScreen from './WelcomeScreen';
import QuickOverview from './QuickOverview';
import InitialAssessment from './InitialAssessment';
import GoalSetting from './GoalSetting';
import FirstATTIntro from './FirstATTIntro';
import DailyReminderSetup from './DailyReminderSetup';
import OnboardingComplete from './OnboardingComplete';

const JOURNEY_STEPS = [
  'welcome',
  'overview',
  'assessment',
  'goals',
  'att-intro',
  'reminders',
  'complete'
] as const;

type JourneyStep = typeof JOURNEY_STEPS[number];

interface OnboardingData {
  assessment: Partial<Assessment>;
  settings: Partial<UserSettings>;
  goals: string[];
  timeEstimate: number;
}

export default function OnboardingJourney() {
  const navigate = useNavigate();
  const { completeOnboarding, updateSettings } = useStore();
  const [currentStep, setCurrentStep] = useState<JourneyStep>('welcome');
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(420); // 7 minutes in seconds

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    assessment: {
      assessment_type: 'initial',
      worry_baseline: 50,
      rumination_baseline: 50,
      monitoring_baseline: 50,
      uncontrollability_belief: 50,
      danger_belief: 50,
      positive_belief: 50,
      triggers: [],
      goals: []
    },
    settings: {
      att_reminder_time: '20:00',
      dm_reminder_times: ['08:00', '13:00', '18:00'],
      postponement_slot_start: '18:30',
      postponement_slot_duration: 15,
      notifications_enabled: true
    },
    goals: [],
    timeEstimate: 0
  });

  // Timer to track 7-minute limit
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(420 - elapsed, 0);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        toast.error('Onboarding time limit reached. Completing with current settings.');
        completeOnboardingProcess();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const getCurrentStepIndex = () => JOURNEY_STEPS.indexOf(currentStep);
  const getProgressPercentage = () => ((getCurrentStepIndex() + 1) / JOURNEY_STEPS.length) * 100;

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < JOURNEY_STEPS.length - 1) {
      setCurrentStep(JOURNEY_STEPS[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(JOURNEY_STEPS[currentIndex - 1]);
    }
  };

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const completeOnboardingProcess = async () => {
    try {
      // Save assessment
      await assessmentApi.create(onboardingData.assessment as Assessment);

      // Update settings
      await updateSettings(onboardingData.settings);

      // Mark onboarding as complete
      await completeOnboarding();

      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      toast.success(`Welcome to MCT! Completed in ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}`);
      navigate('/today');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onNext={nextStep} />;
      case 'overview':
        return <QuickOverview onNext={nextStep} onPrevious={previousStep} />;
      case 'assessment':
        return (
          <InitialAssessment
            assessment={onboardingData.assessment}
            onUpdate={(assessment) => updateOnboardingData({ assessment })}
            onNext={nextStep}
            onPrevious={previousStep}
          />
        );
      case 'goals':
        return (
          <GoalSetting
            goals={onboardingData.goals}
            onUpdate={(goals) => updateOnboardingData({ goals })}
            onNext={nextStep}
            onPrevious={previousStep}
          />
        );
      case 'att-intro':
        return <FirstATTIntro onNext={nextStep} onPrevious={previousStep} />;
      case 'reminders':
        return (
          <DailyReminderSetup
            settings={onboardingData.settings}
            onUpdate={(settings) => updateOnboardingData({ settings })}
            onNext={nextStep}
            onPrevious={previousStep}
          />
        );
      case 'complete':
        return <OnboardingComplete onComplete={completeOnboardingProcess} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Time Indicator */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Time remaining: <span className={`font-medium ${timeRemaining < 120 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Step {getCurrentStepIndex() + 1} of {JOURNEY_STEPS.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-600"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}