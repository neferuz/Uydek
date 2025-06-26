"use client";
import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import BottomMenu from "../components/BottomMenu";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [telegramId, setTelegramId] = useState<number>(7687056819); // mock по умолчанию

  useEffect(() => {
    // Получаем telegram_id из Telegram WebApp или используем mock
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
      setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id);
    } else {
      setTelegramId(7687056819); // mock для локалки
    }
  }, []);

  useEffect(() => {
    if (!telegramId) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wishlist/?telegram_id=${telegramId}`)
      .then(res => res.json())
      .then(data => setWishlist(data))
      .catch(() => setWishlist([]));
  }, [telegramId]);

  // Удаление из вишлиста с анимацией
  const handleUnlike = async (apartmentId: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wishlist/?telegram_id=${telegramId}&apartment_id=${apartmentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    setWishlist(prev => prev.filter(item => item.apartment.id !== apartmentId));
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', margin: '24px 0 24px 0' }}>Ваш вишлист</h2>
      <div className="card-grid single-column-layout">
        {wishlist.length > 0 ? (
          wishlist.map(item => (
            <Card
              key={item.apartment.id}
              id={item.apartment.id}
              image={item.apartment.photo_urls ? item.apartment.photo_urls[0] : ""}
              title={item.apartment.title}
              city={item.apartment.city || "Ташкент"}
              pricePerDay={item.apartment.price_per_day}
              telegram_id={telegramId}
              isLiked={true}
              onUnlike={handleUnlike}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', marginTop: 32 }}>Нет избранных квартир</p>
        )}
      </div>
      <BottomMenu likedItemsCount={wishlist.length} activeTab="wishlist" />
    </div>
  );
} 