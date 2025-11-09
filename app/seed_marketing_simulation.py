from app.database import SessionLocal
from app.models import CareerTrack, Simulation
from sqlalchemy.orm import Session


def seed_marketing_simulation():
    db: Session = SessionLocal()
    try:
        track = db.query(CareerTrack).filter(CareerTrack.category == "marketing").first()
        if not track:
            track = CareerTrack(
                name="Marketing & Growth",
                description="Трек про продвижение продуктов, работу с ЦА и анализ кампаний.",
                category="marketing",
                skills_required=["communication", "copywriting", "campaign-planning", "analytics"],
            )
            db.add(track)
            db.commit()
            db.refresh(track)

        sim = (
            db.query(Simulation)
            .filter(
                Simulation.track_id == track.id,
                Simulation.title == "Маркетинг: от продукта до отчёта",
            )
            .first()
        )

        if not sim:
            sim = Simulation(
                title="Маркетинг: от продукта до отчёта",
                description="Полный цикл: продукт → ЦА → канал → сообщение → план → метрики → отчёт.",
                company="Naviq",
                track_id=track.id,
                steps=[
                {
                    "order": 1,
                    "title": "Понять продукт",
                    "task": "Опиши продукт в 2–3 предложениях: что это и зачем.",
                    "expected_output": "Краткое описание продукта",
                    "kind": "text",
                    "input_placeholder": "Опиши продукт и пользу...",
                },
                {
                    "order": 2,
                    "title": "Определить аудиторию",
                    "task": "Опиши целевую аудиторию и её боль.",
                    "expected_output": "Описание ЦА",
                    "kind": "text",
                    "input_placeholder": "Например: студенты 1–3 курса, не знают куда идти...",
                },
                {
                    "order": 3,
                    "title": "Выбрать канал продвижения",
                    "task": "Выбери подходящий канал.",
                    "expected_output": "Telegram + Instagram Reels",
                    "kind": "choice",
                    "choices": [
                        "Telegram-чаты студентов",
                        "Instagram Reels",
                        "Партнёрские каналы",
                        "Email-рассылка",
                    ],
                },
                {
                    "order": 4,
                    "title": "Собрать маркетинговое сообщение",
                    "task": "Напиши продающий текст: проблема → решение → выгода → CTA.",
                    "expected_output": "3–5 предложений",
                    "kind": "text",
                    "input_placeholder": "Например: Не знаешь, кем хочешь быть? ...",
                },
                {
                    "order": 5,
                    "title": "План на 7 дней",
                    "task": "Составь последовательность действий на неделю.",
                    "expected_output": "7 шагов",
                    "kind": "text",
                    "input_placeholder": "День 1 — пост, День 2 — сториз...",
                },
                {
                    "order": 6,
                    "title": "Смоделировать результат",
                    "task": "Представь, что кампания прошла, и укажи примерные цифры.",
                    "expected_output": "Охват, клики, заявки",
                    "kind": "text",
                    "input_placeholder": "Охват: 2500, клики: 180, заявки: 35...",
                },
                {
                    "order": 7,
                    "title": "Подготовить отчёт",
                    "task": "Собери всё в 1–2 абзаца для руководителя.",
                    "expected_output": "Короткий отчёт",
                    "kind": "text",
                    "input_placeholder": "Что сделали → что получили → что улучшим",
                },
                ],
                duration="30-45 минут",
                level="beginner",
                is_active=True,
            )
            db.add(sim)
            db.commit()
            print("✅ Created marketing simulation")
        else:
            sim.steps = [
            {
                "order": 1,
                "title": "Понять продукт",
                "task": "Опиши продукт в 2–3 предложениях: что это и зачем.",
                "expected_output": "Краткое описание продукта",
                "kind": "text",
                "input_placeholder": "Опиши продукт и пользу...",
            },
            {
                "order": 2,
                "title": "Определить аудиторию",
                "task": "Опиши целевую аудиторию и её боль.",
                "expected_output": "Описание ЦА",
                "kind": "text",
                "input_placeholder": "Например: студенты 1–3 курса, не знают куда идти...",
            },
            {
                "order": 3,
                "title": "Выбрать канал продвижения",
                "task": "Выбери подходящий канал.",
                "expected_output": "Telegram + Instagram Reels",
                "kind": "choice",
                "choices": [
                    "Telegram-чаты студентов",
                    "Instagram Reels",
                    "Партнёрские каналы",
                    "Email-рассылка",
                ],
            },
            {
                "order": 4,
                "title": "Собрать маркетинговое сообщение",
                "task": "Напиши продающий текст: проблема → решение → выгода → CTA.",
                "expected_output": "3–5 предложений",
                "kind": "text",
                "input_placeholder": "Например: Не знаешь, кем хочешь быть? ...",
            },
            {
                "order": 5,
                "title": "План на 7 дней",
                "task": "Составь последовательность действий на неделю.",
                "expected_output": "7 шагов",
                "kind": "text",
                "input_placeholder": "День 1 — пост, День 2 — сториз...",
            },
            {
                "order": 6,
                "title": "Смоделировать результат",
                "task": "Представь, что кампания прошла, и укажи примерные цифры.",
                "expected_output": "Охват, клики, заявки",
                "kind": "text",
                "input_placeholder": "Охват: 2500, клики: 180, заявки: 35...",
            },
            {
                "order": 7,
                "title": "Подготовить отчёт",
                "task": "Собери всё в 1–2 абзаца для руководителя.",
                "expected_output": "Короткий отчёт",
                "kind": "text",
                "input_placeholder": "Что сделали → что получили → что улучшим",
            },
            ]
            db.commit()
            print("ℹ️ Marketing simulation already exists, обновили шаги")
    finally:
        db.close()


if __name__ == "__main__":
    seed_marketing_simulation()
