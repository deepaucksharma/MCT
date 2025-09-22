import * as cron from 'node-cron';
import { getDatabase } from '../utils/database';
import { format } from 'date-fns';
import { engagementService } from './engagementService';
import { checkAndAwardAchievements } from '../utils/engagementMigration';

export function startScheduler() {
  // Schedule daily notification creation at 00:01
  cron.schedule('1 0 * * *', async () => {
    console.log('Running daily notification scheduler');
    await scheduleDailyNotifications();
  });

  // Check for week unlock every day at 00:05
  cron.schedule('5 0 * * *', async () => {
    console.log('Checking for week unlock');
    await checkWeekUnlock();
  });

  // Process pending notifications every minute
  cron.schedule('* * * * *', async () => {
    await processPendingNotifications();
  });

  // Clean up old notifications weekly
  cron.schedule('0 2 * * 0', async () => {
    console.log('Cleaning up old notifications');
    await cleanupOldNotifications();
  });

  // Generate personalized nudges daily at 06:00
  cron.schedule('0 6 * * *', async () => {
    console.log('Generating personalized nudges');
    await engagementService.generateNudges();
  });

  // Check achievements every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('Checking for new achievements');
    await checkAndAwardAchievements();
  });

  // Check milestone completion daily at 23:00
  cron.schedule('0 23 * * *', async () => {
    console.log('Checking milestone completion');
    await engagementService.checkMilestoneCompletion();
  });

  // Generate recovery nudges for inactive users daily at 19:00
  cron.schedule('0 19 * * *', async () => {
    console.log('Checking for recovery nudge opportunities');
    await generateRecoveryNudges();
  });

  console.log('Scheduler started with engagement features');
}

