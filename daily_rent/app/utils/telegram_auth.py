from hmac import new as hmac_new
from hashlib import sha256
from urllib.parse import unquote
import json
import logging

def validate_init_data(init_data: str, bot_token: str) -> None | dict:
    """Validates init data from webapp to check if a method was received from Telegram
    Args:
        init_data (str): init_data string received from webapp
        bot_token (str): token of bot that initiated webapp
    Returns:
        None | dict[str, str]: object with data deserialized (user is not deserialized, you can do it by own, it's simple json) on successful validation, otherwise None
    """
    logger = logging.getLogger("telegram_auth")
    logger.info(f"[validate_init_data] Получено init_data: {init_data}")

    hash_string = ""
    init_data_dict = dict()

    try:
        for chunk in init_data.split("&"):
            key, value = chunk.split("=", 1)
            if key == "hash":
                hash_string = value
                continue
            init_data_dict[key] = unquote(value)
    except Exception as e:
        logger.error(f"Ошибка парсинга init_data: {e}")
        return None

    if hash_string == "":
        logger.error("hash не найден в init_data")
        return None

    # Формируем строку для проверки подписи по документации Telegram
    data_check_string = "\n".join(
        [f"{key}={init_data_dict[key]}" for key in sorted(init_data_dict.keys())]
    )
    logger.info(f"[validate_init_data] data_check_string: {data_check_string}")

    # Официальный способ: секретный ключ через hmac с ключом 'WebAppData'
    secret_key = hmac_new(b"WebAppData", bot_token.encode(), sha256).digest()
    data_check = hmac_new(secret_key, data_check_string.encode(), sha256).hexdigest()

    logger.info(f"[validate_init_data] data_check: {data_check}")
    logger.info(f"[validate_init_data] hash_string: {hash_string}")

    if data_check != hash_string:
        logger.error("Hash не совпал! Валидация не пройдена.")
        return None
    
    # Десериализуем user, если он присутствует
    if 'user' in init_data_dict:
        try:
            init_data_dict['user'] = json.loads(init_data_dict['user'])
        except json.JSONDecodeError:
            logger.error("user не является валидным JSON")
            return None # Если user не является валидным JSON, считаем данные невалидными

    logger.info(f"[validate_init_data] Валидация успешна! user: {init_data_dict.get('user')}")
    return init_data_dict
