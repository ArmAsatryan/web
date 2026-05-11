import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Link from '@mui/material/Link';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import PaidIcon from '@mui/icons-material/Paid';
import { getAdaptySummary } from '../api/api';
import { dashboardPageCardContentSx, dashboardPageCardSx } from '../styles/dashboardPageCard';

function formatCurrency(n: number | null, unit: string | null): string {
  if (n == null) return '—';
  const code = unit && /^[A-Z]{3}$/.test(unit) ? unit : 'USD';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: n >= 100 ? 0 : 2,
    }).format(n);
  } catch {
    return `${unit ?? ''} ${n.toLocaleString('en-US')}`.trim();
  }
}

function formatCount(n: number | null): string {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}

function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, fontFeatureSettings: '"tnum"' }}>
        {value}
      </Typography>
      {sub != null && sub !== '' && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

export default function AdaptyPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adapty-summary'],
    queryFn: async () => {
      const res = await getAdaptySummary();
      const payload = res.data;
      if (res.status === 502 || res.status === 503) {
        if (payload && typeof payload === 'object' && 'ok' in payload && (payload as { ok: boolean }).ok === false) {
          return payload;
        }
      }
      if (!payload) {
        throw new Error('Empty Adapty response');
      }
      return payload;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={280} height={36} sx={{ mb: 2 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ flex: '1 1 200px', borderRadius: 1 }} />
          ))}
        </Stack>
      </Box>
    );
  }

  if (error) {
    const extra =
      isAxiosError(error) && error.response?.status === 404
        ? ' (404 — production API may not expose this route yet; use local Express + VITE_ADAPTY_API_BASE_URL.)'
        : isAxiosError(error) && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')
          ? ' (Network — often CORS or wrong host; restart API after pulling latest, and confirm VITE_ADAPTY_API_BASE_URL=http://localhost:3000 for local dev.)'
          : isAxiosError(error) && error.message
            ? ` (${error.message})`
            : '';
    return (
      <Alert severity="error">
        Could not load Adapty data. Ensure the API implements{' '}
        <Box component="code" sx={{ fontSize: '0.85em' }}>GET /admin/api/adapty/summary</Box> or set{' '}
        <Box component="code" sx={{ fontSize: '0.85em' }}>VITE_ADAPTY_API_BASE_URL</Box> to a server with{' '}
        <Box component="code" sx={{ fontSize: '0.85em' }}>ADAPTY_SECRET_API_KEY</Box>.{extra}
      </Alert>
    );
  }

  if (!data) {
    return <Alert severity="warning">No response from Adapty summary endpoint.</Alert>;
  }

  if (!data.ok) {
    const isCfg = data.error === 'not_configured';
    return (
      <Alert severity={isCfg ? 'info' : 'error'}>
        {isCfg
          ? data.detail ?? 'Adapty is not configured on the API server.'
          : data.detail ?? data.error}
      </Alert>
    );
  }

  const { metrics, dateFrom, dateTo, timezone, revenueByDay } = data;
  const chartPoints = revenueByDay.map((row) => ({
    ...row,
    label: row.date,
  }));

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <PaidIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Adapty subscriptions
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Range: {dateFrom} → {dateTo} ({timezone}). Source:{' '}
        <Link href="https://docs.adapty.io/docs/export-analytics-api-authorization" target="_blank" rel="noopener noreferrer">
          Adapty Export Analytics API
        </Link>
        . Open the{' '}
        <Link href="https://app.adapty.io/" target="_blank" rel="noopener noreferrer">
          Adapty dashboard
        </Link>
        {' '}for full reports.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <StatBlock
              label="MRR"
              value={formatCurrency(metrics.mrr, metrics.mrrUnit)}
            />
          </CardContent>
        </Card>
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <StatBlock
              label="ARR"
              value={formatCurrency(metrics.arr, metrics.arrUnit)}
            />
          </CardContent>
        </Card>
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <StatBlock
              label="Active subscriptions"
              value={formatCount(metrics.subscriptionsActive)}
            />
          </CardContent>
        </Card>
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <StatBlock
              label="Active trials"
              value={formatCount(metrics.trialsActive)}
            />
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <StatBlock
              label={`Revenue (${dateFrom} → ${dateTo})`}
              value={formatCurrency(metrics.revenueInPeriod, metrics.revenueUnit)}
              sub="Total gross revenue in period (before store fee; per Adapty definition)."
            />
            {chartPoints.length > 0 && (
              <Box sx={{ width: '100%', height: 280, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickMargin={8} />
                    <YAxis tick={{ fontSize: 10 }} tickMargin={8} />
                    <Tooltip
                      formatter={(v) => [
                        formatCurrency(typeof v === 'number' ? v : null, metrics.revenueUnit),
                        'Revenue',
                      ]}
                      labelFormatter={(l) => String(l)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Daily revenue"
                      stroke="var(--mui-palette-primary-main, #1976d2)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <StatBlock
              label="Billing issues"
              value={formatCount(metrics.billingIssues)}
              sub="Profiles in billing retry / issue state over the selected period (Adapty metric)."
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
