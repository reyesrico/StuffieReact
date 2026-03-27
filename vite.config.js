import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
        plugins: [react()],
        // Use base path only for production (GitHub Pages)
        base: mode === 'production' ? '/StuffieReact/' : '/',
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
        },
        server: {
            port: 3000,
            open: true,
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.js',
        },
    });
});
