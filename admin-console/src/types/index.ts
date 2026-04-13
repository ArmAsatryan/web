export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    userInfo: UserInfo;
  };
  message?: string;
}

export interface UserInfo {
  id: number;
  emailAddress: string;
  name?: string;
  surname?: string;
  username?: string;
  imageUrl?: string;
  created?: string;
  onboarded?: boolean;
  roles?: string[];
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminUser {
  id: number;
  emailAddress: string;
  name?: string;
  surname?: string;
  username?: string;
  imageUrl?: string;
  /** Language from user's most recent FCM token (for notification language). */
  locale?: string;
  /** Registration date (API may send createdAt or created; string, number, or array). */
  createdAt?: string | number | number[];
  created?: string | number | number[];
  roles?: string[];
}

/** Lightweight user for dashboard: id and createdAt only (GET /admin/api/users/light). */
export interface AdminUserLight {
  id: number;
  createdAt?: string | number | number[];
}

export interface AdminUsersLightResponse {
  totalUsers: number;
  items: AdminUserLight[];
}

export interface UserLocationPoint {
  userId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  locale?: string;
}

export interface AdminNotificationUserRequest {
  userId: number;
  title: string;
  body?: string;
  data?: Record<string, string>;
}

/** Request for POST /admin/api/notifications/language (send by language from FCM token). */
export interface AdminNotificationLanguageRequest {
  language: string;
  title: string;
  body?: string;
  data?: Record<string, string>;
}

/** Request for POST /admin/api/notifications/language/schedule */
export interface AdminScheduleLanguageNotificationRequest {
  language: string;
  title: string;
  body?: string;
  data?: Record<string, string>;
  scheduledAt: string;
}

/** PATCH /admin/api/notifications/scheduled/{id} */
export interface AdminScheduledNotificationPatchRequest {
  scheduledAt: string;
}

/** Row from GET /admin/api/notifications/scheduled */
export interface ScheduledNotification {
  id: number;
  adminUserId: number;
  language: string;
  title: string;
  body?: string;
  data?: Record<string, string>;
  scheduledAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  errorMessage?: string;
}

// Admin bullet & caliber (BallisticBE AdminRestController)
export interface CaliberDiameter {
  id: number;
  name?: string;
  diameterInches?: number;
  diameterMm?: number;
}

/** One caliber from GET /api/bullets/calibers (data.content[]) */
export interface CaliberItem {
  id: number;
  caliber: string;
  diameter: number;
}

/** Request for AdminController createCaliberDiameter */
export interface CreateCaliberDiameterRequest {
  caliber: string;
  diameter: number;
}

/** Response from BulletRestController getAllCalibers: { success, data: { content: CaliberItem[] } } */
export interface CalibersResponse {
  success?: boolean;
  data?: {
    content?: CaliberItem[];
    items?: CaliberItem[];
  };
  content?: CaliberItem[];
  items?: CaliberItem[];
  [key: string]: unknown;
}

/** Vendor from getAllVendors: { id, name, imageUrl } */
export interface VendorItem {
  id: number;
  name: string;
  imageUrl?: string;
}

/** Request for AdminController POST /vendors (VendorCreateDTO) */
export interface VendorCreateRequest {
  name: string;
  imageUrl?: string;
}

/** Request body for create bullet — matches backend DTO field names */
export interface BulletCreateRequest {
  name: string;
  vendor?: string;
  weight?: number;
  length?: number;
  speed?: number;
  diameter?: number;
  ballistic_coefficient_g1?: number;
  ballistic_coefficient_g7?: number;
  caliber: string;
  [key: string]: unknown;
}

export interface Bullet {
  id: number;
  name: string;
  caliberDiameterId?: number;
  caliberDiameter?: CaliberDiameter;
  weightGrains?: number;
  lengthInches?: number;
  ballisticCoefficient?: number;
  createdAt?: string;
  [key: string]: unknown;
}

/** Rifle from GET /admin/api/rifles (for dashboard progress) */
export interface AdminRifle {
  id: number;
  name?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/** Lightweight bullet for dashboard: id and createdAt only (GET /admin/api/bullets/light). */
export interface AdminBulletLight {
  id: number;
  createdAt?: string | number | number[];
}

export interface AdminBulletsLightResponse {
  totalBullets: number;
  items: AdminBulletLight[];
}

/** Light items for dashboard charts (id + createdAt or created). */
export interface AdminLightItem {
  id: number;
  createdAt?: string | number | number[];
  created?: string | number | number[];
}

/** Response from GET /admin/api/rifles/light (id + created only). */
export interface AdminRifflesLightResponse {
  totalRifles: number;
  items: AdminLightItem[];
}

export interface FcmTokensLightResponse {
  totalFcmTokens: number;
  items: AdminLightItem[];
}

/** Dashboard pie charts data. */
export interface DashboardPieResponse {
  rifles: { active: number; deleted: number };
  bullets: { active: number; deleted: number };
  usersWithRifle: { totalUsers: number; usersWithRifle: number; usersWithoutRifle: number };
  bulletsAttached: { totalBullets: number; attachedToRifle: number; notAttached: number };
}

