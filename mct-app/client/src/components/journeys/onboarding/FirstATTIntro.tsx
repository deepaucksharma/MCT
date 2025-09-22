import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

interface FirstATTIntroProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function FirstATTIntro({ onNext, onPrevious }: FirstATTIntroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  const demoSteps = [
    {
      title: "Listen to sounds around you",
      instruction: "Take a moment to notice the sounds in your environment",
      duration: 10
    },
    {
      title: "Focus on one sound",
      instruction: "Pick one sound and keep your attention on it",
      duration: 15
    },
    {
      title: "Shift to another sound",
      instruction: "Now deliberately move your attention to a different sound",
      duration: 15
    },
    {
      title: "Flexible attention",
      instruction: "Practice moving your attention between sounds at will",
      duration: 20
    }
  ];

  const [timeRemaining, setTimeRemaining] = useState(demoSteps[0].duration);

  const startDemo = () => {
    setIsPlaying(true);
    runDemo();
  };

  const runDemo = async () => {
    for (let step = 0; step < demoSteps.length; step++) {
      setCurrentStep(step);
      setTimeRemaining(demoSteps[step].duration);

      // Countdown for current step
      for (let time = demoSteps[step].duration; time > 0; time--) {
        if (!isPlaying) return;
        setTimeRemaining(time);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsPlaying(false);
    setHasCompleted(true);
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setTimeRemaining(demoSteps[0].duration);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Introduction to Attention Training
        </h2>
        <p className="text-gray-600">
          Let's experience your first mini ATT session (1 minute demo)
        </p>
      </div>

      {/* Explanation */}
      <div className="mb-6 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">What is ATT?</h3>
          <p className="text-blue-800 text-sm">
            Attention Training Technique helps you develop <strong>flexible control</strong> over your attention.
            Instead of being pulled into worry, you learn to choose where to focus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 text-sm mb-1">What you'll do:</h4>
            <p className="text-green-800 text-xs">Work with sounds around you to train attention control</p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 text-sm mb-1">What you'll gain:</h4>
            <p className="text-purple-800 text-xs">Ability to step out of worry cycles and choose your focus</p>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="mb-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              1-Minute ATT Preview
            </h3>
            {!isPlaying && !hasCompleted && (
              <p className="text-gray-600 text-sm">
                Find a comfortable position and click play when ready
              </p>
            )}
          </div>

          {/* Current Step Display */}
          {(isPlaying || hasCompleted) && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <h4 className="text-xl font-medium text-gray-900 mb-2">
                {demoSteps[currentStep]?.title}
              </h4>
              <p className="text-gray-600 mb-4">
                {demoSteps[currentStep]?.instruction}
              </p>

              {isPlaying && (
                <div className="text-3xl font-bold text-primary-600">
                  {timeRemaining}s
                </div>
              )}

              {hasCompleted && (
                <div className="text-green-600 font-medium">
                  ✓ Demo Complete!
                </div>
              )}
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isPlaying && !hasCompleted && (
              <button
                onClick={startDemo}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Demo
              </button>
            )}

            {isPlaying && (
              <button
                onClick={stopDemo}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <PauseIcon className="w-5 h-5 mr-2" />
                Stop
              </button>
            )}

            {hasCompleted && (
              <button
                onClick={() => {
                  setHasCompleted(false);
                  setCurrentStep(0);
                  setTimeRemaining(demoSteps[0].duration);
                }}
                className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Demo Steps:</h3>
        <div className="space-y-2">
          {demoSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-2 rounded-lg ${
                index < currentStep || hasCompleted
                  ? 'bg-green-50 text-green-800'
                  : index === currentStep && isPlaying
                  ? 'bg-blue-50 text-blue-800'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index < currentStep || hasCompleted
                  ? 'bg-green-500 text-white'
                  : index === currentStep && isPlaying
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < currentStep || hasCompleted ? '✓' : index + 1}
              </div>
              <span className="text-sm">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-amber-800 text-sm">
          <strong>Remember:</strong> This is just a taste! Your full ATT sessions will be 12-15 minutes
          and much more comprehensive. The key is regular practice, not perfect performance.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {hasCompleted ? "Let's set up reminders" : "Skip demo for now"}
        </button>
      </div>
    </div>
  );
}