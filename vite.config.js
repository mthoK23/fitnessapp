import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
  test: {
    root,
    environment: 'jsdom',
    globals: true,
    setupFiles: [fileURLToPath(new URL('./src/setupTests.js', import.meta.url))],
    include: ['src/**/*.test.{js,jsx}'],
  },
});
