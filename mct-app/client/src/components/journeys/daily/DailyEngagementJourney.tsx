import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import useStore from '../../../store';
import MorningDMPrompt from './MorningDMPrompt';
import MiddayDMCheckin from './MiddayDMCheckin';
import EveningATTSession from './EveningATTSession';
import QuickCASLog from './QuickCASLog';
import PostponementSlotManager from './PostponementSlotManager';
import DailyProgress from './DailyProgress';

type DailyPhase = 'morning' | 'midday' | 'evening' | 'completed';

interface DailyEngagementState {
  currentPhase: DailyPhase;
  completedTasks: string[];
  totalTimeSpent: number;
  lastActivity: Date | null;
}

export default function DailyEngagementJourney() {
  const navigate = useNavigate();
  const { settings, todayTasks, fetchTodayTasks } = useStore();
  const [dailyState, setDailyState] = useState<DailyEngagementState>({
    currentPhase: 'morning',
    completedTasks: [],
    totalTimeSpent: 0,
    lastActivity: null
  });

  useEffect(() => {
    fetchTodayTasks();
    determineCurrentPhase();
  }, []);

  const determineCurrentPhase = (): DailyPhase => {
    const now = new Date();
    const hour = now.getHours();

    // Check completed tasks to see what's left
    const completedToday = todayTasks.filter(task => task.completed);

    if (completedToday.length === todayTasks.length) {
      return 'completed';
    }

    // Time-based phase detection
    if (hour < 12) return 'morning';
    if (hour < 17) return 'midday';
    return 'evening';
  };

  const getCurrentTimeEstimate = () => {
    const phase = dailyState.currentPhase;
    const estimates = {
      morning: 3, // DM practice
      midday: 3,  // DM check-in
      evening: 15, // ATT session
      completed: 0
    };
    return estimates[phase];
  };

  const getPhaseTitle = () => {
    const titles = {
      morning: 'Morning Mindfulness',
      midday: 'Midday Check-in',
      evening: 'Evening Practice',
      completed: 'Daily Practice Complete'
    };
    return titles[dailyState.currentPhase];
  };

  const getPhaseDescription = () => {
    const descriptions = {
      morning: 'Start your day with detached mindfulness',
      midday: 'Pause and observe your current mental state',
      evening: 'Complete your attention training session',
      completed: 'All daily practices completed! Well done.'
    };
    return descriptions[dailyState.currentPhase];
  };

  const completeTask = (taskId: string, timeSpent: number = 0) => {
    setDailyState(prev => ({
      ...prev,
      completedTasks: [...prev.completedTasks, taskId],
      totalTimeSpent: prev.totalTimeSpent + timeSpent,
      lastActivity: new Date()
    }));
  };

  const renderCurrentPhase = () => {
    switch (dailyState.currentPhase) {
      case 'morning':
        return (
          <MorningDMPrompt
            onComplete={(timeSpent) => {
              completeTask('morning-dm', timeSpent);
              setDailyState(prev => ({ ...prev, currentPhase: 'midday' }));
            }}
            onSkip={() => setDailyState(prev => ({ ...prev, currentPhase: 'midday' }))}
          />
        );
      case 'midday':
        return (
          <MiddayDMCheckin
            onComplete={(timeSpent) => {
              completeTask('midday-dm', timeSpent);
              setDailyState(prev => ({ ...prev, currentPhase: 'evening' }));
            }}
            onSkip={() => setDailyState(prev => ({ ...prev, currentPhase: 'evening' }))}
          />
        );
      case 'evening':
        return (
          <EveningATTSession
            onComplete={(timeSpent) => {
              completeTask('evening-att', timeSpent);
              setDailyState(prev => ({ ...prev, currentPhase: 'completed' }));
            }}
            onSkip={() => setDailyState(prev => ({ ...prev, currentPhase: 'completed' }))}
          />
        );
      case 'completed':
        return (
          <DailyProgress
            completedTasks={dailyState.completedTasks}
            totalTimeSpent={dailyState.totalTimeSpent}
            onViewProgress={() => navigate('/progress')}
            onPlanTomorrow={() => navigate('/today')}
          />
        );
      default:
        return null;
    }
  };

  const isWithinTimeLimit = () => dailyState.totalTimeSpent <= 20 * 60; // 20 minutes in seconds

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {getPhaseTitle()}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>≤{getCurrentTimeEstimate()} min</span>
            </div>
          </div>
          <p className="text-gray-600">{getPhaseDescription()}</p>
        </div>

        {/* Time Progress */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Daily Time Used</span>
            <span className={`text-sm font-medium ${
              isWithinTimeLimit() ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.floor(dailyState.totalTimeSpent / 60)}:{(dailyState.totalTimeSpent % 60).toString().padStart(2, '0')} / 20:00
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isWithinTimeLimit() ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((dailyState.totalTimeSpent / (20 * 60)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="mb-6 flex justify-center">
          <div className="flex space-x-4">
            {['morning', 'midday', 'evening', 'completed'].map((phase) => (
              <div
                key={phase}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  dailyState.currentPhase === phase
                    ? 'bg-primary-600 text-white'
                    : dailyState.completedTasks.includes(`${phase}-dm`) ||
                      dailyState.completedTasks.includes(`${phase}-att`) ||
                      phase === 'completed' && dailyState.currentPhase === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {(dailyState.completedTasks.includes(`${phase}-dm`) ||
                  dailyState.completedTasks.includes(`${phase}-att`) ||
                  phase === 'completed' && dailyState.currentPhase === 'completed') && (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
                <span className="capitalize">{phase === 'completed' ? 'Done' : phase}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Phase Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={dailyState.currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentPhase()}
          </motion.div>
        </AnimatePresence>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <QuickCASLog
            onComplete={(timeSpent) => completeTask('cas-log', timeSpent)}
          />
          <PostponementSlotManager
            settings={settings}
            onUse={(timeSpent) => completeTask('postponement', timeSpent)}
          />
        </div>

        {/* Daily Tips */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-800 text-sm font-bold">💡</span>
            </div>
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Daily Reminder</h3>
              <p className="text-sm text-amber-800">
                {dailyState.currentPhase === 'morning' && "Start gently. Notice your thoughts without trying to change them."}
                {dailyState.currentPhase === 'midday' && "Pause and observe. Are you caught in CAS patterns right now?"}
                {dailyState.currentPhase === 'evening' && "This is training time. Focus on building attention flexibility."}
                {dailyState.currentPhase === 'completed' && "Excellent work! Consistency builds lasting change."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}