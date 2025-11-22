"""
Скрипт для обучения ML модели профориентации на реальных открытых данных

Использует:
1. Синтетические данные на основе реальных паттернов
2. Holland Code (RIASEC) модель
3. Данные из O*NET (можно добавить позже)

Запуск:
    python -m app.ml.train_model
"""

import sys
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict
import pickle

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from career_ml import N_QUESTIONS, TRACKS, encode_answers

# =============== HOLLAND CODE (RIASEC) PATTERNS ===============
# Реальная психологическая модель карьерных интересов

HOLLAND_PATTERNS = {
    "design": {
        "riasec": "Artistic",  # Артистический тип
        "typical_answers": {
            # Вопросы про интересы (1-5)
            0: ["B", "C"],  # Креативность
            1: ["C", "D"],  # Визуал
            2: ["B", "C"],  # Эстетика
            3: ["C"],       # Дизайн
            4: ["B", "C"],  # Искусство
            # Вопросы про навыки (6-10)
            5: ["C", "D"],  # Визуальные навыки
            6: ["B", "C"],  # Креативное мышление
            7: ["C"],       # Прототипирование
            8: ["B", "C"],  # Композиция
            9: ["C", "D"],  # Figma/инструменты
            # Вопросы про ценности (11-15)
            10: ["B", "C"], # Творческая свобода
            11: ["C"],      # Самовыражение
            12: ["B", "C"], # Красота
            13: ["C", "D"], # Пользовательский опыт
            14: ["B"],      # Инновации
            # Вопросы про личность (16-20)
            15: ["B", "C"], # Интуитивность
            16: ["C"],      # Внимание к деталям
            17: ["B", "C"], # Эмпатия
            18: ["C", "D"], # Открытость
            19: ["B", "C"], # Гибкость
        },
        "weight": 1.0
    },

    "tech": {
        "riasec": "Investigative + Realistic",
        "typical_answers": {
            0: ["A", "B"],  # Логика
            1: ["A"],       # Системность
            2: ["A", "B"],  # Технологии
            3: ["A", "B"],  # Код
            4: ["A"],       # Алгоритмы
            5: ["A", "B"],  # Программирование
            6: ["A"],       # Архитектура
            7: ["A", "B"],  # Оптимизация
            8: ["A"],       # Тестирование
            9: ["A", "B"],  # Инфраструктура
            10: ["A", "D"], # Стабильность
            11: ["A"],      # Точность
            12: ["A", "B"], # Эффективность
            13: ["A"],      # Масштабируемость
            14: ["A", "B"], # Надежность
            15: ["A", "B"], # Аналитика
            16: ["A"],      # Внимательность
            17: ["B"],      # Независимость
            18: ["A", "B"], # Любознательность
            19: ["A"],      # Систематичность
        },
        "weight": 1.0
    },

    "business": {
        "riasec": "Enterprising + Social",
        "typical_answers": {
            0: ["C", "D"],  # Стратегия
            1: ["D"],       # Влияние
            2: ["C", "D"],  # Рынок
            3: ["D"],       # Бизнес
            4: ["C", "D"],  # Продажи
            5: ["D"],       # Коммуникация
            6: ["C", "D"],  # Презентации
            7: ["D"],       # Переговоры
            8: ["C", "D"],  # Лидерство
            9: ["D"],       # Управление
            10: ["C", "D"], # Рост
            11: ["D"],      # Амбиции
            12: ["C", "D"], # Влияние
            13: ["D"],      # Результат
            14: ["C", "D"], # Достижения
            15: ["D"],      # Экстраверсия
            16: ["C", "D"], # Уверенность
            17: ["D"],      # Убедительность
            18: ["C", "D"], # Энергичность
            19: ["D"],      # Целеустремленность
        },
        "weight": 1.0
    },

    "data": {
        "riasec": "Investigative + Conventional",
        "typical_answers": {
            0: ["A", "B"],  # Анализ
            1: ["A"],       # Данные
            2: ["A", "B"],  # Статистика
            3: ["A"],       # Числа
            4: ["A", "B"],  # Исследования
            5: ["A"],       # SQL/Python
            6: ["A", "B"],  # Визуализация
            7: ["A"],       # Эксперименты
            8: ["A", "B"],  # Метрики
            9: ["A"],       # BI-инструменты
            10: ["A", "B"], # Точность
            11: ["A"],      # Объективность
            12: ["A", "B"], # Доказательства
            13: ["A"],      # Факты
            14: ["A", "B"], # Измеримость
            15: ["A"],      # Аналитичность
            16: ["A", "B"], # Критичность
            17: ["A"],      # Скептицизм
            18: ["A", "B"], # Любознательность
            19: ["A"],      # Методичность
        },
        "weight": 1.0
    },

    "social": {
        "riasec": "Social",
        "typical_answers": {
            0: ["C", "D"],  # Люди
            1: ["D"],       # Команда
            2: ["C", "D"],  # Общение
            3: ["D"],       # Помощь
            4: ["C", "D"],  # Обучение
            5: ["D"],       # Фасилитация
            6: ["C", "D"],  # Эмпатия
            7: ["D"],       # Организация
            8: ["C", "D"],  # Мотивация
            9: ["D"],       # Менторство
            10: ["C", "D"], # Социальный вклад
            11: ["D"],      # Взаимоотношения
            12: ["C", "D"], # Гармония
            13: ["D"],      # Понимание
            14: ["C", "D"], # Сотрудничество
            15: ["D"],      # Доброта
            16: ["C", "D"], # Терпение
            17: ["D"],      # Активное слушание
            18: ["C", "D"], # Открытость
            19: ["D"],      # Гибкость
        },
        "weight": 1.0
    }
}


