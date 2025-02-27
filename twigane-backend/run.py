import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        app,  # Use app instance directly instead of string
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload to avoid conflicts with model loading
        log_level="info"
    )