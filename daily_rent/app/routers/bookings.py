from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import json

from .. import models, schemas, database
from ..auth import get_current_user

router = APIRouter(
    prefix="/bookings",
    tags=["apartments bookings"]
)

# Зависимость для подключения к БД
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔐 ВРЕМЕННО: получаем telegram_id напрямую
def get_current_user(db: Session = Depends(get_db), telegram_id: int = 12345678):
    user = db.query(models.User).filter_by(telegram_id=telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

# 📌 Создать бронирование
@router.post("/", response_model=schemas.BookingOut)
def create_booking(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Проверка пересечения дат
    overlapping = db.query(models.Booking).filter(
        models.Booking.apartment_id == booking.apartment_id,
        models.Booking.start_date <= booking.end_date,
        models.Booking.end_date >= booking.start_date
    ).first()

    if overlapping:
        raise HTTPException(status_code=400, detail="Квартира уже забронирована на эти даты")

    db_booking = models.Booking(
        apartment_id=booking.apartment_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        user_id=current_user.id,
        status="pending"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

# 📌 Получить свои бронирования
@router.get("/my", response_model=List[schemas.BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Booking).filter_by(user_id=current_user.id).order_by(models.Booking.created_at.desc()).all()

# 📌 Получить все доступные квартиры по датам
@router.get("/available", response_model=List[schemas.ApartmentOut])
def get_available_apartments(
    start: date = Query(...),
    end: date = Query(...),
    db: Session = Depends(get_db)
):
    booked_apartment_ids = db.query(models.Booking.apartment_id).filter(
        models.Booking.start_date <= end,
        models.Booking.end_date >= start
    ).subquery()

    available_apartments = db.query(models.Apartment).filter(
        ~models.Apartment.id.in_(booked_apartment_ids)
    ).all()

    result = []
    for apt in available_apartments:
        apt_dict = apt.__dict__.copy()
        # Parse amenities and photo_urls if not None
        if apt_dict.get('amenities'):
            try:
                apt_dict['amenities'] = json.loads(apt_dict['amenities'])
            except Exception:
                apt_dict['amenities'] = []
        else:
            apt_dict['amenities'] = []
        if apt_dict.get('photo_urls'):
            try:
                apt_dict['photo_urls'] = json.loads(apt_dict['photo_urls'])
            except Exception:
                apt_dict['photo_urls'] = []
        else:
            apt_dict['photo_urls'] = []
        result.append(schemas.ApartmentOut(**apt_dict))
    return result

# 📌 Получить бронирование по ID
@router.get("/{booking_id}", response_model=schemas.BookingOut)
def get_booking_by_id(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Бронирование не найдено")
    if not current_user.is_admin and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="У вас нет прав для просмотра этого бронирования")
    return booking

# 📌 Обновить статус бронирования (доступно только админу)
@router.put("/{booking_id}/status", response_model=schemas.BookingOut)
def update_booking_status(
    booking_id: int,
    new_status: str = Query(..., description="Новый статус бронирования (например, 'confirmed', 'cancelled', 'completed')"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только администраторы могут изменять статус бронирования")

    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Бронирование не найдено")

    db_booking.status = new_status
    db.commit()
    db.refresh(db_booking)
    return db_booking
