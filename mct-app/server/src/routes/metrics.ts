import { Router } from 'express';
import { metricsService } from '../services/metrics';
import { getDatabase } from '../utils/database';

const router = Router();

/**
 * GET /api/metrics/cas-trends
 * Returns CAS duration and frequency metrics with trends
 */
router.get('/cas-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = parseInt(days as string);

    const trends = await metricsService.getCASTimeTrends(numDays);

    res.json({
      timeframe: {
        days: numDays,
        start_date: trends.dates[0],
        end_date: trends.dates[trends.dates.length - 1]
      },
      duration_metrics: {
        worry_minutes: {
          daily_values: trends.worry_minutes,
          rolling_average: trends.worry_rolling_avg,
          current_week_avg: trends.worry_rolling_avg.slice(-7).reduce((sum, val) => sum + val, 0) / 7,
          previous_week_avg: trends.worry_rolling_avg.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7
        },
        rumination_minutes: {
          daily_values: trends.rumination_minutes,
          rolling_average: trends.rumination_rolling_avg,
          current_week_avg: trends.rumination_rolling_avg.slice(-7).reduce((sum, val) => sum + val, 0) / 7,
          previous_week_avg: trends.rumination_rolling_avg.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7
        }
      },
      frequency_metrics: {
        monitoring_count: {
          daily_values: trends.monitoring_count,
          rolling_average: trends.monitoring_rolling_avg,
          current_week_avg: trends.monitoring_rolling_avg.slice(-7).reduce((sum, val) => sum + val, 0) / 7,
          previous_week_avg: trends.monitoring_rolling_avg.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7
        },
        checking_count: {
          daily_values: trends.checking_count,
          current_week_avg: trends.checking_count.slice(-7).reduce((sum, val) => sum + val, 0) / 7,
          previous_week_avg: trends.checking_count.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7
        },
        reassurance_count: {
          daily_values: trends.reassurance_count,
          current_week_avg: trends.reassurance_count.slice(-7).reduce((sum, val) => sum + val, 0) / 7,
          previous_week_avg: trends.reassurance_count.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7
        }
      },
      dates: trends.dates
    });
  } catch (error) {
    console.error('Error fetching CAS trends:', error);
    res.status(500).json({ error: 'Failed to fetch CAS trends' });
  }
});

/**
 * GET /api/metrics/practice-stats
 * Returns practice completion rates and engagement patterns
 */
router.get('/practice-stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = parseInt(days as string);

    const stats = await metricsService.getPracticeStats(numDays);

    res.json({
      timeframe: {
        days: numDays,
        start_date: stats.dates[0],
        end_date: stats.dates[stats.dates.length - 1]
      },
      att_metrics: {
        completion_rate: stats.att_completion_rate,
        trend: stats.att_completion_trend,
        daily_completion: stats.att_daily_completion,
        streak: {
          current: stats.att_daily_completion.slice().reverse().findIndex(completed => !completed) || stats.att_daily_completion.length,
          longest: Math.max(...stats.att_daily_completion.reduce((streaks: number[], completed, index) => {
            if (completed) {
              const lastStreak = streaks[streaks.length - 1] || 0;
              streaks[streaks.length - 1] = lastStreak + 1;
            } else if (streaks.length === 0 || streaks[streaks.length - 1] > 0) {
              streaks.push(0);
            }
            return streaks;
          }, []))
        }
      },
      dm_metrics: {
        frequency: stats.dm_frequency,
        trend: stats.dm_frequency_trend,
        daily_count: stats.dm_daily_count,
        target: 3, // Standard recommendation is 3 times per day
        adherence_rate: Math.round((stats.dm_daily_count.filter(count => count >= 3).length / stats.dm_daily_count.length) * 100)
      },
      postponement_metrics: {
        success_rate: stats.postponement_success_rate,
        trend: stats.postponement_trend,
        daily_success_rates: stats.postponement_daily_success
      },
      dates: stats.dates
    });
  } catch (error) {
    console.error('Error fetching practice stats:', error);
    res.status(500).json({ error: 'Failed to fetch practice stats' });
  }
});

/**
 * GET /api/metrics/belief-trends
 * Returns belief rating trends (0-100 scale)
 */
