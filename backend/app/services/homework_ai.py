import json
import re
from typing import Any

from app.ai.client import call_llm
from app.config import get_settings
from app.i18n.locale import normalize_locale
from app.services.youtube_content import get_youtube_video_context

settings = get_settings()


_STOP_WORDS = {
    "about",
    "after",
    "also",
    "and",
    "are",
    "that",
    "the",
    "this",
    "with",
    "your",
    "для",
    "или",
    "как",
    "это",
    "если",
    "чтобы",
    "про",
}


def _extract_keywords(text: str, limit: int = 6) -> list[str]:
    tokens = re.findall(r"[a-zA-Zа-яА-Я0-9_]{4,}", text.lower())
    seen: set[str] = set()
    result: list[str] = []
    for token in tokens:
        if token in _STOP_WORDS or token.isdigit() or token in seen:
            continue
        seen.add(token)
        result.append(token)
        if len(result) >= limit:
            break
    return result


def _normalize_keywords(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if not isinstance(item, str):
            continue
        token = item.strip().lower()
        if len(token) < 2:
            continue
        result.append(token)
    return list(dict.fromkeys(result))


def _to_bool(value: Any, default: bool) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "1", "yes", "y"}:
            return True
        if lowered in {"false", "0", "no", "n"}:
            return False
    return default


def _normalize_threshold(value: Any, default: int = 6) -> int:
    try:
        numeric = int(value)
    except Exception:
        numeric = default

    # Backward compatibility: old rubric could store threshold in 0..100 scale.
    if numeric > 10:
        numeric = int(round(numeric / 10))
    return max(1, min(10, numeric))


def _normalize_score_10(value: Any, default: int = 1) -> int:
    try:
        numeric = int(value)
    except Exception:
        numeric = default

    # Backward compatibility: old grader could return score in 0..100.
    if numeric > 10:
        numeric = int(round(numeric / 10))
    return max(1, min(10, numeric))


def _t(locale: str, ru: str, uz: str) -> str:
    return uz if normalize_locale(locale) == "uz" else ru


async def generate_lesson_homework(
    course_title: str,
    lesson_title: str,
    lesson_description: str | None,
    youtube_url: str | None = None,
    locale: str = "ru",
) -> tuple[str, dict]:
    normalized_locale = normalize_locale(locale)
    summary = (lesson_description or "").strip()
    video_context = await get_youtube_video_context(youtube_url)
    video_title = str(video_context.get("video_title") or "").strip()
    transcript_excerpt = str(video_context.get("transcript_excerpt") or "").strip()

    source_blob = " ".join(
        part for part in [course_title, lesson_title, summary, video_title, transcript_excerpt] if part
    )
    keywords = _extract_keywords(source_blob)
    source_label = (
        f"Video: {video_title}" if video_title else _t(normalized_locale, "Видео урока", "Dars videosi")
    )

    fallback_context = ""
    if transcript_excerpt:
        fallback_context = _t(
            normalized_locale,
            f"\nОпирайся на идеи из видео и упомяни: {', '.join(keywords[:5])}.",
            f"\nVideodagi g'oyalarga tayanib, quyidagilarni eslatib o't: {', '.join(keywords[:5])}.",
        )

    fallback_prompt = _t(
        normalized_locale,
        (
            f"На основе урока '{lesson_title}' курса '{course_title}' ({source_label}) дай практическое ДЗ.\n"
            "Формат ответа студента:\n"
            "1) Краткий конспект 5-7 пунктов.\n"
            "2) Практический кейс с пошаговым решением.\n"
            "3) Самопроверка: 3 вывода, что получилось и что улучшить."
            f"{fallback_context}"
        ),
        (
            f"'{course_title}' kursidagi '{lesson_title}' darsi ({source_label}) asosida amaliy uyga vazifa tuz.\n"
            "Talaba javobi formati:\n"
            "1) 5-7 punktdan iborat qisqa konspekt.\n"
            "2) Bosqichma-bosqich yechim bilan amaliy keys.\n"
            "3) O'zini tekshirish: 3 xulosa (nima chiqdi, nimani yaxshilash kerak)."
            f"{fallback_context}"
        ),
    )
    fallback_rubric = {
        "must_include": keywords,
        "pass_threshold": 6,
        "criteria": _t(
            normalized_locale,
            [
                "Логичная структура ответа",
                "Практические шаги и примеры",
                "Связь с темой урока",
            ],
            [
                "Javob mantiqiy tuzilgan bo'lishi",
                "Amaliy qadamlar va misollar mavjud bo'lishi",
                "Dars mavzusi bilan bog'liqlik",
            ],
        ),
        "video_context_used": bool(transcript_excerpt or video_title),
    }

    if not settings.OPENAI_API_KEY:
        return fallback_prompt, fallback_rubric

    system_prompt = (
        "You design homework tasks for online lessons. "
        "Return strict JSON: {homework_prompt: string, rubric: {must_include: string[], pass_threshold: 1..10, criteria: string[]}}."
    )
    user_message = json.dumps(
        {
            "course_title": course_title,
            "lesson_title": lesson_title,
            "lesson_description": summary,
            "youtube_url": youtube_url,
            "video_title": video_title,
            "video_transcript_excerpt": transcript_excerpt,
            "detected_keywords": keywords,
            "target_language": normalized_locale,
        },
        ensure_ascii=False,
    )

    try:
        raw = await call_llm(system_prompt=system_prompt, user_message=user_message, model="gpt-4o-mini", temperature=0.3)
        data = json.loads(raw)
        homework_prompt = str(data.get("homework_prompt") or "").strip()
        rubric_payload = data.get("rubric") if isinstance(data.get("rubric"), dict) else {}
        must_include = _normalize_keywords(rubric_payload.get("must_include")) or keywords
        pass_threshold = _normalize_threshold(rubric_payload.get("pass_threshold"), default=6)
        criteria = rubric_payload.get("criteria")
        if not isinstance(criteria, list):
            criteria = fallback_rubric["criteria"]
        criteria = [str(item).strip() for item in criteria if str(item).strip()]
        rubric = {
            "must_include": must_include,
            "pass_threshold": pass_threshold,
            "criteria": criteria[:6] if criteria else fallback_rubric["criteria"],
            "video_context_used": bool(transcript_excerpt or video_title),
        }
        if not homework_prompt:
            return fallback_prompt, fallback_rubric
        return homework_prompt, rubric
    except Exception:
        return fallback_prompt, fallback_rubric


