from fastapi.openapi.utils import get_openapi
from fastapi import FastAPI
from app.models.auth_models import UserCreate, UserLogin, Token

def custom_openapi(app: FastAPI):
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Twigane Learning API",
        version="1.0.0",
        description="API for Twigane Learning Platform",
        routes=app.routes,
    )

    # Add components section if it doesn't exist
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}

    # Add schemas section if it doesn't exist
    if "schemas" not in openapi_schema["components"]:
        openapi_schema["components"]["schemas"] = {}

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your bearer token in the format: Bearer <token>"
        }
    }

    # Add global security requirement
    openapi_schema["security"] = [
        {"Bearer": []}
    ]

    # Add common error responses
    openapi_schema["components"]["schemas"]["HTTPValidationError"] = {
        "type": "object",
        "properties": {
            "detail": {
                "type": "string"
            }
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema