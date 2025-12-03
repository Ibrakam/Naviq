const DEFAULT_API_URL = 'https://naviq.uz';
const API_PREFIX = '/make-server-a1779b8e';

export const apiBaseUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export function buildApiUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalized}`;
}

export const apiRoutes = {
  login: `${API_PREFIX}/login`,
  signup: `${API_PREFIX}/signup`,
  profile: `${API_PREFIX}/profile`,
  assessmentQuestions: `/api/assessment/questions`,
  assessmentChatQuestions: `/api/assessment/chat-questions`,
  assessmentChatAnswer: `/api/assessment/chat-answer`,
  assessmentSessionCurrent: `/api/assessment/session/current`,
  assessmentResult: `/api/assessment/result`,
  assessmentSubmit: `/api/assessment/submit`,
  simulations: `${API_PREFIX}/simulations`,
  simulation: (id: string | number) => `${API_PREFIX}/simulations/${id}`,
  simulationProgress: (id: string | number) => `${API_PREFIX}/simulations/${id}/progress`,
  adminAnalytics: `${API_PREFIX}/admin/analytics`,
  adminSimulations: `${API_PREFIX}/admin/simulations`,
  courses: `/api/courses/`,
  course: (id: string | number) => `/api/courses/${id}`,
  courseProgress: (id: string | number) => `/api/courses/${id}/progress`,
  courseEnroll: `/api/courses/enroll`,
  courseModules: (id: string | number) => `/api/courses/${id}/modules`,
  lessonComplete: (courseId: string | number, lessonId: string | number) => `/api/courses/${courseId}/lessons/${lessonId}/complete`,
  courseSimulations: (id: string | number) => `/api/courses/${id}/simulations`,
  gamificationProfile: `/api/gamification/profile`,
  gamificationStats: `/api/gamification/stats`,
  gamificationAchievements: `/api/gamification/achievements`,
  gamificationAllAchievements: `/api/gamification/achievements/all`,
  gamificationLeaderboard: `/api/gamification/leaderboard`,
  googleAuth: `/api/auth/google`,
  completeProfile: `/api/auth/complete-profile`,
  aiGradeTask: `/api/ai/grade-task`,
};
