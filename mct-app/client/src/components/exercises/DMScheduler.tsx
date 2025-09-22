import { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, ExclamationCircleIcon, BookOpenIcon, PlayCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { mctResources } from '../../data/mctResources';

type TimeOfDay = 'morning' | 'midday' | 'evening';

interface DMSession {
  id: string;
  timeOfDay: TimeOfDay;
  scheduledTime: string;
  completed: boolean;
  completedAt?: string;
}

interface DMSchedulerProps {
  onStartPractice: (timeOfDay: TimeOfDay) => void;
  completedSessions?: DMSession[];
}

const defaultSchedule = {
  morning: '08:00',
  midday: '13:00',
  evening: '18:00'
};

const timeOfDayLabels = {
  morning: 'Morning Practice',
  midday: 'Midday Practice',
  evening: 'Evening Practice'
};

const timeOfDayDescriptions = {
  morning: 'Start your day with mindful observation',
  midday: 'Reset your attention during the day',
  evening: 'Transition from work with awareness'
};

export default function DMScheduler({ onStartPractice, completedSessions = [] }: DMSchedulerProps) {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [todaysSessions, setTodaysSessions] = useState<DMSession[]>([]);

  useEffect(() => {
    // Initialize today's sessions
    const today = new Date().toISOString().split('T')[0];
    const sessions: DMSession[] = (Object.keys(defaultSchedule) as TimeOfDay[]).map((timeOfDay) => {
      const existing = completedSessions.find(s =>
        s.timeOfDay === timeOfDay &&
        s.completedAt?.startsWith(today)
      );

      return {
        id: `${today}-${timeOfDay}`,
        timeOfDay,
        scheduledTime: schedule[timeOfDay],
        completed: !!existing,
        completedAt: existing?.completedAt
      };
    });

    setTodaysSessions(sessions);
  }, [schedule, completedSessions]);

  const markSessionCompleted = (timeOfDay: TimeOfDay) => {
    setTodaysSessions(prev =>
      prev.map(session =>
        session.timeOfDay === timeOfDay
          ? { ...session, completed: true, completedAt: new Date().toISOString() }
          : session
      )
    );
  };

  const getCompletionStatus = () => {
    const completed = todaysSessions.filter(s => s.completed).length;
    const total = todaysSessions.length;
    return { completed, total };
  };

  const isTimeForSession = (timeOfDay: TimeOfDay): boolean => {
    const now = new Date();
    const [hours, minutes] = schedule[timeOfDay].split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Consider it "time" for the session if it's within 2 hours after scheduled time
    const twoHoursLater = new Date(scheduledTime.getTime() + 2 * 60 * 60 * 1000);

    return now >= scheduledTime && now <= twoHoursLater;
  };

  const getNextSession = (): DMSession | null => {
    const incomplete = todaysSessions.filter(s => !s.completed);
    if (incomplete.length === 0) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Find the next scheduled session
    const nextSession = incomplete.reduce((closest, session) => {
      const [hours, minutes] = schedule[session.timeOfDay].split(':').map(Number);
      const sessionTime = hours * 60 + minutes;

      if (!closest) return session;

      const [closestHours, closestMinutes] = schedule[closest.timeOfDay].split(':').map(Number);
      const closestTime = closestHours * 60 + closestMinutes;

      // If current time is past both sessions, pick the earlier one
      if (currentTime > sessionTime && currentTime > closestTime) {
        return sessionTime < closestTime ? session : closest;
      }

      // If current time is before both, pick the earlier one
      if (currentTime <= sessionTime && currentTime <= closestTime) {
        return sessionTime < closestTime ? session : closest;
      }

      // If one is past and one is future, pick the future one
      if (currentTime > sessionTime && currentTime <= closestTime) {
        return closest;
      }

      if (currentTime <= sessionTime && currentTime > closestTime) {
        return session;
      }

      return closest;
    });

    return nextSession || null;
  };

  const { completed, total } = getCompletionStatus();
  const nextSession = getNextSession();

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Daily DM Practice Schedule
        </h2>
        <div className="flex items-center justify-center space-x-2">
          <div className="text-sm text-gray-600">
            Progress: {completed}/{total} sessions completed today
          </div>
          {completed === total && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Next Session Prompt */}
      {nextSession && (
        <div className={`p-4 rounded-lg border-l-4 ${
          isTimeForSession(nextSession.timeOfDay)
            ? 'bg-green-50 border-green-500'
            : 'bg-blue-50 border-blue-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {isTimeForSession(nextSession.timeOfDay) ? 'Time for:' : 'Next up:'}
              </h3>
              <p className="text-sm text-gray-600">
                {timeOfDayLabels[nextSession.timeOfDay]} at {nextSession.scheduledTime}
              </p>
            </div>
            {isTimeForSession(nextSession.timeOfDay) && (
              <ExclamationCircleIcon className="h-6 w-6 text-green-600" />
            )}
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {todaysSessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 rounded-lg border transition-all ${
              session.completed
                ? 'bg-green-50 border-green-200'
                : isTimeForSession(session.timeOfDay)
                ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {timeOfDayLabels[session.timeOfDay]}
                  </span>
                  <span className="text-sm text-gray-600">
                    {session.scheduledTime}
                  </span>
                  {session.completed && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {timeOfDayDescriptions[session.timeOfDay]}
                </p>
                {session.completed && session.completedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Completed at {new Date(session.completedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {!session.completed && (
                <button
                  onClick={() => {
                    onStartPractice(session.timeOfDay);
                    markSessionCompleted(session.timeOfDay);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isTimeForSession(session.timeOfDay)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Start Practice
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DM Resources */}
      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <h3 className="font-medium text-indigo-900 mb-3 flex items-center gap-2">
          <BookOpenIcon className="h-4 w-4" />
          DM Learning Resources
        </h3>
        <div className="space-y-2">
          {mctResources.dmResources.practice.slice(0, 2).map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 bg-white rounded hover:bg-indigo-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <PlayCircleIcon className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-gray-700 group-hover:text-indigo-600">
                  {resource.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {resource.duration && (
                  <span className="text-xs text-gray-500">{resource.duration}</span>
                )}
                <ArrowTopRightOnSquareIcon className="h-3 w-3 text-gray-400" />
              </div>
            </a>
          ))}
        </div>
        <p className="mt-3 text-xs text-indigo-700">
          Decentering is observing thoughts without engagement - like watching clouds pass
        </p>
      </div>

      {/* Schedule Settings */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Schedule Settings</h3>
          <button
            onClick={() => setEditingSchedule(!editingSchedule)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {editingSchedule ? 'Save' : 'Edit Times'}
          </button>
        </div>

        {editingSchedule && (
          <div className="space-y-3">
            {(Object.keys(schedule) as TimeOfDay[]).map((timeOfDay) => (
              <div key={timeOfDay} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {timeOfDayLabels[timeOfDay]}:
                </label>
                <input
                  type="time"
                  value={schedule[timeOfDay]}
                  onChange={(e) => setSchedule(prev => ({
                    ...prev,
                    [timeOfDay]: e.target.value
                  }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                />
              </div>
            ))}
          </div>
        )}

        {!editingSchedule && (
          <div className="text-sm text-gray-600 space-y-1">
            {(Object.keys(schedule) as TimeOfDay[]).map((timeOfDay) => (
              <div key={timeOfDay} className="flex justify-between">
                <span>{timeOfDayLabels[timeOfDay]}:</span>
                <span>{schedule[timeOfDay]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Goal */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Daily Goal</h3>
        <p className="text-sm text-gray-600">
          Complete all 3 DM practices (60-180 seconds each) to build your skill in observing thoughts without engagement.
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Aim for "watched" responses ≥70% of the time by Week 4
        </div>
      </div>
    </div>
  );
}