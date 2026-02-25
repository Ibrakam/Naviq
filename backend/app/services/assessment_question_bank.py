from __future__ import annotations

from typing import TypedDict

from app.i18n.locale import Locale

EXPECTED_SKILLS = [
    "communication",
    "leadership",
    "analytics",
    "creativity",
    "technical",
    "teamwork",
    "problem_solving",
    "time_management",
    "adaptability",
    "critical_thinking",
]


class OptionDef(TypedDict):
    code: str
    text: str
    weights: dict[str, float]


class QuestionDef(TypedDict):
    id: str
    question: str
    category: str
    options: list[OptionDef]


TRACK_TO_SKILLS: dict[str, dict[str, float]] = {
    "design": {
        "creativity": 1.0,
        "communication": 0.3,
        "problem_solving": 0.4,
        "adaptability": 0.4,
    },
    "tech": {
        "technical": 1.0,
        "analytics": 0.6,
        "problem_solving": 0.8,
        "critical_thinking": 0.7,
        "time_management": 0.4,
    },
    "business": {
        "leadership": 1.0,
        "communication": 0.8,
        "analytics": 0.5,
        "adaptability": 0.5,
        "time_management": 0.6,
    },
    "data": {
        "analytics": 1.0,
        "technical": 0.6,
        "critical_thinking": 0.9,
        "problem_solving": 0.7,
    },
    "social": {
        "communication": 1.0,
        "teamwork": 0.9,
        "leadership": 0.6,
        "adaptability": 0.6,
        "time_management": 0.3,
    },
}


TEXT_KEYWORDS: dict[str, tuple[str, ...]] = {
    "design": ("design", "дизайн", "ux", "ui", "figma", "интерф", "визуал", "прототип"),
    "tech": ("python", "javascript", "код", "backend", "frontend", "api", "инжен", "deploy"),
    "business": ("бизнес", "рынок", "маркет", "стратег", "продаж", "growth", "продукт"),
    "data": ("data", "данн", "аналит", "sql", "метрик", "таблиц", "dashboard", "отчет"),
    "social": ("команд", "лидер", "общен", "коммуник", "ментор", "people", "community"),
}


