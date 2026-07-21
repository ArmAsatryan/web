import Chip from '@mui/material/Chip';
import type { ReviewStatus } from '../types';

const STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error'; variant?: 'outlined' }
> = {
  AWAITING_VIDEO: { label: 'Awaiting video', color: 'default' },
  PENDING_REVIEW: { label: 'Pending review', color: 'warning' },
  UNDER_REVIEW: { label: 'Under review', color: 'info' },
  APPROVED: { label: 'Approved', color: 'success' },
  CORRECTED_APPROVED: { label: 'Corrected', color: 'success' },
  DECLINED: { label: 'Declined', color: 'error' },
  EXPIRED: { label: 'Expired', color: 'default', variant: 'outlined' },
};

export default function ReviewStatusChip({ status }: { status: ReviewStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'default' as const };
  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant={config.variant ?? 'filled'}
    />
  );
}
