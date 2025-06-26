"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HideNextJsBadge from './components/HideNextJsBadge';
import React, { useEffect } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      console.log("Telegram WebApp global object is available.");
      console.log("Telegram WebApp version:", webApp.version);
      console.log("Telegram WebApp isExpanded (before expand/fullscreen call):");
      webApp.ready();
      console.log("Telegram WebApp.ready() called globally.");

      // Отключаем свайп вниз для закрытия
      if (webApp.setSwipeToDismiss) {
        webApp.setSwipeToDismiss(false);
        console.log("Telegram WebApp.setSwipeToDismiss(false) called globally.");
      } else {
        console.log("Telegram WebApp.setSwipeToDismiss is not supported or not available globally.");
      }

      // Запрашиваем полноэкранный режим (Bot API 8.0+) или расширяем Web App (старый метод)
      if (webApp.isVersionAtLeast('8.0') && webApp.requestFullscreen) {
        webApp.requestFullscreen();
        console.log("Telegram WebApp.requestFullscreen() called globally.");
      } else {
        webApp.expand(); // Старый метод
        console.log("Telegram WebApp.expand() called globally (fallback).");
      }
      console.log("Telegram WebApp isExpanded (after expand/fullscreen call):");

      // Отключаем вертикальные свайпы для закрытия/сворачивания (для совместимости)
      if (webApp.isVersionAtLeast('7.7') && webApp.viewport && webApp.viewport.disableVerticalSwipes) { 
        webApp.viewport.disableVerticalSwipes();
        console.log("Telegram WebApp.viewport.disableVerticalSwipes() called globally.");
      } else if (webApp.isVersionAtLeast('7.7')) {
        console.log("Telegram WebApp.viewport.disableVerticalSwipes() is not available globally on this version (but should be 7.7+).");
      } else {
        console.log("Telegram WebApp.disableVerticalSwipes() is not supported globally on this version (<7.7).");
      }

    } else {
      console.log("Telegram WebApp object is NOT available globally or not in browser environment.");
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HideNextJsBadge />
        {children}
      </body>
    </html>
  );
}
