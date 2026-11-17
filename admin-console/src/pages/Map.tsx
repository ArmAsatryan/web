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
import { useEffect, useMemo, useState } from 'react';
import { LayersControl, MapContainer, Marker, Popup, ScaleControl, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { getUserLocations, USER_LOCATIONS_MAX_LIMIT } from '../api/api';
import type { UserLocationPoint } from '../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

/**
 * Google Maps tiles rendered through Leaflet (keeps marker clustering working).
 * lyrs: y = satellite + labels (hybrid), s = satellite only, m = roadmap, p = terrain.
 */
const GOOGLE_SUBDOMAINS = ['mt0', 'mt1', 'mt2', 'mt3'];
const googleTiles = (lyrs: string) => `https://{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}&hl=en`;
const GOOGLE_ATTRIBUTION = 'Map data &copy; Google';

/** High-contrast pin that stays visible on satellite imagery. */
const LocationIcon = L.divIcon({
  className: 'bq-map-pin',
  html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 1C7.3 1 1 7.2 1 14.9 1 25.3 15 41 15 41s14-15.7 14-26.1C29 7.2 22.7 1 15 1z"
      fill="#FF3B30" stroke="#FFFFFF" stroke-width="2.5"/>
    <circle cx="15" cy="15" r="5.5" fill="#FFFFFF"/>
  </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 41],
  popupAnchor: [0, -38],
});
L.Marker.prototype.options.icon = LocationIcon;

/** Bright, bordered cluster bubbles sized by count. */
function createClusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 100 ? 46 : count < 1000 ? 54 : 62;
  const color = count < 10 ? '#00C853' : count < 100 ? '#FFB300' : '#FF3B30';
  const label = count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k` : String(count);
  return L.divIcon({
    className: 'bq-map-cluster',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:3px solid #fff;
      box-shadow:0 0 0 4px ${color}55, 0 2px 8px rgba(0,0,0,.6);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font:700 ${size > 46 ? 15 : 13}px Inter,sans-serif;
      text-shadow:0 1px 2px rgba(0,0,0,.6);">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Zoom the map to show all loaded points whenever the result set changes. */
function FitToPoints({ points }: { points: UserLocationPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, points]);
  return null;
}

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
            Google Maps (satellite view by default — switch layers with the control in the top-right corner). Loads up to {USER_LOCATIONS_MAX_LIMIT.toLocaleString()} points
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
        <Box sx={{ height: 'calc(100vh - 280px)', minHeight: 600, width: '100%' }}>
          <MapContainer
            center={center}
            zoom={6}
            maxZoom={20}
            style={{ height: '100%', width: '100%', borderRadius: 'inherit', background: '#0b1016' }}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Satellite (with labels)">
                <TileLayer
                  url={googleTiles('y')}
                  subdomains={GOOGLE_SUBDOMAINS}
                  maxZoom={20}
                  attribution={GOOGLE_ATTRIBUTION}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite (no labels)">
                <TileLayer
                  url={googleTiles('s')}
                  subdomains={GOOGLE_SUBDOMAINS}
                  maxZoom={20}
                  attribution={GOOGLE_ATTRIBUTION}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Roadmap">
                <TileLayer
                  url={googleTiles('m')}
                  subdomains={GOOGLE_SUBDOMAINS}
                  maxZoom={20}
                  attribution={GOOGLE_ATTRIBUTION}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Terrain">
                <TileLayer
                  url={googleTiles('p')}
                  subdomains={GOOGLE_SUBDOMAINS}
                  maxZoom={20}
                  attribution={GOOGLE_ATTRIBUTION}
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <ScaleControl position="bottomleft" />
            <FitToPoints points={points} />
            <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon} showCoverageOnHover={false}>
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
