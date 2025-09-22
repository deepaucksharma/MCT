import { useState, useEffect } from 'react';
import DMPractice from './DMPractice';
import DMScheduler from './DMScheduler';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

type TimeOfDay = 'morning' | 'midday' | 'evening';
type View = 'scheduler' | 'practice' | 'success';

interface DMPracticeData {
  duration_seconds: number;
  engaged_vs_watched: 'engaged' | 'watched';
  confidence_rating: number;
  metaphor_used: 'radio' | 'screen' | 'weather';
  time_of_day: TimeOfDay;
}

interface DMSession {
  id: string;
  timeOfDay: TimeOfDay;
  scheduledTime: string;
  completed: boolean;
  completedAt?: string;
}

interface DMManagerProps {
  onClose?: () => void;
}

export default function DMManager({ onClose }: DMManagerProps) {
  const [currentView, setCurrentView] = useState<View>('scheduler');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay>('morning');
  const [completedSessions, setCompletedSessions] = useState<DMSession[]>([]);
  const [lastPracticeData, setLastPracticeData] = useState<DMPracticeData | null>(null);

  useEffect(() => {
    // Load today's completed sessions from API
    loadTodaysSessions();
  }, []);

  const loadTodaysSessions = async () => {
    try {
      const response = await fetch('/api/dm-practices/today');
      if (response.ok) {
        const practices = await response.json();
        const sessions = practices.map((practice: any) => ({
          id: practice.id.toString(),
          timeOfDay: practice.time_of_day,
          scheduledTime: getScheduledTimeForPeriod(practice.time_of_day),
          completed: true,
          completedAt: practice.created_at
        }));
        setCompletedSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading today\'s sessions:', error);
    }
  };

  const getScheduledTimeForPeriod = (timeOfDay: TimeOfDay): string => {
    const defaultTimes = {
      morning: '08:00',
      midday: '13:00',
      evening: '18:00'
    };
    return defaultTimes[timeOfDay];
  };

  const handleStartPractice = (timeOfDay: TimeOfDay) => {
    setSelectedTimeOfDay(timeOfDay);
    setCurrentView('practice');
  };

  const handlePracticeComplete = async (practiceData: DMPracticeData) => {
    try {
      // Save to database
      const response = await fetch('/api/dm-practices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...practiceData,
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        setLastPracticeData(practiceData);
        setCurrentView('success');

        // Update completed sessions
        await loadTodaysSessions();

        // Auto-return to scheduler after 3 seconds
        setTimeout(() => {
          setCurrentView('scheduler');
        }, 3000);
      } else {
        console.error('Failed to save practice');
        // Still show success but with warning
        setCurrentView('success');
      }
    } catch (error) {
      console.error('Error saving practice:', error);
      setCurrentView('success');
    }
  };

  const handleBackToScheduler = () => {
    setCurrentView('scheduler');
  };

  const renderHeader = () => {
    const titles = {
      scheduler: 'DM Practice Schedule',
      practice: `${selectedTimeOfDay.charAt(0).toUpperCase() + selectedTimeOfDay.slice(1)} Practice`,
      success: 'Practice Complete!'
    };

    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {(currentView === 'practice' || currentView === 'success') && (
            <button
              onClick={handleBackToScheduler}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">
            {titles[currentView]}
          </h1>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        )}
      </div>
    );
  };

  const renderSuccessView = () => (
    <div className="p-6 text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500" />
      </div>

      <h2 className="text-xl font-bold text-gray-900">
        Great work!
      </h2>

      {lastPracticeData && (
        <div className="space-y-2 text-sm text-gray-600">
          <p>Duration: {lastPracticeData.duration_seconds} seconds</p>
          <p>Approach: {lastPracticeData.engaged_vs_watched === 'watched' ? 'Watched thoughts' : 'Engaged with thoughts'}</p>
          <p>Confidence: {lastPracticeData.confidence_rating}/100</p>
          <p>Metaphor: {lastPracticeData.metaphor_used?.charAt(0).toUpperCase() + lastPracticeData.metaphor_used?.slice(1)}</p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        {lastPracticeData?.engaged_vs_watched === 'watched' ? (
          <p className="text-green-600">
            Excellent! You're building the skill of detached observation.
          </p>
        ) : (
          <p className="text-blue-600">
            That's okay. Notice the difference between watching and engaging for next time.
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Returning to schedule automatically...
      </p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {renderHeader()}

      <div className="min-h-[400px]">
        {currentView === 'scheduler' && (
          <div className="p-6">
            <DMScheduler
              onStartPractice={handleStartPractice}
              completedSessions={completedSessions}
            />
          </div>
        )}

        {currentView === 'practice' && (
          <div className="p-6">
            <DMPractice
              onComplete={handlePracticeComplete}
              timeOfDay={selectedTimeOfDay}
            />
          </div>
        )}

        {currentView === 'success' && renderSuccessView()}
      </div>
    </div>
  );
}