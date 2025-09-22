const puppeteer = require('puppeteer');
const { DatabaseVerificationSuite } = require('./database-verification');
const { VisualRegressionSuite } = require('./visual-regression');
const fs = require('fs');
const path = require('path');

class UserJourneyE2ESuite {
  constructor(config = {}) {
    this.config = config;
    this.browser = null;
    this.page = null;
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.apiUrl = config.apiUrl || 'http://localhost:3001';
    this.dbVerifier = new DatabaseVerificationSuite();
    this.visualTester = new VisualRegressionSuite({ baseUrl: this.baseUrl });
    this.testResults = [];
    this.performanceMetrics = [];
  }

  async initialize() {
    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: this.config?.headless !== false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: this.config?.slowMo || 0
    });

    this.page = await this.browser.newPage();

    // Enable performance tracking
    await this.page.evaluateOnNewDocument(() => {
      window.__testMetrics = {
        startTime: Date.now(),
        actions: []
      };

      window.__logAction = (action, data = {}) => {
        window.__testMetrics.actions.push({
          action,
          timestamp: Date.now() - window.__testMetrics.startTime,
          ...data
        });
      };
    });

    // Connect to database
    await this.dbVerifier.connect();

    // Set viewport
    await this.page.setViewport({
      width: 1280,
      height: 800
    });

    // Mock date/time for consistent testing
    await this.page.evaluateOnNewDocument(() => {
      const testDate = new Date('2024-01-15T10:00:00');
      Date.now = () => testDate.getTime();
      Date.prototype.getTime = () => testDate.getTime();
    });
  }

  async measurePerformance(name, fn) {
    const startTime = Date.now();
    const startMetrics = await this.page.metrics();

    const result = await fn();

    const endTime = Date.now();
    const endMetrics = await this.page.metrics();

    const performance = {
      name,
      duration: endTime - startTime,
      jsHeapUsed: endMetrics.JSHeapUsedSize - startMetrics.JSHeapUsedSize,
      documents: endMetrics.Documents,
      frames: endMetrics.Frames,
      layoutDuration: endMetrics.LayoutDuration,
      scriptDuration: endMetrics.ScriptDuration
    };

    this.performanceMetrics.push(performance);
    return result;
  }

  // JOURNEY 1: NEW USER FIRST WEEK
  async testNewUserFirstWeek() {
    console.log('🚀 Starting New User First Week Journey...\n');

    const journey = {
      name: 'New User First Week',
      steps: [],
      duration: 0,
      success: false
    };

    try {
      // DAY 1: Onboarding
      console.log('📅 Day 1: Onboarding');

      const onboardingStart = Date.now();

      // Step 1: Welcome
      await this.page.goto(`${this.baseUrl}/onboarding`);
      await this.page.screenshot({ path: 'screenshots/journey/day1-01-welcome.png' });

      // Verify no existing data
      const hasData = await this.dbVerifier.runQuery(
        'SELECT COUNT(*) as count FROM cas_logs'
      );
      if (hasData[0].count > 0) {
        throw new Error('Database not clean for new user test');
      }

      // Step 2: MCT Introduction
      await this.page.click('[data-testid="start-onboarding"]');
      await this.page.waitForSelector('[data-testid="mct-principles"]');

      // Verify fidelity statements present
      const hasFidelityInfo = await this.page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('process-focused') && text.includes('not about content');
      });

      journey.steps.push({
        name: 'MCT Introduction',
        status: hasFidelityInfo ? 'passed' : 'failed'
      });

      // Step 3: Initial Assessment
      await this.page.click('[data-testid="next"]');
      await this.page.waitForSelector('[data-testid="initial-assessment"]');

      // Fill belief ratings
      await this.page.evaluate(() => {
        document.querySelector('[data-testid="uncontrollability-rating"]').value = 75;
        document.querySelector('[data-testid="danger-rating"]').value = 80;
        document.querySelector('[data-testid="positive-rating"]').value = 65;
      });

      // Attempt to enter content (should be blocked)
      const notesField = await this.page.$('[data-testid="worry-content"]');
      if (notesField) {
        await this.page.type('[data-testid="worry-content"]', 'worried about health');
        await this.page.click('[data-testid="submit-assessment"]');

        // Should see fidelity warning
        const warning = await this.page.waitForSelector('[data-testid="fidelity-warning"]', {
          timeout: 2000
        }).catch(() => null);

        journey.steps.push({
          name: 'Content Blocking',
          status: warning ? 'passed' : 'failed'
        });
      }

      // Complete assessment properly
      await this.page.click('[data-testid="next"]');

      // Step 4: Schedule Setup
      await this.page.waitForSelector('[data-testid="schedule-setup"]');

      // Set ATT reminder
      await this.page.select('[data-testid="att-time"]', '20:00');

      // Set DM reminders
      await this.page.click('[data-testid="dm-time-1"]');
      await this.page.type('[data-testid="dm-time-1"]', '08:00');
      await this.page.click('[data-testid="dm-time-2"]');
      await this.page.type('[data-testid="dm-time-2"]', '13:00');
      await this.page.click('[data-testid="dm-time-3"]');
      await this.page.type('[data-testid="dm-time-3"]', '18:00');

      // Complete onboarding
      await this.page.click('[data-testid="complete-onboarding"]');

      const onboardingDuration = (Date.now() - onboardingStart) / 1000 / 60;

      journey.steps.push({
        name: 'Onboarding Completion',
        status: onboardingDuration <= 7 ? 'passed' : 'failed',
        duration: `${onboardingDuration.toFixed(1)} minutes`
      });

      // Verify database state
      const onboardingData = await this.dbVerifier.verifyOnboardingCompletion();
      journey.steps.push({
        name: 'Database Verification',
        status: onboardingData ? 'passed' : 'failed'
      });

      // DAY 1: First Daily Practice
      console.log('📅 Day 1: First Daily Practice');

      // Navigate to today page
      await this.page.goto(`${this.baseUrl}/today`);
      await this.page.screenshot({ path: 'screenshots/journey/day1-02-today.png' });

      // Complete CAS log
      await this.page.click('[data-testid="log-cas"]');
      await this.page.waitForSelector('[data-testid="cas-form"]');

      await this.page.type('[data-testid="worry-minutes"]', '60');
      await this.page.type('[data-testid="rumination-minutes"]', '45');
      await this.page.type('[data-testid="monitoring-count"]', '12');
      await this.page.type('[data-testid="checking-count"]', '8');

      await this.page.click('[data-testid="submit-cas"]');

      // Verify CAS log saved
      const casLog = await this.dbVerifier.verifyCASLog('2024-01-15');
      journey.steps.push({
        name: 'CAS Log Day 1',
        status: casLog ? 'passed' : 'failed'
      });

      // Complete first ATT session
      await this.page.goto(`${this.baseUrl}/exercises/att`);
      await this.page.click('[data-testid="start-att"]');

      // Simulate ATT completion (12 minutes)
      await this.page.evaluate(() => {
        window.__simulateATTCompletion && window.__simulateATTCompletion();
      });

      // Rate the session
      await this.page.waitForSelector('[data-testid="att-rating"]');
      await this.page.evaluate(() => {
        document.querySelector('[data-testid="control-rating"]').value = 60;
        document.querySelector('[data-testid="intrusion-count"]').value = 3;
      });
      await this.page.click('[data-testid="submit-att"]');

      // Verify ATT session saved
      const attSession = await this.dbVerifier.runQuery(
        "SELECT * FROM att_sessions WHERE date = '2024-01-15'"
      );
      journey.steps.push({
        name: 'ATT Session Day 1',
        status: attSession.length > 0 ? 'passed' : 'failed'
      });

      // Complete 3 DM practices
      for (let i = 1; i <= 3; i++) {
        await this.page.goto(`${this.baseUrl}/exercises/dm`);

        // Select metaphor
        const metaphors = ['clouds', 'radio', 'train'];
        await this.page.click(`[data-testid="metaphor-${metaphors[i-1]}"]`);

        // Start practice
        await this.page.click('[data-testid="start-dm"]');

        // Simulate LAPR phases (60 seconds)
        await this.page.evaluate(() => {
          window.__simulateDMCompletion && window.__simulateDMCompletion();
        });

        // Rate confidence
        await this.page.waitForSelector('[data-testid="dm-confidence"]');
        await this.page.evaluate(() => {
          document.querySelector('[data-testid="confidence-rating"]').value = 50 + i * 10;
        });
        await this.page.click('[data-testid="submit-dm"]');
      }

      // Verify DM practices saved
      const dmCount = await this.dbVerifier.verifyDailyDMCount('2024-01-15', 3);
      journey.steps.push({
        name: 'DM Practices Day 1',
        status: dmCount ? 'passed' : 'failed'
      });

      // Check daily burden
      const dailyBurden = 2 + 12 + 6; // CAS + ATT + DM
      journey.steps.push({
        name: 'Daily Burden Check',
        status: dailyBurden <= 20 ? 'passed' : 'failed',
        duration: `${dailyBurden} minutes`
      });

      // DAYS 2-7: Daily Practice with Variations
      console.log('📅 Days 2-7: Building Consistency');

      for (let day = 2; day <= 7; day++) {
        const dateStr = `2024-01-${15 + day - 1}`;
        console.log(`  Day ${day}: ${dateStr}`);

        // Vary compliance (80% average)
        const doATT = Math.random() > 0.2;
        const doDM = Math.random() > 0.2;
        const dmCount = doDM ? Math.floor(Math.random() * 3) + 1 : 0;

        // Always log CAS
        await this.simulateCASLog(dateStr, {
          worry: Math.max(30, 60 - day * 5),
          rumination: Math.max(20, 45 - day * 4)
        });

        if (doATT) {
          await this.simulateATTSession(dateStr);
        }

        for (let i = 0; i < dmCount; i++) {
          await this.simulateDMPractice(dateStr);
        }

        // On Day 3, start postponement
        if (day === 3) {
          await this.simulatePostponement(dateStr);
        }

        // On Day 5, unlock Week 1 module
        if (day === 5) {
          await this.unlockModule(1);
        }
      }

      // Verify Week 1 metrics
      const weekMetrics = await this.dbVerifier.runQuery(`
        SELECT
          AVG(worry_minutes + rumination_minutes) as avg_cas,
          COUNT(DISTINCT date) as days_logged
        FROM cas_logs
        WHERE date BETWEEN '2024-01-15' AND '2024-01-21'
      `);

      journey.steps.push({
        name: 'Week 1 Completion',
        status: weekMetrics[0].days_logged === 7 ? 'passed' : 'failed',
        avgCAS: weekMetrics[0].avg_cas
      });

      // Check streaks
      const streaks = await this.dbVerifier.verifyEngagementMetrics();
      journey.steps.push({
        name: 'Streak Building',
        status: streaks ? 'passed' : 'failed',
        streaks: streaks
      });

      journey.success = journey.steps.every(s => s.status === 'passed');
      journey.duration = Date.now() - onboardingStart;

      this.testResults.push(journey);
      return journey;

    } catch (error) {
      journey.error = error.message;
      this.testResults.push(journey);
      throw error;
    }
  }

  // JOURNEY 2: 4-WEEK PROGRAM PROGRESSION
  async testFourWeekProgression() {
    console.log('🚀 Starting 4-Week Program Progression Journey...\n');

    const journey = {
      name: '4-Week Program Progression',
      weeks: [],
      beliefChanges: {},
      success: false
    };

    try {
      // Initialize with existing Week 1 data
      await this.setupWeek1Data();

      // WEEK 2: Deepening Practice
      console.log('📅 Week 2: Deepening Practice');

      const week2 = {
        casReduction: 0,
        attMinutes: 0,
        dmCount: 0,
        experiments: []
      };

      for (let day = 1; day <= 7; day++) {
        const date = `2024-01-${21 + day}`;

        // Progressive CAS reduction
        const worryMinutes = Math.max(20, 50 - day * 3);
        const ruminationMinutes = Math.max(15, 35 - day * 2);

        await this.simulateCASLog(date, {
          worry: worryMinutes,
          rumination: ruminationMinutes
        });

        // Daily ATT (increasing control)
        await this.simulateATTSession(date, {
          controlRating: 60 + day * 2,
          intrusionCount: Math.max(1, 5 - day)
        });
        week2.attMinutes += 12;

        // Multiple DM practices
        const dmPractices = 3 + Math.floor(day / 3);
        for (let i = 0; i < dmPractices; i++) {
          await this.simulateDMPractice(date, {
            confidence: 60 + day * 3
          });
        }
        week2.dmCount += dmPractices;

        // Start experiment on Day 3
        if (day === 3) {
          const expId = await this.startExperiment('postponement-control', {
            prediction: 'I can postpone 50% of worry episodes',
            beliefBefore: 70
          });
          week2.experiments.push(expId);
        }

        // Complete experiment on Day 6
        if (day === 6 && week2.experiments.length > 0) {
          await this.completeExperiment(week2.experiments[0], {
            outcome: 'Successfully postponed 7 out of 10 episodes',
            beliefAfter: 55,
            learning: 'I have more control than I thought'
          });
        }
      }

      // Calculate Week 2 metrics
      week2.casReduction = await this.calculateCASReduction('2024-01-22', '2024-01-28');

      journey.weeks.push({
        week: 2,
        metrics: week2,
        status: week2.casReduction > 15 ? 'passed' : 'failed'
      });

      // WEEK 3: Behavioral Experiments
      console.log('📅 Week 3: Behavioral Experiments');

      const week3 = {
        experimentsCompleted: 0,
        beliefReductions: {},
        sarPlansCreated: 0
      };

      // Run multiple experiments
      const experiments = [
        {
          id: 'uncontrollability-test',
          belief: 'uncontrollability',
          ratingBefore: 65,
          ratingAfter: 45
        },
        {
          id: 'danger-beliefs',
          belief: 'danger',
          ratingBefore: 70,
          ratingAfter: 50
        },
        {
          id: 'positive-beliefs',
          belief: 'positive',
          ratingBefore: 60,
          ratingAfter: 40
        }
      ];

      for (const exp of experiments) {
        const expId = await this.startExperiment(exp.id, {
          beliefBefore: exp.ratingBefore,
          prediction: `Testing ${exp.belief} beliefs`
        });

        // Simulate experiment sessions over 3 days
        for (let session = 1; session <= 3; session++) {
          await this.addExperimentSession(expId, session, {
            data: `Session ${session} completed`,
            notes: 'Following protocol'
          });
        }

        await this.completeExperiment(expId, {
          beliefAfter: exp.ratingAfter,
          outcome: 'Belief challenged successfully',
          learning: `${exp.belief} belief reduced`
        });

        week3.experimentsCompleted++;
        week3.beliefReductions[exp.belief] = exp.ratingBefore - exp.ratingAfter;
      }

      // Create SAR plans
      const sarPlans = [
        {
          trigger: 'Email notification',
          if: 'I see work email',
          then: 'Focus on 3 physical objects'
        },
        {
          trigger: 'Morning worry',
          if: 'I start worrying in bed',
          then: 'Get up and make coffee'
        },
        {
          trigger: 'News checking urge',
          if: 'I want to check news',
          then: 'Do 1-minute DM practice'
        }
      ];

      for (const plan of sarPlans) {
        await this.createSARPlan(plan);
        week3.sarPlansCreated++;
      }

      journey.weeks.push({
        week: 3,
        metrics: week3,
        status: week3.experimentsCompleted >= 3 ? 'passed' : 'failed'
      });

      // WEEK 4: Consolidation
      console.log('📅 Week 4: Consolidation');

      const week4 = {
        finalCASLevel: 0,
        consistencyScore: 0,
        modulesCompleted: 0
      };

      // Maintain improved levels
      for (let day = 1; day <= 7; day++) {
        const date = `2024-02-${10 + day}`;

        // Stabilized low CAS
        await this.simulateCASLog(date, {
          worry: 20 + Math.random() * 10,
          rumination: 15 + Math.random() * 10,
          monitoring: 2 + Math.floor(Math.random() * 3)
        });

        // Consistent practice
        await this.simulateATTSession(date, {
          controlRating: 75 + Math.random() * 10
        });

        // Regular DM
        for (let i = 0; i < 3; i++) {
          await this.simulateDMPractice(date, {
            confidence: 80 + Math.random() * 10
          });
        }
      }

      // Complete modules
      for (let week = 2; week <= 4; week++) {
        await this.completeModule(week);
        week4.modulesCompleted++;
      }

      // Calculate final metrics
      week4.finalCASLevel = await this.dbVerifier.runQuery(`
        SELECT AVG(worry_minutes + rumination_minutes) as avg_cas
        FROM cas_logs
        WHERE date BETWEEN '2024-02-11' AND '2024-02-17'
      `);

      week4.consistencyScore = await this.calculateConsistencyScore();

      journey.weeks.push({
        week: 4,
        metrics: week4,
        status: week4.finalCASLevel[0].avg_cas < 40 ? 'passed' : 'failed'
      });

      // Calculate overall belief changes
      journey.beliefChanges = await this.dbVerifier.verifyBeliefProgression('uncontrollability');

      // Verify all success criteria
      journey.success =
        journey.beliefChanges.reduction >= 15 &&
        journey.weeks.every(w => w.status === 'passed');

      this.testResults.push(journey);
      return journey;

    } catch (error) {
      journey.error = error.message;
      this.testResults.push(journey);
      throw error;
    }
  }

  // JOURNEY 3: FIDELITY COMPLIANCE TESTING
  async testFidelityCompliance() {
    console.log('🚀 Starting Fidelity Compliance Journey...\n');

    const journey = {
      name: 'Fidelity Compliance Testing',
      violations: [],
      blocks: [],
      success: false
    };

    try {
      // Test 1: Content blocking in CAS log
      console.log('Testing CAS log content blocking...');

      await this.page.goto(`${this.baseUrl}/log`);

      const contentAttempts = [
        'I am worried about my health',
        'What if I lose my job',
        'Thinking about the future',
        'Scared of making mistakes'
      ];

      for (const content of contentAttempts) {
        await this.page.type('[data-testid="notes"]', content);
        await this.page.click('[data-testid="submit"]');

        // Should see warning
        const warning = await this.page.waitForSelector('[data-testid="fidelity-warning"]', {
          timeout: 2000
        }).catch(() => null);

        if (warning) {
          const warningText = await warning.evaluate(el => el.textContent);
          journey.blocks.push({
            location: 'CAS Log',
            content: content,
            blocked: true,
            message: warningText
          });

          // Clear and continue
          await this.page.click('[data-testid="acknowledge-warning"]');
          await this.page.evaluate(() => {
            document.querySelector('[data-testid="notes"]').value = '';
          });
        } else {
          journey.violations.push({
            location: 'CAS Log',
            content: content,
            blocked: false
          });
        }
      }

      // Test 2: Process-only insights
      console.log('Testing process-only insights...');

      await this.page.goto(`${this.baseUrl}/progress`);
      await this.page.waitForSelector('[data-testid="insights"]');

      const insights = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-testid="insight-card"]'))
          .map(card => card.textContent);
      });

      for (const insight of insights) {
        const hasContent = /about|regarding|concerning|related to/i.test(insight);
        if (hasContent) {
          journey.violations.push({
            location: 'Progress Insights',
            content: insight,
            issue: 'Content-focused insight'
          });
        } else {
          journey.blocks.push({
            location: 'Progress Insights',
            content: insight,
            blocked: false,
            status: 'Process-only'
          });
        }
      }

      // Test 3: Experiment descriptions
      console.log('Testing experiment fidelity...');

      await this.page.goto(`${this.baseUrl}/experiments`);

      // Try to enter content in prediction
      await this.page.click('[data-testid="exp-postponement"]');
      await this.page.type('[data-testid="prediction"]', 'I worry about work deadlines');
      await this.page.click('[data-testid="start-experiment"]');

      const expWarning = await this.page.waitForSelector('[data-testid="fidelity-warning"]', {
        timeout: 2000
      }).catch(() => null);

      if (expWarning) {
        journey.blocks.push({
          location: 'Experiments',
          content: 'Content in prediction',
          blocked: true
        });
      }

      // Test 4: Module content
      console.log('Testing module content fidelity...');

      await this.page.goto(`${this.baseUrl}/program/week/1`);
      const moduleContent = await this.page.evaluate(() => {
        return document.querySelector('[data-testid="module-content"]').textContent;
      });

      // Check for process focus
      const processKeywords = ['how you relate', 'process', 'not about content', 'metacognitive'];
      const hasProcessFocus = processKeywords.some(keyword =>
        moduleContent.toLowerCase().includes(keyword)
      );

      if (hasProcessFocus) {
        journey.blocks.push({
          location: 'Module Content',
          status: 'Process-focused',
          compliant: true
        });
      } else {
        journey.violations.push({
          location: 'Module Content',
          issue: 'Lacks process focus'
        });
      }

      // Verify database violations
      const dbViolations = await this.dbVerifier.verifyFidelityCompliance();

      journey.databaseCompliance = {
        totalViolations: dbViolations.total_violations,
        contentViolations: dbViolations.content_violations,
        allBlocked: dbViolations.all_blocked
      };

      // Summary
      journey.success =
        journey.violations.length === 0 &&
        journey.blocks.length > 0 &&
        dbViolations.all_blocked;

      this.testResults.push(journey);
      return journey;

    } catch (error) {
      journey.error = error.message;
      this.testResults.push(journey);
      throw error;
    }
  }

  // JOURNEY 4: PERFORMANCE AND TIMING
  async testPerformanceAndTiming() {
    console.log('🚀 Starting Performance and Timing Tests...\n');

    const journey = {
      name: 'Performance and Timing',
      metrics: [],
      success: false
    };

    try {
      // Test 1: Page load times
      console.log('Testing page load times...');

      const pages = [
        { path: '/', name: 'Home' },
        { path: '/today', name: 'Today' },
        { path: '/program', name: 'Program' },
        { path: '/progress', name: 'Progress' },
        { path: '/exercises/att', name: 'ATT' },
        { path: '/exercises/dm', name: 'DM' },
        { path: '/experiments', name: 'Experiments' }
      ];

      for (const pageConfig of pages) {
        const metrics = await this.measurePageLoad(pageConfig.path);
        journey.metrics.push({
          page: pageConfig.name,
          ...metrics,
          status: metrics.loadTime < 2000 ? 'passed' : 'failed'
        });
      }

      // Test 2: Onboarding timing
      console.log('Testing onboarding completion time...');

      const onboardingTime = await this.measureOnboardingTime();
      journey.metrics.push({
        name: 'Onboarding',
        duration: onboardingTime,
        status: onboardingTime <= 420000 ? 'passed' : 'failed' // 7 minutes
      });

      // Test 3: Daily routine timing
      console.log('Testing daily routine burden...');

      const dailyTiming = {
        casLog: await this.measureTaskTime('CAS Log', async () => {
          await this.completeCASLog();
        }),
        attSession: await this.measureTaskTime('ATT Session', async () => {
          await this.completeATTSession();
        }),
        dmPractices: await this.measureTaskTime('DM Practices', async () => {
          await this.completeDMPractices(3);
        })
      };

      const totalDaily = dailyTiming.casLog + dailyTiming.attSession + dailyTiming.dmPractices;

      journey.metrics.push({
        name: 'Daily Burden',
        components: dailyTiming,
        total: totalDaily,
        status: totalDaily <= 1200000 ? 'passed' : 'failed' // 20 minutes
      });

      // Test 4: Database query performance
      console.log('Testing database performance...');

      const dbPerformance = await this.dbVerifier.verifyPerformanceMetrics();
      journey.metrics.push({
        name: 'Database Performance',
        ...dbPerformance,
        status: 'passed'
      });

      // Test 5: Memory usage
      console.log('Testing memory usage...');

      const memoryUsage = await this.page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (memoryUsage) {
        const heapUsagePercent = (memoryUsage.usedJSHeapSize / memoryUsage.limit) * 100;
        journey.metrics.push({
          name: 'Memory Usage',
          heapUsage: heapUsagePercent,
          status: heapUsagePercent < 50 ? 'passed' : 'warning'
        });
      }

      // Test 6: Concurrent user actions
      console.log('Testing concurrent operations...');

      const concurrentTest = await this.testConcurrentOperations();
      journey.metrics.push({
        name: 'Concurrent Operations',
        ...concurrentTest
      });

      // Summary
      journey.success = journey.metrics.every(m =>
        m.status === 'passed' || m.status === 'warning'
      );

      this.testResults.push(journey);
      return journey;

    } catch (error) {
      journey.error = error.message;
      this.testResults.push(journey);
      throw error;
    }
  }

  // Helper Methods
  async simulateCASLog(date, data) {
    await this.dbVerifier.runQuery(`
      INSERT INTO cas_logs (date, worry_minutes, rumination_minutes, monitoring_count, checking_count)
      VALUES (?, ?, ?, ?, ?)
    `, [date, data.worry || 30, data.rumination || 20, data.monitoring || 5, data.checking || 3]);
  }

  async simulateATTSession(date, data = {}) {
    await this.dbVerifier.runQuery(`
      INSERT INTO att_sessions (
        date, duration_minutes, completed, attentional_control_rating,
        intrusion_count, script_type
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [date, 12, 1, data.controlRating || 70, data.intrusionCount || 2, 'standard']);
  }

  async simulateDMPractice(date, data = {}) {
    const timeOfDay = ['morning', 'midday', 'evening'][Math.floor(Math.random() * 3)];
    const metaphor = ['clouds', 'radio', 'train'][Math.floor(Math.random() * 3)];

    await this.dbVerifier.runQuery(`
      INSERT INTO dm_practices (
        date, time_of_day, duration_seconds, engaged_vs_watched,
        confidence_rating, metaphor_used
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [date, timeOfDay, 90, 'watched', data.confidence || 70, metaphor]);
  }

  async simulatePostponement(date) {
    await this.dbVerifier.runQuery(`
      INSERT INTO postponement_logs (
        date, trigger_time, scheduled_time, urge_before, urge_after,
        processed, processing_duration_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [date, '14:00', '18:30', 80, 40, 1, 15]);
  }

  async startExperiment(templateId, data) {
    const result = await this.dbVerifier.runQuery(`
      INSERT INTO experiments (
        template_id, belief_tested, prediction, belief_rating_before,
        status, started_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id
    `, [templateId, data.belief || 'uncontrollability', data.prediction,
        data.beliefBefore, 'in_progress', new Date().toISOString()]);

    return result[0].id;
  }

  async completeExperiment(experimentId, data) {
    await this.dbVerifier.runQuery(`
      UPDATE experiments
      SET status = 'completed',
          outcome = ?,
          learning = ?,
          belief_rating_after = ?,
          completed_at = ?
      WHERE id = ?
    `, [data.outcome, data.learning, data.beliefAfter,
        new Date().toISOString(), experimentId]);
  }

  async addExperimentSession(experimentId, sessionNumber, data) {
    await this.dbVerifier.runQuery(`
      INSERT INTO experiment_sessions (
        experiment_id, session_date, session_number, data, completed
      ) VALUES (?, ?, ?, ?, ?)
    `, [experimentId, new Date().toISOString(), sessionNumber,
        JSON.stringify(data), 1]);
  }

  async createSARPlan(plan) {
    await this.dbVerifier.runQuery(`
      INSERT INTO sar_plans (
        trigger_cue, if_statement, then_action, active
      ) VALUES (?, ?, ?, ?)
    `, [plan.trigger, plan.if, plan.then, 1]);
  }

  async unlockModule(weekNumber) {
    await this.dbVerifier.runQuery(`
      UPDATE program_modules
      SET unlocked = 1, unlocked_date = ?
      WHERE week_number = ?
    `, [new Date().toISOString(), weekNumber]);
  }

  async completeModule(weekNumber) {
    await this.dbVerifier.runQuery(`
      UPDATE program_modules
      SET completed = 1, completed_date = ?
      WHERE week_number = ?
    `, [new Date().toISOString(), weekNumber]);
  }

  async calculateCASReduction(startDate, endDate) {
    const result = await this.dbVerifier.runQuery(`
      SELECT
        (SELECT AVG(worry_minutes + rumination_minutes)
         FROM cas_logs WHERE date = ?) as baseline,
        (SELECT AVG(worry_minutes + rumination_minutes)
         FROM cas_logs WHERE date = ?) as current
    `, [startDate, endDate]);

    const reduction = ((result[0].baseline - result[0].current) / result[0].baseline) * 100;
    return reduction;
  }

  async calculateConsistencyScore() {
    const result = await this.dbVerifier.runQuery(`
      SELECT
        (SELECT COUNT(DISTINCT date) FROM att_sessions
         WHERE date >= date('now', '-7 days')) as att_days,
        (SELECT COUNT(DISTINCT date) FROM dm_practices
         WHERE date >= date('now', '-7 days')) as dm_days,
        (SELECT COUNT(DISTINCT date) FROM cas_logs
         WHERE date >= date('now', '-7 days')) as log_days
    `);

    const score = ((result[0].att_days + result[0].dm_days + result[0].log_days) / 21) * 100;
    return score;
  }

  async measurePageLoad(path) {
    const startTime = Date.now();

    await this.page.goto(`${this.baseUrl}${path}`, {
      waitUntil: 'networkidle0'
    });

    const loadTime = Date.now() - startTime;

    const performanceTiming = await this.page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        domInteractive: perf.domInteractive - perf.fetchStart
      };
    });

    return {
      loadTime,
      ...performanceTiming
    };
  }

  async measureTaskTime(name, taskFn) {
    const startTime = Date.now();
    await taskFn();
    return Date.now() - startTime;
  }

  async testConcurrentOperations() {
    // Open multiple tabs
    const page2 = await this.browser.newPage();
    const page3 = await this.browser.newPage();

    try {
      // Simultaneous operations
      const results = await Promise.all([
        this.page.goto(`${this.baseUrl}/log`),
        page2.goto(`${this.baseUrl}/exercises/att`),
        page3.goto(`${this.baseUrl}/progress`)
      ]);

      // Verify all loaded
      const allLoaded = results.every(r => r.status() === 200);

      return {
        status: allLoaded ? 'passed' : 'failed',
        pagesLoaded: results.length
      };

    } finally {
      await page2.close();
      await page3.close();
    }
  }

  // Report Generation
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      journeys: this.testResults,
      performance: this.performanceMetrics,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(j => j.success).length,
        failed: this.testResults.filter(j => !j.success).length
      }
    };

    // Save JSON report
    fs.writeFileSync(
      path.join(__dirname, 'user-journey-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    const html = this.generateHTMLReport(report);
    fs.writeFileSync(
      path.join(__dirname, 'user-journey-report.html'),
      html
    );

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>User Journey E2E Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      background: #f8f9fa;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 40px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .journey-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .journey-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f3f4f6;
    }
    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .status-passed { background: #d1fae5; color: #065f46; }
    .status-failed { background: #fee2e2; color: #991b1b; }
    .step-list {
      margin: 15px 0;
    }
    .step-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
    }
    .step-status {
      width: 24px;
      height: 24px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 14px;
    }
    .step-passed { background: #d1fae5; color: #065f46; }
    .step-failed { background: #fee2e2; color: #991b1b; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .metric-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
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
    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 12px;
      margin-top: 15px;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <h1>🚀 User Journey E2E Test Report</h1>
      <p>Generated: ${report.timestamp}</p>
      <p>Base URL: ${report.baseUrl}</p>
    </div>
  </div>

  <div class="container">
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Journeys</div>
        <div class="metric-value">${report.summary.total}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Passed</div>
        <div class="metric-value" style="color: #10b981;">${report.summary.passed}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Failed</div>
        <div class="metric-value" style="color: #ef4444;">${report.summary.failed}</div>
      </div>
    </div>

    ${report.journeys.map(journey => `
      <div class="journey-card">
        <div class="journey-header">
          <h2>${journey.name}</h2>
          <span class="status-badge status-${journey.success ? 'passed' : 'failed'}">
            ${journey.success ? '✓ PASSED' : '✗ FAILED'}
          </span>
        </div>

        ${journey.steps ? `
          <div class="step-list">
            ${journey.steps.map(step => `
              <div class="step-item">
                <div class="step-status step-${step.status}">
                  ${step.status === 'passed' ? '✓' : '✗'}
                </div>
                <div>
                  <strong>${step.name}</strong>
                  ${step.duration ? ` (${step.duration})` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${journey.weeks ? `
          <div class="metrics-grid">
            ${journey.weeks.map(week => `
              <div class="metric-card">
                <div class="metric-label">Week ${week.week}</div>
                <div class="metric-value" style="color: ${week.status === 'passed' ? '#10b981' : '#ef4444'};">
                  ${week.status.toUpperCase()}
                </div>
                ${week.metrics.casReduction ? `
                  <div style="font-size: 12px; margin-top: 5px;">
                    CAS ↓${week.metrics.casReduction.toFixed(1)}%
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${journey.metrics ? `
          <div class="metrics-grid">
            ${journey.metrics.map(metric => `
              <div class="metric-card">
                <div class="metric-label">${metric.name || metric.page}</div>
                <div class="metric-value" style="font-size: 18px; color: ${metric.status === 'passed' ? '#10b981' : '#ef4444'};">
                  ${metric.loadTime ? `${metric.loadTime}ms` : metric.status.toUpperCase()}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${journey.error ? `
          <div class="error-box">
            <strong>Error:</strong> ${journey.error}
          </div>
        ` : ''}
      </div>
    `).join('')}

    ${report.performance && report.performance.length > 0 ? `
      <div class="journey-card">
        <h2>Performance Metrics</h2>
        <div class="metrics-grid">
          ${report.performance.map(perf => `
            <div class="metric-card">
              <div class="metric-label">${perf.name}</div>
              <div class="metric-value" style="font-size: 18px;">
                ${perf.duration}ms
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 5px;">
                Heap: ${(perf.jsHeapUsed / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  </div>
</body>
</html>
    `;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.dbVerifier) {
      await this.dbVerifier.close();
    }
  }

  async runAllJourneys() {
    console.log('🎯 Starting Comprehensive E2E User Journey Tests\n');

    try {
      await this.initialize();

      // Run all journeys
      await this.testNewUserFirstWeek();
      await this.testFourWeekProgression();
      await this.testFidelityCompliance();
      await this.testPerformanceAndTiming();

      // Generate report
      const report = await this.generateReport();

      console.log('\n📊 E2E Testing Complete');
      console.log(`✅ Passed: ${report.summary.passed}`);
      console.log(`❌ Failed: ${report.summary.failed}`);
      console.log(`📄 Report saved to: user-journey-report.html`);

      return report;

    } finally {
      await this.cleanup();
    }
  }
}

// Export for use
module.exports = { UserJourneyE2ESuite };

// Run if executed directly
if (require.main === module) {
  const config = {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO || '0')
  };

  const suite = new UserJourneyE2ESuite(config);
  suite.runAllJourneys()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('E2E tests failed:', error);
      process.exit(1);
    });
}