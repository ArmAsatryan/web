import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

const LOADS_PROXY_TARGET =
  process.env.VITE_LOADS_PROXY_TARGET?.replace(/\/$/, '') || 'https://205.196.83.22:8888'

/**
 * Writes web/dist/public/_redirects for Cloudflare Pages so deep links like
 * /admin-console/app-store/apps/123 load admin index.html (not the root SPA).
 */
function writeCloudflarePagesRootRedirects(): Plugin {
  return {
    name: 'write-cloudflare-pages-root-redirects',
    closeBundle() {
      const src = path.resolve(__dirname, '../script/cloudflare-pages-redirects')
      const body = readFileSync(src, 'utf-8')
      const outRoot = path.resolve(__dirname, '../dist/public')
      mkdirSync(outRoot, { recursive: true })
      writeFileSync(path.join(outRoot, '_redirects'), body, 'utf-8')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, 'VITE_')
  const loadsToken = (env.VITE_LOADS_API_TOKEN || '').trim()
  /** Some backends (e.g. this loads API) read auth from a cookie, not only `Authorization: Bearer`. */
  const loadsCookieName = (env.VITE_LOADS_COOKIE_NAME || 'token').trim() || 'token'

  return {
    plugins: [
      redirectBaseWithoutTrailingSlash(ADMIN_CONSOLE_BASE),
      react(),
      writeCloudflarePagesRootRedirects(),
    ],
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
      // Same-origin `GET /__loads/...` → real loads API (avoids browser CORS). Override target with VITE_LOADS_PROXY_TARGET.
      proxy: {
        '/__loads': {
          target: LOADS_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/__loads/, '') || '/',
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (loadsToken) {
                const existing = String(proxyReq.getHeader('cookie') || '').trim()
                const part = `${loadsCookieName}=${loadsToken}`
                proxyReq.setHeader('Cookie', existing ? `${existing}; ${part}` : part)
              }
            })
          },
        },
      },
    },
  }
})
