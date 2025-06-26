from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session, joinedload
from typing import List
import json

from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, get_telegram_current_user
from app.utils.telegram_auth import validate_init_data

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

def normalize_amenities(amenities):
    if isinstance(amenities, str):
        try:
            amenities = json.loads(amenities)
        except Exception:
            return []
    if isinstance(amenities, dict):
        result = []
        for v in amenities.values():
            if isinstance(v, list):
                result.extend(v)
        return result
    if isinstance(amenities, list):
        return amenities
    return []

def normalize_photo_urls(photo_urls):
    if isinstance(photo_urls, str):
        try:
            photo_urls = json.loads(photo_urls)
        except Exception:
            return []
    if isinstance(photo_urls, dict):
        result = []
        for v in photo_urls.values():
            if isinstance(v, list):
                result.extend(v)
        return result
    if isinstance(photo_urls, list):
        return photo_urls
    return []

@router.get("/me", response_model=schemas.UserOut)
async def read_current_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Existing auth method
):
    return current_user

@router.get("/me/telegram", response_model=schemas.UserOut)
async def read_telegram_current_user(
    db: Session = Depends(get_db),
    telegram_user: models.User = Depends(get_telegram_current_user)
):
    """Get current user profile including Telegram data and bookings.
    Requires X-Telegram-Init-Data header.
    """
    user = db.query(models.User)\
        .options(
            joinedload(models.User.bookings).joinedload(models.Booking.apartment),
            joinedload(models.User.villa_bookings).joinedload(models.VillaBooking.villa)
        )\
        .filter(models.User.id == telegram_user.id).first()
    # normalize amenities and photo_urls
    for booking in user.bookings:
        if booking.apartment:
            booking.apartment.amenities = normalize_amenities(booking.apartment.amenities)
            booking.apartment.photo_urls = normalize_photo_urls(booking.apartment.photo_urls)
    for vbooking in user.villa_bookings:
        if vbooking.villa:
            vbooking.villa.amenities = normalize_amenities(vbooking.villa.amenities)
            vbooking.villa.photo_urls = normalize_photo_urls(vbooking.villa.photo_urls)
    return user

@router.post("/me/telegram-id", response_model=schemas.UserOut)
def register_by_telegram_id(
    user_data: dict = Body(...),
    db: Session = Depends(get_db)
):
    telegram_id = user_data.get("telegram_id")
    if not telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id is required")
    user = db.query(models.User)\
        .options(
            joinedload(models.User.bookings).joinedload(models.Booking.apartment),
            joinedload(models.User.villa_bookings).joinedload(models.VillaBooking.villa)
        )\
        .filter(models.User.telegram_id == telegram_id).first()
    if not user:
        user = models.User(
            telegram_id=telegram_id,
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            username=user_data.get("username"),
            telegram_photo_url=user_data.get("photo_url"),
            name=user_data.get("first_name") or f"Telegram User {telegram_id}",
            email=f"telegram_{telegram_id}@example.com",
            hashed_password="no_password_for_telegram_login"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        # повторно подгружаем с joinedload
        user = db.query(models.User)\
            .options(
                joinedload(models.User.bookings).joinedload(models.Booking.apartment),
                joinedload(models.User.villa_bookings).joinedload(models.VillaBooking.villa)
            )\
            .filter(models.User.id == user.id).first()
    # normalize amenities and photo_urls
    for booking in user.bookings:
        if booking.apartment:
            booking.apartment.amenities = normalize_amenities(booking.apartment.amenities)
            booking.apartment.photo_urls = normalize_photo_urls(booking.apartment.photo_urls)
    for vbooking in user.villa_bookings:
        if vbooking.villa:
            vbooking.villa.amenities = normalize_amenities(vbooking.villa.amenities)
            vbooking.villa.photo_urls = normalize_photo_urls(vbooking.villa.photo_urls)
    return user
