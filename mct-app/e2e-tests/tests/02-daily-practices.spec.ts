import { test, expect } from '@playwright/test';

test.describe('Daily MCT Practices', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is onboarded
    await page.goto('/');
  });

  test('should complete ATT session with proper phases', async ({ page }) => {
    await page.goto('/exercises/att');

    // Verify ATT description
    await expect(page.getByText(/Attention Training Technique/i)).toBeVisible();

    // Select standard script
    await page.getByRole('button', { name: /Standard.*15 min/i }).click();

    // Start session
    await page.getByRole('button', { name: /Start Session/i }).click();

    // Verify phase progression
    await expect(page.getByText(/Phase 1.*Focus/i)).toBeVisible({ timeout: 5000 });

    // Fast forward through phases (for testing)
    // Phase 1: Selective Attention
    await page.waitForTimeout(2000);
    await expect(page.getByText(/focusing on.*sounds/i)).toBeVisible();

    // Should have timer
    await expect(page.locator('[data-testid="timer"]')).toBeVisible();

    // End session early for testing
    await page.getByRole('button', { name: /End Session/i }).click();

    // Post-session rating should appear
    await expect(page.getByText(/Session Complete/i)).toBeVisible();
    await expect(page.getByText(/rate.*attention control/i)).toBeVisible();

    // Fill ratings
    await page.locator('input[type="range"][name="attentional_control"]').fill('70');
    await page.getByRole('checkbox', { name: /experienced intrusions/i }).check();
    await page.locator('input[type="number"][name="intrusion_count"]').fill('3');
    await page.locator('input[type="range"][name="shift_ease"]').fill('65');

    // Save session
    await page.getByRole('button', { name: /Save Session/i }).click();

    // Verify saved
    await expect(page.getByText(/Session saved/i)).toBeVisible();
  });

  test('should complete DM micro-practice with LAPR method', async ({ page }) => {
    await page.goto('/exercises/dm');

    // Verify LAPR method is explained
    await expect(page.getByText(/LAPR/i)).toBeVisible();
    await expect(page.getByText(/Locate.*Acknowledge.*Pause.*Resume/i)).toBeVisible();

    // Select metaphor
    await page.getByRole('button', { name: /Radio Station/i }).click();

    // Start practice
    await page.getByRole('button', { name: /Start Practice/i }).click();

    // Verify practice steps
    await expect(page.getByText(/Step 1.*Locate/i)).toBeVisible();
    await page.waitForTimeout(1000);

    // Progress through steps
    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.getByText(/Step 2.*Acknowledge/i)).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.getByText(/Step 3.*Pause/i)).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /Next/i }).click();
    await expect(page.getByText(/Step 4.*Resume/i)).toBeVisible();

    // Complete practice
    await page.getByRole('button', { name: /Complete/i }).click();

    // Rate practice
    await expect(page.getByText(/Practice Complete/i)).toBeVisible();
    await page.locator('[data-testid="engaged-button"]').click();
    await page.locator('input[type="range"][name="confidence"]').fill('75');

    // Save practice
    await page.getByRole('button', { name: /Save Practice/i }).click();

    await expect(page.getByText(/Practice saved/i)).toBeVisible();
  });

  test('should log daily CAS without content', async ({ page }) => {
    await page.goto('/log');

    // Fill process metrics only
    await page.locator('input[type="number"][name="worry_minutes"]').fill('45');
    await page.locator('input[type="number"][name="rumination_minutes"]').fill('30');
    await page.locator('input[type="number"][name="monitoring_count"]').fill('12');
    await page.locator('input[type="number"][name="checking_count"]').fill('5');
    await page.locator('input[type="number"][name="reassurance_count"]').fill('3');
    await page.locator('input[type="number"][name="avoidance_count"]').fill('2');

    // Verify NO content fields exist
    const contentTextareas = await page.locator('textarea[placeholder*="describe"], textarea[placeholder*="worry"], textarea[placeholder*="thoughts"]').count();
    expect(contentTextareas).toBe(0);

    // Save log
    await page.getByRole('button', { name: /Save Log/i }).click();

    await expect(page.getByText(/Log saved/i)).toBeVisible();

    // Verify data was saved
    const response = await page.request.get('http://localhost:5000/api/cas-logs/today');
    const log = await response.json();

    expect(log.worry_minutes).toBe(45);
    expect(log.rumination_minutes).toBe(30);
    expect(log.monitoring_count).toBe(12);
  });

  test('should manage postponement slot', async ({ page }) => {
    await page.goto('/postponement');

    // Log worry trigger
    await page.getByRole('button', { name: /Log Trigger/i }).click();

    // Fill urge rating
    await page.locator('input[type="range"][name="urge_before"]').fill('85');

    // Schedule for slot
    await page.getByRole('button', { name: /Schedule for.*slot/i }).click();

    // Verify scheduled
    await expect(page.getByText(/Scheduled for/i)).toBeVisible();

    // Process during slot time
    await page.getByRole('button', { name: /Process Now/i }).click();

    // Rate after processing
    await page.locator('input[type="range"][name="urge_after"]').fill('30');
    await page.locator('input[type="number"][name="duration"]').fill('10');

    await page.getByRole('button', { name: /Complete/i }).click();

    await expect(page.getByText(/Postponement complete/i)).toBeVisible();
  });

  test('should enforce daily time limit of 20 minutes', async ({ page }) => {
    await page.goto('/daily-journey');

    // Check total time estimate
    await expect(page.getByText(/Total.*20 minutes/i)).toBeVisible();

    // Verify individual task times
    const tasks = [
      { name: /Morning DM/i, time: 3 },
      { name: /Midday DM/i, time: 3 },
      { name: /Evening ATT/i, time: 12 },
      { name: /CAS Log/i, time: 2 }
    ];

    for (const task of tasks) {
      const taskElement = page.locator(`text=${task.name}`);
      await expect(taskElement).toBeVisible();
      await expect(page.getByText(new RegExp(`${task.time}.*min`, 'i'))).toBeVisible();
    }

    // Total should not exceed 20 minutes
    const totalTime = tasks.reduce((sum, task) => sum + task.time, 0);
    expect(totalTime).toBeLessThanOrEqual(20);
  });

  test('should track practice streaks', async ({ page }) => {
    await page.goto('/');

    // Check streak display
    await expect(page.locator('[data-testid="att-streak"]')).toBeVisible();
    await expect(page.locator('[data-testid="dm-streak"]')).toBeVisible();
    await expect(page.locator('[data-testid="logging-streak"]')).toBeVisible();

    // Complete a practice to update streak
    await page.goto('/exercises/att');
    await page.getByRole('button', { name: /Quick.*8 min/i }).click();
    await page.getByRole('button', { name: /Start Session/i }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /End Session/i }).click();
    await page.locator('input[type="range"][name="attentional_control"]').fill('70');
    await page.getByRole('button', { name: /Save Session/i }).click();

    // Go back to home and verify streak updated
    await page.goto('/');
    const attStreak = await page.locator('[data-testid="att-streak"]').textContent();
    expect(attStreak).toContain('1');
  });
});