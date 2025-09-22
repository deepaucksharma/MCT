import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

export interface SparkLineData {
  value: number;
}

interface SparkLineProps {
  data: SparkLineData[];
  color?: string;
  height?: number;
  strokeWidth?: number;
  className?: string;
  showDots?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

export default function SparkLine({
  data,
  color = '#10b981',
  height = 40,
  strokeWidth = 2,
  className = '',
  showDots = false,
  trend,
}: SparkLineProps) {
  const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    stable: '#6b7280',
  };

  const lineColor = trend ? trendColors[trend] : color;

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={strokeWidth}
            dot={showDots ? { fill: lineColor, strokeWidth: 0, r: 2 } : false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}