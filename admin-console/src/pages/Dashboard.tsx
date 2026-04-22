import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RifleIcon from '@mui/icons-material/GpsFixed';
import CategoryIcon from '@mui/icons-material/Category';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import {
  getUsersLight,
  getRiflesLight,
  getBulletsLight,
  getFcmTokensLight,
  getDashboardPie,
} from '../api/api';
import AnalyticOverview from '../components/AnalyticOverview';
import ServerHealthSection from '../components/ServerHealthSection';
import { dashboardPageCardContentSx, dashboardPageCardSx } from '../styles/dashboardPageCard';
import type { AdminUserLight, AdminBulletLight, AdminLightItem } from '../types';

export type TimeRangeFilter = '7d' | 'year' | 'month' | 'lifetime';

/** Curated pie slices — softer than raw success/error, works in light & dark. */
function getDashboardPieChartColors(theme: Theme) {
  const dark = theme.palette.mode === 'dark';
  const p = theme.palette;
  if (dark) {
    return {
      active: '#3ED9BE',
      deleted: '#FF9AAC',
      withRifle: p.primary.light,
      noRifle: alpha(p.text.secondary, 0.75),
      attached: '#5DD3F0',
      notAttached: '#C9A7FF',
    };
  }
  return {
    active: '#0B9D84',
    deleted: '#D4637A',
    withRifle: p.primary.main,
    noRifle: alpha(p.text.secondary, 0.55),
    attached: '#0A85A8',
    notAttached: '#7C6CF0',
  };
}

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2024; // first registration year
const YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 3 },
  (_, i) => START_YEAR + i
); // 2024..current+2
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

/** Parse createdAt from backend (string, ISO, epoch ms, or [y,m,d,...] array) to a valid Date */
function parseCreatedAt(value: string | number | number[] | undefined): Date | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d] = value;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? null : date;
  }
  const s = String(value).trim();
  if (!s || s === '[object Object]') return null;
  // Normalize "YYYY-MM-DD HH:mm:ss.ffffff" to ISO "YYYY-MM-DDTHH:mm:ss.fff" for reliable parsing
  const space = s.indexOf(' ');
  let iso = s;
  if (space > 0) {
    iso = s.slice(0, space) + 'T' + s.slice(space + 1);
  }
  const fracMatch = iso.match(/(\.\d{3})\d*/);
  if (fracMatch) iso = iso.replace(/(\.\d{3})\d*/, fracMatch[1]);
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** Get created date from item (backend may send createdAt or created) */
function getItemCreatedDate(item: { createdAt?: string | number | number[]; created?: string | number | number[] }): Date | null {
  const raw = item.createdAt ?? item.created;
  return parseCreatedAt(raw);
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function dayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ChartPoint {
  key: string;
  label: string;
  count: number;
  cumulative?: number;
}

function aggregateForChart<T extends { createdAt?: string | number | number[]; created?: string | number | number[] }>(
  items: T[],
  filter: TimeRangeFilter,
  selectedYear: number,
  selectedMonth: number
): ChartPoint[] {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if (filter === '7d') {
    const byDay = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      byDay.set(dayKey(d), 0);
    }
    for (const item of items) {
      const d = getItemCreatedDate(item);
      if (!d || d < sevenDaysAgo) continue;
      const key = dayKey(d);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, count]) => ({ key, label: dayLabel(key), count }));
  }

  if (filter === 'year') {
    const byMonth = new Map<string, number>();
    for (let m = 1; m <= 12; m++) {
      const key = `${selectedYear}-${String(m).padStart(2, '0')}`;
      byMonth.set(key, 0);
    }
    for (const item of items) {
      const d = getItemCreatedDate(item);
      if (!d || d.getFullYear() !== selectedYear) continue;
      const key = monthKey(d);
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    let cumulative = 0;
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => {
        cumulative += count;
        return {
          key: month,
          label: monthLabel(month),
          count,
          cumulative,
        };
      });
  }

  if (filter === 'month') {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const byDay = new Map<string, number>();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(selectedYear, selectedMonth - 1, d);
      byDay.set(dayKey(date), 0);
    }
    for (const item of items) {
      const d = getItemCreatedDate(item);
      if (!d || d.getFullYear() !== selectedYear || d.getMonth() !== selectedMonth - 1) continue;
      const key = dayKey(d);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, count]) => ({ key, label: dayLabel(key), count }));
  }

  if (filter === 'lifetime') {
    const byMonth = new Map<string, number>();
    for (const item of items) {
      const d = getItemCreatedDate(item);
      if (!d) continue;
      const key = monthKey(d);
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    const sorted = Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    let cumulative = 0;
    return sorted.map(([month, count]) => {
      cumulative += count;
      return {
        key: month,
        label: monthLabel(month),
        count,
        cumulative,
      };
    });
  }

  return [];
}

