const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runSimpleVisualTest() {
  console.log('🎨 Running Simple Visual Test\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Create screenshots directory
    const screenshotDir = path.join(__dirname, 'screenshots', 'simple');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Test available pages
    const pages = [
      { url: 'http://localhost:3000/', name: 'home' },
      { url: 'http://localhost:3000/onboarding', name: 'onboarding' },
      { url: 'http://localhost:3000/log', name: 'cas-log' },
      { url: 'http://localhost:3000/today', name: 'today' },
      { url: 'http://localhost:3000/program', name: 'program' },
      { url: 'http://localhost:3000/progress', name: 'progress' }
    ];

    for (const pageInfo of pages) {
      try {
        console.log(`📸 Capturing ${pageInfo.name}...`);
        await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 10000 });

        // Wait a bit for any animations
        await new Promise(resolve => setTimeout(resolve, 1000));

        const screenshotPath = path.join(screenshotDir, `${pageInfo.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: pageInfo.name === 'program' // Full page for program list
        });

        console.log(`  ✅ Saved: ${screenshotPath}`);
      } catch (error) {
        console.log(`  ❌ Failed to capture ${pageInfo.name}: ${error.message}`);
      }
    }

    // Test API endpoints
    console.log('\n🔍 Testing API endpoints...');
    const apiTests = [
      { url: 'http://localhost:3001/api/health', name: 'API Health' },
      { url: 'http://localhost:3001/api/settings', name: 'Settings' },
      { url: 'http://localhost:3001/api/cas-logs', name: 'CAS Logs' }
    ];

    for (const api of apiTests) {
      try {
        const response = await page.goto(api.url, { waitUntil: 'networkidle0' });
        const status = response.status();
        console.log(`  ${status === 200 ? '✅' : '❌'} ${api.name}: ${status}`);
      } catch (error) {
        console.log(`  ❌ ${api.name}: ${error.message}`);
      }
    }

    console.log('\n✅ Simple visual test completed!');
    console.log(`Screenshots saved to: ${screenshotDir}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
runSimpleVisualTest().catch(console.error);