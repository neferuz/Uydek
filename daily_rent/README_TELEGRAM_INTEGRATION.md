# Telegram WebApp Integration для Daily Rent

## Обзор

Этот проект теперь полностью интегрирован с Telegram WebApp для получения данных пользователя и улучшения пользовательского опыта.

## Что было добавлено

### 1. TelegramProvider (Frontend)
- **Файл**: `frontend-next/src/app/components/TelegramProvider.tsx`
- **Функции**:
  - Инициализация Telegram WebApp
  - Получение данных пользователя
  - Отправка данных в бот
  - Управление состоянием загрузки и ошибок

### 2. Обновленный бот
- **Файл**: `daily_rent/bot.py`
- **Новые функции**:
  - Обработка данных от веб-приложения
  - Улучшенное меню с кнопками
  - Команда `/help`
  - Логирование действий пользователей

### 3. Обновленные страницы
- **Главная страница**: Интеграция с TelegramProvider
- **Страница аккаунта**: Использование данных Telegram пользователя
- **Тестовая страница**: `telegram-user.html` для проверки интеграции

### 4. Скрипты для ngrok
- **get_ngrok_url.py**: Автоматическое получение ngrok URL
- **update_webapp_url.py**: Ручное обновление URL веб-приложения

## Как запустить

### 1. Установка ngrok
```bash
# Скачайте ngrok с https://ngrok.com/
# Или установите через npm
npm install -g ngrok

# Или через Homebrew (macOS)
brew install ngrok
```

### 2. Настройка ngrok
```bash
# Авторизуйтесь в ngrok (получите токен на https://dashboard.ngrok.com/)
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Запустите туннель для фронтенда (Next.js на порту 3000)
ngrok http 3000

# В отдельном терминале запустите туннель для бэкенда (FastAPI на порту 8000)
ngrok http 8000
```

### 3. Автоматическое обновление URL (рекомендуется)
```bash
# После запуска ngrok, автоматически обновите конфигурацию
cd daily_rent
python get_ngrok_url.py
```

### 4. Ручное обновление URL (альтернатива)
```bash
# Если автоматическое обновление не работает
cd daily_rent
python update_webapp_url.py
```

### 5. Обновление переменных окружения
После запуска ngrok получите публичные URL и обновите файлы:

**daily_rent/.env:**
```env
BOT_TOKEN=8065953292:AAGzNG5IKBDRIUXMtsr1XHPXZl4FUHZ0L9A
DATABASE_URL="postgresql://imells:1235804679farangizF.@localhost:5432/daily_rent_db"
WEBAPP_URL=https://your-ngrok-url.ngrok-free.app
```

**frontend-next/.env.local:**
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-ngrok-url.ngrok-free.app
```

### 6. Бэкенд
```bash
cd daily_rent
pip install -r requirements.txt
python bot.py
```

### 7. Frontend
```bash
cd frontend-next
npm install
npm run dev
```

### 8. Проверка работы
1. Откройте Telegram
2. Найдите вашего бота
3. Отправьте команду `/start`
4. Нажмите кнопку "🏠 Открыть Daily Rent"

## Быстрый старт (автоматический)

```bash
# 1. Запустите ngrok
ngrok http 3000

# 2. В новом терминале обновите конфигурацию
cd daily_rent
python get_ngrok_url.py

# 3. Запустите бота
python bot.py

# 4. В новом терминале запустите фронтенд
cd frontend-next
npm run dev
```

## Важные замечания по ngrok

### Бесплатный план ngrok
- **Ограничения**: 1 туннель одновременно, 40 подключений/минуту
- **Решение**: Используйте один туннель для фронтенда, а бэкенд разместите на VPS

### Платный план ngrok
- **Преимущества**: Неограниченные туннели, стабильные URL
- **Рекомендуется** для продакшена

### Альтернативы ngrok
- **Cloudflare Tunnel** - бесплатно, без ограничений
- **LocalTunnel** - бесплатно, но менее стабильно
- **VPS с доменом** - для продакшена

## Структура данных пользователя

### Telegram User Object
```typescript
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}
```

### Отправляемые в бот данные
```javascript
{
  action: 'user_verified' | 'profile_loaded' | 'apartments_loaded' | 'search_performed' | 'apartment_viewed',
  user_id: number,
  timestamp: string,
  // дополнительные данные в зависимости от action
}
```

## API Endpoints

### Регистрация пользователя по Telegram ID
```
POST /users/me/telegram-id
Content-Type: application/json

{
  "telegram_id": 123456789,
  "first_name": "Иван",
  "last_name": "Иванов",
  "username": "ivan_ivanov",
  "photo_url": "https://t.me/i/userpic/320/photo.jpg"
}
```

### Получение пользователя по Telegram Init Data
```
GET /users/me/telegram
Headers: {
  "X-Telegram-Init-Data": "query_id=...&user=...&auth_date=...&hash=..."
}
```

## Безопасность

### Валидация Init Data
- Используется HMAC-SHA256 для проверки подписи
- Проверяется timestamp (не старше 1 часа)
- Валидируется hash от Telegram

### Файл валидации
- `daily_rent/app/utils/telegram_auth.py`

## Отладка

### Debug информация
В режиме разработки (localhost) показывается debug информация:
- Init Data
- Данные пользователя
- Версия WebApp
- Параметры темы

### Логирование
- Бот логирует все действия пользователей
- Frontend отправляет данные о взаимодействиях
- Ошибки логируются в консоль

### Проверка ngrok туннелей
```bash
# Проверьте статус туннелей
ngrok status

# Просмотрите логи
ngrok http 3000 --log=stdout

# Проверьте ngrok API
curl http://127.0.0.1:4040/api/tunnels
```

## Полезные ссылки

- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp SDK](https://telegram.org/js/telegram-web-app.js)
- [ngrok Documentation](https://ngrok.com/docs)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

## Troubleshooting

### Проблема: Данные пользователя не загружаются
**Решение**: Проверьте, что приложение открыто через Telegram WebApp, а не в браузере

### Проблема: Бот не получает данные
**Решение**: Убедитесь, что в боте добавлен обработчик `MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data)`

### Проблема: Ошибка валидации Init Data
**Решение**: Проверьте правильность BOT_TOKEN и алгоритм валидации в `telegram_auth.py`

### Проблема: ngrok туннель не работает
**Решение**: 
1. Проверьте, что ngrok авторизован: `ngrok config check`
2. Убедитесь, что порт не занят: `lsof -i :3000`
3. Попробуйте другой порт: `ngrok http 3001`

### Проблема: CORS ошибки
**Решение**: 
1. Убедитесь, что бэкенд настроен для работы с ngrok URL
2. Добавьте ngrok URL в CORS настройки FastAPI
3. Проверьте, что фронтенд использует правильный BACKEND_URL

### Проблема: Скрипт get_ngrok_url.py не работает
**Решение**:
1. Убедитесь, что ngrok запущен: `ngrok http 3000`
2. Проверьте, что ngrok API доступен: `curl http://127.0.0.1:4040/api/tunnels`
3. Используйте ручное обновление: `python update_webapp_url.py` 