#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base, User, CareerTrack, Simulation
import hashlib

# Create all tables
Base.metadata.create_all(bind=engine)

# Create test data
db = SessionLocal()

try:
    # Create admin user
    admin_user = User(
        name="Admin User",
        email="admin@naviq.com",
        hashed_password=hashlib.sha256("admin".encode()).hexdigest(),
        role="admin"
    )
    db.add(admin_user)
    
    # Create test career track
    track = CareerTrack(
        name="Frontend Developer",
        description="Разработка пользовательских интерфейсов",
        category="development",
        skills_required=["HTML", "CSS", "JavaScript"],
        average_salary="80,000 - 120,000 руб",
        growth_prospects="Высокий спрос на рынке"
    )
    db.add(track)
    
    db.commit()
    print("✅ Тестовые данные созданы успешно!")
    print("👤 Админ: admin@naviq.com / admin123")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    db.rollback()
finally:
    db.close()
