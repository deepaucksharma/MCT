import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  bars: {
    key: string;
    label: string;
    color: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatYAxis?: (value: number) => string;
  formatTooltip?: (value: number, name: string) => [string, string];
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export default function BarChart({
  data,
  bars,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisLabel,
  yAxisLabel,
  formatYAxis,
  formatTooltip,
  className = '',
  layout = 'vertical',
}: BarChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          {layout === 'vertical' ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={formatYAxis}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={formatYAxis}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={formatTooltip}
          />
          {showLegend && <Legend />}
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color}
              name={bar.label}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
      {xAxisLabel && (
        <div className="text-center text-sm text-gray-600 mt-2">{xAxisLabel}</div>
      )}
    </div>
  );
}