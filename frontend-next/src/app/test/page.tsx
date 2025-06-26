"use client";

import React, { useEffect, useState } from 'react';

export default function TestPage() {
  const [telegramData, setTelegramData] = useState<any>(null);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [backendData, setBackendData] = useState<any>(null);

  useEffect(() => {
    // Проверяем, находимся ли мы в режиме разработки
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('ngrok');

    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const webApp = window.Telegram.WebApp;
      setIsTelegramWebApp(true);
      
      setTelegramData({
        version: webApp.version,
        platform: webApp.platform,
        initData: webApp.initData,
        initDataUnsafe: webApp.initDataUnsafe,
        user: webApp.initDataUnsafe?.user,
        themeParams: webApp.themeParams,
        colorScheme: webApp.colorScheme,
        isExpanded: webApp.isExpanded,
        viewportHeight: webApp.viewportHeight,
        viewportStableHeight: webApp.viewportStableHeight
      });

      // Отправляем данные в бот
      if (webApp.initDataUnsafe?.user) {
        const userData = {
          action: 'test_page_visited',
          user_id: webApp.initDataUnsafe.user.id,
          timestamp: new Date().toISOString(),
          page: 'test'
        };
        
        try {
          webApp.sendData(JSON.stringify(userData));
          console.log('✅ Данные отправлены в бот:', userData);
        } catch (err) {
          console.error('❌ Ошибка отправки данных в бот:', err);
        }
      }

      // Тестируем backend API
      if (webApp.initData) {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me/telegram`, {
          method: 'GET',
          headers: {
            'X-Telegram-Init-Data': webApp.initData,
          },
        })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.json();
        })
        .then((data) => {
          setBackendData(data);
          console.log('✅ Backend данные получены:', data);
        })
        .catch((err) => {
          setError(`Backend ошибка: ${err.message}`);
          console.error('❌ Backend ошибка:', err);
        });
      }
    } else if (isDevelopment) {
      // В режиме разработки показываем тестовые данные
      setIsTelegramWebApp(true);
      setTelegramData({
        version: '6.9 (тестовый режим)',
        platform: 'web (тестовый режим)',
        initData: 'query_id=test&user=test&auth_date=test&hash=test',
        initDataUnsafe: {
          user: {
            id: 123456789,
            first_name: 'Тестовый',
            last_name: 'Пользователь',
            username: 'test_user',
            photo_url: 'https://t.me/i/userpic/320/photo.jpg',
            language_code: 'ru'
          }
        },
        themeParams: {
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#999999',
          link_color: '#2481cc',
          button_color: '#2481cc',
          button_text_color: '#ffffff'
        },
        colorScheme: 'light',
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight
      });
    } else {
      setError('Telegram WebApp не доступен. Откройте через Telegram бота.');
    }
  }, []);

  if (error && !isTelegramWebApp) {
    return (
      <div style={{ 
        maxWidth: 600, 
        margin: '40px auto', 
        padding: 24, 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
      }}>
        <h2 style={{ textAlign: 'center', color: '#d00' }}>⚠️ Ошибка доступа</h2>
        <p>{error}</p>
        <div style={{ marginTop: 20, padding: 12, background: '#f0f0f0', borderRadius: 8 }}>
          <strong>Как протестировать:</strong><br/>
          1. Откройте Telegram<br/>
          2. Найдите вашего бота<br/>
          3. Нажмите кнопку "🏠 Открыть Daily Rent"<br/>
          4. Перейдите на страницу /test
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 600, 
      margin: '40px auto', 
      padding: 24, 
      background: '#fff', 
      borderRadius: 12, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>🧪 Тест Telegram WebApp</h1>
      
      {telegramData && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h3>👤 Данные пользователя:</h3>
            {telegramData.user && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img 
                  src={telegramData.user.photo_url || '/default-avatar.png'} 
                  alt="avatar" 
                  style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12 }} 
                />
                <div><strong>Имя:</strong> {telegramData.user.first_name} {telegramData.user.last_name}</div>
                <div><strong>Username:</strong> @{telegramData.user.username}</div>
                <div><strong>ID:</strong> {telegramData.user.id}</div>
                <div><strong>Язык:</strong> {telegramData.user.language_code}</div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3>📱 WebApp информация:</h3>
            <div><strong>Версия:</strong> {telegramData.version}</div>
            <div><strong>Платформа:</strong> {telegramData.platform}</div>
            <div><strong>Цветовая схема:</strong> {telegramData.colorScheme}</div>
            <div><strong>Расширен:</strong> {telegramData.isExpanded ? 'Да' : 'Нет'}</div>
            <div><strong>Высота viewport:</strong> {telegramData.viewportHeight}px</div>
            <div><strong>Стабильная высота:</strong> {telegramData.viewportStableHeight}px</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3>🎨 Параметры темы:</h3>
            <pre style={{ 
              background: '#f8f8f8', 
              padding: 12, 
              borderRadius: 6, 
              fontSize: 12,
              overflow: 'auto',
              maxHeight: 200
            }}>
              {JSON.stringify(telegramData.themeParams, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3>📋 Init Data (строка):</h3>
            <pre style={{ 
              background: '#f8f8f8', 
              padding: 12, 
              borderRadius: 6, 
              fontSize: 12,
              overflow: 'auto',
              maxHeight: 100
            }}>
              {telegramData.initData || 'Нет данных'}
            </pre>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3>🔧 Init Data Unsafe (JSON):</h3>
            <pre style={{ 
              background: '#f8f8f8', 
              padding: 12, 
              borderRadius: 6, 
              fontSize: 12,
              overflow: 'auto',
              maxHeight: 300
            }}>
              {JSON.stringify(telegramData.initDataUnsafe, null, 2)}
            </pre>
          </div>
        </>
      )}

      {backendData && (
        <div style={{ marginBottom: 24 }}>
          <h3>🖥️ Данные с бэкенда:</h3>
          <pre style={{ 
            background: '#f8f8f8', 
            padding: 12, 
            borderRadius: 6, 
            fontSize: 12,
            overflow: 'auto',
            maxHeight: 300
          }}>
            {JSON.stringify(backendData, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 24 }}>
          <h3>❌ Ошибки:</h3>
          <div style={{ color: '#d00', padding: 12, background: '#ffe6e6', borderRadius: 6 }}>
            {error}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <a 
          href="/" 
          style={{ 
            display: 'inline-block',
            padding: '12px 24px',
            background: '#2481cc',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 600
          }}
        >
          ← Вернуться на главную
        </a>
      </div>
    </div>
  );
} 