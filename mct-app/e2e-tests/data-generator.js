/**
 * Test Data Generator for MCT E2E Tests
 * Generates realistic test data for comprehensive testing
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class TestDataGenerator {
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
   * Generate a complete 4-week user journey with realistic data
   */
  async generateCompleteUserJourney() {
    console.log('📊 Generating 4-week user journey data...\n');

    // Week 1: High baseline, learning phase
    await this.generateWeekData(1, {
      startDate: '2024-01-01',
      worryRange: [60, 90],
      ruminationRange: [45, 70],
      attCompliance: 0.7,
      dmPerDay: 2,
      beliefRatings: {
        uncontrollability: 85,
        danger: 80,
        positive: 75
      }
    });

    // Week 2: Initial improvement
    await this.generateWeekData(2, {
      startDate: '2024-01-08',
      worryRange: [50, 75],
      ruminationRange: [40, 60],
      attCompliance: 0.8,
      dmPerDay: 3,
      beliefRatings: {
        uncontrollability: 75,
        danger: 70,
        positive: 65
      }
    });

    // Week 3: Significant improvement
    await this.generateWeekData(3, {
      startDate: '2024-01-15',
      worryRange: [35, 55],
      ruminationRange: [30, 45],
      attCompliance: 0.9,
      dmPerDay: 3,
      beliefRatings: {
        uncontrollability: 60,
        danger: 55,
        positive: 50
      },
      experiments: true
    });

    // Week 4: Maintained improvement
    await this.generateWeekData(4, {
      startDate: '2024-01-22',
      worryRange: [25, 40],
      ruminationRange: [20, 35],
      attCompliance: 0.95,
      dmPerDay: 3,
      beliefRatings: {
        uncontrollability: 45,
        danger: 40,
        positive: 35
      },
      experiments: true
    });

    console.log('✅ 4-week journey data generated successfully!');
  }

  async generateWeekData(weekNumber, config) {
    console.log(`Generating Week ${weekNumber} data...`);

    const startDate = new Date(config.startDate);

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Generate CAS log
      const worryMinutes = this.randomInRange(...config.worryRange);
      const ruminationMinutes = this.randomInRange(...config.ruminationRange);

      await this.run(`
        INSERT OR REPLACE INTO cas_logs
        (date, worry_minutes, rumination_minutes, monitoring_count,
         checking_count, reassurance_count, avoidance_count, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dateStr,
        worryMinutes,
        ruminationMinutes,
        this.randomInRange(3, 8),
        this.randomInRange(2, 6),
        this.randomInRange(1, 4),
        this.randomInRange(0, 3),
        `Week ${weekNumber}, Day ${day + 1} - Process-focused notes only`
      ]);

      // Generate ATT session
      if (Math.random() < config.attCompliance) {
        await this.run(`
          INSERT INTO att_sessions
          (date, duration_minutes, completed, attentional_control_rating,
           intrusions, intrusion_count, shift_ease_rating, script_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          dateStr,
          12,
          1,
          50 + (weekNumber * 10) + (day * 2), // Improving control
          1,
          Math.max(1, 6 - weekNumber), // Fewer intrusions over time
          60 + (weekNumber * 5),
          'standard'
        ]);
      }

      // Generate DM practices
      const dmCount = config.dmPerDay + (Math.random() > 0.5 ? 1 : 0);
      const timeSlots = ['morning', 'midday', 'evening'];

      for (let i = 0; i < Math.min(dmCount, 3); i++) {
        await this.run(`
          INSERT INTO dm_practices
          (date, time_of_day, duration_seconds, engaged_vs_watched,
           confidence_rating, metaphor_used)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          dateStr,
          timeSlots[i],
          this.randomInRange(90, 120),
          'watched',
          55 + (weekNumber * 8) + (day * 2), // Improving confidence
          ['radio', 'screen', 'weather'][Math.floor(Math.random() * 3)]
        ]);
      }

      // Generate postponement logs
      if (day % 2 === 0) {
        await this.run(`
          INSERT INTO postponement_logs
          (date, trigger_time, scheduled_time, urge_before, urge_after,
           processed, processing_duration_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          dateStr,
          '14:00',
          '18:30',
          this.randomInRange(60, 90),
          this.randomInRange(20, 50),
          1,
          15
        ]);
      }
    }

    // Add belief ratings for the week
    await this.run(`
      INSERT INTO belief_ratings
      (date, belief_type, rating, context)
      VALUES (?, ?, ?, ?)
    `, [
      new Date(startDate).toISOString().split('T')[0],
      'uncontrollability',
      config.beliefRatings.uncontrollability,
      `Week ${weekNumber} rating`
    ]);

    await this.run(`
      INSERT INTO belief_ratings
      (date, belief_type, rating, context)
      VALUES (?, ?, ?, ?)
    `, [
      new Date(startDate).toISOString().split('T')[0],
      'danger',
      config.beliefRatings.danger,
      `Week ${weekNumber} rating`
    ]);

    await this.run(`
      INSERT INTO belief_ratings
      (date, belief_type, rating, context)
      VALUES (?, ?, ?, ?)
    `, [
      new Date(startDate).toISOString().split('T')[0],
      'positive',
      config.beliefRatings.positive,
      `Week ${weekNumber} rating`
    ]);

    // Add experiments if specified
    if (config.experiments) {
      await this.generateExperiment(weekNumber, startDate);
    }

    // Unlock module for the week
    await this.run(`
      UPDATE program_modules
      SET unlocked = 1, unlocked_date = ?
      WHERE week_number = ?
    `, [
      new Date(startDate).toISOString(),
      weekNumber
    ]);

    // Mark previous module as completed
    if (weekNumber > 0) {
      await this.run(`
        UPDATE program_modules
        SET completed = 1, completed_date = ?
        WHERE week_number = ?
      `, [
        new Date(startDate).toISOString(),
        weekNumber - 1
      ]);
    }

    console.log(`  ✓ Week ${weekNumber} data generated`);
  }

  async generateExperiment(weekNumber, startDate) {
    const experimentTemplates = [
      {
        id: 'postponement-control',
        name: 'Postponement Control Test',
        belief: 'uncontrollability'
      },
      {
        id: 'attention-flexibility',
        name: 'Attention Flexibility Test',
        belief: 'danger'
      },
      {
        id: 'worry-usefulness',
        name: 'Worry Usefulness Test',
        belief: 'positive'
      }
    ];

    const template = experimentTemplates[weekNumber % 3];

    const result = await this.run(`
      INSERT INTO experiments
      (template_id, week_number, belief_tested, prediction,
       protocol_steps, status, belief_rating_before, started_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      template.id,
      weekNumber,
      template.belief,
      'I predict 60% success rate',
      JSON.stringify(['Step 1: Observe', 'Step 2: Test', 'Step 3: Record']),
      'in_progress',
      75 - (weekNumber * 5),
      new Date(startDate).toISOString()
    ]);

    // Add experiment sessions
    for (let session = 1; session <= 3; session++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + session);

      await this.run(`
        INSERT INTO experiment_sessions
        (experiment_id, session_date, session_number, data, completed)
        VALUES (?, ?, ?, ?, ?)
      `, [
        result.id,
        sessionDate.toISOString().split('T')[0],
        session,
        JSON.stringify({ success: true, notes: `Session ${session} completed` }),
        1
      ]);
    }

    // Complete the experiment
    await this.run(`
      UPDATE experiments
      SET status = 'completed',
          outcome = 'Successfully completed with 80% success rate',
          learning = 'More control than expected',
          belief_rating_after = ?,
          completed_at = ?
      WHERE id = ?
    `, [
      60 - (weekNumber * 5),
      new Date(startDate).toISOString(),
      result.id
    ]);
  }

  async generateSARPlans() {
    console.log('Generating SAR plans...');

    const sarPlans = [
      {
        trigger: 'Email notification',
        if: 'I see a work email',
        then: 'Focus on 3 objects around me'
      },
      {
        trigger: 'Morning routine',
        if: 'I wake up and start worrying',
        then: 'Get up and make breakfast'
      },
      {
        trigger: 'News trigger',
        if: 'I feel urge to check news',
        then: 'Do 1-minute DM practice'
      },
      {
        trigger: 'Social media',
        if: 'I open social media',
        then: 'Set 5-minute timer'
      }
    ];

    for (const plan of sarPlans) {
      await this.run(`
        INSERT OR IGNORE INTO sar_plans
        (trigger_cue, if_statement, then_action, active, usage_count)
        VALUES (?, ?, ?, ?, ?)
      `, [plan.trigger, plan.if, plan.then, 1, this.randomInRange(5, 20)]);
    }

    console.log('  ✓ SAR plans generated');
  }

  async updateStreaks() {
    console.log('Updating streaks...');

    // Update ATT streak
    await this.run(`
      UPDATE streaks
      SET current_streak = ?, longest_streak = ?, last_activity_date = ?
      WHERE type = 'att'
    `, [7, 14, '2024-01-28']);

    // Update DM streak
    await this.run(`
      UPDATE streaks
      SET current_streak = ?, longest_streak = ?, last_activity_date = ?
      WHERE type = 'dm'
    `, [10, 21, '2024-01-28']);

    // Update logging streak
    await this.run(`
      UPDATE streaks
      SET current_streak = ?, longest_streak = ?, last_activity_date = ?
      WHERE type = 'logging'
    `, [28, 28, '2024-01-28']);

    console.log('  ✓ Streaks updated');
  }

  async clearAllData() {
    console.log('🧹 Clearing all test data...');

    const tables = [
      'cas_logs',
      'att_sessions',
      'dm_practices',
      'postponement_logs',
      'experiments',
      'experiment_sessions',
      'belief_ratings',
      'sar_plans'
    ];

    for (const table of tables) {
      await this.run(`DELETE FROM ${table}`);
      console.log(`  ✓ Cleared ${table}`);
    }

    // Reset modules
    await this.run(`
      UPDATE program_modules
      SET unlocked = 0, completed = 0,
          unlocked_date = NULL, completed_date = NULL
      WHERE week_number > 0
    `);

    // Reset streaks
    await this.run(`
      UPDATE streaks
      SET current_streak = 0, longest_streak = 0, last_activity_date = NULL
    `);

    console.log('✅ All test data cleared');
  }

  randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// CLI interface
async function main() {
  const generator = new TestDataGenerator();

  try {
    await generator.connect();

    const command = process.argv[2];

    switch (command) {
      case 'generate':
        await generator.generateCompleteUserJourney();
        await generator.generateSARPlans();
        await generator.updateStreaks();
        break;

      case 'clear':
        await generator.clearAllData();
        break;

      case 'reset':
        await generator.clearAllData();
        await generator.generateCompleteUserJourney();
        await generator.generateSARPlans();
        await generator.updateStreaks();
        break;

      default:
        console.log(`
MCT Test Data Generator

Usage:
  node data-generator.js generate  - Generate 4-week test data
  node data-generator.js clear     - Clear all test data
  node data-generator.js reset     - Clear and regenerate data

Examples:
  node data-generator.js generate
  node data-generator.js clear
        `);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await generator.close();
  }
}

// Export for use in tests
module.exports = { TestDataGenerator };

// Run if executed directly
if (require.main === module) {
  main();
}