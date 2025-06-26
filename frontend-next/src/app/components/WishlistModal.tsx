"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface WishlistModalProps {
  onClose: () => void;
  cardImagePlaceholder: string;
  cardTitle: string;
  savedCount: number;
  position?: 'center' | 'bottom';
}

export default function WishlistModal({ onClose, cardImagePlaceholder, cardTitle, savedCount, position = 'bottom' }: WishlistModalProps) {
  const router = useRouter();

  const handleGoToWishlist = () => {
    console.log('handleGoToWishlist: Closing modal and navigating.');
    onClose(); // Закрываем модальное окно
    router.push('/wishlist'); // Переходим на страницу вишлиста
  };

  // SSR guard: не рендерим модалку на сервере
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="wishlist-modal-overlay" onClick={() => { console.log('Overlay clicked'); onClose(); }}>
      <div className={position === 'center' ? 'wishlist-modal-content-center' : 'wishlist-modal-content'} onClick={(e) => { console.log('Content clicked, stopping propagation'); e.stopPropagation(); }}>
        <div className="wishlist-modal-header">
          <h3>Сохранить в вишлист</h3>
          <button className="wishlist-close-button" onClick={() => { console.log('Close button clicked'); onClose(); }}>×</button>
        </div>
        <div className="wishlist-item-preview">
          <img src={cardImagePlaceholder} alt={cardTitle} className="wishlist-item-image" />
          <div className="wishlist-item-details">
            <h4>{cardTitle}</h4>
            <p>Сохранено: {savedCount}</p>
          </div>
        </div>
        <button className="wishlist-create-button" onClick={handleGoToWishlist}>Перейти в вишлист</button>
      </div>
    </div>,
    window.document.body
  );
} 