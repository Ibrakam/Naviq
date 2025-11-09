from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, AssessmentSession
from app.schemas import (
    AssessmentQuestion,
    AssessmentSubmission,
    AssessmentResult,
)
from app.auth import get_current_active_user
from app.ai_service import AIAssessmentService
from app.routers.gamification import update_stats_on_assessment_complete
from datetime import datetime

router = APIRouter(prefix="/api/assessment", tags=["assessment"])
ai_service = AIAssessmentService()


@router.get("/questions", response_model=List[AssessmentQuestion])
def get_assessment_questions(db: Session = Depends(get_db)):
    """Get all assessment questions"""
    return ai_service.generate_assessment_questions(db)


@router.post("/submit", response_model=AssessmentResult)
def submit_assessment(
    submission: AssessmentSubmission,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit assessment answers and get AI recommendations"""
    
    # Check if user already has a completed assessment
    existing_session = db.query(AssessmentSession).filter(
        AssessmentSession.user_id == current_user.id,
        AssessmentSession.status == "completed"
    ).first()
    
    if existing_session:
        # Return existing results
        return AssessmentResult(**existing_session.result)
    
    # Normalize answers into {question_id: "A"/"B"/...}
    answers_dict = {
        int(answer.question_id): str(answer.answer).strip().upper()
        for answer in submission.answers
    }

    # Analyze answers with AI
    result, _ = ai_service.analyze_assessment_results(answers_dict, db)
    
    # Save or update assessment session
    assessment_session = db.query(AssessmentSession).filter(
        AssessmentSession.user_id == current_user.id,
        AssessmentSession.status == "draft"
    ).first()
    
    if not assessment_session:
        assessment_session = AssessmentSession(
            user_id=current_user.id,
            status="draft"
        )
        db.add(assessment_session)
    
    # Convert answers to dict format for storage
    answers_json = {str(q_id): value for q_id, value in answers_dict.items()}
    assessment_session.answers = answers_json
    assessment_session.result = result.dict()
    assessment_session.status = "completed"
    assessment_session.completed_at = datetime.utcnow()
    
    db.commit()

    # Try retraining ML модель, когда достаточно данных
    try:
        ai_service.maybe_retrain_model(db)
    except Exception as exc:
        print(f"Career model retrain skipped: {exc}")
    
    # Update gamification stats
    try:
        update_stats_on_assessment_complete(
            current_user=current_user,
            db=db
        )
    except Exception as e:
        # Log error but don't fail the assessment submission
        print(f"Error updating gamification stats: {e}")
    
    return result


@router.get("/result", response_model=AssessmentResult)
def get_assessment_result(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's assessment results"""
    assessment_session = db.query(AssessmentSession).filter(
        AssessmentSession.user_id == current_user.id,
        AssessmentSession.status == "completed"
    ).first()
    
    if not assessment_session:
        raise HTTPException(
            status_code=404,
            detail="Assessment not completed"
        )
    
    return AssessmentResult(**assessment_session.result)


@router.delete("/reset")
def reset_assessment(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reset user's assessment to start over"""
    assessment_session = db.query(AssessmentSession).filter(
        AssessmentSession.user_id == current_user.id
    ).first()
    
    if assessment_session:
        db.delete(assessment_session)
        db.commit()
    
    return {"message": "Assessment reset successfully"}