QUESTION_BANK: list[QuestionDef] = [
    {
        "id": "q1",
        "question": "Ты с друзьями делаешь мини-стартап для конкурса. До дедлайна 2 дня. Что выберешь?",
        "category": "scenario",
        "options": [
            {"code": "A", "text": "Сделать UX-структуру и экран.", "weights": {"design": 2, "business": 1}},
            {"code": "B", "text": "Сразу писать рабочий прототип.", "weights": {"tech": 2}},
            {"code": "C", "text": "Распределить задачи и сроки.", "weights": {"business": 2, "social": 1}},
            {"code": "D", "text": "Собрать данные от пользователей.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q2",
        "question": "Учитель просит сделать материал, чтобы другим было легче понять тему. Что сделаешь?",
        "category": "teaching",
        "options": [
            {"code": "A", "text": "Визуальную презентацию.", "weights": {"design": 2, "social": 1}},
            {"code": "B", "text": "Видеоурок и публикацию онлайн.", "weights": {"tech": 1, "social": 1}},
            {"code": "C", "text": "Живое объяснение в группе.", "weights": {"social": 2}},
            {"code": "D", "text": "Подбор источников и конспект.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q3",
        "question": "У клуба не открывается сайт. Твой первый шаг?",
        "category": "incident",
        "options": [
            {"code": "A", "text": "Обновить интерфейс.", "weights": {"design": 2}},
            {"code": "B", "text": "Починить техническую часть.", "weights": {"tech": 2}},
            {"code": "C", "text": "Сделать лендинг и привлечь аудиторию.", "weights": {"business": 2}},
            {"code": "D", "text": "Подключить аналитику трафика.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q4",
        "question": "Что в продукте для тебя важнее всего?",
        "category": "values",
        "options": [
            {"code": "A", "text": "Удобный и красивый дизайн.", "weights": {"design": 2}},
            {"code": "B", "text": "Скорость и надежность.", "weights": {"tech": 2}},
            {"code": "C", "text": "Польза для бизнеса.", "weights": {"business": 2}},
            {"code": "D", "text": "Измеримость через данные.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q5",
        "question": "На хакатоне тема «улучшить образование». Что возьмешь на себя?",
        "category": "hackathon",
        "options": [
            {"code": "A", "text": "UX и визуал для учеников.", "weights": {"design": 2}},
            {"code": "B", "text": "Бота/веб-сервис.", "weights": {"tech": 2}},
            {"code": "C", "text": "Стратегию запуска и ценность.", "weights": {"business": 2}},
            {"code": "D", "text": "Сбор метрик и анализ.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q6",
        "question": "Ты в международной команде. Как усилишь процесс?",
        "category": "teamwork",
        "options": [
            {"code": "A", "text": "Сделаю интерфейс понятным без слов.", "weights": {"design": 2}},
            {"code": "B", "text": "Настрою dev-среду и workflow.", "weights": {"tech": 2}},
            {"code": "C", "text": "Возьму коммуникацию и фасилитацию.", "weights": {"social": 2, "business": 1}},
            {"code": "D", "text": "Буду вести отчеты по прогрессу.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q7",
        "question": "Пользователь пишет: «мне неудобно». Как отреагируешь?",
        "category": "feedback",
        "options": [
            {"code": "A", "text": "Покажу варианты интерфейса.", "weights": {"design": 2}},
            {"code": "B", "text": "Проверю ошибки в коде.", "weights": {"tech": 2}},
            {"code": "C", "text": "Уточню контекст и цель пользователя.", "weights": {"social": 2}},
            {"code": "D", "text": "Посмотрю логи и поведение.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q8",
        "question": "Какую роль в команде ты выбираешь чаще всего?",
        "category": "role",
        "options": [
            {"code": "A", "text": "Проектировать внешний вид и сценарии.", "weights": {"design": 2}},
            {"code": "B", "text": "Строить техническое решение.", "weights": {"tech": 2}},
            {"code": "C", "text": "Организовывать людей и приоритеты.", "weights": {"business": 1, "social": 1}},
            {"code": "D", "text": "Анализировать и оптимизировать по цифрам.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q9",
        "question": "Как тебе удобнее принимать решения?",
        "category": "decision_making",
        "options": [
            {"code": "A", "text": "Через пользовательские сценарии и макеты.", "weights": {"design": 2}},
            {"code": "B", "text": "Через архитектуру и ограничения системы.", "weights": {"tech": 2}},
            {"code": "C", "text": "Через цели, риски и влияние.", "weights": {"business": 2}},
            {"code": "D", "text": "Через метрики, эксперименты и данные.", "weights": {"data": 2}},
        ],
    },
    {
        "id": "q10",
        "question": "Какая формулировка тебе ближе?",
        "category": "motivation",
        "options": [
            {"code": "A", "text": "Сделать опыт пользователя приятным.", "weights": {"design": 2, "social": 1}},
            {"code": "B", "text": "Сделать надежно и быстро.", "weights": {"tech": 2}},
            {"code": "C", "text": "Сделать ценно для бизнеса.", "weights": {"business": 2}},
            {"code": "D", "text": "Сделать доказуемо эффективным.", "weights": {"data": 2}},
        ],
    },
]


QUESTION_TRANSLATIONS_UZ: dict[str, dict[str, object]] = {
    "q1": {
        "question": "Do'stlaring bilan tanlov uchun mini-startap qilyapsan. Dedlayngacha 2 kun. Nimani tanlaysan?",
        "options": {
            "A": "UX tuzilma va ekranni tayyorlash.",
            "B": "Darhol ishlaydigan prototip yozish.",
            "C": "Vazifalar va muddatlarni taqsimlash.",
            "D": "Foydalanuvchilardan ma'lumot yig'ish.",
        },
    },
    "q2": {
        "question": "Ustoz mavzuni boshqalarga oson tushuntirishni so'radi. Nima qilasan?",
        "options": {
            "A": "Vizual prezentatsiya tayyorlayman.",
            "B": "Video dars yozib, onlayn joylayman.",
            "C": "Guruhda jonli tushuntiraman.",
            "D": "Manbalar tanlab, konspekt qilaman.",
        },
    },
    "q3": {
        "question": "Klub sayti ochilmayapti. Birinchi qadaming?",
        "options": {
            "A": "Interfeysni yangilayman.",
            "B": "Texnik qismni tuzataman.",
            "C": "Lending qilib auditoriya jalb qilaman.",
            "D": "Trafik analitikasini ulayman.",
        },
    },
    "q4": {
        "question": "Mahsulotda sen uchun eng muhim nima?",
        "options": {
            "A": "Qulay va chiroyli dizayn.",
            "B": "Tezlik va ishonchlilik.",
            "C": "Biznes uchun foyda.",
            "D": "Ma'lumot orqali o'lchovchanlik.",
        },
    },
    "q5": {
        "question": "Xakatonda mavzu: «ta'limni yaxshilash». Qaysi rolni olasan?",
        "options": {
            "A": "O'quvchilar uchun UX va vizual.",
            "B": "Bot yoki veb-servis.",
            "C": "Ishga tushirish strategiyasi va qiymat.",
            "D": "Metrikalar yig'ish va tahlil.",
        },
    },
    "q6": {
        "question": "Xalqaro jamoada ishlayapsan. Jarayonni qanday kuchaytirasan?",
        "options": {
            "A": "Interfeysni so'zsiz tushunarli qilaman.",
            "B": "Dev muhit va workflow sozlayman.",
            "C": "Kommunikatsiya va fasilitatsiyani olaman.",
            "D": "Progress hisobotlarini yuritaman.",
        },
    },
    "q7": {
        "question": "Foydalanuvchi: «menga noqulay». Qanday javob berasan?",
        "options": {
            "A": "Interfeys variantlarini ko'rsataman.",
            "B": "Koddagi xatolarni tekshiraman.",
            "C": "Kontekst va maqsadni aniqlab olaman.",
            "D": "Loglar va xatti-harakatni ko'raman.",
        },
    },
    "q8": {
        "question": "Jamoada ko'proq qaysi rolni tanlaysan?",
        "options": {
            "A": "Tashqi ko'rinish va ssenariylarni loyihalash.",
            "B": "Texnik yechim qurish.",
            "C": "Odamlar va prioritetlarni tashkil etish.",
            "D": "Raqamlar bo'yicha tahlil va optimizatsiya.",
        },
    },
    "q9": {
        "question": "Qarorlarni qanday qabul qilish qulay?",
        "options": {
            "A": "Foydalanuvchi ssenariylari va maketlar orqali.",
            "B": "Arxitektura va tizim cheklovlari orqali.",
            "C": "Maqsadlar, risklar va ta'sir orqali.",
            "D": "Metrikalar, eksperiment va data orqali.",
        },
    },
    "q10": {
        "question": "Qaysi ifoda senga yaqin?",
        "options": {
            "A": "Foydalanuvchi tajribasini yoqimli qilish.",
            "B": "Ishonchli va tez qilish.",
            "C": "Biznes uchun qimmat yaratish.",
            "D": "Isbotlanadigan samaradorlik yaratish.",
        },
    },
}


def get_skill_questions(locale: Locale = "ru") -> list[dict[str, object]]:
    questions: list[dict[str, object]] = []
    for question in QUESTION_BANK:
        translation = QUESTION_TRANSLATIONS_UZ.get(question["id"]) if locale == "uz" else None
        localized_question = (
            str(translation.get("question"))
            if isinstance(translation, dict) and isinstance(translation.get("question"), str)
            else question["question"]
        )
        translated_options = translation.get("options") if isinstance(translation, dict) else None
        questions.append(
            {
                "id": question["id"],
                "question": localized_question,
                "type": "multiple_choice",
                "category": question["category"],
                "required": True,
                "options": [
                    {
                        "code": option["code"],
                        "text": (
                            str(translated_options.get(option["code"]))
                            if isinstance(translated_options, dict)
                            and isinstance(translated_options.get(option["code"]), str)
                            else option["text"]
                        ),
                    }
                    for option in question["options"]
                ],
            }
        )
    return questions


def derive_skill_vector_from_answers(answers: list[dict[str, str]]) -> dict[str, float]:
    question_map = {question["id"]: question for question in QUESTION_BANK}
    track_scores: dict[str, float] = {track: 0.0 for track in TRACK_TO_SKILLS.keys()}

    for answer in answers:
        raw_question_id = str(answer.get("question_id", "")).strip().lower()
        raw_value = str(answer.get("answer", "")).strip()
        if not raw_question_id or not raw_value:
            continue

        normalized_qid = raw_question_id if raw_question_id.startswith("q") else f"q{raw_question_id}"
        question = question_map.get(normalized_qid)
        if question:
            code = raw_value.upper()
            option = next((opt for opt in question["options"] if opt["code"] == code), None)
            if option:
                for track, score in option["weights"].items():
                    track_scores[track] = track_scores.get(track, 0.0) + float(score)
                continue

        text_value = raw_value.lower()
        for track, keywords in TEXT_KEYWORDS.items():
            matches = sum(1 for keyword in keywords if keyword in text_value)
            if matches:
                track_scores[track] += float(matches) * 0.5

    raw_skills: dict[str, float] = {skill: 0.0 for skill in EXPECTED_SKILLS}
    for track, track_score in track_scores.items():
        for skill, factor in TRACK_TO_SKILLS.get(track, {}).items():
            raw_skills[skill] += track_score * factor

    max_score = max(raw_skills.values(), default=0.0)
    if max_score <= 0:
        return {skill: 0.25 for skill in EXPECTED_SKILLS}

    return {
        skill: round(max(0.0, min(1.0, score / max_score)), 3)
        for skill, score in raw_skills.items()
    }
