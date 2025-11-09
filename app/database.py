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
        # Check and add company column to simulations
        result = connection.execute(text("PRAGMA table_info('simulations')"))
        columns = {row[1] for row in result.fetchall()}
        if "company" not in columns:
            connection.execute(text("ALTER TABLE simulations ADD COLUMN company VARCHAR(100)"))
        
        # Check and add new columns to users table
        result = connection.execute(text("PRAGMA table_info('users')"))
        user_columns = {row[1] for row in result.fetchall()}
        
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
        
        connection.commit()


# Run lightweight schema adjustments on import
ensure_additional_columns()
