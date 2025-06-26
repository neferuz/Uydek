// SearchModal.tsx
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from 'clsx';
import './SearchModal.css';

// --- Вспомогательные функции ---

// Функция для форматирования диапазона дат и подсчета суток
const formatDateInfo = (start: Date | null, end: Date | null) => {
  if (!start || !end) return '';

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startDate = start.toLocaleDateString('ru-RU', options);
  const endDate = end.toLocaleDateString('ru-RU', options);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let суток;
  if (diffDays % 10 === 1 && diffDays % 100 !== 11) {
    суток = 'сутки';
  } else if ([2, 3, 4].includes(diffDays % 10) && ![12, 13, 14].includes(diffDays % 100)) {
    суток = 'суток';
  } else {
    суток = 'суток';
  }

  return `${startDate} - ${endDate}, ${diffDays} ${суток}`;
};

const getMonthsToDisplay = (startDate: Date, numberOfMonths: number) => {
  const months = [];
  for (let i = 0; i < numberOfMonths; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = date.toLocaleString('ru-RU', { month: 'long' });
    const days = [];
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
    for (let j = 0; j < firstDayOfWeek; j++) { days.push(null); }
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let j = 1; j <= daysInMonth; j++) { days.push(new Date(year, month, j)); }
    months.push({ year, monthName, days });
  }
  return months;
};

const today = new Date();
today.setHours(0, 0, 0, 0);

// --- Типы ---
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (params: { startDate: Date | null, endDate: Date | null, adults: number, children: number, pets: boolean, city: string }) => void;
  valueStartDate: Date | null;
  valueEndDate: Date | null;
  onChangeStartDate: (date: Date | null) => void;
  onChangeEndDate: (date: Date | null) => void;
}