/** Shared line chart for user registration and rifle creation (same UX). */
function ProgressLineChart<T extends { createdAt?: string | number | number[]; created?: string | number | number[] }>({
  items,
  filter,
  selectedYear,
  selectedMonth,
  totalLabel,
  countLineName,
  emptyMessage,
}: {
  items: T[];
  filter: TimeRangeFilter;
  selectedYear: number;
  selectedMonth: number;
  totalLabel: string;
  countLineName: string;
  emptyMessage: string;
}) {
  const chartData = aggregateForChart(items, filter, selectedYear, selectedMonth);

  if (chartData.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 280 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {totalLabel}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickMargin={8}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickMargin={8} />
          <Tooltip
            formatter={(value: number | undefined) => [value ?? 0, 'Count']}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name={countLineName}
            stroke="var(--mui-palette-primary-main, #1976d2)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

function UserRegistrationProgress({
  filter,
  selectedYear,
  selectedMonth,
}: {
  filter: TimeRangeFilter;
  selectedYear: number;
  selectedMonth: number;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-users-light'],
    queryFn: async () => {
      const res = await getUsersLight();
      const body = res.data;
      return {
        items: body?.items ?? [],
        totalItems: body?.totalUsers ?? 0,
      };
    },
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={120} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Typography color="error" variant="body2">
        Failed to load user data.
      </Typography>
    );
  }

  const items: AdminUserLight[] = data?.items ?? [];
  const totalUsers = data?.totalItems ?? 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PeopleIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          User registration progress
        </Typography>
      </Box>
      <ProgressLineChart
        items={items}
        filter={filter}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        totalLabel={`Total users: ${totalUsers}`}
        countLineName="Registrations"
        emptyMessage="No registration data for the selected period."
      />
    </Box>
  );
}

function RifleCreationProgress({
  filter,
  selectedYear,
  selectedMonth,
}: {
  filter: TimeRangeFilter;
  selectedYear: number;
  selectedMonth: number;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-rifles-light'],
    queryFn: async () => {
      const res = await getRiflesLight();
      const body = res.data;
      return {
        items: body?.items ?? [],
        totalItems: body?.totalRifles ?? 0,
      };
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={140} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <RifleIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Rifle creation progress
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Rifle list is not available. Ensure the backend exposes GET /admin/api/rifles/light.
        </Typography>
      </Box>
    );
  }

  const items: AdminLightItem[] = data?.items ?? [];
  const totalRifles = data?.totalItems ?? 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <RifleIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Rifle creation progress
        </Typography>
      </Box>
      <ProgressLineChart
        items={items}
        filter={filter}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        totalLabel={`Total rifles: ${totalRifles}`}
        countLineName="Created"
        emptyMessage="No rifle creation data for the selected period."
      />
    </Box>
  );
}

function BulletCreationProgress({
  filter,
  selectedYear,
  selectedMonth,
}: {
  filter: TimeRangeFilter;
  selectedYear: number;
  selectedMonth: number;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-bullets-light'],
    queryFn: async () => {
      const res = await getBulletsLight();
      const body = res.data;
      return {
        items: body?.items ?? [],
        totalItems: body?.totalBullets ?? 0,
      };
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={140} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CategoryIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bullet creation progress
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Bullet list is not available. Ensure the backend exposes GET /admin/api/bullets/light.
        </Typography>
      </Box>
    );
  }

  const items: AdminBulletLight[] = data?.items ?? [];
  const totalBullets = data?.totalItems ?? 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CategoryIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bullet creation progress
        </Typography>
      </Box>
      <ProgressLineChart
        items={items}
        filter={filter}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        totalLabel={`Total bullets: ${totalBullets}`}
        countLineName="Created"
        emptyMessage="No bullet creation data for the selected period."
      />
    </Box>
  );
}

/** Recharts `ResponsiveContainer` needs a parent with a definite height — percentage height alone collapses in flex. */
const DASH_PIE_CHART_HEIGHT_PX = 232;

