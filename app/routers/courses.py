from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Course, CourseEnrollment, User, LessonProgress, Simulation, UserStats
from app.schemas import CourseCreate, CourseUpdate, Course as CourseSchema, CourseEnrollmentCreate
from app.auth import get_current_active_user
from typing import List, Dict, Any
import json

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("/", response_model=List[CourseSchema])
def get_all_courses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    track: str = None
):
    """Get all active courses (public endpoint)"""
    query = db.query(Course).filter(Course.is_active == True)

    if track:
        query = query.filter(Course.track == track)

    courses = query.offset(skip).limit(limit).all()
    return courses


@router.get("/{course_id}", response_model=CourseSchema)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get specific course by ID"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/enroll")
def enroll_in_course(
    enrollment: CourseEnrollmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Enroll current user in a course"""
    # Check if course exists
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == enrollment.course_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    # Create enrollment
    new_enrollment = CourseEnrollment(
        user_id=current_user.id,
        course_id=enrollment.course_id
    )

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return {
        "message": "Successfully enrolled in course",
        "enrollment_id": new_enrollment.id
    }


@router.get("/my/enrollments")
def get_my_enrollments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all courses the current user is enrolled in"""
    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id
    ).all()

    return enrollments


@router.put("/enrollment/{enrollment_id}/progress")
def update_enrollment_progress(
    enrollment_id: int,
    progress: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update progress for a course enrollment"""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.id == enrollment_id,
        CourseEnrollment.user_id == current_user.id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.progress = min(100, max(0, progress))

    # Mark as completed if progress reaches 100%
    if enrollment.progress == 100 and not enrollment.completed:
        from datetime import datetime
        enrollment.completed = True
        enrollment.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(enrollment)

    return {
        "message": "Progress updated",
        "progress": enrollment.progress,
        "completed": enrollment.completed
    }


@router.get("/{course_id}/modules")
def get_course_modules(
    course_id: int,
    db: Session = Depends(get_db)
):
    """Get all modules for a course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return {
        "course_id": course.id,
        "modules": course.content or []
    }


@router.get("/{course_id}/progress")
def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's progress for a specific course"""
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id
    ).first()

    if not enrollment:
        return {
            "enrolled": False,
            "progress": 0,
            "completed": False,
            "lessons_completed": {},
            "unlocked_simulations": []
        }

    # Parse JSON fields
    lessons_completed = enrollment.lessons_completed or {}
    if isinstance(lessons_completed, str):
        lessons_completed = json.loads(lessons_completed)

    unlocked_simulations = enrollment.unlocked_simulations or []
    if isinstance(unlocked_simulations, str):
        unlocked_simulations = json.loads(unlocked_simulations)

    return {
        "enrolled": True,
        "progress": enrollment.progress,
        "completed": enrollment.completed,
        "current_lesson_id": enrollment.current_lesson_id,
        "lessons_completed": lessons_completed,
        "unlocked_simulations": unlocked_simulations,
        "last_accessed": enrollment.last_accessed,
        "enrolled_at": enrollment.enrolled_at
    }


