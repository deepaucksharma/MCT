import { getDatabase } from '../utils/database';
import { metricsService } from './metrics';
import { format, subDays, addDays } from 'date-fns';

// Personalization Types
export interface UserPerformanceProfile {
  att_consistency_score: number;
  att_avg_duration: number;
  dm_engagement_rate: number;
  postponement_success_rate: number;
  belief_change_velocity: number;
  overall_engagement: number;
}

export interface AdaptiveDifficultySettings {
  att_duration_minutes: number;
  experiment_complexity: 'basic' | 'intermediate' | 'advanced';
  sar_plan_frequency: 'low' | 'medium' | 'high';
  challenge_level: number; // 1-10 scale
}

export interface PersonalizedRecommendation {
  type: 'experiment' | 'sar_plan' | 'practice_time' | 'reminder_adjustment';
  title: string;
  description: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  metadata?: any;
}

export interface UserPreferences {
  preferred_att_duration: number;
  preferred_reminder_times: string[];
  preferred_dm_metaphor: 'radio' | 'screen' | 'weather';
  preferred_att_script: 'standard' | 'short' | 'emergency';
  notification_style: 'gentle' | 'encouraging' | 'minimal';
  practice_time_preference: 'morning' | 'midday' | 'evening' | 'flexible';
}

export class PersonalizationService {

  /**
   * Analyzes user performance across multiple dimensions
   */
  async analyzeUserPerformance(): Promise<UserPerformanceProfile> {
    const db = await getDatabase();
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    // ATT Consistency Score (percentage of days with completed sessions)
    const attDays = await db.get<{ completed_days: number, total_days: number }>(
      `SELECT
        COUNT(DISTINCT CASE WHEN completed = 1 THEN date END) as completed_days,
        COUNT(DISTINCT date) as total_days
       FROM att_sessions
       WHERE date >= ?`,
      thirtyDaysAgo
    );

    const attConsistency = attDays?.total_days
      ? (attDays.completed_days / Math.min(attDays.total_days, 30)) * 100
      : 0;

    // ATT Average Duration
    const attDuration = await db.get<{ avg_duration: number }>(
      `SELECT AVG(duration_minutes) as avg_duration
       FROM att_sessions
       WHERE date >= ? AND completed = 1`,
      thirtyDaysAgo
    );

    // DM Engagement Rate (practices per day average)
    const dmEngagement = await db.get<{ avg_practices: number }>(
      `SELECT AVG(daily_count) as avg_practices
       FROM (
         SELECT date, COUNT(*) as daily_count
         FROM dm_practices
         WHERE date >= ?
         GROUP BY date
       )`,
      thirtyDaysAgo
    );

    // Postponement Success Rate
    const postponementStats = await db.get<{ success_rate: number }>(
      `SELECT
        (CAST(SUM(CASE WHEN processed = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as success_rate
       FROM postponement_logs
       WHERE date >= ?`,
      thirtyDaysAgo
    );

    // Belief Change Velocity (rate of change in belief ratings)
    const beliefChange = await this.calculateBeliefChangeVelocity();

    // Overall Engagement (composite score)
    const overallEngagement = this.calculateOverallEngagement(
      attConsistency,
      dmEngagement?.avg_practices || 0,
      postponementStats?.success_rate || 0
    );

    return {
      att_consistency_score: Math.round(attConsistency),
      att_avg_duration: Math.round(attDuration?.avg_duration || 0),
      dm_engagement_rate: Math.round((dmEngagement?.avg_practices || 0) * 100) / 100,
      postponement_success_rate: Math.round(postponementStats?.success_rate || 0),
      belief_change_velocity: beliefChange,
      overall_engagement: overallEngagement
    };
  }

