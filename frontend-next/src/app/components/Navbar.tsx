// Navbar.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import "./Navbar.css";
// import icons from "./icons"; // Предполагается, что вы замените пути на свои

interface NavbarProps {
  selectedCity: string | null;
  selectedDates: string | null;
  onSearch: (params: { startDate: Date | null, endDate: Date | null, adults: number, children: number, pets: boolean, city?: string }) => void;
  isSearchModalOpen: boolean;
  onOpenSearchModal: () => void;
  onCloseSearchModal: () => void;
}

// Обновил массив данных, чтобы соответствовать вашему последнему скриншоту
const categories = [
    { label: 'Апартаменты', icon: '/icons/apartment.svg' },
    { label: 'Дом', icon: '/icons/house.svg' },
    { label: 'Тренды', icon: '/icons/44444.svg' },
    { label: 'Сервис', icon: '/icons/service.svg' },
];

export default function Navbar({
  selectedCity,
  selectedDates,
  onSearch,
  isSearchModalOpen,
  onOpenSearchModal,
  onCloseSearchModal,
}: NavbarProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Функция для поиска из модалки
  const handleSearchModal = (params: { startDate: Date | null, endDate: Date | null, adults: number, children: number, pets: boolean, city: string }) => {
    onSearch(params);
    onCloseSearchModal();
  };

  return (
    <nav className="navbar">
      {/* Блок поиска */}
      <div className="search-bar" onClick={onOpenSearchModal}>
        <img src="/icons/search.svg" alt="search" className="search-icon" />
        <div className="search-content">
          {selectedCity ? (
            <span className="search-selected-city" style={{ fontWeight: 600, fontSize: 18 }}>{selectedCity}</span>
          ) : (
            <span className="placeholder">Где будем жить?</span>
          )}
          {selectedDates ? (
            <span className="search-selected-dates" style={{ fontWeight: 500, fontSize: 16, marginLeft: 8 }}>{selectedDates}</span>
          ) : (
            <span className="placeholder-light">Район • Даты • Гости</span>
          )}
        </div>
        <div className="filter-button">
          <img src="/icons/filter.svg" alt="filter" />
        </div>
      </div>

      {/* Меню категорий с обновленной структурой */}
      <div className="categories-container">
        {categories.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(index)}
            className={clsx('category-item', { 'is-active': activeTab === index })}
          >
            {/* Эта обертка нужна, чтобы подчеркивание было правильной ширины */}
            <div className="category-item-content">
                <img src={item.icon} alt={item.label} className="category-icon" />
                <span className="category-label">{item.label}</span>

                {activeTab === index && (
                <motion.div
                    className="active-indicator"
                    layoutId="active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
                )}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}