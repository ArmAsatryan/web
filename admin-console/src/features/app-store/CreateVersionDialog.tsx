import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { extractApiError, useCreateVersion } from './hooks';
import type { AppStoreVersionSummary } from './types';

const VERSION_REGEX = /^\d+\.\d+(\.\d+)?$/;

const PLATFORMS = [
  { value: 'IOS', label: 'iOS' },
  { value: 'MAC_OS', label: 'macOS' },
  { value: 'TV_OS', label: 'tvOS' },
  { value: 'VISION_OS', label: 'visionOS' },
];

interface CreateVersionDialogProps {
  open: boolean;
  appId: string;
  onClose: () => void;
  onCreated?: (version: AppStoreVersionSummary) => void;
}

export default function CreateVersionDialog({
  open,
  appId,
  onClose,
  onCreated,
}: CreateVersionDialogProps) {
  const createMutation = useCreateVersion(appId);
  const [versionString, setVersionString] = useState('');
  const [platform, setPlatform] = useState('IOS');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setVersionString('');
      setPlatform('IOS');
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = versionString.trim();
    if (!VERSION_REGEX.test(trimmed)) {
      setError('Version must be in the format 1.0 or 1.0.0.');
      return;
    }
    createMutation.mutate(
      { appId, versionString: trimmed, platform },
      {
        onSuccess: (version) => {
          onCreated?.(version);
          onClose();
        },
        onError: (err) => setError(extractApiError(err)),
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create new version</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} sx={{ mt: 0.5 }} onSubmit={handleSubmit}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Version string"
            value={versionString}
            onChange={(e) => setVersionString(e.target.value)}
            placeholder="e.g. 1.2.3"
            fullWidth
            autoFocus
            required
            helperText="Must be higher than your last released version."
          />
          <FormControl fullWidth>
            <InputLabel>Platform</InputLabel>
            <Select
              label="Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORMS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <button type="submit" style={{ display: 'none' }} aria-hidden />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createMutation.isPending || !versionString.trim()}
        >
          {createMutation.isPending ? 'Creating…' : 'Create version'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
