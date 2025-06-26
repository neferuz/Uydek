"use client";

import React, { useState, useEffect } from 'react';
import BottomMenu from '../components/BottomMenu';
import styles from './AccountPage.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import PastTripsModal from './PastTripsModal';

// Интерфейс для данных, которые приходят от Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  photo_url?: string;
  is_premium?: boolean;
}

// Ваши существующие интерфейсы (возможно, они понадобятся для PastTripsModal)
interface Booking {
  id: number;
  apartment_id: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface VillaBooking {
  id: number;
  villa_id: number;
  start_date: string;
  end_date: string;
  status: string;
}

// Расширенный интерфейс пользователя, если вы планируете объединять данные
// от Telegram с данными из вашей базы данных.
// На данный момент страница использует только TelegramUser.
interface AppUser extends TelegramUser {
  phone?: string; // Этих полей нет в initDataUnsafe
  created_at?: string; // Этих полей нет в initDataUnsafe
  bookings?: Booking[];
  villa_bookings?: VillaBooking[];
}


export default function AccountPage() {
  // Используем более строгий тип для пользователя
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPastTripsModal, setShowPastTripsModal] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Основной хук для получения данных пользователя из Telegram
  useEffect(() => {
    // Убедимся, что код выполняется только на клиенте
    if (typeof window !== 'undefined') {
      const tg = window.Telegram?.WebApp;

      if (tg) {
        // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ ---
        // Сообщаем Telegram, что приложение готово.
        // Это гарантирует, что все данные, включая initDataUnsafe, доступны.
        tg.ready();

        const userData = tg.initDataUnsafe?.user;

        if (userData) {
          console.log("Telegram User Data:", userData); // Отлично подходит для отладки
          // Здесь можно будет в будущем объединить данные от Telegram
          // с данными из вашей собственной базы данных, если потребуется.
          setUser({
            ...userData,
            bookings: [], // Заполните эти данные при необходимости
            villa_bookings: [], // Заполните эти данные при необходимости
          });
        } else {
          setError('Не удалось получить данные пользователя. Убедитесь, что приложение открыто через Telegram.');
        }
      } else {
        // Это сработает, если открыть страницу в обычном браузере для тестирования
        setError('Приложение должно быть запущено внутри Telegram.');
      }

      setLoading(false);
    }
  }, []); // Пустой массив зависимостей гарантирует вызов только один раз при монтировании

  // Хук для открытия модального окна по параметру в URL
  useEffect(() => {
    if (searchParams.get('showPastTrips') === '1') {
      setShowPastTripsModal(true);
    }
  }, [searchParams]);

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Загрузка профиля...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{error}</div>;
  }

  if (!user) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Не удалось загрузить данные пользователя.</div>;
  }

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Профиль</h1>
        <div className={styles.profileCard}>
          <div className={styles.profileImageContainer}>
            <img
              src={user.photo_url || "/default-avatar.png"}
              alt="Telegram Profile"
              className={styles.profileImage}
            />
          </div>
          <h2 className={styles.userName}>{user.first_name} {user.last_name || ''}</h2>
          <p className={styles.userLocation}>Tashkent, Узбекистан</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div
            style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 18, textAlign: 'center', position: 'relative', cursor: 'pointer' }}
            onClick={() => setShowPastTripsModal(true)}
          >
            <span style={{ position: 'absolute', top: 10, right: 10, background: '#1A73E8', color: '#fff', borderRadius: 8, fontSize: 12, padding: '2px 8px', fontWeight: 600 }}>НОВОЕ</span>
            <svg width="48" height="48" viewBox="0 0 67 116" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.48148" y="29.0555" width="62.037" height="79.4074" rx="16.1296" stroke="black" strokeWidth="4.96296" /><path d="M17.3704 27.8148V10.9097C17.3704 6.5413 20.9117 3 25.2801 3V3H33.1898H41.0995V3C45.4679 3 49.0093 6.5413 49.0093 10.9097V27.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" /><line x1="21.0926" y1="41.463" x2="44.6666" y2="41.463" stroke="black" strokeWidth="4.96296" strokeLinecap="round" /><line x1="33.5" y1="60.0741" x2="33.5" y2="94.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" /><line x1="17.3704" y1="60.0741" x2="17.3704" y2="94.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" /><line x1="49.6296" y1="60.0741" x2="49.6296" y2="94.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" /><path d="M16.75 113.426C16.75 114.796 17.861 115.907 19.2315 115.907C20.602 115.907 21.713 114.796 21.713 113.426H16.75ZM16.75 109.704V113.426H21.713V109.704H16.75Z" fill="black" /><path d="M44.6667 113.426C44.6667 114.796 45.7776 115.907 47.1481 115.907C48.5186 115.907 49.6296 114.796 49.6296 113.426H44.6667ZM44.6667 109.704V113.426H49.6296V109.704H44.6667Z" fill="black" /></svg>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Прошлые поездки</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 0, marginBottom: 24 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 500, cursor: 'pointer' }}>
              <span style={{ marginRight: 14 }}><svg width="22" height="22" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg></span>
              Помощь
            </li>
            <li style={{ display: 'flex', alignItems: 'center', padding: '18px 20px', fontWeight: 500, cursor: 'pointer' }}>
              <span style={{ marginRight: 14 }}><svg width="22" height="22" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg></span>
              Хочу сдавать свою квартиру
            </li>
          </ul>
        </div>
      </main>

      <BottomMenu likedItemsCount={0} />

      {showPastTripsModal && user?.bookings && (
        <PastTripsModal
          bookings={user.bookings}
          villaBookings={user.villa_bookings || []}
          onClose={() => setShowPastTripsModal(false)}
        />
      )}
    </div>
  );
}