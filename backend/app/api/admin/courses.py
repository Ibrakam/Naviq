import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.course import Course
from app.models.course_lesson import CourseLesson
from app.models.user import User
from app.schemas.course import (
    CourseCreate,
    CourseLessonCreate,
    CourseLessonOut,
    CourseLessonUpdate,
    CourseOut,
    CourseUpdate,
)
from app.services.homework_ai import generate_lesson_homework

router = APIRouter(prefix="/courses", tags=["admin-courses"])


def _normalize_internal_url(value: str | None) -> str | None:
    if value is None:
        return None
    raw = value.strip()
    if not raw:
        return None
    if raw.startswith("http://") or raw.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only internal Naviq course URLs are allowed",
        )
    if not raw.startswith("/"):
        raw = f"/{raw}"
    return raw


def _normalize_youtube_url(value: str | None) -> str | None:
    if value is None:
        return None
    raw = value.strip()
    if not raw:
        return None
    if "youtube.com/" not in raw and "youtu.be/" not in raw:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only YouTube links are allowed for lesson videos",
        )
    return raw


async def _get_course_or_404(course_id: uuid.UUID, db: AsyncSession) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


async def _get_lesson_or_404(course_id: uuid.UUID, lesson_id: uuid.UUID, db: AsyncSession) -> CourseLesson:
    result = await db.execute(
        select(CourseLesson).where(CourseLesson.id == lesson_id, CourseLesson.course_id == course_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return lesson


@router.get("/", response_model=list[CourseOut])
async def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Course).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    body: CourseCreate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    payload = body.model_dump()
    payload["provider"] = "Naviq"
    payload["url"] = _normalize_internal_url(payload.get("url"))

    course = Course(**payload)
    db.add(course)
    await db.flush()
    if not course.url:
        course.url = f"/courses/{course.id}"
    return course


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await _get_course_or_404(course_id, db)


@router.patch("/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: uuid.UUID,
    body: CourseUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)

    changes = body.model_dump(exclude_unset=True)
    changes.pop("provider", None)
    if "url" in changes:
        changes["url"] = _normalize_internal_url(changes["url"])

    for field, value in changes.items():
        setattr(course, field, value)

    course.provider = "Naviq"

    await db.flush()
    return course


@router.get("/{course_id}/lessons", response_model=list[CourseLessonOut])
async def list_course_lessons(
    course_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    result = await db.execute(
        select(CourseLesson).where(CourseLesson.course_id == course.id).order_by(CourseLesson.order.asc())
    )
    return result.scalars().all()


@router.post("/{course_id}/lessons", response_model=CourseLessonOut, status_code=status.HTTP_201_CREATED)
async def create_course_lesson(
    course_id: uuid.UUID,
    body: CourseLessonCreate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    payload = body.model_dump()
    payload["youtube_url"] = _normalize_youtube_url(payload.get("youtube_url"))
    lesson = CourseLesson(course_id=course.id, **payload)
    db.add(lesson)
    try:
        await db.flush()
    except IntegrityError as exc:
        await db.rollback()
        if "uq_course_lessons_course_order" in str(exc):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="В этом курсе уже есть урок с таким порядковым номером. Укажи другой order.",
            ) from exc
        raise
    await db.refresh(lesson)
    return lesson


@router.patch("/{course_id}/lessons/{lesson_id}", response_model=CourseLessonOut)
async def update_course_lesson(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    body: CourseLessonUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    lesson = await _get_lesson_or_404(course.id, lesson_id, db)
    changes = body.model_dump(exclude_unset=True)
    if "youtube_url" in changes:
        changes["youtube_url"] = _normalize_youtube_url(changes["youtube_url"])
    for field, value in changes.items():
        setattr(lesson, field, value)
    try:
        await db.flush()
    except IntegrityError as exc:
        await db.rollback()
        if "uq_course_lessons_course_order" in str(exc):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="В этом курсе уже есть урок с таким порядковым номером. Укажи другой order.",
            ) from exc
        raise
    await db.refresh(lesson)
    return lesson


@router.post("/{course_id}/lessons/{lesson_id}/generate-homework", response_model=CourseLessonOut)
async def generate_lesson_homework_from_ai(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    lesson = await _get_lesson_or_404(course.id, lesson_id, db)
    prompt, rubric = await generate_lesson_homework(
        course_title=course.title,
        lesson_title=lesson.title,
        lesson_description=lesson.description,
        youtube_url=lesson.youtube_url,
        locale=_admin.preferred_language,
    )
    lesson.homework_prompt = prompt
    lesson.homework_rubric = rubric
    await db.flush()
    await db.refresh(lesson)
    return lesson


@router.delete("/{course_id}/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course_lesson(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    lesson = await _get_lesson_or_404(course.id, lesson_id, db)
    await db.delete(lesson)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    await db.delete(course)