router.get('/belief-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = parseInt(days as string);

    const trends = await metricsService.getBeliefTrends(numDays);

    res.json({
      timeframe: {
        days: numDays,
        start_date: trends.dates[0],
        end_date: trends.dates[trends.dates.length - 1]
      },
      belief_ratings: {
        uncontrollability: {
          values: trends.uncontrollability,
          trend: trends.uncontrollability_trend,
          latest: trends.uncontrollability[trends.uncontrollability.length - 1],
          change_from_start: trends.uncontrollability[trends.uncontrollability.length - 1] - trends.uncontrollability[0]
        },
        danger: {
          values: trends.danger,
          trend: trends.danger_trend,
          latest: trends.danger[trends.danger.length - 1],
          change_from_start: trends.danger[trends.danger.length - 1] - trends.danger[0]
        },
        positive: {
          values: trends.positive,
          trend: trends.positive_trend,
          latest: trends.positive[trends.positive.length - 1],
          change_from_start: trends.positive[trends.positive.length - 1] - trends.positive[0]
        }
      },
      overall_progress: {
        negative_beliefs_improving: (
          trends.uncontrollability_trend.trend_direction === 'decreasing' &&
          trends.danger_trend.trend_direction === 'decreasing'
        ),
        positive_beliefs_stable: trends.positive_trend.trend_direction !== 'decreasing'
      },
      dates: trends.dates
    });
  } catch (error) {
    console.error('Error fetching belief trends:', error);
    res.status(500).json({ error: 'Failed to fetch belief trends' });
  }
});

/**
 * GET /api/metrics/weekly-summary
 * Returns comprehensive weekly summary for progress visualization
 */
