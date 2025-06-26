from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime


def get_user_by_telegram_id(db: Session, telegram_id: int):
    return db.query(models.User).filter(models.User.telegram_id == telegram_id).first()


def create_user(db: Session, user_data: schemas.UserCreate):
    db_user = models.User(
        telegram_id=user_data.telegram_id,
        name=user_data.name,
        username=user_data.username,
        phone=user_data.phone,
        created_at=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_or_create_user(db: Session, user_data: schemas.UserCreate):
    existing_user = get_user_by_telegram_id(db, user_data.telegram_id)
    if existing_user:
        return existing_user
    return create_user(db, user_data)