@router.put("/{course_id}/lessons/{lesson_id}/complete")
def complete_lesson(
    course_id: int,
    lesson_id: int,
    module_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a lesson as completed and award XP"""
    # Get enrollment
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")

    # Get course
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Update lessons_completed
    lessons_completed = enrollment.lessons_completed or {}
    if isinstance(lessons_completed, str):
        lessons_completed = json.loads(lessons_completed)

    # Check if already completed
    if str(lesson_id) in lessons_completed:
        return {
            "message": "Lesson already completed",
            "xp_awarded": 0,
            "progress": enrollment.progress
        }

    # Mark as completed
    lessons_completed[str(lesson_id)] = datetime.utcnow().isoformat()
    enrollment.lessons_completed = json.dumps(lessons_completed)
    enrollment.current_lesson_id = lesson_id
    enrollment.last_accessed = datetime.utcnow()

    # Create or update lesson progress record
    lesson_progress = db.query(LessonProgress).filter(
        LessonProgress.enrollment_id == enrollment.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if not lesson_progress:
        lesson_progress = LessonProgress(
            enrollment_id=enrollment.id,
            lesson_id=lesson_id,
            module_id=module_id,
            completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(lesson_progress)
    else:
        lesson_progress.completed = True
        lesson_progress.completed_at = datetime.utcnow()

    # Calculate new progress
    total_lessons = course.lessons_count if course.lessons_count > 0 else 1
    completed_count = len(lessons_completed)
    new_progress = min(100, int((completed_count / total_lessons) * 100))
    enrollment.progress = new_progress

    # Check if course is completed
    if new_progress == 100 and not enrollment.completed:
        enrollment.completed = True
        enrollment.completed_at = datetime.utcnow()

    # Award XP (10 XP per lesson)
    xp_awarded = 10
    user_stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if user_stats:
        user_stats.experience_points += xp_awarded
        user_stats.total_points += xp_awarded
        user_stats.last_active_date = datetime.utcnow()

        # Level up if needed
        while user_stats.experience_points >= user_stats.experience_to_next_level:
            user_stats.experience_points -= user_stats.experience_to_next_level
            user_stats.current_level += 1
            user_stats.experience_to_next_level = user_stats.current_level * 100

    # Check for module completion and unlock simulations
    module = None
    for mod in (course.content or []):
        if mod.get("id") == module_id:
            module = mod
            break

    unlocked_simulation_ids = []
    if module:
        # Check if all lessons in module are completed
        module_lessons = module.get("lessons", [])
        module_completed = all(
            str(lesson.get("id")) in lessons_completed
            for lesson in module_lessons
        )

        if module_completed:
            # Award module XP
            if user_stats:
                user_stats.experience_points += 50
                user_stats.total_points += 50
                xp_awarded += 50

            # Unlock simulation if exists
            simulation_id = module.get("simulation_id")
            if simulation_id:
                unlocked_sims = enrollment.unlocked_simulations or []
                if isinstance(unlocked_sims, str):
                    unlocked_sims = json.loads(unlocked_sims)

                if simulation_id not in unlocked_sims:
                    unlocked_sims.append(simulation_id)
                    enrollment.unlocked_simulations = json.dumps(unlocked_sims)
                    unlocked_simulation_ids.append(simulation_id)

    db.commit()
    db.refresh(enrollment)

    return {
        "message": "Lesson completed successfully",
        "xp_awarded": xp_awarded,
        "progress": enrollment.progress,
        "module_completed": len(unlocked_simulation_ids) > 0,
        "unlocked_simulations": unlocked_simulation_ids,
        "current_level": user_stats.current_level if user_stats else 1
    }


@router.get("/{course_id}/simulations")
def get_course_simulations(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all simulations linked to this course with unlock status"""
    # Get enrollment
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id
    ).first()

    user_progress = enrollment.progress if enrollment else 0
    unlocked_sims = []
    if enrollment and enrollment.unlocked_simulations:
        unlocked_sims = enrollment.unlocked_simulations
        if isinstance(unlocked_sims, str):
            unlocked_sims = json.loads(unlocked_sims)

    # Get simulations
    simulations = db.query(Simulation).filter(
        Simulation.course_id == course_id,
        Simulation.is_active == True
    ).all()

    result = []
    for sim in simulations:
        is_unlocked = (
            sim.id in unlocked_sims or
            user_progress >= sim.required_progress
        )
        result.append({
            "id": sim.id,
            "title": sim.title,
            "description": sim.description,
            "duration": sim.duration,
            "level": sim.level,
            "required_progress": sim.required_progress,
            "unlock_message": sim.unlock_message,
            "is_unlocked": is_unlocked,
            "user_progress": user_progress
        })

    return {"simulations": result}
