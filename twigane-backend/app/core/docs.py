from fastapi.openapi.utils import get_openapi
from typing import Dict

def custom_openapi(app) -> Dict:
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Twigane Learning API",
        version="1.0.0",
        description="API documentation for Twigane Learning Platform",
        routes=app.routes,
    )

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # Add global security requirement
    openapi_schema["security"] = [{"bearerAuth": []}]

    # Add API tags metadata
    openapi_schema["tags"] = [
        {
            "name": "authentication",
            "description": "Operations for user authentication and authorization"
        },
        {
            "name": "content",
            "description": "Learning content management operations"
        },
        {
            "name": "assessment",
            "description": "Assessment and evaluation operations"
        },
        {
            "name": "adaptive",
            "description": "Adaptive learning system operations"
        },
        {
            "name": "analytics",
            "description": "Analytics and reporting operations"
        },
        {
            "name": "notifications",
            "description": "Real-time notification operations"
        },
        {
            "name": "i18n",
            "description": "Internationalization and localization operations"
        },
        {
            "name": "mobile",
            "description": "Mobile-specific API operations"
        }
    ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema