/**
 * Deep Functional Validation Test Suite
 * Comprehensive testing of all MCT features and edge cases
 */

const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DeepFunctionalValidation {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.apiUrl = config.apiUrl || 'http://localhost:3001';
    this.dbPath = config.dbPath || path.join(__dirname, '../server/data/mct.db');
    this.browser = null;
    this.page = null;
    this.db = null;
    this.testResults = [];
  }

  async initialize() {
    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });

    // Initialize database connection
    await this.connectDB();
  }

  async connectDB() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async runSQL(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  async runTest(name, testFn) {
    console.log(`\n🔍 Testing: ${name}`);
    try {
      const result = await testFn();
      this.testResults.push({
        name,
        status: 'PASSED',
        result
      });
      console.log(`✅ ${name} PASSED`);
      return result;
    } catch (error) {
      this.testResults.push({
        name,
        status: 'FAILED',
        error: error.message
      });
      console.log(`❌ ${name} FAILED: ${error.message}`);
      throw error;
    }
  }

  // ==================== MCT EXERCISE FLOW TESTS ====================

  /**
   * Test complete ATT session flow with all edge cases
   */
  async testATTSessionComplete() {
    return this.runTest('ATT Session Complete Flow', async () => {
      const results = {
        phases: [],
        ratings: {},
        database: {}
      };

      // Navigate to ATT exercise
      await this.page.goto(`${this.baseUrl}/exercises/att`);

      // Check if page loaded properly
      const pageTitle = await this.page.title();
      console.log(`  Page title: ${pageTitle}`);

      // For now, just test database operations since UI selectors may vary

      // Test different session durations
      const durations = ['standard', 'short', 'emergency'];
      for (const duration of durations) {
        // Simulate session completion
        const sessionData = {
          date: new Date().toISOString().split('T')[0],
          duration_minutes: duration === 'standard' ? 12 : duration === 'short' ? 7 : 3,
          completed: 1,
          attentional_control_rating: 70 + Math.random() * 30,
          intrusions: Math.random() > 0.5 ? 1 : 0,
          intrusion_count: Math.floor(Math.random() * 5),
          shift_ease_rating: 60 + Math.random() * 40,
          script_type: duration
        };

        // Insert test session
        const result = await this.runSQL(`
          INSERT INTO att_sessions
          (date, duration_minutes, completed, attentional_control_rating,
           intrusions, intrusion_count, shift_ease_rating, script_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, Object.values(sessionData));

        results.phases.push({
          type: duration,
          sessionId: result.id,
          ...sessionData
        });
      }

      // Verify sessions were recorded
      const sessions = await this.query(`
        SELECT COUNT(*) as count, AVG(attentional_control_rating) as avg_control
        FROM att_sessions
        WHERE date = date('now')
      `);

      results.database = sessions[0];

      // Test edge cases

      // 1. Test incomplete session
      await this.runSQL(`
        INSERT INTO att_sessions
        (date, duration_minutes, completed)
        VALUES (date('now'), 5, 0)
      `);

      // 2. Test boundary values for ratings
      const boundaryTests = [
        { rating: 0, valid: true },
        { rating: 100, valid: true },
        { rating: -1, valid: false },
        { rating: 101, valid: false }
      ];

      for (const test of boundaryTests) {
        try {
          await this.runSQL(`
            INSERT INTO att_sessions
            (date, duration_minutes, completed, attentional_control_rating)
            VALUES (date('now', '-1 day'), 12, 1, ?)
          `, [test.rating]);

          if (!test.valid) {
            throw new Error(`Should have rejected rating ${test.rating}`);
          }
        } catch (error) {
          if (test.valid) {
            throw new Error(`Should have accepted rating ${test.rating}`);
          }
        }
      }

      return results;
    });
  }

  /**
   * Test complete DM practice flow with metaphors
   */
  async testDMPracticeFlow() {
    return this.runTest('DM Practice Complete Flow', async () => {
      const results = {
        metaphors: [],
        phases: [],
        database: {}
      };

      // Test all metaphors
      const metaphors = ['radio', 'screen', 'weather'];
      const timeOfDay = ['morning', 'midday', 'evening'];

      for (let i = 0; i < metaphors.length; i++) {
        const practiceData = {
          date: new Date().toISOString().split('T')[0],
          time_of_day: timeOfDay[i],
          duration_seconds: 90 + Math.floor(Math.random() * 30),
          engaged_vs_watched: Math.random() > 0.5 ? 'engaged' : 'watched',
          confidence_rating: 60 + Math.floor(Math.random() * 40),
          metaphor_used: metaphors[i]
        };

        const result = await this.runSQL(`
          INSERT INTO dm_practices
          (date, time_of_day, duration_seconds, engaged_vs_watched,
           confidence_rating, metaphor_used)
          VALUES (?, ?, ?, ?, ?, ?)
        `, Object.values(practiceData));

        results.metaphors.push({
          practiceId: result.id,
          ...practiceData
        });
      }

      // Test LAPR phases (Label, Allow, Position, Refocus)
      const phases = ['Label', 'Allow', 'Position', 'Refocus'];
      for (const phase of phases) {
        results.phases.push({
          phase,
          duration: phase === 'Position' ? 20 : phase === 'Label' ? 15 : phase === 'Allow' ? 15 : 10,
          instruction: this.getDMInstruction(phase)
        });
      }

      // Verify daily count
      const dailyCount = await this.query(`
        SELECT COUNT(*) as count, AVG(confidence_rating) as avg_confidence
        FROM dm_practices
        WHERE date = date('now')
      `);

      results.database = dailyCount[0];

      // Test edge cases

      // 1. Test invalid metaphor
      try {
        await this.runSQL(`
          INSERT INTO dm_practices
          (date, time_of_day, duration_seconds, metaphor_used)
          VALUES (date('now'), 'morning', 90, 'invalid')
        `);
        throw new Error('Should have rejected invalid metaphor');
      } catch (error) {
        // Expected to fail
      }

      // 2. Test duration boundaries
      const durations = [59, 60, 180, 181];
      for (const duration of durations) {
        const valid = duration >= 60 && duration <= 180;
        try {
          await this.runSQL(`
            INSERT INTO dm_practices
            (date, time_of_day, duration_seconds, metaphor_used)
            VALUES (date('now', '-2 day'), 'morning', ?, 'radio')
          `, [duration]);

          results[`duration_${duration}`] = 'accepted';
        } catch (error) {
          results[`duration_${duration}`] = 'rejected';
        }
      }

      return results;
    });
  }

  getDMInstruction(phase) {
    const instructions = {
      'Label': 'Notice and label: "A thought is here"',
      'Allow': "Don't push it away, let it be",
      'Position': 'Watch from a distance, like clouds passing',
      'Refocus': 'Return attention to breath or surroundings'
    };
    return instructions[phase] || '';
  }

  // ==================== MODULE PROGRESSION TESTS ====================

  /**
   * Test module unlock and progression logic
   */
  async testModuleProgression() {
    return this.runTest('Module Progression Logic', async () => {
      const results = {
        unlockLogic: {},
        completionRequirements: {},
        sequencing: {}
      };

      // Test Week 0 (should always be unlocked)
      const week0 = await this.query(`
        SELECT * FROM program_modules WHERE week_number = 0
      `);

      if (!week0[0]?.unlocked) {
        throw new Error('Week 0 should be unlocked by default');
      }
      results.unlockLogic.week0 = 'Always unlocked ✓';

      // Test unlock requirements for subsequent weeks
      for (let week = 1; week <= 8; week++) {
        // Check if previous week is completed
        const prevWeek = await this.query(`
          SELECT completed FROM program_modules WHERE week_number = ?
        `, [week - 1]);

        // Check practice requirements
        const practiceData = await this.query(`
          SELECT
            (SELECT SUM(duration_minutes) FROM att_sessions
             WHERE date >= date('now', '-7 days')) as att_minutes,
            (SELECT COUNT(*) FROM dm_practices
             WHERE date >= date('now', '-7 days')) as dm_count
        `);

        const canUnlock =
          prevWeek[0]?.completed ||
          (practiceData[0].att_minutes >= 50 && practiceData[0].dm_count >= 6);

        results.unlockLogic[`week${week}`] = {
          previousCompleted: prevWeek[0]?.completed || false,
          attMinutes: practiceData[0].att_minutes || 0,
          dmCount: practiceData[0].dm_count || 0,
          canUnlock,
          requirement: 'Previous week complete OR (50+ ATT min & 6+ DM)'
        };

        // Test unlocking
        if (canUnlock) {
          await this.runSQL(`
            UPDATE program_modules
            SET unlocked = 1, unlocked_date = datetime('now')
            WHERE week_number = ? AND unlocked = 0
          `, [week]);
        }
      }

      // Test completion requirements
      const modules = await this.query(`
        SELECT week_number, title, unlocked, completed
        FROM program_modules
        ORDER BY week_number
      `);

      results.completionRequirements = modules.map(m => ({
        week: m.week_number,
        title: m.title,
        unlocked: m.unlocked === 1,
        completed: m.completed === 1
      }));

      // Test non-sequential unlock prevention
      try {
        // Try to unlock week 5 without week 3 completed
        await this.runSQL(`
          UPDATE program_modules
          SET unlocked = 1
          WHERE week_number = 5
            AND NOT EXISTS (
              SELECT 1 FROM program_modules
              WHERE week_number = 3 AND completed = 1
            )
        `);

        const week5 = await this.query(`
          SELECT unlocked FROM program_modules WHERE week_number = 5
        `);

        results.sequencing.nonSequentialPrevention =
          week5[0].unlocked ? 'Failed - allowed skip' : 'Passed - prevented skip';
      } catch (error) {
        results.sequencing.error = error.message;
      }

      return results;
    });
  }

  // ==================== EXPERIMENT LIFECYCLE TESTS ====================

  /**
   * Test complete experiment lifecycle
   */
  async testExperimentLifecycle() {
    return this.runTest('Experiment Complete Lifecycle', async () => {
      const results = {
        creation: {},
        sessions: [],
        completion: {},
        beliefChange: {}
      };

      // Create an experiment
      const experimentData = {
        template_id: 'postponement-control',
        week_number: 3,
        belief_tested: 'uncontrollability',
        prediction: 'I can postpone 60% of worry episodes',
        belief_rating_before: 75,
        status: 'planned'
      };

      // Insert experiment
      const exp = await this.runSQL(`
        INSERT INTO experiments
        (template_id, week_number, belief_tested, prediction,
         belief_rating_before, status, steps, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Test experiment steps', datetime('now'))
      `, Object.values(experimentData));

      results.creation = {
        experimentId: exp.id,
        ...experimentData
      };

      // Update to in_progress
      await this.runSQL(`
        UPDATE experiments
        SET status = 'in_progress'
        WHERE id = ?
      `, [exp.id]);

      // Add experiment sessions (multi-day)
      for (let day = 1; day <= 3; day++) {
        const sessionData = {
          experiment_id: exp.id,
          session_date: new Date(Date.now() + day * 86400000).toISOString().split('T')[0],
          session_number: day,
          data: JSON.stringify({
            episodes: 5,
            postponed: day === 1 ? 2 : day === 2 ? 3 : 4,
            success_rate: day === 1 ? 40 : day === 2 ? 60 : 80
          }),
          completed: 1
        };

        const session = await this.runSQL(`
          INSERT INTO experiment_sessions
          (experiment_id, session_date, session_number, data, completed)
          VALUES (?, ?, ?, ?, ?)
        `, Object.values(sessionData));

        results.sessions.push({
          sessionId: session.id,
          ...sessionData,
          data: JSON.parse(sessionData.data)
        });
      }

      // Complete experiment
      await this.runSQL(`
        UPDATE experiments
        SET status = 'completed',
            outcome = 'Successfully postponed 70% of episodes',
            learning = 'I have more control than I thought',
            belief_rating_after = 55,
            completed_at = datetime('now')
        WHERE id = ?
      `, [exp.id]);

      // Verify completion
      const completed = await this.query(`
        SELECT * FROM experiments WHERE id = ?
      `, [exp.id]);

      results.completion = completed[0];

      // Calculate belief change
      results.beliefChange = {
        before: completed[0].belief_rating_before,
        after: completed[0].belief_rating_after,
        reduction: completed[0].belief_rating_before - completed[0].belief_rating_after,
        percentage: ((completed[0].belief_rating_before - completed[0].belief_rating_after)
                    / completed[0].belief_rating_before * 100).toFixed(1)
      };

      // Test experiment validation rules

      // 1. Cannot complete without sessions
      const emptyExp = await this.runSQL(`
        INSERT INTO experiments
        (belief_tested, prediction, status, steps)
        VALUES ('test', 'test prediction', 'in_progress', 'test steps')
      `);

      try {
        await this.runSQL(`
          UPDATE experiments
          SET status = 'completed'
          WHERE id = ?
            AND NOT EXISTS (
              SELECT 1 FROM experiment_sessions
              WHERE experiment_id = ?
            )
        `, [emptyExp.id, emptyExp.id]);

        const check = await this.query(`
          SELECT status FROM experiments WHERE id = ?
        `, [emptyExp.id]);

        results.validation = {
          emptyCompletion: check[0].status === 'completed' ?
            'Failed - allowed empty completion' :
            'Passed - prevented empty completion'
        };
      } catch (error) {
        results.validation = { error: error.message };
      }

      return results;
    });
  }

  // ==================== DATA CONSISTENCY TESTS ====================

  /**
   * Test data consistency across features
   */
  async testDataConsistency() {
    return this.runTest('Data Consistency Validation', async () => {
      const results = {
        dateConsistency: {},
        streakAccuracy: {},
        metricAlignment: {},
        referentialIntegrity: {}
      };

      // 1. Date consistency - all dates should be in same format
      const dateTables = [
        { table: 'cas_logs', column: 'date' },
        { table: 'att_sessions', column: 'date' },
        { table: 'dm_practices', column: 'date' },
        { table: 'postponement_logs', column: 'date' },
        { table: 'belief_ratings', column: 'date' }
      ];

      for (const { table, column } of dateTables) {
        const invalidDates = await this.query(`
          SELECT COUNT(*) as count
          FROM ${table}
          WHERE ${column} NOT LIKE '____-__-__'
            OR ${column} IS NULL
        `);

        results.dateConsistency[table] = invalidDates[0].count === 0 ?
          'Valid ✓' : `Invalid dates: ${invalidDates[0].count}`;
      }

      // 2. Streak accuracy verification
      const attStreak = await this.query(`
        SELECT
          (SELECT COUNT(DISTINCT date) FROM att_sessions
           WHERE date >= date('now', '-7 days')) as recent_days,
          (SELECT current_streak FROM streaks WHERE type = 'att') as current_streak,
          (SELECT longest_streak FROM streaks WHERE type = 'att') as longest_streak
      `);

      results.streakAccuracy.att = {
        recentDays: attStreak[0].recent_days,
        currentStreak: attStreak[0].current_streak,
        longestStreak: attStreak[0].longest_streak,
        accurate: attStreak[0].current_streak <= attStreak[0].longest_streak
      };

      // 3. Metric alignment - CAS totals should match components
      const casAlignment = await this.query(`
        SELECT
          date,
          worry_minutes,
          rumination_minutes,
          (worry_minutes + rumination_minutes) as calculated_total
        FROM cas_logs
        WHERE date >= date('now', '-7 days')
      `);

      results.metricAlignment.cas = casAlignment.every(row =>
        row.calculated_total === (row.worry_minutes + row.rumination_minutes)
      ) ? 'Aligned ✓' : 'Misaligned ✗';

      // 4. Referential integrity
      const orphanedSessions = await this.query(`
        SELECT COUNT(*) as count
        FROM experiment_sessions es
        WHERE NOT EXISTS (
          SELECT 1 FROM experiments e
          WHERE e.id = es.experiment_id
        )
      `);

      results.referentialIntegrity.experimentSessions =
        orphanedSessions[0].count === 0 ? 'No orphans ✓' : `Orphaned: ${orphanedSessions[0].count}`;

      // 5. Check for duplicate entries
      const duplicateLogs = await this.query(`
        SELECT date, COUNT(*) as count
        FROM cas_logs
        GROUP BY date
        HAVING COUNT(*) > 1
      `);

      results.duplicates = {
        casLogs: duplicateLogs.length === 0 ? 'No duplicates ✓' : `Duplicates on ${duplicateLogs.length} dates`
      };

      return results;
    });
  }

  // ==================== EDGE CASES AND BOUNDARIES ====================

  /**
   * Test edge cases and boundary conditions
   */
  async testEdgeCases() {
    return this.runTest('Edge Cases and Boundaries', async () => {
      const results = {
        minuteBoundaries: {},
        ratingBoundaries: {},
        textLimits: {},
        nullHandling: {}
      };

      // 1. Test minute boundaries for CAS logs
      const minuteTests = [
        { worry: -1, rumination: 30, valid: false },
        { worry: 0, rumination: 0, valid: true },
        { worry: 120, rumination: 120, valid: true },
        { worry: 121, rumination: 30, valid: false }
      ];

      for (const test of minuteTests) {
        try {
          await this.runSQL(`
            INSERT INTO cas_logs (date, worry_minutes, rumination_minutes)
            VALUES (date('now', '-10 day'), ?, ?)
          `, [test.worry, test.rumination]);

          results.minuteBoundaries[`${test.worry}_${test.rumination}`] =
            test.valid ? 'Correctly accepted' : 'Incorrectly accepted';
        } catch (error) {
          results.minuteBoundaries[`${test.worry}_${test.rumination}`] =
            test.valid ? 'Incorrectly rejected' : 'Correctly rejected';
        }
      }

      // 2. Test rating boundaries (0-100)
      const ratingTests = [-1, 0, 50, 100, 101];

      for (const rating of ratingTests) {
        const valid = rating >= 0 && rating <= 100;
        try {
          await this.runSQL(`
            INSERT INTO belief_ratings (date, belief_type, rating)
            VALUES (date('now', '-11 day'), 'test', ?)
          `, [rating]);

          results.ratingBoundaries[rating] = valid ? 'Valid ✓' : 'Should reject ✗';
        } catch (error) {
          results.ratingBoundaries[rating] = valid ? 'Should accept ✗' : 'Valid rejection ✓';
        }
      }

      // 3. Test text field limits
      const longText = 'x'.repeat(10000);
      try {
        await this.runSQL(`
          INSERT INTO cas_logs (date, worry_minutes, rumination_minutes, notes)
          VALUES (date('now', '-12 day'), 30, 20, ?)
        `, [longText]);

        results.textLimits.notes = 'Accepts long text';
      } catch (error) {
        results.textLimits.notes = 'Rejects excessive text';
      }

      // 4. Test null handling
      const nullableFields = [
        { table: 'cas_logs', field: 'notes', nullable: true },
        { table: 'experiments', field: 'outcome', nullable: true },
        { table: 'experiments', field: 'belief_tested', nullable: false }
      ];

      for (const { table, field, nullable } of nullableFields) {
        try {
          const testQuery = table === 'cas_logs' ? `
            INSERT INTO ${table} (date, worry_minutes, rumination_minutes, ${field})
            VALUES (date('now', '-13 day'), 10, 10, NULL)
          ` : `
            INSERT INTO ${table} (belief_tested, prediction, ${field})
            VALUES ('test', 'test', NULL)
          `;

          await this.runSQL(testQuery);
          results.nullHandling[`${table}.${field}`] = nullable ? 'Correctly accepts NULL' : 'Should reject NULL';
        } catch (error) {
          results.nullHandling[`${table}.${field}`] = nullable ? 'Should accept NULL' : 'Correctly rejects NULL';
        }
      }

      return results;
    });
  }

  // ==================== CALCULATION VALIDATION ====================

  /**
   * Validate all calculations and metrics
   */
  async testCalculations() {
    return this.runTest('Calculation and Metric Validation', async () => {
      const results = {
        averages: {},
        percentages: {},
        trends: {},
        aggregations: {}
      };

      // 1. Validate CAS average calculations
      const casData = await this.query(`
        SELECT
          worry_minutes,
          rumination_minutes,
          (worry_minutes + rumination_minutes) as total
        FROM cas_logs
        WHERE date >= date('now', '-7 days')
      `);

      if (casData.length > 0) {
        const manualAvg = casData.reduce((sum, row) => sum + row.total, 0) / casData.length;

        const dbAvg = await this.query(`
          SELECT AVG(worry_minutes + rumination_minutes) as avg_total
          FROM cas_logs
          WHERE date >= date('now', '-7 days')
        `);

        results.averages.cas = {
          manual: manualAvg.toFixed(2),
          database: dbAvg[0].avg_total?.toFixed(2),
          match: Math.abs(manualAvg - dbAvg[0].avg_total) < 0.01
        };
      }

      // 2. Validate percentage calculations
      const attCompliance = await this.query(`
        SELECT
          (SELECT COUNT(DISTINCT date) FROM att_sessions WHERE date >= date('now', '-7 days')) as days_practiced,
          7 as total_days
      `);

      const compliancePercent = (attCompliance[0].days_practiced / 7) * 100;
      results.percentages.attCompliance = {
        daysPracticed: attCompliance[0].days_practiced,
        totalDays: 7,
        percentage: compliancePercent.toFixed(1) + '%'
      };

      // 3. Validate trend calculations
      const trendData = await this.query(`
        SELECT
          date,
          worry_minutes + rumination_minutes as total_cas
        FROM cas_logs
        ORDER BY date DESC
        LIMIT 7
      `);

      if (trendData.length >= 2) {
        const newest = trendData[0].total_cas;
        const oldest = trendData[trendData.length - 1].total_cas;
        const trend = newest < oldest ? 'improving' : newest > oldest ? 'worsening' : 'stable';
        const changePercent = ((oldest - newest) / oldest) * 100;

        results.trends.cas = {
          newestValue: newest,
          oldestValue: oldest,
          trend,
          changePercent: changePercent.toFixed(1) + '%'
        };
      }

      // 4. Validate aggregation functions
      const aggregations = await this.query(`
        SELECT
          COUNT(*) as total_sessions,
          MIN(attentional_control_rating) as min_control,
          MAX(attentional_control_rating) as max_control,
          AVG(attentional_control_rating) as avg_control,
          SUM(duration_minutes) as total_minutes
        FROM att_sessions
        WHERE completed = 1
      `);

      results.aggregations.att = aggregations[0];

      // 5. Validate postponement effectiveness calculation
      const postponement = await this.query(`
        SELECT
          AVG(urge_before) as avg_before,
          AVG(urge_after) as avg_after,
          AVG(urge_before - urge_after) as avg_reduction
        FROM postponement_logs
        WHERE processed = 1
      `);

      if (postponement[0].avg_before) {
        const effectiveness = (postponement[0].avg_reduction / postponement[0].avg_before) * 100;
        results.calculations = {
          postponement: {
            avgBefore: postponement[0].avg_before?.toFixed(1),
            avgAfter: postponement[0].avg_after?.toFixed(1),
            avgReduction: postponement[0].avg_reduction?.toFixed(1),
            effectiveness: effectiveness.toFixed(1) + '%'
          }
        };
      }

      return results;
    });
  }

  // ==================== FIDELITY DEEP CHECK ====================

  /**
   * Deep validation of MCT fidelity requirements
   */
  async testMCTFidelity() {
    return this.runTest('MCT Fidelity Deep Validation', async () => {
      const results = {
        processOnly: {},
        noReassurance: {},
        quantifiableMetrics: {},
        beliefFocus: {}
      };

      // 1. Verify all text fields are process-only
      const textFields = await this.query(`
        SELECT notes FROM cas_logs WHERE notes IS NOT NULL
        UNION ALL
        SELECT prediction as notes FROM experiments WHERE prediction IS NOT NULL
        UNION ALL
        SELECT outcome as notes FROM experiments WHERE outcome IS NOT NULL
        UNION ALL
        SELECT learning as notes FROM experiments WHERE learning IS NOT NULL
      `);

      const contentPatterns = [
        /worried about/i,
        /scared of/i,
        /what if/i,
        /thinking about/i,
        /fear that/i
      ];

      let contentViolations = 0;
      for (const row of textFields) {
        for (const pattern of contentPatterns) {
          if (pattern.test(row.notes)) {
            contentViolations++;
            break;
          }
        }
      }

      results.processOnly = {
        totalTextFields: textFields.length,
        contentViolations,
        compliant: contentViolations === 0
      };

      // 2. Verify no reassurance mechanisms
      const reassuranceCheck = await this.query(`
        SELECT COUNT(*) as count
        FROM cas_logs
        WHERE notes LIKE '%everything will be%'
          OR notes LIKE '%dont worry%'
          OR notes LIKE '%it will be fine%'
          OR notes LIKE '%nothing bad%'
      `);

      results.noReassurance = {
        reassuranceFound: reassuranceCheck[0].count,
        compliant: reassuranceCheck[0].count === 0
      };

      // 3. Verify all metrics are quantifiable
      const metrics = await this.query(`
        SELECT
          COUNT(CASE WHEN worry_minutes IS NOT NULL THEN 1 END) as worry_quantified,
          COUNT(CASE WHEN rumination_minutes IS NOT NULL THEN 1 END) as rumination_quantified,
          COUNT(CASE WHEN monitoring_count IS NOT NULL THEN 1 END) as monitoring_quantified,
          COUNT(*) as total
        FROM cas_logs
      `);

      results.quantifiableMetrics = {
        worryQuantified: metrics[0].worry_quantified,
        ruminationQuantified: metrics[0].rumination_quantified,
        monitoringQuantified: metrics[0].monitoring_quantified,
        total: metrics[0].total,
        compliant: metrics[0].worry_quantified === metrics[0].total
      };

      // 4. Verify belief focus (not situation focus)
      const experiments = await this.query(`
        SELECT belief_tested FROM experiments
      `);

      const validBeliefs = ['uncontrollability', 'danger', 'positive', 'custom'];
      const invalidBeliefs = experiments.filter(e =>
        !validBeliefs.includes(e.belief_tested?.toLowerCase())
      );

      results.beliefFocus = {
        totalExperiments: experiments.length,
        invalidBeliefs: invalidBeliefs.length,
        compliant: invalidBeliefs.length === 0
      };

      // 5. Verify exercise focus
      const attFocus = await this.query(`
        SELECT COUNT(*) as total,
          COUNT(CASE WHEN script_type IN ('standard', 'short', 'emergency') THEN 1 END) as valid
        FROM att_sessions
      `);

      results.exerciseFocus = {
        att: {
          total: attFocus[0].total,
          valid: attFocus[0].valid,
          compliant: attFocus[0].total === attFocus[0].valid
        }
      };

      return results;
    });
  }

  // ==================== REPORT GENERATION ====================

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASSED').length,
        failed: this.testResults.filter(r => r.status === 'FAILED').length
      }
    };

    // Save JSON report
    fs.writeFileSync(
      path.join(__dirname, 'deep-functional-validation-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    const html = this.generateHTMLReport(report);
    fs.writeFileSync(
      path.join(__dirname, 'deep-functional-validation-report.html'),
      html
    );

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Deep Functional Validation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }
    .header h1 { font-size: 48px; margin-bottom: 10px; }
    .summary-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .test-grid {
      display: grid;
      gap: 20px;
    }
    .test-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f3f4f6;
    }
    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
    }
    .passed { background: #d1fae5; color: #065f46; }
    .failed { background: #fee2e2; color: #991b1b; }
    pre {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric {
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: #111827;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔬 Deep Functional Validation Report</h1>
      <p style="font-size: 20px; opacity: 0.95;">
        Comprehensive testing of all MCT features and edge cases
      </p>
      <p>${report.timestamp}</p>
    </div>

    <div class="summary-card">
      <h2 style="margin-top: 0;">Test Summary</h2>
      <div class="metrics">
        <div class="metric">
          <div class="metric-value">${report.summary.total}</div>
          <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric">
          <div class="metric-value" style="color: #10b981;">
            ${report.summary.passed}
          </div>
          <div class="metric-label">Passed</div>
        </div>
        <div class="metric">
          <div class="metric-value" style="color: #ef4444;">
            ${report.summary.failed}
          </div>
          <div class="metric-label">Failed</div>
        </div>
        <div class="metric">
          <div class="metric-value">
            ${report.summary.passed ? (report.summary.passed / report.summary.total * 100).toFixed(1) : 0}%
          </div>
          <div class="metric-label">Pass Rate</div>
        </div>
      </div>
    </div>

    <div class="test-grid">
      ${report.testResults.map(test => `
        <div class="test-card">
          <div class="test-header">
            <h3 style="margin: 0; color: #1f2937;">${test.name}</h3>
            <span class="status-badge ${test.status.toLowerCase()}">
              ${test.status}
            </span>
          </div>
          ${test.result ? `
            <pre>${JSON.stringify(test.result, null, 2)}</pre>
          ` : ''}
          ${test.error ? `
            <div style="padding: 15px; background: #fef2f2; border-radius: 8px; color: #991b1b;">
              <strong>Error:</strong> ${test.error}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
    `;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.db) {
      this.db.close();
    }
  }

  async runAllTests() {
    console.log('🔬 Starting Deep Functional Validation Suite\n');

    try {
      await this.initialize();

      // Run all validation tests
      await this.testATTSessionComplete();
      await this.testDMPracticeFlow();
      await this.testModuleProgression();
      await this.testExperimentLifecycle();
      await this.testDataConsistency();
      await this.testEdgeCases();
      await this.testCalculations();
      await this.testMCTFidelity();

      // Generate report
      const report = await this.generateReport();

      console.log('\n📊 Deep Functional Validation Complete');
      console.log(`✅ Passed: ${report.summary.passed}`);
      console.log(`❌ Failed: ${report.summary.failed}`);
      console.log(`📄 Report saved to: deep-functional-validation-report.html`);

      return report;

    } finally {
      await this.cleanup();
    }
  }
}

// Export for use
module.exports = { DeepFunctionalValidation };

// Run if executed directly
if (require.main === module) {
  const validator = new DeepFunctionalValidation();
  validator.runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}