import { useCallback, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isAxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NewsCreateRequest, NewsItem, NewsUpdateRequest } from '@shared/news-types';
import {
  createNews,
  deleteNews,
  getNewsList,
  publishNews,
  unpublishNews,
  updateNews,
  uploadNewsImage,
  importNewsFromLinkedIn,
} from '../../api/api';
import ConfirmDialog from '../../components/ConfirmDialog';

type FormState = {
  title: string;
  content: string;
  imageUrl: string;
};

const emptyForm: FormState = { title: '', content: '', imageUrl: '' };

function errMsg(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data as { message?: string; debugMessage?: string } | undefined;
    return d?.debugMessage ?? d?.message ?? e.message;
  }
  return e instanceof Error ? e.message : 'Request failed';
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function NewsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [importingLinkedIn, setImportingLinkedIn] = useState(false);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data: res } = await getNewsList({ page: 1, size: 100 });
      return res;
    },
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['admin-news'] });
  }, [queryClient]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setLinkedInUrl('');
    setDialogOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl ?? '',
    });
    setFormError(null);
    setLinkedInUrl('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setLinkedInUrl('');
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!form.content.trim()) {
      setFormError('Content is required');
      return false;
    }
    return true;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: NewsCreateRequest | NewsUpdateRequest = {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
      };
      if (editing) {
        return updateNews(editing.id, body);
      }
      return createNews(body);
    },
    onSuccess: () => {
      closeDialog();
      invalidate();
      setBanner({ type: 'success', text: editing ? 'News updated.' : 'News created as draft.' });
    },
    onError: (e) => setFormError(errMsg(e)),
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => publishNews(id),
    onSuccess: () => {
      invalidate();
      setBanner({ type: 'success', text: 'News published.' });
    },
    onError: (e) => setBanner({ type: 'error', text: errMsg(e) }),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => unpublishNews(id),
    onSuccess: () => {
      invalidate();
      setBanner({ type: 'success', text: 'News unpublished.' });
    },
    onError: (e) => setBanner({ type: 'error', text: errMsg(e) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNews(id),
    onSuccess: () => {
      setDeleteTarget(null);
      invalidate();
      setBanner({ type: 'success', text: 'News deleted.' });
    },
    onError: (e) => setBanner({ type: 'error', text: errMsg(e) }),
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setFormError(null);
    try {
      const { data: body } = await uploadNewsImage(file);
      if (!body.success || typeof body.data !== 'string') {
        throw new Error(body.message ?? 'Upload failed');
      }
      setForm((f) => ({ ...f, imageUrl: body.data! }));
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setUploading(false);
    }
  };

  const handleLinkedInImport = async () => {
    const url = linkedInUrl.trim();
    if (!url) {
      setFormError('Paste a LinkedIn post URL first.');
      return;
    }
    setImportingLinkedIn(true);
    setFormError(null);
    try {
      const { data } = await importNewsFromLinkedIn({ url });
      setForm({
        title: data.title?.trim() ?? '',
        content: data.content?.trim() ?? '',
        imageUrl: data.imageUrl?.trim() ?? '',
      });
      setBanner({ type: 'success', text: 'Imported title, text, and image from LinkedIn.' });
    } catch (e) {
      setFormError(errMsg(e));
    } finally {
      setImportingLinkedIn(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) return;
    saveMutation.mutate();
  };

  const items = data?.items ?? [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Create, edit, publish, and manage news shown on ballistiq.xyz/news.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={isFetching ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New article
          </Button>
        </Stack>
      </Stack>

      {banner && (
        <Alert severity={banner.type} sx={{ mb: 2 }} onClose={() => setBanner(null)}>
          {banner.text}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errMsg(error)}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No news yet. Create your first article.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Published</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /news/{item.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          color={item.status === 'PUBLISHED' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatDate(item.created)}</TableCell>
                      <TableCell>{formatDate(item.publishedAt)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" aria-label="Edit" onClick={() => openEdit(item)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          {item.status === 'PUBLISHED' ? (
                            <IconButton
                              size="small"
                              aria-label="Unpublish"
                              onClick={() => unpublishMutation.mutate(item.id)}
                              disabled={unpublishMutation.isPending}
                            >
                              <UnpublishedIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              aria-label="Publish"
                              onClick={() => publishMutation.mutate(item.id)}
                              disabled={publishMutation.isPending}
                            >
                              <PublishIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            aria-label="Delete"
                            color="error"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editing ? 'Edit news' : 'Create news'}</DialogTitle>
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Import from LinkedIn
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Paste a public LinkedIn post URL to fill title, text, and image automatically.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="LinkedIn post URL"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/posts/…"
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="contained"
                    startIcon={
                      importingLinkedIn ? <CircularProgress size={16} color="inherit" /> : <LinkedInIcon />
                    }
                    onClick={() => void handleLinkedInImport()}
                    disabled={importingLinkedIn}
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {importingLinkedIn ? 'Importing…' : 'Import'}
                  </Button>
                </Stack>
              </Box>

              <TextField
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                fullWidth
                autoFocus
              />

              <TextField
                label="Content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                required
                fullWidth
                multiline
                minRows={8}
                placeholder="Write the full news article text…"
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Image
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImageUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <TextField
                    label="Image URL"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://… or upload above"
                    fullWidth
                    size="small"
                  />
                </Stack>
                {form.imageUrl && (
                  <Box
                    component="img"
                    src={form.imageUrl}
                    alt="Preview"
                    sx={{
                      mt: 2,
                      maxHeight: 200,
                      maxWidth: '100%',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create draft'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete news?"
        message={`Delete "${deleteTarget?.title ?? ''}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