function PieChartCard({
  title,
  icon,
  data,
  colors,
  rightStat,
  detail,
}: {
  title: string;
  icon: React.ReactNode;
  data: Array<{ name: string; value: number }>;
  colors: string[];
  /** Shown in the header row, e.g. "12,500 total" */
  rightStat?: string;
  /** Shown under the title, e.g. "68% with a rifle" */
  detail?: string;
}) {
  const theme = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);
  const rechartsText = theme.palette.text.primary;
  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    color: rechartsText,
    fontSize: 12,
  };
  return (
    <Box>
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="flex-start"
        justifyContent="space-between"
        rowGap={0.5}
        columnGap={1}
        sx={{ mb: detail ? 0.5 : 1, minHeight: 40 }}
      >
        <Stack direction="row" alignItems="flex-start" gap={1} sx={{ minWidth: 0, flex: '1 1 140px' }}>
          <Box
            sx={{
              display: 'flex',
              color: 'primary.main',
              opacity: 0.95,
              mt: 0.25,
              flexShrink: 0,
              '& .MuiSvgIcon-root': { fontSize: 20 },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="text.primary"
            sx={{ lineHeight: 1.3, minWidth: 0, wordBreak: 'break-word' }}
          >
            {title}
          </Typography>
        </Stack>
        {rightStat != null && rightStat !== '' && (
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.primary"
            sx={{ opacity: 0.85, flexShrink: 0, fontFeatureSettings: '"tnum"', whiteSpace: 'nowrap' }}
          >
            {rightStat}
          </Typography>
        )}
      </Stack>
      {detail != null && detail !== '' && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500, lineHeight: 1.4 }}>
          {detail}
        </Typography>
      )}
      {total === 0 ? (
        <Box
          sx={{
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            typography: 'body2',
            fontWeight: 500,
          }}
        >
          No data
        </Box>
      ) : (
        <Box
          sx={{
            width: 1,
            height: DASH_PIE_CHART_HEIGHT_PX,
            minHeight: DASH_PIE_CHART_HEIGHT_PX,
            position: 'relative',
          }}
        >
          <ResponsiveContainer width="100%" height={DASH_PIE_CHART_HEIGHT_PX} debounce={50}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius="42%"
                outerRadius="68%"
                paddingAngle={2}
                labelLine={false}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={colors[i % colors.length]}
                    stroke={theme.palette.background.paper}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: rechartsText, fontWeight: 600 }}
                formatter={(value) => {
                  const n = Number(value);
                  const p = total > 0 ? ((n / total) * 100).toFixed(1) : '0';
                  return [`${n} (${p}%)`, 'Count'];
                }}
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
      )}
    </Box>
  );
}

