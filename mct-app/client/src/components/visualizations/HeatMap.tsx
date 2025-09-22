import { format, startOfWeek, addDays } from 'date-fns';

export interface HeatMapData {
  date: string;
  value: number;
  label?: string;
}

interface HeatMapProps {
  data: HeatMapData[];
  startDate: Date;
  weeks: number;
  maxValue?: number;
  colorScheme?: 'green' | 'blue' | 'purple' | 'orange';
  className?: string;
  onCellClick?: (data: HeatMapData) => void;
  showLabels?: boolean;
  cellSize?: number;
}

const colorSchemes = {
  green: {
    0: 'bg-gray-100',
    1: 'bg-green-100',
    2: 'bg-green-200',
    3: 'bg-green-300',
    4: 'bg-green-400',
    5: 'bg-green-500',
  },
  blue: {
    0: 'bg-gray-100',
    1: 'bg-blue-100',
    2: 'bg-blue-200',
    3: 'bg-blue-300',
    4: 'bg-blue-400',
    5: 'bg-blue-500',
  },
  purple: {
    0: 'bg-gray-100',
    1: 'bg-purple-100',
    2: 'bg-purple-200',
    3: 'bg-purple-300',
    4: 'bg-purple-400',
    5: 'bg-purple-500',
  },
  orange: {
    0: 'bg-gray-100',
    1: 'bg-orange-100',
    2: 'bg-orange-200',
    3: 'bg-orange-300',
    4: 'bg-orange-400',
    5: 'bg-orange-500',
  },
};

export default function HeatMap({
  data,
  startDate,
  weeks,
  maxValue,
  colorScheme = 'green',
  className = '',
  onCellClick,
  showLabels = true,
  cellSize = 12,
}: HeatMapProps) {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Start week on Monday
  const dataMap = new Map(data.map(d => [d.date, d]));
  const calculatedMaxValue = maxValue || Math.max(...data.map(d => d.value), 1);

  const getIntensity = (value: number): keyof typeof colorSchemes.green => {
    if (value === 0) return 0;
    const percentage = value / calculatedMaxValue;
    if (percentage <= 0.2) return 1;
    if (percentage <= 0.4) return 2;
    if (percentage <= 0.6) return 3;
    if (percentage <= 0.8) return 4;
    return 5;
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={`${className}`}>
      <div className="flex">
        {showLabels && (
          <div className="flex flex-col justify-between mr-2" style={{ height: `${7 * (cellSize + 2)}px` }}>
            {days.map((day) => (
              <div
                key={day}
                className="text-xs text-gray-600 flex items-center"
                style={{ height: `${cellSize}px` }}
              >
                {day}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1">
          {Array.from({ length: weeks }, (_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const date = addDays(weekStart, weekIndex * 7 + dayIndex);
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayData = dataMap.get(dateStr);
                const value = dayData?.value || 0;
                const intensity = getIntensity(value);
                const colors = colorSchemes[colorScheme];

                return (
                  <div
                    key={dayIndex}
                    className={`${colors[intensity]} rounded cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-gray-400 flex items-center justify-center`}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      fontSize: `${Math.max(8, cellSize / 2)}px`
                    }}
                    onClick={() => dayData && onCellClick?.(dayData)}
                    title={`${format(date, 'MMM d, yyyy')}: ${dayData?.label || value}`}
                  >
                    {cellSize >= 20 && value > 0 && (
                      <span className="text-xs font-medium text-white">
                        {value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          {Object.entries(colorSchemes[colorScheme]).map(([level, colorClass]) => (
            <div
              key={level}
              className={`${colorClass} rounded`}
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}