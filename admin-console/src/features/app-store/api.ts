import { api } from '../../api/api';
import type {
  AppStoreAppDetailsResponse,
  AppStoreAppIconResponse,
  AppStoreAppsResponse,
  AppStoreBuildsResponse,
  AppStoreCredentialsRequest,
  AppStoreCredentialsStatus,
  AppStoreHealth,
  AppStoreLocaleOption,
  AppStoreLocalizationSummary,
  AppStoreLocalizationsResponse,
  AppStoreVersionBuildsResponse,
  AppStoreVersionDetailsResponse,
  AppStoreVersionSummary,
  AttachBuildRequest,
  CopyVersionContentRequest,
  CopyVersionContentResponse,
  CreateAppStoreVersionRequest,
  SubmitForReviewResponse,
  TranslateLocaleResult,
  TranslateSingleLocaleRequest,
  TranslateVersionRequest,
  TranslateVersionResponse,
  UpdateLocalizationRequest,
} from './types';

const BASE = '/admin/api/app-store';

export function fetchCredentialsStatus() {
  return api.get<AppStoreCredentialsStatus>(`${BASE}/credentials/status`);
}

export function saveCredentials(body: AppStoreCredentialsRequest) {
  return api.put<AppStoreCredentialsStatus>(`${BASE}/credentials`, body);
}

export function deleteCredentials() {
  return api.delete(`${BASE}/credentials`);
}

export function fetchHealth() {
  return api.get<AppStoreHealth>(`${BASE}/health`);
}

export function fetchLocales() {
  return api.get<AppStoreLocaleOption[]>(`${BASE}/locales`);
}

export function fetchApps(params?: { limit?: number; cursor?: string }) {
  return api.get<AppStoreAppsResponse>(`${BASE}/apps`, { params });
}

export function fetchApp(appId: string) {
  return api.get<AppStoreAppDetailsResponse>(`${BASE}/apps/${encodeURIComponent(appId)}`);
}

export function fetchAppIcon(appId: string) {
  return api.get<AppStoreAppIconResponse>(`${BASE}/apps/${encodeURIComponent(appId)}/icon`);
}

export function fetchAppBuilds(appId: string) {
  return api.get<AppStoreBuildsResponse>(`${BASE}/apps/${encodeURIComponent(appId)}/builds`);
}

export function createVersion(body: CreateAppStoreVersionRequest) {
  return api.post<AppStoreVersionSummary>(`${BASE}/versions`, body);
}

export function fetchVersion(versionId: string) {
  return api.get<AppStoreVersionDetailsResponse>(
    `${BASE}/versions/${encodeURIComponent(versionId)}`
  );
}

export function fetchVersionLocalizations(versionId: string) {
  return api.get<AppStoreLocalizationsResponse>(
    `${BASE}/versions/${encodeURIComponent(versionId)}/localizations`
  );
}

export function copyVersionContent(versionId: string, body: CopyVersionContentRequest) {
  return api.post<CopyVersionContentResponse>(
    `${BASE}/versions/${encodeURIComponent(versionId)}/copy-content`,
    body
  );
}

export function updateLocalization(versionId: string, body: UpdateLocalizationRequest) {
  return api.patch<AppStoreLocalizationSummary>(
    `${BASE}/versions/${encodeURIComponent(versionId)}/localization`,
    body
  );
}

export function fetchVersionBuilds(versionId: string) {
  return api.get<AppStoreVersionBuildsResponse>(
    `${BASE}/versions/${encodeURIComponent(versionId)}/builds`
  );
}

export function attachBuild(versionId: string, body: AttachBuildRequest) {
  return api.post<void>(`${BASE}/versions/${encodeURIComponent(versionId)}/build`, body);
}

export function submitForReview(versionId: string) {
  return api.post<SubmitForReviewResponse>(
    `${BASE}/versions/${encodeURIComponent(versionId)}/submit`
  );
}

export function translateVersion(versionId: string, body: TranslateVersionRequest) {
  return api.post<TranslateVersionResponse>(
    `${BASE}/versions/${encodeURIComponent(versionId)}/translate`,
    body
  );
}

export function translateLocale(versionId: string, body: TranslateSingleLocaleRequest) {
  return api.post<TranslateLocaleResult>(
    `${BASE}/versions/${encodeURIComponent(versionId)}/translate-locale`,
    body
  );
}
