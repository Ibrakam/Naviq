from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from app.auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_password_hash,
)
from app.config import settings
from app.data_loader import TRACK_SLUG_TO_NAME
from app.database import get_db
from app.models import AssessmentSession, CareerTrack, Simulation, Submission, User
from app.routers.gamification import (
    update_stats_on_assessment_complete,
    update_stats_on_certificate_earned,
    update_stats_on_simulation_complete,
)
from app.routers.simulations import _generate_certificate
from app.services.simulation_scoring import calculate_simulation_score

router = APIRouter(prefix="/make-server-a1779b8e", tags=["career-platform"])

TRACK_NAME_TO_SLUG = {name: slug for slug, name in TRACK_SLUG_TO_NAME.items()}


class LoginPayload(BaseModel):
    email: str
    password: str


class SignupPayload(BaseModel):
    email: str
    password: str
    name: str


class AssessmentAnswerPayload(BaseModel):
    questionId: str
    value: int
    category: Optional[str] = None


class AssessmentSubmissionPayload(BaseModel):
    answers: List[AssessmentAnswerPayload]


class SimulationProgressPayload(BaseModel):
    stepIndex: int
    answers: List[Dict[str, Any]] = Field(default_factory=list)
    completed: bool = False


class SimulationCreatePayload(BaseModel):
    title: str
    description: Optional[str] = None
    track: str
    duration: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"
    company: Optional[str] = None
    steps: List[Dict[str, Any]] = []


@router.post("/login")
def supabase_login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires,
    )

    return {
        "accessToken": access_token,
        "user": _serialize_user(user),
    }


