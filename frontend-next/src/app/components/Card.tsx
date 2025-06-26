"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WishlistModal from './WishlistModal';

interface CardProps {
  id: string;
  image: string;
  images?: string[];
  title: string;
  city: string;
  area?: number;
  beds?: number;
  originalPrice?: number;
  onLikeToggle: (isLiked: boolean) => void;
  pricePerDay: number;
  nightsCount?: number | null;
  selectedDates?: string | null;
  isFiltered?: boolean;
}

export default function Card({ id, image, images, title, city, area, beds, originalPrice, onLikeToggle, pricePerDay, nightsCount, selectedDates, isFiltered }: CardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();

    const handleCardClick = () => {
        const queryParams = new URLSearchParams();
        if (nightsCount) {
            queryParams.append('nightsCount', nightsCount.toString());
        }
        if (selectedDates) {
            queryParams.append('selectedDates', selectedDates);
        }
        router.push(`/apartments/${id}?${queryParams.toString()}`);
    };

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        onLikeToggle(newLikedState);
        if (newLikedState) {
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images && images.length > 1) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images && images.length > 1) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
        }
    };

    const isFilteredCard = area !== undefined || originalPrice !== undefined;

    return (
        <div className={`card-item${isFiltered ? ' card-item--large card-animate' : ''}`} onClick={handleCardClick}>
            <div className="card-image-placeholder">
                <img src={isFilteredCard && images && images.length > 0 ? images[currentImageIndex] : image} alt={title} className="card-image" />
                {isFilteredCard && images && images.length > 1 && (
                    <>
                        <button className="nav-button prev" onClick={handlePrevImage}></button>
                        <button className="nav-button next" onClick={handleNextImage}></button>
                        <div className="image-counter">
                            {currentImageIndex + 1}/{images.length}
                        </div>
                    </>
                )}
                <button className="card-heart-button" onClick={handleLikeClick}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "#E60023" : "none"}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0 -7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0 -7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={isLiked ? "#E60023" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
            <div className="card-title">{title}, {city}</div>

            {isFilteredCard ? (
                <>
                    <div className="card-description">
                        {area && <span>Евро-квартира, площадь {area} m2.</span>}
                        {beds && <span> {beds} кровать</span>}
                    </div>
                    <div className="card-price">
                        {originalPrice && <span className="original-price">${originalPrice}</span>}
                        <span className="current-price">${pricePerDay * (nightsCount || 1)}</span> 
                        {nightsCount && nightsCount > 1 ? `за ${nightsCount} ночи` : `за 1 ночь`}
                    </div>
                    {selectedDates && <div className="card-description">{selectedDates}</div>}
                </>
            ) : (
                <div className="card-description">
                    <span>${pricePerDay} за 1 ночь</span>
                </div>
            )}

            {showModal && (
                <WishlistModal onClose={handleCloseModal} cardImagePlaceholder={image} cardTitle={title} savedCount={1} />
            )}
        </div>
    );
} 