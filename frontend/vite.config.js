import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/workouts': 'http://127.0.0.1:8000',
      '/progress': 'http://127.0.0.1:8000',
      '/goals': 'http://127.0.0.1:8000',
      '/analytics': 'http://127.0.0.1:8000',
      '/notifications': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
    }
  }
})
