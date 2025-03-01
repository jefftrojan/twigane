import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
import pytest_asyncio
from app.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_emotion_analysis():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/emotion/analyze",
            json={"text": "Ndashimishijwe cyane n'uko nize muri iyi shuri"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "emotions" in data
        assert "original_text" in data

@pytest.mark.asyncio
async def test_chat_interaction():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/chat/message",
            json={
                "user_id": "test_user",
                "message": "Bite watangira kwiga Python?"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data

@pytest.mark.asyncio
async def test_tts_generation():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/api/tts/generate",
            json={"text": "Murakaza neza kuri Twigane"}
        )
        assert response.status_code == 200
        assert "audio_data" in response.json()

@pytest.fixture(autouse=True)
async def setup_db():
    # Setup test database
    yield
    # Cleanup after tests