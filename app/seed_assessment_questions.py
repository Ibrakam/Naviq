"""
Скрипт для добавления вопросов профориентации с вариантами ответов в БД

Запуск:
    python3 app/seed_assessment_questions.py
"""

from app.database import SessionLocal
from app.models import AssessmentQuestionModel
from sqlalchemy.orm import Session


QUESTIONS_WITH_ANSWERS = [
    {
        "question": "Что вас больше всего вдохновляет в работе?",
        "type": "choice",
        "category": "interests",
        "display_order": 1,
        "options": [
            {"code": "A", "text": "Работа с данными и поиск закономерностей"},
            {"code": "B", "text": "Создание красивых и функциональных интерфейсов"},
            {"code": "C", "text": "Общение с людьми и решение их проблем"},
            {"code": "D", "text": "Построение систем и написание кода"},
        ],
        "weights": {
            "A": {"data": 3, "tech": 2},
            "B": {"design": 3, "tech": 1},
            "C": {"social": 3, "business": 2},
            "D": {"tech": 3, "data": 1},
        }
    },
    {
        "question": "Как вы предпочитаете решать сложные задачи?",
        "type": "choice",
        "category": "personality",
        "display_order": 2,
        "options": [
            {"code": "A", "text": "Глубоко анализирую все детали и данные"},
            {"code": "B", "text": "Быстро создаю прототип и тестирую гипотезы"},
            {"code": "C", "text": "Обсуждаю с командой и ищем решение вместе"},
            {"code": "D", "text": "Ищу нестандартные креативные подходы"},
        ],
        "weights": {
            "A": {"data": 3, "tech": 2},
            "B": {"business": 2, "design": 2, "tech": 1},
            "C": {"social": 3, "business": 2},
            "D": {"design": 3, "business": 1},
        }
    },
    {
        "question": "Какой тип проектов вам интереснее?",
        "type": "choice",
        "category": "interests",
        "display_order": 3,
        "options": [
            {"code": "A", "text": "Долгосрочные исследовательские проекты"},
            {"code": "B", "text": "Быстрые итерации с видимым результатом"},
            {"code": "C", "text": "Работа с людьми и их потребностями"},
            {"code": "D", "text": "Оптимизация и улучшение существующих систем"},
        ],
        "weights": {
            "A": {"data": 3, "tech": 1},
            "B": {"design": 2, "tech": 2, "business": 1},
            "C": {"social": 3, "business": 2, "design": 1},
            "D": {"tech": 3, "data": 2},
        }
    },
    {
        "question": "Какая рабочая среда вам подходит больше?",
        "type": "choice",
        "category": "preferences",
        "display_order": 4,
        "options": [
            {"code": "A", "text": "Спокойная, где можно сконцентрироваться"},
            {"code": "B", "text": "Динамичная с постоянным общением"},
            {"code": "C", "text": "Креативная студия с свободной атмосферой"},
            {"code": "D", "text": "Структурированная с четкими процессами"},
        ],
        "weights": {
            "A": {"data": 2, "tech": 3},
            "B": {"social": 3, "business": 2},
            "C": {"design": 3, "business": 1},
            "D": {"tech": 2, "business": 2, "data": 1},
        }
    },
    {
        "question": "Что для вас важнее в карьере?",
        "type": "choice",
        "category": "values",
        "display_order": 5,
        "options": [
            {"code": "A", "text": "Высокая зарплата и финансовая стабильность"},
            {"code": "B", "text": "Влияние на людей и общество"},
            {"code": "C", "text": "Творческая свобода и самовыражение"},
            {"code": "D", "text": "Постоянное обучение и рост"},
        ],
        "weights": {
            "A": {"tech": 2, "business": 2, "data": 2},
            "B": {"social": 3, "business": 2, "design": 1},
            "C": {"design": 3, "social": 1},
            "D": {"data": 3, "tech": 2},
        }
    },
    {
        "question": "Как вы относитесь к написанию кода?",
        "type": "choice",
        "category": "skills",
        "display_order": 6,
        "options": [
            {"code": "A", "text": "Обожаю! Это мое призвание"},
            {"code": "B", "text": "Мне нравится, когда это нужно для проектов"},
            {"code": "C", "text": "Базовые знания есть, но не основной интерес"},
            {"code": "D", "text": "Предпочитаю работать без кода"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 2},
            "B": {"data": 2, "design": 1, "business": 1},
            "C": {"business": 2, "design": 1, "social": 1},
            "D": {"design": 2, "social": 2, "business": 1},
        }
    },
    {
        "question": "Ваш подход к работе с данными?",
        "type": "choice",
        "category": "skills",
        "display_order": 7,
        "options": [
            {"code": "A", "text": "Люблю глубокий статистический анализ"},
            {"code": "B", "text": "Визуализирую для принятия решений"},
            {"code": "C", "text": "Использую для улучшения продукта"},
            {"code": "D", "text": "Работаю с данными по необходимости"},
        ],
        "weights": {
            "A": {"data": 3, "tech": 1},
            "B": {"data": 2, "business": 2},
            "C": {"business": 2, "data": 1, "design": 1},
            "D": {"design": 1, "social": 2},
        }
    },
    {
        "question": "Как вы воспринимаете критику вашей работы?",
        "type": "choice",
        "category": "personality",
        "display_order": 8,
        "options": [
            {"code": "A", "text": "Как возможность для улучшения и обучения"},
            {"code": "B", "text": "Анализирую и применяю, если логично"},
            {"code": "C", "text": "Ценю конструктивную, защищаюсь от деструктивной"},
            {"code": "D", "text": "Стараюсь не принимать близко к сердцу"},
        ],
        "weights": {
            "A": {"business": 2, "data": 2, "tech": 1},
            "B": {"tech": 2, "data": 3},
            "C": {"design": 2, "social": 1},
            "D": {"social": 2, "design": 1},
        }
    },
    {
        "question": "Что вас больше привлекает в проекте?",
        "type": "choice",
        "category": "interests",
        "display_order": 9,
        "options": [
            {"code": "A", "text": "Техническая сложность и инновации"},
            {"code": "B", "text": "Визуальная красота и эстетика"},
            {"code": "C", "text": "Социальное влияние и польза"},
            {"code": "D", "text": "Бизнес-потенциал и масштаб"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 2},
            "B": {"design": 3},
            "C": {"social": 3, "business": 1},
            "D": {"business": 3, "data": 1},
        }
    },
    {
        "question": "Как вы предпочитаете учиться новому?",
        "type": "choice",
        "category": "preferences",
        "display_order": 10,
        "options": [
            {"code": "A", "text": "Читаю документацию и пробую на практике"},
            {"code": "B", "text": "Смотрю видео и повторяю за экспертами"},
            {"code": "C", "text": "Учусь у других людей через общение"},
            {"code": "D", "text": "Экспериментирую и учусь на ошибках"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 2},
            "B": {"design": 2, "business": 1},
            "C": {"social": 3, "business": 2},
            "D": {"design": 2, "tech": 2},
        }
    },
    {
        "question": "Что вас раздражает больше всего в работе?",
        "type": "choice",
        "category": "values",
        "display_order": 11,
        "options": [
            {"code": "A", "text": "Хаос и отсутствие структуры"},
            {"code": "B", "text": "Рутина и однообразие"},
            {"code": "C", "text": "Отсутствие общения и обратной связи"},
            {"code": "D", "text": "Ограничения творческой свободы"},
        ],
        "weights": {
            "A": {"tech": 2, "data": 3},
            "B": {"design": 2, "business": 2},
            "C": {"social": 3, "business": 1},
            "D": {"design": 3, "social": 1},
        }
    },
    {
        "question": "Какую роль вы чаще выбираете в команде?",
        "type": "choice",
        "category": "personality",
        "display_order": 12,
        "options": [
            {"code": "A", "text": "Исполнитель - делаю задачи качественно"},
            {"code": "B", "text": "Генератор идей - предлагаю новые подходы"},
            {"code": "C", "text": "Координатор - организую и объединяю"},
            {"code": "D", "text": "Аналитик - исследую и оцениваю"},
        ],
        "weights": {
            "A": {"tech": 3, "design": 1},
            "B": {"design": 3, "business": 2},
            "C": {"social": 3, "business": 2},
            "D": {"data": 3, "tech": 1},
        }
    },
    {
        "question": "Что вы делаете когда застряли на проблеме?",
        "type": "choice",
        "category": "personality",
        "display_order": 13,
        "options": [
            {"code": "A", "text": "Методично перебираю все возможные решения"},
            {"code": "B", "text": "Делаю перерыв и возвращаюсь с новой головой"},
            {"code": "C", "text": "Спрашиваю совета у коллег"},
            {"code": "D", "text": "Ищу информацию в интернете и документации"},
        ],
        "weights": {
            "A": {"tech": 2, "data": 3},
            "B": {"design": 3, "business": 1},
            "C": {"social": 3, "business": 2},
            "D": {"tech": 3, "data": 2},
        }
    },
    {
        "question": "Какой результат работы вас больше радует?",
        "type": "choice",
        "category": "values",
        "display_order": 14,
        "options": [
            {"code": "A", "text": "Работающая система без багов"},
            {"code": "B", "text": "Красивый дизайн, который впечатляет"},
            {"code": "C", "text": "Довольные пользователи и позитивные отзывы"},
            {"code": "D", "text": "Рост метрик и достижение целей"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 1},
            "B": {"design": 3},
            "C": {"social": 3, "design": 1},
            "D": {"business": 3, "data": 2},
        }
    },
    {
        "question": "Как вы относитесь к многозадачности?",
        "type": "choice",
        "category": "preferences",
        "display_order": 15,
        "options": [
            {"code": "A", "text": "Предпочитаю фокус на одной задаче"},
            {"code": "B", "text": "Комфортно переключаюсь между задачами"},
            {"code": "C", "text": "Люблю когда много всего происходит"},
            {"code": "D", "text": "Зависит от задач и настроения"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 2},
            "B": {"business": 2, "design": 2},
            "C": {"business": 3, "social": 2},
            "D": {"design": 1, "social": 1},
        }
    },
    {
        "question": "Что важнее при создании продукта?",
        "type": "choice",
        "category": "values",
        "display_order": 16,
        "options": [
            {"code": "A", "text": "Надежность и стабильность"},
            {"code": "B", "text": "Удобство и простота использования"},
            {"code": "C", "text": "Скорость выхода на рынок"},
            {"code": "D", "text": "Инновационность и уникальность"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 2},
            "B": {"design": 3, "social": 1},
            "C": {"business": 3, "tech": 1},
            "D": {"design": 2, "business": 2, "tech": 1},
        }
    },
    {
        "question": "Как вы принимаете решения?",
        "type": "choice",
        "category": "personality",
        "display_order": 17,
        "options": [
            {"code": "A", "text": "На основе данных и фактов"},
            {"code": "B", "text": "Интуитивно, опираясь на опыт"},
            {"code": "C", "text": "Советуюсь с другими людьми"},
            {"code": "D", "text": "Пробую разные варианты на практике"},
        ],
        "weights": {
            "A": {"data": 3, "tech": 2},
            "B": {"design": 2, "business": 2},
            "C": {"social": 3, "business": 1},
            "D": {"tech": 2, "design": 2},
        }
    },
    {
        "question": "Что вас мотивирует работать лучше?",
        "type": "choice",
        "category": "values",
        "display_order": 18,
        "options": [
            {"code": "A", "text": "Интересные технические челленджи"},
            {"code": "B", "text": "Возможность самовыражения"},
            {"code": "C", "text": "Признание и благодарность людей"},
            {"code": "D", "text": "Достижение амбициозных целей"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 2},
            "B": {"design": 3},
            "C": {"social": 3, "design": 1},
            "D": {"business": 3, "data": 1},
        }
    },
    {
        "question": "Какой feedback вы предпочитаете получать?",
        "type": "choice",
        "category": "preferences",
        "display_order": 19,
        "options": [
            {"code": "A", "text": "Конкретные метрики и измеримые результаты"},
            {"code": "B", "text": "Визуальные примеры и референсы"},
            {"code": "C", "text": "Эмоциональный отклик пользователей"},
            {"code": "D", "text": "Стратегические рекомендации"},
        ],
        "weights": {
            "A": {"data": 3, "tech": 2},
            "B": {"design": 3},
            "C": {"social": 3, "design": 1},
            "D": {"business": 3},
        }
    },
    {
        "question": "Как вы представляете свою карьеру через 5 лет?",
        "type": "choice",
        "category": "values",
        "display_order": 20,
        "options": [
            {"code": "A", "text": "Эксперт в своей технической области"},
            {"code": "B", "text": "Креативный директор или лид дизайнер"},
            {"code": "C", "text": "Руководитель команды или HR-лидер"},
            {"code": "D", "text": "Основатель стартапа или продакт-менеджер"},
        ],
        "weights": {
            "A": {"tech": 3, "data": 2},
            "B": {"design": 3},
            "C": {"social": 3, "business": 1},
            "D": {"business": 3},
        }
    },
]


def seed_questions(db: Session):
    """Добавляет вопросы в базу данных"""

    print("🔄 Очистка старых вопросов...")
    db.query(AssessmentQuestionModel).delete()
    db.commit()

    print(f"📝 Добавление {len(QUESTIONS_WITH_ANSWERS)} вопросов...")

    for q_data in QUESTIONS_WITH_ANSWERS:
        question = AssessmentQuestionModel(
            question=q_data["question"],
            type=q_data["type"],
            category=q_data["category"],
            display_order=q_data["display_order"],
            options=q_data["options"],
            weights=q_data["weights"],
            is_active=True
        )
        db.add(question)

    db.commit()
    print(f"✅ Успешно добавлено {len(QUESTIONS_WITH_ANSWERS)} вопросов!")

    # Проверка
    count = db.query(AssessmentQuestionModel).count()
    print(f"📊 Всего вопросов в базе: {count}")


def main():
    db = SessionLocal()
    try:
        seed_questions(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
