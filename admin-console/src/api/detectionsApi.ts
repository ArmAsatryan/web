import { api } from './api';
import type {
  ApiBaseModel,
  DetectionUserSummaryRow,
  PageResponse,
  TargetImageListRow,
  TransformedDetection,
} from '../types';

function formatClockDirection(clockNumber: unknown): string {
  if (typeof clockNumber === 'string') return clockNumber;
  if (clockNumber == null || clockNumber === false) return 'N/A';
  return `${clockNumber} o'clock`;
}

function pickDisplayName(item: TargetImageListRow): string | null {
  const v =
    item.displayName ??
    item.name ??
    item.fullName ??
    item.userFullName ??
    item.userName ??
    item.username ??
    item.user_name;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function pickNickname(item: TargetImageListRow): string | null {
  const v = item.nickname ?? item.nickName ?? item.userNickname;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function pickEmail(item: TargetImageListRow): string | null {
  const v = item.email ?? item.userEmail;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function transformDetections(apiData: TargetImageListRow[]): TransformedDetection[] {
  return apiData.map((item) => {
    let detectionData: Record<string, unknown> = {};
    try {
      detectionData = JSON.parse(item.metadata || '{}') as Record<string, unknown>;
    } catch {
      console.warn(`Failed to parse metadata for item ${item.id}`);
      detectionData = {
        bulletHoles: [],
        target: null,
        frameId: 0,
        isVibrating: false,
        vibrationMagnitude: 0,
      };
    }

    const inner = (detectionData.detectionData as Record<string, unknown> | undefined) ?? {};
    const rawHoles = (inner.bulletHoles as unknown[]) ?? [];
    const bulletHoles = rawHoles.map((hole) => ({
      ...(hole as object),
      clockDirection: formatClockDirection((hole as { clockDirection?: unknown }).clockDirection),
    }));

    return {
      id: item.id,
      timestamp: (detectionData.timestamp as string) || new Date().toISOString(),
      detectionData: {
        bulletHoles: bulletHoles as TransformedDetection['detectionData']['bulletHoles'],
        target: (inner.target as TransformedDetection['detectionData']['target']) || null,
        frameId: (inner.frameId as number) || 0,
        isVibrating: Boolean(inner.isVibrating),
        vibrationMagnitude: Number(inner.vibrationMagnitude) || 0,
      },
      imagePath: item.imageUrl ?? '',
      metadataUrl: item.metadataUrl,
      userId: item.userId != null ? Number(item.userId) : 0,
      displayName: pickDisplayName(item),
      nickname: pickNickname(item),
      email: pickEmail(item),
    };
  });
}

function ensureSuccess<T>(body: ApiBaseModel<T>, fallback: string): T {
  if (!body.success) {
    throw new Error(body.message || fallback);
  }
  return body.data as T;
}

export async function getTargetDetections(userId?: number): Promise<TransformedDetection[]> {
  const { data: body } = await api.get<ApiBaseModel<TargetImageListRow[]>>('/api/images/target', {
    params: userId != null && userId !== undefined ? { userId } : undefined,
  });
  const raw = ensureSuccess(body, 'Failed to fetch detections');
  return transformDetections(raw ?? []);
}

export async function getDetectionUsersPage(params: {
  page?: number;
  size?: number;
  q?: string;
}): Promise<{
  items: Array<{
    userId: number;
    detectionCount: number;
    displayName: string | null;
    nickname: string | null;
    email: string | null;
    latestTimestamp: string | null;
  }>;
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}> {
  const { data: body } = await api.get<ApiBaseModel<PageResponse<DetectionUserSummaryRow>>>(
    '/api/images/target/users',
    { params }
  );
  const pageData = ensureSuccess(body, 'Failed to fetch users');
  const items = pageData.items ?? [];
  return {
    items: items.map((row) => ({
      userId: row.userId != null ? Number(row.userId) : 0,
      detectionCount: Number(row.detectionCount) || 0,
      displayName: typeof row.displayName === 'string' ? row.displayName : null,
      nickname: typeof row.nickname === 'string' ? row.nickname : null,
      email: typeof row.email === 'string' ? row.email : null,
      latestTimestamp: typeof row.latestTimestamp === 'string' ? row.latestTimestamp : null,
    })),
    page: pageData.page,
    size: pageData.size,
    totalItems: pageData.totalItems,
    totalPages: pageData.totalPages,
  };
}

export async function deleteTargetDetection(id: number): Promise<void> {
  const { data: body } = await api.delete<ApiBaseModel<unknown>>(
    `/api/images/target/${encodeURIComponent(String(id))}`
  );
  if (body && body.success === false) {
    throw new Error(body.message || 'Delete failed');
  }
}

export async function batchDeleteTargetDetections(ids: number[]): Promise<{ deletedCount: number }> {
  const list = ids.filter((id) => id != null).map((id) => Number(id));
  if (list.length === 0) {
    return { deletedCount: 0 };
  }
  const { data: body } = await api.post<ApiBaseModel<{ deletedCount?: number }>>(
    '/api/images/target/batch-delete',
    { ids: list }
  );
  if (!body.success) {
    throw new Error(body.message || 'Batch delete failed');
  }
  return { deletedCount: body.data?.deletedCount ?? list.length };
}