def generate_realistic_answer(question_idx: int, track: str, noise_level: float = 0.2) -> str:
    """
    Генерирует реалистичный ответ на основе RIASEC паттернов

    Args:
        question_idx: индекс вопроса (0-19)
        track: трек карьеры
        noise_level: уровень шума (0.0 - 1.0)
    """
    pattern = HOLLAND_PATTERNS[track]
    typical_answers = pattern["typical_answers"].get(question_idx, ["A", "B", "C", "D"])

    # С вероятностью (1 - noise_level) выбираем типичный ответ
    if np.random.rand() > noise_level:
        return np.random.choice(typical_answers)
    else:
        # Иначе случайный ответ
        return np.random.choice(["A", "B", "C", "D"])


def generate_synthetic_dataset(n_samples: int = 1000, noise_level: float = 0.2) -> Tuple[List[List[str]], List[str]]:
    """
    Генерирует синтетический датасет на основе RIASEC паттернов

    Returns:
        (answers, tracks) - списки ответов и треков
    """
    answers_list = []
    tracks_list = []

    # Распределение треков (realistic distribution)
    track_distribution = {
        "tech": 0.30,      # 30% - самый популярный
        "business": 0.25,   # 25%
        "design": 0.20,     # 20%
        "data": 0.15,       # 15%
        "social": 0.10,     # 10%
    }

    for _ in range(n_samples):
        # Выбираем трек согласно распределению
        track = np.random.choice(
            list(track_distribution.keys()),
            p=list(track_distribution.values())
        )

        # Генерируем ответы для этого трека
        answers = [generate_realistic_answer(i, track, noise_level) for i in range(N_QUESTIONS)]

        answers_list.append(answers)
        tracks_list.append(track)

    return answers_list, tracks_list


def add_cross_track_samples(answers_list: List[List[str]], tracks_list: List[str], n_samples: int = 200):
    """
    Добавляет "пограничные" примеры - людей с интересами в нескольких областях
    """
    track_pairs = [
        ("tech", "data", 0.3),      # Tech + Data (ML engineers)
        ("design", "tech", 0.2),    # Design + Tech (Frontend)
        ("business", "tech", 0.2),  # Business + Tech (Product managers)
        ("business", "social", 0.15), # Business + Social (HR, Sales)
        ("design", "social", 0.15),  # Design + Social (UX researchers)
    ]

    for track1, track2, ratio in track_pairs:
        n = int(n_samples * ratio)
        for _ in range(n):
            answers = []
            # 50/50 смесь ответов из двух треков
            primary_track = track1 if np.random.rand() > 0.5 else track2

            for i in range(N_QUESTIONS):
                if np.random.rand() > 0.5:
                    answer = generate_realistic_answer(i, track1, noise_level=0.3)
                else:
                    answer = generate_realistic_answer(i, track2, noise_level=0.3)
                answers.append(answer)

            answers_list.append(answers)
            tracks_list.append(primary_track)

    return answers_list, tracks_list


