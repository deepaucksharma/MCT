import { useState } from 'react';
import DMManager from './DMManager';
import { PlayIcon } from '@heroicons/react/24/outline';

export default function DMDemo() {
  const [showDM, setShowDM] = useState(false);

  if (showDM) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto">
          <DMManager onClose={() => setShowDM(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          DM Practice System Demo
        </h2>
        <p className="text-gray-600">
          Try the complete Module 4 Detached Mindfulness practice system with LAPR method,
          metaphor selection, and scheduling.
        </p>

        <div className="space-y-2 text-sm text-gray-600 text-left">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>LAPR method (Label, Allow, Position, Refocus)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>3 metaphor options (Radio, Screen, Weather)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>60-180 second practice timer</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Confidence ratings & engagement tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>3x daily scheduling system</span>
          </div>
        </div>

        <button
          onClick={() => setShowDM(true)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <PlayIcon className="h-5 w-5" />
          <span>Start DM Practice Demo</span>
        </button>
      </div>
    </div>
  );
}