import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    lib: {
      entry: 'client-entry.tsx',
      formats: ['es'],
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external: ['react', 'react-dom'],
    },
  },
});
