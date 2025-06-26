from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy import JSON  

from .database import Base  # временно можно закомментировать, если database.py не создан

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    telegram_id = Column(BigInteger, unique=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, nullable=True, unique=True, index=True)
    telegram_photo_url = Column(String, nullable=True)

    bookings = relationship("Booking", back_populates="user")
    villa_bookings = relationship("VillaBooking", back_populates="user")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    apartment_id = Column(Integer, ForeignKey("apartments.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="pending")  # pending | confirmed | cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    apartment = relationship("Apartment", back_populates="bookings")
    
    
class ResidentialComplex(Base):
    __tablename__ = "residential_complexes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    address = Column(String, nullable=True)
    description = Column(String, nullable=True)
    city = Column(String, nullable=True)  # Новый город
    apartments = relationship("Apartment", back_populates="residential_complex")

    def __str__(self):
        return f"{self.name} ({self.city})" if self.city else self.name

class Apartment(Base):
    __tablename__ = "apartments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=True)  # <--- добавлено поле city
    price_per_day = Column(Float, nullable=False)
    rooms = Column(Integer, default=1)

    amenities = Column(String, nullable=True)        # список удобств (JSON string)
    conditions = Column(String, nullable=True)     # условия проживания
    recommendations = Column(String, nullable=True) # рекомендации
    photo_urls = Column(String, nullable=True)       # список URL'ов фото (JSON string)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    bookings = relationship("Booking", back_populates="apartment")

    residential_complex_id = Column(Integer, ForeignKey("residential_complexes.id"), nullable=True)
    residential_complex = relationship("ResidentialComplex", back_populates="apartments")

class Villa(Base):
    __tablename__ = "villas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    address = Column(String, nullable=False)
    price_per_day = Column(Float, nullable=False)
    rooms = Column(Integer, default=1)
    total_area = Column(Float, nullable=True)  # общая площадь
    land_area = Column(Float, nullable=True)   # площадь участка
    floors = Column(Integer, default=1)        # количество этажей

    amenities = Column(JSON, nullable=True)        # список удобств
    conditions = Column(String, nullable=True)     # условия проживания
    recommendations = Column(String, nullable=True) # рекомендации
    photo_urls = Column(JSON, nullable=True)       # список URL'ов фото

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    bookings = relationship("VillaBooking", back_populates="villa")

class VillaBooking(Base):
    __tablename__ = "villa_bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    villa_id = Column(Integer, ForeignKey("villas.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="pending")  # pending | confirmed | cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="villa_bookings")
    villa = relationship("Villa", back_populates="bookings")

class Wishlist(Base):
    __tablename__ = "wishlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    apartment_id = Column(Integer, ForeignKey("apartments.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    apartment = relationship("Apartment")
