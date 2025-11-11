from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from app.database import get_db
from app.models import User, AssessmentSession
from app.schemas import (
    AssessmentQuestion,
    AssessmentSubmission,
    AssessmentResult,
    AssessmentChatQuestion,
    AssessmentChatAnswer,
    AssessmentChatAnswerResponse,
    AssessmentChatSession,
    AssessmentChatProgress,
)
from app.auth import get_current_active_user
from app.ai_service import AIAssessmentService
from app.routers.gamification import update_stats_on_assessment_complete
from datetime import datetime

router = APIRouter(prefix="/api/assessment", tags=["assessment"])
ai_service = AIAssessmentService()


def _question_order_map(questions) -> Dict[int, int]:
    return {question.id: idx + 1 for idx, question in enumerate(questions)}


def _question_to_chat_schema(question, order_map: Dict[int, int]) -> AssessmentChatQuestion:
    return AssessmentChatQuestion(
        id=question.id,
        role=(question.role or "assistant"),
        question_text=question.question,
        type=(question.type or "choice"),
        options=question.options or [],
        category=question.category,
        order=question.display_order or order_map.get(question.id),
    )


def _assistant_prompt(question, order_map: Dict[int, int]) -> Dict[str, Any]:
    return {
        "role": question.role or "assistant",
        "content": question.question,
        "question_id": question.id,
        "type": question.type or "choice",
        "options": question.options or [],
        "category": question.category,
        "order": question.display_order or order_map.get(question.id),
    }


def _answered_question_ids(messages: Optional[List[Dict[str, Any]]]) -> List[int]:
    if not messages:
        return []
    answered = []
    for message in messages:
        if (
            isinstance(message, dict)
            and message.get("role") == "user"
            and message.get("question_id")
        ):
            try:
                answered.append(int(message["question_id"]))
            except (TypeError, ValueError):
                continue
    return answered


def _find_next_question(questions, messages: Optional[List[Dict[str, Any]]]):
    answered_ids = set(_answered_question_ids(messages))
    for question in questions:
        if question.id not in answered_ids:
            return question
    return None


def _ensure_prompt(messages: List[Dict[str, Any]], questions, order_map: Dict[int, int]) -> List[Dict[str, Any]]:
    next_question = _find_next_question(questions, messages)
    if not next_question:
        return messages
    assistant_messages = [
        msg for msg in messages if isinstance(msg, dict) and msg.get("role") in ("assistant", "system")
    ]
    if assistant_messages and assistant_messages[-1].get("question_id") == next_question.id:
        return messages
    messages.append(_assistant_prompt(next_question, order_map))
    return messages


def _build_progress(messages: Optional[List[Dict[str, Any]]], total_questions: int) -> AssessmentChatProgress:
    answered = len(set(_answered_question_ids(messages)))
    return AssessmentChatProgress(current=min(answered, total_questions), total=total_questions)


def _option_code_map(question) -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    if not question.options:
        return mapping
    for option in question.options:
        code = str(option.get("code", "")).upper()
        mapping[code] = option.get("text", "")
    return mapping


def _normalize_user_answer(question, raw_answer: Any) -> tuple[str, str]:
    q_type = (question.type or "choice").lower()
    if q_type == "choice":
        code = str(raw_answer or "").strip().upper()
        option_map = _option_code_map(question)
        if not code or code not in option_map:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid answer option",
            )
        return code, option_map[code] or code

    answer_text = str(raw_answer or "").strip()
    if not answer_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Answer is required",
        )
    return answer_text, answer_text


@router.get("/questions", response_model=List[AssessmentQuestion])
def get_assessment_questions(db: Session = Depends(get_db)):
    """Get all assessment questions"""
    return ai_service.generate_assessment_questions(db)


@router.get("/chat-questions", response_model=List[AssessmentChatQuestion])
def get_chat_questions(db: Session = Depends(get_db)):
    """Chat-friendly list of assessment questions."""
    return ai_service.generate_chat_questions(db)


