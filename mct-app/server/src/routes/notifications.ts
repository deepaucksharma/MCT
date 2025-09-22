import { Router } from 'express';
import { getDatabase } from '../utils/database';
import { Notification } from '../types';
import { format } from 'date-fns';

const router = Router();

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { sent, type } = req.query;

    let query = 'SELECT * FROM notifications';
    const params: any[] = [];
    const conditions: string[] = [];

    if (sent !== undefined) {
      conditions.push('sent = ?');
      params.push(sent === 'true' ? 1 : 0);
    }

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY scheduled_time DESC';

    const notifications = await db.all<Notification[]>(query, params);

    const parsedNotifications = notifications.map(n => ({
      ...n,
      data: n.data ? JSON.parse(n.data as any) : null
    }));

    res.json(parsedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get pending notifications
router.get('/pending', async (req, res) => {
  try {
    const db = await getDatabase();
    const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const notifications = await db.all<Notification[]>(
      'SELECT * FROM notifications WHERE sent = 0 AND scheduled_time <= ? ORDER BY scheduled_time',
      now
    );

    const parsedNotifications = notifications.map(n => ({
      ...n,
      data: n.data ? JSON.parse(n.data as any) : null
    }));

    res.json(parsedNotifications);
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    res.status(500).json({ error: 'Failed to fetch pending notifications' });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const notification: Notification = req.body;

    const result = await db.run(
      `INSERT INTO notifications (
        type, scheduled_time, sent,
        title, message, data
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        notification.type,
        notification.scheduled_time,
        0,
        notification.title,
        notification.message,
        notification.data ? JSON.stringify(notification.data) : null
      ]
    );

    const newNotification = await db.get<Notification>(
      'SELECT * FROM notifications WHERE id = ?',
      result.lastID
    );

    res.status(201).json({
      ...newNotification,
      data: newNotification!.data ? JSON.parse(newNotification!.data as any) : null
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as sent
router.post('/:id/sent', async (req, res) => {
  try {
    const db = await getDatabase();

    await db.run(
      `UPDATE notifications SET sent = 1, sent_at = datetime('now') WHERE id = ?`,
      req.params.id
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    res.status(500).json({ error: 'Failed to mark notification as sent' });
  }
});

// Schedule daily notifications
router.post('/schedule-daily', async (req, res) => {
  try {
    const db = await getDatabase();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get user settings
    const settings = await db.get<any>(
      'SELECT * FROM user_settings WHERE id = 1'
    );

    if (!settings?.notifications_enabled) {
      return res.json({ message: 'Notifications disabled' });
    }

    const dmReminderTimes = JSON.parse(settings.dm_reminder_times || '[]');

    // Schedule ATT reminder
    await db.run(
      `INSERT OR IGNORE INTO notifications (
        type, scheduled_time, sent, title, message
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        'att_reminder',
        `${today} ${settings.att_reminder_time}:00`,
        0,
        'Time for Attention Training',
        'Your daily ATT session is scheduled now. Take 12-15 minutes for this important practice.'
      ]
    );

    // Schedule DM reminders
    const dmTimeLabels = ['morning', 'midday', 'evening'];
    for (let i = 0; i < dmReminderTimes.length; i++) {
      await db.run(
        `INSERT OR IGNORE INTO notifications (
          type, scheduled_time, sent, title, message, data
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'dm_reminder',
          `${today} ${dmReminderTimes[i]}:00`,
          0,
          `Detached Mindfulness (${dmTimeLabels[i]})`,
          'Time for your 1-3 minute micro-practice.',
          JSON.stringify({ timeOfDay: dmTimeLabels[i] })
        ]
      );
    }

    // Schedule postponement reminder if slot is set
    if (settings.postponement_slot_start) {
      await db.run(
        `INSERT OR IGNORE INTO notifications (
          type, scheduled_time, sent, title, message
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          'postponement_reminder',
          `${today} ${settings.postponement_slot_start}:00`,
          0,
          'Worry/Rumination Time',
          `Your scheduled worry time starts now (${settings.postponement_slot_duration} minutes).`
        ]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error scheduling daily notifications:', error);
    res.status(500).json({ error: 'Failed to schedule daily notifications' });
  }
});

// Clear old sent notifications
router.delete('/clear-old', async (req, res) => {
  try {
    const db = await getDatabase();
    const daysAgo = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    await db.run(
      'DELETE FROM notifications WHERE sent = 1 AND sent_at < ?',
      format(cutoffDate, 'yyyy-MM-dd HH:mm:ss')
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing old notifications:', error);
    res.status(500).json({ error: 'Failed to clear old notifications' });
  }
});

export default router;