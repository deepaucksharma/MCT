import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { BeliefRating } from '../types';
import { format, subDays } from 'date-fns';

const router = Router();

// Get all belief ratings
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { type, start, end } = req.query;

    let query = 'SELECT * FROM belief_ratings';
    const params: any[] = [];
    const conditions: string[] = [];

    if (type) {
      conditions.push('belief_type = ?');
      params.push(type);
    }

    if (start && end) {
      conditions.push('date BETWEEN ? AND ?');
      params.push(start, end);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const ratings = await db.all<BeliefRating[]>(query, params);
    res.json(ratings);
  } catch (error) {
    console.error('Error fetching belief ratings:', error);
    res.status(500).json({ error: 'Failed to fetch belief ratings' });
  }
});

// Get latest ratings for each belief type
router.get('/latest', async (req, res) => {
  try {
    const db = await getDatabase();

    const beliefTypes = ['uncontrollability', 'danger', 'positive'];
    const latestRatings: any = {};

    for (const type of beliefTypes) {
      const rating = await db.get<BeliefRating>(
        `SELECT * FROM belief_ratings
         WHERE belief_type = ?
         ORDER BY date DESC, created_at DESC
         LIMIT 1`,
        type
      );
      latestRatings[type] = rating;
    }

    res.json(latestRatings);
  } catch (error) {
    console.error('Error fetching latest belief ratings:', error);
    res.status(500).json({ error: 'Failed to fetch latest belief ratings' });
  }
});

// Create belief rating
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const rating: BeliefRating = req.body;

    const date = rating.date || format(new Date(), 'yyyy-MM-dd');

    const result = await db.run(
      `INSERT INTO belief_ratings (
        date, belief_type, belief_statement,
        rating, context
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        date,
        rating.belief_type,
        rating.belief_statement,
        rating.rating,
        rating.context
      ]
    );

    const newRating = await db.get<BeliefRating>(
      'SELECT * FROM belief_ratings WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newRating);
  } catch (error) {
    console.error('Error creating belief rating:', error);
    res.status(500).json({ error: 'Failed to create belief rating' });
  }
});

// Get belief trends
router.get('/trends', async (req, res) => {
  try {
    const db = await getDatabase();
    const { days = 30 } = req.query;

    const startDate = format(
      subDays(new Date(), parseInt(days as string)),
      'yyyy-MM-dd'
    );

    const beliefTypes = ['uncontrollability', 'danger', 'positive'];
    const trends: any = {};

    for (const type of beliefTypes) {
      const ratings = await db.all<BeliefRating[]>(
        `SELECT date, rating FROM belief_ratings
         WHERE belief_type = ? AND date >= ?
         ORDER BY date`,
        [type, startDate]
      );

      trends[type] = ratings.map(r => ({
        date: r.date,
        rating: r.rating
      }));
    }

    res.json(trends);
  } catch (error) {
    console.error('Error fetching belief trends:', error);
    res.status(500).json({ error: 'Failed to fetch belief trends' });
  }
});

// Batch create belief ratings (for weekly review)
router.post('/batch', async (req, res) => {
  try {
    const db = await getDatabase();
    const { ratings } = req.body;

    const date = format(new Date(), 'yyyy-MM-dd');
    const createdRatings = [];

    for (const rating of ratings) {
      const result = await db.run(
        `INSERT INTO belief_ratings (
          date, belief_type, belief_statement,
          rating, context
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          date,
          rating.belief_type,
          rating.belief_statement || null,
          rating.rating,
          rating.context || 'Weekly review'
        ]
      );

      const newRating = await db.get<BeliefRating>(
        'SELECT * FROM belief_ratings WHERE id = ?',
        result.lastID
      );

      createdRatings.push(newRating);
    }

    res.status(201).json(createdRatings);
  } catch (error) {
    console.error('Error creating batch belief ratings:', error);
    res.status(500).json({ error: 'Failed to create batch belief ratings' });
  }
});

export default router;