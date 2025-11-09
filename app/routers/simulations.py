from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Simulation, Submission, CareerTrack, Certificate
from app.schemas import (
    Simulation as SimulationSchema,
    SimulationCreate,
    Submission as SubmissionSchema,
    SubmissionCreate,
    SubmissionUpdate,
    Certificate as CertificateSchema
)
from app.auth import get_current_active_user
from app.routers.gamification import (
    update_stats_on_simulation_complete,
    update_stats_on_certificate_earned
)
from app.services.simulation_scoring import calculate_simulation_score
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/simulations", tags=["simulations"])


@router.get("/", response_model=List[SimulationSchema])
def get_simulations(
    track_id: Optional[int] = None,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all simulations with optional filtering"""
    query = db.query(Simulation).filter(Simulation.is_active == True)
    
    if track_id:
        query = query.filter(Simulation.track_id == track_id)
    
    if level:
        query = query.filter(Simulation.level == level)
    
    return query.all()


@router.get("/marketing", response_model=List[SimulationSchema])
def get_marketing_simulations(db: Session = Depends(get_db)):
    """Get simulations for marketing track category"""
    return (
        db.query(Simulation)
        .join(CareerTrack, Simulation.track_id == CareerTrack.id)
        .filter(
            Simulation.is_active == True,
            CareerTrack.category == "marketing",
        )
        .all()
    )


@router.get("/{simulation_id}", response_model=SimulationSchema)
def get_simulation(simulation_id: int, db: Session = Depends(get_db)):
    """Get specific simulation by ID"""
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.is_active == True
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=404,
            detail="Simulation not found"
        )
    
    return simulation


@router.post("/{simulation_id}/start", response_model=SubmissionSchema)
def start_simulation(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Start a simulation"""
    # Check if simulation exists
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.is_active == True
    ).first()
    
    if not simulation:
        raise HTTPException(
            status_code=404,
            detail="Simulation not found"
        )
    
    # Check if user already has a submission for this simulation
    existing_submission = db.query(Submission).filter(
        Submission.user_id == current_user.id,
        Submission.simulation_id == simulation_id
    ).first()
    
    if existing_submission:
        return existing_submission
    
    # Create new submission
    submission = Submission(
        user_id=current_user.id,
        simulation_id=simulation_id,
        answers={},
        completed=False
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission


@router.put("/{simulation_id}/submit", response_model=SubmissionSchema)
def submit_simulation(
    simulation_id: int,
    submission_update: SubmissionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit simulation answers"""
    # Get existing submission
    submission = db.query(Submission).filter(
        Submission.user_id == current_user.id,
        Submission.simulation_id == simulation_id
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Simulation not started"
        )
    
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id
    ).first()

    if not simulation:
        raise HTTPException(
            status_code=404,
            detail="Simulation not found"
        )

    # Update submission
    submission.answers = submission_update.answers
    
    if submission_update.completed:
        submission.completed = True
        submission.completed_at = datetime.utcnow()
        score_result = calculate_simulation_score(simulation, submission.answers)
        submission.score = score_result["score"]
        
        # Generate certificate if completed
        cert_created = _generate_certificate(current_user.id, simulation_id, db)
        
        # Update gamification stats
        try:
            update_stats_on_simulation_complete(
                simulation_id=simulation_id,
                score=submission.score or 0,
                current_user=current_user,
                db=db
            )
            
            if cert_created:
                update_stats_on_certificate_earned(
                    current_user=current_user,
                    db=db
                )
        except Exception as e:
            # Log error but don't fail the submission
            print(f"Error updating gamification stats: {e}")
    
    db.commit()
    db.refresh(submission)
    
    return submission


@router.get("/{simulation_id}/submission", response_model=SubmissionSchema)
def get_submission(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's submission for a simulation"""
    submission = db.query(Submission).filter(
        Submission.user_id == current_user.id,
        Submission.simulation_id == simulation_id
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found"
        )
    
    return submission


@router.get("/my/submissions", response_model=List[SubmissionSchema])
def get_my_submissions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all user's submissions"""
    submissions = db.query(Submission).filter(
        Submission.user_id == current_user.id
    ).all()
    
    return submissions

def _generate_certificate(user_id: int, simulation_id: int, db: Session) -> bool:
    """Generate certificate for completed simulation. Returns True if certificate was created, False if it already existed."""
    # Check if certificate already exists
    existing_cert = db.query(Certificate).filter(
        Certificate.user_id == user_id,
        Certificate.simulation_id == simulation_id
    ).first()
    
    if existing_cert:
        return False
    
    # Generate unique certificate ID
    certificate_id = str(uuid.uuid4())
    
    # Create certificate record
    certificate = Certificate(
        user_id=user_id,
        simulation_id=simulation_id,
        certificate_id=certificate_id,
        pdf_url=f"/certificates/{certificate_id}.pdf"  # Will be generated later
    )
    
    db.add(certificate)
    db.commit()
    return True
