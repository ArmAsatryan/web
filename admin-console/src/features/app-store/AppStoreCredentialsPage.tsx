import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  extractApiError,
  useCredentialsStatus,
  useDeleteCredentials,
  useSaveCredentials,
} from './hooks';

export default function AppStoreCredentialsPage() {
  const navigate = useNavigate();
  const statusQuery = useCredentialsStatus();
  const saveMutation = useSaveCredentials();
  const deleteMutation = useDeleteCredentials();

  const [issuerId, setIssuerId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = statusQuery.data;
  const configured = status?.configured === true;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedMessage(null);
    if (!issuerId.trim() || !keyId.trim() || !privateKeyPem.trim()) {
      setError('Issuer ID, Key ID and the .p8 key contents are all required');
      return;
    }
    saveMutation.mutate(
      { issuerId: issuerId.trim(), keyId: keyId.trim(), privateKeyPem: privateKeyPem.trim() },
      {
        onSuccess: () => {
          setSavedMessage('Credentials saved and encrypted.');
          setIssuerId('');
          setKeyId('');
          setPrivateKeyPem('');
        },
        onError: (err) => setError(extractApiError(err)),
      }
    );
  };

  const handleDelete = () => {
    setError(null);
    setSavedMessage(null);
    deleteMutation.mutate(undefined, {
      onSuccess: () => setSavedMessage('Stored credentials removed.'),
      onError: (err) => setError(extractApiError(err)),
    });
    setConfirmDelete(false);
  };

  return (
    <Stack spacing={3}>
      {status && !status.masterKeyConfigured && (
        <Alert severity="error">
          Server-side master key is missing. Set the <code>APPSTORE_MASTER_KEY</code> environment
          variable on the backend before configuring credentials.
        </Alert>
      )}

      <Card>
        <CardContent sx={{ py: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <KeyIcon color="primary" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                App Store Connect credentials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stored encrypted (AES-GCM) on the server. The private key never leaves the backend.
              </Typography>
            </Box>
            {statusQuery.isLoading ? (
              <CircularProgress size={20} />
            ) : configured ? (
              <Chip color="success" label="Configured" />
            ) : (
              <Chip color="warning" label="Not configured" />
            )}
          </Stack>

          {configured && status && (
            <Box
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                p: 2,
                mb: 3,
              }}
            >
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Stat label="Issuer ID" value={status.issuerIdMasked ?? '—'} />
                <Stat label="Key ID" value={status.keyIdLast4 ? `…${status.keyIdLast4}` : '—'} />
                <Stat
                  label="Updated"
                  value={status.updatedAt ? new Date(status.updatedAt).toLocaleString() : '—'}
                />
              </Stack>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {savedMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSavedMessage(null)}>
              {savedMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Issuer ID"
              value={issuerId}
              onChange={(e) => setIssuerId(e.target.value)}
              placeholder="e.g. 7baf1ff3-877d-4dcd-a27a-a2fd47e0ba9c"
              fullWidth
              autoComplete="off"
            />
            <TextField
              label="Key ID"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="e.g. 3A58AFR39R"
              fullWidth
              autoComplete="off"
            />
            <TextField
              label="Private key (.p8 contents)"
              value={privateKeyPem}
              onChange={(e) => setPrivateKeyPem(e.target.value)}
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              fullWidth
              multiline
              minRows={6}
              maxRows={14}
              autoComplete="off"
              inputProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 } }}
            />

            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saveMutation.isPending || !status?.masterKeyConfigured}
              >
                {saveMutation.isPending ? 'Saving…' : configured ? 'Update credentials' : 'Save credentials'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/app-store')}
                disabled={!configured}
              >
                Back to apps
              </Button>
              {configured && (
                <Button
                  color="error"
                  variant="text"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleteMutation.isPending}
                >
                  Remove
                </Button>
              )}
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary">
            Generate a new API key at{' '}
            <a
              href="https://appstoreconnect.apple.com/access/integrations/api"
              target="_blank"
              rel="noopener noreferrer"
            >
              App Store Connect → Users and Access → Integrations → App Store Connect API
            </a>
            . Upload the downloaded .p8 file here once — it is encrypted at rest.
          </Typography>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove credentials?"
        message="This wipes the encrypted .p8 key from the server. You will have to re-upload it to use App Store Connect again."
        confirmLabel="Remove"
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Stack>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}
