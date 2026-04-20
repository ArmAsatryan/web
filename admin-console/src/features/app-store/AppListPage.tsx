import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import { extractApiError, useApps, useCredentialsStatus, useLocales } from './hooks';
import type { AppStoreAppSummary, AppStoreLocaleOption } from './types';
import { localeDisplayName } from './utils';
import AppCardIcon from './AppCardIcon';

export default function AppListPage() {
  const navigate = useNavigate();
  const credentials = useCredentialsStatus();
  const configured = credentials.data?.configured === true;

  useEffect(() => {
    if (credentials.isSuccess && !configured) {
      navigate('/app-store/credentials', { replace: true });
    }
  }, [credentials.isSuccess, configured, navigate]);

  const appsQuery = useApps(configured);
  const localesQuery = useLocales(configured);

  if (credentials.isLoading || (configured && appsQuery.isLoading)) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!configured) {
    return null;
  }

  if (appsQuery.isError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {extractApiError(appsQuery.error)}
      </Alert>
    );
  }

  const apps = appsQuery.data?.apps ?? [];
  if (apps.length === 0) {
    return (
      <EmptyState
        icon={<AppShortcutIcon sx={{ fontSize: 56 }} />}
        title="No apps found"
        subtitle="Your App Store Connect account has no apps, or the API key does not have access."
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
      }}
    >
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          localeCatalog={localesQuery.data}
          onClick={() => navigate(`/app-store/apps/${app.id}`)}
        />
      ))}
    </Box>
  );
}

function AppCard({
  app,
  localeCatalog,
  onClick,
}: {
  app: AppStoreAppSummary;
  localeCatalog?: AppStoreLocaleOption[];
  onClick: () => void;
}) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AppCardIcon appId={app.id} name={app.name} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {app.name || 'Unnamed app'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {app.bundleId || app.id}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <MetaField label="SKU" value={app.sku ?? '—'} />
            <MetaField
              label="Language"
              value={localeDisplayName(app.primaryLocale, localeCatalog)}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.6, display: 'block' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} noWrap>
        {value}
      </Typography>
    </Box>
  );
}

