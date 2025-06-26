from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from datetime import date
from sqlalchemy import func

router = APIRouter(
    prefix="/villas",
    tags=["villas"]
)

@router.post("/", response_model=schemas.VillaOut)
def create_villa(
    villa: schemas.VillaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_villa = models.Villa(**villa.dict())
    db.add(db_villa)
    db.commit()
    db.refresh(db_villa)
    return db_villa

@router.get("/", response_model=List[schemas.VillaOut])
def get_villas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    villas = db.query(models.Villa).offset(skip).limit(limit).all()
    return villas

@router.get("/{villa_id}", response_model=schemas.VillaOut)
def get_villa(
    villa_id: int,
    db: Session = Depends(get_db)
):
    villa = db.query(models.Villa).filter(models.Villa.id == villa_id).first()
    if villa is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Villa not found"
        )
    return villa

@router.put("/{villa_id}", response_model=schemas.VillaOut)
def update_villa(
    villa_id: int,
    villa: schemas.VillaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_villa = db.query(models.Villa).filter(models.Villa.id == villa_id).first()
    if db_villa is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Villa not found"
        )
    
    for key, value in villa.dict().items():
        setattr(db_villa, key, value)
    
    db.commit()
    db.refresh(db_villa)
    return db_villa

@router.delete("/{villa_id}")
def delete_villa(
    villa_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_villa = db.query(models.Villa).filter(models.Villa.id == villa_id).first()
    if db_villa is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Villa not found"
        )
    
    db.delete(db_villa)
    db.commit()
    return {"message": "Villa deleted successfully"}

@router.get("/available", response_model=List[schemas.VillaOut])
def get_available_villas(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    if start_date >= end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Дата начала должна быть раньше даты окончания"
        )

    conflicting_bookings = db.query(models.VillaBooking.villa_id).filter(
        models.VillaBooking.start_date < end_date,
        models.VillaBooking.end_date > start_date
    ).distinct().all()

    booked_villa_ids = [booking[0] for booking in conflicting_bookings]

    available_villas = db.query(models.Villa).filter(
        models.Villa.id.notin_(booked_villa_ids)
    ).all()

    return available_villas 