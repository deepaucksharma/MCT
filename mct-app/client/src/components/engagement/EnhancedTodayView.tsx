import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  DocumentTextIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { usePersonalization, useEngagement } from '../../hooks/usePersonalization';
import GentleNudges from './GentleNudges';

interface EnhancedTodayViewProps {
  todayTasks: any[];
  stats: any;
  onTaskClick: (task: any) => void;
}

const EnhancedTodayView: React.FC<EnhancedTodayViewProps> = ({
  todayTasks,
  stats,
  onTaskClick
}) => {
  const navigate = useNavigate();
  const {
    adaptiveSettings,
    recommendations,
    getPersonalizedReminder
  } = usePersonalization();

  const {
    streaks,
    nudges,
    dismissNudge,
    achievements
  } = useEngagement();

  const getPersonalizedTaskDuration = (taskType: string) => {
    if (taskType === 'att' && adaptiveSettings) {
      return adaptiveSettings.att_duration_minutes;
    }
    return null;
  };

  const getTaskRecommendation = (taskType: string) => {
    const relevant = recommendations.find(r =>
      r.type === 'practice_time' ||
      (r.type === 'experiment' && taskType === 'experiment')
    );
    return relevant;
  };

  const getTaskIcon = (type: string, completed: boolean) => {
    const baseIcon = type === 'att' ? '🎧' :
                    type === 'dm' ? '🧘' :
                    type === 'log' ? '📝' :
                    type === 'experiment' ? '🔬' :
                    type === 'postponement' ? '⏰' : '📌';

    return completed ? `✅ ${baseIcon}` : baseIcon;
  };

  const getTaskColor = (completed: boolean, priority?: string) => {
    if (completed) {
      return 'bg-green-50 border-green-200';
    }

    if (priority === 'high') {
      return 'bg-orange-50 border-orange-200 hover:border-orange-400';
    }

    return 'bg-white border-gray-200 hover:border-blue-400';
  };

  const renderPersonalizedTaskDetails = (task: any) => {
    const duration = getPersonalizedTaskDuration(task.type);
    const recommendation = getTaskRecommendation(task.type);

    return (
      <div className="mt-2 space-y-1">
        {duration && (
          <p className="text-xs text-blue-600">
            Personalized duration: {duration} minutes
          </p>
        )}
        {recommendation && (
          <p className="text-xs text-purple-600">
            💡 {recommendation.title}
          </p>
        )}
      </div>
    );
  };

  const renderStreakIndicators = () => {
    if (!streaks || streaks.length === 0) return null;

    const attStreak = streaks.find(s => s.type === 'att');
    const dmStreak = streaks.find(s => s.type === 'dm');
    const overallStreak = streaks.find(s => s.type === 'overall');

    return (
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <FireIcon className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-lg font-bold text-blue-600">
              {attStreak?.current_streak || 0}
            </span>
          </div>
          <p className="text-xs text-blue-700">ATT Streak</p>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <FireIcon className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-lg font-bold text-green-600">
              {dmStreak?.current_streak || 0}
            </span>
          </div>
          <p className="text-xs text-green-700">DM Streak</p>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <FireIcon className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-lg font-bold text-purple-600">
              {overallStreak?.current_streak || 0}
            </span>
          </div>
          <p className="text-xs text-purple-700">Overall</p>
        </div>
      </div>
    );
  };

  const renderRecentAchievements = () => {
    const recentAchievements = achievements
      .filter(a => a.earned_date)
      .sort((a, b) => new Date(b.earned_date).getTime() - new Date(a.earned_date).getTime())
      .slice(0, 3);

    if (recentAchievements.length === 0) return null;

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <StarIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="font-medium text-yellow-900">Recent Achievements</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {recentAchievements.map(achievement => (
            <div key={achievement.id} className="text-center">
              <div className="text-2xl mb-1">{achievement.badge_icon}</div>
              <p className="text-xs text-yellow-800 font-medium">
                {achievement.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPersonalizedMotivation = () => {
    const message = getPersonalizedReminder();

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
        <p className="text-blue-900 font-medium text-center">
          {message}
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header with personalized greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {format(new Date(), 'EEEE, MMMM d')}
        </h1>
        <p className="text-gray-600 mt-1">Your personalized MCT journey continues</p>
      </div>

      {/* Active Nudges */}
      {nudges && nudges.length > 0 && (
        <GentleNudges
          nudges={nudges}
          onDismiss={dismissNudge}
          onAction={(_, actionUrl) => {
            if (actionUrl) navigate(actionUrl);
          }}
          maxDisplay={2}
        />
      )}

      {/* Progress Summary with Streaks */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-900 font-medium">Today's Progress</p>
              <p className="text-3xl font-bold text-blue-700">
                {stats.completionRate}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">
                {stats.completedTasks} of {stats.totalTasks} tasks
              </p>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: stats.totalTasks }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded ${
                      i < stats.completedTasks
                        ? 'bg-blue-600'
                        : 'bg-blue-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Streak Indicators */}
          {renderStreakIndicators()}
        </div>
      )}

      {/* Recent Achievements */}
      {renderRecentAchievements()}

      {/* Personalized Motivation */}
      {renderPersonalizedMotivation()}

      {/* Enhanced Tasks List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>

        {todayTasks.map((task) => {
          const recommendation = getTaskRecommendation(task.type);
          const priority = recommendation?.priority;

          return (
            <button
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${getTaskColor(
                task.completed,
                priority
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {getTaskIcon(task.type, task.completed)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      {task.title}
                      {priority === 'high' && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </h3>
                    {task.completed && (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                  )}

                  {/* Personalized task details */}
                  {!task.completed && renderPersonalizedTaskDetails(task)}

                  {task.scheduled_time && !task.completed && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3" />
                      {task.scheduled_time}
                    </div>
                  )}
                </div>
                {!task.completed && (
                  <PlayIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
          );
        })}

        {todayTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3" />
            <p>No tasks scheduled for today</p>
          </div>
        )}
      </div>

      {/* Quick Actions with Personalization */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/log')}
          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            Quick CAS Log
          </span>
        </button>
        <button
          onClick={() => navigate('/engagement')}
          className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <span className="text-sm font-medium text-purple-700">
            View Progress
          </span>
        </button>
      </div>

      {/* Achievement celebration */}
      {stats && stats.completionRate === 100 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-green-800 font-medium">
              Excellent work! You've completed all tasks for today.
            </p>
            <p className="text-green-700 text-sm mt-1">
              Your consistency is building real change in your brain.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTodayView;