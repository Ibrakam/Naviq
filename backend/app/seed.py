"""Load initial data for local/dev usage.

Run with: python -m app.seed
"""

import asyncio

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.prompts import ROADMAP_GENERATION_PROMPT, SKILL_ANALYSIS_PROMPT
from app.database import async_session
from app.models.ai_prompt import AIPrompt
from app.models.course import Course
from app.models.profession import Profession
from app.models.simulation import Simulation, SimulationStep, StepType
from app.models.university import University
from app.services.gamification_service import ensure_gamification_catalog

SEED_PROFESSIONS = [
    {
        "title": "Frontend Developer",
        "category": "IT",
        "description": "Builds user interfaces with HTML, CSS, and JavaScript frameworks",
        "reference_skills": {
            "communication": 0.6,
            "leadership": 0.3,
            "analytics": 0.5,
            "creativity": 0.8,
            "technical": 0.9,
            "teamwork": 0.7,
            "problem_solving": 0.8,
            "time_management": 0.6,
            "adaptability": 0.7,
            "critical_thinking": 0.6,
        },
    },
    {
        "title": "Backend Developer",
        "category": "IT",
        "description": "Builds APIs, data models, and backend services",
        "reference_skills": {
            "communication": 0.6,
            "leadership": 0.35,
            "analytics": 0.7,
            "creativity": 0.4,
            "technical": 0.95,
            "teamwork": 0.65,
            "problem_solving": 0.9,
            "time_management": 0.7,
            "adaptability": 0.75,
            "critical_thinking": 0.85,
        },
    },
    {
        "title": "Data Analyst",
        "category": "Data",
        "description": "Analyzes data to derive business insights and build reports",
        "reference_skills": {
            "communication": 0.7,
            "leadership": 0.3,
            "analytics": 0.95,
            "creativity": 0.4,
            "technical": 0.7,
            "teamwork": 0.6,
            "problem_solving": 0.8,
            "time_management": 0.7,
            "adaptability": 0.5,
            "critical_thinking": 0.9,
        },
    },
    {
        "title": "Data Scientist",
        "category": "Data",
        "description": "Builds predictive models and experiments on data-driven products",
        "reference_skills": {
            "communication": 0.7,
            "leadership": 0.4,
            "analytics": 0.98,
            "creativity": 0.6,
            "technical": 0.88,
            "teamwork": 0.65,
            "problem_solving": 0.9,
            "time_management": 0.7,
            "adaptability": 0.65,
            "critical_thinking": 0.95,
        },
    },
    {
        "title": "Product Manager",
        "category": "Management",
        "description": "Defines product strategy and coordinates cross-functional teams",
        "reference_skills": {
            "communication": 0.95,
            "leadership": 0.9,
            "analytics": 0.7,
            "creativity": 0.7,
            "technical": 0.4,
            "teamwork": 0.9,
            "problem_solving": 0.8,
            "time_management": 0.9,
            "adaptability": 0.8,
            "critical_thinking": 0.85,
        },
    },
    {
        "title": "UX Designer",
        "category": "Design",
        "description": "Designs user experiences through research, prototyping, and testing",
        "reference_skills": {
            "communication": 0.8,
            "leadership": 0.4,
            "analytics": 0.6,
            "creativity": 0.95,
            "technical": 0.5,
            "teamwork": 0.8,
            "problem_solving": 0.7,
            "time_management": 0.6,
            "adaptability": 0.7,
            "critical_thinking": 0.7,
        },
    },
    {
        "title": "Marketing Specialist",
        "category": "Marketing",
        "description": "Plans and executes marketing campaigns across channels",
        "reference_skills": {
            "communication": 0.9,
            "leadership": 0.5,
            "analytics": 0.7,
            "creativity": 0.85,
            "technical": 0.3,
            "teamwork": 0.7,
            "problem_solving": 0.6,
            "time_management": 0.8,
            "adaptability": 0.8,
            "critical_thinking": 0.6,
        },
    },
    {
        "title": "QA Engineer",
        "category": "IT",
        "description": "Ensures product quality with manual and automated testing",
        "reference_skills": {
            "communication": 0.65,
            "leadership": 0.3,
            "analytics": 0.75,
            "creativity": 0.35,
            "technical": 0.78,
            "teamwork": 0.72,
            "problem_solving": 0.82,
            "time_management": 0.74,
            "adaptability": 0.7,
            "critical_thinking": 0.84,
        },
    },
    {
        "title": "Business Analyst",
        "category": "Business",
        "description": "Bridges business goals and product implementation with structured analysis",
        "reference_skills": {
            "communication": 0.88,
            "leadership": 0.55,
            "analytics": 0.86,
            "creativity": 0.5,
            "technical": 0.5,
            "teamwork": 0.8,
            "problem_solving": 0.78,
            "time_management": 0.78,
            "adaptability": 0.72,
            "critical_thinking": 0.88,
        },
    },
    {
        "title": "DevOps Engineer",
        "category": "IT",
        "description": "Automates CI/CD pipelines and manages cloud infrastructure reliability",
        "reference_skills": {
            "communication": 0.62,
            "leadership": 0.45,
            "analytics": 0.74,
            "creativity": 0.42,
            "technical": 0.94,
            "teamwork": 0.7,
            "problem_solving": 0.9,
            "time_management": 0.76,
            "adaptability": 0.85,
            "critical_thinking": 0.87,
        },
    },
]

