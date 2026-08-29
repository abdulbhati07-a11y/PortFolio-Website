import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the heavy animation stack out of the main bundle so first paint stays fast.
        manualChunks: {
          motion: ['framer-motion', 'gsap'],
        },
      },
    },
  },
})
