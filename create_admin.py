#!/usr/bin/env python3
"""
Скрипт для создания тестового администратора
Username: admin
Password: admin
"""
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def create_admin_user():
    db = SessionLocal()
    try:
        # Проверяем, существует ли уже админ
        existing_admin = db.query(User).filter(User.email == "admin@naviq.com").first()
        if existing_admin:
            print("✓ Админ пользователь уже существует")
            print(f"  Email: admin@naviq.com")
            print(f"  Role: {existing_admin.role}")
            return

        # Создаем нового админа
        admin_user = User(
            name="Admin",
            email="admin@naviq.com",
            hashed_password=get_password_hash("admin"),
            role="admin",
            is_active=True,
            education_status="university"
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("✓ Тестовый админ создан успешно!")
        print(f"  ID: {admin_user.id}")
        print(f"  Email: admin@naviq.com")
        print(f"  Password: admin")
        print(f"  Role: {admin_user.role}")

    except Exception as e:
        print(f"✗ Ошибка при создании админа: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
