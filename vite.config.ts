import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => ({
  base: './',
  // GitHub Pages needs a plain static build in dist, not Cloudflare's output layout.
  plugins: [react(), mode !== 'github-pages' && cloudflare()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
