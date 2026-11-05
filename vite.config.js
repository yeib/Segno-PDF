import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen: false,
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const norm = id.replace(/\\/g, '/');
          if (norm.includes('node_modules')) {
            if (norm.includes('pdfjs-dist')) return 'vendor-pdf';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  }
});
