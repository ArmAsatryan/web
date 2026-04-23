import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Shared Card / CardContent look for the Dashboard (charts, pies).
 * Use with `<Card sx={dashboardPageCardSx} elevation={0}>` and matching `CardContent`.
 */
export const dashboardPageCardSx: SxProps<Theme> = {
  height: '100%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 2,
  border: 1,
  borderColor: 'divider',
  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
  boxShadow: 'none',
  overflow: 'hidden',
};

export const dashboardPageCardContentSx: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  p: 2.5,
  pt: 2.25,
  pb: 2.25,
  '&:last-child': { pb: 2.25 },
};
