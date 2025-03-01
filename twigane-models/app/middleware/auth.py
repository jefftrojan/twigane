from fastapi import Request, HTTPException
from app.core.config import settings
import jwt

class AuthMiddleware:
    async def __call__(self, request: Request):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                raise HTTPException(status_code=401, detail="No valid token provided")
            
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                request.state.user = payload
            except jwt.PyJWTError:
                raise HTTPException(status_code=401, detail="Invalid token")
                
        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))