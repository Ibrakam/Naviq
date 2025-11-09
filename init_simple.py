#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import User, CareerTrack, Simulation
from app.auth import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)

print("✅ База данных SQLite создана успешно!")
print("📁 Файл: naviq.db")
print("🔑 Демо аккаунт: admin@naviq.com / admin123")

