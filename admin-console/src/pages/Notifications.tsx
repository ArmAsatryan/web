import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PersonIcon from '@mui/icons-material/Person';
import TranslateIcon from '@mui/icons-material/Translate';
import SendIcon from '@mui/icons-material/Send';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getAdminUserById, getLocales, getUsers, sendNotificationToLocale, sendNotificationToUser } from '../api/api';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Notifications() {
  const [locale, setLocale] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userId, setUserId] = useState<string>('');
  const [userTitle, setUserTitle] = useState('');
  const [userBody, setUserBody] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState<'user' | 'locale' | null>(null);

  const { data: locales } = useQuery({ queryKey: ['locales'], queryFn: async () => (await getLocales()).data });
  const { data: usersData } = useQuery({
    queryKey: ['users-notifications'],
    queryFn: async () => (await getUsers({ page: 1, size: 500 })).data,
  });
  const users = usersData?.items ?? [];

  const selectedUserIdNum = userId.trim() ? Number(userId.trim()) : null;
  const { data: selectedUser } = useQuery({
    queryKey: ['admin-user', selectedUserIdNum],
    queryFn: async () => (await getAdminUserById(selectedUserIdNum!)).data,
    enabled: !!selectedUserIdNum && selectedUserIdNum > 0 && Number.isInteger(selectedUserIdNum),
  });

  const handleSendByLocale = async () => {
    if (!locale.trim() || !title.trim()) return;
    setMessage(null);
    setLoading(true);
    try {
      await sendNotificationToLocale({ locale: locale.trim(), title: title.trim(), body: body.trim() || undefined });
      setMessage({ type: 'success', text: 'Notification sent to locale.' });
      setTitle('');
      setBody('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; debugMessage?: string } }; message?: string };
      setMessage({ type: 'error', text: err.response?.data?.debugMessage ?? err.response?.data?.message ?? err.message ?? 'Failed to send' });
    } finally {
      setLoading(false);
      setConfirmOpen(null);
    }
  };

  const handleSendToUser = async () => {
    const id = userId.trim() ? Number(userId.trim()) : null;
    if (id == null || !Number.isInteger(id) || id <= 0 || !userTitle.trim()) return;
    setUserMessage(null);
    setUserLoading(true);
    try {
      await sendNotificationToUser({
        userId: id,
        title: userTitle.trim(),
        body: userBody.trim() || undefined,
      });
      setUserMessage({ type: 'success', text: 'Notification sent to user.' });
      setUserTitle('');
      setUserBody('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; debugMessage?: string } }; message?: string };
      const text = err.response?.data?.debugMessage ?? err.response?.data?.message ?? err.message ?? 'Failed to send';
      setUserMessage({ type: 'error', text });
    } finally {
      setUserLoading(false);
      setConfirmOpen(null);
    }
  };

  const selectedUserId = selectedUserIdNum;
  const canSendToUser = selectedUserId != null && selectedUserId > 0 && userTitle.trim() && !userLoading;

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Send push notifications to individual users or by language group"
      />

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Send to User" />
          <Tab icon={<TranslateIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Send by Language" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 520 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Send a push notification to one user by selecting them or entering their user ID.
              </Typography>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={userId}
                  label="User"
                  onChange={(e) => setUserId(e.target.value)}
                  displayEmpty
                  renderValue={(v) => {
                    if (!v) return '';
                    const u = users.find((x) => String(x.id) === v);
                    return u ? `${u.name ?? ''} ${u.surname ?? ''}`.trim() || u.emailAddress || `User ${v}` : `User ID ${v}`;
                  }}
                >
                  <MenuItem value="">
                    <em>Select user or enter ID below</em>
                  </MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={String(u.id)}>
                      {[u.name, u.surname].filter(Boolean).join(' ') || u.emailAddress || `User ${u.id}`} ({u.emailAddress})
                      {u.locale ? ` · ${u.locale}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="User ID (if not selected above)"
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 123"
                inputProps={{ min: 1 }}
                helperText="Enter a numeric user ID directly"
              />
              {selectedUserId != null && selectedUserId > 0 && (
                <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                  This user&apos;s language: <strong>{selectedUser?.locale ?? 'Unknown (no device registered)'}</strong>
                  {selectedUser?.locale && ' — use this language for the notification content.'}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Title"
                required
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                helperText="Required. This appears as the notification headline."
              />
              <TextField
                fullWidth
                label="Body"
                multiline
                rows={3}
                value={userBody}
                onChange={(e) => setUserBody(e.target.value)}
                helperText="Optional. Additional message content."
              />
              <Button
                variant="contained"
                onClick={() => setConfirmOpen('user')}
                disabled={!canSendToUser}
                startIcon={<SendIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {userLoading ? 'Sending...' : 'Send to User'}
              </Button>
              {userMessage && (
                <Alert severity={userMessage.type === 'error' ? 'error' : 'success'} sx={{ mt: 0.5 }}>
                  {userMessage.text}
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 520 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Send a push notification to all users with the selected language (from their FCM token).
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select value={locale} label="Language" onChange={(e) => setLocale(e.target.value)}>
                  <MenuItem value="">Select language</MenuItem>
                  {(locales || []).map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText="Required. This appears as the notification headline."
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
              <Button
                variant="contained"
                onClick={() => setConfirmOpen('locale')}
                disabled={!locale.trim() || !title.trim() || loading}
                startIcon={<SendIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {loading ? 'Sending...' : 'Send to Language Group'}
              </Button>
              {message && (
                <Alert severity={message.type === 'error' ? 'error' : 'success'} sx={{ mt: 0.5 }}>
                  {message.text}
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen === 'user'}
        title="Send Notification to User"
        message={`Are you sure you want to send this notification to User ID ${userId}? This action cannot be undone.`}
        confirmLabel="Send"
        onConfirm={handleSendToUser}
        onCancel={() => setConfirmOpen(null)}
        loading={userLoading}
      />

      <ConfirmDialog
        open={confirmOpen === 'locale'}
        title="Send Notification to Language Group"
        message={`Are you sure you want to send this notification to all users with language "${locale}"? This action cannot be undone.`}
        confirmLabel="Send"
        onConfirm={handleSendByLocale}
        onCancel={() => setConfirmOpen(null)}
        loading={loading}
      />
    </Box>
  );
}
