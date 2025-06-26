"use client";

import React, { useState, useEffect } from 'react';
// import Navbar from '../components/Navbar'; // Удаляем Navbar
import BottomMenu from '../components/BottomMenu';
import styles from './AccountPage.module.css'; // Импортируем стили
import { useRouter, useSearchParams } from 'next/navigation';
import PastTripsModal from './PastTripsModal';

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

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  telegram_id: string;
  telegram_photo_url?: string;
  bookings: Booking[];
  villa_bookings: VillaBooking[];
  username?: string;
  created_at?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState<boolean>(false);
  const [showPastTripsModal, setShowPastTripsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initDataUnsafe &&
      window.Telegram.WebApp.initDataUnsafe.user
    ) {
      setUser(window.Telegram.WebApp.initDataUnsafe.user);
    } else {
      setError('Откройте через Telegram WebApp!');
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('showPastTrips') === '1') {
      setShowPastTripsModal(true);
    }
  }, [searchParams]);

  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;
  if (!user) return <div style={{ padding: 24 }}>Загрузка...</div>;

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
          <h2 className={styles.userName}>{user.first_name} {user.last_name}</h2>
          <p className={styles.userLocation}>Tashkent, Узбекистан</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div
            style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 18, textAlign: 'center', position: 'relative', cursor: 'pointer' }}
            onClick={() => setShowPastTripsModal(true)}
          >
            <span style={{ position: 'absolute', top: 10, right: 10, background: '#1A73E8', color: '#fff', borderRadius: 8, fontSize: 12, padding: '2px 8px', fontWeight: 600 }}>НОВОЕ</span>
            <svg width="48" height="48" viewBox="0 0 67 116" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2.48148" y="29.0555" width="62.037" height="79.4074" rx="16.1296" stroke="black" strokeWidth="4.96296" />
              <path d="M17.3704 27.8148V10.9097C17.3704 6.5413 20.9117 3 25.2801 3V3H33.1898H41.0995V3C45.4679 3 49.0093 6.5413 49.0093 10.9097V27.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" />
              <line x1="21.0926" y1="41.463" x2="44.6666" y2="41.463" stroke="black" strokeWidth="4.96296" strokeLinecap="round" />
              <line x1="33.5" y1="60.0741" x2="33.5" y2="94.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" />
              <line x1="17.3704" y1="60.0741" x2="17.3704" y2="94.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" />
              <line x1="49.6296" y1="60.0741" x2="49.6296" y2="94.8148" stroke="black" strokeWidth="4.96296" strokeLinecap="round" />
              <path d="M16.75 113.426C16.75 114.796 17.861 115.907 19.2315 115.907C20.602 115.907 21.713 114.796 21.713 113.426H16.75ZM16.75 109.704V113.426H21.713V109.704H16.75Z" fill="black" />
              <path d="M44.6667 113.426C44.6667 114.796 45.7776 115.907 47.1481 115.907C48.5186 115.907 49.6296 114.796 49.6296 113.426H44.6667ZM44.6667 109.704V113.426H49.6296V109.704H44.6667Z" fill="black" />
            </svg>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Прошлые поездки</div>
          </div>
          <div
            style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 18, textAlign: 'center', position: 'relative', cursor: 'pointer' }}
            onClick={() => setShowContactModal(true)}
          >
            <span style={{ position: 'absolute', top: 10, right: 10, background: '#1A73E8', color: '#fff', borderRadius: 8, fontSize: 12, padding: '2px 8px', fontWeight: 600 }}>НОВОЕ</span>
            <svg width="48" height="48" viewBox="0 0 75 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="73.0854" y="1.01508" width="98.9698" height="72.0704" rx="6.59799" transform="rotate(90 73.0854 1.01508)" stroke="black" strokeWidth="2.03015" />
              <circle cx="36.7964" cy="50.5" r="21.5704" transform="rotate(-180 36.7964 50.5)" stroke="black" strokeWidth="2.03015" />
              <path d="M40.3492 71.5628C46.0167 64.711 54.2146 46.4904 40.6126 29.4372" stroke="black" strokeWidth="2.03015" strokeLinecap="round" />
              <path d="M34.005 71.8166C28.3375 64.9648 20.403 46.7442 34.005 29.691" stroke="black" strokeWidth="2.03015" strokeLinecap="round" />
              <path d="M58.3668 50.7538C50.5 48.0469 30.9598 44.2573 15.7337 50.7538" stroke="black" strokeWidth="2.03015" strokeLinecap="round" />
              <path d="M14.5503 84.4498H60.5503" stroke="black" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Контакты</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 0, marginBottom: 24 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 500 }}>
              <span style={{ marginRight: 14 }}><svg width="22" height="22" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg></span>
              Помощь
            </li>
            <li style={{ display: 'flex', alignItems: 'center', padding: '18px 20px', fontWeight: 500 }}>
              <span style={{ marginRight: 14 }}><svg width="22" height="22" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg></span>
              Хочу сдавать свою квартиру
            </li>
          </ul>
        </div>
      </main>
      <BottomMenu likedItemsCount={0} />
      {showPastTripsModal && user && (
        <PastTripsModal
          bookings={user.bookings}
          villaBookings={user.villa_bookings}
          onClose={() => setShowPastTripsModal(false)}
        />
      )}
      {showContactModal && user && (
        <UserContactModal
          name={user.first_name}
          username={user.username}
          phone={user.phone}
          createdAt={user.created_at}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
} 