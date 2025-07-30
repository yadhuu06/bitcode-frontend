import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Django server
        changeOrigin: true,
        secure: false,
      }
    },
    historyApiFallback: true // 404 on refresh/direct URL
  }
});
