import { motion } from 'framer-motion';
import { SparklesIcon, ClockIcon, HeartIcon, BookOpenIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { mctResources } from '../../../data/mctResources';

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SparklesIcon className="w-10 h-10 text-primary-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your MCT Journey
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Let's set you up for success with Metacognitive Therapy in just a few minutes.
        </p>

        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg"
          >
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Quick Setup</p>
              <p className="text-sm text-blue-700">Takes less than 7 minutes</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
          >
            <HeartIcon className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">Process-Focused</p>
              <p className="text-sm text-green-700">We focus on HOW you think, not WHAT you think</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg"
          >
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Evidence-Based</p>
              <p className="text-sm text-purple-700">Based on proven MCT techniques</p>
            </div>
          </motion.div>
        </div>

        {/* Learn More Section */}
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4" />
            Learn more about MCT
          </summary>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
            {mctResources.orientation.mctOverview.slice(0, 2).map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-white rounded hover:bg-blue-50 transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-blue-600">
                  {resource.title}
                </span>
                <div className="flex items-center gap-2">
                  {resource.duration && (
                    <span className="text-xs text-gray-500">{resource.duration}</span>
                  )}
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-400" />
                </div>
              </a>
            ))}
            <p className="text-xs text-gray-600 mt-2">
              Optional: Watch these brief introductions while you set up
            </p>
          </div>
        </details>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Let's Begin
        </motion.button>

        <p className="text-xs text-gray-500 mt-4">
          This setup helps us personalize your MCT experience
        </p>
      </motion.div>
    </div>
  );
}