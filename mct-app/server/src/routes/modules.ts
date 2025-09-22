import { Router, Request, Response } from 'express';
import { getDatabase } from '../utils/database';

const router = Router();

// Get all modules
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const modules = await db.all(`
      SELECT
        module_id,
        week_number,
        title,
        description,
        learning_objectives,
        key_concepts,
        exercises,
        content,
        is_locked,
        completion_percentage
      FROM program_modules
      ORDER BY week_number ASC
    `);

    // Parse JSON fields
    const parsedModules = modules.map(module => ({
      ...module,
      learning_objectives: JSON.parse(module.learning_objectives || '[]'),
      key_concepts: JSON.parse(module.key_concepts || '[]'),
      exercises: JSON.parse(module.exercises || '[]'),
      content: JSON.parse(module.content || '{}'),
      is_locked: module.is_locked === 1,
      completion_percentage: module.completion_percentage || 0
    }));

    res.json(parsedModules);
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get specific module by week number
router.get('/week/:weekNumber', async (req: Request, res: Response) => {
  try {
    const { weekNumber } = req.params;
    const db = await getDatabase();

    const module = await db.get(`
      SELECT
        module_id,
        week_number,
        title,
        description,
        learning_objectives,
        key_concepts,
        exercises,
        content,
        is_locked,
        completion_percentage
      FROM program_modules
      WHERE week_number = ?
    `, [weekNumber]);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Parse JSON fields
    const parsedModule = {
      ...module,
      learning_objectives: JSON.parse(module.learning_objectives || '[]'),
      key_concepts: JSON.parse(module.key_concepts || '[]'),
      exercises: JSON.parse(module.exercises || '[]'),
      content: JSON.parse(module.content || '{}'),
      is_locked: module.is_locked === 1,
      completion_percentage: module.completion_percentage || 0
    };

    res.json(parsedModule);
  } catch (error) {
    console.error('Failed to fetch module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Get current week's module
router.get('/current', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();

    // Get user's current week from settings
    const settings = await db.get(`
      SELECT current_week FROM user_settings WHERE user_id = 1
    `);

    const currentWeek = settings?.current_week || 0;

    const module = await db.get(`
      SELECT
        module_id,
        week_number,
        title,
        description,
        learning_objectives,
        key_concepts,
        exercises,
        content,
        is_locked,
        completion_percentage
      FROM program_modules
      WHERE week_number = ?
    `, [currentWeek]);

    if (!module) {
      return res.status(404).json({ error: 'Current module not found' });
    }

    // Parse JSON fields
    const parsedModule = {
      ...module,
      learning_objectives: JSON.parse(module.learning_objectives || '[]'),
      key_concepts: JSON.parse(module.key_concepts || '[]'),
      exercises: JSON.parse(module.exercises || '[]'),
      content: JSON.parse(module.content || '{}'),
      is_locked: module.is_locked === 1,
      completion_percentage: module.completion_percentage || 0
    };

    res.json(parsedModule);
  } catch (error) {
    console.error('Failed to fetch current module:', error);
    res.status(500).json({ error: 'Failed to fetch current module' });
  }
});

// Unlock next module
router.post('/unlock-next', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();

    // Get current week
    const settings = await db.get(`
      SELECT current_week FROM user_settings WHERE user_id = 1
    `);

    const currentWeek = settings?.current_week || 0;
    const nextWeek = currentWeek + 1;

    // Check if next week exists
    const nextModule = await db.get(`
      SELECT module_id FROM program_modules WHERE week_number = ?
    `, [nextWeek]);

    if (!nextModule) {
      return res.status(400).json({ error: 'No more modules to unlock' });
    }

    // Unlock next module
    await db.run(`
      UPDATE program_modules
      SET is_locked = 0
      WHERE week_number = ?
    `, [nextWeek]);

    // Update current week
    await db.run(`
      UPDATE user_settings
      SET current_week = ?
      WHERE user_id = 1
    `, [nextWeek]);

    res.status(200).json({
      message: 'Next module unlocked',
      currentWeek: nextWeek
    });
  } catch (error) {
    console.error('Failed to unlock next module:', error);
    res.status(500).json({ error: 'Failed to unlock next module' });
  }
});

// Update module completion
router.put('/:moduleId/completion', async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const { completionPercentage } = req.body;

    const db = await getDatabase();

    await db.run(`
      UPDATE program_modules
      SET completion_percentage = ?,
          updated_at = datetime('now')
      WHERE module_id = ?
    `, [completionPercentage, moduleId]);

    res.status(200).json({
      message: 'Module completion updated',
      completionPercentage
    });
  } catch (error) {
    console.error('Failed to update module completion:', error);
    res.status(500).json({ error: 'Failed to update module completion' });
  }
});

export default router;