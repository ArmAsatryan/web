import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeclineDialog from './components/DeclineDialog';
import ReviewStatusChip from './components/ReviewStatusChip';
import ShotCorrectionTable, {
  buildCorrections,
  computeLiveTotal,
} from './components/ShotCorrectionTable';
import VideoReviewPlayer from './components/VideoReviewPlayer';
import { extractApiError, useApprove, useDecline, useReviewSession } from './hooks';
import type { ReviewStatus } from './types';

const DECIDED: ReviewStatus[] = ['APPROVED', 'CORRECTED_APPROVED', 'DECLINED', 'EXPIRED'];

export default function ChallengeReviewDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useReviewSession(sessionId);
  const approveMutation = useApprove();
  const declineMutation = useDecline();

  const [corrections, setCorrections] = useState<Record<number, number>>({});
  const [declineOpen, setDeclineOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setCorrections({});
    setMessage(null);
  }, [sessionId]);

  const readOnly = data ? DECIDED.includes(data.reviewStatus) : false;
  const detectedTotal = data?.detectedTotalScore ?? data?.totalScore ?? 0;
  const liveShotsTotal = useMemo(
    () => (data?.shots ? computeLiveTotal(data.shots, corrections) : 0),
    [data?.shots, corrections]
  );
  const timeAdjustment = (data?.timeBonus ?? 0) - (data?.timePenalty ?? 0);
  const liveTotal = liveShotsTotal + timeAdjustment;
  const shotCorrections = data?.shots ? buildCorrections(data.shots, corrections) : [];
  const hasCorrections = shotCorrections.length > 0;

  const handleApprove = async () => {
    if (!sessionId || !data) return;
    try {
      await approveMutation.mutateAsync({
        id: sessionId,
        body: { shotCorrections },
      });
      setMessage({ type: 'success', text: 'Session approved.' });
      navigate('/challenge-review');
    } catch (e) {
      setMessage({ type: 'error', text: extractApiError(e) });
    }
  };

  const handleDecline = async (reason: Parameters<typeof declineMutation.mutateAsync>[0]['body']['reason'], comment: string) => {
    if (!sessionId) return;
    try {
      await declineMutation.mutateAsync({
        id: sessionId,
        body: { reason, comment },
      });
      setDeclineOpen(false);
      navigate('/challenge-review');
    } catch (e) {
      setMessage({ type: 'error', text: extractApiError(e) });
    }
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={40} />
        <Skeleton variant="rectangular" height={320} />
      </Stack>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error">
        {error ? extractApiError(error) : 'Session not found'}
      </Alert>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/challenge-review')} sx={{ mb: 2 }}>
        Back to queue
      </Button>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <VideoReviewPlayer src={data.videoUrl} poster={data.videoThumbnailUrl} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box>
                    <Typography variant="h6">{data.challenge.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {data.user.name || data.user.username} · {data.user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Submitted {new Date(data.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <ReviewStatusChip status={data.reviewStatus} />
                </Box>

                <Typography variant="body2">
                  Timing: {data.timeElapsed?.toFixed(1) ?? '—'}s · penalty {data.timePenalty ?? 0} · bonus {data.timeBonus ?? 0}
                </Typography>
                <Typography variant="body2">
                  Detected total: <strong>{detectedTotal}</strong>
                  {!readOnly && liveTotal !== detectedTotal && (
                    <> → <strong>{liveTotal}</strong></>
                  )}
                </Typography>

                {data.reviewComment && readOnly && (
                  <Alert severity="info">Review comment: {data.reviewComment}</Alert>
                )}
                {data.declineReason && readOnly && (
                  <Alert severity="warning">Declined: {data.declineReason}</Alert>
                )}

                <ShotCorrectionTable
                  shots={data.shots}
                  scoringZones={data.challenge.scoringZones ?? []}
                  corrections={corrections}
                  onCorrectionChange={(shotNumber, points) =>
                    setCorrections((prev) => ({ ...prev, [shotNumber]: points }))
                  }
                  detectedTotal={detectedTotal}
                  liveTotal={readOnly ? (data.totalScore ?? detectedTotal) : liveTotal}
                  readOnly={readOnly}
                />

                {!readOnly && (
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setDeclineOpen(true)}
                      disabled={!data.videoUrl || approveMutation.isPending}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleApprove}
                      disabled={!data.videoUrl || approveMutation.isPending || declineMutation.isPending}
                    >
                      {approveMutation.isPending
                        ? 'Approving…'
                        : hasCorrections
                          ? 'Approve with corrections'
                          : 'Approve'}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DeclineDialog
        open={declineOpen}
        loading={declineMutation.isPending}
        onCancel={() => setDeclineOpen(false)}
        onConfirm={handleDecline}
      />
    </Box>
  );
}
