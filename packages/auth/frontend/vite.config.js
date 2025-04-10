// Required imports
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Export Vite configuration
export default defineConfig({
  // Configure React plugin
  plugins: [react()],
  
  // Development server settings
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  
  // Module resolution settings
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});