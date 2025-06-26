from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/wishlist",
    tags=["wishlist"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.WishlistItemOut])
def get_wishlist(telegram_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(telegram_id=telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return db.query(models.Wishlist).filter_by(user_id=user.id).all()

@router.post("/")
def add_to_wishlist(telegram_id: int, apartment_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(telegram_id=telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    exists = db.query(models.Wishlist).filter_by(user_id=user.id, apartment_id=apartment_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Already in wishlist")
    wishlist_item = models.Wishlist(user_id=user.id, apartment_id=apartment_id)
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return wishlist_item

@router.delete("/")
def remove_from_wishlist(telegram_id: int, apartment_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(telegram_id=telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    deleted = db.query(models.Wishlist).filter_by(user_id=user.id, apartment_id=apartment_id).delete()
    db.commit()
    return {"deleted": deleted} 