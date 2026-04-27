import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Split vendor libraries into logical groups to reduce initial load
      rollupOptions: {
        output: {
          manualChunks: {
            // React runtime — always needed first
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Animations — heavy but shared
            'vendor-motion': ['framer-motion', 'motion'],
            // Charts
            'vendor-charts': ['recharts'],
            // Stripe client
            'vendor-stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
            // i18n
            'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
            // UI utilities
            'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge', 'date-fns'],
          },
        },
      },
    },
    plugins: [react(), tailwindcss()],
    // NOTE: GEMINI_API_KEY is intentionally NOT exposed to the browser.
    // All AI calls go through /api/ai/* backend routes (server.ts).
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
