import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'urika-chatbot.railway.internal',
        changeOrigin: true,
        // On refresh the browser sends the full URL — proxy handles it cleanly
      },
    },
  },
})
