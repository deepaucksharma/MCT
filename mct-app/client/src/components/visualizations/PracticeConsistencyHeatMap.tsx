import { useEffect, useState } from 'react';
import HeatMap, { HeatMapData } from './HeatMap';
import { attSessionApi, dmPracticeApi } from '../../services/api';
import { ATTSession, DMPractice } from '../../types';
import { format, subDays } from 'date-fns';

interface PracticeConsistencyHeatMapProps {
  weeks?: number;
  practiceType?: 'att' | 'dm' | 'both';
  className?: string;
}

export default function PracticeConsistencyHeatMap({
  weeks = 12,
  practiceType = 'both',
  className = '',
}: PracticeConsistencyHeatMapProps) {
  const [attData, setAttData] = useState<HeatMapData[]>([]);
  const [dmData, setDmData] = useState<HeatMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'att' | 'dm' | 'combined'>(
    practiceType === 'both' ? 'combined' : practiceType
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = subDays(endDate, weeks * 7);

        // Fetch ATT sessions if needed
        let attSessions: ATTSession[] = [];
        if (practiceType === 'att' || practiceType === 'both') {
          attSessions = await attSessionApi.getAll(
            format(startDate, 'yyyy-MM-dd'),
            format(endDate, 'yyyy-MM-dd')
          );
        }

        // Fetch DM practices if needed
        let dmPractices: DMPractice[] = [];
        if (practiceType === 'dm' || practiceType === 'both') {
          dmPractices = await dmPracticeApi.getAll(
            format(startDate, 'yyyy-MM-dd'),
            format(endDate, 'yyyy-MM-dd')
          );
        }

        // Process ATT data
        const attHeatData: HeatMapData[] = [];
        const attMap = new Map();
        attSessions.forEach(session => {
          const date = session.date;
          const existing = attMap.get(date) || 0;
          attMap.set(date, existing + (session.completed ? session.duration_minutes : 0));
        });

        // Process DM data
        const dmHeatData: HeatMapData[] = [];
        const dmMap = new Map();
        dmPractices.forEach(practice => {
          const date = practice.date;
          const existing = dmMap.get(date) || 0;
          dmMap.set(date, existing + 1);
        });

        // Fill in all dates for the period
        for (let i = 0; i < weeks * 7; i++) {
          const date = format(subDays(endDate, weeks * 7 - 1 - i), 'yyyy-MM-dd');

          if (practiceType === 'att' || practiceType === 'both') {
            const attMinutes = attMap.get(date) || 0;
            attHeatData.push({
              date,
              value: attMinutes,
              label: `${attMinutes} minutes`,
            });
          }

          if (practiceType === 'dm' || practiceType === 'both') {
            const dmCount = dmMap.get(date) || 0;
            dmHeatData.push({
              date,
              value: dmCount,
              label: `${dmCount} practices`,
            });
          }
        }

        setAttData(attHeatData);
        setDmData(dmHeatData);
      } catch (err) {
        setError('Failed to load practice data');
        console.error('Error fetching practice data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weeks, practiceType]);

  const getCombinedData = (): HeatMapData[] => {
    const combinedMap = new Map<string, { att: number; dm: number }>();

    attData.forEach(item => {
      combinedMap.set(item.date, { att: item.value, dm: 0 });
    });

    dmData.forEach(item => {
      const existing = combinedMap.get(item.date) || { att: 0, dm: 0 };
      combinedMap.set(item.date, { ...existing, dm: item.value });
    });

    return Array.from(combinedMap.entries()).map(([date, values]) => {
      // Normalize ATT (target: 15 min) and DM (target: 3 practices) to 0-1 scale
      const attScore = Math.min(values.att / 15, 1);
      const dmScore = Math.min(values.dm / 3, 1);
      const combinedScore = Math.round((attScore + dmScore) * 50) / 10; // Scale to 0-10

      return {
        date,
        value: combinedScore,
        label: `ATT: ${values.att}min, DM: ${values.dm} practices`,
      };
    });
  };

  const getMaxValue = () => {
    switch (selectedView) {
      case 'att':
        return 30; // 30 minutes max for good visualization
      case 'dm':
        return 5; // 5 DM practices max
      case 'combined':
        return 10; // Combined score 0-10
      default:
        return 10;
    }
  };

  const getColorScheme = () => {
    switch (selectedView) {
      case 'att':
        return 'blue' as const;
      case 'dm':
        return 'green' as const;
      case 'combined':
        return 'purple' as const;
      default:
        return 'green' as const;
    }
  };

  const getCurrentData = (): HeatMapData[] => {
    switch (selectedView) {
      case 'att':
        return attData;
      case 'dm':
        return dmData;
      case 'combined':
        return getCombinedData();
      default:
        return [];
    }
  };

  const calculateStreaks = (data: HeatMapData[]) => {
    let currentStreak = 0;
    let longestStreak = 0;

    // Go through data in reverse (most recent first)
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].value > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return { current: currentStreak, longest: longestStreak };
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

  const currentData = getCurrentData();
  const streaks = calculateStreaks(currentData);
  const startDate = subDays(new Date(), weeks * 7);

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
          Practice Consistency
        </h3>

        {practiceType === 'both' && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedView === 'att' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => setSelectedView('att')}
            >
              ATT
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedView === 'dm' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => setSelectedView('dm')}
            >
              DM
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedView === 'combined' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => setSelectedView('combined')}
            >
              Combined
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <HeatMap
          data={currentData}
          startDate={startDate}
          weeks={weeks}
          maxValue={getMaxValue()}
          colorScheme={getColorScheme()}
          cellSize={16}
          onCellClick={(data) => {
            console.log('Clicked date:', data.date, 'Value:', data.value);
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{streaks.current}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{streaks.longest}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {currentData.filter(d => d.value > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Days</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((currentData.filter(d => d.value > 0).length / currentData.length) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Consistency</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <p>
          {selectedView === 'att' && 'Each cell represents minutes of ATT practice. Target: 15+ minutes daily.'}
          {selectedView === 'dm' && 'Each cell represents number of DM practices. Target: 3+ practices daily.'}
          {selectedView === 'combined' && 'Combined score based on both ATT and DM practice targets.'}
        </p>
      </div>
    </div>
  );
}