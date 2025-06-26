"use client";

import React, { useState, useMemo, useEffect } from 'react';
import DateRangePickerModal from '@/app/components/DateRangePickerModal';
import styles from './BookingConfirmationModal.module.css'; // Импортируем CSS-модуль

interface BookingConfirmationModalProps {
  onClose: () => void;
  apartmentTitle: string;
  apartmentArea: number;
  apartmentImageUrl: string;
  selectedDates: string;
  totalPrice: number;
  guestsCount: number; // Этот пропс теперь будет использоваться для инициализации, а не для прямого отображения
  onConfirmBooking: (startDate: string, endDate: string) => void; // Колбэк для подтверждения и оплаты
  onDatesChange: (startDate: string | null, endDate: string | null, nights: number) => void; // Добавляем колбэк для изменения дат
  displayNightsCount: number; // Добавляем этот пропс
  apartmentId: string; // Новый пропс: ID квартиры
  bookingStartDate: string | null; // Новый пропс: текущая дата начала бронирования
  bookingEndDate: string | null; // Новый пропс: текущая дата окончания бронирования
}

export default function BookingConfirmationModal({
  onClose,
  apartmentTitle,
  apartmentArea,
  apartmentImageUrl,
  selectedDates,
  totalPrice,
  guestsCount, // Этот пропс теперь будет использоваться для инициализации, а не для прямого отображения
  onConfirmBooking,
  onDatesChange, // Деструктурируем новый пропс
  displayNightsCount, // Деструктурируем новый пропс
  apartmentId, // Деструктурируем новый пропс
  bookingStartDate, // Деструктурируем новый пропс
  bookingEndDate, // Деструктурируем новый пропс
}: BookingConfirmationModalProps) {
  console.log('BookingConfirmationModal received bookingStartDate:', bookingStartDate);
  console.log('BookingConfirmationModal received bookingEndDate:', bookingEndDate);
  const [adultsCount, setAdultsCount] = React.useState(guestsCount || 2); // Инициализация с переданным значением или 2 по умолчанию
  const [childrenCount, setChildrenCount] = React.useState(0); // Добавляем состояние для детей
  const [showDateRangePicker, setShowDateRangePicker] = useState(false); // Состояние для управления видимостью календаря
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false); // Новое состояние для индикации загрузки
  const [availabilityError, setAvailabilityError] = useState<string | null>(null); // Новое состояние для сообщения об ошибке

  // Отключаем прокрутку фона при открытии модального окна
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset'; // Возвращаем прокрутку при закрытии модального окна
    };
  }, []);

  // Форматирование даты для отображения
  const formatDisplayDates = useMemo(() => {
    if (!bookingStartDate || !bookingEndDate) return selectedDates; // Fallback

    // Парсим дату в компоненты (год, месяц, день)
    const [startYear, startMonth, startDay] = bookingStartDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = bookingEndDate.split('-').map(Number);

    console.log('Parsed start date components:', { startYear, startMonth, startDay });
    console.log('Parsed end date components:', { endYear, endMonth, endDay });

    // Создаем объекты Date в локальном часовом поясе
    // Месяц в конструкторе Date 0-индексированный, поэтому вычитаем 1
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);

    const formatMonthShort = (date: Date) => {
      const month = date.toLocaleString('ru-RU', { month: 'short' });
      // Корректируем сокращения месяцев
      switch (month.toLowerCase()) {
        case 'янв.': return 'янв.';
        case 'февр.': return 'февр.';
        case 'март.': return 'март.';
        case 'апр.': return 'апр.';
        case 'мая': return 'май.';
        case 'июня': return 'июнь.';
        case 'июля': return 'июль.';
        case 'авг.': return 'авг.';
        case 'сен.': return 'сен.';
        case 'окт.': return 'окт.';
        case 'нояб.': return 'нояб.';
        case 'дек.': return 'дек.';
        default: return month;
      }
    };

    const startMonthFormatted = formatMonthShort(startDate);
    const endMonthFormatted = formatMonthShort(endDate);
    const year = startDate.getFullYear(); // Предполагаем, что год один и тот же

    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDay}-${endDay} ${startMonthFormatted} ${year} г.`;
    } else {
      return `${startDay} ${startMonthFormatted} - ${endDay} ${endMonthFormatted} ${year} г.`;
    }
  }, [bookingStartDate, bookingEndDate, selectedDates]);

  const handleAdultsChange = (delta: number) => {
    setAdultsCount((prevCount) => Math.max(1, prevCount + delta)); // Минимум 1 взрослый
  };

  const handleChildrenChange = (delta: number) => {
    setChildrenCount((prevCount) => Math.max(0, prevCount + delta)); // Минимум 0 детей
  };

  const displayGuestsText = () => {
    return `${adultsCount} взрослы${adultsCount === 1 ? 'й' : 'х'}`;
  };

  const displayChildrenText = () => {
    // Всегда возвращаем текст, даже если детей 0
    return `${childrenCount} ${childrenCount === 1 ? 'ребенок' : childrenCount >= 2 && childrenCount <= 4 ? 'ребенка' : 'детей'}`;
  };

  // Новая функция для проверки доступности
  const checkAvailability = async (start: string, end: string): Promise<boolean> => {
    setIsCheckingAvailability(true);
    setAvailabilityError(null); // Очищаем предыдущие ошибки
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/available?start=${start}&end=${end}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const isApartmentAvailable = data.some((apt: any) => apt.id === parseInt(apartmentId));

      if (!isApartmentAvailable) {
        setAvailabilityError('К сожалению, квартира занята на выбранные даты. Пожалуйста, выберите другие даты.');
        return false;
      }
      return true;
    } catch (error: any) {
      console.error("Ошибка при проверке доступности:", error);
      setAvailabilityError(error.message || "Ошибка при проверке доступности. Попробуйте еще раз.");
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Модифицированная функция, которая будет вызываться при нажатии "Подтвердить и оплатить"
  const handleConfirmAndPay = async () => {
    if (!bookingStartDate || !bookingEndDate) {
      setAvailabilityError("Пожалуйста, выберите даты для бронирования.");
      return;
    }

    // Проверяем доступность перед бронированием
    const available = await checkAvailability(bookingStartDate, bookingEndDate);
    if (available) {
      // Если квартира доступна, вызываем колбэк для бронирования
      await onConfirmBooking(bookingStartDate, bookingEndDate);
    }
  };

  return (
    <div className={styles["booking-modal-overlay"]}>
      <div className={styles["booking-modal-content"]}>
        <div className={styles["modal-header"]}>
          <h3>Подтвердите и оплатите</h3>
          <button onClick={onClose} className={styles["close-button"]}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles["modal-scrollable-content"]}>
          <div className={styles["booking-summary"]}>
            <div className={styles["apartment-summary-card"]}>
              <img src={apartmentImageUrl} alt={apartmentTitle} className={styles["apartment-summary-image"]} />
              <div className={styles["apartment-summary-details"]}>
                <p className={styles["apartment-summary-title"]}>{apartmentTitle}, площадь {apartmentArea} м2.</p>
              </div>
            </div>

            <div className={styles["trip-details-section"]}>
              <h4>Детали поездки</h4>
              <div className={styles["trip-details-item"]}>
                <p>{formatDisplayDates}</p>
                <button className={styles["change-button"]} onClick={() => setShowDateRangePicker(true)}>Изменить</button>
              </div>
              <div className={styles["trip-details-item"]}>
                <div className={styles["guest-text-container"]}>
                  <p>{displayGuestsText()}</p>
                  {displayChildrenText() && <p className={styles["children-text"]}>{displayChildrenText()}</p>}
                </div>
                <div className={styles["guest-controls-wrapper"]}>
                  <div className={styles["guest-controls"]}>
                    <button className={styles["control-button"]} onClick={() => handleAdultsChange(-1)}>-</button>
                    <span>{adultsCount}</span>
                    <button className={styles["control-button"]} onClick={() => handleAdultsChange(1)}>+</button>
                  </div>
                  <div className={styles["guest-controls"]}>
                    <button className={styles["control-button"]} onClick={() => handleChildrenChange(-1)}>-</button>
                    <span>{childrenCount}</span>
                    <button className={styles["control-button"]} onClick={() => handleChildrenChange(1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["total-price-section"]}>
              <h4>Полная цена</h4>
              <p>${totalPrice.toFixed(2)} USD</p>
            </div>

            <div className={styles["cancellation-policy"]}>
              <p>Плата за это бронирование не возвращается.</p>
              <a href="#" className={styles["change-rules-link"]}>Изменить правила</a>
            </div>
          </div>

          <div className={styles["payment-method-section"]}>
            <h4>Способ оплаты</h4>
            <div className={styles["payment-card-display"]}>
              <span>Оплата по карте любыми способами</span>
            </div>
            <div className={styles["payment-methods-list"]}>
              <div className={styles["payment-method-item"]}>Payme</div>
              <div className={styles["payment-method-item"]}>Click</div>
              <div className={styles["payment-method-item"]}>Uzum bank</div>
            </div>
          </div>

          <div className={styles["price-info-section"]}>
            <h4>Информация о цене</h4>
            <div className={styles["price-breakdown-item"]}>
              <p>${totalPrice.toFixed(2)} x {displayNightsCount} ночь{displayNightsCount === 1 ? '' : 'и'}</p>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles["total-usd-item"]}>
              <p>Итого USD</p>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles["total-sum-item"]}>
              <p>Итого SUM</p>
              <span>{(totalPrice * 13000).toLocaleString('ru-RU', { style: 'currency', currency: 'UZS' })}</span>
            </div>
          </div>

          {availabilityError && (
            <p className={styles["error-message"]}>{availabilityError}</p>
          )}
        </div>

        <div className={styles["confirm-button-container"]}>
          <button onClick={handleConfirmAndPay} className={styles["confirm-pay-button"]} disabled={isCheckingAvailability}> 
            {isCheckingAvailability ? 'Проверка доступности...' : 'Подтвердить и оплатить'}
          </button>
          <p className={styles["terms-text"]}>Нажимая кнопку, я принимаю <a href="#">условия бронирования</a>.</p>
          <p className={styles["confirmation-message"]}>К вам менеджер свяжется или напишет вам в телеграмм</p>
        </div>
      </div>

      {showDateRangePicker && (
        <DateRangePickerModal
          onClose={() => setShowDateRangePicker(false)}
          onSelectDates={onDatesChange}
          initialStartDate={bookingStartDate}
          initialEndDate={bookingEndDate}
        />
      )}
    </div>
  );
} 