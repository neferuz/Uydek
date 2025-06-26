import requests
import os

# Получаем список туннелей ngrok
try:
    tunnels = requests.get("http://127.0.0.1:4040/api/tunnels").json()["tunnels"]
    # Ищем https туннель
    public_url = next(t["public_url"] for t in tunnels if t["proto"] == "https")
except Exception as e:
    print("Не удалось получить адрес ngrok:", e)
    exit(1)

# Формируем полный URL для WebApp
webapp_url = f"{public_url}/telegram-user.html"

# Путь к .env
env_path = os.path.join(os.path.dirname(__file__), ".env")

# Обновляем .env
lines = []
found = False
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if line.startswith("WEBAPP_URL="):
                lines.append(f"WEBAPP_URL={webapp_url}\n")
                found = True
            else:
                lines.append(line)
if not found:
    lines.append(f"WEBAPP_URL={webapp_url}\n")
with open(env_path, "w") as f:
    f.writelines(lines)

print("WEBAPP_URL обновлен:", webapp_url) 