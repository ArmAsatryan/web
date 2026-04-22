import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  keyframes,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { isAxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getLoadsFull, LOADS_MANUAL_TOKEN_KEY } from '../api/api';
import { dashboardPageCardContentSx, dashboardPageCardSx } from '../styles/dashboardPageCard';
import type { LoadsFullData } from '../types';
import { parseLoadsFullResponse } from '../utils/loadsFullNormalize';

const CHART_COLORS = {
  memUsed: '#5c6bc0',
  memCached: '#9575cd',
  memFree: '#26a69a',
  memOther: '#78909c',
  diskUsed: '#00897b',
  diskFree: '#b0bec5',
  load: '#1e88e5',
  cpuBusy: '#1e88e5',
  cpuTrack: 'rgba(128, 128, 128, 0.18)',
  processBar: '#5c6bc0',
} as const;

const CHART_BOX = { flex: 1, minHeight: 208, width: 1, position: 'relative' as const };

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v < 10 && i > 0 ? v.toFixed(1) : Math.round(v)} ${u[i]}`;
}

function formatBootDuration(bootTimeSeconds: number): { label: string; detail: string } {
  if (!Number.isFinite(bootTimeSeconds) || bootTimeSeconds < 1e8) {
    return { label: '—', detail: '' };
  }
  const boot = bootTimeSeconds * 1000;
  const diff = Date.now() - boot;
  if (diff < 0) return { label: '—', detail: '' };
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (d === 0 && m > 0) parts.push(`${m}m`);
  if (parts.length === 0) parts.push('< 1m');
  const when = new Date(boot);
  return {
    label: parts.join(' '),
    detail: `Boot ${when.toLocaleString()}`,
  };
}

function memorySlices(d: LoadsFullData['memory']) {
  const { total, used, free, cached } = d;
  const accounted = used + free + cached;
  const other = Math.max(0, total - accounted);
  return [
    { name: 'Used', value: used, key: 'used' },
    { name: 'Cached', value: cached, key: 'cached' },
    { name: 'Free', value: free, key: 'free' },
    ...(other > 0 ? ([{ name: 'Other / buffers', value: other, key: 'other' }] as const) : []),
  ].filter((x) => x.value > 0);
}

const memColors = (key: string) => {
  switch (key) {
    case 'used':
      return CHART_COLORS.memUsed;
    case 'cached':
      return CHART_COLORS.memCached;
    case 'free':
      return CHART_COLORS.memFree;
    default:
      return CHART_COLORS.memOther;
  }
};

const healthChip = (cpu: number, memRatio: number) => {
  if (memRatio > 0.95 || cpu > 90) return { label: 'High load', color: 'error' as const };
  if (memRatio > 0.85 || cpu > 70) return { label: 'Watch', color: 'warning' as const };
  return { label: 'OK', color: 'success' as const };
};

type ServerTrafficState = 'ok' | 'warning' | 'danger' | 'down' | 'loading';

function chipColorToTraffic(color: 'success' | 'warning' | 'error'): 'ok' | 'warning' | 'danger' {
  if (color === 'success') return 'ok';
  if (color === 'warning') return 'warning';
  return 'danger';
}

const trafficLabel: Record<ServerTrafficState, string> = {
  ok: 'Server is up — all clear (green).',
  warning: 'Caution — elevated CPU or memory (amber).',
  danger: 'High load — resource pressure (red).',
  down: 'Service unreachable or auth failed (red).',
  loading: 'Loading health data…',
};

const kfTrafficLoad = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.85; }
`;

/**
 * Three-lamp stack (red / amber / green). The lit lamp matches the current status; **green = all ok / server up.**
 */
