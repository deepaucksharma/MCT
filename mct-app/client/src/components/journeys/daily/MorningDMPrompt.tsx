import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, CheckIcon } from '@heroicons/react/24/outline';

interface MorningDMPromptProps {
  onComplete: (timeSpent: number) => void;
  onSkip: () => void;
}

export default function MorningDMPrompt({ onComplete, onSkip }: MorningDMPromptProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const dmSteps = [
    {
      title: "Settle in",
      instruction: "Find a comfortable position. Take three gentle breaths.",
      duration: 30
    },
    {
      title: "Notice thoughts",
      instruction: "What thoughts are present right now? Don't judge them, just notice.",
      duration: 60
    },
    {
      title: "Observe the observer",
      instruction: "Step back and notice yourself watching these thoughts. You are the sky, thoughts are clouds passing through.",
      duration: 60
    },
    {
      title: "Set intention",
      instruction: "Set a gentle intention for your day: 'I will notice CAS patterns without getting caught in them.'",
      duration: 30
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          const currentStepDuration = dmSteps[currentStep]?.duration || 0;

          if (newTime >= currentStepDuration && currentStep < dmSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            return 0; // Reset for next step
          } else if (newTime >= currentStepDuration && currentStep === dmSteps.length - 1) {
            setIsActive(false);
            setHasCompleted(true);
            return newTime;
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentStep]);

  const totalElapsed = dmSteps.slice(0, currentStep).reduce((sum, step) => sum + step.duration, 0) + timeElapsed;

  const startPractice = () => {
    setIsActive(true);
    setTimeElapsed(0);
    setCurrentStep(0);
  };

  const pauseResume = () => {
    setIsActive(!isActive);
  };

  const completePractice = () => {
    onComplete(totalElapsed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasCompleted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Morning Practice Complete
          </h2>
          <p className="text-gray-600 mb-6">
            You've started your day with awareness. Notice how you feel right now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Time</p>
              <p className="text-lg font-bold text-blue-800">{formatTime(totalElapsed)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Steps</p>
              <p className="text-lg font-bold text-green-800">{dmSteps.length}/{dmSteps.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Focus</p>
              <p className="text-lg font-bold text-purple-800">Process</p>
            </div>
          </div>

          <button
            onClick={completePractice}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Midday Check-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Morning Detached Mindfulness
        </h2>
        <p className="text-gray-600">
          Start your day by stepping back and observing your mental state (3 minutes)
        </p>
      </div>

      {!isActive && currentStep === 0 && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">This Morning Practice</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              {dmSteps.map((step, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{step.title} ({step.duration}s)</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startPractice}
              className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Start Practice
            </button>
            <button
              onClick={onSkip}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </div>
      )}

      {(isActive || currentStep > 0) && !hasCompleted && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {formatTime(timeElapsed)}
            </div>
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {dmSteps.length}
            </p>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gray-50 rounded-lg text-center"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {dmSteps[currentStep]?.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {dmSteps[currentStep]?.instruction}
            </p>
          </motion.div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={pauseResume}
              className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
            >
              {isActive ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {dmSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index < currentStep ? 'bg-green-500' :
                  index === currentStep ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800 text-sm">
          <strong>Remember:</strong> This isn't meditation to empty your mind.
          You're developing the skill of observing thoughts from a detached perspective.
        </p>
      </div>
    </div>
  );
}