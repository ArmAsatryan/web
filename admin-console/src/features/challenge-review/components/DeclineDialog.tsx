import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { DeclineReason } from '../types';

const DECLINE_REASONS: { value: DeclineReason; label: string }[] = [
  { value: 'CHEATING', label: 'Cheating' },
  { value: 'INVALID_TARGET', label: 'Invalid target' },
  { value: 'INVALID_SETUP', label: 'Invalid setup' },
  { value: 'DUPLICATE', label: 'Duplicate' },
  { value: 'NO_VIDEO', label: 'No video' },
  { value: 'OTHER', label: 'Other' },
];

interface DeclineDialogProps {
  open: boolean;
  loading?: boolean;
  onConfirm: (reason: DeclineReason, comment: string) => void;
  onCancel: () => void;
}

export default function DeclineDialog({ open, loading, onConfirm, onCancel }: DeclineDialogProps) {
  const [reason, setReason] = useState<DeclineReason>('OTHER');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('OTHER');
      setComment('');
    }
  }, [open]);

  const canSubmit = comment.trim().length > 0;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Decline challenge session</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The comment you enter will be shown to the user in their session history.
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Reason</InputLabel>
          <Select value={reason} label="Reason" onChange={(e) => setReason(e.target.value as DeclineReason)}>
            {DECLINE_REASONS.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Comment for user"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={!canSubmit || loading}
          onClick={() => onConfirm(reason, comment.trim())}
        >
          {loading ? 'Declining…' : 'Decline session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
