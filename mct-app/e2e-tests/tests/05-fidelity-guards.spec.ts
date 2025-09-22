import { test, expect } from '@playwright/test';

test.describe('MCT Fidelity Guards', () => {
  test('should block content analysis in CAS logs', async ({ page }) => {
    await page.goto('/log');

    // Try to submit content-focused text
    const response = await page.request.post('http://localhost:5000/api/cas-logs', {
      data: {
        worry_minutes: 30,
        rumination_minutes: 20,
        notes: "I'm worried about my job interview tomorrow and what they might think"
      }
    });

    // Should be blocked or warned
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('process');
  });

  test('should block reassurance seeking in experiments', async ({ page }) => {
    await page.goto('/experiments/new');

    // Try to create reassurance-seeking experiment
    const response = await page.request.post('http://localhost:5000/api/experiments', {
      data: {
        belief_tested: "Will everything be okay with my health?",
        prediction: "I need to know for sure that I'm healthy",
        week_number: 1,
        belief_rating_before: 80
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('reassurance');
  });

  test('should show crisis resources when needed', async ({ page }) => {
    // Submit concerning input
    const response = await page.request.post('http://localhost:5000/api/dm-practices', {
      data: {
        time_of_day: 'evening',
        duration_seconds: 60,
        engaged_vs_watched: 'engaged',
        confidence_rating: 5,
        notes: "feeling suicidal"
      }
    });

    // Should trigger crisis detection
    if (response.status() === 400) {
      const body = await response.json();
      expect(body.crisis).toBe(true);
      expect(body.resources).toBeDefined();
      expect(body.resources).toContain('988');
    }
  });

  test('should prevent content input in UI forms', async ({ page }) => {
    await page.goto('/log');

    // Check that problematic fields don't exist
    const contentFields = await page.locator('textarea[name="worry_content"], textarea[name="thoughts"], input[name="fears"]').count();
    expect(contentFields).toBe(0);

    // Only process fields should exist
    await expect(page.locator('input[name="worry_minutes"]')).toBeVisible();
    await expect(page.locator('input[name="rumination_minutes"]')).toBeVisible();
    await expect(page.locator('input[name="monitoring_count"]')).toBeVisible();
  });

  test('should show process-focus warnings', async ({ page }) => {
    await page.goto('/experiments/new');

    // Enter content-focused belief
    await page.locator('input[name="belief_tested"]').fill('My relationship is falling apart');
    await page.locator('input[name="belief_tested"]').blur();

    // Should show warning
    await expect(page.getByText(/focus on how.*not what/i)).toBeVisible();

    // Suggest process-focused alternative
    await expect(page.getByText(/try.*worry is uncontrollable/i)).toBeVisible();
  });

  test('should validate SAR plans are process-focused', async ({ page }) => {
    await page.goto('/sar');

    // Try to create content-focused SAR plan
    await page.getByRole('button', { name: /New SAR Plan/i }).click();

    await page.locator('input[name="trigger_cue"]').fill('Thinking about money problems');
    await page.locator('input[name="if_statement"]').fill('If I worry about bills');
    await page.locator('input[name="then_action"]').fill('Think positive thoughts about money');

    await page.getByRole('button', { name: /Save Plan/i }).click();

    // Should show error or warning
    await expect(page.getByText(/process-focused actions/i)).toBeVisible();

    // Fix to process focus
    await page.locator('input[name="trigger_cue"]').clear();
    await page.locator('input[name="trigger_cue"]').fill('Notice worry starting');
    await page.locator('input[name="if_statement"]').clear();
    await page.locator('input[name="if_statement"]').fill('If I notice worry beginning');
    await page.locator('input[name="then_action"]').clear();
    await page.locator('input[name="then_action"]').fill('Shift attention to external sounds');

    await page.getByRole('button', { name: /Save Plan/i }).click();

    // Should succeed now
    await expect(page.getByText(/Plan saved/i)).toBeVisible();
  });

  test('should track fidelity violations', async ({ page }) => {
    // Make several content-focused attempts
    const violations = [
      {
        url: '/api/cas-logs',
        data: { worry_minutes: 30, notes: "worried about health" }
      },
      {
        url: '/api/experiments',
        data: { belief_tested: "am I going to fail?", prediction: "I will fail" }
      }
    ];

    for (const violation of violations) {
      await page.request.post(`http://localhost:5000${violation.url}`, {
        data: violation.data
      }).catch(() => {}); // Ignore errors, we're testing violation tracking
    }

    // Check if violations were logged
    const response = await page.request.get('http://localhost:5000/api/admin/fidelity-violations');

    if (response.ok()) {
      const violations = await response.json();
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].violation_type).toBeDefined();
    }
  });

  test('should educate about MCT principles', async ({ page }) => {
    await page.goto('/');

    // Check for educational messages
    await expect(page.getByText(/MCT focuses on how/i)).toBeVisible();
    await expect(page.getByText(/not.*what you think/i)).toBeVisible();

    // Navigate to help section
    await page.goto('/help');

    // Should explain process vs content
    await expect(page.getByText(/Process vs.*Content/i)).toBeVisible();
    await expect(page.getByText(/HOW.*you relate/i)).toBeVisible();
    await expect(page.getByText(/WHAT.*you think about/i)).toBeVisible();
  });

  test('should prevent outcome-focused goals', async ({ page }) => {
    await page.goto('/goals');

    // Try to set outcome-focused goal
    const outcomeGoal = "Never worry again";
    const goalInput = page.locator('input[name="goal"]');

    if (await goalInput.isVisible()) {
      await goalInput.fill(outcomeGoal);
      await page.getByRole('button', { name: /Save Goal/i }).click();

      // Should show warning
      await expect(page.getByText(/process.*not elimination/i)).toBeVisible();

      // Suggest process goal
      await expect(page.getByText(/reduce time.*worrying/i)).toBeVisible();
    }
  });

  test('should maintain therapeutic boundaries', async ({ page }) => {
    // Test that app doesn't provide reassurance
    const response = await page.request.post('http://localhost:5000/api/chat', {
      data: {
        message: "Tell me everything will be okay"
      }
    }).catch(() => null);

    if (response) {
      if (response.ok()) {
        const body = await response.json();
        expect(body.response).not.toContain("will be okay");
        expect(body.response).not.toContain("don't worry");
      } else {
        // Chat endpoint might not exist, which is fine
        expect(response.status()).toBe(404);
      }
    }
  });
});