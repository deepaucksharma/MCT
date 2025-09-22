import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'data', 'mct.db'),
      driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON;');
  }

  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();

  const schema = `
    -- User Settings (single user, no auth)
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      onboarding_completed BOOLEAN DEFAULT 0,
      onboarding_date TEXT,
      current_week INTEGER DEFAULT 0,
      att_reminder_time TEXT DEFAULT '20:00',
      dm_reminder_times TEXT DEFAULT '["08:00","13:00","18:00"]',
      postponement_slot_start TEXT DEFAULT '18:30',
      postponement_slot_duration INTEGER DEFAULT 15,
      notifications_enabled BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Initial Assessment / Case Formulation
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_type TEXT CHECK(assessment_type IN ('initial', 'weekly', 'final')),
      worry_baseline INTEGER CHECK(worry_baseline >= 0 AND worry_baseline <= 100),
      rumination_baseline INTEGER CHECK(rumination_baseline >= 0 AND rumination_baseline <= 100),
      monitoring_baseline INTEGER CHECK(monitoring_baseline >= 0 AND monitoring_baseline <= 100),
      uncontrollability_belief INTEGER CHECK(uncontrollability_belief >= 0 AND uncontrollability_belief <= 100),
      danger_belief INTEGER CHECK(danger_belief >= 0 AND danger_belief <= 100),
      positive_belief INTEGER CHECK(positive_belief >= 0 AND positive_belief <= 100),
      triggers TEXT,
      goals TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Program Modules (Weekly Content)
    CREATE TABLE IF NOT EXISTS program_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_number INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      key_points TEXT,
      exercises TEXT,
      unlocked BOOLEAN DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      unlocked_date TEXT,
      completed_date TEXT
    );

    -- Daily CAS Logs
    CREATE TABLE IF NOT EXISTS cas_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      worry_minutes INTEGER DEFAULT 0,
      rumination_minutes INTEGER DEFAULT 0,
      monitoring_count INTEGER DEFAULT 0,
      checking_count INTEGER DEFAULT 0,
      reassurance_count INTEGER DEFAULT 0,
      avoidance_count INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date)
    );

    -- ATT Sessions
    CREATE TABLE IF NOT EXISTS att_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      attentional_control_rating INTEGER CHECK(attentional_control_rating >= 0 AND attentional_control_rating <= 100),
      intrusions BOOLEAN DEFAULT 0,
      intrusion_count INTEGER,
      shift_ease_rating INTEGER CHECK(shift_ease_rating >= 0 AND shift_ease_rating <= 100),
      script_type TEXT CHECK(script_type IN ('standard', 'short', 'emergency')),
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- DM Micro-practices
    CREATE TABLE IF NOT EXISTS dm_practices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time_of_day TEXT CHECK(time_of_day IN ('morning', 'midday', 'evening', 'other')),
      duration_seconds INTEGER,
      engaged_vs_watched TEXT CHECK(engaged_vs_watched IN ('engaged', 'watched')),
      confidence_rating INTEGER CHECK(confidence_rating >= 0 AND confidence_rating <= 100),
      metaphor_used TEXT CHECK(metaphor_used IN ('radio', 'screen', 'weather')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Worry/Rumination Postponement
    CREATE TABLE IF NOT EXISTS postponement_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      trigger_time TEXT NOT NULL,
      scheduled_time TEXT,
      urge_before INTEGER CHECK(urge_before >= 0 AND urge_before <= 100),
      urge_after INTEGER CHECK(urge_after >= 0 AND urge_after <= 100),
      processed BOOLEAN DEFAULT 0,
      processing_duration_minutes INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- SAR Plans (Situational Attentional Refocusing)
    CREATE TABLE IF NOT EXISTS sar_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger_cue TEXT NOT NULL,
      if_statement TEXT NOT NULL,
      then_action TEXT NOT NULL,
      active BOOLEAN DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      success_rate INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Behavioral Experiments
    CREATE TABLE IF NOT EXISTS experiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id TEXT,
      week_number INTEGER,
      belief_tested TEXT NOT NULL,
      prediction TEXT NOT NULL,
      safety_behaviors_dropped TEXT,
      protocol_steps TEXT NOT NULL,
      metrics TEXT,
      status TEXT CHECK(status IN ('planned', 'in_progress', 'completed')),
      outcome TEXT,
      learning TEXT,
      belief_rating_before INTEGER CHECK(belief_rating_before >= 0 AND belief_rating_before <= 100),
      belief_rating_after INTEGER CHECK(belief_rating_after >= 0 AND belief_rating_after <= 100),
      started_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );

    -- Experiment Sessions (for multi-day experiments)
    CREATE TABLE IF NOT EXISTS experiment_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experiment_id INTEGER NOT NULL,
      session_date TEXT NOT NULL,
      session_number INTEGER NOT NULL,
      data TEXT,
      completed BOOLEAN DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
    );

    -- Belief Ratings History
    CREATE TABLE IF NOT EXISTS belief_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      belief_type TEXT CHECK(belief_type IN ('uncontrollability', 'danger', 'positive', 'custom')),
      belief_statement TEXT,
      rating INTEGER CHECK(rating >= 0 AND rating <= 100),
      context TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Notifications Queue
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('att_reminder', 'dm_reminder', 'postponement_reminder', 'experiment_reminder', 'weekly_unlock')),
      scheduled_time TEXT NOT NULL,
      sent BOOLEAN DEFAULT 0,
      sent_at TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Streaks and Achievements
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT CHECK(type IN ('att', 'dm', 'logging', 'overall')),
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_activity_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type)
    );

    -- App Events Log (for analytics)
    CREATE TABLE IF NOT EXISTS app_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Fidelity Violations Log (for monitoring MCT compliance)
    CREATE TABLE IF NOT EXISTS fidelity_violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      violation_type TEXT CHECK(violation_type IN ('content_analysis', 'reassurance_seeking', 'content_input', 'process_deviation')),
      route TEXT NOT NULL,
      request_data TEXT,
      user_ip TEXT,
      user_agent TEXT,
      severity TEXT CHECK(severity IN ('low', 'medium', 'high')),
      blocked BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_cas_logs_date ON cas_logs(date);
    CREATE INDEX IF NOT EXISTS idx_att_sessions_date ON att_sessions(date);
    CREATE INDEX IF NOT EXISTS idx_dm_practices_date ON dm_practices(date);
    CREATE INDEX IF NOT EXISTS idx_postponement_logs_date ON postponement_logs(date);
    CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
    CREATE INDEX IF NOT EXISTS idx_belief_ratings_date ON belief_ratings(date);
    CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_time, sent);
    CREATE INDEX IF NOT EXISTS idx_fidelity_violations_timestamp ON fidelity_violations(timestamp);
    CREATE INDEX IF NOT EXISTS idx_fidelity_violations_type ON fidelity_violations(violation_type);
  `;

  await database.exec(schema);

  // Insert default user settings if not exists
  await database.run(`
    INSERT OR IGNORE INTO user_settings (id) VALUES (1);
  `);

  // Insert program modules content
  await insertProgramModules(database);

  // Initialize streaks
  await database.run(`
    INSERT OR IGNORE INTO streaks (type, current_streak, longest_streak)
    VALUES
      ('att', 0, 0),
      ('dm', 0, 0),
      ('logging', 0, 0),
      ('overall', 0, 0);
  `);

  // Run metrics migration
  try {
    const { migrateMetrics } = await import('./migrateMetrics');
    await migrateMetrics();
  const { addMissingColumns } = await import("./addMissingColumns");
  await addMissingColumns();
  } catch (error) {
    console.error('Metrics migration failed:', error);
  }

  console.log('Database initialized successfully');
}

