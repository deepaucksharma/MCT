import { motion } from 'framer-motion';
import { LockOpenIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ModuleUnlockNotificationProps {
  weekNumber: number;
  onContinue: () => void;
  onSkip: () => void;
}

export default function ModuleUnlockNotification({
  weekNumber,
  onContinue,
  onSkip
}: ModuleUnlockNotificationProps) {
  const getModuleContent = (week: number) => {
    const modules = {
      1: {
        title: "Introduction to MCT",
        description: "Understanding metacognition and the CAS pattern",
        newSkills: ["Basic attention awareness", "CAS identification", "Thought observation"],
        keyTechnique: "Detached Mindfulness"
      },
      2: {
        title: "Attention Training Technique",
        description: "Developing flexible attentional control",
        newSkills: ["Sound-based attention training", "Attention shifting", "Focus control"],
        keyTechnique: "ATT Practice"
      },
      3: {
        title: "Worry Postponement",
        description: "Learning to schedule and control worry time",
        newSkills: ["Worry recognition", "Postponement scheduling", "Time-limited processing"],
        keyTechnique: "Postponement Protocol"
      },
      4: {
        title: "Behavioral Experiments",
        description: "Testing metacognitive beliefs through experience",
        newSkills: ["Belief identification", "Experiment design", "Outcome evaluation"],
        keyTechnique: "Systematic Testing"
      },
      5: {
        title: "Advanced DM Techniques",
        description: "Deepening metacognitive awareness practices",
        newSkills: ["Advanced observation", "Metacognitive meditation", "Pattern disruption"],
        keyTechnique: "Enhanced DM"
      }
    };

    return modules[week as keyof typeof modules] || modules[1];
  };

  const moduleContent = getModuleContent(weekNumber);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with celebration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-8 text-center"
      >
        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <LockOpenIcon className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold mb-2">
          Module {weekNumber} Unlocked!
        </h2>

        <p className="text-primary-100 text-lg">
          {moduleContent.title}
        </p>

        <div className="mt-4 flex justify-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🎉
          </motion.div>
        </div>
      </motion.div>

      <div className="p-8">
        {/* Module Description */}
        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">
            {moduleContent.description}
          </p>
        </div>

        {/* New Skills */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <SparklesIcon className="w-5 h-5 text-yellow-500 mr-2" />
            New Skills You'll Learn
          </h3>
          <div className="space-y-2">
            {moduleContent.newSkills.map((skill, index) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-green-800">{skill}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Technique Highlight */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            Key Technique: {moduleContent.keyTechnique}
          </h3>
          <p className="text-blue-800 text-sm">
            This week's primary focus will be mastering this core technique through daily practice and integration.
          </p>
        </div>

        {/* Progress Context */}
        <div className="mb-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">Week {weekNumber}</div>
            <div className="text-sm text-gray-600">Current</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{moduleContent.newSkills.length}</div>
            <div className="text-sm text-purple-600">New Skills</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">7</div>
            <div className="text-sm text-green-600">Days Ahead</div>
          </div>
        </div>

        {/* Readiness Check */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-medium text-amber-900 mb-2">Ready to Begin?</h3>
          <p className="text-amber-800 text-sm">
            Take a moment to acknowledge your progress so far. Each module builds on previous skills,
            so you're well-prepared for what's ahead.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onContinue}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Explore Module {weekNumber}
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Skip for Now
          </button>
        </div>

        {/* Encouragement */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            You've earned this advancement through consistent practice. Trust the process and enjoy exploring new techniques!
          </p>
        </div>
      </div>
    </div>
  );
}