from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings
from datetime import datetime, timedelta

security = HTTPBearer()

class AuthMiddleware:
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    async def verify_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    async def __call__(self, request: Request, credentials: HTTPAuthorizationCredentials = security):
        if not credentials:
            raise HTTPException(status_code=403, detail="No credentials provided")
        
        token = credentials.credentials
        user_data = await self.verify_token(token)
        request.state.user = user_data
        return user_data