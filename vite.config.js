import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/v1/kernel-access/login': 'http://localhost:5000',
      '/v1/kernel-access/logs': 'http://localhost:5000',
    },
  },
})
