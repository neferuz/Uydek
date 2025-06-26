"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
import BottomMenu from "./components/BottomMenu";
import SearchModal from "./components/SearchModal";
import { useSearchParams, useRouter } from 'next/navigation';

function formatDatesForDisplay(startDate: Date | null, endDate: Date | null) {
  if (!startDate && !endDate) return null;
  if (startDate && endDate) {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${startDate.toLocaleDateString('ru-RU', options)} - ${endDate.toLocaleDateString('ru-RU', options)}`;
  }
  if (startDate) {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return startDate.toLocaleDateString('ru-RU', options);
  }
  return null;
}

// Вспомогательная функция для преобразования строки дат в объекты Date
function parseSelectedDates(selectedDates: string | null): { start: Date | null, end: Date | null } {
  if (!selectedDates) return { start: null, end: null };
  const [start, end] = selectedDates.split(' - ');
  if (!start) return { start: null, end: null };
  const [d1, m1, y1] = start.split('.');
  const startDate = new Date(Number(y1), Number(m1) - 1, Number(d1));
  if (!end) return { start: startDate, end: null };
  const [d2, m2, y2] = end.split('.');
  const endDate = new Date(Number(y2), Number(m2) - 1, Number(d2));
  return { start: startDate, end: endDate };
}

export default function Home() {
  const [apartments, setApartments] = useState<any[]>([]); // Состояние для хранения данных о квартирах
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // Новое состояние для выбранного города
  const [selectedDates, setSelectedDates] = useState<string | null>(null); // Новое состояние для выбранных дат
  const [nightsCount, setNightsCount] = useState<number | null>(null); // Новое состояние для количества ночей
  const [telegramId, setTelegramId] = useState<number | null>(null); // убираем mock по умолчанию
  const [wishlist, setWishlist] = useState<number[]>([]); // id квартир в wishlist
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Берём даты из URL-параметров, а не из selectedDates
  const urlSelectedDates = searchParams.get('selectedDates');
  const { start: initialStartDate, end: initialEndDate } = parseSelectedDates(urlSelectedDates);

  useEffect(() => {
    // Получаем telegram_id из Telegram WebApp
    if (
      typeof window !== 'undefined' &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initDataUnsafe &&
      window.Telegram.WebApp.initDataUnsafe.user
    ) {
      setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id);
    }
    // Не устанавливаем mock для локалки
  }, []);

  // Загружаем wishlist пользователя
  useEffect(() => {
    if (!telegramId) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wishlist/?telegram_id=${telegramId}`)
      .then(res => res.json())
      .then(data => setWishlist(data.map((item: any) => item.apartment.id)))
      .catch(() => setWishlist([]));
  }, [telegramId]);

  // Загрузка данных о квартирах с бэкенда с учетом фильтров
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/apartments/`;
        const params = new URLSearchParams();

        if (selectedCity) {
          params.append('city', selectedCity);
        }
        if (selectedDates) {
          // selectedDates: "дд.мм.гггг - дд.мм.гггг"
          const [start, end] = selectedDates.split(' - ');
          if (start) {
            const [d, m, y] = start.split('.');
            params.append('start_date', `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
          }
          if (end) {
            const [d, m, y] = end.split('.');
            params.append('end_date', `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
          }
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'http://127.0.0.1:3000'
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApartments(data);
      } catch (error) {
        console.error("Ошибка при получении данных о квартирах:", error);
      }
    };

    fetchApartments();
  }, [selectedCity, selectedDates]); // Добавляем зависимости, чтобы эффект запускался при изменении фильтров

  useEffect(() => {
    const urlSelectedDates = searchParams.get('selectedDates');
    if (urlSelectedDates) {
      const [start, end] = urlSelectedDates.split(' - ');
      if (start) {
        const [d1, m1, y1] = start.split('.');
        setStartDate(new Date(Number(y1), Number(m1) - 1, Number(d1)));
      }
      if (end) {
        const [d2, m2, y2] = end.split('.');
        setEndDate(new Date(Number(y2), Number(m2) - 1, Number(d2)));
      }
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [searchParams]);

  const handleSearch = ({ startDate: s, endDate: e, adults, children, pets, city }: { startDate: Date | null, endDate: Date | null, adults: number, children: number, pets: boolean, city?: string }) => {
    let datesString = null;
    let calculatedNights = null;
    if (s && e) {
      datesString = `${s.getDate().toString().padStart(2, '0')}.${(s.getMonth() + 1).toString().padStart(2, '0')}.${s.getFullYear()} - ${e.getDate().toString().padStart(2, '0')}.${(e.getMonth() + 1).toString().padStart(2, '0')}.${e.getFullYear()}`;
      const diffTime = Math.abs(e.getTime() - s.getTime());
      calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (s) {
      datesString = `${s.getDate().toString().padStart(2, '0')}.${(s.getMonth() + 1).toString().padStart(2, '0')}.${s.getFullYear()}`;
      calculatedNights = 1;
    }
    setSelectedDates(datesString);
    setNightsCount(calculatedNights);
    setStartDate(s);
    setEndDate(e);
    if (city) setSelectedCity(city);
    const query: any = {};
    if (datesString) query.selectedDates = datesString;
    if (calculatedNights) query.nightsCount = calculatedNights;
    if (adults !== undefined) query.adults = adults;
    if (children !== undefined) query.children = children;
    if (pets !== undefined) query.pets = pets;
    if (city) query.city = city;
    const queryString = new URLSearchParams(query).toString();
    router.push(`/?${queryString}`);
  };

  const handleOpenSearchModal = () => {
    if (!selectedDates) {
      setStartDate(null);
      setEndDate(null);
    }
    setIsSearchModalOpen(true);
  };

  return (
    <div style={{ background: '#f1f3fb', minHeight: '100vh' }}>
      <Navbar
        selectedCity={selectedCity}
        selectedDates={selectedDates}
        onSearch={handleSearch}
        isSearchModalOpen={isSearchModalOpen}
        onOpenSearchModal={handleOpenSearchModal}
        onCloseSearchModal={() => setIsSearchModalOpen(false)}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearch}
        valueStartDate={startDate}
        valueEndDate={endDate}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
      />
      <main style={{ padding: '16px 0', minHeight: '70vh' }}>
        <div className="card-grid">
          {apartments.length > 0 ? (
            apartments.map((apartment, index) => (
              <Card
                key={apartment.id || index}
                id={apartment.id}
                image={apartment.photo_urls ? apartment.photo_urls[0] : ""}
                title={apartment.title}
                city={apartment.city || "Ташкент"}
                nightsCount={nightsCount}
                selectedDates={selectedDates}
                isFiltered={!!(selectedCity || selectedDates)}
                pricePerDay={apartment.price_per_day}
                area={apartment.area}
                beds={apartment.beds}
                originalPrice={apartment.original_price}
                images={apartment.photo_urls || []}
                onLikeToggle={() => {}}
              />
            ))
          ) : (
            <p>Загрузка квартир...</p>
          )}
        </div>
      </main>
      <BottomMenu likedItemsCount={wishlist.length} isHidden={isSearchModalOpen} />
    </div>
  );
}