import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  PlayIcon,
  ArrowLeftIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import useStore from '../store';
import { getAllWeeks, getWeekContent } from '../data/weeklyContent';
import WeeklyOverview from '../components/modules/WeeklyOverview';
import WeeklyContent from '../components/modules/WeeklyContent';
import toast from 'react-hot-toast';

export default function Program() {
  const { settings, modules, fetchModules, unlockWeek, completeWeek } = useStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [view, setView] = useState<'overview' | 'detail'>('overview');

  const allWeeks = getAllWeeks();
  const currentWeek = settings?.current_week || 0;

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const isWeekUnlocked = (weekNumber: number): boolean => {
    // Week 0 is always unlocked
    if (weekNumber === 0) return true;

    // Check if previous week is completed or if it's the current week
    const previousWeekCompleted = modules.find(m => m.week_number === weekNumber - 1)?.completed || false;
    const isCurrentOrBehind = weekNumber <= currentWeek;

    return previousWeekCompleted || isCurrentOrBehind;
  };

  const isWeekCompleted = (weekNumber: number): boolean => {
    return modules.find(m => m.week_number === weekNumber)?.completed || false;
  };

  const handleWeekClick = (weekNumber: number) => {
    if (!isWeekUnlocked(weekNumber)) {
      toast.error('Complete previous weeks to unlock this content');
      return;
    }
    setSelectedWeek(weekNumber);
    setView('detail');
  };

  const handleBackToOverview = () => {
    setView('overview');
    setSelectedWeek(null);
  };

  const handleMarkComplete = async (weekNumber: number) => {
    try {
      await completeWeek(weekNumber);

      // Unlock next week if this was the current week
      if (weekNumber === currentWeek && weekNumber < 8) {
        await unlockWeek(weekNumber + 1);
      }

      toast.success(`Week ${weekNumber} marked complete!`);
    } catch (error) {
      console.error('Failed to complete week:', error);
      toast.error('Failed to mark week complete');
    }
  };

  const handleStartExperiment = (experiment: any) => {
    // This could navigate to experiment creation or open a modal
    toast.success('Experiment feature coming soon!');
    console.log('Starting experiment:', experiment);
  };

  const getProgressStats = () => {
    const completedWeeks = allWeeks.filter(week => isWeekCompleted(week.weekNumber)).length;
    const unlockedWeeks = allWeeks.filter(week => isWeekUnlocked(week.weekNumber)).length;
    const totalWeeks = allWeeks.length;

    return {
      completed: completedWeeks,
      unlocked: unlockedWeeks,
      total: totalWeeks,
      progress: Math.round((completedWeeks / totalWeeks) * 100)
    };
  };

  const stats = getProgressStats();
  const selectedWeekData = selectedWeek !== null ? getWeekContent(selectedWeek) : null;

  if (view === 'detail' && selectedWeekData) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-4xl mx-auto px-4 py-6"
      >
        {/* Back button */}
        <button
          onClick={handleBackToOverview}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Program Overview</span>
        </button>

        <WeeklyContent
          week={selectedWeekData}
          isUnlocked={isWeekUnlocked(selectedWeek!)}
          isCompleted={isWeekCompleted(selectedWeek!)}
          onStartExperiment={handleStartExperiment}
          onMarkComplete={handleMarkComplete}
        />
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AcademicCapIcon className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">MCT Program</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Your journey through Metacognitive Therapy - 9 weeks of evidence-based content
        </p>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary-900 mb-2">Your Progress</h2>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-700">{stats.progress}%</div>
                <div className="text-sm text-primary-600">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-700">{stats.completed}</div>
                <div className="text-sm text-primary-600">Weeks Done</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-700">{stats.unlocked}</div>
                <div className="text-sm text-primary-600">Unlocked</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgb(219 234 254)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgb(59 130 246)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.progress / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-600 mb-1">
            <span>Week 0</span>
            <span>Week 8</span>
          </div>
          <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-600"
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allWeeks.map((week, index) => (
          <motion.div
            key={week.weekNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <WeeklyOverview
              week={week}
              isUnlocked={isWeekUnlocked(week.weekNumber)}
              isCompleted={isWeekCompleted(week.weekNumber)}
              onClick={() => handleWeekClick(week.weekNumber)}
            />
          </motion.div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <PlayIcon className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">How to Use This Program</h3>
          </div>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Complete weeks in order - each builds on the previous</li>
            <li>• Practice the techniques daily, not just during study</li>
            <li>• Focus on process, not content of your thoughts</li>
            <li>• Use "Try This Now" exercises throughout the week</li>
            <li>• Complete experiments to test your beliefs</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <BeakerIcon className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-green-900">Weekly Experiments</h3>
          </div>
          <p className="text-green-800 text-sm leading-relaxed">
            Each week includes optional experiments to test your metacognitive beliefs.
            These aren't homework - they're opportunities to gather personal evidence
            about how your mind works. The goal is learning, not "getting it right."
          </p>
        </div>
      </div>

      {/* Current Week Highlight */}
      {currentWeek <= 8 && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentWeek}
            </div>
            <div>
              <p className="font-medium text-amber-900">
                Current Week: {getWeekContent(currentWeek)?.title}
              </p>
              <p className="text-amber-700 text-sm">
                This is your active week. Complete it to unlock the next module.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}