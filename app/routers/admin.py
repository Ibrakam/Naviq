from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import User, AssessmentSession, Simulation, Submission, Certificate, Course, CourseEnrollment
from app.schemas import AnalyticsDashboard, CourseCreate, CourseUpdate, Course as CourseSchema
from app.auth import get_current_active_user
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_active_user)):
    """Require admin role for admin endpoints"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user


@router.get("/dashboard", response_model=AnalyticsDashboard)
def get_admin_dashboard(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard analytics"""
    
    # Basic metrics
    total_users = db.query(User).count()
    completed_assessments = db.query(AssessmentSession).filter(
        AssessmentSession.status == "completed"
    ).count()
    active_simulations = db.query(Simulation).filter(
        Simulation.is_active == True
    ).count()
    issued_certificates = db.query(Certificate).count()
    
    # User registrations by day (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    user_registrations = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= seven_days_ago
    ).group_by(
        func.date(User.created_at)
    ).all()
    
    user_registrations_by_day = [
        {"date": str(reg.date), "count": reg.count} 
        for reg in user_registrations
    ]
    
    # Popular tracks (based on simulation submissions)
    popular_tracks = db.query(
        Simulation.track_id,
        func.count(Submission.id).label('submission_count')
    ).join(
        Submission, Simulation.id == Submission.simulation_id
    ).group_by(
        Simulation.track_id
    ).order_by(
        desc('submission_count')
    ).limit(5).all()
    
    popular_tracks_data = [
        {"track_id": track.track_id, "submissions": track.submission_count}
        for track in popular_tracks
    ]
    
    # Completion rates
    total_submissions = db.query(Submission).count()
    completed_submissions = db.query(Submission).filter(
        Submission.completed == True
    ).count()
    
    completion_rate = (completed_submissions / total_submissions * 100) if total_submissions > 0 else 0
    
    return AnalyticsDashboard(
        total_users=total_users,
        completed_assessments=completed_assessments,
        active_simulations=active_simulations,
        issued_certificates=issued_certificates,
        user_registrations_by_day=user_registrations_by_day,
        popular_tracks=popular_tracks_data,
        completion_rates={"overall": completion_rate}
    )


@router.get("/users")
def get_all_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/simulations")
def get_all_simulations(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all simulations (admin only)"""
    simulations = db.query(Simulation).all()
    return simulations


@router.post("/simulations")
def create_simulation(
    simulation_data: dict,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new simulation (admin only)"""
    # This would need proper validation and schema
    # For now, just a placeholder
    return {"message": "Simulation creation endpoint - to be implemented"}


# Course Management Endpoints
@router.get("/courses", response_model=List[CourseSchema])
def get_all_courses_admin(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all courses (including inactive) - admin only"""
    courses = db.query(Course).all()
    return courses


@router.post("/courses", response_model=CourseSchema, status_code=status.HTTP_201_CREATED)
def create_course(
    course_data: CourseCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create new course - admin only"""
    new_course = Course(**course_data.dict())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course


@router.put("/courses/{course_id}", response_model=CourseSchema)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update existing course - admin only"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Update only provided fields
    for field, value in course_data.dict(exclude_unset=True).items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return course


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete course - admin only"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}


@router.get("/courses/{course_id}/enrollments")
def get_course_enrollments(
    course_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all enrollments for a specific course - admin only"""
    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id
    ).all()
    return enrollments


@router.put("/courses/{course_id}/content")
def update_course_content(
    course_id: int,
    content: Dict[str, Any],
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update course content (modules and lessons) - admin only"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Update content
    course.content = content.get("modules", [])

    # Recalculate lessons count
    total_lessons = 0
    for module in course.content:
        total_lessons += len(module.get("lessons", []))
    course.lessons_count = total_lessons

    db.commit()
    db.refresh(course)

    return {
        "message": "Course content updated successfully",
        "lessons_count": total_lessons
    }


@router.post("/courses/{course_id}/link-simulation")
def link_simulation_to_course(
    course_id: int,
    data: Dict[str, Any],
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Link a simulation to a course with unlock requirements - admin only"""
    from app.models import Simulation

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    simulation_id = data.get("simulation_id")
    required_progress = data.get("required_progress", 100)
    unlock_message = data.get("unlock_message")

    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    # Link simulation to course
    simulation.course_id = course_id
    simulation.required_progress = required_progress
    simulation.unlock_message = unlock_message or f"Complete {required_progress}% of {course.title} to unlock this simulation!"

    db.commit()

    return {
        "message": "Simulation linked to course successfully",
        "simulation_id": simulation_id,
        "course_id": course_id,
        "required_progress": required_progress
    }


@router.get("/courses/analytics")
def get_courses_analytics(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get analytics for all courses - admin only"""
    courses = db.query(Course).all()

    analytics = []
    for course in courses:
        enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course.id
        ).all()

        total_enrollments = len(enrollments)
        completed_count = sum(1 for e in enrollments if e.completed)
        avg_progress = sum(e.progress for e in enrollments) / total_enrollments if total_enrollments > 0 else 0

        analytics.append({
            "course_id": course.id,
            "title": course.title,
            "track": course.track,
            "total_enrollments": total_enrollments,
            "completed_count": completed_count,
            "completion_rate": (completed_count / total_enrollments * 100) if total_enrollments > 0 else 0,
            "avg_progress": round(avg_progress, 2)
        })

    return {"courses": analytics}
