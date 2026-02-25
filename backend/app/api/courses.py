import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, get_request_locale
from app.i18n.locale import Locale
from app.models.course import Course
from app.models.course_lesson import CourseLesson, HomeworkSubmissionStatus, LessonHomeworkSubmission
from app.models.user import User
from app.schemas.course import CourseLessonOut, CourseOut, HomeworkSubmissionCreate, HomeworkSubmissionOut
from app.services.career_pivot import compute_gap_analysis
from app.services.course_recommender import recommend_courses
from app.services.gamification_service import grant_xp, handle_domain_event
from app.services.homework_ai import grade_lesson_homework
from app.services.translation_service import translate_struct, translate_text

router = APIRouter(prefix="/courses", tags=["courses"])


async def _get_internal_course(course_id: uuid.UUID, db: AsyncSession) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id, Course.provider == "Naviq"))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


async def _get_course_lesson(course_id: uuid.UUID, lesson_id: uuid.UUID, db: AsyncSession) -> CourseLesson:
    lesson_result = await db.execute(
        select(CourseLesson).where(CourseLesson.id == lesson_id, CourseLesson.course_id == course_id)
    )
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return lesson


def _serialize_lesson(lesson: CourseLesson, submission: LessonHomeworkSubmission | None) -> CourseLessonOut:
    payload = CourseLessonOut.model_validate(lesson).model_dump()
    payload["my_latest_submission"] = (
        HomeworkSubmissionOut.model_validate(submission) if submission else None
    )
    return CourseLessonOut(**payload)


async def _localize_course(course: CourseOut, db: AsyncSession, locale: Locale) -> CourseOut:
    if locale == "ru":
        return course
    payload = course.model_dump()
    payload["title"] = await translate_text(db, payload.get("title"), target_lang=locale)
    payload["description"] = await translate_text(db, payload.get("description"), target_lang=locale)
    return CourseOut(**payload)


async def _localize_submission(
    submission: HomeworkSubmissionOut | None,
    db: AsyncSession,
    locale: Locale,
) -> HomeworkSubmissionOut | None:
    if submission is None or locale == "ru":
        return submission
    payload = submission.model_dump()
    payload["feedback"] = await translate_text(db, payload.get("feedback"), target_lang=locale)
    return HomeworkSubmissionOut(**payload)


async def _localize_lesson(lesson: CourseLessonOut, db: AsyncSession, locale: Locale) -> CourseLessonOut:
    if locale == "ru":
        return lesson
    payload = lesson.model_dump()
    payload["title"] = await translate_text(db, payload.get("title"), target_lang=locale)
    payload["description"] = await translate_text(db, payload.get("description"), target_lang=locale)
    payload["homework_prompt"] = await translate_text(db, payload.get("homework_prompt"), target_lang=locale)
    payload["homework_rubric"] = await translate_struct(db, payload.get("homework_rubric"), target_lang=locale)
    payload["my_latest_submission"] = await _localize_submission(lesson.my_latest_submission, db, locale)
    return CourseLessonOut(**payload)


@router.get("/", response_model=list[CourseOut])
async def list_courses(
    _current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Course).where(Course.provider == "Naviq"))
    courses = [CourseOut.model_validate(item) for item in result.scalars().all()]
    return [await _localize_course(course, db, locale) for course in courses]


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: uuid.UUID,
    _current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    course = CourseOut.model_validate(await _get_internal_course(course_id, db))
    return await _localize_course(course, db, locale)