def train_model_on_synthetic_data(n_samples: int = 2000):
    """
    Обучает модель на синтетических данных
    """
    print("🔄 Генерация синтетического датасета...")
    print(f"   Размер: {n_samples} примеров")

    # Генерируем основной датасет
    answers_list, tracks_list = generate_synthetic_dataset(n_samples=n_samples, noise_level=0.15)

    # Добавляем "пограничные" примеры
    print("🔄 Добавление пограничных примеров...")
    answers_list, tracks_list = add_cross_track_samples(answers_list, tracks_list, n_samples=400)

    print(f"   Итоговый размер: {len(answers_list)} примеров")

    # Распределение по трекам
    from collections import Counter
    distribution = Counter(tracks_list)
    print("\n📊 Распределение по трекам:")
    for track, count in distribution.most_common():
        percentage = (count / len(tracks_list)) * 100
        print(f"   {track:10s}: {count:4d} ({percentage:.1f}%)")

    # Кодируем данные
    print("\n🔄 Кодирование данных...")
    X = np.vstack([encode_answers(answers) for answers in answers_list])
    y = np.array([TRACKS.index(track) for track in tracks_list])

    # Разделяем на train/test
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

    # Обучаем модель
    print("\n🤖 Обучение ML модели...")
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, classification_report

    # Попробуем Random Forest
    model_rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model_rf.fit(X_train, y_train)

    # Оценка
    y_pred_train = model_rf.predict(X_train)
    y_pred_test = model_rf.predict(X_test)

    train_acc = accuracy_score(y_train, y_pred_train)
    test_acc = accuracy_score(y_test, y_pred_test)

    print(f"\n✅ Random Forest обучен!")
    print(f"   Train accuracy: {train_acc:.2%}")
    print(f"   Test accuracy:  {test_acc:.2%}")

    # Попробуем Logistic Regression для сравнения
    model_lr = LogisticRegression(max_iter=1000, random_state=42)
    model_lr.fit(X_train, y_train)

    y_pred_lr = model_lr.predict(X_test)
    lr_acc = accuracy_score(y_test, y_pred_lr)

    print(f"\n✅ Logistic Regression обучен!")
    print(f"   Test accuracy:  {lr_acc:.2%}")

    # Выбираем лучшую модель
    if test_acc >= lr_acc:
        best_model = model_rf
        model_name = "RandomForest"
        best_acc = test_acc
    else:
        best_model = model_lr
        model_name = "LogisticRegression"
        best_acc = lr_acc

    print(f"\n🏆 Лучшая модель: {model_name} (accuracy: {best_acc:.2%})")

    # Classification report
    print("\n📊 Classification Report:")
    print(classification_report(
        y_test,
        best_model.predict(X_test),
        target_names=TRACKS,
        digits=3
    ))

    # Feature importance (для RandomForest)
    if model_name == "RandomForest":
        print("\n📈 Top-10 важных вопросов:")
        importances = model_rf.feature_importances_
        top_indices = np.argsort(importances)[::-1][:10]
        for idx in top_indices:
            print(f"   Вопрос {idx + 1:2d}: {importances[idx]:.3f}")

    # Сохраняем модель
    model_path = Path(__file__).parent / "career_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(best_model, f)
    print(f"\n💾 Модель сохранена: {model_path}")

    # Сохраняем метаданные
    metadata = {
        "model_type": model_name,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "train_accuracy": float(train_acc) if model_name == "RandomForest" else None,
        "test_accuracy": float(best_acc),
        "tracks": TRACKS,
        "n_questions": N_QUESTIONS,
        "track_distribution": dict(distribution),
    }

    metadata_path = Path(__file__).parent / "model_metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"💾 Метаданные сохранены: {metadata_path}")

    return best_model, metadata


def test_model(model):
    """
    Тестирует обученную модель на примерах
    """
    print("\n🧪 Тестирование модели на примерах...\n")

    test_cases = [
        {
            "name": "Дизайнер",
            "answers": ["C"] * 10 + ["B"] * 5 + ["C"] * 5,
            "expected": "design"
        },
        {
            "name": "Программист",
            "answers": ["A"] * 15 + ["B"] * 5,
            "expected": "tech"
        },
        {
            "name": "Бизнесмен",
            "answers": ["D"] * 12 + ["C"] * 8,
            "expected": "business"
        },
        {
            "name": "Аналитик данных",
            "answers": ["A"] * 16 + ["B"] * 4,
            "expected": "data"
        },
        {
            "name": "HR/Коммуникатор",
            "answers": ["D"] * 14 + ["C"] * 6,
            "expected": "social"
        }
    ]

    for case in test_cases:
        X = encode_answers(case["answers"]).reshape(1, -1)
        probs = model.predict_proba(X)[0]
        predicted_idx = np.argmax(probs)
        predicted_track = TRACKS[predicted_idx]

        is_correct = "✅" if predicted_track == case["expected"] else "❌"

        print(f"{is_correct} {case['name']}:")
        print(f"   Ожидалось: {case['expected']}")
        print(f"   Предсказано: {predicted_track} ({probs[predicted_idx]:.1%})")

        # Top-3
        top3_indices = np.argsort(probs)[::-1][:3]
        print(f"   Top-3:")
        for idx in top3_indices:
            print(f"      {TRACKS[idx]:10s}: {probs[idx]:.1%}")
        print()


def main():
    """
    Главная функция
    """
    print("=" * 60)
    print("🚀 Обучение ML модели для профориентации NaviQ")
    print("=" * 60)
    print()

    # Обучаем на синтетических данных
    model, metadata = train_model_on_synthetic_data(n_samples=2000)

    # Тестируем
    test_model(model)

    print("=" * 60)
    print("✅ Обучение завершено!")
    print("=" * 60)
    print()
    print("📌 Следующие шаги:")
    print("   1. Модель сохранена в app/ml/career_model.pkl")
    print("   2. Интегрируйте её в career_ml.py")
    print("   3. Соберите реальные данные от пользователей")
    print("   4. Переобучите модель через 100+ реальных ответов")
    print()


if __name__ == "__main__":
    main()
