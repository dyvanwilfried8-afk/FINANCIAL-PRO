import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FINANCIAL-PRO/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
