import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ProgressReviewProps {
  weekNumber: number;
  onContinue: () => void;
  onSkip: () => void;
}

interface ProgressMetric {
  name: string;
  current: number;
  previous: number;
  unit: string;
  trend: 'improving' | 'stable' | 'concerning';
  description: string;
}

export default function ProgressReview({
  weekNumber,
  onContinue,
  onSkip
}: ProgressReviewProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock progress data - in real app this would come from stored assessments
  const progressMetrics: ProgressMetric[] = [
    {
      name: 'Daily Worry Time',
      current: Math.floor(Math.random() * 60) + 30,
      previous: Math.floor(Math.random() * 60) + 90,
      unit: 'minutes',
      trend: 'improving',
      description: 'Time spent in active worry each day'
    },
    {
      name: 'Rumination Frequency',
      current: Math.floor(Math.random() * 30) + 20,
      previous: Math.floor(Math.random() * 30) + 40,
      unit: '%',
      trend: 'improving',
      description: 'Percentage of day spent ruminating'
    },
    {
      name: 'Threat Monitoring',
      current: Math.floor(Math.random() * 40) + 30,
      previous: Math.floor(Math.random() * 40) + 60,
      unit: 'episodes',
      trend: 'improving',
      description: 'Daily instances of scanning for threats'
    },
    {
      name: 'Attention Control',
      current: Math.floor(Math.random() * 30) + 60,
      previous: Math.floor(Math.random() * 30) + 40,
      unit: '%',
      trend: 'improving',
      description: 'Ability to direct attention where you choose'
    },
    {
      name: 'Metacognitive Awareness',
      current: Math.floor(Math.random() * 20) + 70,
      previous: Math.floor(Math.random() * 20) + 50,
      unit: '%',
      trend: 'improving',
      description: 'Awareness of your thought processes'
    }
  ];

  const getChangeIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'concerning': return '📉';
      default: return '📊';
    }
  };

  const getChangeColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'concerning': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeValue = (metric: ProgressMetric) => {
    const change = metric.current - metric.previous;
    const isPositiveChange =
      (metric.name.includes('Control') || metric.name.includes('Awareness'))
        ? change > 0
        : change < 0;

    return {
      value: Math.abs(change),
      isPositive: isPositiveChange,
      percentage: Math.round((Math.abs(change) / metric.previous) * 100)
    };
  };

  const beliefRatings = [
    {
      belief: 'My worry is uncontrollable',
      current: Math.floor(Math.random() * 30) + 30,
      previous: Math.floor(Math.random() * 30) + 60,
      context: 'Lower ratings indicate better metacognitive understanding'
    },
    {
      belief: 'Worry is dangerous for me',
      current: Math.floor(Math.random() * 25) + 25,
      previous: Math.floor(Math.random() * 25) + 55,
      context: 'Reduced belief in worry as harmful'
    },
    {
      belief: 'I need to worry to be prepared',
      current: Math.floor(Math.random() * 35) + 40,
      previous: Math.floor(Math.random() * 35) + 70,
      context: 'Developing alternative ways to feel prepared'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <ArrowUpIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Progress Review
          </h2>
        </div>
        <p className="text-gray-600">
          See how your patterns and skills have evolved over time
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Key Metrics</h3>
        <div className="space-y-3">
          {progressMetrics.map((metric, index) => {
            const change = getChangeValue(metric);
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMetric === metric.name
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMetric(
                  selectedMetric === metric.name ? null : metric.name
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getChangeIcon(metric.trend)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <p className="text-sm text-gray-600">
                          {metric.current} {metric.unit}
                          <span className={`ml-2 ${getChangeColor(metric.trend)}`}>
                            {change.isPositive ? '↗' : '↘'} {change.percentage}%
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {metric.current} {metric.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      was {metric.previous} {metric.unit}
                    </div>
                  </div>
                </div>

                {selectedMetric === metric.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <p className="text-gray-600 text-sm">{metric.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs">
                      <span className="text-gray-500">Previous: {metric.previous} {metric.unit}</span>
                      <span className="text-gray-500">Current: {metric.current} {metric.unit}</span>
                      <span className={getChangeColor(metric.trend)}>
                        {change.isPositive ? '+' : '-'}{change.value} {metric.unit} ({change.percentage}%)
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Belief Changes */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Metacognitive Beliefs</h3>
        <div className="space-y-3">
          {beliefRatings.map((belief, index) => {
            const change = belief.current - belief.previous;
            const changePercent = Math.round((Math.abs(change) / belief.previous) * 100);

            return (
              <motion.div
                key={belief.belief}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">
                      "{belief.belief}"
                    </h4>
                    <p className="text-sm text-blue-700">{belief.context}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-800">
                      {belief.current}%
                    </div>
                    <div className="text-sm text-green-600">
                      ↘ {changePercent}% decrease
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-medium text-green-900 mb-2">Overall Progress Assessment</h3>
        <p className="text-green-800 text-sm mb-3">
          Your metrics show consistent improvement across multiple areas. The combination of
          reduced CAS behaviors and increased metacognitive skills indicates strong progress.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-800">85%</div>
            <div className="text-xs text-green-600">Metrics improving</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-800">12%</div>
            <div className="text-xs text-green-600">Avg improvement</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-800">Week {weekNumber}</div>
            <div className="text-xs text-green-600">Current module</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onContinue}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Plan This Week
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Skip Review
        </button>
      </div>
    </div>
  );
}