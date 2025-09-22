import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { TodayTask } from '../types';
import { format } from 'date-fns';

const router = Router();

// Get today's tasks
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');
    const tasks: TodayTask[] = [];

    // Get user settings
    const settings = await db.get<any>(
      'SELECT * FROM user_settings WHERE id = 1'
    );

    const dmReminderTimes = JSON.parse(settings?.dm_reminder_times || '[]');

    // Check if ATT is done today
    const attSession = await db.get<any>(
      'SELECT * FROM att_sessions WHERE date = ? AND completed = 1',
      today
    );

    tasks.push({
      id: 'att-' + today,
      type: 'att',
      title: 'Attention Training Technique',
      description: '12-15 minute guided audio exercise',
      scheduled_time: settings?.att_reminder_time || '20:00',
      completed: !!attSession
    });

    // Check DM practices for today
    const dmPractices = await db.all<any[]>(
      'SELECT * FROM dm_practices WHERE date = ?',
      today
    );

    // Add DM tasks for each scheduled time
    dmReminderTimes.forEach((time: string, index: number) => {
      const timeOfDay = index === 0 ? 'morning' : index === 1 ? 'midday' : 'evening';
      const completed = dmPractices.some(p => p.time_of_day === timeOfDay);

      tasks.push({
        id: `dm-${today}-${timeOfDay}`,
        type: 'dm',
        title: `Detached Mindfulness (${timeOfDay})`,
        description: '1-3 minute micro-practice',
        scheduled_time: time,
        completed
      });
    });

    // Check if CAS log is done today
    const casLog = await db.get<any>(
      'SELECT * FROM cas_logs WHERE date = ?',
      today
    );

    tasks.push({
      id: 'log-' + today,
      type: 'log',
      title: 'Daily CAS Log',
      description: 'Track worry, rumination, and monitoring',
      completed: !!casLog
    });

    // Check for active experiments
    const activeExperiments = await db.all<any[]>(
      'SELECT * FROM experiments WHERE status IN (?, ?)',
      ['planned', 'in_progress']
    );

    activeExperiments.forEach(exp => {
      tasks.push({
        id: `experiment-${exp.id}`,
        type: 'experiment',
        title: `Experiment: ${exp.belief_tested}`,
        description: exp.prediction,
        completed: false,
        data: {
          experimentId: exp.id,
          steps: JSON.parse(exp.steps)
        }
      });
    });

    // Check for postponement slot
    if (settings?.postponement_slot_start) {
      tasks.push({
        id: 'postponement-' + today,
        type: 'postponement',
        title: 'Worry/Rumination Postponement',
        description: `Scheduled slot: ${settings.postponement_slot_start} (${settings.postponement_slot_duration} min)`,
        scheduled_time: settings.postponement_slot_start,
        completed: false
      });
    }

    // Sort tasks by scheduled time
    tasks.sort((a, b) => {
      if (!a.scheduled_time) return 1;
      if (!b.scheduled_time) return -1;
      return a.scheduled_time.localeCompare(b.scheduled_time);
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s tasks' });
  }
});

// Get completion stats for today
router.get('/stats', async (req, res) => {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    const attDone = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM att_sessions WHERE date = ? AND completed = 1',
      today
    );

    const dmDone = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dm_practices WHERE date = ?',
      today
    );

    const logDone = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM cas_logs WHERE date = ?',
      today
    );

    const totalTasks = 5; // 1 ATT + 3 DM + 1 Log
    const completedTasks =
      (attDone?.count || 0) +
      Math.min(dmDone?.count || 0, 3) +
      (logDone?.count || 0);

    res.json({
      totalTasks,
      completedTasks,
      completionRate: Math.round((completedTasks / totalTasks) * 100),
      details: {
        att: !!attDone?.count,
        dm: dmDone?.count || 0,
        log: !!logDone?.count
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s stats:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s stats' });
  }
});

export default router;