function ServerTrafficStatusLight({ state, size = 48 }: { state: ServerTrafficState; size?: number }) {
  const theme = useTheme();
  const housing = size * 0.4;
  const lamp = Math.max(7, size * 0.17);
  const gap = Math.max(3, size * 0.05);
  const pad = Math.max(4, size * 0.1);

  const redOn = state === 'danger' || state === 'down';
  const amberOn = state === 'warning';
  const greenOn = state === 'ok';
  const loading = state === 'loading';

  const lampColor = (which: 'red' | 'amber' | 'green', isOn: boolean) => {
    if (loading) {
      return {
        backgroundColor:
          which === 'green'
            ? alpha(theme.palette.success.main, 0.4)
            : which === 'amber'
              ? alpha(theme.palette.warning.main, 0.25)
              : alpha(theme.palette.error.main, 0.25),
        boxShadow: 'none',
        animation: `${kfTrafficLoad} 1.1s ease-in-out infinite`,
      };
    }
    const base = which === 'red' ? theme.palette.error.main : which === 'amber' ? theme.palette.warning.main : theme.palette.success.main;
    if (!isOn) {
      return {
        backgroundColor: alpha(base, 0.2),
        boxShadow: 'none',
        opacity: 1,
      };
    }
    return {
      backgroundColor: base,
      boxShadow: `0 0 ${lamp * 0.5}px ${lamp * 0.35}px ${alpha(base, 0.5)}`,
    };
  };

  return (
    <Tooltip title={trafficLabel[state]} placement="right" enterDelay={200}>
      <Box
        component="span"
        role="img"
        aria-label={trafficLabel[state]}
        sx={{
          width: housing,
          minWidth: housing,
          borderRadius: 1.5,
          px: `${pad}px`,
          py: `${pad + 1}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${gap}px`,
          bgcolor: alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.35 : 0.82),
          border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          boxSizing: 'border-box',
        }}
      >
        {(['red', 'amber', 'green'] as const).map((which) => {
          const isOn = which === 'red' ? redOn : which === 'amber' ? amberOn : greenOn;
          return (
            <Box
              key={which}
              sx={{
                width: lamp,
                height: lamp,
                borderRadius: '50%',
                flexShrink: 0,
                transition: 'box-shadow 0.2s, background-color 0.2s, opacity 0.2s',
                ...lampColor(which, isOn),
              }}
            />
          );
        })}
      </Box>
    </Tooltip>
  );
}

