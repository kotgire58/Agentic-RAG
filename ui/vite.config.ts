import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/health': 'http://localhost:8058',
      '/chat': 'http://localhost:8058',
      '/search': 'http://localhost:8058',
      '/documents': 'http://localhost:8058',
      '/sessions': 'http://localhost:8058',
    },
  },
})

