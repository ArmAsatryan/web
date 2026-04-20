import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  batchDeleteTargetDetections,
  deleteTargetDetection,
  getTargetDetections,
} from '../../api/detectionsApi';
import type { TransformedDetection } from '../../types';

interface AssistantDetectionsContextValue {
  detections: TransformedDetection[];
  loadDetectionsForUser: (userId: number) => Promise<void>;
  deleteDetectionById: (id: number) => Promise<void>;
  deleteDetectionsByIds: (ids: number[]) => Promise<void>;
}

const AssistantDetectionsContext = createContext<AssistantDetectionsContextValue | null>(null);

export function AssistantDetectionsProvider({ children }: { children: React.ReactNode }) {
  const [detections, setDetections] = useState<TransformedDetection[]>([]);

  const loadDetectionsForUser = useCallback(async (userId: number) => {
    const uid = Number(userId);
    if (Number.isNaN(uid)) {
      setDetections([]);
      return;
    }
    const data = await getTargetDetections(uid);
    setDetections(data);
  }, []);

  const removeDetection = useCallback((id: number) => {
    setDetections((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const removeDetections = useCallback((ids: number[]) => {
    const idSet = new Set(ids);
    setDetections((prev) => prev.filter((d) => !idSet.has(d.id)));
  }, []);

  const deleteDetectionById = useCallback(
    async (id: number) => {
      await deleteTargetDetection(id);
      removeDetection(id);
    },
    [removeDetection]
  );

  const deleteDetectionsByIds = useCallback(
    async (ids: number[]) => {
      await batchDeleteTargetDetections(ids);
      removeDetections(ids);
    },
    [removeDetections]
  );

  const value = useMemo(
    () => ({
      detections,
      loadDetectionsForUser,
      deleteDetectionById,
      deleteDetectionsByIds,
    }),
    [detections, loadDetectionsForUser, deleteDetectionById, deleteDetectionsByIds]
  );

  return (
    <AssistantDetectionsContext.Provider value={value}>{children}</AssistantDetectionsContext.Provider>
  );
}

export function useAssistantDetections() {
  const ctx = useContext(AssistantDetectionsContext);
  if (!ctx) {
    throw new Error('useAssistantDetections must be used within AssistantDetectionsProvider');
  }
  return ctx;
}
