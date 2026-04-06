import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  loadEnv(mode, '.', '');
  const isPagesBuild = mode === 'pages';
  const base = isPagesBuild ? '/divine-connect/' : '/';

  return {
    base,
    build: {
      outDir: isPagesBuild ? 'docs' : 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (id.includes('firebase')) {
              return 'firebase';
            }

            if (id.includes('framer-motion')) {
              return 'motion';
            }

            if (id.includes('react-router')) {
              return 'router';
            }

            if (id.includes('lucide-react')) {
              return 'icons';
            }

            return 'vendor';
          },
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify; file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
