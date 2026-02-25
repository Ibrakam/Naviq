from __future__ import annotations

from typing import Literal

Locale = Literal["ru", "uz"]

SUPPORTED_LOCALES: set[str] = {"ru", "uz"}
DEFAULT_LOCALE: Locale = "ru"


def normalize_locale(raw: str | None) -> Locale:
    if not raw:
        return DEFAULT_LOCALE
    candidate = raw.strip().lower().replace("_", "-")
    if not candidate:
        return DEFAULT_LOCALE
    short = candidate.split("-", maxsplit=1)[0]
    if short in SUPPORTED_LOCALES:
        return short  # type: ignore[return-value]
    return DEFAULT_LOCALE
