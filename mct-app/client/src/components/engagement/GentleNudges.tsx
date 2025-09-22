
interface Nudge {
  id: string;
  type: 'reminder' | 'insight' | 'encouragement' | 'recovery';
  title: string;
  message: string;
  action_text?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  dismissed?: boolean;
}

interface GentleNudgesProps {
  nudges: Nudge[];
  onDismiss?: (nudgeId: string) => void;
  onAction?: (nudgeId: string, actionUrl?: string) => void;
  maxDisplay?: number;
}

const GentleNudges: React.FC<GentleNudgesProps> = ({
  nudges,
  onDismiss,
  onAction,
  maxDisplay = 3
}) => {
  const activeNudges = nudges
    .filter(n => !n.dismissed)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, maxDisplay);

  if (activeNudges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeNudges.map((nudge) => (
        <NudgeCard
          key={nudge.id}
          nudge={nudge}
          onDismiss={() => onDismiss?.(nudge.id)}
          onAction={() => onAction?.(nudge.id, nudge.action_url)}
        />
      ))}
    </div>
  );
};

interface NudgeCardProps {
  nudge: Nudge;
  onDismiss: () => void;
  onAction: () => void;
}

const NudgeCard: React.FC<NudgeCardProps> = ({ nudge, onDismiss, onAction }) => {
  const getNudgeIcon = () => {
    switch (nudge.type) {
      case 'reminder': return '⏰';
      case 'insight': return '💡';
      case 'encouragement': return '🌟';
      case 'recovery': return '🌱';
      default: return '📝';
    }
  };

  const getNudgeColors = () => {
    switch (nudge.type) {
      case 'reminder':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          subtext: 'text-blue-700'
        };
      case 'insight':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          subtext: 'text-purple-700'
        };
      case 'encouragement':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          subtext: 'text-green-700'
        };
      case 'recovery':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          subtext: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          subtext: 'text-gray-700'
        };
    }
  };

  const colors = getNudgeColors();
  const isHighPriority = nudge.priority === 'high';

  return (
    <div
      className={`rounded-lg border p-4 ${colors.bg} ${colors.border} ${
        isHighPriority ? 'ring-2 ring-opacity-20 ring-orange-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-xl">{getNudgeIcon()}</span>
          <div className="flex-1">
            <h3 className={`font-medium ${colors.text}`}>
              {nudge.title}
            </h3>
            <p className={`text-sm mt-1 ${colors.subtext}`}>
              {nudge.message}
            </p>

            {/* Action Button */}
            {nudge.action_text && (
              <button
                onClick={onAction}
                className={`mt-3 text-sm font-medium hover:underline ${colors.text}`}
              >
                {nudge.action_text} →
              </button>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 ml-2"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Pre-defined nudge templates for common scenarios
export const createNudgeTemplates = () => {
  return {
    // Practice Reminders
    attReminder: (consecutiveMisses: number): Nudge => ({
      id: `att-reminder-${Date.now()}`,
      type: 'reminder',
      title: 'ATT Practice Opportunity',
      message: `It's been ${consecutiveMisses} day${consecutiveMisses > 1 ? 's' : ''} since your last ATT session. Even 5 minutes can help maintain your progress.`,
      action_text: 'Start ATT Session',
      action_url: '/att',
      priority: consecutiveMisses >= 3 ? 'high' : 'medium',
      created_at: new Date().toISOString()
    }),

    dmReminder: (): Nudge => ({
      id: `dm-reminder-${Date.now()}`,
      type: 'reminder',
      title: 'DM Micro-Practice',
      message: 'A quick 30-second DM practice can help strengthen your attentional flexibility throughout the day.',
      action_text: 'Try DM Practice',
      action_url: '/dm',
      priority: 'low',
      created_at: new Date().toISOString()
    }),

    // Motivational Insights
    progressInsight: (streak: number, improvement: string): Nudge => ({
      id: `progress-insight-${Date.now()}`,
      type: 'insight',
      title: 'Your Progress Shows',
      message: `Your ${streak}-day streak reflects real dedication. We're also noticing ${improvement} in your practice patterns.`,
      priority: 'medium',
      created_at: new Date().toISOString()
    }),

    beliefChangeInsight: (beliefType: string, change: number): Nudge => ({
      id: `belief-insight-${Date.now()}`,
      type: 'insight',
      title: 'Belief Rating Shift',
      message: `Your ${beliefType} beliefs have shifted by ${Math.abs(change)} points this week. This suggests your practices are creating real change.`,
      priority: 'medium',
      created_at: new Date().toISOString()
    }),

    // Encouragement
    consistencyEncouragement: (days: number): Nudge => ({
      id: `consistency-encouragement-${Date.now()}`,
      type: 'encouragement',
      title: 'Building Strong Habits',
      message: `${days} days of consistent practice is building real neural pathways. Your brain is learning new ways to relate to thoughts.`,
      priority: 'low',
      created_at: new Date().toISOString()
    }),

    milestoneEncouragement: (milestone: string): Nudge => ({
      id: `milestone-encouragement-${Date.now()}`,
      type: 'encouragement',
      title: 'Milestone Reached',
      message: `Reaching ${milestone} is a significant accomplishment. You're developing skills that will serve you long-term.`,
      priority: 'medium',
      created_at: new Date().toISOString()
    }),

    // Recovery Support
    streakRecovery: (previousStreak: number): Nudge => ({
      id: `streak-recovery-${Date.now()}`,
      type: 'recovery',
      title: 'Back on Track',
      message: `You had a ${previousStreak}-day streak before - that shows what you're capable of. One missed day doesn't erase your progress.`,
      action_text: 'Resume Practice',
      priority: 'medium',
      created_at: new Date().toISOString()
    }),

    experimentEncouragement: (): Nudge => ({
      id: `experiment-encouragement-${Date.now()}`,
      type: 'encouragement',
      title: 'Experiment Learning',
      message: 'Every experiment teaches something valuable, regardless of the outcome. The process itself is changing your relationship with uncertainty.',
      priority: 'low',
      created_at: new Date().toISOString()
    }),

    // Gentle Pattern Recognition
    timeOptimization: (bestTime: string): Nudge => ({
      id: `time-optimization-${Date.now()}`,
      type: 'insight',
      title: 'Optimal Practice Time',
      message: `Your data shows you're most consistent with ${bestTime} practices. Consider adjusting your reminders to match your natural patterns.`,
      action_text: 'Adjust Reminders',
      action_url: '/settings',
      priority: 'low',
      created_at: new Date().toISOString()
    })
  };
};

export default GentleNudges;