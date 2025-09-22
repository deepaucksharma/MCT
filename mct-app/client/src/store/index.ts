import { create } from 'zustand';
import { UserSettings, Assessment, ProgramModule, TodayTask } from '../types';
import { settingsApi, assessmentApi, programApi, todayApi } from '../services/api';

interface AppState {
  // User Settings
  settings: UserSettings | null;
  loadingSettings: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  completeOnboarding: () => Promise<void>;

  // Assessment
  currentAssessment: Assessment | null;
  loadingAssessment: boolean;
  fetchCurrentAssessment: () => Promise<void>;
  saveAssessment: (assessment: Assessment) => Promise<void>;

  // Program Modules
  modules: ProgramModule[];
  currentModule: ProgramModule | null;
  loadingModules: boolean;
  fetchModules: () => Promise<void>;
  fetchModuleByWeek: (week: number) => Promise<void>;
  unlockWeek: (week: number) => Promise<void>;
  completeWeek: (week: number) => Promise<void>;

  // Today Tasks
  todayTasks: TodayTask[];
  loadingTasks: boolean;
  fetchTodayTasks: () => Promise<void>;
  updateTaskStatus: (taskId: string, completed: boolean) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const useStore = create<AppState>((set, get) => ({
  // User Settings
  settings: null,
  loadingSettings: false,
  fetchSettings: async () => {
    set({ loadingSettings: true });
    try {
      const settings = await settingsApi.get();
      set({ settings, loadingSettings: false });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      set({ loadingSettings: false });
    }
  },
  updateSettings: async (updates) => {
    try {
      const updatedSettings = await settingsApi.update(updates);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },
  completeOnboarding: async () => {
    try {
      await settingsApi.completeOnboarding();
      const settings = get().settings;
      if (settings) {
        set({
          settings: {
            ...settings,
            onboarding_completed: true,
            onboarding_date: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  },

  // Assessment
  currentAssessment: null,
  loadingAssessment: false,
  fetchCurrentAssessment: async () => {
    set({ loadingAssessment: true });
    try {
      const assessment = await assessmentApi.getByType('initial');
      set({ currentAssessment: assessment, loadingAssessment: false });
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
      set({ loadingAssessment: false });
    }
  },
  saveAssessment: async (assessment) => {
    try {
      const savedAssessment = await assessmentApi.create(assessment);
      set({ currentAssessment: savedAssessment });
    } catch (error) {
      console.error('Failed to save assessment:', error);
      throw error;
    }
  },

  // Program Modules
  modules: [],
  currentModule: null,
  loadingModules: false,
  fetchModules: async () => {
    set({ loadingModules: true });
    try {
      const modules = await programApi.getAll();
      set({ modules, loadingModules: false });
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      set({ loadingModules: false });
    }
  },
  fetchModuleByWeek: async (week) => {
    try {
      const module = await programApi.getByWeek(week);
      set({ currentModule: module });
    } catch (error) {
      console.error('Failed to fetch module:', error);
      throw error;
    }
  },
  unlockWeek: async (week) => {
    try {
      await programApi.unlockWeek(week);
      await get().fetchModules();
    } catch (error) {
      console.error('Failed to unlock week:', error);
      throw error;
    }
  },
  completeWeek: async (week) => {
    try {
      await programApi.completeWeek(week);
      await get().fetchModules();
    } catch (error) {
      console.error('Failed to complete week:', error);
      throw error;
    }
  },

  // Today Tasks
  todayTasks: [],
  loadingTasks: false,
  fetchTodayTasks: async () => {
    set({ loadingTasks: true });
    try {
      const tasks = await todayApi.getTasks();
      set({ todayTasks: tasks, loadingTasks: false });
    } catch (error) {
      console.error('Failed to fetch today tasks:', error);
      set({ loadingTasks: false });
    }
  },
  updateTaskStatus: (taskId, completed) => {
    set((state) => ({
      todayTasks: state.todayTasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      ),
    }));
  },

  // UI State
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeTab: 'today',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useStore;