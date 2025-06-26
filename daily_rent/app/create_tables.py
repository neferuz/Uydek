from app.models import Base, User, Apartment, Booking, Villa, VillaBooking, Wishlist, ResidentialComplex

# Добавляем создание таблицы ResidentialComplex
Base.metadata.create_all(bind=engine) 