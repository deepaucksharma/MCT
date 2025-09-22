import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, TrophyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface DailyProgressProps {
  completedTasks: string[];
  totalTimeSpent: number;
  onViewProgress: () => void;
  onPlanTomorrow: () => void;
}

export default function DailyProgress({
  completedTasks,
  totalTimeSpent,
  onViewProgress,
  onPlanTomorrow
}: DailyProgressProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionMessage = () => {
    const taskCount = completedTasks.length;
    if (taskCount >= 4) return "Outstanding work! You've completed all your daily practices.";
    if (taskCount >= 3) return "Great job! You've maintained consistent practice today.";
    if (taskCount >= 2) return "Good progress! You're building healthy habits.";
    if (taskCount >= 1) return "Nice start! Every practice session counts.";
    return "Consider trying at least one practice to build momentum.";
  };

  const getStreakBonus = () => {
    // This would normally come from stored data
    const mockStreak = Math.floor(Math.random() * 7) + 1;
    return mockStreak;
  };

  const practiceAreas = [
    { id: 'morning-dm', label: 'Morning DM', icon: '🌅', completed: completedTasks.includes('morning-dm') },
    { id: 'midday-dm', label: 'Midday Check-in', icon: '☀️', completed: completedTasks.includes('midday-dm') },
    { id: 'evening-att', label: 'Evening ATT', icon: '🌙', completed: completedTasks.includes('evening-att') },
    { id: 'cas-log', label: 'CAS Logging', icon: '📊', completed: completedTasks.includes('cas-log') },
    { id: 'postponement', label: 'Postponement', icon: '⏰', completed: completedTasks.includes('postponement') }
  ];

  const completedCount = practiceAreas.filter(area => area.completed).length;
  const completionRate = Math.round((completedCount / practiceAreas.length) * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrophyIcon className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Daily Practice Complete
        </h2>

        <p className="text-gray-600 mb-4">
          {getCompletionMessage()}
        </p>

        <div className="text-3xl font-bold text-primary-600 mb-2">
          {completionRate}%
        </div>
        <p className="text-sm text-gray-600">Daily completion rate</p>
      </motion.div>

      {/* Practice Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <ClockIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-600 font-medium">Time Spent</p>
          <p className="text-lg font-bold text-blue-800">{formatTime(totalTimeSpent)}</p>
          <p className="text-xs text-blue-600">≤20 min target</p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg text-center">
          <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-600 font-medium">Completed</p>
          <p className="text-lg font-bold text-green-800">{completedCount}/{practiceAreas.length}</p>
          <p className="text-xs text-green-600">practice areas</p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg text-center col-span-2 md:col-span-1">
          <div className="text-2xl mb-2">🔥</div>
          <p className="text-sm text-purple-600 font-medium">Streak</p>
          <p className="text-lg font-bold text-purple-800">{getStreakBonus()} days</p>
          <p className="text-xs text-purple-600">keep it going!</p>
        </div>
      </div>

      {/* Practice Breakdown */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Today's Practice Areas</h3>
        <div className="space-y-3">
          {practiceAreas.map((area, index) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                area.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="text-2xl">{area.icon}</div>
              <div className="flex-1">
                <span className={`font-medium ${area.completed ? 'text-green-900' : 'text-gray-700'}`}>
                  {area.label}
                </span>
              </div>
              {area.completed && (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Today's Insight</h3>
        <p className="text-gray-700 text-sm">
          {totalTimeSpent <= 20 * 60
            ? "You stayed within the 20-minute daily limit while building valuable skills. Efficient practice!"
            : "You invested extra time in your development today. Remember, consistency often matters more than duration."
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onViewProgress}
          className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          View Progress & Trends
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>

        <button
          onClick={onPlanTomorrow}
          className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Plan Tomorrow's Practice
        </button>
      </div>

      {/* Encouragement */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          {completedCount >= 3
            ? "Excellent consistency! You're building lasting change through daily practice."
            : "Every practice session strengthens your metacognitive skills. Keep building the habit!"
          }
        </p>
      </div>
    </div>
  );
}