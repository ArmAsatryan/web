import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createBullet, getAllCalibers, getAllVendors } from '../api/api';
import type { BulletCreateRequest, CaliberItem, VendorItem } from '../types';
/** Form state includes caliberDiameterId for dropdown; payload uses caliber string */
type BulletFormState = BulletCreateRequest & {
  caliberDiameterId: number;
};

const initialForm: BulletFormState = {
  name: '',
  caliber: '',
  caliberDiameterId: 0,
  vendor: '',
  weight: undefined,
  length: undefined,
  speed: undefined,
  diameter: undefined,
  ballistic_coefficient_g1: undefined,
  ballistic_coefficient_g7: undefined,
};

function caliberLabel(c: CaliberItem | null | undefined): string {
  if (c == null) return '—';
  const name = c.caliber?.trim();
  if (name) return name;
  if (c.diameter != null) return `${c.diameter} in`;
  return `Caliber #${c.id ?? '?'}`;
}

export default function CreateBullet() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BulletFormState>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: calibers, isLoading: calibersLoading, isError: calibersError } = useQuery({
    queryKey: ['calibers', 1, 5000, ''],
    queryFn: async () => {
      const res = await getAllCalibers({ page: 1, size: 5000, query: '' });
      const body = res.data as { data?: { content?: CaliberItem[]; items?: CaliberItem[] }; content?: CaliberItem[]; items?: CaliberItem[] } | undefined;
      if (!body) return [];
      const list = body.data?.content ?? body.data?.items ?? body.content ?? (body as { items?: CaliberItem[] }).items;
      return Array.isArray(list) ? list : [];
    },
  });

  const caliberList: CaliberItem[] = Array.isArray(calibers) ? calibers : [];

  const { data: vendorsData, isLoading: vendorsLoading, isError: vendorsError } = useQuery({
    queryKey: ['vendors', 1, 5000],
    queryFn: async () => {
      const res = await getAllVendors({ page: 1, size: 5000 });
      const body = res.data as { data?: { content?: VendorItem[] } } | undefined;
      const list = body?.data?.content;
      return Array.isArray(list) ? list : [];
    },
  });
  const vendorList: VendorItem[] = Array.isArray(vendorsData) ? vendorsData : [];

  const createMutation = useMutation({
    mutationFn: (body: BulletCreateRequest) => createBullet(body),
    onSuccess: () => {
      setForm(initialForm);
      setSubmitError(null);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
      queryClient.invalidateQueries({ queryKey: ['calibers'] });
    },
    onError: (err: { response?: { data?: { message?: string }; status?: number } }) => {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 400 ? 'Invalid data' : 'Failed to create bullet');
      setSubmitError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.name.trim()) {
      setSubmitError('Name is required');
      return;
    }
    const selectedCaliber = caliberList.find((c) => c.id === form.caliberDiameterId);
    if (!selectedCaliber?.caliber) {
      setSubmitError('Caliber is required');
      return;
    }
    const payload: BulletCreateRequest = {
      name: form.name.trim(),
      vendor: form.vendor?.trim() || undefined,
      weight: form.weight,
      length: form.length,
      speed: form.speed,
      diameter: form.diameter,
      ballistic_coefficient_g1: form.ballistic_coefficient_g1,
      ballistic_coefficient_g7: form.ballistic_coefficient_g7,
      caliber: selectedCaliber.caliber,
    };
    createMutation.mutate(payload);
  };

  return (
    <Box>
      <Card>
        <CardContent sx={{ py: 3, '&:last-child': { pb: 3 } }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Bullet created successfully.
            </Alert>
          )}
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxWidth: 560,
            }}
          >
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="e.g. Hornady 150 gr"
              fullWidth
            />

            <FormControl required fullWidth error={!!calibersError}>
              <InputLabel id="caliber-label">Caliber</InputLabel>
              <Select
                labelId="caliber-label"
                label="Caliber"
                value={form.caliberDiameterId === 0 ? '' : (form.caliberDiameterId ?? '')}
                onChange={(e) => {
                  const id = Number(e.target.value) || 0;
                  const c = caliberList.find((x) => x.id === id);
                  setForm((f) => ({
                    ...f,
                    caliberDiameterId: id,
                    caliber: c?.caliber ?? '',
                    diameter: c != null && c.diameter != null ? c.diameter : undefined,
                  }));
                }}
                MenuProps={{
                  disablePortal: false,
                  PaperProps: {
                    sx: { maxHeight: 400, zIndex: 1400 },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Select caliber</em>
                </MenuItem>
                {calibersLoading ? (
                  <MenuItem disabled>Loading…</MenuItem>
                ) : calibersError ? (
                  <MenuItem disabled>Failed to load calibers</MenuItem>
                ) : (
                  caliberList.map((c, i) => (
                    <MenuItem key={c?.id ?? i} value={c?.id ?? ''}>
                      {caliberLabel(c)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth error={!!vendorsError}>
              <InputLabel id="vendor-label">Vendor</InputLabel>
              <Select
                labelId="vendor-label"
                label="Vendor"
                value={form.vendor ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, vendor: String(e.target.value) }))}
                renderValue={(value) => {
                  if (!value) return <em>Select vendor</em>;
                  const v = vendorList.find((x) => x.name === value);
                  if (!v) return value;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {v.imageUrl ? (
                        <Avatar
                          src={v.imageUrl}
                          alt=""
                          sx={{ width: 28, height: 28 }}
                          imgProps={{ loading: 'lazy', onError: () => {} }}
                        />
                      ) : (
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.selected' }}>
                          <StorefrontIcon fontSize="small" />
                        </Avatar>
                      )}
                      <span>{v.name}</span>
                    </Box>
                  );
                }}
                MenuProps={{
                  disablePortal: false,
                  PaperProps: {
                    sx: { maxHeight: 400, zIndex: 1400 },
                  },
                }}
              >
                <MenuItem value="">
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <StorefrontIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Select vendor" />
                </MenuItem>
                {vendorsLoading ? (
                  <MenuItem disabled>Loading…</MenuItem>
                ) : (
                  vendorList.map((v) => (
                    <MenuItem key={v.id} value={v.name}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {v.imageUrl ? (
                          <Avatar
                            src={v.imageUrl}
                            alt=""
                            sx={{ width: 32, height: 32 }}
                            imgProps={{ loading: 'lazy' }}
                          />
                        ) : (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.selected' }}>
                            <StorefrontIcon fontSize="small" />
                          </Avatar>
                        )}
                      </ListItemIcon>
                      <ListItemText primary={v.name} />
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              label="Weight (grains)"
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              value={form.weight ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  weight: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="150"
              fullWidth
            />

            <TextField
              label="Length (inches)"
              type="number"
              inputProps={{ min: 0, step: 0.001 }}
              value={form.length ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  length: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="0.5"
              fullWidth
            />

            <TextField
              label="Speed"
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              value={form.speed ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  speed: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="e.g. 2850"
              fullWidth
            />

            <TextField
              label="Diameter (inches)"
              type="number"
              inputProps={{ min: 0, step: 0.001 }}
              value={form.diameter ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  diameter: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="0.308"
              fullWidth
            />

            <TextField
              label="Ballistic coefficient G1"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.001 }}
              value={form.ballistic_coefficient_g1 ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ballistic_coefficient_g1:
                    e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="0.45"
              fullWidth
            />

            <TextField
              label="Ballistic coefficient G7"
              type="number"
              inputProps={{ min: 0, max: 1, step: 0.001 }}
              value={form.ballistic_coefficient_g7 ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ballistic_coefficient_g7:
                    e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="0.23"
              fullWidth
            />

            <Box sx={{ pt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                disabled={createMutation.isPending || calibersLoading || vendorsLoading}
              >
                {createMutation.isPending ? 'Creating…' : 'Add bullet'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
