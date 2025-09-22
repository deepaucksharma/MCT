import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import useStore from '../store';
import { todayApi } from '../services/api';
import { TodayTask } from '../types';
import toast from 'react-hot-toast';

export default function Today() {
  const navigate = useNavigate();
  const { todayTasks, fetchTodayTasks } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      await fetchTodayTasks();
      const todayStats = await todayApi.getStats();
      setStats(todayStats);
    } catch (error) {
      console.error('Failed to load today data:', error);
      toast.error('Failed to load today\'s tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: TodayTask) => {
    if (task.completed) {
      toast('Task already completed!', { icon: '✅' });
      return;
    }

    switch (task.type) {
      case 'att':
        navigate('/exercises/att');
        break;
      case 'dm':
        navigate('/exercises/dm', {
          state: { timeOfDay: task.data?.timeOfDay || 'other' }
        });
        break;
      case 'log':
        navigate('/log');
        break;
      case 'experiment':
        navigate('/experiments', {
          state: { experimentId: task.data?.experimentId }
        });
        break;
      case 'postponement':
        navigate('/log', { state: { openPostponement: true } });
        break;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'att':
        return '🎧';
      case 'dm':
        return '🧘';
      case 'log':
        return '📝';
      case 'experiment':
        return '🔬';
      case 'postponement':
        return '⏰';
      default:
        return '📌';
    }
  };

  const getTaskColor = (completed: boolean) => {
    return completed
      ? 'bg-green-50 border-green-200'
      : 'bg-white border-gray-200 hover:border-primary-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {format(new Date(), 'EEEE, MMMM d')}
        </h1>
        <p className="text-gray-600 mt-1">Your daily MCT practice</p>
      </div>

      {/* Progress Summary */}
      {stats && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-900 font-medium">Today's Progress</p>
              <p className="text-3xl font-bold text-primary-700">
                {stats.completionRate}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-700">
                {stats.completedTasks} of {stats.totalTasks} tasks
              </p>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: stats.totalTasks }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded ${
                      i < stats.completedTasks
                        ? 'bg-primary-600'
                        : 'bg-primary-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-3">
        {todayTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => handleTaskClick(task)}
            className={`w-full text-left p-4 rounded-lg border transition-all ${getTaskColor(
              task.completed
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTaskIcon(task.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.completed && (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                )}
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
        ))}

        {todayTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3" />
            <p>No tasks scheduled for today</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/log')}
          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            Quick CAS Log
          </span>
        </button>
        <button
          onClick={() => navigate('/program')}
          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            View Program
          </span>
        </button>
      </div>

      {/* Journey Access */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <h3 className="font-medium text-purple-900 mb-3">Guided Journeys</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/daily-journey')}
            className="p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌅</span>
              <div>
                <h4 className="font-medium text-purple-900 text-sm">Daily Journey</h4>
                <p className="text-purple-700 text-xs">Guided daily practice flow</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate('/weekly-journey')}
            className="p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-medium text-purple-900 text-sm">Weekly Review</h4>
                <p className="text-purple-700 text-xs">Progress & planning journey</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Motivational Message */}
      {stats && stats.completionRate === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            Excellent work! You've completed all tasks for today. 🎉
          </p>
          <p className="text-green-700 text-sm mt-1">
            Keep building on this momentum tomorrow.
          </p>
        </div>
      )}

      {/* Streak Display */}
      <div className="mt-6 flex justify-center gap-6 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.details?.att ? '✓' : '○'}
          </p>
          <p className="text-xs text-gray-600">ATT</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.details?.dm || 0}/3
          </p>
          <p className="text-xs text-gray-600">DM</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.details?.log ? '✓' : '○'}
          </p>
          <p className="text-xs text-gray-600">Log</p>
        </div>
      </div>
    </div>
  );
}