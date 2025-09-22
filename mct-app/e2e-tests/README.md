# MCT E2E Test Suite

Comprehensive end-to-end testing suite for the MCT Digital Therapeutic application, including database verification, visual regression testing, and full user journey simulations.

## 🎯 Test Coverage

### 1. Database Verification Tests
- **Onboarding data integrity**
- **CAS logging and metrics**
- **ATT/DM session tracking**
- **Belief ratings progression**
- **Experiment data**
- **Fidelity compliance**
- **Performance metrics**
- **Data integrity checks**

### 2. Visual Regression Tests
- **Onboarding flow screenshots**
- **Daily interface components**
- **ATT/DM exercise interfaces**
- **Progress dashboards**
- **Module content display**
- **Error states**
- **Responsive design**

### 3. User Journey Tests
- **New user first week experience**
- **4-week program progression**
- **Fidelity compliance testing**
- **Performance and timing verification**

## 📋 Prerequisites

1. **Server Running**: MCT app server must be running at `http://localhost:3000`
   ```bash
   cd ../server && npm run dev
   cd ../client && npm run dev
   ```

2. **Database Initialized**: SQLite database must exist at `../server/data/mct.db`

3. **Dependencies Installed**:
   ```bash
   npm install
   ```

## 🚀 Running Tests

### Run All Test Suites
```bash
npm test
```

### Run Specific Test Suite
```bash
# Database tests only
npm run test:database

# Visual regression tests only
npm run test:visual

# User journey tests only
npm run test:journey
```

### Advanced Options
```bash
# Run tests in parallel
npm run test:parallel

# Show browser during tests (non-headless)
npm run test:browser

# Run specific suites
node run-all-tests.js --suites database,visual

# Use custom URL
node run-all-tests.js --url http://localhost:3001
```

### Update Visual Baselines
```bash
npm run update-baselines
```

## 📊 Test Reports

After running tests, reports are generated in multiple formats:

- **HTML Reports**:
  - `reports/master-report.html` - Overall summary
  - `database-verification-report.html` - Database test details
  - `screenshots/visual-regression-report.html` - Visual test results
  - `user-journey-report.html` - Journey test details

- **JSON Reports**: Machine-readable results in `reports/` directory

- **Screenshots**:
  - `screenshots/baseline/` - Reference screenshots
  - `screenshots/current/` - Latest test run
  - `screenshots/diff/` - Visual differences

## 🧪 Test Scenarios

### Database Verification (20+ tests)
- Onboarding completion verification
- CAS metrics tracking and reduction
- ATT/DM practice consistency
- Belief rating changes over time
- Experiment completion tracking
- Fidelity violation monitoring
- Data integrity validation
- Query performance benchmarks

### Visual Regression (50+ screenshots)
- Every onboarding step
- All exercise interfaces
- Progress visualizations
- Module content pages
- Error and warning states
- Mobile/tablet/desktop views

### User Journeys (4 comprehensive flows)
1. **New User First Week**
   - Complete onboarding (≤7 minutes)
   - Daily CAS logging
   - ATT sessions (12 minutes)
   - DM practices (3x daily)
   - Progress tracking

2. **4-Week Progression**
   - Weekly module completion
   - Belief reduction tracking
   - Experiment execution
   - SAR plan creation
   - Metric improvements

3. **Fidelity Compliance**
   - Content blocking verification
   - Process-only insights
   - No reassurance mechanisms
   - MCT principle adherence

4. **Performance Testing**
   - Page load times (≤2 seconds)
   - Daily burden (≤20 minutes)
   - Database query performance
   - Memory usage monitoring

## ⚙️ Configuration

Edit test configuration in `run-all-tests.js`:

```javascript
{
  baseUrl: 'http://localhost:3000',
  dbPath: '../server/data/mct.db',
  headless: true,
  parallel: false,
  testSuites: ['database', 'visual', 'journey'],
  reportDir: './reports',
  screenshotDir: './screenshots'
}
```

## 🔍 Debugging Failed Tests

1. **Check Prerequisites**: Run tests with `--help` to see configuration
2. **View HTML Reports**: Open generated HTML files for detailed failure information
3. **Compare Screenshots**: Check `screenshots/diff/` for visual differences
4. **Database State**: Examine database directly with SQLite browser
5. **Run Individual Tests**: Test specific components in isolation

## 📈 Success Criteria

Tests verify the product meets these MCT requirements:

- ✅ **Onboarding**: Completes in ≤7 minutes
- ✅ **Daily Burden**: Total practice ≤20 minutes
- ✅ **CAS Reduction**: ≥20% by Week 4
- ✅ **Belief Change**: ≥15 point reduction
- ✅ **Fidelity**: 100% process-focused
- ✅ **Performance**: Page loads ≤2 seconds
- ✅ **Data Integrity**: No orphaned records
- ✅ **Visual Consistency**: <5% pixel difference

## 🛠️ Maintenance

### Updating Tests
1. Modify test scenarios in respective test files
2. Update baselines if UI changes: `npm run update-baselines`
3. Add new journey steps as features are added

### Clean Up
```bash
# Clean test artifacts
npm run clean

# Full cleanup including node_modules
npm run clean:all
```

## 📝 Test File Structure

```
e2e-tests/
├── TEST_SCENARIOS.md           # Detailed test specifications
├── database-verification.js    # Database test suite
├── visual-regression.js        # Visual test suite
├── user-journey-tests.js       # Journey test suite
├── run-all-tests.js           # Master test runner
├── package.json               # Dependencies and scripts
├── README.md                  # This file
├── reports/                   # Generated test reports
│   ├── master-report.html
│   └── *.json
└── screenshots/              # Visual test artifacts
    ├── baseline/            # Reference screenshots
    ├── current/            # Latest test run
    └── diff/              # Visual differences
```

## 🤝 Contributing

When adding new features:
1. Add corresponding database verification tests
2. Capture new UI states for visual regression
3. Update user journey flows
4. Ensure fidelity compliance
5. Document test scenarios in TEST_SCENARIOS.md

## ⚠️ Important Notes

- Tests use a mock date (2024-01-15) for consistency
- Database tests may modify data - use test database
- Visual tests require consistent window size (1280x800)
- Some tests simulate time-based progressions
- Fidelity tests ensure MCT compliance throughout

## 🐛 Troubleshooting

### Common Issues

**Server not accessible**
- Ensure both client and server are running
- Check ports 3000 (client) and 3001 (server)

**Database not found**
- Run database initialization in server directory
- Check path in configuration

**Visual tests failing**
- Update baselines after intentional UI changes
- Check for dynamic content (timestamps, IDs)

**Journey tests timeout**
- Increase timeout in test configuration
- Check for blocking UI elements
- Verify selectors match current UI

## 📞 Support

For issues or questions about the test suite:
1. Check test output and HTML reports
2. Review TEST_SCENARIOS.md for expected behavior
3. Examine specific test implementation files
4. Contact the development team with report artifacts