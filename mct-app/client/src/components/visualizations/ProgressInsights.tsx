import { useEffect, useState } from 'react';
import { progressApi, experimentApi } from '../../services/api';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Insight {
  type: 'achievement' | 'focus_area' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ComponentType<any>;
  color: string;
}

interface ProgressInsightsProps {
  days?: number;
  className?: string;
}

export default function ProgressInsights({
  days = 30,
  className = '',
}: ProgressInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        setLoading(true);
        const generatedInsights: Insight[] = [];

        // Fetch progress metrics
        const metrics = await progressApi.getMetrics(days);

        // Analyze CAS trends
        const analyzeCASProgress = () => {
          const worryTrend = calculateTrend(metrics.worry_trend);
          const ruminationTrend = calculateTrend(metrics.rumination_trend);

          if (worryTrend === 'down' && ruminationTrend === 'down') {
            generatedInsights.push({
              type: 'achievement',
              title: 'Excellent CAS Control',
              description: 'Both worry and rumination are decreasing. Your MCT practice is working!',
              priority: 'high',
              icon: CheckCircleIcon,
              color: 'text-green-600',
            });
          } else if (worryTrend === 'up' || ruminationTrend === 'up') {
            generatedInsights.push({
              type: 'focus_area',
              title: 'CAS Levels Increasing',
              description: 'Consider increasing your ATT and DM practice frequency.',
              priority: 'high',
              icon: ExclamationTriangleIcon,
              color: 'text-red-600',
            });
          }
        };

        // Analyze practice consistency
        const analyzePracticeConsistency = () => {
          const attStreak = metrics.current_streaks?.att || 0;
          const dmStreak = metrics.current_streaks?.dm || 0;

          if (attStreak >= 7) {
            generatedInsights.push({
              type: 'achievement',
              title: 'ATT Practice Streak',
              description: `Amazing! You've maintained ATT practice for ${attStreak} days straight.`,
              priority: 'medium',
              icon: CheckCircleIcon,
              color: 'text-blue-600',
            });
          }

          if (dmStreak >= 7) {
            generatedInsights.push({
              type: 'achievement',
              title: 'DM Practice Streak',
              description: `Great consistency! ${dmStreak} days of detached mindfulness practice.`,
              priority: 'medium',
              icon: CheckCircleIcon,
              color: 'text-green-600',
            });
          }

          if (attStreak === 0) {
            generatedInsights.push({
              type: 'focus_area',
              title: 'Resume ATT Practice',
              description: 'Regular ATT practice is key to improving attentional control.',
              priority: 'medium',
              icon: ExclamationTriangleIcon,
              color: 'text-orange-600',
            });
          }

          if (dmStreak === 0) {
            generatedInsights.push({
              type: 'focus_area',
              title: 'Resume DM Practice',
              description: 'Detached mindfulness helps break cognitive patterns.',
              priority: 'medium',
              icon: ExclamationTriangleIcon,
              color: 'text-orange-600',
            });
          }
        };

        // Analyze experiment progress
        const analyzeExperiments = async () => {
          try {
            const experiments = await experimentApi.getAll('completed');
            const recentExperiments = experiments.filter(exp => {
              if (!exp.completed_at) return false;
              const completedDate = new Date(exp.completed_at);
              const cutoffDate = new Date();
              cutoffDate.setDate(cutoffDate.getDate() - days);
              return completedDate >= cutoffDate;
            });

            if (recentExperiments.length >= 3) {
              generatedInsights.push({
                type: 'achievement',
                title: 'Active Experimenter',
                description: `You've completed ${recentExperiments.length} experiments recently. Keep testing those beliefs!`,
                priority: 'medium',
                icon: CheckCircleIcon,
                color: 'text-purple-600',
              });
            } else if (recentExperiments.length === 0) {
              generatedInsights.push({
                type: 'focus_area',
                title: 'Try Behavioral Experiments',
                description: 'Experiments are powerful for challenging unhelpful beliefs.',
                priority: 'low',
                icon: InformationCircleIcon,
                color: 'text-blue-600',
              });
            }

            // Analyze belief changes
            const beliefChanges = recentExperiments
              .filter(exp => exp.belief_rating_before !== undefined && exp.belief_rating_after !== undefined)
              .map(exp => exp.belief_rating_after! - exp.belief_rating_before!);

            if (beliefChanges.length > 0) {
              const avgChange = beliefChanges.reduce((sum, change) => sum + change, 0) / beliefChanges.length;
              if (avgChange < -1) {
                generatedInsights.push({
                  type: 'achievement',
                  title: 'Belief Modification Success',
                  description: 'Your experiments are effectively reducing unhelpful beliefs.',
                  priority: 'high',
                  icon: CheckCircleIcon,
                  color: 'text-green-600',
                });
              }
            }
          } catch (err) {
            console.error('Error analyzing experiments:', err);
          }
        };

        // Analyze overall progress trend
        const analyzeOverallTrend = () => {
          const worryTrend = calculateTrend(metrics.worry_trend);
          const ruminationTrend = calculateTrend(metrics.rumination_trend);
          const attTrend = calculateTrend(metrics.att_minutes_trend);
          const dmTrend = calculateTrend(metrics.dm_count_trend);

          const positiveChanges = [
            worryTrend === 'down',
            ruminationTrend === 'down',
            attTrend === 'up',
            dmTrend === 'up',
          ].filter(Boolean).length;

          if (positiveChanges >= 3) {
            generatedInsights.push({
              type: 'achievement',
              title: 'Strong Overall Progress',
              description: 'Multiple positive trends detected. Your MCT journey is on track!',
              priority: 'high',
              icon: CheckCircleIcon,
              color: 'text-green-600',
            });
          } else if (positiveChanges <= 1) {
            generatedInsights.push({
              type: 'trend',
              title: 'Focus on Consistency',
              description: 'Regular practice of all MCT techniques will improve your progress.',
              priority: 'medium',
              icon: InformationCircleIcon,
              color: 'text-blue-600',
            });
          }
        };

        // Generate insights
        analyzeCASProgress();
        analyzePracticeConsistency();
        await analyzeExperiments();
        analyzeOverallTrend();

        // Sort insights by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        generatedInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        setInsights(generatedInsights.slice(0, 6)); // Limit to 6 insights

      } catch (err) {
        setError('Failed to generate insights');
        console.error('Error generating insights:', err);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [days]);

  const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / (firstAvg || 1)) * 100;

    if (change < -10) return 'down';
    if (change > 10) return 'up';
    return 'stable';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            className="mt-2 text-sm text-blue-600 hover:underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Progress Insights
      </h3>

      {insights.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <InformationCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No insights available yet.</p>
          <p className="text-sm mt-2">Keep practicing to generate personalized insights.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
                  insight.priority === 'high' ? 'border-blue-500 bg-blue-50' :
                  insight.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-gray-500 bg-gray-50'
                }`}
              >
                <IconComponent className={`h-6 w-6 ${insight.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {insight.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.type === 'achievement' ? 'bg-green-100 text-green-800' :
                      insight.type === 'focus_area' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}