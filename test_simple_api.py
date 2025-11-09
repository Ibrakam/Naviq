#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test health endpoint
response = client.get("/health")
print(f"Health check: {response.status_code} - {response.json()}")

# Test tracks endpoint
response = client.get("/api/tracks")
print(f"Tracks: {response.status_code} - {response.json()}")

# Test registration
response = client.post("/api/auth/register", json={
    "name": "Test User",
    "email": "test@example.com", 
    "password": "test123"
})
print(f"Registration: {response.status_code} - {response.text}")

