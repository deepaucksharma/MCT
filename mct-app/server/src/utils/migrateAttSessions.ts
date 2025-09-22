import { getDatabase } from './database';

/**
 * Migration script to add new fields to att_sessions table
 * This is safe to run multiple times - it will only add columns if they don't exist
 */
export async function migrateAttSessions() {
  const db = await getDatabase();

  try {
    // Check if columns exist and add them if they don't
    const tableInfo = await db.all("PRAGMA table_info(att_sessions)");
    const columnNames = tableInfo.map((col: any) => col.name);

    if (!columnNames.includes('intrusion_count')) {
      await db.exec('ALTER TABLE att_sessions ADD COLUMN intrusion_count INTEGER');
      console.log('✓ Added intrusion_count column to att_sessions');
    }

    if (!columnNames.includes('shift_ease_rating')) {
      await db.exec('ALTER TABLE att_sessions ADD COLUMN shift_ease_rating INTEGER CHECK(shift_ease_rating >= 0 AND shift_ease_rating <= 100)');
      console.log('✓ Added shift_ease_rating column to att_sessions');
    }

    if (!columnNames.includes('script_type')) {
      await db.exec("ALTER TABLE att_sessions ADD COLUMN script_type TEXT CHECK(script_type IN ('standard', 'short', 'emergency'))");
      console.log('✓ Added script_type column to att_sessions');
    }

    console.log('✓ ATT sessions table migration completed');
  } catch (error) {
    console.error('Failed to migrate att_sessions table:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateAttSessions()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}