  /**
   * Calculates adaptive difficulty settings based on performance
   */
  async getAdaptiveDifficultySettings(): Promise<AdaptiveDifficultySettings> {
    const performance = await this.analyzeUserPerformance();
    const currentWeek = await this.getCurrentWeek();

    // Adaptive ATT Duration
    let attDuration = 12; // Default
    if (performance.att_consistency_score >= 80 && performance.att_avg_duration >= 10) {
      attDuration = Math.min(15, performance.att_avg_duration + 2);
    } else if (performance.att_consistency_score < 50) {
      attDuration = Math.max(8, performance.att_avg_duration - 1);
    }

    // Experiment Complexity
    let experimentComplexity: 'basic' | 'intermediate' | 'advanced' = 'basic';
    if (currentWeek >= 4 && performance.overall_engagement >= 70) {
      experimentComplexity = 'advanced';
    } else if (currentWeek >= 2 && performance.overall_engagement >= 50) {
      experimentComplexity = 'intermediate';
    }

    // SAR Plan Frequency
    let sarFrequency: 'low' | 'medium' | 'high' = 'medium';
    if (performance.postponement_success_rate >= 70) {
      sarFrequency = 'high';
    } else if (performance.postponement_success_rate < 40) {
      sarFrequency = 'low';
    }

    // Overall Challenge Level
    const challengeLevel = Math.min(10, Math.max(1,
      Math.round((performance.overall_engagement / 10) + currentWeek)
    ));

    return {
      att_duration_minutes: attDuration,
      experiment_complexity: experimentComplexity,
      sar_plan_frequency: sarFrequency,
      challenge_level: challengeLevel
    };
  }

