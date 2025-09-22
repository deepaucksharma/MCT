import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { ATTSession } from '../types';
import { format } from 'date-fns';
import { FidelityGuard } from '../middleware/fidelityGuard';
import { metricsService } from '../services/metrics';

const router = Router();

// Get all ATT sessions
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { start, end, limit } = req.query;

    let query = 'SELECT * FROM att_sessions';
    const params: any[] = [];

    if (start && end) {
      query += ' WHERE date BETWEEN ? AND ?';
      params.push(start, end);
    }

    query += ' ORDER BY date DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit as string));
    }

    const sessions = await db.all<ATTSession[]>(query, params);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching ATT sessions:', error);
    res.status(500).json({ error: 'Failed to fetch ATT sessions' });
  }
});

// Get today's ATT session
router.get('/today', async (req, res) => {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    const session = await db.get<ATTSession>(
      'SELECT * FROM att_sessions WHERE date = ? ORDER BY created_at DESC LIMIT 1',
      today
    );

    res.json(session || null);
  } catch (error) {
    console.error('Error fetching today\'s ATT session:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s ATT session' });
  }
});

// Create ATT session
router.post('/',
  FidelityGuard.crisisDetection(),
  FidelityGuard.validateProcessFocus(),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const session: ATTSession = req.body;

    const date = session.date || format(new Date(), 'yyyy-MM-dd');

    const result = await db.run(
      `INSERT INTO att_sessions (
        date, duration_minutes, completed,
        attentional_control_rating, intrusions, intrusion_count,
        shift_ease_rating, script_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        session.duration_minutes,
        session.completed ? 1 : 0,
        session.attentional_control_rating,
        session.intrusions ? 1 : 0,
        session.intrusion_count,
        session.shift_ease_rating,
        session.script_type,
        session.notes
      ]
    );

    // Update ATT streak if completed
    if (session.completed) {
      await updateATTStreak(db);
      // Log practice completion to metrics service
      await metricsService.logPracticeCompletion('att', {
        duration_minutes: session.duration_minutes,
        attentional_control_rating: session.attentional_control_rating,
        script_type: session.script_type
      });
    }

    const newSession = await db.get<ATTSession>(
      'SELECT * FROM att_sessions WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error creating ATT session:', error);
    res.status(500).json({ error: 'Failed to create ATT session' });
  }
});

// Update ATT session
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const updates = req.body;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await db.run(
      `UPDATE att_sessions SET ${setClause} WHERE id = ?`,
      [...values, req.params.id]
    );

    const updatedSession = await db.get<ATTSession>(
      'SELECT * FROM att_sessions WHERE id = ?',
      req.params.id
    );

    res.json(updatedSession);
  } catch (error) {
    console.error('Error updating ATT session:', error);
    res.status(500).json({ error: 'Failed to update ATT session' });
  }
});

// Get weekly ATT minutes
router.get('/weekly-minutes', async (req, res) => {
  try {
    const db = await getDatabase();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await db.get<{ total: number }>(
      `SELECT SUM(duration_minutes) as total FROM att_sessions
       WHERE date >= ? AND completed = 1`,
      format(weekAgo, 'yyyy-MM-dd')
    );

    res.json({ minutes: result?.total || 0 });
  } catch (error) {
    console.error('Error calculating weekly ATT minutes:', error);
    res.status(500).json({ error: 'Failed to calculate weekly ATT minutes' });
  }
});

async function updateATTStreak(db: any) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const streak = await db.get(
    'SELECT * FROM streaks WHERE type = ?',
    'att'
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
    [currentStreak, longestStreak, today, 'att']
  );

  // Update overall streak
  await updateOverallStreak(db);
}

async function updateOverallStreak(db: any) {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Check if all main activities done today
  const attDone = await db.get(
    'SELECT * FROM att_sessions WHERE date = ? AND completed = 1',
    today
  );

  const dmDone = await db.get(
    'SELECT * FROM dm_practices WHERE date = ? LIMIT 1',
    today
  );

  const logDone = await db.get(
    'SELECT * FROM cas_logs WHERE date = ?',
    today
  );

  if (attDone && dmDone && logDone) {
    const streak = await db.get(
      'SELECT * FROM streaks WHERE type = ?',
      'overall'
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
      [currentStreak, longestStreak, today, 'overall']
    );
  }
}

export default router;