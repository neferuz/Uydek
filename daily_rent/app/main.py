import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s %(message)s')

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from sqladmin import Admin, ModelView

from app.routers import users, apartments, bookings, admin, upload, villas, villa_bookings, wishlist
from app.database import engine # Импортируем engine из database.py
from app import models # Импортируем все ваши модели

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# СНАЧАЛА CORS!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://6153-185-215-5-240.ngrok-free.app",  # ngrok для Telegram WebApp
        "http://localhost:3000",                     # локальный фронт
        "http://127.0.0.1:3000",                     # локальный фронт (альтернативный)
        "http://172.20.10.2:3000",                   # локальная сеть (ваш IP)
        "http://192.168.0.103:3000",                 # локальная сеть (ваш IP, без слеша)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Потом роутеры
app.include_router(users.router)
app.include_router(apartments.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(villas.router)
app.include_router(villa_bookings.router)
app.include_router(wishlist.router)

# Инициализация SQLAdmin
admin = Admin(app, engine)

# Регистрация моделей в админ-панели
class UserAdmin(ModelView, model=models.User):
    column_list = [
        models.User.id,
        models.User.name,
        models.User.phone,
        models.User.is_admin,
        models.User.created_at,
        models.User.telegram_id,
        models.User.first_name,
        models.User.last_name,
        models.User.username
    ]

class ApartmentAdmin(ModelView, model=models.Apartment):
    column_list = [models.Apartment.id, models.Apartment.title, models.Apartment.address, models.Apartment.price_per_day, models.Apartment.rooms]

class BookingAdmin(ModelView, model=models.Booking):
    column_list = [models.Booking.id, models.Booking.user_id, models.Booking.apartment_id, models.Booking.start_date, models.Booking.end_date, models.Booking.status]

class VillaAdmin(ModelView, model=models.Villa):
    column_list = [models.Villa.id, models.Villa.title, models.Villa.address, models.Villa.price_per_day, models.Villa.rooms]

class VillaBookingAdmin(ModelView, model=models.VillaBooking):
    column_list = [models.VillaBooking.id, models.VillaBooking.user_id, models.VillaBooking.villa_id, models.VillaBooking.start_date, models.VillaBooking.end_date, models.VillaBooking.status]

class ResidentialComplexAdmin(ModelView, model=models.ResidentialComplex):
    column_list = [models.ResidentialComplex.id, models.ResidentialComplex.name, models.ResidentialComplex.city, models.ResidentialComplex.address, models.ResidentialComplex.description]

admin.add_view(UserAdmin)
admin.add_view(ApartmentAdmin)
admin.add_view(BookingAdmin)
admin.add_view(VillaAdmin)
admin.add_view(VillaBookingAdmin)
admin.add_view(ResidentialComplexAdmin)

# Создание таблиц базы данных
models.Base.metadata.create_all(bind=engine)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")