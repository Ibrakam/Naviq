"""
Миграция для добавления новых полей в таблицу users
"""
import sqlite3
import sys
from pathlib import Path

# Путь к базе данных
db_path = Path(__file__).parent / "naviq.db"

def migrate():
    """Добавляет новые колонки в таблицу users"""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Проверяем существующие колонки
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        print("Существующие колонки:", columns)
        
        # Добавляем новые колонки, если их нет
        if 'google_id' not in columns:
            print("Добавляем колонку google_id...")
            cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id)")
            print("✓ Колонка google_id добавлена")
        
        if 'date_of_birth' not in columns:
            print("Добавляем колонку date_of_birth...")
            cursor.execute("ALTER TABLE users ADD COLUMN date_of_birth DATETIME")
            print("✓ Колонка date_of_birth добавлена")
        
        if 'education_status' not in columns:
            print("Добавляем колонку education_status...")
            cursor.execute("ALTER TABLE users ADD COLUMN education_status VARCHAR(50)")
            print("✓ Колонка education_status добавлена")
        
        if 'school_name' not in columns:
            print("Добавляем колонку school_name...")
            cursor.execute("ALTER TABLE users ADD COLUMN school_name VARCHAR(200)")
            print("✓ Колонка school_name добавлена")
        
        if 'graduation_date' not in columns:
            print("Добавляем колонку graduation_date...")
            cursor.execute("ALTER TABLE users ADD COLUMN graduation_date DATETIME")
            print("✓ Колонка graduation_date добавлена")
        
        # Делаем hashed_password опциональным (если нужно)
        # В SQLite нельзя изменить NOT NULL напрямую, но это не критично
        
        conn.commit()
        print("\n✅ Миграция успешно завершена!")
        
        # Показываем финальную структуру
        cursor.execute("PRAGMA table_info(users)")
        print("\nФинальная структура таблицы users:")
        for row in cursor.fetchall():
            print(f"  - {row[1]} ({row[2]})")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Ошибка при миграции: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    if not db_path.exists():
        print(f"❌ База данных не найдена: {db_path}")
        sys.exit(1)
    
    print("Начинаем миграцию базы данных...")
    migrate()

