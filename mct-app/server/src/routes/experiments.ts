import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { Experiment } from '../types';
import { FidelityGuard } from '../middleware/fidelityGuard';
import { EXPERIMENT_TEMPLATES } from '../data/experimentTemplates';

const router = Router();

// Get experiment templates
router.get('/templates', (req, res) => {
  try {
    const { week, difficulty } = req.query;
    let templates = EXPERIMENT_TEMPLATES;

    if (week) {
      templates = templates.filter(t => t.recommended_week === parseInt(week as string));
    }

    if (difficulty) {
      templates = templates.filter(t => t.difficulty_level === difficulty);
    }

    res.json(templates);
  } catch (error) {
    console.error('Error fetching experiment templates:', error);
    res.status(500).json({ error: 'Failed to fetch experiment templates' });
  }
});

// Get specific experiment template
router.get('/templates/:id', (req, res) => {
  try {
    const template = EXPERIMENT_TEMPLATES.find(t => t.id === req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error fetching experiment template:', error);
    res.status(500).json({ error: 'Failed to fetch experiment template' });
  }
});

// Get all experiments
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { status, week } = req.query;

    let query = 'SELECT * FROM experiments';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (week) {
      conditions.push('week_number = ?');
      params.push(parseInt(week as string));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const experiments = await db.all<Experiment[]>(query, params);

    const parsedExperiments = experiments.map(e => ({
      ...e,
      safety_behaviors_dropped: e.safety_behaviors_dropped
        ? JSON.parse(e.safety_behaviors_dropped as any)
        : [],
      protocol_steps: e.protocol_steps ? JSON.parse(e.protocol_steps as any) : [],
      metrics: e.metrics ? JSON.parse(e.metrics as any) : []
    }));

    res.json(parsedExperiments);
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

// Get specific experiment
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const experiment = await db.get<Experiment>(
      'SELECT * FROM experiments WHERE id = ?',
      req.params.id
    );

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({
      ...experiment,
      safety_behaviors_dropped: experiment.safety_behaviors_dropped
        ? JSON.parse(experiment.safety_behaviors_dropped as any)
        : [],
      protocol_steps: experiment.protocol_steps ? JSON.parse(experiment.protocol_steps as any) : [],
      metrics: experiment.metrics ? JSON.parse(experiment.metrics as any) : []
    });
  } catch (error) {
    console.error('Error fetching experiment:', error);
    res.status(500).json({ error: 'Failed to fetch experiment' });
  }
});