@router.get("/{course_id}/lessons", response_model=list[CourseLessonOut])
async def list_course_lessons(
    course_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_internal_course(course_id, db)
    result = await db.execute(
        select(CourseLesson).where(CourseLesson.course_id == course.id).order_by(CourseLesson.order.asc())
    )
    lessons = result.scalars().all()
    if not lessons:
        return []

    lesson_ids = [lesson.id for lesson in lessons]
    submissions_result = await db.execute(
        select(LessonHomeworkSubmission)
        .where(
            LessonHomeworkSubmission.user_id == current_user.id,
            LessonHomeworkSubmission.lesson_id.in_(lesson_ids),
        )
        .order_by(LessonHomeworkSubmission.created_at.desc())
    )
    submissions = submissions_result.scalars().all()
    latest_map: dict[uuid.UUID, LessonHomeworkSubmission] = {}
    for item in submissions:
        if item.lesson_id not in latest_map:
            latest_map[item.lesson_id] = item

    serialized = [_serialize_lesson(lesson, latest_map.get(lesson.id)) for lesson in lessons]
    return [await _localize_lesson(item, db, locale) for item in serialized]


@router.get("/{course_id}/lessons/{lesson_id}", response_model=CourseLessonOut)
async def get_course_lesson(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_internal_course(course_id, db)
    lesson = await _get_course_lesson(course.id, lesson_id, db)
    submission_result = await db.execute(
        select(LessonHomeworkSubmission)
        .where(
            LessonHomeworkSubmission.user_id == current_user.id,
            LessonHomeworkSubmission.lesson_id == lesson.id,
        )
        .order_by(LessonHomeworkSubmission.created_at.desc())
        .limit(1)
    )
    latest_submission = submission_result.scalar_one_or_none()
    serialized = _serialize_lesson(lesson, latest_submission)
    return await _localize_lesson(serialized, db, locale)


@router.post("/{course_id}/lessons/{lesson_id}/submit-homework", response_model=HomeworkSubmissionOut)
async def submit_homework(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    body: HomeworkSubmissionCreate,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    course = await _get_internal_course(course_id, db)
    lesson = await _get_course_lesson(course.id, lesson_id, db)
    if not lesson.homework_prompt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Homework has not been configured for this lesson")

    grade = await grade_lesson_homework(
        homework_prompt=lesson.homework_prompt,
        rubric=lesson.homework_rubric,
        student_answer=body.answer,
        locale=locale,
    )
    passed = bool(grade.get("passed"))
    score = int(grade.get("score", 1))
    if score > 10:
        score = int(round(score / 10))
    score = max(1, min(10, score))
    status_value = HomeworkSubmissionStatus.PASSED.value if passed else HomeworkSubmissionStatus.FAILED.value

    submission = LessonHomeworkSubmission(
        lesson_id=lesson.id,
        user_id=current_user.id,
        answer=body.answer,
        status=status_value,
        score=score,
        feedback=str(grade.get("feedback") or ""),
        checked_at=datetime.now(timezone.utc),
    )
    db.add(submission)
    await db.flush()
    await db.refresh(submission)

    if passed:
        previous_pass_result = await db.execute(
            select(LessonHomeworkSubmission.id)
            .where(
                LessonHomeworkSubmission.lesson_id == lesson.id,
                LessonHomeworkSubmission.user_id == current_user.id,
                LessonHomeworkSubmission.status == HomeworkSubmissionStatus.PASSED.value,
                LessonHomeworkSubmission.id != submission.id,
            )
            .limit(1)
        )
        previous_pass = previous_pass_result.scalar_one_or_none()
        if previous_pass is None:
            await grant_xp(
                db,
                current_user,
                30,
                reason="homework_passed",
                payload={"course_id": str(course.id), "lesson_id": str(lesson.id), "score": score},
            )

    await handle_domain_event(
        db,
        current_user,
        "homework_submitted",
        {
            "course_id": str(course.id),
            "lesson_id": str(lesson.id),
            "score": score,
            "passed": passed,
        },
    )

    payload = HomeworkSubmissionOut.model_validate(submission)
    localized = await _localize_submission(payload, db, locale)
    return localized or payload


@router.get("/recommend/{profession_id}", response_model=list[CourseOut])
async def recommend(
    profession_id: str,
    current_user: User = Depends(get_current_user),
    locale: Locale = Depends(get_request_locale),
    db: AsyncSession = Depends(get_db),
):
    gaps, _, _ = await compute_gap_analysis(current_user, uuid.UUID(profession_id), db)
    courses = await recommend_courses(gaps, db)
    serialized = [CourseOut.model_validate(item) for item in courses]
    return [await _localize_course(course, db, locale) for course in serialized]
