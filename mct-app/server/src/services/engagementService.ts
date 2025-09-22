import { getDatabase } from '../utils/database';
import { metricsService } from './metrics';
import { personalizationService } from './personalization';
import { format, subDays } from 'date-fns';

export interface SmartNudgeGenerator {
  generateNudges(): Promise<void>;
  checkMilestoneCompletion(): Promise<void>;
  updateAchievementProgress(): Promise<void>;
}

export class EngagementService implements SmartNudgeGenerator {

  /**
   * Generates smart nudges based on user behavior patterns
   */
  async generateNudges(): Promise<void> {
    const db = await getDatabase();

    // Clear old nudges (older than 7 days)
    await db.run(`
      DELETE FROM nudges
      WHERE created_at < date('now', '-7 days')
    `);

    // Check for various nudge opportunities
    await this.checkPracticeReminders();
    await this.checkProgressInsights();
    await this.checkEncouragementOpportunities();
    await this.checkRecoverySupport();
  }

  /**
   * Check if user needs practice reminders
   */
  private async checkPracticeReminders(): Promise<void> {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');
    const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');

    // Check ATT practice patterns
    const recentATT = await db.get(`
      SELECT COUNT(*) as count, MAX(date) as last_date
      FROM att_sessions
      WHERE date >= ? AND completed = 1
    `, threeDaysAgo);

    if (recentATT.count === 0) {
      // No ATT in 3 days
      await this.createNudge({
        type: 'reminder',
        title: 'ATT Practice Opportunity',
        message: 'It\'s been a few days since your last ATT session. Even 5 minutes can help maintain your progress.',
        action_text: 'Start ATT Session',
        action_url: '/att',
        priority: 'medium'
      });
    } else if (recentATT.last_date !== today) {
      // Haven't practiced today
      const preferences = await personalizationService.getUserPreferences();
      const currentHour = new Date().getHours();
      const preferredTime = preferences.practice_time_preference;

      let shouldRemind = false;
      if (preferredTime === 'morning' && currentHour >= 10) shouldRemind = true;
      if (preferredTime === 'midday' && currentHour >= 15) shouldRemind = true;
      if (preferredTime === 'evening' && currentHour >= 20) shouldRemind = true;

      if (shouldRemind) {
        await this.createNudge({
          type: 'reminder',
          title: 'Today\'s ATT Practice',
          message: 'A gentle reminder that you haven\'t practiced ATT today. Your consistency helps build lasting change.',
          action_text: 'Practice Now',
          action_url: '/att',
          priority: 'low'
        });
      }
    }

    // Check DM practice patterns
    const recentDM = await db.get(`
      SELECT COUNT(*) as count
      FROM dm_practices
      WHERE date = ?
    `, today);

    if (recentDM.count === 0 && new Date().getHours() >= 12) {
      await this.createNudge({
        type: 'reminder',
        title: 'DM Micro-Practice',
        message: 'A quick 30-second DM practice can help strengthen your attentional flexibility.',
        action_text: 'Try DM Practice',
        action_url: '/dm',
        priority: 'low'
      });
    }
  }

