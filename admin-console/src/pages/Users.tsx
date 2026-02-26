import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getUsers } from '../api/api';
import type { AdminUser } from '../types';
import SendNotificationModal from '../components/SendNotificationModal';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const SORT_OPTIONS = [
  { value: 'id', label: 'ID' },
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created' },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Users() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [startsWith, setStartsWith] = useState<string>('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [notificationUser, setNotificationUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, size, sortBy, sortDir, startsWith || undefined, debouncedQ || undefined],
    queryFn: async () => {
      const res = await getUsers({
        page,
        size,
        sortBy,
        sortDir,
        startsWith: startsWith || undefined,
        q: debouncedQ || undefined,
      });
      return res.data;
    },
  });

  const displayName = (u: AdminUser) => {
    const n = [u.name, u.surname].filter(Boolean).join(' ');
    return n || u.emailAddress || `User ${u.id}`;
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage and view all registered users"
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by name, email, or username..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onBlur={() => setDebouncedQ(q)}
              sx={{ minWidth: 280, flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>A–Z</InputLabel>
              <Select
                value={startsWith || ''}
                label="A–Z"
                onChange={(e) => setStartsWith(e.target.value as string)}
              >
                <MenuItem value="">All</MenuItem>
                {LETTERS.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title={sortDir === 'asc' ? 'Ascending' : 'Descending'}>
              <IconButton
                size="small"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  width: 36,
                  height: 36,
                }}
              >
                {sortDir === 'asc' ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            {startsWith && (
              <Chip
                label={`Starts with: ${startsWith}`}
                onDelete={() => setStartsWith('')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {debouncedQ && (
              <Chip
                label={`Search: "${debouncedQ}"`}
                onDelete={() => { setQ(''); setDebouncedQ(''); }}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={30} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={160} /></TableCell>
                    <TableCell><Skeleton width={40} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="right"><Skeleton width={32} sx={{ ml: 'auto' }} /></TableCell>
                  </TableRow>
                ))}
              {data && !isLoading && data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ border: 0 }}>
                    <EmptyState
                      title="No users found"
                      subtitle="Try adjusting your search or filter criteria."
                    />
                  </TableCell>
                </TableRow>
              )}
              {data && !isLoading &&
                data.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {u.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {displayName(u)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {u.emailAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {u.locale ? (
                        <Chip label={u.locale} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(u.roles || []).length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {u.roles!.map((r) => (
                            <Chip
                              key={r}
                              label={r.replace('ROLE_', '')}
                              size="small"
                              sx={{
                                fontSize: '0.6875rem',
                                height: 22,
                                bgcolor: 'primary.main',
                                color: '#fff',
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Send notification">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setNotificationUser(u)}
                          aria-label="Send notification"
                        >
                          <NotificationsActiveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {data && !isLoading && data.items.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              px: 2,
              py: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {data.totalItems} total users
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 65 }}>
                <Select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  sx={{ fontSize: '0.8125rem' }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ color: 'text.secondary', mx: 1 }}>
                Page {data.page} of {data.totalPages}
              </Typography>
              <IconButton
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton
                size="small"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <NavigateNextIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Card>

      <SendNotificationModal
        open={!!notificationUser}
        onClose={() => setNotificationUser(null)}
        userId={notificationUser?.id}
        userName={notificationUser ? [notificationUser.name, notificationUser.surname].filter(Boolean).join(' ') || notificationUser.emailAddress : ''}
      />
    </Box>
  );
}
