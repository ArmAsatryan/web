import axios, { AxiosError } from 'axios';

/** Backend API base URL. Override with VITE_API_BASE_URL in .env. */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.ballistiq.xyz';

/** `GET /api/loads/full` — see Vite proxy `__loads` in dev; override with `VITE_LOADS_API_BASE_URL`. */
const defaultLoadsBaseURL = import.meta.env.DEV
  ? '/__loads'
  : 'https://205.196.83.22:8888';
const loadsBaseURL = (
  (import.meta.env.VITE_LOADS_API_BASE_URL as string | undefined) || defaultLoadsBaseURL
).replace(/\/$/, '');

const loadsApi = axios.create({
  baseURL: loadsBaseURL,
  headers: { 'Content-Type': 'application/json', language: 'en' },
  /** Same-origin `/__loads` only; avoid CORS issues on absolute API URLs unless the server allows credentials. */
  withCredentials: loadsBaseURL.startsWith('/'),
});

/**
 * Optional bearer token for `GET /api/loads/full` (server health), saved from the admin UI.
 * Precedence: manual paste → `VITE_LOADS_API_TOKEN` → admin session `admin_token`.
 */
export const LOADS_MANUAL_TOKEN_KEY = 'loads_api_token';

function resolveLoadsBearerToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  const manual = localStorage.getItem(LOADS_MANUAL_TOKEN_KEY)?.trim();
  if (manual) return manual;
  const env = (import.meta.env.VITE_LOADS_API_TOKEN as string | undefined)?.trim();
  if (env) return env;
  return localStorage.getItem('admin_token')?.trim() || null;
}

