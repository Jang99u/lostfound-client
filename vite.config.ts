import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: ['clsx', 'tailwind-merge', 'lucide-react']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['clsx', 'tailwind-merge']
        }
      }
    }
  }
})
