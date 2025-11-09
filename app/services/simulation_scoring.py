from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Union

from app.models import Simulation

ScoreResult = Dict[str, Union[int, bool]]
PASSING_PERCENTAGE = 70


def calculate_simulation_score(simulation: Simulation, answers: Any) -> Dict[str, Union[int, bool]]:
    """
    Calculate a normalized score for a simulation submission.
    Supports both legacy free-form answers (dict of step_id -> text)
    and the new structured answer arrays coming from the Vite frontend.
    """
    steps: List[Dict[str, Any]] = simulation.steps or []
    answer_map = _normalize_answers(answers)

    structured_result = _score_structured_steps(steps, answer_map)
    if structured_result["max_score"] > 0:
        return structured_result

    return _score_textual_answers(answer_map)


def _normalize_answers(answers: Any) -> Dict[Any, Any]:
    if isinstance(answers, dict):
        # New format nested under "entries"
        if "entries" in answers and isinstance(answers["entries"], list):
            return {
                entry.get("stepIndex", idx): entry.get("answer")
                for idx, entry in enumerate(answers["entries"])
                if isinstance(entry, dict)
            }
        return answers

    if isinstance(answers, list):
        normalized: Dict[Any, Any] = {}
        for idx, entry in enumerate(answers):
            if isinstance(entry, dict):
                key = entry.get("stepIndex", idx)
                normalized[key] = entry.get("answer")
            else:
                normalized[idx] = entry
        return normalized

    return {}


def _score_structured_steps(steps: List[Dict[str, Any]], answers: Dict[Any, Any]) -> ScoreResult:
    total_score = 0
    max_score = 0

    for idx, step in enumerate(steps):
        if not step or not step.get("question"):
            continue

        points = int(step.get("points", 10) or 10)
        max_score += points

        user_answer = _find_answer_for_step(step, idx, answers)
        if user_answer is None:
            continue

        step_type = (step.get("type") or "").lower()
        if step_type == "quiz":
            if user_answer == step.get("correctAnswer"):
                total_score += points
        elif step_type == "multiplechoice":
            correct_options = step.get("correctAnswer") or []
            if isinstance(correct_options, list):
                correct_sorted = sorted(correct_options)
                user_sorted = sorted(user_answer or []) if isinstance(user_answer, list) else []
                if correct_sorted == user_sorted:
                    total_score += points
        elif step_type == "code":
            keywords = step.get("requiredKeywords") or []
            answer_text = (user_answer or "").lower() if isinstance(user_answer, str) else ""
            if keywords and all(keyword.lower() in answer_text for keyword in keywords):
                total_score += points
        elif step_type == "text":
            answer_text = user_answer or ""
            if isinstance(answer_text, str) and len(answer_text.strip()) >= 100:
                total_score += points
        else:
            # Default structured step scoring: award points if answer is non-empty
            if isinstance(user_answer, str) and user_answer.strip():
                total_score += points

    percentage = int((total_score / max_score) * 100) if max_score else 0
    return {
        "score": total_score,
        "max_score": max_score,
        "percentage": percentage,
        "passed": percentage >= PASSING_PERCENTAGE,
    }


def _find_answer_for_step(step: Dict[str, Any], index: int, answers: Dict[Any, Any]) -> Optional[Any]:
    step_id = step.get("id")
    possible_keys: Iterable[Any] = (
        index,
        str(index),
        index + 1,
        str(index + 1),
        step_id,
        str(step_id) if step_id is not None else None,
    )

    for key in possible_keys:
        if key is None:
            continue
        if key in answers:
            return answers[key]
    return None


def _score_textual_answers(answers: Dict[Any, Any]) -> ScoreResult:
    if not answers:
        return {"score": 0, "max_score": 0, "percentage": 0, "passed": False}

    total_score = 0
    answer_count = 0

    for answer in answers.values():
        if isinstance(answer, str) and answer.strip():
            answer_length = len(answer.strip())
            answer_lower = answer.lower()
            if answer_length < 20:
                step_score = 30
            elif answer_length < 50:
                step_score = 60
            elif answer_length < 100:
                step_score = 80
            else:
                step_score = 90

            keywords = [
                "создать",
                "реализовать",
                "написать",
                "анализ",
                "проанализировать",
                "функция",
                "компонент",
                "эндпоинт",
                "модель",
                "данные",
                "код",
            ]

            keyword_count = sum(1 for keyword in keywords if keyword in answer_lower)
            if keyword_count >= 3:
                step_score = min(100, step_score + 10)

            if any(char in answer for char in ["\n", "•", "-", "1.", "2."]):
                step_score = min(100, step_score + 5)

            total_score += step_score
            answer_count += 1

    if answer_count == 0:
        return {"score": 0, "max_score": 0, "percentage": 0, "passed": False}

    avg_score = total_score // answer_count
    rounded_score = ((avg_score + 2) // 5) * 5
    return {
        "score": rounded_score,
        "max_score": 100,
        "percentage": rounded_score,
        "passed": rounded_score >= PASSING_PERCENTAGE,
    }