  /**
   * Generates personalized recommendations based on user patterns
   */
  async generatePersonalizedRecommendations(): Promise<PersonalizedRecommendation[]> {
    const performance = await this.analyzeUserPerformance();
    const practicePatterns = await this.analyzePracticePatterns();
    const beliefTrends = await metricsService.getBeliefTrends(14);
    const recommendations: PersonalizedRecommendation[] = [];

    // ATT Consistency Recommendations
    if (performance.att_consistency_score < 60) {
      recommendations.push({
        type: 'practice_time',
        title: 'Optimize Your ATT Schedule',
        description: `Your ATT consistency is at ${performance.att_consistency_score}%. Consider adjusting your practice time.`,
        rationale: 'Consistent practice is more effective than longer but irregular sessions.',
        priority: 'high',
        actionable: true,
        metadata: {
          suggested_time: practicePatterns.best_practice_time,
          current_consistency: performance.att_consistency_score
        }
      });
    }

    // Smart Experiment Suggestions
    if (beliefTrends.uncontrollability_trend.trend_direction === 'stable' &&
        beliefTrends.uncontrollability[beliefTrends.uncontrollability.length - 1] > 60) {
      recommendations.push({
        type: 'experiment',
        title: 'Uncontrollability Challenge Experiment',
        description: 'Your uncontrollability beliefs have plateaued. Time for a targeted experiment.',
        rationale: 'Stable high uncontrollability beliefs suggest need for behavioral testing.',
        priority: 'medium',
        actionable: true,
        metadata: {
          belief_type: 'uncontrollability',
          current_rating: beliefTrends.uncontrollability[beliefTrends.uncontrollability.length - 1]
        }
      });
    }

    // SAR Plan Recommendations for Frequent Triggers
    const frequentTriggers = await this.identifyFrequentTriggers();
    if (frequentTriggers.length > 0) {
      recommendations.push({
        type: 'sar_plan',
        title: 'Create SAR Plans for Top Triggers',
        description: `We've identified ${frequentTriggers.length} recurring trigger patterns.`,
        rationale: 'Proactive SAR plans reduce CAS activation in predictable situations.',
        priority: 'medium',
        actionable: true,
        metadata: { triggers: frequentTriggers }
      });
    }

    // Practice Time Optimization
    if (practicePatterns.optimal_time !== practicePatterns.current_time) {
      recommendations.push({
        type: 'reminder_adjustment',
        title: 'Adjust Practice Reminders',
        description: `Your most successful practices happen at ${practicePatterns.optimal_time}.`,
        rationale: 'Aligning practice time with your natural patterns improves consistency.',
        priority: 'low',
        actionable: true,
        metadata: {
          optimal_time: practicePatterns.optimal_time,
          success_rate_at_optimal: practicePatterns.success_rate_at_optimal
        }
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Gets and updates user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    const db = await getDatabase();

    const settings = await db.get<any>(
      'SELECT * FROM user_settings WHERE id = 1'
    );

    // Get inferred preferences from usage patterns
    const inferredPrefs = await this.inferPreferencesFromUsage();

    return {
      preferred_att_duration: settings?.preferred_att_duration || inferredPrefs.att_duration || 12,
      preferred_reminder_times: JSON.parse(settings?.dm_reminder_times || '["08:00","13:00","18:00"]'),
      preferred_dm_metaphor: settings?.preferred_dm_metaphor || inferredPrefs.dm_metaphor || 'radio',
      preferred_att_script: settings?.preferred_att_script || inferredPrefs.att_script || 'standard',
      notification_style: settings?.notification_style || 'gentle',
      practice_time_preference: settings?.practice_time_preference || inferredPrefs.practice_time || 'evening'
    };
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const db = await getDatabase();

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (preferences.preferred_att_duration) {
      updateFields.push('preferred_att_duration = ?');
      updateValues.push(preferences.preferred_att_duration);
    }

    if (preferences.preferred_reminder_times) {
      updateFields.push('dm_reminder_times = ?');
      updateValues.push(JSON.stringify(preferences.preferred_reminder_times));
    }

    if (preferences.preferred_dm_metaphor) {
      updateFields.push('preferred_dm_metaphor = ?');
      updateValues.push(preferences.preferred_dm_metaphor);
    }

    if (preferences.preferred_att_script) {
      updateFields.push('preferred_att_script = ?');
      updateValues.push(preferences.preferred_att_script);
    }

    if (preferences.notification_style) {
      updateFields.push('notification_style = ?');
      updateValues.push(preferences.notification_style);
    }

    if (preferences.practice_time_preference) {
      updateFields.push('practice_time_preference = ?');
      updateValues.push(preferences.practice_time_preference);
    }

    if (updateFields.length > 0) {
      updateValues.push(1); // WHERE id = 1
      await db.run(
        `UPDATE user_settings SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );
    }
  }

  /**
   * Private helper methods
   */
  private async calculateBeliefChangeVelocity(): Promise<number> {
    const beliefTrends = await metricsService.getBeliefTrends(30);

    // Calculate average change across all belief types
    const changes = [
      Math.abs(beliefTrends.uncontrollability_trend.week_over_week_change),
      Math.abs(beliefTrends.danger_trend.week_over_week_change),
      Math.abs(beliefTrends.positive_trend.week_over_week_change)
    ];

    return Math.round((changes.reduce((sum, change) => sum + change, 0) / changes.length) * 100) / 100;
  }

  private calculateOverallEngagement(attConsistency: number, dmRate: number, postponementRate: number): number {
    // Weighted composite score
    const weights = { att: 0.4, dm: 0.3, postponement: 0.3 };
    const normalizedDM = Math.min(100, dmRate * 20); // Normalize 0-5 practices to 0-100

    return Math.round(
      (attConsistency * weights.att) +
      (normalizedDM * weights.dm) +
      (postponementRate * weights.postponement)
    );
  }

  private async getCurrentWeek(): Promise<number> {
    const db = await getDatabase();
    const settings = await db.get<{ current_week: number }>(
      'SELECT current_week FROM user_settings WHERE id = 1'
    );
    return settings?.current_week || 0;
  }

  private async analyzePracticePatterns(): Promise<{
    best_practice_time: string;
    current_time: string;
    optimal_time: string;
    success_rate_at_optimal: number;
  }> {
    const db = await getDatabase();

    // Find most successful practice time based on completion rates
    const timeAnalysis = await db.all<any[]>(
      `SELECT
        CASE
          WHEN time(created_at) BETWEEN '06:00' AND '11:59' THEN 'morning'
          WHEN time(created_at) BETWEEN '12:00' AND '17:59' THEN 'midday'
          WHEN time(created_at) BETWEEN '18:00' AND '23:59' THEN 'evening'
          ELSE 'other'
        END as time_period,
        COUNT(*) as total,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
        (CAST(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as success_rate
       FROM att_sessions
       WHERE date >= date('now', '-30 days')
       GROUP BY time_period
       ORDER BY success_rate DESC`
    );

    const currentSettings = await db.get<{ att_reminder_time: string }>(
      'SELECT att_reminder_time FROM user_settings WHERE id = 1'
    );

    const currentHour = currentSettings?.att_reminder_time ?
      parseInt(currentSettings.att_reminder_time.split(':')[0]) : 20;

    let currentTimePeriod = 'evening';
    if (currentHour >= 6 && currentHour < 12) currentTimePeriod = 'morning';
    else if (currentHour >= 12 && currentHour < 18) currentTimePeriod = 'midday';

    const bestTime = timeAnalysis?.[0]?.time_period || 'evening';
    const bestSuccessRate = timeAnalysis?.[0]?.success_rate || 0;

    return {
      best_practice_time: bestTime,
      current_time: currentTimePeriod,
      optimal_time: bestTime,
      success_rate_at_optimal: Math.round(bestSuccessRate)
    };
  }

  private async identifyFrequentTriggers(): Promise<string[]> {
    const db = await getDatabase();

    // Analyze postponement logs for frequent trigger patterns
    const triggerAnalysis = await db.all<any[]>(
      `SELECT
        CASE
          WHEN time(trigger_time) BETWEEN '06:00' AND '11:59' THEN 'morning_trigger'
          WHEN time(trigger_time) BETWEEN '12:00' AND '17:59' THEN 'midday_trigger'
          WHEN time(trigger_time) BETWEEN '18:00' AND '23:59' THEN 'evening_trigger'
          ELSE 'other_trigger'
        END as trigger_pattern,
        COUNT(*) as frequency
       FROM postponement_logs
       WHERE date >= date('now', '-14 days')
       GROUP BY trigger_pattern
       HAVING frequency >= 3
       ORDER BY frequency DESC`
    );

    return (triggerAnalysis || []).map(t => t.trigger_pattern);
  }

  private async inferPreferencesFromUsage(): Promise<{
    att_duration: number;
    dm_metaphor: 'radio' | 'screen' | 'weather';
    att_script: 'standard' | 'short' | 'emergency';
    practice_time: 'morning' | 'midday' | 'evening' | 'flexible';
  }> {
    const db = await getDatabase();

    // Infer ATT duration preference from most used duration
    const attDurationPref = await db.get<{ avg_duration: number }>(
      `SELECT AVG(duration_minutes) as avg_duration
       FROM att_sessions
       WHERE completed = 1 AND date >= date('now', '-14 days')`
    );

    // Infer DM metaphor from most used
    const dmMetaphorPref = await db.get<{ metaphor: string }>(
      `SELECT metaphor_used as metaphor
       FROM dm_practices
       WHERE date >= date('now', '-14 days')
       GROUP BY metaphor_used
       ORDER BY COUNT(*) DESC
       LIMIT 1`
    );

    // Infer ATT script from most used
    const attScriptPref = await db.get<{ script: string }>(
      `SELECT script_type as script
       FROM att_sessions
       WHERE completed = 1 AND date >= date('now', '-14 days')
       GROUP BY script_type
       ORDER BY COUNT(*) DESC
       LIMIT 1`
    );

    // Infer practice time from most successful time
    const practiceTimeAnalysis = await this.analyzePracticePatterns();

    return {
      att_duration: Math.round(attDurationPref?.avg_duration || 12),
      dm_metaphor: (dmMetaphorPref?.metaphor as any) || 'radio',
      att_script: (attScriptPref?.script as any) || 'standard',
      practice_time: practiceTimeAnalysis.optimal_time as any
    };
  }
}

export const personalizationService = new PersonalizationService();