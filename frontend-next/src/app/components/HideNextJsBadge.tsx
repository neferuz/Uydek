"use client";

import { useEffect } from 'react';

export default function HideNextJsBadge() {
  useEffect(() => {
    const badge = document.querySelector('[data-next-badge="true"]');
    if (badge) {
      badge.remove();
    }
  }, []);
  return null; // Этот компонент ничего не рендерит
} 