/** Some backends only read the JWT from a cookie (error: "cookie token empty"). Same-origin + Vite dev proxy. */
function syncLoadsSessionCookie(token: string) {
  if (typeof document === 'undefined') return;
  if (!loadsBaseURL.startsWith('/')) return;
  const name = (import.meta.env.VITE_LOADS_COOKIE_NAME as string) || 'token';
  document.cookie = `${name}=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
}

loadsApi.interceptors.request.use((config) => {
  const token = resolveLoadsBearerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    syncLoadsSessionCookie(token);
  }
  return config;
});

loadsApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      window.location.href = `${base}/login`;
    }
    return Promise.reject(error);
  }
);

// Auth
export function login(email: string, password: string) {
  return api.post<{ success: boolean; data?: { token: string; userInfo: { roles?: string[] } }; message?: string }>(
    '/api/authenticate/sign-in',
    { emailAddress: email, password }
  );
}

export function getUserInfo() {
  return api.get<{ success: boolean; data?: { roles?: string[] } }>('/api/authenticate/user-info');
}

// Admin users (paginated)
export function getUsers(params: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  startsWith?: string;
  q?: string;
}) {
  return api.get<import('../types').PageResponse<import('../types').AdminUser>>('/admin/api/users', { params });
}

/**
 * One-page fetch sorted by id desc — the first user’s id is the current max id (treated as total user count in the admin dashboard overview).
 * Matches: GET /admin/api/users?page=1&size=20&sortBy=id&sortDir=desc
 */
export function getUsersForDashboardMaxId() {
  return getUsers({ page: 1, size: 20, sortBy: 'id', sortDir: 'desc' });
}

// Admin users light (fast: id + createdAt only, totalUsers = last id)
export function getUsersLight() {
  return api.get<import('../types').AdminUsersLightResponse>('/admin/api/users/light');
}

// Admin user by ID (includes locale from FCM token)
export function getAdminUserById(id: number) {
  return api.get<import('../types').AdminUser>(`/admin/api/users/${id}`);
}

// User locations for map
export function getUserLocations(params: {
  from?: string;
  to?: string;
  locale?: string;
  userId?: number;
  limit?: number;
}) {
  return api.get<import('../types').UserLocationPoint[]>('/admin/api/user-locations', { params });
}

// Locales for dropdown
export function getLocales() {
  return api.get<string[]>('/admin/api/locales');
}

// Notifications
export function sendNotificationToUser(body: import('../types').AdminNotificationUserRequest) {
  return api.post('/admin/api/notifications/user', body);
}

export function sendNotificationToLanguage(body: import('../types').AdminNotificationLanguageRequest) {
  return api.post('/admin/api/notifications/language', body);
}

export function scheduleNotificationByLanguage(body: import('../types').AdminScheduleLanguageNotificationRequest) {
  return api.post<import('../types').ScheduledNotification>('/admin/api/notifications/language/schedule', body);
}

export function listScheduledNotifications(status?: string) {
  return api.get<import('../types').ScheduledNotification[]>('/admin/api/notifications/scheduled', {
    params: status ? { status } : undefined,
  });
}

export function patchScheduledNotificationTime(id: number, body: import('../types').AdminScheduledNotificationPatchRequest) {
  return api.patch<import('../types').ScheduledNotification>(`/admin/api/notifications/scheduled/${id}`, body);
}

export function cancelScheduledNotification(id: number) {
  return api.post(`/admin/api/notifications/scheduled/${id}/cancel`);
}

export function deleteScheduledNotification(id: number) {
  return api.delete(`/admin/api/notifications/scheduled/${id}`);
}

/** Multi-language notification campaigns */
export function sendNotificationBatch(body: import('../types').AdminNotificationBatchRequest) {
  return api.post<import('../types').AdminNotificationBatchResponse>('/admin/api/notifications/batch', body);
}

export function scheduleNotificationBatch(body: import('../types').AdminNotificationScheduleBatchRequest) {
  return api.post<import('../types').AdminNotificationBatchResponse>('/admin/api/notifications/batch/schedule', body);
}

export function getNotificationHistory() {
  return api.get<import('../types').AdminNotificationBatchResponse[]>('/admin/api/notifications/history');
}

export function translateNotification(body: import('../types').TranslateNotificationRequest) {
  return api.post<import('../types').TranslateNotificationResponse>('/admin/api/notifications/translate', body);
}

export function cancelNotificationBatch(id: number) {
  return api.post(`/admin/api/notifications/batch/${id}/cancel`);
}

export function deleteNotificationBatch(id: number) {
  return api.delete(`/admin/api/notifications/batch/${id}`);
}

// Bullet create (AdminRestController)
export function createBullet(body: import('../types').BulletCreateRequest) {
  return api.post<import('../types').Bullet>('/admin/api/bullets', body);
}

// Caliber diameters (AdminRestController)
export function getCaliberDiameters() {
  return api.get<import('../types').CaliberDiameter[]>('/admin/api/caliber-diameter');
}

// Create caliber diameter (AdminController createCaliberDiameter)
export function createCaliberDiameter(body: import('../types').CreateCaliberDiameterRequest) {
  return api.post<import('../types').CaliberDiameter>('/admin/api/caliber-diameter', body);
}

// All calibers (BulletRestController) — GET /calibers?page=&size=&query=
export function getAllCalibers(params: {
  page?: number;
  size?: number;
  query: string;
}) {
  return api.get<import('../types').CalibersResponse>('/api/bullets/calibers', { params });
}

// All vendors (BulletRestController getAllVendors) — { data: { content: VendorItem[] } }
// Optional page/size to request more (e.g. size: 5000 for all)
export function getAllVendors(params?: { page?: number; size?: number }) {
  return api.get<{ success?: boolean; data?: { content?: import('../types').VendorItem[] } }>(
    '/api/bullets/vendors',
    params ? { params } : undefined
  );
}

// Create vendor (AdminController POST /vendors — ROLE_ADMIN, ROLE_USER_ADMIN)
export function createVendor(body: import('../types').VendorCreateRequest) {
  return api.post<import('../types').VendorItem>('/admin/api/vendors', body);
}

// Bullets light (fast: id + createdAt only, totalBullets = last id)
export function getBulletsLight() {
  return api.get<import('../types').AdminBulletsLightResponse>('/admin/api/bullets/light');
}

// Rifles list for dashboard (BallisticBE admin)
export function getRifles(params: { page?: number; size?: number; sortBy?: string; sortDir?: string }) {
  return api.get<import('../types').PageResponse<import('../types').AdminRifle>>('/admin/api/rifles', { params });
}

// Rifles light (fast: id + created only, totalRifles = last id)
export function getRiflesLight() {
  return api.get<import('../types').AdminRifflesLightResponse>('/admin/api/rifles/light');
}

// Dashboard light endpoints (id + createdAt for charts)
export function getFcmTokensLight() {
  return api.get<import('../types').FcmTokensLightResponse>('/admin/api/fcm-tokens/light');
}

// Dashboard pie charts (rifles/bullets deleted %, users with rifle %, bullets attached %)
export function getDashboardPie() {
  return api.get<import('../types').DashboardPieResponse>('/admin/api/dashboard/pie');
}

/** Server metrics (`GET /api/loads/full`). Use `VITE_LOADS_API_TOKEN` in `.env.local` for this host (never commit it). */
export function getLoadsFull() {
  return loadsApi.get<import('../types').LoadsFullResponse>('/api/loads/full');
}
