import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Link as MuiLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { extractApiError, useApp, useLocales } from './hooks';
import { appStoreStateLabel, formatDate, localeDisplayName } from './utils';
import AppCardIcon from './AppCardIcon';
import CreateVersionDialog from './CreateVersionDialog';

export default function AppDetailsPage() {
  const { appId = '' } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const appQuery = useApp(appId);
  const localesQuery = useLocales();
  const [createOpen, setCreateOpen] = useState(false);

  if (appQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (appQuery.isError || !appQuery.data) {
    return (
      <Alert severity="error">
        {appQuery.isError ? extractApiError(appQuery.error) : 'App not found'}
      </Alert>
    );
  }

  const { app, versions } = appQuery.data;
  const localeCatalog = localesQuery.data;

  return (
    <Stack spacing={3}>
      <Breadcrumbs separator="›">
        <MuiLink component={RouterLink} to="/app-store" underline="hover" color="inherit">
          App Store Connect
        </MuiLink>
        <Typography color="text.primary">{app.name || 'App'}</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent sx={{ py: 3 }}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            <IconButton onClick={() => navigate('/app-store')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <AppCardIcon appId={app.id} name={app.name} size={72} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight={600} noWrap>
                {app.name || 'Unnamed app'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {app.bundleId} · SKU {app.sku ?? '—'} ·{' '}
                {localeDisplayName(app.primaryLocale, localeCatalog)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
            >
              New version
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ pt: 2.5, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Versions
          </Typography>

          {versions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No versions yet. Click "New version" to create your first App Store submission.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Version</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Release type</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {versions.map((v) => {
                    const state = appStoreStateLabel(v.appStoreState);
                    return (
                      <TableRow key={v.id} hover>
                        <TableCell>
                          <Typography fontWeight={500}>{v.versionString}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={state.label} color={state.color} />
                        </TableCell>
                        <TableCell>{v.platform ?? '—'}</TableCell>
                        <TableCell>{v.releaseType ?? '—'}</TableCell>
                        <TableCell>{formatDate(v.createdDate)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Manage content">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/app-store/apps/${appId}/versions/${v.id}/content`)
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Submit for review">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/app-store/apps/${appId}/versions/${v.id}/submit`)
                              }
                            >
                              <SendIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <CreateVersionDialog
        open={createOpen}
        appId={appId}
        onClose={() => setCreateOpen(false)}
        onCreated={(v) => navigate(`/app-store/apps/${appId}/versions/${v.id}/content`)}
      />
    </Stack>
  );
}
