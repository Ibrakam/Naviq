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
        
        connection.commit()


# Run lightweight schema adjustments on import
ensure_additional_columns()
