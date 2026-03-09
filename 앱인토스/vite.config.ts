import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/golden-face-app/' : '/',
  server: {
    port: 8081,
    hmr: {
      overlay: false
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 850,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ai: ['@google/generative-ai', '@anthropic-ai/sdk'],
          appintos: ['@apps-in-toss/web-framework'],
        },
      },
    },
  }
}))
