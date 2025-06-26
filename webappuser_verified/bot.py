import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, ReplyKeyboardMarkup, KeyboardButton
from aiogram.utils import executor

BOT_TOKEN = "7600468669:AAFnX4fL7YAycfbPHYVYPsgkFC4y8Xivepo"
WEBAPP_URL = "https://8d35-185-215-5-240.ngrok-free.app"


bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)

logging.basicConfig(level=logging.INFO)

@dp.message_handler(commands=["start"])
async def start(message: types.Message):
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(KeyboardButton(
        text="🚀 Открыть Web App",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    await message.answer("Нажми на кнопку ниже, чтобы открыть Web App:", reply_markup=keyboard)

@dp.message_handler(content_types=types.ContentType.WEB_APP_DATA)
async def webapp_data(message: types.Message):
    await message.answer(f"📦 Данные от Web App:\n{message.web_app_data.data}")

if __name__ == '__main__':
    print("✅ Бот запущен...")
    executor.start_polling(dp, skip_updates=True)
