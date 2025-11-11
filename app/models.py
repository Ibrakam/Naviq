from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Optional for Google OAuth users
    google_id = Column(String(255), unique=True, index=True, nullable=True)  # Google OAuth ID
    date_of_birth = Column(DateTime(timezone=True), nullable=True)  # Date of birth
    education_status = Column(String(50), nullable=True)  # University, High School, etc.
    school_name = Column(String(200), nullable=True)  # School/University name
    graduation_date = Column(DateTime(timezone=True), nullable=True)  # Expected graduation date
    role = Column(String(20), default="student")  # student, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assessment_sessions = relationship("AssessmentSession", back_populates="user")
    submissions = relationship("Submission", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    stats = relationship("UserStats", back_populates="user", uselist=False)
    achievements = relationship("UserAchievement", back_populates="user")


class AssessmentQuestionModel(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    type = Column(String(50), default="choice")
    role = Column(String(20), default="assistant")
    display_order = Column(Integer, nullable=True)
    category = Column(String(50), nullable=True)
    options = Column(JSON, nullable=True)  # [{"code": "A", "text": "..."}]
    weights = Column(JSON, nullable=True)  # {"A": {"design": 2}, ...}
    is_active = Column(Boolean, default=True)


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="draft")  # draft, completed
    answers = Column(JSON, default=dict)
    messages = Column(JSON, default=list)
    result = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="assessment_sessions")


class CareerTrack(Base):
    __tablename__ = "career_tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)  # frontend, backend, data, design, etc.
    skills_required = Column(JSON, default=list)
    average_salary = Column(String(50))
    growth_prospects = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    simulations = relationship("Simulation", back_populates="track")


class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    company = Column(String(100))
    track_id = Column(Integer, ForeignKey("career_tracks.id"), nullable=False)
    steps = Column(JSON, nullable=False)  # Array of step objects
    duration = Column(String(50))  # e.g., "30-45 minutes"
    level = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    track = relationship("CareerTrack", back_populates="simulations")
    submissions = relationship("Submission", back_populates="simulation")
    certificates = relationship("Certificate", back_populates="simulation")


class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    simulation_id = Column(Integer, ForeignKey("simulations.id"), nullable=False)
    answers = Column(JSON, default=dict)
    score = Column(Integer, nullable=True)
    feedback = Column(Text)
    completed = Column(Boolean, default=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    simulation = relationship("Simulation", back_populates="submissions")


class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    simulation_id = Column(Integer, ForeignKey("simulations.id"), nullable=False)
    pdf_url = Column(String(500))
    certificate_id = Column(String(100), unique=True, index=True)  # UUID for QR code
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="certificates")
    simulation = relationship("Simulation", back_populates="certificates")


class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_points = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    experience_points = Column(Integer, default=0)  # XP для текущего уровня
    experience_to_next_level = Column(Integer, default=100)  # XP до следующего уровня
    streak_days = Column(Integer, default=0)  # Серия дней подряд
    last_active_date = Column(DateTime(timezone=True))
    simulations_completed = Column(Integer, default=0)
    certificates_earned = Column(Integer, default=0)
    assessments_completed = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="stats")


class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # Уникальный код достижения
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon = Column(String(50), default="🏆")  # Эмодзи или название иконки
    points_reward = Column(Integer, default=0)  # Очки за получение
    category = Column(String(50))  # learning, mastery, social, special
    requirement_type = Column(String(50))  # simulations_completed, certificates_earned, streak_days, etc.
    requirement_value = Column(Integer)  # Значение требования
    is_hidden = Column(Boolean, default=False)  # Скрытое достижение
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    points_earned = Column(Integer, default=0)  # Очки, полученные при получении этого достижения
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