// Create experiment
router.post('/',
  FidelityGuard.crisisDetection(),
  FidelityGuard.blockContentAnalysis(),
  FidelityGuard.blockReassuranceSeeking(),
  FidelityGuard.validateProcessFocus(),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const experiment: Experiment = req.body;

    const result = await db.run(
      `INSERT INTO experiments (
        template_id, week_number, belief_tested, prediction,
        safety_behaviors_dropped, protocol_steps, metrics,
        status, belief_rating_before, started_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        experiment.template_id || null,
        experiment.week_number,
        experiment.belief_tested,
        experiment.prediction,
        JSON.stringify(experiment.safety_behaviors_dropped || []),
        JSON.stringify(experiment.protocol_steps || []),
        JSON.stringify(experiment.metrics || []),
        experiment.status || 'planned',
        experiment.belief_rating_before,
        experiment.started_at || null
      ]
    );

    const newExperiment = await db.get<Experiment>(
      'SELECT * FROM experiments WHERE id = ?',
      result.lastID
    );

    res.status(201).json({
      ...newExperiment,
      safety_behaviors_dropped: newExperiment!.safety_behaviors_dropped
        ? JSON.parse(newExperiment!.safety_behaviors_dropped as any)
        : [],
      protocol_steps: newExperiment!.protocol_steps
        ? JSON.parse(newExperiment!.protocol_steps as any)
        : [],
      metrics: newExperiment!.metrics
        ? JSON.parse(newExperiment!.metrics as any)
        : []
    });
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({ error: 'Failed to create experiment' });
  }
});

// Update experiment
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const updates = req.body;

    // Handle array fields
    if (updates.safety_behaviors_dropped) {
      updates.safety_behaviors_dropped = JSON.stringify(updates.safety_behaviors_dropped);
    }
    if (updates.protocol_steps) {
      updates.protocol_steps = JSON.stringify(updates.protocol_steps);
    }
    if (updates.metrics) {
      updates.metrics = JSON.stringify(updates.metrics);
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await db.run(
      `UPDATE experiments SET ${setClause} WHERE id = ?`,
      [...values, req.params.id]
    );

    const updatedExperiment = await db.get<Experiment>(
      'SELECT * FROM experiments WHERE id = ?',
      req.params.id
    );

    res.json({
      ...updatedExperiment,
      safety_behaviors_dropped: updatedExperiment!.safety_behaviors_dropped
        ? JSON.parse(updatedExperiment!.safety_behaviors_dropped as any)
        : [],
      protocol_steps: updatedExperiment!.protocol_steps
        ? JSON.parse(updatedExperiment!.protocol_steps as any)
        : [],
      metrics: updatedExperiment!.metrics
        ? JSON.parse(updatedExperiment!.metrics as any)
        : []
    });
  } catch (error) {
    console.error('Error updating experiment:', error);
    res.status(500).json({ error: 'Failed to update experiment' });
  }
});

// Complete experiment
router.post('/:id/complete',
  FidelityGuard.crisisDetection(),
  FidelityGuard.blockContentAnalysis(),
  FidelityGuard.blockReassuranceSeeking(),
  FidelityGuard.validateProcessFocus(),
  async (req, res) => {
  try {
    const db = await getDatabase();
    const { outcome, learning, belief_rating_after } = req.body;

    await db.run(
      `UPDATE experiments SET
       status = 'completed',
       outcome = ?,
       learning = ?,
       belief_rating_after = ?,
       completed_at = datetime('now')
       WHERE id = ?`,
      [outcome, learning, belief_rating_after, req.params.id]
    );

    const updatedExperiment = await db.get<Experiment>(
      'SELECT * FROM experiments WHERE id = ?',
      req.params.id
    );

    res.json({
      ...updatedExperiment,
      safety_behaviors_dropped: updatedExperiment!.safety_behaviors_dropped
        ? JSON.parse(updatedExperiment!.safety_behaviors_dropped as any)
        : [],
      protocol_steps: updatedExperiment!.protocol_steps
        ? JSON.parse(updatedExperiment!.protocol_steps as any)
        : [],
      metrics: updatedExperiment!.metrics
        ? JSON.parse(updatedExperiment!.metrics as any)
        : []
    });
  } catch (error) {
    console.error('Error completing experiment:', error);
    res.status(500).json({ error: 'Failed to complete experiment' });
  }
});

// Create experiment session
router.post('/:id/sessions', async (req, res) => {
  try {
    const db = await getDatabase();
    const { session_date, session_number, data, notes } = req.body;

    const result = await db.run(
      `INSERT INTO experiment_sessions (
        experiment_id, session_date, session_number, data, notes
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        req.params.id,
        session_date,
        session_number,
        JSON.stringify(data || {}),
        notes || null
      ]
    );

    const newSession = await db.get(
      'SELECT * FROM experiment_sessions WHERE id = ?',
      result.lastID
    );

    res.status(201).json({
      ...newSession,
      data: newSession!.data ? JSON.parse(newSession!.data as any) : {}
    });
  } catch (error) {
    console.error('Error creating experiment session:', error);
    res.status(500).json({ error: 'Failed to create experiment session' });
  }
});

// Get experiment sessions
router.get('/:id/sessions', async (req, res) => {
  try {
    const db = await getDatabase();
    const sessions = await db.all(
      'SELECT * FROM experiment_sessions WHERE experiment_id = ? ORDER BY session_number',
      req.params.id
    );

    const parsedSessions = sessions.map(s => ({
      ...s,
      data: s.data ? JSON.parse(s.data as any) : {}
    }));

    res.json(parsedSessions);
  } catch (error) {
    console.error('Error fetching experiment sessions:', error);
    res.status(500).json({ error: 'Failed to fetch experiment sessions' });
  }
});

// Update experiment session
router.put('/:id/sessions/:sessionId', async (req, res) => {
  try {
    const db = await getDatabase();
    const updates = req.body;

    if (updates.data) {
      updates.data = JSON.stringify(updates.data);
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await db.run(
      `UPDATE experiment_sessions SET ${setClause} WHERE id = ? AND experiment_id = ?`,
      [...values, req.params.sessionId, req.params.id]
    );

    const updatedSession = await db.get(
      'SELECT * FROM experiment_sessions WHERE id = ? AND experiment_id = ?',
      [req.params.sessionId, req.params.id]
    );

    res.json({
      ...updatedSession,
      data: updatedSession!.data ? JSON.parse(updatedSession!.data as any) : {}
    });
  } catch (error) {
    console.error('Error updating experiment session:', error);
    res.status(500).json({ error: 'Failed to update experiment session' });
  }
});

export default router;