import {
  Alert,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  LinearProgress,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  extractApiError,
  useApp,
  useAttachBuild,
  useCopyVersionContent,
  useLocales,
  useTranslateLocale,
  useUpdateLocalization,
  useVersion,
  useVersionBuilds,
  useVersionLocalizations,
} from './hooks';
import { appStoreStateLabel, formatDate, localeDisplayName } from './utils';
import type { AppStoreLocalizationSummary, UpdateLocalizationRequest } from './types';

const PRIMARY_LOCALE = 'en-US';

export default function ManageContentPage() {
  const { appId = '', versionId = '' } = useParams<{ appId: string; versionId: string }>();
  const appQuery = useApp(appId);
  const versionQuery = useVersion(versionId);
  const localizationsQuery = useVersionLocalizations(versionId);
  const localesQuery = useLocales();
  const updateMutation = useUpdateLocalization(versionId);
  const copyMutation = useCopyVersionContent(versionId);
  const translateMutation = useTranslateLocale(versionId);
  const buildsQuery = useVersionBuilds(versionId);
  const attachMutation = useAttachBuild(versionId);

  const [tab, setTab] = useState(0);
  /** Unsaved field overrides keyed by locale (persists when switching tabs). */
  const [draftByLocale, setDraftByLocale] = useState<
    Record<string, Partial<AppStoreLocalizationSummary>>
  >({});
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copyOpen, setCopyOpen] = useState(false);
  const [sourceVersionId, setSourceVersionId] = useState('');
  const [copyPromotionalText, setCopyPromotionalText] = useState(true);
  const [copyWhatsNew, setCopyWhatsNew] = useState(true);

  const [translateOpen, setTranslateOpen] = useState(false);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [translateDescription, setTranslateDescription] = useState(false);
  const [translateKeywords, setTranslateKeywords] = useState(false);
  const [translatePromotionalText, setTranslatePromotionalText] = useState(true);
  const [translateWhatsNew, setTranslateWhatsNew] = useState(true);
  const [translationProgress, setTranslationProgress] = useState<
    { locale: string; status: 'pending' | 'running' | 'done' | 'error'; error?: string }[]
  >([]);

  const [attachOpen, setAttachOpen] = useState(false);
  const [selectedBuildId, setSelectedBuildId] = useState('');

  const localizations = localizationsQuery.data?.localizations ?? [];
  const sortedLocalizations = useMemo(() => {
    return [...localizations].sort((a, b) => {
      if (a.locale === PRIMARY_LOCALE) return -1;
      if (b.locale === PRIMARY_LOCALE) return 1;
      return a.locale.localeCompare(b.locale);
    });
  }, [localizations]);

  useEffect(() => {
    setTab((t) => Math.min(t, Math.max(0, sortedLocalizations.length - 1)));
  }, [sortedLocalizations.length]);

  const currentLoc = sortedLocalizations[tab];

  const currentMerged: AppStoreLocalizationSummary | null = useMemo(() => {
    if (!currentLoc) return null;
    return { ...currentLoc, ...draftByLocale[currentLoc.locale] };
  }, [currentLoc, draftByLocale]);

  const patchCurrentDraft = (patch: Partial<AppStoreLocalizationSummary>) => {
    if (!currentLoc) return;
    setDraftByLocale((prev) => ({
      ...prev,
      [currentLoc.locale]: { ...prev[currentLoc.locale], ...patch },
    }));
  };

  const otherVersions = useMemo(() => {
    return (appQuery.data?.versions ?? []).filter((v) => v.id !== versionId);
  }, [appQuery.data?.versions, versionId]);

  const state = appStoreStateLabel(versionQuery.data?.version.appStoreState);
  const localeCatalog = localesQuery.data;

  const translateTargetLocales = useMemo(
    () => (localesQuery.data ?? []).filter((l) => !l.locale.toLowerCase().startsWith('en')),
    [localesQuery.data],
  );

  useEffect(() => {
    if (copyOpen) {
      setCopyPromotionalText(true);
      setCopyWhatsNew(true);
    }
  }, [copyOpen]);

  useEffect(() => {
    if (translateOpen) {
      setTranslationProgress([]);
      setTranslateDescription(false);
      setTranslateKeywords(false);
      setTranslatePromotionalText(true);
      setTranslateWhatsNew(true);
    }
  }, [translateOpen]);

  const buildUpdateBody = (
    loc: AppStoreLocalizationSummary,
    draft: Partial<AppStoreLocalizationSummary>,
  ): UpdateLocalizationRequest => {
    const merged = { ...loc, ...draft };
    return {
      locale: merged.locale,
      description: merged.description,
      keywords: merged.keywords,
      promotionalText: merged.promotionalText,
      whatsNew: merged.whatsNew,
      supportUrl: merged.supportUrl,
      marketingUrl: merged.marketingUrl,
    };
  };

  const handleSaveCurrent = async () => {
    if (!currentLoc) return;
    setError(null);
    setSavedMessage(null);
    setSaving(true);
    const locale = currentLoc.locale;
    const draft = draftByLocale[locale] ?? {};
    try {
      await updateMutation.mutateAsync(buildUpdateBody(currentLoc, draft));
      setDraftByLocale((prev) => {
        if (!(locale in prev)) return prev;
        const next = { ...prev };
        delete next[locale];
        return next;
      });
      setSavedMessage(
        `Saved ${localeDisplayName(locale, localeCatalog)} (${locale}).`,
      );
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!sourceVersionId) return;
    if (!copyPromotionalText && !copyWhatsNew) {
      setError('Select at least one field to copy.');
      return;
    }
    setError(null);
    setSavedMessage(null);
    copyMutation.mutate(
      {
        sourceVersionId,
        copyPromotionalText,
        copyWhatsNew,
      },
      {
        onSuccess: (data) => {
          const n = data.results?.length ?? 0;
          const errs = data.errors?.length ?? 0;
          setSavedMessage(`Copied content for ${n} locales${errs ? ` (${errs} failed)` : ''}.`);
          setDraftByLocale({});
          setCopyOpen(false);
          setSourceVersionId('');
        },
        onError: (err) => setError(extractApiError(err)),
      }
    );
  };

  const handleTranslate = async () => {
    const primaryLoc = sortedLocalizations.find((l) => l.locale === PRIMARY_LOCALE);
    const primary =
      primaryLoc == null
        ? undefined
        : ({ ...primaryLoc, ...draftByLocale[PRIMARY_LOCALE] } as AppStoreLocalizationSummary);
    if (!primary) {
      setError('Set the en-US content first — it is the source for translations.');
      return;
    }
    if (
      !translateDescription &&
      !translateKeywords &&
      !translatePromotionalText &&
      !translateWhatsNew
    ) {
      setError('Select at least one field to translate.');
      return;
    }
    if (translateDescription && !(primary.description ?? '').trim()) {
      setError('en-US description is empty; add text or uncheck Description.');
      return;
    }
    if (translateKeywords && !(primary.keywords ?? '').trim()) {
      setError('en-US keywords are empty; add text or uncheck Keywords.');
      return;
    }
    if (translatePromotionalText && !(primary.promotionalText ?? '').trim()) {
      setError('en-US promotional text is empty; add text or uncheck Promotional text.');
      return;
    }
    if (translateWhatsNew && !(primary.whatsNew ?? '').trim()) {
      setError('en-US what\u2019s new is empty; add text or uncheck What\u2019s new.');
      return;
    }
    if (selectedLocales.length === 0) return;
    setTranslationProgress(
      selectedLocales.map((locale) => ({ locale, status: 'pending' as const }))
    );

    for (const locale of selectedLocales) {
      setTranslationProgress((prev) =>
        prev.map((p) => (p.locale === locale ? { ...p, status: 'running' } : p))
      );
      try {
        await translateMutation.mutateAsync({
          locale,
          description: primary.description,
          keywords: primary.keywords,
          promotionalText: primary.promotionalText,
          whatsNew: primary.whatsNew,
          translateDescription,
          translateKeywords,
          translatePromotionalText,
          translateWhatsNew,
        });
        setTranslationProgress((prev) =>
          prev.map((p) => (p.locale === locale ? { ...p, status: 'done' } : p))
        );
      } catch (err) {
        setTranslationProgress((prev) =>
          prev.map((p) =>
            p.locale === locale ? { ...p, status: 'error', error: extractApiError(err) } : p
          )
        );
      }
    }
  };

  const handleAttachBuild = () => {
    if (!selectedBuildId) return;
    setError(null);
    setSavedMessage(null);
    attachMutation.mutate(
      { buildId: selectedBuildId },
      {
        onSuccess: () => {
          setSavedMessage('Build attached to this version.');
          setAttachOpen(false);
          setSelectedBuildId('');
        },
        onError: (err) => setError(extractApiError(err)),
      }
    );
  };

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
        <Typography color="text.primary">
          {versionQuery.data?.version.versionString}
        </Typography>
      </Breadcrumbs>

      <Card>
        <CardContent sx={{ py: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={600}>
                Version {versionQuery.data?.version.versionString}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip size="small" label={state.label} color={state.color} />
                <Typography variant="caption" color="text.secondary">
                  Created {formatDate(versionQuery.data?.version.createdDate)}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => setCopyOpen(true)}
                disabled={otherVersions.length === 0}
              >
                Copy from version
              </Button>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setTranslateOpen(true)}
              >
                Translate with Gemini
              </Button>
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                onClick={() => setAttachOpen(true)}
              >
                Attach build
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {savedMessage && (
        <Alert severity="success" onClose={() => setSavedMessage(null)}>
          {savedMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ py: 2 }}>
          {localizationsQuery.isLoading ? (
            <CircularProgress />
          ) : sortedLocalizations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No localizations on this version yet. Create a localization in App Store Connect, then
            refresh this page.
            </Typography>
          ) : (
            <Tabs
              value={Math.min(tab, sortedLocalizations.length - 1)}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {sortedLocalizations.map((loc) => (
                <Tab
                  key={loc.id}
                  label={localeDisplayName(loc.locale, localeCatalog)}
                  iconPosition="end"
                  icon={
                    loc.locale === PRIMARY_LOCALE ? (
                      <Chip size="small" color="primary" label="Primary" sx={{ ml: 1 }} />
                    ) : undefined
                  }
                />
              ))}
            </Tabs>
          )}

          {currentLoc && currentMerged && (
            <Box sx={{ pt: 3 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Editing {localeDisplayName(currentLoc.locale, localeCatalog)}. Changes are kept when
                  you switch tabs; Save writes only this language to App Store Connect.
                </Typography>
                <TextField
                  label="Description"
                  value={currentMerged.description ?? ''}
                  onChange={(e) => patchCurrentDraft({ description: e.target.value })}
                  fullWidth
                  multiline
                  minRows={4}
                  maxRows={10}
                />
                <TextField
                  label="What's new"
                  value={currentMerged.whatsNew ?? ''}
                  onChange={(e) => patchCurrentDraft({ whatsNew: e.target.value })}
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={8}
                />
                <TextField
                  label="Promotional text"
                  value={currentMerged.promotionalText ?? ''}
                  onChange={(e) => patchCurrentDraft({ promotionalText: e.target.value })}
                  helperText={`${(currentMerged.promotionalText ?? '').length}/170`}
                  inputProps={{ maxLength: 170 }}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                />
                <TextField
                  label="Keywords (comma-separated)"
                  value={currentMerged.keywords ?? ''}
                  onChange={(e) => patchCurrentDraft({ keywords: e.target.value })}
                  inputProps={{ maxLength: 100 }}
                  helperText={`${(currentMerged.keywords ?? '').length}/100`}
                  fullWidth
                />
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => void handleSaveCurrent()}
                    disabled={saving || updateMutation.isPending}
                  >
                    {saving || updateMutation.isPending ? 'Saving…' : 'Save'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Copy dialog */}
      <Dialog open={copyOpen} onClose={() => setCopyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Copy content from another version</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Source version</InputLabel>
            <Select
              label="Source version"
              value={sourceVersionId}
              onChange={(e) => setSourceVersionId(e.target.value)}
            >
              {otherVersions.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.versionString} · {v.appStoreState}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Copies the selected fields from the source version into every matching locale on this
            version. Existing locales are updated in place; unchecked fields are left unchanged.
          </Typography>
          <FormGroup sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={copyWhatsNew}
                  onChange={(_, c) => setCopyWhatsNew(c)}
                />
              }
              label="What's new in this version"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={copyPromotionalText}
                  onChange={(_, c) => setCopyPromotionalText(c)}
                />
              }
              label="Promotional text"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCopy}
            disabled={
              !sourceVersionId ||
              copyMutation.isPending ||
              (!copyPromotionalText && !copyWhatsNew)
            }
          >
            {copyMutation.isPending ? 'Copying…' : 'Copy content'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Translate dialog */}
      <Dialog
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Translate en-US with Gemini</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Uses the current en-US strings as the source for each checked field and writes
            translations to each target locale. Unchecked fields are not changed.
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Fields to translate
          </Typography>
          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={translateDescription}
                  onChange={(_, c) => setTranslateDescription(c)}
                />
              }
              label="Description"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={translateWhatsNew}
                  onChange={(_, c) => setTranslateWhatsNew(c)}
                />
              }
              label="What's new in this version"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={translatePromotionalText}
                  onChange={(_, c) => setTranslatePromotionalText(c)}
                />
              }
              label="Promotional text"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={translateKeywords}
                  onChange={(_, c) => setTranslateKeywords(c)}
                />
              }
              label="Keywords"
            />
          </FormGroup>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2">Target languages</Typography>
            <Stack direction="row" spacing={0.5} flexShrink={0}>
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  setSelectedLocales(translateTargetLocales.map((o) => o.locale))
                }
                disabled={
                  translateTargetLocales.length === 0 ||
                  translateTargetLocales.every((o) => selectedLocales.includes(o.locale))
                }
              >
                Select all
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedLocales([])}
                disabled={selectedLocales.length === 0}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={translateTargetLocales}
            getOptionLabel={(o) => o.language}
            filterOptions={(options, state) => {
              const q = state.inputValue.trim().toLowerCase();
              if (!q) return options;
              return options.filter(
                (o) =>
                  o.language.toLowerCase().includes(q) || o.locale.toLowerCase().includes(q),
              );
            }}
            value={(localesQuery.data ?? []).filter((l) => selectedLocales.includes(l.locale))}
            isOptionEqualToValue={(a, b) => a.locale === b.locale}
            onChange={(_, value) => setSelectedLocales(value.map((v) => v.locale))}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <FormControlLabel
                  control={<Checkbox checked={selected} />}
                  label={option.language}
                  sx={{ m: 0 }}
                />
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="" placeholder="Search or pick languages" />
            )}
          />

          {translationProgress.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {translationProgress.map((p) => (
                  <Box key={p.locale}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 120 }}>
                        {localeDisplayName(p.locale, localeCatalog)}
                      </Typography>
                      {p.status === 'pending' && (
                        <Chip size="small" label="Pending" variant="outlined" />
                      )}
                      {p.status === 'running' && (
                        <Chip size="small" label="Translating…" color="info" />
                      )}
                      {p.status === 'done' && (
                        <Chip size="small" label="Done" color="success" />
                      )}
                      {p.status === 'error' && (
                        <Chip size="small" label={p.error ?? 'Failed'} color="error" />
                      )}
                    </Stack>
                    {p.status === 'running' && <LinearProgress sx={{ mt: 0.5 }} />}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTranslateOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleTranslate}
            disabled={
              selectedLocales.length === 0 ||
              translationProgress.some((p) => p.status === 'running') ||
              (!translateDescription &&
                !translateKeywords &&
                !translatePromotionalText &&
                !translateWhatsNew)
            }
          >
            Translate {selectedLocales.length > 0 ? `(${selectedLocales.length})` : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attach build dialog */}
      <Dialog open={attachOpen} onClose={() => setAttachOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Attach build to version</DialogTitle>
        <DialogContent>
          {buildsQuery.isLoading ? (
            <CircularProgress />
          ) : buildsQuery.data?.currentBuild ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Currently attached: build {buildsQuery.data.currentBuild.version} · uploaded{' '}
              {formatDate(buildsQuery.data.currentBuild.uploadedDate)}
            </Alert>
          ) : null}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Available builds</InputLabel>
            <Select
              label="Available builds"
              value={selectedBuildId}
              onChange={(e) => setSelectedBuildId(e.target.value)}
            >
              {(buildsQuery.data?.availableBuilds ?? []).map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.version} · {formatDate(b.uploadedDate)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAttachBuild}
            disabled={!selectedBuildId || attachMutation.isPending}
          >
            {attachMutation.isPending ? 'Attaching…' : 'Attach build'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
