import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_emotion_analysis():
    response = client.post(
        "/api/emotion/analyze",
        json={"text": "Ndashimishijwe cyane n'uko nize muri iyi shuri"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "emotions" in data
    assert "original_text" in data

def test_chat_interaction():
    response = client.post(
        "/api/chat/message",
        json={
            "user_id": "test_user",
            "message": "Bite watangira kwiga Python?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data

def test_tts_generation():
    response = client.post(
        "/api/tts/generate",
        json={"text": "Murakaza neza kuri Twigane"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"