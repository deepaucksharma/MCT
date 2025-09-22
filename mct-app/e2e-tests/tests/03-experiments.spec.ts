import { test, expect } from '@playwright/test';

test.describe('Behavioral Experiments', () => {
  test('should create experiment from template', async ({ page }) => {
    await page.goto('/experiments');

    // Browse templates
    await page.getByRole('button', { name: /Browse Templates/i }).click();

    // Select Postponement Control Test
    await page.getByText(/Postponement Control Test/i).click();
    await page.getByRole('button', { name: /Use Template/i }).click();

    // Customize experiment
    await expect(page.getByText(/Customize Your Experiment/i)).toBeVisible();

    // Set belief rating before
    await page.locator('input[type="range"][name="belief_rating_before"]').fill('75');

    // Modify prediction if needed
    const predictionField = page.locator('textarea[name="prediction"]');
    await expect(predictionField).toHaveValue(/won't be able to stop/i);

    // Add safety behaviors to drop
    await page.getByRole('button', { name: /Add Safety Behavior/i }).click();
    await page.locator('input[placeholder*="safety behavior"]').fill('Distraction techniques');

    // Start experiment
    await page.getByRole('button', { name: /Start Experiment/i }).click();

    await expect(page.getByText(/Experiment Started/i)).toBeVisible();
  });

  test('should track experiment progress', async ({ page }) => {
    // Create an experiment first
    await page.goto('/experiments');
    await page.getByRole('button', { name: /New Experiment/i }).click();

    // Quick setup
    await page.locator('input[name="belief_tested"]').fill('Worry is uncontrollable');
    await page.locator('textarea[name="prediction"]').fill('I cannot stop worrying once started');
    await page.locator('input[type="range"][name="belief_rating_before"]').fill('80');

    // Add protocol steps
    await page.getByRole('button', { name: /Add Step/i }).click();
    await page.locator('input[placeholder*="step description"]').fill('Notice worry trigger');

    await page.getByRole('button', { name: /Add Step/i }).click();
    await page.locator('input[placeholder*="step description"]').last().fill('Postpone for 2 hours');

    await page.getByRole('button', { name: /Create Experiment/i }).click();

    // View experiment details
    await expect(page.getByText(/Experiment Created/i)).toBeVisible();
    await page.getByRole('button', { name: /View Details/i }).click();

    // Complete steps
    await page.getByRole('checkbox', { name: /Notice worry trigger/i }).check();
    await page.getByRole('checkbox', { name: /Postpone for 2 hours/i }).check();

    // Complete experiment
    await page.getByRole('button', { name: /Complete Experiment/i }).click();

    // Fill outcome
    await page.locator('textarea[name="outcome"]').fill('Was able to postpone worry successfully');
    await page.locator('textarea[name="learning"]').fill('I have more control than I thought');
    await page.locator('input[type="range"][name="belief_rating_after"]').fill('50');

    await page.getByRole('button', { name: /Save Results/i }).click();

    await expect(page.getByText(/Experiment Completed/i)).toBeVisible();
  });

  test('should enforce process focus in experiments', async ({ page }) => {
    await page.goto('/experiments/new');

    // Try to enter content-focused text
    const beliefField = page.locator('input[name="belief_tested"]');
    await beliefField.fill('I am worried about my health issues');

    // Should show warning or block
    await page.getByRole('button', { name: /Create/i }).click();

    // Check for fidelity warning
    await expect(page.getByText(/focus on process/i)).toBeVisible();

    // Correct to process focus
    await beliefField.clear();
    await beliefField.fill('Worry is uncontrollable');

    await page.getByRole('button', { name: /Create/i }).click();

    // Should proceed now
    await expect(page.getByText(/Experiment Created/i)).toBeVisible();
  });

  test('should show experiment history and outcomes', async ({ page }) => {
    await page.goto('/experiments');

    // View completed experiments
    await page.getByRole('tab', { name: /Completed/i }).click();

    // Should show past experiments
    const experiments = page.locator('[data-testid="experiment-card"]');
    const count = await experiments.count();

    if (count > 0) {
      // Click first experiment
      await experiments.first().click();

      // Should show details
      await expect(page.getByText(/Belief tested/i)).toBeVisible();
      await expect(page.getByText(/Outcome/i)).toBeVisible();
      await expect(page.getByText(/Learning/i)).toBeVisible();
      await expect(page.getByText(/Belief change/i)).toBeVisible();
    }
  });

  test('should suggest experiments based on week and beliefs', async ({ page }) => {
    await page.goto('/experiments');

    // Check for suggestions
    await expect(page.getByText(/Suggested for you/i)).toBeVisible();

    // Suggestions should be based on current week
    const weekIndicator = await page.locator('[data-testid="current-week"]').textContent();
    const weekNumber = parseInt(weekIndicator || '0');

    // Different experiments for different weeks
    if (weekNumber <= 2) {
      await expect(page.getByText(/Time-to-Refocus Drill/i)).toBeVisible();
    } else if (weekNumber === 3) {
      await expect(page.getByText(/Positive Belief.*Challenge/i)).toBeVisible();
    } else if (weekNumber === 4) {
      await expect(page.getByText(/Ban.*Binge/i)).toBeVisible();
    }
  });

  test('should track experiment metrics', async ({ page }) => {
    // Create and complete an experiment with metrics
    await page.goto('/experiments/new');

    await page.locator('input[name="belief_tested"]').fill('I need to monitor for threats');
    await page.locator('textarea[name="prediction"]').fill('Missing threats will be dangerous');

    // Add metrics to track
    await page.getByRole('button', { name: /Add Metric/i }).click();
    await page.locator('input[placeholder*="metric name"]').fill('Threat checks per hour');
    await page.locator('select[name="metric_type"]').selectOption('number');

    await page.getByRole('button', { name: /Create Experiment/i }).click();

    // Record metrics during experiment
    await page.getByRole('button', { name: /Record Metric/i }).click();
    await page.locator('input[name="threat_checks"]').fill('3');
    await page.getByRole('button', { name: /Save/i }).click();

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /Record Metric/i }).click();
    await page.locator('input[name="threat_checks"]').fill('1');
    await page.getByRole('button', { name: /Save/i }).click();

    // Complete and verify metrics
    await page.getByRole('button', { name: /Complete Experiment/i }).click();

    await expect(page.getByText(/Average.*2.*checks/i)).toBeVisible();
  });
});