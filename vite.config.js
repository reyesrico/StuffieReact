import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
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
        build: {
            outDir: 'dist',
            sourcemap: true,
            rollupOptions: {
                output: {
                    manualChunks: function (id) {
                        if (!id.includes('node_modules'))
                            return;
                        // UI framework
                        if (id.includes('@fluentui/react-components'))
                            return 'vendor-fluent';
                        // Data fetching
                        if (id.includes('@tanstack/react-query'))
                            return 'vendor-query';
                        // Charting
                        if (id.includes('recharts'))
                            return 'vendor-charts';
                        // Utilities
                        if (/node_modules\/(axios|lodash|moment)\//.test(id))
                            return 'vendor-utils';
                        // Core React libraries
                        if (/node_modules\/(react|react-dom|react-router)\//.test(id))
                            return 'vendor-react';
                    },
                },
            },
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.js',
        },
    });
});
