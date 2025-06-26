from fastapi import APIRouter, Depends, HTTPException, status, Query as FastAPIQuery
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, database
from fastapi import APIRouter, Form
from app.database import SessionLocal
from app.models import Apartment, ResidentialComplex
from math import radians, cos, sin, asin, sqrt
from fastapi import Query
import json


router = APIRouter(
    prefix="/apartments",
    tags=["apartments"]
)

# Зависимость для получения сессии БД
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔒 Пример: проверка на админа (временно хардкод, позже будет JWT)
def fake_admin_check():
    return True  # пока всегда True, потом заменим на нормальную авторизацию

# Вспомогательная функция для обработки данных квартиры
def process_apartment_data(apartment):
    processed_amenities = []
    # Обработка amenities - может быть строкой JSON или словарем
    if apartment.amenities:
        amenities_data = apartment.amenities
        # Если это строка, пытаемся распарсить как JSON
        if isinstance(amenities_data, str):
            try:
                amenities_data = json.loads(amenities_data)
            except json.JSONDecodeError:
                print(f"Ошибка парсинга JSON amenities для apartment {apartment.id}: {amenities_data}")
                amenities_data = None
        
        # Если это словарь и есть ключ 'Amenities'
        if isinstance(amenities_data, dict) and 'Amenities' in amenities_data:
            for category, items in amenities_data['Amenities'].items():
                for item_label in items:
                    processed_amenities.append(schemas.Amenity(icon=item_label["icon"], label=item_label["label"]))

    processed_photo_urls = []
    # Обработка photo_urls - может быть строкой JSON или словарем
    if apartment.photo_urls:
        photo_data = apartment.photo_urls
        # Если это строка, пытаемся распарсить как JSON
        if isinstance(photo_data, str):
            try:
                photo_data = json.loads(photo_data)
            except json.JSONDecodeError:
                print(f"Ошибка парсинга JSON для apartment {apartment.id}: {photo_data}")
                photo_data = None
        
        # Если это словарь и есть ключ 'Images'
        if isinstance(photo_data, dict) and 'Images' in photo_data:
            if isinstance(photo_data['Images'], list):
                processed_photo_urls = photo_data['Images']
        # Если это просто список (прямо)
        elif isinstance(photo_data, list):
            processed_photo_urls = photo_data

    # Создаем словарь данных квартиры, чтобы передать его в ApartmentOut
    apartment_data = apartment.__dict__.copy()
    apartment_data['amenities'] = processed_amenities
    apartment_data['photo_urls'] = processed_photo_urls
    apartment_data.pop('_sa_instance_state', None)

    return schemas.ApartmentOut(**apartment_data)

# 📌 Получить все квартиры с фильтрацией по городу и датам
@router.get("/", response_model=List[schemas.ApartmentOut])
def list_apartments(
    db: Session = Depends(get_db),
    city: str = FastAPIQuery(None, description="Город или часть адреса"),
    start_date: str = FastAPIQuery(None, description="Дата заезда в формате YYYY-MM-DD"),
    end_date: str = FastAPIQuery(None, description="Дата выезда в формате YYYY-MM-DD")
):
    query = db.query(models.Apartment)
    if city:
        query = query.filter(models.Apartment.city.ilike(f"%{city}%"))
    apartments = query.all()

    # ВРЕМЕННО отключаем фильтрацию по датам для теста
    # if start_date and end_date:
    #     ...
    #     apartments = available_apartments

    results = []
    for apartment in apartments:
        results.append(process_apartment_data(apartment))
    return results


# 📌 Получить квартиру по ID
@router.get("/{apartment_id}", response_model=schemas.ApartmentOut)
def get_apartment_by_id(apartment_id: int, db: Session = Depends(get_db)):
    apartment = db.query(models.Apartment).filter(models.Apartment.id == apartment_id).first()
    if not apartment:
        raise HTTPException(status_code=404, detail="Квартира не найдена")

    return process_apartment_data(apartment)


# 📌 Добавить квартиру (доступно только админу)
@router.post("/", response_model=schemas.ApartmentOut)
def create_apartment(
    apartment: schemas.ApartmentCreate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(fake_admin_check)
):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can add apartments")
    db_apartment = models.Apartment(**apartment.dict())
    db.add(db_apartment)
    db.commit()
    db.refresh(db_apartment)
    return db_apartment

