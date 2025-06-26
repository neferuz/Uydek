import requests
import os
import time
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

def get_ngrok_url():
    """Получает публичный URL из ngrok API"""
    try:
        # Получаем список туннелей ngrok
        response = requests.get("http://127.0.0.1:4040/api/tunnels")
        
        if response.status_code == 200:
            tunnels = response.json()["tunnels"]
            
            # Ищем HTTPS туннель
            for tunnel in tunnels:
                if tunnel["proto"] == "https":
                    return tunnel["public_url"]
            
            print("❌ HTTPS туннель не найден")
            return None
        else:
            print(f"❌ Ошибка получения туннелей: {response.status_code}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Не удалось подключиться к ngrok API")
        print("Убедитесь, что ngrok запущен: ngrok http 3000")
        return None
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return None

def update_env_file(new_url):
    """Обновляет .env файл с новым URL"""
    try:
        env_file = ".env"
        
        # Читаем текущий .env файл
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        # Обновляем WEBAPP_URL
        updated_lines = []
        webapp_url_updated = False
        
        for line in lines:
            if line.startswith("WEBAPP_URL="):
                updated_lines.append(f"WEBAPP_URL={new_url}\n")
                webapp_url_updated = True
            else:
                updated_lines.append(line)
        
        # Если WEBAPP_URL не найден, добавляем его
        if not webapp_url_updated:
            updated_lines.append(f"WEBAPP_URL={new_url}\n")
        
        # Записываем обновленный файл
        with open(env_file, 'w') as f:
            f.writelines(updated_lines)
        
        print(f"✅ .env файл обновлен: WEBAPP_URL={new_url}")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при обновлении .env файла: {e}")
        return False

def main():
    print("🔍 Получение ngrok URL...")
    print("=" * 40)
    
    # Ждем немного, чтобы ngrok успел запуститься
    print("⏳ Ожидание запуска ngrok...")
    time.sleep(2)
    
    # Получаем URL
    ngrok_url = get_ngrok_url()
    
    if ngrok_url:
        print(f"✅ Найден ngrok URL: {ngrok_url}")
        
        # Обновляем .env файл
        if update_env_file(ngrok_url):
            print("\n🎉 Конфигурация обновлена!")
            print("Теперь можно запускать бота:")
            print("python bot.py")
        else:
            print("❌ Не удалось обновить конфигурацию")
    else:
        print("\n💡 Ручная настройка:")
        print("1. Запустите ngrok: ngrok http 3000")
        print("2. Скопируйте HTTPS URL из терминала")
        print("3. Обновите .env файл вручную")

if __name__ == "__main__":
    main() 