/** Reusable chart card for light endpoints (fcm tokens). */
function LightChartCard({
  title,
  icon,
  queryKey,
  fetchFn,
  totalLabelKey,
  filter,
  selectedYear,
  selectedMonth,
  countLineName,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  queryKey: string;
  fetchFn: () => Promise<{ data?: unknown }>;
  totalLabelKey: string;
  filter: TimeRangeFilter;
  selectedYear: number;
  selectedMonth: number;
  countLineName: string;
  emptyMessage: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetchFn();
      const body = res.data as Record<string, unknown> | undefined;
      const total = body && typeof body[totalLabelKey] === 'number' ? (body[totalLabelKey] as number) : 0;
      const items = (body?.items as AdminLightItem[] | undefined) ?? [];
      return { items, totalItems: total };
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={140} height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">Data not available.</Typography>
      </Box>
    );
  }

  const items: AdminLightItem[] = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
      </Box>
      <ProgressLineChart
        items={items}
        filter={filter}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        totalLabel={`Total: ${total}`}
        countLineName={countLineName}
        emptyMessage={emptyMessage}
      />
    </Box>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState<TimeRangeFilter>('7d');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const handleFilterChange = (event: SelectChangeEvent<TimeRangeFilter>) => {
    setFilter(event.target.value as TimeRangeFilter);
  };

  return (
    <Box>
      <AnalyticOverview />
      <ServerHealthSection />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          User registration and creation progress
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="dashboard-time-range">Time range</InputLabel>
            <Select
              labelId="dashboard-time-range"
              value={filter}
              label="Time range"
              onChange={handleFilterChange}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="year">Year</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="lifetime">Lifetime</MenuItem>
            </Select>
          </FormControl>
          {filter === 'year' && (
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="dashboard-year">Year</InputLabel>
              <Select
                labelId="dashboard-year"
                value={String(selectedYear)}
                label="Year"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {filter === 'month' && (
            <>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="dashboard-month-year">Year</InputLabel>
                <Select
                  labelId="dashboard-month-year"
                  value={String(selectedYear)}
                  label="Year"
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {YEARS.map((y) => (
                    <MenuItem key={y} value={String(y)}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="dashboard-month">Month</InputLabel>
                <Select
                  labelId="dashboard-month"
                  value={String(selectedMonth)}
                  label="Month"
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <UserRegistrationProgress
              filter={filter}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </CardContent>
        </Card>
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <RifleCreationProgress
              filter={filter}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </CardContent>
        </Card>
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <BulletCreationProgress
              filter={filter}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          </CardContent>
        </Card>
        <Card sx={dashboardPageCardSx} elevation={0}>
          <CardContent sx={dashboardPageCardContentSx}>
            <LightChartCard
              title="FCM tokens (devices)"
              icon={<SmartphoneIcon color="primary" />}
              queryKey="dashboard-fcm-tokens-light"
              fetchFn={getFcmTokensLight}
              totalLabelKey="totalFcmTokens"
              filter={filter}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              countLineName="Registered"
              emptyMessage="No FCM tokens for the selected period."
            />
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Pie charts</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        <DashboardPieCharts />
      </Box>
    </Box>
  );
}

function DashboardPieCharts() {
  const theme = useTheme();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-pie'],
    queryFn: async () => {
      const res = await getDashboardPie();
      return res.data;
    },
  });
  const c = getDashboardPieChartColors(theme);
  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} sx={dashboardPageCardSx} elevation={0}>
            <CardContent sx={dashboardPageCardContentSx}>
              <Skeleton variant="rectangular" height={280} />
            </CardContent>
          </Card>
        ))}
      </>
    );
  }
  if (error || !data) {
    return (
      <Card
        elevation={0}
        sx={
          { ...(dashboardPageCardSx as object), gridColumn: '1 / -1' } as SxProps<Theme>
        }
      >
        <CardContent sx={dashboardPageCardContentSx}>
          <Typography color="error">Failed to load pie chart data.</Typography>
        </CardContent>
      </Card>
    );
  }
  const riflesTotal = data.rifles.active + data.rifles.deleted;
  const bulletsTotal = data.bullets.active + data.bullets.deleted;
  const riflesData = [
    { name: 'Active', value: data.rifles.active },
    { name: 'Deleted', value: data.rifles.deleted },
  ];
  const bulletsData = [
    { name: 'Active', value: data.bullets.active },
    { name: 'Deleted', value: data.bullets.deleted },
  ];
  const usersRifleData = [
    { name: 'With rifle', value: data.usersWithRifle.usersWithRifle },
    { name: 'Without rifle', value: data.usersWithRifle.usersWithoutRifle },
  ];
  const bulletsAttachedData = [
    { name: 'Attached to rifle', value: data.bulletsAttached.attachedToRifle },
    { name: 'Not attached', value: data.bulletsAttached.notAttached },
  ];
  return (
    <>
      <Card sx={dashboardPageCardSx} elevation={0}>
        <CardContent sx={dashboardPageCardContentSx}>
          <PieChartCard
            title="Rifles: active vs deleted"
            icon={<RifleIcon color="primary" />}
            data={riflesData}
            colors={[c.active, c.deleted]}
            rightStat={riflesTotal > 0 ? `${riflesTotal.toLocaleString('en-US')} total` : undefined}
            detail={
              riflesTotal > 0
                ? `${((data.rifles.active / riflesTotal) * 100).toFixed(1)}% active`
                : undefined
            }
          />
        </CardContent>
      </Card>
      <Card sx={dashboardPageCardSx} elevation={0}>
        <CardContent sx={dashboardPageCardContentSx}>
          <PieChartCard
            title="Bullets: active vs deleted"
            icon={<CategoryIcon color="primary" />}
            data={bulletsData}
            colors={[c.active, c.deleted]}
            rightStat={bulletsTotal > 0 ? `${bulletsTotal.toLocaleString('en-US')} total` : undefined}
            detail={
              bulletsTotal > 0
                ? `${((data.bullets.active / bulletsTotal) * 100).toFixed(1)}% active`
                : undefined
            }
          />
        </CardContent>
      </Card>
      <Card sx={dashboardPageCardSx} elevation={0}>
        <CardContent sx={dashboardPageCardContentSx}>
          <PieChartCard
            title="Users: with rifle %"
            icon={<PeopleIcon color="primary" />}
            data={usersRifleData}
            colors={[c.withRifle, c.noRifle]}
            rightStat={
              data.usersWithRifle.totalUsers > 0
                ? `${data.usersWithRifle.totalUsers.toLocaleString('en-US')} users`
                : undefined
            }
            detail={
              data.usersWithRifle.totalUsers > 0
                ? `${((data.usersWithRifle.usersWithRifle / data.usersWithRifle.totalUsers) * 100).toFixed(1)}% with a registered rifle`
                : undefined
            }
          />
        </CardContent>
      </Card>
      <Card sx={dashboardPageCardSx} elevation={0}>
        <CardContent sx={dashboardPageCardContentSx}>
          <PieChartCard
            title="Bullets: attached to rifle %"
            icon={<CategoryIcon color="primary" />}
            data={bulletsAttachedData}
            colors={[c.attached, c.notAttached]}
            rightStat={
              data.bulletsAttached.totalBullets > 0
                ? `${data.bulletsAttached.totalBullets.toLocaleString('en-US')} bullets`
                : undefined
            }
            detail={
              data.bulletsAttached.totalBullets > 0
                ? `${((data.bulletsAttached.attachedToRifle / data.bulletsAttached.totalBullets) * 100).toFixed(1)}% attached to a rifle`
                : undefined
            }
          />
        </CardContent>
      </Card>
    </>
  );
}
