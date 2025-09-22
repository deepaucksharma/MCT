const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseVerificationSuite {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, '../server/data/mct.db');
    this.db = null;
    this.testResults = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async runTest(testName, testFn) {
    console.log(`Running: ${testName}`);
    try {
      const result = await testFn();
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        result
      });
      console.log(`✅ ${testName} PASSED`);
      return result;
    } catch (error) {
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      console.log(`❌ ${testName} FAILED: ${error.message}`);
      throw error;
    }
  }

  // ONBOARDING VERIFICATION TESTS
  async verifyOnboardingCompletion(userId = 1) {
    return this.runTest('Onboarding Completion', async () => {
      const result = await this.runQuery(
        'SELECT * FROM user_settings WHERE id = ?',
        [userId]
      );

      if (!result.length) throw new Error('User settings not found');
      const settings = result[0];

      // Verify onboarding completed
      if (!settings.onboarding_completed) {
        throw new Error('Onboarding not marked as completed');
      }

      // Verify initial assessment exists
      const assessment = await this.runQuery(
        "SELECT * FROM assessments WHERE assessment_type = 'initial'"
      );

      if (!assessment.length) {
        throw new Error('Initial assessment not found');
      }

      return {
        onboarding_completed: settings.onboarding_completed,
        onboarding_date: settings.onboarding_date,
        initial_assessment: assessment[0]
      };
    });
  }

  // CAS LOGGING VERIFICATION TESTS
  async verifyCASLog(date) {
    return this.runTest(`CAS Log for ${date}`, async () => {
      const result = await this.runQuery(
        'SELECT * FROM cas_logs WHERE date = ?',
        [date]
      );

      if (!result.length) throw new Error(`No CAS log found for ${date}`);
      const log = result[0];

      // Verify required fields - monitoring_count might have default value of 0
      const requiredFields = ['worry_minutes', 'rumination_minutes'];
      for (const field of requiredFields) {
        if (log[field] === null || log[field] === undefined) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Check monitoring_count exists (can be 0)
      if (!('monitoring_count' in log)) {
        throw new Error(`Missing field: monitoring_count`);
      }

      // Verify ranges
      if (log.worry_minutes < 0 || log.worry_minutes > 120) {
        throw new Error(`Invalid worry_minutes: ${log.worry_minutes}`);
      }

      return log;
    });
  }

  async verifyCASReduction(startDate, endDate, expectedReduction = 20) {
    return this.runTest('CAS Reduction Over Time', async () => {
      const query = `
        SELECT
          AVG(worry_minutes + rumination_minutes) as avg_cas_minutes,
          MIN(date) as period_start,
          MAX(date) as period_end,
          COUNT(*) as log_count
        FROM cas_logs
        WHERE date BETWEEN ? AND ?
      `;

      const baseline = await this.runQuery(query, [startDate, startDate]);
      const current = await this.runQuery(query, [endDate, endDate]);

      if (!baseline[0].avg_cas_minutes || !current[0].avg_cas_minutes) {
        throw new Error('Insufficient data for comparison');
      }

      const reduction = ((baseline[0].avg_cas_minutes - current[0].avg_cas_minutes)
                        / baseline[0].avg_cas_minutes) * 100;

      if (reduction < expectedReduction) {
        throw new Error(`Reduction ${reduction.toFixed(1)}% below expected ${expectedReduction}%`);
      }

      return {
        baseline_avg: baseline[0].avg_cas_minutes,
        current_avg: current[0].avg_cas_minutes,
        reduction_percentage: reduction
      };
    });
  }

  // ATT SESSION VERIFICATION TESTS
  async verifyATTSession(sessionId) {
    return this.runTest(`ATT Session ${sessionId}`, async () => {
      const result = await this.runQuery(
        'SELECT * FROM att_sessions WHERE id = ?',
        [sessionId]
      );

      if (!result.length) throw new Error('ATT session not found');
      const session = result[0];

      // Verify completion
      if (!session.completed) {
        throw new Error('ATT session not marked as completed');
      }

      // Verify duration
      if (session.duration_minutes < 7 || session.duration_minutes > 15) {
        throw new Error(`Invalid duration: ${session.duration_minutes} minutes`);
      }

      // Verify ratings
      if (session.attentional_control_rating === null) {
        throw new Error('Missing attentional control rating');
      }

      return session;
    });
  }

  async verifyATTStreak() {
    return this.runTest('ATT Streak Tracking', async () => {
      const streak = await this.runQuery(
        "SELECT * FROM streaks WHERE type = 'att'"
      );

      if (!streak.length) throw new Error('ATT streak not found');

      // Verify last 7 days of ATT sessions
      const recentSessions = await this.runQuery(`
        SELECT date, COUNT(*) as session_count
        FROM att_sessions
        WHERE date >= date('now', '-7 days')
        GROUP BY date
        ORDER BY date DESC
      `);

      return {
        current_streak: streak[0].current_streak,
        longest_streak: streak[0].longest_streak,
        recent_sessions: recentSessions
      };
    });
  }

  // DM PRACTICE VERIFICATION TESTS
  async verifyDMPractice(practiceId) {
    return this.runTest(`DM Practice ${practiceId}`, async () => {
      const result = await this.runQuery(
        'SELECT * FROM dm_practices WHERE id = ?',
        [practiceId]
      );

      if (!result.length) throw new Error('DM practice not found');
      const practice = result[0];

      // Verify duration
      if (practice.duration_seconds < 60 || practice.duration_seconds > 180) {
        throw new Error(`Invalid duration: ${practice.duration_seconds} seconds`);
      }

      // Verify metaphor
      const validMetaphors = ['radio', 'screen', 'weather', 'clouds', 'train'];
      if (!validMetaphors.includes(practice.metaphor_used)) {
        throw new Error(`Invalid metaphor: ${practice.metaphor_used}`);
      }

      // Verify confidence rating
      if (practice.confidence_rating === null) {
        throw new Error('Missing confidence rating');
      }

      return practice;
    });
  }

  async verifyDailyDMCount(date, expectedCount = 3) {
    return this.runTest(`Daily DM Count for ${date}`, async () => {
      const result = await this.runQuery(
        'SELECT COUNT(*) as count FROM dm_practices WHERE date = ?',
        [date]
      );

      if (result[0].count < expectedCount) {
        throw new Error(`Only ${result[0].count} DM practices, expected ${expectedCount}`);
      }

      return result[0];
    });
  }

  // POSTPONEMENT VERIFICATION TESTS
  async verifyPostponement(logId) {
    return this.runTest(`Postponement Log ${logId}`, async () => {
      const result = await this.runQuery(
        'SELECT * FROM postponement_logs WHERE id = ?',
        [logId]
      );

      if (!result.length) throw new Error('Postponement log not found');
      const log = result[0];

      // Verify urge reduction
      if (log.urge_after >= log.urge_before) {
        throw new Error('No urge reduction after postponement');
      }

      // Verify processing
      if (!log.processed) {
        throw new Error('Postponement not processed');
      }

      const urgeReduction = ((log.urge_before - log.urge_after) / log.urge_before) * 100;

      return {
        ...log,
        urge_reduction_percentage: urgeReduction
      };
    });
  }

  // EXPERIMENT VERIFICATION TESTS
  async verifyExperiment(experimentId) {
    return this.runTest(`Experiment ${experimentId}`, async () => {
      const experiment = await this.runQuery(
        'SELECT * FROM experiments WHERE id = ?',
        [experimentId]
      );

      if (!experiment.length) throw new Error('Experiment not found');
      const exp = experiment[0];

      // Verify completion
      if (exp.status !== 'completed') {
        throw new Error(`Experiment status: ${exp.status}, expected: completed`);
      }

      // Verify belief change
      if (exp.belief_rating_after >= exp.belief_rating_before) {
        throw new Error('No belief reduction after experiment');
      }

      // Verify sessions
      const sessions = await this.runQuery(
        'SELECT * FROM experiment_sessions WHERE experiment_id = ?',
        [experimentId]
      );

      const beliefReduction = exp.belief_rating_before - exp.belief_rating_after;

      return {
        experiment: exp,
        sessions: sessions,
        belief_reduction: beliefReduction
      };
    });
  }

  // BELIEF RATING VERIFICATION TESTS
  async verifyBeliefProgression(beliefType) {
    return this.runTest(`Belief Progression: ${beliefType}`, async () => {
      const ratings = await this.runQuery(
        'SELECT * FROM belief_ratings WHERE belief_type = ? ORDER BY date',
        [beliefType]
      );

      if (ratings.length < 2) {
        throw new Error('Insufficient belief ratings for progression analysis');
      }

      const first = ratings[0];
      const last = ratings[ratings.length - 1];
      const reduction = first.rating - last.rating;

      if (reduction < 15) {
        throw new Error(`Belief reduction only ${reduction} points, expected ≥15`);
      }

      return {
        initial_rating: first.rating,
        current_rating: last.rating,
        reduction: reduction,
        measurement_count: ratings.length
      };
    });
  }

  // FIDELITY VERIFICATION TESTS
  async verifyFidelityCompliance() {
    return this.runTest('Fidelity Compliance Check', async () => {
      const violations = await this.runQuery(
        'SELECT * FROM fidelity_violations WHERE blocked = 1'
      );

      // Check for content analysis attempts
      const contentViolations = violations.filter(v =>
        v.violation_type === 'content_analysis'
      );

      // Verify no content stored in notes
      const casNotes = await this.runQuery(
        "SELECT notes FROM cas_logs WHERE notes IS NOT NULL AND notes != ''"
      );

      for (const log of casNotes) {
        const contentPatterns = [/worried about/i, /what if/i, /thinking about/i];
        for (const pattern of contentPatterns) {
          if (pattern.test(log.notes)) {
            throw new Error('Content found in CAS log notes');
          }
        }
      }

      return {
        total_violations: violations.length,
        content_violations: contentViolations.length,
        all_blocked: violations.every(v => v.blocked)
      };
    });
  }

  // ENGAGEMENT VERIFICATION TESTS
  async verifyEngagementMetrics() {
    return this.runTest('Engagement Metrics', async () => {
      const streaks = await this.runQuery('SELECT * FROM streaks');

      const metrics = {};
      for (const streak of streaks) {
        metrics[streak.type] = {
          current: streak.current_streak,
          longest: streak.longest_streak
        };
      }

      // Verify practice consistency
      const attConsistency = await this.runQuery(`
        SELECT
          COUNT(DISTINCT date) as days_practiced,
          SUM(duration_minutes) as total_minutes
        FROM att_sessions
        WHERE date >= date('now', '-7 days')
      `);

      const dmConsistency = await this.runQuery(`
        SELECT
          COUNT(DISTINCT date) as days_practiced,
          COUNT(*) as total_practices
        FROM dm_practices
        WHERE date >= date('now', '-7 days')
      `);

      return {
        streaks: metrics,
        att_weekly: attConsistency[0],
        dm_weekly: dmConsistency[0]
      };
    });
  }

  // MODULE PROGRESSION VERIFICATION
  async verifyModuleProgression() {
    return this.runTest('Module Progression', async () => {
      const modules = await this.runQuery(
        'SELECT * FROM program_modules ORDER BY week_number'
      );

      // Verify Week 0 is unlocked
      if (!modules[0].unlocked) {
        throw new Error('Week 0 not unlocked');
      }

      // Verify sequential unlock logic
      let lastUnlocked = -1;
      for (const module of modules) {
        if (module.unlocked) {
          if (module.week_number > lastUnlocked + 1) {
            throw new Error(`Non-sequential unlock: Week ${module.week_number}`);
          }
          lastUnlocked = module.week_number;
        }
      }

      // Count completions
      const completed = modules.filter(m => m.completed).length;
      const unlocked = modules.filter(m => m.unlocked).length;

      return {
        total_modules: modules.length,
        unlocked_count: unlocked,
        completed_count: completed,
        current_week: lastUnlocked
      };
    });
  }

  // DATA INTEGRITY VERIFICATION
  async verifyDataIntegrity() {
    return this.runTest('Data Integrity Check', async () => {
      const checks = [];

      // Check for orphaned experiment sessions
      const orphanedSessions = await this.runQuery(`
        SELECT es.* FROM experiment_sessions es
        LEFT JOIN experiments e ON es.experiment_id = e.id
        WHERE e.id IS NULL
      `);

      if (orphanedSessions.length > 0) {
        checks.push({
          issue: 'Orphaned experiment sessions',
          count: orphanedSessions.length
        });
      }

      // Check for duplicate daily logs
      const duplicates = await this.runQuery(`
        SELECT date, COUNT(*) as count
        FROM cas_logs
        GROUP BY date
        HAVING COUNT(*) > 1
      `);

      if (duplicates.length > 0) {
        checks.push({
          issue: 'Duplicate CAS logs',
          dates: duplicates.map(d => d.date)
        });
      }

      // Check for invalid date formats
      const invalidDates = await this.runQuery(`
        SELECT * FROM cas_logs
        WHERE date NOT LIKE '____-__-__'
      `);

      if (invalidDates.length > 0) {
        checks.push({
          issue: 'Invalid date formats',
          count: invalidDates.length
        });
      }

      if (checks.length > 0) {
        throw new Error(`Data integrity issues found: ${JSON.stringify(checks)}`);
      }

      return { status: 'All integrity checks passed' };
    });
  }

  // PERFORMANCE METRICS
  async verifyPerformanceMetrics() {
    return this.runTest('Performance Metrics', async () => {
      // Check database size
      const dbStats = fs.statSync(this.dbPath);
      const dbSizeMB = dbStats.size / (1024 * 1024);

      // Count total records
      const tables = [
        'cas_logs', 'att_sessions', 'dm_practices',
        'postponement_logs', 'experiments', 'belief_ratings'
      ];

      const recordCounts = {};
      for (const table of tables) {
        const result = await this.runQuery(`SELECT COUNT(*) as count FROM ${table}`);
        recordCounts[table] = result[0].count;
      }

      // Check query performance
      const startTime = Date.now();
      await this.runQuery(`
        SELECT
          cl.date,
          cl.worry_minutes,
          cl.rumination_minutes,
          COUNT(att.id) as att_count,
          COUNT(dm.id) as dm_count
        FROM cas_logs cl
        LEFT JOIN att_sessions att ON cl.date = att.date
        LEFT JOIN dm_practices dm ON cl.date = dm.date
        GROUP BY cl.date
        ORDER BY cl.date DESC
        LIMIT 30
      `);
      const queryTime = Date.now() - startTime;

      if (queryTime > 100) {
        throw new Error(`Complex query took ${queryTime}ms, expected <100ms`);
      }

      return {
        database_size_mb: dbSizeMB.toFixed(2),
        record_counts: recordCounts,
        complex_query_time_ms: queryTime
      };
    });
  }

  // GENERATE COMPREHENSIVE REPORT
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      database_path: this.dbPath,
      test_results: this.testResults,
      summary: {
        total_tests: this.testResults.length,
        passed: this.testResults.filter(t => t.status === 'PASSED').length,
        failed: this.testResults.filter(t => t.status === 'FAILED').length
      }
    };

    // Write report to file
    fs.writeFileSync(
      path.join(__dirname, 'database-verification-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    const html = this.generateHTMLReport(report);
    fs.writeFileSync(
      path.join(__dirname, 'database-verification-report.html'),
      html
    );

    return report;
  }

  generateHTMLReport(report) {
    const statusColor = (status) => status === 'PASSED' ? 'green' : 'red';

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Database Verification Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #2c3e50; color: white; padding: 20px; }
    .summary { margin: 20px 0; padding: 15px; background: #ecf0f1; }
    .test-result { margin: 10px 0; padding: 10px; border-left: 4px solid; }
    .passed { border-color: #27ae60; background: #d5f4e6; }
    .failed { border-color: #e74c3c; background: #fadbd8; }
    pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
    .metric { display: inline-block; margin: 10px; padding: 10px; background: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Database Verification Report</h1>
    <p>Generated: ${report.timestamp}</p>
    <p>Database: ${report.database_path}</p>
  </div>

  <div class="summary">
    <h2>Summary</h2>
    <div class="metric">Total Tests: ${report.summary.total_tests}</div>
    <div class="metric" style="color: green;">Passed: ${report.summary.passed}</div>
    <div class="metric" style="color: red;">Failed: ${report.summary.failed}</div>
  </div>

  <h2>Test Results</h2>
  ${report.test_results.map(test => `
    <div class="test-result ${test.status.toLowerCase()}">
      <h3>${test.name}</h3>
      <p>Status: <strong style="color: ${statusColor(test.status)}">${test.status}</strong></p>
      ${test.result ? `<pre>${JSON.stringify(test.result, null, 2)}</pre>` : ''}
      ${test.error ? `<p style="color: red;">Error: ${test.error}</p>` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;
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
}

// Run the verification suite
async function runDatabaseVerification() {
  const suite = new DatabaseVerificationSuite();

  try {
    await suite.connect();
    console.log('🔍 Starting Database Verification Suite\n');

    // Run all verification tests
    await suite.verifyOnboardingCompletion();

    // Check if there's data for today, if not skip CAS log test
    const today = new Date().toISOString().split('T')[0];
    const hasTodayData = await suite.runQuery('SELECT COUNT(*) as count FROM cas_logs WHERE date = ?', [today]);
    if (hasTodayData[0].count > 0) {
      await suite.verifyCASLog(today);
    } else {
      console.log('⚠️  No CAS log for today, skipping test');
    }

    await suite.verifyATTStreak();
    await suite.verifyEngagementMetrics();
    await suite.verifyModuleProgression();
    await suite.verifyFidelityCompliance();
    await suite.verifyDataIntegrity();
    await suite.verifyPerformanceMetrics();

    // Generate report
    const report = await suite.generateReport();

    console.log('\n📊 Database Verification Complete');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📄 Report saved to: database-verification-report.html`);

  } catch (error) {
    console.error('Database verification failed:', error);
  } finally {
    await suite.close();
  }
}

// Export for use in other tests
module.exports = { DatabaseVerificationSuite, runDatabaseVerification };

// Run if executed directly
if (require.main === module) {
  runDatabaseVerification();
}