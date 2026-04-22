/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Override loads host (default: dev `/__loads` proxy, prod `https://205.196.83.22:8888`). */
  readonly VITE_LOADS_API_BASE_URL?: string;
  /** JWT for `GET /api/loads/full` — set in `.env.local`, never commit. */
  readonly VITE_LOADS_API_TOKEN?: string;
  /** Cookie name the loads API checks (default `token`). */
  readonly VITE_LOADS_COOKIE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
