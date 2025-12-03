import csv
import json
from app.database import SessionLocal
from app.models import Course

def parse_marketing_beginner(csv_file_path):
    """Parse Marketing Beginner course from CSV"""

    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        lessons = []

        for row in reader:
            level = row.get('Level', '').strip()

            # Только Marketing Beginner (BEG-*)
            if not level.startswith('BEG-'):
                continue

            if not row.get('Название'):
                continue

            lesson_num = int(level.split('-')[1])

            lesson = {
                "id": lesson_num,
                "title": f"Lesson {lesson_num}: {row['Название']}",
                "type": "text",
                "duration": "25 min",
                "order": lesson_num,
                "content": {
                    "text": f"# {row['Название']}\n\nВ этом уроке вы изучите концепцию: **{row['Название']}**",
                    "task": row.get('Задание', ''),
                    "resources": [r.strip() for r in row.get('Где искать инфу', '').split(',') if r.strip()],
                    "tools": [t.strip() for t in row.get('Какие инструменты использовать', '').split(',') if t.strip()]
                }
            }

            lessons.append(lesson)

        return lessons

def parse_pm_beginner(csv_file_path):
    """Parse Product Management Beginner course from CSV"""

    lessons = []

    with open(csv_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Найдем строку с "Product Management"
    pm_start = None
    for i, line in enumerate(lines):
        if 'Product Management' in line:
            pm_start = i + 2  # Skip title and header
            break

    if pm_start is None:
        return []

    # Парсим уроки PM
    for i in range(pm_start, min(pm_start + 10, len(lines))):
        line = lines[i].strip()
        if not line or line.startswith(',,,'):
            break

        parts = line.split(',')
        if len(parts) < 5:
            continue

        num = parts[0].strip()
        if not num.isdigit():
            continue

        lesson_num = int(num)

        # Парсим поля с учетом кавычек
        import re
        matches = list(re.finditer(r'(?:^|,)(?:"([^"]*)"|([^,]*))', line))

        if len(matches) >= 5:
            title = (matches[1].group(1) or matches[1].group(2) or '').strip()
            task = (matches[2].group(1) or matches[2].group(2) or '').strip()
            resources_str = (matches[3].group(1) or matches[3].group(2) or '').strip()
            tools_str = (matches[4].group(1) or matches[4].group(2) or '').strip()

            lesson = {
                "id": lesson_num,
                "title": f"Lesson {lesson_num}: {title}",
                "type": "text",
                "duration": "30 min",
                "order": lesson_num,
                "content": {
                    "text": f"# {title}\n\nВ этом уроке вы изучите Product Management",
                    "task": task,
                    "resources": [r.strip() for r in resources_str.split(',') if r.strip()],
                    "tools": [t.strip() for t in tools_str.split(',') if t.strip()]
                }
            }

            lessons.append(lesson)

            if lesson_num >= 5:
                break

    return lessons

def parse_data_beginner(csv_file_path):
    """Parse Data Analysis Beginner course from CSV"""

    lessons = []

    with open(csv_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Найдем строку с "Data analysis"
    data_start = None
    for i, line in enumerate(lines):
        if 'Data analysis' in line:
            data_start = i + 2  # Skip title and header
            break

    if data_start is None:
        return []

    # Парсим уроки Data
    for i in range(data_start, min(data_start + 10, len(lines))):
        line = lines[i].strip()
        if not line or line.startswith(',,,'):
            break

        parts = line.split(',')
        if len(parts) < 5:
            continue

        num = parts[0].strip()
        if not num.isdigit():
            continue

        lesson_num = int(num)

        # Парсим поля с учетом кавычек
        import re
        matches = list(re.finditer(r'(?:^|,)(?:"([^"]*)"|([^,]*))', line))

        if len(matches) >= 5:
            title = (matches[1].group(1) or matches[1].group(2) or '').strip()
            task = (matches[2].group(1) or matches[2].group(2) or '').strip()
            resources_str = (matches[3].group(1) or matches[3].group(2) or '').strip()
            tools_str = (matches[4].group(1) or matches[4].group(2) or '').strip()

            lesson = {
                "id": lesson_num,
                "title": f"Lesson {lesson_num}: {title}",
                "type": "text",
                "duration": "30 min",
                "order": lesson_num,
                "content": {
                    "text": f"# {title}\n\nВ этом уроке вы изучите анализ данных",
                    "task": task,
                    "resources": [r.strip() for r in resources_str.split(',') if r.strip()],
                    "tools": [t.strip() for t in tools_str.split(',') if t.strip()]
                }
            }

            lessons.append(lesson)

            if lesson_num >= 5:
                break

    return lessons

def create_courses_from_csv(csv_file_path):
    """Create all courses from CSV file"""

    db = SessionLocal()

    try:
        # 1. Marketing Beginner
        marketing_lessons = parse_marketing_beginner(csv_file_path)

        if marketing_lessons:
            marketing_course = Course(
                title="Marketing Fundamentals",
                description="Изучи основы маркетинга: от ЦА и оффера до построения воронки продаж.",
                track="Marketing",
                duration="5 недель",
                level="Beginner",
                lessons_count=len(marketing_lessons),
                content=[{
                    "id": 1,
                    "title": "Module 1: Marketing Basics",
                    "description": "Основы маркетинга: от теории к практике",
                    "order": 1,
                    "lessons": marketing_lessons,
                    "simulation_id": None,
                    "unlock_at_progress": 100
                }],
                is_active=True,
                image_url="/images/courses/marketing-fundamentals.jpg",
                instructor="Naviq Team",
                rating=48,
                students_count=0
            )

            db.add(marketing_course)
            print(f"✅ Создан курс: Marketing Fundamentals ({len(marketing_lessons)} уроков)")

        # 2. Product Management Beginner
        pm_lessons = parse_pm_beginner(csv_file_path)

        if pm_lessons:
            pm_course = Course(
                title="Product Management Essentials",
                description="Освой навыки Product Manager: анализ пользователей, создание User Persona, проведение интервью.",
                track="PM",
                duration="5 недель",
                level="Beginner",
                lessons_count=len(pm_lessons),
                content=[{
                    "id": 1,
                    "title": "Module 1: User Research",
                    "description": "Исследование пользователей и их проблем",
                    "order": 1,
                    "lessons": pm_lessons,
                    "simulation_id": None,
                    "unlock_at_progress": 100
                }],
                is_active=True,
                image_url="/images/courses/pm-essentials.jpg",
                instructor="Naviq Team",
                rating=45,
                students_count=0
            )

            db.add(pm_course)
            print(f"✅ Создан курс: Product Management Essentials ({len(pm_lessons)} уроков)")

        # 3. Data Analysis Beginner
        data_lessons = parse_data_beginner(csv_file_path)

        if data_lessons:
            data_course = Course(
                title="Data Analysis Basics",
                description="Научись анализировать данные: от сбора до визуализации и инсайтов.",
                track="Data",
                duration="5 недель",
                level="Beginner",
                lessons_count=len(data_lessons),
                content=[{
                    "id": 1,
                    "title": "Module 1: Data Fundamentals",
                    "description": "Основы работы с данными",
                    "order": 1,
                    "lessons": data_lessons,
                    "simulation_id": None,
                    "unlock_at_progress": 100
                }],
                is_active=True,
                image_url="/images/courses/data-basics.jpg",
                instructor="Naviq Team",
                rating=47,
                students_count=0
            )

            db.add(data_course)
            print(f"✅ Создан курс: Data Analysis Basics ({len(data_lessons)} уроков)")

        db.commit()
        print("\n🎉 Все курсы успешно добавлены в базу данных!")

    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    csv_file = "/Users/ibragimkadamzanov/Downloads/Маркетинг ( Демо Уровни)  - Beginner .csv"
    create_courses_from_csv(csv_file)
