from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router
from app.core.error_handler import ErrorHandler
from app.middleware.auth import AuthMiddleware
from fastapi.exceptions import RequestValidationError

app = FastAPI(
    title="Twigane API",
    description="API for Twigane Learning Platform",
    version="1.0.0"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
app.add_exception_handler(RequestValidationError, ErrorHandler.validation_exception_handler)
app.add_exception_handler(Exception, ErrorHandler.http_exception_handler)

# Authentication middleware
auth_middleware = AuthMiddleware()

# Protected routes
app.include_router(
    router,
    prefix="/api",
    dependencies=[auth_middleware]
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        return await ErrorHandler.http_exception_handler(request, e)