@router.get("/session/current", response_model=AssessmentChatSession)
def get_current_chat_session(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    questions = ai_service.get_ordered_question_models(db)
    if not questions:
        raise HTTPException(status_code=404, detail="Assessment questions are not configured")

    session = (
        db.query(AssessmentSession)
        .filter(AssessmentSession.user_id == current_user.id)
        .order_by(AssessmentSession.created_at.desc())
        .first()
    )

    created = False
    if not session:
        session = AssessmentSession(
            user_id=current_user.id,
            status="draft",
            answers={},
            messages=[],
        )
        db.add(session)
        db.flush()
        created = True

    messages = list(session.messages or [])
    order_map = _question_order_map(questions)
    mutated = created

    if session.status == "draft":
        updated_messages = _ensure_prompt(messages, questions, order_map)
        if len(updated_messages) != len(messages):
            messages = updated_messages
            mutated = True

    if mutated:
        session.messages = messages
        db.add(session)
        db.commit()
        db.refresh(session)
    else:
        db.refresh(session)

    progress = _build_progress(messages, len(questions))
    result_payload = AssessmentResult(**session.result) if session.result else None
    next_question_schema: Optional[AssessmentChatQuestion] = None
    if session.status == "draft":
        next_model = _find_next_question(questions, messages)
        if next_model:
            next_question_schema = _question_to_chat_schema(next_model, order_map)

    return AssessmentChatSession(
        session_id=session.id,
        status=session.status,
        progress=progress,
        messages=messages,
        result=result_payload,
        next_question=next_question_schema,
    )


@router.post("/chat-answer", response_model=AssessmentChatAnswerResponse)
def submit_chat_answer(
    payload: AssessmentChatAnswer,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    questions = ai_service.get_ordered_question_models(db)
    if not questions:
        raise HTTPException(status_code=404, detail="Assessment questions are not configured")

    order_map = _question_order_map(questions)
    question_lookup = {question.id: question for question in questions}

    session: Optional[AssessmentSession]
    if payload.session_id:
        session = (
            db.query(AssessmentSession)
            .filter(
                AssessmentSession.id == payload.session_id,
                AssessmentSession.user_id == current_user.id,
            )
            .first()
        )
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = (
            db.query(AssessmentSession)
            .filter(
                AssessmentSession.user_id == current_user.id,
                AssessmentSession.status == "draft",
            )
            .order_by(AssessmentSession.created_at.desc())
            .first()
        )
        if not session:
            session = AssessmentSession(
                user_id=current_user.id,
                status="draft",
                answers={},
                messages=[],
            )
            db.add(session)
            db.flush()

    if session.status == "completed":
        progress = _build_progress(session.messages, len(questions))
        result_payload = AssessmentResult(**session.result) if session.result else None
        return AssessmentChatAnswerResponse(
            session_id=session.id,
            status=session.status,
            next_question=None,
            progress=progress,
            messages=session.messages or [],
            result=result_payload,
        )

    question = question_lookup.get(payload.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    expected_question = _find_next_question(questions, session.messages or [])
    if expected_question and expected_question.id != question.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unexpected question order",
        )

    normalized_answer, display_content = _normalize_user_answer(question, payload.user_answer)

    messages = list(session.messages or [])
    answers = dict(session.answers or {})

    user_message = {
        "role": "user",
        "question_id": question.id,
        "content": display_content,
        "answer_value": normalized_answer,
        "type": question.type or "choice",
    }
    messages.append(user_message)
    answers[str(question.id)] = normalized_answer

    next_question_model = _find_next_question(questions, messages)
    result_payload: Optional[AssessmentResult] = None
    next_question_schema: Optional[AssessmentChatQuestion] = None

    if next_question_model:
        messages.append(_assistant_prompt(next_question_model, order_map))
        next_question_schema = _question_to_chat_schema(next_question_model, order_map)
    else:
        result_payload = ai_service.analyze_chat_session(messages, questions)
        session.result = result_payload.dict()
        session.status = "completed"
        session.completed_at = datetime.utcnow()

    session.messages = messages
    session.answers = answers
    db.add(session)
    db.commit()
    db.refresh(session)

    progress = _build_progress(messages, len(questions))
    response_result = result_payload or (AssessmentResult(**session.result) if session.result else None)

    if session.status == "completed" and result_payload:
        try:
            ai_service.maybe_retrain_model(db)
        except Exception as exc:
            print(f"Career model retrain skipped: {exc}")
        try:
            update_stats_on_assessment_complete(current_user=current_user, db=db)
        except Exception as exc:
            print(f"Error updating gamification stats: {exc}")

    return AssessmentChatAnswerResponse(
        session_id=session.id,
        status=session.status,
        next_question=next_question_schema,
        progress=progress,
        messages=session.messages or [],
        result=response_result,
    )


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
