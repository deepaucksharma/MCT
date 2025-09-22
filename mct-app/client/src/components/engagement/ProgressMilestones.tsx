
interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  completed: boolean;
  completed_date?: string;
  celebration_shown?: boolean;
  type: 'week_completion' | 'mid_program' | 'graduation' | 'special';
}

interface ProgressMilestonesProps {
  milestones: Milestone[];
  currentWeek: number;
  showCelebration?: boolean;
  onCelebrationComplete?: (milestoneId: string) => void;
}

const ProgressMilestones: React.FC<ProgressMilestonesProps> = ({
  milestones,
  currentWeek,
  showCelebration = false,
  onCelebrationComplete
}) => {
  const activeMilestone = milestones.find(m =>
    m.completed && !m.celebration_shown && showCelebration
  );

  return (
    <div className="space-y-6">
      {/* Celebration Modal */}
      {activeMilestone && (
        <MilestoneCelebration
          milestone={activeMilestone}
          onComplete={() => onCelebrationComplete?.(activeMilestone.id)}
        />
      )}

      {/* Progress Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your MCT Journey</h2>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div
            className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-green-500 transition-all duration-1000"
            style={{ height: `${(currentWeek / 8) * 100}%` }}
          ></div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                currentWeek={currentWeek}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Program Progress</span>
            <span className="text-sm text-gray-500">{Math.min(currentWeek, 8)} / 8 weeks</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((currentWeek / 8) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Next Milestone Preview */}
      <NextMilestonePreview milestones={milestones} currentWeek={currentWeek} />
    </div>
  );
};

interface MilestoneItemProps {
  milestone: Milestone;
  currentWeek: number;
  index: number;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone, currentWeek }) => {
  const getStatusIcon = () => {
    if (milestone.completed) return '✅';
    if (milestone.week <= currentWeek) return '🔄';
    return '⏳';
  };

  const getStatusColor = () => {
    if (milestone.completed) return 'text-green-600';
    if (milestone.week <= currentWeek) return 'text-blue-600';
    return 'text-gray-400';
  };

  const getBorderColor = () => {
    if (milestone.completed) return 'border-green-200 bg-green-50';
    if (milestone.week <= currentWeek) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="relative flex items-start space-x-4">
      {/* Timeline Dot */}
      <div className={`w-4 h-4 rounded-full border-2 bg-white z-10 ${
        milestone.completed
          ? 'border-green-500'
          : milestone.week <= currentWeek
            ? 'border-blue-500'
            : 'border-gray-300'
      }`}>
        <div className={`w-2 h-2 rounded-full m-0.5 ${
          milestone.completed
            ? 'bg-green-500'
            : milestone.week <= currentWeek
              ? 'bg-blue-500'
              : 'bg-gray-300'
        }`}></div>
      </div>

      {/* Milestone Content */}
      <div className={`flex-1 border rounded-lg p-4 ${getBorderColor()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon()}</span>
              <h3 className={`font-medium ${getStatusColor()}`}>
                Week {milestone.week}: {milestone.title}
              </h3>
            </div>
            <p className={`text-sm mt-1 ${
              milestone.completed || milestone.week <= currentWeek
                ? 'text-gray-600'
                : 'text-gray-400'
            }`}>
              {milestone.description}
            </p>
            {milestone.completed && milestone.completed_date && (
              <p className="text-xs text-green-600 mt-2">
                Completed on {new Date(milestone.completed_date).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Special Milestone Badges */}
          {milestone.type === 'mid_program' && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Midway Point
            </span>
          )}
          {milestone.type === 'graduation' && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              Graduation
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface NextMilestonePreviewProps {
  milestones: Milestone[];
  currentWeek: number;
}

const NextMilestonePreview: React.FC<NextMilestonePreviewProps> = ({ milestones, currentWeek }) => {
  const nextMilestone = milestones.find(m => !m.completed && m.week > currentWeek);

  if (!nextMilestone || currentWeek >= 8) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <h3 className="font-medium text-blue-900 mb-2">Coming Up Next</h3>
      <div className="flex items-center space-x-3">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="font-medium text-blue-800">Week {nextMilestone.week}: {nextMilestone.title}</p>
          <p className="text-sm text-blue-600">{nextMilestone.description}</p>
        </div>
      </div>
    </div>
  );
};

interface MilestoneCelebrationProps {
  milestone: Milestone;
  onComplete: () => void;
}

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ milestone, onComplete }) => {
  const getCelebrationEmoji = () => {
    switch (milestone.type) {
      case 'week_completion': return '🎉';
      case 'mid_program': return '🏆';
      case 'graduation': return '🎓';
      default: return '⭐';
    }
  };

  const getCelebrationMessage = () => {
    switch (milestone.type) {
      case 'week_completion':
        return `Congratulations on completing Week ${milestone.week}!`;
      case 'mid_program':
        return "You've reached the midway point of your MCT journey!";
      case 'graduation':
        return "Congratulations! You've completed the MCT program!";
      default:
        return "Great progress on your MCT journey!";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">{getCelebrationEmoji()}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {milestone.title}
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          {getCelebrationMessage()}
        </p>
        <p className="text-gray-600 mb-6">
          {milestone.description}
        </p>
        <button
          onClick={onComplete}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Journey
        </button>
      </div>
    </div>
  );
};

export default ProgressMilestones;