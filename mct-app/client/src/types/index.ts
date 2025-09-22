export interface UserSettings {
  id: number;
  onboarding_completed: boolean;
  onboarding_date?: string;
  current_week: number;
  att_reminder_time: string;
  dm_reminder_times: string[];
  postponement_slot_start: string;
  postponement_slot_duration: number;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id?: number;
  assessment_type: 'initial' | 'weekly' | 'final';
  worry_baseline: number;
  rumination_baseline: number;
  monitoring_baseline: number;
  uncontrollability_belief: number;
  danger_belief: number;
  positive_belief: number;
  triggers?: string[];
  goals?: string[];
  created_at?: string;
}

export interface ProgramModule {
  id?: number;
  week_number: number;
  title: string;
  description: string;
  content: string;
  key_points: string[];
  exercises: string[];
  unlocked: boolean;
  completed: boolean;
  unlocked_date?: string;
  completed_date?: string;
}

export interface CASLog {
  id?: number;
  date: string;
  worry_minutes: number;
  rumination_minutes: number;
  monitoring_count: number;
  checking_count: number;
  reassurance_count: number;
  avoidance_count: number;
  notes?: string;
  created_at?: string;
}

export interface ATTSession {
  id?: number;
  date: string;
  duration_minutes: number;
  completed: boolean;
  attentional_control_rating?: number;
  intrusions: boolean;
  intrusion_count?: number;
  shift_ease_rating?: number;
  script_type?: 'standard' | 'short' | 'emergency';
  notes?: string;
  created_at?: string;
}

export interface DMPractice {
  id?: number;
  date: string;
  time_of_day: 'morning' | 'midday' | 'evening' | 'other';
  duration_seconds: number;
  engaged_vs_watched: 'engaged' | 'watched';
  confidence_rating: number;
  metaphor_used?: 'radio' | 'screen' | 'weather';
  created_at?: string;
}

export interface PostponementLog {
  id?: number;
  date: string;
  trigger_time: string;
  scheduled_time?: string;
  urge_before: number;
  urge_after?: number;
  processed: boolean;
  processing_duration_minutes?: number;
  notes?: string;
  created_at?: string;
}

export interface SARPlan {
  id?: number;
  trigger_cue: string;
  if_statement: string;
  then_action: string;
  active: boolean;
  usage_count: number;
  success_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExperimentTemplate {
  id: string;
  name: string;
  target_belief: string;
  hypothesis: string;
  protocol: {
    description: string;
    steps: string[];
    duration?: string;
    frequency?: string;
  };
  metrics: {
    name: string;
    type: 'percentage' | 'number' | 'boolean' | 'scale';
    description: string;
  }[];
  success_criteria: string[];
  common_outcome?: string;
  learning_options: string[];
  difficulty_level: 'easy' | 'moderate' | 'challenging';
  recommended_week?: number;
}

export interface ExperimentInstance {
  id?: number;
  template_id?: string;
  week_number?: number;
  belief_tested: string;
  prediction: string;
  safety_behaviors_dropped?: string[];
  protocol_steps: ExperimentStep[];
  metrics?: ExperimentMetric[];
  status: 'planned' | 'in_progress' | 'completed';
  outcome?: string;
  learning?: string;
  belief_rating_before?: number;
  belief_rating_after?: number;
  started_at?: string;
  created_at?: string;
  completed_at?: string;
}

export interface ExperimentStep {
  id: string;
  description: string;
  completed: boolean;
  completed_at?: string;
  data?: any;
  notes?: string;
}

export interface ExperimentMetric {
  name: string;
  value: number | string | boolean;
  unit?: string;
  recorded_at: string;
  notes?: string;
}

// Keep backwards compatibility
export interface Experiment extends ExperimentInstance {}

export interface BeliefRating {
  id?: number;
  date: string;
  belief_type: 'uncontrollability' | 'danger' | 'positive' | 'custom';
  belief_statement?: string;
  rating: number;
  context?: string;
  created_at?: string;
}

export interface TodayTask {
  id: string;
  type: 'att' | 'dm' | 'log' | 'experiment' | 'postponement';
  title: string;
  description?: string;
  scheduled_time?: string;
  completed: boolean;
  data?: any;
}

export interface ProgressMetrics {
  worry_trend: number[];
  rumination_trend: number[];
  monitoring_trend: number[];
  att_minutes_trend: number[];
  dm_count_trend: number[];
  belief_ratings_trend: {
    uncontrollability: number[];
    danger: number[];
    positive: number[];
  };
  postponement_success_rate: number;
  experiments_completed: number;
  current_streaks: {
    att: number;
    dm: number;
    logging: number;
    overall: number;
  };
}

export interface NavigationTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
}

export interface ExperimentSession {
  id?: number;
  experiment_id: number;
  session_date: string;
  session_number: number;
  data: any;
  completed: boolean;
  notes?: string;
  created_at?: string;
}