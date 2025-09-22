import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { PostponementLog } from '../types';
import { format } from 'date-fns';
import { FidelityGuard } from '../middleware/fidelityGuard';
import { metricsService } from '../services/metrics';

const router = Router();

// Get all postponement logs
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { start, end } = req.query;

    let query = 'SELECT * FROM postponement_logs';
    const params: any[] = [];

    if (start && end) {
      query += ' WHERE date BETWEEN ? AND ?';
      params.push(start, end);
    }

    query += ' ORDER BY date DESC, trigger_time DESC';

    const logs = await db.all<PostponementLog[]>(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching postponement logs:', error);
    res.status(500).json({ error: 'Failed to fetch postponement logs' });
  }
});

// Get today's postponement logs
router.get('/today', async (req, res) => {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    const logs = await db.all<PostponementLog[]>(
      'SELECT * FROM postponement_logs WHERE date = ? ORDER BY trigger_time',
      today
    );

    res.json(logs);
  } catch (error) {
    console.error('Error fetching today\'s postponement logs:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s postponement logs' });
  }
});

// Create postponement log
router.post('/',
  FidelityGuard.crisisDetection(),
  FidelityGuard.blockContentAnalysis(),
  FidelityGuard.blockReassuranceSeeking(),
  FidelityGuard.validateProcessFocus(),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const log: PostponementLog = req.body;

    const date = log.date || format(new Date(), 'yyyy-MM-dd');

    const result = await db.run(
      `INSERT INTO postponement_logs (
        date, trigger_time, scheduled_time,
        urge_before, urge_after, processed,
        processing_duration_minutes, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        log.trigger_time,
        log.scheduled_time,
        log.urge_before,
        log.urge_after,
        log.processed ? 1 : 0,
        log.processing_duration_minutes,
        log.notes
      ]
    );

    // Log practice completion to metrics service if processed
    if (log.processed) {
      await metricsService.logPracticeCompletion('postponement', {
        urge_before: log.urge_before,
        urge_after: log.urge_after,
        processing_duration_minutes: log.processing_duration_minutes
      });
    }

    const newLog = await db.get<PostponementLog>(
      'SELECT * FROM postponement_logs WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating postponement log:', error);
    res.status(500).json({ error: 'Failed to create postponement log' });
  }
});

// Update postponement log
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const updates = req.body;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await db.run(
      `UPDATE postponement_logs SET ${setClause} WHERE id = ?`,
      [...values, req.params.id]
    );

    const updatedLog = await db.get<PostponementLog>(
      'SELECT * FROM postponement_logs WHERE id = ?',
      req.params.id
    );

    res.json(updatedLog);
  } catch (error) {
    console.error('Error updating postponement log:', error);
    res.status(500).json({ error: 'Failed to update postponement log' });
  }
});

// Process postponement
router.post('/:id/process',
  FidelityGuard.crisisDetection(),
  FidelityGuard.blockContentAnalysis(),
  FidelityGuard.blockReassuranceSeeking(),
  FidelityGuard.validateProcessFocus(),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const { urge_after, processing_duration_minutes, notes } = req.body;

    await db.run(
      `UPDATE postponement_logs SET
       processed = 1,
       urge_after = ?,
       processing_duration_minutes = ?,
       notes = ?
       WHERE id = ?`,
      [urge_after, processing_duration_minutes, notes, req.params.id]
    );

    // Log practice completion to metrics service when processed
    await metricsService.logPracticeCompletion('postponement', {
      urge_before: req.body.urge_before || 0,
      urge_after: urge_after,
      processing_duration_minutes
    });

    const updatedLog = await db.get<PostponementLog>(
      'SELECT * FROM postponement_logs WHERE id = ?',
      req.params.id
    );

    res.json(updatedLog);
  } catch (error) {
    console.error('Error processing postponement:', error);
    res.status(500).json({ error: 'Failed to process postponement' });
  }
});

// Get postponement success rate
router.get('/success-rate', async (req, res) => {
  try {
    const db = await getDatabase();
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const totalLogs = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM postponement_logs WHERE date >= ?',
      format(startDate, 'yyyy-MM-dd')
    );

    const processedLogs = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM postponement_logs WHERE date >= ? AND processed = 1',
      format(startDate, 'yyyy-MM-dd')
    );

    const avgUrgeDelta = await db.get<{ avg: number }>(
      `SELECT AVG(urge_before - urge_after) as avg
       FROM postponement_logs
       WHERE date >= ? AND processed = 1 AND urge_after IS NOT NULL`,
      format(startDate, 'yyyy-MM-dd')
    );

    const successRate = totalLogs?.count
      ? Math.round((processedLogs?.count || 0) / totalLogs.count * 100)
      : 0;

    res.json({
      totalLogs: totalLogs?.count || 0,
      processedLogs: processedLogs?.count || 0,
      successRate,
      avgUrgeReduction: Math.round(avgUrgeDelta?.avg || 0)
    });
  } catch (error) {
    console.error('Error calculating postponement success rate:', error);
    res.status(500).json({ error: 'Failed to calculate postponement success rate' });
  }
});

export default router;