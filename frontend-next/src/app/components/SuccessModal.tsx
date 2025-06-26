import React from 'react';

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  padding: '40px 32px',
  textAlign: 'center',
  boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
  position: 'relative',
  minWidth: 320,
};

const emojiStyle: React.CSSProperties = {
  fontSize: 64,
  marginBottom: 16,
  animation: 'pop 0.5s',
};

const textStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 8,
};

const subTextStyle: React.CSSProperties = {
  fontSize: 16,
  color: '#555',
};

// Простая анимация конфетти (можно заменить на библиотеку react-confetti для продакшена)
const Confetti = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', left: '20%', top: 0, fontSize: 32, animation: 'fall 1.5s linear infinite' }}>🎉</div>
    <div style={{ position: 'absolute', left: '60%', top: 0, fontSize: 32, animation: 'fall 1.7s linear infinite' }}>🎊</div>
    <div style={{ position: 'absolute', left: '40%', top: 0, fontSize: 32, animation: 'fall 1.3s linear infinite' }}>✨</div>
    <style>{`
      @keyframes fall {
        0% { transform: translateY(-40px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
      }
      @keyframes pop {
        0% { transform: scale(0.7); }
        80% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `}</style>
  </div>
);

const SuccessModal: React.FC = () => (
  <div style={modalStyle}>
    <div style={contentStyle}>
      <Confetti />
      <div style={emojiStyle}>🎉</div>
      <div style={textStyle}>Ура! Бронирование успешно</div>
      <div style={subTextStyle}>Ваша заявка отправлена. Скоро менеджер свяжется с вами.</div>
    </div>
  </div>
);

export default SuccessModal; 