from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User
import openai
import os

router = APIRouter(prefix="/api/ai", tags=["ai-grading"])

# Get OpenAI API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

class GradeTaskRequest(BaseModel):
    lesson_title: str
    task_description: str
    student_answer: str

class GradeTaskResponse(BaseModel):
    score: int  # 0-100
    feedback: str
    suggestions: list[str]
    is_passing: bool  # True if score >= 70

@router.post("/grade-task", response_model=GradeTaskResponse)
async def grade_task(
    request: GradeTaskRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Grade a student's task answer using AI
    """
    if not openai.api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )

    try:
        # Create prompt for GPT-4
        system_prompt = """Ты опытный преподаватель маркетинга. Твоя задача - проверить ответ студента на практическое задание.

Критерии оценки:
1. Полнота ответа (30 баллов) - студент ответил на все части задания
2. Понимание темы (30 баллов) - правильное понимание концепций
3. Примеры (20 баллов) - наличие конкретных примеров
4. Оформление (20 баллов) - структура, читаемость

Верни JSON в формате:
{
    "score": 85,
    "feedback": "Детальный feedback на русском",
    "suggestions": ["Совет 1", "Совет 2", "Совет 3"],
    "is_passing": true
}

Проходной балл: 70 из 100."""

        user_prompt = f"""Урок: {request.lesson_title}

Задание:
{request.task_description}

Ответ студента:
{request.student_answer}

Оцени ответ по критериям и дай конструктивный feedback."""

        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4o-mini",  # Используем более дешёвую модель
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        # Parse response
        import json
        result = json.loads(response.choices[0].message.content)

        return GradeTaskResponse(
            score=result.get("score", 0),
            feedback=result.get("feedback", "Не удалось получить feedback"),
            suggestions=result.get("suggestions", []),
            is_passing=result.get("is_passing", False)
        )

    except openai.APIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error grading task: {str(e)}"
        )