SEED_PROMPTS = [
    {
        "name": "skill_analysis",
        "system_prompt": SKILL_ANALYSIS_PROMPT,
        "model": "gpt-4o",
        "temperature": 0.7,
    },
    {
        "name": "roadmap_generation",
        "system_prompt": ROADMAP_GENERATION_PROMPT,
        "model": "gpt-4o",
        "temperature": 0.7,
    },
]

SEED_UNIVERSITIES = [
    {"name": "Tashkent State Technical University", "short_code": "TSTU", "region": "Tashkent"},
    {"name": "Westminster International University in Tashkent", "short_code": "WIUT", "region": "Tashkent"},
    {"name": "INHA University in Tashkent", "short_code": "IUT", "region": "Tashkent"},
    {"name": "National University of Uzbekistan", "short_code": "NUU", "region": "Tashkent"},
    {"name": "Samarkand State University", "short_code": "SamSU", "region": "Samarkand"},
]

SEED_COURSES = [
    {
        "title": "Frontend Architecture with React",
        "provider": "Coursera",
        "url": "https://www.coursera.org/",
        "skill_tags": {"technical": 0.9, "problem_solving": 0.7, "creativity": 0.6},
        "difficulty": 3,
        "description": "Advanced React patterns, performance optimization, and architecture.",
    },
    {
        "title": "SQL for Data Analytics",
        "provider": "DataCamp",
        "url": "https://www.datacamp.com/",
        "skill_tags": {"analytics": 0.9, "critical_thinking": 0.7, "technical": 0.6},
        "difficulty": 2,
        "description": "Practical SQL for dashboards and product metrics analysis.",
    },
    {
        "title": "Product Strategy Fundamentals",
        "provider": "Udemy",
        "url": "https://www.udemy.com/",
        "skill_tags": {"leadership": 0.75, "communication": 0.8, "analytics": 0.55},
        "difficulty": 2,
        "description": "How to define product vision, goals, and roadmap decisions.",
    },
    {
        "title": "UX Research and Testing",
        "provider": "Interaction Design Foundation",
        "url": "https://www.interaction-design.org/",
        "skill_tags": {"creativity": 0.75, "communication": 0.65, "analytics": 0.5},
        "difficulty": 2,
        "description": "User interviews, JTBD, and usability testing in practice.",
    },
    {
        "title": "Python for Data Science",
        "provider": "Kaggle",
        "url": "https://www.kaggle.com/learn",
        "skill_tags": {"technical": 0.8, "analytics": 0.85, "problem_solving": 0.7},
        "difficulty": 3,
        "description": "Data manipulation and modeling workflows with Python.",
    },
    {
        "title": "Backend APIs with FastAPI",
        "provider": "YouTube",
        "url": "https://www.youtube.com/",
        "skill_tags": {"technical": 0.88, "problem_solving": 0.75, "critical_thinking": 0.65},
        "difficulty": 3,
        "description": "Design and implementation of production-grade API services.",
    },
    {
        "title": "Effective Communication at Work",
        "provider": "LinkedIn Learning",
        "url": "https://www.linkedin.com/learning/",
        "skill_tags": {"communication": 0.9, "teamwork": 0.7, "leadership": 0.5},
        "difficulty": 1,
        "description": "Communication frameworks for teams and stakeholder alignment.",
    },
    {
        "title": "Critical Thinking Toolkit",
        "provider": "edX",
        "url": "https://www.edx.org/",
        "skill_tags": {"critical_thinking": 0.9, "problem_solving": 0.7, "analytics": 0.6},
        "difficulty": 2,
        "description": "Structured decision-making and argument evaluation methods.",
    },
    {
        "title": "DevOps Essentials",
        "provider": "Pluralsight",
        "url": "https://www.pluralsight.com/",
        "skill_tags": {"technical": 0.88, "adaptability": 0.7, "time_management": 0.65},
        "difficulty": 3,
        "description": "CI/CD pipelines, observability, and release management basics.",
    },
    {
        "title": "A/B Testing for Product and Marketing",
        "provider": "Reforge",
        "url": "https://www.reforge.com/",
        "skill_tags": {"analytics": 0.82, "critical_thinking": 0.78, "communication": 0.45},
        "difficulty": 3,
        "description": "Experiment design, interpretation, and growth decisions.",
    },
]

