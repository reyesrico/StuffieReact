import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use base path only for production (GitHub Pages)
  base: mode === 'production' ? '/StuffieReact/' : '/',
  server: {
    port: 3000,
    open: true,
    // Allow Google OAuth popup to communicate back to the opener.
    // Vite's default COOP header (same-origin) blocks window.closed calls
    // from cross-origin popups, breaking the implicit OAuth flow.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  define: {
    'global': 'globalThis',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI framework
          'vendor-fluent': ['@fluentui/react-components'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-persist-client'],
          // Charting
          'vendor-charts': ['recharts'],
          // Utilities
          'vendor-utils': ['axios', 'lodash', 'moment'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
}));