# 📌 Обновить квартиру по ID (доступно только админу)
@router.put("/{apartment_id}", response_model=schemas.ApartmentOut)
def update_apartment(
    apartment_id: int,
    apartment_update: schemas.ApartmentCreate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(fake_admin_check)
):
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update apartments")

    db_apartment = db.query(models.Apartment).filter(models.Apartment.id == apartment_id).first()
    if not db_apartment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Квартира не найдена")

    for key, value in apartment_update.dict(exclude_unset=True).items():
        setattr(db_apartment, key, value)

    db.add(db_apartment)
    db.commit()
    db.refresh(db_apartment)
    return db_apartment


# 📌 Удалить квартиру по ID (доступно только админу)
@router.delete("/{apartment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_apartment(
    apartment_id: int,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(fake_admin_check)
):
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete apartments")

    db_apartment = db.query(models.Apartment).filter(models.Apartment.id == apartment_id).first()
    if not db_apartment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Квартира не найдена")

    db.delete(db_apartment)
    db.commit()
    return {"message": "Квартира успешно удалена"}

# 📐 Функция для расчёта расстояния по формуле Haversine
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Радиус Земли в км
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

# 📍 Эндпоинт: /apartments/nearby
@router.get("/nearby", response_model=List[schemas.ApartmentOut])
def get_nearby_apartments(
    lat: float = Query(..., description="Ваше местоположение: широта"),
    lon: float = Query(..., description="Ваше местоположение: долгота"),
    radius_km: float = Query(5, description="Радиус поиска в километрах"),
    db: Session = Depends(get_db)
):
    apartments = db.query(models.Apartment).filter(
        models.Apartment.latitude.isnot(None),
        models.Apartment.longitude.isnot(None)
    ).all()

    nearby = []

    for apt in apartments:
        dist = haversine(lat, lon, apt.latitude, apt.longitude)
        if dist <= radius_km:
            nearby.append((dist, apt))

    # Отсортируем по расстоянию
    nearby.sort(key=lambda x: x[0])
    
    # Обрабатываем результаты
    results = []
    for _, apartment in nearby:
        results.append(process_apartment_data(apartment))
    
    return results

# 📌 Получить все новостройки
@router.get("/complexes", response_model=List[schemas.ResidentialComplexOut])
def list_residential_complexes(db: Session = Depends(get_db)):
    return db.query(models.ResidentialComplex).all()

# 📌 Создать новостройку (только для админа)
@router.post("/complexes", response_model=schemas.ResidentialComplexOut)
def create_residential_complex(
    complex_in: schemas.ResidentialComplexCreate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(fake_admin_check)
):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can add complexes")
    db_complex = models.ResidentialComplex(**complex_in.dict())
    db.add(db_complex)
    db.commit()
    db.refresh(db_complex)
    return db_complex

# 📌 Получить все квартиры в новостройке по id
@router.get("/complexes/{complex_id}/apartments", response_model=List[schemas.ApartmentOut])
def get_apartments_by_complex(complex_id: int, db: Session = Depends(get_db)):
    apartments = db.query(models.Apartment).filter(models.Apartment.residential_complex_id == complex_id).all()
    results = []
    for apartment in apartments:
        results.append(process_apartment_data(apartment))
    return results

# 📌 Обновить новостройку по id (только для админа)
@router.put("/complexes/{complex_id}", response_model=schemas.ResidentialComplexOut)
def update_residential_complex(
    complex_id: int,
    complex_update: schemas.ResidentialComplexCreate,
    db: Session = Depends(get_db),
    is_admin: bool = Depends(fake_admin_check)
):
    db_complex = db.query(models.ResidentialComplex).filter(models.ResidentialComplex.id == complex_id).first()
    if not db_complex:
        raise HTTPException(status_code=404, detail="Новостройка не найдена")
    for key, value in complex_update.dict(exclude_unset=True).items():
        setattr(db_complex, key, value)
    db.add(db_complex)
    db.commit()
    db.refresh(db_complex)
    return db_complex