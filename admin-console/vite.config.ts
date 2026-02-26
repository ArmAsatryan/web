import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin-console/',
  build: {
    outDir: '../dist/public/admin-console',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5001,
    allowedHosts: ['.replit.dev', '.repl.co'],
  },
})
