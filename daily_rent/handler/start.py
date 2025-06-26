from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

async def start_command(message: types.Message):
    markup = InlineKeyboardMarkup().add(
        InlineKeyboardButton(
            "Открыть DailyRent",
            web_app=WebAppInfo(url="https://3d3c7a576ea40b.lhr.life")
        )
    )
    await message.answer("Запусти Web App 👇", reply_markup=markup)
