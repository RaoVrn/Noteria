import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173, // default port
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  define: {
    global: 'globalThis',
  }
})
