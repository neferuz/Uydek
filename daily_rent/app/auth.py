from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

import jose.jwt
import jose.exceptions

from app.database import get_db
from app import models, schemas # Assuming models and schemas exist and define User
from app.utils.telegram_auth import validate_init_data
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables

# TODO: Make these configurable via environment variables in a real application
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")  # Replace with a strong, random key in production
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
BOT_TOKEN = os.getenv("BOT_TOKEN")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jose.jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, telegram_id: int, password: str):
    # This is a placeholder for actual user authentication.
    # In a real app, you would hash the password and compare.
    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
    if not user or user.hashed_password != password: # Placeholder: Directly comparing password for now
        return None
    return user

async def get_telegram_current_user(
    init_data: str = Header(..., alias="X-Telegram-Init-Data"),
    db: Session = Depends(get_db)
):
    if not BOT_TOKEN:
        raise HTTPException(status_code=500, detail="Bot token is not configured on the server.")

    validated_data = validate_init_data(init_data, BOT_TOKEN)
    if not validated_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Telegram Init Data")
    
    telegram_user_data = validated_data.get('user')
    if not telegram_user_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Telegram user data not found in Init Data")

    telegram_id = telegram_user_data.get('id')
    if not telegram_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Telegram user ID not found")

    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()

    if not user:
        # Create a new user if not found
        user = models.User(
            telegram_id=telegram_id,
            first_name=telegram_user_data.get('first_name'),
            last_name=telegram_user_data.get('last_name'),
            username=telegram_user_data.get('username'),
            telegram_photo_url=telegram_user_data.get('photo_url'),
            # For new users from Telegram, we might not have email/name/password immediately.
            # You might want to make these fields nullable in your model or provide defaults.
            name=telegram_user_data.get('first_name') or f"Telegram User {telegram_id}",
            email=f"telegram_{telegram_id}@example.com", # Placeholder email
            hashed_password="no_password_for_telegram_login" # Placeholder
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user's Telegram-specific fields
        user.first_name = telegram_user_data.get('first_name')
        user.last_name = telegram_user_data.get('last_name')
        user.username = telegram_user_data.get('username')
        user.telegram_photo_url = telegram_user_data.get('photo_url')
        db.commit()
        db.refresh(user)
    
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jose.jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        telegram_id: int = payload.get("sub")
        if telegram_id is None:
            raise credentials_exception
        user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
        if user is None:
            raise credentials_exception
        return schemas.UserOut.from_orm(user)
    except jose.exceptions.JWTError:
        raise credentials_exception
