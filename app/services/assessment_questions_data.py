"""
Static definition of the Naviq career assessment questionnaire.

These records are inserted into the database on first run. Later they should
be editable via admin tooling, but for now we keep them versioned in code.
"""

from __future__ import annotations

from typing import Dict, List, Optional, TypedDict


class OptionDict(TypedDict):
    code: str
    text: str


class AssessmentQuestionDict(TypedDict, total=False):
    id: int
    question: str
    type: str
    role: str
    order: int
    category: str
    options: List[OptionDict]
    weights: Dict[str, Dict[str, int]]


def _make_options(options: Dict[str, str]) -> List[OptionDict]:
    return [{"code": code, "text": text} for code, text in options.items()]


RAW_QUESTION_DATA: List[AssessmentQuestionDict] = [
    {
        "id": 1,
        "question": "Ты с друзьями делаешь мини-стартап для конкурса. До дедлайна 2 дня. Что ты выберешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Сесть и набросать структуру экрана и UX.",
            "B": "Сразу начать писать рабочий прототип.",
            "C": "Распределить задачи и следить за дедлайнами.",
            "D": "Собрать данные и предложения от пользователей.",
        }),
        "weights": {
            "A": {"design": 2, "business": 1},
            "B": {"tech": 2},
            "C": {"business": 2, "social": 1},
            "D": {"data": 2},
        },
    },
    {
        "id": 2,
        "question": "Учитель просит сделать материал, чтобы другим было легче понять тему. Что ты сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Создам визуально понятную презентацию.",
            "B": "Запишу видеоурок и выложу онлайн.",
            "C": "Проведу живое объяснение в группе.",
            "D": "Соберу полезные источники и краткий конспект.",
        }),
        "weights": {
            "A": {"design": 2, "social": 1},
            "B": {"tech": 1, "social": 1},
            "C": {"social": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 3,
        "question": "У студенческого клуба не открывается сайт. Что ты сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Переделаю интерфейс, чтобы выглядел современно.",
            "B": "Починю техническую часть сайта.",
            "C": "Предложу сделать лендинг и привлечь больше людей.",
            "D": "Подключу аналитику, чтобы понимать, кто заходит.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 4,
        "question": "Команда спорит: красота, скорость или продажи — что важнее?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Удобный и красивый дизайн.",
            "B": "Скорость и стабильность.",
            "C": "Прибыль и результат.",
            "D": "Измеримые данные и аналитика.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 5,
        "question": "На хакатоне тема — «улучшить образование». Что ты сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Придумаю интерфейс для учеников.",
            "B": "Сделаю работающий бот или веб-сервис.",
            "C": "Продумaю стратегию продвижения и клиентов.",
            "D": "Настрою сбор и анализ данных по обучению.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 6,
        "question": "Тебе сказали «сделай лучше». Что ты предпримешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Выясню, что неудобно, и перерисую.",
            "B": "Проверю код и исправлю.",
            "C": "Подумаю, как улучшение повлияет на цель.",
            "D": "Посмотрю данные и сравню результаты.",
        }),
        "weights": {
            "A": {"design": 2, "social": 1},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 7,
        "question": "Вы сделали прототип. Надо презентовать его инвесторам. Что ты покажешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Красивую презентацию с UX-сценарием.",
            "B": "Рабочее демо с кнопками.",
            "C": "Аргументы, почему проект нужен рынку.",
            "D": "Цифры и потенциал эффективности.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 8,
        "question": "Ты в команде с иностранцами. Как поможешь работе?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Сделаю интерфейс понятным без слов.",
            "B": "Настрою совместную среду разработки.",
            "C": "Возьму на себя коммуникацию и организацию.",
            "D": "Буду вести таблицы и отчёты прогресса.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"social": 2, "business": 1},
            "D": {"data": 2},
        },
    },
    {
        "id": 9,
        "question": "Пользователь пишет: «Мне неудобно!». Что ты сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Покажу варианты интерфейса и спрошу, какой лучше.",
            "B": "Проверю, нет ли ошибки в коде.",
            "C": "Спрошу, чего он хотел добиться.",
            "D": "Проанализирую его действия по логам.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"social": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 10,
        "question": "Ты выбираешь себе роль в команде. Что ближе?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Придумывать, как это выглядит.",
            "B": "Создавать и строить продукт.",
            "C": "Вести проект и общаться с людьми.",
            "D": "Анализировать и улучшать по цифрам.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 1, "social": 1},
            "D": {"data": 2},
        },
    },
    {
        "id": 11,
        "question": "Задачу изменили в последний момент. Твои действия?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Перерисую и адаптирую дизайн.",
            "B": "Перепишу логику, чтобы всё работало.",
            "C": "Перестрою сроки и сообщу команде.",
            "D": "Зафиксирую изменения и сравню результаты.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 12,
        "question": "Тебе не дали ТЗ. Что ты сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Нарисую пользовательский сценарий.",
            "B": "Сделаю минимальный прототип.",
            "C": "Уточню цели заказчика.",
            "D": "Соберу аналоги и сделаю сводку.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2, "social": 1},
            "D": {"data": 2},
        },
    },
    {
        "id": 13,
        "question": "Нужно сделать продукт для школы.",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Сделаю визуал для школьников.",
            "B": "Создам Telegram-бота или веб-версию.",
            "C": "Придумаю стратегию внедрения в школы.",
            "D": "Добавлю отчёты и аналитику для учителей.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 14,
        "question": "Видишь плохой сайт. Что сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Перерисую интерфейс.",
            "B": "Проверю, почему он тормозит.",
            "C": "Сделаю нормальный лендинг для продаж.",
            "D": "Посмотрю статистику его посещений.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 15,
        "question": "В команде конфликт. Как поступишь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Организую визуальный брейншторм.",
            "B": "Разделю задачи между участниками.",
            "C": "Поговорю со всеми и успокою.",
            "D": "Сделаю критерии оценки и решим по ним.",
        }),
        "weights": {
            "A": {"design": 1, "social": 1},
            "B": {"tech": 1, "business": 1},
            "C": {"social": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 16,
        "question": "Куда хочешь на стажировку?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "В продуктовую или дизайн-команду.",
            "B": "В команду разработчиков.",
            "C": "В маркетинг или менеджмент.",
            "D": "В аналитику и отчёты.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 17,
        "question": "Ты работаешь с людьми, далёкими от IT. Что сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Покажу визуально, как это будет.",
            "B": "Сделаю максимально простое решение.",
            "C": "Объясню простыми словами выгоды.",
            "D": "Покажу пользу в цифрах.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"social": 2, "business": 1},
            "D": {"data": 2},
        },
    },
    {
        "id": 18,
        "question": "Что тебе ближе — творчество или правила?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Люблю придумывать новое.",
            "B": "Люблю, когда всё работает по правилам.",
            "C": "Люблю влиять на людей и процессы.",
            "D": "Люблю, когда всё можно посчитать.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 19,
        "question": "Хочешь, чтобы твой проект был международным. Что сделаешь?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Сделаю визуал универсальным.",
            "B": "Построю масштабируемую архитектуру.",
            "C": "Продумaю упаковку и маркетинг.",
            "D": "Настрою аналитику по регионам.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"business": 2},
            "D": {"data": 2},
        },
    },
    {
        "id": 20,
        "question": "Что тебя мотивирует больше всего?",
        "type": "multiple_choice",
        "options": _make_options({
            "A": "Когда красиво и удобно.",
            "B": "Когда всё работает, и я это сделал.",
            "C": "Когда это помогает людям.",
            "D": "Когда вижу рост в цифрах.",
        }),
        "weights": {
            "A": {"design": 2},
            "B": {"tech": 2},
            "C": {"social": 1, "business": 1},
            "D": {"data": 2},
        },
    },
]

