from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import User, AssessmentSession, Simulation, Submission, Certificate
from app.schemas import AnalyticsDashboard
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
