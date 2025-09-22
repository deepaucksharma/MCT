import { motion } from 'framer-motion';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Assessment } from '../../../types';

interface InitialAssessmentProps {
  assessment: Partial<Assessment>;
  onUpdate: (assessment: Partial<Assessment>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function InitialAssessment({
  assessment,
  onUpdate,
  onNext,
  onPrevious
}: InitialAssessmentProps) {
  const assessmentItems = [
    {
      key: 'worry_baseline' as keyof Assessment,
      label: 'Daily worry time',
      description: 'How much of your day involves worry or anxious thoughts?',
      lowLabel: 'Never',
      highLabel: 'Constantly'
    },
    {
      key: 'rumination_baseline' as keyof Assessment,
      label: 'Rumination patterns',
      description: 'How often do you get stuck replaying past events or problems?',
      lowLabel: 'Rarely',
      highLabel: 'Very often'
    },
    {
      key: 'monitoring_baseline' as keyof Assessment,
      label: 'Threat monitoring',
      description: 'How much do you scan for signs of danger or problems?',
      lowLabel: 'Not at all',
      highLabel: 'Constantly'
    }
  ];

  const beliefItems = [
    {
      key: 'uncontrollability_belief' as keyof Assessment,
      statement: 'My worry is uncontrollable',
      description: 'Once I start worrying, I cannot stop'
    },
    {
      key: 'danger_belief' as keyof Assessment,
      statement: 'Worry is dangerous for me',
      description: 'Worrying will harm my health or mind'
    },
    {
      key: 'positive_belief' as keyof Assessment,
      statement: 'Worry helps me prepare',
      description: 'Worrying helps me solve problems and be ready'
    }
  ];

  const updateValue = (key: keyof Assessment, value: number) => {
    onUpdate({ ...assessment, [key]: value });
  };

  const canContinue = () => {
    return assessmentItems.every(item => assessment[item.key] !== undefined) &&
           beliefItems.every(item => assessment[item.key] !== undefined);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quick Baseline Assessment
        </h2>
        <p className="text-gray-600">
          Help us understand your current patterns (this takes 2 minutes)
        </p>
      </div>

      <div className="space-y-8">
        {/* Current Patterns */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Patterns</h3>
          <div className="space-y-6">
            {assessmentItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {item.label}
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessment[item.key] || 50}
                    onChange={(e) => updateValue(item.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.lowLabel}</span>
                    <span className="font-medium text-gray-700">
                      {assessment[item.key] || 50}%
                    </span>
                    <span>{item.highLabel}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Beliefs */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Beliefs About Worry
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Rate how much you agree with each statement
          </p>

          <div className="space-y-6">
            {beliefItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (assessmentItems.length + index) * 0.1 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    "{item.statement}"
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessment[item.key] || 50}
                    onChange={(e) => updateValue(item.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Disagree</span>
                    <span className="font-medium text-gray-700">
                      {assessment[item.key] || 50}%
                    </span>
                    <span>Agree</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!canContinue()}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canContinue()
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
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