SEED_SIMULATIONS = [
    {
        "title": "Product Discovery Sprint",
        "description": "Prioritize product opportunities and align stakeholders in one sprint.",
        "profession_title": "Product Manager",
        "is_active": True,
        "steps": [
            {
                "order": 1,
                "type": "question",
                "content": {
                    "prompt": "You have 3 feature ideas and only one sprint. What is your first prioritization criterion?",
                    "hint": "Think about business impact and user pain.",
                    "placeholder": "Describe your criterion...",
                    "options": ["Impact", "Effort", "Risk", "Revenue"],
                },
            },
            {
                "order": 2,
                "type": "task",
                "content": {
                    "title": "Create a mini-prioritization table",
                    "instructions": "List the 3 features with impact/effort score and final order.",
                    "checklist": ["Use numbers", "Explain tradeoff", "Pick top-1 feature"],
                    "placeholder": "Feature A: impact 8, effort 3 ...",
                    "deliverable_format": "markdown",
                },
            },
            {
                "order": 3,
                "type": "dialog",
                "content": {
                    "mentor_message": "Stakeholder says: 'My feature is urgent.' How do you respond without conflict?",
                    "context": "Cross-functional planning meeting",
                    "suggested_replies": [
                        "Acknowledge request and align on impact metrics",
                        "Ask for measurable success criteria",
                    ],
                    "placeholder": "Write your response to stakeholder...",
                },
            },
        ],
    },
    {
        "title": "Data Storytelling Challenge",
        "description": "Turn raw metrics into a clear recommendation for leadership.",
        "profession_title": "Data Analyst",
        "is_active": True,
        "steps": [
            {
                "order": 1,
                "type": "question",
                "content": {
                    "prompt": "Conversion dropped by 18%. Which segment do you check first and why?",
                    "placeholder": "State segment and rationale...",
                },
            },
            {
                "order": 2,
                "type": "task",
                "content": {
                    "title": "Build summary insights",
                    "instructions": "Prepare 3 bullet insights and 2 hypotheses for drop cause.",
                    "checklist": ["Insight backed by metric", "No vague statements", "Actionable next step"],
                    "deliverable_format": "text",
                },
            },
            {
                "order": 3,
                "type": "dialog",
                "content": {
                    "mentor_message": "CEO asks for one decision by tomorrow. What do you recommend?",
                    "tone": "concise",
                    "placeholder": "Recommendation in 4-6 lines...",
                },
            },
        ],
    },
    {
        "title": "Incident Response Room",
        "description": "Handle a production outage with calm communication and fast triage.",
        "profession_title": "Backend Developer",
        "is_active": True,
        "steps": [
            {
                "order": 1,
                "type": "question",
                "content": {
                    "prompt": "API latency spikes to 4x. What is your first diagnostic action?",
                    "options": ["Check logs", "Rollback", "Restart all services", "Disable feature flags"],
                },
            },
            {
                "order": 2,
                "type": "task",
                "content": {
                    "title": "Draft incident timeline",
                    "instructions": "Write minute-by-minute plan for first 15 minutes.",
                    "checklist": ["Assign owner", "User impact update", "Mitigation path"],
                    "deliverable_format": "markdown",
                },
            },
            {
                "order": 3,
                "type": "dialog",
                "content": {
                    "mentor_message": "Customer success asks for ETA every 5 minutes. How do you structure updates?",
                    "context": "High-severity incident, many stakeholders",
                    "placeholder": "Template for status update...",
                },
            },
        ],
    },
]


