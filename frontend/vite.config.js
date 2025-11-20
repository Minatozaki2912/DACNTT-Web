// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      // Tất cả các request bắt đầu bằng /api sẽ được chuyển tiếp sang backend
      '/api': {
        target: 'http://localhost:3000',  // backend của bạn
        changeOrigin: true,
        secure: false,
      }
    }
  }
})