"use client";

import React, { useEffect, useState } from 'react';

export default function TelegramTestPage() {
  const [user, setUser] = useState<any>(null);
  const [backendUser, setBackendUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [initData, setInitData] = useState<string>("");
  const [initDataUnsafe, setInitDataUnsafe] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      setInitData(webApp.initData);
      setInitDataUnsafe(webApp.initDataUnsafe);
      if (webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
        setUser(webApp.initDataUnsafe.user);
      } else {
        setError("initDataUnsafe.user не найден. Откройте через Telegram WebApp.");
      }
      if (webApp.initData) {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me/telegram`, {
          method: "GET",
          headers: {
            "X-Telegram-Init-Data": webApp.initData,
          },
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("Ошибка запроса: " + res.status);
            return res.json();
          })
          .then((data) => {
            setBackendUser(data);
          })
          .catch((err) => {
            setBackendError(err.message);
          });
      }
    } else {
      setError("Откройте через Telegram WebApp!");
    }
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <h2 style={{ textAlign: "center" }}>Тест Telegram WebApp</h2>
      {error && <div style={{ color: "#d00", margin: "16px 0" }}>{error}</div>}
      {user && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h3>Данные из initDataUnsafe.user (фронт):</h3>
          <img src={user.photo_url || "/default-avatar.png"} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 12 }} />
          <div><b>Имя:</b> {user.first_name} {user.last_name}</div>
          <div><b>Username:</b> @{user.username}</div>
          <div><b>ID:</b> {user.id}</div>
          <div><b>Язык:</b> {user.language_code}</div>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <h3>initDataUnsafe (JSON):</h3>
        <pre style={{ background: '#f8f8f8', padding: 8, borderRadius: 6, fontSize: 12 }}>{initDataUnsafe ? JSON.stringify(initDataUnsafe, null, 2) : '-'}</pre>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>initData (строка):</h3>
        <pre style={{ background: '#f8f8f8', padding: 8, borderRadius: 6, fontSize: 12 }}>{initData || '-'}</pre>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Данные пользователя с бэкенда:</h3>
        {backendError && <div style={{ color: "#d00" }}>{backendError}</div>}
        {backendUser && (
          <div style={{ textAlign: "center" }}>
            <img src={backendUser.telegram_photo_url || "/default-avatar.png"} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 12 }} />
            <div><b>Имя:</b> {backendUser.name}</div>
            <div><b>Username:</b> @{backendUser.username}</div>
            <div><b>ID:</b> {backendUser.telegram_id}</div>
            <div><b>Email:</b> {backendUser.email}</div>
            <div><b>Телефон:</b> {backendUser.phone}</div>
          </div>
        )}
      </div>
    </div>
  );
} 