/**
 * Simple Test Data Generator for MCT E2E Tests
 * Generates test data that works with current schema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SimpleDataGenerator {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, '../server/data/mct.db');
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Generate simple test data for today and past 7 days
   */
  async generateWeekOfData() {
    console.log('📊 Generating one week of test data...\n');

    const today = new Date();

    for (let daysAgo = 7; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(today.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      console.log(`Generating data for ${dateStr}...`);

      // Generate CAS log
      await this.run(`
        INSERT OR REPLACE INTO cas_logs
        (date, worry_minutes, rumination_minutes, monitoring_count,
         checking_count, reassurance_count, avoidance_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        dateStr,
        Math.max(20, 60 - (7 - daysAgo) * 5), // Decreasing worry over time
        Math.max(15, 45 - (7 - daysAgo) * 4), // Decreasing rumination
        this.randomInRange(2, 6),
        this.randomInRange(1, 4),
        this.randomInRange(0, 3),
        this.randomInRange(0, 2)
      ]);

      // Generate ATT session (80% of days)
      if (Math.random() < 0.8) {
        await this.run(`
          INSERT INTO att_sessions
          (date, duration_minutes, completed, attentional_control_rating,
           intrusions, intrusion_count, shift_ease_rating, script_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          dateStr,
          12,
          1,
          60 + (7 - daysAgo) * 3, // Improving control
          1,
          Math.max(1, 5 - Math.floor((7 - daysAgo) / 2)), // Fewer intrusions
          65 + (7 - daysAgo) * 2,
          'standard'
        ]);
      }

      // Generate 2-3 DM practices
      const dmCount = this.randomInRange(2, 3);
      const timeSlots = ['morning', 'midday', 'evening'];

      for (let i = 0; i < dmCount; i++) {
        await this.run(`
          INSERT INTO dm_practices
          (date, time_of_day, duration_seconds, engaged_vs_watched,
           confidence_rating, metaphor_used)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          dateStr,
          timeSlots[i % 3],
          this.randomInRange(90, 120),
          'watched',
          65 + (7 - daysAgo) * 2, // Improving confidence
          ['radio', 'screen', 'weather'][i % 3]
        ]);
      }

      // Generate postponement log every other day
      if (daysAgo % 2 === 0) {
        await this.run(`
          INSERT INTO postponement_logs
          (date, trigger_time, scheduled_time, urge_before, urge_after,
           processed, processing_duration_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          dateStr,
          '14:00',
          '18:30',
          this.randomInRange(60, 80),
          this.randomInRange(20, 40),
          1,
          15
        ]);
      }
    }

    // Add a few belief ratings
    console.log('\nAdding belief ratings...');

    const beliefDates = [
      new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0],
      new Date(today.setDate(today.getDate() + 3)).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    ];

    const beliefTypes = ['uncontrollability', 'danger', 'positive'];
    const startRatings = [80, 75, 70];

    for (let i = 0; i < beliefDates.length; i++) {
      for (let j = 0; j < beliefTypes.length; j++) {
        await this.run(`
          INSERT INTO belief_ratings
          (date, belief_type, rating, context)
          VALUES (?, ?, ?, ?)
        `, [
          beliefDates[i],
          beliefTypes[j],
          startRatings[j] - (i * 10), // Decreasing over time
          `Week ${i + 1} rating`
        ]);
      }
    }

    // Add some SAR plans
    console.log('Adding SAR plans...');

    const sarPlans = [
      { trigger: 'Email alert', if: 'I see work email', then: 'Look at 3 objects' },
      { trigger: 'Morning worry', if: 'Wake up worrying', then: 'Get up immediately' },
      { trigger: 'News urge', if: 'Want to check news', then: '1-min breathing' }
    ];

    for (const plan of sarPlans) {
      await this.run(`
        INSERT OR IGNORE INTO sar_plans
        (trigger_cue, if_statement, then_action, active, usage_count)
        VALUES (?, ?, ?, ?, ?)
      `, [plan.trigger, plan.if, plan.then, 1, this.randomInRange(3, 10)]);
    }

    // Update streaks
    console.log('Updating streaks...');

    await this.run(`
      UPDATE streaks SET current_streak = 6, longest_streak = 8 WHERE type = 'att'
    `);
    await this.run(`
      UPDATE streaks SET current_streak = 7, longest_streak = 7 WHERE type = 'dm'
    `);
    await this.run(`
      UPDATE streaks SET current_streak = 8, longest_streak = 8 WHERE type = 'logging'
    `);

    console.log('\n✅ Test data generated successfully!');
  }

  randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// CLI interface
async function main() {
  const generator = new SimpleDataGenerator();

  try {
    await generator.connect();
    await generator.generateWeekOfData();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await generator.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}