import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tooltip from '@mui/material/Tooltip';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { alpha } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  cancelNotificationBatch,
  deleteNotificationBatch,
  getAdminUserById,
  getLocales,
  getNotificationHistory,
  getUsers,
  scheduleNotificationBatch,
  sendNotificationBatch,
  sendNotificationToUser,
  translateNotification,
} from '../api/api';
import type { AdminNotificationBatchLanguagePayload, AdminNotificationBatchResponse } from '../types';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { languageCodeToLabel, localeTagToLabel } from '../utils/languageDisplay';

const DEFAULT_LANG = 'en';

function extractApiError(e: unknown): string {
  const err = e as { response?: { data?: { message?: string; debugMessage?: string } }; message?: string };
  return err.response?.data?.debugMessage ?? err.response?.data?.message ?? err.message ?? 'Request failed';
}

/** Parse datetime-local value into yyyy-MM-dd and HH:mm in the browser's local timezone. */
function localDatetimeToParts(localValue: string): { scheduledDate: string; scheduledWallTime: string } | null {
  if (!localValue) return null;
  const normalized = localValue.length === 16 ? `${localValue}:00` : localValue;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  const scheduledDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const scheduledWallTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { scheduledDate, scheduledWallTime };
}

function formatBatchDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function DevicePreviewPanel(props: {
  title: string;
  body: string;
  imageUrl: string;
  tab: 'initial' | 'expanded';
}) {
  const { title, body, imageUrl, tab } = props;
  const showExpanded = tab === 'expanded';
  return (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: { md: 16 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Preview
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Approximate layout only — verify on a device.
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: alpha('#000', 0.06),
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {title || 'Notification title'}
              </Typography>
              {showExpanded && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {body || 'Notification text'}
                </Typography>
              )}
            </Box>
            {imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt=""
                sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageOutlinedIcon color="disabled" fontSize="small" />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function buildLanguagePayloads(
  enTitle: string,
  enBody: string,
  imageUrl: string,
  extraLangs: string[],
  translations: Record<string, { title: string; body: string }>
): AdminNotificationBatchLanguagePayload[] {
  const langs: AdminNotificationBatchLanguagePayload[] = [
    {
      languageCode: DEFAULT_LANG,
      title: enTitle.trim(),
      body: enBody.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    },
  ];
  for (const code of extraLangs) {
    const t = translations[code];
    if (!t?.title?.trim()) continue;
    langs.push({
      languageCode: code,
      title: t.title.trim(),
      body: t.body?.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
    });
  }
  return langs;
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState(0);

  /** Tab 0 — send to user */
  const [userId, setUserId] = useState('');
  const [userTitle, setUserTitle] = useState('');
  const [userBody, setUserBody] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmUser, setConfirmUser] = useState(false);

  /** Tab 1 — wizard */
  const [activeStep, setActiveStep] = useState(0);
  const [previewTab, setPreviewTab] = useState<'initial' | 'expanded'>('initial');
  const [enTitle, setEnTitle] = useState('');
  const [enBody, setEnBody] = useState('');
  const [enImageUrl, setEnImageUrl] = useState('');
  const [extraLangs, setExtraLangs] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, { title: string; body: string }>>({});
  const [langToAdd, setLangToAdd] = useState('');
  const [translatingAll, setTranslatingAll] = useState(false);
  const [translateProgress, setTranslateProgress] = useState(0);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledLocal, setScheduledLocal] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [confirmSchedule, setConfirmSchedule] = useState(false);

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

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['notification-batch-history'],
    queryFn: async () => (await getNotificationHistory()).data,
    enabled: activeTab === 2,
  });

  const availableToAdd = useMemo(() => {
    const list = locales ?? [];
    return list.filter((l) => l !== DEFAULT_LANG && !extraLangs.includes(l));
  }, [locales, extraLangs]);

  const adminZoneId = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);

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
      setConfirmUser(false);
    }
  };

  const addLanguage = () => {
    if (!langToAdd) return;
    if (langToAdd === DEFAULT_LANG || extraLangs.includes(langToAdd)) return;
    setExtraLangs((prev) => [...prev, langToAdd]);
    setTranslations((prev) => ({
      ...prev,
      [langToAdd]: { title: '', body: '' },
    }));
    setLangToAdd('');
  };

  const removeLanguage = (code: string) => {
    setExtraLangs((prev) => prev.filter((c) => c !== code));
    setTranslations((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const translateAll = async () => {
    if (!enTitle.trim()) return;
    const raw = locales ?? [];
    const targets = Array.from(
      new Set(raw.filter((l) => typeof l === 'string' && l.trim() !== '' && l !== DEFAULT_LANG))
    ).sort();
    if (targets.length === 0) {
      setBatchMessage({ type: 'error', text: 'No languages available to translate (check locales API).' });
      return;
    }
    setTranslatingAll(true);
    setTranslateProgress(0);
    setExtraLangs(targets);
    setTranslations((prev) => {
      const next = { ...prev };
      for (const lang of targets) {
        if (!next[lang]) next[lang] = { title: '', body: '' };
      }
      return next;
    });
    try {
      let done = 0;
      for (const lang of targets) {
        const { data } = await translateNotification({
          targetLanguage: lang,
          title: enTitle.trim(),
          body: enBody.trim() || undefined,
        });
        setTranslations((prev) => ({
          ...prev,
          [lang]: { title: data.title, body: data.body ?? '' },
        }));
        done += 1;
        setTranslateProgress(Math.round((done / targets.length) * 100));
      }
    } catch (e: unknown) {
      setBatchMessage({ type: 'error', text: extractApiError(e) });
    } finally {
      setTranslatingAll(false);
    }
  };

  const runBatchSend = async () => {
    const langs = buildLanguagePayloads(enTitle, enBody, enImageUrl, extraLangs, translations);
    setBatchMessage(null);
    setBatchLoading(true);
    try {
      await sendNotificationBatch({ languages: langs, testMode: false });
      setBatchMessage({ type: 'success', text: 'Notification batch sent.' });
      await queryClient.invalidateQueries({ queryKey: ['notification-batch-history'] });
      setActiveStep(0);
      setEnTitle('');
      setEnBody('');
      setEnImageUrl('');
      setExtraLangs([]);
      setTranslations({});
      setScheduleMode('now');
      setScheduledLocal('');
    } catch (e: unknown) {
      setBatchMessage({ type: 'error', text: extractApiError(e) });
    } finally {
      setBatchLoading(false);
      setConfirmSend(false);
    }
  };

  const runBatchSchedule = async () => {
    const parts = localDatetimeToParts(scheduledLocal.trim());
    if (!parts) {
      setBatchMessage({ type: 'error', text: 'Invalid date or time.' });
      setConfirmSchedule(false);
      return;
    }
    const langs = buildLanguagePayloads(enTitle, enBody, enImageUrl, extraLangs, translations);
    setBatchMessage(null);
    setBatchLoading(true);
    try {
      await scheduleNotificationBatch({
        languages: langs,
        testMode: false,
        scheduledDate: parts.scheduledDate,
        scheduledWallTime: parts.scheduledWallTime,
        adminZoneId,
      });
      setBatchMessage({
        type: 'success',
        text: 'Notification scheduled. Same local clock time in each recipient region.',
      });
      await queryClient.invalidateQueries({ queryKey: ['notification-batch-history'] });
      setActiveStep(0);
      setEnTitle('');
      setEnBody('');
      setEnImageUrl('');
      setExtraLangs([]);
      setTranslations({});
      setScheduleMode('now');
      setScheduledLocal('');
    } catch (e: unknown) {
      setBatchMessage({ type: 'error', text: extractApiError(e) });
    } finally {
      setBatchLoading(false);
      setConfirmSchedule(false);
    }
  };

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelNotificationBatch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-batch-history'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNotificationBatch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-batch-history'] }),
  });

  const steps = ['Notification', 'Translations', 'Scheduling'];

  const canNextStep0 = enTitle.trim().length > 0;
  const canConfirmSend = canNextStep0 && scheduleMode === 'now';
  const canConfirmSchedule =
    canNextStep0 && scheduleMode === 'later' && scheduledLocal.trim().length > 0;

  const statusChip = (status: string): 'default' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'SENT':
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'warning';
      default:
        return 'default';
    }
  };

  const deliverySummary = (row: AdminNotificationBatchResponse['items'][0]) => {
    if (row.status !== 'SENT' || row.recipientsTotal == null) {
      return { primary: '—', progress: null as number | null };
    }
    const t = row.recipientsTotal;
    const s = row.recipientsSuccess ?? 0;
    if (t === 0) return { primary: 'No devices', progress: 100 };
    return { primary: `${s} / ${t} devices`, progress: Math.min(100, Math.round((s / t) * 100)) };
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Send push notifications, schedule multi-language broadcasts, and view history"
      />

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', minHeight: 48 },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Send to User" />
          <Tab icon={<ScheduleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Send / Schedule" />
          <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="History" />
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
                      {u.locale ? ` · ${localeTagToLabel(u.locale)}` : ''}
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
              {selectedUserIdNum != null && selectedUserIdNum > 0 && (
                <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                  This user&apos;s language:{' '}
                  <strong>
                    {selectedUser?.locale ? localeTagToLabel(selectedUser.locale) : 'Unknown (no device registered)'}
                  </strong>
                  {selectedUser?.locale && ' — use this language for the notification content.'}
                </Alert>
              )}
              <TextField fullWidth label="Title" required value={userTitle} onChange={(e) => setUserTitle(e.target.value)} />
              <TextField
                fullWidth
                label="Body"
                multiline
                rows={3}
                value={userBody}
                onChange={(e) => setUserBody(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => setConfirmUser(true)}
                disabled={!userId.trim() || !userTitle.trim() || userLoading}
                startIcon={<SendIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {userLoading ? 'Sending...' : 'Send to User'}
              </Button>
              {userMessage && (
                <Alert severity={userMessage.type === 'error' ? 'error' : 'success'}>{userMessage.text}</Alert>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {batchMessage && (
                <Alert severity={batchMessage.type === 'error' ? 'error' : 'success'} sx={{ mb: 2 }} onClose={() => setBatchMessage(null)}>
                  {batchMessage.text}
                </Alert>
              )}

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  gap: 3,
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ width: { xs: '100%', lg: 200 }, flexShrink: 0 }}>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel
                          sx={{
                            '& .MuiStepLabel-label': {
                              fontWeight: activeStep === steps.indexOf(label) ? 600 : 400,
                            },
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {activeStep === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560 }}>
                      <TextField
                        fullWidth
                        label="Notification title (English)"
                        required
                        value={enTitle}
                        onChange={(e) => setEnTitle(e.target.value)}
                        placeholder="Enter title"
                      />
                      <TextField
                        fullWidth
                        label="Notification text (English)"
                        multiline
                        rows={3}
                        value={enBody}
                        onChange={(e) => setEnBody(e.target.value)}
                        placeholder="Enter notification text"
                      />
                      <TextField
                        fullWidth
                        label="Notification image URL (optional)"
                        value={enImageUrl}
                        onChange={(e) => setEnImageUrl(e.target.value)}
                        placeholder="https://..."
                        InputProps={{
                          endAdornment: <ImageOutlinedIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />,
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button variant="contained" disabled={!canNextStep0} onClick={() => setActiveStep(1)}>
                          Next
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {activeStep === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560 }}>
                      <Typography variant="body2" color="text.secondary">
                        Add individual languages below, or use <strong>Translate all with AI</strong> to fill every locale from the
                        server (except English) from your English text. Skip to send English only.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FormControl sx={{ minWidth: 200 }} size="small">
                          <InputLabel>Add language</InputLabel>
                          <Select
                            value={langToAdd}
                            label="Add language"
                            onChange={(e) => setLangToAdd(e.target.value)}
                            displayEmpty
                            renderValue={(v) => (v ? languageCodeToLabel(v) : '')}
                          >
                            <MenuItem value="">
                              <em>Choose…</em>
                            </MenuItem>
                            {availableToAdd.map((l) => (
                              <MenuItem key={l} value={l}>
                                {languageCodeToLabel(l)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button variant="outlined" onClick={addLanguage} disabled={!langToAdd}>
                          Add
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<AutoAwesomeIcon />}
                          onClick={translateAll}
                          disabled={translatingAll || !enTitle.trim()}
                        >
                          {translatingAll ? 'Translating…' : 'Translate all with AI'}
                        </Button>
                      </Box>
                      {translatingAll && <LinearProgress variant="determinate" value={translateProgress} />}
                      {extraLangs.map((code) => (
                        <Paper key={`lang-${code}`} variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography fontWeight={600}>{languageCodeToLabel(code)}</Typography>
                            <Button size="small" color="inherit" onClick={() => removeLanguage(code)}>
                              Remove
                            </Button>
                          </Box>
                          <TextField
                            key={`tr-title-${code}`}
                            id={`tr-title-${code}`}
                            name={`tr-title-${code}`}
                            fullWidth
                            size="small"
                            label="Title"
                            autoComplete="off"
                            value={(translations[code] ?? { title: '', body: '' }).title}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTranslations((p) => {
                                const prev = p[code] ?? { title: '', body: '' };
                                return { ...p, [code]: { ...prev, title: v } };
                              });
                            }}
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            key={`tr-body-${code}`}
                            id={`tr-body-${code}`}
                            name={`tr-body-${code}`}
                            fullWidth
                            size="small"
                            label="Body"
                            multiline
                            rows={2}
                            autoComplete="off"
                            value={(translations[code] ?? { title: '', body: '' }).body}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTranslations((p) => {
                                const prev = p[code] ?? { title: '', body: '' };
                                return { ...p, [code]: { ...prev, body: v } };
                              });
                            }}
                          />
                        </Paper>
                      ))}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setActiveStep(0)}>Back</Button>
                        <Button variant="contained" onClick={() => setActiveStep(2)}>
                          Next
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {activeStep === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560 }}>
                      <FormControl>
                        <Typography variant="subtitle2" gutterBottom>
                          When to send
                        </Typography>
                        <RadioGroup
                          value={scheduleMode}
                          onChange={(e) => setScheduleMode(e.target.value as 'now' | 'later')}
                        >
                          <FormControlLabel value="now" control={<Radio />} label="Send now" />
                          <FormControlLabel value="later" control={<Radio />} label="Schedule for later" />
                        </RadioGroup>
                      </FormControl>
                      {scheduleMode === 'later' && (
                        <TextField
                          fullWidth
                          label="Send at (local)"
                          type="datetime-local"
                          value={scheduledLocal}
                          onChange={(e) => setScheduledLocal(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 60 }}
                          helperText={`Your timezone: ${adminZoneId}. Recipients get the same clock time in their region.`}
                        />
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button onClick={() => setActiveStep(1)}>Back</Button>
                        {scheduleMode === 'now' ? (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SendIcon />}
                            disabled={!canConfirmSend || batchLoading}
                            onClick={() => setConfirmSend(true)}
                          >
                            Send
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ScheduleIcon />}
                            disabled={!canConfirmSchedule || batchLoading}
                            onClick={() => setConfirmSchedule(true)}
                          >
                            Schedule
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box sx={{ width: { xs: '100%', lg: 340 }, flexShrink: 0 }}>
                  <Tabs
                    value={previewTab}
                    onChange={(_, v) => setPreviewTab(v)}
                    sx={{ minHeight: 36, mb: 1 }}
                  >
                    <Tab value="initial" label="Initial state" sx={{ minHeight: 36, py: 0 }} />
                    <Tab value="expanded" label="Expanded view" sx={{ minHeight: 36, py: 0 }} />
                  </Tabs>
                  <DevicePreviewPanel
                    title={enTitle}
                    body={enBody}
                    imageUrl={enImageUrl.trim()}
                    tab={previewTab}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {historyLoading && <Typography color="text.secondary">Loading…</Typography>}
              {!historyLoading && history.length === 0 && (
                <Typography color="text.secondary">No notification campaigns yet.</Typography>
              )}
              {history.map((batch: AdminNotificationBatchResponse) => (
                <Accordion key={batch.id} defaultExpanded={false} variant="outlined">
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, width: '100%', pr: 1 }}>
                      <Typography fontWeight={600}>#{batch.id}</Typography>
                      <Chip size="small" label={batch.batchType} variant="outlined" />
                      <Chip size="small" label={batch.overallStatus} color={statusChip(batch.overallStatus)} variant="outlined" />
                      <Typography variant="body2" color="text.secondary">
                        {formatBatchDate(batch.createdAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {batch.items.length} item(s)
                        {batch.testMode ? ' · test mode' : ''}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Language</TableCell>
                            <TableCell>Locale</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Scheduled (UTC)</TableCell>
                            <TableCell>Delivery</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {batch.items.map((row) => {
                            const d = deliverySummary(row);
                            return (
                              <TableRow key={row.id}>
                                <TableCell>{languageCodeToLabel(row.languageCode)}</TableCell>
                                <TableCell>{row.locale ? localeTagToLabel(row.locale) : '—'}</TableCell>
                                <TableCell sx={{ maxWidth: 200 }}>{row.title}</TableCell>
                                <TableCell>
                                  <Chip size="small" label={row.status} color={statusChip(row.status)} variant="outlined" />
                                </TableCell>
                                <TableCell>
                                  {row.scheduledAt ? new Date(row.scheduledAt).toISOString() : '—'}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption" display="block">
                                    {d.primary}
                                  </Typography>
                                  {d.progress != null && (
                                    <LinearProgress variant="determinate" value={d.progress} sx={{ mt: 0.5, height: 6 }} />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                      <Tooltip title="Cancel pending scheduled batch">
                        <span>
                          <Button
                            size="small"
                            color="warning"
                            disabled={
                              cancelMutation.isPending ||
                              (batch.overallStatus !== 'PENDING' && batch.overallStatus !== 'IN_PROGRESS')
                            }
                            onClick={() => cancelMutation.mutate(batch.id)}
                          >
                            Cancel
                          </Button>
                        </span>
                      </Tooltip>
                      <Button
                        size="small"
                        color="error"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Remove this batch from history?')) deleteMutation.mutate(batch.id);
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmUser}
        title="Send notification to user"
        message={`Send this notification to user ID ${userId}?`}
        confirmLabel="Send"
        onConfirm={handleSendToUser}
        onCancel={() => setConfirmUser(false)}
        loading={userLoading}
      />

      <ConfirmDialog
        open={confirmSend}
        title="Send notification batch"
        message="Send this notification to all configured language groups now?"
        confirmLabel="Send"
        onConfirm={runBatchSend}
        onCancel={() => setConfirmSend(false)}
        loading={batchLoading}
      />

      <ConfirmDialog
        open={confirmSchedule}
        title="Schedule notification batch"
        message={`Schedule for ${scheduledLocal || '(no time)'} (${adminZoneId})?`}
        confirmLabel="Schedule"
        onConfirm={runBatchSchedule}
        onCancel={() => setConfirmSchedule(false)}
        loading={batchLoading}
      />
    </Box>
  );
}
