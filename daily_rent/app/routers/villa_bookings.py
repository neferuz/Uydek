from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/villa-bookings",
    tags=["villa-bookings"]
)

@router.post("/", response_model=schemas.VillaBookingOut)
def create_villa_booking(
    booking: schemas.VillaBookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Проверяем существование виллы
    villa = db.query(models.Villa).filter(models.Villa.id == booking.villa_id).first()
    if not villa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Villa not found"
        )
    
    # Проверяем доступность дат
    start_date = datetime.combine(booking.start_date, datetime.min.time())
    end_date = datetime.combine(booking.end_date, datetime.max.time())
    
    existing_booking = db.query(models.VillaBooking).filter(
        models.VillaBooking.villa_id == booking.villa_id,
        models.VillaBooking.status == "confirmed",
        (
            (models.VillaBooking.start_date <= start_date) & 
            (models.VillaBooking.end_date >= start_date)
        ) | (
            (models.VillaBooking.start_date <= end_date) & 
            (models.VillaBooking.end_date >= end_date)
        )
    ).first()
    
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Villa is already booked for these dates"
        )
    
    db_booking = models.VillaBooking(
        **booking.dict(),
        user_id=current_user.id
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/", response_model=List[schemas.VillaBookingOut])
def get_villa_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.is_admin:
        bookings = db.query(models.VillaBooking).offset(skip).limit(limit).all()
    else:
        bookings = db.query(models.VillaBooking).filter(
            models.VillaBooking.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    return bookings

@router.get("/{booking_id}", response_model=schemas.VillaBookingOut)
def get_villa_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.VillaBooking).filter(models.VillaBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if not current_user.is_admin and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return booking

@router.put("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    booking = db.query(models.VillaBooking).filter(models.VillaBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if status not in ["pending", "confirmed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    booking.status = status
    db.commit()
    return {"message": "Booking status updated successfully"} 