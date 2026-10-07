import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }
});
