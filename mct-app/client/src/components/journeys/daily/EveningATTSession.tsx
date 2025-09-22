import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline';

interface EveningATTSessionProps {
  onComplete: (timeSpent: number) => void;
  onSkip: () => void;
}

export default function EveningATTSession({ onComplete, onSkip }: EveningATTSessionProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'intro' | 'session' | 'complete'>('intro');
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);

  const startSession = () => {
    setSessionStartTime(Date.now());
    navigate('/exercises/att');
  };

  const startQuickSession = () => {
    setCurrentView('session');
    setSessionStartTime(Date.now());
    // For demo purposes, simulate a quick session completion
    setTimeout(() => {
      setCurrentView('complete');
    }, 5000);
  };

  const handleSessionComplete = () => {
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
    onComplete(timeSpent);
  };

  if (currentView === 'complete') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ATT Session Complete
          </h2>
          <p className="text-gray-600 mb-6">
            You've completed your attention training for today. Your mind is stronger after each practice.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Duration</p>
              <p className="text-lg font-bold text-blue-800">12-15 min</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Focus</p>
              <p className="text-lg font-bold text-green-800">Attention</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Skill</p>
              <p className="text-lg font-bold text-purple-800">Control</p>
            </div>
          </div>

          <button
            onClick={handleSessionComplete}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            View Daily Summary
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'session') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ATT Session in Progress
          </h2>
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlayIcon className="w-12 h-12 text-primary-600" />
          </div>
          <p className="text-gray-600 mb-4">
            This is a demo - your actual session would run through the full ATT protocol.
          </p>
          <div className="animate-pulse">
            <div className="text-lg text-primary-600 font-medium">Working with environmental sounds...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Evening ATT Session
        </h2>
        <p className="text-gray-600">
          Complete your daily attention training (12-15 minutes)
        </p>
      </div>

      <div className="space-y-6">
        {/* Session Benefits */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Why Evening ATT?</h3>
          <ul className="space-y-1 text-blue-800 text-sm">
            <li>• Builds flexible attention control</li>
            <li>• Strengthens your ability to step out of worry cycles</li>
            <li>• Develops meta-cognitive awareness</li>
            <li>• Creates a calming end-of-day routine</li>
          </ul>
        </div>

        {/* Session Options */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Choose Your Session</h3>

          <div className="space-y-3">
            <button
              onClick={startSession}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Full ATT Session</h4>
                  <p className="text-sm text-gray-600">Complete 4-phase attention training protocol</p>
                </div>
                <div className="flex items-center space-x-2 text-primary-600">
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">15 min</span>
                </div>
              </div>
            </button>

            <button
              onClick={startSession}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Short ATT Session</h4>
                  <p className="text-sm text-gray-600">Condensed version for busy days</p>
                </div>
                <div className="flex items-center space-x-2 text-primary-600">
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">8 min</span>
                </div>
              </div>
            </button>

            <button
              onClick={startQuickSession}
              className="w-full p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Quick Demo (for testing)</h4>
                  <p className="text-sm text-gray-600">5-second demo to see journey flow</p>
                </div>
                <div className="flex items-center space-x-2 text-orange-600">
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">5 sec</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Preparation Tips */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Before You Begin</h3>
          <ul className="space-y-1 text-green-800 text-sm">
            <li>• Find a comfortable seated position</li>
            <li>• Ensure you won't be interrupted</li>
            <li>• Notice sounds in your environment</li>
            <li>• Remember: this is training, not relaxation</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => startSession()}
            className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Start Session
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Skip Tonight
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800 text-sm">
          <strong>Consistency Tip:</strong> Evening sessions often work best because your mind is
          naturally winding down. Even on busy days, try the short version to maintain your routine.
        </p>
      </div>
    </div>
  );
}