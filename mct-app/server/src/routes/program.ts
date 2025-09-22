import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { ProgramModule } from '../types';

const router = Router();

// Get all program modules
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const modules = await db.all<ProgramModule[]>(
      'SELECT * FROM program_modules ORDER BY week_number'
    );

    const parsedModules = modules.map(m => ({
      ...m,
      key_points: JSON.parse(m.key_points as any),
      exercises: JSON.parse(m.exercises as any)
    }));

    res.json(parsedModules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get specific module
router.get('/week/:week', async (req, res) => {
  try {
    const db = await getDatabase();
    const module = await db.get<ProgramModule>(
      'SELECT * FROM program_modules WHERE week_number = ?',
      req.params.week
    );

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({
      ...module,
      key_points: JSON.parse(module.key_points as any),
      exercises: JSON.parse(module.exercises as any)
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Unlock module
router.post('/week/:week/unlock', async (req, res) => {
  try {
    const db = await getDatabase();
    const weekNumber = parseInt(req.params.week);

    // Check if previous week is completed (except for week 0)
    if (weekNumber > 0) {
      const previousWeek = await db.get<ProgramModule>(
        'SELECT completed FROM program_modules WHERE week_number = ?',
        weekNumber - 1
      );

      if (!previousWeek?.completed) {
        // Check if minimum criteria met
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const attCount = await db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM att_sessions
           WHERE date >= ? AND completed = 1`,
          lastWeek.toISOString().split('T')[0]
        );

        const dmCount = await db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM dm_practices
           WHERE date >= ?`,
          lastWeek.toISOString().split('T')[0]
        );

        if ((attCount?.count || 0) < 3 || (dmCount?.count || 0) < 6) {
          return res.status(400).json({
            error: 'Previous week not completed or minimum criteria not met'
          });
        }
      }
    }

    await db.run(
      `UPDATE program_modules
       SET unlocked = 1, unlocked_date = datetime('now')
       WHERE week_number = ?`,
      weekNumber
    );

    // Update current week in settings
    await db.run(
      'UPDATE user_settings SET current_week = ? WHERE id = 1',
      weekNumber
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error unlocking module:', error);
    res.status(500).json({ error: 'Failed to unlock module' });
  }
});

// Complete module
router.post('/week/:week/complete', async (req, res) => {
  try {
    const db = await getDatabase();

    await db.run(
      `UPDATE program_modules
       SET completed = 1, completed_date = datetime('now')
       WHERE week_number = ?`,
      req.params.week
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({ error: 'Failed to complete module' });
  }
});

export default router;