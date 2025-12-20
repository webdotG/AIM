// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@store': path.resolve(__dirname, './src/store'),
      '@security': path.resolve(__dirname, './src/security'),
      '@layers': path.resolve(__dirname, './src/layers'),
    }
  },
  server: {
    port: 3000,
    open: true
  }
});