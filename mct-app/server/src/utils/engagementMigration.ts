import { getDatabase } from './database';

export async function migrateEngagementFeatures() {
  const db = await getDatabase();

  // Add new columns to user_settings for personalization
  await db.exec(`
    -- Add personalization columns to user_settings
    ALTER TABLE user_settings ADD COLUMN preferred_att_duration INTEGER DEFAULT 12;
    ALTER TABLE user_settings ADD COLUMN preferred_dm_metaphor TEXT DEFAULT 'radio' CHECK(preferred_dm_metaphor IN ('radio', 'screen', 'weather'));
    ALTER TABLE user_settings ADD COLUMN preferred_att_script TEXT DEFAULT 'standard' CHECK(preferred_att_script IN ('standard', 'short', 'emergency'));
    ALTER TABLE user_settings ADD COLUMN notification_style TEXT DEFAULT 'gentle' CHECK(notification_style IN ('gentle', 'encouraging', 'minimal'));
    ALTER TABLE user_settings ADD COLUMN practice_time_preference TEXT DEFAULT 'evening' CHECK(practice_time_preference IN ('morning', 'midday', 'evening', 'flexible'));
  `).catch(() => {
    // Columns may already exist, which is fine
  });

  // Create achievements table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      badge_icon TEXT NOT NULL,
      category TEXT CHECK(category IN ('consistency', 'exploration', 'milestone', 'skill', 'special')) NOT NULL,
      criteria_type TEXT CHECK(criteria_type IN ('streak', 'count', 'percentage', 'time_based', 'special')) NOT NULL,
      criteria_value INTEGER,
      earned_date TEXT,
      progress INTEGER DEFAULT 0,
      total_required INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create milestones table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      week INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT CHECK(type IN ('week_completion', 'mid_program', 'graduation', 'special')) NOT NULL,
      completed BOOLEAN DEFAULT 0,
      completed_date TEXT,
      celebration_shown BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create nudges table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS nudges (
      id TEXT PRIMARY KEY,
      type TEXT CHECK(type IN ('reminder', 'insight', 'encouragement', 'recovery')) NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      action_text TEXT,
      action_url TEXT,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL,
      dismissed BOOLEAN DEFAULT 0,
      dismissed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create personalization_metrics table for tracking performance
  await db.exec(`
    CREATE TABLE IF NOT EXISTS personalization_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_date TEXT NOT NULL,
      att_consistency_score INTEGER DEFAULT 0,
      att_avg_duration INTEGER DEFAULT 0,
      dm_engagement_rate REAL DEFAULT 0,
      postponement_success_rate INTEGER DEFAULT 0,
      belief_change_velocity REAL DEFAULT 0,
      overall_engagement INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(metric_date)
    );
  `);

  // Insert default achievements
  await insertDefaultAchievements(db);

  // Insert default milestones
  await insertDefaultMilestones(db);

  console.log('Engagement features migration completed successfully');
}

async function insertDefaultAchievements(db: any) {
  const achievements = [
    // Consistency Achievements
    {
      id: 'first_att_session',
      title: 'First Steps',
      description: 'Complete your first ATT session',
      badge_icon: '🎯',
      category: 'consistency',
      criteria_type: 'count',
      criteria_value: 1,
      total_required: 1
    },
    {
      id: 'att_streak_3',
      title: 'Building Momentum',
      description: 'Complete ATT sessions for 3 consecutive days',
      badge_icon: '🔥',
      category: 'consistency',
      criteria_type: 'streak',
      criteria_value: 3,
      total_required: 3
    },
    {
      id: 'att_streak_7',
      title: 'Consistent Practitioner',
      description: 'Complete ATT sessions for 7 consecutive days',
      badge_icon: '⭐',
      category: 'consistency',
      criteria_type: 'streak',
      criteria_value: 7,
      total_required: 7
    },
    {
      id: 'att_streak_30',
      title: 'Dedication Master',
      description: 'Complete ATT sessions for 30 consecutive days',
      badge_icon: '🏆',
      category: 'consistency',
      criteria_type: 'streak',
      criteria_value: 30,
      total_required: 30
    },

    // Exploration Achievements
    {
      id: 'first_experiment',
      title: 'Experiment Explorer',
      description: 'Complete your first behavioral experiment',
      badge_icon: '🔬',
      category: 'exploration',
      criteria_type: 'count',
      criteria_value: 1,
      total_required: 1
    },
    {
      id: 'experiment_variety',
      title: 'Hypothesis Tester',
      description: 'Complete experiments in 3 different belief categories',
      badge_icon: '🧪',
      category: 'exploration',
      criteria_type: 'special',
      total_required: 3
    },
    {
      id: 'sar_creator',
      title: 'SAR Plan Creator',
      description: 'Create your first SAR plan',
      badge_icon: '🗺️',
      category: 'exploration',
      criteria_type: 'count',
      criteria_value: 1,
      total_required: 1
    },

    // Milestone Achievements
    {
      id: 'week_4_completion',
      title: 'Midway Champion',
      description: 'Complete the first half of the MCT program',
      badge_icon: '🎖️',
      category: 'milestone',
      criteria_type: 'special',
      criteria_value: 4
    },
    {
      id: 'program_graduation',
      title: 'MCT Graduate',
      description: 'Complete the entire 8-week MCT program',
      badge_icon: '🎓',
      category: 'milestone',
      criteria_type: 'special',
      criteria_value: 8
    },

    // Skill Achievements
    {
      id: 'dm_variety',
      title: 'Metaphor Master',
      description: 'Practice DM with all three metaphors',
      badge_icon: '🎭',
      category: 'skill',
      criteria_type: 'special',
      total_required: 3
    },
    {
      id: 'postponement_success',
      title: 'Postponement Pro',
      description: 'Achieve 80% success rate in postponement practice',
      badge_icon: '⏰',
      category: 'skill',
      criteria_type: 'percentage',
      criteria_value: 80,
      total_required: 80
    },

    // Special Achievements
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Complete morning practices for 7 days',
      badge_icon: '🌅',
      category: 'special',
      criteria_type: 'special',
      criteria_value: 7
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Complete evening practices for 7 days',
      badge_icon: '🌙',
      category: 'special',
      criteria_type: 'special',
      criteria_value: 7
    }
  ];

  for (const achievement of achievements) {
    await db.run(`
      INSERT OR IGNORE INTO achievements
      (id, title, description, badge_icon, category, criteria_type, criteria_value, total_required)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      achievement.id,
      achievement.title,
      achievement.description,
      achievement.badge_icon,
      achievement.category,
      achievement.criteria_type,
      achievement.criteria_value,
      achievement.total_required
    ]);
  }
}

async function insertDefaultMilestones(db: any) {
  const milestones = [
    {
      id: 'week_1_complete',
      week: 1,
      title: 'CAS Mapping Complete',
      description: 'You\'ve mapped your personal CAS patterns and learned postponement',
      type: 'week_completion'
    },
    {
      id: 'week_2_complete',
      week: 2,
      title: 'ATT Skills Developed',
      description: 'You\'ve deepened your attention training and created SAR plans',
      type: 'week_completion'
    },
    {
      id: 'week_3_complete',
      week: 3,
      title: 'Positive Beliefs Examined',
      description: 'You\'ve tested beliefs about worry\'s usefulness through experiments',
      type: 'week_completion'
    },
    {
      id: 'week_4_complete',
      week: 4,
      title: 'Midway Milestone',
      description: 'You\'ve completed half the program and addressed negative metacognitive beliefs',
      type: 'mid_program'
    },
    {
      id: 'week_5_complete',
      week: 5,
      title: 'Safety Behaviors Reduced',
      description: 'You\'ve identified and reduced unhelpful coping behaviors',
      type: 'week_completion'
    },
    {
      id: 'week_6_complete',
      week: 6,
      title: 'Trigger Mastery',
      description: 'You\'ve applied your skills in challenging trigger situations',
      type: 'week_completion'
    },
    {
      id: 'week_7_complete',
      week: 7,
      title: 'Change Consolidated',
      description: 'You\'ve strengthened your new approach and built confidence',
      type: 'week_completion'
    },
    {
      id: 'week_8_complete',
      week: 8,
      title: 'MCT Graduate',
      description: 'Congratulations! You\'ve completed the full MCT program',
      type: 'graduation'
    }
  ];

  for (const milestone of milestones) {
    await db.run(`
      INSERT OR IGNORE INTO milestones
      (id, week, title, description, type)
      VALUES (?, ?, ?, ?, ?)
    `, [
      milestone.id,
      milestone.week,
      milestone.title,
      milestone.description,
      milestone.type
    ]);
  }
}

// Achievement checking functions
export async function checkAndAwardAchievements() {
  const db = await getDatabase();

  // Check streak achievements
  await checkStreakAchievements(db);

  // Check experiment achievements
  await checkExperimentAchievements(db);

  // Check skill achievements
  await checkSkillAchievements(db);

  // Check special achievements
  await checkSpecialAchievements(db);
}

async function checkStreakAchievements(db: any) {
  const streaks = await db.all(`
    SELECT type, current_streak FROM streaks
  `);

  for (const streak of streaks) {
    if (streak.type === 'att') {
      // Check ATT streak achievements
      if (streak.current_streak >= 30) {
        await awardAchievement(db, 'att_streak_30');
      } else if (streak.current_streak >= 7) {
        await awardAchievement(db, 'att_streak_7');
      } else if (streak.current_streak >= 3) {
        await awardAchievement(db, 'att_streak_3');
      }
    }
  }

  // Check if first ATT session completed
  const attSessionCount = await db.get(`
    SELECT COUNT(*) as count FROM att_sessions WHERE completed = 1
  `);

  if (attSessionCount && attSessionCount.count >= 1) {
    await awardAchievement(db, 'first_att_session');
  }
}

async function checkExperimentAchievements(db: any) {
  const experimentCount = await db.get(`
    SELECT COUNT(*) as count FROM experiments WHERE status = 'completed'
  `);

  if (experimentCount && experimentCount.count >= 1) {
    await awardAchievement(db, 'first_experiment');
  }
}

async function checkSkillAchievements(db: any) {
  // Check DM metaphor variety
  const metaphorCount = await db.get(`
    SELECT COUNT(DISTINCT metaphor_used) as count
    FROM dm_practices
    WHERE metaphor_used IS NOT NULL
  `);

  if (metaphorCount && metaphorCount.count >= 3) {
    await awardAchievement(db, 'dm_variety');
  }

  // Check postponement success rate
  const postponementStats = await db.get(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN processed = 1 THEN 1 ELSE 0 END) as processed
    FROM postponement_logs
    WHERE date >= date('now', '-30 days')
  `);

  if (postponementStats && postponementStats.total >= 10) {
    const successRate = (postponementStats.processed / postponementStats.total) * 100;
    if (successRate >= 80) {
      await awardAchievement(db, 'postponement_success');
    }
  }
}

async function checkSpecialAchievements(db: any) {
  // Check morning practice achievement
  const morningPractices = await db.get(`
    SELECT COUNT(DISTINCT date) as count
    FROM att_sessions
    WHERE completed = 1
    AND time(created_at) BETWEEN '06:00' AND '11:59'
    AND date >= date('now', '-7 days')
  `);

  if (morningPractices && morningPractices.count >= 7) {
    await awardAchievement(db, 'early_bird');
  }

  // Check evening practice achievement
  const eveningPractices = await db.get(`
    SELECT COUNT(DISTINCT date) as count
    FROM att_sessions
    WHERE completed = 1
    AND time(created_at) BETWEEN '18:00' AND '23:59'
    AND date >= date('now', '-7 days')
  `);

  if (eveningPractices && eveningPractices.count >= 7) {
    await awardAchievement(db, 'night_owl');
  }
}

async function awardAchievement(db: any, achievementId: string) {
  const existing = await db.get(`
    SELECT id FROM achievements WHERE id = ? AND earned_date IS NOT NULL
  `, achievementId);

  if (!existing) {
    await db.run(`
      UPDATE achievements
      SET earned_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `, achievementId);

    console.log(`Achievement awarded: ${achievementId}`);
  }
}