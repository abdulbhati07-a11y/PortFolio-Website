import { defineConfig } from 'vite'

// Portfolio is now a standalone HTML file (no React build step needed).
// Vite will serve index.html (which IS the portfolio) with HMR for fast refresh.
export default defineConfig({
  // No React plugin — portfolio.html uses vanilla JS + CDN Three.js
  plugins: [],
  server: {
    open: true, // auto-open browser on npm run dev
  },
  build: {
    // If you ever want to build the React app again, restore index.html.bak
    rollupOptions: {
      input: 'index.html',
    },
  },
})