async def _upsert_professions(session: AsyncSession) -> dict[str, Profession]:
    result: dict[str, Profession] = {}
    for data in SEED_PROFESSIONS:
        existing = await session.execute(select(Profession).where(Profession.title == data["title"]))
        profession = existing.scalar_one_or_none()
        if profession:
            profession.category = data["category"]
            profession.description = data["description"]
            profession.reference_skills = data["reference_skills"]
        else:
            profession = Profession(**data)
            session.add(profession)
        result[data["title"]] = profession
    await session.flush()
    return result


async def _upsert_prompts(session: AsyncSession) -> None:
    for data in SEED_PROMPTS:
        existing = await session.execute(select(AIPrompt).where(AIPrompt.name == data["name"]))
        prompt = existing.scalar_one_or_none()
        if prompt:
            prompt.system_prompt = data["system_prompt"]
            prompt.model = data["model"]
            prompt.temperature = data["temperature"]
        else:
            session.add(AIPrompt(**data))
    await session.flush()


async def _upsert_universities(session: AsyncSession) -> None:
    for data in SEED_UNIVERSITIES:
        existing = await session.execute(select(University).where(University.short_code == data["short_code"]))
        uni = existing.scalar_one_or_none()
        if uni:
            uni.name = data["name"]
            uni.region = data["region"]
            uni.is_active = True
        else:
            session.add(
                University(
                    name=data["name"],
                    short_code=data["short_code"],
                    region=data["region"],
                    is_active=True,
                )
            )
    await session.flush()


async def _upsert_courses(session: AsyncSession) -> None:
    for data in SEED_COURSES:
        existing = await session.execute(
            select(Course).where(Course.title == data["title"], Course.provider == data["provider"])
        )
        course = existing.scalar_one_or_none()
        if course:
            course.url = data["url"]
            course.skill_tags = data["skill_tags"]
            course.difficulty = data["difficulty"]
            course.description = data["description"]
        else:
            session.add(Course(**data))
    await session.flush()


async def _upsert_simulations(session: AsyncSession, professions_by_title: dict[str, Profession]) -> None:
    for data in SEED_SIMULATIONS:
        profession = professions_by_title.get(data["profession_title"])
        if not profession:
            print(f"Skip simulation '{data['title']}': profession '{data['profession_title']}' not found")
            continue

        existing = await session.execute(select(Simulation).where(Simulation.title == data["title"]))
        simulation = existing.scalar_one_or_none()
        if simulation:
            simulation.description = data["description"]
            simulation.profession_id = profession.id
            simulation.is_active = data["is_active"]
        else:
            simulation = Simulation(
                title=data["title"],
                description=data["description"],
                profession_id=profession.id,
                is_active=data["is_active"],
            )
            session.add(simulation)

        await session.flush()

        await session.execute(delete(SimulationStep).where(SimulationStep.simulation_id == simulation.id))
        for step in data["steps"]:
            session.add(
                SimulationStep(
                    simulation_id=simulation.id,
                    order=step["order"],
                    type=StepType(step["type"]),
                    content=step["content"],
                    next_step_rules=step.get("next_step_rules"),
                )
            )
    await session.flush()


async def seed():
    async with async_session() as session:
        session: AsyncSession
        professions_by_title = await _upsert_professions(session)
        await _upsert_prompts(session)
        await _upsert_universities(session)
        await ensure_gamification_catalog(session)
        await _upsert_courses(session)
        await _upsert_simulations(session, professions_by_title)
        await session.commit()

        total_professions = (await session.execute(select(func.count(Profession.id)))).scalar_one()
        total_courses = (await session.execute(select(func.count(Course.id)))).scalar_one()
        total_simulations = (await session.execute(select(func.count(Simulation.id)))).scalar_one()
        total_prompts = (await session.execute(select(func.count(AIPrompt.id)))).scalar_one()
        total_universities = (await session.execute(select(func.count(University.id)))).scalar_one()

        print("Seed data loaded successfully:")
        print(f"  professions: {total_professions}")
        print(f"  courses: {total_courses}")
        print(f"  simulations: {total_simulations}")
        print(f"  prompts: {total_prompts}")
        print(f"  universities: {total_universities}")


if __name__ == "__main__":
    asyncio.run(seed())
