from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_additional_columns():
    """Ensure newer optional columns exist when migrating from older SQLite schemas."""
    if engine.dialect.name != "sqlite":
        return
    with engine.connect() as connection:
        # Helper to fetch column names
        def _columns(table: str) -> set[str]:
            result = connection.execute(text(f"PRAGMA table_info('{table}')"))
            return {row[1] for row in result.fetchall()}

        # Check and add company column to simulations
        simulation_columns = _columns("simulations")
        if "company" not in simulation_columns:
            connection.execute(text("ALTER TABLE simulations ADD COLUMN company VARCHAR(100)"))
        
        # Check and add new columns to users table
        user_columns = _columns("users")
        
        if "google_id" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
            connection.execute(text("CREATE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id)"))
        
        if "date_of_birth" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN date_of_birth DATETIME"))
        
        if "education_status" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN education_status VARCHAR(50)"))
        
        if "school_name" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN school_name VARCHAR(200)"))
        
        if "graduation_date" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN graduation_date DATETIME"))

        # Assessment enhancements
        question_columns = _columns("assessment_questions")
        if "role" not in question_columns:
            connection.execute(
                text("ALTER TABLE assessment_questions ADD COLUMN role VARCHAR(20) DEFAULT 'assistant'")
            )
        if "display_order" not in question_columns:
            connection.execute(text("ALTER TABLE assessment_questions ADD COLUMN display_order INTEGER"))

        session_columns = _columns("assessment_sessions")
        if "messages" not in session_columns:
            # SQLite stores JSON as TEXT; FastAPI/SQLAlchemy handle serialization
            connection.execute(text("ALTER TABLE assessment_sessions ADD COLUMN messages TEXT"))

        # Course enhancements
        course_columns = _columns("courses")
        if "image_url" not in course_columns:
            connection.execute(text("ALTER TABLE courses ADD COLUMN image_url VARCHAR(500)"))
        if "instructor" not in course_columns:
            connection.execute(text("ALTER TABLE courses ADD COLUMN instructor VARCHAR(100)"))
        if "rating" not in course_columns:
            connection.execute(text("ALTER TABLE courses ADD COLUMN rating INTEGER DEFAULT 0"))
        if "students_count" not in course_columns:
            connection.execute(text("ALTER TABLE courses ADD COLUMN students_count INTEGER DEFAULT 0"))

        # Simulation enhancements
        simulation_columns = _columns("simulations")
        if "course_id" not in simulation_columns:
            connection.execute(text("ALTER TABLE simulations ADD COLUMN course_id INTEGER"))
        if "required_progress" not in simulation_columns:
            connection.execute(text("ALTER TABLE simulations ADD COLUMN required_progress INTEGER DEFAULT 0"))
        if "unlock_message" not in simulation_columns:
            connection.execute(text("ALTER TABLE simulations ADD COLUMN unlock_message VARCHAR(500)"))

        # CourseEnrollment enhancements
        enrollment_columns = _columns("course_enrollments")
        if "current_lesson_id" not in enrollment_columns:
            connection.execute(text("ALTER TABLE course_enrollments ADD COLUMN current_lesson_id INTEGER"))
        if "lessons_completed" not in enrollment_columns:
            connection.execute(text("ALTER TABLE course_enrollments ADD COLUMN lessons_completed TEXT"))
        if "unlocked_simulations" not in enrollment_columns:
            connection.execute(text("ALTER TABLE course_enrollments ADD COLUMN unlocked_simulations TEXT"))
        if "last_accessed" not in enrollment_columns:
            connection.execute(text("ALTER TABLE course_enrollments ADD COLUMN last_accessed DATETIME"))

        connection.commit()


# Run lightweight schema adjustments on import
ensure_additional_columns()
