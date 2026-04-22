import {
  alpha,
  Box,
  Card,
  IconButton,
  keyframes,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQuery } from '@tanstack/react-query';
import { getUsersForDashboardMaxId } from '../api/api';

const OVERVIEW_QUERY_KEY = 'dashboard-analytic-total-users';
const kfRefreshSpin = keyframes`
  to { transform: rotate(360deg); }
`;

/**
 * Top-of-dashboard total users. Value = `id` of the first record from
 * GET /admin/api/users?page=1&size=20&sortBy=id&sortDir=desc (highest id).
 * Scrolls with the main content area (see Layout main overflow).
 */
export default function AnalyticOverview() {
  const theme = useTheme();
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: [OVERVIEW_QUERY_KEY],
    queryFn: async () => {
      const res = await getUsersForDashboardMaxId();
      return res.data;
    },
    staleTime: 60_000,
  });

  const count = data?.items?.[0]?.id;
  const hasCount = count != null && Number.isFinite(count);
  const display = hasCount
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(count as number)
    : isError
      ? '—'
      : '0';

  const isDark = theme.palette.mode === 'dark';
  const gradStart = isDark
    ? alpha(theme.palette.primary.main, 0.22)
    : alpha(theme.palette.primary.main, 0.14);
  const gradEnd = isDark
    ? alpha(theme.palette.background.default, 0.4)
    : alpha('#fff', 0.95);
  const accent = theme.palette.primary.main;

  return (
    <Box sx={{ mb: 3 }}>
      <Card
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          background: `linear-gradient(125deg, ${gradStart} 0%, ${gradEnd} 45%, ${alpha(
            theme.palette.background.paper,
            0.9
          )} 100%)`,
          boxShadow: isDark
            ? `0 20px 40px ${alpha('#000', 0.35)}, inset 0 1px 0 ${alpha('#fff', 0.04)}`
            : `0 16px 40px ${alpha(theme.palette.primary.main, 0.1)}, 0 2px 8px ${alpha(
                theme.palette.common.black,
                0.06
              )}`,
        }}
      >
        {/* decorative orbs */}
        <Box
          aria-hidden
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            right: -40,
            top: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(accent, 0.2)} 0%, transparent 70%)`,
          }}
        />
        <Box
          aria-hidden
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            left: '18%',
            bottom: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(accent, 0.12)} 0%, transparent 68%)`,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr auto' },
            alignItems: 'center',
            gap: { xs: 2, sm: 3, md: 4 },
            p: { xs: 2.5, sm: 3, md: 3.5 },
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(145deg, ${alpha(accent, 0.25)}, ${alpha(accent, 0.05)})`,
              border: `1px solid ${alpha(accent, 0.2)}`,
              boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.1)}`,
            }}
          >
            <PeopleOutlineIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.95 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 0.12,
                fontWeight: 700,
                color: 'text.secondary',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Analytic overview
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: -0.4,
                lineHeight: 1.2,
                color: 'text.primary',
              }}
            >
              Total registered users
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 480 }}>
              Live total from the highest user id (same metric as the users list sorted by id descending).
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: { xs: 'left', sm: 'right' },
              alignSelf: { xs: 'stretch', sm: 'center' },
            }}
          >
            {isLoading ? (
              <Skeleton
                variant="rounded"
                width={200}
                height={72}
                sx={{ borderRadius: 2, maxWidth: '100%' }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                  gap: 1.5,
                }}
              >
                <Typography
                  component="span"
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1,
                    fontSize: { xs: '2.4rem', sm: '2.85rem' },
                    fontFeatureSettings: '"tnum"',
                    color: isError ? 'error.main' : 'primary.main',
                    textShadow: isDark
                      ? `0 0 32px ${alpha(accent, 0.25)}`
                      : `0 2px 16px ${alpha(accent, 0.2)}`,
                  }}
                >
                  {display}
                </Typography>
                <Tooltip title="Refresh count">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => void refetch()}
                      disabled={isFetching}
                      sx={{
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                        '& .MuiSvgIcon-root': isFetching
                          ? { animation: `${kfRefreshSpin} 0.85s linear infinite` }
                          : undefined,
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
            {isError && (
              <Typography variant="caption" color="error" display="block" sx={{ mt: 1, maxWidth: 280, ml: 'auto' }}>
                {error instanceof Error ? error.message : 'Failed to load user total'}
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
