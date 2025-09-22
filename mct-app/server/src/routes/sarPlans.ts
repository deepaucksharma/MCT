import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { SARPlan } from '../types';

const router = Router();

// Get all SAR plans
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { active } = req.query;

    let query = 'SELECT * FROM sar_plans';

    if (active !== undefined) {
      query += ' WHERE active = ?';
    }

    query += ' ORDER BY created_at DESC';

    const plans = await db.all<SARPlan[]>(
      query,
      active !== undefined ? [active === 'true' ? 1 : 0] : []
    );

    res.json(plans);
  } catch (error) {
    console.error('Error fetching SAR plans:', error);
    res.status(500).json({ error: 'Failed to fetch SAR plans' });
  }
});

// Get specific SAR plan
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const plan = await db.get<SARPlan>(
      'SELECT * FROM sar_plans WHERE id = ?',
      req.params.id
    );

    if (!plan) {
      return res.status(404).json({ error: 'SAR plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching SAR plan:', error);
    res.status(500).json({ error: 'Failed to fetch SAR plan' });
  }
});

// Create SAR plan
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const plan: SARPlan = req.body;

    const result = await db.run(
      `INSERT INTO sar_plans (
        trigger_cue, if_statement, then_action,
        active, usage_count, success_rate
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        plan.trigger_cue,
        plan.if_statement,
        plan.then_action,
        plan.active ? 1 : 0,
        plan.usage_count || 0,
        plan.success_rate
      ]
    );

    const newPlan = await db.get<SARPlan>(
      'SELECT * FROM sar_plans WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating SAR plan:', error);
    res.status(500).json({ error: 'Failed to create SAR plan' });
  }
});

// Update SAR plan
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const updates = req.body;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await db.run(
      `UPDATE sar_plans SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, req.params.id]
    );

    const updatedPlan = await db.get<SARPlan>(
      'SELECT * FROM sar_plans WHERE id = ?',
      req.params.id
    );

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating SAR plan:', error);
    res.status(500).json({ error: 'Failed to update SAR plan' });
  }
});

// Delete SAR plan
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();

    await db.run('DELETE FROM sar_plans WHERE id = ?', req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting SAR plan:', error);
    res.status(500).json({ error: 'Failed to delete SAR plan' });
  }
});

// Record SAR plan usage
router.post('/:id/usage', async (req, res) => {
  try {
    const db = await getDatabase();
    const { successful } = req.body;

    // Get current plan
    const plan = await db.get<SARPlan>(
      'SELECT usage_count, success_rate FROM sar_plans WHERE id = ?',
      req.params.id
    );

    if (!plan) {
      return res.status(404).json({ error: 'SAR plan not found' });
    }

    const newUsageCount = (plan.usage_count || 0) + 1;
    const currentSuccessCount = Math.round(
      ((plan.success_rate || 0) / 100) * (plan.usage_count || 0)
    );
    const newSuccessCount = currentSuccessCount + (successful ? 1 : 0);
    const newSuccessRate = Math.round((newSuccessCount / newUsageCount) * 100);

    await db.run(
      `UPDATE sar_plans SET
       usage_count = ?,
       success_rate = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newUsageCount, newSuccessRate, req.params.id]
    );

    res.json({
      usage_count: newUsageCount,
      success_rate: newSuccessRate
    });
  } catch (error) {
    console.error('Error recording SAR plan usage:', error);
    res.status(500).json({ error: 'Failed to record SAR plan usage' });
  }
});

export default router;