from fastapi import FastAPI, Request, HTTPException
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

# Add middleware
app.add_middleware(AccessibilityMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup_db_client():
    Database.connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    Database.close_db()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Custom OpenAPI schema
app.openapi = lambda: custom_openapi(app)

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