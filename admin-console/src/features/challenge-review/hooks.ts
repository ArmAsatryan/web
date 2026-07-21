import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  approveSession,
  claimSession,
  declineSession,
  fetchReviewQueue,
  fetchReviewSession,
} from './api';
import type { ApproveRequest, DeclineRequest } from './types';

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
  queue: (p: object) => ['challenge-review', 'queue', p] as const,
  detail: (id: string) => ['challenge-review', 'detail', id] as const,
};

export function useReviewQueue(params: {
  page: number;
  size: number;
  status?: string;
  challengeId?: number;
  q?: string;
  sortBy?: string;
  sortDir?: string;
}) {
  return useQuery({
    queryKey: QK.queue(params),
    queryFn: () => fetchReviewQueue(params),
    placeholderData: keepPreviousData,
  });
}

export function useReviewSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: QK.detail(sessionId ?? ''),
    queryFn: () => fetchReviewSession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ApproveRequest }) => approveSession(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['challenge-review', 'queue'] });
      qc.invalidateQueries({ queryKey: QK.detail(id) });
    },
  });
}

export function useDecline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: DeclineRequest }) => declineSession(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['challenge-review', 'queue'] });
      qc.invalidateQueries({ queryKey: QK.detail(id) });
    },
  });
}

export function useClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => claimSession(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: QK.detail(id) });
    },
  });
}
