import { useEffect, useState } from 'react';
import LineChart, { LineChartData } from './LineChart';
import { casLogApi } from '../../services/api';
import { CASLog } from '../../types';
import { format, subDays } from 'date-fns';

interface CASReductionGraphProps {
  days?: number;
  height?: number;
  showTrend?: boolean;
  className?: string;
}

export default function CASReductionGraph({
  days = 30,
  height = 300,
  showTrend = true,
  className = '',
}: CASReductionGraphProps) {
  const [data, setData] = useState<LineChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = subDays(endDate, days);

        const logs = await casLogApi.getAll(
          format(startDate, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );

        const chartData = logs.map((log: CASLog) => ({
          date: log.date,
          worry: log.worry_minutes,
          rumination: log.rumination_minutes,
          monitoring: log.monitoring_count,
        }));

        // Fill in missing dates with zeros
        const filledData: LineChartData[] = [];
        for (let i = 0; i < days; i++) {
          const date = format(subDays(endDate, days - 1 - i), 'yyyy-MM-dd');
          const existingLog = chartData.find(log => log.date === date);
          filledData.push({
            date,
            worry: existingLog?.worry || 0,
            rumination: existingLog?.rumination || 0,
            monitoring: existingLog?.monitoring || 0,
          });
        }

        setData(filledData);
      } catch (err) {
        setError('Failed to load CAS data');
        console.error('Error fetching CAS data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  const getTrendDirection = (data: LineChartData[], key: string): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';

    const recentValues = data.slice(-7).map(d => Number(d[key]) || 0);
    const earlierValues = data.slice(-14, -7).map(d => Number(d[key]) || 0);

    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const earlierAvg = earlierValues.reduce((a, b) => a + b, 0) / earlierValues.length;

    const change = ((recentAvg - earlierAvg) / (earlierAvg || 1)) * 100;

    if (change < -10) return 'down'; // Improvement (reduction in CAS)
    if (change > 10) return 'up'; // Worsening (increase in CAS)
    return 'stable';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  const lines = [
    {
      key: 'worry',
      label: 'Worry (minutes)',
      color: '#ef4444',
    },
    {
      key: 'rumination',
      label: 'Rumination (minutes)',
      color: '#f97316',
    },
    {
      key: 'monitoring',
      label: 'Monitoring (count)',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          CAS Reduction Trends
        </h3>
        {showTrend && data.length > 0 && (
          <div className="flex space-x-4 text-sm">
            {lines.map(line => {
              const trend = getTrendDirection(data, line.key);
              const trendIcon = trend === 'down' ? '↓' : trend === 'up' ? '↑' : '→';
              const trendColor = trend === 'down' ? 'text-green-600' : trend === 'up' ? 'text-red-600' : 'text-gray-600';

              return (
                <div key={line.key} className={`flex items-center ${trendColor}`}>
                  <span className="mr-1">{trendIcon}</span>
                  <span>{line.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <LineChart
        data={data}
        lines={lines}
        height={height}
        xAxisLabel="Date"
        yAxisLabel="Value"
        formatTooltip={(value, name) => [
          `${value}${name.includes('minutes') ? ' min' : ''}`,
          name
        ]}
      />

      <div className="mt-4 text-xs text-gray-600">
        <p>Lower values indicate better CAS control. Aim for consistent downward trends.</p>
      </div>
    </div>
  );
}