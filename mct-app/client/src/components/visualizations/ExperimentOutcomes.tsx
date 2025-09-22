import { useEffect, useState } from 'react';
import BarChart, { BarChartData } from './BarChart';
import { experimentApi } from '../../services/api';
import { Experiment } from '../../types';
import { format } from 'date-fns';

interface ExperimentOutcomesProps {
  weeks?: number;
  showDetails?: boolean;
  className?: string;
}

interface ExperimentSummary {
  total: number;
  completed: number;
  planned: number;
  in_progress: number;
  avgBeliefChange: number;
  successRate: number;
}

export default function ExperimentOutcomes({
  weeks,
  showDetails = true,
  className = '',
}: ExperimentOutcomesProps) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [summary, setSummary] = useState<ExperimentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all experiments, optionally filtered by week
        const allExperiments = await experimentApi.getAll(undefined, weeks);
        setExperiments(allExperiments);

        // Calculate summary statistics
        const completedExperiments = allExperiments.filter(exp => exp.status === 'completed');

        let avgBeliefChange = 0;
        let successfulExperiments = 0;

        if (completedExperiments.length > 0) {
          const beliefChanges = completedExperiments
            .filter(exp => exp.belief_rating_before !== undefined && exp.belief_rating_after !== undefined)
            .map(exp => (exp.belief_rating_after! - exp.belief_rating_before!));

          if (beliefChanges.length > 0) {
            avgBeliefChange = beliefChanges.reduce((sum, change) => sum + change, 0) / beliefChanges.length;
          }

          // Count experiments as successful if they led to belief reduction or positive outcomes
          successfulExperiments = completedExperiments.filter(exp => {
            if (exp.belief_rating_before !== undefined && exp.belief_rating_after !== undefined) {
              // For negative beliefs (uncontrollability, danger), reduction is good
              // For positive beliefs, increase is good
              const beliefType = exp.belief_tested?.toLowerCase() || '';
              const beliefChange = exp.belief_rating_after - exp.belief_rating_before;

              if (beliefType.includes('positive')) {
                return beliefChange > 0; // Increase in positive beliefs is good
              } else {
                return beliefChange < 0; // Decrease in negative beliefs is good
              }
            }

            // If no belief ratings, consider successful if outcome mentions positive words
            const outcome = exp.outcome?.toLowerCase() || '';
            return outcome.includes('better') || outcome.includes('improved') || outcome.includes('helpful') || outcome.includes('positive');
          }).length;
        }

        const summaryStats: ExperimentSummary = {
          total: allExperiments.length,
          completed: completedExperiments.length,
          planned: allExperiments.filter(exp => exp.status === 'planned').length,
          in_progress: allExperiments.filter(exp => exp.status === 'in_progress').length,
          avgBeliefChange: Math.round(avgBeliefChange * 10) / 10,
          successRate: completedExperiments.length > 0 ? (successfulExperiments / completedExperiments.length) * 100 : 0,
        };

        setSummary(summaryStats);
      } catch (err) {
        setError('Failed to load experiment data');
        console.error('Error fetching experiment data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weeks]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          {showDetails && <div className="h-64 bg-gray-200 rounded"></div>}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error || 'No experiment data available'}</p>
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

  // Prepare data for status distribution chart
  const statusData: BarChartData[] = [
    { name: 'Completed', value: summary.completed },
    { name: 'In Progress', value: summary.in_progress },
    { name: 'Planned', value: summary.planned },
  ].filter(item => item.value > 0);

  const statusBars = [
    { key: 'value', label: 'Experiments', color: '#10b981' },
  ];

  // Get recent completed experiments for details
  const recentCompleted = experiments
    .filter(exp => exp.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
    .slice(0, 5);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Experiment Outcomes
        </h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-blue-700">Total Experiments</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(summary.successRate)}%
            </div>
            <div className="text-sm text-purple-700">Success Rate</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${
              summary.avgBeliefChange < 0 ? 'text-green-600' :
              summary.avgBeliefChange > 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {summary.avgBeliefChange > 0 ? '+' : ''}{summary.avgBeliefChange}
            </div>
            <div className="text-sm text-orange-700">Avg Belief Change</div>
          </div>
        </div>

        {/* Status Distribution Chart */}
        {statusData.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Status Distribution</h4>
            <BarChart
              data={statusData}
              bars={statusBars}
              height={200}
              layout="horizontal"
              formatTooltip={(value, name) => [`${value} experiments`, name]}
            />
          </div>
        )}
      </div>

      {/* Recent Experiments Details */}
      {showDetails && recentCompleted.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Recent Completed Experiments</h4>
          <div className="space-y-4">
            {recentCompleted.map((experiment, index) => {
              const beliefChange = experiment.belief_rating_before !== undefined && experiment.belief_rating_after !== undefined
                ? experiment.belief_rating_after - experiment.belief_rating_before
                : null;

              return (
                <div key={experiment.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 truncate">
                        {experiment.belief_tested || 'Unnamed Experiment'}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {experiment.outcome || 'No outcome recorded'}
                      </p>
                      {experiment.learning && (
                        <p className="text-sm text-blue-600 mt-1 italic">
                          "{experiment.learning}"
                        </p>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center space-x-4">
                      {beliefChange !== null && (
                        <div className={`text-sm font-medium ${
                          beliefChange < 0 ? 'text-green-600' :
                          beliefChange > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {beliefChange > 0 ? '+' : ''}{beliefChange.toFixed(1)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {experiment.completed_at && format(new Date(experiment.completed_at), 'MMM d')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {experiments.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <p>No experiments found for the selected period.</p>
          <p className="text-sm mt-2">Start conducting behavioral experiments to see your progress here.</p>
        </div>
      )}
    </div>
  );
}