/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Импортируем useRouter
import WishlistModal from '@/app/components/WishlistModal'; // Импортируем компонент WishlistModal
import { useSearchParams } from 'next/navigation'; // Импортируем useSearchParams
import BookingConfirmationModal from '@/app/components/BookingConfirmationModal'; // Импортируем компонент BookingConfirmationModal
import SuccessModal from '@/app/components/SuccessModal'; // Новый компонент

declare global {
    interface Window {
        google: any; // Объявляем глобальный объект google
        ymaps: any; // Объявляем глобальный объект ymaps для Яндекс Карт
    }
}

export default function ApartmentDetailPage() {
    const params = useParams();
    const apartmentId = params.apartmentId; // Получаем ID квартиры из URL
    const router = useRouter(); // Инициализируем useRouter
    const searchParams = useSearchParams(); // Инициализируем useSearchParams
    const [apartment, setApartment] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false); // Новое состояние для отслеживания прокрутки
    const [isLiked, setIsLiked] = useState(false); // Новое состояние для отслеживания лайка
    const [showWishlistModal, setShowWishlistModal] = useState(false); // Состояние для управления видимостью модального окна
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Новое состояние для индекса текущего изображения
    const mapRef = useRef(null); // Добавляем useRef для ссылки на элемент карты
    const [touchStartX, setTouchStartX] = useState(0); // Новое состояние для начальной точки касания
    const [touchEndX, setTouchEndX] = useState(0); // Новое состояние для конечной точки касания

    // Новые состояния для дат бронирования
    const [bookingStartDate, setBookingStartDate] = useState<string | null>(null);
    const [bookingEndDate, setBookingEndDate] = useState<string | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false); // Состояние для управления видимостью модального окна бронирования

    // Получаем nightsCount и selectedDates из URL-параметров
    const nightsCountParam = searchParams.get('nightsCount');
    const selectedDatesParam = searchParams.get('selectedDates');

    const displayNightsCount = nightsCountParam ? parseInt(nightsCountParam, 10) : (apartment?.min_nights || 1); // Используем переданное значение или min_nights
    const displaySelectedDates = selectedDatesParam || ''; // Используем переданные даты или пустую строку

    const totalBookingPrice = apartment ? (apartment.price_per_day * displayNightsCount) : 0;

    // Хелпер для склонения слова 'ночь'
    const getNightsPlural = (count: number): string => {
        if (count === 1) {
            return 'ночь';
        }
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return 'ночей';
        }
        if (lastDigit === 1) {
            return 'ночь';
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'ночи';
        }
        return 'ночей';
    };

    // Обработчики кнопок в верхней панели
    const handleBackClick = () => {
        router.back(); // Возвращаемся на предыдущую страницу
    };

    const handleLikeClick = () => {
        setIsLiked(!isLiked); // Переключаем состояние лайка
        if (!isLiked) { // Если квартира только что лайкнута (перешла из false в true)
            setShowWishlistModal(true); // Показываем модальное окно
            console.log('handleLikeClick: isLiked is now', !isLiked, ', showWishlistModal is now', true);
        } else {
            console.log('handleLikeClick: isLiked is now', !isLiked, ', showWishlistModal is now', false);
            setShowWishlistModal(false); // Скрываем модальное окно, если разлайкали
        }
    };

    const handleCloseWishlistModal = () => {
        console.log('handleCloseWishlistModal: Closing modal, setting showWishlistModal to false.');
        setShowWishlistModal(false);
    };

    // Функции для навигации по изображениям
    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? (apartment?.photo_urls?.length || 1) - 1 : prevIndex - 1
        );
    };
    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === (apartment?.photo_urls?.length || 1) - 1 ? 0 : prevIndex + 1
        );
    };
    // Обработчики для свайпа
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        setTouchEndX(e.changedTouches[0].clientX);
        // Определяем направление свайпа
        if (touchStartX - touchEndX > 50) { // Свайп влево
            handleNextImage();
        } else if (touchStartX - touchEndX < -50) { // Свайп вправо
            handlePrevImage();
        }
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false); // Состояние для модалки успеха

    useEffect(() => {
        if (!apartmentId) {
            setLoading(false);
            return;
        }

        const fetchApartmentDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/apartments/${apartmentId}`, {
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
                setApartment(data);
                // Reset image index when new apartment data is loaded
                setCurrentImageIndex(0);

                // Парсинг дат из URL-параметров при загрузке страницы
                const selectedDatesParam = searchParams.get('selectedDates');
                if (selectedDatesParam) {
                    const parts = selectedDatesParam.split(' - ');
                    const startPart = parts[0];
                    const endPart = parts.length > 1 ? parts[1] : parts[0];

                    // Хелпер для форматирования "DD.MM.YYYY" в "YYYY-MM-DD"
                    const formatDateForBackend = (dateString: string): string => {
                        const [day, month, year] = dateString.split('.').map(Number);
                        const date = new Date(year, month - 1, day); // Создаем объект Date в локальном часовом поясе

                        // Вручную форматируем в YYYY-MM-DD, чтобы избежать проблем с часовыми поясами
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы 0-индексированы
                        const dd = String(date.getDate()).padStart(2, '0');
                        return `${yyyy}-${mm}-${dd}`;
                    };

                    setBookingStartDate(formatDateForBackend(startPart));
                    setBookingEndDate(formatDateForBackend(endPart));
                }
            } catch (err: any) {
                console.error("Ошибка при получении данных о квартире:", err);
                setError(err.message || "Не удалось загрузить данные о квартире.");
            } finally {
                setLoading(false);
            }
        };

        fetchApartmentDetails();

        // Логика для изменения фона навбара при прокрутке
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, [apartmentId, searchParams]); // Зависимость от apartmentId и searchParams

    useEffect(() => {
        if (showWishlistModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Очистка при размонтировании компонента
        return () => {
            document.body.style.overflow = '';
        };
    }, [showWishlistModal]); // Зависимость от состояния модального окна

    useEffect(() => {
        if (!apartment || !apartment.latitude || !apartment.longitude) return;

        let yandexMapsScript: HTMLScriptElement | null = null;

        const loadYandexMapsScript = () => {
            if (window.ymaps && window.ymaps.Map) {
                initializeMap();
                return;
            }

            if (document.querySelector('#yandex-maps-script')) {
                return;
            }

            yandexMapsScript = document.createElement('script');
            yandexMapsScript.id = 'yandex-maps-script';
            yandexMapsScript.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=eeaee1d1-46b7-4983-be8d-40fe194086e0"; // Ваш ключ API YANDEX MAPS
            yandexMapsScript.async = true;
            yandexMapsScript.defer = true;
            document.head.appendChild(yandexMapsScript);

            yandexMapsScript.onload = () => {
                window.ymaps.ready(initializeMap);
            };
            yandexMapsScript.onerror = () => {
                console.error("Failed to load Yandex Maps script.");
                setError("Не удалось загрузить карту.");
            };
        };

        const initializeMap = () => {
            if (!mapRef.current || !window.ymaps) {
                return;
            }

            // Создаем пользовательский макет для иконки с SVG
            const CustomIconLayout = window.ymaps.templateLayoutFactory.createClass(
                '<div style="width: 48px; height: 48px; border-radius: 50%; background-color: #5A83ED; display: flex; align-items: center; justify-content: center;">' +
                '<svg width="18" height="22" viewBox="0 0 18 22" fill="white" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M9 21.7279L2.636 15.3639C1.37734 14.1052 0.520187 12.5016 0.172928 10.7558C-0.17433 9.00995 0.00390685 7.20035 0.685099 5.55582C1.36629 3.91129 2.51984 2.50569 3.99988 1.51677C5.47992 0.527838 7.21998 0 9 0C10.78 0 12.5201 0.527838 14.0001 1.51677C15.4802 2.50569 16.6337 3.91129 17.3149 5.55582C17.9961 7.20035 18.1743 9.00995 17.8271 10.7558C17.4798 12.5016 16.6227 14.1052 15.364 15.3639L9 21.7279ZM13.95 13.9499C14.9289 12.9709 15.5955 11.7236 15.8656 10.3658C16.1356 9.00795 15.9969 7.60052 15.4671 6.32148C14.9373 5.04244 14.04 3.94923 12.8889 3.18009C11.7378 2.41095 10.3844 2.00043 9 2.00043C7.61557 2.00043 6.26222 2.41095 5.11109 3.18009C3.95996 3.94923 3.06275 5.04244 2.53292 6.32148C2.00308 7.60052 1.86442 9.00795 2.13445 10.3658C2.40449 11.7236 3.07111 12.9709 4.05 13.9499L9 18.8999L13.95 13.9499V13.9499ZM9 10.9999C8.46957 10.9999 7.96086 10.7892 7.58579 10.4141C7.21072 10.0391 7 9.53035 7 8.99992C7 8.46949 7.21072 7.96078 7.58579 7.58571C7.96086 7.21064 8.46957 6.99992 9 6.99992C9.53044 6.99992 10.0391 7.21064 10.4142 7.58571C10.7893 7.96078 11 8.46949 11 8.99992C11 9.53035 10.7893 10.0391 10.4142 10.4141C10.0391 10.7892 9.53044 10.9999 9 10.9999Z" fill="white"/>' +
                '</svg>' +
                '</div>'
            );

            const myMap = new window.ymaps.Map(mapRef.current, {
                center: [apartment.latitude, apartment.longitude],
                zoom: 15,
                controls: ['zoomControl', 'fullscreenControl']
            }, {
                searchControlProvider: 'yandex#search'
            });

            const placemark = new window.ymaps.Placemark([apartment.latitude, apartment.longitude], {
                hintContent: apartment.title || 'Местоположение',
                balloonContent: apartment.title || 'Местоположение'
            }, {
                iconLayout: CustomIconLayout,
                iconImageSize: [48, 48], // Увеличиваем размер для круга
                iconImageOffset: [-24, -48] // Смещение для центрирования (половина ширины, полная высота)
            });

            myMap.geoObjects.add(placemark);
        };

        loadYandexMapsScript();

        return () => {
            // Очистка при размонтировании компонента
        };

    }, [apartment, apartmentId]);

    // Функция для получения telegram_id
    const getTelegramId = () => {
        if (
            typeof window !== 'undefined' &&
            window.Telegram &&
            window.Telegram.WebApp &&
            window.Telegram.WebApp.initDataUnsafe &&
            window.Telegram.WebApp.initDataUnsafe.user
        ) {
            return window.Telegram.WebApp.initDataUnsafe.user.id;
        }
        // MOCK для локальной разработки
        return 7687056819;
    };

    // Функция для бронирования
    const handleBooking = async () => {
        if (!apartment || !bookingStartDate || !bookingEndDate) {
            alert("Пожалуйста, выберите даты для бронирования.");
            return;
        }
        setShowBookingModal(true); // Открываем модальное окно подтверждения
    };

    // Функция для обновления дат из DateRangePickerModal
    const handleSelectedDatesChange = (startDate: string | null, endDate: string | null, nights: number) => {
        setBookingStartDate(startDate);
        setBookingEndDate(endDate);
        // Обновляем displaySelectedDates и displayNightsCount
        if (startDate && endDate) {
            const [startYear, startMonth, startDay] = startDate.split('-');
            const [endYear, endMonth, endDay] = endDate.split('-');
            const formattedStartDate = `${parseInt(startDay)}.${parseInt(startMonth)}.${startYear}`;
            const formattedEndDate = `${parseInt(endDay)}.${parseInt(endMonth)}.${endYear}`;
            router.replace(`?selectedDates=${formattedStartDate} - ${formattedEndDate}&nightsCount=${nights}`);
        }
    };

    // Функция для подтверждения и отправки бронирования (перенесена из handleBooking)
    const confirmAndSendBooking = async (startDate: string, endDate: string) => {
        const telegramId = getTelegramId();
        const startDateTime = startDate.includes('T') ? startDate : `${startDate}T14:00:00`;
        const endDateTime = endDate.includes('T') ? endDate : `${endDate}T12:00:00`;
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/?telegram_id=${telegramId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        apartment_id: apartment.id,
                        start_date: startDateTime,
                        end_date: endDateTime,
                    }),
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setShowBookingModal(false);
            setShowSuccessModal(true); // Показываем модалку успеха
            setTimeout(() => {
                setShowSuccessModal(false);
                router.push('/account?showPastTrips=1');
            }, 2000); // Через 2 секунды переходим на профиль
        } catch (err: any) {
            console.error('Ошибка при бронировании:', err);
            alert(`Ошибка при бронировании: ${err.message}`);
            setShowBookingModal(false);
        }
    };

    if (loading) {
        return <div>Загрузка данных о квартире...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    if (!apartment) {
        return <div>Квартира не найдена.</div>;
    }

    return (
        <>
            <div className={`apartment-detail-page ${showWishlistModal ? 'blurred-background' : ''}`}> {/* Добавляем класс для анимации */}
                <div className={`detail-page-header ${scrolled ? 'scrolled' : ''}`}>
                    <button onClick={handleBackClick} className="header-icon-button">
                        {/* Оригинальная иконка "Назад" */}
                        <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.41421 9L9.70711 1.70711C10.0976 1.31658 10.0976 0.683418 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711L8.29289 17.7071C8.68342 18.0976 9.31658 18.0976 9.70711 17.7071C10.0976 17.3166 10.0976 16.6834 9.70711 16.2929L2.41421 9Z" fill="black" />
                        </svg>
                    </button>
                    <div className="header-icons-right">
                        <button onClick={handleLikeClick} className="header-icon-button header-like-button">
                            {/* Иконка "Сердце" с обводкой, как на макете */}
                            <svg width="24" height="24" viewBox="0 0 24 24" 
                                 fill={isLiked ? "#E60023" : "none"} 
                                 stroke={isLiked ? "none" : "#222"} 
                                 strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {apartment.photo_urls && apartment.photo_urls.length > 0 && (
                    <div
                        className="apartment-image-gallery"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img src={apartment.photo_urls[currentImageIndex]} alt={apartment.title} className="main-apartment-image" />
                        <div className="image-counter">{currentImageIndex + 1}/{apartment.photo_urls.length}</div>
                    </div>
                )}

                <div className="apartment-details-content">
                    <h1 className="apartment-title">{apartment.title}</h1>
                    {apartment.description && (
                        <>
                            <p>{apartment.description}</p>
                        </>
                    )}

                    <div className="apartment-key-details">
                        <div className="key-detail-item">
                            <svg className="key-detail-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            <p className="key-detail-label">Апартамент</p>
                        </div>
                        <div className="vertical-separator"></div>
                        <div className="key-detail-item">
                            <p className="key-detail-value">{apartment.price_per_day}$</p>
                            <p className="key-detail-label">Цена</p>
                        </div>
                        <div className="vertical-separator"></div>
                        <div className="key-detail-item">
                            <p className="key-detail-value">{apartment.rooms}</p>
                            <p className="key-detail-label">Комнаты</p>
                        </div>
                    </div>

                    {apartment.amenities && apartment.amenities.length > 0 && (
                        <div className="apartment-amenities">
                            <h3>Удобства:</h3>
                            <ul>
                                {apartment.amenities.map((amenity: any, index: number) => (
                                    <li key={index} className="amenity-item">
                                        <img src={amenity.icon} alt={amenity.label} className="amenity-icon" />
                                        <span>{amenity.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {apartment.latitude && apartment.longitude && (
                        <div className="apartment-location-section">
                            <h2 className="section-title">Где вы будете</h2>
                            <div ref={mapRef} id="yandex-map"></div>
                            {/* Кнопка полноэкранного режима Яндекс Карт обычно интегрирована в контролы карты, но если нужна отдельная, можно добавить */}
                            {/* <button className="map-fullscreen-button">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                </svg>
                            </button> */}
                        </div>
                    )}

                    {/* Добавьте другие детали по мере необходимости */}
                </div>

                {apartment.latitude && apartment.longitude && (
                    <div className="yandex-taxi-section">
                        <button 
                            className="yandex-taxi-button"
                            onClick={() => {
                                window.open(`https://maps.yandex.ru/?ll=${apartment.longitude},${apartment.latitude}&text=${apartment.latitude}+${apartment.longitude}&z=17`, '_blank');
                            }}
                        >
                            Открыть в Яндекс Такси
                        </button>
                    </div>
                )}

                {/* Нижнее меню бронирования */}
                <div className="apartment-booking-bar">
                    <div className="booking-bar-uiux-left">
                        <div className="booking-bar-uiux-price-row">
                            <span className="booking-bar-uiux-price">${totalBookingPrice}</span>
                            <span className="booking-bar-uiux-night">{getNightsPlural(displayNightsCount)}</span>
                        </div>
                        <span className="booking-bar-uiux-dates">{displaySelectedDates}</span>
                    </div>
                    <button onClick={handleBooking} className="booking-bar-uiux-button">Забронировать</button>
                </div>
            </div>

            {/* Модальное окно вишлиста (перемещено сюда) */}
            {showWishlistModal && (
                <WishlistModal
                    onClose={handleCloseWishlistModal}
                    cardImagePlaceholder={apartment.photo_urls[0] || ''}
                    cardTitle={apartment.title || 'Квартира'}
                    savedCount={1}
                    position="bottom"
                />
            )}

            {/* Модальное окно подтверждения бронирования */}
            {showBookingModal && apartment && (
                <BookingConfirmationModal
                    onClose={() => setShowBookingModal(false)}
                    apartmentTitle={apartment.title}
                    apartmentArea={apartment.area}
                    apartmentImageUrl={apartment.photo_urls[0] || ''}
                    selectedDates={displaySelectedDates}
                    totalPrice={totalBookingPrice}
                    guestsCount={2} // Заглушка, пока нет выбора количества взрослых
                    onConfirmBooking={confirmAndSendBooking}
                    onDatesChange={handleSelectedDatesChange} // Передаем колбэк
                    displayNightsCount={displayNightsCount} // Передаем nightsCount
                    apartmentId={apartmentId as string} // Передаем ID квартиры
                    bookingStartDate={bookingStartDate} // Передаем текущие даты бронирования
                    bookingEndDate={bookingEndDate} // Передаем текущие даты бронирования
                />
            )}

            {showSuccessModal && <SuccessModal />} 
        </>
    );
} 