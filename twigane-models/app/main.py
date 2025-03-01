from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.routing import APIRoute  # Add this import
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router
from app.core.error_handler import ErrorHandler
from app.middleware.auth import AuthMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.docs import custom_openapi
from app.middleware.accessibility import AccessibilityMiddleware
from app.core.database import Database

app = FastAPI(
    title="Twigane Learning API",
    description="API for Twigane Learning Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router, prefix="/api")

# Error handlers
app.add_exception_handler(RequestValidationError, ErrorHandler.validation_exception_handler)
app.add_exception_handler(Exception, ErrorHandler.http_exception_handler)

# Database events
@app.on_event("startup")
async def startup_db_client():
    await Database.connect_db()  # Add await here

@app.on_event("shutdown")
async def shutdown_db_client():
    await Database.close_db()    # Add await here if it's also async

# Custom OpenAPI schema
app.openapi = custom_openapi

# Update the OpenAPI schema assignment
@app.on_event("startup")
async def setup_openapi():
    app.openapi_schema = custom_openapi(app)
    app.openapi = lambda: app.openapi_schema

# Authentication middleware
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # Allow access to auth routes and docs
    public_paths = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/docs",
        "/api/redoc",
        "/openapi.json"
    ]
    
    if any(request.url.path.startswith(path) for path in public_paths):
        return await call_next(request)
    
    # Authenticate other routes
    auth = AuthMiddleware()
    await auth(request)
    return await call_next(request)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        return await ErrorHandler.http_exception_handler(request, e)
# Add after existing imports
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Add after app initialization
static_dir = Path("/Users/mac/Downloads/main/twigane-backend/static")
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")