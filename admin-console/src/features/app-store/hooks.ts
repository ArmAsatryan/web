import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  attachBuild,
  copyVersionContent,
  createVersion,
  deleteCredentials,
  fetchApp,
  fetchAppBuilds,
  fetchAppIcon,
  fetchApps,
  fetchCredentialsStatus,
  fetchHealth,
  fetchLocales,
  fetchVersion,
  fetchVersionBuilds,
  fetchVersionLocalizations,
  saveCredentials,
  submitForReview,
  translateLocale,
  translateVersion,
  updateLocalization,
} from './api';
import type {
  AppStoreCredentialsRequest,
  AttachBuildRequest,
  CopyVersionContentRequest,
  CreateAppStoreVersionRequest,
  TranslateSingleLocaleRequest,
  TranslateVersionRequest,
  UpdateLocalizationRequest,
} from './types';

/** Standardized error message extractor for Spring ResponseStatusException payloads. */
export function extractApiError(e: unknown): string {
  const err = e as AxiosError<{ message?: string; debugMessage?: string; error?: string }>;
  return (
    err.response?.data?.debugMessage ??
    err.response?.data?.message ??
    err.response?.data?.error ??
    err.message ??
    'Request failed'
  );
}

const QK = {
  credentialsStatus: ['appStore', 'credentials', 'status'] as const,
  health: ['appStore', 'health'] as const,
  locales: ['appStore', 'locales'] as const,
  apps: ['appStore', 'apps'] as const,
  app: (id: string) => ['appStore', 'apps', id] as const,
  appIcon: (id: string) => ['appStore', 'apps', id, 'icon'] as const,
  appBuilds: (id: string) => ['appStore', 'apps', id, 'builds'] as const,
  version: (id: string) => ['appStore', 'versions', id] as const,
  versionLocalizations: (id: string) => ['appStore', 'versions', id, 'localizations'] as const,
  versionBuilds: (id: string) => ['appStore', 'versions', id, 'builds'] as const,
};

export function useCredentialsStatus() {
  return useQuery({
    queryKey: QK.credentialsStatus,
    queryFn: async () => (await fetchCredentialsStatus()).data,
  });
}

export function useSaveCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AppStoreCredentialsRequest) => (await saveCredentials(body)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.credentialsStatus });
      qc.invalidateQueries({ queryKey: QK.health });
    },
  });
}

export function useDeleteCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await deleteCredentials()).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.credentialsStatus });
      qc.invalidateQueries({ queryKey: QK.health });
    },
  });
}

export function useAppStoreHealth(enabled = true) {
  return useQuery({
    queryKey: QK.health,
    queryFn: async () => (await fetchHealth()).data,
    enabled,
  });
}

export function useLocales() {
  return useQuery({
    queryKey: QK.locales,
    queryFn: async () => (await fetchLocales()).data,
    staleTime: 1000 * 60 * 60,
  });
}

export function useApps(enabled = true) {
  return useQuery({
    queryKey: QK.apps,
    queryFn: async () => (await fetchApps()).data,
    enabled,
  });
}

export function useApp(appId: string | undefined) {
  return useQuery({
    queryKey: appId ? QK.app(appId) : ['appStore', 'apps', 'missing'],
    queryFn: async () => (await fetchApp(appId!)).data,
    enabled: Boolean(appId),
  });
}

export function useAppIcon(appId: string | undefined) {
  return useQuery({
    queryKey: appId ? QK.appIcon(appId) : ['appStore', 'apps', 'missing', 'icon'],
    queryFn: async () => (await fetchAppIcon(appId!)).data,
    enabled: Boolean(appId),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAppBuilds(appId: string | undefined) {
  return useQuery({
    queryKey: appId ? QK.appBuilds(appId) : ['appStore', 'apps', 'missing', 'builds'],
    queryFn: async () => (await fetchAppBuilds(appId!)).data,
    enabled: Boolean(appId),
  });
}

export function useCreateVersion(appId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateAppStoreVersionRequest) => (await createVersion(body)).data,
    onSuccess: () => {
      if (appId) qc.invalidateQueries({ queryKey: QK.app(appId) });
    },
  });
}

export function useVersion(versionId: string | undefined) {
  return useQuery({
    queryKey: versionId ? QK.version(versionId) : ['appStore', 'versions', 'missing'],
    queryFn: async () => (await fetchVersion(versionId!)).data,
    enabled: Boolean(versionId),
  });
}

export function useVersionLocalizations(versionId: string | undefined) {
  return useQuery({
    queryKey: versionId
      ? QK.versionLocalizations(versionId)
      : ['appStore', 'versions', 'missing', 'localizations'],
    queryFn: async () => (await fetchVersionLocalizations(versionId!)).data,
    enabled: Boolean(versionId),
  });
}

export function useCopyVersionContent(versionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CopyVersionContentRequest) =>
      (await copyVersionContent(versionId!, body)).data,
    onSuccess: () => {
      if (versionId) qc.invalidateQueries({ queryKey: QK.versionLocalizations(versionId) });
    },
  });
}

export function useUpdateLocalization(versionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateLocalizationRequest) =>
      (await updateLocalization(versionId!, body)).data,
    onSuccess: () => {
      if (versionId) qc.invalidateQueries({ queryKey: QK.versionLocalizations(versionId) });
    },
  });
}

export function useVersionBuilds(versionId: string | undefined) {
  return useQuery({
    queryKey: versionId
      ? QK.versionBuilds(versionId)
      : ['appStore', 'versions', 'missing', 'builds'],
    queryFn: async () => (await fetchVersionBuilds(versionId!)).data,
    enabled: Boolean(versionId),
  });
}

export function useAttachBuild(versionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AttachBuildRequest) => (await attachBuild(versionId!, body)).data,
    onSuccess: () => {
      if (versionId) qc.invalidateQueries({ queryKey: QK.versionBuilds(versionId) });
    },
  });
}

export function useSubmitForReview(versionId: string | undefined) {
  return useMutation({
    mutationFn: async () => (await submitForReview(versionId!)).data,
  });
}

export function useTranslateVersion(versionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TranslateVersionRequest) =>
      (await translateVersion(versionId!, body)).data,
    onSuccess: () => {
      if (versionId) qc.invalidateQueries({ queryKey: QK.versionLocalizations(versionId) });
    },
  });
}

export function useTranslateLocale(versionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TranslateSingleLocaleRequest) =>
      (await translateLocale(versionId!, body)).data,
    onSuccess: () => {
      if (versionId) qc.invalidateQueries({ queryKey: QK.versionLocalizations(versionId) });
    },
  });
}
