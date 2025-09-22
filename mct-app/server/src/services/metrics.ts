import { getDatabase } from '../utils/database';
import { format, subDays, startOfWeek, endOfWeek, parseISO, addDays } from 'date-fns';

// Core Process Metrics Types
export interface CASMetrics {
  worry_minutes: number;
  rumination_minutes: number;
  monitoring_count: number;
  checking_count: number;
  reassurance_count: number;
  avoidance_count: number;
  date: string;
}

export interface PracticeMetrics {
  att_completion_rate: number;
  att_total_minutes: number;
  dm_frequency: number;
  postponement_success_rate: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface BeliefMetricsPoint {
  uncontrollability: number;
  danger: number;
  positive: number;
  date: string;
}

export interface TrendAnalysis {
  current_value: number;
  seven_day_avg: number;
  week_over_week_change: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  percentage_change: number;
}

export interface EngagementPattern {
  best_practice_time: string;
  consistency_score: number;
  streak_current: number;
  streak_longest: number;
  completion_rate: number;
}

export interface WeeklySummaryMetrics {
  cas_averages: {
    worry_minutes: number;
    rumination_minutes: number;
    monitoring_count: number;
    checking_count: number;
    reassurance_count: number;
  };
  practice_stats: {
    att_completion_rate: number;
    att_average_duration: number;
    dm_daily_average: number;
    postponement_success_rate: number;
  };
  belief_trends: {
    uncontrollability: TrendAnalysis;
    danger: TrendAnalysis;
    positive: TrendAnalysis;
  };
  engagement: EngagementPattern;
}

export class MetricsService {
  private async getDateRange(days: number): Promise<string[]> {
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    }
    return dates;
  }

