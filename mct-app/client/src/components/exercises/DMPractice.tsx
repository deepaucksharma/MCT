import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon, ClockIcon } from '@heroicons/react/24/outline';

type Metaphor = 'radio' | 'screen' | 'weather';
type Phase = 'setup' | 'label' | 'allow' | 'position' | 'refocus' | 'complete';
type TimeOfDay = 'morning' | 'midday' | 'evening';

interface DMPracticeProps {
  onComplete?: (data: DMPracticeData) => void;
  timeOfDay?: TimeOfDay;
}

interface DMPracticeData {
  duration_seconds: number;
  engaged_vs_watched: 'engaged' | 'watched';
  confidence_rating: number;
  metaphor_used: Metaphor;
  time_of_day: TimeOfDay;
}

const metaphorContent = {
  radio: {
    title: "Radio Metaphor",
    description: "Your thoughts are like a radio playing in another room",
    position: "Your thoughts are like a radio playing in another room. You can hear it, but you're not listening to the words. It's just background noise while you focus on what you're doing.",
    icon: "📻"
  },
  screen: {
    title: "Screen Metaphor",
    description: "Thoughts are like text scrolling across a screen",
    position: "Thoughts are like text scrolling across a screen. You see them passing, but you don't read every word. They move by while you attend to other things.",
    icon: "📺"
  },
  weather: {
    title: "Weather Metaphor",
    description: "Thoughts are like weather passing overhead",
    position: "Thoughts are like weather passing overhead. Clouds come and go. You notice them but don't try to change them. You continue with your activities regardless.",
    icon: "☁️"
  }
};

const phaseInstructions = {
  label: {
    title: "Label",
    duration: 15,
    instruction: "Notice any thought present right now. Simply label it: 'A thought is here' or 'Worry is present' or 'Planning is happening'. Don't analyze the content, just acknowledge its presence."
  },
  allow: {
    title: "Allow",
    duration: 15,
    instruction: "Allow this thought to be present. Don't push it away. Don't try to stop it. It's just a mental event, like a sound in another room. It can be there without your participation."
  },
  position: {
    title: "Position",
    duration: 20,
    instruction: "Position yourself as an observer. You're watching this thought like:"
  },
  refocus: {
    title: "Refocus",
    duration: 10,
    instruction: "Now gently redirect your attention to your chosen anchor: Your breath moving in and out, sounds in your environment, or physical sensations in your hands. The thought may still be there. That's fine. Your attention is elsewhere."
  }
};

