/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Optional base URL only for GET /admin/api/adapty/summary (e.g. http://localhost:3000). */
  readonly VITE_ADAPTY_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
