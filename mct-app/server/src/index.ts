import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './utils/database';
import settingsRoutes from './routes/settings';
import assessmentRoutes from './routes/assessments';
import programRoutes from './routes/program';
import casLogRoutes from './routes/casLogs';
import attRoutes from './routes/attSessions';
import dmRoutes from './routes/dmPractices';
import postponementRoutes from './routes/postponement';
import sarRoutes from './routes/sarPlans';
import experimentsRoutes from './routes/experiments';
import beliefRatingsRoutes from './routes/beliefRatings';
import progressRoutes from './routes/progress';
import todayRoutes from './routes/today';
import notificationRoutes from './routes/notifications';
import metricsRoutes from './routes/metrics';
import personalizationRoutes from './routes/personalization';
import engagementRoutes from './routes/engagement';
import modulesRoutes from './routes/modules';
import { startScheduler } from './services/scheduler';
import { migrateEngagementFeatures } from './utils/engagementMigration';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for audio files, etc.)
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/program', programRoutes);
app.use('/api/cas-logs', casLogRoutes);
app.use('/api/att-sessions', attRoutes);
app.use('/api/dm-practices', dmRoutes);
app.use('/api/postponement', postponementRoutes);
app.use('/api/sar-plans', sarRoutes);
app.use('/api/experiments', experimentsRoutes);
app.use('/api/belief-ratings', beliefRatingsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/today', todayRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/personalization', personalizationRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/modules', modulesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files from React build
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    // Run engagement features migration
    await migrateEngagementFeatures();
    console.log('Engagement features migration completed');

    // Start notification scheduler
    startScheduler();
    console.log('Scheduler started');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();