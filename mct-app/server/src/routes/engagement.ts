import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { checkAndAwardAchievements } from '../utils/engagementMigration';

const router = Router();

/**
 * GET /api/engagement/streaks
 * Get user streak information
 */
router.get('/streaks', async (req, res) => {
  try {
    const db = await getDatabase();
    const streaks = await db.all(`
      SELECT type, current_streak, longest_streak, last_activity_date
      FROM streaks
      ORDER BY type
    `);

    res.json(streaks);
  } catch (error) {
    console.error('Error getting streaks:', error);
    res.status(500).json({ error: 'Failed to get streaks' });
  }
});

/**
 * GET /api/engagement/achievements
 * Get user achievements
 */
router.get('/achievements', async (req, res) => {
  try {
    const db = await getDatabase();

    // Check for new achievements first
    await checkAndAwardAchievements();

    const achievements = await db.all(`
      SELECT
        id, title, description, badge_icon, category,
        criteria_type, criteria_value, earned_date,
        progress, total_required
      FROM achievements
      ORDER BY
        CASE WHEN earned_date IS NOT NULL THEN 0 ELSE 1 END,
        earned_date DESC,
        category,
        title
    `);

    res.json(achievements);
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

/**
 * GET /api/engagement/milestones
 * Get program milestones
 */
router.get('/milestones', async (req, res) => {
  try {
    const db = await getDatabase();

    // Get current week
    const settings = await db.get(`
      SELECT current_week FROM user_settings WHERE id = 1
    `);
    const currentWeek = settings?.current_week || 0;

    const milestones = await db.all(`
      SELECT
        id, week, title, description, type,
        completed, completed_date, celebration_shown
      FROM milestones
      ORDER BY week
    `);

    res.json({
      milestones,
      currentWeek
    });
  } catch (error) {
    console.error('Error getting milestones:', error);
    res.status(500).json({ error: 'Failed to get milestones' });
  }
});

/**
 * POST /api/engagement/milestones/:id/complete
 * Mark a milestone as completed
 */
router.post('/milestones/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run(`
      UPDATE milestones
      SET completed = 1, completed_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `, id);

    res.json({ success: true, message: 'Milestone marked as completed' });
  } catch (error) {
    console.error('Error marking milestone as completed:', error);
    res.status(500).json({ error: 'Failed to mark milestone as completed' });
  }
});

/**
 * POST /api/engagement/milestones/:id/celebration-shown
 * Mark milestone celebration as shown
 */
router.post('/milestones/:id/celebration-shown', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run(`
      UPDATE milestones
      SET celebration_shown = 1
      WHERE id = ?
    `, id);

    res.json({ success: true, message: 'Celebration marked as shown' });
  } catch (error) {
    console.error('Error marking celebration as shown:', error);
    res.status(500).json({ error: 'Failed to mark celebration as shown' });
  }
});

/**
 * GET /api/engagement/nudges
 * Get active nudges for the user
 */
router.get('/nudges', async (req, res) => {
  try {
    const db = await getDatabase();

    // Get active nudges (not dismissed and created in last 7 days)
    const nudges = await db.all(`
      SELECT
        id, type, title, message, action_text, action_url,
        priority, dismissed, created_at
      FROM nudges
      WHERE dismissed = 0
        AND date(created_at) >= date('now', '-7 days')
      ORDER BY
        CASE priority
          WHEN 'high' THEN 3
          WHEN 'medium' THEN 2
          ELSE 1
        END DESC,
        created_at DESC
      LIMIT 5
    `);

    res.json(nudges);
  } catch (error) {
    console.error('Error getting nudges:', error);
    res.status(500).json({ error: 'Failed to get nudges' });
  }
});

/**
 * POST /api/engagement/nudges
 * Create a new nudge
 */
router.post('/nudges', async (req, res) => {
  try {
    const { type, title, message, action_text, action_url, priority } = req.body;
    const db = await getDatabase();

    const id = `nudge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.run(`
      INSERT INTO nudges (id, type, title, message, action_text, action_url, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, type, title, message, action_text, action_url, priority]);

    res.json({ success: true, id, message: 'Nudge created successfully' });
  } catch (error) {
    console.error('Error creating nudge:', error);
    res.status(500).json({ error: 'Failed to create nudge' });
  }
});

/**
 * POST /api/engagement/nudges/:id/dismiss
 * Dismiss a nudge
 */
router.post('/nudges/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    await db.run(`
      UPDATE nudges
      SET dismissed = 1, dismissed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, id);

    res.json({ success: true, message: 'Nudge dismissed successfully' });
  } catch (error) {
    console.error('Error dismissing nudge:', error);
    res.status(500).json({ error: 'Failed to dismiss nudge' });
  }
});

/**
 * GET /api/engagement/dashboard
 * Get engagement dashboard summary
 */
router.get('/dashboard', async (req, res) => {
  try {
    const db = await getDatabase();

    // Get streaks
    const streaks = await db.all(`
      SELECT type, current_streak, longest_streak, last_activity_date
      FROM streaks
    `);

    // Get recent achievements (earned in last 7 days)
    const recentAchievements = await db.all(`
      SELECT id, title, description, badge_icon, earned_date
      FROM achievements
      WHERE earned_date IS NOT NULL
        AND date(earned_date) >= date('now', '-7 days')
      ORDER BY earned_date DESC
      LIMIT 3
    `);

    // Get achievement counts
    const achievementCounts = await db.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN earned_date IS NOT NULL THEN 1 ELSE 0 END) as earned
      FROM achievements
    `);

    // Get current week and next milestone
    const settings = await db.get(`
      SELECT current_week FROM user_settings WHERE id = 1
    `);
    const currentWeek = settings?.current_week || 0;

    const nextMilestone = await db.get(`
      SELECT id, week, title, description
      FROM milestones
      WHERE completed = 0 AND week > ?
      ORDER BY week
      LIMIT 1
    `, currentWeek);

    // Get active nudges count
    const activeNudgesCount = await db.get(`
      SELECT COUNT(*) as count
      FROM nudges
      WHERE dismissed = 0
        AND date(created_at) >= date('now', '-7 days')
    `);

    res.json({
      streaks,
      recentAchievements,
      achievementCounts,
      currentWeek,
      nextMilestone,
      activeNudgesCount: activeNudgesCount?.count || 0
    });
  } catch (error) {
    console.error('Error getting engagement dashboard:', error);
    res.status(500).json({ error: 'Failed to get engagement dashboard' });
  }
});

/**
 * POST /api/engagement/check-achievements
 * Manually trigger achievement checking
 */
router.post('/check-achievements', async (req, res) => {
  try {
    await checkAndAwardAchievements();
    res.json({ success: true, message: 'Achievement check completed' });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

export default router;