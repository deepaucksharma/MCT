/**
 * Metrics Verification Test Suite
 * Validates MCT outcome metrics and trends
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class MetricsVerificationSuite {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, '../server/data/mct.db');
    this.db = null;
    this.results = [];
  }

  async connect() {
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

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  async runTest(name, testFn) {
    console.log(`Running: ${name}`);
    try {
      const result = await testFn();
      this.results.push({
        name,
        status: 'PASSED',
        data: result
      });
      console.log(`✅ ${name} PASSED`);
      return result;
    } catch (error) {
      this.results.push({
        name,
        status: 'FAILED',
        error: error.message
      });
      console.log(`❌ ${name} FAILED: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify CAS reduction over time
   */
  async verifyCASReduction() {
    return this.runTest('CAS Reduction Trend', async () => {
      const data = await this.query(`
        SELECT
          date,
          worry_minutes,
          rumination_minutes,
          (worry_minutes + rumination_minutes) as total_cas
        FROM cas_logs
        ORDER BY date DESC
        LIMIT 7
      `);

      if (data.length < 2) {
        throw new Error('Insufficient data for trend analysis');
      }

      // Calculate trend
      const newest = data[0].total_cas;
      const oldest = data[data.length - 1].total_cas;
      const reduction = ((oldest - newest) / oldest) * 100;

      // Calculate weekly average
      const weeklyAvg = data.reduce((sum, d) => sum + d.total_cas, 0) / data.length;

      return {
        days_analyzed: data.length,
        oldest_cas: oldest,
        newest_cas: newest,
        reduction_percentage: reduction.toFixed(1),
        weekly_average: weeklyAvg.toFixed(1),
        trend: reduction > 0 ? 'improving' : 'worsening'
      };
    });
  }

  /**
   * Verify ATT practice consistency
   */
  async verifyATTPractice() {
    return this.runTest('ATT Practice Consistency', async () => {
      const data = await this.query(`
        SELECT
          COUNT(DISTINCT date) as days_practiced,
          COUNT(*) as total_sessions,
          AVG(duration_minutes) as avg_duration,
          AVG(attentional_control_rating) as avg_control,
          MIN(attentional_control_rating) as min_control,
          MAX(attentional_control_rating) as max_control
        FROM att_sessions
        WHERE date >= date('now', '-7 days')
      `);

      const consistency = await this.query(`
        SELECT date FROM att_sessions
        WHERE date >= date('now', '-7 days')
        ORDER BY date
      `);

      // Check for improvement in control ratings
      const improvement = await this.query(`
        SELECT
          attentional_control_rating,
          date
        FROM att_sessions
        ORDER BY date
        LIMIT 10
      `);

      let improvementTrend = 'stable';
      if (improvement.length >= 2) {
        const firstRating = improvement[0].attentional_control_rating;
        const lastRating = improvement[improvement.length - 1].attentional_control_rating;
        if (lastRating > firstRating + 5) improvementTrend = 'improving';
        else if (lastRating < firstRating - 5) improvementTrend = 'declining';
      }

      return {
        ...data[0],
        consistency_rate: ((data[0].days_practiced / 7) * 100).toFixed(1) + '%',
        improvement_trend: improvementTrend
      };
    });
  }

  /**
   * Verify DM practice frequency
   */
  async verifyDMPractice() {
    return this.runTest('DM Practice Frequency', async () => {
      const data = await this.query(`
        SELECT
          date,
          COUNT(*) as daily_count,
          AVG(confidence_rating) as avg_confidence
        FROM dm_practices
        WHERE date >= date('now', '-7 days')
        GROUP BY date
        ORDER BY date
      `);

      const summary = await this.query(`
        SELECT
          COUNT(*) as total_practices,
          COUNT(DISTINCT date) as days_practiced,
          AVG(confidence_rating) as avg_confidence,
          MIN(confidence_rating) as min_confidence,
          MAX(confidence_rating) as max_confidence
        FROM dm_practices
        WHERE date >= date('now', '-7 days')
      `);

      // Check if meeting minimum requirement (3x daily)
      const meetsRequirement = data.filter(d => d.daily_count >= 3).length;

      return {
        ...summary[0],
        daily_average: (summary[0].total_practices / 7).toFixed(1),
        days_meeting_3x: meetsRequirement,
        compliance_rate: ((meetsRequirement / 7) * 100).toFixed(1) + '%'
      };
    });
  }

  /**
   * Verify belief rating changes
   */
  async verifyBeliefChanges() {
    return this.runTest('Belief Rating Changes', async () => {
      const beliefs = await this.query(`
        SELECT
          belief_type,
          MIN(rating) as lowest,
          MAX(rating) as highest,
          COUNT(*) as measurements
        FROM belief_ratings
        GROUP BY belief_type
      `);

      const results = {};

      for (const belief of beliefs) {
        const trend = await this.query(`
          SELECT rating, date
          FROM belief_ratings
          WHERE belief_type = ?
          ORDER BY date
        `, [belief.belief_type]);

        if (trend.length >= 2) {
          const first = trend[0].rating;
          const last = trend[trend.length - 1].rating;
          const change = first - last;

          results[belief.belief_type] = {
            initial: first,
            current: last,
            change: change,
            change_percentage: ((change / first) * 100).toFixed(1),
            measurements: belief.measurements,
            target_met: change >= 15
          };
        }
      }

      return results;
    });
  }

  /**
   * Verify postponement effectiveness
   */
  async verifyPostponement() {
    return this.runTest('Postponement Effectiveness', async () => {
      const data = await this.query(`
        SELECT
          COUNT(*) as total_postponements,
          AVG(urge_before) as avg_urge_before,
          AVG(urge_after) as avg_urge_after,
          AVG(urge_before - urge_after) as avg_reduction,
          COUNT(CASE WHEN processed = 1 THEN 1 END) as processed_count
        FROM postponement_logs
      `);

      if (data[0].total_postponements === 0) {
        return { message: 'No postponement data available' };
      }

      const effectiveness = ((data[0].avg_reduction / data[0].avg_urge_before) * 100).toFixed(1);

      return {
        ...data[0],
        effectiveness_percentage: effectiveness,
        processing_rate: ((data[0].processed_count / data[0].total_postponements) * 100).toFixed(1) + '%'
      };
    });
  }

  /**
   * Verify overall engagement metrics
   */
  async verifyEngagement() {
    return this.runTest('Overall Engagement', async () => {
      // Get streak data
      const streaks = await this.query(`
        SELECT type, current_streak, longest_streak
        FROM streaks
      `);

      // Calculate practice minutes last 7 days
      const practiceTime = await this.query(`
        SELECT
          (SELECT SUM(duration_minutes) FROM att_sessions WHERE date >= date('now', '-7 days')) as att_minutes,
          (SELECT SUM(duration_seconds)/60 FROM dm_practices WHERE date >= date('now', '-7 days')) as dm_minutes
      `);

      // Check daily burden
      const dailyBurden = await this.query(`
        SELECT
          date,
          (SELECT duration_minutes FROM att_sessions WHERE date = cl.date) as att_time,
          (SELECT COUNT(*) * 2 FROM dm_practices WHERE date = cl.date) as dm_time,
          2 as log_time
        FROM cas_logs cl
        WHERE date >= date('now', '-7 days')
      `);

      const avgDailyBurden = dailyBurden.reduce((sum, d) => {
        return sum + (d.att_time || 0) + (d.dm_time || 0) + d.log_time;
      }, 0) / dailyBurden.length;

      return {
        streaks: streaks.reduce((acc, s) => {
          acc[s.type] = { current: s.current_streak, longest: s.longest_streak };
          return acc;
        }, {}),
        weekly_att_minutes: practiceTime[0].att_minutes || 0,
        weekly_dm_minutes: Math.floor(practiceTime[0].dm_minutes || 0),
        avg_daily_burden_minutes: avgDailyBurden.toFixed(1),
        burden_under_20min: avgDailyBurden <= 20
      };
    });
  }

  /**
   * Generate comprehensive metrics report
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      database: this.dbPath,
      results: this.results,
      summary: {
        total_tests: this.results.length,
        passed: this.results.filter(r => r.status === 'PASSED').length,
        failed: this.results.filter(r => r.status === 'FAILED').length
      }
    };

    // Save JSON report
    fs.writeFileSync(
      path.join(__dirname, 'metrics-verification-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    const html = this.generateHTMLReport(report);
    fs.writeFileSync(
      path.join(__dirname, 'metrics-verification-report.html'),
      html
    );

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>MCT Metrics Verification Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      background: #f8f9fa;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
    }
    .status {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .passed { background: #d1fae5; color: #065f46; }
    .failed { background: #fee2e2; color: #991b1b; }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .metric-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
    }
    .trend {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 8px;
    }
    .improving { background: #d1fae5; color: #065f46; }
    .stable { background: #e0e7ff; color: #3730a3; }
    .declining { background: #fee2e2; color: #991b1b; }
    pre {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 MCT Metrics Verification Report</h1>
    <p>Generated: ${report.timestamp}</p>
    <p>Tests: ${report.summary.passed}/${report.summary.total_tests} Passed</p>
  </div>

  <div class="container">
    ${report.results.map(test => `
      <div class="metric-card">
        <div class="metric-header">
          <h2>${test.name}</h2>
          <span class="status ${test.status.toLowerCase()}">${test.status}</span>
        </div>
        ${test.data ? `
          <pre>${JSON.stringify(test.data, null, 2)}</pre>
        ` : ''}
        ${test.error ? `
          <p style="color: #ef4444;">Error: ${test.error}</p>
        ` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>
    `;
  }
}

// Run verification suite
async function runMetricsVerification() {
  const suite = new MetricsVerificationSuite();

  try {
    await suite.connect();
    console.log('📊 Starting Metrics Verification Suite\n');

    // Run all metrics tests
    await suite.verifyCASReduction();
    await suite.verifyATTPractice();
    await suite.verifyDMPractice();
    await suite.verifyBeliefChanges();
    await suite.verifyPostponement();
    await suite.verifyEngagement();

    // Generate report
    const report = await suite.generateReport();

    console.log('\n📊 Metrics Verification Complete');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`📄 Report saved to: metrics-verification-report.html`);

    return report;

  } catch (error) {
    console.error('Metrics verification failed:', error);
  } finally {
    await suite.close();
  }
}

// Export for use
module.exports = { MetricsVerificationSuite, runMetricsVerification };

// Run if executed directly
if (require.main === module) {
  runMetricsVerification();
}