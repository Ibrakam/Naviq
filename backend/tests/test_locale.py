import pytest
from httpx import AsyncClient

from app.i18n.locale import normalize_locale


def test_normalize_locale():
    assert normalize_locale("ru") == "ru"
    assert normalize_locale("uz-Latn") == "uz"
    assert normalize_locale("en") == "ru"
    assert normalize_locale(None) == "ru"


@pytest.mark.asyncio
async def test_register_persists_preferred_language(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "locale-register@naviq.com",
            "password": "pass12345",
            "full_name": "Locale Register",
            "preferred_language": "uz",
        },
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]

    me = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["preferred_language"] == "uz"


@pytest.mark.asyncio
async def test_skills_questions_respect_x_locale_header(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "locale-questions@naviq.com",
            "password": "pass12345",
            "full_name": "Locale Questions",
            "preferred_language": "ru",
        },
    )
    token = reg.json()["access_token"]

    questions = await client.get(
        "/api/v1/skills/questions",
        headers={
            "Authorization": f"Bearer {token}",
            "X-Locale": "uz",
        },
    )
    assert questions.status_code == 200
    payload = questions.json()
    assert payload[0]["question"].startswith("Do'stlaring")


@pytest.mark.asyncio
async def test_update_me_preferred_language(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "locale-update@naviq.com",
            "password": "pass12345",
            "full_name": "Locale Update",
            "preferred_language": "ru",
        },
    )
    token = reg.json()["access_token"]

    patch = await client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"preferred_language": "uz"},
    )
    assert patch.status_code == 200
    assert patch.json()["preferred_language"] == "uz"