async function insertProgramModules(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const modules = [
    {
      week_number: 0,
      title: "Introduction to MCT",
      description: "Understanding the Cognitive Attentional Syndrome",
      content: `Welcome to your journey with Metacognitive Therapy (MCT). This week, we'll explore how MCT differs from other approaches and introduce the concept of the Cognitive Attentional Syndrome (CAS).

The CAS consists of:
• Worry and rumination
• Threat monitoring
• Unhelpful coping behaviors

MCT focuses on HOW you relate to your thoughts, not their content. We're not here to debate whether your worries are realistic or to provide reassurance. Instead, we'll help you develop a new relationship with your thoughts.`,
      key_points: JSON.stringify([
        "MCT is process-focused, not content-focused",
        "The CAS maintains psychological distress",
        "You'll learn to observe thoughts without engaging",
        "Change comes from new ways of relating to thoughts"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Initial Assessment"])
    },
    {
      week_number: 1,
      title: "Mapping Your CAS",
      description: "Identifying your patterns and introducing postponement",
      content: `This week, we'll map out your personal CAS patterns and introduce worry/rumination postponement.

Key concepts:
• Identifying triggers without analyzing content
• Understanding your worry/rumination time patterns
• Learning the postponement technique
• Beginning to separate yourself from the worry process`,
      key_points: JSON.stringify([
        "Map your CAS without getting caught in content",
        "Postponement creates distance from worry",
        "Notice the urge to worry without acting on it",
        "Practice makes the process easier"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Postponement", "CAS Mapping"])
    },
    {
      week_number: 2,
      title: "Deepening Attention Training",
      description: "Mastering ATT and introducing SAR",
      content: `Attention Training Technique (ATT) is central to MCT. This week we deepen your practice and introduce Situational Attentional Refocusing (SAR).

ATT helps you:
• Develop flexible control over attention
• Break the CAS pattern of self-focused attention
• Build the skill of disengagement

SAR provides in-the-moment strategies for redirecting attention when you notice CAS activation.`,
      key_points: JSON.stringify([
        "ATT is skill-building, not relaxation",
        "SAR provides practical redirection strategies",
        "Consistency matters more than perfection",
        "Notice improvements in attentional flexibility"
      ]),
      exercises: JSON.stringify(["Enhanced ATT", "DM", "SAR Plans", "First Experiment"])
    },
    {
      week_number: 3,
      title: "Positive Metacognitive Beliefs",
      description: "Examining beliefs about worry's usefulness",
      content: `Many people hold positive beliefs about worry, such as "Worry helps me prepare" or "Worry shows I care." This week, we examine these beliefs through behavioral experiments.

Important: We're not debating whether worry has ever been helpful. We're testing whether you need to actively worry to achieve your goals.`,
      key_points: JSON.stringify([
        "Positive beliefs maintain the CAS",
        "Test beliefs through experiments, not logic",
        "Preparation can happen without worry",
        "Caring doesn't require rumination"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Positive Belief Experiments"])
    },
    {
      week_number: 4,
      title: "Negative Metacognitive Beliefs",
      description: "Addressing uncontrollability and danger beliefs",
      content: `This week focuses on negative metacognitive beliefs: "My worry is uncontrollable" and "Worry is dangerous." These beliefs create a vicious cycle that maintains the CAS.

Through experiments, you'll discover:
• You have more control than you think
• Worry itself is not dangerous
• You can choose to disengage`,
      key_points: JSON.stringify([
        "Uncontrollability is a belief, not a fact",
        "Test through postponement and redirection",
        "Worry is unpleasant but not dangerous",
        "Evidence gathering through experience"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Uncontrollability Experiments", "Ban/Binge Experiments"])
    },
    {
      week_number: 5,
      title: "Reducing Safety Behaviors",
      description: "Identifying and dropping unhelpful coping",
      content: `Safety behaviors (checking, seeking reassurance, avoidance) seem helpful but maintain the problem. This week, we identify and systematically reduce these behaviors.

Common safety behaviors:
• Repeated checking
• Seeking reassurance
• Mental reviewing
• Avoidance of triggers`,
      key_points: JSON.stringify([
        "Safety behaviors prevent learning",
        "Short-term relief maintains long-term problems",
        "Dropping behaviors tests predictions",
        "Tolerate uncertainty without coping"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Safety Behavior Experiments"])
    },
    {
      week_number: 6,
      title: "Flexible Attention in Triggers",
      description: "Applying skills in challenging situations",
      content: `By now, you've developed significant skills. This week, we practice applying them in your most challenging trigger situations.

Focus on:
• Using SAR plans proactively
• Maintaining external focus
• Resisting the pull of the CAS
• Treating triggers as practice opportunities`,
      key_points: JSON.stringify([
        "Triggers are practice opportunities",
        "Apply skills early in the CAS activation",
        "External focus is key",
        "Confidence grows through practice"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Trigger Exposure", "Advanced SAR"])
    },
    {
      week_number: 7,
      title: "Consolidating Change",
      description: "Strengthening your new approach",
      content: `This week is about consolidating your gains and ensuring the changes become your new normal. We'll review your progress and identify any remaining challenges.

Key areas:
• Reviewing belief changes
• Identifying residual CAS patterns
• Strengthening weak points
• Building confidence in your skills`,
      key_points: JSON.stringify([
        "Review progress objectively",
        "Identify remaining challenges",
        "Consolidate learning through practice",
        "Build on successes"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Consolidation Experiments", "Progress Review"])
    },
    {
      week_number: 8,
      title: "Relapse Prevention",
      description: "Maintaining gains and planning ahead",
      content: `Your final week focuses on maintaining your gains long-term. We'll create a personalized relapse prevention plan.

Your plan includes:
• Early warning signs
• Quick intervention strategies
• Maintenance practice schedule
• Managing setbacks

Remember: Occasional worry is normal. The goal is to prevent re-establishment of the CAS pattern.`,
      key_points: JSON.stringify([
        "Create a personalized maintenance plan",
        "Identify early warning signs",
        "Plan for challenging periods",
        "View setbacks as temporary"
      ]),
      exercises: JSON.stringify(["ATT", "DM", "Relapse Prevention Plan", "Final Assessment"])
    }
  ];

  for (const module of modules) {
    await database.run(`
      INSERT OR IGNORE INTO program_modules
      (week_number, title, description, content, key_points, exercises, unlocked, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      module.week_number,
      module.title,
      module.description,
      module.content,
      module.key_points,
      module.exercises,
      module.week_number === 0 ? 1 : 0, // Week 0 is unlocked by default
      0
    ]);
  }
}