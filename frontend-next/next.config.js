/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Telegram-Init-Data',
          },
        ],
      },
    ];
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.0.241:3000',
    'http://192.168.0.241:3001',
    'http://172.20.10.2:3000',
    'http://127.0.0.1:8000',
    'https://7eb5-82-215-99-90.ngrok-free.app',
    'https://227a-82-215-99-90.ngrok-free.app',
    'https://6153-185-215-5-240.ngrok-free.app',
    'https://51ed-185-215-5-240.ngrok-free.app',
    'https://7f55-185-215-5-240.ngrok-free.app',
    'https://76f3-185-215-5-240.ngrok-free.app',
    'https://*.ngrok-free.app'
  ],
}

module.exports = nextConfig 