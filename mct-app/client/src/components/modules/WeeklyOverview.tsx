import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  LockClosedIcon,
  PlayIcon,
  ClockIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { WeeklyContentData } from '../../data/weeklyContent';

interface WeeklyOverviewProps {
  week: WeeklyContentData;
  isUnlocked: boolean;
  isCompleted: boolean;
  isActive?: boolean;
  onClick: () => void;
}

export default function WeeklyOverview({
  week,
  isUnlocked,
  isCompleted,
  isActive = false,
  onClick
}: WeeklyOverviewProps) {
  const getStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
    } else if (isUnlocked) {
      return <PlayIcon className="h-6 w-6 text-primary-600" />;
    } else {
      return <LockClosedIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (isCompleted) {
      return 'border-green-200 bg-green-50';
    } else if (isUnlocked) {
      return isActive ? 'border-primary-400 bg-primary-50' : 'border-primary-200 bg-white hover:bg-primary-50';
    } else {
      return 'border-gray-200 bg-gray-50';
    }
  };

  const getTextColor = () => {
    if (!isUnlocked) return 'text-gray-500';
    return 'text-gray-900';
  };

  return (
    <motion.div
      whileHover={isUnlocked ? { y: -2 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      className={`border rounded-lg transition-all duration-200 ${getStatusColor()} ${
        isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'
      }`}
      onClick={isUnlocked ? onClick : undefined}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                isCompleted ? 'bg-green-500' : isUnlocked ? 'bg-primary-500' : 'bg-gray-400'
              }`}>
                {week.weekNumber}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${getTextColor()}`}>
                Week {week.weekNumber}
              </h3>
              <h4 className={`text-sm font-medium ${getTextColor()}`}>
                {week.title}
              </h4>
            </div>
          </div>
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
        </div>

        {/* Learning objectives preview */}
        <div className="text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1 mb-1">
            <ClockIcon className="h-3 w-3" />
            <span className="font-medium">{week.learningObjectives.length} objectives</span>
          </div>
          <p className="line-clamp-2">{week.learningObjectives[0]}</p>
        </div>

        {/* Features indicators */}
        <div className="flex items-center gap-2 text-xs">
          {week.tryThisNow && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
              <ClockIcon className="h-3 w-3" />
              <span>Try This</span>
            </div>
          )}
          {week.experiment && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded">
              <BeakerIcon className="h-3 w-3" />
              <span>Experiment</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded">
            <span>{week.pitfalls.length} pitfalls</span>
          </div>
        </div>

        {/* Status text */}
        <div className="mt-3 text-xs">
          {isCompleted && (
            <span className="text-green-600 font-medium">✓ Completed</span>
          )}
          {!isCompleted && isUnlocked && (
            <span className="text-primary-600 font-medium">Click to view content</span>
          )}
          {!isUnlocked && (
            <span className="text-gray-500">Complete previous weeks to unlock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}