ADDITIONAL_TEXT_QUESTIONS: List[AssessmentQuestionDict] = [
    {
        "id": 101,
        "question": "Tell me what kind of tasks fire you up in a team: generating ideas, coding, digging into data, or working with people? Why?",
        "type": "text",
        "category": "interests",
        "options": [],
        "weights": {},
    },
    {
        "id": 102,
        "question": "Think of a recent project or assignment you are proud of. What did you do there and why did it energize you?",
        "type": "text",
        "category": "experience",
        "options": [],
        "weights": {},
    },
]

RAW_QUESTION_DATA.extend(ADDITIONAL_TEXT_QUESTIONS)

CHAT_PROMPTS = {
    1: "You and your friends have two days left to finish a mini-startup. What part do you grab first and why?",
    2: "A teacher asked you to explain a tough topic so classmates truly get it. How would you approach that?",
    3: "The student club website just went down. Walk me through the first things you would do to bring it back.",
    4: "Your team argues about what matters most—polish, speed, or sales. How do you respond and what is your reasoning?",
    5: "The hackathon topic is “improve education.” Which part of the solution would you own and how would you execute it?",
    6: "Someone says “just make it better.” How do you understand what “better” means here and what steps do you take?",
    7: "You are preparing a demo for investors. What would you show and how would you hook them?",
    8: "You are collaborating with an international team. How do you keep everyone aligned and understanding each other?",
    9: "A user complains that the product feels inconvenient. How do you investigate and what do you do next?",
    10: "You’re choosing your role in a brand-new team. Describe the work you’d like to do and why it suits you.",
    11: "The task changed at the very last moment. How do you react and reorganize your plan?",
    12: "You receive a project without any brief or specification. How do you bring clarity and get started?",
    13: "You need to design a product for a school. What's your first move and why?",
    14: "You spot a poorly designed website. What bothers you most and how would you fix it?",
    15: "There’s a conflict brewing inside the team. What is your usual approach to bring the vibe back on track?",
    16: "You’re choosing a dream internship. Where would you go and what kind of tasks excite you?",
    17: "You have to work with people far from tech. How do you explain ideas and keep them engaged?",
    18: "What inspires you more—creating something new or keeping everything structured? Give a story or example.",
    19: "You want to take a project global. What are the very first steps you would take?",
    20: "What motivates you the most when you work on a project, and why exactly that?",
}

for question in RAW_QUESTION_DATA:
    question["question"] = CHAT_PROMPTS.get(question["id"], question["question"])
    question["type"] = "text"
    question["options"] = []
    question["weights"] = {}

for idx, question in enumerate(RAW_QUESTION_DATA, start=1):
    question.setdefault("role", "assistant")
    question.setdefault("order", idx)
    question.setdefault("category", "general")
    question.setdefault("options", [])
    question.setdefault("weights", {})
    if question.get("type") != "text":
        question["type"] = "choice"

ASSESSMENT_QUESTIONS: List[AssessmentQuestionDict] = RAW_QUESTION_DATA
