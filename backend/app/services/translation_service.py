from __future__ import annotations

import hashlib
import json
import logging
from typing import Any
from uuid import UUID

import redis.asyncio as redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import call_llm
from app.config import get_settings
from app.i18n.locale import Locale, normalize_locale
from app.models.translation_cache import TranslationCache

settings = get_settings()
logger = logging.getLogger(__name__)

TRANSLATION_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30  # 30 days
TRANSLATION_PROVIDER = "openai"

_redis: redis.Redis | None = None


async def _get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


def _hash_text(source_text: str) -> str:
    return hashlib.sha256(source_text.encode("utf-8")).hexdigest()


def _redis_key(source_lang: str, target_lang: str, source_hash: str) -> str:
    return f"tr:{source_lang}:{target_lang}:{source_hash}"


def _looks_like_non_human_string(value: str) -> bool:
    stripped = value.strip()
    if not stripped:
        return True
    if stripped.startswith(("http://", "https://", "/")):
        return True
    if len(stripped) <= 2 and stripped.isupper():
        return True
    try:
        UUID(stripped)
        return True
    except ValueError:
        return False


async def _translate_via_llm(source_text: str, source_lang: str, target_lang: Locale) -> str:
    if not settings.OPENAI_API_KEY:
        return source_text

    system_prompt = (
        "You are a strict translator for app UI and product content. "
        "Return strict JSON: {\"translated_text\": string}. "
        "Preserve meaning, tone, and structure. Do not add explanations. "
        "For Uzbek, always use Latin script."
    )
    user_message = json.dumps(
        {
            "source_text": source_text,
            "source_lang": source_lang,
            "target_lang": target_lang,
        },
        ensure_ascii=False,
    )

    try:
        raw = await call_llm(
            system_prompt=system_prompt,
            user_message=user_message,
            model="gpt-4o-mini",
            temperature=0.0,
        )
        payload = json.loads(raw)
        translated = str(payload.get("translated_text") or "").strip()
        return translated or source_text
    except Exception:
        logger.warning("translation.llm_failed", extra={"target_lang": target_lang})
        return source_text


async def translate_text(
    db: AsyncSession,
    source_text: str | None,
    target_lang: Locale,
    source_lang: str = "auto",
) -> str | None:
    if source_text is None:
        return None

    if not source_text.strip():
        return source_text

    normalized_source = "auto" if source_lang == "auto" else normalize_locale(source_lang)
    normalized_target = normalize_locale(target_lang)

    if normalized_source != "auto" and normalized_source == normalized_target:
        return source_text
    if _looks_like_non_human_string(source_text):
        return source_text

    source_hash = _hash_text(source_text)
    cache_key = _redis_key(str(normalized_source), normalized_target, source_hash)

    try:
        r = await _get_redis()
        cached = await r.get(cache_key)
        if cached:
            return cached
    except Exception:
        logger.warning("translation.redis_read_failed", extra={"cache_key": cache_key})

    row_result = await db.execute(
        select(TranslationCache).where(
            TranslationCache.source_hash == source_hash,
            TranslationCache.source_lang == str(normalized_source),
            TranslationCache.target_lang == normalized_target,
        )
    )
    row = row_result.scalar_one_or_none()
    if row is not None and row.translated_text:
        try:
            r = await _get_redis()
            await r.set(cache_key, row.translated_text, ex=TRANSLATION_CACHE_TTL_SECONDS)
        except Exception:
            logger.warning("translation.redis_write_failed", extra={"cache_key": cache_key})
        return row.translated_text

    translated = await _translate_via_llm(
        source_text=source_text,
        source_lang=str(normalized_source),
        target_lang=normalized_target,
    )
    if not translated:
        return source_text

    if row is None:
        row = TranslationCache(
            source_hash=source_hash,
            source_text=source_text,
            source_lang=str(normalized_source),
            target_lang=normalized_target,
            translated_text=translated,
            provider=TRANSLATION_PROVIDER,
        )
        db.add(row)
    else:
        row.source_text = source_text
        row.translated_text = translated
        row.provider = TRANSLATION_PROVIDER

    try:
        await db.flush()
    except Exception:
        logger.warning("translation.db_write_failed", extra={"source_hash": source_hash})

    try:
        r = await _get_redis()
        await r.set(cache_key, translated, ex=TRANSLATION_CACHE_TTL_SECONDS)
    except Exception:
        logger.warning("translation.redis_write_failed", extra={"cache_key": cache_key})

    return translated


async def translate_struct(
    db: AsyncSession,
    payload: Any,
    target_lang: Locale,
    source_lang: str = "auto",
) -> Any:
    if isinstance(payload, str):
        return await translate_text(db, payload, target_lang=target_lang, source_lang=source_lang)
    if isinstance(payload, list):
        result: list[Any] = []
        for item in payload:
            result.append(await translate_struct(db, item, target_lang=target_lang, source_lang=source_lang))
        return result
    if isinstance(payload, dict):
        result: dict[str, Any] = {}
        for key, value in payload.items():
            result[key] = await translate_struct(db, value, target_lang=target_lang, source_lang=source_lang)
        return result
    return payload
