import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

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
  define: {
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || process.env.GEMINI_API_KEY || ''),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }
  }
});
