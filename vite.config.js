import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FINANCIAL-PRO/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          utils: ['date-fns', 'papaparse', 'lucide-react'],
        },
      },
    },
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
})