router.get('/weekly-summary', async (req, res) => {
  try {
    const summary = await metricsService.getWeeklySummary();

    // Calculate overall progress score
    const progressScore = Math.round((
      (100 - summary.cas_averages.worry_minutes) * 0.25 +
      (100 - summary.cas_averages.rumination_minutes) * 0.25 +
      summary.practice_stats.att_completion_rate * 0.25 +
      summary.practice_stats.postponement_success_rate * 0.25
    ));

    res.json({
      week_period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      cas_metrics: summary.cas_averages,
      practice_engagement: summary.practice_stats,
      belief_changes: summary.belief_trends,
      engagement_pattern: summary.engagement,
      overall_progress: {
        score: progressScore,
        assessment: progressScore >= 80 ? 'excellent' :
                   progressScore >= 60 ? 'good' :
                   progressScore >= 40 ? 'fair' : 'needs_attention',
        key_insights: [
          summary.cas_averages.worry_minutes < 30 ? 'Worry time is well-managed' : 'Focus on reducing worry time',
          summary.practice_stats.att_completion_rate >= 80 ? 'Excellent ATT consistency' : 'Increase ATT practice frequency',
          summary.practice_stats.dm_daily_average >= 3 ? 'Strong DM habit established' : 'Build stronger DM routine',
          summary.practice_stats.postponement_success_rate >= 70 ? 'Effective postponement use' : 'Practice postponement technique'
        ].filter(insight => insight.includes('well-managed') || insight.includes('Excellent') || insight.includes('Strong') || insight.includes('Effective') || Math.random() > 0.5)
      },
      weekly_assessment_due: await metricsService.isWeeklyAssessmentDue()
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

/**
 * POST /api/metrics/cas-log
 * Quick daily CAS logging endpoint
 */
router.post('/cas-log', async (req, res) => {
  try {
    const { worry_minutes, rumination_minutes, monitoring_count, checking_count, reassurance_count, avoidance_count, notes } = req.body;

    // Validate required fields
    if (worry_minutes === undefined || rumination_minutes === undefined || monitoring_count === undefined) {
      return res.status(400).json({ error: 'worry_minutes, rumination_minutes, and monitoring_count are required' });
    }

    // Validate ranges
    if (worry_minutes < 0 || rumination_minutes < 0 || monitoring_count < 0) {
      return res.status(400).json({ error: 'Values cannot be negative' });
    }

    if (worry_minutes > 1440 || rumination_minutes > 1440) {
      return res.status(400).json({ error: 'Minutes cannot exceed 1440 (24 hours)' });
    }

    await metricsService.quickCASLog({
      worry_minutes,
      rumination_minutes,
      monitoring_count,
      checking_count,
      reassurance_count,
      avoidance_count,
      notes
    });

    res.json({ success: true, message: 'CAS log recorded successfully' });
  } catch (error) {
    console.error('Error logging CAS data:', error);
    res.status(500).json({ error: 'Failed to log CAS data' });
  }
});

/**
 * POST /api/metrics/belief-rating
 * Record belief rating
 */
router.post('/belief-rating', async (req, res) => {
  try {
    const { belief_type, rating, context } = req.body;

    // Validate required fields
    if (!belief_type || rating === undefined) {
      return res.status(400).json({ error: 'belief_type and rating are required' });
    }

    // Validate belief type
    if (!['uncontrollability', 'danger', 'positive'].includes(belief_type)) {
      return res.status(400).json({ error: 'belief_type must be uncontrollability, danger, or positive' });
    }

    // Validate rating range
    if (rating < 0 || rating > 100) {
      return res.status(400).json({ error: 'rating must be between 0 and 100' });
    }

    await metricsService.recordBeliefRating({
      belief_type,
      rating,
      context
    });

    res.json({ success: true, message: 'Belief rating recorded successfully' });
  } catch (error) {
    console.error('Error recording belief rating:', error);
    res.status(500).json({ error: 'Failed to record belief rating' });
  }
});

/**
 * GET /api/metrics/engagement-patterns
 * Returns detailed engagement patterns and analytics
 */
router.get('/engagement-patterns', async (req, res) => {
  try {
    const db = await getDatabase();
    const { days = 30 } = req.query;
    const numDays = parseInt(days as string);

    // Get practice time patterns
    const attTimes = await db.all<{ date: string; created_at: string }[]>(
      `SELECT date, created_at FROM att_sessions
       WHERE completed = 1 AND date >= date('now', '-${numDays} days')
       ORDER BY created_at`
    );

    const dmTimes = await db.all<{ date: string; time_of_day: string; created_at: string }[]>(
      `SELECT date, time_of_day, created_at FROM dm_practices
       WHERE date >= date('now', '-${numDays} days')
       ORDER BY created_at`
    );

    // Analyze time patterns
    const timePattern = {
      morning: 0,
      midday: 0,
      evening: 0,
      other: 0
    };

    (dmTimes || []).forEach(dm => {
      if (dm.time_of_day in timePattern) {
        timePattern[dm.time_of_day as keyof typeof timePattern]++;
      }
    });

    // Get consistency metrics
    const totalDays = numDays;
    const daysWithATT = new Set((attTimes || []).map(att => att.date)).size;
    const daysWithDM = new Set((dmTimes || []).map(dm => dm.date)).size;

    // Calculate best practice time based on most common hour
    const attHours = (attTimes || []).map(att => {
      const hour = new Date(att.created_at).getHours();
      return hour;
    });

    const hourCounts = attHours.reduce((acc: Record<number, number>, hour: number) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const bestHour = Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b, '20'
    );

    res.json({
      timeframe: {
        days: numDays,
        total_days: totalDays
      },
      consistency: {
        att_consistency: Math.round((daysWithATT / totalDays) * 100),
        dm_consistency: Math.round((daysWithDM / totalDays) * 100),
        overall_consistency: Math.round(((daysWithATT + daysWithDM) / (totalDays * 2)) * 100)
      },
      time_patterns: {
        preferred_att_time: `${bestHour}:00`,
        dm_distribution: timePattern,
        most_active_period: Object.keys(timePattern).reduce((a, b) =>
          timePattern[a as keyof typeof timePattern] > timePattern[b as keyof typeof timePattern] ? a : b
        )
      },
      engagement_insights: [
        daysWithATT / totalDays >= 0.8 ? 'Strong ATT routine established' : 'ATT practice needs consistency',
        daysWithDM / totalDays >= 0.8 ? 'Excellent DM habit formation' : 'DM practice could be more regular',
        timePattern.evening > timePattern.morning ? 'Evening practice preference' : 'Morning practice preference'
      ]
    });
  } catch (error) {
    console.error('Error fetching engagement patterns:', error);
    res.status(500).json({ error: 'Failed to fetch engagement patterns' });
  }
});

export default router;