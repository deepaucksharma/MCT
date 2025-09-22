import React, { useState, useEffect } from 'react';
import StreakDisplay from './StreakDisplay';
import AchievementBadges from './AchievementBadges';
import GentleNudges from './GentleNudges';

interface PersonalizationDashboardProps {
  userId?: string;
}

interface EngagementData {
  streaks: any[];
  recentAchievements: any[];
  achievementCounts: { total: number; earned: number };
  currentWeek: number;
  nextMilestone: any;
  activeNudgesCount: number;
}

interface PersonalizationData {
  profile: any;
  recommendations: any[];
  preferences: any;
}

interface ActiveNudges {
  nudges: any[];
}

const PersonalizationDashboard: React.FC<PersonalizationDashboardProps> = () => {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [activeNudges, setActiveNudges] = useState<ActiveNudges>({ nudges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'streaks' | 'achievements' | 'recommendations'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch engagement data
      const [engagementResponse, personalizationResponse, nudgesResponse] = await Promise.all([
        fetch('/api/engagement/dashboard'),
        fetch('/api/personalization/profile'),
        fetch('/api/engagement/nudges')
      ]);

      if (!engagementResponse.ok || !personalizationResponse.ok || !nudgesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const engagement = await engagementResponse.json();
      const profile = await personalizationResponse.json();
      const nudges = await nudgesResponse.json();

      // Fetch additional personalization data
      const [recommendationsResponse, preferencesResponse] = await Promise.all([
        fetch('/api/personalization/recommendations'),
        fetch('/api/personalization/preferences')
      ]);

      const recommendations = recommendationsResponse.ok ? await recommendationsResponse.json() : [];
      const preferences = preferencesResponse.ok ? await preferencesResponse.json() : {};

      setEngagementData(engagement);
      setPersonalizationData({
        profile,
        recommendations,
        preferences
      });
      setActiveNudges({ nudges });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNudgeDismiss = async (nudgeId: string) => {
    try {
      await fetch(`/api/engagement/nudges/${nudgeId}/dismiss`, {
        method: 'POST'
      });

      // Remove from local state
      setActiveNudges(prev => ({
        nudges: prev.nudges.filter(n => n.id !== nudgeId)
      }));
    } catch (error) {
      console.error('Error dismissing nudge:', error);
    }
  };

  const handleNudgeAction = async (_: string, actionUrl?: string) => {
    if (actionUrl) {
      // Navigate to the action URL
      window.location.href = actionUrl;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your personalized experience...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-800">Error Loading Data</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 text-red-700 hover:text-red-800 text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!engagementData || !personalizationData) {
    return <div>No data available</div>;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Active Nudges */}
      {activeNudges.nudges.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Your MCT Insights</h3>
          <GentleNudges
            nudges={activeNudges.nudges}
            onDismiss={handleNudgeDismiss}
            onAction={handleNudgeAction}
            maxDisplay={2}
          />
        </div>
      )}

      {/* Performance Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Progress at a Glance</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {personalizationData.profile.att_consistency_score}%
            </div>
            <div className="text-sm text-blue-700">ATT Consistency</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {personalizationData.profile.overall_engagement}%
            </div>
            <div className="text-sm text-green-700">Overall Engagement</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {engagementData.achievementCounts.earned}
            </div>
            <div className="text-sm text-purple-700">Achievements Earned</div>
          </div>
        </div>
      </div>

      {/* Streaks Summary */}
      <StreakDisplay streaks={engagementData.streaks} showDetailed={false} />

      {/* Recent Achievements */}
      {engagementData.recentAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Achievements</h3>
          <AchievementBadges
            achievements={engagementData.recentAchievements}
            layout="grid"
          />
        </div>
      )}

      {/* Top Recommendations */}
      {personalizationData.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Personalized Recommendations</h3>
          <div className="space-y-3">
            {personalizationData.recommendations.slice(0, 2).map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailedView = () => {
    switch (selectedView) {
      case 'streaks':
        return <StreakDisplay streaks={engagementData.streaks} showDetailed={true} />;
      case 'achievements':
        return <AchievementBadges achievements={[]} showAll={true} layout="list" />;
      case 'recommendations':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h2>
            {personalizationData.recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} detailed={true} />
            ))}
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex space-x-4">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'streaks', label: 'Streaks' },
            { key: 'achievements', label: 'Achievements' },
            { key: 'recommendations', label: 'Recommendations' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedView(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderDetailedView()}
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: any;
  detailed?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, detailed = false }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadgeColor(recommendation.priority)}`}>
              {recommendation.priority}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
          {detailed && (
            <p className="text-xs text-gray-600">{recommendation.rationale}</p>
          )}
        </div>
      </div>
      {recommendation.actionable && (
        <div className="mt-3">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Take Action →
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalizationDashboard;