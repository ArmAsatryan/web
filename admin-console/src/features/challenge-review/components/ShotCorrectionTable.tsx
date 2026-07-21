import {
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ReviewShot, ScoringZone } from '../types';

export interface ShotCorrectionRow {
  shotNumber: number;
  points: number;
}

interface ShotCorrectionTableProps {
  shots: ReviewShot[];
  scoringZones: ScoringZone[];
  corrections: Record<number, number>;
  onCorrectionChange: (shotNumber: number, points: number) => void;
  detectedTotal: number;
  liveTotal: number;
  readOnly?: boolean;
}

function pointOptions(zones: ScoringZone[]): number[] {
  const points = new Set<number>([0]);
  zones.forEach((z) => points.add(z.points));
  return Array.from(points).sort((a, b) => b - a);
}

export default function ShotCorrectionTable({
  shots,
  scoringZones,
  corrections,
  onCorrectionChange,
  detectedTotal,
  liveTotal,
  readOnly = false,
}: ShotCorrectionTableProps) {
  const options = pointOptions(scoringZones);

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Total: {detectedTotal} → {liveTotal}
        {liveTotal !== detectedTotal ? ` (${liveTotal - detectedTotal >= 0 ? '+' : ''}${liveTotal - detectedTotal})` : ''}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Distance</TableCell>
            <TableCell>Zone</TableCell>
            <TableCell align="right">Detected</TableCell>
            <TableCell align="right">Corrected</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shots.map((shot) => {
            const detected = shot.detectedZoneScore ?? 0;
            const corrected = corrections[shot.shotNumber] ?? detected;
            const changed = corrected !== detected;
            return (
              <TableRow key={shot.shotNumber} sx={changed ? { bgcolor: 'warning.50' } : undefined}>
                <TableCell>{shot.shotNumber}</TableCell>
                <TableCell>{shot.distanceInches?.toFixed(2) ?? '—'}"</TableCell>
                <TableCell>{shot.zoneName ?? '—'}</TableCell>
                <TableCell align="right">{detected}</TableCell>
                <TableCell align="right">
                  {readOnly ? (
                    corrected
                  ) : (
                    <Select
                      size="small"
                      value={corrected}
                      onChange={(e) => onCorrectionChange(shot.shotNumber, Number(e.target.value))}
                      sx={{ minWidth: 72 }}
                    >
                      {options.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}

export function buildCorrections(
  shots: ReviewShot[],
  overrides: Record<number, number>
): { shotNumber: number; points: number }[] {
  return shots
    .filter((shot) => {
      const detected = shot.detectedZoneScore ?? 0;
      const corrected = overrides[shot.shotNumber] ?? detected;
      return corrected !== detected;
    })
    .map((shot) => ({
      shotNumber: shot.shotNumber,
      points: overrides[shot.shotNumber] ?? shot.detectedZoneScore ?? 0,
    }));
}

export function computeLiveTotal(shots: ReviewShot[], overrides: Record<number, number>): number {
  return shots.reduce((sum, shot) => {
    const detected = shot.detectedZoneScore ?? 0;
    return sum + (overrides[shot.shotNumber] ?? detected);
  }, 0);
}
