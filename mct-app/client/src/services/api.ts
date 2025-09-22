import axios from 'axios';
import {
  UserSettings,
  Assessment,
  ProgramModule,
  CASLog,
  ATTSession,
  DMPractice,
  PostponementLog,
  SARPlan,
  Experiment,
  BeliefRating,
  TodayTask,
  ProgressMetrics
} from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Settings
export const settingsApi = {
  get: () => api.get<UserSettings>('/settings').then(res => res.data),
  update: (settings: Partial<UserSettings>) =>
    api.put<UserSettings>('/settings', settings).then(res => res.data),
  completeOnboarding: () =>
    api.post('/settings/complete-onboarding').then(res => res.data),
};

// Assessments
export const assessmentApi = {
  getAll: () => api.get<Assessment[]>('/assessments').then(res => res.data),
  getById: (id: number) =>
    api.get<Assessment>(`/assessments/${id}`).then(res => res.data),
  getByType: (type: string) =>
    api.get<Assessment>(`/assessments/type/${type}`).then(res => res.data),
  create: (assessment: Assessment) =>
    api.post<Assessment>('/assessments', assessment).then(res => res.data),
};

// Program Modules
export const programApi = {
  getAll: () => api.get<ProgramModule[]>('/program').then(res => res.data),
  getByWeek: (week: number) =>
    api.get<ProgramModule>(`/program/week/${week}`).then(res => res.data),
  unlockWeek: (week: number) =>
    api.post(`/program/week/${week}/unlock`).then(res => res.data),
  completeWeek: (week: number) =>
    api.post(`/program/week/${week}/complete`).then(res => res.data),
};

// CAS Logs
export const casLogApi = {
  getAll: (start?: string, end?: string) =>
    api
      .get<CASLog[]>('/cas-logs', { params: { start, end } })
      .then(res => res.data),
  getToday: () => api.get<CASLog>('/cas-logs/today').then(res => res.data),
  getByDate: (date: string) =>
    api.get<CASLog>(`/cas-logs/date/${date}`).then(res => res.data),
  create: (log: CASLog) =>
    api.post<CASLog>('/cas-logs', log).then(res => res.data),
};

// ATT Sessions
export const attSessionApi = {
  getAll: (start?: string, end?: string, limit?: number) =>
    api
      .get<ATTSession[]>('/att-sessions', { params: { start, end, limit } })
      .then(res => res.data),
  getToday: () =>
    api.get<ATTSession>('/att-sessions/today').then(res => res.data),
  create: (session: ATTSession) =>
    api.post<ATTSession>('/att-sessions', session).then(res => res.data),
  update: (id: number, session: Partial<ATTSession>) =>
    api.put<ATTSession>(`/att-sessions/${id}`, session).then(res => res.data),
  getWeeklyMinutes: () =>
    api
      .get<{ minutes: number }>('/att-sessions/weekly-minutes')
      .then(res => res.data),
};

// DM Practices
export const dmPracticeApi = {
  getAll: (start?: string, end?: string, limit?: number) =>
    api
      .get<DMPractice[]>('/dm-practices', { params: { start, end, limit } })
      .then(res => res.data),
  getToday: () =>
    api.get<DMPractice[]>('/dm-practices/today').then(res => res.data),
  create: (practice: DMPractice) =>
    api.post<DMPractice>('/dm-practices', practice).then(res => res.data),
  getWeeklyCount: () =>
    api
      .get<{ count: number }>('/dm-practices/weekly-count')
      .then(res => res.data),
  getStats: () =>
    api
      .get<{ total: number; avgConfidence: number; engagementRate: number }>(
        '/dm-practices/stats'
      )
      .then(res => res.data),
};

// Postponement
export const postponementApi = {
  getAll: (start?: string, end?: string) =>
    api
      .get<PostponementLog[]>('/postponement', { params: { start, end } })
      .then(res => res.data),
  getToday: () =>
    api.get<PostponementLog[]>('/postponement/today').then(res => res.data),
  create: (log: PostponementLog) =>
    api.post<PostponementLog>('/postponement', log).then(res => res.data),
  update: (id: number, log: Partial<PostponementLog>) =>
    api.put<PostponementLog>(`/postponement/${id}`, log).then(res => res.data),
  process: (
    id: number,
    data: {
      urge_after: number;
      processing_duration_minutes: number;
      notes?: string;
    }
  ) =>
    api
      .post<PostponementLog>(`/postponement/${id}/process`, data)
      .then(res => res.data),
  getSuccessRate: (days?: number) =>
    api
      .get<{
        totalLogs: number;
        processedLogs: number;
        successRate: number;
        avgUrgeReduction: number;
      }>('/postponement/success-rate', { params: { days } })
      .then(res => res.data),
};