async function scheduleDailyNotifications() {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get user settings
    const settings = await db.get<any>(
      'SELECT * FROM user_settings WHERE id = 1'
    );

    if (!settings?.notifications_enabled) {
      return;
    }

    const dmReminderTimes = JSON.parse(settings.dm_reminder_times || '[]');

    // Schedule ATT reminder
    await db.run(
      `INSERT OR IGNORE INTO notifications (
        type, scheduled_time, sent, title, message
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        'att_reminder',
        `${today} ${settings.att_reminder_time}:00`,
        0,
        'Time for Attention Training',
        'Your daily ATT session is scheduled now. Take 12-15 minutes for this important practice.'
      ]
    );

    // Schedule DM reminders
    const dmTimeLabels = ['morning', 'midday', 'evening'];
    for (let i = 0; i < dmReminderTimes.length; i++) {
      await db.run(
        `INSERT OR IGNORE INTO notifications (
          type, scheduled_time, sent, title, message, data
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'dm_reminder',
          `${today} ${dmReminderTimes[i]}:00`,
          0,
          `Detached Mindfulness (${dmTimeLabels[i]})`,
          'Time for your 1-3 minute micro-practice.',
          JSON.stringify({ timeOfDay: dmTimeLabels[i] })
        ]
      );
    }

    // Schedule postponement reminder if slot is set
    if (settings.postponement_slot_start) {
      await db.run(
        `INSERT OR IGNORE INTO notifications (
          type, scheduled_time, sent, title, message
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          'postponement_reminder',
          `${today} ${settings.postponement_slot_start}:00`,
          0,
          'Worry/Rumination Time',
          `Your scheduled worry time starts now (${settings.postponement_slot_duration} minutes).`
        ]
      );
    }

    console.log('Daily notifications scheduled');
  } catch (error) {
    console.error('Error scheduling daily notifications:', error);
  }
}

async function checkWeekUnlock() {
  try {
    const db = await getDatabase();

    // Get current week from settings
    const settings = await db.get<any>(
      'SELECT current_week FROM user_settings WHERE id = 1'
    );

    const currentWeek = settings?.current_week || 0;

    // Check if next week should be unlocked
    const nextWeek = currentWeek + 1;

    // Check if next week exists
    const nextModule = await db.get<any>(
      'SELECT * FROM program_modules WHERE week_number = ? AND unlocked = 0',
      nextWeek
    );

    if (!nextModule) {
      return;
    }

    // Check if current week is completed
    const currentModule = await db.get<any>(
      'SELECT completed, unlocked_date FROM program_modules WHERE week_number = ?',
      currentWeek
    );

    if (currentModule?.completed) {
      // Unlock next week
      await db.run(
        `UPDATE program_modules SET unlocked = 1, unlocked_date = datetime('now') WHERE week_number = ?`,
        nextWeek
      );

      await db.run(
        'UPDATE user_settings SET current_week = ? WHERE id = 1',
        nextWeek
      );

      // Create notification
      await db.run(
        `INSERT INTO notifications (
          type, scheduled_time, sent, title, message
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          'weekly_unlock',
          format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          0,
          'New Week Unlocked!',
          `Week ${nextWeek} content is now available. Check the Program tab to continue your journey.`
        ]
      );

      console.log(`Week ${nextWeek} unlocked`);
    } else if (currentModule?.unlocked_date) {
      // Check if 7 days have passed since unlock
      const unlockDate = new Date(currentModule.unlocked_date);
      const daysSinceUnlock = Math.floor(
        (Date.now() - unlockDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceUnlock >= 7) {
        // Check minimum criteria
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const attCount = await db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM att_sessions
           WHERE date >= ? AND completed = 1`,
          format(lastWeek, 'yyyy-MM-dd')
        );

        const dmCount = await db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM dm_practices
           WHERE date >= ?`,
          format(lastWeek, 'yyyy-MM-dd')
        );

        if ((attCount?.count || 0) >= 3 && (dmCount?.count || 0) >= 6) {
          // Unlock next week
          await db.run(
            `UPDATE program_modules SET unlocked = 1, unlocked_date = datetime('now') WHERE week_number = ?`,
            nextWeek
          );

          await db.run(
            'UPDATE user_settings SET current_week = ? WHERE id = 1',
            nextWeek
          );

          // Create notification
          await db.run(
            `INSERT INTO notifications (
              type, scheduled_time, sent, title, message
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              'weekly_unlock',
              format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
              0,
              'New Week Unlocked!',
              `Week ${nextWeek} content is now available. You've met the minimum practice requirements!`
            ]
          );

          console.log(`Week ${nextWeek} unlocked (minimum criteria met)`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking week unlock:', error);
  }
}

async function processPendingNotifications() {
  try {
    const db = await getDatabase();
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const notifications = await db.all<any[]>(
      'SELECT * FROM notifications WHERE sent = 0 AND scheduled_time <= ?',
      now
    );

    for (const notification of notifications) {
      // In a real app, this would send actual notifications
      // For now, just mark as sent and log
      console.log(`Processing notification: ${notification.title}`);

      await db.run(
        `UPDATE notifications SET sent = 1, sent_at = datetime('now') WHERE id = ?`,
        notification.id
      );
    }
  } catch (error) {
    console.error('Error processing pending notifications:', error);
  }
}

async function cleanupOldNotifications() {
  try {
    const db = await getDatabase();
    const daysAgo = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const result = await db.run(
      'DELETE FROM notifications WHERE sent = 1 AND sent_at < ?',
      format(cutoffDate, 'yyyy-MM-dd HH:mm:ss')
    );

    console.log(`Cleaned up ${result.changes} old notifications`);
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
  }
}

async function generateRecoveryNudges() {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');
    const threeDaysAgo = format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    // Check for users who haven't practiced ATT in 3+ days
    const lastATT = await db.get(`
      SELECT MAX(date) as last_date
      FROM att_sessions
      WHERE completed = 1
    `);

    if (!lastATT?.last_date || lastATT.last_date < threeDaysAgo) {
      // Create recovery nudge
      const nudgeId = `recovery_nudge_${Date.now()}`;
      await db.run(`
        INSERT OR IGNORE INTO nudges (id, type, title, message, priority)
        VALUES (?, ?, ?, ?, ?)
      `, [
        nudgeId,
        'recovery',
        'Gentle Return',
        'It\'s been a few days since your last practice. No pressure - when you\'re ready, we\'re here to support your journey.',
        'low'
      ]);
    }

    // Check for broken streaks that were significant
    const brokenStreaks = await db.all(`
      SELECT type, current_streak, longest_streak, last_activity_date
      FROM streaks
      WHERE current_streak = 0
        AND longest_streak >= 7
        AND date(last_activity_date) = date('now', '-1 days')
    `);

    for (const streak of brokenStreaks) {
      const nudgeId = `streak_recovery_${streak.type}_${Date.now()}`;
      await db.run(`
        INSERT OR IGNORE INTO nudges (id, type, title, message, priority)
        VALUES (?, ?, ?, ?, ?)
      `, [
        nudgeId,
        'recovery',
        'Streak Reset',
        `Your ${streak.longest_streak}-day ${streak.type.toUpperCase()} streak shows your dedication. Ready to start fresh?`,
        'medium'
      ]);
    }

    console.log('Recovery nudges generated');
  } catch (error) {
    console.error('Error generating recovery nudges:', error);
  }
}