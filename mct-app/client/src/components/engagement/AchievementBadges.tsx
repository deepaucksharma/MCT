
interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_icon: string;
  earned_date?: string;
  progress?: number;
  total_required?: number;
  category: 'consistency' | 'exploration' | 'milestone' | 'skill' | 'special';
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  showAll?: boolean;
  layout?: 'grid' | 'list';
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  achievements,
  showAll = false,
  layout = 'grid'
}) => {
  const earnedAchievements = achievements.filter(a => a.earned_date);
  const availableAchievements = achievements.filter(a => !a.earned_date);

  const displayAchievements = showAll
    ? [...earnedAchievements, ...availableAchievements.slice(0, 6)]
    : earnedAchievements.slice(0, 4);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consistency': return 'from-green-400 to-green-600';
      case 'exploration': return 'from-purple-400 to-purple-600';
      case 'milestone': return 'from-blue-400 to-blue-600';
      case 'skill': return 'from-yellow-400 to-yellow-600';
      case 'special': return 'from-pink-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {showAll && (
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
            <span className="text-sm text-gray-500">
              {earnedAchievements.length} of {achievements.length} earned
            </span>
          </div>
        )}

        <div className="space-y-3">
          {displayAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                achievement.earned_date
                  ? 'bg-white border-gray-200 shadow-sm'
                  : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${getCategoryColor(achievement.category)}`}
                >
                  {achievement.badge_icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${achievement.earned_date ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${achievement.earned_date ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                  {achievement.earned_date ? (
                    <p className="text-xs text-green-600 mt-1">
                      Earned on {formatDate(achievement.earned_date)}
                    </p>
                  ) : achievement.progress !== undefined && achievement.total_required ? (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{achievement.progress} / {achievement.total_required}</span>
                        <span>{Math.round((achievement.progress / achievement.total_required) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${getCategoryColor(achievement.category)}`}
                          style={{ width: `${Math.min((achievement.progress / achievement.total_required) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="space-y-4">
      {showAll && earnedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Earned Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {earnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} earned={true} />
            ))}
          </div>
        </div>
      )}

      {showAll && availableAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Available Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} earned={false} />
            ))}
          </div>
        </div>
      )}

      {!showAll && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              earned={!!achievement.earned_date}
            />
          ))}
        </div>
      )}

      {!showAll && earnedAchievements.length > 4 && (
        <div className="text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all {earnedAchievements.length} achievements
          </button>
        </div>
      )}
    </div>
  );
};

interface AchievementCardProps {
  achievement: Achievement;
  earned: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, earned }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consistency': return 'from-green-400 to-green-600';
      case 'exploration': return 'from-purple-400 to-purple-600';
      case 'milestone': return 'from-blue-400 to-blue-600';
      case 'skill': return 'from-yellow-400 to-yellow-600';
      case 'special': return 'from-pink-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg p-3 text-center transition-all duration-200 hover:shadow-md ${
        earned ? 'border-gray-200' : 'border-gray-100 opacity-60'
      }`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 bg-gradient-to-br ${
          earned ? getCategoryColor(achievement.category) : 'from-gray-300 to-gray-400'
        }`}
      >
        {achievement.badge_icon}
      </div>
      <h4 className={`font-medium text-sm ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
        {achievement.title}
      </h4>
      <p className={`text-xs mt-1 ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
        {achievement.description}
      </p>
      {earned && achievement.earned_date && (
        <p className="text-xs text-green-600 mt-1">
          {new Date(achievement.earned_date).toLocaleDateString()}
        </p>
      )}
      {!earned && achievement.progress !== undefined && achievement.total_required && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${getCategoryColor(achievement.category)}`}
              style={{ width: `${Math.min((achievement.progress / achievement.total_required) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {achievement.progress} / {achievement.total_required}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;