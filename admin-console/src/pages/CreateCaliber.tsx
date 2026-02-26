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
import { createCaliberDiameter } from '../api/api';
import type { CreateCaliberDiameterRequest } from '../types';
import PageHeader from '../components/PageHeader';

const initialForm: CreateCaliberDiameterRequest = {
  caliber: '',
  diameter: 0,
};

export default function CreateCaliber() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateCaliberDiameterRequest>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createMutation = useMutation({
    mutationFn: (body: CreateCaliberDiameterRequest) => createCaliberDiameter(body),
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
        (err.response?.status === 400 ? 'Invalid data' : 'Failed to create caliber');
      setSubmitError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.caliber.trim()) {
      setSubmitError('Caliber name is required');
      return;
    }
    if (form.diameter <= 0) {
      setSubmitError('Diameter must be greater than 0');
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <Box>
      <PageHeader
        title="Create caliber"
        subtitle="Add a new caliber diameter (e.g. 17 WSM, 0.17)"
      />

      <Card>
        <CardContent sx={{ py: 3, '&:last-child': { pb: 3 } }}>
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Caliber created successfully.
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
              label="Caliber"
              value={form.caliber}
              onChange={(e) => setForm((f) => ({ ...f, caliber: e.target.value }))}
              required
              placeholder="e.g. 17 WSM"
              fullWidth
            />

            <TextField
              label="Diameter (inches)"
              type="number"
              inputProps={{ min: 0.001, step: 0.001 }}
              value={form.diameter || ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  diameter: Number(e.target.value) || 0,
                }))
              }
              required
              placeholder="0.17"
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
                {createMutation.isPending ? 'Creating…' : 'Add caliber'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
