import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { CASLog } from '../types';
import { format } from 'date-fns';
import { FidelityGuard } from '../middleware/fidelityGuard';
import { metricsService } from '../services/metrics';

const router = Router();

// Get all CAS logs
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { start, end } = req.query;

    let query = 'SELECT * FROM cas_logs';
    const params: any[] = [];

    if (start && end) {
      query += ' WHERE date BETWEEN ? AND ?';
      params.push(start, end);
    }

    query += ' ORDER BY date DESC';

    const logs = await db.all<CASLog[]>(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching CAS logs:', error);
    res.status(500).json({ error: 'Failed to fetch CAS logs' });
  }
});

// Get today's CAS log
router.get('/today', async (req, res) => {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    const log = await db.get<CASLog>(
      'SELECT * FROM cas_logs WHERE date = ?',
      today
    );

    res.json(log || null);
  } catch (error) {
    console.error('Error fetching today\'s CAS log:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s CAS log' });
  }
});

// Get CAS log by date
router.get('/date/:date', async (req, res) => {
  try {
    const db = await getDatabase();
    const log = await db.get<CASLog>(
      'SELECT * FROM cas_logs WHERE date = ?',
      req.params.date
    );

    if (!log) {
      return res.status(404).json({ error: 'CAS log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching CAS log:', error);
    res.status(500).json({ error: 'Failed to fetch CAS log' });
  }
});

// Create or update CAS log
router.post('/',
  FidelityGuard.crisisDetection(),
  FidelityGuard.blockContentAnalysis(),
  FidelityGuard.blockReassuranceSeeking(),
  FidelityGuard.validateProcessFocus(),
  FidelityGuard.logFidelityMetrics(),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const log: CASLog = req.body;

    // Use today's date if not provided
    const date = log.date || format(new Date(), 'yyyy-MM-dd');

    // Check if log exists for this date
    const existing = await db.get<CASLog>(
      'SELECT * FROM cas_logs WHERE date = ?',
      date
    );

    if (existing) {
      // Update existing log
      await db.run(
        `UPDATE cas_logs SET
         worry_minutes = ?,
         rumination_minutes = ?,
         monitoring_count = ?,
         checking_count = ?,
         reassurance_count = ?,
         avoidance_count = ?,
         notes = ?
         WHERE date = ?`,
        [
          log.worry_minutes,
          log.rumination_minutes,
          log.monitoring_count,
          log.checking_count,
          log.reassurance_count,
          log.avoidance_count,
          log.notes,
          date
        ]
      );
    } else {
      // Create new log
      await db.run(
        `INSERT INTO cas_logs (
          date, worry_minutes, rumination_minutes,
          monitoring_count, checking_count, reassurance_count,
          avoidance_count, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          date,
          log.worry_minutes,
          log.rumination_minutes,
          log.monitoring_count,
          log.checking_count,
          log.reassurance_count,
          log.avoidance_count,
          log.notes
        ]
      );
    }

    // Update logging streak
    await updateLoggingStreak(db);

    // Log CAS data to metrics service for automatic tracking
    await metricsService.logCASFromExercise({
      worry_minutes: log.worry_minutes,
      rumination_minutes: log.rumination_minutes,
      monitoring_count: log.monitoring_count,
      checking_count: log.checking_count,
      reassurance_count: log.reassurance_count,
      avoidance_count: log.avoidance_count,
      notes: log.notes
    });

    const updatedLog = await db.get<CASLog>(
      'SELECT * FROM cas_logs WHERE date = ?',
      date
    );

    res.json(updatedLog);
  } catch (error) {
    console.error('Error saving CAS log:', error);
    res.status(500).json({ error: 'Failed to save CAS log' });
  }
});

async function updateLoggingStreak(db: any) {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Get current streak
  const streak = await db.get(
    'SELECT * FROM streaks WHERE type = ?',
    'logging'
  );

  const lastDate = streak?.last_activity_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

  let currentStreak = streak?.current_streak || 0;

  if (lastDate === yesterdayStr) {
    // Continue streak
    currentStreak++;
  } else if (lastDate !== today) {
    // Reset streak
    currentStreak = 1;
  }

  const longestStreak = Math.max(currentStreak, streak?.longest_streak || 0);

  await db.run(
    `UPDATE streaks SET
     current_streak = ?,
     longest_streak = ?,
     last_activity_date = ?
     WHERE type = ?`,
    [currentStreak, longestStreak, today, 'logging']
  );
}

export default router;