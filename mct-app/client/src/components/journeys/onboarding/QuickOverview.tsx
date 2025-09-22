import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  EyeIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

interface QuickOverviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function QuickOverview({ onNext, onPrevious }: QuickOverviewProps) {
  const concepts = [
    {
      icon: AcademicCapIcon,
      title: "Metacognition",
      description: "Thinking about thinking - awareness of your thought processes",
      color: "blue"
    },
    {
      icon: EyeIcon,
      title: "CAS Pattern",
      description: "Worry, rumination, and threat monitoring that maintains distress",
      color: "red"
    },
    {
      icon: ArrowPathIcon,
      title: "Attention Training",
      description: "Develop flexible control over where you focus your attention",
      color: "green"
    },
    {
      icon: ClockIcon,
      title: "Worry Postponement",
      description: "Schedule worry time instead of engaging immediately",
      color: "purple"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      red: "bg-red-50 text-red-600 border-red-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200"
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          MCT in 60 Seconds
        </h2>
        <p className="text-gray-600">
          Key concepts you'll work with in this program
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {concepts.map((concept, index) => (
          <motion.div
            key={concept.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 border rounded-lg ${getColorClasses(concept.color)}`}
          >
            <div className="flex items-start space-x-3">
              <concept.icon className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">{concept.title}</h3>
                <p className="text-sm opacity-80">{concept.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-amber-800 text-sm font-bold">!</span>
          </div>
          <div>
            <h3 className="font-medium text-amber-900 mb-1">Remember</h3>
            <p className="text-sm text-amber-800">
              We focus on <strong>process</strong> (how you think) not <strong>content</strong> (what you think about).
              Your worries and thoughts are normal - we're just changing how you relate to them.
            </p>
          </div>
        </div>
      </div>

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
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Got it, continue
        </button>
      </div>
    </div>
  );
}