import { getDatabase } from './database';

/**
 * Migration to add metrics-related columns and ensure compatibility
 */
export async function migrateMetrics() {
  const db = await getDatabase();

  console.log('Running metrics migration...');

  try {
    // Add updated_at column to cas_logs if it doesn't exist
    await db.run(`
      ALTER TABLE cas_logs ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    `).catch((err) => {
      // Column might already exist, ignore the error
      if (!err.message.includes('duplicate column name')) {
        throw err;
      }
    });

    // Create a trigger to update the updated_at column on cas_logs updates
    await db.run(`
      CREATE TRIGGER IF NOT EXISTS update_cas_logs_updated_at
      AFTER UPDATE ON cas_logs
      BEGIN
        UPDATE cas_logs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    // Ensure all existing belief_ratings have a proper date format
    await db.run(`
      UPDATE belief_ratings
      SET date = date(created_at)
      WHERE date IS NULL OR date = ''
    `);

    // Create metrics summary view for faster queries
    await db.run(`
      CREATE VIEW IF NOT EXISTS metrics_daily_summary AS
      SELECT
        date,
        worry_minutes,
        rumination_minutes,
        monitoring_count,
        checking_count,
        reassurance_count,
        avoidance_count,
        (SELECT COUNT(*) FROM att_sessions WHERE att_sessions.date = cas_logs.date AND completed = 1) as att_completed,
        (SELECT SUM(duration_minutes) FROM att_sessions WHERE att_sessions.date = cas_logs.date AND completed = 1) as att_total_minutes,
        (SELECT COUNT(*) FROM dm_practices WHERE dm_practices.date = cas_logs.date) as dm_count,
        (SELECT COUNT(*) FROM postponement_logs WHERE postponement_logs.date = cas_logs.date) as postponement_total,
        (SELECT COUNT(*) FROM postponement_logs WHERE postponement_logs.date = cas_logs.date AND processed = 1) as postponement_processed
      FROM cas_logs
      ORDER BY date DESC
    `);

    // Create belief trends view
    await db.run(`
      CREATE VIEW IF NOT EXISTS belief_trends_summary AS
      SELECT
        date,
        MAX(CASE WHEN belief_type = 'uncontrollability' THEN rating END) as uncontrollability,
        MAX(CASE WHEN belief_type = 'danger' THEN rating END) as danger,
        MAX(CASE WHEN belief_type = 'positive' THEN rating END) as positive
      FROM belief_ratings
      GROUP BY date
      ORDER BY date DESC
    `);

    console.log('Metrics migration completed successfully');
  } catch (error) {
    console.error('Error during metrics migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateMetrics()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}