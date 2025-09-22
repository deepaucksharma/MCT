import { useEffect, useState } from 'react';
import BarChart, { BarChartData } from './BarChart';
import LineChart, { LineChartData } from './LineChart';
import { beliefRatingApi, experimentApi } from '../../services/api';
import { format, subDays } from 'date-fns';

interface BeliefChangeTrackerProps {
  days?: number;
  showBeforeAfter?: boolean;
  showTrends?: boolean;
  className?: string;
}

interface BeliefChange {
  type: string;
  before: number;
  after: number;
  change: number;
}

export default function BeliefChangeTracker({
  days = 30,
  showBeforeAfter = true,
  showTrends = true,
  className = '',
}: BeliefChangeTrackerProps) {
  const [beliefChanges, setBeliefChanges] = useState<BeliefChange[]>([]);
  const [trendData, setTrendData] = useState<LineChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = subDays(endDate, days);

        // Fetch belief ratings trends
        const trends = await beliefRatingApi.getTrends(days);

        // Prepare trend chart data
        const chartData: LineChartData[] = [];
        const maxLength = Math.max(
          trends.uncontrollability.length,
          trends.danger.length,
          trends.positive.length
        );

        for (let i = 0; i < maxLength; i++) {
          const date = format(subDays(endDate, maxLength - 1 - i), 'yyyy-MM-dd');
          chartData.push({
            date,
            uncontrollability: trends.uncontrollability[i]?.rating || 0,
            danger: trends.danger[i]?.rating || 0,
            positive: trends.positive[i]?.rating || 0,
          });
        }
        setTrendData(chartData);

        // Fetch completed experiments for before/after comparison
        const experiments = await experimentApi.getAll('completed');

        // Calculate belief changes from experiments
        const beliefTypes = ['uncontrollability', 'danger', 'positive'];
        const changes: BeliefChange[] = [];

        for (const type of beliefTypes) {
          const typeExperiments = experiments.filter(exp =>
            exp.belief_rating_before !== undefined &&
            exp.belief_rating_after !== undefined &&
            exp.belief_tested?.toLowerCase().includes(type)
          );

          if (typeExperiments.length > 0) {
            const avgBefore = typeExperiments.reduce((sum, exp) => sum + (exp.belief_rating_before || 0), 0) / typeExperiments.length;
            const avgAfter = typeExperiments.reduce((sum, exp) => sum + (exp.belief_rating_after || 0), 0) / typeExperiments.length;

            changes.push({
              type: type.charAt(0).toUpperCase() + type.slice(1),
              before: Math.round(avgBefore * 10) / 10,
              after: Math.round(avgAfter * 10) / 10,
              change: Math.round((avgAfter - avgBefore) * 10) / 10,
            });
          }
        }

        // If no experiment data, use latest vs oldest ratings
        if (changes.length === 0) {
          const latest = await beliefRatingApi.getLatest();
          const oldest = await beliefRatingApi.getAll(undefined, format(startDate, 'yyyy-MM-dd'), format(startDate, 'yyyy-MM-dd'));

          const beliefTypeMap = {
            uncontrollability: 'Uncontrollability',
            danger: 'Danger',
            positive: 'Positive',
          };

          Object.entries(latest).forEach(([type, current]) => {
            const oldRating = oldest.find(r => r.belief_type === type);
            if (oldRating) {
              changes.push({
                type: beliefTypeMap[type as keyof typeof beliefTypeMap],
                before: oldRating.rating,
                after: current.rating,
                change: Math.round((current.rating - oldRating.rating) * 10) / 10,
              });
            }
          });
        }

        setBeliefChanges(changes);
      } catch (err) {
        setError('Failed to load belief data');
        console.error('Error fetching belief data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          {showTrends && <div className="h-64 bg-gray-200 rounded"></div>}
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

  // Prepare bar chart data for before/after comparison
  const barData: BarChartData[] = beliefChanges.map(change => ({
    name: change.type,
    before: change.before,
    after: change.after,
  }));

  const bars = [
    { key: 'before', label: 'Before', color: '#ef4444' },
    { key: 'after', label: 'After', color: '#10b981' },
  ];

  // Prepare line chart data for trends
  const trendLines = [
    { key: 'uncontrollability', label: 'Uncontrollability', color: '#ef4444' },
    { key: 'danger', label: 'Danger', color: '#f97316' },
    { key: 'positive', label: 'Positive', color: '#10b981' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {showBeforeAfter && beliefChanges.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Belief Changes (Before vs After)
          </h3>

          <BarChart
            data={barData}
            bars={bars}
            height={250}
            yAxisLabel="Belief Rating (1-10)"
            formatYAxis={(value) => value.toString()}
            formatTooltip={(value, name) => [`${value}/10`, name]}
          />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {beliefChanges.map(change => (
              <div key={change.type} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">{change.type}</div>
                <div className={`text-lg font-bold ${
                  change.change < 0 ? 'text-green-600' :
                  change.change > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {change.change > 0 ? '+' : ''}{change.change}
                </div>
                <div className="text-xs text-gray-500">
                  {change.before} → {change.after}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTrends && trendData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Belief Rating Trends
          </h3>

          <LineChart
            data={trendData}
            lines={trendLines}
            height={300}
            xAxisLabel="Date"
            yAxisLabel="Belief Rating (1-10)"
            formatYAxis={(value) => value.toString()}
            formatTooltip={(value, name) => [`${value}/10`, name]}
          />

          <div className="mt-4 text-xs text-gray-600">
            <p>Lower ratings for Uncontrollability and Danger beliefs indicate progress. Higher Positive belief ratings show improvement.</p>
          </div>
        </div>
      )}

      {beliefChanges.length === 0 && trendData.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <p>No belief rating data available for the selected period.</p>
          <p className="text-sm mt-2">Complete experiments or log belief ratings to see your progress.</p>
        </div>
      )}
    </div>
  );
}