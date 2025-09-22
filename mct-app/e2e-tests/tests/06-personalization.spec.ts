import { test, expect } from '@playwright/test';

test.describe('Personalization Features', () => {
  test('should adapt ATT duration based on consistency', async ({ page }) => {
    // Complete several ATT sessions to build history
    for (let i = 0; i < 3; i++) {
      await page.goto('/exercises/att');
      await page.getByRole('button', { name: /Quick.*8 min/i }).click();
      await page.getByRole('button', { name: /Start Session/i }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: /End Session/i }).click();
      await page.locator('input[type="range"][name="attentional_control"]').fill('75');
      await page.getByRole('button', { name: /Save Session/i }).click();
      await page.waitForTimeout(500);
    }

    // Check personalization API
    const response = await page.request.get('http://localhost:5000/api/personalization/difficulty-settings');
    const settings = await response.json();

    // Duration should adapt based on performance
    expect(settings.att_duration).toBeDefined();
    expect(settings.att_duration).toBeGreaterThanOrEqual(8);
    expect(settings.att_duration).toBeLessThanOrEqual(15);
  });

  test('should recommend experiments based on beliefs', async ({ page }) => {
    // Set specific belief ratings
    await page.request.post('http://localhost:5000/api/belief-ratings', {
      data: {
        belief_type: 'uncontrollability',
        rating: 85,
        context: 'High uncontrollability belief'
      }
    });

    // Get recommendations
    const response = await page.request.get('http://localhost:5000/api/personalization/recommendations');
    const recommendations = await response.json();

    // Should recommend uncontrollability experiments
    expect(recommendations.experiments).toBeDefined();
    const experimentRecs = recommendations.experiments;
    expect(experimentRecs.some((exp: any) =>
      exp.name.includes('Postponement') || exp.name.includes('Control')
    )).toBe(true);
  });

  test('should suggest optimal practice times', async ({ page }) => {
    // Log successful practices at specific times
    await page.request.post('http://localhost:5000/api/att-sessions', {
      data: {
        date: new Date().toISOString().split('T')[0],
        duration_minutes: 12,
        completed: true,
        attentional_control_rating: 80,
        created_at: new Date().setHours(20, 0, 0, 0) // 8 PM
      }
    });

    await page.request.post('http://localhost:5000/api/dm-practices', {
      data: {
        time_of_day: 'morning',
        duration_seconds: 120,
        engaged_vs_watched: 'engaged',
        confidence_rating: 75,
        created_at: new Date().setHours(8, 0, 0, 0) // 8 AM
      }
    });

    // Get personalized suggestions
    const response = await page.request.get('http://localhost:5000/api/personalization/recommendations');
    const recommendations = await response.json();

    expect(recommendations.practice_times).toBeDefined();
    expect(recommendations.practice_times.att_optimal).toContain('evening');
    expect(recommendations.practice_times.dm_optimal).toContain('morning');
  });

  test('should adjust experiment complexity', async ({ page }) => {
    // Complete some experiments successfully
    await page.request.post('http://localhost:5000/api/experiments', {
      data: {
        belief_tested: 'Worry is uncontrollable',
        prediction: 'Cannot stop worrying',
        status: 'completed',
        belief_rating_before: 80,
        belief_rating_after: 50,
        outcome: 'Successfully postponed',
        learning: 'More control than expected'
      }
    });

    // Get difficulty settings
    const response = await page.request.get('http://localhost:5000/api/personalization/difficulty-settings');
    const settings = await response.json();

    expect(settings.experiment_complexity).toBeDefined();
    expect(['basic', 'intermediate', 'advanced']).toContain(settings.experiment_complexity);
  });

  test('should personalize SAR plan suggestions', async ({ page }) => {
    // Log trigger patterns
    await page.request.post('http://localhost:5000/api/postponement-logs', {
      data: {
        date: new Date().toISOString().split('T')[0],
        trigger_time: '14:30',
        urge_before: 85,
        notes: 'Work meeting trigger'
      }
    });

    await page.request.post('http://localhost:5000/api/postponement-logs', {
      data: {
        date: new Date().toISOString().split('T')[0],
        trigger_time: '14:45',
        urge_before: 80,
        notes: 'After meeting'
      }
    });

    // Get SAR recommendations
    const response = await page.request.get('http://localhost:5000/api/personalization/recommendations');
    const recommendations = await response.json();

    expect(recommendations.sar_plans).toBeDefined();
    expect(recommendations.sar_plans.some((plan: any) =>
      plan.trigger_cue.includes('meeting') || plan.trigger_cue.includes('work')
    )).toBe(true);
  });

  test('should track and display user preferences', async ({ page }) => {
    // Set preferences
    await page.request.put('http://localhost:5000/api/personalization/preferences', {
      data: {
        preferred_dm_metaphor: 'radio',
        preferred_att_duration: 12,
        preferred_reminder_style: 'gentle',
        notification_frequency: 'minimal'
      }
    });

    // Navigate to settings
    await page.goto('/settings');

    // Verify preferences are reflected
    await expect(page.locator('[data-testid="dm-metaphor-preference"]')).toHaveValue('radio');
    await expect(page.locator('[data-testid="att-duration-preference"]')).toHaveValue('12');
    await expect(page.locator('[data-testid="reminder-style"]')).toHaveValue('gentle');
  });

  test('should provide performance insights', async ({ page }) => {
    // Get performance profile
    const response = await page.request.get('http://localhost:5000/api/personalization/profile');
    const profile = await response.json();

    expect(profile).toBeDefined();
    expect(profile.performance_level).toBeDefined();
    expect(['beginner', 'developing', 'proficient', 'advanced']).toContain(profile.performance_level);

    expect(profile.strengths).toBeDefined();
    expect(Array.isArray(profile.strengths)).toBe(true);

    expect(profile.growth_areas).toBeDefined();
    expect(Array.isArray(profile.growth_areas)).toBe(true);
  });

  test('should adjust reminder timing based on patterns', async ({ page }) => {
    // Simulate consistent practice at certain times
    for (let i = 0; i < 5; i++) {
      await page.request.post('http://localhost:5000/api/dm-practices', {
        data: {
          time_of_day: 'morning',
          duration_seconds: 120,
          engaged_vs_watched: 'engaged',
          confidence_rating: 70 + i * 2,
          created_at: new Date().setHours(7, 30, 0, 0)
        }
      });
    }

    // Check if reminders adjust
    const response = await page.request.get('http://localhost:5000/api/settings');
    const settings = await response.json();

    // Reminders should adjust to successful practice times
    const dmReminders = JSON.parse(settings.dm_reminder_times);
    expect(dmReminders.some((time: string) =>
      time.includes('07:') || time.includes('08:')
    )).toBe(true);
  });

  test('should provide adaptive feedback messages', async ({ page }) => {
    await page.goto('/');

    // Complete different activities and check feedback
    await page.goto('/exercises/att');
    await page.getByRole('button', { name: /Quick.*8 min/i }).click();
    await page.getByRole('button', { name: /Start Session/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /End Session/i }).click();

    // Rate low performance
    await page.locator('input[type="range"][name="attentional_control"]').fill('40');
    await page.getByRole('button', { name: /Save Session/i }).click();

    // Should get supportive feedback
    await expect(page.getByText(/building.*skill|practice.*easier|keep.*going/i)).toBeVisible();

    // Complete with high performance
    await page.goto('/exercises/att');
    await page.getByRole('button', { name: /Quick.*8 min/i }).click();
    await page.getByRole('button', { name: /Start Session/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /End Session/i }).click();

    await page.locator('input[type="range"][name="attentional_control"]').fill('85');
    await page.getByRole('button', { name: /Save Session/i }).click();

    // Should get progress acknowledgment
    await expect(page.getByText(/excellent|strong|improving/i)).toBeVisible();
  });

  test('should personalize weekly content delivery', async ({ page }) => {
    // Set current week and performance
    await page.request.put('http://localhost:5000/api/settings', {
      data: {
        current_week: 3
      }
    });

    // Navigate to weekly content
    await page.goto('/learn');

    // Should show appropriate week content
    await expect(page.getByText(/Week 3/i)).toBeVisible();

    // Check for personalized exercises
    const response = await page.request.get('http://localhost:5000/api/personalization/recommendations');
    const recommendations = await response.json();

    expect(recommendations.weekly_focus).toBeDefined();
    expect(recommendations.weekly_focus).toContain('positive belief');
  });
});