import { motion } from 'framer-motion';
import { BeakerIcon, CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ExperimentSelectionProps {
  weekNumber: number;
  selectedExperiments: string[];
  onUpdate: (experiments: string[]) => void;
  onContinue: () => void;
  onSkip: () => void;
}

interface Experiment {
  id: string;
  title: string;
  description: string;
  targetBelief: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  estimatedTime: string;
  category: 'attention' | 'worry' | 'monitoring' | 'beliefs';
}

export default function ExperimentSelection({
  weekNumber,
  selectedExperiments,
  onUpdate,
  onContinue,
  onSkip
}: ExperimentSelectionProps) {
  const getExperimentsForWeek = (week: number): Experiment[] => {
    const allExperiments: Record<number, Experiment[]> = {
      1: [
        {
          id: 'attention-baseline',
          title: 'Attention Baseline Test',
          description: 'Measure your natural attention span before training',
          targetBelief: 'I cannot control my attention',
          difficulty: 'easy',
          estimatedTime: '10 minutes',
          category: 'attention'
        },
        {
          id: 'worry-observation',
          title: 'Worry Time Tracking',
          description: 'Track worry episodes without trying to stop them',
          targetBelief: 'Worry happens automatically',
          difficulty: 'easy',
          estimatedTime: '3 days',
          category: 'worry'
        }
      ],
      2: [
        {
          id: 'att-vs-distraction',
          title: 'ATT vs Natural Distraction',
          description: 'Compare attention after ATT vs watching TV',
          targetBelief: 'ATT is just another distraction technique',
          difficulty: 'moderate',
          estimatedTime: '2 sessions',
          category: 'attention'
        },
        {
          id: 'monitoring-pause',
          title: 'Monitoring Break Experiment',
          description: 'Deliberately stop checking behaviors for set periods',
          targetBelief: 'I must monitor to stay safe',
          difficulty: 'challenging',
          estimatedTime: '1 hour',
          category: 'monitoring'
        }
      ],
      3: [
        {
          id: 'postponement-test',
          title: 'Worry Postponement Challenge',
          description: 'Postpone all worries to scheduled 15-minute slot',
          targetBelief: 'I cannot control when I worry',
          difficulty: 'moderate',
          estimatedTime: '3 days',
          category: 'worry'
        },
        {
          id: 'urgent-vs-scheduled',
          title: 'Urgent vs Scheduled Worry',
          description: 'Compare worry quality in crisis vs scheduled time',
          targetBelief: 'Urgent worries are more important',
          difficulty: 'moderate',
          estimatedTime: '1 week',
          category: 'worry'
        }
      ],
      4: [
        {
          id: 'belief-testing',
          title: 'Metacognitive Belief Challenge',
          description: 'Test your strongest worry belief through behavioral experiment',
          targetBelief: 'My worry beliefs are facts',
          difficulty: 'challenging',
          estimatedTime: '5 days',
          category: 'beliefs'
        },
        {
          id: 'safety-behavior-drop',
          title: 'Safety Behavior Elimination',
          description: 'Drop one checking behavior and observe results',
          targetBelief: 'Safety behaviors prevent disaster',
          difficulty: 'challenging',
          estimatedTime: '3 days',
          category: 'monitoring'
        }
      ]
    };

    return allExperiments[week] || allExperiments[1];
  };

  const experiments = getExperimentsForWeek(weekNumber);

  const toggleExperiment = (experimentId: string) => {
    if (selectedExperiments.includes(experimentId)) {
      onUpdate(selectedExperiments.filter(id => id !== experimentId));
    } else {
      onUpdate([...selectedExperiments, experimentId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'challenging': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attention': return '🎯';
      case 'worry': return '🌪️';
      case 'monitoring': return '👁️';
      case 'beliefs': return '💭';
      default: return '🔬';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <BeakerIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Week {weekNumber} Experiments
          </h2>
        </div>
        <p className="text-gray-600">
          Choose behavioral experiments to test your metacognitive beliefs
        </p>
      </div>

      {/* Experiment Guidelines */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Experiment Guidelines</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Choose 1-2 experiments that feel manageable but meaningful</li>
          <li>• Experiments test beliefs, not your worth as a person</li>
          <li>• Approach with curiosity, not expectation of specific outcomes</li>
          <li>• All results provide valuable learning</li>
        </ul>
      </div>

      {/* Available Experiments */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Available This Week</h3>
        <div className="space-y-4">
          {experiments.map((experiment, index) => (
            <motion.div
              key={experiment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedExperiments.includes(experiment.id)
                  ? 'border-primary-400 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleExperiment(experiment.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-6 h-6 border-2 rounded flex items-center justify-center flex-shrink-0 mt-1 ${
                  selectedExperiments.includes(experiment.id)
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {selectedExperiments.includes(experiment.id) && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(experiment.category)}</span>
                      <h4 className="font-medium text-gray-900">{experiment.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(experiment.difficulty)}`}>
                        {experiment.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{experiment.estimatedTime}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    {experiment.description}
                  </p>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-700">
                      <strong>Tests the belief:</strong> "{experiment.targetBelief}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedExperiments.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Selected Experiments</h3>
          <ul className="space-y-1">
            {selectedExperiments.map(expId => {
              const exp = experiments.find(e => e.id === expId);
              return exp ? (
                <li key={expId} className="text-sm text-green-800 flex items-center">
                  <CheckIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                  {exp.title}
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}

      {/* Experiment Tips */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-medium text-amber-900 mb-2">Success Tips</h3>
        <ul className="text-amber-800 text-sm space-y-1">
          <li>• Start with easier experiments to build confidence</li>
          <li>• Record predictions before starting</li>
          <li>• Note what actually happens vs. what you expected</li>
          <li>• Focus on learning, not "proving" anything</li>
          <li>• Discuss challenging experiments with support people</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onContinue}
          disabled={selectedExperiments.length === 0}
          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedExperiments.length > 0
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Plan Week
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Skip Experiments
        </button>
      </div>

      {selectedExperiments.length === 0 && (
        <p className="text-center text-gray-500 text-sm mt-4">
          Select at least one experiment to continue
        </p>
      )}
    </div>
  );
}