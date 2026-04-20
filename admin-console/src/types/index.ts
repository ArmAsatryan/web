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
  /** ISO-8601 UTC instant, e.g. from `new Date(local).toISOString()`. */
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
  /** ISO-8601 UTC instant from the API. */
  scheduledAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  errorMessage?: string;
  /** FCM tokens targeted (devices), not unique users. Set when status is SENT. */
  recipientsTotal?: number | null;
  recipientsSuccess?: number | null;
  recipientsFailed?: number | null;
}

/** Multi-language batch send (POST /admin/api/notifications/batch) */
export interface AdminNotificationBatchLanguagePayload {
  languageCode: string;
  title: string;
  body?: string;
  imageUrl?: string;
}

export interface AdminNotificationBatchRequest {
  languages: AdminNotificationBatchLanguagePayload[];
  /** When true, backend only targets the configured test user id. */
  testMode: boolean;
}

export interface AdminNotificationScheduleBatchRequest {
  languages: AdminNotificationBatchLanguagePayload[];
  testMode: boolean;
  /** yyyy-MM-dd */
  scheduledDate: string;
  /** HH:mm */
  scheduledWallTime: string;
  /** IANA zone, e.g. from Intl.DateTimeFormat().resolvedOptions().timeZone */
  adminZoneId: string;
}

export interface AdminNotificationBatchItemResponse {
  id: number;
  languageCode: string;
  locale?: string | null;
  title: string;
  body?: string;
  imageUrl?: string;
  scheduledAt?: string | null;
  status: string;
  errorMessage?: string;
  sentAt?: string;
  recipientsTotal?: number | null;
  recipientsSuccess?: number | null;
  recipientsFailed?: number | null;
}

export interface AdminNotificationBatchResponse {
  id: number;
  adminUserId: number;
  batchType: string;
  overallStatus: string;
  scheduledDate?: string | null;
  scheduledWallTime?: string | null;
  adminZoneId?: string | null;
  testMode: boolean;
  createdAt: string;
  completedAt?: string | null;
  items: AdminNotificationBatchItemResponse[];
}

export interface TranslateNotificationRequest {
  targetLanguage: string;
  title: string;
  body?: string;
}

export interface TranslateNotificationResponse {
  title: string;
  body: string;
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

