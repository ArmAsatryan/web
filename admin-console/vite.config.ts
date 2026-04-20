import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite's dev server rejects requests to `base` without a trailing slash when `base` ends with `/`.
 * Redirect `/admin-console` → `/admin-console/` so bookmarks and manual URLs work.
 */
function redirectBaseWithoutTrailingSlash(base: string): Plugin {
  const withSlash = base.endsWith('/') ? base : `${base}/`
  const noSlash = withSlash.replace(/\/+$/, '') || '/'

  return {
    name: 'redirect-base-without-trailing-slash',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? '/'
        const pathOnly = raw.split('?')[0] ?? '/'
        if (noSlash !== '/' && pathOnly === noSlash) {
          const qs = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
          res.statusCode = 302
          res.setHeader('Location', `${withSlash}${qs}`)
          res.end()
          return
        }
        next()
      })
    },
  }
}

const ADMIN_CONSOLE_BASE = '/admin-console/'

export default defineConfig({
  plugins: [redirectBaseWithoutTrailingSlash(ADMIN_CONSOLE_BASE), react()],
  base: ADMIN_CONSOLE_BASE,
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
