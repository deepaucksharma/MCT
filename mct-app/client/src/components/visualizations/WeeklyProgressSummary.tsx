import { useEffect, useState } from 'react';
import ProgressRing from './ProgressRing';
import SparkLine, { SparkLineData } from './SparkLine';
import { progressApi } from '../../services/api';

interface WeeklyStats {
  cas_averages: {
    worry: number;
    rumination: number;
    monitoring: number;
  };
  practice_totals: {
    att_minutes: number;
    dm_count: number;
  };
  experiments_completed: number;
  belief_changes: {
    uncontrollability: number;
    danger: number;
    positive: number;
  };
}

interface WeeklyProgressSummaryProps {
  className?: string;
}

export default function WeeklyProgressSummary({
  className = '',
}: WeeklyProgressSummaryProps) {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [sparklineData, setSparklineData] = useState<{
    cas: SparkLineData[];
    att: SparkLineData[];
    dm: SparkLineData[];
  }>({
    cas: [],
    att: [],
    dm: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch weekly summary
        const summary = await progressApi.getWeeklySummary();
        setWeeklyStats(summary);

        // Fetch metrics for sparklines (last 7 days)
        const metrics = await progressApi.getMetrics(7);

        // Process sparkline data
        setSparklineData({
          cas: metrics.worry_trend.map((value: number, index: number) => ({
            value: (value + (metrics.rumination_trend[index] || 0)) / 2, // Average of worry and rumination
          })),
          att: metrics.att_minutes_trend.map((value: number) => ({ value })),
          dm: metrics.dm_count_trend.map((value: number) => ({ value })),
        });

      } catch (err) {
        setError('Failed to load weekly progress');
        console.error('Error fetching weekly progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateAttProgress = () => {
    if (!weeklyStats) return 0;
    const target = 105; // 15 minutes × 7 days
    return Math.min((weeklyStats.practice_totals.att_minutes / target) * 100, 100);
  };

  const calculateDmProgress = () => {
    if (!weeklyStats) return 0;
    const target = 21; // 3 practices × 7 days
    return Math.min((weeklyStats.practice_totals.dm_count / target) * 100, 100);
  };

  const getCASImprovement = () => {
    if (!weeklyStats) return 'stable';
    const avgCAS = (weeklyStats.cas_averages.worry + weeklyStats.cas_averages.rumination) / 2;
    if (avgCAS < 30) return 'down'; // Good improvement
    if (avgCAS > 60) return 'up'; // Needs attention
    return 'stable';
  };

  const getTrend = (data: SparkLineData[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const change = ((last - first) / (first || 1)) * 100;
    if (change < -10) return 'down';
    if (change > 10) return 'up';
    return 'stable';
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !weeklyStats) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error || 'No data available'}</p>
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

  const cards = [
    {
      title: 'CAS Control',
      value: Math.round((weeklyStats.cas_averages.worry + weeklyStats.cas_averages.rumination) / 2),
      unit: 'min avg',
      description: 'Daily worry + rumination',
      sparkline: sparklineData.cas,
      trend: getCASImprovement() as 'up' | 'down' | 'stable',
      color: getCASImprovement() === 'down' ? '#10b981' : getCASImprovement() === 'up' ? '#ef4444' : '#6b7280',
      isGoodWhenLow: true,
    },
    {
      title: 'ATT Practice',
      value: calculateAttProgress(),
      unit: '%',
      description: `${weeklyStats.practice_totals.att_minutes} of 105 min`,
      sparkline: sparklineData.att,
      trend: getTrend(sparklineData.att) as 'up' | 'down' | 'stable',
      color: '#3b82f6',
      isProgress: true,
    },
    {
      title: 'DM Practice',
      value: calculateDmProgress(),
      unit: '%',
      description: `${weeklyStats.practice_totals.dm_count} of 21 practices`,
      sparkline: sparklineData.dm,
      trend: getTrend(sparklineData.dm) as 'up' | 'down' | 'stable',
      color: '#10b981',
      isProgress: true,
    },
    {
      title: 'Experiments',
      value: weeklyStats.experiments_completed,
      unit: 'completed',
      description: 'This week',
      sparkline: [],
      trend: 'stable' as const,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
            {card.sparkline.length > 0 && (
              <div className="w-16 h-8">
                <SparkLine
                  data={card.sparkline}
                  color={card.color}
                  trend={card.trend}
                  height={32}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center mb-4">
            {card.isProgress ? (
              <ProgressRing
                percentage={card.value}
                size={80}
                color={card.color}
                showText={true}
                text={`${Math.round(card.value)}%`}
              />
            ) : (
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  card.isGoodWhenLow
                    ? card.value < 30 ? 'text-green-600' : card.value > 60 ? 'text-red-600' : 'text-gray-900'
                    : 'text-gray-900'
                }`}>
                  {card.value}
                </div>
                <div className="text-sm text-gray-500">{card.unit}</div>
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600">{card.description}</div>
            {card.trend !== 'stable' && (
              <div className={`text-xs mt-1 ${
                card.trend === 'up' ?
                  (card.isGoodWhenLow ? 'text-red-600' : 'text-green-600') :
                  (card.isGoodWhenLow ? 'text-green-600' : 'text-red-600')
              }`}>
                {card.trend === 'up' ? '↗' : '↘'} Trending {card.trend}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}