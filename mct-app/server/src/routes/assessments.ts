import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { Assessment } from '../types';

const router = Router();

// Get all assessments
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const assessments = await db.all<Assessment[]>(
      'SELECT * FROM assessments ORDER BY created_at DESC'
    );

    const parsedAssessments = assessments.map(a => ({
      ...a,
      triggers: a.triggers ? JSON.parse(a.triggers as any) : [],
      goals: a.goals ? JSON.parse(a.goals as any) : []
    }));

    res.json(parsedAssessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get specific assessment
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const assessment = await db.get<Assessment>(
      'SELECT * FROM assessments WHERE id = ?',
      req.params.id
    );

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({
      ...assessment,
      triggers: assessment.triggers ? JSON.parse(assessment.triggers as any) : [],
      goals: assessment.goals ? JSON.parse(assessment.goals as any) : []
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Get latest assessment by type
router.get('/type/:type', async (req, res) => {
  try {
    const db = await getDatabase();
    const assessment = await db.get<Assessment>(
      'SELECT * FROM assessments WHERE assessment_type = ? ORDER BY created_at DESC LIMIT 1',
      req.params.type
    );

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({
      ...assessment,
      triggers: assessment.triggers ? JSON.parse(assessment.triggers as any) : [],
      goals: assessment.goals ? JSON.parse(assessment.goals as any) : []
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Create new assessment
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const assessment: Assessment = req.body;

    const result = await db.run(
      `INSERT INTO assessments (
        assessment_type, worry_baseline, rumination_baseline,
        monitoring_baseline, uncontrollability_belief, danger_belief,
        positive_belief, triggers, goals
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assessment.assessment_type,
        assessment.worry_baseline,
        assessment.rumination_baseline,
        assessment.monitoring_baseline,
        assessment.uncontrollability_belief,
        assessment.danger_belief,
        assessment.positive_belief,
        JSON.stringify(assessment.triggers || []),
        JSON.stringify(assessment.goals || [])
      ]
    );

    const newAssessment = await db.get<Assessment>(
      'SELECT * FROM assessments WHERE id = ?',
      result.lastID
    );

    res.status(201).json({
      ...newAssessment,
      triggers: newAssessment!.triggers ? JSON.parse(newAssessment!.triggers as any) : [],
      goals: newAssessment!.goals ? JSON.parse(newAssessment!.goals as any) : []
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

export default router;