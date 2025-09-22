import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { ProgressMetrics } from '../types';
import { format, subDays } from 'date-fns';

const router = Router();

// Get overall progress metrics
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { days = 30 } = req.query;
    const numDays = parseInt(days as string);

    const metrics: ProgressMetrics = {
      worry_trend: [],
      rumination_trend: [],
      monitoring_trend: [],
      att_minutes_trend: [],
      dm_count_trend: [],
      belief_ratings_trend: {
        uncontrollability: [],
        danger: [],
        positive: []
      },
      postponement_success_rate: 0,
      experiments_completed: 0,
      current_streaks: {
        att: 0,
        dm: 0,
        logging: 0,
        overall: 0
      }
    };

    // Get date range
    const dates: string[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    }

    // Get CAS trends
    for (const date of dates) {
      const casLog = await db.get<any>(
        'SELECT worry_minutes, rumination_minutes, monitoring_count FROM cas_logs WHERE date = ?',
        date
      );

      metrics.worry_trend.push(casLog?.worry_minutes || 0);
      metrics.rumination_trend.push(casLog?.rumination_minutes || 0);
      metrics.monitoring_trend.push(casLog?.monitoring_count || 0);

      // Get ATT minutes for the day
      const attMinutes = await db.get<{ total: number }>(
        'SELECT SUM(duration_minutes) as total FROM att_sessions WHERE date = ? AND completed = 1',
        date
      );
      metrics.att_minutes_trend.push(attMinutes?.total || 0);

      // Get DM count for the day
      const dmCount = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM dm_practices WHERE date = ?',
        date
      );
      metrics.dm_count_trend.push(dmCount?.count || 0);
    }

    // Get belief rating trends
    const beliefTypes = ['uncontrollability', 'danger', 'positive'] as const;
    for (const type of beliefTypes) {
      const ratings = await db.all<any[]>(
        `SELECT date, rating FROM belief_ratings
         WHERE belief_type = ? AND date >= ?
         ORDER BY date`,
        [type, dates[0]]
      );

      // Create a map for quick lookup
      const ratingMap = new Map(ratings.map(r => [r.date, r.rating]));

      // Fill in the trend array, carrying forward last known value
      let lastValue = 50; // Default starting value
      for (const date of dates) {
        if (ratingMap.has(date)) {
          lastValue = ratingMap.get(date)!;
        }
        metrics.belief_ratings_trend[type].push(lastValue);
      }
    }

    // Get postponement success rate
    const totalPostponements = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM postponement_logs WHERE date >= ?',
      dates[0]
    );

    const processedPostponements = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM postponement_logs WHERE date >= ? AND processed = 1',
      dates[0]
    );

    metrics.postponement_success_rate = totalPostponements?.count
      ? Math.round((processedPostponements?.count || 0) / totalPostponements.count * 100)
      : 0;

    // Get experiments completed
    const experimentsCompleted = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM experiments WHERE status = ?',
      'completed'
    );
    metrics.experiments_completed = experimentsCompleted?.count || 0;

    // Get current streaks
    const streaks = await db.all<any[]>('SELECT type, current_streak FROM streaks');
    for (const streak of streaks) {
      if (streak.type in metrics.current_streaks) {
        metrics.current_streaks[streak.type as keyof typeof metrics.current_streaks] = streak.current_streak;
      }
    }

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching progress metrics:', error);
    res.status(500).json({ error: 'Failed to fetch progress metrics' });
  }
});

// Get weekly summary
router.get('/weekly-summary', async (req, res) => {
  try {
    const db = await getDatabase();
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    // Get average CAS metrics
    const casAvg = await db.get<any>(
      `SELECT
       AVG(worry_minutes) as avg_worry,
       AVG(rumination_minutes) as avg_rumination,
       AVG(monitoring_count) as avg_monitoring
       FROM cas_logs WHERE date >= ?`,
      weekAgo
    );

    // Get total ATT minutes
    const attTotal = await db.get<{ total: number }>(
      'SELECT SUM(duration_minutes) as total FROM att_sessions WHERE date >= ? AND completed = 1',
      weekAgo
    );

    // Get total DM practices
    const dmTotal = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dm_practices WHERE date >= ?',
      weekAgo
    );

    // Get experiments completed this week
    const experimentsWeek = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM experiments WHERE completed_at >= ?',
      weekAgo
    );

    // Get belief changes
    const beliefChanges: any = {};
    const beliefTypes = ['uncontrollability', 'danger', 'positive'];

    for (const type of beliefTypes) {
      const firstRating = await db.get<{ rating: number }>(
        `SELECT rating FROM belief_ratings
         WHERE belief_type = ? AND date >= ?
         ORDER BY date ASC LIMIT 1`,
        [type, weekAgo]
      );

      const lastRating = await db.get<{ rating: number }>(
        `SELECT rating FROM belief_ratings
         WHERE belief_type = ?
         ORDER BY date DESC LIMIT 1`,
        type
      );

      if (firstRating && lastRating) {
        beliefChanges[type] = lastRating.rating - firstRating.rating;
      } else {
        beliefChanges[type] = 0;
      }
    }

    res.json({
      cas_averages: {
        worry: Math.round(casAvg?.avg_worry || 0),
        rumination: Math.round(casAvg?.avg_rumination || 0),
        monitoring: Math.round(casAvg?.avg_monitoring || 0)
      },
      practice_totals: {
        att_minutes: attTotal?.total || 0,
        dm_count: dmTotal?.count || 0
      },
      experiments_completed: experimentsWeek?.count || 0,
      belief_changes: beliefChanges
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

export default router;