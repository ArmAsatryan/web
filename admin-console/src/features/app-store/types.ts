/**
 * Types for the App Store Connect feature — mirror the Java DTOs under
 * org.ballistic.rest.model.admin.appstore.
 */

export interface AppStoreCredentialsStatus {
  configured: boolean;
  masterKeyConfigured: boolean;
  issuerIdMasked?: string;
  keyIdLast4?: string;
  updatedAt?: string;
  updatedBy?: number;
}

export interface AppStoreCredentialsRequest {
  issuerId: string;
  keyId: string;
  privateKeyPem: string;
}

export interface AppStoreHealth {
  ok: boolean;
  tokenGenerated: boolean;
  apiReachable: boolean;
  error?: string;
}

export interface AppStoreLocaleOption {
  locale: string;
  language: string;
}

export interface AppStoreAppSummary {
  id: string;
  name?: string;
  bundleId?: string;
  sku?: string;
  primaryLocale?: string;
}

export interface AppStoreAppsResponse {
  apps: AppStoreAppSummary[];
}

export interface AppStoreVersionSummary {
  id: string;
  versionString?: string;
  appStoreState?: string;
  platform?: string;
  createdDate?: string;
  releaseType?: string;
}

export interface AppStoreAppDetailsResponse {
  app: AppStoreAppSummary;
  versions: AppStoreVersionSummary[];
}

export interface AppStoreAppIconResponse {
  iconUrl?: string;
  trackName?: string;
  artistName?: string;
}

export interface AppStoreBuildSummary {
  id: string;
  version?: string;
  uploadedDate?: string;
  processingState?: string;
  expirationDate?: string;
  minOsVersion?: string;
  usesNonExemptEncryption?: boolean;
}

export interface AppStoreBuildsResponse {
  builds: AppStoreBuildSummary[];
}

export interface AppStoreVersionBuildsResponse {
  currentBuild?: AppStoreBuildSummary | null;
  availableBuilds: AppStoreBuildSummary[];
}

export interface AppStoreLocalizationSummary {
  id: string;
  locale: string;
  description?: string;
  keywords?: string;
  promotionalText?: string;
  whatsNew?: string;
  supportUrl?: string;
  marketingUrl?: string;
}

export interface AppStoreLocalizationsResponse {
  localizations: AppStoreLocalizationSummary[];
}

export interface AppStoreVersionDetailsResponse {
  version: AppStoreVersionSummary;
  localizations: AppStoreLocalizationSummary[];
}

export interface CreateAppStoreVersionRequest {
  appId: string;
  versionString: string;
  platform?: string;
}

export interface CopyVersionContentRequest {
  sourceVersionId: string;
  /** Omit or true: copy field. false: leave target unchanged for this field. */
  copyPromotionalText?: boolean;
  copyWhatsNew?: boolean;
}

export interface CopyVersionContentLocaleResult {
  locale: string;
  status: string;
}

export interface CopyVersionContentLocaleError {
  locale: string;
  error: string;
}

export interface CopyVersionContentResponse {
  message?: string;
  results?: CopyVersionContentLocaleResult[];
  errors?: CopyVersionContentLocaleError[];
}

export interface UpdateLocalizationRequest {
  locale: string;
  description?: string;
  keywords?: string;
  promotionalText?: string;
  whatsNew?: string;
  supportUrl?: string;
  marketingUrl?: string;
}

export interface AttachBuildRequest {
  buildId: string;
}

export interface SubmitForReviewResponse {
  success: boolean;
  manualSubmissionRequired: boolean;
  message?: string;
  details?: {
    reason?: string;
    nextSteps?: string[];
    links?: Record<string, string>;
    versionInfo?: {
      versionString?: string;
      currentState?: string;
      appName?: string;
    };
  };
}

export interface TranslateVersionRequest {
  description?: string;
  keywords?: string;
  promotionalText?: string;
  whatsNew?: string;
  locales: string[];
  translateDescription?: boolean;
  translateKeywords?: boolean;
  translatePromotionalText?: boolean;
  translateWhatsNew?: boolean;
}

export interface TranslateSingleLocaleRequest {
  locale: string;
  description?: string;
  keywords?: string;
  promotionalText?: string;
  whatsNew?: string;
  translateDescription?: boolean;
  translateKeywords?: boolean;
  translatePromotionalText?: boolean;
  translateWhatsNew?: boolean;
}

export interface TranslateLocaleResult {
  locale: string;
  description?: string;
  keywords?: string;
  promotionalText?: string;
  whatsNew?: string;
  status: string;
}

export interface TranslateLocaleError {
  locale: string;
  error: string;
}

export interface TranslateVersionResponse {
  results?: TranslateLocaleResult[];
  errors?: TranslateLocaleError[];
}
