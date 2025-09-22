import { getDatabase } from './database';

export async function addMissingColumns() {
  const db = await getDatabase();

  try {
    // Add metaphor_used column to dm_practices if it doesn't exist
    await db.run(`
      ALTER TABLE dm_practices
      ADD COLUMN metaphor_used TEXT
      CHECK(metaphor_used IN ('radio', 'screen', 'weather'))
    `).catch(() => {
      console.log('Column metaphor_used already exists or cannot be added');
    });

    // Add template_id column to experiments if it doesn't exist
    await db.run(`
      ALTER TABLE experiments
      ADD COLUMN template_id TEXT
    `).catch(() => {
      console.log('Column template_id already exists or cannot be added');
    });

    console.log('✅ Database columns updated');
  } catch (error) {
    console.log('Database columns already up to date');
  }
}
