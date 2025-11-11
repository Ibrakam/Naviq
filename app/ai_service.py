from __future__ import annotations

from collections import defaultdict
from typing import Dict, List, Optional, Sequence, Tuple

from sqlalchemy.orm import Session

from app.models import AssessmentQuestionModel, AssessmentSession
from app.schemas import (
    AssessmentQuestion as AssessmentQuestionSchema,
    AssessmentChatQuestion,
    AssessmentResult,
)
from app.services.assessment_questions_data import ASSESSMENT_QUESTIONS
from career_ml import N_QUESTIONS, TRACKS, predict_track, train_with_real_data


TRACK_DETAILS: Dict[str, Dict[str, Sequence[str]]] = {
    "design": {
        "name": "Product & UX Design",
        "description": "Ты замечаешь сценарии пользователей и хочешь сделать продукты удобнее.",
        "skills": ["UX research", "UI композиция", "Figma", "Прототипирование"],
        "reason": "Ты выбираешь ответы про визуал, сценарии и пользовательский опыт.",
        "plan": [
            "Разбери 2 любимых приложения и опиши их пользовательские сценарии.",
            "Перерисуй один экран в Figma и покажи другу для обратной связи.",
            "Собери интервью с одноклассником о том, что ему неудобно в учебных сервисах.",
            "Создай кликабельный прототип из 3–4 экранов.",
            "Собери чек-лист визуальных паттернов, которые тебе нравятся.",
            "Пройди тест на контраст и читаемость, исправь ошибки.",
            "Подготовь короткий питч решения и выложи в Telegram/Behance.",
        ],
        "courses": [
            {"name": "UX/UI Design Fundamentals", "platform": "Coursera"},
            {"name": "Product Design в Figma", "platform": "Yandex Practicum"},
        ],
        "recommendations": [
            "Веди визуальный дневник идей",
            "Говори с пользователями и проверяй гипотезы интервью",
            "Добавь проекты в портфолио (Behance/Notion)",
        ],
    },
    "tech": {
        "name": "Full-Stack Engineering",
        "description": "Тебя драйвит построение работающих прототипов и сложной логики.",
        "skills": ["Python/JS", "API", "Архитектура", "CI/CD"],
        "reason": "Ты чаще выбираешь варианты про скорость, стабильность и код.",
        "plan": [
            "Настрой локальное окружение и собери pet-проект на FastAPI/Next.js.",
            "Подними базу данных и сохрани первые данные.",
            "Напиши тесты на критичные функции.",
            "Оптимизируй узкие места (кеш, профилирование).",
            "Наведи порядок в repo: линтеры, README, CI.",
            "Сделай деплой на Render/Vercel.",
            "Подготовь демо и попроси фидбек у ментора.",
        ],
        "courses": [
            {"name": "Full-Stack Web Development", "platform": "freeCodeCamp"},
            {"name": "FastAPI + React", "platform": "Udemy"},
        ],
        "recommendations": [
            "Поддерживай Git-историю и code review",
            "Копи задачки с хакатонов в портфолио",
            "Следи за новыми инструментами (Bun, Deno, Pydantic v2)",
        ],
    },
    "business": {
        "name": "Product & Business Strategy",
        "description": "Ты думаешь категориями рынка, клиентов и результатов.",
        "skills": ["JTBD", "Unit-экономика", "Go-to-market", "Pitching"],
        "reason": "Ты выбираешь ответы про стратегию, дедлайны и влияние на людей.",
        "plan": [
            "Сделай карту стейкхолдеров выбранного продукта.",
            "Опиши идеального пользователя и его путь.",
            "Собери гипотезы роста и оцени их по ICE.",
            "Проанализируй конкурентов, найди 3 инсайта.",
            "Подготовь презентацию с unit-экономикой.",
            "Придумай кампанию запуска и канал привлечения.",
            "Собери ретроспективу: что получилось, что улучшить.",
        ],
        "courses": [
            {"name": "Product Strategy", "platform": "Reforge"},
            {"name": "Go-to-Market Essentials", "platform": "Coursera"},
        ],
        "recommendations": [
            "Используй доску гипотез и метрики результата",
            "Развивай публичные выступления",
            "Документируй процессы в Notion/Confluence",
        ],
            },
            "data": {
        "name": "Data & Analytics",
        "description": "Тебе важно принимать решения на основе чисел и экспериментов.",
        "skills": ["SQL", "Python", "BI", "A/B testing"],
        "reason": "Ты постоянно смотришь на цифры, отчёты и аналитические инструменты.",
        "plan": [
            "Собери датасет из открытых источников и очисти его.",
            "Построй первые запросы в SQL и визуализации.",
            "Сделай исследование когорты пользователей и сформулируй выводы.",
            "Проведи A/B тест (даже мысленный) и рассчитай эффект.",
            "Настрой автоматический отчёт (Google Data Studio/Metabase).",
            "Освой статистические тесты и интерпретацию.",
            "Сформируй презентацию инсайтов для команды.",
        ],
        "courses": [
            {"name": "Data Analytics with Python", "platform": "Coursera"},
            {"name": "SQL + BI Analyst", "platform": "Karpov.Courses"},
        ],
        "recommendations": [
            "Пиши Summary к каждому исследованию",
            "Поддерживай документацию по метрикам",
            "Прокачивай Python и статистику",
        ],
    },
    "social": {
        "name": "People & Communication",
        "description": "Ты мотивируешь людей, строишь процессы и следишь за атмосферой.",
        "skills": ["Коммуникация", "Фасилитация", "Организация процессов", "Менторство"],
        "reason": "Ты часто выбираешь ответы про коммуникацию, помощь и объяснение другим.",
        "plan": [
            "Проведи 1:1 беседы с участниками команды.",
            "Пропиши правила взаимодействия и каналы связи.",
            "Организуй воркшоп по болям пользователей.",
            "Настрой доску задач и прозрачные статусы.",
            "Подготовь фидбек-сессию и фасилитируй её.",
            "Опиши план развития каждого участника.",
            "Расскажи о прогрессе проекту/клиенту.",
        ],
        "courses": [
            {"name": "Communication for Leaders", "platform": "Coursera"},
            {"name": "Facilitation Basics", "platform": "Skillbox"},
        ],
        "recommendations": [
            "Практикуй активное слушание",
            "Фиксируй договорённости письменно",
            "Измеряй вовлечённость и проводи ретроспективы",
        ],
    },
}

