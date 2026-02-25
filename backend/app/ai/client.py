import json

import httpx
import redis.asyncio as redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.ai_prompt import AIPrompt

settings = get_settings()

PROMPT_CACHE_TTL = 300  # 5 minutes

_redis: redis.Redis | None = None


async def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def get_prompt(name: str, db: AsyncSession) -> AIPrompt | None:
    r = await get_redis()
    cache_key = f"ai_prompt:{name}"

    cached = await r.get(cache_key)
    if cached:
        data = json.loads(cached)
        prompt = AIPrompt(**{k: v for k, v in data.items() if k != "_sa_instance_state"})
        object.__setattr__(prompt, "_sa_instance_state", None)
        return prompt

    result = await db.execute(select(AIPrompt).where(AIPrompt.name == name))
    prompt = result.scalar_one_or_none()
    if prompt:
        await r.set(
            cache_key,
            json.dumps({"name": prompt.name, "system_prompt": prompt.system_prompt, "model": prompt.model, "temperature": prompt.temperature}),
            ex=PROMPT_CACHE_TTL,
        )
    return prompt


async def invalidate_prompt_cache(name: str) -> None:
    r = await get_redis()
    await r.delete(f"ai_prompt:{name}")


async def call_llm(system_prompt: str, user_message: str, model: str = "gpt-4o", temperature: float = 0.7) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
            json={
                "model": model,
                "temperature": temperature,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
            },
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
