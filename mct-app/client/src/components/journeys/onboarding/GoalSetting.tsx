import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

interface GoalSettingProps {
  goals: string[];
  onUpdate: (goals: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function GoalSetting({
  goals,
  onUpdate,
  onNext,
  onPrevious
}: GoalSettingProps) {
  const [customGoal, setCustomGoal] = useState('');

  const predefinedGoals = [
    {
      id: 'reduce-worry',
      text: 'Reduce daily worry time to 30 minutes or less',
      description: 'Focus on limiting time spent in worry cycles'
    },
    {
      id: 'stop-checking',
      text: 'Stop repetitive checking behaviors',
      description: 'Reduce the urge to constantly monitor for problems'
    },
    {
      id: 'practice-att',
      text: 'Build daily attention training habit',
      description: 'Develop flexible control over attention'
    },
    {
      id: 'postponement',
      text: 'Master worry postponement technique',
      description: 'Learn to schedule worry instead of engaging immediately'
    },
    {
      id: 'experiments',
      text: 'Complete weekly behavioral experiments',
      description: 'Test beliefs about worry and attention'
    },
    {
      id: 'awareness',
      text: 'Increase metacognitive awareness',
      description: 'Notice thought patterns without getting caught in them'
    }
  ];

  const toggleGoal = (goalText: string) => {
    if (goals.includes(goalText)) {
      onUpdate(goals.filter(g => g !== goalText));
    } else {
      onUpdate([...goals, goalText]);
    }
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !goals.includes(customGoal.trim())) {
      onUpdate([...goals, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  const canContinue = () => goals.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Your Process Goals
        </h2>
        <p className="text-gray-600">
          Choose goals that focus on <strong>process</strong> rather than eliminating specific thoughts
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>MCT Tip:</strong> We focus on changing how you relate to thoughts, not eliminating them.
          Good goals target behaviors, patterns, and skills rather than thought content.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {predefinedGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              goals.includes(goal.text)
                ? 'border-primary-400 bg-primary-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleGoal(goal.text)}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mt-0.5 ${
                goals.includes(goal.text)
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'
              }`}>
                {goals.includes(goal.text) && (
                  <CheckIcon className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  goals.includes(goal.text) ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {goal.text}
                </h3>
                <p className={`text-sm mt-1 ${
                  goals.includes(goal.text) ? 'text-primary-700' : 'text-gray-600'
                }`}>
                  {goal.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Goal Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add your own process-focused goal (optional)
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
            placeholder="e.g., Practice detached mindfulness daily"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={addCustomGoal}
            disabled={!customGoal.trim()}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              customGoal.trim()
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Goals Summary */}
      {goals.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Your Selected Goals:</h3>
          <ul className="space-y-1">
            {goals.map((goal, index) => (
              <li key={index} className="text-sm text-green-800 flex items-center">
                <CheckIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}

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
    </div>
  );
}