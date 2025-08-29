// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [
    react(),
    svgr({
      include: '**/*.svg?react',
      svgrOptions: {
        ref: true,
        svgo: true,
        svgoConfig: {
          plugins: [
            { name: 'prefixIds', params: { prefix: 'beer' } },
            { name: 'removeUnknownsAndDefaults', active: false },
          ],
        },
      },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
