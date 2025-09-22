
interface Streak {
  type: 'att' | 'dm' | 'logging' | 'overall';
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

interface StreakDisplayProps {
  streaks: Streak[];
  showDetailed?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streaks, showDetailed = false }) => {
  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'att': return '🎯';
      case 'dm': return '🧘';
      case 'logging': return '📝';
      case 'overall': return '🔥';
      default: return '⭐';
    }
  };

  const getStreakLabel = (type: string) => {
    switch (type) {
      case 'att': return 'ATT Practice';
      case 'dm': return 'DM Practice';
      case 'logging': return 'Daily Logging';
      case 'overall': return 'Overall';
      default: return type;
    }
  };

  const getStreakColor = (current: number) => {
    if (current >= 30) return 'text-purple-600';
    if (current >= 14) return 'text-blue-600';
    if (current >= 7) return 'text-green-600';
    if (current >= 3) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getStreakMessage = (current: number) => {
    if (current >= 30) return 'Amazing dedication!';
    if (current >= 14) return 'Great momentum!';
    if (current >= 7) return 'Building strong habits!';
    if (current >= 3) return 'Good start!';
    if (current === 0) return 'Ready to begin?';
    return 'Keep it up!';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!showDetailed) {
    // Simple view for dashboard
    const overallStreak = streaks.find(s => s.type === 'overall');
    if (!overallStreak) return null;

    return (
      <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔥</span>
            <div>
              <h3 className="font-medium text-gray-900">Current Streak</h3>
              <p className="text-sm text-gray-600">{getStreakMessage(overallStreak.current_streak)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getStreakColor(overallStreak.current_streak)}`}>
              {overallStreak.current_streak}
            </div>
            <p className="text-xs text-gray-500">
              Best: {overallStreak.longest_streak}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Detailed view for streaks page
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Practice Streaks</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streaks.map((streak) => (
          <div key={streak.type} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStreakIcon(streak.type)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{getStreakLabel(streak.type)}</h3>
                  <p className="text-sm text-gray-600">
                    Last activity: {formatDate(streak.last_activity_date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getStreakColor(streak.current_streak)}`}>
                  {streak.current_streak}
                </div>
                <p className="text-xs text-gray-500">
                  Record: {streak.longest_streak}
                </p>
              </div>
            </div>

            {/* Streak Recovery Indicator */}
            {streak.current_streak === 0 && streak.longest_streak > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                You can restart your streak anytime! Your record of {streak.longest_streak} days shows what you're capable of.
              </div>
            )}

            {/* Milestone Progress */}
            {streak.current_streak > 0 && (
              <div className="mt-3">
                <StreakMilestoneProgress current={streak.current_streak} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">About Streaks</h3>
        <p className="text-sm text-blue-700">
          Streaks celebrate your consistency, not perfection. Missing one day won't break your streak -
          we know life happens! The goal is to build sustainable practice habits that support your recovery.
        </p>
      </div>
    </div>
  );
};

interface StreakMilestoneProgressProps {
  current: number;
}

const StreakMilestoneProgress: React.FC<StreakMilestoneProgressProps> = ({ current }) => {
  const milestones = [3, 7, 14, 30];
  const nextMilestone = milestones.find(m => m > current) || milestones[milestones.length - 1];
  const progress = Math.min((current / nextMilestone) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{current} days</span>
        <span>Next: {nextMilestone} days</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default StreakDisplay;