// --- Компонент ---
export default function SearchModal({ isOpen, onClose, onSearch, valueStartDate, valueEndDate, onChangeStartDate, onChangeEndDate }: SearchModalProps) {
  const [view, setView] = useState<'calendar' | 'guests'>('calendar');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState(false);
  const months = useMemo(() => getMonthsToDisplay(new Date(), 12), []);

  const handleDayClick = (day: Date) => {
    if (day < today) return;
    if (!valueStartDate || (valueStartDate && valueEndDate)) { onChangeStartDate(day); onChangeEndDate(null); setHoveredDate(null); }
    else if (day < valueStartDate) { onChangeStartDate(day); }
    else { onChangeEndDate(day); setHoveredDate(null); }
  };

  const handleDayHover = (day: Date) => {
    if (valueStartDate && !valueEndDate && day >= valueStartDate) {
      setHoveredDate(day);
    }
  };

  const clearDates = () => { onChangeStartDate(null); onChangeEndDate(null); };

  const totalGuests = adults + children;
  const guestText = `${totalGuests} ${totalGuests === 1 ? 'гость' : (totalGuests > 1 && totalGuests < 5) ? 'гостя' : 'гостей'}`;

  const pageVariants = {
    initial: (direction: number) => ({ opacity: 0, x: direction > 0 ? '50%' : '-50%' }),
    animate: { opacity: 1, x: '0%' },
    exit: (direction: number) => ({ opacity: 0, x: direction < 0 ? '50%' : '-50%' }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 400, damping: 40 }}>

            <AnimatePresence mode="wait" initial={false} custom={view === 'guests' ? 1 : -1}>
              {view === 'calendar' ? (
                // --- СТРАНИЦА КАЛЕНДАРЯ ---
                <motion.div key="calendar" className="modal-page" custom={-1} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                  <div className="modal-header">
                    <div className="info-header">
                      <h2 className="info-title">Ташкент, Узбекистан</h2>
                      <p className="info-subtitle">Когда, {guestText}</p>
                    </div>
                    <button onClick={onClose} className="close-button">
                      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="m6 6 20 20"></path><path d="m26 6-20 20"></path></svg>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="date-inputs">
                      <div className="date-input-field"><span className="date-input-label">Заезд</span><span className="date-input-value">{valueStartDate ? valueStartDate.toLocaleDateString('ru-RU') : 'Выберите'}</span></div>
                      <div className="date-input-separator" />
                      <div className="date-input-field"><span className="date-input-label">Отъезд</span><span className="date-input-value">{valueEndDate ? valueEndDate.toLocaleDateString('ru-RU') : 'Когда'}</span></div>
                    </div>
                    <div className="calendar-container" onMouseLeave={() => setHoveredDate(null)}>
                      <div className="weekdays">{['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map(d => <div key={d}>{d}</div>)}</div>
                      <div className="calendar-scroll-area">
                        {months.map(({ year, monthName, days }) => (
                          <div key={`${monthName}-${year}`} className="month">
                            <h3 className="month-header">{monthName} {year}</h3>
                            <div className="days-grid">
                              {days.map((day, idx) => {
                                if (!day) return <div key={idx} className="day-cell empty" />;
                                const isPast = day < today;
                                const isStartDate = valueStartDate && day.getTime() === valueStartDate.getTime();
                                const isEndDate = valueEndDate && day.getTime() === valueEndDate.getTime();
                                const isInRange = valueStartDate && valueEndDate && day > valueStartDate && day < valueEndDate;
                                const isHovering = hoveredDate && valueStartDate && !valueEndDate && day > valueStartDate && day <= hoveredDate;
                                return (
                                  <div key={idx} className={clsx('day-cell', { 'is-in-range': isInRange || isHovering, 'is-range-start': isStartDate, 'is-range-end': isEndDate || (isStartDate && hoveredDate && day.getTime() === hoveredDate.getTime()) })} onMouseEnter={() => !isPast && handleDayHover(day)}>
                                    <button className={clsx('day-button', { 'is-today': day.getTime() === today.getTime() && !isStartDate && !isEndDate, 'is-selected': isStartDate || isEndDate, 'is-disabled': isPast })} onClick={() => handleDayClick(day)} disabled={isPast}>{day.getDate()}</button>
                                  </div>);
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="footer-button clear" onClick={clearDates}>Сбросить</button>
                    <button className="footer-button apply" disabled={!valueStartDate || !valueEndDate} onClick={() => setView('guests')}>Далее</button>
                  </div>
                </motion.div>

              ) : (

                // --- СТРАНИЦА ВЫБОРА ГОСТЕЙ ---
                <motion.div key="guests" className="modal-page" custom={1} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
                  <div className="modal-header guest-header">
                    <button onClick={() => setView('calendar')} className="back-button">
                      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M14.293 5.293a1 1 0 0 1 1.414 0l10 10a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1-1.414-1.414L23.586 17H7a1 1 0 1 1 0-2h16.586L14.293 6.707a1 1 0 0 1 0-1.414z" transform="rotate(180 16 16)"></path></svg>
                    </button>
                    <div className="info-header">
                      <h2 className="info-title">Ташкент, Узбекистан</h2>
                      <p className="info-subtitle">{formatDateInfo(valueStartDate, valueEndDate)}, {guestText}</p>
                    </div>
                  </div>
                  <div className="modal-body">
                    <div className="guest-options-list">
                      <div className="guest-option">
                        <div>
                          <div className="guest-option-label">Взрослые</div>
                          <div className="guest-option-subtitle">От 18 лет</div>
                        </div>
                        <div className="counter">
                          <button className="counter-btn" onClick={() => setAdults(v => v - 1)} disabled={adults <= 1}>–</button>
                          <span className="counter-value">{adults}</span>
                          <button className="counter-btn" onClick={() => setAdults(v => v + 1)} disabled={totalGuests >= 16}>+</button>
                        </div>
                      </div>
                      <div className="guest-option">
                        <div>
                          <div className="guest-option-label">Дети</div>
                          <div className="guest-option-subtitle">До 17 лет</div>
                        </div>
                        <div className="counter">
                          <button className="counter-btn" onClick={() => setChildren(v => v - 1)} disabled={children <= 0}>–</button>
                          <span className="counter-value">{children}</span>
                          <button className="counter-btn" onClick={() => setChildren(v => v + 1)} disabled={totalGuests >= 16}>+</button>
                        </div>
                      </div>
                      <div className="guest-option">
                        <div className="guest-option-label">Питомцы</div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={pets} onChange={e => setPets(e.target.checked)} />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="footer-button find"
                      onClick={() => {
                        onSearch({ startDate: valueStartDate, endDate: valueEndDate, adults, children, pets, city: 'Ташкент' });
                        onClose();
                      }}
                    >
                      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M13 3a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm15.707 3.293-6-6a1 1 0 0 0-1.414 1.414l6 6a1 1 0 0 0 1.414-1.414z" fill="currentColor"></path></svg>
                      Найти
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}