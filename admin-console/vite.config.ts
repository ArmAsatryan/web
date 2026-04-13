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
    // Default 3001 so `npm run dev:all` can run main app on 3000 at the same time.
    // Admin only on 3000: ADMIN_CONSOLE_DEV_PORT=3000 npm run dev
    port: parseInt(process.env.ADMIN_CONSOLE_DEV_PORT ?? '3001', 10),
    allowedHosts: ['.replit.dev', '.repl.co'],
  },
})
