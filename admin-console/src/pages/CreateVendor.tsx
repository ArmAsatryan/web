import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createVendor } from '../api/api';
import type { VendorCreateRequest } from '../types';
const initialForm: VendorCreateRequest = {
  name: '',
  imageUrl: '',
};

export default function CreateVendor() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<VendorCreateRequest>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createMutation = useMutation({
    mutationFn: (body: VendorCreateRequest) => createVendor(body),
    onSuccess: () => {
      setForm(initialForm);
      setSubmitError(null);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (err: { response?: { data?: { message?: string }; status?: number } }) => {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 400 ? 'Invalid data' : 'Failed to create vendor');
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
    createMutation.mutate({
      name: form.name.trim(),
      imageUrl: form.imageUrl?.trim() || undefined,
    });
  };

  return (
    <Box>
      <Card>
        <CardContent sx={{ py: 3, '&:last-child': { pb: 3 } }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Vendor created successfully.
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
              placeholder="e.g. Sologne"
              fullWidth
            />

            <TextField
              label="Image URL"
              value={form.imageUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
              fullWidth
            />

            <Box sx={{ pt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating…' : 'Add vendor'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
