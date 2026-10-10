import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy: /api/* -> https://staging.fastor.ai/* (avoids CORS problems while developing)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://staging.fastor.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
