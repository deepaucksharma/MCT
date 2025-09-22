import { Router } from 'express';
import { personalizationService } from '../services/personalization';

const router = Router();

/**
 * GET /api/personalization/profile
 * Get user performance profile
 */
router.get('/profile', async (req, res) => {
  try {
    const profile = await personalizationService.analyzeUserPerformance();
    res.json(profile);
  } catch (error) {
    console.error('Error getting user performance profile:', error);
    res.status(500).json({ error: 'Failed to get user performance profile' });
  }
});

/**
 * GET /api/personalization/difficulty-settings
 * Get adaptive difficulty settings
 */
router.get('/difficulty-settings', async (req, res) => {
  try {
    const settings = await personalizationService.getAdaptiveDifficultySettings();
    res.json(settings);
  } catch (error) {
    console.error('Error getting adaptive difficulty settings:', error);
    res.status(500).json({ error: 'Failed to get adaptive difficulty settings' });
  }
});

/**
 * GET /api/personalization/recommendations
 * Get personalized recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await personalizationService.generatePersonalizedRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({ error: 'Failed to get personalized recommendations' });
  }
});

/**
 * GET /api/personalization/preferences
 * Get user preferences
 */
router.get('/preferences', async (req, res) => {
  try {
    const preferences = await personalizationService.getUserPreferences();
    res.json(preferences);
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({ error: 'Failed to get user preferences' });
  }
});

/**
 * PUT /api/personalization/preferences
 * Update user preferences
 */
router.put('/preferences', async (req, res) => {
  try {
    await personalizationService.updateUserPreferences(req.body);
    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update user preferences' });
  }
});

export default router;