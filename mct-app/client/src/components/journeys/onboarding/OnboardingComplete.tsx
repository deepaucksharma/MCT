import { motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface OnboardingCompleteProps {
  onComplete: () => void;
}

export default function OnboardingComplete({ onComplete }: OnboardingCompleteProps) {
  const nextSteps = [
    {
      icon: '🏠',
      title: 'Visit Today page',
      description: 'See your personalized daily tasks'
    },
    {
      icon: '🎧',
      title: 'Try your first ATT session',
      description: 'Start building flexible attention control'
    },
    {
      icon: '📊',
      title: 'Begin CAS logging',
      description: 'Track patterns without judgment'
    },
    {
      icon: '⏰',
      title: 'Practice postponement',
      description: 'When worries arise, schedule them'
    }
  ];

  const principles = [
    "Practice is more important than perfection",
    "Focus on the process, not the content",
    "Be patient and compassionate with yourself",
    "Small daily steps create lasting change"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You're All Set!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Your MCT journey begins now. Remember, this is about changing <strong>how</strong> you relate to thoughts, not eliminating them.
        </p>
      </motion.div>

      {/* Key Principles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Remember These Key Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {principles.map((principle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-blue-800 text-sm">{principle}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <SparklesIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">What's Next?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{step.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg mb-8"
      >
        <div className="text-center">
          <p className="text-green-800 font-medium mb-2">
            🌟 You've taken the first step toward a healthier relationship with your thoughts!
          </p>
          <p className="text-green-700 text-sm">
            The journey is gradual, but each day of practice builds lasting change.
            Trust the process and be kind to yourself.
          </p>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
        className="text-center"
      >
        <button
          onClick={onComplete}
          className="group inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-lg font-medium text-lg hover:bg-primary-700 transition-all transform hover:scale-105"
        >
          <RocketLaunchIcon className="w-6 h-6 mr-3 group-hover:animate-bounce" />
          Start Your MCT Journey
        </button>

        <p className="text-xs text-gray-500 mt-3">
          You'll be taken to your personalized Today page
        </p>
      </motion.div>
    </div>
  );
}