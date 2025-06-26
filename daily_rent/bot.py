from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
import os
from dotenv import load_dotenv
import logging
import json

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    try:
        keyboard = [
            [InlineKeyboardButton(
                text="🏠 Открыть Daily Rent",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )],
            [InlineKeyboardButton(
                text="👤 Мой профиль",
                web_app=WebAppInfo(url=f"{WEBAPP_URL}/account")
            )]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "🏠 Добро пожаловать в Daily Rent!\n\n"
            "Выберите действие:",
            reply_markup=reply_markup
        )
        logger.info(f"Start command handled for user {update.effective_user.id}")
    except Exception as e:
        logger.error(f"Error in start command: {e}")
        await update.message.reply_text(
            "Произошла ошибка. Пожалуйста, попробуйте позже."
        )

async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик данных от веб-приложения"""
    try:
        if update.message and update.message.web_app_data:
            data = update.message.web_app_data.data
            logger.info(f"Received webapp data: {data}")
            
            # Парсим данные
            try:
                parsed_data = json.loads(data)
                action = parsed_data.get('action')
                
                if action == 'user_verified':
                    user_id = parsed_data.get('user_id')
                    logger.info(f"User {user_id} verified successfully")
                    await update.message.reply_text(
                        "✅ Ваш профиль успешно подключен!\n"
                        "Теперь вы можете использовать все функции приложения."
                    )
                elif action == 'booking_created':
                    await update.message.reply_text(
                        "✅ Бронирование создано успешно!\n"
                        "Мы уведомим вас о статусе бронирования."
                    )
                else:
                    await update.message.reply_text(f"📦 Получены данные: {data}")
                    
            except json.JSONDecodeError:
                await update.message.reply_text(f"📦 Получены данные: {data}")
                
    except Exception as e:
        logger.error(f"Error handling webapp data: {e}")
        await update.message.reply_text(
            "Произошла ошибка при обработке данных."
        )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /help"""
    help_text = """
🤖 Daily Rent Bot - Помощь

📋 Доступные команды:
/start - Открыть главное меню
/help - Показать эту справку

🏠 Функции:
• Поиск и бронирование квартир
• Просмотр профиля и истории поездок
• Управление бронированиями

💬 Если у вас есть вопросы, обратитесь к администратору.
    """
    await update.message.reply_text(help_text)

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик ошибок"""
    logger.error(f"Update {update} caused error {context.error}")

def main():
    """Запуск бота"""
    try:
        # Создаем приложение
        application = Application.builder().token(BOT_TOKEN).build()
        
        # Добавляем обработчики
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("help", help_command))
        application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))
        application.add_error_handler(error_handler)
        
        # Запускаем бота
        logger.info("Starting Daily Rent bot...")
        application.run_polling(allowed_updates=Update.ALL_TYPES)
    except Exception as e:
        logger.error(f"Error in main: {e}")

if __name__ == "__main__":
    main()
