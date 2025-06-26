from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from app.models import ResidentialComplex
from app.schemas import ResidentialComplexCreate, ResidentialComplexOut

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)

# Зависимость для подключения к БД
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔒 ВРЕМЕННО: проверка на админа через telegram_id
def get_admin_user(db: Session = Depends(get_db), telegram_id: int = 12345678):
    user = db.query(models.User).filter_by(telegram_id=telegram_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    return user


# 📌 Список всех пользователей
@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    return db.query(models.User).all()


# 📌 Список всех бронирований
@router.get("/bookings", response_model=List[schemas.BookingOut])
def get_all_bookings(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    return db.query(models.Booking).order_by(models.Booking.created_at.desc()).all()


# 📌 Подтвердить или отменить бронирование
@router.patch("/bookings/{booking_id}", response_model=schemas.BookingOut)
def update_booking_status(
    booking_id: int,
    status: str,  # "confirmed" | "cancelled"
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin_user)
):
    booking = db.query(models.Booking).filter_by(id=booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")

    if status not in ["confirmed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Недопустимый статус")

    booking.status = status
    db.commit()
    db.refresh(booking)
    return booking

# Получить все новостройки
@router.get("/residential-complexes", response_model=List[ResidentialComplexOut])
def get_all_complexes(db: Session = Depends(get_db)):
    return db.query(ResidentialComplex).all()

# Создать новостройку
@router.post("/residential-complexes", response_model=ResidentialComplexOut)
def create_complex(complex_in: ResidentialComplexCreate, db: Session = Depends(get_db)):
    db_complex = ResidentialComplex(**complex_in.dict())
    db.add(db_complex)
    db.commit()
    db.refresh(db_complex)
    return db_complex

# Обновить новостройку по id
@router.put("/residential-complexes/{complex_id}", response_model=ResidentialComplexOut)
def update_complex(complex_id: int, complex_update: ResidentialComplexCreate, db: Session = Depends(get_db)):
    db_complex = db.query(ResidentialComplex).filter(ResidentialComplex.id == complex_id).first()
    if not db_complex:
        raise HTTPException(status_code=404, detail="Новостройка не найдена")
    for key, value in complex_update.dict(exclude_unset=True).items():
        setattr(db_complex, key, value)
    db.add(db_complex)
    db.commit()
    db.refresh(db_complex)
    return db_complex