TEXT_KEYWORDS: Dict[str, Sequence[str]] = {
    "design": (
        "design",
        "дизайн",
        "ui",
        "ux",
        "интерф",
        "визуал",
        "figma",
        "прототип",
        "красив",
        "анимац",
    ),
    "tech": (
        "code",
        "код",
        "python",
        "javascript",
        "js",
        "бот",
        "backend",
        "frontend",
        "инжен",
        "api",
        "deploy",
        "инфра",
    ),
    "business": (
        "market",
        "рынок",
        "бизнес",
        "unit",
        "маркетинг",
        "продаж",
        "стратег",
        "go-to",
        "pitch",
        "коммерц",
    ),
    "data": (
        "data",
        "данн",
        "аналит",
        "цифр",
        "таблиц",
        "excel",
        "sql",
        "metrics",
        "dashboard",
        "отчет",
    ),
    "social": (
        "team",
        "команд",
        "люд",
        "общен",
        "лидер",
        "организ",
        "мотив",
        "ментор",
        "support",
        "community",
    ),
}


class AIAssessmentService:
    """Rule-based + ML hybrid assessment service backed by DB-stored questions."""

    MIN_RECORDS_FOR_TRAINING = 30

    def generate_assessment_questions(self, db: Session) -> List[AssessmentQuestionSchema]:
        """Return questionnaire, seeding it first if DB is empty."""
        questions = self._ordered_questions(db)
        return [
            AssessmentQuestionSchema(
                id=q.id,
                question=q.question,
                type=q.type or "choice",
                options=q.options or [],
                category=q.category,
                required=True,
            )
            for q in questions
        ]

    def generate_chat_questions(self, db: Session) -> List[AssessmentChatQuestion]:
        """Return chat-friendly question payload."""
        questions = self._ordered_questions(db)
        chat_payload: List[AssessmentChatQuestion] = []
        for idx, question in enumerate(questions):
            chat_payload.append(
                AssessmentChatQuestion(
                    id=question.id,
                    role=question.role or "assistant",
                    question_text=question.question,
                    type=question.type or "choice",
                    options=question.options or [],
                    category=question.category,
                    order=question.display_order or (idx + 1),
                )
            )
        return chat_payload

    def get_ordered_question_models(self, db: Session) -> List[AssessmentQuestionModel]:
        """Expose ordered question models for router logic."""
        return self._ordered_questions(db)

    def analyze_assessment_results(
        self,
        answers: Dict[int, str],
        db: Session,
    ) -> Tuple[AssessmentResult, List[str]]:
        """Score answers with track weights + ML model."""
        self._ensure_questions_seeded(db)
        question_models = (
            db.query(AssessmentQuestionModel)
            .filter(AssessmentQuestionModel.is_active.is_(True))
            .order_by(AssessmentQuestionModel.id)
            .all()
        )

        normalized_answers = {
            int(q_id): str(answer).strip().upper()
            for q_id, answer in answers.items()
        }

        track_scores = self._calculate_track_scores(normalized_answers, question_models)
        answer_row = self._answers_to_row(normalized_answers)
        ml_result = self._predict_with_model(answer_row)
        combined_scores = self._combine_scores(track_scores, ml_result)
        result = self._build_result(combined_scores, track_scores, ml_result)
        return result, answer_row

    def analyze_chat_session(
        self,
        messages: Sequence[Dict[str, object]],
        questions: Sequence[AssessmentQuestionModel],
    ) -> AssessmentResult:
        question_map = {question.id: question for question in questions}
        normalized_answers: Dict[int, str] = {}
        track_scores = defaultdict(float)
        for track in TRACKS:
            track_scores[track] = 0.0

        for message in messages:
            if not isinstance(message, dict):
                continue
            if message.get("role") != "user":
                continue
            question_id = message.get("question_id")
            if not question_id:
                continue
            question = question_map.get(int(question_id))
            if not question:
                continue

            raw_answer = message.get("answer_value") or message.get("content")
            if raw_answer is None:
                continue
            answer_text = str(raw_answer).strip()
            if not answer_text:
                continue

            q_type = (question.type or "choice").lower()
            if q_type == "text":
                for track, value in self._score_text_answer(answer_text).items():
                    track_scores[track] += value
            else:
                normalized = answer_text.upper()
                normalized_answers[int(question.id)] = normalized
                option_weights = (question.weights or {}).get(normalized, {})
                for track, value in option_weights.items():
                    track_scores[track] += value

        answer_row = self._answers_to_row(normalized_answers)
        ml_result = self._predict_with_model(answer_row)
        combined_scores = self._combine_scores(track_scores, ml_result)
        return self._build_result(combined_scores, track_scores, ml_result)

    def maybe_retrain_model(self, db: Session) -> bool:
        """Train ML модель, когда накапливается достаточно реальных сессий."""
        sessions = (
            db.query(AssessmentSession)
            .filter(AssessmentSession.status == "completed")
            .all()
        )
        answer_rows: List[List[str]] = []
        labels: List[str] = []

        for session in sessions:
            session_answers = session.answers or {}
            result_payload = session.result or {}
            track = result_payload.get("primary_track")
            if track not in TRACKS:
                continue
            row = self._answers_to_row(
                {int(k): v for k, v in session_answers.items()}
            )
            if len(row) != N_QUESTIONS:
                continue
            answer_rows.append(row)
            labels.append(track)

        if len(answer_rows) < self.MIN_RECORDS_FOR_TRAINING:
            return False

        try:
            train_with_real_data(answer_rows, labels)
        except ValueError:
            return False
        return True

    # Helpers
    def _ordered_questions(self, db: Session) -> List[AssessmentQuestionModel]:
        self._ensure_questions_seeded(db)
        questions = (
            db.query(AssessmentQuestionModel)
            .filter(AssessmentQuestionModel.is_active.is_(True))
            .all()
        )
        return sorted(
            questions,
            key=lambda item: ((item.display_order or item.id), item.id),
        )

    def _ensure_questions_seeded(self, db: Session) -> None:
        AssessmentQuestionModel.__table__.create(bind=db.get_bind(), checkfirst=True)
        for question in ASSESSMENT_QUESTIONS:
            existing = db.query(AssessmentQuestionModel).filter(
                AssessmentQuestionModel.id == question["id"]
            ).first()
            payload = {
                "question": question["question"],
                "type": question["type"],
                "role": question["role"],
                "category": question.get("category"),
                "display_order": question.get("order"),
                "options": question["options"],
                "weights": question["weights"],
            }
            if existing:
                for field, value in payload.items():
                    setattr(existing, field, value)
            else:
                db.add(AssessmentQuestionModel(id=question["id"], **payload))
        db.commit()

    def _calculate_track_scores(
        self,
        answers: Dict[int, str],
        questions: List[AssessmentQuestionModel],
    ) -> Dict[str, float]:
        scores = defaultdict(float)
        for track in TRACKS:
            scores[track] = 0.0

        for question in questions:
            selected = answers.get(question.id)
            if not selected:
                continue
            option_weights = question.weights.get(selected.upper(), {})
            for track, value in option_weights.items():
                if track in scores:
                    scores[track] += value
        return scores

    def _score_text_answer(self, answer: str) -> Dict[str, float]:
        normalized = answer.lower()
        scores = defaultdict(float)
        for track in TRACKS:
            scores[track] = 0.0

        for track, keywords in TEXT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in normalized:
                    scores[track] += 1.0

        if not any(value > 0 for value in scores.values()):
            # Лёгкий сдвиг в гуманитарные направления, если ключевых слов нет
            scores["social"] += 0.5
            scores["business"] += 0.5
        return scores

    def _answers_to_row(self, answers: Dict[int, str]) -> List[str]:
        row: List[str] = []
        for question_id in range(1, N_QUESTIONS + 1):
            value = answers.get(question_id, "A") or "A"
            row.append(str(value).upper())
        return row

    def _predict_with_model(self, answer_row: List[str]) -> Optional[Dict[str, object]]:
        if len(answer_row) != N_QUESTIONS:
            return None
        try:
            return predict_track(answer_row)
        except Exception:
            return None

    def _combine_scores(
        self,
        rule_scores: Dict[str, float],
        ml_result: Optional[Dict[str, object]],
    ) -> List[Tuple[str, float]]:
        if not rule_scores:
            return []
        max_rule = max(rule_scores.values()) or 1.0
        normalized_rule = {k: (v / max_rule) for k, v in rule_scores.items()}

        if ml_result and "probabilities" in ml_result:
            ml_probs = ml_result["probabilities"]  # type: ignore[assignment]
        else:
            ml_probs = {track: 0.0 for track in TRACKS}

        combined = {}
        for track in TRACKS:
            combined[track] = 0.6 * normalized_rule.get(track, 0.0) + 0.4 * ml_probs.get(track, 0.0)

        return sorted(combined.items(), key=lambda item: item[1], reverse=True)

    def _build_result(
        self,
        ordered_scores: List[Tuple[str, float]],
        rule_scores: Dict[str, float],
        ml_result: Optional[Dict[str, object]],
    ) -> AssessmentResult:
        if not ordered_scores:
            raise ValueError("Не удалось вычислить результат теста")

        top_tracks_payload = []
        for track_id, score in ordered_scores[:2]:
            details = TRACK_DETAILS[track_id]
            top_tracks_payload.append(
                {
                    "name": details["name"],
                    "match_percentage": int(round(score * 100)),
                    "reason": details["reason"],
                    "skills": details["skills"][:3],
                    "description": details["description"],
                    "track_id": track_id,
                }
            )

        primary_track = ordered_scores[0][0]
        plan = {
            f"Day {idx + 1}": task
            for idx, task in enumerate(TRACK_DETAILS[primary_track]["plan"])
        }

        courses = TRACK_DETAILS[primary_track]["courses"]

        recommendations = TRACK_DETAILS[primary_track]["recommendations"]
        overall_score = sum(score for _, score in ordered_scores[:2]) / max(
            len(ordered_scores[:2]), 1
        )

        return AssessmentResult(
            top_tracks=top_tracks_payload,
            development_plan=plan,
            courses=courses,
            overall_score=overall_score,
            recommendations=recommendations,
            primary_track=primary_track,
        )
