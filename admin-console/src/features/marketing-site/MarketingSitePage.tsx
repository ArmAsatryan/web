import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TranslateIcon from '@mui/icons-material/Translate';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isAxiosError } from 'axios';
import type { MarketingSitePayload } from '@shared/marketing-site-types';
import {
  getMarketingSite,
  saveMarketingSite,
  translateMarketingFields,
  uploadMarketingSiteImage,
} from '../../api/api';
import { createInitialMarketingPayload } from './initialMarketingPayload';

const SEED = createInitialMarketingPayload();

const HERO_BG_HINT = 'Recommended: 2400×1600px or wider (≈3:2 landscape), high JPEG/WebP quality for full-bleed hero.';
const B2B_CARD_IMG_HINT = 'Recommended: 800×600px (4:3), transparent PNG or product image.';
const TEAM_IMG_HINT = 'Recommended: 600×600px square portrait.';

const FEATURE_ICONS = [
  'Crosshair',
  'Database',
  'Focus',
  'LayoutGrid',
  'Wind',
  'WifiOff',
  'Target',
  'Gauge',
  'Compass',
  'Ruler',
  'Activity',
  'Zap',
];

function errMsg(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data as { message?: string } | undefined;
    return d?.message ?? e.message;
  }
  return e instanceof Error ? e.message : 'Request failed';
}