export default function DMPractice({ onComplete, timeOfDay = 'morning' }: DMPracticeProps) {
  const [selectedMetaphor, setSelectedMetaphor] = useState<Metaphor>('radio');
  const [duration, setDuration] = useState<number>(60);
  const [phase, setPhase] = useState<Phase>('setup');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [actualDuration, setActualDuration] = useState<number>(0);

  // Post-practice ratings
  const [engagementLevel, setEngagementLevel] = useState<'engaged' | 'watched' | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<number>(50);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, []);

  const startPractice = () => {
    setPhase('label');
    setTimeRemaining(duration);
    setIsRunning(true);
    setStartTime(Date.now());

    // Start the main timer
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          completePractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start phase progression
    progressToNextPhase('label');
  };

  const progressToNextPhase = (currentPhase: Phase) => {
    if (currentPhase === 'refocus') return; // Stay in refocus until end

    const phaseInfo = phaseInstructions[currentPhase as keyof typeof phaseInstructions];
    if (!phaseInfo) return;

    phaseTimeoutRef.current = setTimeout(() => {
      switch (currentPhase) {
        case 'label':
          setPhase('allow');
          progressToNextPhase('allow');
          break;
        case 'allow':
          setPhase('position');
          progressToNextPhase('position');
          break;
        case 'position':
          setPhase('refocus');
          progressToNextPhase('refocus');
          break;
      }
    }, phaseInfo.duration * 1000);
  };

  const pausePractice = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
  };

  const resumePractice = () => {
    if (phase === 'setup' || phase === 'complete') return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          completePractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopPractice = () => {
    if (startTime) {
      setActualDuration(Math.floor((Date.now() - startTime) / 1000));
    }
    setIsRunning(false);
    setPhase('complete');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
  };

  const completePractice = () => {
    if (startTime) {
      setActualDuration(Math.floor((Date.now() - startTime) / 1000));
    }
    setIsRunning(false);
    setPhase('complete');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
  };

  const submitPractice = () => {
    if (!engagementLevel) return;

    const practiceData: DMPracticeData = {
      duration_seconds: actualDuration || duration,
      engaged_vs_watched: engagementLevel,
      confidence_rating: confidenceRating,
      metaphor_used: selectedMetaphor,
      time_of_day: timeOfDay
    };

    onComplete?.(practiceData);
  };

  const resetPractice = () => {
    setPhase('setup');
    setTimeRemaining(0);
    setIsRunning(false);
    setStartTime(null);
    setActualDuration(0);
    setEngagementLevel(null);
    setConfidenceRating(50);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSetupPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Detached Mindfulness Practice
        </h2>
        <p className="text-gray-600">
          Observe thoughts as mental events without engagement
        </p>
      </div>

      {/* Duration Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Practice Duration
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[60, 120, 180].map((time) => (
            <button
              key={time}
              onClick={() => setDuration(time)}
              className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                duration === time
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {time}s
            </button>
          ))}
        </div>
      </div>

      {/* Metaphor Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Choose Your Metaphor
        </label>
        <div className="space-y-2">
          {(Object.keys(metaphorContent) as Metaphor[]).map((metaphor) => (
            <button
              key={metaphor}
              onClick={() => setSelectedMetaphor(metaphor)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                selectedMetaphor === metaphor
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metaphorContent[metaphor].icon}</span>
                <div>
                  <div className="font-medium text-gray-900">
                    {metaphorContent[metaphor].title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {metaphorContent[metaphor].description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startPractice}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <PlayIcon className="h-5 w-5" />
        <span>Start Practice</span>
      </button>
    </div>
  );

  const renderPracticePhase = () => {
    const currentPhaseInfo = phaseInstructions[phase as keyof typeof phaseInstructions];
    if (!currentPhaseInfo) return null;

    return (
      <div className="space-y-6">
        {/* Timer */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(timeRemaining)}
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>{formatTime(duration - timeRemaining)} elapsed</span>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-center mb-3">
            <h3 className="text-lg font-semibold text-blue-900">
              {currentPhaseInfo.title}
            </h3>
          </div>

          <div className="text-gray-700 leading-relaxed">
            {currentPhaseInfo.instruction}

            {phase === 'position' && (
              <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-500">
                <p className="italic text-gray-800">
                  {metaphorContent[selectedMetaphor].position}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {isRunning ? (
            <button
              onClick={pausePractice}
              className="bg-yellow-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2"
            >
              <PauseIcon className="h-5 w-5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={resumePractice}
              className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <PlayIcon className="h-5 w-5" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={stopPractice}
            className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <StopIcon className="h-5 w-5" />
            <span>Stop</span>
          </button>
        </div>
      </div>
    );
  };

  const renderCompletePhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Practice Complete
        </h2>
        <p className="text-gray-600 mb-4">
          Duration: {formatTime(actualDuration || duration)}
        </p>
      </div>

      {/* Engagement Question */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Did you mainly watch thoughts or engage with them?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setEngagementLevel('watched')}
            className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
              engagementLevel === 'watched'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Watched
          </button>
          <button
            onClick={() => setEngagementLevel('engaged')}
            className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
              engagementLevel === 'engaged'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Engaged
          </button>
        </div>
      </div>

      {/* Confidence Rating */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          How confident are you in detaching from thoughts? ({confidenceRating}/100)
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={confidenceRating}
          onChange={(e) => setConfidenceRating(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>No confidence</span>
          <span>Complete confidence</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={submitPractice}
          disabled={!engagementLevel}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            engagementLevel
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Practice
        </button>

        <button
          onClick={resetPractice}
          className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Start New Practice
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {phase === 'setup' && renderSetupPhase()}
      {(phase === 'label' || phase === 'allow' || phase === 'position' || phase === 'refocus') && renderPracticePhase()}
      {phase === 'complete' && renderCompletePhase()}
    </div>
  );
}