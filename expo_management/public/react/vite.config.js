import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    // Proxy API calls to Frappe during development
    proxy: {
      '/api': {
        target: 'https://dev-expo.faircode.co',
         // ← Change to your site URL
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Output goes to Frappe public folder
    outDir: '../expo_management/expo_management/public/react',
    emptyOutDir: true,
  },
})