export default function MarketingSitePage() {
  const [payload, setPayload] = useState<MarketingSitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await getMarketingSite();
      if (data && typeof data === 'object' && Object.keys(data as object).length > 0) {
        setPayload(data as MarketingSitePayload);
      } else {
        setPayload(createInitialMarketingPayload());
      }
    } catch (e) {
      setMessage({ type: 'error', text: errMsg(e) });
      setPayload(createInitialMarketingPayload());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!payload) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveMarketingSite(payload);
      setMessage({ type: 'ok', text: 'Saved. Public site will pick up changes on next load.' });
    } catch (e) {
      setMessage({ type: 'error', text: errMsg(e) });
    } finally {
      setSaving(false);
    }
  };

  const translateHero = async () => {
    if (!payload?.hero?.en) return;
    const { title1, title2, subtitle } = payload.hero.en;
    if (!title1?.trim() || !title2?.trim() || !subtitle?.trim()) {
      setMessage({ type: 'error', text: 'Fill English hero title lines and subtitle first.' });
      return;
    }
    setMessage(null);
    try {
      const { data } = await translateMarketingFields({
        'hero.title1': title1,
        'hero.title2': title2,
        'hero.subtitle': subtitle,
      });
      const locales = data.locales;
      setPayload((prev) => {
        if (!prev) return prev;
        const hero = { ...prev.hero, en: { title1, title2, subtitle } };
        for (const loc of ['fr', 'it', 'es', 'hy'] as const) {
          const map = locales[loc];
          if (!map) continue;
          hero[loc] = {
            title1: map['hero.title1'] ?? '',
            title2: map['hero.title2'] ?? '',
            subtitle: map['hero.subtitle'] ?? '',
          };
        }
        return { ...prev, hero };
      });
      setMessage({ type: 'ok', text: 'Hero copy translated to French, Italian, Spanish, and Armenian.' });
    } catch (e) {
      setMessage({ type: 'error', text: errMsg(e) });
    }
  };

  const uploadField = async (setter: (url: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const res = await uploadMarketingSiteImage(file);
        const body = res.data;
        if (!body.success || typeof body.data !== 'string') {
          setMessage({ type: 'error', text: body.message ?? 'Upload failed' });
          return;
        }
        setter(body.data);
        setMessage({ type: 'ok', text: 'Image uploaded.' });
      } catch (e) {
        setMessage({ type: 'error', text: errMsg(e) });
      }
    };
    input.click();
  };

  if (loading || !payload) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }} alignItems="center">
        <Button startIcon={<SaveIcon />} variant="contained" disabled={saving} onClick={() => void save()}>
          Save to server
        </Button>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={() => void load()}>
          Reload
        </Button>
        <Button
          startIcon={<TranslateIcon />}
          variant="outlined"
          onClick={() => void translateHero()}
        >
          AI translate hero (EN → FR, IT, ES, HY)
        </Button>
        <Button variant="text" onClick={() => setPayload(createInitialMarketingPayload())}>
          Reset form to defaults
        </Button>
      </Stack>

      {message && (
        <Alert severity={message.type === 'ok' ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hero
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {HERO_BG_HINT}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              label="Hero background image URL"
              fullWidth
              value={payload.heroBackgroundImageUrl ?? ''}
              onChange={(e) => setPayload({ ...payload, heroBackgroundImageUrl: e.target.value })}
            />
            <Button startIcon={<CloudUploadIcon />} variant="outlined" onClick={() => void uploadField((url) => {
              setPayload((p) => (p ? { ...p, heroBackgroundImageUrl: url } : p));
            })}>
              Upload
            </Button>
          </Stack>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            English (source for AI translation)
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="Title line 1"
              fullWidth
              value={payload.hero?.en?.title1 ?? ''}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  hero: { ...payload.hero, en: { ...payload.hero?.en, title1: e.target.value } },
                })
              }
            />
            <TextField
              label="Title line 2 (accent)"
              fullWidth
              value={payload.hero?.en?.title2 ?? ''}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  hero: { ...payload.hero, en: { ...payload.hero?.en, title2: e.target.value } },
                })
              }
            />
            <TextField
              label="Subtitle"
              fullWidth
              multiline
              minRows={2}
              value={payload.hero?.en?.subtitle ?? ''}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  hero: { ...payload.hero, en: { ...payload.hero?.en, subtitle: e.target.value } },
                })
              }
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">Feature cards</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setPayload({
                  ...payload,
                  featureCards: [
                    ...(payload.featureCards ?? []),
                    { icon: 'Crosshair', title: { en: '' }, description: { en: '' } },
                  ],
                })
              }
            >
              Add card
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Icon: Lucide React name (e.g. Crosshair). Titles/descriptions support all locales when you add keys under
            fr / it / es / hy in JSON via Save, or extend this UI later.
          </Typography>
          <Stack spacing={2}>
            {(payload.featureCards ?? []).map((card, i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle2">Card {i + 1}</Typography>
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() =>
                        setPayload({
                          ...payload,
                          featureCards: (payload.featureCards ?? []).filter((_, j) => j !== i),
                        })
                      }
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    select
                    label="Icon"
                    fullWidth
                    sx={{ mt: 1 }}
                    value={card.icon}
                    onChange={(e) => {
                      const next = [...(payload.featureCards ?? [])];
                      next[i] = { ...card, icon: e.target.value };
                      setPayload({ ...payload, featureCards: next });
                    }}
                  >
                    {FEATURE_ICONS.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Title (EN)"
                    fullWidth
                    sx={{ mt: 1 }}
                    value={card.title.en ?? ''}
                    onChange={(e) => {
                      const next = [...(payload.featureCards ?? [])];
                      next[i] = { ...card, title: { ...card.title, en: e.target.value } };
                      setPayload({ ...payload, featureCards: next });
                    }}
                  />
                  <TextField
                    label="Description (EN)"
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mt: 1 }}
                    value={card.description.en ?? ''}
                    onChange={(e) => {
                      const next = [...(payload.featureCards ?? [])];
                      next[i] = { ...card, description: { ...card.description, en: e.target.value } };
                      setPayload({ ...payload, featureCards: next });
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pricing (Get Premium)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Edit tier prices and labels (EN). Toggle free/premium columns per feature row. Remove tiers you do not sell
            (for example weekly); the public site falls back to built-in pricing if none are saved.
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Tiers</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                const current = payload.pricing ?? SEED.pricing!;
                setPayload({
                  ...payload,
                  pricing: {
                    ...current,
                    tiers: [
                      ...(current.tiers ?? []),
                      { name: { en: '' }, price: '', perMonthLabel: { en: '' }, highlighted: false },
                    ],
                  },
                });
              }}
            >
              Add tier
            </Button>
          </Stack>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {(payload.pricing?.tiers ?? []).map((tier, i) => (
              <Stack key={i} direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
                <TextField
                  label="Name (EN)"
                  value={tier.name.en ?? ''}
                  onChange={(e) => {
                    const tiers = [...(payload.pricing?.tiers ?? [])];
                    tiers[i] = { ...tier, name: { ...tier.name, en: e.target.value } };
                    setPayload({ ...payload, pricing: { ...payload.pricing!, tiers } });
                  }}
                />
                <TextField
                  label="Price"
                  value={tier.price}
                  onChange={(e) => {
                    const tiers = [...(payload.pricing?.tiers ?? [])];
                    tiers[i] = { ...tier, price: e.target.value };
                    setPayload({ ...payload, pricing: { ...payload.pricing!, tiers } });
                  }}
                />
                <TextField
                  label="Per-month label (EN)"
                  value={tier.perMonthLabel.en ?? ''}
                  onChange={(e) => {
                    const tiers = [...(payload.pricing?.tiers ?? [])];
                    tiers[i] = { ...tier, perMonthLabel: { ...tier.perMonthLabel, en: e.target.value } };
                    setPayload({ ...payload, pricing: { ...payload.pricing!, tiers } });
                  }}
                />
                <TextField
                  select
                  label="Popular"
                  value={tier.highlighted ? 'yes' : 'no'}
                  onChange={(e) => {
                    const tiers = [...(payload.pricing?.tiers ?? [])];
                    tiers[i] = { ...tier, highlighted: e.target.value === 'yes' };
                    setPayload({ ...payload, pricing: { ...payload.pricing!, tiers } });
                  }}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </TextField>
                <IconButton
                  type="button"
                  aria-label="Delete pricing tier"
                  onClick={() => {
                    const current = payload.pricing ?? SEED.pricing!;
                    setPayload({
                      ...payload,
                      pricing: {
                        ...current,
                        tiers: (current.tiers ?? []).filter((_, j) => j !== i),
                      },
                    });
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Feature rows</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setPayload({
                  ...payload,
                  pricing: {
                    tiers: payload.pricing?.tiers ?? [],
                    featureRows: [
                      ...(payload.pricing?.featureRows ?? []),
                      { free: false, premium: true, label: { en: '' } },
                    ],
                  },
                })
              }
            >
              Add row
            </Button>
          </Stack>
          {(payload.pricing?.featureRows ?? []).map((row, i) => (
            <Stack key={i} direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1 }} alignItems="center">
              <TextField
                label="Label (EN)"
                fullWidth
                value={row.label.en ?? ''}
                onChange={(e) => {
                  const rows = [...(payload.pricing?.featureRows ?? [])];
                  rows[i] = { ...row, label: { ...row.label, en: e.target.value } };
                  setPayload({ ...payload, pricing: { ...payload.pricing!, featureRows: rows } });
                }}
              />
              <TextField
                select
                label="Free tier"
                value={row.free ? 'yes' : 'no'}
                onChange={(e) => {
                  const rows = [...(payload.pricing?.featureRows ?? [])];
                  rows[i] = { ...row, free: e.target.value === 'yes' };
                  setPayload({ ...payload, pricing: { ...payload.pricing!, featureRows: rows } });
                }}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </TextField>
              <TextField
                select
                label="Premium tier"
                value={row.premium ? 'yes' : 'no'}
                onChange={(e) => {
                  const rows = [...(payload.pricing?.featureRows ?? [])];
                  rows[i] = { ...row, premium: e.target.value === 'yes' };
                  setPayload({ ...payload, pricing: { ...payload.pricing!, featureRows: rows } });
                }}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </TextField>
              <IconButton
                onClick={() =>
                  setPayload({
                    ...payload,
                    pricing: {
                      tiers: payload.pricing?.tiers ?? [],
                      featureRows: (payload.pricing?.featureRows ?? []).filter((_, j) => j !== i),
                    },
                  })
                }
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            B2B section
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {B2B_CARD_IMG_HINT}
          </Typography>
          <TextField
            label="Section background image URL"
            fullWidth
            sx={{ mt: 1, mb: 2 }}
            value={payload.b2bSectionBackgroundImageUrl ?? ''}
            onChange={(e) => setPayload({ ...payload, b2bSectionBackgroundImageUrl: e.target.value })}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Cards</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setPayload({
                  ...payload,
                  b2bCards: [
                    ...(payload.b2bCards ?? []),
                    { imageUrl: '', title: { en: '' }, description: { en: '' } },
                  ],
                })
              }
            >
              Add B2B card
            </Button>
          </Stack>
          {(payload.b2bCards ?? []).map((c, i) => (
            <Card key={i} variant="outlined" sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">Card {i + 1}</Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setPayload({
                        ...payload,
                        b2bCards: (payload.b2bCards ?? []).filter((_, j) => j !== i),
                      })
                    }
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    label="Image URL"
                    fullWidth
                    value={c.imageUrl}
                    onChange={(e) => {
                      const cards = [...(payload.b2bCards ?? [])];
                      cards[i] = { ...c, imageUrl: e.target.value };
                      setPayload({ ...payload, b2bCards: cards });
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() =>
                      void uploadField((url) => {
                        const cards = [...(payload.b2bCards ?? [])];
                        cards[i] = { ...c, imageUrl: url };
                        setPayload({ ...payload, b2bCards: cards });
                      })
                    }
                  >
                    Upload
                  </Button>
                </Stack>
                <TextField
                  label="Title (EN)"
                  fullWidth
                  sx={{ mt: 1 }}
                  value={c.title.en ?? ''}
                  onChange={(e) => {
                    const cards = [...(payload.b2bCards ?? [])];
                    cards[i] = { ...c, title: { ...c.title, en: e.target.value } };
                    setPayload({ ...payload, b2bCards: cards });
                  }}
                />
                <TextField
                  label="Description (EN)"
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mt: 1 }}
                  value={c.description.en ?? ''}
                  onChange={(e) => {
                    const cards = [...(payload.b2bCards ?? [])];
                    cards[i] = { ...c, description: { ...c.description, en: e.target.value } };
                    setPayload({ ...payload, b2bCards: cards });
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Reviews
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              label="Average score"
              type="number"
              inputProps={{ step: 0.1 }}
              value={payload.reviews?.average ?? 0}
              onChange={(e) => {
                const base = payload.reviews ?? SEED.reviews!;
                setPayload({
                  ...payload,
                  reviews: { ...base, average: Number(e.target.value) },
                });
              }}
            />
            <TextField
              label="Total ratings count"
              type="number"
              value={payload.reviews?.total ?? 0}
              onChange={(e) => {
                const base = payload.reviews ?? SEED.reviews!;
                setPayload({
                  ...payload,
                  reviews: { ...base, total: Number(e.target.value) },
                });
              }}
            />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Review cards</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setPayload({
                  ...payload,
                  reviews: {
                    ...(payload.reviews ?? SEED.reviews!),
                    items: [
                      ...(payload.reviews?.items ?? []),
                      { name: '', date: '', rating: 5, title: { en: '' }, text: { en: '' } },
                    ],
                  },
                })
              }
            >
              Add review
            </Button>
          </Stack>
          {(payload.reviews?.items ?? []).map((r, i) => (
            <Card key={i} variant="outlined" sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2">Review {i + 1}</Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setPayload({
                        ...payload,
                        reviews: {
                          ...(payload.reviews ?? SEED.reviews!),
                          items: (payload.reviews?.items ?? []).filter((_, j) => j !== i),
                        },
                      })
                    }
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    label="Name"
                    value={r.name}
                    onChange={(e) => {
                      const items = [...(payload.reviews?.items ?? [])];
                      items[i] = { ...r, name: e.target.value };
                      setPayload({
                      ...payload,
                      reviews: { ...(payload.reviews ?? SEED.reviews!), items },
                    });
                    }}
                  />
                  <TextField
                    label="Date"
                    value={r.date}
                    onChange={(e) => {
                      const items = [...(payload.reviews?.items ?? [])];
                      items[i] = { ...r, date: e.target.value };
                      setPayload({
                      ...payload,
                      reviews: { ...(payload.reviews ?? SEED.reviews!), items },
                    });
                    }}
                  />
                  <TextField
                    label="Rating (1–5)"
                    type="number"
                    value={r.rating}
                    onChange={(e) => {
                      const items = [...(payload.reviews?.items ?? [])];
                      items[i] = { ...r, rating: Number(e.target.value) };
                      setPayload({
                      ...payload,
                      reviews: { ...(payload.reviews ?? SEED.reviews!), items },
                    });
                    }}
                  />
                </Stack>
                <TextField
                  label="Title (EN)"
                  fullWidth
                  sx={{ mt: 1 }}
                  value={r.title.en ?? ''}
                  onChange={(e) => {
                    const items = [...(payload.reviews?.items ?? [])];
                    items[i] = { ...r, title: { ...r.title, en: e.target.value } };
                    setPayload({
                      ...payload,
                      reviews: { ...(payload.reviews ?? SEED.reviews!), items },
                    });
                  }}
                />
                <TextField
                  label="Text (EN)"
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mt: 1 }}
                  value={r.text.en ?? ''}
                  onChange={(e) => {
                    const items = [...(payload.reviews?.items ?? [])];
                    items[i] = { ...r, text: { ...r.text, en: e.target.value } };
                    setPayload({
                      ...payload,
                      reviews: { ...(payload.reviews ?? SEED.reviews!), items },
                    });
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Team
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {TEAM_IMG_HINT} Upload sets HTTPS URL on the ballistiq S3 bucket.
          </Typography>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setPayload({
                  ...payload,
                  teamMembers: [...(payload.teamMembers ?? []), { name: '', role: { en: '' }, imageUrl: '' }],
                })
              }
            >
              Add member
            </Button>
          </Stack>
          {(payload.teamMembers ?? []).map((m, i) => (
            <Stack key={i} direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1 }} alignItems="center">
              <TextField
                label="Name"
                value={m.name}
                onChange={(e) => {
                  const tm = [...(payload.teamMembers ?? [])];
                  tm[i] = { ...m, name: e.target.value };
                  setPayload({ ...payload, teamMembers: tm });
                }}
              />
              <TextField
                label="Role (EN)"
                value={m.role.en ?? ''}
                onChange={(e) => {
                  const tm = [...(payload.teamMembers ?? [])];
                  tm[i] = { ...m, role: { ...m.role, en: e.target.value } };
                  setPayload({ ...payload, teamMembers: tm });
                }}
              />
              <TextField label="Image URL" sx={{ flex: 1 }} value={m.imageUrl} onChange={(e) => {
                const tm = [...(payload.teamMembers ?? [])];
                tm[i] = { ...m, imageUrl: e.target.value };
                setPayload({ ...payload, teamMembers: tm });
              }} />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() =>
                  void uploadField((url) => {
                    const tm = [...(payload.teamMembers ?? [])];
                    tm[i] = { ...m, imageUrl: url };
                    setPayload({ ...payload, teamMembers: tm });
                  })
                }
              >
                Upload
              </Button>
              <IconButton
                onClick={() =>
                  setPayload({
                    ...payload,
                    teamMembers: (payload.teamMembers ?? []).filter((_, j) => j !== i),
                  })
                }
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
