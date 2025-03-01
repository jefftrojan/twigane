from fastapi import Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Union

class ErrorHandler:
    @staticmethod
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Validation error",
                "errors": exc.errors(),
            }
        )

    @staticmethod
    async def http_exception_handler(request: Request, exc: Union[Exception, HTTPException]):
        status_code = getattr(exc, 'status_code', 500)
        return JSONResponse(
            status_code=status_code,
            content={
                "detail": str(exc),
                "path": request.url.path
            }
        )