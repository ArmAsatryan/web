import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  extractApiError,
  useApp,
  useLocales,
  useSubmitForReview,
  useVersion,
  useVersionBuilds,
  useVersionLocalizations,
} from './hooks';
import { appStoreStateLabel, formatDate, localeDisplayName } from './utils';
import type { SubmitForReviewResponse } from './types';

const PRIMARY_LOCALE = 'en-US';

export default function SubmitForReviewPage() {
  const { appId = '', versionId = '' } = useParams<{ appId: string; versionId: string }>();
  const appQuery = useApp(appId);
  const versionQuery = useVersion(versionId);
  const localizationsQuery = useVersionLocalizations(versionId);
  const localesCatalogQuery = useLocales();
  const buildsQuery = useVersionBuilds(versionId);
  const submitMutation = useSubmitForReview(versionId);

  const [result, setResult] = useState<SubmitForReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (versionQuery.isLoading || appQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (versionQuery.isError) {
    return <Alert severity="error">{extractApiError(versionQuery.error)}</Alert>;
  }

  const version = versionQuery.data?.version;
  const state = appStoreStateLabel(version?.appStoreState);
  const localizations = localizationsQuery.data?.localizations ?? [];
  const primary = localizations.find((l) => l.locale === PRIMARY_LOCALE);
  const currentBuild = buildsQuery.data?.currentBuild;
  const localeCatalog = localesCatalogQuery.data;

  const checklist = [
    {
      label: 'Build attached',
      done: Boolean(currentBuild),
      detail: currentBuild
        ? `${currentBuild.version} · ${formatDate(currentBuild.uploadedDate)}`
        : 'No build attached — attach one from Manage Content.',
    },
    {
      label: `Primary locale (${localeDisplayName(PRIMARY_LOCALE, localeCatalog)}) has content`,
      done: Boolean(primary && (primary.description || primary.whatsNew)),
      detail:
        primary && (primary.description || primary.whatsNew)
          ? 'Description / what\u2019s new present'
          : `Fill in the ${localeDisplayName(PRIMARY_LOCALE, localeCatalog)} description and what\u2019s new.`,
    },
    {
      label: `${localizations.length} localization${localizations.length === 1 ? '' : 's'} on this version`,
      done: localizations.length > 0,
      detail:
        localizations.map((l) => localeDisplayName(l.locale, localeCatalog)).join(', ') ||
        'No locales yet.',
    },
  ];

  const allChecksPass = checklist.every((c) => c.done);

  const handleSubmit = () => {
    setError(null);
    setResult(null);
    submitMutation.mutate(undefined, {
      onSuccess: (data) => setResult(data),
      onError: (err) => setError(extractApiError(err)),
    });
  };

  return (
    <Stack spacing={3}>
      <Breadcrumbs separator="›">
        <MuiLink component={RouterLink} to="/app-store" underline="hover" color="inherit">
          App Store Connect
        </MuiLink>
        <MuiLink
          component={RouterLink}
          to={`/app-store/apps/${appId}`}
          underline="hover"
          color="inherit"
        >
          {appQuery.data?.app.name || 'App'}
        </MuiLink>
        <Typography color="text.primary">Submit {version?.versionString}</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Submit version {version?.versionString} for review
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={state.label} color={state.color} />
                <Typography variant="caption" color="text.secondary">
                  Platform {version?.platform ?? '—'}
                </Typography>
              </Stack>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={submitMutation.isPending || !allChecksPass}
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Pre-submission checklist
          </Typography>
          <List disablePadding>
            {checklist.map((item) => (
              <ListItem key={item.label} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        size="small"
                        label={item.done ? 'Ready' : 'Action needed'}
                        color={item.done ? 'success' : 'warning'}
                      />
                      <Typography>{item.label}</Typography>
                    </Stack>
                  }
                  secondary={item.detail}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      {result && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              {result.manualSubmissionRequired ? (
                <Alert severity="info">
                  <Typography fontWeight={600}>Manual submission required</Typography>
                  <Typography variant="body2">
                    {result.message ??
                      'Apple\u2019s API does not support programmatic submission. Complete the submission in App Store Connect.'}
                  </Typography>
                </Alert>
              ) : result.success ? (
                <Alert severity="success">
                  {result.message ?? 'Version submitted for review.'}
                </Alert>
              ) : (
                <Alert severity="error">{result.message ?? 'Submission failed.'}</Alert>
              )}

              {result.details?.reason && (
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body2">{result.details.reason}</Typography>
                </Box>
              )}

              {result.details?.nextSteps && result.details.nextSteps.length > 0 && (
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Next steps
                  </Typography>
                  <List dense sx={{ listStyle: 'decimal', pl: 3 }}>
                    {result.details.nextSteps.map((step, idx) => (
                      <ListItem key={idx} sx={{ display: 'list-item', px: 0 }}>
                        <Typography variant="body2">{step}</Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {result.details?.links && Object.keys(result.details.links).length > 0 && (
                <Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="overline" color="text.secondary">
                    Helpful links
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {Object.entries(result.details.links).map(([label, href]) => (
                      <MuiLink
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {label.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                        <OpenInNewIcon fontSize="inherit" />
                      </MuiLink>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
