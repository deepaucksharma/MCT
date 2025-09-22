import { test, expect } from '@playwright/test';

test.describe('MCT Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data and start fresh
    await page.goto('/');
  });

  test('should complete onboarding in under 7 minutes', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to onboarding
    await page.goto('/onboarding-journey');

    // Welcome Screen
    await expect(page.getByText(/Welcome to Your MCT Journey/i)).toBeVisible();
    await page.getByRole('button', { name: /Get Started/i }).click();

    // Quick Overview
    await expect(page.getByText(/Understanding MCT/i)).toBeVisible();
    await page.waitForTimeout(2000); // Allow user to read
    await page.getByRole('button', { name: /Continue/i }).click();

    // Initial Assessment
    await expect(page.getByText(/Initial Assessment/i)).toBeVisible();

    // Fill CAS baseline
    await page.locator('input[type="range"][name="worry_baseline"]').fill('60');
    await page.locator('input[type="range"][name="rumination_baseline"]').fill('55');
    await page.locator('input[type="range"][name="monitoring_baseline"]').fill('45');

    // Fill belief ratings
    await page.locator('input[type="range"][name="uncontrollability_belief"]').fill('70');
    await page.locator('input[type="range"][name="danger_belief"]').fill('65');
    await page.locator('input[type="range"][name="positive_belief"]').fill('50');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Goal Setting (process-focused)
    await expect(page.getByText(/Set Your Intentions/i)).toBeVisible();
    await page.getByRole('checkbox', { name: /Reduce time spent worrying/i }).check();
    await page.getByRole('checkbox', { name: /Build attention flexibility/i }).check();
    await page.getByRole('button', { name: /Continue/i }).click();

    // First ATT Introduction
    await expect(page.getByText(/Attention Training Technique/i)).toBeVisible();
    await page.getByRole('button', { name: /Skip Demo/i }).click(); // Skip for time

    // Daily Reminders Setup
    await expect(page.getByText(/Daily Practice Reminders/i)).toBeVisible();
    await page.getByRole('button', { name: /Use Defaults/i }).click();

    // Completion
    await expect(page.getByText(/Ready to Begin/i)).toBeVisible();

    const endTime = Date.now();
    const durationMinutes = (endTime - startTime) / 60000;

    expect(durationMinutes).toBeLessThan(7);
    console.log(`Onboarding completed in ${durationMinutes.toFixed(2)} minutes`);
  });

  test('should enforce process focus during onboarding', async ({ page }) => {
    await page.goto('/onboarding-journey');

    // Check that no content-focused fields exist
    const contentFields = await page.locator('textarea[placeholder*="describe"], textarea[placeholder*="worry about"], input[placeholder*="fear"]').count();
    expect(contentFields).toBe(0);

    // Verify process-only messaging
    await expect(page.locator('text=/how you relate to thoughts/i')).toBeVisible();
    await expect(page.locator('text=/not.*what.*think about/i')).toBeVisible();
  });

  test('should save onboarding data correctly', async ({ page }) => {
    await page.goto('/onboarding-journey');

    // Complete minimal onboarding
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Set specific values
    await page.locator('input[type="range"][name="worry_baseline"]').fill('75');
    await page.locator('input[type="range"][name="uncontrollability_belief"]').fill('80');

    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('checkbox', { name: /Reduce time spent worrying/i }).check();
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Skip Demo/i }).click();
    await page.getByRole('button', { name: /Use Defaults/i }).click();
    await page.getByRole('button', { name: /Start Journey/i }).click();

    // Verify data was saved by checking API
    const response = await page.request.get('http://localhost:5000/api/assessments');
    const assessments = await response.json();

    expect(assessments).toHaveLength(1);
    expect(assessments[0].worry_baseline).toBe(75);
    expect(assessments[0].uncontrollability_belief).toBe(80);
  });

  test('should handle interruption and resume', async ({ page }) => {
    await page.goto('/onboarding-journey');

    // Start onboarding
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Navigate away
    await page.goto('/');

    // Come back
    await page.goto('/onboarding-journey');

    // Should remember progress
    await expect(page.getByText(/Initial Assessment/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/onboarding-journey');

    // Try to skip assessment without filling
    await page.getByRole('button', { name: /Get Started/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Try to continue without setting values
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await continueBtn.click();

    // Should show validation or not proceed
    await expect(page.getByText(/Initial Assessment/i)).toBeVisible();

    // Fill required fields
    await page.locator('input[type="range"][name="worry_baseline"]').fill('50');
    await page.locator('input[type="range"][name="rumination_baseline"]').fill('50');
    await page.locator('input[type="range"][name="monitoring_baseline"]').fill('50');
    await page.locator('input[type="range"][name="uncontrollability_belief"]').fill('50');
    await page.locator('input[type="range"][name="danger_belief"]').fill('50');
    await page.locator('input[type="range"][name="positive_belief"]').fill('50');

    await continueBtn.click();

    // Should proceed now
    await expect(page.getByText(/Set Your Intentions/i)).toBeVisible();
  });
});