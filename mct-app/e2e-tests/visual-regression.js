const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

class VisualRegressionSuite {
  constructor(config = {}) {
    this.browser = null;
    this.page = null;
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.screenshotDir = config.screenshotDir || path.join(__dirname, 'screenshots');
    this.baselineDir = path.join(this.screenshotDir, 'baseline');
    this.currentDir = path.join(this.screenshotDir, 'current');
    this.diffDir = path.join(this.screenshotDir, 'diff');
    this.threshold = config.threshold || 0.05; // 5% difference threshold
    this.results = [];

    // Create directories if they don't exist
    [this.screenshotDir, this.baselineDir, this.currentDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1280,
        height: 800
      }
    });
    this.page = await this.browser.newPage();

    // Set user agent to ensure consistent rendering
    await this.page.setUserAgent('Mozilla/5.0 (MCT-Test-Suite) Chrome/100.0');

    // Disable animations for consistent screenshots
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  }

  async captureScreenshot(name, options = {}) {
    const screenshotPath = path.join(this.currentDir, `${name}.png`);

    // Wait for network idle to ensure page is fully loaded
    if (options.waitForNetwork !== false) {
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {
        // Navigation may have already completed
      });
    }

    // Wait for specific selector if provided
    if (options.waitForSelector) {
      await this.page.waitForSelector(options.waitForSelector, {
        visible: true,
        timeout: options.timeout || 10000
      });
    }

    // Add delay if specified
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }

    // Hide dynamic elements that change between runs
    if (options.hideDynamic !== false) {
      await this.page.evaluate(() => {
        // Hide timestamps
        document.querySelectorAll('[data-timestamp], .timestamp, .time').forEach(el => {
          el.style.visibility = 'hidden';
        });

        // Hide random IDs
        document.querySelectorAll('[data-testid*="random"], [id*="random"]').forEach(el => {
          el.textContent = 'XXXXX';
        });
      });
    }

    // Capture screenshot
    const screenshotOptions = {
      path: screenshotPath,
      fullPage: options.fullPage || false
    };

    if (options.clip) {
      screenshotOptions.clip = options.clip;
    }

    await this.page.screenshot(screenshotOptions);

    return screenshotPath;
  }

  async compareScreenshot(name, options = {}) {
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    const currentPath = path.join(this.currentDir, `${name}.png`);
    const diffPath = path.join(this.diffDir, `${name}.png`);

    // If no baseline exists, create it
    if (!fs.existsSync(baselinePath)) {
      console.log(`📸 Creating baseline for: ${name}`);
      fs.copyFileSync(currentPath, baselinePath);
      return {
        name,
        status: 'baseline_created',
        difference: 0
      };
    }

    // Load images
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));

    // Check dimensions
    if (baseline.width !== current.width || baseline.height !== current.height) {
      return {
        name,
        status: 'dimension_mismatch',
        baseline: { width: baseline.width, height: baseline.height },
        current: { width: current.width, height: current.height }
      };
    }

    // Create diff image
    const diff = new PNG({ width: baseline.width, height: baseline.height });

    // Compare pixels
    const numDiffPixels = pixelmatch(
      baseline.data,
      current.data,
      diff.data,
      baseline.width,
      baseline.height,
      {
        threshold: options.pixelThreshold || 0.1,
        includeAA: false
      }
    );

    // Calculate difference percentage
    const totalPixels = baseline.width * baseline.height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    // Save diff image if there are differences
    if (numDiffPixels > 0) {
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }

    // Determine status
    const status = diffPercentage <= this.threshold * 100 ? 'passed' : 'failed';

    return {
      name,
      status,
      difference: diffPercentage,
      diffPixels: numDiffPixels,
      threshold: this.threshold * 100,
      diffImage: numDiffPixels > 0 ? diffPath : null
    };
  }

  // ONBOARDING VISUAL TESTS
  async testOnboardingFlow() {
    console.log('📸 Testing Onboarding Flow...');
    const results = [];

    // Navigate to onboarding
    await this.page.goto(`${this.baseUrl}/onboarding`);

    // Step 1: Welcome screen
    await this.captureScreenshot('onboarding-01-welcome', {
      waitForSelector: '[data-testid="onboarding-welcome"]'
    });
    results.push(await this.compareScreenshot('onboarding-01-welcome'));

    // Step 2: MCT Introduction
    await this.page.click('[data-testid="next-button"]');
    await this.captureScreenshot('onboarding-02-mct-intro', {
      waitForSelector: '[data-testid="mct-principles"]',
      delay: 500
    });
    results.push(await this.compareScreenshot('onboarding-02-mct-intro'));

    // Step 3: Initial Assessment
    await this.page.click('[data-testid="next-button"]');
    await this.captureScreenshot('onboarding-03-assessment', {
      waitForSelector: '[data-testid="belief-ratings"]'
    });
    results.push(await this.compareScreenshot('onboarding-03-assessment'));

    // Verify no content fields
    const hasContentFields = await this.page.evaluate(() => {
      return document.querySelectorAll('[data-content-field], textarea[placeholder*="worry about"]').length > 0;
    });

    if (hasContentFields) {
      results.push({
        name: 'onboarding-fidelity-check',
        status: 'failed',
        error: 'Content input fields found in onboarding'
      });
    }

    // Step 4: Schedule Setup
    await this.page.click('[data-testid="next-button"]');
    await this.captureScreenshot('onboarding-04-schedule', {
      waitForSelector: '[data-testid="reminder-settings"]'
    });
    results.push(await this.compareScreenshot('onboarding-04-schedule'));

    return results;
  }

  // DAILY INTERFACE VISUAL TESTS
  async testDailyInterface() {
    console.log('📸 Testing Daily Interface...');
    const results = [];

    // Today page
    await this.page.goto(`${this.baseUrl}/today`);
    await this.captureScreenshot('today-overview', {
      waitForSelector: '[data-testid="daily-tasks"]',
      fullPage: true
    });
    results.push(await this.compareScreenshot('today-overview'));

    // CAS Log form
    await this.page.goto(`${this.baseUrl}/log`);
    await this.captureScreenshot('cas-log-empty', {
      waitForSelector: '[data-testid="cas-log-form"]'
    });
    results.push(await this.compareScreenshot('cas-log-empty'));

    // Fill CAS log
    await this.page.type('[data-testid="worry-minutes"]', '45');
    await this.page.type('[data-testid="rumination-minutes"]', '30');
    await this.page.type('[data-testid="monitoring-count"]', '5');
    await this.captureScreenshot('cas-log-filled');
    results.push(await this.compareScreenshot('cas-log-filled'));

    return results;
  }

  // ATT SESSION VISUAL TESTS
  async testATTSession() {
    console.log('📸 Testing ATT Session...');
    const results = [];

    await this.page.goto(`${this.baseUrl}/exercises/att`);

    // ATT start screen
    await this.captureScreenshot('att-01-start', {
      waitForSelector: '[data-testid="att-intro"]'
    });
    results.push(await this.compareScreenshot('att-01-start'));

    // Start session
    await this.page.click('[data-testid="start-att"]');

    // Phase 1: Selective Attention
    await this.captureScreenshot('att-02-phase1', {
      waitForSelector: '[data-testid="att-phase-1"]',
      delay: 1000
    });
    results.push(await this.compareScreenshot('att-02-phase1'));

    // Audio controls
    await this.captureScreenshot('att-03-controls', {
      clip: {
        x: 0,
        y: 400,
        width: 1280,
        height: 200
      }
    });
    results.push(await this.compareScreenshot('att-03-controls'));

    // Rating screen (simulated)
    await this.page.evaluate(() => {
      window.completeATTPhase && window.completeATTPhase();
    });

    await this.captureScreenshot('att-04-rating', {
      waitForSelector: '[data-testid="att-rating"]',
      delay: 500
    });
    results.push(await this.compareScreenshot('att-04-rating'));

    return results;
  }

  // DM PRACTICE VISUAL TESTS
  async testDMPractice() {
    console.log('📸 Testing DM Practice...');
    const results = [];

    await this.page.goto(`${this.baseUrl}/exercises/dm`);

    // DM start screen
    await this.captureScreenshot('dm-01-start', {
      waitForSelector: '[data-testid="dm-intro"]'
    });
    results.push(await this.compareScreenshot('dm-01-start'));

    // Metaphor selection
    await this.captureScreenshot('dm-02-metaphors', {
      waitForSelector: '[data-testid="metaphor-selection"]'
    });
    results.push(await this.compareScreenshot('dm-02-metaphors'));

    // Select clouds metaphor
    await this.page.click('[data-testid="metaphor-clouds"]');
    await this.captureScreenshot('dm-03-clouds-selected');
    results.push(await this.compareScreenshot('dm-03-clouds-selected'));

    // Start practice
    await this.page.click('[data-testid="start-dm"]');

    // LAPR phases
    const phases = ['label', 'allow', 'position', 'refocus'];
    for (let i = 0; i < phases.length; i++) {
      await this.captureScreenshot(`dm-04-${phases[i]}`, {
        waitForSelector: `[data-testid="dm-phase-${phases[i]}"]`,
        delay: 500
      });
      results.push(await this.compareScreenshot(`dm-04-${phases[i]}`));
    }

    // Confidence rating
    await this.captureScreenshot('dm-05-rating', {
      waitForSelector: '[data-testid="dm-confidence"]'
    });
    results.push(await this.compareScreenshot('dm-05-rating'));

    return results;
  }

  // EXPERIMENT VISUAL TESTS
  async testExperiments() {
    console.log('📸 Testing Experiments...');
    const results = [];

    await this.page.goto(`${this.baseUrl}/experiments`);

    // Experiment list
    await this.captureScreenshot('exp-01-list', {
      waitForSelector: '[data-testid="experiment-list"]',
      fullPage: true
    });
    results.push(await this.compareScreenshot('exp-01-list'));

    // Select postponement experiment
    await this.page.click('[data-testid="exp-postponement-control"]');

    // Experiment setup
    await this.captureScreenshot('exp-02-setup', {
      waitForSelector: '[data-testid="experiment-setup"]'
    });
    results.push(await this.compareScreenshot('exp-02-setup'));

    // Prediction form
    await this.captureScreenshot('exp-03-prediction', {
      waitForSelector: '[data-testid="prediction-form"]'
    });
    results.push(await this.compareScreenshot('exp-03-prediction'));

    // Protocol display
    await this.page.click('[data-testid="view-protocol"]');
    await this.captureScreenshot('exp-04-protocol', {
      waitForSelector: '[data-testid="protocol-steps"]'
    });
    results.push(await this.compareScreenshot('exp-04-protocol'));

    // Outcome recording (simulated)
    await this.page.goto(`${this.baseUrl}/experiments/1/outcome`);
    await this.captureScreenshot('exp-05-outcome', {
      waitForSelector: '[data-testid="outcome-form"]'
    });
    results.push(await this.compareScreenshot('exp-05-outcome'));

    return results;
  }

  // PROGRESS DASHBOARD VISUAL TESTS
  async testProgressDashboard() {
    console.log('📸 Testing Progress Dashboard...');
    const results = [];

    await this.page.goto(`${this.baseUrl}/progress`);

    // Main dashboard
    await this.captureScreenshot('progress-01-dashboard', {
      waitForSelector: '[data-testid="progress-dashboard"]',
      fullPage: true,
      delay: 1000 // Allow charts to render
    });
    results.push(await this.compareScreenshot('progress-01-dashboard'));

    // CAS trend chart
    await this.captureScreenshot('progress-02-cas-trend', {
      clip: {
        x: 0,
        y: 100,
        width: 640,
        height: 400
      }
    });
    results.push(await this.compareScreenshot('progress-02-cas-trend'));

    // Belief spider chart
    await this.captureScreenshot('progress-03-belief-spider', {
      clip: {
        x: 640,
        y: 100,
        width: 640,
        height: 400
      }
    });
    results.push(await this.compareScreenshot('progress-03-belief-spider'));

    // Practice heatmap
    await this.captureScreenshot('progress-04-heatmap', {
      waitForSelector: '[data-testid="practice-heatmap"]',
      clip: {
        x: 0,
        y: 500,
        width: 1280,
        height: 300
      }
    });
    results.push(await this.compareScreenshot('progress-04-heatmap'));

    // Insight cards
    await this.captureScreenshot('progress-05-insights', {
      waitForSelector: '[data-testid="insight-cards"]'
    });
    results.push(await this.compareScreenshot('progress-05-insights'));

    // Verify process-only insights
    const hasContentInsights = await this.page.evaluate(() => {
      const insights = document.querySelectorAll('[data-testid="insight-card"]');
      return Array.from(insights).some(card =>
        card.textContent.toLowerCase().includes('about') ||
        card.textContent.toLowerCase().includes('worry about')
      );
    });

    if (hasContentInsights) {
      results.push({
        name: 'progress-fidelity-check',
        status: 'failed',
        error: 'Content-focused insights found'
      });
    }

    return results;
  }

  // MODULE CONTENT VISUAL TESTS
  async testModuleContent() {
    console.log('📸 Testing Module Content...');
    const results = [];

    await this.page.goto(`${this.baseUrl}/program`);

    // Module list
    await this.captureScreenshot('modules-01-list', {
      waitForSelector: '[data-testid="module-list"]',
      fullPage: true
    });
    results.push(await this.compareScreenshot('modules-01-list'));

    // Week 0 content
    await this.page.click('[data-testid="module-week-0"]');
    await this.captureScreenshot('modules-02-week0', {
      waitForSelector: '[data-testid="module-content"]',
      fullPage: true
    });
    results.push(await this.compareScreenshot('modules-02-week0'));

    // Try-now exercise
    await this.captureScreenshot('modules-03-trynow', {
      waitForSelector: '[data-testid="try-now-exercise"]'
    });
    results.push(await this.compareScreenshot('modules-03-trynow'));

    // Locked module state
    await this.page.goto(`${this.baseUrl}/program`);
    await this.captureScreenshot('modules-04-locked', {
      waitForSelector: '[data-testid="module-week-2"][data-locked="true"]'
    });
    results.push(await this.compareScreenshot('modules-04-locked'));

    return results;
  }

  // ERROR STATES VISUAL TESTS
  async testErrorStates() {
    console.log('📸 Testing Error States...');
    const results = [];

    // Fidelity violation
    await this.page.goto(`${this.baseUrl}/log`);
    await this.page.type('[data-testid="notes"]', 'I am worried about my health');
    await this.page.click('[data-testid="submit"]');
    await this.captureScreenshot('error-01-fidelity', {
      waitForSelector: '[data-testid="fidelity-warning"]',
      delay: 500
    });
    results.push(await this.compareScreenshot('error-01-fidelity'));

    // Network error (simulated)
    await this.page.evaluate(() => {
      window.showNetworkError && window.showNetworkError();
    });
    await this.captureScreenshot('error-02-network', {
      waitForSelector: '[data-testid="network-error"]'
    });
    results.push(await this.compareScreenshot('error-02-network'));

    // Validation error
    await this.page.goto(`${this.baseUrl}/log`);
    await this.page.type('[data-testid="worry-minutes"]', '150'); // Over max
    await this.page.click('[data-testid="submit"]');
    await this.captureScreenshot('error-03-validation', {
      waitForSelector: '[data-testid="validation-error"]'
    });
    results.push(await this.compareScreenshot('error-03-validation'));

    return results;
  }

  // RESPONSIVE DESIGN TESTS
  async testResponsiveDesign() {
    console.log('📸 Testing Responsive Design...');
    const results = [];

    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await this.page.setViewport(viewport);

      // Today page
      await this.page.goto(`${this.baseUrl}/today`);
      await this.captureScreenshot(`responsive-${viewport.name}-today`, {
        waitForSelector: '[data-testid="daily-tasks"]'
      });
      results.push(await this.compareScreenshot(`responsive-${viewport.name}-today`));

      // Progress page
      await this.page.goto(`${this.baseUrl}/progress`);
      await this.captureScreenshot(`responsive-${viewport.name}-progress`, {
        waitForSelector: '[data-testid="progress-dashboard"]',
        delay: 1000
      });
      results.push(await this.compareScreenshot(`responsive-${viewport.name}-progress`));
    }

    // Reset viewport
    await this.page.setViewport({ width: 1280, height: 800 });

    return results;
  }

  // Generate visual regression report
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      threshold: this.threshold * 100,
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        baseline_created: this.results.filter(r => r.status === 'baseline_created').length
      }
    };

    // Save JSON report
    fs.writeFileSync(
      path.join(this.screenshotDir, 'visual-regression-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    const html = this.generateHTMLReport(report);
    fs.writeFileSync(
      path.join(this.screenshotDir, 'visual-regression-report.html'),
      html
    );

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Visual Regression Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
    }
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .baseline { color: #3b82f6; }
    .test-result {
      background: white;
      margin: 20px 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .test-header {
      padding: 15px 20px;
      border-left: 4px solid;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .test-header.passed {
      border-left-color: #10b981;
      background: #f0fdf4;
    }
    .test-header.failed {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .test-header.baseline_created {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }
    .test-images {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 10px;
      padding: 20px;
      background: #fafafa;
    }
    .test-image {
      text-align: center;
    }
    .test-image h4 {
      margin: 0 0 10px 0;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .test-image img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .difference-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .low-diff { background: #d1fae5; color: #065f46; }
    .high-diff { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <h1>Visual Regression Report</h1>
      <p>Generated: ${report.timestamp}</p>
      <p>Base URL: ${report.baseUrl} | Threshold: ${report.threshold}%</p>
    </div>
  </div>

  <div class="container">
    <div class="summary">
      <div class="summary-card">
        <h3>Total Tests</h3>
        <div class="value">${report.summary.total}</div>
      </div>
      <div class="summary-card">
        <h3>Passed</h3>
        <div class="value passed">${report.summary.passed}</div>
      </div>
      <div class="summary-card">
        <h3>Failed</h3>
        <div class="value failed">${report.summary.failed}</div>
      </div>
      <div class="summary-card">
        <h3>Baselines Created</h3>
        <div class="value baseline">${report.summary.baseline_created}</div>
      </div>
    </div>

    <h2>Test Results</h2>
    ${report.results.map(test => `
      <div class="test-result">
        <div class="test-header ${test.status}">
          <div>
            <strong>${test.name}</strong>
            ${test.difference !== undefined ? `
              <span class="difference-badge ${test.difference <= report.threshold ? 'low-diff' : 'high-diff'}">
                ${test.difference.toFixed(2)}% difference
              </span>
            ` : ''}
          </div>
          <div>
            <strong>${test.status.toUpperCase()}</strong>
          </div>
        </div>
        ${test.status === 'failed' && test.diffImage ? `
          <div class="test-images">
            <div class="test-image">
              <h4>Baseline</h4>
              <img src="../baseline/${test.name}.png" alt="Baseline">
            </div>
            <div class="test-image">
              <h4>Current</h4>
              <img src="../current/${test.name}.png" alt="Current">
            </div>
            <div class="test-image">
              <h4>Difference</h4>
              <img src="../diff/${test.name}.png" alt="Difference">
            </div>
          </div>
        ` : ''}
        ${test.error ? `
          <div style="padding: 20px; color: #ef4444;">
            Error: ${test.error}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>
    `;
  }

  async runAllTests() {
    console.log('🎨 Starting Visual Regression Suite\n');

    try {
      await this.initialize();

      // Run all visual test suites
      this.results.push(...await this.testOnboardingFlow());
      this.results.push(...await this.testDailyInterface());
      this.results.push(...await this.testATTSession());
      this.results.push(...await this.testDMPractice());
      this.results.push(...await this.testExperiments());
      this.results.push(...await this.testProgressDashboard());
      this.results.push(...await this.testModuleContent());
      this.results.push(...await this.testErrorStates());
      this.results.push(...await this.testResponsiveDesign());

      // Generate report
      const report = await this.generateReport();

      console.log('\n📊 Visual Regression Testing Complete');
      console.log(`✅ Passed: ${report.summary.passed}`);
      console.log(`❌ Failed: ${report.summary.failed}`);
      console.log(`📸 Baselines Created: ${report.summary.baseline_created}`);
      console.log(`📄 Report saved to: ${path.join(this.screenshotDir, 'visual-regression-report.html')}`);

      return report;

    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async updateBaselines() {
    console.log('📸 Updating all baselines...');

    // Copy all current screenshots to baseline
    const currentFiles = fs.readdirSync(this.currentDir);
    for (const file of currentFiles) {
      if (file.endsWith('.png')) {
        fs.copyFileSync(
          path.join(this.currentDir, file),
          path.join(this.baselineDir, file)
        );
        console.log(`✅ Updated baseline: ${file}`);
      }
    }

    console.log('All baselines updated!');
  }
}

// Export for use in other tests
module.exports = { VisualRegressionSuite };

// Run if executed directly
if (require.main === module) {
  const suite = new VisualRegressionSuite();

  // Check for update-baselines flag
  if (process.argv.includes('--update-baselines')) {
    suite.updateBaselines();
  } else {
    suite.runAllTests().catch(console.error);
  }
}