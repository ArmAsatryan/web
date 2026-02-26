import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useState } from 'react';
import { sendNotificationToUser } from '../api/api';

interface Props {
  open: boolean;
  onClose: () => void;
  userId?: number;
  userName: string;
}

export default function SendNotificationModal({ open, onClose, userId, userName }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!userId || !title.trim()) return;
    setError('');
    setLoading(true);
    try {
      await sendNotificationToUser({ userId, title: title.trim(), body: body.trim() || undefined });
      setTitle('');
      setBody('');
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; debugMessage?: string } }; message?: string };
      setError(err.response?.data?.debugMessage ?? err.response?.data?.message ?? err.message ?? 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <NotificationsActiveIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        Send notification to {userName || 'user'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          This notification will be sent as a push notification to the user's device.
        </Typography>
        <TextField
          fullWidth
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          helperText="Required. Appears as the notification headline."
        />
        <TextField
          fullWidth
          label="Body"
          multiline
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          helperText="Optional. Additional message content."
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title.trim() || loading}
          startIcon={<SendIcon />}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
