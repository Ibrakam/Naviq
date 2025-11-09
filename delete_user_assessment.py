#!/usr/bin/env python3
"""Script to delete assessment data for a specific user"""

from app.database import SessionLocal
from app.models import User, AssessmentSession

def delete_user_assessment(email: str):
    """Delete all assessment sessions for a user by email"""
    db = SessionLocal()
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ Пользователь с email '{email}' не найден")
            return
        
        print(f"✓ Найден пользователь: {user.name} (ID: {user.id})")
        
        # Find all assessment sessions for this user
        sessions = db.query(AssessmentSession).filter(
            AssessmentSession.user_id == user.id
        ).all()
        
        if not sessions:
            print(f"ℹ️  У пользователя нет данных профориентации")
            return
        
        print(f"✓ Найдено сессий профориентации: {len(sessions)}")
        
        # Delete all sessions
        for session in sessions:
            print(f"  - Удаление сессии ID: {session.id} (статус: {session.status})")
            db.delete(session)
        
        db.commit()
        print(f"✅ Успешно удалено {len(sessions)} сессий профориентации для пользователя {email}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при удалении: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    email = "qweqwe@mail.ru"
    print(f"Удаление данных профориентации для пользователя: {email}\n")
    delete_user_assessment(email)

"""Script to delete assessment data for a specific user"""

from app.database import SessionLocal
from app.models import User, AssessmentSession

def delete_user_assessment(email: str):
    """Delete all assessment sessions for a user by email"""
    db = SessionLocal()
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ Пользователь с email '{email}' не найден")
            return
        
        print(f"✓ Найден пользователь: {user.name} (ID: {user.id})")
        
        # Find all assessment sessions for this user
        sessions = db.query(AssessmentSession).filter(
            AssessmentSession.user_id == user.id
        ).all()
        
        if not sessions:
            print(f"ℹ️  У пользователя нет данных профориентации")
            return
        
        print(f"✓ Найдено сессий профориентации: {len(sessions)}")
        
        # Delete all sessions
        for session in sessions:
            print(f"  - Удаление сессии ID: {session.id} (статус: {session.status})")
            db.delete(session)
        
        db.commit()
        print(f"✅ Успешно удалено {len(sessions)} сессий профориентации для пользователя {email}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при удалении: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    email = "qweqwe@mail.ru"
    print(f"Удаление данных профориентации для пользователя: {email}\n")
    delete_user_assessment(email)

