import { api } from '../../api/api';
import type { PageResponse } from '../../types';
import type {
  ApproveRequest,
  DeclineRequest,
  ReviewSessionDetail,
  ReviewSessionSummary,
} from './types';

const BASE = '/admin/api/challenges';

export async function fetchReviewQueue(params: {
  page: number;
  size: number;
  status?: string;
  challengeId?: number;
  userId?: number;
  q?: string;
  sortBy?: string;
  sortDir?: string;
}): Promise<PageResponse<ReviewSessionSummary>> {
  const { data } = await api.get<PageResponse<ReviewSessionSummary>>(`${BASE}/review-queue`, { params });
  return data;
}

export async function fetchReviewSession(sessionId: string): Promise<ReviewSessionDetail> {
  const { data } = await api.get<ReviewSessionDetail>(`${BASE}/review-queue/${encodeURIComponent(sessionId)}`);
  return data;
}

export async function claimSession(sessionId: string): Promise<ReviewSessionDetail> {
  const { data } = await api.post<ReviewSessionDetail>(
    `${BASE}/review-queue/${encodeURIComponent(sessionId)}/claim`
  );
  return data;
}

export async function approveSession(sessionId: string, body: ApproveRequest): Promise<ReviewSessionDetail> {
  const { data } = await api.post<ReviewSessionDetail>(
    `${BASE}/review-queue/${encodeURIComponent(sessionId)}/approve`,
    body
  );
  return data;
}

export async function declineSession(sessionId: string, body: DeclineRequest): Promise<ReviewSessionDetail> {
  const { data } = await api.post<ReviewSessionDetail>(
    `${BASE}/review-queue/${encodeURIComponent(sessionId)}/decline`,
    body
  );
  return data;
}
