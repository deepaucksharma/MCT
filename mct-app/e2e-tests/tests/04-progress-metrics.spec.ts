import { test, expect } from '@playwright/test';

test.describe('Progress Tracking and Metrics', () => {
  test('should display CAS reduction trends', async ({ page }) => {
    await page.goto('/progress');

    // Verify CAS graph is present
    await expect(page.getByText(/CAS Reduction/i)).toBeVisible();
    await expect(page.locator('[data-testid="cas-reduction-graph"]')).toBeVisible();

    // Check for trend lines
    await expect(page.getByText(/Worry.*minutes/i)).toBeVisible();
    await expect(page.getByText(/Rumination.*minutes/i)).toBeVisible();
    await expect(page.getByText(/Monitoring.*frequency/i)).toBeVisible();

    // Verify timeframe selector
    await page.getByRole('button', { name: /30 days/i }).click();
    await page.getByRole('button', { name: /60 days/i }).click();
    await page.getByRole('button', { name: /90 days/i }).click();

    // Data should update
    await expect(page.locator('[data-testid="cas-reduction-graph"]')).toBeVisible();
  });

  test('should show belief change tracking', async ({ page }) => {
    await page.goto('/progress');

    // Find belief tracker section
    await expect(page.getByText(/Belief Change/i)).toBeVisible();
    await expect(page.locator('[data-testid="belief-change-tracker"]')).toBeVisible();

    // Check for three belief types
    await expect(page.getByText(/Uncontrollability/i)).toBeVisible();
    await expect(page.getByText(/Danger/i)).toBeVisible();
    await expect(page.getByText(/Positive/i)).toBeVisible();

    // Each should show percentage change
    const changeIndicators = page.locator('[data-testid="belief-change-percentage"]');
    const count = await changeIndicators.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should display practice consistency heat map', async ({ page }) => {
    await page.goto('/progress');

    // Find heat map
    await expect(page.getByText(/Practice Consistency/i)).toBeVisible();
    await expect(page.locator('[data-testid="practice-heat-map"]')).toBeVisible();

    // Should show calendar grid
    const heatMapCells = page.locator('[data-testid="heat-map-cell"]');
    const cellCount = await heatMapCells.count();
    expect(cellCount).toBeGreaterThan(0);

    // Hover for details
    if (cellCount > 0) {
      await heatMapCells.first().hover();
      await expect(page.locator('[role="tooltip"]')).toBeVisible();
    }
  });

  test('should calculate and show weekly summaries', async ({ page }) => {
    await page.goto('/progress');

    // Find weekly summary
    await expect(page.getByText(/Weekly Summary/i)).toBeVisible();

    // Should show key metrics
    await expect(page.getByText(/ATT Sessions/i)).toBeVisible();
    await expect(page.getByText(/DM Practices/i)).toBeVisible();
    await expect(page.getByText(/CAS Average/i)).toBeVisible();
    await expect(page.getByText(/Experiments/i)).toBeVisible();

    // Each metric should have a value
    const metricValues = page.locator('[data-testid="metric-value"]');
    const valueCount = await metricValues.count();
    expect(valueCount).toBeGreaterThanOrEqual(4);
  });

  test('should generate progress insights', async ({ page }) => {
    await page.goto('/progress');

    // Find insights section
    await expect(page.getByText(/Progress Insights/i)).toBeVisible();

    // Should have automated insights
    const insights = page.locator('[data-testid="insight-item"]');
    const insightCount = await insights.count();
    expect(insightCount).toBeGreaterThan(0);

    // Insights should be process-focused
    const firstInsight = await insights.first().textContent();
    expect(firstInsight).not.toContain('worry about');
    expect(firstInsight).not.toContain('fear of');
  });

  test('should track engagement metrics', async ({ page }) => {
    await page.goto('/progress');

    // Find engagement section
    await expect(page.locator('[data-testid="engagement-metrics"]')).toBeVisible();

    // Check for streaks
    await expect(page.getByText(/Current Streaks/i)).toBeVisible();
    await expect(page.locator('[data-testid="att-streak-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="dm-streak-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="logging-streak-display"]')).toBeVisible();

    // Check for completion rates
    await expect(page.getByText(/Completion Rate/i)).toBeVisible();
    const completionRate = await page.locator('[data-testid="completion-percentage"]').textContent();
    expect(completionRate).toMatch(/\d+%/);
  });

  test('should show experiment success rates', async ({ page }) => {
    await page.goto('/progress');

    // Find experiments section
    await expect(page.locator('[data-testid="experiment-outcomes"]')).toBeVisible();

    // Should show statistics
    await expect(page.getByText(/Experiments Completed/i)).toBeVisible();
    await expect(page.getByText(/Success Rate/i)).toBeVisible();
    await expect(page.getByText(/Belief Change Average/i)).toBeVisible();

    // Check for recent experiments list
    const recentExperiments = page.locator('[data-testid="recent-experiment"]');
    const experimentCount = await recentExperiments.count();

    if (experimentCount > 0) {
      const firstExperiment = recentExperiments.first();
      await expect(firstExperiment.locator('[data-testid="experiment-belief"]')).toBeVisible();
      await expect(firstExperiment.locator('[data-testid="belief-change"]')).toBeVisible();
    }
  });

  test('should export progress data', async ({ page }) => {
    await page.goto('/progress');

    // Find export button
    const exportButton = page.getByRole('button', { name: /Export Data/i });

    if (await exportButton.isVisible()) {
      // Start download
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        exportButton.click()
      ]);

      // Verify download
      expect(download.suggestedFilename()).toMatch(/mct.*progress.*\.json/i);
    }
  });

  test('should compare current vs baseline metrics', async ({ page }) => {
    await page.goto('/progress');

    // Look for baseline comparison
    await expect(page.getByText(/vs.*Baseline/i)).toBeVisible();

    // Should show improvement percentages
    const improvements = page.locator('[data-testid="improvement-percentage"]');
    const improvementCount = await improvements.count();
    expect(improvementCount).toBeGreaterThan(0);

    // Check for positive/negative indicators
    const firstImprovement = await improvements.first().textContent();
    expect(firstImprovement).toMatch(/[+-]\d+%/);
  });

  test('should provide personalized focus areas', async ({ page }) => {
    await page.goto('/progress');

    // Find focus areas section
    const focusSection = page.locator('[data-testid="focus-areas"]');

    if (await focusSection.isVisible()) {
      await expect(focusSection.getByText(/Areas for Focus/i)).toBeVisible();

      // Should suggest specific practices
      const suggestions = focusSection.locator('[data-testid="focus-suggestion"]');
      const suggestionCount = await suggestions.count();
      expect(suggestionCount).toBeGreaterThan(0);

      // Suggestions should be process-focused
      const firstSuggestion = await suggestions.first().textContent();
      expect(firstSuggestion).toMatch(/practice|attention|postpone|experiment/i);
    }
  });
});