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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import PersonIcon from '@mui/icons-material/Person';
import TranslateIcon from '@mui/icons-material/Translate';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  cancelScheduledNotification,
  deleteScheduledNotification,
  getAdminUserById,
  getLocales,
  getUsers,
  listScheduledNotifications,
  patchScheduledNotificationTime,
  scheduleNotificationByLanguage,
  sendNotificationToLanguage,
  sendNotificationToUser,
} from '../api/api';
import type { ScheduledNotification } from '../types';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';

/** Backend expects yyyy-MM-dd'T'HH:mm:ss; datetime-local omits seconds. */
function toScheduledAtPayload(localValue: string): string {
  if (!localValue) return '';
  return localValue.length === 16 ? `${localValue}:00` : localValue;
}

function scheduledAtToDatetimeLocal(iso: string): string {
  if (!iso) return '';
  const s = iso.replace('Z', '').replace(/\.\d{3}$/, '');
  return s.length >= 16 ? s.slice(0, 16) : s;
}

function extractApiError(e: unknown): string {
  const err = e as { response?: { data?: { message?: string; debugMessage?: string } }; message?: string };
  return err.response?.data?.debugMessage ?? err.response?.data?.message ?? err.message ?? 'Request failed';
}

export default function Notifications() {
  const [language, setLanguage] = useState('');
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
  const [confirmOpen, setConfirmOpen] = useState<'user' | 'language' | 'schedule' | null>(null);
  const [scheduledAtLocal, setScheduledAtLocal] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [scheduledStatusFilter, setScheduledStatusFilter] = useState<string>('');
  const [editTimeRow, setEditTimeRow] = useState<ScheduledNotification | null>(null);
  const [editTimeLocal, setEditTimeLocal] = useState('');
  const [scheduledConfirm, setScheduledConfirm] = useState<{ action: 'cancel' | 'delete'; id: number } | null>(null);

  const queryClient = useQueryClient();

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

  const handleSendByLanguage = async () => {
    if (!language.trim() || !title.trim()) return;
    setMessage(null);
    setLoading(true);
    try {
      await sendNotificationToLanguage({ language: language.trim(), title: title.trim(), body: body.trim() || undefined });
      setMessage({ type: 'success', text: 'Notification sent to language group.' });
      setTitle('');
      setBody('');
    } catch (e: unknown) {
      setMessage({ type: 'error', text: extractApiError(e) });
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
      setUserMessage({ type: 'error', text: extractApiError(e) });
    } finally {
      setUserLoading(false);
      setConfirmOpen(null);
    }
  };

  const selectedUserId = selectedUserIdNum;
  const canSendToUser = selectedUserId != null && selectedUserId > 0 && userTitle.trim() && !userLoading;

  const { data: scheduledList = [], isLoading: scheduledListLoading } = useQuery({
    queryKey: ['scheduled-notifications', scheduledStatusFilter],
    queryFn: async () => (await listScheduledNotifications(scheduledStatusFilter || undefined)).data,
    enabled: activeTab === 2,
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: number; scheduledAt: string }) =>
      patchScheduledNotificationTime(id, { scheduledAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      setEditTimeRow(null);
    },
  });

  const [scheduledActionLoading, setScheduledActionLoading] = useState(false);
  const [scheduledTabError, setScheduledTabError] = useState<string | null>(null);

  const handleScheduleByLanguage = async () => {
    if (!language.trim() || !title.trim() || !scheduledAtLocal.trim()) return;
    setScheduleMessage(null);
    setScheduleLoading(true);
    try {
      await scheduleNotificationByLanguage({
        language: language.trim(),
        title: title.trim(),
        body: body.trim() || undefined,
        scheduledAt: toScheduledAtPayload(scheduledAtLocal.trim()),
      });
      setScheduleMessage({ type: 'success', text: 'Notification scheduled.' });
      setScheduledAtLocal('');
      await queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
    } catch (e: unknown) {
      setScheduleMessage({ type: 'error', text: extractApiError(e) });
    } finally {
      setScheduleLoading(false);
      setConfirmOpen(null);
    }
  };

  const openEditTime = (row: ScheduledNotification) => {
    patchMutation.reset();
    setEditTimeRow(row);
    setEditTimeLocal(scheduledAtToDatetimeLocal(row.scheduledAt));
  };

  const handleSaveEditTime = () => {
    if (!editTimeRow || !editTimeLocal.trim()) return;
    patchMutation.mutate({
      id: editTimeRow.id,
      scheduledAt: toScheduledAtPayload(editTimeLocal.trim()),
    });
  };

  const handleScheduledConfirmAction = async () => {
    if (!scheduledConfirm) return;
    setScheduledTabError(null);
    setScheduledActionLoading(true);
    try {
      if (scheduledConfirm.action === 'cancel') await cancelScheduledNotification(scheduledConfirm.id);
      else await deleteScheduledNotification(scheduledConfirm.id);
      await queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
      setScheduledConfirm(null);
    } catch (e: unknown) {
      setScheduledTabError(extractApiError(e));
    } finally {
      setScheduledActionLoading(false);
    }
  };

  const statusChipColor = (status: string): 'default' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'SENT':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Send push notifications to users or language groups, and manage scheduled language broadcasts"
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
          <Tab icon={<ScheduleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Scheduled" />
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
                <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
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
                onClick={() => setConfirmOpen('language')}
                disabled={!language.trim() || !title.trim() || loading}
                startIcon={<SendIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {loading ? 'Sending...' : 'Send to Language Group'}
              </Button>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                Schedule for later
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Same title and body as above. Choose a date and time in the future; seconds default to :00.
              </Typography>
              <TextField
                fullWidth
                label="Send at (local)"
                type="datetime-local"
                value={scheduledAtLocal}
                onChange={(e) => setScheduledAtLocal(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
              />
              <Button
                variant="outlined"
                onClick={() => setConfirmOpen('schedule')}
                disabled={!language.trim() || !title.trim() || !scheduledAtLocal.trim() || scheduleLoading}
                startIcon={<ScheduleIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {scheduleLoading ? 'Scheduling...' : 'Schedule notification'}
              </Button>
              {scheduleMessage && (
                <Alert severity={scheduleMessage.type === 'error' ? 'error' : 'success'} sx={{ mt: 0.5 }}>
                  {scheduleMessage.text}
                </Alert>
              )}
              {message && (
                <Alert severity={message.type === 'error' ? 'error' : 'success'} sx={{ mt: 0.5 }}>
                  {message.text}
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={scheduledStatusFilter}
                    label="Status"
                    onChange={(e) => setScheduledStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="PENDING">PENDING</MenuItem>
                    <MenuItem value="SENT">SENT</MenuItem>
                    <MenuItem value="FAILED">FAILED</MenuItem>
                    <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {scheduledTabError && (
                <Alert severity="error" onClose={() => setScheduledTabError(null)}>
                  {scheduledTabError}
                </Alert>
              )}
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 560 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Language</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Scheduled at</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduledListLoading && (
                      <TableRow>
                        <TableCell colSpan={7}>Loading…</TableCell>
                      </TableRow>
                    )}
                    {!scheduledListLoading && scheduledList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography variant="body2" color="text.secondary">
                            No scheduled notifications.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {!scheduledListLoading &&
                      scheduledList.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.language}</TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>{row.title}</TableCell>
                          <TableCell>
                            <Chip size="small" label={row.status} color={statusChipColor(row.status)} variant="outlined" />
                          </TableCell>
                          <TableCell>{row.scheduledAt}</TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>
                            {row.status === 'FAILED' && row.errorMessage ? (
                              <Tooltip title={row.errorMessage}>
                                <Typography variant="caption" color="error" sx={{ display: 'block', cursor: 'help' }}>
                                  {row.errorMessage}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Change time (PENDING only)">
                                <span>
                                  <Button
                                    size="small"
                                    onClick={() => openEditTime(row)}
                                    disabled={row.status !== 'PENDING'}
                                    startIcon={<EditCalendarIcon fontSize="small" />}
                                  >
                                    Time
                                  </Button>
                                </span>
                              </Tooltip>
                              <Tooltip title="Cancel (PENDING only)">
                                <span>
                                  <Button
                                    size="small"
                                    color="warning"
                                    onClick={() => setScheduledConfirm({ action: 'cancel', id: row.id })}
                                    disabled={row.status !== 'PENDING'}
                                    startIcon={<CancelIcon fontSize="small" />}
                                  >
                                    Cancel
                                  </Button>
                                </span>
                              </Tooltip>
                              <Tooltip title="Remove row">
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => setScheduledConfirm({ action: 'delete', id: row.id })}
                                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                                >
                                  Remove
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
        open={confirmOpen === 'language'}
        title="Send Notification to Language Group"
        message={`Are you sure you want to send this notification to all users with language "${language}"? This action cannot be undone.`}
        confirmLabel="Send"
        onConfirm={handleSendByLanguage}
        onCancel={() => setConfirmOpen(null)}
        loading={loading}
      />

      <ConfirmDialog
        open={confirmOpen === 'schedule'}
        title="Schedule notification"
        message={`Schedule this notification for language "${language}" at ${scheduledAtLocal || '(no time selected)'}? You can change or cancel it from the Scheduled tab while it is still pending.`}
        confirmLabel="Schedule"
        onConfirm={handleScheduleByLanguage}
        onCancel={() => setConfirmOpen(null)}
        loading={scheduleLoading}
      />

      <ConfirmDialog
        open={!!scheduledConfirm}
        title={scheduledConfirm?.action === 'cancel' ? 'Cancel scheduled notification' : 'Remove scheduled notification'}
        message={
          scheduledConfirm?.action === 'cancel'
            ? 'Cancel this pending notification? It will not be sent.'
            : 'Permanently remove this scheduled notification record?'
        }
        confirmLabel={scheduledConfirm?.action === 'cancel' ? 'Cancel job' : 'Remove'}
        variant={scheduledConfirm?.action === 'delete' ? 'danger' : 'primary'}
        onConfirm={handleScheduledConfirmAction}
        onCancel={() => setScheduledConfirm(null)}
        loading={scheduledActionLoading}
      />

      <Dialog
        open={!!editTimeRow}
        onClose={() => {
          if (!patchMutation.isPending) {
            patchMutation.reset();
            setEditTimeRow(null);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change scheduled time</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {patchMutation.isError && (
            <Alert severity="error">{extractApiError(patchMutation.error)}</Alert>
          )}
          <TextField
            fullWidth
            label="Send at (local)"
            type="datetime-local"
            value={editTimeLocal}
            onChange={(e) => setEditTimeLocal(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 60 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              patchMutation.reset();
              setEditTimeRow(null);
            }}
            disabled={patchMutation.isPending}
          >
            Close
          </Button>
          <Button variant="contained" onClick={handleSaveEditTime} disabled={patchMutation.isPending || !editTimeLocal.trim()}>
            {patchMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
