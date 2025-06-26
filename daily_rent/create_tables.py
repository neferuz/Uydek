from app.database import Base, engine
import app.models

Base.metadata.drop_all(bind=engine, checkfirst=True)
Base.metadata.create_all(bind=engine, checkfirst=True)


print("🔄 Удаляю старые таблицы (если были)...")
Base.metadata.drop_all(bind=engine)

print("🛠 Создаю новые таблицы...")
Base.metadata.create_all(bind=engine)

print("✅ Готово! База обновлена.")
