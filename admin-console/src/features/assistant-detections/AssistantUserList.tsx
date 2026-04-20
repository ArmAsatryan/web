import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useDeferredValue, useEffect, useState } from 'react';
import { getDetectionUsersPage } from '../../api/detectionsApi';
import EmptyState from '../../components/EmptyState';

const PAGE_SIZE = 20;

interface Props {
  onSelectUser: (userId: number) => void;
}

export default function AssistantUserList({ onSelectUser }: Props) {
  const [searchRaw, setSearchRaw] = useState('');
  const queryDeferred = useDeferredValue(searchRaw.trim().toLowerCase());
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState({
    items: [] as Awaited<ReturnType<typeof getDetectionUsersPage>>['items'],
    totalItems: 0,
    totalPages: 0,
  });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    getDetectionUsersPage({
      page,
      size: PAGE_SIZE,
      q: queryDeferred,
    })
      .then((data) => {
        if (!cancelled) {
          setPageData(data);
          setListLoading(false);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setListError(e.message || 'Failed to load users');
          setListLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page, queryDeferred]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRaw(e.target.value);
    setPage(1);
  };

  const totalItems = pageData.totalItems;
  const totalPages = Math.max(0, pageData.totalPages);
  const start = totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalItems);

  const showNoSearchResults =
    !listLoading && !listError && totalItems === 0 && queryDeferred.length > 0;

  const showEmptyCatalog =
    !listLoading && !listError && totalItems === 0 && queryDeferred.length === 0;

  if (listLoading && totalItems === 0 && !listError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (listError) {
    return (
      <EmptyState
        title="Could not load users"
        subtitle={`${listError} Check your network and API configuration (VITE_API_BASE_URL).`}
      />
    );
  }

  return (
    <Box className="user-list-page">
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Users with target detections
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a user to view assistant detection data
        </Typography>
      </Box>

      <Box className="user-list-toolbar" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <TextField
          id="assistant-user-search"
          type="search"
          label="Search"
          placeholder="User ID, name, nickname, or email"
          value={searchRaw}
          onChange={handleSearchChange}
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          autoComplete="off"
        />
        {searchRaw && (
          <Button size="small" variant="outlined" onClick={() => { setSearchRaw(''); setPage(1); }}>
            Clear
          </Button>
        )}
      </Box>

      {showEmptyCatalog ? (
        <EmptyState
          title="No users with detections"
          subtitle="Upload detection data from the iOS app to see them here."
        />
      ) : showNoSearchResults ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          No users match your search.
        </Typography>
      ) : (
        <>
          <div className="user-card-grid">
            {pageData.items.map((user) => {
              const latestLabel = user.latestTimestamp
                ? new Date(user.latestTimestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—';
              return (
                <button
                  key={user.userId}
                  type="button"
                  className="user-card"
                  onClick={() => onSelectUser(user.userId)}
                >
                  <div className="user-card-title">
                    {user.displayName ? (
                      <>
                        <span className="user-card-name">{user.displayName}</span>
                        <span className="user-card-id">ID {user.userId}</span>
                      </>
                    ) : (
                      <span className="user-card-name">User {user.userId}</span>
                    )}
                  </div>
                  {(user.nickname || user.email) && (
                    <div className="user-card-identity" aria-label="User contact">
                      {user.nickname && (
                        <span className="user-card-nickname" title="Nickname">
                          {user.nickname}
                        </span>
                      )}
                      {user.nickname && user.email && (
                        <span className="user-card-identity-sep" aria-hidden>
                          ·
                        </span>
                      )}
                      {user.email && (
                        <span className="user-card-email" title={user.email}>
                          {user.email}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="user-card-meta">
                    <span className="user-card-count">
                      {user.detectionCount} detection{user.detectionCount !== 1 ? 's' : ''}
                    </span>
                    <span className="user-card-date">Latest: {latestLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {totalItems > 0 && (
            <div className="user-list-pagination" role="navigation" aria-label="Pagination">
              <button
                type="button"
                className="user-list-page-btn"
                disabled={page <= 1 || listLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="user-list-page-info">
                Page {page} of {Math.max(1, totalPages)}
                {' · '}
                Showing {start}–{end} of {totalItems}
              </span>
              <button
                type="button"
                className="user-list-page-btn"
                disabled={totalPages <= 1 || page >= totalPages || listLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Box>
  );
}
