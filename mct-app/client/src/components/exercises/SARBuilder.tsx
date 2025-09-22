import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { EMERGENCY_SAR_ACTIONS, getActionsByCategory, SARAction } from './SARActionLibrary';

interface SARPlan {
  id?: number;
  trigger_cue: string;
  if_statement: string;
  then_action: string;
  active: boolean;
  usage_count: number;
  success_rate?: number;
  created_at?: string;
  updated_at?: string;
}

interface TriggerOption {
  id: string;
  label: string;
  description: string;
}

const COMMON_TRIGGERS: TriggerOption[] = [
  {
    id: 'work-stress',
    label: 'Work Stress',
    description: 'Deadlines, meetings, workload pressure'
  },
  {
    id: 'health-concerns',
    label: 'Health Concerns',
    description: 'Physical symptoms, medical appointments, health worry'
  },
  {
    id: 'social-situations',
    label: 'Social Situations',
    description: 'Social interactions, performance anxiety, judgment fears'
  },
  {
    id: 'morning-routine',
    label: 'Morning Routine',
    description: 'Starting the day, planning, morning anxiety'
  },
  {
    id: 'evening-wind-down',
    label: 'Evening Wind-down',
    description: 'End of day reflection, tomorrow\'s worries'
  },
  {
    id: 'financial-stress',
    label: 'Financial Stress',
    description: 'Money concerns, bills, financial planning'
  },
  {
    id: 'relationship-issues',
    label: 'Relationship Issues',
    description: 'Conflicts, communication problems, relationship worry'
  },
  {
    id: 'travel-transportation',
    label: 'Travel/Transportation',
    description: 'Traffic, delays, travel anxiety'
  },
  {
    id: 'technology-issues',
    label: 'Technology Issues',
    description: 'Device problems, internet issues, tech frustration'
  },
  {
    id: 'news-media',
    label: 'News/Media',
    description: 'Current events, social media, information overload'
  }
];

interface PracticeDrill {
  id: string;
  plan: SARPlan;
  completedRounds: number;
  targetRounds: number;
  averageTime: number;
  scores: number[];
}

const SARBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'triggers' | 'actions' | 'plans' | 'practice'>('triggers');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [selectedPlans, setSelectedPlans] = useState<{ [triggerId: string]: SARAction }>({});
  const [existingPlans, setExistingPlans] = useState<SARPlan[]>([]);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceDrills, setPracticeDrills] = useState<PracticeDrill[]>([]);
  const [activeDrill, setActiveDrill] = useState<PracticeDrill | null>(null);
  const [drillStartTime, setDrillStartTime] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    visual: true,
    auditory: false,
    tactile: false,
    cognitive: false,
    movement: false
  });

  // Load existing SAR plans
  useEffect(() => {
    fetchSARPlans();
  }, []);

  const fetchSARPlans = async () => {
    try {
      const response = await fetch('/api/sar-plans');
      if (response.ok) {
        const plans = await response.json();
        setExistingPlans(plans);
      }
    } catch (error) {
      console.error('Error fetching SAR plans:', error);
    }
  };

  const handleTriggerSelection = (triggerId: string) => {
    setSelectedTriggers(prev =>
      prev.includes(triggerId)
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim()) {
      const customId = `custom-${Date.now()}`;
      COMMON_TRIGGERS.push({
        id: customId,
        label: customTrigger.trim(),
        description: 'Custom trigger'
      });
      setSelectedTriggers(prev => [...prev, customId]);
      setCustomTrigger('');
    }
  };

  const selectActionForTrigger = (triggerId: string, action: SARAction) => {
    setSelectedPlans(prev => ({
      ...prev,
      [triggerId]: action
    }));
  };

  const createSARPlan = (triggerId: string): SARPlan => {
    const trigger = COMMON_TRIGGERS.find(t => t.id === triggerId);
    const action = selectedPlans[triggerId];

    if (!trigger || !action) {
      throw new Error('Missing trigger or action');
    }

    return {
      trigger_cue: trigger.label,
      if_statement: `If ${trigger.label.toLowerCase()} occurs`,
      then_action: `Then I will ${action.instructions}`,
      active: true,
      usage_count: 0,
      success_rate: 0
    };
  };

  const saveSARPlans = async () => {
    try {
      const plans = selectedTriggers
        .filter(triggerId => selectedPlans[triggerId])
        .map(triggerId => createSARPlan(triggerId));

      for (const plan of plans) {
        const response = await fetch('/api/sar-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plan),
        });

        if (!response.ok) {
          throw new Error('Failed to save SAR plan');
        }
      }

      await fetchSARPlans();
      setCurrentStep('practice');
    } catch (error) {
      console.error('Error saving SAR plans:', error);
      alert('Failed to save SAR plans. Please try again.');
    }
  };

  const startPracticeDrill = (plan: SARPlan) => {
    if (!plan.id) return;

    const drill: PracticeDrill = {
      id: plan.id.toString(),
      plan,
      completedRounds: 0,
      targetRounds: 3,
      averageTime: 0,
      scores: []
    };

    setPracticeDrills(prev => [...prev, drill]);
    setActiveDrill(drill);
    setDrillStartTime(Date.now());
    setPracticeMode(true);
  };

  const completeDrillRound = (executionSpeed: number) => {
    if (!activeDrill || !drillStartTime) return;

    const timeSpent = (Date.now() - drillStartTime) / 1000;
    const newDrill = {
      ...activeDrill,
      completedRounds: activeDrill.completedRounds + 1,
      scores: [...activeDrill.scores, executionSpeed],
      averageTime: (activeDrill.averageTime * activeDrill.completedRounds + timeSpent) / (activeDrill.completedRounds + 1)
    };

    setPracticeDrills(prev =>
      prev.map(drill => drill.id === activeDrill.id ? newDrill : drill)
    );

    if (newDrill.completedRounds >= newDrill.targetRounds) {
      setActiveDrill(null);
      setPracticeMode(false);
      setDrillStartTime(null);
    } else {
      setActiveDrill(newDrill);
      setDrillStartTime(Date.now());
    }
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'triggers', label: 'Identify Triggers', completed: selectedTriggers.length > 0 },
      { id: 'actions', label: 'Select Actions', completed: Object.keys(selectedPlans).length > 0 },
      { id: 'plans', label: 'Create Plans', completed: existingPlans.length > 0 },
      { id: 'practice', label: 'Practice Drills', completed: practiceDrills.some(d => d.completedRounds >= d.targetRounds) }
    ];

    return (
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : step.completed
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step.completed ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`ml-2 text-sm ${
              currentStep === step.id ? 'text-blue-600 font-medium' : 'text-gray-600'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                steps[index + 1].completed ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">SAR Plan Builder</h1>
        <p className="text-gray-600">
          Create Situational Attentional Refocusing plans to break CAS activation with quick external attention anchors.
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {currentStep === 'triggers' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Your Triggers</h3>
              <p className="text-gray-600 mb-6">
                Choose situations that commonly activate your worry or rumination patterns.
                These will become the "If" part of your SAR plans.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_TRIGGERS.map(trigger => (
                  <label
                    key={trigger.id}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedTriggers.includes(trigger.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTriggers.includes(trigger.id)}
                      onChange={() => handleTriggerSelection(trigger.id)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{trigger.label}</div>
                      <div className="text-sm text-gray-500">{trigger.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Add Custom Trigger</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTrigger}
                    onChange={(e) => setCustomTrigger(e.target.value)}
                    placeholder="Enter your custom trigger situation..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTrigger()}
                  />
                  <button
                    onClick={addCustomTrigger}
                    disabled={!customTrigger.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('actions')}
                disabled={selectedTriggers.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Select Actions
              </button>
            </div>
          </div>
        )}

        {currentStep === 'actions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Refocus Actions</h3>
              <p className="text-gray-600 mb-6">
                Select one refocus action for each trigger. These quick external attention anchors
                will become the "Then" part of your SAR plans.
              </p>

              {selectedTriggers.map(triggerId => {
                const trigger = COMMON_TRIGGERS.find(t => t.id === triggerId);
                if (!trigger) return null;

                return (
                  <div key={triggerId} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      For: {trigger.label}
                    </h4>

                    {selectedPlans[triggerId] && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">{selectedPlans[triggerId].name}</div>
                        <div className="text-sm text-green-600">{selectedPlans[triggerId].instructions}</div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {Object.entries(expandedCategories).map(([category, expanded]) => (
                        <div key={category}>
                          <button
                            onClick={() => toggleCategoryExpansion(category)}
                            className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <span className="font-medium capitalize">{category} Actions</span>
                            {expanded ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>

                          {expanded && (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {getActionsByCategory(category as SARAction['category']).map(action => (
                                <button
                                  key={action.id}
                                  onClick={() => selectActionForTrigger(triggerId, action)}
                                  className={`p-3 text-left border rounded-lg transition-colors ${
                                    selectedPlans[triggerId]?.id === action.id
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  <div className="font-medium text-sm">{action.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">{action.duration}s • {action.difficulty}</div>
                                  <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('triggers')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('plans')}
                disabled={selectedTriggers.length !== Object.keys(selectedPlans).length}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Create Plans
              </button>
            </div>
          </div>
        )}

        {currentStep === 'plans' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your SAR Plans</h3>
              <p className="text-gray-600 mb-6">
                Review your If-Then SAR plans below. These will be saved and available for practice drills.
              </p>

              <div className="space-y-4">
                {selectedTriggers.map(triggerId => {
                  const trigger = COMMON_TRIGGERS.find(t => t.id === triggerId);
                  const action = selectedPlans[triggerId];

                  if (!trigger || !action) return null;

                  return (
                    <div key={triggerId} className="bg-white p-4 border border-gray-300 rounded-lg">
                      <div className="font-medium text-gray-900 mb-2">
                        If {trigger.label.toLowerCase()} occurs,
                      </div>
                      <div className="text-blue-600 font-medium">
                        Then I will {action.instructions}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Action: {action.name} ({action.duration} seconds)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('actions')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={saveSARPlans}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Plans & Start Practice
              </button>
            </div>
          </div>
        )}

        {currentStep === 'practice' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Practice Drills for Automation</h3>
              <p className="text-gray-600 mb-6">
                Practice each SAR plan 3 times to build automatic responses.
                Target execution time is under 30 seconds.
              </p>

              {practiceMode && activeDrill && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Active Practice: Round {activeDrill.completedRounds + 1} of {activeDrill.targetRounds}</h4>
                  <div className="text-blue-800 mb-4">
                    <strong>Trigger:</strong> {activeDrill.plan.trigger_cue}
                  </div>
                  <div className="text-blue-800 mb-4">
                    <strong>Action:</strong> {activeDrill.plan.then_action}
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-blue-700 mb-2">Rate your execution speed (0-100):</div>
                    <div className="flex gap-2">
                      {[60, 70, 80, 90, 100].map(score => (
                        <button
                          key={score}
                          onClick={() => completeDrillRound(score)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {existingPlans.map(plan => {
                  const drill = practiceDrills.find(d => d.id === plan.id?.toString());
                  const isCompleted = drill && drill.completedRounds >= drill.targetRounds;

                  return (
                    <div key={plan.id} className={`p-4 border rounded-lg ${
                      isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-300'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{plan.trigger_cue}</div>
                          <div className="text-gray-600 text-sm mb-2">{plan.then_action}</div>

                          {drill && (
                            <div className="text-sm text-gray-500">
                              Progress: {drill.completedRounds}/{drill.targetRounds} rounds
                              {drill.averageTime > 0 && ` • Avg time: ${drill.averageTime.toFixed(1)}s`}
                              {drill.scores.length > 0 && ` • Avg score: ${(drill.scores.reduce((a, b) => a + b, 0) / drill.scores.length).toFixed(0)}`}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <button
                              onClick={() => startPracticeDrill(plan)}
                              disabled={practiceMode}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              <PlayIcon className="w-4 h-4" />
                              Practice
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {existingPlans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No SAR plans created yet. Go back to create your first plans.
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('plans')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Back to Plans
              </button>
              <button
                onClick={() => window.location.href = '/today'}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency SAR Reference */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-2">Emergency SAR Actions (10 seconds)</h4>
        <div className="space-y-2">
          {EMERGENCY_SAR_ACTIONS.map(action => (
            <div key={action.id} className="text-sm">
              <span className="font-medium text-red-800">{action.name}:</span>
              <span className="text-red-700 ml-2">{action.instructions}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SARBuilder;