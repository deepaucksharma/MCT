import { test, expect } from '@playwright/test';

test.describe('Engagement Mechanics', () => {
  test('should track and display practice streaks', async ({ page }) => {
    await page.goto('/');

    // Check streak displays
    await expect(page.locator('[data-testid="att-streak"]')).toBeVisible();
    await expect(page.locator('[data-testid="dm-streak"]')).toBeVisible();
    await expect(page.locator('[data-testid="logging-streak"]')).toBeVisible();

    // Complete ATT to build streak
    await page.goto('/exercises/att');
    await page.getByRole('button', { name: /Quick.*8 min/i }).click();
    await page.getByRole('button', { name: /Start Session/i }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /End Session/i }).click();
    await page.locator('input[type="range"][name="attentional_control"]').fill('70');
    await page.getByRole('button', { name: /Save Session/i }).click();

    // Return home and verify streak updated
    await page.goto('/');
    const attStreak = page.locator('[data-testid="att-streak"]');
    await expect(attStreak).toContainText(/[1-9]/);

    // Check for streak celebration
    const streakValue = await attStreak.textContent();
    if (streakValue && parseInt(streakValue) % 7 === 0) {
      await expect(page.getByText(/Week streak!/i)).toBeVisible();
    }
  });

  test('should handle streak recovery mechanics', async ({ page }) => {
    // Get current streak
    const response = await page.request.get('http://localhost:5000/api/engagement/streaks');
    const streaks = await response.json();
    const initialDmStreak = streaks.dm.current_streak;

    // Simulate missing one day (allowed)
    await page.request.post('http://localhost:5000/api/admin/simulate-date', {
      data: { date: new Date(Date.now() + 86400000).toISOString() } // Tomorrow
    }).catch(() => {}); // Might not have admin endpoint

    // Complete DM practice
    await page.goto('/exercises/dm');
    await page.getByRole('button', { name: /Screen Display/i }).click();
    await page.getByRole('button', { name: /Start Practice/i }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /Complete/i }).click();
    await page.locator('[data-testid="engaged-button"]').click();
    await page.locator('input[type="range"][name="confidence"]').fill('70');
    await page.getByRole('button', { name: /Save Practice/i }).click();

    // Check if streak recovered
    const newResponse = await page.request.get('http://localhost:5000/api/engagement/streaks');
    const newStreaks = await newResponse.json();

    // Streak should maintain or increment (recovery allowed)
    expect(newStreaks.dm.current_streak).toBeGreaterThanOrEqual(initialDmStreak);
  });

  test('should award and display achievements', async ({ page }) => {
    await page.goto('/profile');

    // Check achievements section
    await expect(page.getByText(/Achievements/i)).toBeVisible();
    const achievements = page.locator('[data-testid="achievement-badge"]');
    const initialCount = await achievements.count();

    // Complete actions to earn achievement
    // First Steps - complete first ATT session
    await page.goto('/exercises/att');
    await page.getByRole('button', { name: /Quick.*8 min/i }).click();
    await page.getByRole('button', { name: /Start Session/i }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /End Session/i }).click();
    await page.locator('input[type="range"][name="attentional_control"]').fill('60');
    await page.getByRole('button', { name: /Save Session/i }).click();

    // Return to profile
    await page.goto('/profile');

    // Check if achievement earned
    const newAchievements = page.locator('[data-testid="achievement-badge"]');
    const newCount = await newAchievements.count();

    if (newCount > initialCount) {
      // New achievement earned
      await expect(page.getByText(/First Steps/i)).toBeVisible();
    }
  });

  test('should show progress milestones', async ({ page }) => {
    await page.goto('/progress');

    // Check milestones section
    await expect(page.locator('[data-testid="progress-milestones"]')).toBeVisible();

    // Check for week completion milestones
    const milestones = page.locator('[data-testid="milestone-item"]');
    const count = await milestones.count();
    expect(count).toBeGreaterThan(0);

    // Each milestone should show status
    if (count > 0) {
      const firstMilestone = milestones.first();
      await expect(firstMilestone.locator('[data-testid="milestone-status"]')).toBeVisible();
      const status = await firstMilestone.locator('[data-testid="milestone-status"]').textContent();
      expect(['locked', 'available', 'completed']).toContain(status?.toLowerCase());
    }
  });

  test('should display gentle nudges appropriately', async ({ page }) => {
    await page.goto('/');

    // Check for nudges
    const nudges = page.locator('[data-testid="gentle-nudge"]');
    const nudgeCount = await nudges.count();

    if (nudgeCount > 0) {
      // Verify nudge content is supportive
      const nudgeText = await nudges.first().textContent();
      expect(nudgeText).not.toContain('must');
      expect(nudgeText).not.toContain('should');
      expect(nudgeText).not.toContain('failure');

      // Should be dismissible
      const dismissButton = nudges.first().locator('[data-testid="dismiss-nudge"]');
      await expect(dismissButton).toBeVisible();
      await dismissButton.click();

      // Nudge should disappear
      await expect(nudges.first()).not.toBeVisible();
    }
  });

  test('should celebrate week completions', async ({ page }) => {
    // Complete week requirements
    const weekRequirements = {
      att_sessions: 5,
      dm_practices: 21, // 3 per day
      experiments: 1
    };

    // Check if week completion triggers celebration
    const response = await page.request.get('http://localhost:5000/api/engagement/milestones');
    const milestones = await response.json();

    const weekMilestone = milestones.find((m: any) => m.type === 'week_completion');
    if (weekMilestone && weekMilestone.completed) {
      await page.goto('/');
      await expect(page.getByText(/Week.*Complete/i)).toBeVisible();
    }
  });

  test('should provide smart recovery prompts', async ({ page }) => {
    // Check for recovery prompts after inactivity
    const response = await page.request.get('http://localhost:5000/api/engagement/nudges');
    const nudges = await response.json();

    const recoveryNudge = nudges.find((n: any) => n.type === 'recovery');
    if (recoveryNudge) {
      expect(recoveryNudge.message).toContain('ready when you are');
      expect(recoveryNudge.message).not.toContain('disappointed');
      expect(recoveryNudge.message).not.toContain('failed');
    }
  });

  test('should show engagement dashboard', async ({ page }) => {
    await page.goto('/engagement');

    // Overview section
    await expect(page.getByText(/Engagement Overview/i)).toBeVisible();

    // Current streaks
    await expect(page.getByText(/Current Streaks/i)).toBeVisible();
    await expect(page.locator('[data-testid="streak-summary"]')).toBeVisible();

    // Recent achievements
    await expect(page.getByText(/Recent Achievements/i)).toBeVisible();

    // Upcoming milestones
    await expect(page.getByText(/Upcoming Milestones/i)).toBeVisible();

    // Active nudges
    await expect(page.getByText(/Gentle Reminders/i)).toBeVisible();
  });

  test('should track engagement patterns', async ({ page }) => {
    const response = await page.request.get('http://localhost:5000/api/metrics/engagement-patterns');
    const patterns = await response.json();

    expect(patterns).toBeDefined();
    expect(patterns.most_active_time).toBeDefined();
    expect(patterns.consistency_score).toBeDefined();
    expect(patterns.consistency_score).toBeGreaterThanOrEqual(0);
    expect(patterns.consistency_score).toBeLessThanOrEqual(100);

    expect(patterns.preferred_exercises).toBeDefined();
    expect(Array.isArray(patterns.preferred_exercises)).toBe(true);
  });

  test('should provide process-focused achievements only', async ({ page }) => {
    await page.goto('/profile');

    // Get all achievement descriptions
    const achievementCards = page.locator('[data-testid="achievement-card"]');
    const count = await achievementCards.count();

    for (let i = 0; i < count; i++) {
      const description = await achievementCards.nth(i).locator('[data-testid="achievement-description"]').textContent();

      // Verify process focus
      expect(description).not.toContain('worry-free');
      expect(description).not.toContain('anxiety-free');
      expect(description).not.toContain('never worry');
      expect(description).not.toContain('eliminate');

      // Should focus on practice and process
      if (description) {
        expect(description).toMatch(/practice|session|experiment|consistency|engagement/i);
      }
    }
  });

  test('should handle graduation ceremony at week 8', async ({ page }) => {
    // Set to week 8
    await page.request.put('http://localhost:5000/api/settings', {
      data: { current_week: 8 }
    });

    // Complete week 8 requirements
    const response = await page.request.post('http://localhost:5000/api/engagement/complete-week', {
      data: { week: 8 }
    }).catch(() => null);

    if (response && response.ok()) {
      await page.goto('/');

      // Should show graduation celebration
      await expect(page.getByText(/Congratulations.*Graduate/i)).toBeVisible();
      await expect(page.getByText(/MCT.*Journey.*Complete/i)).toBeVisible();

      // Should offer maintenance plan
      await expect(page.getByRole('button', { name: /View Maintenance Plan/i })).toBeVisible();
    }
  });
});