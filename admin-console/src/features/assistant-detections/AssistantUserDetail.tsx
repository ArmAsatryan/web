import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog';
import type { TransformedDetection } from '../../types';
import { useAssistantDetections } from './AssistantDetectionsContext';
import DateGroupedDetectionList from './DateGroupedDetectionList';
import DetectionViewer from './DetectionViewer';

interface Props {
  userId: number;
  onBack: () => void;
}

export default function AssistantUserDetail({ userId, onBack }: Props) {
  const { detections, deleteDetectionById, deleteDetectionsByIds, loadDetectionsForUser } =
    useAssistantDetections();
  const [selectedDetection, setSelectedDetection] = useState<TransformedDetection | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [confirmSingle, setConfirmSingle] = useState<TransformedDetection | null>(null);
  const [confirmGroup, setConfirmGroup] = useState<{
    calendarDate: string;
    detections: TransformedDetection[];
  } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const invalidId = Number.isNaN(userId);

  useEffect(() => {
    let cancelled = false;
    if (invalidId) {
      setDetailLoading(false);
      return undefined;
    }
    setDetailLoading(true);
    setLoadError(null);
    (async () => {
      try {
        await loadDetectionsForUser(userId);
        if (!cancelled) setDetailLoading(false);
      } catch (e) {
        if (!cancelled) {
          setLoadError((e as Error).message || 'Failed to load detections');
          setDetailLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, invalidId, loadDetectionsForUser]);

  const userDetections = useMemo(() => {
    if (invalidId) return [];
    return detections.filter((d) => Number(d.userId) === userId);
  }, [detections, userId, invalidId]);

  const sorted = useMemo(
    () =>
      [...userDetections].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [userDetections]
  );

  const displayName = useMemo(() => {
    const withName = userDetections.find((d) => d.displayName);
    return withName?.displayName || null;
  }, [userDetections]);

  const nickname = useMemo(() => {
    const d = userDetections.find((x) => x.nickname);
    return d?.nickname || null;
  }, [userDetections]);

  const email = useMemo(() => {
    const d = userDetections.find((x) => x.email);
    return d?.email || null;
  }, [userDetections]);

  const viewerSubtitle = useMemo(() => {
    const head = displayName ? `${displayName} (ID ${userId})` : `User ID ${userId}`;
    const extra = [nickname, email].filter(Boolean);
    return extra.length ? `${head} · ${extra.join(' · ')}` : head;
  }, [displayName, userId, nickname, email]);

  useEffect(() => {
    if (sorted.length === 0) {
      setSelectedDetection(null);
      return;
    }
    setSelectedDetection((prev) => {
      if (prev && sorted.some((d) => d.id === prev.id)) return prev;
      return sorted[0];
    });
  }, [sorted]);

  const selectedIndex = useMemo(
    () => sorted.findIndex((d) => d.id === selectedDetection?.id),
    [sorted, selectedDetection]
  );

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedDetection(sorted[selectedIndex - 1]);
    }
  };

  const handleNext = () => {
    if (selectedIndex >= 0 && selectedIndex < sorted.length - 1) {
      setSelectedDetection(sorted[selectedIndex + 1]);
    }
  };

  const runDeleteSingle = async () => {
    const detection = confirmSingle;
    if (!detection) return;
    setDeleteBusy(true);
    setDeleteError(null);
    const idx = sorted.findIndex((d) => d.id === detection.id);
    const wasSelected = selectedDetection?.id === detection.id;
    const next =
      wasSelected ? (sorted[idx + 1] ?? sorted[idx - 1] ?? null) : selectedDetection;
    try {
      await deleteDetectionById(detection.id);
      setConfirmSingle(null);
      if (wasSelected) setSelectedDetection(next);
    } catch (e) {
      setDeleteError((e as Error).message || 'Failed to remove detection');
    } finally {
      setDeleteBusy(false);
    }
  };

  const runDeleteGroup = async () => {
    if (!confirmGroup) return;
    const ids = confirmGroup.detections.map((d) => d.id);
    setDeleteBusy(true);
    setDeleteError(null);
    const idSet = new Set(ids);
    const wasSelectedInGroup = selectedDetection && idSet.has(selectedDetection.id);
    const remaining = sorted.filter((d) => !idSet.has(d.id));
    try {
      await deleteDetectionsByIds(ids);
      setConfirmGroup(null);
      if (wasSelectedInGroup) {
        setSelectedDetection(remaining[0] ?? null);
      }
    } catch (e) {
      setDeleteError((e as Error).message || 'Failed to remove detections for this day');
    } finally {
      setDeleteBusy(false);
    }
  };

  if (invalidId) {
    return (
      <Typography color="error" sx={{ py: 2 }}>
        Invalid user ID.
      </Typography>
    );
  }

  if (detailLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Button onClick={onBack} size="small" sx={{ mb: 2 }}>
          ← Back
        </Button>
        <Typography color="text.secondary">Loading detections…</Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ py: 2 }}>
        <Button onClick={onBack} size="small" sx={{ mb: 2 }}>
          ← Back
        </Button>
        <Typography color="error">{loadError}</Typography>
      </Box>
    );
  }

  if (userDetections.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Button onClick={onBack} size="small" sx={{ mb: 2 }}>
          ← Back
        </Button>
        <Typography color="text.secondary">No detections for this user.</Typography>
      </Box>
    );
  }

  return (
    <div className="user-detail-page page-content">
      <nav className="user-detail-nav">
        <div className="user-detail-nav-row">
          <button type="button" className="user-detail-back" onClick={onBack}>
            ← Back
          </button>
          <h2 className="user-detail-title">
            {displayName ? (
              <>
                {displayName}
                <span className="user-detail-id"> · ID {userId}</span>
              </>
            ) : (
              <>User {userId}</>
            )}
          </h2>
          <span className="user-detail-sub">
            {userDetections.length} detection{userDetections.length !== 1 ? 's' : ''}
          </span>
        </div>
        {(nickname || email) && (
          <p className="user-detail-identity">
            {nickname && <span className="user-detail-nickname">{nickname}</span>}
            {nickname && email && <span className="user-detail-identity-sep"> · </span>}
            {email && (
              <a className="user-detail-email" href={`mailto:${email}`}>
                {email}
              </a>
            )}
          </p>
        )}
      </nav>

      {deleteError && (
        <div className="app-error-inline" role="alert">
          {deleteError}
        </div>
      )}

      <div className="app-content user-detail-content">
        <aside className="app-sidebar user-detail-sidebar">
          <DateGroupedDetectionList
            detections={userDetections}
            selectedDetection={selectedDetection}
            onSelectDetection={setSelectedDetection}
            onDeleteDetection={(d) => setConfirmSingle(d)}
            onDeleteGroup={(payload) => setConfirmGroup(payload)}
            title="Detections by day"
          />
        </aside>
        <main className="app-main user-detail-main">
          <DetectionViewer
            detection={selectedDetection}
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={selectedIndex > 0}
            hasNext={selectedIndex >= 0 && selectedIndex < sorted.length - 1}
            subtitle={viewerSubtitle}
          />
        </main>
      </div>

      <ConfirmDialog
        open={!!confirmSingle}
        title="Remove detection"
        message={
          confirmSingle
            ? `Remove detection #${confirmSingle.id}? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        variant="danger"
        onConfirm={runDeleteSingle}
        onCancel={() => setConfirmSingle(null)}
        loading={deleteBusy}
      />

      <ConfirmDialog
        open={!!confirmGroup}
        title="Remove detections for this day"
        message={
          confirmGroup
            ? `Remove all ${confirmGroup.detections.length} detection(s) for ${confirmGroup.calendarDate}? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove all"
        variant="danger"
        onConfirm={runDeleteGroup}
        onCancel={() => setConfirmGroup(null)}
        loading={deleteBusy}
      />
    </div>
  );
}
