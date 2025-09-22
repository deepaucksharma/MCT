import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, CheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface WeeklyPlanningProps {
  weekNumber: number;
  selectedExperiments: string[];
  onComplete: () => void;
}

interface WeeklyGoal {
  id: string;
  category: 'practice' | 'experiment' | 'awareness' | 'skill';
  text: string;
  selected: boolean;
}

export default function WeeklyPlanning({
  weekNumber,
  selectedExperiments,
  onComplete
}: WeeklyPlanningProps) {
  const [goals, setGoals] = useState<WeeklyGoal[]>([
    {
      id: 'daily-att',
      category: 'practice',
      text: 'Complete ATT sessions 5+ days this week',
      selected: true
    },
    {
      id: 'dm-consistency',
      category: 'practice',
      text: 'Maintain consistent DM check-ins',
      selected: true
    },
    {
      id: 'cas-awareness',
      category: 'awareness',
      text: 'Notice CAS patterns without judgment',
      selected: true
    },
    {
      id: 'postponement-practice',
      category: 'skill',
      text: 'Use postponement technique when worries arise',
      selected: false
    },
    {
      id: 'experiment-completion',
      category: 'experiment',
      text: 'Complete selected behavioral experiments',
      selected: selectedExperiments.length > 0
    },
    {
      id: 'metacognitive-growth',
      category: 'awareness',
      text: 'Observe thoughts from detached perspective',
      selected: false
    }
  ]);

  const [customGoal, setCustomGoal] = useState('');
  const [focusArea, setFocusArea] = useState<string>('');

  const focusAreas = [
    { id: 'attention', label: 'Attention Control', description: 'Building flexible attention skills' },
    { id: 'worry', label: 'Worry Management', description: 'Developing healthy worry patterns' },
    { id: 'awareness', label: 'Metacognitive Awareness', description: 'Strengthening observation skills' },
    { id: 'experiments', label: 'Belief Testing', description: 'Challenging unhelpful beliefs' }
  ];

  const weeklySchedule = [
    { day: 'Monday', focus: 'Fresh start - set intentions' },
    { day: 'Tuesday', focus: 'Build momentum' },
    { day: 'Wednesday', focus: 'Mid-week check-in' },
    { day: 'Thursday', focus: 'Experiment implementation' },
    { day: 'Friday', focus: 'Week wrap-up reflection' },
    { day: 'Weekend', focus: 'Integration and practice' }
  ];

  const toggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal =>
      goal.id === goalId ? { ...goal, selected: !goal.selected } : goal
    ));
  };

  const addCustomGoal = () => {
    if (customGoal.trim()) {
      const newGoal: WeeklyGoal = {
        id: `custom-${Date.now()}`,
        category: 'skill',
        text: customGoal.trim(),
        selected: true
      };
      setGoals(prev => [...prev, newGoal]);
      setCustomGoal('');
    }
  };

  const selectedGoals = goals.filter(goal => goal.selected);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'practice': return 'bg-blue-100 text-blue-800';
      case 'experiment': return 'bg-purple-100 text-purple-800';
      case 'awareness': return 'bg-green-100 text-green-800';
      case 'skill': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Week {weekNumber} Planning
          </h2>
        </div>
        <p className="text-gray-600">
          Set your intentions and focus areas for the week ahead
        </p>
      </div>

      {/* Focus Area Selection */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Primary Focus This Week</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {focusAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setFocusArea(area.id)}
              className={`p-4 border rounded-lg text-left transition-all ${
                focusArea === area.id
                  ? 'border-primary-400 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900 mb-1">{area.label}</h4>
              <p className="text-sm text-gray-600">{area.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Weekly Goals</h3>
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                goal.selected
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleGoal(goal.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                  goal.selected
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}>
                  {goal.selected && (
                    <CheckIcon className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-gray-900">{goal.text}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Goal Input */}
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
            placeholder="Add your own goal..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button
            onClick={addCustomGoal}
            disabled={!customGoal.trim()}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              customGoal.trim()
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add
          </button>
        </div>
      </div>

      {/* Experiment Schedule */}
      {selectedExperiments.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-4">This Week's Experiments</h3>
          <div className="space-y-2">
            {selectedExperiments.map((expId, index) => (
              <div key={expId} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600">🔬</span>
                  <span className="text-purple-900 font-medium">Experiment {index + 1}</span>
                  <span className="text-purple-700 text-sm">({expId.replace('-', ' ')})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Schedule Overview */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Week at a Glance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {weeklySchedule.map((day) => (
            <div key={day.day} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 text-sm">{day.day}</div>
              <div className="text-gray-600 text-xs">{day.focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Goals Summary */}
      {selectedGoals.length > 0 && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-900 mb-3">Your Week {weekNumber} Plan</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Primary Focus:</span>
              <span className="font-medium text-green-900">
                {focusAreas.find(area => area.id === focusArea)?.label || 'None selected'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Weekly Goals:</span>
              <span className="font-medium text-green-900">{selectedGoals.length} selected</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Experiments:</span>
              <span className="font-medium text-green-900">{selectedExperiments.length} planned</span>
            </div>
          </div>
        </div>
      )}

      {/* Intention Setting */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Week {weekNumber} Intention</h3>
        <p className="text-blue-800 text-sm italic">
          "This week, I will approach my MCT practice with curiosity and compassion,
          focusing on {focusAreas.find(area => area.id === focusArea)?.label.toLowerCase() || 'consistent practice'}
          while remaining open to whatever I discover about my mind."
        </p>
      </div>

      {/* Complete Planning */}
      <div className="text-center">
        <button
          onClick={onComplete}
          className="flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-lg font-medium text-lg hover:bg-primary-700 transition-colors"
        >
          <RocketLaunchIcon className="w-6 h-6 mr-3" />
          Start Week {weekNumber}
        </button>

        <p className="text-gray-600 text-sm mt-4">
          Your week is planned! Remember to be flexible and kind to yourself as you practice.
        </p>
      </div>
    </div>
  );
}