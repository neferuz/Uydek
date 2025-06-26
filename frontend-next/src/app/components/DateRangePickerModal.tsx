"use client";

import React, { useState, useEffect } from 'react';
import styles from './DateRangePickerModal.module.css'; // Импортируем новый CSS-модуль

interface DateRangePickerModalProps {
  onClose: () => void;
  onSelectDates: (startDate: string | null, endDate: string | null, nights: number) => void;
  initialStartDate: string | null; // Формат YYYY-MM-DD
  initialEndDate: string | null; // Формат YYYY-MM-DD
}

export default function DateRangePickerModal({
  onClose,
  onSelectDates,
  initialStartDate,
  initialEndDate,
}: DateRangePickerModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate ? new Date(initialStartDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate ? new Date(initialEndDate) : null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      setStartDate(new Date(initialStartDate));
      setEndDate(new Date(initialEndDate));
      setCurrentMonth(new Date(initialStartDate));
    }
  }, [initialStartDate, initialEndDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday...
  };

  const renderCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);

    const days = [];
    // Empty cells for days before the 1st of the month
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) { // Adjust for Monday start
      days.push(<div key={`empty-${i}`} className="day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      // Получаем дату в формате YYYY-MM-DD для точного сравнения
      const formattedDayDate = dayDate.toISOString().split('T')[0];

      const isPastDay = dayDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
      const isSelected = (startDate && formattedDayDate === startDate.toISOString().split('T')[0]) ||
                         (endDate && formattedDayDate === endDate.toISOString().split('T')[0]);
      const isInRange = startDate && endDate && dayDate > startDate && dayDate < endDate;
      
      let dayClassName = 'day';
      if (isPastDay) dayClassName += ' past-day';
      if (isSelected) dayClassName += ' selected';
      if (isInRange) dayClassName += ' in-range';

      // Special classes for start/end of range
      if (startDate && formattedDayDate === startDate.toISOString().split('T')[0]) {
        dayClassName += ' start-date';
      }
      if (endDate && formattedDayDate === endDate.toISOString().split('T')[0]) {
        dayClassName += ' end-date';
      }
      // If it's a single day selection (start and end are the same)
      if (startDate && endDate && startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0] && formattedDayDate === startDate.toISOString().split('T')[0]) {
        dayClassName += ' start-date end-date'; // Apply both to make it round
      }

      const handleDayClick = () => {
        if (isPastDay) return; // Не позволяем выбирать прошедшие даты

        if (!startDate || (startDate && endDate)) { // Если нет начальной даты или уже выбран диапазон (начало нового выбора)
          setStartDate(dayDate);
          setEndDate(null);
        } else if (dayDate < startDate) { // Если новая дата до начальной, меняем начальную
          setStartDate(dayDate);
          setEndDate(null);
        } else { // Если новая дата после начальной, завершаем диапазон
          setEndDate(dayDate);
        }
      };

      days.push(
        <div key={i} className={dayClassName} onClick={handleDayClick}>
          {i}
        </div>
      );
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const calculateNights = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const nights = calculateNights();
      onSelectDates(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], nights);
      onClose();
    } else {
      alert('Пожалуйста, выберите диапазон дат.');
    }
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setCurrentMonth(new Date()); // Сбросить на текущий месяц
  };

  const isApplyDisabled = !(startDate && endDate && calculateNights() > 0);

  return (
    <div className={`${styles["modal-overlay"]} ${styles["open"]}`}> {/* Используем новые стили */} 
      <div className={styles["modal-content"]}> {/* Используем новые стили */} 
        <div className={styles["modal-header"]}>
          <h3>Выберите даты</h3>
          <button onClick={onClose} className={styles["close-button"]}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={`${styles["search-section"]} ${styles["date-section"]}`}> 
          <div className={styles["calendar"]}>
            <div className={styles["calendar-header"]}>
              <button onClick={handlePrevMonth}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h4>{getMonthName(currentMonth)}</h4>
              <button onClick={handleNextMonth}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className={styles["weekdays"]}>
              <span>Пн</span>
              <span>Вт</span>
              <span>Ср</span>
              <span>Чт</span>
              <span>Пт</span>
              <span>Сб</span>
              <span>Вс</span>
            </div>
            <div className={styles["days-grid"]}>
              {renderCalendar(currentMonth)}
            </div>
          </div>
        </div>

        <div className={styles["modal-footer"]}>
          <button className={styles["reset-button"]} onClick={handleClear} disabled={!startDate && !endDate}>Очистить</button>
          <button className={styles["next-button"]} onClick={handleApply} disabled={isApplyDisabled}>Применить</button>
        </div>
      </div>
    </div>
  );
} 