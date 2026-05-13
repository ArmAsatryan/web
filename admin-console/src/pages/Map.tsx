import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import PlaceIcon from '@mui/icons-material/Place';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { getUserLocations, USER_LOCATIONS_MAX_LIMIT } from '../api/api';
import type { UserLocationPoint } from '../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function parseUserFilter(raw: string | null | undefined): { userId: number | undefined; invalid: boolean } {
  const t = raw?.trim() ?? '';
  if (t === '') return { userId: undefined, invalid: false };
  const n = Number(t);
  if (!Number.isInteger(n) || n < 1) return { userId: undefined, invalid: true };
  return { userId: n, invalid: false };
}

export default function MapPage() {
  const [userIdInput, setUserIdInput] = useState('');
  const [appliedRaw, setAppliedRaw] = useState<string | null>(null);

  const filter = useMemo(() => parseUserFilter(appliedRaw), [appliedRaw]);

  const { data: points = [], isLoading, isError, error, refetch } = useQuery<UserLocationPoint[]>({
    queryKey: ['user-locations', filter.userId ?? 'all', USER_LOCATIONS_MAX_LIMIT],
    queryFn: async () => {
      const res = await getUserLocations({
        userId: filter.userId,
        limit: USER_LOCATIONS_MAX_LIMIT,
      });
      return res.data;
    },
    enabled: !filter.invalid,
  });

  const center: [number, number] =
    points.length > 0 ? [points[0].latitude, points[0].longitude] : [40.0, 44.0];

  const applyFilter = () => {
    setAppliedRaw(userIdInput);
  };

  const clearFilter = () => {
    setUserIdInput('');
    setAppliedRaw('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        {points.length > 0 && (
          <Chip
            icon={<PlaceIcon sx={{ fontSize: 16 }} />}
            label={`${points.length.toLocaleString()} location${points.length === 1 ? '' : 's'}`}
            variant="outlined"
            color="primary"
            size="small"
          />
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Free map tiles (OpenStreetMap) via Leaflet. Loads up to {USER_LOCATIONS_MAX_LIMIT.toLocaleString()} points
            from the database (newest first). Leave user id empty and click <strong>Show locations</strong> for
            everyone, or enter a user id to filter.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              label="User ID"
              type="text"
              inputMode="numeric"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value.replace(/\s+/g, ''))}
              placeholder="Optional — all users"
              sx={{ minWidth: 200 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilter();
              }}
            />
            <Button variant="contained" onClick={applyFilter}>
              Show locations
            </Button>
            <Button
              variant="outlined"
              onClick={clearFilter}
              disabled={!userIdInput && (appliedRaw == null || appliedRaw === '')}
            >
              Clear user filter
            </Button>
          </Box>
          {filter.invalid && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Enter a positive integer user id, or clear the field to load all locations.
            </Alert>
          )}
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => void refetch()}>
              {error instanceof Error ? error.message : 'Failed to load locations'}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ position: 'relative', overflow: 'hidden' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.7)',
              zIndex: 1000,
              borderRadius: 'inherit',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                Loading locations…
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ height: 560, width: '100%' }}>
          <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MarkerClusterGroup chunkedLoading>
              {points.map((p, i) => (
                <Marker key={`${p.userId}-${p.latitude}-${p.longitude}-${i}`} position={[p.latitude, p.longitude]}>
                  <Popup>
                    <Box sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                      <strong>User ID:</strong> {p.userId}
                      <br />
                      <strong>Time:</strong> {p.timestamp ? new Date(p.timestamp).toLocaleString() : '—'}
                      <br />
                      <strong>Language:</strong> {p.locale ?? '—'}
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </Box>
      </Card>
    </Box>
  );
}
