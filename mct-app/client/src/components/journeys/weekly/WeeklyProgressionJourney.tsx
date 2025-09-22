import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import useStore from '../../../store';
import ModuleUnlockNotification from './ModuleUnlockNotification';
import WeekRecapScreen from './WeekRecapScreen';
import ProgressReview from './ProgressReview';
import ExperimentSelection from './ExperimentSelection';
import WeeklyPlanning from './WeeklyPlanning';

type WeeklyPhase = 'unlock' | 'recap' | 'review' | 'experiments' | 'planning' | 'complete';

interface WeeklyProgressionState {
  currentPhase: WeeklyPhase;
  currentWeek: number;
  weekData: any;
  selectedExperiments: string[];
}

export default function WeeklyProgressionJourney() {
  const navigate = useNavigate();
  const { settings, fetchModules } = useStore();
  const [journeyState, setJourneyState] = useState<WeeklyProgressionState>({
    currentPhase: 'unlock',
    currentWeek: settings?.current_week || 1,
    weekData: null,
    selectedExperiments: []
  });

  useEffect(() => {
    fetchModules();
    initializeWeeklyJourney();
  }, []);

  const initializeWeeklyJourney = () => {
    // Determine if this is a new week unlock or weekly review
    const currentWeek = settings?.current_week || 1;
    const hasUnlockedNewModule = checkForNewModuleUnlock(currentWeek);

    setJourneyState(prev => ({
      ...prev,
      currentWeek,
      currentPhase: hasUnlockedNewModule ? 'unlock' : 'recap'
    }));
  };

  const checkForNewModuleUnlock = (_: number): boolean => {
    // Logic to check if user just unlocked a new module
    // This would normally check against stored data
    return Math.random() > 0.5; // Mock implementation
  };

  const getPhaseTitle = () => {
    const titles = {
      unlock: `Module ${journeyState.currentWeek} Unlocked!`,
      recap: `Week ${journeyState.currentWeek - 1} Complete`,
      review: 'Progress Review',
      experiments: 'This Week\'s Experiments',
      planning: 'Week Planning',
      complete: 'Ready for the Week'
    };
    return titles[journeyState.currentPhase];
  };

  const getPhaseDescription = () => {
    const descriptions = {
      unlock: 'New skills and techniques are now available',
      recap: 'Let\'s review your progress and insights',
      review: 'Assess your development and patterns',
      experiments: 'Choose behavioral experiments for this week',
      planning: 'Set your intentions and goals',
      complete: 'Your week is planned and ready to begin'
    };
    return descriptions[journeyState.currentPhase];
  };

  const nextPhase = () => {
    const phases: WeeklyPhase[] = ['unlock', 'recap', 'review', 'experiments', 'planning', 'complete'];
    const currentIndex = phases.indexOf(journeyState.currentPhase);

    if (currentIndex < phases.length - 1) {
      setJourneyState(prev => ({
        ...prev,
        currentPhase: phases[currentIndex + 1]
      }));
    }
  };

  const completeJourney = () => {
    navigate('/today');
  };

  const updateExperiments = (experiments: string[]) => {
    setJourneyState(prev => ({
      ...prev,
      selectedExperiments: experiments
    }));
  };

  const renderCurrentPhase = () => {
    switch (journeyState.currentPhase) {
      case 'unlock':
        return (
          <ModuleUnlockNotification
            weekNumber={journeyState.currentWeek}
            onContinue={nextPhase}
            onSkip={() => setJourneyState(prev => ({ ...prev, currentPhase: 'recap' }))}
          />
        );
      case 'recap':
        return (
          <WeekRecapScreen
            weekNumber={journeyState.currentWeek - 1}
            onContinue={nextPhase}
            onSkip={() => setJourneyState(prev => ({ ...prev, currentPhase: 'review' }))}
          />
        );
      case 'review':
        return (
          <ProgressReview
            weekNumber={journeyState.currentWeek}
            onContinue={nextPhase}
            onSkip={() => setJourneyState(prev => ({ ...prev, currentPhase: 'experiments' }))}
          />
        );
      case 'experiments':
        return (
          <ExperimentSelection
            weekNumber={journeyState.currentWeek}
            selectedExperiments={journeyState.selectedExperiments}
            onUpdate={updateExperiments}
            onContinue={nextPhase}
            onSkip={() => setJourneyState(prev => ({ ...prev, currentPhase: 'planning' }))}
          />
        );
      case 'planning':
        return (
          <WeeklyPlanning
            weekNumber={journeyState.currentWeek}
            selectedExperiments={journeyState.selectedExperiments}
            onComplete={completeJourney}
          />
        );
      case 'complete':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Week {journeyState.currentWeek} Ready!
            </h2>
            <p className="text-gray-600 mb-6">
              Your weekly journey has been planned. Start your daily practices!
            </p>
            <button
              onClick={completeJourney}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Begin This Week
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {getPhaseTitle()}
            </h1>
          </div>
          <p className="text-gray-600">{getPhaseDescription()}</p>
        </div>

        {/* Phase Progress */}
        <div className="mb-6">
          <div className="flex justify-center space-x-2">
            {['unlock', 'recap', 'review', 'experiments', 'planning'].map((phase, index) => {
              const phases: WeeklyPhase[] = ['unlock', 'recap', 'review', 'experiments', 'planning'];
              const currentIndex = phases.indexOf(journeyState.currentPhase);

              return (
                <div
                  key={phase}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentIndex
                      ? 'bg-primary-600'
                      : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Current Phase Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={journeyState.currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentPhase()}
          </motion.div>
        </AnimatePresence>

        {/* Weekly Tips */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-800 text-sm font-bold">💡</span>
            </div>
            <div>
              <h3 className="font-medium text-purple-900 mb-1">Weekly Focus</h3>
              <p className="text-sm text-purple-800">
                {journeyState.currentPhase === 'unlock' && "Each module builds on previous skills. Take time to integrate new techniques."}
                {journeyState.currentPhase === 'recap' && "Reflection helps consolidate learning. Notice patterns without judgment."}
                {journeyState.currentPhase === 'review' && "Progress isn't always linear. Small improvements compound over time."}
                {journeyState.currentPhase === 'experiments' && "Experiments test beliefs, not your worth. Approach them with curiosity."}
                {journeyState.currentPhase === 'planning' && "Flexible planning prevents perfectionism while maintaining direction."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}