import asyncio
import re
from urllib.parse import parse_qs, urlparse

import httpx

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except Exception:  # pragma: no cover - optional runtime dependency handling
    YouTubeTranscriptApi = None


def extract_youtube_video_id(url: str | None) -> str | None:
    if not url:
        return None

    raw = url.strip()
    if not raw:
        return None

    try:
        parsed = urlparse(raw)
    except Exception:
        return None

    host = (parsed.hostname or "").lower()
    path = (parsed.path or "").strip("/")

    if host.endswith("youtu.be") and path:
        return path.split("/")[0]

    if "youtube.com" in host:
        query = parse_qs(parsed.query)
        v = query.get("v", [None])[0]
        if v:
            return v

        parts = path.split("/")
        if len(parts) >= 2 and parts[0] in {"embed", "shorts", "live"}:
            return parts[1]

    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|$)", raw)
    if match:
        return match.group(1)

    return None


async def _fetch_video_title(url: str) -> str | None:
    endpoint = "https://www.youtube.com/oembed"
    params = {"url": url, "format": "json"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(endpoint, params=params)
            if response.status_code != 200:
                return None
            payload = response.json()
            title = payload.get("title")
            return str(title).strip() if title else None
    except Exception:
        return None


def _fetch_transcript_sync(video_id: str, languages: list[str]) -> str | None:
    if YouTubeTranscriptApi is None:
        return None
    try:
        segments = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
    except Exception:
        return None
    texts = [str(segment.get("text", "")).strip() for segment in segments if segment.get("text")]
    joined = " ".join(texts).strip()
    return joined or None


async def _fetch_video_transcript(video_id: str) -> str | None:
    # Try common locales used in product audience.
    for languages in (["ru", "uz", "en"], ["en"], ["ru"], ["uz"]):
        transcript = await asyncio.to_thread(_fetch_transcript_sync, video_id, languages)
        if transcript:
            return transcript
    return None


async def get_youtube_video_context(url: str | None, transcript_char_limit: int = 2800) -> dict[str, str | bool | None]:
    video_id = extract_youtube_video_id(url)
    if not video_id:
        return {
            "video_id": None,
            "video_title": None,
            "transcript_excerpt": None,
            "has_transcript": False,
        }

    title = await _fetch_video_title(url or "")
    transcript = await _fetch_video_transcript(video_id)
    excerpt = transcript[:transcript_char_limit] if transcript else None

    return {
        "video_id": video_id,
        "video_title": title,
        "transcript_excerpt": excerpt,
        "has_transcript": bool(excerpt),
    }