@router.post("/signup")
def supabase_signup(payload: SignupPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed_password,
        role="student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"user": _serialize_user(user)}


@router.get("/profile")
def supabase_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = _build_profile(current_user, db)
    return {"profile": profile}


@router.post("/assessment/submit")
def supabase_assessment_submit(
    submission: AssessmentSubmissionPayload,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    recommendations = _generate_assessment_recommendations(db, submission.answers)

    session = (
        db.query(AssessmentSession)
        .filter(AssessmentSession.user_id == current_user.id)
        .first()
    )
    if not session:
        session = AssessmentSession(user_id=current_user.id)
        db.add(session)

    answers_dict = {answer.questionId: answer.value for answer in submission.answers}
    session.answers = answers_dict
    session.result = recommendations
    session.status = "completed"
    session.completed_at = datetime.utcnow()

    db.commit()

    try:
        update_stats_on_assessment_complete(current_user=current_user, db=db)
    except Exception as exc:  # pragma: no cover - best effort
        print(f"Gamification update failed: {exc}")

    return {"recommendations": recommendations}


@router.get("/simulations")
def supabase_simulations(
    track: Optional[str] = None,
    db: Session = Depends(get_db),
):
    base_query = (
        db.query(Simulation)
        .options(joinedload(Simulation.track))
        .filter(Simulation.is_active == True)
        .filter(Simulation.company.isnot(None))
    )

    if track:
        track_name = TRACK_SLUG_TO_NAME.get(track)
        query = base_query.join(CareerTrack, Simulation.track_id == CareerTrack.id)
        if track == "marketing":
            query = query.filter(CareerTrack.category == "marketing")
        elif track_name:
            query = query.filter(CareerTrack.name == track_name)
        else:
            query = query.filter(CareerTrack.category == track)
        simulations = query.order_by(Simulation.id.asc()).all()
        return {
            "items": [_serialize_simulation(sim) for sim in simulations],
            "more_available": False,
        }

    simulations = (
        base_query
        .join(CareerTrack, Simulation.track_id == CareerTrack.id)
        .filter(CareerTrack.category == "marketing")
        .order_by(Simulation.id.asc())
        .all()
    )
    return {
        "items": [_serialize_simulation(sim) for sim in simulations],
        "message": "Additional simulations are still in development",
        "more_available": False,
    }


@router.get("/simulations/{simulation_id}")
def supabase_simulation_detail(simulation_id: int, db: Session = Depends(get_db)):
    simulation = (
        db.query(Simulation)
        .options(joinedload(Simulation.track))
        .filter(Simulation.id == simulation_id)
        .first()
    )
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"simulation": _serialize_simulation(simulation)}


@router.post("/simulations/{simulation_id}/progress")
def supabase_save_progress(
    simulation_id: int,
    payload: SimulationProgressPayload,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")

    submission = (
        db.query(Submission)
        .filter(
            Submission.user_id == current_user.id,
            Submission.simulation_id == simulation_id,
        )
        .first()
    )

    if not submission:
        submission = Submission(
            user_id=current_user.id,
            simulation_id=simulation_id,
            answers={},
            completed=False,
        )
        db.add(submission)

    submission.answers = {
        "stepIndex": payload.stepIndex,
        "entries": payload.answers,
    }

    result = None
    if payload.completed:
        submission.completed = True
        submission.completed_at = datetime.utcnow()
        score_result = calculate_simulation_score(simulation, submission.answers)
        submission.score = score_result["score"]
        result = {
            "score": score_result["score"],
            "maxScore": score_result["max_score"],
            "percentage": score_result["percentage"],
            "passed": score_result["passed"],
        }

        cert_created = _generate_certificate(
            user_id=current_user.id,
            simulation_id=simulation_id,
            db=db,
        )

        try:
            update_stats_on_simulation_complete(
                simulation_id=simulation_id,
                score=score_result["score"],
                current_user=current_user,
                db=db,
            )
            if cert_created:
                update_stats_on_certificate_earned(
                    current_user=current_user,
                    db=db,
                )
        except Exception as exc:  # pragma: no cover
            print(f"Gamification update failed: {exc}")
    else:
        submission.completed = False
        submission.completed_at = None
        submission.score = None

    db.commit()

    response = {"success": True}
    if result:
        response["result"] = result
    return response


@router.get("/simulations/{simulation_id}/progress")
def supabase_get_progress(
    simulation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    submission = (
        db.query(Submission)
        .filter(
            Submission.user_id == current_user.id,
            Submission.simulation_id == simulation_id,
        )
        .first()
    )
    if not submission:
        return {"progress": None}

    simulation = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    result = (
        calculate_simulation_score(simulation, submission.answers)
        if simulation and submission.completed
        else None
    )

    answers = submission.answers or {}
    entries = answers.get("entries") if isinstance(answers, dict) else answers

    return {
        "progress": {
            "stepIndex": answers.get("stepIndex", 0) if isinstance(answers, dict) else 0,
            "answers": entries or [],
            "completed": submission.completed,
            "result": result,
        }
    }


@router.post("/admin/simulations")
def supabase_admin_create_simulation(
    payload: SimulationCreatePayload,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)

    track_name = TRACK_SLUG_TO_NAME.get(payload.track)
    if not track_name:
        raise HTTPException(status_code=400, detail="Unknown track")

    track_obj = db.query(CareerTrack).filter(CareerTrack.name == track_name).first()
    if not track_obj:
        raise HTTPException(status_code=400, detail="Track is not configured")

    steps = []
    for idx, step in enumerate(payload.steps, start=1):
        step_copy = dict(step)
        step_copy.setdefault("id", idx)
        steps.append(step_copy)

    simulation = Simulation(
        title=payload.title,
        description=payload.description,
        company=payload.company,
        track_id=track_obj.id,
        steps=steps,
        duration=payload.duration,
        level=payload.difficulty or "Intermediate",
        is_active=True,
    )
    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    return {"simulation": _serialize_simulation(simulation)}


@router.get("/admin/analytics")
def supabase_admin_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)

    total_users = db.query(User).count()
    total_simulations = (
        db.query(Simulation)
        .filter(Simulation.is_active == True, Simulation.company.isnot(None))
        .count()
    )
    completed_assessments = (
        db.query(AssessmentSession)
        .filter(AssessmentSession.status == "completed")
        .count()
    )
    total_completions = (
        db.query(Submission)
        .filter(Submission.completed == True)
        .count()
    )

    analytics = {
        "totalUsers": total_users,
        "totalSimulations": total_simulations,
        "completedAssessments": completed_assessments,
        "totalCompletions": total_completions,
    }
    return {"analytics": analytics}


def _serialize_user(user: User) -> Dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "google_id": user.google_id,
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "education_status": user.education_status,
        "school_name": user.school_name,
        "graduation_date": user.graduation_date.isoformat() if user.graduation_date else None,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }


def _build_profile(user: User, db: Session) -> Dict[str, Any]:
    assessment_session = (
        db.query(AssessmentSession)
        .filter(
            AssessmentSession.user_id == user.id,
            AssessmentSession.status == "completed",
        )
        .first()
    )

    raw_results = assessment_session.result if assessment_session else None
    assessment_results = _normalize_assessment_results(raw_results)
    recommended_tracks = []
    if assessment_results:
        recommended_tracks = [
            TRACK_NAME_TO_SLUG.get(track.get("name"))
            or track.get("id")
            for track in assessment_results.get("tracks", [])
            if track
        ]

    submissions = (
        db.query(Submission)
        .options(joinedload(Submission.simulation).joinedload(Simulation.track))
        .filter(Submission.user_id == user.id)
        .all()
    )

    simulation_results = []
    completed_simulations: List[str] = []
    for submission in submissions:
        simulation = submission.simulation
        if not simulation:
            continue

        if submission.completed:
            completed_simulations.append(str(simulation.id))
            score = calculate_simulation_score(simulation, submission.answers or {})
            simulation_results.append(
                {
                    "simulationId": str(simulation.id),
                    "simulationTitle": simulation.title,
                    "passed": score["passed"],
                    "score": score["score"],
                    "maxScore": score["max_score"],
                    "percentage": score["percentage"],
                    "completedAt": submission.completed_at.isoformat()
                    if submission.completed_at
                    else None,
                }
            )

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "google_id": user.google_id,
        "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "education_status": user.education_status,
        "school_name": user.school_name,
        "graduation_date": user.graduation_date.isoformat() if user.graduation_date else None,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "completedSimulations": completed_simulations,
        "assessmentCompleted": assessment_session is not None,
        "recommendedTracks": [track for track in recommended_tracks if track],
        "assessmentResults": assessment_results,
        "simulationResults": simulation_results,
    }


