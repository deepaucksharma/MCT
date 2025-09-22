import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface MiddayDMCheckinProps {
  onComplete: (timeSpent: number) => void;
  onSkip: () => void;
}

interface CASObservation {
  worry: boolean;
  rumination: boolean;
  monitoring: boolean;
  intensity: number;
  notes: string;
}

export default function MiddayDMCheckin({ onComplete, onSkip }: MiddayDMCheckinProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [observation, setObservation] = useState<CASObservation>({
    worry: false,
    rumination: false,
    monitoring: false,
    intensity: 0,
    notes: ''
  });

  const steps = [
    {
      title: "Pause and Notice",
      component: () => (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Take a moment to pause what you're doing. Notice your current mental state without trying to change anything.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              You're simply observing, like watching clouds in the sky. What patterns do you notice?
            </p>
          </div>
        </div>
      )
    },
    {
      title: "CAS Pattern Check",
      component: () => (
        <div className="space-y-4">
          <p className="text-gray-700 mb-4">
            Check if you notice any of these patterns right now (it's okay if you do):
          </p>
          <div className="space-y-3">
            {[
              { key: 'worry' as keyof CASObservation, label: 'Worry', description: 'Thinking about future problems or "what ifs"' },
              { key: 'rumination' as keyof CASObservation, label: 'Rumination', description: 'Replaying past events or analyzing problems' },
              { key: 'monitoring' as keyof CASObservation, label: 'Threat monitoring', description: 'Scanning for signs of danger or problems' }
            ].map(item => (
              <label
                key={item.key}
                className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer ${
                  observation[item.key] ? 'border-primary-400 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={observation[item.key] as boolean}
                  onChange={(e) => setObservation(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Intensity Rating",
      component: () => (
        <div className="space-y-4">
          <p className="text-gray-700">
            If you noticed any CAS patterns, how intense are they right now?
          </p>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Intensity level: {observation.intensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={observation.intensity}
              onChange={(e) => setObservation(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very mild</span>
              <span>Moderate</span>
              <span>Very intense</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Detached Observation",
      component: () => (
        <div className="space-y-4">
          <p className="text-gray-700">
            Now step back and observe these patterns as if you're watching them from outside.
          </p>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Practice This Perspective:</h4>
            <p className="text-green-800 text-sm italic">
              "I notice my mind is doing [worry/rumination/monitoring] right now.
              This is just what minds do. I don't need to engage with it or fix it.
              I can let it be there while I focus on what I choose."
            </p>
          </div>
          <textarea
            value={observation.notes}
            onChange={(e) => setObservation(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any other observations about your mental state? (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeCheckin = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(timeSpent);
  };

  const getTimeElapsed = () => {
    return Math.floor((Date.now() - startTime) / 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Midday CAS Check-in
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>{Math.floor(getTimeElapsed() / 60)}:{(getTimeElapsed() % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        <p className="text-gray-600">
          Brief awareness check of your mental patterns (2-3 minutes)
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current step content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {steps[currentStep].title}
        </h3>
        {steps[currentStep].component()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 0 ? onSkip : previousStep}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {currentStep === 0 ? 'Skip Check-in' : 'Previous'}
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={completeCheckin}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <CheckIcon className="w-5 h-5 mr-2" />
            Complete Check-in
          </button>
        )}
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-purple-800 text-sm">
          <strong>Key Point:</strong> The goal isn't to eliminate these patterns, but to notice them
          without getting pulled in. You're developing "meta-awareness" - awareness of your mental processes.
        </p>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}