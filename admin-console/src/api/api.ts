import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.ballistiq.xyz';

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
