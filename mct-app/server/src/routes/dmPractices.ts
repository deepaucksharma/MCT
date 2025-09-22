import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { DMPractice } from '../types';
import { format } from 'date-fns';
import { FidelityGuard } from '../middleware/fidelityGuard';
import { metricsService } from '../services/metrics';

const router = Router();

// Get all DM practices
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { start, end, limit } = req.query;

    let query = 'SELECT * FROM dm_practices';
    const params: any[] = [];

    if (start && end) {
      query += ' WHERE date BETWEEN ? AND ?';
      params.push(start, end);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
    }

    const practices = await db.all<DMPractice[]>(query, params);
    res.json(practices);
  } catch (error) {
    console.error('Error fetching DM practices:', error);
    res.status(500).json({ error: 'Failed to fetch DM practices' });
  }
});

// Get today's DM practices
router.get('/today', async (req, res) => {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    const practices = await db.all<DMPractice[]>(
      'SELECT * FROM dm_practices WHERE date = ? ORDER BY created_at',
      today
    );

    res.json(practices);
  } catch (error) {
    console.error('Error fetching today\'s DM practices:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s DM practices' });
  }
});

// Create DM practice
router.post('/',
  FidelityGuard.crisisDetection(),
  FidelityGuard.logFidelityMetrics(),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const practice: DMPractice = req.body;

    const date = practice.date || format(new Date(), 'yyyy-MM-dd');

    const result = await db.run(
      `INSERT INTO dm_practices (
        date, time_of_day, duration_seconds,
        engaged_vs_watched, confidence_rating, metaphor_used
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        date,
        practice.time_of_day,
        practice.duration_seconds,
        practice.engaged_vs_watched,
        practice.confidence_rating,
        practice.metaphor_used || null
      ]
    );

    // Update DM streak
    await updateDMStreak(db);

    // Log practice completion to metrics service
    await metricsService.logPracticeCompletion('dm', {
      time_of_day: practice.time_of_day,
      duration_seconds: practice.duration_seconds,
      engaged_vs_watched: practice.engaged_vs_watched,
      confidence_rating: practice.confidence_rating
    });

    const newPractice = await db.get<DMPractice>(
      'SELECT * FROM dm_practices WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newPractice);
  } catch (error) {
    console.error('Error creating DM practice:', error);
    res.status(500).json({ error: 'Failed to create DM practice' });
  }
});

// Get weekly DM count
router.get('/weekly-count', async (req, res) => {
  try {
    const db = await getDatabase();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM dm_practices
       WHERE date >= ?`,
      format(weekAgo, 'yyyy-MM-dd')
    );

    res.json({ count: result?.count || 0 });
  } catch (error) {
    console.error('Error calculating weekly DM count:', error);
    res.status(500).json({ error: 'Failed to calculate weekly DM count' });
  }
});

// Get DM practice stats
router.get('/stats', async (req, res) => {
  try {
    const db = await getDatabase();

    const totalPractices = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dm_practices'
    );

    const avgConfidence = await db.get<{ avg: number }>(
      'SELECT AVG(confidence_rating) as avg FROM dm_practices'
    );

    const engagedCount = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dm_practices WHERE engaged_vs_watched = ?',
      'engaged'
    );

    res.json({
      total: totalPractices?.count || 0,
      avgConfidence: Math.round(avgConfidence?.avg || 0),
      engagementRate: totalPractices?.count
        ? Math.round((engagedCount?.count || 0) / totalPractices.count * 100)
        : 0
    });
  } catch (error) {
    console.error('Error fetching DM practice stats:', error);
    res.status(500).json({ error: 'Failed to fetch DM practice stats' });
  }
});

async function updateDMStreak(db: any) {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Check if we have at least 3 DM practices today
  const todayCount = await db.get(
    'SELECT COUNT(*) as count FROM dm_practices WHERE date = ?',
    today
  ) as { count: number } | undefined;

  if ((todayCount?.count || 0) >= 3) {
    const streak = await db.get(
      'SELECT * FROM streaks WHERE type = ?',
      'dm'
    );

    const lastDate = streak?.last_activity_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

    let currentStreak = streak?.current_streak || 0;

    if (lastDate === yesterdayStr) {
      currentStreak++;
    } else if (lastDate !== today) {
      currentStreak = 1;
    }

    const longestStreak = Math.max(currentStreak, streak?.longest_streak || 0);

    await db.run(
      `UPDATE streaks SET
       current_streak = ?,
       longest_streak = ?,
       last_activity_date = ?
       WHERE type = ?`,
      [currentStreak, longestStreak, today, 'dm']
    );
  }
}

export default router;