def _serialize_simulation(simulation: Simulation) -> Dict[str, Any]:
    track_slug = None
    if simulation.track:
        track_slug = TRACK_NAME_TO_SLUG.get(simulation.track.name)
        if not track_slug:
            track_slug = simulation.track.category

    return {
        "id": str(simulation.id),
        "title": simulation.title,
        "description": simulation.description,
        "company": simulation.company,
        "track": track_slug,
        "duration": simulation.duration,
        "difficulty": simulation.level,
        "steps": simulation.steps or [],
    }


def _normalize_assessment_results(result: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not result:
        return None
    if "tracks" in result:
        return result
    normalized = dict(result)
    if "top_tracks" in normalized and "tracks" not in normalized:
        normalized["tracks"] = normalized.get("top_tracks")
    return normalized


def _generate_assessment_recommendations(
    db: Session, answers: List[AssessmentAnswerPayload]
) -> Dict[str, Any]:
    tracks = [
        {"id": "frontend", "name": "Frontend Development", "score": 0, "icon": "Code"},
        {"id": "backend", "name": "Backend Development", "score": 0, "icon": "Server"},
        {"id": "data", "name": "Data Analytics", "score": 0, "icon": "BarChart3"},
        {"id": "design", "name": "UX/UI Design", "score": 0, "icon": "Palette"},
        {"id": "marketing", "name": "Digital Marketing", "score": 0, "icon": "TrendingUp"},
        {"id": "product", "name": "Product Management", "score": 0, "icon": "Target"},
    ]

    track_scores = {track["id"]: track for track in tracks}

    for answer in answers:
        value = answer.value or 0
        if answer.questionId == "q1" and value >= 4:
            track_scores["frontend"]["score"] += value
            track_scores["backend"]["score"] += value
        if answer.questionId == "q2" and value >= 4:
            track_scores["design"]["score"] += value * 1.5
            track_scores["marketing"]["score"] += value
        if answer.questionId == "q3" and value >= 4:
            track_scores["data"]["score"] += value * 1.5
        if answer.questionId == "q4" and value >= 4:
            track_scores["marketing"]["score"] += value
            track_scores["product"]["score"] += value * 1.5
        if answer.questionId == "q5" and value >= 4:
            track_scores["design"]["score"] += value * 2

    sorted_tracks = sorted(tracks, key=lambda t: t["score"], reverse=True)
    top_tracks = sorted_tracks[:2]

    suggested_simulations = _get_simulations_by_track(db, top_tracks[0]["id"])

    return {
        "tracks": top_tracks,
        "explanation": f"Based on your responses, you show strong aptitude for {top_tracks[0]['name']} and {top_tracks[1]['name']}. Your interests align well with these career paths.",
        "suggestedCourses": [
            {"title": f"Introduction to {top_tracks[0]['name']}", "platform": "Coursera"},
            {"title": f"{top_tracks[1]['name']} Fundamentals", "platform": "Udemy"},
        ],
        "suggestedSimulations": suggested_simulations,
        "plan": _generate_seven_day_plan(top_tracks[0]["name"]),
    }


def _get_simulations_by_track(db: Session, track_slug: str) -> List[Dict[str, Any]]:
    track_name = TRACK_SLUG_TO_NAME.get(track_slug)
    if not track_name:
        return []

    track = db.query(CareerTrack).filter(CareerTrack.name == track_name).first()
    if not track:
        return []

    simulations = (
        db.query(Simulation)
        .filter(
            Simulation.track_id == track.id,
            Simulation.is_active == True,
            Simulation.company.isnot(None),
        )
        .order_by(Simulation.id.asc())
        .limit(3)
        .all()
    )

    return [
        {
            "id": str(sim.id),
            "title": sim.title,
            "duration": sim.duration,
        }
        for sim in simulations
    ]


def _generate_seven_day_plan(track_name: str) -> List[Dict[str, Any]]:
    return [
        {"day": 1, "task": f"Learn the basics of {track_name}"},
        {"day": 2, "task": "Complete your first simulation"},
        {"day": 3, "task": "Review fundamentals and take notes"},
        {"day": 4, "task": "Start a second simulation"},
        {"day": 5, "task": "Practice core skills"},
        {"day": 6, "task": "Complete final simulation"},
        {"day": 7, "task": "Review progress and plan next steps"},
    ]


def _ensure_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
