import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 모바일에서 접근 가능하게 (같은 네트워크)
    port: 5173
  },
  build: {
    outDir: 'dist'
  }
})