function LoadsTokenRow({ onTokenChange }: { onTokenChange: () => void }) {
  const [input, setInput] = useState('');
  const [hasSaved, setHasSaved] = useState(
    () => typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(LOADS_MANUAL_TOKEN_KEY)?.trim().length)
  );
  const [open, setOpen] = useState(false);

  const apply = () => {
    const t = input.trim();
    if (!t) return;
    localStorage.setItem(LOADS_MANUAL_TOKEN_KEY, t);
    setInput('');
    setHasSaved(true);
    onTokenChange();
  };

  const clear = () => {
    localStorage.removeItem(LOADS_MANUAL_TOKEN_KEY);
    setInput('');
    setHasSaved(false);
    onTokenChange();
  };

  const toggle = () => setOpen((v) => !v);

  return (
    <Box
      sx={(theme) => ({
        p: 1.5,
        mb: 2.5,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      })}
    >
      <Box
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="loads-auth-panel"
        id="loads-auth-heading"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          cursor: 'pointer',
          userSelect: 'none',
          borderRadius: 0.75,
          p: 0.5,
          m: -0.5,
          mb: open ? 0.5 : 0,
          outline: 'none',
          '&:hover': { bgcolor: 'action.hover' },
          '&:focus-visible': { boxShadow: (t) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.4)}` },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Loads host authentication
          </Typography>
          {hasSaved && !open && (
            <Chip size="small" label="Token saved" color="success" variant="outlined" sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontSize: 11 } }} />
          )}
        </Box>
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            color: 'text.secondary',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: (t) => t.transitions.create('transform', { duration: t.transitions.duration.shorter }),
          }}
        />
      </Box>
      <Collapse in={open} id="loads-auth-panel" role="region" aria-labelledby="loads-auth-heading">
        <Box sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} useFlexGap>
            <TextField
              size="small"
              fullWidth
              label="Paste token for server health"
              placeholder="Paste JWT, then Apply"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              type="password"
              autoComplete="off"
              name="loads-api-token"
              sx={{ flex: 1, minWidth: 0, maxWidth: { sm: 520 } }}
            />
            <Stack direction="row" spacing={1} flexShrink={0} useFlexGap>
              <Button variant="contained" size="small" onClick={apply} disabled={!input.trim()}>
                Apply
              </Button>
              <Button variant="outlined" size="small" onClick={clear} disabled={!hasSaved}>
                Clear
              </Button>
            </Stack>
          </Stack>
          {hasSaved && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              A token is stored in this browser for the loads API. Clear when you are done.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function ServerHealthSection() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const onLoadsTokenChange = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['server-health-loads-full'] });
  }, [queryClient]);

  const { data, isLoading, isError, error, isFetching, dataUpdatedAt, refetch, isRefetching } = useQuery({
    queryKey: ['server-health-loads-full'],
    queryFn: async () => {
      const res = await getLoadsFull();
      const p = parseLoadsFullResponse(res.data);
      if (!p) throw new Error('Invalid response: expected { data: { … } }');
      return p;
    },
    refetchInterval: 45_000,
    staleTime: 20_000,
  });

  if (isLoading) {
    return (
      <Box sx={{ mb: 3 }}>
        <LoadsTokenRow onTokenChange={onLoadsTokenChange} />
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <ServerTrafficStatusLight state="loading" size={56} />
          <Skeleton variant="circular" width={40} height={40} />
          <div>
            <Skeleton variant="text" width={160} height={32} />
            <Skeleton variant="text" width={280} height={20} />
          </div>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2.5,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} sx={{ ...dashboardPageCardSx, minHeight: 360 }} elevation={0}>
              <CardContent sx={dashboardPageCardContentSx}>
                <Skeleton variant="rounded" height={300} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  if (isError || !data) {
    const message = isAxiosError(error)
      ? [error.message, error.response != null && `HTTP ${error.response.status}`]
          .filter(Boolean)
          .join(' · ')
      : error instanceof Error
        ? error.message
        : 'Failed to load';
    const maybeCors =
      isAxiosError(error) && error.response == null
        ? ' The browser may be blocking the request (CORS). In dev, the Vite proxy at /__loads should avoid that; in production, ensure the API allows your admin origin or set VITE_LOADS_API_BASE_URL to a same-origin proxy.'
        : '';
    return (
      <Box sx={{ mb: 3 }}>
        <LoadsTokenRow onTokenChange={onLoadsTokenChange} />
        <Card
          elevation={0}
          sx={{ ...(dashboardPageCardSx as object) } as SxProps<Theme>}
        >
        <CardContent sx={dashboardPageCardContentSx}>
          <Stack direction="row" alignItems="flex-start" gap={2} sx={{ mb: 1.5 }}>
            <ServerTrafficStatusLight state="down" size={56} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography color="error" fontWeight={700} sx={{ mb: 0.5 }}>
            Server health unavailable
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {message}
            {maybeCors}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Paste a token in the field above and click <strong>Apply</strong>, or set{' '}
            <Box component="code" sx={{ fontSize: '0.85em' }}>VITE_LOADS_API_TOKEN</Box> in{' '}
            <Box component="code" sx={{ fontSize: '0.85em' }}>admin-console/.env.local</Box> and restart{' '}
            <code>npm run dev</code>. Do not commit real tokens.
          </Typography>
          <Button variant="contained" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      </Box>
    );
  }

  const { payload: m, hasPlatform, hasLa } = data;
  const memRatio = m.memory.total > 0 ? m.memory.used / m.memory.total : 0;
  const diskRatio = m.disk.total > 0 ? m.disk.used / m.disk.total : 0;
  const cpuPct = m.cpu.percentage;
  const h = healthChip(cpuPct, memRatio);
  const trafficState = chipColorToTraffic(h.color);
  const { label: upLabel, detail: upDetail } = formatBootDuration(m.platform.uptime);
  const memData = memorySlices(m.memory);
  const diskData = [
    { name: 'Used', value: m.disk.used, key: 'used' },
    { name: 'Free', value: m.disk.free, key: 'free' },
  ];
  const loadData = [
    { name: '1m', value: m.la.load1, fill: CHART_COLORS.load },
    { name: '5m', value: m.la.load5, fill: CHART_COLORS.load },
    { name: '15m', value: m.la.load15, fill: CHART_COLORS.load },
  ];
  const cpuGaugePie = [
    { name: 'Busy', value: Math.min(100, cpuPct) },
    { name: 'Idle', value: Math.max(0, 100 - Math.min(100, cpuPct)) },
  ];
  const processRows = m.cpu.top.map((p, i) => ({
    ...p,
    label: `${i + 1}. ${p.name.length > 20 ? `${p.name.slice(0, 18)}…` : p.name}`,
  }));
  const processMax =
    m.cpu.top.length > 0 ? Math.max(0.01, ...m.cpu.top.map((p) => p.value)) : 1;

  const rechartsText = theme.palette.text.primary;
  const rechartsMuted = theme.palette.text.secondary;
  const gridLine = theme.palette.divider;
  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    color: rechartsText,
    fontSize: 12,
  };

  return (
    <Box sx={{ mb: 3 }}>
      <LoadsTokenRow onTokenChange={onLoadsTokenChange} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" useFlexGap>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <ServerTrafficStatusLight state={trafficState} size={56} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              <DnsOutlinedIcon fontSize="small" />
            </Box>
            <div>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                Server health
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontWeight: 500, opacity: 1, lineHeight: 1.4 }}
              >
                Sample {m.created_at}
                {m.valid_till ? ` · Valid to ${m.valid_till}` : ''}
                {dataUpdatedAt
                  ? ` · Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`
                  : null}
              </Typography>
            </div>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap>
            {isFetching && (
              <LinearProgress sx={{ width: 100, height: 4, borderRadius: 1 }} color="primary" />
            )}
            <Chip size="small" label={h.label} color={h.color} variant="outlined" sx={{ fontWeight: 600 }} />
            <Chip
              size="small"
              label={isRefetching ? 'Refreshing' : 'Live'}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2.5,
          alignItems: 'stretch',
        }}
      >
        {/* Row 1: Memory, Disk, CPU — equal columns */}
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5, minHeight: 40 }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <MemoryIcon color="primary" fontSize="small" sx={{ opacity: 0.95 }} />
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  Memory
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ opacity: 0.85 }}>
                {formatBytes(m.memory.total)}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 500 }}>
              {(memRatio * 100).toFixed(1)}% in use
            </Typography>
            <Box sx={CHART_BOX}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius="42%"
                    outerRadius="68%"
                    paddingAngle={2}
                    labelLine={false}
                  >
                    {memData.map((e) => (
                      <Cell key={e.key} fill={memColors(e.key)} stroke={theme.palette.background.paper} strokeWidth={1} />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [formatBytes(Number(v)), '']}
                    labelStyle={{ color: rechartsText, fontWeight: 600 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ color: rechartsText, fontSize: 12, fontWeight: 500, paddingTop: 4 }}
                    formatter={(v) => <span style={{ color: rechartsText }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5, minHeight: 40 }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <StorageIcon color="primary" fontSize="small" sx={{ opacity: 0.95 }} />
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  Disk
                </Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ opacity: 0.85 }}>
                {formatBytes(m.disk.total)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={diskRatio * 100}
              sx={{
                height: 10,
                borderRadius: 1,
                mb: 1.5,
                bgcolor: alpha(theme.palette.text.primary, 0.08),
                '& .MuiLinearProgress-bar': { borderRadius: 1, bgcolor: CHART_COLORS.diskUsed },
              }}
            />
            <Box sx={CHART_BOX}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius="42%"
                    outerRadius="68%"
                    paddingAngle={2}
                    labelLine={false}
                  >
                    <Cell fill={CHART_COLORS.diskUsed} stroke={theme.palette.background.paper} strokeWidth={1} />
                    <Cell fill={CHART_COLORS.diskFree} stroke={theme.palette.background.paper} strokeWidth={1} />
                  </Pie>
                  <ReTooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [formatBytes(Number(v)), '']}
                    labelStyle={{ color: rechartsText, fontWeight: 600 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ color: rechartsText, fontSize: 12, fontWeight: 500, paddingTop: 4 }}
                    formatter={(v) => <span style={{ color: rechartsText }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.5, textAlign: 'center', fontWeight: 500 }}
            >
              {(diskRatio * 100).toFixed(1)}% used · {formatBytes(m.disk.free)} free
            </Typography>
          </CardContent>
        </Card>

        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1, minHeight: 40 }}>
              <SpeedIcon color="primary" fontSize="small" sx={{ opacity: 0.95 }} />
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                CPU
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              component="p"
              sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 0.75 }}
            >
              Processor
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                fontWeight: 600,
                lineHeight: 1.5,
                mb: 1.5,
                minHeight: '4.5em',
              }}
            >
              {m.cpu.model}
            </Typography>
            <Box sx={{ flex: 1, minHeight: 168, position: 'relative' }}>
              <Box sx={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cpuGaugePie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius="70%"
                      outerRadius="100%"
                      stroke="none"
                    >
                      <Cell fill={CHART_COLORS.cpuBusy} />
                      <Cell fill={CHART_COLORS.cpuTrack} />
                    </Pie>
                    <ReTooltip
                      contentStyle={tooltipStyle}
                      formatter={(v) => [`${Number(v).toFixed(1)}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack alignItems="center" sx={{ mt: -1.5 }} spacing={0.25}>
                <Typography
                  component="p"
                  variant="h4"
                  fontWeight={800}
                  color="primary"
                  sx={{ lineHeight: 1, letterSpacing: '-0.02em' }}
                >
                  {cpuPct.toFixed(1)}%
                </Typography>
                <Typography
                  component="p"
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  textAlign="center"
                >
                  {hasPlatform && m.platform.num_proc > 0
                    ? `${m.platform.num_proc} hardware threads`
                    : `Kernel count ${m.cpu.kernel_count}`}
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Row 2: Load, Top processes, Platform — same 3 equal columns on lg */}
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 1.5, minHeight: 40, display: 'flex', alignItems: 'center' }}>
              Load average
            </Typography>
            {hasLa ? (
              <Box sx={CHART_BOX}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loadData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridLine} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: rechartsText, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals
                      width={36}
                      tick={{ fontSize: 11, fill: rechartsMuted, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReTooltip
                      contentStyle={tooltipStyle}
                      formatter={(v) => [Number(v).toFixed(2), '']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {loadData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ py: 2 }}>
                Not included in this API response.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 1, minHeight: 40, display: 'flex', alignItems: 'center' }}>
              Top CPU processes
            </Typography>
            {processRows.length === 0 ? (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                No process list in this response.
              </Typography>
            ) : (
              <Box sx={{ ...CHART_BOX, minHeight: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processRows}
                    layout="vertical"
                    margin={{ top: 2, right: 18, left: 4, bottom: 2 }}
                    barSize={16}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridLine} />
                    <XAxis
                      type="number"
                      domain={[0, processMax * 1.2]}
                      tick={{ fontSize: 10, fill: rechartsMuted, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(t) => `${Number(t).toFixed(1)}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={132}
                      tick={{ fontSize: 10, fill: rechartsText, fontWeight: 500 }}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReTooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(_, p) => {
                        if (p && p[0] && 'payload' in p[0] && p[0].payload) {
                          return (p[0].payload as { name: string }).name;
                        }
                        return '';
                      }}
                      formatter={(v) => [`${Number(v).toFixed(2)}%`, 'CPU']}
                    />
                    <Bar dataKey="value" fill={CHART_COLORS.processBar} radius={[0, 4, 4, 0]}>
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(v) => `${Number(v).toFixed(1)}%`}
                        style={{ fontSize: 10, fontWeight: 600, fill: rechartsText }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 1.5, minHeight: 40, display: 'flex', alignItems: 'center' }}>
              Platform
            </Typography>
            {hasPlatform ? (
              <Stack spacing={2} sx={{ flex: 1, justifyContent: 'center' }}>
                <Box>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary', mb: 0.5 }}
                  >
                    Operating system
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.4 }}>
                    {[m.platform.platforminfo, m.platform.version].filter(Boolean).join(' ') || '—'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary', mb: 0.5 }}
                  >
                    Uptime
                  </Typography>
                  <Tooltip title={upDetail || 'From server-reported boot time'}>
                    <Typography
                      component="p"
                      variant="body1"
                      fontWeight={600}
                      color="text.primary"
                      sx={{ cursor: 'default', lineHeight: 1.4 }}
                    >
                      {upLabel}
                    </Typography>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    mt: 0.5,
                    pt: 1.5,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary', mb: 0.5 }}
                  >
                    CPU name
                  </Typography>
                  <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ lineHeight: 1.5 }}>
                    {m.cpu.model}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Not included in this API response.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
