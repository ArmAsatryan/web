import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PlaceIcon from '@mui/icons-material/Place';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { getUserLocations, getLocales } from '../api/api';
import type { UserLocationPoint } from '../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import PageHeader from '../components/PageHeader';
import { languageCodeToLabel } from '../utils/languageDisplay';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [locale, setLocale] = useState('');
  const [userId, setUserId] = useState('');
  const [limit, setLimit] = useState(5000);

  const { data: locales } = useQuery({ queryKey: ['locales'], queryFn: async () => (await getLocales()).data });
  const { data: points, isLoading } = useQuery({
    queryKey: ['user-locations', from || undefined, to || undefined, locale || undefined, userId || undefined, limit],
    queryFn: async () => {
      const res = await getUserLocations({
        from: from || undefined,
        to: to || undefined,
        locale: locale || undefined,
        userId: userId ? Number(userId) : undefined,
        limit,
      });
      return res.data as UserLocationPoint[];
    },
  });

  const center: [number, number] = points?.length
    ? [points[0].latitude, points[0].longitude]
    : [40.0, 44.0];

  return (
    <Box>
      <PageHeader
        title="User Locations Map"
        subtitle="Visualize user locations on an interactive map"
        action={
          points && (
            <Chip
              icon={<PlaceIcon sx={{ fontSize: 16 }} />}
              label={`${points.length.toLocaleString()} points`}
              variant="outlined"
              color="primary"
              size="small"
            />
          )
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              label="From"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 190 }}
            />
            <TextField
              size="small"
              label="To"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 190 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={locale}
                label="Language"
                onChange={(e) => setLocale(e.target.value)}
                displayEmpty
                renderValue={(v) => (v ? languageCodeToLabel(v) : 'All')}
              >
                <MenuItem value="">All</MenuItem>
                {(locales || []).map((l) => (
                  <MenuItem key={l} value={l}>
                    {languageCodeToLabel(l)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="User ID"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Optional"
              sx={{ minWidth: 110 }}
            />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Limit</InputLabel>
              <Select value={limit} label="Limit" onChange={(e) => setLimit(Number(e.target.value))}>
                {[1000, 5000, 10000, 20000].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n.toLocaleString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
                Loading locations...
              </Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ height: 560, width: '100%' }}>
          <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
            <MarkerClusterGroup chunkedLoading>
              {(points || []).map((p, i) => (
                <Marker key={`${p.userId}-${p.latitude}-${p.longitude}-${i}`} position={[p.latitude, p.longitude]}>
                  <Popup>
                    <Box sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                      <strong>User ID:</strong> {p.userId}<br />
                      <strong>Time:</strong> {p.timestamp ? new Date(p.timestamp).toLocaleString() : '—'}<br />
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
