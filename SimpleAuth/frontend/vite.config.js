// Required imports
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Export Vite configuration
export default defineConfig({
  // Configure React plugin
  plugins: [react()],
  
  // Development server settings
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})