#!/usr/bin/env node

const { DatabaseVerificationSuite } = require('./database-verification');
const { VisualRegressionSuite } = require('./visual-regression');
const { UserJourneyE2ESuite } = require('./user-journey-tests');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class MasterTestRunner {
  constructor(config = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.BASE_URL || 'http://localhost:3000',
      dbPath: config.dbPath || path.join(__dirname, '../server/data/mct.db'),
      headless: config.headless !== false,
      parallel: config.parallel || false,
      testSuites: config.testSuites || ['database', 'visual', 'journey'],
      reportDir: config.reportDir || path.join(__dirname, 'reports'),
      screenshotDir: config.screenshotDir || path.join(__dirname, 'screenshots')
    };

    this.results = {
      startTime: null,
      endTime: null,
      suites: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };

    // Ensure directories exist
    [this.config.reportDir, this.config.screenshotDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  logSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
    console.log('='.repeat(60) + '\n');
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...', 'yellow');

    const checks = {
      server: false,
      database: false,
      dependencies: false
    };

    // Check if server is running
    try {
      const response = await fetch(this.config.baseUrl);
      checks.server = response.ok;
      this.log(`✓ Server is running at ${this.config.baseUrl}`, 'green');
    } catch (error) {
      this.log(`✗ Server not accessible at ${this.config.baseUrl}`, 'red');
      this.log(`  Please start the server with: npm run dev`, 'yellow');
    }

    // Check database exists
    if (fs.existsSync(this.config.dbPath)) {
      checks.database = true;
      this.log(`✓ Database found at ${this.config.dbPath}`, 'green');
    } else {
      this.log(`✗ Database not found at ${this.config.dbPath}`, 'red');
      this.log(`  Initialize database first`, 'yellow');
    }

    // Check dependencies
    const requiredPackages = ['puppeteer', 'sqlite3', 'pixelmatch', 'pngjs'];
    const missingPackages = [];

    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
      } catch {
        missingPackages.push(pkg);
      }
    }

    if (missingPackages.length === 0) {
      checks.dependencies = true;
      this.log('✓ All dependencies installed', 'green');
    } else {
      this.log(`✗ Missing dependencies: ${missingPackages.join(', ')}`, 'red');
      this.log(`  Install with: npm install ${missingPackages.join(' ')}`, 'yellow');
    }

    const allChecks = Object.values(checks).every(check => check);

    if (!allChecks) {
      this.log('\n⚠️  Some prerequisites are not met', 'yellow');
      const proceed = await this.prompt('Continue anyway? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        process.exit(1);
      }
    }

    return checks;
  }

  async prompt(question) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      readline.question(question, answer => {
        readline.close();
        resolve(answer);
      });
    });
  }

  async runDatabaseTests() {
    this.logSection('DATABASE VERIFICATION TESTS');

    try {
      const suite = new DatabaseVerificationSuite(this.config.dbPath);
      await suite.connect();

      // Run comprehensive database tests
      const tests = [
        'verifyOnboardingCompletion',
        'verifyEngagementMetrics',
        'verifyModuleProgression',
        'verifyFidelityCompliance',
        'verifyDataIntegrity',
        'verifyPerformanceMetrics'
      ];

      for (const testName of tests) {
        try {
          if (typeof suite[testName] === 'function') {
            await suite[testName]();
          }
        } catch (error) {
          this.log(`Test ${testName} failed: ${error.message}`, 'red');
        }
      }

      const report = await suite.generateReport();
      await suite.close();

      this.results.suites.database = {
        passed: report.summary.passed,
        failed: report.summary.failed,
        total: report.summary.total_tests
      };

      this.log(`Database tests completed: ${report.summary.passed}/${report.summary.total_tests} passed`,
             report.summary.failed > 0 ? 'yellow' : 'green');

      return report;

    } catch (error) {
      this.log(`Database test suite failed: ${error.message}`, 'red');
      this.results.suites.database = { error: error.message };
      throw error;
    }
  }

  async runVisualTests() {
    this.logSection('VISUAL REGRESSION TESTS');

    try {
      const suite = new VisualRegressionSuite({
        baseUrl: this.config.baseUrl,
        screenshotDir: this.config.screenshotDir
      });

      const report = await suite.runAllTests();

      this.results.suites.visual = {
        passed: report.summary.passed,
        failed: report.summary.failed,
        total: report.summary.total,
        baselines: report.summary.baseline_created
      };

      this.log(`Visual tests completed: ${report.summary.passed}/${report.summary.total} passed`,
             report.summary.failed > 0 ? 'yellow' : 'green');

      if (report.summary.baseline_created > 0) {
        this.log(`  ${report.summary.baseline_created} new baselines created`, 'blue');
      }

      return report;

    } catch (error) {
      this.log(`Visual test suite failed: ${error.message}`, 'red');
      this.results.suites.visual = { error: error.message };
      throw error;
    }
  }

  async runJourneyTests() {
    this.logSection('USER JOURNEY E2E TESTS');

    try {
      const suite = new UserJourneyE2ESuite({
        baseUrl: this.config.baseUrl,
        headless: this.config.headless
      });

      const report = await suite.runAllJourneys();

      this.results.suites.journey = {
        passed: report.summary.passed,
        failed: report.summary.failed,
        total: report.summary.total
      };

      this.log(`Journey tests completed: ${report.summary.passed}/${report.summary.total} passed`,
             report.summary.failed > 0 ? 'yellow' : 'green');

      return report;

    } catch (error) {
      this.log(`Journey test suite failed: ${error.message}`, 'red');
      this.results.suites.journey = { error: error.message };
      throw error;
    }
  }

  async runTestSuite(suiteName) {
    switch (suiteName) {
      case 'database':
        return await this.runDatabaseTests();
      case 'visual':
        return await this.runVisualTests();
      case 'journey':
        return await this.runJourneyTests();
      default:
        throw new Error(`Unknown test suite: ${suiteName}`);
    }
  }

  async runAllTests() {
    this.results.startTime = new Date();

    this.logSection('MCT E2E TEST SUITE');
    this.log('Configuration:', 'cyan');
    this.log(`  Base URL: ${this.config.baseUrl}`);
    this.log(`  Database: ${this.config.dbPath}`);
    this.log(`  Test Suites: ${this.config.testSuites.join(', ')}`);
    this.log(`  Mode: ${this.config.headless ? 'Headless' : 'Browser'}`);

    // Check prerequisites
    await this.checkPrerequisites();

    // Run test suites
    if (this.config.parallel) {
      this.log('\nRunning test suites in parallel...', 'yellow');
      const promises = this.config.testSuites.map(suite =>
        this.runTestSuite(suite).catch(error => ({ error: error.message }))
      );
      await Promise.all(promises);
    } else {
      this.log('\nRunning test suites sequentially...', 'yellow');
      for (const suiteName of this.config.testSuites) {
        try {
          await this.runTestSuite(suiteName);
        } catch (error) {
          this.log(`Suite ${suiteName} failed, continuing...`, 'yellow');
        }
      }
    }

    this.results.endTime = new Date();

    // Calculate summary
    Object.values(this.results.suites).forEach(suite => {
      if (!suite.error) {
        this.results.summary.total += suite.total || 0;
        this.results.summary.passed += suite.passed || 0;
        this.results.summary.failed += suite.failed || 0;
      }
    });

    // Generate master report
    await this.generateMasterReport();

    // Display summary
    this.displaySummary();

    return this.results;
  }

  async generateMasterReport() {
    const report = {
      ...this.results,
      duration: (this.results.endTime - this.results.startTime) / 1000,
      config: this.config
    };

    // Save JSON report
    const jsonPath = path.join(this.config.reportDir, 'master-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlPath = path.join(this.config.reportDir, 'master-report.html');
    const html = this.generateHTMLReport(report);
    fs.writeFileSync(htmlPath, html);

    this.log(`\nReports generated:`, 'cyan');
    this.log(`  JSON: ${jsonPath}`);
    this.log(`  HTML: ${htmlPath}`);
  }

  generateHTMLReport(report) {
    const passRate = report.summary.total > 0
      ? ((report.summary.passed / report.summary.total) * 100).toFixed(1)
      : 0;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>MCT E2E Test Report - Master Summary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .header h1 {
      font-size: 48px;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .header p {
      font-size: 18px;
      opacity: 0.95;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: white;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .summary-card:hover {
      transform: translateY(-5px);
    }
    .summary-card h3 {
      color: #6b7280;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .summary-card .value {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .summary-card.passed .value { color: #10b981; }
    .summary-card.failed .value { color: #ef4444; }
    .summary-card.total .value { color: #6366f1; }
    .summary-card.duration .value { color: #8b5cf6; }
    .suite-results {
      background: white;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f3f4f6;
    }
    .suite-title {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .suite-stats {
      display: flex;
      gap: 20px;
    }
    .stat {
      text-align: center;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    .progress-bar {
      width: 100%;
      height: 30px;
      background: #f3f4f6;
      border-radius: 15px;
      overflow: hidden;
      position: relative;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: width 0.5s;
    }
    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
      color: #991b1b;
    }
    .link-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .link-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      text-decoration: none;
      color: #6366f1;
      font-weight: 600;
      transition: all 0.3s;
    }
    .link-card:hover {
      background: #6366f1;
      color: white;
      transform: translateY(-2px);
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 MCT E2E Test Report</h1>
      <p>Generated: ${report.endTime.toISOString()}</p>
      <p>Duration: ${report.duration.toFixed(1)} seconds | Pass Rate: ${passRate}%</p>
    </div>

    <div class="summary-grid">
      <div class="summary-card total">
        <h3>Total Tests</h3>
        <div class="value">${report.summary.total}</div>
      </div>
      <div class="summary-card passed">
        <h3>Passed</h3>
        <div class="value">${report.summary.passed}</div>
      </div>
      <div class="summary-card failed">
        <h3>Failed</h3>
        <div class="value">${report.summary.failed}</div>
      </div>
      <div class="summary-card duration">
        <h3>Duration</h3>
        <div class="value">${Math.floor(report.duration)}s</div>
      </div>
    </div>

    ${Object.entries(report.suites).map(([name, suite]) => `
      <div class="suite-results">
        <div class="suite-header">
          <div class="suite-title">
            ${name.charAt(0).toUpperCase() + name.slice(1)} Tests
          </div>
          <div class="suite-stats">
            ${suite.total ? `
              <div class="stat">
                <div class="stat-label">Total</div>
                <div class="stat-value">${suite.total}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Passed</div>
                <div class="stat-value" style="color: #10b981;">${suite.passed}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Failed</div>
                <div class="stat-value" style="color: #ef4444;">${suite.failed}</div>
              </div>
            ` : ''}
          </div>
        </div>

        ${suite.total ? `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(suite.passed / suite.total * 100)}%">
              ${((suite.passed / suite.total) * 100).toFixed(1)}%
            </div>
          </div>
        ` : ''}

        ${suite.error ? `
          <div class="error-message">
            <strong>Error:</strong> ${suite.error}
          </div>
        ` : ''}

        <div class="link-grid">
          ${name === 'database' ? `
            <a href="../database-verification-report.html" class="link-card">
              View Database Report
            </a>
          ` : ''}
          ${name === 'visual' ? `
            <a href="../screenshots/visual-regression-report.html" class="link-card">
              View Visual Report
            </a>
          ` : ''}
          ${name === 'journey' ? `
            <a href="../user-journey-report.html" class="link-card">
              View Journey Report
            </a>
          ` : ''}
        </div>
      </div>
    `).join('')}

    <div class="footer">
      <p>MCT Digital Therapeutic - E2E Test Suite</p>
      <p>Base URL: ${report.config.baseUrl} | Mode: ${report.config.headless ? 'Headless' : 'Browser'}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  displaySummary() {
    const passRate = this.results.summary.total > 0
      ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)
      : 0;

    this.logSection('TEST SUMMARY');

    console.log(`${colors.bright}Overall Results:${colors.reset}`);
    console.log(`  Total Tests:  ${this.results.summary.total}`);
    console.log(`  ${colors.green}Passed:       ${this.results.summary.passed}${colors.reset}`);
    console.log(`  ${colors.red}Failed:       ${this.results.summary.failed}${colors.reset}`);
    console.log(`  Pass Rate:    ${passRate}%`);
    console.log(`  Duration:     ${((this.results.endTime - this.results.startTime) / 1000).toFixed(1)}s`);

    console.log(`\n${colors.bright}Suite Results:${colors.reset}`);
    Object.entries(this.results.suites).forEach(([name, suite]) => {
      if (suite.error) {
        console.log(`  ${colors.red}✗ ${name}: ERROR - ${suite.error}${colors.reset}`);
      } else if (suite.total) {
        const suitePassRate = ((suite.passed / suite.total) * 100).toFixed(1);
        const color = suite.failed > 0 ? colors.yellow : colors.green;
        console.log(`  ${color}• ${name}: ${suite.passed}/${suite.total} (${suitePassRate}%)${colors.reset}`);
      }
    });

    // Exit code based on results
    const exitCode = this.results.summary.failed > 0 ? 1 : 0;
    if (exitCode === 0) {
      this.log('\n✅ All tests passed!', 'green');
    } else {
      this.log(`\n⚠️  ${this.results.summary.failed} tests failed`, 'yellow');
    }

    return exitCode;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const config = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        config.baseUrl = args[++i];
        break;
      case '--db':
        config.dbPath = args[++i];
        break;
      case '--suites':
        config.testSuites = args[++i].split(',');
        break;
      case '--parallel':
        config.parallel = true;
        break;
      case '--browser':
        config.headless = false;
        break;
      case '--help':
        console.log(`
MCT E2E Test Runner

Usage: node run-all-tests.js [options]

Options:
  --url <url>        Base URL for testing (default: http://localhost:3000)
  --db <path>        Database path (default: ../server/data/mct.db)
  --suites <list>    Comma-separated test suites: database,visual,journey
  --parallel         Run test suites in parallel
  --browser          Show browser during tests (default: headless)
  --help             Show this help message

Examples:
  node run-all-tests.js
  node run-all-tests.js --url http://localhost:3001
  node run-all-tests.js --suites database,visual
  node run-all-tests.js --parallel --browser
        `);
        process.exit(0);
    }
  }

  const runner = new MasterTestRunner(config);

  try {
    await runner.runAllTests();
    const exitCode = runner.displaySummary();
    process.exit(exitCode);
  } catch (error) {
    console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for programmatic use
module.exports = { MasterTestRunner };