  private async calculateRollingAverage(values: number[], windowSize: number = 7): Promise<number[]> {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(Math.round(avg * 100) / 100);
    }
    return result;
  }

  private calculateTrendDirection(current: number, previous: number): 'increasing' | 'decreasing' | 'stable' {
    const threshold = 0.05; // 5% threshold for "stable"
    const change = Math.abs(current - previous) / (previous || 1);

    if (change < threshold) return 'stable';
    return current > previous ? 'increasing' : 'decreasing';
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Logs CAS metrics automatically from exercise completions
   */
  async logCASFromExercise(data: {
    worry_minutes?: number;
    rumination_minutes?: number;
    monitoring_count?: number;
    checking_count?: number;
    reassurance_count?: number;
    avoidance_count?: number;
    notes?: string;
  }): Promise<void> {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get existing log for today
    const existing = await db.get<CASMetrics>(
      'SELECT * FROM cas_logs WHERE date = ?',
      today
    );

    if (existing) {
      // Update existing log by adding new values
      await db.run(`
        UPDATE cas_logs SET
          worry_minutes = worry_minutes + ?,
          rumination_minutes = rumination_minutes + ?,
          monitoring_count = monitoring_count + ?,
          checking_count = checking_count + ?,
          reassurance_count = reassurance_count + ?,
          avoidance_count = avoidance_count + ?,
          notes = CASE WHEN notes IS NULL THEN ? ELSE notes || '; ' || ? END,
          updated_at = CURRENT_TIMESTAMP
        WHERE date = ?
      `, [
        data.worry_minutes || 0,
        data.rumination_minutes || 0,
        data.monitoring_count || 0,
        data.checking_count || 0,
        data.reassurance_count || 0,
        data.avoidance_count || 0,
        data.notes,
        data.notes,
        today
      ]);
    } else {
      // Create new log
      await db.run(`
        INSERT INTO cas_logs (
          date, worry_minutes, rumination_minutes, monitoring_count,
          checking_count, reassurance_count, avoidance_count, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        today,
        data.worry_minutes || 0,
        data.rumination_minutes || 0,
        data.monitoring_count || 0,
        data.checking_count || 0,
        data.reassurance_count || 0,
        data.avoidance_count || 0,
        data.notes
      ]);
    }
  }

  /**
   * Records quick daily CAS log entry
   */
  async quickCASLog(data: {
    worry_minutes: number;
    rumination_minutes: number;
    monitoring_count: number;
    checking_count?: number;
    reassurance_count?: number;
    avoidance_count?: number;
    notes?: string;
  }): Promise<void> {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    await db.run(`
      INSERT OR REPLACE INTO cas_logs (
        date, worry_minutes, rumination_minutes, monitoring_count,
        checking_count, reassurance_count, avoidance_count, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      today,
      data.worry_minutes,
      data.rumination_minutes,
      data.monitoring_count,
      data.checking_count || 0,
      data.reassurance_count || 0,
      data.avoidance_count || 0,
      data.notes
    ]);
  }

  /**
   * Records belief rating
   */
  async recordBeliefRating(data: {
    belief_type: 'uncontrollability' | 'danger' | 'positive';
    rating: number;
    context?: string;
  }): Promise<void> {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    await db.run(`
      INSERT INTO belief_ratings (date, belief_type, rating, context)
      VALUES (?, ?, ?, ?)
    `, [today, data.belief_type, data.rating, data.context]);
  }

  /**
   * Gets CAS trends with 7-day rolling averages
   */
  async getCASTimeTrends(days: number = 30): Promise<{
    dates: string[];
    worry_minutes: number[];
    rumination_minutes: number[];
    monitoring_count: number[];
    checking_count: number[];
    reassurance_count: number[];
    worry_rolling_avg: number[];
    rumination_rolling_avg: number[];
    monitoring_rolling_avg: number[];
  }> {
    const db = await getDatabase();
    const dates = await this.getDateRange(days);

    const worryData: number[] = [];
    const ruminationData: number[] = [];
    const monitoringData: number[] = [];
    const checkingData: number[] = [];
    const reassuranceData: number[] = [];

    for (const date of dates) {
      const log = await db.get<CASMetrics>(
        'SELECT * FROM cas_logs WHERE date = ?',
        date
      );

      worryData.push(log?.worry_minutes || 0);
      ruminationData.push(log?.rumination_minutes || 0);
      monitoringData.push(log?.monitoring_count || 0);
      checkingData.push(log?.checking_count || 0);
      reassuranceData.push(log?.reassurance_count || 0);
    }

    return {
      dates,
      worry_minutes: worryData,
      rumination_minutes: ruminationData,
      monitoring_count: monitoringData,
      checking_count: checkingData,
      reassurance_count: reassuranceData,
      worry_rolling_avg: await this.calculateRollingAverage(worryData),
      rumination_rolling_avg: await this.calculateRollingAverage(ruminationData),
      monitoring_rolling_avg: await this.calculateRollingAverage(monitoringData)
    };
  }

  /**
   * Gets practice statistics with trends
   */
  async getPracticeStats(days: number = 30): Promise<{
    att_completion_rate: number;
    att_completion_trend: TrendAnalysis;
    dm_frequency: number;
    dm_frequency_trend: TrendAnalysis;
    postponement_success_rate: number;
    postponement_trend: TrendAnalysis;
    dates: string[];
    att_daily_completion: boolean[];
    dm_daily_count: number[];
    postponement_daily_success: number[];
  }> {
    const db = await getDatabase();
    const dates = await this.getDateRange(days);
    const weekAgo = dates[Math.max(0, dates.length - 7)];
    const twoWeeksAgo = dates[Math.max(0, dates.length - 14)];

    // ATT Completion Rate
    const attDailyCompletion: boolean[] = [];
    for (const date of dates) {
      const completed = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM att_sessions WHERE date = ? AND completed = 1',
        date
      );
      attDailyCompletion.push((completed?.count || 0) > 0);
    }

    const currentWeekATT = attDailyCompletion.slice(-7).filter(Boolean).length / 7 * 100;
    const previousWeekATT = attDailyCompletion.slice(-14, -7).filter(Boolean).length / 7 * 100;

    // DM Frequency
    const dmDailyCount: number[] = [];
    for (const date of dates) {
      const count = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM dm_practices WHERE date = ?',
        date
      );
      dmDailyCount.push(count?.count || 0);
    }

    const currentWeekDM = dmDailyCount.slice(-7).reduce((sum, val) => sum + val, 0) / 7;
    const previousWeekDM = dmDailyCount.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7;

    // Postponement Success Rate
    const postponementDailySuccess: number[] = [];
    for (const date of dates) {
      const total = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM postponement_logs WHERE date = ?',
        date
      );
      const processed = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM postponement_logs WHERE date = ? AND processed = 1',
        date
      );

      const rate = total?.count ? (processed?.count || 0) / total.count * 100 : 0;
      postponementDailySuccess.push(rate);
    }

    const currentWeekPostponement = postponementDailySuccess.slice(-7).reduce((sum, val) => sum + val, 0) / 7;
    const previousWeekPostponement = postponementDailySuccess.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7;

    return {
      att_completion_rate: Math.round(currentWeekATT),
      att_completion_trend: {
        current_value: currentWeekATT,
        seven_day_avg: currentWeekATT,
        week_over_week_change: currentWeekATT - previousWeekATT,
        trend_direction: this.calculateTrendDirection(currentWeekATT, previousWeekATT),
        percentage_change: this.calculatePercentageChange(currentWeekATT, previousWeekATT)
      },
      dm_frequency: Math.round(currentWeekDM * 100) / 100,
      dm_frequency_trend: {
        current_value: currentWeekDM,
        seven_day_avg: currentWeekDM,
        week_over_week_change: currentWeekDM - previousWeekDM,
        trend_direction: this.calculateTrendDirection(currentWeekDM, previousWeekDM),
        percentage_change: this.calculatePercentageChange(currentWeekDM, previousWeekDM)
      },
      postponement_success_rate: Math.round(currentWeekPostponement),
      postponement_trend: {
        current_value: currentWeekPostponement,
        seven_day_avg: currentWeekPostponement,
        week_over_week_change: currentWeekPostponement - previousWeekPostponement,
        trend_direction: this.calculateTrendDirection(currentWeekPostponement, previousWeekPostponement),
        percentage_change: this.calculatePercentageChange(currentWeekPostponement, previousWeekPostponement)
      },
      dates,
      att_daily_completion: attDailyCompletion,
      dm_daily_count: dmDailyCount,
      postponement_daily_success: postponementDailySuccess
    };
  }

  /**
   * Gets belief rating trends
   */
  async getBeliefTrends(days: number = 30): Promise<{
    dates: string[];
    uncontrollability: number[];
    danger: number[];
    positive: number[];
    uncontrollability_trend: TrendAnalysis;
    danger_trend: TrendAnalysis;
    positive_trend: TrendAnalysis;
  }> {
    const db = await getDatabase();
    const dates = await this.getDateRange(days);
    const beliefTypes = ['uncontrollability', 'danger', 'positive'] as const;

    const result: any = { dates };

    for (const type of beliefTypes) {
      const ratings = await db.all<{ date: string; rating: number }[]>(
        `SELECT date, rating FROM belief_ratings
         WHERE belief_type = ? AND date >= ?
         ORDER BY date`,
        [type, dates[0]]
      );

      // Create a map for quick lookup
      const ratingMap = new Map((ratings || []).map(r => [r.date, r.rating]));

      // Fill in the trend array, carrying forward last known value
      let lastValue: number = 50; // Default starting value
      const values: number[] = [];
      for (const date of dates) {
        if (ratingMap.has(date)) {
          lastValue = ratingMap.get(date) || 50;
        }
        values.push(lastValue);
      }

      result[type] = values;

      // Calculate trend analysis
      const currentWeekAvg = values.slice(-7).reduce((sum, val) => sum + val, 0) / 7;
      const previousWeekAvg = values.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7;

      result[`${type}_trend`] = {
        current_value: values[values.length - 1],
        seven_day_avg: Math.round(currentWeekAvg * 100) / 100,
        week_over_week_change: currentWeekAvg - previousWeekAvg,
        trend_direction: this.calculateTrendDirection(currentWeekAvg, previousWeekAvg),
        percentage_change: this.calculatePercentageChange(currentWeekAvg, previousWeekAvg)
      };
    }

    return result;
  }

  /**
   * Gets comprehensive weekly summary
   */
  async getWeeklySummary(): Promise<WeeklySummaryMetrics> {
    const db = await getDatabase();
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');

    // CAS Averages
    const casAvg = await db.get<any>(
      `SELECT
       AVG(worry_minutes) as avg_worry,
       AVG(rumination_minutes) as avg_rumination,
       AVG(monitoring_count) as avg_monitoring,
       AVG(checking_count) as avg_checking,
       AVG(reassurance_count) as avg_reassurance
       FROM cas_logs WHERE date >= ?`,
      weekAgo
    );

    const casPrevWeekAvg = await db.get<any>(
      `SELECT
       AVG(worry_minutes) as avg_worry,
       AVG(rumination_minutes) as avg_rumination,
       AVG(monitoring_count) as avg_monitoring
       FROM cas_logs WHERE date >= ? AND date < ?`,
      [twoWeeksAgo, weekAgo]
    );

    // Practice Stats
    const attDays = await db.get<{ count: number }>(
      'SELECT COUNT(DISTINCT date) as count FROM att_sessions WHERE date >= ? AND completed = 1',
      weekAgo
    );

    const attAvgDuration = await db.get<{ avg: number }>(
      'SELECT AVG(duration_minutes) as avg FROM att_sessions WHERE date >= ? AND completed = 1',
      weekAgo
    );

    const dmAvg = await db.get<{ avg: number }>(
      'SELECT AVG(daily_count) as avg FROM (SELECT date, COUNT(*) as daily_count FROM dm_practices WHERE date >= ? GROUP BY date)',
      weekAgo
    );

    const postponementStats = await db.get<any>(
      `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN processed = 1 THEN 1 ELSE 0 END) as processed
       FROM postponement_logs WHERE date >= ?`,
      weekAgo
    );

    // Belief Trends
    const beliefTrends = await this.getBeliefTrends(14);

    // Engagement Pattern
    const streaks = await db.all<{ type: string; current_streak: number; longest_streak: number }[]>(
      'SELECT type, current_streak, longest_streak FROM streaks'
    );

    const streakMap = new Map((streaks || []).map(s => [s.type, s]));

    return {
      cas_averages: {
        worry_minutes: Math.round(casAvg?.avg_worry || 0),
        rumination_minutes: Math.round(casAvg?.avg_rumination || 0),
        monitoring_count: Math.round(casAvg?.avg_monitoring || 0),
        checking_count: Math.round(casAvg?.avg_checking || 0),
        reassurance_count: Math.round(casAvg?.avg_reassurance || 0)
      },
      practice_stats: {
        att_completion_rate: Math.round((attDays?.count || 0) / 7 * 100),
        att_average_duration: Math.round(attAvgDuration?.avg || 0),
        dm_daily_average: Math.round((dmAvg?.avg || 0) * 100) / 100,
        postponement_success_rate: postponementStats?.total
          ? Math.round((postponementStats.processed / postponementStats.total) * 100)
          : 0
      },
      belief_trends: {
        uncontrollability: beliefTrends.uncontrollability_trend,
        danger: beliefTrends.danger_trend,
        positive: beliefTrends.positive_trend
      },
      engagement: {
        best_practice_time: '20:00', // This could be calculated from most common practice times
        consistency_score: Math.round((attDays?.count || 0) / 7 * 100),
        streak_current: (streakMap.get('overall') as any)?.current_streak || 0,
        streak_longest: (streakMap.get('overall') as any)?.longest_streak || 0,
        completion_rate: Math.round((attDays?.count || 0) / 7 * 100)
      }
    };
  }

  /**
   * Updates practice completion automatically from exercise logs
   */
  async logPracticeCompletion(type: 'att' | 'dm' | 'postponement', data: any): Promise<void> {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Update streak
    const streak = await db.get<{ current_streak: number; last_activity_date: string }>(
      'SELECT current_streak, last_activity_date FROM streaks WHERE type = ?',
      type
    );

    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    let newStreak = 1;

    if (streak?.last_activity_date === yesterday) {
      newStreak = streak.current_streak + 1;
    } else if (streak?.last_activity_date === today) {
      newStreak = streak.current_streak; // Already logged today
    }

    await db.run(`
      UPDATE streaks SET
        current_streak = ?,
        longest_streak = MAX(longest_streak, ?),
        last_activity_date = ?
      WHERE type = ?
    `, [newStreak, newStreak, today, type]);

    // Log app event for analytics
    await db.run(`
      INSERT INTO app_events (event_type, event_data)
      VALUES (?, ?)
    `, [`${type}_completed`, JSON.stringify(data)]);
  }

  /**
   * Checks if weekly assessment prompt is due
   */
  async isWeeklyAssessmentDue(): Promise<boolean> {
    const db = await getDatabase();
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const lastAssessment = await db.get<{ created_at: string }>(
      'SELECT created_at FROM assessments WHERE assessment_type = ? ORDER BY created_at DESC LIMIT 1',
      'weekly'
    );

    if (!lastAssessment) return true;

    const lastAssessmentDate = format(parseISO(lastAssessment.created_at), 'yyyy-MM-dd');
    return lastAssessmentDate < weekAgo;
  }
}

export const metricsService = new MetricsService();