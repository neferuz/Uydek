"use client";
import React from 'react';

interface LikedItemsProps {
  likedItems: Array<{ image: string; title: string }>;
  isEditing: boolean;
  onRemoveItem: (title: string) => void;
}

export default function LikedItems({ likedItems, isEditing, onRemoveItem }: LikedItemsProps) {
  if (likedItems.length === 0) {
    return <p>У вас пока нет избранных элементов.</p>;
  }

  return (
    <div className="liked-items-list">
      {likedItems.map((item, index) => (
        <div key={index} className="liked-item-card">
          <img src={item.image} alt={item.title} className="liked-item-image-small" />
          <div className="liked-item-details">
            <h4>{item.title}</h4>
          </div>
          {isEditing && (
            <button className="remove-item-button" onClick={() => onRemoveItem(item.title)}>×</button>
          )}
        </div>
      ))}
    </div>
  );
} 