// SAR Plans
export const sarPlanApi = {
  getAll: (active?: boolean) =>
    api
      .get<SARPlan[]>('/sar-plans', { params: { active } })
      .then(res => res.data),
  getById: (id: number) =>
    api.get<SARPlan>(`/sar-plans/${id}`).then(res => res.data),
  create: (plan: SARPlan) =>
    api.post<SARPlan>('/sar-plans', plan).then(res => res.data),
  update: (id: number, plan: Partial<SARPlan>) =>
    api.put<SARPlan>(`/sar-plans/${id}`, plan).then(res => res.data),
  delete: (id: number) => api.delete(`/sar-plans/${id}`).then(res => res.data),
  recordUsage: (id: number, successful: boolean) =>
    api
      .post<{ usage_count: number; success_rate: number }>(
        `/sar-plans/${id}/usage`,
        { successful }
      )
      .then(res => res.data),
};

// Experiments
export const experimentApi = {
  getAll: (status?: string, week?: number) =>
    api
      .get<Experiment[]>('/experiments', { params: { status, week } })
      .then(res => res.data),
  getById: (id: number) =>
    api.get<Experiment>(`/experiments/${id}`).then(res => res.data),
  create: (experiment: Experiment) =>
    api.post<Experiment>('/experiments', experiment).then(res => res.data),
  update: (id: number, experiment: Partial<Experiment>) =>
    api
      .put<Experiment>(`/experiments/${id}`, experiment)
      .then(res => res.data),
  complete: (
    id: number,
    data: {
      outcome: string;
      learning: string;
      belief_rating_after: number;
    }
  ) =>
    api
      .post<Experiment>(`/experiments/${id}/complete`, data)
      .then(res => res.data),
};

// Belief Ratings
export const beliefRatingApi = {
  getAll: (type?: string, start?: string, end?: string) =>
    api
      .get<BeliefRating[]>('/belief-ratings', { params: { type, start, end } })
      .then(res => res.data),
  getLatest: () =>
    api
      .get<{
        uncontrollability: BeliefRating;
        danger: BeliefRating;
        positive: BeliefRating;
      }>('/belief-ratings/latest')
      .then(res => res.data),
  create: (rating: BeliefRating) =>
    api.post<BeliefRating>('/belief-ratings', rating).then(res => res.data),
  getTrends: (days?: number) =>
    api
      .get<{
        uncontrollability: { date: string; rating: number }[];
        danger: { date: string; rating: number }[];
        positive: { date: string; rating: number }[];
      }>('/belief-ratings/trends', { params: { days } })
      .then(res => res.data),
  batchCreate: (ratings: BeliefRating[]) =>
    api
      .post<BeliefRating[]>('/belief-ratings/batch', { ratings })
      .then(res => res.data),
};

// Today
export const todayApi = {
  getTasks: () => api.get<TodayTask[]>('/today').then(res => res.data),
  getStats: () =>
    api
      .get<{
        totalTasks: number;
        completedTasks: number;
        completionRate: number;
        details: {
          att: boolean;
          dm: number;
          log: boolean;
        };
      }>('/today/stats')
      .then(res => res.data),
};

// Progress
export const progressApi = {
  getMetrics: (days?: number) =>
    api
      .get<ProgressMetrics>('/progress', { params: { days } })
      .then(res => res.data),
  getWeeklySummary: () =>
    api
      .get<{
        cas_averages: {
          worry: number;
          rumination: number;
          monitoring: number;
        };
        practice_totals: {
          att_minutes: number;
          dm_count: number;
        };
        experiments_completed: number;
        belief_changes: {
          uncontrollability: number;
          danger: number;
          positive: number;
        };
      }>('/progress/weekly-summary')
      .then(res => res.data),
};

// Notifications
export const notificationApi = {
  getAll: (sent?: boolean, type?: string) =>
    api
      .get('/notifications', { params: { sent, type } })
      .then(res => res.data),
  getPending: () => api.get('/notifications/pending').then(res => res.data),
  create: (notification: any) =>
    api.post('/notifications', notification).then(res => res.data),
  markSent: (id: number) =>
    api.post(`/notifications/${id}/sent`).then(res => res.data),
  scheduleDaily: () =>
    api.post('/notifications/schedule-daily').then(res => res.data),
};

export default api;