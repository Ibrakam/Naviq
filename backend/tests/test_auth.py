import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "test@naviq.com", "password": "securepass123", "full_name": "Test User"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    payload = {"email": "dup@naviq.com", "password": "pass123", "full_name": "Dup User"}
    await client.post("/api/v1/auth/register", json=payload)
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "login@naviq.com", "password": "pass123", "full_name": "Login User"},
    )
    response = await client.post("/api/v1/auth/login", json={"email": "login@naviq.com", "password": "pass123"})
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wrong@naviq.com", "password": "correct", "full_name": "Wrong User"},
    )
    response = await client.post("/api/v1/auth/login", json={"email": "wrong@naviq.com", "password": "incorrect"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_authorized(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "me@naviq.com", "password": "pass123", "full_name": "Me User"},
    )
    token = reg.json()["access_token"]
    response = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "me@naviq.com"
