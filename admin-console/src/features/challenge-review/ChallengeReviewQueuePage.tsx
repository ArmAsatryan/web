import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import ReviewStatusChip from './components/ReviewStatusChip';
import { useReviewQueue } from './hooks';
import type { ReviewStatus } from './types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'AWAITING_VIDEO', label: 'Awaiting video' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CORRECTED_APPROVED', label: 'Corrected' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'ALL', label: 'All statuses' },
];

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function formatWaiting(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function ChallengeReviewQueuePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [status, setStatus] = useState<string>('PENDING_REVIEW');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useReviewQueue({
    page,
    size,
    status: status === 'ALL' ? 'ALL' : status || undefined,
    q: debouncedQ || undefined,
    sortBy: 'created',
    sortDir: 'desc',
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by user name or email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: 280, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Size</InputLabel>
              <Select value={size} label="Size" onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
                {[10, 20, 50, 100].map((n) => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={72}>Thumb</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Challenge</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Waiting</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState
                      title={status === 'PENDING_REVIEW' ? 'No sessions awaiting review' : 'No sessions found'}
                      subtitle="Try changing filters or check back later."
                    />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                items.map((row) => (
                  <TableRow key={row.sessionId} hover>
                    <TableCell>
                      {row.videoThumbnailUrl ? (
                        <Box
                          component="img"
                          src={row.videoThumbnailUrl}
                          alt=""
                          sx={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 0.5 }}
                        />
                      ) : (
                        <Box sx={{ width: 56, height: 40, bgcolor: 'action.hover', borderRadius: 0.5 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{row.userName}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.userEmail}</Typography>
                    </TableCell>
                    <TableCell>{row.challengeName}</TableCell>
                    <TableCell align="right">{row.totalScore ?? '—'}</TableCell>
                    <TableCell>{formatRelativeTime(row.createdAt)}</TableCell>
                    <TableCell>{formatWaiting(row.waitingSeconds)}</TableCell>
                    <TableCell>
                      <ReviewStatusChip status={row.reviewStatus as ReviewStatus} />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => navigate(`/challenge-review/${row.sessionId}`)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages} · {data?.totalItems ?? 0} total
          </Typography>
          <Box>
            <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <NavigateBeforeIcon fontSize="small" />
            </Button>
            <Button size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <NavigateNextIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