  /**
   * Generate insights based on user progress
   */
  private async checkProgressInsights(): Promise<void> {
    const performance = await personalizationService.analyzeUserPerformance();
    const beliefTrends = await metricsService.getBeliefTrends(14);

    // Belief change insights
    const beliefTypes = ['uncontrollability', 'danger', 'positive'] as const;
    for (const type of beliefTypes) {
      const trend = beliefTrends[`${type}_trend`];
      if (Math.abs(trend.week_over_week_change) >= 5) {
        const direction = trend.week_over_week_change > 0 ? 'increased' : 'decreased';
        const emoji = trend.week_over_week_change > 0 ? '📈' : '📉';

        await this.createNudge({
          type: 'insight',
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Belief Shift`,
          message: `Your ${type} beliefs have ${direction} by ${Math.abs(trend.week_over_week_change)} points this week. ${emoji} This suggests your practices are creating real change.`,
          priority: 'medium'
        });
      }
    }

    // Consistency insights
    if (performance.att_consistency_score >= 80) {
      await this.createNudge({
        type: 'insight',
        title: 'Excellent Consistency',
        message: `Your ${performance.att_consistency_score}% ATT consistency is building real neural pathways. You're developing skills that will serve you long-term.`,
        priority: 'low'
      });
    }
  }

  /**
   * Check for encouragement opportunities
   */
  private async checkEncouragementOpportunities(): Promise<void> {
    const db = await getDatabase();

    // Check for milestone achievements
    const currentWeek = await this.getCurrentWeek();
    const recentMilestones = await db.all(`
      SELECT id, title, week, completed_date
      FROM milestones
      WHERE completed = 1
        AND date(completed_date) >= date('now', '-3 days')
    `);

    for (const milestone of recentMilestones) {
      await this.createNudge({
        type: 'encouragement',
        title: 'Milestone Celebration',
        message: `Completing ${milestone.title} is a significant accomplishment. You're building real skills for lasting change.`,
        priority: 'medium'
      });
    }

    // Check streaks
    const streaks = await db.all(`
      SELECT type, current_streak FROM streaks WHERE current_streak > 0
    `);

    for (const streak of streaks) {
      if (streak.current_streak === 7 || streak.current_streak === 14 || streak.current_streak === 30) {
        const practiceType = streak.type === 'att' ? 'ATT' : streak.type.toUpperCase();
        await this.createNudge({
          type: 'encouragement',
          title: `${streak.current_streak}-Day ${practiceType} Streak!`,
          message: `Your dedication to consistent ${practiceType} practice is remarkable. You're literally rewiring your brain for better attention control.`,
          priority: 'medium'
        });
      }
    }
  }

  /**
   * Check for recovery support needs
   */
  private async checkRecoverySupport(): Promise<void> {
    const db = await getDatabase();

    // Check for broken streaks that were previously long
    const brokenStreaks = await db.all(`
      SELECT type, current_streak, longest_streak, last_activity_date
      FROM streaks
      WHERE current_streak = 0
        AND longest_streak >= 7
        AND date(last_activity_date) >= date('now', '-3 days')
    `);

    for (const streak of brokenStreaks) {
      const practiceType = streak.type === 'att' ? 'ATT' : streak.type.toUpperCase();
      await this.createNudge({
        type: 'recovery',
        title: 'Back on Track',
        message: `You had a ${streak.longest_streak}-day ${practiceType} streak - that shows what you're capable of. One missed day doesn't erase your progress.`,
        action_text: 'Resume Practice',
        priority: 'medium'
      });
    }

    // Check for experiment failures (learning opportunities)
    const recentExperiments = await db.all(`
      SELECT id, belief_tested, belief_rating_before, belief_rating_after, completed_at
      FROM experiments
      WHERE status = 'completed'
        AND date(completed_at) >= date('now', '-7 days')
        AND belief_rating_after >= belief_rating_before
    `);

    if (recentExperiments.length > 0) {
      await this.createNudge({
        type: 'recovery',
        title: 'Experiment Learning',
        message: 'Every experiment teaches something valuable, regardless of the outcome. The process itself is changing your relationship with uncertainty.',
        priority: 'low'
      });
    }
  }

  /**
   * Check and complete milestones
   */
  async checkMilestoneCompletion(): Promise<void> {
    const db = await getDatabase();
    const currentWeek = await this.getCurrentWeek();

    // Check if current week milestone should be completed
    const currentMilestone = await db.get(`
      SELECT id, week, title
      FROM milestones
      WHERE week = ? AND completed = 0
    `, currentWeek);

    if (currentMilestone && currentWeek > 0) {
      // Check if week's requirements are met (this is simplified - in real app, would check specific criteria)
      const weekProgress = await this.checkWeekProgress(currentWeek);

      if (weekProgress.completed) {
        await db.run(`
          UPDATE milestones
          SET completed = 1, completed_date = CURRENT_TIMESTAMP
          WHERE id = ?
        `, currentMilestone.id);

        // Create celebration nudge
        await this.createNudge({
          type: 'encouragement',
          title: `Week ${currentWeek} Complete!`,
          message: `You've completed ${currentMilestone.title}. This is real progress in your MCT journey.`,
          priority: 'high'
        });
      }
    }
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(): Promise<void> {
    // This would be called from the engagementMigration checkAndAwardAchievements function
    // Implementation already exists there
  }

  /**
   * Helper methods
   */
  private async createNudge(nudgeData: {
    type: string;
    title: string;
    message: string;
    action_text?: string;
    action_url?: string;
    priority: string;
  }): Promise<void> {
    const db = await getDatabase();

    // Check if similar nudge already exists
    const existing = await db.get(`
      SELECT id FROM nudges
      WHERE type = ? AND title = ?
        AND dismissed = 0
        AND date(created_at) >= date('now', '-1 days')
    `, [nudgeData.type, nudgeData.title]);

    if (!existing) {
      const id = `nudge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.run(`
        INSERT INTO nudges (id, type, title, message, action_text, action_url, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        nudgeData.type,
        nudgeData.title,
        nudgeData.message,
        nudgeData.action_text,
        nudgeData.action_url,
        nudgeData.priority
      ]);
    }
  }

  private async getCurrentWeek(): Promise<number> {
    const db = await getDatabase();
    const settings = await db.get(`
      SELECT current_week FROM user_settings WHERE id = 1
    `);
    return settings?.current_week || 0;
  }

  private async checkWeekProgress(week: number): Promise<{ completed: boolean; progress: number }> {
    const db = await getDatabase();

    // Simplified check - in real implementation, would check specific week requirements
    const attSessions = await db.get(`
      SELECT COUNT(*) as count
      FROM att_sessions
      WHERE completed = 1
        AND date >= date('now', '-7 days')
    `);

    const dmPractices = await db.get(`
      SELECT COUNT(*) as count
      FROM dm_practices
      WHERE date >= date('now', '-7 days')
    `);

    const casLogs = await db.get(`
      SELECT COUNT(*) as count
      FROM cas_logs
      WHERE date >= date('now', '-7 days')
    `);

    // Basic completion criteria: at least 3 ATT sessions, 5 DM practices, and 5 CAS logs in the week
    const attProgress = Math.min(100, (attSessions.count / 3) * 100);
    const dmProgress = Math.min(100, (dmPractices.count / 5) * 100);
    const casProgress = Math.min(100, (casLogs.count / 5) * 100);

    const overallProgress = (attProgress + dmProgress + casProgress) / 3;
    const completed = overallProgress >= 80; // 80% completion threshold

    return { completed, progress: Math.round(overallProgress) };
  }
}

export const engagementService = new EngagementService();