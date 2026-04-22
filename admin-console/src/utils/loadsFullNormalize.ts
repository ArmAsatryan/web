import type { LoadsFullData } from '../types';

type Loose = Record<string, unknown>;

function asLoose(v: unknown): Loose {
  return v != null && typeof v === 'object' ? (v as Loose) : {};
}

/**
 * Shapes the loads/full JSON into a consistent {@link LoadsFullData}.
 * The backend may omit `platform`, `la`, or `valid_till` and may send `cpu.percentage` as -0.
 */
export function normalizeLoadsFullData(raw: unknown): LoadsFullData {
  const o = asLoose(raw);
  const mem = asLoose(o.memory);
  const disk = asLoose(o.disk);
  const cpu = asLoose(o.cpu);
  const topRaw = cpu.top;
  const top: { name: string; value: number }[] = Array.isArray(topRaw)
    ? topRaw.map((row) => {
        const r = asLoose(row);
        return { name: String(r.name ?? ''), value: Number(r.value) || 0 };
      })
    : [];

  let pct = Number(cpu.percentage);
  if (!Number.isFinite(pct) || pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  if (Object.is(pct, -0)) pct = 0;

  const platformIn = o.platform != null && typeof o.platform === 'object' ? asLoose(o.platform) : null;
  const laIn = o.la != null && typeof o.la === 'object' ? asLoose(o.la) : null;

  return {
    created_at: String(o.created_at ?? '—'),
    valid_till: o.valid_till != null ? String(o.valid_till) : '',
    memory: {
      total: Number(mem.total) || 0,
      used: Number(mem.used) || 0,
      free: Number(mem.free) || 0,
      cached: Number(mem.cached) || 0,
    },
    disk: {
      total: Number(disk.total) || 0,
      free: Number(disk.free) || 0,
      used: Number(disk.used) || 0,
    },
    cpu: {
      percentage: pct,
      kernel_count: Number(cpu.kernel_count) || 0,
      model: String(cpu.model != null && cpu.model !== '' ? cpu.model : '—'),
      top,
    },
    platform: {
      num_proc: platformIn != null ? Number(platformIn.num_proc) || 0 : 0,
      platforminfo: platformIn != null ? String(platformIn.platforminfo ?? '') : '',
      version: platformIn != null ? String(platformIn.version ?? '') : '',
      uptime: platformIn != null && Number.isFinite(Number(platformIn.uptime)) ? Number(platformIn.uptime) : 0,
    },
    la: {
      load1: laIn != null && Number.isFinite(Number(laIn.load1)) ? Number(laIn.load1) : 0,
      load5: laIn != null && Number.isFinite(Number(laIn.load5)) ? Number(laIn.load5) : 0,
      load15: laIn != null && Number.isFinite(Number(laIn.load15)) ? Number(laIn.load15) : 0,
    },
  };
}

/** Parses axios `response.data` (envelope with `data` field). */
export function parseLoadsFullResponse(body: unknown): {
  payload: LoadsFullData;
  hasPlatform: boolean;
  hasLa: boolean;
} | null {
  const o = asLoose(body);
  if (o.data == null || typeof o.data !== 'object') return null;
  const raw = o.data;
  const r = asLoose(raw);
  return {
    payload: normalizeLoadsFullData(raw),
    hasPlatform: r.platform != null && typeof r.platform === 'object',
    hasLa: r.la != null && typeof r.la === 'object',
  };
}
