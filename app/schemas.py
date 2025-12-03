from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, date


# User schemas
class UserBase(BaseModel):
    name: str
    email: str


class UserCreate(UserBase):
    password: str


class GoogleOAuthToken(BaseModel):
    token: str  # Google ID token


class GoogleUserInfo(BaseModel):
    email: str
    name: str
    google_id: str
    email_verified: bool = True


class CompleteProfile(BaseModel):
    name: str
    date_of_birth: Optional[str] = None  # ISO date string
    education_status: Optional[str] = None  # University, High School, etc.
    school_name: Optional[str] = None
    graduation_date: Optional[str] = None  # ISO date string


class UserLogin(BaseModel):
    email: str
    password: str


class User(UserBase):
    id: int
    role: str
    is_active: bool
    google_id: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    education_status: Optional[str] = None
    school_name: Optional[str] = None
    graduation_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Assessment schemas
class AssessmentOption(BaseModel):
    code: str
    text: str


class AssessmentQuestion(BaseModel):
    id: int
    question: str
    type: str  # likert, multiple_choice, etc.
    options: Optional[List[AssessmentOption]] = None
    category: Optional[str] = None
    required: bool = True


class AssessmentAnswer(BaseModel):
    question_id: int
    answer: Any  # Intentionally loose for backward compatibility


class AssessmentSubmission(BaseModel):
    answers: List[AssessmentAnswer]


class AssessmentResult(BaseModel):
    top_tracks: List[Dict[str, Any]]
    development_plan: Dict[str, str]
    courses: List[Dict[str, str]]
    overall_score: float
    recommendations: List[str]
    primary_track: Optional[str] = None
    skills_radar: Optional[List[Dict[str, Any]]] = None


class AssessmentChatQuestion(BaseModel):
    id: int
    role: Literal["system", "assistant"]
    question_text: str
    type: Literal["text", "choice"]
    options: Optional[List[AssessmentOption]] = None
    category: Optional[str] = None
    order: Optional[int] = None


class AssessmentChatMessage(BaseModel):
    role: Literal["system", "assistant", "user"]
    content: str
    question_id: Optional[int] = None
    answer_value: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    type: Optional[str] = None
    options: Optional[List[AssessmentOption]] = None
    category: Optional[str] = None


class AssessmentChatProgress(BaseModel):
    current: int
    total: int


class AssessmentChatAnswer(BaseModel):
    session_id: Optional[int] = None
    question_id: int
    user_answer: Any


class AssessmentChatAnswerResponse(BaseModel):
    session_id: int
    status: Literal["draft", "completed"]
    next_question: Optional[AssessmentChatQuestion] = None
    progress: AssessmentChatProgress
    messages: List[AssessmentChatMessage]
    result: Optional[AssessmentResult] = None


class AssessmentChatSession(BaseModel):
    session_id: int
    status: Literal["draft", "completed"]
    progress: AssessmentChatProgress
    messages: List[AssessmentChatMessage]
    result: Optional[AssessmentResult] = None
    next_question: Optional[AssessmentChatQuestion] = None


# Career Track schemas
class CareerTrackBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    skills_required: List[str] = []
    average_salary: Optional[str] = None
    growth_prospects: Optional[str] = None


class CareerTrack(CareerTrackBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Simulation schemas
class SimulationStep(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    type: Optional[str] = None  # legacy type support
    content: Optional[Dict[str, Any]] = None
    question: Optional[str] = None
    options: Optional[List[str]] = None
    correctAnswer: Optional[Any] = None
    placeholder: Optional[str] = None
    requiredKeywords: Optional[List[str]] = None
    points: Optional[int] = None
    expected_output: Optional[str] = None
    kind: Optional[str] = None
    input_placeholder: Optional[str] = None
    choices: Optional[List[str]] = None


class SimulationBase(BaseModel):
    title: str
    description: Optional[str] = None
    track_id: int
    steps: List[SimulationStep]
    duration: Optional[str] = None
    level: str = "beginner"
    company: Optional[str] = None


class Simulation(SimulationBase):
    id: int
    is_active: bool
    created_at: datetime
    track: CareerTrack
    
    class Config:
        from_attributes = True


class SimulationCreate(SimulationBase):
    pass


# Submission schemas
class SubmissionBase(BaseModel):
    simulation_id: int
    answers: Dict[str, Any] = {}


class Submission(SubmissionBase):
    id: int
    user_id: int
    score: Optional[int] = None
    feedback: Optional[str] = None
    completed: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    answers: Dict[str, Any]
    completed: Optional[bool] = None


# Certificate schemas
class Certificate(BaseModel):
    id: int
    user_id: int
    simulation_id: int
    pdf_url: Optional[str] = None
    certificate_id: str
    issued_at: datetime
    simulation: Simulation
    
    class Config:
        from_attributes = True


# Analytics schemas
class AnalyticsDashboard(BaseModel):
    total_users: int
    completed_assessments: int
    active_simulations: int
    issued_certificates: int
    user_registrations_by_day: List[Dict[str, Any]]
    popular_tracks: List[Dict[str, Any]]
    completion_rates: Dict[str, float]


# Gamification schemas
class UserStats(BaseModel):
    id: int
    user_id: int
    total_points: int
    current_level: int
    experience_points: int
    experience_to_next_level: int
    streak_days: int
    last_active_date: Optional[datetime] = None
    simulations_completed: int
    certificates_earned: int
    assessments_completed: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Achievement(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    icon: str
    points_reward: int
    category: Optional[str] = None
    requirement_type: Optional[str] = None
    requirement_value: Optional[int] = None
    is_hidden: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserAchievement(BaseModel):
    id: int
    user_id: int
    achievement_id: int
    earned_at: datetime
    points_earned: int
    achievement: Achievement
    
    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    user_id: int
    user_name: str
    total_points: int
    current_level: int
    simulations_completed: int
    certificates_earned: int
    streak_days: int
    rank: int


class GamificationProfile(BaseModel):
    stats: UserStats
    achievements: List[UserAchievement]
    recent_achievements: List[UserAchievement]  # Последние 5 достижений
    level_progress: float  # Процент прогресса до следующего уровня (0-100)
    next_level_points: int  # Осталось очков до следующего уровня


# Course schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    track: str  # Frontend, Backend, Data, Design, Marketing
    duration: Optional[str] = None
    level: str = "Beginner"
    lessons_count: int = 0
    content: List[Dict[str, Any]] = []
    is_active: bool = True
    image_url: Optional[str] = None
    instructor: Optional[str] = None
    rating: int = 0
    students_count: int = 0


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    track: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    lessons_count: Optional[int] = None
    content: Optional[List[Dict[str, Any]]] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None
    instructor: Optional[str] = None
    rating: Optional[int] = None
    students_count: Optional[int] = None


class Course(CourseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CourseEnrollmentBase(BaseModel):
    course_id: int


class CourseEnrollmentCreate(CourseEnrollmentBase):
    pass


class CourseEnrollment(CourseEnrollmentBase):
    id: int
    user_id: int
    progress: int
    completed: bool
    enrolled_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
