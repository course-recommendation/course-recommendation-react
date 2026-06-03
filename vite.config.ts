import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or "modern"
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: [
      'fs.tenant1.courserecom.site',
      'tr.tenant1.courserecom.site',
      'fs.tenant2.courserecom.site',
      'tr.tenant2.courserecom.site',
    ],
  },
});
