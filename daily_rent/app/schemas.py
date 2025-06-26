from pydantic import BaseModel, EmailStr, root_validator
from typing import Optional, List, Dict
from datetime import datetime, date

# ==== USER ====

class UserBase(BaseModel):
    telegram_id: int
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    telegram_photo_url: Optional[str] = None

class UserCreate(UserBase):
    pass

# ==== AMENITY ====

class Amenity(BaseModel):
    icon: str
    label: str

# ==== RESIDENTIAL COMPLEX ====

class ResidentialComplexBase(BaseModel):
    name: str
    address: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None

class ResidentialComplexCreate(ResidentialComplexBase):
    pass

class ResidentialComplexOut(ResidentialComplexBase):
    id: int
    class Config:
        orm_mode = True

# ==== APARTMENT ====

class ApartmentBase(BaseModel):
    title: str
    description: Optional[str]
    address: str
    city: Optional[str] = None
    price_per_day: float
    rooms: Optional[int] = 1
    amenities: Optional[List[Amenity]] = None
    photo_urls: Optional[List[str]] = None
    conditions: Optional[str] = None
    recommendations: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    residential_complex_id: Optional[int] = None

class ApartmentCreate(ApartmentBase):
    pass

class ApartmentOut(ApartmentBase):
    id: int
    created_at: datetime
    residential_complex: Optional[ResidentialComplexOut] = None

    @root_validator(pre=True)
    def fix_fields(cls, values):
        if not isinstance(values, dict):
            values = values.__dict__
        
        # Обработка amenities - если это уже список объектов Amenity, оставляем как есть
        amenities = values.get('amenities')
        if amenities and not isinstance(amenities, list):
            # Если это словарь, пытаемся извлечь данные
            if isinstance(amenities, dict):
                all_amenities = []
                for v in amenities.values():
                    if isinstance(v, list):
                        all_amenities.extend(v)
                values['amenities'] = all_amenities
        
        # Обработка photo_urls - если это уже список строк, оставляем как есть
        photo_urls = values.get('photo_urls')
        if photo_urls and not isinstance(photo_urls, list):
            # Если это словарь, пытаемся извлечь Images
            if isinstance(photo_urls, dict):
                values['photo_urls'] = photo_urls.get('Images', [])
        
        return values

    class Config:
        from_attributes = True

# ==== VILLA ====

class VillaBase(BaseModel):
    title: str
    description: Optional[str]
    address: str
    price_per_day: float
    rooms: Optional[int] = 1
    total_area: Optional[float] = None
    land_area: Optional[float] = None
    floors: Optional[int] = 1
    amenities: Optional[List[Amenity]] = None
    photo_urls: Optional[List[str]] = None
    conditions: Optional[str] = None
    recommendations: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class VillaCreate(VillaBase):
    pass

class VillaOut(VillaBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==== BOOKING ====

class BookingBase(BaseModel):
    apartment_id: int
    start_date: datetime
    end_date: datetime

class BookingCreate(BookingBase):
    pass

class BookingOut(BookingBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    apartment: ApartmentOut

    class Config:
        orm_mode = True

# ==== VILLA BOOKING ====

class VillaBookingBase(BaseModel):
    villa_id: int
    start_date: datetime
    end_date: datetime

class VillaBookingCreate(VillaBookingBase):
    pass

class VillaBookingOut(VillaBookingBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    villa: VillaOut

    class Config:
        orm_mode = True

# ==== USER OUT ====

class UserOut(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    bookings: List[BookingOut] = []
    villa_bookings: List[VillaBookingOut] = []

    class Config:
        from_attributes = True

class WishlistItemOut(BaseModel):
    id: int
    apartment: ApartmentOut
    created_at: datetime

    class Config:
        orm_mode = True
