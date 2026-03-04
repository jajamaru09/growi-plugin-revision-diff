import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      input: ['client-entry.tsx'],
      preserveEntrySignatures: 'strict',
    },
  },
});