async def grade_lesson_homework(
    homework_prompt: str,
    rubric: dict | None,
    student_answer: str,
    locale: str = "ru",
) -> dict[str, Any]:
    normalized_locale = normalize_locale(locale)
    rubric_data = rubric if isinstance(rubric, dict) else {}
    must_include = _normalize_keywords(rubric_data.get("must_include"))
    if not must_include:
        must_include = _extract_keywords(homework_prompt)
    threshold = _normalize_threshold(rubric_data.get("pass_threshold"), default=6)
    answer = (student_answer or "").strip()

    matched = [kw for kw in must_include if kw in answer.lower()]
    missing = [kw for kw in must_include if kw not in answer.lower()]
    if must_include:
        ratio = len(matched) / max(1, len(must_include))
        fallback_score = _normalize_score_10(int(round(ratio * 10)), default=1)
    else:
        fallback_score = _normalize_score_10(max(1, len(answer) // 180), default=1)
    fallback_passed = fallback_score >= threshold and len(answer) >= 40
    fallback_feedback = _t(
        normalized_locale,
        (
            f"Покрыто ключевых пунктов: {len(matched)}/{len(must_include)}. "
            f"Добавь детали по: {', '.join(missing[:5]) if missing else 'всем ключевым пунктам'}."
        ),
        (
            f"Asosiy punktlardan qamrovi: {len(matched)}/{len(must_include)}. "
            f"Quyidagilar bo'yicha batafsilroq yoz: {', '.join(missing[:5]) if missing else 'barcha asosiy punktlar'}."
        ),
    )

    if not settings.OPENAI_API_KEY:
        return {
            "score": fallback_score,
            "passed": fallback_passed,
            "feedback": fallback_feedback,
            "matched_keywords": matched,
            "missing_keywords": missing,
        }

    system_prompt = (
        "You are a strict homework grader. Return strict JSON: "
        "{score: 1..10, passed: boolean, feedback: string, matched_keywords: string[], missing_keywords: string[]}."
    )
    user_message = json.dumps(
        {
            "homework_prompt": homework_prompt,
            "rubric": rubric_data,
            "student_answer": answer,
            "pass_threshold": threshold,
            "target_language": normalized_locale,
        },
        ensure_ascii=False,
    )

    try:
        raw = await call_llm(system_prompt=system_prompt, user_message=user_message, model="gpt-4o-mini", temperature=0.1)
        data = json.loads(raw)
        score = _normalize_score_10(data.get("score"), default=fallback_score)
        passed = _to_bool(data.get("passed"), default=score >= threshold)
        feedback = str(data.get("feedback") or "").strip() or fallback_feedback
        llm_matched = _normalize_keywords(data.get("matched_keywords")) or matched
        llm_missing = _normalize_keywords(data.get("missing_keywords")) or missing
        return {
            "score": score,
            "passed": passed,
            "feedback": feedback,
            "matched_keywords": llm_matched,
            "missing_keywords": llm_missing,
        }
    except Exception:
        return {
            "score": fallback_score,
            "passed": fallback_passed,
            "feedback": fallback_feedback,
            "matched_keywords": matched,
            "missing_keywords": missing,
        }
