import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { UserSettings } from '../types';

const router = Router();

// Get user settings
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = await db.get<UserSettings>(
      'SELECT * FROM user_settings WHERE id = 1'
    );

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Parse JSON fields
    const parsedSettings = {
      ...settings,
      dm_reminder_times: JSON.parse(settings.dm_reminder_times as any)
    };

    res.json(parsedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const updates = req.body;

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    // Handle array fields
    if (updates.dm_reminder_times && Array.isArray(updates.dm_reminder_times)) {
      const index = fields.indexOf('dm_reminder_times');
      values[index] = JSON.stringify(updates.dm_reminder_times);
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await db.run(
      `UPDATE user_settings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      values
    );

    const updatedSettings = await db.get<UserSettings>(
      'SELECT * FROM user_settings WHERE id = 1'
    );

    res.json({
      ...updatedSettings,
      dm_reminder_times: JSON.parse(updatedSettings!.dm_reminder_times as any)
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Complete onboarding
router.post('/complete-onboarding', async (req, res) => {
  try {
    const db = await getDatabase();

    await db.run(
      `UPDATE user_settings
       SET onboarding_completed = 1,
           onboarding_date = datetime('now'),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;