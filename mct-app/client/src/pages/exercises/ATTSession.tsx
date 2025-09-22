import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, ArrowLeft, BookOpen, PlayCircle } from 'lucide-react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { attScripts, ATTScriptType } from '../../data/attScripts';
import { attSessionApi } from '../../services/api';
import { mctResources } from '../../data/mctResources';

interface SessionState {
  isPlaying: boolean;
  currentPhaseIndex: number;
  currentInstructionIndex: number;
  elapsedTime: number;
  completedPhases: boolean[];
  startTime: Date | null;
}

interface PostSessionRatings {
  attentionalControl: number;
  intrusions: boolean;
  intrusionCount?: number;
  shiftEase: number;
}

export default function ATTSession() {
  const navigate = useNavigate();
  const [selectedScript, setSelectedScript] = useState<ATTScriptType>('standard');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [ratings, setRatings] = useState<PostSessionRatings>({
    attentionalControl: 50,
    intrusions: false,
    shiftEase: 50
  });

  const [sessionState, setSessionState] = useState<SessionState>({
    isPlaying: false,
    currentPhaseIndex: 0,
    currentInstructionIndex: 0,
    elapsedTime: 0,
    completedPhases: [],
    startTime: null
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const currentScript = attScripts[selectedScript];

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (sessionState.isPlaying) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => {
          const newElapsedTime = prev.elapsedTime + 1;
          const currentPhase = currentScript.phases[prev.currentPhaseIndex];
          const phaseElapsedTime = newElapsedTime - phaseStartTimeRef.current;

          // Check if we need to move to next instruction
          let newInstructionIndex = prev.currentInstructionIndex;
          const nextInstruction = currentPhase.instructions[newInstructionIndex + 1];

          if (nextInstruction && phaseElapsedTime >= nextInstruction.time) {
            newInstructionIndex++;
            // Announce the instruction
            announceInstruction(nextInstruction.text);
          }

          // Check if we need to move to next phase
          let newPhaseIndex = prev.currentPhaseIndex;
          let newCompletedPhases = [...prev.completedPhases];

          if (phaseElapsedTime >= currentPhase.duration) {
            newCompletedPhases[prev.currentPhaseIndex] = true;
            newPhaseIndex++;
            newInstructionIndex = 0;
            phaseStartTimeRef.current = newElapsedTime;

            if (newPhaseIndex < currentScript.phases.length) {
              // Announce next phase
              const nextPhase = currentScript.phases[newPhaseIndex];
              announceInstruction(nextPhase.instructions[0].text);
            } else {
              // Session completed
              setSessionCompleted(true);
              setShowRatings(true);
              return {
                ...prev,
                isPlaying: false,
                completedPhases: newCompletedPhases
              };
            }
          }

          return {
            ...prev,
            elapsedTime: newElapsedTime,
            currentPhaseIndex: newPhaseIndex,
            currentInstructionIndex: newInstructionIndex,
            completedPhases: newCompletedPhases
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState.isPlaying, currentScript, selectedScript]);

  const announceInstruction = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    setSessionState(prev => ({
      ...prev,
      isPlaying: true,
      startTime: new Date(),
      completedPhases: new Array(currentScript.phases.length).fill(false)
    }));
    phaseStartTimeRef.current = 0;

    // Announce first instruction
    const firstInstruction = currentScript.phases[0].instructions[0];
    announceInstruction(firstInstruction.text);
  };

  const togglePlayPause = () => {
    setSessionState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const resetSession = () => {
    setSessionState({
      isPlaying: false,
      currentPhaseIndex: 0,
      currentInstructionIndex: 0,
      elapsedTime: 0,
      completedPhases: [],
      startTime: null
    });
    setSessionStarted(false);
    setSessionCompleted(false);
    setShowRatings(false);
    phaseStartTimeRef.current = 0;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (sessionState.elapsedTime / currentScript.totalDuration) * 100;
  };

  const getCurrentPhaseProgress = () => {
    const currentPhase = currentScript.phases[sessionState.currentPhaseIndex];
    const phaseElapsedTime = sessionState.elapsedTime - phaseStartTimeRef.current;
    return Math.min((phaseElapsedTime / currentPhase.duration) * 100, 100);
  };

  const getCurrentInstruction = () => {
    const currentPhase = currentScript.phases[sessionState.currentPhaseIndex];
    const instruction = currentPhase.instructions[sessionState.currentInstructionIndex];
    return instruction?.text || '';
  };

  const saveSession = async () => {
    try {
      const sessionData = {
        duration_minutes: Math.round(sessionState.elapsedTime / 60),
        completed: sessionCompleted,
        attentional_control_rating: ratings.attentionalControl,
        intrusions: ratings.intrusions,
        intrusion_count: ratings.intrusionCount,
        shift_ease_rating: ratings.shiftEase,
        script_type: selectedScript,
        notes: `Completed ${sessionState.completedPhases.filter(Boolean).length}/${currentScript.phases.length} phases`,
        date: new Date().toISOString().split('T')[0]
      };

      await attSessionApi.create(sessionData);
      toast.success('ATT session saved successfully');
      navigate('/today');
    } catch (error) {
      console.error('Error saving ATT session:', error);
      toast.error('Failed to save session');
    }
  };

  if (showRatings) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Session Complete
            </h1>

            <div className="space-y-6">
              {/* Attentional Control Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate your ability to control your attention (0-100)
                </label>
                <div className="text-xs text-gray-500 mb-3">
                  0 = No control, 100 = Complete control
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratings.attentionalControl}
                  onChange={(e) => setRatings(prev => ({
                    ...prev,
                    attentionalControl: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center mt-1 text-sm font-medium">
                  {ratings.attentionalControl}
                </div>
              </div>

              {/* Intrusions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Did thoughts intrude during practice?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="intrusions"
                      checked={!ratings.intrusions}
                      onChange={() => setRatings(prev => ({
                        ...prev,
                        intrusions: false,
                        intrusionCount: undefined
                      }))}
                      className="mr-2"
                    />
                    No
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="intrusions"
                      checked={ratings.intrusions}
                      onChange={() => setRatings(prev => ({
                        ...prev,
                        intrusions: true
                      }))}
                      className="mr-2"
                    />
                    Yes
                  </label>
                </div>

                {ratings.intrusions && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approximately how many times?
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={ratings.intrusionCount || ''}
                      onChange={(e) => setRatings(prev => ({
                        ...prev,
                        intrusionCount: parseInt(e.target.value) || undefined
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Number of intrusions"
                    />
                  </div>
                )}
              </div>

              {/* Shift Ease Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How easy was it to shift attention between sounds? (0-100)
                </label>
                <div className="text-xs text-gray-500 mb-3">
                  0 = Impossible, 100 = Effortless
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratings.shiftEase}
                  onChange={(e) => setRatings(prev => ({
                    ...prev,
                    shiftEase: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center mt-1 text-sm font-medium">
                  {ratings.shiftEase}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={resetSession}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Practice Again
                </button>
                <button
                  onClick={saveSession}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/today')}
                className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Attention Training Technique
              </h1>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This is training for your attention. Find a comfortable position and ensure you won't be disturbed.
                We'll work with sounds in your environment to develop flexible attentional control.
              </p>
            </div>

            {/* ATT Resources Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Helpful Resources
              </h3>
              <div className="space-y-2">
                {mctResources.attResources.guidedSessions.slice(0, 3).map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 bg-white rounded hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600">
                        {resource.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.duration && (
                        <span className="text-xs text-gray-500">{resource.duration}</span>
                      )}
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-400" />
                    </div>
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs text-blue-700">
                Additional guided sessions available if you prefer external audio guidance
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Duration
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="script"
                    value="standard"
                    checked={selectedScript === 'standard'}
                    onChange={(e) => setSelectedScript(e.target.value as ATTScriptType)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Standard Track</div>
                    <div className="text-sm text-gray-600">15 minutes - Full 4-phase protocol</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="script"
                    value="short"
                    checked={selectedScript === 'short'}
                    onChange={(e) => setSelectedScript(e.target.value as ATTScriptType)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Short Track</div>
                    <div className="text-sm text-gray-600">8 minutes - Condensed version</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="script"
                    value="emergency"
                    checked={selectedScript === 'emergency'}
                    onChange={(e) => setSelectedScript(e.target.value as ATTScriptType)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Emergency ATT-Lite</div>
                    <div className="text-sm text-gray-600">90 seconds - Quick attention reset</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">This session includes:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {currentScript.phases.map((phase, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {phase.name} ({Math.round(phase.duration / 60)} min)
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={startSession}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Begin Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session in progress
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              ATT Session
            </h1>
            <div className="text-lg text-gray-600">
              {formatTime(sessionState.elapsedTime)} / {formatTime(currentScript.totalDuration)}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Current Phase */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">
                {currentScript.phases[sessionState.currentPhaseIndex]?.name}
              </h2>
              <div className="text-sm text-gray-600 mt-1">
                Phase {sessionState.currentPhaseIndex + 1} of {currentScript.phases.length}
              </div>
            </div>

            {/* Phase Progress */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getCurrentPhaseProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Current Instruction */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed">
                {getCurrentInstruction()}
              </p>
            </div>
          </div>

          {/* Phase Indicators */}
          <div className="mb-6">
            <div className="flex justify-between">
              {currentScript.phases.map((phase, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-4 h-4 rounded-full mb-1 ${
                      sessionState.completedPhases[index]
                        ? 'bg-green-500'
                        : index === sessionState.currentPhaseIndex
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                  <div className="text-xs text-gray-600 text-center max-w-16">
                    {phase.name.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sessionState.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            <button
              onClick={resetSession}
              className="flex items-center justify-center w-12 h-12 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}