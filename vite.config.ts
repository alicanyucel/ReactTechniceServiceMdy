import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://teknikservisapi.mudbey.com.tr:7054',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})