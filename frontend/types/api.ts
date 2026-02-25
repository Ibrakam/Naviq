export type UserRole = "STUDENT" | "ADMIN" | "student" | "admin";
export type AppLocale = "ru" | "uz";

export interface SkillVector {
  communication: number;
  leadership: number;
  analytics: number;
  creativity: number;
  technical: number;
  teamwork: number;
  problem_solving: number;
  time_management: number;
  adaptability: number;
  critical_thinking: number;
}

export interface UserOut {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  xp: number;
  xp_multiplier?: number;
  attempts_balance: number;
  skill_profile: SkillVector | null;
  preferred_language?: AppLocale;
  timezone?: string;
  sound_enabled?: boolean;
  elite_chat_access?: boolean;
  university_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  timezone?: string;
  university_id?: string | null;
  preferred_language?: AppLocale;
}

export interface UniversityOut {
  id: string;
  name: string;
  short_code: string;
  region?: string | null;
  logo_url?: string | null;
  is_active: boolean;
}

export interface AnswerItem {
  question_id: string;
  answer: string;
}

export interface AssessmentOption {
  code: string;
  text: string;
}

export interface AssessmentQuestionOut {
  id: string;
  question: string;
  type: string;
  category?: string;
  required: boolean;
  options: AssessmentOption[];
}

export interface AnalyzeSkillsRequest {
  answers: AnswerItem[];
}

export interface ProfessionOut {
  id: string;
  title: string;
  description?: string;
  category?: string;
  reference_skills: Record<string, number>;
}

export interface GapAnalysisResponse {
  gaps: Record<string, number>;
  match_percentage: number;
  profession_id: string;
  profession_title: string;
}

export type SimulationStepType = "question" | "task" | "dialog";

export interface QuestionStepContent {
  prompt: string;
  hint?: string;
  placeholder?: string;
  options?: string[];
  expected_keywords?: string[];
  [key: string]: unknown;
}

export interface TaskStepContent {
  title: string;
  instructions: string;
  checklist?: string[];
  placeholder?: string;
  starter_template?: string;
  deliverable_format?: "text" | "markdown" | "json" | "code";
  [key: string]: unknown;
}

export interface DialogStepContent {
  mentor_message: string;
  context?: string;
  tone?: string;
  placeholder?: string;
  suggested_replies?: string[];
  [key: string]: unknown;
}

export interface SimulationStepBase {
  id: string;
  order: number;
  next_step_rules?: Record<string, unknown> | null;
}

export interface SimulationQuestionStepOut extends SimulationStepBase {
  type: "question";
  content: QuestionStepContent | Record<string, unknown>;
}

export interface SimulationTaskStepOut extends SimulationStepBase {
  type: "task";
  content: TaskStepContent | Record<string, unknown>;
}

export interface SimulationDialogStepOut extends SimulationStepBase {
  type: "dialog";
  content: DialogStepContent | Record<string, unknown>;
}

export type SimulationStepOut = SimulationQuestionStepOut | SimulationTaskStepOut | SimulationDialogStepOut;

export interface SimulationOut {
  id: string;
  title: string;
  description?: string;
  profession_id: string;
  is_active: boolean;
  steps: SimulationStepOut[];
}

export interface SimulationSessionState {
  simulation_id: string;
  current_step_order: number;
  answers: { step_order: number; answer: string }[];
  completed: boolean;
}

export interface SimulationStepResponse {
  step: SimulationStepOut | null;
  session: SimulationSessionState;
  finished: boolean;
  skill_update?: Record<string, number> | null;
}

export interface CourseOut {
  id: string;
  title: string;
  provider: string;
  url?: string | null;
  skill_tags: Record<string, number>;
  difficulty: number;
  description?: string;
}

export interface HomeworkSubmissionCreate {
  answer: string;
}

export interface HomeworkSubmissionOut {
  id: string;
  lesson_id: string;
  user_id: string;
  answer: string;
  status: "pending" | "passed" | "failed";
  score?: number | null;
  feedback?: string | null;
  created_at: string;
  checked_at?: string | null;
}

export interface CourseLessonOut {
  id: string;
  course_id: string;
  order: number;
  title: string;
  description?: string | null;
  youtube_url?: string | null;
  homework_prompt?: string | null;
  homework_rubric?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  my_latest_submission?: HomeworkSubmissionOut | null;
}

export interface CourseLessonCreate {
  order: number;
  title: string;
  description?: string | null;
  youtube_url?: string | null;
  homework_prompt?: string | null;
  homework_rubric?: Record<string, unknown> | null;
}

export interface CourseLessonUpdate {
  order?: number;
  title?: string;
  description?: string | null;
  youtube_url?: string | null;
  homework_prompt?: string | null;
  homework_rubric?: Record<string, unknown> | null;
}

export interface PromptOut {
  id: string;
  name: string;
  system_prompt: string;
  model: string;
  temperature: number;
}

export interface PagedQuery {
  skip?: number;
  limit?: number;
  search?: string;
}

export interface GeneratePathResponse {
  task_id: string;
  status: "processing" | "ok" | "failed";
}

export interface RoadmapTaskStatusResponse {
  task_id: string;
  status: "processing" | "ok" | "failed";
  path_id?: string;
  error?: string;
}

export interface UserPathOut {
  id: string;
  user_id: string;
  target_profession_id: string;
  steps: Array<Record<string, unknown>>;
  gap_analysis?: Record<string, number> | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  profession_title?: string | null;
}

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type DailyQuestType = "micro_reflection" | "one_decision_sim" | "skill_flash" | "pivot_check";

export interface GamificationLevelOut {
  level: number;
  title: string;
  xp_min: number;
  xp_max?: number | null;
  ui_upgrade?: string | null;
}

export interface GamificationProfileOut {
  xp: number;
  level: number;
  next_level_xp?: number | null;
  streak: number;
  rank_title: string;
  sound_enabled: boolean;
  university?: {
    id: string;
    name: string;
    short_code: string;
  } | null;
}

export interface AchievementOut {
  key: string;
  name: string;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlocked_at?: string | null;
  progress: number;
  reward?: Record<string, unknown> | null;
}

export interface DailyQuestOut {
  id: string;
  quest_type: DailyQuestType;
  title: string;
  prompt: string;
  xp_reward: number;
  completed: boolean;
}

export interface DailyQuestCompleteOut {
  completed: boolean;
  gained_xp: number;
  streak: number;
  shield_count: number;
}

export interface UniversityLeaderboardEntryOut {
  university_id: string;
  university_name: string;
  score: number;
  rank: number;
  delta?: number | null;
}

export interface GamificationNotificationOut {
  id: string;
  type: "achievement_unlocked" | "xp_gained" | "level_up" | "daily_quest_ready" | "leaderboard_update" | string;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface CareerIdentityCardOut {
  student_name: string;
  title: string;
  rank: string;
  level: number;
  xp: number;
  skill_profile: SkillVector | Record<string, number>;
  top_badges: string[];
}

export interface ApiErrorPayload {
  detail?: string;
  [key: string]: unknown;
}
