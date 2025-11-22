# 🤖 ML Architecture для Профориентации NaviQ

## 📋 Оглавление
1. [Общая архитектура](#общая-архитектура)
2. [Структура данных](#структура-данных)
3. [ML Pipeline](#ml-pipeline)
4. [Источники данных](#источники-данных)
5. [Обучение модели](#обучение-модели)
6. [Deployment](#deployment)

---

## 🏗️ Общая архитектура

### Компоненты системы:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────────┐        ┌──────────────────────┐         │
│  │ AssessmentNew  │───────▶│ CareerResultsModern  │         │
│  └────────────────┘        └──────────────────────┘         │
└───────────────────┬─────────────────────────────────────────┘
                    │ POST /api/assessment/submit
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend API (Python/Node)                │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │   Validation │────▶│  ML Service  │────▶│  Database   │ │
│  └──────────────┘     └──────────────┘     └─────────────┘ │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                       ML Model Service                       │
│  ┌────────────────┐     ┌──────────────────────┐           │
│  │  Feature Eng.  │────▶│  Classification Model │           │
│  └────────────────┘     └──────────────────────┘           │
│         │                         │                          │
│         ▼                         ▼                          │
│  ┌────────────────┐     ┌──────────────────────┐           │
│  │ Skills Radar   │     │  Career Matching     │           │
│  └────────────────┘     └──────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Структура данных

### 1. Входные данные (Frontend → Backend)

```typescript
// Структура одного ответа
interface UserAnswer {
  question_id: number;
  answer_id: string;
  answer_weight: number;  // Вес ответа (1-5)
  traits: string[];       // ['analytical', 'creative', 'leadership']
}

// Полная отправка
interface AssessmentSubmission {
  user_id: string;
  timestamp: Date;
  answers: UserAnswer[];
}
```

### 2. Структура вопросов (Database)

```json
{
  "questions": [
    {
      "id": 1,
      "text": "Как вы предпочитаете решать проблемы?",
      "category": "personality",
      "weight": 1.5,
      "answers": [
        {
          "id": "a1",
          "text": "Анализирую данные и факты",
          "weight": 5,
          "traits": ["analytical", "data_driven", "logical"],
          "career_scores": {
            "data_science": 0.9,
            "software_engineering": 0.7,
            "product_management": 0.5
          }
        },
        {
          "id": "a2",
          "text": "Ищу креативные и нестандартные решения",
          "weight": 4,
          "traits": ["creative", "innovative", "flexible"],
          "career_scores": {
            "ux_design": 0.9,
            "product_management": 0.8,
            "marketing": 0.7
          }
        }
      ]
    }
  ]
}
```

### 3. Выходные данные (Backend → Frontend)

```typescript
interface AssessmentResult {
  user_id: string;
  analysis_id: string;
  timestamp: Date;

  // Для радарной диаграммы
  skills_radar: Array<{
    skill: string;      // 'Аналитика', 'Коммуникация', ...
    value: number;      // 0-100
    confidence: number; // 0-1
  }>;

  // Карьерные направления
  career_matches: Array<{
    name: string;          // 'Data Science'
    match: number;         // 0-100
    color: string;         // '#7b61ff'
    description: string;
    skills_required: string[];
    reasons: string[];     // Почему подходит
  }>;

  // Метаданные
  potential_level: 'Высокий' | 'Средний' | 'Низкий';
  top_strength: string;
  confidence_score: number;  // 0-1

  // Рекомендации
  recommended_courses: Array<{
    title: string;
    platform: string;
    url: string;
    relevance: number;  // 0-1
  }>;

  // ML метаданные
  model_version: string;
  processing_time_ms: number;
}
```

---

## 🔬 ML Pipeline

### Этап 1: Feature Engineering

```python
# backend/ml/feature_engineering.py

def extract_features(answers: List[UserAnswer]) -> np.ndarray:
    """
    Преобразует ответы пользователя в feature vector
    """
    features = {
        # Trait-based features (агрегация по чертам)
        'analytical_score': 0,
        'creative_score': 0,
        'leadership_score': 0,
        'communication_score': 0,
        'technical_score': 0,

        # Category-based features (по категориям вопросов)
        'interests_vector': [],
        'skills_vector': [],
        'values_vector': [],
        'personality_vector': [],
        'preferences_vector': [],

        # Meta features
        'answer_consistency': 0,    # Согласованность ответов
        'response_time_avg': 0,      # Среднее время ответа
        'confidence_level': 0,       # Уверенность в ответах
    }

    # Вычисление trait scores
    trait_counts = {}
    for answer in answers:
        for trait in answer.traits:
            trait_counts[trait] = trait_counts.get(trait, 0) + answer.weight

    # Нормализация
    max_count = max(trait_counts.values()) if trait_counts else 1
    features['analytical_score'] = trait_counts.get('analytical', 0) / max_count
    features['creative_score'] = trait_counts.get('creative', 0) / max_count
    # ... остальные

    return np.array([list of all features])
```

### Этап 2: ML Model

**Рекомендуемый подход: Ensemble из нескольких моделей**

```python
# backend/ml/career_prediction.py

import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
import joblib

class CareerPredictionModel:
    def __init__(self):
        # Ensemble из трех моделей
        self.rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            random_state=42
        )

        self.gb_model = GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=8,
            random_state=42
        )

        self.nn_model = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42
        )

        self.weights = [0.4, 0.35, 0.25]  # Веса для ensemble

    def train(self, X_train, y_train):
        """Обучение всех моделей"""
        print("Training Random Forest...")
        self.rf_model.fit(X_train, y_train)

        print("Training Gradient Boosting...")
        self.gb_model.fit(X_train, y_train)

        print("Training Neural Network...")
        self.nn_model.fit(X_train, y_train)

    def predict_proba(self, X):
        """Предсказание вероятностей для каждой карьеры"""
        # Получаем предсказания от каждой модели
        rf_proba = self.rf_model.predict_proba(X)
        gb_proba = self.gb_model.predict_proba(X)
        nn_proba = self.nn_model.predict_proba(X)

        # Ensemble (weighted average)
        ensemble_proba = (
            self.weights[0] * rf_proba +
            self.weights[1] * gb_proba +
            self.weights[2] * nn_proba
        )

        return ensemble_proba

    def get_top_careers(self, X, top_k=3):
        """Возвращает топ-K карьер с вероятностями"""
        probas = self.predict_proba(X)
        top_indices = np.argsort(probas[0])[-top_k:][::-1]

        results = []
        for idx in top_indices:
            results.append({
                'career_id': idx,
                'probability': float(probas[0][idx]),
                'match_percentage': int(probas[0][idx] * 100)
            })

        return results
```

### Этап 3: Skills Radar Generation

```python
# backend/ml/skills_analyzer.py

def generate_skills_radar(answers: List[UserAnswer]) -> List[SkillScore]:
    """
    Генерирует данные для радарной диаграммы
    """
    # Определяем 5 ключевых навыков
    skill_categories = {
        'Аналитика': ['analytical', 'data_driven', 'logical'],
        'Коммуникация': ['communication', 'presentation', 'teamwork'],
        'Креативность': ['creative', 'innovative', 'design_thinking'],
        'Технические навыки': ['technical', 'programming', 'tools'],
        'Лидерство': ['leadership', 'management', 'strategic']
    }

    radar_data = []

    for skill_name, related_traits in skill_categories.items():
        # Подсчитываем score для каждого навыка
        total_score = 0
        trait_count = 0

        for answer in answers:
            for trait in answer.traits:
                if trait in related_traits:
                    total_score += answer.weight
                    trait_count += 1

        # Нормализация 0-100
        normalized_score = min(100, (total_score / max(1, trait_count)) * 20)

        radar_data.append({
            'skill': skill_name,
            'value': int(normalized_score),
            'confidence': min(1.0, trait_count / 5)  # Confidence based on data
        })

    return radar_data
```

---

## 📚 Источники данных

### 1. **Существующие датасеты (бесплатные)**

#### a) **O*NET Database** (США) 🇺🇸
- **URL**: https://www.onetcenter.org/database.html
- **Данные**: 900+ профессий с детальными характеристиками
- **Формат**: CSV, Excel
- **Что содержит**:
  - Навыки и умения для каждой профессии
  - Рабочие активности
  - Образовательные требования
  - Personality traits
- **Как использовать**:
  ```python
  # Скачать Skills.txt, Abilities.txt, Interests.txt
  # Маппинг между skills и careers
  ```

#### b) **Holland Code (RIASEC) Dataset**
- **Тип**: Психологическая модель карьерных интересов
- **6 категорий**: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
- **Источник**: https://www.careerkey.org/fit/personality/holland-personality-types
- **Как использовать**: Для создания базовых вопросов и маппинга

#### c) **Kaggle Career Datasets**
- **URL**: https://www.kaggle.com/datasets
- **Поиск**: "career recommendation", "job skills", "personality assessment"
- **Примеры**:
  - [Job Recommendation System Dataset](https://www.kaggle.com/datasets/ravindrasinghrana/job-description-dataset)
  - [Career Village Questions](https://www.kaggle.com/c/data-science-for-good-careervillage)

#### d) **LinkedIn Skills Dataset** (через API)
- **URL**: https://developer.linkedin.com/
- **Данные**: Связи между навыками и профессиями
- **Ограничения**: Требует аккредитации

### 2. **Создание собственного датасета**

#### Структура датасета для обучения:

```csv
# training_data.csv
user_id,question_id,answer_id,traits,career_outcome,satisfaction_score
user_001,1,a1,"analytical,logical",data_science,4.5
user_001,2,b2,"technical,programming",data_science,4.5
user_002,1,a3,"creative,design",ux_design,4.8
...
```

#### Методы сбора:

**A. Реальные пользователи (Ground Truth)**
```python
# После того как пользователь прошел тест
# И спустя 3-6 месяцев:
POST /api/feedback/career-outcome
{
  "assessment_id": "xxx",
  "actual_career": "data_science",
  "satisfaction": 4.5,  # 1-5
  "comments": "Рекомендация была точной"
}
```

**B. Экспертная разметка**
- Нанять HR-специалистов / карьерных консультантов
- Дать им 1000 синтетических профилей
- Попросить разметить оптимальные карьеры
- Используйте платформы: Toloka, Amazon MTurk

**C. Synthetic Data Generation**
```python
# Генерация синтетических данных для cold start
import numpy as np

def generate_synthetic_user(career: str):
    """Генерирует правдоподобный профиль для карьеры"""
    career_templates = {
        'data_science': {
            'analytical': (0.8, 0.1),  # mean, std
            'creative': (0.5, 0.2),
            'technical': (0.9, 0.05),
            'leadership': (0.4, 0.2),
        },
        # ... другие карьеры
    }

    template = career_templates[career]
    profile = {}

    for trait, (mean, std) in template.items():
        profile[trait] = np.clip(np.random.normal(mean, std), 0, 1)

    return profile
```

### 3. **Scraping (легальный)**

```python
# Сбор данных с публичных карьерных сайтов
import requests
from bs4 import BeautifulSoup

def scrape_career_skills(career_name):
    """
    Парсинг навыков с публичных источников
    """
    sources = [
        f"https://www.indeed.com/career/{career_name}",
        f"https://www.glassdoor.com/Career/{career_name}",
    ]

    skills = []
    # ... scraping logic
    return skills
```

**Легальные источники:**
- Indeed Career Explorer
- Glassdoor Career Paths
- Bureau of Labor Statistics (BLS)
- GitHub Jobs (RIP, но архив доступен)

---

## 🎓 Обучение модели

### 1. **Cold Start (минимум данных)**

Если у вас **< 100 реальных пользователей**:

```python
# Используйте Rule-Based подход с весами
class RuleBasedCareerRecommender:
    def __init__(self):
        self.career_rules = {
            'data_science': {
                'required_traits': {
                    'analytical': 0.7,
                    'technical': 0.8,
                    'logical': 0.6
                },
                'bonus_traits': {
                    'communication': 0.3,
                    'business_acumen': 0.2
                }
            },
            # ... другие карьеры
        }

    def score_career(self, user_profile, career):
        rules = self.career_rules[career]
        score = 0

        # Required traits (must have)
        for trait, weight in rules['required_traits'].items():
            if user_profile.get(trait, 0) >= weight:
                score += 30

        # Bonus traits
        for trait, weight in rules['bonus_traits'].items():
            score += user_profile.get(trait, 0) * weight * 20

        return min(100, score)
```

### 2. **With Limited Data (100-1000 примеров)**

Используйте **Transfer Learning** и **Pre-trained embeddings**:

```python
from sentence_transformers import SentenceTransformer

class TransferLearningCareerModel:
    def __init__(self):
        # Используем BERT для embeddings ответов
        self.encoder = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.classifier = RandomForestClassifier(n_estimators=100)

    def encode_answers(self, answers_text):
        """Преобразуем текстовые ответы в embeddings"""
        return self.encoder.encode(answers_text)

    def train(self, X_text, y_careers):
        X_embeddings = self.encode_answers(X_text)
        self.classifier.fit(X_embeddings, y_careers)
```

### 3. **With Sufficient Data (>1000 примеров)**

Используйте **Deep Learning**:

```python
import tensorflow as tf
from tensorflow import keras

def build_career_model(input_dim, num_careers):
    model = keras.Sequential([
        keras.layers.Dense(256, activation='relu', input_shape=(input_dim,)),
        keras.layers.Dropout(0.3),
        keras.layers.BatchNormalization(),

        keras.layers.Dense(128, activation='relu'),
        keras.layers.Dropout(0.3),
        keras.layers.BatchNormalization(),

        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.2),

        keras.layers.Dense(num_careers, activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_k_categorical_accuracy']
    )

    return model

# Training
model = build_career_model(input_dim=50, num_careers=20)
history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=100,
    batch_size=32,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5)
    ]
)
```

### 4. **Continuous Learning**

```python
# Обновление модели с новыми данными
class OnlineLearningCareerModel:
    def __init__(self, base_model):
        self.model = base_model
        self.buffer = []  # Буфер новых примеров

    def add_feedback(self, user_profile, actual_career, satisfaction):
        """Добавляем feedback от пользователей"""
        self.buffer.append({
            'profile': user_profile,
            'career': actual_career,
            'satisfaction': satisfaction
        })

        # Когда накопилось 100 примеров - переобучаем
        if len(self.buffer) >= 100:
            self.retrain()

    def retrain(self):
        """Инкрементальное обучение"""
        X_new = [item['profile'] for item in self.buffer]
        y_new = [item['career'] for item in self.buffer]

        # Partial fit (для SGD-based моделей)
        self.model.partial_fit(X_new, y_new)

        self.buffer = []
```

---

## 🚀 Deployment

### Backend Structure

```
backend/
├── ml/
│   ├── models/
│   │   ├── career_model_v1.pkl          # Trained model
│   │   ├── feature_scaler.pkl           # Scaler
│   │   └── label_encoder.pkl            # Career encoder
│   ├── feature_engineering.py
│   ├── career_prediction.py
│   ├── skills_analyzer.py
│   └── train.py                         # Training script
├── api/
│   └── assessment.py                    # FastAPI routes
├── data/
│   ├── questions.json                   # Вопросы
│   ├── careers.json                     # Карьеры
│   └── training_data.csv                # Training data
└── requirements.txt
```

### API Implementation (FastAPI)

```python
# backend/api/assessment.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load models
career_model = joblib.load('ml/models/career_model_v1.pkl')
scaler = joblib.load('ml/models/feature_scaler.pkl')

class AssessmentSubmission(BaseModel):
    user_id: str
    answers: List[dict]

@app.post("/api/assessment/submit")
async def submit_assessment(submission: AssessmentSubmission):
    try:
        # 1. Feature engineering
        features = extract_features(submission.answers)
        features_scaled = scaler.transform([features])

        # 2. Predict careers
        career_probas = career_model.predict_proba(features_scaled)[0]
        top_careers = get_top_k_careers(career_probas, k=3)

        # 3. Generate skills radar
        skills_radar = generate_skills_radar(submission.answers)

        # 4. Calculate potential level
        potential = calculate_potential_level(career_probas, skills_radar)

        # 5. Get recommendations
        courses = get_recommended_courses(top_careers[0]['career_id'])

        # 6. Build response
        result = {
            'user_id': submission.user_id,
            'analysis_id': generate_id(),
            'timestamp': datetime.now(),
            'skills_radar': skills_radar,
            'career_matches': top_careers,
            'potential_level': potential,
            'top_strength': skills_radar[0]['skill'],
            'recommended_courses': courses,
            'model_version': 'v1.0.0'
        }

        # 7. Save to database
        await save_assessment_result(result)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📈 Метрики качества

### 1. **Offline Metrics** (на валидационной выборке)

```python
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)

    metrics = {
        # Точность топ-1
        'top1_accuracy': accuracy_score(y_test, y_pred),

        # Точность топ-3 (пользователь доволен если правильная карьера в топ-3)
        'top3_accuracy': top_k_accuracy(y_test, model.predict_proba(X_test), k=3),

        # Precision, Recall, F1 для каждой карьеры
        'precision': precision_recall_fscore_support(y_test, y_pred, average='weighted')[0],
        'recall': precision_recall_fscore_support(y_test, y_pred, average='weighted')[1],
        'f1_score': precision_recall_fscore_support(y_test, y_pred, average='weighted')[2],
    }

    return metrics
```

### 2. **Online Metrics** (в продакшене)

```python
# Отслеживайте:
metrics = {
    'user_satisfaction': 4.2,  # Средняя оценка 1-5
    'conversion_to_simulation': 0.65,  # % пользователей, кто начал симуляцию
    'career_change_rate': 0.15,  # % кто сменил карьеру через 6 мес
    'recommendation_diversity': 0.8,  # Разнообразие рекомендаций
}
```

---

## 🎯 Roadmap

### Phase 1: MVP (1-2 месяца)
- ✅ Создать 20-30 качественных вопросов
- ✅ Rule-based система рекомендаций
- ✅ Базовая визуализация (radar chart)
- 📊 Собрать 100+ реальных откликов

### Phase 2: ML v1 (2-3 месяца)
- 🤖 Обучить первую ML модель (Random Forest)
- 📈 A/B тест: Rule-based vs ML
- 🔄 Continuous data collection
- 📊 Достичь 500+ размеченных примеров

### Phase 3: Deep Learning (3-6 месяцев)
- 🧠 Neural network модель
- 🎨 Personalized skill development plans
- 🌐 Multi-modal данные (резюме, проекты)
- 📊 10,000+ примеров

### Phase 4: Advanced (6-12 месяцев)
- 🤝 Collaborative filtering (похожие пользователи)
- 📚 Integration с курсами и вакансиями
- 🎯 Longitudinal tracking (отслеживание карьеры)
- 🌍 Международные датасеты

---

## 💡 Best Practices

1. **Start Simple**: Rule-based → ML → Deep Learning
2. **Measure Everything**: Логируйте все взаимодействия
3. **User Feedback is Gold**: Главный источник ground truth
4. **Diversity > Accuracy**: Лучше 3 разных варианта, чем 3 одинаковых
5. **Explainability**: Всегда объясняйте "почему эта карьера"
6. **Privacy**: Анонимизируйте данные, соблюдайте GDPR

---

## 📞 Контакты и ресурсы

**Полезные библиотеки:**
- scikit-learn: https://scikit-learn.org/
- TensorFlow: https://www.tensorflow.org/
- PyTorch: https://pytorch.org/
- Sentence-Transformers: https://www.sbert.net/

**Курсы:**
- Coursera: "Recommender Systems"
- Fast.ai: "Practical Deep Learning"
- Andrew Ng: "Machine Learning Specialization"

**Сообщества:**
- r/MachineLearning
- Kaggle Forums
- ML Papers with Code
