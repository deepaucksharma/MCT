import { useState, useEffect, useCallback } from 'react';

// Types
interface UserProfile {
  att_consistency_score: number;
  att_avg_duration: number;
  dm_engagement_rate: number;
  postponement_success_rate: number;
  belief_change_velocity: number;
  overall_engagement: number;
}

interface AdaptiveSettings {
  att_duration_minutes: number;
  experiment_complexity: 'basic' | 'intermediate' | 'advanced';
  sar_plan_frequency: 'low' | 'medium' | 'high';
  challenge_level: number;
}

interface Recommendation {
  type: 'experiment' | 'sar_plan' | 'practice_time' | 'reminder_adjustment';
  title: string;
  description: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  metadata?: any;
}

interface UserPreferences {
  preferred_att_duration: number;
  preferred_reminder_times: string[];
  preferred_dm_metaphor: 'radio' | 'screen' | 'weather';
  preferred_att_script: 'standard' | 'short' | 'emergency';
  notification_style: 'gentle' | 'encouraging' | 'minimal';
  practice_time_preference: 'morning' | 'midday' | 'evening' | 'flexible';
}

interface UsePersonalizationResult {
  // Data
  profile: UserProfile | null;
  adaptiveSettings: AdaptiveSettings | null;
  recommendations: Recommendation[];
  preferences: UserPreferences | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  dismissRecommendation: (recommendationId: string) => void;

  // Utilities
  getOptimalATTDuration: () => number;
  shouldShowComplexExperiments: () => boolean;
  getPersonalizedReminder: () => string;
}

export const usePersonalization = (): UsePersonalizationResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all personalization data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, settingsRes, recommendationsRes, preferencesRes] = await Promise.all([
        fetch('/api/personalization/profile'),
        fetch('/api/personalization/difficulty-settings'),
        fetch('/api/personalization/recommendations'),
        fetch('/api/personalization/preferences')
      ]);

      if (!profileRes.ok || !settingsRes.ok || !recommendationsRes.ok || !preferencesRes.ok) {
        throw new Error('Failed to fetch personalization data');
      }

      const [profileData, settingsData, recommendationsData, preferencesData] = await Promise.all([
        profileRes.json(),
        settingsRes.json(),
        recommendationsRes.json(),
        preferencesRes.json()
      ]);

      setProfile(profileData);
      setAdaptiveSettings(settingsData);
      setRecommendations(recommendationsData);
      setPreferences(preferencesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching personalization data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/personalization/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      // Update local state
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);

      // Refresh adaptive settings since they may have changed
      const settingsRes = await fetch('/api/personalization/difficulty-settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setAdaptiveSettings(settingsData);
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      throw err;
    }
  }, []);

  // Dismiss a recommendation
  const dismissRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.metadata?.id !== recommendationId));
  }, []);

  // Utility functions
  const getOptimalATTDuration = useCallback(() => {
    if (adaptiveSettings) {
      return adaptiveSettings.att_duration_minutes;
    }
    if (preferences) {
      return preferences.preferred_att_duration;
    }
    return 12; // Default
  }, [adaptiveSettings, preferences]);

  const shouldShowComplexExperiments = useCallback(() => {
    return adaptiveSettings?.experiment_complexity === 'advanced';
  }, [adaptiveSettings]);

  const getPersonalizedReminder = useCallback(() => {
    if (!preferences || !profile) {
      return "Time for your practice session!";
    }

    const style = preferences.notification_style;
    const consistency = profile.att_consistency_score;

    if (style === 'encouraging') {
      if (consistency >= 80) {
        return "Your consistency is amazing! Ready for another great session?";
      } else if (consistency >= 60) {
        return "You're building great habits! Time to practice.";
      } else {
        return "Every session counts toward your growth. You've got this!";
      }
    } else if (style === 'minimal') {
      return "Practice time";
    } else { // gentle
      if (consistency >= 80) {
        return "Your regular practice is creating real change. Ready when you are.";
      } else {
        return "A gentle reminder that practice time helps maintain your progress.";
      }
    }
  }, [preferences, profile]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Data
    profile,
    adaptiveSettings,
    recommendations,
    preferences,

    // Loading states
    loading,
    error,

    // Actions
    refreshData: fetchData,
    updatePreferences,
    dismissRecommendation,

    // Utilities
    getOptimalATTDuration,
    shouldShowComplexExperiments,
    getPersonalizedReminder,
  };
};

// Additional hook for engagement features
interface UseEngagementResult {
  streaks: any[];
  achievements: any[];
  milestones: any[];
  nudges: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  dismissNudge: (nudgeId: string) => Promise<void>;
  markMilestoneCelebrationShown: (milestoneId: string) => Promise<void>;
}

export const useEngagement = (): UseEngagementResult => {
  const [streaks, setStreaks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [nudges, setNudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [streaksRes, achievementsRes, milestonesRes, nudgesRes] = await Promise.all([
        fetch('/api/engagement/streaks'),
        fetch('/api/engagement/achievements'),
        fetch('/api/engagement/milestones'),
        fetch('/api/engagement/nudges')
      ]);

      if (!streaksRes.ok || !achievementsRes.ok || !milestonesRes.ok || !nudgesRes.ok) {
        throw new Error('Failed to fetch engagement data');
      }

      const [streaksData, achievementsData, milestonesData, nudgesData] = await Promise.all([
        streaksRes.json(),
        achievementsRes.json(),
        milestonesRes.json(),
        nudgesRes.json()
      ]);

      setStreaks(streaksData);
      setAchievements(achievementsData);
      setMilestones(milestonesData.milestones || []);
      setNudges(nudgesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching engagement data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissNudge = useCallback(async (nudgeId: string) => {
    try {
      const response = await fetch(`/api/engagement/nudges/${nudgeId}/dismiss`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss nudge');
      }

      setNudges(prev => prev.filter(nudge => nudge.id !== nudgeId));
    } catch (err) {
      console.error('Error dismissing nudge:', err);
      throw err;
    }
  }, []);

  const markMilestoneCelebrationShown = useCallback(async (milestoneId: string) => {
    try {
      const response = await fetch(`/api/engagement/milestones/${milestoneId}/celebration-shown`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark celebration as shown');
      }

      setMilestones(prev =>
        prev.map(milestone =>
          milestone.id === milestoneId
            ? { ...milestone, celebration_shown: true }
            : milestone
        )
      );
    } catch (err) {
      console.error('Error marking celebration as shown:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    streaks,
    achievements,
    milestones,
    nudges,
    loading,
    error,
    refreshData: fetchData,
    dismissNudge,
    markMilestoneCelebrationShown,
  };
};